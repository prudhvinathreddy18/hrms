import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { updatePassword } from "../services/apiAuth";
import { Field } from "../ui/Bits";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  // The reset-link redirect carries a recovery token in the URL, which the
  // Supabase client exchanges for a session (event: PASSWORD_RECOVERY) either
  // before or shortly after this page mounts — cover both cases.
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: updatePassword,
    onSuccess: async () => {
      await supabase.auth.signOut();
      setDone(true);
      toast.success("Password updated");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    },
    onError: (e) => toast.error(e.message),
  });

  function submit(e) {
    e.preventDefault();
    if (!password || password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");
    mutate({ password });
  }

  return (
    <div className="auth">
      <div className="auth-main" style={{ gridColumn: "1 / -1" }}>
        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={submit}>
            <div className="auth-form-header">
              <div className="eyebrow">Reset password</div>
              <h1 style={{ marginTop: 6 }}>Choose a new password</h1>
              <p className="auth-form-sub">
                {!ready && !done && "Verifying your reset link…"}
                {ready && !done && "Enter and confirm your new password."}
                {done && "Done — redirecting you to sign in."}
              </p>
            </div>

            {ready && !done && (
              <>
                <Field label="New password">
                  <input
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </Field>

                <Field label="Confirm password">
                  <input
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </Field>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? "Updating…" : "Update password"}
                </button>
              </>
            )}

            {!ready && !done && (
              <p className="auth-form-sub">
                If this takes more than a few seconds, your link may have
                expired.{" "}
                <Link to="/forgot-password" className="auth-forgot-link">
                  Request a new one
                </Link>
                .
              </p>
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
