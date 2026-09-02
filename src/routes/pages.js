export const pageImporters = {
  login: () => import("../pages/Login"),
  dashboard: () => import("../pages/Dashboard"),
  employees: () => import("../pages/Employees"),
  employeeDetail: () => import("../pages/EmployeeDetail"),
  departments: () => import("../pages/Departments"),
  leave: () => import("../pages/Leave"),
  leaveApprovals: () => import("../pages/LeaveApprovals"),
  attendance: () => import("../pages/Attendance"),
  teamAttendance: () => import("../pages/TeamAttendance"),
  profile: () => import("../pages/Profile"),
  notFound: () => import("../pages/NotFound"),
};

export const pathToImporterKey = {
  "/dashboard": "dashboard",
  "/leave": "leave",
  "/leave/approvals": "leaveApprovals",
  "/attendance": "attendance",
  "/attendance/team": "teamAttendance",
  "/profile": "profile",
  "/employees": "employees",
  "/departments": "departments",
};

export function preloadPage(path) {
  const key = pathToImporterKey[path];
  if (key) pageImporters[key]();
}
