import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { signup } from "../services/apiAuth";
import { Field } from "../ui/Bits";

export default function Signup() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Account created — sign in to continue");
      navigate("/login", { replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password needs at least 6 characters");
    mutate(form);
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div className="brand-name">Muster</div>
        </div>
        <div>
          <h1>Start with the first name on the roll.</h1>
          <p>
            The first account created becomes the admin. Everyone after that
            joins as an employee — or picks up the record HR already made for
            their email.
          </p>
        </div>
        <span />
      </aside>

      <div className="auth-main">
        <form className="auth-form" onSubmit={submit}>
          <div>
            <div className="eyebrow">Create account</div>
            <h1 style={{ marginTop: 6 }}>Join Muster</h1>
          </div>

          <Field label="Full name">
            <input className="input" value={form.fullName} onChange={set("fullName")} placeholder="Prudhvi Nadh Reddy" />
          </Field>
          <Field label="Work email">
            <input className="input" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" />
          </Field>
          <Field label="Password">
            <input className="input" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="At least 6 characters" />
          </Field>

          <button className="btn btn-primary btn-block" disabled={isPending}>
            {isPending ? "Creating…" : "Create account"}
          </button>

          <p className="small dim" style={{ textAlign: "center" }}>
            Already registered? <Link to="/login" style={{ color: "var(--pine-700)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
