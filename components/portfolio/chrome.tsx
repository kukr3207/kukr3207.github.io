import { Navigation } from './navigation';
export function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="Uday AI Fieldnotes home">
        <span className="monogram">u.</span>
        <span>
          uday<span className="brand-note"> / AI FIELDNOTES</span>
        </span>
      </a>
      <Navigation />
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <span>© 2026 Uday Kondreddy · Hyderabad, India</span>
      <div className="footer-links">
        <a
          href="https://www.linkedin.com/in/udaykondreddy/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn ↗
        </a>
        <a href="mailto:udaykiran.kondreddy@gmail.com">Email ↗</a>
      </div>
    </footer>
  );
}
export function HeroDiagram() {
  return (
    <div className="hero-diagram">
      <svg
        viewBox="0 0 440 355"
        role="img"
        aria-labelledby="hero-diagram-title"
      >
        <title id="hero-diagram-title">
          A question moves through retrieval and verification before becoming a
          grounded answer.
        </title>
        <defs>
          <marker
            id="hero-arrow"
            markerWidth="9"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path
              d="M1 1 L7 4 L1 7"
              fill="none"
              stroke="#202523"
              strokeWidth="1.5"
            />
          </marker>
        </defs>
        <g stroke="#202523" strokeWidth="1.5" fill="#fafbf9">
          <path d="M35 45 L161 42 L164 101 L31 104 Z" />
          <path d="M263 56 L403 53 L401 115 L260 113 Z" />
          <path d="M145 178 L294 175 L298 242 L142 244 Z" />
          <path
            d="M164 46 C203 28 232 37 260 75"
            markerEnd="url(#hero-arrow)"
            fill="none"
          />
          <path
            d="M337 115 C344 162 320 183 299 194"
            markerEnd="url(#hero-arrow)"
            fill="none"
          />
          <path
            d="M146 216 C55 229 64 141 82 107"
            strokeDasharray="5 5"
            markerEnd="url(#hero-arrow)"
            fill="none"
          />
        </g>
        <g className="hand" fontSize="21" fill="#202523" textAnchor="middle">
          <text x="98" y="68">
            <tspan x="98">the</tspan>
            <tspan x="98" dy="23">
              question
            </tspan>
          </text>
          <text x="332" y="79">
            <tspan x="332">find</tspan>
            <tspan x="332" dy="23">
              evidence
            </tspan>
          </text>
          <text x="220" y="202">
            <tspan x="220">check the</tspan>
            <tspan x="220" dy="23">
              answer
            </tspan>
          </text>
          <text
            x="62"
            y="270"
            fontSize="17"
            textAnchor="start"
            fill="#687162"
            transform="rotate(-8 62 270)"
          >
            try again if needed
          </text>
        </g>
        <path
          d="M220 245 C215 263 221 275 218 288"
          stroke="#202523"
          strokeWidth="1.5"
          fill="none"
          markerEnd="url(#hero-arrow)"
        />
        <rect
          x="130"
          y="293"
          width="184"
          height="38"
          rx="19"
          fill="#dbf796"
          transform="rotate(-2 220 312)"
        />
        <text
          x="222"
          y="318"
          textAnchor="middle"
          fontSize="17"
          className="hand"
          fill="#202523"
        >
          useful + grounded
        </text>
        <g fill="#243de2" className="hand" fontSize="17">
          <text x="195" y="18" transform="rotate(7 195 18)">
            context matters!
          </text>
          <path
            d="M294 22 q17 0 22 20"
            stroke="#243de2"
            strokeWidth="1.3"
            fill="none"
          />
        </g>
        <image
          href="/illustrations/builder.png"
          x="313"
          y="207"
          width="122"
          height="122"
          aria-hidden="true"
        />
      </svg>
      <span className="diagram-note hand">
        a little less magic. a lot more evidence.
      </span>
    </div>
  );
}
export function StudyDiagram({ kind }: { kind: 'rag' | 'eval' }) {
  return kind === 'rag' ? (
    <svg
      viewBox="0 0 400 170"
      role="img"
      aria-label="Documents and a knowledge graph converge into grounded context"
    >
      <g stroke="#424d3a" strokeWidth="1.5" fill="#fafbf9">
        <rect
          x="38"
          y="45"
          width="70"
          height="86"
          rx="4"
          transform="rotate(-6 73 90)"
        />
        <path d="M53 70 h35 M53 83 h40 M53 96 h30 M53 109 h38" />
        <path d="M126 88 Q171 57 212 80 M128 99 Q171 129 212 102" fill="none" />
        <circle cx="249" cy="48" r="17" />
        <circle cx="233" cy="115" r="17" />
        <circle cx="309" cy="95" r="17" />
        <path d="M245 65 L236 97 M265 59 L295 83 M251 111 L292 99" />
      </g>
      <g fill="#243de2">
        <circle cx="249" cy="48" r="6" />
        <circle cx="233" cy="115" r="6" />
        <circle cx="309" cy="95" r="6" />
      </g>
      <text x="43" y="155" className="hand" fontSize="18">
        the documents
      </text>
      <text x="232" y="155" className="hand" fontSize="18">
        the relationships
      </text>
      <text x="139" y="58" className="hand" fontSize="21" fill="#687162">
        +
      </text>
    </svg>
  ) : (
    <svg
      viewBox="0 0 400 170"
      role="img"
      aria-label="A weak verifier accepts a broken answer; a stronger verifier catches it"
    >
      <g stroke="#273166" strokeWidth="1.5" fill="#fafbf9">
        <path d="M41 37 L350 33 L354 135 L44 139 Z" />
        <path d="M43 72 L351 68 M197 36 L200 137" />
      </g>
      <g className="hand" fontSize="21" fill="#202523">
        <text x="66" y="60">
          looks right?
        </text>
        <text x="225" y="58">
          is it right?
        </text>
        <text x="78" y="111" fill="#8e5148">
          NaN → pass
        </text>
        <text x="226" y="109" fill="#243de2">
          NaN → fail
        </text>
        <text x="107" y="163" fontSize="18">
          test the test, too.
        </text>
      </g>
    </svg>
  );
}
