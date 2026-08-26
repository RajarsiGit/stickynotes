import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

let sql;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export const COOKIE_NAME = "auth_token";

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173"];
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map((o) => o.trim())
  : DEFAULT_ALLOWED_ORIGINS;

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
}

export function getDb() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    sql = neon(databaseUrl);
  }

  return sql;
}

export async function getUserFromRequest(req) {
  const sql = getDb();

  const cookies =
    req.headers.cookie?.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {}) || {};

  const token = cookies[COOKIE_NAME];

  if (!token) {
    throw new Error("Not authenticated - no token found");
  }

  try {
    const decoded = verifyToken(token);

    const users = await sql`
      SELECT id, name, email FROM users WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      throw new Error("User not found");
    }

    return users[0];
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw new Error("Invalid or expired token");
    }
    throw error;
  }
}
