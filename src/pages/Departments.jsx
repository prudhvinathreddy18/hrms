import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "../hooks/useDepartments";
import { useEmployees } from "../hooks/useEmployees";
import { Empty, Field, Modal, Person, Spinner, ErrorBox } from "../ui/Bits";

export default function Departments() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useDepartments();
  const { data: employees } = useEmployees();
  const update = useUpdateDepartment();
  const remove = useDeleteDepartment();

  const headcount = (deptId) =>
    (employees ?? []).filter((e) => e.department_id === deptId && e.is_active).length;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Administration</div>
          <h1>Departments</h1>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={15} /> New department
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Cost centres</h2>
          <div className="actions"><span className="mono small dim">{data?.length ?? 0} total</span></div>
        </div>

        {error ? (
          <ErrorBox error={error} />
        ) : isLoading ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="No departments yet">Create one, then assign employees to it.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Department</th>
                  <th className="num">Headcount</th>
                  <th>Manager</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      {d.description && <div className="small dim">{d.description}</div>}
                    </td>
                    <td className="num">{headcount(d.id)}</td>
                    <td style={{ minWidth: 200 }}>
                      <select
                        className="select"
                        value={d.manager_id ?? ""}
                        onChange={(e) =>
                          update.mutate({ id: d.id, manager_id: e.target.value || null })
                        }
                      >
                        <option value="">No manager</option>
                        {employees
                          ?.filter((e) => e.role !== "employee")
                          .map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                      </select>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (headcount(d.id) > 0)
                            return alert("Move its employees elsewhere before removing this department.");
                          if (confirm(`Remove ${d.name}?`)) remove.mutate(d.id);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <NewDeptModal onClose={() => setOpen(false)} />}
    </>
  );
}

function NewDeptModal({ onClose }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const create = useCreateDepartment();

  function submit(e) {
    e.preventDefault();
    create.mutate(form, { onSuccess: onClose });
  }

  return (
    <Modal title="New department" subtitle="Give it a name people will recognise." onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Name">
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Engineering" />
        </Field>
        <Field label="Description">
          <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this team owns" />
        </Field>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create department"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
