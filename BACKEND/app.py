from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from utils.enhancement_plan import generate_plan
from utils.components_analysis import analyze_components
from utils.generate_weather_graph import create_weather_graph
import requests
import pandas as pd
import os
import io
import matplotlib
matplotlib.use("Agg")  # headless rendering
import matplotlib.pyplot as plt
from datetime import datetime, timezone
from collections import defaultdict, Counter
from config import (
    OPENWEATHER_API_KEY,
    OPENWEATHER_CURRENT,
    OPENWEATHER_FORECAST,
    OPENWEATHER_ONECALL,
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ---------- Datasets & bootstrap ----------
DATA_DIR = os.path.join(os.path.dirname(__file__), "datasets")
os.makedirs(DATA_DIR, exist_ok=True)

ALERTS_CSV = os.path.join(DATA_DIR, "alerts.csv")
RECS_CSV = os.path.join(DATA_DIR, "recommendations.csv")
CHAT_CSV = os.path.join(DATA_DIR, "expert_chat.csv")
HISTORICAL_CSV = os.path.join(DATA_DIR, "historical_weather.csv")  # you already had this

def ensure_csv(path: str, headers: list[str], sample_rows: list[list] | None = None):
    if not os.path.exists(path):
        df = pd.DataFrame(sample_rows or [], columns=headers)
        df.to_csv(path, index=False)

ensure_csv(
    ALERTS_CSV,
    ["id", "message", "severity", "acknowledged"],
    [
        [1, "High waves in Bay of Bengal", "High", 0],
        [2, "Storm warning near London", "Medium", 0],
        [3, "Fog advisory – North Sea", "Low", 0],
    ],
)
ensure_csv(
    RECS_CSV,
    ["condition", "rule", "advice", "severity"],
    [
        ["wind>20", "Wind speed over 20 knots", "Delay departure or adjust course.", "High"],
        ["wave>3", "Wave height over 3m", "Reduce speed and maintain safe distance from shore.", "High"],
        ["visibility<2", "Visibility below 2km", "Use radar/ais and slow down.", "Medium"],
    ],
)
ensure_csv(
    CHAT_CSV,
    ["timestamp", "user_message", "assistant_response"],
    [],
)

# ---------- Health ----------
@app.route("/")
def home():
    return {"message": "🌊 Maritime Weather Backend Running!"}

# ---------- Weather: city ----------
@app.route("/api/weather/city", methods=["GET"])
def weather_city():
    city = request.args.get("city", "London")
    params = {"q": city, "appid": OPENWEATHER_API_KEY, "units": "metric"}
    r = requests.get(OPENWEATHER_CURRENT, params=params, timeout=20)
    return jsonify(r.json()), r.status_code

# ---------- Weather: coords (OneCall) ----------
@app.route("/api/weather/coords", methods=["GET"])
def weather_coords():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if not lat or not lon:
        return jsonify({"error": "Latitude and Longitude required"}), 400
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
        "exclude": "minutely",
    }
    r = requests.get(OPENWEATHER_ONECALL, params=params, timeout=20)
    return jsonify(r.json()), r.status_code

# ---------- Forecast (original) ----------
@app.route("/api/forecast", methods=["GET"])
def forecast():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    city = request.args.get("city")
    params = {"appid": OPENWEATHER_API_KEY, "units": "metric"}
    if city:
        params["q"] = city
        r = requests.get(OPENWEATHER_FORECAST, params=params, timeout=20)
    elif lat and lon:
        params["lat"] = lat
        params["lon"] = lon
        r = requests.get(OPENWEATHER_FORECAST, params=params, timeout=20)
    else:
        return jsonify({"error": "Provide city or lat/lon"}), 400
    return jsonify(r.json()), r.status_code

# ---------- Marine (OneCall passthrough) ----------
@app.route("/api/marine", methods=["GET"])
def marine():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if not lat or not lon:
        return jsonify({"error": "Latitude and Longitude required"}), 400
    params = {"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": "metric", "exclude": "minutely"}
    r = requests.get(OPENWEATHER_ONECALL, params=params, timeout=20)
    return jsonify(r.json()), r.status_code

