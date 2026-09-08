import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { requestPasswordReset } from "../services/apiAuth";
import { Field } from "../ui/Bits";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => setSent(true),
    onError: (e) => toast.error(e.message),
  });

  function submit(e) {
    e.preventDefault();
    if (!email) return toast.error("Enter your email");
    mutate({ email });
  }

  return (
    <div className="auth">
      <div className="auth-main" style={{ gridColumn: "1 / -1" }}>
        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={submit}>
            <div className="auth-form-header">
              <div className="eyebrow">Reset password</div>
              <h1 style={{ marginTop: 6 }}>Forgot your password?</h1>
              <p className="auth-form-sub">
                {sent
                  ? "Check your inbox for a link to reset your password."
                  : "Enter your work email and we'll send you a reset link."}
              </p>
            </div>

            {!sent && (
              <>
                <Field label="Work email">
                  <input
                    className="input"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </Field>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? "Sending…" : "Send reset link"}
                </button>
              </>
            )}

            <Link to="/login" className="auth-forgot-link" style={{ marginTop: 16 }}>
              Back to sign in
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
