import jwt from "jsonwebtoken";
import { userSocketIDs } from "../socket";
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

export function getSockets({ users }: { users: number[] }) {
  const sockets = users.map((user: number) => userSocketIDs.get(user));
  return sockets;
}

export const extractImagePublicId = (data: string) => {
  const parts = data.split("/");
  return parts.slice(-2, -1) + "/" + parts.slice(-1)[0].split(".")[0];
};
