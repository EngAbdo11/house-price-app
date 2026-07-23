// Mirrors backend/app/schemas/prediction.py exactly.
// Keep these two files in sync if the model's input features ever change.

export interface PredictionRequest {
  location: string;
  carpet_area_sqft: number;
  floor_num: number;
  bathroom: number;
  balcony: number;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
}

export interface PredictionResponse {
  predicted_price: number;
}

export interface ApiErrorBody {
  detail?: string | { msg: string }[];
}
