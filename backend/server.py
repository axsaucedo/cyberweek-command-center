"""
Lightstep proxy backend for the Cyberweek Command Center.
Fetches OPM (orders per minute) data from Lightstep and serves it to the frontend.

Usage:
    LIGHTSTEP_KEY=<key> python backend/server.py
    # or
    LIGHTSTEP_KEY=<key> uvicorn backend.server:app --port 8001
"""

import os
import threading
import time
from datetime import UTC, datetime, timedelta

import requests
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Cached OPM data (updated in background thread)
DATA: dict[str, int] = {}
LAST_UPDATE = datetime.now(UTC) - timedelta(days=1)
LAST_REQUEST = datetime.now(UTC)

COUNTRY_MAPPING = {
    71: "RO", 70: "PT", 69: "HR",
    68: "Lounge_SI", 67: "Lounge_SK", 66: "Lounge_LT",
    65: "Lounge_LV", 64: "Lounge_EE", 63: "Lounge_NO",
    62: "Lounge_FI", 61: "Lounge_DK", 60: "Lounge_SE",
    59: "RO", 58: "HU", 57: "HR", 56: "EE", 55: "LV",
    54: "LT", 53: "SI", 52: "SK", 51: "Lounge_CZ",
    48: "IE", 47: "CZ", 46: "Lounge_ES", 45: "Lounge_PL",
    44: "Lounge_IT", 43: "Lounge_GB", 40: "Lounge_CH",
    39: "Lounge_AT", 36: "Lounge_BE", 35: "Lounge_NL",
    32: "NO", 31: "TR", 30: "ES", 29: "DK", 28: "FI",
    27: "SE", 25: "BE", 24: "PL", 20: "CH", 19: "AT",
    18: "Lounge_FR", 17: "Lounge_DE", 16: "GB", 15: "IT",
    11: "FR", 5: "NL", 1: "DE",
}


def fetch_opm_from_lightstep() -> dict[str, int]:
    """Fetch OPM-by-country from Lightstep API."""
    ls_key = os.environ.get("LIGHTSTEP_KEY", "")
    if not ls_key:
        raise ValueError("LIGHTSTEP_KEY environment variable not set")

    headers = {
        "accept": "application/json",
        "authorization": ls_key,
        "content-type": "application/json",
    }

    oldest_time = (datetime.now(UTC) - timedelta(minutes=5)).isoformat(timespec="seconds")
    youngest_time = datetime.now(UTC).isoformat(timespec="seconds")

    payload = {
        "data": {
            "attributes": {
                "input-language": "uql",
                "oldest-time": oldest_time,
                "youngest-time": youngest_time,
                "output-period": 60,
                "query": 'metric zmon_check_2565 | reduce 1m, sum | group_by ["key"], sum',
            }
        }
    }

    response = requests.post(
        "https://api.lightstep.com/public/v0.2/Zalando/projects/Production/telemetry/query_timeseries",
        headers=headers,
        json=payload,
        timeout=30,
    )

    if response.status_code != 200:
        raise Exception(f"Lightstep API error: {response.status_code} {response.text[:200]}")

    series = response.json()["data"]["attributes"]["series"]
    result: dict[str, int] = {}

    for entry in series:
        label = ",".join(entry["group-labels"])
        try:
            key_val = int(label.split("=")[1])
            country = COUNTRY_MAPPING.get(key_val, "OTHER")
        except (ValueError, IndexError):
            country = "OTHER"

        points = entry.get("points", [])
        if len(points) >= 2:
            # Take max of last 2 points to avoid partial minute data
            opm = max(int(points[-1][1]), int(points[-2][1]))
        elif len(points) == 1:
            opm = int(points[0][1])
        else:
            opm = 0

        # Aggregate duplicate country codes (e.g., multiple RO entries)
        result[country] = result.get(country, 0) + opm

    return result


def update_data_loop():
    """Background thread that periodically fetches fresh OPM data."""
    global DATA, LAST_UPDATE
    while True:
        # Skip update if no client has requested in the last 60 seconds
        if (datetime.now(UTC) - LAST_REQUEST).total_seconds() > 60:
            time.sleep(5)
            continue
        try:
            opm_data = fetch_opm_from_lightstep()
            DATA = opm_data
            LAST_UPDATE = datetime.now(UTC)
        except Exception as e:
            print(f"[lightstep-proxy] Error fetching data: {e}")
        time.sleep(15)


# Start background polling thread
thread = threading.Thread(target=update_data_loop, daemon=True)
thread.start()

app = FastAPI(title="Cyberweek Command Center - Lightstep Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/rpm")
def get_rpm():
    """Return current OPM-by-country data."""
    global LAST_REQUEST
    LAST_REQUEST = datetime.now(UTC)
    return JSONResponse(content=DATA)


@app.get("/api/health")
def health():
    """Health check endpoint."""
    age = (datetime.now(UTC) - LAST_UPDATE).total_seconds()
    return JSONResponse(content={
        "status": "ok" if age < 60 else "stale",
        "last_update_age_seconds": round(age, 1),
        "countries": len(DATA),
    })


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
