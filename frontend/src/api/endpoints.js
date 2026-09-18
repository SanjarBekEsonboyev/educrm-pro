import client from "./client";

export const AuthApi = {
  login: (login, password) => client.post("/auth/login", { login, password }).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
};

export const UsersApi = {
  list: () => client.get("/users").then((r) => r.data),
  create: (data) => client.post("/users", data).then((r) => r.data),
  update: (id, data) => client.put(`/users/${id}`, data).then((r) => r.data),
  addBonus: (id, amount) => client.post(`/users/${id}/bonus`, { amount }).then((r) => r.data),
  remove: (id) => client.delete(`/users/${id}`),
};

export const CoursesApi = {
  list: () => client.get("/courses").then((r) => r.data),
  create: (data) => client.post("/courses", data).then((r) => r.data),
  update: (id, data) => client.put(`/courses/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/courses/${id}`),
};

export const GroupsApi = {
  list: () => client.get("/groups").then((r) => r.data),
  create: (data) => client.post("/groups", data).then((r) => r.data),
  confirm: (id, startDate) => client.post(`/groups/${id}/confirm`, { startDate }).then((r) => r.data),
  remove: (id) => client.delete(`/groups/${id}`),
};

export const StudentsApi = {
  list: () => client.get("/students").then((r) => r.data),
  get: (id) => client.get(`/students/${id}`).then((r) => r.data),
  create: (data) => client.post("/students", data).then((r) => r.data),
  pay: (id, amount, note) => client.post(`/students/${id}/pay`, { amount, note }).then((r) => r.data),
  leave: (id, reason, attendedLessons) =>
    client.post(`/students/${id}/leave`, { reason, attendedLessons }).then((r) => r.data),
  markAttendanceBulk: (date, records) =>
    client.post("/students/attendance/bulk", { date, records }).then((r) => r.data),
};

export const AdmissionsApi = {
  list: () => client.get("/admissions").then((r) => r.data),
  create: (data) => client.post("/admissions", data).then((r) => r.data),
  approve: (id) => client.post(`/admissions/${id}/approve`).then((r) => r.data),
  reject: (id) => client.post(`/admissions/${id}/reject`),
};

export const PaymentsApi = {
  list: () => client.get("/payments").then((r) => r.data),
  receipt: (id) => client.get(`/payments/${id}/receipt`).then((r) => r.data),
};

export const FinesApi = {
  list: () => client.get("/fines").then((r) => r.data),
  create: (data) => client.post("/fines", data).then((r) => r.data),
};

export const ExpensesApi = {
  list: () => client.get("/expenses").then((r) => r.data),
  create: (data) => client.post("/expenses", data).then((r) => r.data),
};

export const SmsApi = {
  log: () => client.get("/sms/log").then((r) => r.data),
  send: (recipients, type) => client.post("/sms/send", { recipients, type }).then((r) => r.data),
};