# ---------- Historical dataset (simple) ----------
@app.route("/api/history", methods=["GET"])
def historical_weather():
    if not os.path.exists(HISTORICAL_CSV):
        return jsonify([])  # no file yet
    city = request.args.get("city")
    df = pd.read_csv(HISTORICAL_CSV)
    if city and "city" in df.columns:
        df = df[df["city"].str.lower() == city.lower()]
    return jsonify(df.to_dict(orient="records"))

# ---------- Export map (PNG) ----------
@app.route("/api/map/export", methods=["GET"])
def export_map():
    """
    Optional query params:
    - title: custom title
    - lat, lon: annotate a point
    """
    title = request.args.get("title", "Exported Map")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.set_title(title)
    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.grid(True, alpha=0.3)

    # Render a simple "world box"
    ax.set_xlim(-180, 180)
    ax.set_ylim(-90, 90)

    if lat and lon:
        try:
            ax.scatter(float(lon), float(lat), s=80)
            ax.text(float(lon) + 2, float(lat) + 2, f"({lat}, {lon})")
        except ValueError:
            pass

    img = io.BytesIO()
    plt.tight_layout()
    plt.savefig(img, format="png", dpi=160)
    img.seek(0)
    return send_file(img, mimetype="image/png", as_attachment=True, download_name="map.png")

# ---------- Recommendations ----------
@app.route("/api/recommendations", methods=["GET"])
def recommendations():
    """
    Uses simple rule-based logic + CSV rules. Optionally accepts:
    - wind (knots), wave (m), visibility (km)
    """
    wind = float(request.args.get("wind", 12))       # demo defaults
    wave = float(request.args.get("wave", 1.2))
    visibility = float(request.args.get("visibility", 10))

    # Load rules
    df = pd.read_csv(RECS_CSV)
    advice = []
    severity = "Low"

    if wind > 20:
        advice.append(df[df["condition"] == "wind>20"].iloc[0].to_dict())
        severity = "High"
    if wave > 3:
        advice.append(df[df["condition"] == "wave>3"].iloc[0].to_dict())
        severity = "High"
    if visibility < 2:
        advice.append(df[df["condition"] == "visibility<2"].iloc[0].to_dict())
        severity = "Medium" if severity != "High" else "High"

    status = "safe" if len(advice) == 0 else "caution"
    return jsonify({"status": status, "severity": severity, "advice": advice})

# ✅ NEW: Recommendation Actions
@app.route("/api/recommendations/action", methods=["POST"])
def rec_action():
    data = request.json or {}
    action = data.get("action")
    return jsonify({"status": "success", "action_taken": action})

# ---------- Alerts ----------
@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    df = pd.read_csv(ALERTS_CSV)
    return jsonify(df.to_dict(orient="records"))

@app.route("/api/alerts/acknowledge", methods=["POST"])
def acknowledge_alerts():
    ids = request.json.get("ids", [])
    df = pd.read_csv(ALERTS_CSV)
    df.loc[df["id"].isin(ids), "acknowledged"] = 1
    df.to_csv(ALERTS_CSV, index=False)
    return jsonify({"status": "acknowledged", "ids": ids})

# ✅ NEW: Alert Details
@app.route("/api/alerts/details/<int:alert_id>", methods=["GET"])
def alert_details(alert_id):
    df = pd.read_csv(ALERTS_CSV)
    row = df[df["id"] == alert_id]
    if row.empty:
        return jsonify({"error": "Alert not found"}), 404
    return jsonify(row.iloc[0].to_dict())

# ✅ NEW: Alert Preferences
@app.route("/api/alerts/preferences", methods=["POST"])
def alert_preferences():
    prefs = request.json or {}
    return jsonify({"status": "updated", "preferences": prefs})

# ---------- Expert Chat (simple rule-based) ----------
@app.route("/api/expert", methods=["POST"])
def expert():
    data = request.get_json(force=True, silent=True) or {}
    user_msg = (data.get("message") or "").strip()
    if not user_msg:
        return jsonify({"response": "Please provide a message."}), 400

    # Very simple deterministic “expert”
    user_lower = user_msg.lower()
    if "route" in user_lower or "course" in user_lower:
        resp = "Consider a coastal route with shelter options. Check wind forecasts every 6 hours."
    elif "storm" in user_lower or "cyclone" in user_lower:
        resp = "Delay departure and secure vessel. Monitor alerts and keep safe harbor options ready."
    elif "fuel" in user_lower:
        resp = "Maintain 30% reserve fuel for contingencies; plan refuel points along the route."
    else:
        resp = "Maintain safe speed, monitor wind/wave forecasts, and keep AIS/radar active in low visibility."

    # Log to CSV
    now = datetime.utcnow().isoformat()
    row = pd.DataFrame([[now, user_msg, resp]], columns=["timestamp", "user_message", "assistant_response"])
    if os.path.exists(CHAT_CSV):
        row.to_csv(CHAT_CSV, mode="a", header=False, index=False)
    else:
        row.to_csv(CHAT_CSV, index=False)

    return jsonify({"response": resp})

