import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useEmployees, useCreateEmployee } from "../hooks/useEmployees";
import { useDepartments } from "../hooks/useDepartments";
import {
  Badge,
  Empty,
  Field,
  Modal,
  Person,
  TableSkeleton,
  ErrorBox,
} from "../ui/Bits";
import { money, dateOnly, todayISO } from "../lib/format";
import AddEmployeeModal from "./AddEmployeeModal";
import { useAuth } from "../contexts/AuthContext";

export default function Employees() {
  const { isAdmin, isManager, employee } = useAuth();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isLoading, isPlaceholderData, error } = useEmployees({
    search,
    departmentId: isManager ? "" : departmentId,
    managerId: isManager ? (employee?.id ?? "") : "",
    role,
  });
  const { data: departments } = useDepartments({});
  const managedDepartments = isManager
    ? (departments ?? []).filter((d) => d.manager_id === employee?.id)
    : [];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">
            {isAdmin ? "Administration" : "My department"}
          </div>
          <h1>Employees</h1>
        </div>
        {isAdmin && (
          <div className="actions">
            <button className="btn btn-primary" onClick={() => setOpen(true)}>
              <Plus size={15} /> Add employee
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="row" style={{ flex: 1 }}>
            <div
              className="input-icon-wrap"
              style={{ flex: "1 1 220px", maxWidth: 300 }}
            >
              <Search size={15} className="input-icon" />
              <input
                className="input input--icon"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {isManager ? (
              <select className="select" style={{ width: 180 }} value="" disabled>
                <option value="">
                  {managedDepartments.length
                    ? managedDepartments.map((d) => d.name).join(", ")
                    : "No department assigned"}
                </option>
              </select>
            ) : (
              <select
                className="select"
                style={{ width: 180 }}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">All departments</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
            {isManager ? (
              <select
                className="select"
                style={{ width: 150 }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">All roles</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            ) : (
              <select
                className="select"
                style={{ width: 150 }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            )}
          </div>
          <div className="actions">
            <span className="mono small dim">{data?.length ?? 0} people</span>
          </div>
        </div>

        {error ? (
          <ErrorBox error={error} />
        ) : isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : !data?.length ? (
          <Empty title="No matches">
            Try a different search or clear the filters.
          </Empty>
        ) : (
          <div
            className="table-wrap"
            style={{ opacity: isPlaceholderData ? 0.6 : 1 }}
          >
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Reports to</th>
                  <th>Role</th>
                  <th className="num">Salary</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {isAdmin ? (
                        <Link to={`/employees/${e.id}`}>
                          <Person
                            name={e.full_name}
                            sub={e.employee_code ?? e.email}
                          />
                        </Link>
                      ) : (
                        <Person
                          name={e.full_name}
                          sub={e.employee_code ?? e.email}
                        />
                      )}
                    </td>
                    <td className="small muted">{e.department?.name ?? "—"}</td>
                    <td className="small muted">{e.designation ?? "—"}</td>
                    <td className="small muted">
                      {e.role === "manager"
                        ? "Admin"
                        : e.role === "admin"
                        ? "—"
                        : (e.manager?.full_name ?? "—")}
                    </td>
                    <td>
                      <Badge kind={e.role}>{e.role}</Badge>
                    </td>
                    <td className="num">{money(e.base_salary)}</td>
                    <td className="mono small dim">{dateOnly(e.join_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && open && (
        <AddEmployeeModal
          departments={departments ?? []}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
