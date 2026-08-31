import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { getMyEmployee } from "../services/apiAuth";
import { employeeKeys } from "../hooks/useEmployees";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        try {
          setEmployee(await getMyEmployee());
        } catch {
          setEmployee(null);
        }
      }
      setLoading(false);
    }
    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!active) return;
      setSession(s);
      if (s) {
        try {
          setEmployee(await getMyEmployee());
        } catch {
          setEmployee(null);
        }
      } else {
        setEmployee(null);
        queryClient.clear();
      }
      if (event !== "INITIAL_SESSION") setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  // Push live changes (e.g. an admin edit in another tab/device) into this
  // client's cache instead of waiting for a window refocus or reload.
  const isAuthenticated = Boolean(session);
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employees" },
        () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "departments" },
        () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, queryClient]);

  async function refreshEmployee() {
    setEmployee(await getMyEmployee());
  }

  const role = employee?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        employee,
        loading,
        role,
        isAdmin: role === "admin",
        isManager: role === "manager",
        canApprove: role === "admin" || role === "manager",
        isAuthenticated,
        refreshEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
