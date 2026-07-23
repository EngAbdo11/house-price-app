import json
from functools import lru_cache

import pandas as pd

from app.core.config import settings
from app.schemas.prediction import PredictionRequest


@lru_cache(maxsize=1)
def _allowed_locations() -> set[str]:
    with open(settings.locations_path) as f:
        return set(json.load(f))


def request_to_dataframe(request: PredictionRequest) -> pd.DataFrame:
    """Build a one-row DataFrame with exactly the column names used in
    training. Because the exported object is a full sklearn Pipeline
    (ColumnTransformer + model), no manual scaling/encoding happens
    here -- the pipeline does it internally. Unknown locations are
    mapped to "other" to match the training-time grouping.
    """
    location = request.location if request.location in _allowed_locations() else "other"

    row = {
        "carpet_area_sqft": request.carpet_area_sqft,
        "floor_num": request.floor_num,
        "bathroom_num": request.bathroom,
        "balcony_num": request.balcony,
        "location_grouped": location,
        "Furnishing": request.furnishing,
        "Transaction": request.transaction,
        "Ownership": request.ownership,
        "facing": request.facing,
    }
    return pd.DataFrame([row])
