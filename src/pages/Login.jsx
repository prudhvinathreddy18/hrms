import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login } from "../services/apiAuth";
import { useAuth } from "../contexts/AuthContext";
import { Field } from "../ui/Bits";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { refreshEmployee } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await refreshEmployee();
      navigate("/dashboard", { replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  function submit(e) {
    e.preventDefault();
    if (!email || !password)
      return toast.error("Enter your email and password");
    mutate({ email, password });
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        {/* Gold dot pattern background */}
        <div className="auth-dot-pattern" />

        {/* Abstract geometric shapes (hexagonal rotated elements from Login Page 1) */}
        <div className="auth-geo-1" />
        <div className="auth-geo-2" />

        <div className="auth-aside-content">
          {/* Header Brand */}
          <div className="auth-brand-lockup">
            <span className="auth-brand-text">Employee Management System</span>
          </div>

          {/* Hero Value Prop */}
          <div className="auth-hero">
            <h1>
              Every day,
              <br />
              on the record.
            </h1>
            <p className="auth-subtitle">
              The trusted steward for enterprise workforce data, ensuring
              accuracy, compliance, and clarity at scale.
            </p>

            {/* Stat Cards */}
            <div className="auth-cards">
              <div className="glass-card">
                <div className="glass-card-icon-wrap glass-card-icon-wrap--gold">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#feb957"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="rgba(254, 185, 87, 0.15)"
                    />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <span className="glass-card-label">System Health</span>
                  <span className="glass-card-value">99.9% Uptime</span>
                </div>
              </div>

              <div className="glass-card glass-card--offset">
                <div className="glass-card-icon-wrap glass-card-icon-wrap--teal">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a1d0c6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <span className="glass-card-label">Active Personnel</span>
                  <span className="glass-card-value">12,450</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Login Form Panel */}
      <div className="auth-main">
        <div className="auth-form-wrap">
          {/* Mobile Brand Header */}
          <div className="auth-mobile-header">
            <div className="auth-brand-icon auth-brand-icon--sm">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3L4.5 7.2V12.8C4.5 17.5 7.7 21.8 12 23C16.3 21.8 19.5 17.5 19.5 12.8V7.2L12 3Z"
                  stroke="#a9700f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="auth-mobile-title">EMS</span>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-form-header">
              <div
                className="eyebrow"
                style={{ color: "#a9700f", fontWeight: 700 }}
              >
                Sign in
              </div>
              <h1 style={{ marginTop: 6, color: "#10302b" }}>Welcome back</h1>
              <p className="auth-form-sub">
                Access your administrative dashboard.
              </p>
            </div>

            <Field label="Work email">
              <div className="input-icon-wrap">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  className="input input--icon"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="input-icon-wrap">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  className="input input--icon"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div style={{ textAlign: "right", marginTop: 4 }}>
                <Link
                  to="#"
                  className="small"
                  style={{ color: "#a9700f", fontWeight: 600 }}
                >
                  Forgot password?
                </Link>
              </div>
            </Field>

            <button
              className="btn btn-primary btn-block btn-lg"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Signing in…" : "Sign in to Dashboard"}
            </button>

            <p
              className="small dim"
              style={{ textAlign: "center", marginTop: 8 }}
            >
              No account yet?{" "}
              <Link to="/signup" style={{ color: "#a9700f", fontWeight: 600 }}>
                Request access
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
