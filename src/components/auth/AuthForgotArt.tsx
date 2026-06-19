/**
 * Animated illustratie voor de "wachtwoord vergeten"-pagina: een zwevend hangslot
 * met een vraagteken en zachte pulserende ringen. Puur decoratief en past in het
 * petrol/mint-kleurenpalet van het auth-zijpaneel. Respecteert reduced-motion via CSS.
 */
export function AuthForgotArt() {
  return (
    <div className="auth-forgot-art" aria-hidden="true">
      <svg
        className="auth-forgot-svg"
        viewBox="0 0 240 240"
        role="presentation"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="auth-forgot-pulse" cx="120" cy="132" r="58" />
        <circle className="auth-forgot-pulse auth-forgot-pulse--delay" cx="120" cy="132" r="58" />

        <circle className="auth-forgot-spark auth-forgot-spark--1" cx="52" cy="74" r="4" />
        <circle className="auth-forgot-spark auth-forgot-spark--2" cx="194" cy="92" r="5" />
        <circle className="auth-forgot-spark auth-forgot-spark--3" cx="182" cy="186" r="3.5" />
        <circle className="auth-forgot-spark auth-forgot-spark--4" cx="58" cy="178" r="3" />

        <g className="auth-forgot-lock">
          <path
            className="auth-forgot-shackle"
            d="M94 116 V96 a26 26 0 0 1 52 0 V116"
            fill="none"
          />
          <rect className="auth-forgot-body" x="80" y="114" width="80" height="70" rx="16" />
          <text className="auth-forgot-q" x="120" y="154" textAnchor="middle">
            ?
          </text>
        </g>
      </svg>
    </div>
  );
}
