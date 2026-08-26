import { getDb, setCorsHeaders, signToken, verifyToken, COOKIE_NAME } from "./db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const sql = getDb();

  let path = "";
  if (req.query?.path) {
    path = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
  } else if (req.url) {
    const urlMatch = req.url.match(/\/api\/auth\/?(.*)$/);
    if (urlMatch?.[1]) {
      path = urlMatch[1].split("?")[0];
    }
  }

  try {
    // POST /api/auth — Register
    if (req.method === "POST" && !path) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Name, email, and password are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        return res
          .status(409)
          .json({ error: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${hashedPassword})
        RETURNING id, name, email
      `;

      const user = result[0];

      const token = signToken({ userId: user.id, email: user.email });

      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60}; SameSite=Lax`
      );

      return res
        .status(201)
        .json({ user: { id: user.id, name: user.name, email: user.email } });
    }

    // POST /api/auth/login
    if (req.method === "POST" && path === "login") {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await sql`
        SELECT id, name, email, password FROM users WHERE email = ${email}
      `;

      if (result.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = result[0];

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = signToken({ userId: user.id, email: user.email });

      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60}; SameSite=Lax`
      );

      return res
        .status(200)
        .json({ user: { id: user.id, name: user.name, email: user.email } });
    }

    // POST /api/auth/logout
    if (req.method === "POST" && path === "logout") {
      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
      );

      return res.status(200).json({ message: "Logged out successfully" });
    }

    // GET /api/auth/me
    if (req.method === "GET" && path === "me") {
      const cookies =
        req.headers.cookie?.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = value;
          return acc;
        }, {}) || {};

      const token = cookies[COOKIE_NAME];

      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      try {
        const decoded = verifyToken(token);

        const result = await sql`
          SELECT id, name, email FROM users WHERE id = ${decoded.userId}
        `;

        if (result.length === 0) {
          return res.status(401).json({ error: "User not found" });
        }

        return res.status(200).json({ user: result[0] });
      } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
