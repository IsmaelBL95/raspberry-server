/*
  Placeholder controller for root session check.
  In future iterations this will validate a real JWT cookie.
  Control the stub via environment variable ROOT_SESSION_VALID.
  If ROOT_SESSION_VALID is '1' or 'true' the endpoint returns 200, otherwise 401.
*/

export function checkRootSession(req, res) {
  const env = process.env.ROOT_SESSION_VALID;
  const valid = env === "1" || env === "true";
  if (valid) {
    return res.status(200).json({ session: "valid" });
  }
  return res.status(401).json({ session: "invalid" });
}
