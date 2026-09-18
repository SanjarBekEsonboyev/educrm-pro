const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uid } = require("../utils/helpers");

const router = express.Router();

function toApi(c) {
  return {
    id: c.id, name: c.name, color: c.color, icon: c.icon,
    price: c.price, duration: c.duration, desc: c.desc,
    minGroup: c.min_group, maxGroup: c.max_group,
  };
}

router.get("/", requireAuth, (req, res) => {
  res.json(db.prepare("SELECT * FROM courses ORDER BY created_at").all().map(toApi));
});

router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { name, color, icon, price, duration, desc, minGroup, maxGroup } = req.body || {};
  if (!name) return res.status(400).json({ error: "Kurs nomini kiriting" });
  const id = uid("c");
  db.prepare(`
    INSERT INTO courses (id,name,color,icon,price,duration,desc,min_group,max_group)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(id, name, color || "#4f8fff", icon || "📚", price || 0, duration || "", desc || "", minGroup || 5, maxGroup || 12);
  res.status(201).json(toApi(db.prepare("SELECT * FROM courses WHERE id=?").get(id)));
});

router.put("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const row = db.prepare("SELECT * FROM courses WHERE id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Topilmadi" });
  const { name, color, icon, price, duration, desc, minGroup, maxGroup } = req.body || {};
  db.prepare(`
    UPDATE courses SET name=?,color=?,icon=?,price=?,duration=?,desc=?,min_group=?,max_group=? WHERE id=?
  `).run(
    name ?? row.name, color ?? row.color, icon ?? row.icon, price ?? row.price,
    duration ?? row.duration, desc ?? row.desc, minGroup ?? row.min_group, maxGroup ?? row.max_group,
    req.params.id
  );
  res.json(toApi(db.prepare("SELECT * FROM courses WHERE id=?").get(req.params.id)));
});

router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const hasGroups = db.prepare("SELECT COUNT(*) c FROM groups_t WHERE course_id=?").get(req.params.id).c;
  if (hasGroups > 0) return res.status(409).json({ error: "Bu kursda guruhlar mavjud" });
  db.prepare("DELETE FROM courses WHERE id=?").run(req.params.id);
  res.status(204).end();
});

module.exports = { router, toApi };
