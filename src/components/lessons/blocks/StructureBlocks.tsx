"use client";

import type { DividerBlock } from "@/lib/lessons/types";
import type { BlockEditorProps, BlockStudentProps } from "./shared";

export function DividerEditor(_: BlockEditorProps<DividerBlock>) {
  return <div className="lesson-divider lesson-divider--editor" aria-hidden />;
}

export function DividerStudent(_: BlockStudentProps<DividerBlock>) {
  return <hr className="lesson-divider" />;
}
