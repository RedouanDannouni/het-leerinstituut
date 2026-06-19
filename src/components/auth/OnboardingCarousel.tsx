"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AuthAsideShader } from "@/components/auth/AuthAsideShader";
import { AuthBrandArt } from "@/components/auth/AuthBrandArt";
import { brandAssets } from "@/lib/brand";

const AUTO_ADVANCE_MS = 6500;

interface Slide {
  title: string;
  body: string;
  illustration: React.ReactNode;
}

const slides: Slide[] = [
  {
    title: "Samen beter onderwijs",
    body: "Het Leerinstituut helpt je team om leren zichtbaar te maken en hoge verwachtingen concreet te houden.",
    illustration: <CompassIllustration />,
  },
  {
    title: "Van observatie naar inzicht",
    body: "Leg lesobservaties vast, herken patronen en voer het gesprek op basis van groei, niet oordeel.",
    illustration: <InsightIllustration />,
  },
  {
    title: "Zet de vervolgstap",
    body: "Werk samen aan concrete acties die passen bij jullie schoolcontext. Vandaag beginnen, samen volhouden.",
    illustration: <PathIllustration />,
  },
];

export function OnboardingCarousel() {
  const asideRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((value: number) => {
    setIndex(((value % slides.length) + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const timer = window.setTimeout(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    }
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  }

  return (
    <aside ref={asideRef} className="auth-aside auth-aside--carousel">
      <AuthAsideShader containerRef={asideRef} />
      <AuthBrandArt />

      <img className="auth-brand-logo" src={brandAssets.logo.white} alt="Het Leerinstituut" />

      <section
        className="auth-carousel"
        aria-roledescription="carrousel"
        aria-label="Welkom bij Het Leerinstituut"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="auth-carousel-viewport">
          <div
            className="auth-carousel-track"
            style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
          >
            {slides.map((slide, slideIndex) => (
              <div
                className="auth-carousel-slide"
                key={slide.title}
                role="group"
                aria-roledescription="dia"
                aria-label={`${slideIndex + 1} van ${slides.length}`}
                aria-hidden={slideIndex !== index}
              >
                <div className="auth-carousel-art" aria-hidden>
                  {slide.illustration}
                </div>
                <div className="auth-aside-copy">
                  <h2>{slide.title}</h2>
                  <p>{slide.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-carousel-controls">
          <div className="auth-carousel-stepper" role="tablist" aria-label="Dia's">
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.title}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`Ga naar dia ${dotIndex + 1}: ${slide.title}`}
                className={`auth-carousel-bar${dotIndex === index ? " is-active" : ""}`}
                onClick={() => goTo(dotIndex)}
              />
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}

function CompassIllustration() {
  return (
    <svg viewBox="0 0 340 220" className="auth-carousel-svg" role="img" aria-hidden style={{ overflow: "visible" }}>
      <style>{`
        .s1-glow{transform-box:fill-box;transform-origin:center;animation:s1-glow 4s ease-in-out infinite}
        .s1-flow{animation:s1-flow 1.4s linear infinite}
        .s1-fa{animation:s1-fl 4.4s ease-in-out infinite}
        .s1-fb{animation:s1-fl 4.4s ease-in-out infinite;animation-delay:-1.5s}
        .s1-fc{animation:s1-fl 4.4s ease-in-out infinite;animation-delay:-3s}
        .s1-c0{animation:s1-fl 6s ease-in-out infinite}
        @keyframes s1-glow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.06)}}
        @keyframes s1-flow{to{stroke-dashoffset:-20}}
        @keyframes s1-fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @media (prefers-reduced-motion:reduce){.s1-glow,.s1-flow,.s1-fa,.s1-fb,.s1-fc,.s1-c0{animation:none}}
      `}</style>
      <defs>
        <radialGradient id="s1-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8fe0cc" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8fe0cc" stopOpacity="0" />
        </radialGradient>
        <filter id="s1-sh" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#082d3e" floodOpacity="0.35" />
        </filter>
      </defs>

      <circle className="s1-glow" cx="170" cy="108" r="80" fill="url(#s1-g)" />

      <g stroke="#8fe0cc" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 8" opacity="0.8">
        <line className="s1-flow" x1="170" y1="108" x2="86" y2="64" />
        <line className="s1-flow" x1="170" y1="108" x2="258" y2="66" />
        <line className="s1-flow" x1="170" y1="108" x2="170" y2="186" />
      </g>

      <g className="s1-c0">
        <g filter="url(#s1-sh)"><rect x="138" y="76" width="64" height="64" rx="20" fill="#ffffff" /></g>
        <circle cx="158" cy="102" r="8" fill="#0e6a8c" opacity="0.55" />
        <path d="M147 122 a11 11 0 0 1 22 0 Z" fill="#0e6a8c" opacity="0.55" />
        <circle cx="182" cy="102" r="8" fill="#0e6a8c" opacity="0.55" />
        <path d="M171 122 a11 11 0 0 1 22 0 Z" fill="#0e6a8c" opacity="0.55" />
        <circle cx="170" cy="106" r="10" fill="#38c9a6" />
        <path d="M156 130 a14 14 0 0 1 28 0 Z" fill="#38c9a6" />
      </g>

      <g className="s1-fa">
        <g filter="url(#s1-sh)"><circle cx="86" cy="64" r="22" fill="#ffffff" /></g>
        <rect x="74" y="56" width="24" height="15" rx="5" fill="#0e6a8c" />
        <path d="M80 71 l0 6 l7 -6 Z" fill="#0e6a8c" />
        <circle cx="80" cy="63" r="1.8" fill="#fff" /><circle cx="86" cy="63" r="1.8" fill="#fff" /><circle cx="92" cy="63" r="1.8" fill="#fff" />
      </g>

      <g className="s1-fb">
        <g filter="url(#s1-sh)"><circle cx="258" cy="66" r="22" fill="#ffffff" /></g>
        <circle cx="258" cy="66" r="13" fill="#38c9a6" />
        <path d="M251 66 l5 5 l9 -10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g className="s1-fc">
        <g filter="url(#s1-sh)"><circle cx="170" cy="186" r="22" fill="#ffffff" /></g>
        <path d="M170 174 C172 182 174 184 182 186 C174 188 172 190 170 198 C168 190 166 188 158 186 C166 184 168 182 170 174 Z" fill="#ffd000" />
      </g>
    </svg>
  );
}

function InsightIllustration() {
  return (
    <svg viewBox="0 0 340 220" className="auth-carousel-svg" role="img" aria-hidden style={{ overflow: "visible" }}>
      <style>{`
        .s2-float{animation:s2-fl 5s ease-in-out infinite}
        .s2-dot{transform-box:fill-box;transform-origin:center;animation:s2-dot 2.6s ease-in-out infinite}
        .s2-ring{transform-box:fill-box;transform-origin:center;animation:s2-ring 2.6s ease-out infinite}
        .s2-gtip{transform-box:fill-box;transform-origin:center;animation:s2-dot 2.6s ease-in-out infinite;animation-delay:-1.3s}
        @keyframes s2-fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes s2-dot{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
        @keyframes s2-ring{0%{transform:scale(.5);opacity:.7}100%{transform:scale(2.4);opacity:0}}
        @media (prefers-reduced-motion:reduce){.s2-float,.s2-dot,.s2-ring,.s2-gtip{animation:none}}
      `}</style>
      <defs>
        <linearGradient id="s2-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0e6a8c" /><stop offset="100%" stopColor="#38c9a6" />
        </linearGradient>
        <linearGradient id="s2-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38c9a6" stopOpacity="0.45" /><stop offset="100%" stopColor="#38c9a6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="s2-gauge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0e6a8c" /><stop offset="100%" stopColor="#38c9a6" />
        </linearGradient>
        <filter id="s2-sh" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#082d3e" floodOpacity="0.32" />
        </filter>
        <filter id="s2-sh2" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#082d3e" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* card A: primary stat */}
      <g filter="url(#s2-sh)"><rect x="14" y="18" width="152" height="74" rx="12" fill="#ffffff" /></g>
      <rect x="28" y="30" width="50" height="6" rx="3" fill="#c5d3ce" />
      <rect x="122" y="28" width="32" height="14" rx="7" fill="#38c9a6" opacity="0.16" />
      <path d="M129 38 l3 -4 l3 4 Z" fill="#38c9a6" /><rect x="137" y="34" width="12" height="5" rx="2.5" fill="#38c9a6" />
      <rect x="28" y="44" width="124" height="36" rx="9" fill="url(#s2-grad)" />
      <text x="40" y="68" fontSize="17" fontWeight="700" fill="#ffffff">1.240</text>
      <rect x="40" y="72" width="46" height="4" rx="2" fill="#ffffff" opacity="0.55" />

      {/* card B: trend */}
      <g filter="url(#s2-sh)"><rect x="174" y="18" width="148" height="74" rx="12" fill="#ffffff" /></g>
      <rect x="186" y="30" width="44" height="6" rx="3" fill="#c5d3ce" />
      <rect x="286" y="29" width="30" height="13" rx="6.5" fill="#38c9a6" opacity="0.16" />
      <path d="M292 38 l3 -4 l3 4 Z" fill="#38c9a6" />
      <line x1="186" y1="78" x2="312" y2="78" stroke="#eef2f3" strokeWidth="1.4" />
      <path d="M188 80 L210 72 L232 76 L256 58 L280 64 L308 48 L308 84 L188 84 Z" fill="url(#s2-area)" />
      <polyline points="188,80 210,72 232,76 256,58 280,64 308,48" fill="none" stroke="#38c9a6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="s2-ring" cx="308" cy="48" r="6" fill="none" stroke="#ffd000" strokeWidth="2" />
      <circle className="s2-dot" cx="308" cy="48" r="4.5" fill="#ffd000" stroke="#fff" strokeWidth="1.6" />

      {/* card D: table */}
      <g filter="url(#s2-sh)"><rect x="14" y="98" width="168" height="104" rx="12" fill="#ffffff" /></g>
      <rect x="28" y="111" width="22" height="5" rx="2.5" fill="#c5d3ce" />
      <rect x="58" y="111" width="40" height="5" rx="2.5" fill="#c5d3ce" />
      <rect x="146" y="111" width="22" height="5" rx="2.5" fill="#c5d3ce" />
      <line x1="28" y1="122" x2="168" y2="122" stroke="#eef2f3" strokeWidth="1.2" />
      <g>
        <circle cx="33" cy="134" r="4" fill="#38c9a6" /><rect x="44" y="131" width="62" height="6" rx="3" fill="#2f6274" />
        <rect x="112" y="132" width="22" height="5" rx="2.5" fill="#c5d3ce" />
        <rect x="142" y="128" width="28" height="12" rx="6" fill="#38c9a6" opacity="0.18" /><rect x="148" y="132" width="16" height="4" rx="2" fill="#38c9a6" />
      </g>
      <g>
        <circle cx="33" cy="152" r="4" fill="#ffd000" /><rect x="44" y="149" width="54" height="6" rx="3" fill="#2f6274" />
        <rect x="112" y="150" width="22" height="5" rx="2.5" fill="#c5d3ce" />
        <rect x="142" y="146" width="28" height="12" rx="6" fill="#ffd000" opacity="0.22" /><rect x="148" y="150" width="16" height="4" rx="2" fill="#caa400" />
      </g>
      <g>
        <circle cx="33" cy="170" r="4" fill="#0e6a8c" /><rect x="44" y="167" width="60" height="6" rx="3" fill="#2f6274" />
        <rect x="112" y="168" width="22" height="5" rx="2.5" fill="#c5d3ce" />
        <rect x="142" y="164" width="28" height="12" rx="6" fill="#0e6a8c" opacity="0.18" /><rect x="148" y="168" width="16" height="4" rx="2" fill="#0e6a8c" />
      </g>
      <g>
        <circle cx="33" cy="188" r="4" fill="#38c9a6" /><rect x="44" y="185" width="50" height="6" rx="3" fill="#2f6274" />
        <rect x="112" y="186" width="22" height="5" rx="2.5" fill="#c5d3ce" />
        <rect x="142" y="182" width="28" height="12" rx="6" fill="#38c9a6" opacity="0.18" /><rect x="148" y="186" width="16" height="4" rx="2" fill="#38c9a6" />
      </g>

      {/* card C: gauge (elevated, floats) */}
      <g className="s2-float">
        <g filter="url(#s2-sh2)"><rect x="190" y="92" width="134" height="112" rx="14" fill="#ffffff" /></g>
        <rect x="204" y="106" width="52" height="6" rx="3" fill="#142930" />
        <rect x="286" y="104" width="30" height="14" rx="7" fill="#eef2f3" /><rect x="292" y="108" width="18" height="6" rx="3" fill="#9fb0b8" />
        <path d="M210 150 A30 30 0 0 1 270 150" fill="none" stroke="#e3eaec" strokeWidth="7" strokeLinecap="round" />
        <path d="M210 150 A30 30 0 0 1 270 150" fill="none" stroke="url(#s2-gauge)" strokeWidth="7" strokeLinecap="round" strokeDasharray="73.5 200" />
        <circle className="s2-gtip" cx="269" cy="131" r="4.5" fill="#38c9a6" stroke="#fff" strokeWidth="1.6" />
        <text x="240" y="147" textAnchor="middle" fontSize="15" fontWeight="700" fill="#142930">78%</text>
        <rect x="226" y="153" width="28" height="5" rx="2.5" fill="#c5d3ce" />
        <circle cx="207" cy="172" r="3.2" fill="#38c9a6" /><rect x="215" y="169" width="40" height="6" rx="3" fill="#2f6274" /><rect x="286" y="169" width="24" height="6" rx="3" fill="#c5d3ce" />
        <circle cx="207" cy="184" r="3.2" fill="#0e6a8c" /><rect x="215" y="181" width="34" height="6" rx="3" fill="#2f6274" /><rect x="286" y="181" width="24" height="6" rx="3" fill="#c5d3ce" />
        <circle cx="207" cy="196" r="3.2" fill="#8fe0cc" /><rect x="215" y="193" width="30" height="6" rx="3" fill="#2f6274" /><rect x="286" y="193" width="24" height="6" rx="3" fill="#c5d3ce" />
      </g>
    </svg>
  );
}

function PathIllustration() {
  return (
    <svg viewBox="0 0 340 220" className="auth-carousel-svg" role="img" aria-hidden style={{ overflow: "visible" }}>
      <style>{`
        .s3-flow{animation:s3-flow 2.4s linear infinite}
        .s3-pin{animation:s3-pin 3s ease-in-out infinite}
        .s3-wave{transform-box:fill-box;transform-origin:left center;animation:s3-wave 2.2s ease-in-out infinite}
        .s3-glow{transform-box:fill-box;transform-origin:center;animation:s3-glow 3.5s ease-in-out infinite}
        @keyframes s3-flow{to{stroke-dashoffset:-37.5}}
        @keyframes s3-pin{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes s3-wave{0%,100%{transform:skewX(0)}50%{transform:skewX(-9deg)}}
        @keyframes s3-glow{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.8;transform:scale(1.12)}}
        @media (prefers-reduced-motion:reduce){.s3-flow,.s3-pin,.s3-wave,.s3-glow{animation:none}}
      `}</style>
      <defs>
        <radialGradient id="s3-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd000" stopOpacity="0.6" /><stop offset="100%" stopColor="#ffd000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s3-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#dcefe9" />
        </linearGradient>
        <filter id="s3-sh" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#082d3e" floodOpacity="0.3" />
        </filter>
      </defs>

      <circle className="s3-glow" cx="208" cy="58" r="46" fill="url(#s3-g)" />

      <path d="M20 188 L96 92 L168 188 Z" fill="#8fe0cc" opacity="0.45" />
      <path d="M250 188 L300 120 L340 188 Z" fill="#2f6274" opacity="0.4" />

      <g filter="url(#s3-sh)">
        <path d="M70 190 L208 58 L324 190 Z" fill="url(#s3-front)" />
      </g>
      <path d="M208 58 L182 96 L196 92 L206 102 L218 90 L232 96 Z" fill="#8fe0cc" opacity="0.75" />

      <path className="s3-flow" d="M96 188 L132 160 L104 138 L146 118 L120 100 L176 88 L208 66"
        fill="none" stroke="#0e6a8c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.5 11" />
      <circle cx="132" cy="160" r="5" fill="#fff" stroke="#0e6a8c" strokeWidth="2.4" />
      <circle cx="146" cy="118" r="5" fill="#fff" stroke="#0e6a8c" strokeWidth="2.4" />

      <g className="s3-pin">
        <path d="M120 78 C111 78 105 85 105 93 C105 104 120 116 120 116 C120 116 135 104 135 93 C135 85 129 78 120 78 Z" fill="#0e6a8c" filter="url(#s3-sh)" />
        <circle cx="120" cy="93" r="6" fill="#ffffff" />
      </g>

      <line x1="208" y1="66" x2="208" y2="34" stroke="#142930" strokeWidth="3" strokeLinecap="round" />
      <path className="s3-wave" d="M208 36 L234 44 L208 52 Z" fill="#ffd000" />
      <circle cx="208" cy="66" r="4.5" fill="#142930" />
    </svg>
  );
}
