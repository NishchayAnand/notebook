"use client"

import { useState } from "react";
import { Note } from "@/app/types/note";
import { FileText, Plus, Search, Trash2 } from "lucide-react"; 
import { cn } from "@/app/lib/utils";

interface SidebarProps {
    notes: Note[];
    activeNoteId: string | null;
    onSelectNote: (id: string) => void;
    onCreateNote: () => void;
    onDeleteNote: (id: string) => void;
}

export default function Sidebar({
    notes,
    activeNoteId,
    onSelectNote,
    onCreateNote,
    onDeleteNote
}: SidebarProps) {

    const [search, setSearch] = useState("");

    // Derived State
    const filteredNotes = notes.filter((note) => 
        note.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <aside className="w-64 h-hull bg-sidebar border-r border-sidebar-border flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border">

                {/* Icon + Add Button */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary-foreground" />
                        </div>
                        Notebook
                    </h1>
                    <button
                        onClick={onCreateNote}
                        className="p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <input
                        type="text"
                        placeholder="Search Notes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-secondary rounded-md text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
            </div> 

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-2">
                {filteredNotes.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                        {notes.length === 0 ? "No notes yet" : "No matching notes"}
                    </div>
                ):(
                    <div className="space-y-1">
                        {filteredNotes.map( (note) => (
                            <div
                                key={note.id}
                                onClick={() => onSelectNote(note.id)}
                                className={cn(
                                    "group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all animate-fade-in",
                                    activeNoteId === note.id
                                        ? "bg-primary/20 text-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                )}
                            >
                                <FileText className="w-4 h-4 shrink-0" />
                                <span className="flex-1 truncate text-sm">{note.title}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteNote(note.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                                    title="Delete note"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-sidebar-border">
                <div className="text-sm text-muted-foreground text-center">
                    {notes.length} note{notes.length !== 1 ? "s": ""}
                </div>
            </div>

        </aside>
    );
}