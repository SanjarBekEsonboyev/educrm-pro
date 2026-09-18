const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  res.json(db.prepare("SELECT * FROM payments ORDER BY date DESC").all().map((p) => ({
    id: p.id, studentId: p.student_id, amount: p.amount, date: p.date, month: p.month, note: p.note, by: p.by_user_id,
  })));
});

router.get("/:id/receipt", requireAuth, requireRole("admin", "director"), (req, res) => {
  const p = db.prepare("SELECT * FROM payments WHERE id=?").get(req.params.id);
  if (!p) return res.status(404).json({ error: "Topilmadi" });
  const student = db.prepare("SELECT * FROM students WHERE id=?").get(p.student_id);
  const course = student ? db.prepare("SELECT * FROM courses WHERE id=?").get(student.course_id) : null;
  const group = student?.group_id ? db.prepare("SELECT * FROM groups_t WHERE id=?").get(student.group_id) : null;
  res.json({
    payment: { id: p.id, studentId: p.student_id, amount: p.amount, date: p.date, month: p.month, note: p.note, by: p.by_user_id },
    student: student && { id: student.id, name: student.name, phone: student.phone, type: student.type },
    course: course && { id: course.id, name: course.name, icon: course.icon, price: course.price },
    group: group && { id: group.id, name: group.name },
  });
});

module.exports = { router };
