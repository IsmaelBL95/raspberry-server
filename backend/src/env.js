const PORT = process.env.PORT || 5000;
const ROOT_KEY = process.env.ROOT_KEY || "0123456789abcdef";
const JWT_ROOT_SECRET = process.env.JWT_ROOT_SECRET || "my-secret-key";
const NODE_ENV = process.env.NODE_ENV || "development";

export { PORT, ROOT_KEY, JWT_ROOT_SECRET, NODE_ENV };
