from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import os
from pathlib import Path

app = FastAPI(title="CloudPulse AI ML Model")

# Get the directory where this script is located
MODEL_DIR = Path(__file__).parent

# Load model files with absolute paths
model = joblib.load(MODEL_DIR / "cloudpulse_cost_model.pkl")
feature_names = joblib.load(MODEL_DIR / "feature_names.pkl")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CloudPulse ML Model"}

@app.post("/predict")
def predict(data: dict):
    try:
        df = pd.DataFrame([data])
        df = pd.get_dummies(df)
        df = df.reindex(columns=feature_names, fill_value=0)
        prediction = model.predict(df)

        return {
            "predicted_cost": float(prediction[0]),
            "model": "cloudpulse_cost_model",
            "status": "success"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "failed"
        }
