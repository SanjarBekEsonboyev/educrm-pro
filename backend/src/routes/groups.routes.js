const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uid, today } = require("../utils/helpers");

const router = express.Router();

function toApi(g) {
  return {
    id: g.id, courseId: g.course_id, teacherId: g.teacher_id, name: g.name,
    status: g.status, days: g.days, startDate: g.start_date, maxSize: g.max_size,
    minGroup: g.min_group, openedDate: g.opened_date, confirmedBy: g.confirmed_by,
  };
}

router.get("/", requireAuth, (req, res) => {
  let rows;
  if (req.user.role === "teacher") {
    rows = db.prepare("SELECT * FROM groups_t WHERE teacher_id = ? ORDER BY created_at").all(req.user.id);
  } else {
    rows = db.prepare("SELECT * FROM groups_t ORDER BY created_at").all();
  }
  res.json(rows.map(toApi));
});

router.post("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  const { name, courseId, teacherId, days, maxSize, minGroup } = req.body || {};
  if (!name || !courseId || !teacherId) {
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
  }
  const id = uid("g");
  db.prepare(`
    INSERT INTO groups_t (id,course_id,teacher_id,name,status,days,start_date,max_size,min_group,opened_date,confirmed_by)
    VALUES (?,?,?,?,'waiting',?,NULL,?,?,NULL,NULL)
  `).run(id, courseId, teacherId, name, days || "MWF", maxSize || 12, minGroup || 5);
  res.status(201).json(toApi(db.prepare("SELECT * FROM groups_t WHERE id=?").get(id)));
});

// Confirm/activate a waiting group: activates group + all waiting students in it
router.post("/:id/confirm", requireAuth, requireRole("admin", "director"), (req, res) => {
  const g = db.prepare("SELECT * FROM groups_t WHERE id=?").get(req.params.id);
  if (!g) return res.status(404).json({ error: "Guruh topilmadi" });
  const startDate = req.body?.startDate || today();

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE groups_t SET status='active', start_date=?, opened_date=?, confirmed_by=? WHERE id=?
    `).run(startDate, startDate, req.user.id, g.id);

    db.prepare(`
      UPDATE students SET status='active', join_date=?, pay_start=? WHERE group_id=? AND status='waiting'
    `).run(startDate, startDate, g.id);
  });
  tx();

  const activated = db.prepare("SELECT COUNT(*) c FROM students WHERE group_id=? AND status='active'").get(g.id).c;
  res.json({ group: toApi(db.prepare("SELECT * FROM groups_t WHERE id=?").get(g.id)), activatedStudents: activated });
});

router.delete("/:id", requireAuth, requireRole("admin", "director"), (req, res) => {
  const count = db.prepare("SELECT COUNT(*) c FROM students WHERE group_id=?").get(req.params.id).c;
  if (count > 0) return res.status(409).json({ error: "Guruhda o'quvchilar bor, avval ularni o'tkazing" });
  db.prepare("DELETE FROM groups_t WHERE id=?").run(req.params.id);
  res.status(204).end();
});

module.exports = { router, toApi };
