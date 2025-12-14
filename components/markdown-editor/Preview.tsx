import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PreviewProps {
  content: string;
}

export default function Preview({ content }: PreviewProps) {
  return (
    <div className="flex-1 bg-preview-bg border-l border-border overflow-auto">
      <div className="p-6 max-w-3xl mx-auto">
        {content ? (
          <div className="markdown-preview animate-fade-in">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-12">
            <p className="text-lg">Preview will appear here</p>
            <p className="text-sm mt-2">Start typing in the editor</p>
          </div>
        )}
      </div>
    </div>
  );
}
