export const metadata = {
  title: "Résumé",
  description: "View and download Ryan Russell's professional résumé.",
};

export default function Resume() {
  const resumePath = "/RRResume.pdf";

  return (
    <main id="main" className="wrap resumepage">
      <div className="sectionhead">
        <div>
          <div className="eyebrow">EXPERIENCE / EDUCATION / SKILLS</div>

          <h1>
            My <em>résumé.</em>
          </h1>

          <p>
            Explore my professional experience, education,
            technical skills, and certifications.
          </p>
        </div>

        <a className="button primary" href={resumePath} download>
          Download résumé ↓
        </a>
      </div>

      <section className="resume-pdf-section">
        <iframe
          src={resumePath}
          title="Ryan Russell - Professional Résumé"
          className="resume-pdf-viewer"
          style={{
            width: "100%",
            height: "90vh",
            minHeight: "800px",
            border: "none",
          }}
        />

        <p className="resume-pdf-fallback">
          Having trouble viewing the PDF?{" "}
          <a
            href={resumePath}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open résumé in a new tab ↗
          </a>
        </p>
      </section>
    </main>
  );
}
