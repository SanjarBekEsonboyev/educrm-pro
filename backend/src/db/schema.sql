CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('admin','director','teacher')),
  name          TEXT NOT NULL,
  login         TEXT NOT NULL UNIQUE,
  pass_hash     TEXT NOT NULL,
  phone         TEXT,
  subject_id    TEXT,
  salary_type   TEXT DEFAULT 'fixed',
  salary_value  REAL DEFAULT 0,
  bonuses       REAL DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courses (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#4f8fff',
  icon       TEXT DEFAULT '📚',
  price      INTEGER NOT NULL DEFAULT 0,
  duration   TEXT,
  desc       TEXT,
  min_group  INTEGER DEFAULT 5,
  max_group  INTEGER DEFAULT 12,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS groups_t (
  id            TEXT PRIMARY KEY,
  course_id     TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  teacher_id    TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','active','closed')),
  days          TEXT DEFAULT 'MWF',
  start_date    TEXT,
  max_size      INTEGER DEFAULT 12,
  min_group     INTEGER DEFAULT 5,
  opened_date   TEXT,
  confirmed_by  TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL,
  course_id        TEXT REFERENCES courses(id) ON DELETE SET NULL,
  group_id         TEXT REFERENCES groups_t(id) ON DELETE SET NULL,
  type             TEXT NOT NULL DEFAULT 'group' CHECK (type IN ('group','individual')),
  days             TEXT DEFAULT 'MWF',
  join_date        TEXT,
  status           TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','active','left')),
  pay_start        TEXT,
  paid             INTEGER NOT NULL DEFAULT 0,
  ind_price        INTEGER,
  note             TEXT,
  leave_reason     TEXT,
  leave_date       TEXT,
  attended_lessons INTEGER,
  refund           INTEGER,
  created_at       TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attendance (
  id         TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date       TEXT NOT NULL,
  value      TEXT NOT NULL CHECK (value IN ('P','L','A')),
  marked_by  TEXT,
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS admissions (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  course_id  TEXT REFERENCES courses(id) ON DELETE SET NULL,
  type       TEXT DEFAULT 'group',
  days       TEXT DEFAULT 'MWF',
  req_date   TEXT,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  note       TEXT,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id         TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  date       TEXT NOT NULL,
  month      TEXT,
  note       TEXT,
  by_user_id TEXT
);

CREATE TABLE IF NOT EXISTS fines (
  id         TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  reason     TEXT,
  date       TEXT NOT NULL,
  by_user_id TEXT
);

CREATE TABLE IF NOT EXISTS expenses (
  id     TEXT PRIMARY KEY,
  title  TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date   TEXT NOT NULL,
  cat    TEXT DEFAULT 'other'
);

CREATE TABLE IF NOT EXISTS sms_log (
  id      TEXT PRIMARY KEY,
  phone   TEXT NOT NULL,
  msg     TEXT NOT NULL,
  type    TEXT DEFAULT 'custom',
  sent_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_students_group ON students(group_id);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_groups_teacher ON groups_t(teacher_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fines_teacher ON fines(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
