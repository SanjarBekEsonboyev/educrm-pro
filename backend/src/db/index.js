const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const DB_FILE = process.env.DB_FILE || "./data/educrm.db";
const resolved = path.resolve(process.cwd(), DB_FILE);
fs.mkdirSync(path.dirname(resolved), { recursive: true });

const db = new DatabaseSync(resolved);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// better-sqlite3-compatible transaction() helper, since node:sqlite's
// DatabaseSync has no built-in equivalent. Wraps fn in BEGIN/COMMIT,
// rolling back on any thrown error — same call pattern as before:
//   const tx = db.transaction(() => { ...statements... });
//   tx();
db.transaction = function transaction(fn) {
  return function runInTransaction(...args) {
    db.exec("BEGIN");
    try {
      const result = fn(...args);
      db.exec("COMMIT");
      return result;
    } catch (err) {
      try {
        db.exec("ROLLBACK");
      } catch (_) {
        // ignore rollback failure (e.g. no active transaction)
      }
      throw err;
    }
  };
};

module.exports = db;
