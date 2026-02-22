import { getStatus, connectDB, disconnectDB } from "../services/db.service.js";

export function status(req, res) {
  try {
    return res.status(200).json(getStatus());
  } catch {
    return res.status(500).json({ error: "Could not get DB status" });
  }
}

export async function connect(req, res) {
  try {
    const payload = await connectDB();
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export async function disconnect(req, res) {
  try {
    const payload = await disconnectDB();
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}