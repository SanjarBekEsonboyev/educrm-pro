import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  UsersApi, CoursesApi, GroupsApi, StudentsApi, AdmissionsApi,
  PaymentsApi, FinesApi, ExpensesApi, SmsApi,
} from "../api/endpoints";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

const EMPTY = {
  users: [], courses: [], groups: [], students: [], admissions: [],
  payments: [], fines: [], expenses: [], smsLog: [],
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [db, setDb] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const isStaff = user.role === "admin" || user.role === "director";
      const [courses, groups, students, fines] = await Promise.all([
        CoursesApi.list(), GroupsApi.list(), StudentsApi.list(), FinesApi.list(),
      ]);
      let users = [], admissions = [], payments = [], expenses = [], smsLog = [];
      if (isStaff) {
        [users, admissions, payments, expenses] = await Promise.all([
          UsersApi.list(), AdmissionsApi.list(), PaymentsApi.list(), ExpensesApi.list(),
        ]);
        if (user.role === "admin") {
          smsLog = await SmsApi.log().catch(() => []);
        }
      }
      setDb({ users, courses, groups, students, admissions, payments, fines, expenses, smsLog });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(() => ({ db, loading, error, refresh: load, setDb }), [db, loading, error, load]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
