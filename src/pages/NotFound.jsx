import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="center" style={{ minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div className="eyebrow">404</div>
        <h1 style={{ marginTop: 8 }}>That page isn't on the roll</h1>
        <p className="muted" style={{ marginTop: 8, marginBottom: 18 }}>
          The link may be out of date, or you may not have access to it.
        </p>
        <Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>
      </div>
    </div>
  );
}
