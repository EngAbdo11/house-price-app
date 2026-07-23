import PredictionForm from "../components/PredictionForm";

export default function HomePage() {
  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Valuation estimate</p>
        <h1>What's this property worth?</h1>
        <p className="subhead">
          Fill in the details below and get an estimated market price based on
          comparable listings.
        </p>
      </header>
      <PredictionForm />
    </main>
  );
}
