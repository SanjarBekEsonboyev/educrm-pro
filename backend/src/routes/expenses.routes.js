const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uid, today } = require("../utils/helpers");

const router = express.Router();

function toApi(e) {
  return { id: e.id, title: e.title, amount: e.amount, date: e.date, cat: e.cat };
}

router.get("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  res.json(db.prepare("SELECT * FROM expenses ORDER BY date DESC").all().map(toApi));
});

router.post("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  const { title, amount, cat, date } = req.body || {};
  if (!title || !amount) return res.status(400).json({ error: "Maydonlarni to'ldiring" });
  const id = uid("e");
  db.prepare("INSERT INTO expenses (id,title,amount,date,cat) VALUES (?,?,?,?,?)")
    .run(id, title, parseInt(amount, 10), date || today(), cat || "other");
  res.status(201).json(toApi(db.prepare("SELECT * FROM expenses WHERE id=?").get(id)));
});

module.exports = { router, toApi };
