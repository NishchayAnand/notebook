import { useRef, useCallback } from "react";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = useCallback(
    (syntax: string, wrap?: boolean, placeholder?: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      let newText: string;
      let cursorPos: number;

      if (wrap && selectedText) {
        // Wrap selected text
        newText =
          content.substring(0, start) +
          syntax +
          selectedText +
          syntax +
          content.substring(end);
        cursorPos = start + syntax.length + selectedText.length + syntax.length;
      } else if (wrap) {
        // Insert with placeholder
        const text = placeholder || "text";
        newText =
          content.substring(0, start) +
          syntax +
          text +
          syntax +
          content.substring(end);
        cursorPos = start + syntax.length;
        // Select the placeholder
        setTimeout(() => {
          textarea.setSelectionRange(cursorPos, cursorPos + text.length);
        }, 0);
      } else {
        // Just insert syntax
        const text = placeholder || "";
        newText = content.substring(0, start) + syntax + text + content.substring(end);
        cursorPos = start + syntax.length + text.length;
      }

      onChange(newText);
      textarea.focus();

      if (!wrap || selectedText) {
        setTimeout(() => {
          textarea.setSelectionRange(cursorPos, cursorPos);
        }, 0);
      }
    },
    [content, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent =
        content.substring(0, start) + "  " + content.substring(end);
      onChange(newContent);

      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }

    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      handleInsert("**", true, "bold text");
    }

    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault();
      handleInsert("_", true, "italic text");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-editor-bg">
      <div className="flex-1 p-4 overflow-auto">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="editor-textarea"
          placeholder="Start writing your markdown here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
