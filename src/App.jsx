import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import { Spinner } from "./ui/Bits";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const EmployeeDetail = lazy(() => import("./pages/EmployeeDetail"));
const Departments = lazy(() => import("./pages/Departments"));
const Leave = lazy(() => import("./pages/Leave"));
const LeaveApprovals = lazy(() => import("./pages/LeaveApprovals"));
const Attendance = lazy(() => import("./pages/Attendance"));
const TeamAttendance = lazy(() => import("./pages/TeamAttendance"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Spinner />}>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* everyone */}
              <Route path="/leave" element={<Leave />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/profile" element={<Profile />} />

              {/* manager + admin */}
              <Route
                path="/leave/approvals"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <LeaveApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance/team"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <TeamAttendance />
                  </ProtectedRoute>
                }
              />

              {/* manager (read-only, own department) + admin */}
              <Route
                path="/employees"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <Employees />
                  </ProtectedRoute>
                }
              />

              {/* admin only — managers get read-only rows on the list, no detail/edit access */}
              <Route
                path="/employees/:id"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <EmployeeDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/departments"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <Departments />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            fontSize: 13.5,
            fontFamily: "IBM Plex Sans, system-ui, sans-serif",
            borderRadius: 8,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow)",
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
