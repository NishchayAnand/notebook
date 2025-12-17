"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { ChatMessage } from '@/app/types/note';
import { getSessionId } from '@/app/lib/utils';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
}

export function AIChatSidebar({ isOpen, onClose, currentContent }: AIChatSidebarProps) {
  
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your AI writing assistant. I can help you with your notes - ask me to summarize, expand, edit, or generate new content. How can I help you today?",
        timestamp: new Date(),
        },
    ]);

    const [input, setInput] = useState('');
    const [remaining, setRemaining] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
        inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        // show user message immediately
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-session-id": getSessionId(),
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "user",
                            content: userMessage.content
                        }
                    ]
                })
            });

            const data = await res.json();

            if(!res.ok) {
                throw new Error(
                    data.message || data.error || "AI request failed"
                );
            }

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.reply,
                timestamp: new Date()
            };

            // Append AI response
            setMessages((prev) => [...prev, assistantMessage]);
            setRemaining(data.remaining);

        } catch (error: any) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: "assistant",
                content: `⚠️ ${error.message}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);

        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 h-full flex flex-col bg-sidebar border-l border-border">
            <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">AI Assistant</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-3 overflow-hidden" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                message.role === 'assistant'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {message.role === 'assistant' ? (
                                    <Bot className="h-4 w-4" />
                                    ) : (
                                    <User className="h-4 w-4" />
                                )}
                            </div>
                            <div
                                className={`markdown-preview flex-1 p-3 rounded-lg text-sm ${
                                    message.role === 'assistant'
                                        ? 'bg-muted/50 text-foreground'
                                        : 'bg-primary text-primary-foreground'
                                }`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content}
                                </ReactMarkdown>
                                
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex-1 p-3 rounded-lg bg-muted/50">
                                <div className="flex gap-1">
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask AI anything..."
                        className="flex-1 bg-background/50"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>

                {remaining !== null && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                    🧠 Messages left today: {remaining} / 10
                    </p>
                )}
            </div>
        </div>
    );
}
