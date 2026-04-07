from routingpy import Graphhopper
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

gh = Graphhopper(api_key='***REMOVED***')

@app.route("/timetravel", methods=["POST"])
def get_route():
    data = request.json

    end = data["destination"] # [lon, lat]

    locations = [[-1.6973159, 48.1250328], end]

    route = gh.directions(locations=locations, profile='car')

    travel_time = route.duration + 120

    distance = route.distance

    if travel_time > 60 :
        seconds = travel_time
        minutes, remaining_seconds = divmod(seconds, 60)
        if minutes < 60 :
            duration = f"{minutes} minutes and {remaining_seconds} seconds"
        else :
            hours, remaining_minutes = divmod(minutes,60)
            duration = f"{hours} hours, {remaining_minutes} minutes and {remaining_seconds} seconds"

    return jsonify({
            "duration": duration,
            "distance": distance
        })

if __name__ == "__main__":
    app.run(debug=True)