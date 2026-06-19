# 🏠 Bengaluru House Price Prediction

A Machine Learning powered web application that predicts house prices in Bengaluru based on property features such as location, area, number of bedrooms (BHK), and bathrooms.

Built using **Python, Flask, Scikit-Learn, Pandas, HTML, CSS, and JavaScript**.

---

## 🚀 Features

- Predict Bengaluru house prices using a trained Machine Learning model
- Searchable location dropdown with hundreds of locations
- Modern and responsive user interface
- Real-time predictions without page refresh
- Flask REST API backend
- Scikit-Learn Pipeline integration
- Input validation on both frontend and backend

---

## 📸 Project Preview

### Home Screen
- Select property location
- Enter total area (sq.ft.)
- Choose BHK and Bathrooms
- Click **Calculate Estimate**

### Prediction Result
- Estimated house price in Lakhs
- Property summary
- Smooth animated result display

---

## 🛠️ Tech Stack

### Backend
- Python
- Flask
- Pandas
- NumPy
- Scikit-Learn

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)

### Machine Learning
- Ridge Regression
- OneHotEncoder
- ColumnTransformer
- Scikit-Learn Pipeline

---

## 📂 Project Structure

```bash
Bengaluru-House-Price-Prediction/
│
├── main.py
├── RidgeModel.pkl
├── cleaned_data_house.csv
├── house_prediction.ipynb
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── app.js
│
├── Bengaluru_House_Data.csv
│
└── README.md
```

---

## 🧠 Machine Learning Workflow

### Data Collection
The project uses the Bengaluru House Price dataset containing:

- Location
- Total Square Feet
- BHK
- Bathrooms
- Price

### Data Cleaning
Performed:
- Missing value handling
- Feature engineering
- Outlier removal
- Location normalization

### Model Training

The model was trained using:

```python
Pipeline(
    [
        ("preprocessor", ColumnTransformer(...)),
        ("model", Ridge())
    ]
)
```

The entire preprocessing and model are saved together as:

```bash
RidgeModel.pkl
```

This allows direct prediction without manual encoding.

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/Bengaluru-House-Price-Prediction.git
cd Bengaluru-House-Price-Prediction
```

### Create Virtual Environment

```bash
python -m venv venv
```

Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux/Mac

```bash
source venv/bin/activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

If requirements.txt is unavailable:

```bash
pip install flask pandas numpy scikit-learn
```

---

## ▶️ Running the Application

Start the Flask server:

```bash
python main.py
```

Flask will run at:

```bash
http://127.0.0.1:5000
```

Open the URL in your browser.

---

## 🔌 API Endpoints

### Get Available Locations

```http
GET /api/locations
```

Response:

```json
[
  "Whitefield",
  "Indira Nagar",
  "JP Nagar"
]
```

---

### Predict House Price

```http
POST /api/predict
```

Request:

```json
{
  "location": "Whitefield",
  "total_sqft": 1500,
  "bath": 2,
  "bhk": 3
}
```

Response:

```json
{
  "price_lakhs": 85.62,
  "price_formatted": "₹85.62 Lakhs"
}
```

---

## 📊 Sample Prediction

| Feature | Value |
|----------|--------|
| Location | Whitefield |
| Area | 1500 sq.ft |
| BHK | 3 |
| Bathrooms | 2 |

### Predicted Price

```text
₹85.62 Lakhs
```

---

## 🎯 Future Improvements

- Deploy on Render/Vercel/AWS
- Add property price trends
- Interactive map integration
- Model comparison dashboard
- User authentication
- House image support
- Recommendation system

---

## 👨‍💻 Author

### Madhur Indurkhya

B.Tech CSE (AI & ML)

Machine Learning Enthusiast | Data Science Learner | Aspiring ML Engineer


LinkedIn: https://www.linkedin.com/in/madhur-indurkhya/

Portfolio: https://madhur-indurkhya.vercel.app

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It motivates further development and helps others discover the project.

---

## 📜 License

This project is licensed under the MIT License.