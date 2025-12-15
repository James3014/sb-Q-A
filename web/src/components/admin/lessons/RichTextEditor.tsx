'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface RichTextEditorProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string | null
}

export function RichTextEditor({ label, value, onChange, placeholder, error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '輸入內容...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-white">{label}</label>}
      <div className="rounded-lg border border-zinc-700 bg-zinc-900">
        <div className="flex gap-2 border-b border-zinc-800 px-2 py-1 text-sm text-white">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`rounded px-2 py-1 ${editor?.isActive('bold') ? 'bg-zinc-700' : ''}`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`rounded px-2 py-1 ${editor?.isActive('italic') ? 'bg-zinc-700' : ''}`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`rounded px-2 py-1 ${editor?.isActive('bulletList') ? 'bg-zinc-700' : ''}`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`rounded px-2 py-1 ${editor?.isActive('orderedList') ? 'bg-zinc-700' : ''}`}
          >
            1.
          </button>
        </div>
        <EditorContent editor={editor} className="prose prose-invert min-h-[160px] max-w-none px-3 py-2" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
