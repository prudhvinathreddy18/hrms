import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createTimeline, stagger, splitText, random } from "animejs";
import toast from "react-hot-toast";
import { login } from "../services/apiAuth";
import { useAuth } from "../contexts/AuthContext";
import { Field, MusterStrip, MusterLegend } from "../ui/Bits";
import { GlyphMatrix } from "@/components/ui/glyph-matrix";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TextAnimate } from "@/components/ui/text-animate";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { refreshEmployee } = useAuth();
  const heroTitleRef = useRef(null);
  const [welcomeTick, setWelcomeTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setWelcomeTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!heroTitleRef.current) return;
    const split = splitText(heroTitleRef.current, {
      words: { wrap: "clip" },
      chars: true,
    });
    const { words, chars } = split;

    const timeline = createTimeline({
      loop: true,
      defaults: { ease: "inOut(3)", duration: 2000 },
    })
      .add(
        words,
        { y: [($el) => (+$el.dataset.line % 2 ? "100%" : "-100%"), "0%"] },
        stagger(125),
      )
      .add(
        chars,
        { y: ($el) => (+$el.dataset.line % 2 ? "100%" : "-100%") },
        stagger(10, { from: "random" }),
      )
      .init();

    return () => {
      timeline.pause();
      split.revert();
    };
  }, []);

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
        {/* Green glyph matrix background */}
        <GlyphMatrix
          glyphs="01·•+*/\<>="
          cellSize={14}
          mutationRate={0.04}
          interval={90}
          fadeBottom={0.6}
          color="#80ff00"
          style={{ position: "absolute", inset: 0 }}
        />

        {/* Abstract geometric shapes (hexagonal rotated elements from Login Page 1) */}

        <div className="auth-aside-content">
          {/* Header Brand */}
          <div className="auth-brand-lockup">
            <div className="auth-brand-icon">
              <span
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 800,
                  color: "#80ff00c1",
                }}
              >
                EMS
              </span>
            </div>
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
              Clock in, apply for leave, and keep one shared roll of who worked
              when — the same record your whole team checks.
            </p>

            {/* Signature: a real muster strip, not a stat card */}
          </div>
        </div>
      </aside>

      {/* Right Login Form Panel */}
      <div className="auth-main">
        <div className="auth-form-wrap">
          {/* Mobile Brand Header */}
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
              <div className="eyebrow">Sign in</div>
              <h1 style={{ marginTop: 6 }}>
                <TextAnimate
                  key={welcomeTick}
                  animation="blurInUp"
                  by="character"
                  once
                >
                  Welcome back
                </TextAnimate>
              </h1>
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
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </Field>

            <ShimmerButton
              type="submit"
              disabled={isPending}
              shimmerColor="#80ff00"
              shimmerSize="0.1em"
              background="rgba(8, 24, 20, 1)"
              borderRadius="10px"
              className="w-full shadow-2xl disabled:opacity-60"
            >
              <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-base">
                {isPending ? "Signing in…" : "Sign in to Dashboard"}
              </span>
            </ShimmerButton>
          </form>
        </div>
      </div>
    </div>
  );
}
