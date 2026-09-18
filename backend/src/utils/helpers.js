const { nanoid } = require("nanoid");

const uid = (prefix = "id") => `${prefix}_${nanoid(10)}`;

const today = () => new Date().toISOString().split("T")[0];

const nowTime = () =>
  new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

const currentMonth = () => new Date().toISOString().slice(0, 7);

/**
 * Pro-rated fee for a partial month based on lessons attended.
 * Mirrors the original client logic: monthlyFee / totalLessons * attendedLessons.
 */
function calcLessonFee(monthlyFee, attendedLessons, totalLessons = 12) {
  const fee = (Number(monthlyFee) || 0) / totalLessons;
  return Math.round(fee * (Number(attendedLessons) || 0));
}

module.exports = { uid, today, nowTime, currentMonth, calcLessonFee };
