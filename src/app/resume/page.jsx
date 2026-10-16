// import { experience } from '@/content/experience';
// import { profile } from '@/content/profile';

// import React, { useState, useEffect } from "react";
// import { Container, Row } from "react-bootstrap";
// import Button from "react-bootstrap/Button";
// import { AiOutlineDownload } from "react-icons/ai";
// import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
// import Particle from "../Particle";
// import pdf from "../../RRResume.pdf";
// import RRResume from "../../RRResume.pdf";
// export const metadata = {
//   title: 'Résumé',
// };

// export default function Resume() {
//   const [width, setWidth] = useState(1200);

//   useEffect(() => {
//     setWidth(window.innerWidth);
//   }, []);

//   return (
//     <div>
//       <Container fluid className="resume-section">
//         <Particle />
//         <Row style={{ justifyContent: "center", position: "relative" }}>
//           <a className="button primary" href="/RRResume.pdf" download>
//             Download résumé ↓
//           </a>
//         </Row>

//         <Row className="resume">
//           <Document file={RRResume} className="d-flex justify-content-center">
//             <Page pageNumber={1} scale={width > 786 ? 1.7 : 0.6} />
//           </Document>
//         </Row>

//         {/* <Row style={{ justifyContent: "center", position: "relative" }}>
//           <Button
//             variant="primary"
//             href={pdf}
//             target="_blank"
//             style={{ maxWidth: "250px" }}
//           >
//             <AiOutlineDownload />
//             &nbsp;Download CV
//           </Button>
//         </Row> */}
//       </Container>
//     </div>
//   );
// }

// // export default function Resume() {
// //   return (
// //     <main id="main" className="wrap resumepage">
// //       <div className="sectionhead">
// //         <div>
// //           <div className="eyebrow">EXPERIENCE / EDUCATION / SKILLS</div>
// //           <h1>
// //             A builder’s
// //             <br />
// //             <em>background.</em>
// //           </h1>
// //         </div>
// //         <a className="button primary" href="/RRResume.pdf" download>
// //           Download résumé ↓
// //         </a>
// //       </div>
// //       <div className="resumesheet">
// //         <header>
// //           <h2>Ryan Russell</h2>
// //           <p>Systems Administrator · Software Developer</p>
// //           <p>
// //             {profile.location} · <a href={'mailto:' + profile.email}>{profile.email}</a>
// //           </p>
// //           <div>
// //             <a href={profile.linkedin}>LinkedIn ↗</a> &nbsp; <a href={profile.github}>GitHub ↗</a>
// //           </div>
// //         </header>
// //         <section>
// //           <h3>Profile</h3>
// //           <p>
// //             Systems administrator with a software development foundation and hands-on experience in
// //             Microsoft 365, infrastructure support, security monitoring, and automation. Focused on
// //             systems, cloud operations, and platform engineering.
// //           </p>
// //         </section>
// //         <section>
// //           <h3>Relevant experience</h3>
// //           {experience.map((position) => (
// //             <article key={position.company}>
// //               <div className="resumerole">
// //                 <h4>
// //                   {position.title} · {position.company}
// //                 </h4>
// //                 <span>{position.date}</span>
// //               </div>
// //               <p>{position.text}</p>
// //             </article>
// //           ))}
// //           <article>
// //             <div className="resumerole">
// //               <h4>Sales Specialist / Team Lead · Musician’s Friend</h4>
// //               <span>2022 — 2026</span>
// //             </div>
// //             <p>
// //               Customer support, relationship management, team mentoring, and process improvement in
// //               a fast-paced environment.
// //             </p>
// //           </article>
// //         </section>
// //         <section>
// //           <h3>Selected work</h3>
// //           <p>
// //             <b>Security monitoring:</b> Python application using Microsoft Graph APIs, detection
// //             rules, SQLite state, and alerts. Exploring local AI-assisted correlation and summaries.
// //           </p>
// //           <p>
// //             <b>Cloud & application development:</b> AWS accounting chatbot, Node.js article
// //             discovery API, React video explorer, and Java Snake game.
// //           </p>
// //           <p>
// //             <b>Technical investigation:</b> Diagnosed a SQL Server LocalDB startup failure by
// //             correlating application logs with Windows storage sector reporting.
// //           </p>
// //         </section>
// //         <section>
// //           <h3>Education</h3>
// //           <p>
// //             <b>Western Governors University</b> · Bachelor’s studies in cloud and network
// //             engineering · Expected October 2026
// //           </p>
// //           <p>
// //             <b>Salt Lake Community College</b> · Associate degree, Computer Science, Software
// //             Development emphasis · 2024
// //           </p>
// //         </section>
// //         <section>
// //           <h3>Skills & credentials</h3>
// //           <p>
// //             Python, PowerShell, JavaScript, React, Redux, Node.js, SQL, REST APIs, Git, Docker,
// //             Linux, Windows Server, Microsoft 365, Entra, Freshservice, AWS.
// //           </p>
// //           <p>AWS Certified Cloud Practitioner · CompTIA A+ · CompTIA Network+</p>
// //           <p>AWS Solutions Architect study in progress.</p>
// //         </section>
// //       </div>
// //     </main>
// //   );
// // }

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
