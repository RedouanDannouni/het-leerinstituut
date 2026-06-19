"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Strikethrough } from "lucide-react";
import { useEffect } from "react";

const extensions = [
  StarterKit.configure({
    heading: { levels: [3, 4] },
  }),
];

/** Inline rich-text editor (TipTap) — alleen gebruikt binnen het tekstblok. */
export function RichTextEditor({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions,
    content: html,
    immediatelyRender: false,
    editorProps: { attributes: { class: "rich-text-content" } },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== html) {
      editor.commands.setContent(html, { emitUpdate: false });
    }
  }, [html, editor]);

  if (!editor) return <div className="rich-text-content muted">Editor laden…</div>;

  return (
    <div className="rich-text">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Tekstopmaak">
        <ToolbarButton active={editor.isActive("bold")} label="Vet" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} aria-hidden />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} label="Cursief" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} aria-hidden />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} label="Doorhalen" onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={15} aria-hidden />
        </ToolbarButton>
        <span className="rich-text-sep" aria-hidden />
        <ToolbarButton active={editor.isActive("bulletList")} label="Lijst" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          label="Genummerde lijst"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} aria-hidden />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`rich-text-btn ${active ? "is-active" : ""}`}
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Read-only weergave van rich text (student-view). */
export function RichTextView({ html }: { html: string }) {
  return <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
