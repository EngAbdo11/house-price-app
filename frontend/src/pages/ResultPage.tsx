import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatIndianPrice } from "../utils/formatPrice";

interface LocationState {
  price?: number;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const price = (location.state as LocationState | null)?.price;

  const [displayed, setDisplayed] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (price === undefined) return;
    const target = price;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDisplayed(target);
      return;
    }

    const duration = 700;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(target * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    }

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [price]);

  if (price === undefined) {
    return (
      <main className="page">
        <div className="empty-state">
          <p className="eyebrow">No estimate yet</p>
          <h1>There's nothing to show here</h1>
          <p className="subhead">
            Submit the form to generate a price estimate first.
          </p>
          <button className="submit-button" onClick={() => navigate("/")}>
            Go to the form
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="plaque">
        <p className="plaque-eyebrow">Estimated market value</p>
        <p className="plaque-price">{formatIndianPrice(displayed)}</p>
        <div className="plaque-rule" aria-hidden="true" />
        <p className="plaque-footnote">
          Based on comparable listings in your selected location
        </p>
      </div>
      <Link className="text-link" to="/">
        Estimate another property
      </Link>
    </main>
  );
}
