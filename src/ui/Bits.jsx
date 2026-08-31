import { X } from "lucide-react";

export function Spinner() {
  return (
    <div className="center">
      <div className="spin" />
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

export function Badge({ children, kind = "" }) {
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
          style={{ background: "transparent", border: "1px dashed var(--line)" }}
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
            <div key={c} className="skeleton" style={{ flex: c === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
