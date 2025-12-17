import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Image,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

interface ToolbarProps {
  onInsert: (syntax: string, wrap?: boolean, placeholder?: string) => void;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  syntax: string;
  wrap?: boolean;
  placeholder?: string;
}

const buttons: ToolbarButton[] = [
  { icon: Heading1, label: "Heading 1", syntax: "# ", placeholder: "Heading 1" },
  { icon: Heading2, label: "Heading 2", syntax: "## ", placeholder: "Heading 2" },
  { icon: Heading3, label: "Heading 3", syntax: "### ", placeholder: "Heading 3" },
  { icon: Bold, label: "Bold", syntax: "**", wrap: true, placeholder: "bold text" },
  { icon: Italic, label: "Italic", syntax: "_", wrap: true, placeholder: "italic text" },
  { icon: Strikethrough, label: "Strikethrough", syntax: "~~", wrap: true, placeholder: "strikethrough" },
  { icon: Code, label: "Inline Code", syntax: "`", wrap: true, placeholder: "code" },
  { icon: Link, label: "Link", syntax: "[", wrap: true, placeholder: "link text](url" },
  { icon: Image, label: "Image", syntax: "![alt](", placeholder: "image-url)" },
  { icon: List, label: "Bullet List", syntax: "- " },
  { icon: ListOrdered, label: "Numbered List", syntax: "1. " },
  { icon: CheckSquare, label: "Task", syntax: "- [ ] " },
  { icon: Quote, label: "Quote", syntax: "> " },
  { icon: Minus, label: "Divider", syntax: "\n---\n" },
];

export function Toolbar({ onInsert }: ToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 p-2 bg-toolbar-bg border-b border-border overflow-x-auto">
      {buttons.map((btn, index) => (
        <button
          key={btn.label}
          onClick={() => onInsert(btn.syntax, btn.wrap, btn.placeholder)}
          className={cn(
            "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            index === 3 || index === 8 || index === 12 ? "ml-2" : ""
          )}
          title={btn.label}
        >
          <btn.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
