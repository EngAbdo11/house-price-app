import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page">
      <div className="empty-state">
        <p className="eyebrow">404</p>
        <h1>This page doesn't exist</h1>
        <p className="subhead">The address might be mistyped, or the page moved.</p>
        <Link className="submit-button" to="/">
          Back to the estimator
        </Link>
      </div>
    </main>
  );
}
