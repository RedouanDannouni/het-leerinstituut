"use client";

import { Target } from "lucide-react";
import type { Block, Lesson } from "@/lib/lessons/types";
import { blockRegistry } from "./block-registry";

export function StudentBlock({ block }: { block: Block }) {
  const Student = blockRegistry[block.type].StudentView;
  return (
    <div className={`student-block student-block--${block.type}`}>
      <Student block={block} />
    </div>
  );
}

export function StudentLessonView({ lesson }: { lesson: Lesson }) {
  const objectives = lesson.learningObjectives.filter(Boolean);
  return (
    <article className="student-lesson">
      <header className="student-lesson-header">
        <h1>{lesson.title}</h1>
        {objectives.length ? (
          <div className="objectives-card">
            <div className="objectives-head">
              <Target size={16} aria-hidden /> <strong>Leerdoelen</strong>
            </div>
            <ul>
              {objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>
      <div className="student-lesson-body">
        {lesson.blocks.length ? (
          lesson.blocks.map((block) => <StudentBlock key={block.id} block={block} />)
        ) : (
          <p className="muted">Deze les heeft nog geen inhoud.</p>
        )}
      </div>
    </article>
  );
}
