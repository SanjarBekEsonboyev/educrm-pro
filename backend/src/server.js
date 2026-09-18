require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { init } = require("./db/init");
init(); // migrate + seed on boot if empty

const { router: authRouter } = require("./routes/auth.routes");
const { router: usersRouter } = require("./routes/users.routes");
const { router: coursesRouter } = require("./routes/courses.routes");
const { router: groupsRouter } = require("./routes/groups.routes");
const { router: studentsRouter } = require("./routes/students.routes");
const { router: admissionsRouter } = require("./routes/admissions.routes");
const { router: paymentsRouter } = require("./routes/payments.routes");
const { router: finesRouter } = require("./routes/fines.routes");
const { router: expensesRouter } = require("./routes/expenses.routes");
const { router: smsRouter } = require("./routes/sms.routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/students", studentsRouter);
app.use("/api/admissions", admissionsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/fines", finesRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/sms", smsRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server xatoligi", detail: process.env.NODE_ENV === "development" ? err.message : undefined });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 EduCRM Pro API running on http://localhost:${PORT}`);
});