# ---------- Enhancement Plan ----------
@app.route("/api/enhancement", methods=["POST"])
def enhancement():
    """
    Expects JSON like:
    { "wind": 15, "wave": 2.5, "visibility": 8 }
    """
    data = request.json or {}
    result = generate_plan(data)
    return jsonify(result)

# ---------- Component Analysis ----------
@app.route("/api/analysis", methods=["POST"])
def analysis():
    """
    Expects JSON dataset (e.g., forecast or marine data).
    """
    data = request.json or {}
    result = analyze_components(data)
    return jsonify(result)

# ---------- Weather Graph ----------
@app.route("/api/graph", methods=["POST"])
def graph():
    """
    Expects JSON like:
    { "city": "London", "temps": [20,21,19,18], "times": ["10:00","13:00","16:00","19:00"] }
    """
    data = request.json or {}
    img = create_weather_graph(data)

    return send_file(
        img,
        mimetype="image/png",
        as_attachment=True,
        download_name="weather_graph.png",
    )

# ================================
# 🚀 NEW: 10-Day Forecast Endpoint
# ================================
def resolve_coords_for_city(city: str):
    """Resolve city -> (lat, lon, name/country) using current weather endpoint."""
    params = {"q": city, "appid": OPENWEATHER_API_KEY, "units": "metric"}
    r = requests.get(OPENWEATHER_CURRENT, params=params, timeout=20)
    r.raise_for_status()
    j = r.json()
    lat = j["coord"]["lat"]
    lon = j["coord"]["lon"]
    name = j.get("name", city)
    country = j.get("sys", {}).get("country", "")
    return lat, lon, name, country

def aggregate_3h_to_daily(list3h):
    """
    Turn 3-hourly forecast (5-day) into per-day aggregates.
    Returns list of dicts keyed like our frontend expects.
    """
    buckets = defaultdict(list)
    for it in list3h:
        dt = datetime.fromtimestamp(it["dt"], tz=timezone.utc)
        day_key = dt.date().isoformat()
        buckets[day_key].append(it)

    daily = []
    for day_key, entries in sorted(buckets.items()):
        temps = [e["main"]["temp"] for e in entries if "main" in e]
        hums = [e["main"]["humidity"] for e in entries if "main" in e]
        press = [e["main"]["pressure"] for e in entries if "main" in e]
        winds = [e["wind"]["speed"] for e in entries if "wind" in e]
        wind_deg = [e["wind"].get("deg", 0) for e in entries if "wind" in e]
        clouds = [e["clouds"]["all"] for e in entries if "clouds" in e]
        vis = [e.get("visibility", 10000) for e in entries]

        # most frequent condition/icon
        conds = [e["weather"][0]["main"] for e in entries if e.get("weather")]
        descs = [e["weather"][0]["description"] for e in entries if e.get("weather")]
        icons = [e["weather"][0]["icon"] for e in entries if e.get("weather")]
        cond = Counter(conds).most_common(1)[0][0] if conds else "Clear"
        desc = Counter(descs).most_common(1)[0][0] if descs else "clear sky"
        icon = Counter(icons).most_common(1)[0][0] if icons else "01d"

        wind_ms = sum(winds) / len(winds) if winds else 4.0
        wind_knots = round(wind_ms * 1.94384)
        waves = round((wind_ms * 0.3 + 0.8), 1)

        daily.append({
            "day": "",  # filled on client
            "date": day_key,
            "wind": wind_knots,
            "waves": waves,
            "temp": round(sum(temps)/len(temps)) if temps else 22,
            "condition": cond,
            "description": desc,
            "humidity": round(sum(hums)/len(hums)) if hums else 60,
            "pressure": round(sum(press)/len(press)) if press else 1013,
            "visibility": f"{(sum(vis)/len(vis))/1000:.1f}" if vis else "10.0",
            "clouds": round(sum(clouds)/len(clouds)) if clouds else 20,
            "icon": icon,
            "windDirection": round(sum(wind_deg)/len(wind_deg)) if wind_deg else 0,
            "source": "3h-aggregate"
        })
    return daily

