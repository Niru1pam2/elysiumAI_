import redis from "../../shared/redis/redis.js";

const protect = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing session cookie" });
    }

    const session = await redis.get(`session:${sessionId}`);

    if (!session) {
      // Clear invalid cookie from browser if session expired in Redis
      res.clearCookie("session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || true,
        sameSite: "none",
      });
      return res.status(401).json({ message: "Unauthorized: Session expired" });
    }

    req.user = JSON.parse(session);
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default protect;
