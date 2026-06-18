import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main" className="page">
      <section className="grid grid-2" style={{ alignItems: "center", minHeight: "82vh" }}>
        <div className="stack">
          <p className="eyebrow">Het Leerinstituut</p>
          <h1>Rustig sturen op leskwaliteit.</h1>
          <p className="muted" style={{ fontSize: "1.15rem" }}>
            Een werkend fundament voor observeren, samenvatten, rapporteren en het goede gesprek met scholen voeren.
          </p>
          <div className="cluster">
            <Link className="btn btn-primary" href="/login">
              Demo openen
            </Link>
            <Link className="btn btn-secondary" href="/invite/welkom-noord">
              Uitnodiging testen
            </Link>
          </div>
        </div>
        <div className="card stack">
          <span className="badge badge-info">AI-concept · mens keurt goed</span>
          <h2>Kernflow</h2>
          <div className="stack">
            {["Inloggen per rol", "Cockpit met juiste beslisinformatie", "Observatieformulier met autosave", "Rapport exporteren voor het schoolgesprek"].map((item) => (
              <div className="cluster" key={item}>
                <span className="brand-mark" style={{ width: 32, height: 32, borderRadius: 999 }}>
                  ✓
                </span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
