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
    if (form.password.length < 6)
      return toast.error("Password needs at least 6 characters");
    mutate(form);
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="auth-dot-pattern" />
        <div className="auth-geo-1" />
        <div className="auth-geo-2" />

        <div className="auth-aside-content">
          <div className="auth-brand-lockup">
            <div className="auth-brand-icon">
              <span style={{ fontFamily: "var(--display)", fontWeight: 800 }}>
                EMS
              </span>
            </div>
            <span className="auth-brand-text">Employee Management System</span>
          </div>

          <div className="auth-hero">
            <h1>Start with the first name on the roll.</h1>
            <p className="auth-subtitle">
              The first account created becomes the admin. Everyone after that
              joins as an employee — or picks up the record HR already made for
              their email.
            </p>
          </div>
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-form-wrap">
          <div className="auth-mobile-header">
            <div className="auth-brand-icon auth-brand-icon--sm">
              <span
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 800,
                  color: "var(--amber-600)",
                  fontSize: 13,
                }}
              >
                M
              </span>
            </div>
            <span className="auth-mobile-title">Muster</span>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-form-header">
              <div className="eyebrow">Create account</div>
            </div>

            <Field label="Full name">
              <input
                className="input"
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="your name"
              />
            </Field>
            <Field label="Work email">
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@company.com"
              />
            </Field>
            <Field label="Password">
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                placeholder="At least 6 characters"
              />
            </Field>

            <button
              className="btn btn-primary btn-block btn-lg"
              disabled={isPending}
            >
              {isPending ? "Creating…" : "Create account"}
            </button>

            <p
              className="small dim"
              style={{ textAlign: "center", marginTop: 8 }}
            >
              Already registered?{" "}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
