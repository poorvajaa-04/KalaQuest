const MODEL_API_KEYS = ["GOOGLE_API_KEY", "GEMINI_API_KEY"] as const;

export function getModelApiKey() {
  for (const key of MODEL_API_KEYS) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

export function hasModelApiKey() {
  return Boolean(getModelApiKey());
}

export function getMissingModelApiKeyMessage() {
  return "Set GOOGLE_API_KEY (or GEMINI_API_KEY) in the server environment and restart the app. Do not use the Firebase apiKey for LLM calls.";
}
