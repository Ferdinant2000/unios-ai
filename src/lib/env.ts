export function validateEnv() {
  const requiredVars = ["GROQ_API_KEY"] as const;

  const missing = requiredVars.filter((key) => {
    const value = process.env[key];
    return !value || value === `your_${key.toLowerCase()}_here`;
  });

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(", ")}`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.warn(`[Env Warning] ${message}`);
  }

  return {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  };
}

export const env = validateEnv();