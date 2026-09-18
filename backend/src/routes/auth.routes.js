const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

function sanitizeUser(u) {
  if (!u) return null;
  const { pass_hash, ...rest } = u;
  return {
    id: rest.id,
    role: rest.role,
    name: rest.name,
    login: rest.login,
    phone: rest.phone,
    subjectId: rest.subject_id,
    salary: { type: rest.salary_type, value: rest.salary_value },
    bonuses: rest.bonuses,
  };
}

router.post("/login", (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) {
    return res.status(400).json({ error: "Login va parolni kiriting" });
  }
  const user = db.prepare("SELECT * FROM users WHERE login = ?").get(login.trim());
  if (!user || !bcrypt.compareSync(password, user.pass_hash)) {
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
  }
  const token = signToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
  res.json({ user: sanitizeUser(user) });
});

module.exports = { router, sanitizeUser };
