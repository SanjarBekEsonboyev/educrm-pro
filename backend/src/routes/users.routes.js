const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uid } = require("../utils/helpers");

const router = express.Router();

function toApi(u) {
  if (!u) return null;
  return {
    id: u.id,
    role: u.role,
    name: u.name,
    login: u.login,
    phone: u.phone,
    subjectId: u.subject_id,
    salary: { type: u.salary_type, value: u.salary_value },
    bonuses: u.bonuses,
  };
}

// List all users (admin/director) - used for staff pages & settings
router.get("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  const rows = db.prepare("SELECT * FROM users ORDER BY role, name").all();
  res.json(rows.map(toApi));
});

// Create teacher
router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { name, phone, login, password, subjectId, salary } = req.body || {};
  if (!name || !login || !password) {
    return res.status(400).json({ error: "Majburiy maydonlarni to'ldiring" });
  }
  const exists = db.prepare("SELECT id FROM users WHERE login = ?").get(login);
  if (exists) return res.status(409).json({ error: "Bu login band" });

  const id = uid("t");
  db.prepare(`
    INSERT INTO users (id, role, name, login, pass_hash, phone, subject_id, salary_type, salary_value, bonuses)
    VALUES (?, 'teacher', ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(id, name, login, bcrypt.hashSync(password, 10), phone || null, subjectId || null,
    salary?.type || "fixed", salary?.value || 0);

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  res.status(201).json(toApi(row));
});

// Update teacher
router.put("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Topilmadi" });

  const { name, phone, login, password, subjectId, salary } = req.body || {};
  const passHash = password ? bcrypt.hashSync(password, 10) : row.pass_hash;

  db.prepare(`
    UPDATE users SET name=?, phone=?, login=?, pass_hash=?, subject_id=?, salary_type=?, salary_value=?
    WHERE id=?
  `).run(
    name ?? row.name, phone ?? row.phone, login ?? row.login, passHash,
    subjectId ?? row.subject_id, salary?.type ?? row.salary_type, salary?.value ?? row.salary_value,
    req.params.id
  );

  res.json(toApi(db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id)));
});

// Add bonus to a teacher
router.post("/:id/bonus", requireAuth, requireRole("admin", "director"), (req, res) => {
  const amount = Number(req.body?.amount) || 200000;
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Topilmadi" });
  db.prepare("UPDATE users SET bonuses = COALESCE(bonuses,0) + ? WHERE id = ?").run(amount, req.params.id);
  res.json(toApi(db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id)));
});

router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const hasGroups = db.prepare("SELECT COUNT(*) c FROM groups_t WHERE teacher_id = ?").get(req.params.id).c;
  if (hasGroups > 0) {
    return res.status(409).json({ error: "O'qituvchida guruhlar mavjud" });
  }
  db.prepare("DELETE FROM users WHERE id = ? AND role = 'teacher'").run(req.params.id);
  res.status(204).end();
});

module.exports = { router, toApi };
