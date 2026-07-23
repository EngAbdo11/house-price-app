import logging

import joblib
import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)

_model = None


def load_model():
    """Load the trained pipeline from disk. Call once at startup."""
    global _model
    logger.info("Loading model from %s", settings.model_path)
    _model = joblib.load(settings.model_path)
    return _model


def get_model():
    if _model is None:
        raise RuntimeError("Model not loaded yet -- did the startup lifespan run?")
    return _model


def predict_price(df: pd.DataFrame) -> float:
    model = get_model()
    prediction = model.predict(df)[0]
    return float(prediction)