@app.route("/api/forecast10", methods=["GET"])
def forecast10():
    """
    Returns exactly 10 days. Priority:
      1) OneCall 'daily' (typically up to 7-8 days)
      2) Extend with aggregated 3h forecast (5 days)
      3) If still <10, extrapolate last day trend
    Query: ?city=London  OR  ?lat=..&lon=..
    """
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    try:
        if city and not (lat and lon):
            lat, lon, resolved_name, country = resolve_coords_for_city(city)
        else:
            resolved_name = city or "Selected location"
            country = ""

        # 1) OneCall daily
        oc_params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric",
            "exclude": "minutely,hourly,alerts"
        }
        oc_r = requests.get(OPENWEATHER_ONECALL, params=oc_params, timeout=20)
        oc_r.raise_for_status()
        oc = oc_r.json()
        days = []
        for d in oc.get("daily", []):
            # daily visibility not provided -> estimate to 10km baseline
            wind_knots = round(d.get("wind_speed", 4.0) * 1.94384)
            waves = round((d.get("wind_speed", 4.0) * 0.3 + 0.8), 1)
            w = d.get("weather", [{"main": "Clear", "description":"clear sky", "icon":"01d"}])[0]
            days.append({
                "day": "",
                "date": datetime.fromtimestamp(d["dt"]).date().isoformat(),
                "wind": wind_knots,
                "waves": waves,
                "temp": round(d.get("temp", {}).get("day", 22)),
                "condition": w.get("main", "Clear"),
                "description": w.get("description", "clear sky"),
                "humidity": d.get("humidity", 60),
                "pressure": d.get("pressure", 1013),
                "visibility": "10.0",
                "clouds": d.get("clouds", 20),
                "icon": w.get("icon", "01d"),
                "windDirection": d.get("wind_deg", 0),
                "source": "onecall-daily"
            })

        # 2) If we have fewer than 10, use 3h/5d forecast aggregates to extend
        if len(days) < 10:
            fc_params = {"appid": OPENWEATHER_API_KEY, "units": "metric"}
            if city:
                fc_params["q"] = city
            else:
                fc_params["lat"] = lat
                fc_params["lon"] = lon
            fc_r = requests.get(OPENWEATHER_FORECAST, params=fc_params, timeout=20)
            if fc_r.ok:
                fc = fc_r.json()
                agg = aggregate_3h_to_daily(fc.get("list", []))
                # Only append missing calendar days after last OneCall day
                existing_dates = {d["date"] for d in days}
                for a in agg:
                    if a["date"] not in existing_dates:
                        days.append(a)
                        existing_dates.add(a["date"])
                    if len(days) >= 10:
                        break

        # 3) If still <10, extrapolate last known trend
        while len(days) < 10 and len(days) > 0:
            prev = days[-1]
            synthetic_dt = datetime.fromisoformat(prev["date"]) + pd.Timedelta(days=1)
            new_day = {
                **prev,
                "date": synthetic_dt.date().isoformat(),
                "temp": max(-10, min(45, prev["temp"] + 0)),        # keep temp stable
                "wind": max(0, prev["wind"] + (1 if len(days) % 2 == 0 else -1)),
                "waves": max(0.5, round(prev["waves"] + (0.1 if len(days) % 2 == 0 else -0.1), 1)),
                "source": "extrapolated"
            }
            days.append(new_day)

        # Final: ensure exactly 10 and add friendly labels
        days = days[:10]
        for i, d in enumerate(days):
            if i == 0:
                d["day"] = "Today"
            elif i == 1:
                d["day"] = "Tomorrow"
            else:
                d["day"] = f"Day {i+1}"

        return jsonify({
            "location": {
                "name": resolved_name,
                "country": country,
                "lat": float(lat),
                "lon": float(lon)
            },
            "days": days
        })
    except requests.HTTPError as e:
        return jsonify({"error": "Upstream API error", "detail": str(e)}), 502
    except Exception as e:
        return jsonify({"error": "Server error", "detail": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
