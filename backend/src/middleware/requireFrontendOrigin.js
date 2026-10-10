// Reject state-changing requests from origins outside the configured frontend.
export default function requireFrontendOrigin(req, res, next) {
  const origin = req.get("Origin");
  const allowedOrigin = (
    process.env.FRONTEND_ORIGIN || "http://localhost:5173"
  ).replace(/\/$/, "");

  if (origin && origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
  }

  return next();
}
