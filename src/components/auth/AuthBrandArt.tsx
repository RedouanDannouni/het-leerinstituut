/**
 * Decoratief merkbeeld voor het login-paneel: de opwaartse "swoosh" uit de
 * huisstijl van Het Leerinstituut die als rustige, doorzichtige golf door het paneel loopt.
 */

// Het beeldmerk/swoosh-pad uit /public/brand/icon (viewBox 0 0 388 307).
const SWOOSH =
  "M209.761 141.075C125.303 165.245 69.6559 212.045 38.127 246.575V0H0V307H38.0013C38.0609 307 38.0609 306.941 38.127 306.881C43.0656 298.866 99.3866 211.12 219.942 176.656C300.765 153.596 363.565 161.736 388 166.665V128.99C355.856 123.38 291.264 117.83 209.768 141.075H209.761Z";

export function AuthBrandArt() {
  return (
    <div className="auth-aside-art" aria-hidden="true">
      <svg
        className="auth-art-svg"
        viewBox="0 0 520 820"
        role="presentation"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="auth-art-swoosh auth-art-swoosh--ghost">
          <path transform="translate(70 -250) scale(2.25)" d={SWOOSH} fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
