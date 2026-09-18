const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("./index");
const { uid } = require("../utils/helpers");

function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  db.exec(schema);
}

function isEmpty() {
  const row = db.prepare("SELECT COUNT(*) AS c FROM users").get();
  return row.c === 0;
}

function hash(pw) {
  return bcrypt.hashSync(pw, 10);
}

function seed() {
  // Clean-slate seed: only the two login accounts needed to operate the
  // system (admin/director) are created here. All course/group/teacher/
  // student/payment data comes exclusively from the real import
  // (see src/db/import-sentyabr.js) — no demo/placeholder business data
  // is inserted, per explicit instruction.
  const insertUser = db.prepare(`
    INSERT INTO users (id, role, name, login, pass_hash, phone, subject_id, salary_type, salary_value, bonuses)
    VALUES (@id,@role,@name,@login,@pass_hash,@phone,@subject_id,@salary_type,@salary_value,@bonuses)
  `);

  const tx = db.transaction(() => {
    insertUser.run({ id: "admin1", role: "admin", name: "Admin", login: "admin", pass_hash: hash("admin123"), phone: "+998900000000", subject_id: null, salary_type: "fixed", salary_value: 0, bonuses: 0 });
    insertUser.run({ id: "dir1", role: "director", name: "Murod Direktor", login: "director", pass_hash: hash("dir123"), phone: "+998901111111", subject_id: null, salary_type: "fixed", salary_value: 0, bonuses: 0 });
  });

  tx();
}

function init() {
  migrate();
  if (isEmpty() || process.argv.includes("--force-seed")) {
    seed();
    // eslint-disable-next-line no-console
    console.log("✅ Database migrated & seeded.");
  } else {
    // eslint-disable-next-line no-console
    console.log("✅ Database migrated (already has data, skipped seed).");
  }
}

if (require.main === module) {
  init();
}

module.exports = { init, uid };
