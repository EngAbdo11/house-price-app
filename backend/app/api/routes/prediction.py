from fastapi import APIRouter

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services.inference import predict_price
from app.services.preprocessing import request_to_dataframe

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    df = request_to_dataframe(request)
    price = predict_price(df)
    return PredictionResponse(predicted_price=price)
