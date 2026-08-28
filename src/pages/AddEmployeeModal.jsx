import { useState } from "react";
import { todayISO } from "../lib/format";
import { useCreateEmployee } from "../hooks/useEmployees";
import { Modal, Field } from "../ui/Bits";

function AddEmployeeModal({ departments, onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    designation: "",
    department_id: "",
    manager_id: "",
    role: "employee",
    base_salary: "",
    join_date: todayISO(),
  });
  const create = useCreateEmployee();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    create.mutate(form, { onSuccess: onClose });
  }

  return (
      <Modal
        title="Add an employee"
        subtitle="They'll claim this record when they sign up with the same email."
        onClose={onClose}
      >
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <Field label="Full name">
            <input
              className="input"
              required
              value={form.full_name}
              onChange={set("full_name")}
            />
          </Field>
          <Field label="Work email">
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={set("email")}
            />
          </Field>

          <div className="grid g2" style={{ gap: 12 }}>
            <Field label="Department">
              <select
                className="select"
                value={form.department_id}
                onChange={(e) => {
                  const dept = departments.find((d) => d.id === e.target.value);
                  setForm({
                    ...form,
                    department_id: e.target.value,
                    manager_id: dept?.manager_id ?? "",
                  });
                }}
              >
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Designation">
              <input
                className="input"
                value={form.designation}
                onChange={set("designation")}
                placeholder="Associate"
              />
            </Field>
          </div>

          <div className="grid g2" style={{ gap: 12 }}>
            <Field label="Reports to">
              <input
                className="input"
                disabled
                value={
                  departments.find((d) => d.id === form.department_id)?.manager
                    ?.full_name ?? "No manager assigned"
                }
              />
            </Field>
            <Field label="Role">
              <select
                className="select"
                value={form.role}
                onChange={set("role")}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          </div>

          <div className="grid g2" style={{ gap: 12 }}>
            <Field label="Annual salary">
              <input
                className="input"
                type="number"
                min="0"
                value={form.base_salary}
                onChange={set("base_salary")}
                placeholder="600000"
              />
            </Field>
            <Field label="Joining date">
              <input
                className="input"
                type="date"
                value={form.join_date}
                onChange={set("join_date")}
              />
            </Field>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={create.isPending}>
              {create.isPending ? "Adding…" : "Add employee"}
            </button>
          </div>
        </form>
      </Modal>
  );
}

export default AddEmployeeModal;
