/**
 * One-time importer for real course/group/student data extracted from
 * "Sentyabr.xlsx" (5 sheets: ingiliz tili, grafik dizayn, Buxalteriya,
 * web dasturlash, Kompuyuter savodxonligi).
 *
 * The spreadsheet itself was parsed offline into data/imports/sentyabr-import.json
 * (a flat, already-normalized structure: courses[], groups[] each with a
 * students[] array). This script only does the DB writes, so it can be
 * re-run safely — it skips any course/teacher/group that already exists by
 * name, and skips any student that already exists with the same phone
 * number under the same course (so re-running never creates duplicates).
 *
 * Usage:
 *   node src/db/import-sentyabr.js
 */
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("./index");
const { uid, today } = require("../utils/helpers");

const DATA_FILE = path.join(__dirname, "../../data/imports/sentyabr-import.json");

function slugLogin(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "")
      .replace(/g'/g, "g")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") || "teacher"
  );
}

function getOrCreateCourse(c) {
  const existing = db.prepare("SELECT * FROM courses WHERE name = ?").get(c.name);
  if (existing) return existing.id;
  const id = uid("c");
  db.prepare(
    `INSERT INTO courses (id,name,color,icon,price,duration,desc,min_group,max_group)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(id, c.name, c.color, c.icon, c.price || 0, c.duration || "1 oy", "Sentyabr.xlsx faylidan import qilingan", 1, 15);
  return id;
}

function getOrCreateTeacher(name, isPlaceholder) {
  const existing = db.prepare("SELECT * FROM users WHERE name = ? AND role='teacher'").get(name);
  if (existing) return existing.id;
  const id = uid("t");
  let login = slugLogin(name);
  // ensure unique login
  let n = 1;
  let finalLogin = login;
  while (db.prepare("SELECT 1 FROM users WHERE login = ?").get(finalLogin)) {
    n += 1;
    finalLogin = `${login}${n}`;
  }
  const tempPassword = `${login}123`;
  db.prepare(
    `INSERT INTO users (id,role,name,login,pass_hash,phone,subject_id,salary_type,salary_value,bonuses)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(id, "teacher", name, finalLogin, bcrypt.hashSync(tempPassword, 10), null, null, "fixed", 0, 0);
  // eslint-disable-next-line no-console
  console.log(
    `  ${isPlaceholder ? "[PLACEHOLDER] " : ""}Teacher created: ${name} -> login="${finalLogin}" password="${tempPassword}"`
  );
  return id;
}

const DAYS_LABEL = { MWF: "Du-Chor-Juma", TTS: "Sey-Pay-Shanba" };

function getOrCreateGroup(g, courseId, teacherId) {
  // Include days in the name: two different blocks can share the same
  // course+teacher+time but run on different days (e.g. English/Zikriyo
  // 14:00-16:00 exists as both a TTS group and a separate MWF group), and
  // without this they'd collide on name and get merged into one group.
  const name = `${g.course_name} — ${g.teacher_name} (${g.time}, ${DAYS_LABEL[g.days] || g.days})`;
  const existing = db
    .prepare("SELECT * FROM groups_t WHERE course_id = ? AND teacher_id = ? AND name = ?")
    .get(courseId, teacherId, name);
  if (existing) return existing.id;
  const id = uid("g");
  db.prepare(
    `INSERT INTO groups_t (id,course_id,teacher_id,name,status,days,start_date,max_size,min_group,opened_date,confirmed_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, courseId, teacherId, name, "active", g.days || "MWF", g.start_date || today(), 15, 1, g.start_date || today(), "admin1");
  return id;
}

// Dedupe on (name + phone + course), NOT phone+course alone: siblings sharing
// one family phone number are common in this data (e.g. two students named
// "Muxiddinov" both under +998904520889) and are distinct real students.
function studentExists(name, phone, courseId) {
  if (!phone) return null;
  return db
    .prepare("SELECT id FROM students WHERE phone = ? AND course_id = ? AND name = ?")
    .get(phone, courseId, name);
}

function importAll() {
  if (!fs.existsSync(DATA_FILE)) {
    // eslint-disable-next-line no-console
    console.error(`Import file not found: ${DATA_FILE}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

  let createdStudents = 0;
  let skippedStudents = 0;
  let createdPayments = 0;

  const tx = db.transaction(() => {
    // eslint-disable-next-line no-console
    console.log("=== Kurslar ===");
    const courseIds = {};
    for (const c of data.courses) {
      const id = getOrCreateCourse(c);
      courseIds[c.name] = id;
      // eslint-disable-next-line no-console
      console.log(`  ${c.name} -> ${id} (narx: ${c.price.toLocaleString("uz-UZ")} so'm)`);
    }

    // eslint-disable-next-line no-console
    console.log("\n=== O'qituvchilar va guruhlar ===");
    for (const g of data.groups) {
      const courseId = courseIds[g.course_name];
      const teacherId = getOrCreateTeacher(g.teacher_name, g.teacher_is_placeholder);
      const groupId = getOrCreateGroup(g, courseId, teacherId);

      for (const s of g.students) {
        if (!s.familya && !s.ism) continue;
        const name = [s.familya, s.ism].filter(Boolean).join(" ");
        const phone = s.phone || `+998000000${String(createdStudents).padStart(3, "0")}`;

        const dup = studentExists(name, phone, courseId);
        if (dup) {
          skippedStudents += 1;
          continue;
        }

        const studentId = uid("s");
        const noteParts = [];
        if (s.yil && Number.isNaN(Number(s.yil))) noteParts.push(`Tug'ilgan yil maydonida: "${s.yil}"`);
        if (s.extra_phones && s.extra_phones.length) {
          noteParts.push(`Qo'shimcha tel: ${s.extra_phones.map((p) => `+998${p.slice(-9)}`).join(", ")}`);
        }

        db.prepare(
          `INSERT INTO students (id,name,phone,course_id,group_id,type,days,join_date,status,pay_start,paid,ind_price,note)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
        ).run(
          studentId,
          name,
          phone,
          courseId,
          groupId,
          g.individual ? "individual" : "group",
          g.days || "MWF",
          s.join_date || null,
          "active",
          s.join_date || null,
          s.payment_amount || 0,
          g.individual ? s.payment_amount || null : null,
          noteParts.length ? noteParts.join(" | ") : null
        );
        createdStudents += 1;

        if (s.payment_amount) {
          db.prepare(
            `INSERT INTO payments (id,student_id,amount,date,month,note,by_user_id)
             VALUES (?,?,?,?,?,?,?)`
          ).run(
            uid("p"),
            studentId,
            s.payment_amount,
            s.payment_date || s.join_date || today(),
            s.payment_month_label || null,
            "Sentyabr.xlsx import",
            "admin1"
          );
          createdPayments += 1;
        }
      }
    }
  });

  tx();

  // eslint-disable-next-line no-console
  console.log(
    `\n✅ Import tugadi: ${createdStudents} yangi o'quvchi qo'shildi, ${skippedStudents} ta allaqachon mavjud bo'lgani uchun o'tkazib yuborildi, ${createdPayments} ta to'lov yozuvi yaratildi.`
  );
}

if (require.main === module) {
  importAll();
}

module.exports = { importAll };
