import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { FileItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Save, Copy, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readonly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readonly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const getLanguageFromExtension = (ext?: string) => {
    if (!ext) return "javascript";

    switch (ext.toLowerCase()) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "py":
        return "python";
      default:
        return "plaintext";
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(value || "");
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <Code className="h-4 w-4 text-blue-400 mr-2" />
          <span className="text-sm text-gray-300">
            {language ? getLanguageFromExtension(language) : "javascript"}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="h-8 px-2 text-gray-400 hover:text-gray-200"
          >
            {copied ? (
              <ClipboardCheck className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-grow">
        <Editor
          height="100%"
          language={getLanguageFromExtension(language)}
          value={value || ""}
          onChange={(value) => onChange(value || "")}
          theme="vs-dark"
          options={{
            readOnly: readonly,
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "phase",
            cursorSmoothCaretAnimation: "on",
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
