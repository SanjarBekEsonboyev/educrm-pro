const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uid, today } = require("../utils/helpers");

const router = express.Router();

function toApi(a) {
  return {
    id: a.id, name: a.name, phone: a.phone, courseId: a.course_id,
    type: a.type, days: a.days, reqDate: a.req_date, status: a.status,
    note: a.note, studentId: a.student_id,
  };
}

router.get("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  res.json(db.prepare("SELECT * FROM admissions ORDER BY req_date DESC").all().map(toApi));
});

// Submit a new admission request: creates admission record + a waiting student,
// auto-attaching to an open waiting/active group with room, mirroring original logic.
router.post("/", requireAuth, requireRole("admin", "director"), (req, res) => {
  const { name, phone, courseId, type, days, note } = req.body || {};
  if (!name || !phone || !courseId) return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });

  const course = db.prepare("SELECT * FROM courses WHERE id=?").get(courseId);
  const admissionId = uid("a");
  const studentId = uid("s");

  const waitingGroup = db.prepare(`
    SELECT g.*, (SELECT COUNT(*) FROM students s WHERE s.group_id = g.id AND s.status='active') AS active_count
    FROM groups_t g
    WHERE g.course_id = ? AND g.status IN ('waiting','active')
      AND (SELECT COUNT(*) FROM students s WHERE s.group_id = g.id AND s.status='active') < g.max_size
    LIMIT 1
  `).get(courseId);

  const indPrice = type === "individual" ? (course?.price || 350000) * 2 : null;

  const tx = db.transaction(() => {
    // Insert the student row first: admissions.student_id is a NOT-DEFERRED
    // foreign key into students(id), so it must already exist when the
    // admissions row referencing it is inserted.
    db.prepare(`
      INSERT INTO students (id,name,phone,course_id,group_id,type,days,join_date,status,pay_start,paid,ind_price,note)
      VALUES (?,?,?,?,?,?,?,NULL,'waiting',NULL,0,?,?)
    `).run(studentId, name, phone, courseId, waitingGroup?.id || null, type || "group", days || "MWF", indPrice, note || null);

    db.prepare(`
      INSERT INTO admissions (id,name,phone,course_id,type,days,req_date,status,note,student_id)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(admissionId, name, phone, courseId, type || "group", days || "MWF", today(), "pending", note || null, studentId);
  });
  tx();

  let groupReadyToOpen = false;
  if (waitingGroup) {
    const waitingCount = db.prepare(`
      SELECT COUNT(*) c FROM students WHERE group_id=? AND status='waiting'
    `).get(waitingGroup.id).c;
    groupReadyToOpen = waitingCount >= (course?.min_group || 5);
  }

  res.status(201).json({
    admission: toApi(db.prepare("SELECT * FROM admissions WHERE id=?").get(admissionId)),
    groupReadyToOpen,
    groupId: waitingGroup?.id || null,
  });
});

router.post("/:id/approve", requireAuth, requireRole("admin", "director"), (req, res) => {
  const a = db.prepare("SELECT * FROM admissions WHERE id=?").get(req.params.id);
  if (!a) return res.status(404).json({ error: "Topilmadi" });
  db.prepare("UPDATE admissions SET status='approved' WHERE id=?").run(a.id);
  if (a.student_id) {
    db.prepare("UPDATE students SET status='waiting' WHERE id=? AND status != 'active'").run(a.student_id);
  }
  res.json(toApi(db.prepare("SELECT * FROM admissions WHERE id=?").get(a.id)));
});

router.post("/:id/reject", requireAuth, requireRole("admin", "director"), (req, res) => {
  const a = db.prepare("SELECT * FROM admissions WHERE id=?").get(req.params.id);
  if (!a) return res.status(404).json({ error: "Topilmadi" });
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM admissions WHERE id=?").run(a.id);
    if (a.student_id) db.prepare("DELETE FROM students WHERE id=? AND status='waiting'").run(a.student_id);
  });
  tx();
  res.status(204).end();
});

module.exports = { router, toApi };
