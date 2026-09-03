import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  animate,
  createTimeline,
  stagger,
  splitText,
  scrambleText,
  random,
} from "animejs";
import toast from "react-hot-toast";
import { login } from "../services/apiAuth";
import { useAuth } from "../contexts/AuthContext";
import { Field, MusterStrip, MusterLegend } from "../ui/Bits";

const rollingOutVariants = {
  rest: { transform: "translateY(0%)" },
  active: { transform: "translateY(100%)" },
};
const rollingInVariants = {
  rest: { transform: "translateY(-100%)" },
  active: { transform: "translateY(0%)" },
};
const rollingTransition = {
  duration: 0.3,
  ease: [0.338, 0.015, 0.395, 0.959],
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { refreshEmployee } = useAuth();
  const heroTitleRef = useRef(null);
  const welcomeRef = useRef(null);
  const brandTextRef = useRef(null);

  const reduceMotion = useReducedMotion();
  const [labelActive, setLabelActive] = useState(false);
  const labelActiveRef = useRef(false);
  const labelAnimating = useRef(false);
  const labelPending = useRef(null);
  const labelHovered = useRef(false);
  const labelFocused = useRef(false);

  const updateLabelActive = (next) => {
    labelActiveRef.current = next;
    setLabelActive(next);
  };

  const requestLabelActive = (next) => {
    if (reduceMotion) return;

    if (next === labelActiveRef.current) {
      labelPending.current = null;
      return;
    }

    if (labelAnimating.current) {
      labelPending.current = next;
      return;
    }

    labelAnimating.current = true;
    updateLabelActive(next);
  };

  const completeLabelAnimation = () => {
    if (!labelAnimating.current) return;
    labelAnimating.current = false;

    if (
      labelPending.current !== null &&
      labelPending.current !== labelActiveRef.current
    ) {
      const next = labelPending.current;
      labelPending.current = null;
      labelAnimating.current = true;
      updateLabelActive(next);
    } else {
      labelPending.current = null;
    }
  };

  useEffect(() => {
    if (!heroTitleRef.current) return;
    const split = splitText(heroTitleRef.current, {
      words: { wrap: "clip" },
      chars: true,
    });
    const { words, chars } = split;

    const timeline = createTimeline({
      loop: true,
      defaults: { ease: "inOut(3)", duration: 1300 },
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

  useEffect(() => {
    if (!welcomeRef.current) return;
    const anim = animate(welcomeRef.current, {
      innerHTML: scrambleText(),
      loop: true,
      loopDelay: 1300,
    });

    return () => anim.pause();
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
        {/* Gold dot pattern background */}
        <div className="auth-dot-pattern" />

        {/* Abstract geometric shapes (hexagonal rotated elements from Login Page 1) */}
        <div className="auth-geo-1" />
        <div className="auth-geo-2" />

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
            <motion.span
              ref={brandTextRef}
              className="auth-brand-text"
              animate={
                reduceMotion
                  ? undefined
                  : { backgroundPosition: ["200% center", "-200% center"] }
              }
              transition={{
                duration: 2.5,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              Employee Management System
            </motion.span>
          </div>

          {/* Hero Value Prop */}
          <div className="auth-hero">
            <h1 ref={heroTitleRef}>
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
              <h1 ref={welcomeRef} style={{ marginTop: 6 }}>
                Welcome back
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
            </Field>

            <motion.button
              className="btn btn-primary btn-block btn-lg"
              disabled={isPending}
              type="submit"
              onHoverStart={() => {
                labelHovered.current = true;
                requestLabelActive(true);
              }}
              onHoverEnd={() => {
                labelHovered.current = false;
                requestLabelActive(labelFocused.current);
              }}
              onFocus={() => {
                labelFocused.current = true;
                requestLabelActive(true);
              }}
              onBlur={() => {
                labelFocused.current = false;
                requestLabelActive(labelHovered.current);
              }}
            >
              {isPending ? (
                "Signing in…"
              ) : (
                <span className="label-window">
                  <motion.span
                    className="label-copy"
                    variants={rollingOutVariants}
                    initial="rest"
                    animate={labelActive ? "active" : "rest"}
                    onAnimationComplete={completeLabelAnimation}
                    transition={rollingTransition}
                  >
                    Sign in to Dashboard
                  </motion.span>
                  <motion.span
                    className="label-copy label-copy--incoming"
                    variants={rollingInVariants}
                    initial="rest"
                    animate={labelActive ? "active" : "rest"}
                    transition={rollingTransition}
                  >
                    Sign in to Dashboard
                  </motion.span>
                </span>
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
