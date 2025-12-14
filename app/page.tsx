"use client";

import { useEffect, useState } from "react";
import { Note } from "@/types/note";
import Sidebar from "@/components/markdown-editor/Sidebar";

type ViewMode = "editor" | "preview";

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

\`\`\`
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
  updatedAt: new Date()
};

// Utility function - ID Generation
// 1. Math.random() - Returns a random floating-point number, Range: 0 ≤ number < 1, Example: 0.527839274
// 2. toString(36) - Converts the number to a base-36 string (Numbers: 0–9, Letters: a–z), Example: "0.q9f3k2x7"
// 3. substring(2, 15) - Removes the "0." at the beginning, Extracts 13 characters of randomness, Example: "0.q9f3k2x7m8ab" → "q9f3k2x7m8ab"
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function Home() {

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

  // Derived State
  const activeNote = notes.find((note) => note.id === activeNoteId);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");

  // Note Actions (CRUD)

  // 1. Create Note
  // Create a blank note
  // Adds it to the top
  // Makes it active immediately
  const handleCreateNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: "Untitled",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  // 2. Delete Note
  // Removes note from state
  // If deleted note was active, switches to next available note, or sets null
  const handleDeleteNote = (id: string) => {
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(remaining.length ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  // 3. Update Note Content
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
    <div className="h-screen flex overflow-hidden">

      {/* Sidebar Rendering (conditional) - fully controlled by parent */}
      {sidebarOpen && (
        <Sidebar 
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}
    </div>
  );

}
