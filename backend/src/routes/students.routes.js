const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uid, today, currentMonth, calcLessonFee } = require("../utils/helpers");

const router = express.Router();

function attendanceMap(studentId) {
  const rows = db.prepare("SELECT date, value FROM attendance WHERE student_id=?").all(studentId);
  const map = {};
  rows.forEach((r) => { map[r.date] = r.value; });
  return map;
}

function toApi(s) {
  return {
    id: s.id, name: s.name, phone: s.phone, courseId: s.course_id, groupId: s.group_id,
    type: s.type, days: s.days, joinDate: s.join_date, status: s.status, payStart: s.pay_start,
    paid: s.paid, indPrice: s.ind_price, note: s.note, leaveReason: s.leave_reason,
    leaveDate: s.leave_date, attendedLessons: s.attended_lessons, refund: s.refund,
    attendance: attendanceMap(s.id),
  };
}

function scopedStudents(user) {
  if (user.role === "teacher") {
    return db.prepare(`
      SELECT s.* FROM students s
      JOIN groups_t g ON g.id = s.group_id
      WHERE g.teacher_id = ?
      ORDER BY s.name
    `).all(user.id);
  }
  return db.prepare("SELECT * FROM students ORDER BY name").all();
}

router.get("/", requireAuth, (req, res) => {
  res.json(scopedStudents(req.user).map(toApi));
});

router.get("/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM students WHERE id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Topilmadi" });
  const payments = db.prepare("SELECT * FROM payments WHERE student_id=? ORDER BY date").all(row.id);
  res.json({ ...toApi(row), payments });
});

router.post("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  const { name, phone, courseId, groupId, type, days, indPrice } = req.body || {};
  if (!name || !phone || !courseId) return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
  const id = uid("s");
  db.prepare(`
    INSERT INTO students (id,name,phone,course_id,group_id,type,days,join_date,status,pay_start,paid,ind_price)
    VALUES (?,?,?,?,?,?,?,?,?,?,0,?)
  `).run(id, name, phone, courseId, groupId || null, type || "group", days || "MWF", today(), "active", today(), indPrice || null);
  res.status(201).json(toApi(db.prepare("SELECT * FROM students WHERE id=?").get(id)));
});

// Record a payment for a student
router.post("/:id/pay", requireAuth, requireRole("admin", "director"), (req, res) => {
  const s = db.prepare("SELECT * FROM students WHERE id=?").get(req.params.id);
  if (!s) return res.status(404).json({ error: "Topilmadi" });
  const amount = parseInt(req.body?.amount, 10);
  const note = req.body?.note || "Oylik to'lov";
  if (!amount || amount <= 0) return res.status(400).json({ error: "Miqdorni kiriting" });

  const course = db.prepare("SELECT * FROM courses WHERE id=?").get(s.course_id);
  const price = s.type === "individual" ? (s.ind_price || (course?.price || 0) * 2 || 700000) : (course?.price || 0);

  const paymentId = uid("p");
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO payments (id,student_id,amount,date,month,note,by_user_id) VALUES (?,?,?,?,?,?,?)`)
      .run(paymentId, s.id, amount, today(), currentMonth(), note, req.user.id);
    const newPaid = Math.min((s.paid || 0) + amount, price);
    db.prepare("UPDATE students SET paid=? WHERE id=?").run(newPaid, s.id);
  });
  tx();

  const payment = db.prepare("SELECT * FROM payments WHERE id=?").get(paymentId);
  const updated = db.prepare("SELECT * FROM students WHERE id=?").get(s.id);
  res.status(201).json({ payment, student: toApi(updated) });
});

// Leave / withdraw a student, with pro-rated refund calculation
router.post("/:id/leave", requireAuth, requireRole("admin", "director"), (req, res) => {
  const s = db.prepare("SELECT * FROM students WHERE id=?").get(req.params.id);
  if (!s) return res.status(404).json({ error: "Topilmadi" });
  const { reason, attendedLessons } = req.body || {};
  if (!reason) return res.status(400).json({ error: "Sabab kiriting" });

  const course = db.prepare("SELECT * FROM courses WHERE id=?").get(s.course_id);
  const price = s.type === "individual" ? (s.ind_price || (course?.price || 0) * 2 || 700000) : (course?.price || 0);
  const attended = Number(attendedLessons) || 0;
  const usedFee = calcLessonFee(price, attended);
  const refund = Math.max(0, (s.paid || 0) - usedFee);

  db.prepare(`
    UPDATE students SET status='left', leave_reason=?, leave_date=?, attended_lessons=?, refund=? WHERE id=?
  `).run(reason, today(), attended, refund, s.id);

  res.json({ student: toApi(db.prepare("SELECT * FROM students WHERE id=?").get(s.id)), refund, usedFee });
});

// Mark attendance for one or more students on a date. Body: { date, records: {studentId: 'P'|'L'|'A'} }
router.post("/attendance/bulk", requireAuth, (req, res) => {
  const { date, records } = req.body || {};
  if (!date || !records || typeof records !== "object") {
    return res.status(400).json({ error: "date va records majburiy" });
  }

  if (req.user.role === "teacher") {
    const ids = Object.keys(records);
    const own = db.prepare(`
      SELECT s.id FROM students s JOIN groups_t g ON g.id = s.group_id WHERE g.teacher_id = ?
    `).all(req.user.id).map((r) => r.id);
    const notOwn = ids.filter((id) => !own.includes(id));
    if (notOwn.length) return res.status(403).json({ error: "Faqat o'z guruhingiz o'quvchilariga davomat qo'ya olasiz" });
  }

  const upsert = db.prepare(`
    INSERT INTO attendance (id, student_id, date, value, marked_by)
    VALUES (?,?,?,?,?)
    ON CONFLICT(student_id, date) DO UPDATE SET value=excluded.value, marked_by=excluded.marked_by
  `);
  const tx = db.transaction(() => {
    Object.entries(records).forEach(([studentId, value]) => {
      upsert.run(uid("att"), studentId, date, value, req.user.id);
    });
  });
  tx();

  res.json({ ok: true, date, count: Object.keys(records).length });
});

module.exports = { router, toApi, scopedStudents };
