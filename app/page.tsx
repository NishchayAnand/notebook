"use client"

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/markdown-editor/Sidebar";
import Editor from "@/app/components/markdown-editor/Editor";
import Preview from "@/app/components/markdown-editor/Preview";
import { AIChatSidebar } from "@/app/components/markdown-editor/AIChatSidebar";
import { Note } from "@/app/types/note";
import { PanelLeftClose, PanelLeft, Columns, FileEdit, Eye, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/app/lib/utils";

type ViewMode = "live" | "split" | "editor" | "preview";

const DEFAULT_CONTENT = `# Welcome to Your Vault

This is a **markdown editor** inspired by Obsidian. Start writing your notes here!

## Features

- **Live Preview**: See your markdown rendered in real-time
- **Keyboard Shortcuts**: Use \`Ctrl+B\` for bold, \`Ctrl+I\` for italic
- **Full Markdown Support**: Headers, lists, code blocks, and more

## Quick Start

1. Create a new note using the **+** button
2. Write your content in markdown
3. See the live preview on the right

### Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### Task List

- [x] Create markdown editor
- [x] Add live preview
- [ ] Add more features

> "The best way to predict the future is to create it." — Peter Drucker

---

Happy writing! ✨
`;

const defaultNote: Note = {
  id: generateId(),
  title: "Welcome",
  content: DEFAULT_CONTENT,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function MarkdownEditor() {

  const [notes, setNotes] = useState<Note[]>([defaultNote]);

  // Runs only once on intial render, prevents repeated localStorage reads
  useEffect(() => {
    const saved = localStorage.getItem("vault-notes");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotes(parsed.map((note: Note) => ({
        ...note,
        // localStorage stores strings, dates must be re-hydrated into Date objects
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      })));
    }
  }, []);

  // Persist notes to localStorage (runs every time notes change)
  useEffect(() => {
    localStorage.setItem("vault-notes", JSON.stringify(notes));
  }, [notes]);

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    return notes.length > 0 ? notes[0].id : null;
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("live");

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: "Untitled",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleContentChange = (content: string) => {
    if (!activeNoteId) return;

    // Extract title from first heading or first line
    const lines = content.split("\n");
    let title = "Untitled";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        if (trimmed.startsWith("#")) {
          title = trimmed.replace(/^#+\s*/, "");
        } else {
          title = trimmed.substring(0, 50);
        }
        break;
      }
    }

    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId
          ? { ...n, content, title, updatedAt: new Date() }
          : n
      )
    );
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-2 bg-toolbar-bg border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </button>
            {activeNote && (
              <h2 className="text-sm font-medium text-foreground truncate max-w-md">
                {activeNote.title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode("editor")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "editor"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Source mode"
              >
                <FileEdit className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode("preview")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "preview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Reading view"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => setAiChatOpen(!aiChatOpen)}
              className={cn(
                "p-2 rounded-md transition-colors",
                aiChatOpen
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="AI Assistant"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {activeNote ? (
              <>
                {viewMode === "editor" && (
                  <Editor
                    content={activeNote.content}
                    onChange={handleContentChange}
                  />
                )}
                {viewMode === "preview" && (
                  <Preview content={activeNote.content} />
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">No note selected</p>
                  <button
                    onClick={handleCreateNote}
                    className="text-primary hover:underline"
                  >
                    Create a new note
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* AI Chat Sidebar */}
          <AIChatSidebar
            isOpen={aiChatOpen}
            onClose={() => setAiChatOpen(false)}
            currentContent={activeNote?.content || ""}
          />
        </div>
      </div>
    </div>
  );
}
