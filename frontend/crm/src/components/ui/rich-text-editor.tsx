"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Table as TableIcon,
  Columns3,
  Rows3,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// StarterKit emits an empty paragraph for "no content"; treat that as "".
function normalize(html: string): string {
  return html === "<p></p>" ? "" : html;
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-1">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Toggle
        size="sm"
        pressed={editor.isActive("link")}
        onPressedChange={setLink}
        aria-label="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 px-2"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        aria-label="Insert table"
      >
        <TableIcon className="h-4 w-4" />
      </Button>
      {editor.isActive("table") && (
        <>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 gap-0.5 px-2"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            aria-label="Add column"
            title="Add column"
          >
            <Columns3 className="h-4 w-4" />
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 gap-0.5 px-2"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            aria-label="Delete column"
            title="Delete column"
          >
            <Columns3 className="h-4 w-4" />
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 gap-0.5 px-2"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            aria-label="Add row"
            title="Add row"
          >
            <Rows3 className="h-4 w-4" />
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 gap-0.5 px-2"
            onClick={() => editor.chain().focus().deleteRow().run()}
            aria-label="Delete row"
            title="Delete row"
          >
            <Rows3 className="h-4 w-4" />
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => editor.chain().focus().deleteTable().run()}
            aria-label="Delete table"
            title="Delete entire table"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // required for Next.js SSR
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] w-full px-3 py-2 text-sm focus:outline-none " +
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 " +
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
          "[&_li]:my-0.5 [&_a]:text-blue-600 [&_a]:underline [&_p]:my-1 " +
          "[&_table]:border-collapse [&_table]:w-full [&_table]:my-2 " +
          "[&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2 [&_th]:text-left " +
          "[&_td]:border [&_td]:border-gray-300 [&_td]:p-2",
      },
    },
    onUpdate: ({ editor }) => onChange(normalize(editor.getHTML())),
  });

  // Keep the editor in sync when the form resets / loads existing data.
  useEffect(() => {
    if (!editor) return;
    const current = normalize(editor.getHTML());
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-md border border-input bg-transparent shadow-xs">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} data-placeholder={placeholder} />
    </div>
  );
}
