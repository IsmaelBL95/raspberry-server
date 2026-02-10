import cookie from "cookie";
import { verifyJWT } from "../services/rootAuthService.js";

export function validateRootToken(req, res, next) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.root_session;

  if (!token) {
    return res.status(401).json({ session: "invalid" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ session: "invalid" });
  }

  req.root = decoded;
  next();
}
