#!/bin/bash
# Start Python FastAPI ML Model Server on port 8000
cd "c:/Users/raish/Desktop/CloudPulse-AI/backend/model"
python -m uvicorn app:app --reload --port 8000 --host 0.0.0.0
