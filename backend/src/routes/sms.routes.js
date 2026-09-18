const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uid } = require("../utils/helpers");

const router = express.Router();

function toApi(s) {
  return { id: s.id, phone: s.phone, msg: s.msg, type: s.type, time: s.sent_at };
}

router.get("/log", requireAuth, requireRole("admin", "director"), (req, res) => {
  res.json(db.prepare("SELECT * FROM sms_log ORDER BY sent_at DESC LIMIT 500").all().map(toApi));
});

// Simulated SMS send: logs a row per recipient. body: { recipients: [{phone,msg}], type }
router.post("/send", requireAuth, requireRole("admin", "director"), (req, res) => {
  const { recipients, type } = req.body || {};
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "Qabul qiluvchilar ro'yxati bo'sh" });
  }
  const insert = db.prepare("INSERT INTO sms_log (id,phone,msg,type) VALUES (?,?,?,?)");
  const tx = db.transaction(() => {
    recipients.forEach((r) => insert.run(uid("sms"), r.phone, r.msg, type || "custom"));
  });
  tx();
  res.status(201).json({ sent: recipients.length });
});

module.exports = { router };
