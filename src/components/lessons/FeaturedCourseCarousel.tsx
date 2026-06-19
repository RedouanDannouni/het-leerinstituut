"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Layers, Users } from "lucide-react";
import type { Lesson, Module } from "@/lib/lessons/types";
import {
  lessonCountForModule,
  placeholderHours,
  placeholderStudentCount,
  shuffleModules,
} from "@/lib/lessons/materials-display";

const ROTATE_MS = 6000;

export function FeaturedCourseCarousel({
  modules,
  lessons,
}: {
  modules: Module[];
  lessons: Lesson[];
}) {
  const slideKey = modules.map((module) => module.id).join("|");
  const slides = useMemo(() => shuffleModules(modules), [slideKey]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) {
      setIndex(0);
      return;
    }
    setIndex(Math.floor(Math.random() * slides.length));
  }, [slideKey, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const mod = slides[index] ?? slides[0];
  const lessonCount = lessonCountForModule(mod.id, lessons);
  const students = placeholderStudentCount(mod.id);
  const hours = placeholderHours(lessonCount);
  const href = `/app/materials/modules/${mod.id}`;

  return (
    <section className="materials-hero" aria-label="Uitgelichte cursus">
      <Link href={href} className="materials-hero__link">
        <div className="materials-hero__media" aria-hidden>
          {mod.coverUrl ? (
            <img src={mod.coverUrl} alt="" />
          ) : (
            <span className="materials-hero__fallback">
              <Layers size={48} />
            </span>
          )}
          <span className="materials-hero__overlay" />
        </div>
        <div className="materials-hero__content">
          <p className="materials-hero__eyebrow">{mod.category || "Cursus"}</p>
          <h2 className="materials-hero__title">{mod.title}</h2>
          {mod.summary ? <p className="materials-hero__summary">{mod.summary}</p> : null}
          <ul className="materials-hero__badges">
            <li>
              <BookOpen size={16} aria-hidden />
              {lessonCount} {lessonCount === 1 ? "les" : "lessen"}
            </li>
            <li>
              <Clock size={16} aria-hidden />+{hours} uur
            </li>
            <li>
              <Users size={16} aria-hidden />
              {students} deelnemers
            </li>
          </ul>
        </div>
      </Link>

      {slides.length > 1 ? (
        <div className="materials-hero__dots" role="tablist" aria-label="Uitgelichte cursussen">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              className={`materials-hero__dot${dotIndex === index ? " is-active" : ""}`}
              aria-label={`${slide.title} tonen`}
              aria-selected={dotIndex === index}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
