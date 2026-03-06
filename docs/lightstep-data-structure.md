# Lightstep API Data Structure

## Overview
The Cyberweek Command Center fetches order throughput data from the Lightstep (ServiceNow Cloud Observability) telemetry API. The data represents **orders per minute (OPM) aggregated by country** — it does NOT contain individual order details.

## API Endpoint
```
POST https://api.lightstep.com/public/v0.2/Zalando/projects/Production/telemetry/query_timeseries
```

## Authentication
- Header: `authorization: <LIGHTSTEP_KEY>`
- The key is stored in the `LIGHTSTEP_KEY` environment variable

## Request Format
```json
{
  "data": {
    "attributes": {
      "input-language": "uql",
      "oldest-time": "2024-11-29T10:00:00+00:00",
      "youngest-time": "2024-11-29T10:05:00+00:00",
      "output-period": 60,
      "query": "metric zmon_check_2565 | reduce 1m, sum | group_by [\"key\"], sum"
    }
  }
}
```

- **oldest-time / youngest-time**: ISO 8601 timestamps, typically a 5-minute window
- **output-period**: 60 seconds (1-minute granularity)
- **query**: UQL query fetching ZMON check 2565 (order count metric), reduced to 1-minute sums, grouped by country key

## Response Structure
```json
{
  "data": {
    "type": "...",
    "id": "...",
    "diagnostics": { ... },
    "attributes": {
      "series": [
        {
          "group-labels": ["key=1"],
          "points": [
            [1772779883000, 150],
            [1772779943000, 148]
          ]
        }
      ]
    }
  }
}
```

### Series Entry
Each entry in `series` represents one country/store:
| Field | Type | Description |
|-------|------|-------------|
| `group-labels` | `string[]` | Array with one element: `"key=<number>"` where number maps to a country |
| `points` | `[number, number][]` | Array of `[timestamp_ms, opm_value]` pairs |

### Data Points
- `points[i][0]`: Unix timestamp in **milliseconds**
- `points[i][1]`: Orders per minute (OPM) count for that 1-minute window
- Typically 5 data points returned (one per minute in the 5-minute window)
- The **last point may contain partial data** (current incomplete minute)

## Country Key Mapping
The numeric keys map to country codes (from `order-fountain/__main__.py`):

| Key | Country | Key | Country | Key | Country |
|-----|---------|-----|---------|-----|---------|
| 1 | DE | 24 | PL | 51 | Lounge_CZ |
| 5 | NL | 25 | BE | 52 | SK |
| 11 | FR | 27 | SE | 53 | SI |
| 15 | IT | 28 | FI | 54 | LT |
| 16 | GB | 29 | DK | 55 | LV |
| 17 | Lounge_DE | 30 | ES | 56 | EE |
| 18 | Lounge_FR | 31 | TR | 57 | HR |
| 19 | AT | 32 | NO | 58 | HU |
| 20 | CH | 35 | Lounge_NL | 59 | RO |

*Additional keys: 36=Lounge_BE, 39=Lounge_AT, 40=Lounge_CH, 43=Lounge_GB, 44=Lounge_IT, 45=Lounge_PL, 46=Lounge_ES, 60=Lounge_SE, 61=Lounge_DK, 62=Lounge_FI, 63=Lounge_NO, 64=Lounge_EE, 65=Lounge_LV, 66=Lounge_LT, 67=Lounge_SK, 68=Lounge_SI, 69=HR, 70=PT, 71=RO*

Some keys (21, 26, 37, 41, 75) are not in the mapping and map to "UNKNOWN".

## Sample Data (Live Fetch)
Total of **49 series** (country/store combinations). Example OPM values:
- **DE (key=1)**: ~150 OPM (highest volume)
- **Lounge_PL (key=45)**: ~52 OPM
- **PL (key=24)**: ~34 OPM
- **FR (key=11)**: ~27 OPM
- **IT (key=15)**: ~24 OPM
- Smaller markets: 1-10 OPM each

**Total across all countries**: ~600-800+ OPM depending on time of day.

## What Is NOT Available
The Lightstep data does **not** include:
- ❌ Individual order details
- ❌ Product category (shoes, shirts, etc.)
- ❌ Order amount / price
- ❌ Customer name
- ❌ Product name
- ❌ Order ID

Only **aggregate order counts per minute per country** are available.

## Implications for the Dashboard
Since only OPM-by-country is available, the Lightstep source must:
1. Convert OPM counts into synthetic individual `Order` objects
2. Use random enrichment for missing fields (amount, category, customer name, product name)
3. Distribute order generation across the polling interval for smooth animation
4. The **country** field is the only real metadata — can be used for geographic distribution display

## Polling Strategy
- Poll every **15 seconds** (matching order-fountain pattern)
- Use last 5 minutes of data
- Take the **max of last 2 data points** to avoid unreliable partial-minute data
- Data latency: ~1-2 minutes behind real-time
