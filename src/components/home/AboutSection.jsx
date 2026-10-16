import { profile } from '@/content/profile';

export default function AboutSection() {
  return (
    <section id="about" className="aboutsection">
      <div className="wrap aboutgrid">
        <div>
          <div className="eyebrow">02 / A LITTLE ABOUT ME</div>
          <h2>
            Curiosity is
            <br />
            the common
            <br />
            <em>thread.</em>
          </h2>
          <div className="outdoorart" aria-hidden="true">
            <svg viewBox="0 0 500 200">
              <path
                d="M0 190 130 40 185 104 255 15 410 190 M132 40 157 125 185 104 M255 15 275 100 309 81 M90 190 200 122 247 150 325 85 500 190"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle cx="402" cy="49" r="24" fill="none" stroke="currentColor" />
            </svg>
            <span>OFFLINE, SOMEWHERE IN THE WASATCH.</span>
          </div>
        </div>
        <div className="aboutcopy">
          <p className="lead">
            I like understanding how things work.
            <br />
            Then finding a way to make them better.
          </p>
          <p>
            My path connects software development, hands-on IT, and cloud infrastructure. At
            Resolut, I work across systems administration, technical support, automation, and
            security monitoring. Writing code helps me move beyond a one-time fix and build
            something useful.
          </p>
          <p>
            I’m completing my bachelor’s studies at Western Governors University, building on an
            associate degree in Computer Science. My next chapter is focused on systems, cloud
            operations, and platform engineering.
          </p>
          <p>
            Away from the keyboard, you’ll find me mountain biking, skiing, or exploring somewhere
            new. Building trails and building software have something in common: both are better
            when other people can use what you create.
          </p>
          <div className="interestrow">
            <span>↗ Mountain biking</span>
            <span>↗ Skiing</span>
            <span>↗ Travel</span>
          </div>
          <a className="textlink" href={profile.linkedin} target="_blank" rel="noreferrer">
            More about my background <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
