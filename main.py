import os
import pickle
import pandas as pd
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

# Constants
MODEL_PATH = "RidgeModel.pkl"
DATA_PATH = "cleaned_data_house.csv"

# Global variables for loaded assets
model = None
locations = []

def load_assets():
    global model, locations
    
    # 1. Load the pre-trained Scikit-Learn pipeline
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file '{MODEL_PATH}' not found. Please train it first.")
    
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully.")

    # 2. Load and extract locations from cleaned dataset
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Cleaned dataset '{DATA_PATH}' not found.")
    
    df = pd.read_csv(DATA_PATH)
    # Drop index columns if they exist
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])
    
    # Extract unique, non-null location values and sort them
    if 'location' in df.columns:
        unique_locs = df['location'].dropna().unique()
        locations = sorted([str(loc).strip() for loc in unique_locs if str(loc).strip()])
    else:
        locations = []
    print(f"Loaded {len(locations)} locations from dataset.")

# Load assets when starting the app
load_assets()

@app.route('/')
def home():
    """Serve the index.html page."""
    return render_template('index.html')

@app.route('/api/locations', methods=['GET'])
def get_locations():
    """Return the sorted list of unique locations."""
    return jsonify(locations)

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Accepts JSON body:
    {
        "location": "1st Phase JP Nagar",
        "total_sqft": 1500,
        "bath": 2,
        "bhk": 3
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400

        # Extract features and validate
        location = data.get("location")
        total_sqft = data.get("total_sqft")
        bath = data.get("bath")
        bhk = data.get("bhk")

        if not location or not isinstance(location, str) or not location.strip():
            return jsonify({"error": "Invalid or missing 'location'"}), 400

        try:
            total_sqft = float(total_sqft)
            if total_sqft <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            return jsonify({"error": "'total_sqft' must be a positive number"}), 400

        try:
            bath = float(bath)
            if bath <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            return jsonify({"error": "'bath' must be a positive number"}), 400

        try:
            bhk = int(bhk)
            if bhk <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            return jsonify({"error": "'bhk' must be a positive integer"}), 400

        # Construct dataframe matching model's expected input structure
        input_df = pd.DataFrame({
            'location': [location.strip()],
            'total_sqft': [total_sqft],
            'bath': [bath],
            'bhk': [bhk]
        })

        # Predict using pipeline
        prediction = model.predict(input_df)
        predicted_price = float(prediction[0])

        # Enforce a reasonable floor (price cannot be negative or zero)
        if predicted_price < 0.1:
            predicted_price = 0.1

        # Return prediction in Lakhs (rounded to 2 decimal places)
        return jsonify({
            "price_lakhs": round(predicted_price, 2),
            "price_formatted": f"₹{round(predicted_price, 2)} Lakhs"
        })

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    # Run server locally
    app.run(debug=True, host='127.0.0.1', port=5000)
