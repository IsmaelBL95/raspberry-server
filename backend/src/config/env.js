function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return value;
}

export const env = Object.freeze({
  PORT: Number(getEnv("PORT", "3000")),
  NODE_ENV: getEnv("NODE_ENV", "development"),

  ROOT_KEY: getEnv("ROOT_KEY", "0123456789abcdef"),
  JWT_ROOT_SECRET: getEnv("JWT_ROOT_SECRET", "my-secret-key"),

  MONGODB_URI: getEnv("MONGODB_URI", "")
});