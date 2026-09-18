export const fmt = (n) => (n || n === 0 ? Number(n).toLocaleString("uz-UZ") : "0");

export const fmtM = (n) => (Number(n || 0) / 1000000).toFixed(2) + "M";

export const today = () => new Date().toISOString().split("T")[0];

export const todayFull = (locale = "uz-UZ") =>
  new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });

export const nowTime = (locale = "uz-UZ") =>
  new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

export const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export function calcLessonFee(monthlyFee, attendedLessons, totalLessons = 12) {
  return Math.round((Number(monthlyFee || 0) / totalLessons) * (Number(attendedLessons) || 0));
}

export function studentPrice(student, course) {
  if (!student) return 0;
  if (student.type === "individual") {
    return student.indPrice || (course?.price || 0) * 2 || 700000;
  }
  return course?.price || 0;
}

export const localeMap = { uz: "uz-UZ", en: "en-US", ru: "ru-RU" };
