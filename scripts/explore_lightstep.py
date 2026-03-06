#!/usr/bin/env python3
"""
Explore the Lightstep API response structure for the Cyberweek Command Center.
Fetches OPM (orders per minute) data and documents the response format.

Usage:
    LIGHTSTEP_KEY=<key> python scripts/explore_lightstep.py
"""

import json
import os
import sys
from datetime import UTC, datetime, timedelta

import requests


def fetch_lightstep_data():
    ls_key = os.environ.get("LIGHTSTEP_KEY")
    if not ls_key:
        print("ERROR: LIGHTSTEP_KEY environment variable not set")
        sys.exit(1)

    headers = {
        "accept": "application/json",
        "authorization": ls_key,
        "content-type": "application/json",
    }

    oldest_time = (datetime.now(UTC) - timedelta(minutes=5)).isoformat(timespec="seconds")
    youngest_time = datetime.now(UTC).isoformat(timespec="seconds")

    data = {
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

    print(f"Fetching data from Lightstep API...")
    print(f"  Time range: {oldest_time} to {youngest_time}")

    response = requests.post(
        "https://api.lightstep.com/public/v0.2/Zalando/projects/Production/telemetry/query_timeseries",
        headers=headers,
        json=data,
    )

    print(f"  Status: {response.status_code}")

    if response.status_code != 200:
        print(f"  Error: {response.text}")
        # Save error response too
        with open("./tmp/lightstep-error.json", "w") as f:
            json.dump({"status": response.status_code, "body": response.text}, f, indent=2)
        sys.exit(1)

    return response.json()


# Country key mapping from order-fountain
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


def analyze_response(data):
    """Analyze and print the data structure."""
    print("\n=== RESPONSE STRUCTURE ANALYSIS ===\n")

    # Top-level keys
    print(f"Top-level keys: {list(data.keys())}")

    if "data" in data:
        print(f"data keys: {list(data['data'].keys())}")

        if "attributes" in data["data"]:
            attrs = data["data"]["attributes"]
            print(f"data.attributes keys: {list(attrs.keys())}")

            if "series" in attrs:
                series = attrs["series"]
                print(f"\nNumber of series (countries/keys): {len(series)}")

                if len(series) > 0:
                    first = series[0]
                    print(f"\nFirst series entry keys: {list(first.keys())}")
                    print(f"  group-labels: {first.get('group-labels', 'N/A')}")

                    points = first.get("points", [])
                    print(f"  Number of data points: {len(points)}")
                    if len(points) > 0:
                        print(f"  First point format: {points[0]}")
                        print(f"  Point[0] = timestamp (epoch seconds): {points[0][0]}")
                        print(f"  Point[1] = value (OPM count): {points[0][1]}")

                    # Show all series labels
                    print(f"\n--- All Series Labels ---")
                    for s in series:
                        labels = s.get("group-labels", [])
                        pts = s.get("points", [])
                        label_str = ",".join(labels)
                        # Try to parse country
                        try:
                            key_val = int(label_str.split("=")[1]) if "=" in label_str else None
                            country = COUNTRY_MAPPING.get(key_val, "UNKNOWN") if key_val else "N/A"
                        except (ValueError, IndexError):
                            country = "PARSE_ERROR"

                        latest_val = pts[-1][1] if pts else "no data"
                        print(f"  {label_str:20s} -> Country: {country:15s} | Latest OPM: {latest_val}")

                    # Check for any additional fields beyond group-labels and points
                    all_keys = set()
                    for s in series:
                        all_keys.update(s.keys())
                    print(f"\n--- All fields in series entries ---")
                    print(f"  {all_keys}")

            # Check for other attributes
            non_series_attrs = {k: v for k, v in attrs.items() if k != "series"}
            if non_series_attrs:
                print(f"\n--- Other attributes (non-series) ---")
                for k, v in non_series_attrs.items():
                    val_preview = str(v)[:200] if not isinstance(v, (int, float, bool)) else v
                    print(f"  {k}: {val_preview}")

    print("\n=== END ANALYSIS ===")


def main():
    data = fetch_lightstep_data()

    # Save full response
    with open("./tmp/lightstep-response.json", "w") as f:
        json.dump(data, f, indent=2)
    print("Full response saved to ./tmp/lightstep-response.json")

    analyze_response(data)


if __name__ == "__main__":
    main()
