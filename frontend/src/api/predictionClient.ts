import type { ApiErrorBody, PredictionRequest, PredictionResponse } from "../types/prediction";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
  // Fails loudly at build/dev time rather than silently hitting a relative URL.
  console.error(
    "VITE_API_BASE_URL is not set. Copy .env.example to .env and set it."
  );
}

function extractErrorMessage(body: ApiErrorBody, fallback: string): string {
  if (!body?.detail) return fallback;
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail) && body.detail[0]?.msg) {
    return body.detail.map((d) => d.msg).join(" ");
  }
  return fallback;
}

export async function predictPrice(
  payload: PredictionRequest
): Promise<PredictionResponse> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Couldn't reach the prediction service. Is the backend running on " +
        BASE_URL +
        "?"
    );
  }

  if (!response.ok) {
    let message = `Prediction failed (status ${response.status}).`;
    try {
      const body: ApiErrorBody = await response.json();
      message = extractErrorMessage(body, message);
    } catch {
      // response body wasn't JSON -- keep the default message
    }
    throw new Error(message);
  }

  return response.json();
}

export async function fetchLocations(): Promise<string[]> {
  try {
    const response = await fetch("/locations.json");
    if (!response.ok) {
      throw new Error();
    }
    return await response.json();
  } catch {
    throw new Error(
      "Couldn't load the locations list. Make sure locations.json is in /public."
    );
  }
}
