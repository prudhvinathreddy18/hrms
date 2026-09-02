import { useCallback, useState } from "react";
import { AnimatePresence, motion, resize } from "motion/react";
import { todayISO } from "../lib/format";
import { useCreateEmployee } from "../hooks/useEmployees";
import { Modal, Field } from "../ui/Bits";

/* Reveals `children` with an animated height, measured live via Motion's
 * resize() so the modal grows smoothly no matter what's inside — used to
 * stage the form so each section only appears once the one before it is
 * filled in. */
function RevealStep({ open, children }) {
  const [height, setHeight] = useState(0);

  const measureRef = useCallback((el) => {
    if (!el) return;
    return resize(el, (_, { height }) => setHeight(height));
  }, []);

  return (
    <motion.div
      animate={{ height: open ? height : 0 }}
      style={{ overflow: "hidden", willChange: "height" }}
    >
      <div ref={measureRef}>
        <AnimatePresence mode="popLayout">
          {open && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                paddingTop: 14,
              }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

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
  const [showEmail, setShowEmail] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const create = useCreateEmployee();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    if (!showEmail) {
      setShowEmail(true);
      return;
    }
    if (!showDetails) {
      setShowDetails(true);
      return;
    }
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
            autoFocus
            value={form.full_name}
            onChange={set("full_name")}
          />
        </Field>

        <RevealStep open={showEmail}>
          <Field label="Work email">
            <input
              className="input"
              type="email"
              required
              autoFocus={showEmail}
              value={form.email}
              onChange={set("email")}
            />
          </Field>
        </RevealStep>

        <RevealStep open={showDetails}>
          <div className="grid g2" style={{ gap: 12 }}>
            <Field label="Department">
              <select
                className="select"
                autoFocus={showDetails}
                value={form.department_id}
                onChange={(e) => {
                  const dept = departments.find((d) => d.id === e.target.value);
                  setForm({
                    ...form,
                    department_id: e.target.value,
                    manager_id:
                      form.role === "manager" || form.role === "admin"
                        ? ""
                        : (dept?.manager_id ?? ""),
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
                  form.role === "manager"
                    ? "Admin"
                    : form.role === "admin"
                      ? "—"
                      : (departments.find((d) => d.id === form.department_id)
                          ?.manager?.full_name ?? "No manager assigned")
                }
              />
            </Field>
            <Field label="Role">
              <select
                className="select"
                value={form.role}
                onChange={(e) => {
                  const role = e.target.value;
                  const dept = departments.find(
                    (d) => d.id === form.department_id,
                  );
                  setForm({
                    ...form,
                    role,
                    manager_id:
                      role === "manager" || role === "admin"
                        ? ""
                        : (dept?.manager_id ?? ""),
                  });
                }}
              >
                <option value="employee">Employee</option>
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
        </RevealStep>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={create.isPending}>
            {create.isPending
              ? "Adding…"
              : !showEmail || !showDetails
                ? "Continue"
                : "Add employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddEmployeeModal;
