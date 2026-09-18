const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uid, today } = require("../utils/helpers");

const router = express.Router();

function toApi(f) {
  return { id: f.id, teacherId: f.teacher_id, amount: f.amount, reason: f.reason, date: f.date, by: f.by_user_id };
}

router.get("/", requireAuth, (req, res) => {
  if (req.user.role === "teacher") {
    return res.json(db.prepare("SELECT * FROM fines WHERE teacher_id=? ORDER BY date DESC").all(req.user.id).map(toApi));
  }
  res.json(db.prepare("SELECT * FROM fines ORDER BY date DESC").all().map(toApi));
});

router.post("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  const { teacherId, amount, reason } = req.body || {};
  if (!teacherId || !amount || !reason) return res.status(400).json({ error: "Summa va sabab kiriting" });
  const id = uid("f");
  db.prepare("INSERT INTO fines (id,teacher_id,amount,reason,date,by_user_id) VALUES (?,?,?,?,?,?)")
    .run(id, teacherId, parseInt(amount, 10), reason, today(), req.user.id);
  res.status(201).json(toApi(db.prepare("SELECT * FROM fines WHERE id=?").get(id)));
});

module.exports = { router, toApi };
