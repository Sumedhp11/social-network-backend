import jwt from "jsonwebtoken";
export function generateToken(
  payload: { userId: number; email: string },
  ttl = "30d",
  isRefresh = true
) {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: ttl,
  });
  return token;
}

