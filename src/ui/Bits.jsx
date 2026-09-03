import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Spinner({
  title = "Configuring your account...",
  subtitle = "Please wait while we prepare everything for you",
  size = "sm",
  className,
  ...props
}) {
  const sizeConfig = {
    sm: {
      container: "size-20",
      titleClass: "text-sm/tight font-medium",
      subtitleClass: "text-xs/relaxed",
      spacing: "space-y-2",
      maxWidth: "max-w-48",
    },
    md: {
      container: "size-32",
      titleClass: "text-base/snug font-medium",
      subtitleClass: "text-sm/relaxed",
      spacing: "space-y-3",
      maxWidth: "max-w-56",
    },
    lg: {
      container: "size-40",
      titleClass: "text-lg/tight font-semibold",
      subtitleClass: "text-base/relaxed",
      spacing: "space-y-4",
      maxWidth: "max-w-64",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-8 p-8",
        className,
      )}
      {...props}
    >
      {/* Enhanced Monochrome Loader */}
      <motion.div
        animate={{
          scale: [1, 1.02, 1],
        }}
        className={cn("relative", config.container)}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.4, 0, 0.6, 1],
        }}
      >
        {/* Outer elegant ring with shimmer */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(16, 134, 111) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.8,
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Primary animated ring with gradient */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(16, 134, 111) 120deg, rgba(16, 134, 111, 0.5) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Secondary elegant ring - counter rotation */}
        <motion.div
          animate={{
            rotate: [0, -360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(16, 134, 111, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.35,
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Accent particles */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 270deg, transparent 0deg, rgba(16, 134, 111, 0.4) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.5,
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Dark mode variants */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(125, 196, 179) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.8,
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 120deg, rgba(255, 255, 255, 0.5) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        <motion.div
          animate={{
            rotate: [0, -360],
          }}
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(125, 196, 179, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.35,
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 270deg, transparent 0deg, rgba(125, 196, 179, 0.4) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.5,
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Enhanced Typography with Breathing Animation */}
      <motion.div
        animate={{
          opacity: 1,
          y: 0,
        }}
        className={cn("text-center", config.spacing, config.maxWidth)}
        initial={{ opacity: 0, y: 12 }}
        transition={{
          delay: 0.4,
          duration: 1,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {/* Clean title with subtle animation */}
        <motion.h1
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={cn(
            config.titleClass,
            "font-medium text-black/90 leading-[1.15] tracking-[-0.02em] antialiased dark:text-white/90",
          )}
          initial={{ opacity: 0, y: 12 }}
          transition={{
            delay: 0.6,
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.span
            animate={{
              opacity: [0.9, 0.7, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: [0.4, 0, 0.6, 1],
            }}
          >
            {title}
          </motion.span>
        </motion.h1>

        {/* Clean subtitle with subtle animation */}
        <motion.p
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={cn(
            config.subtitleClass,
            "font-normal text-black/60 leading-[1.45] tracking-[-0.01em] antialiased dark:text-white/60",
          )}
          initial={{ opacity: 0, y: 8 }}
          transition={{
            delay: 0.8,
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.span
            animate={{
              opacity: [0.6, 0.4, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: [0.4, 0, 0.6, 1],
            }}
          >
            {subtitle}
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p className="small">{children}</p>
    </div>
  );
}

export function ErrorBox({ error }) {
  return (
    <div className="card-body">
      <p className="err">{error?.message ?? "Something went wrong."}</p>
    </div>
  );
}

function HeartParticles({ anchorRef, color }) {
  const rect = anchorRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    <AnimatePresence>
      {[...Array(6)].map((_, i) => (
        <motion.svg
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 28 + 10)],
            y: [0, -Math.random() * 34 - 14],
          }}
          className="pointer-events-none fixed z-50"
          height="18"
          initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
          key={i}
          style={{ left: centerX, top: centerY, color }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
          viewBox="0 0 24 24"
          width="18"
        >
          <path
            d="M12 21s-7.5-4.7-9.5-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.5 12c-2 4.3-9.5 9-9.5 9z"
            fill="currentColor"
          />
        </motion.svg>
      ))}
    </AnimatePresence>
  );
}

export function HeartHover({ as: Tag = "span", className, children, ...props }) {
  const anchorRef = useRef(null);
  const timeoutRef = useRef(null);
  const [showHearts, setShowHearts] = useState(false);
  const [heartColor, setHeartColor] = useState("currentColor");

  function handleMouseEnter() {
    clearTimeout(timeoutRef.current);
    if (anchorRef.current) {
      const styles = getComputedStyle(anchorRef.current);
      const bg = styles.backgroundColor;
      setHeartColor(
        bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent"
          ? bg
          : styles.color,
      );
    }
    setShowHearts(true);
    timeoutRef.current = setTimeout(() => setShowHearts(false), 1000);
  }

  function handleMouseLeave() {
    clearTimeout(timeoutRef.current);
    setShowHearts(false);
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <>
      {showHearts && <HeartParticles anchorRef={anchorRef} color={heartColor} />}
      <Tag
        className={cn(
          "transition-transform duration-100",
          showHearts && "scale-95",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={anchorRef}
        {...props}
      >
        {children}
      </Tag>
    </>
  );
}

export function Badge({ children, kind = "", hearts = false }) {
  if (hearts) {
    return <HeartHover className={`badge ${kind}`}>{children}</HeartHover>;
  }
  return <span className={`badge ${kind}`}>{children}</span>;
}

function initials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Person({ name, sub }) {
  return (
    <div className="person">
      <div className="person-avatar">{initials(name)}</div>
      <div>
        <div className="nm">{name}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {error && <span className="err">{error}</span>}
    </div>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div className="stat">
      <div className="k">{label}</div>
      <div className="v">{value}</div>
      {sub && <div className="s">{sub}</div>}
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="small dim">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function MusterStrip({ cells }) {
  return (
    <div className="muster">
      {cells.map((c) => (
        <div
          key={c.key}
          className={`muster-cell ${c.status}${c.today ? " today" : ""}`}
          title={c.title}
        >
          {c.label}
        </div>
      ))}
    </div>
  );
}

export function MusterLegend() {
  return (
    <div className="muster-legend">
      <span>
        <i className="swatch" style={{ background: "var(--pine-700)" }} />
        Present
      </span>
      <span>
        <i className="swatch" style={{ background: "var(--pine-100)" }} />
        Partial
      </span>
      <span>
        <i className="swatch" style={{ background: "var(--amber-100)" }} />
        Leave
      </span>
      <span>
        <i
          className="swatch"
          style={{
            background: "transparent",
            border: "1px dashed var(--line)",
          }}
        />
        Weekend
      </span>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="card-body">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="row"
          style={{ gap: 16, marginBottom: 14, flexWrap: "nowrap" }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="skeleton"
              style={{ flex: c === 0 ? 2 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
