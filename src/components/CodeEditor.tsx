import React from "react";
import Editor from "@monaco-editor/react";
import { FileItem } from "../types";

interface CodeEditorProps {
  file: FileItem | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

  const getLanguageFromFileName = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
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
      default:
        return "plaintext";
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={getLanguageFromFileName(file.name)}
      theme="vs-dark"
      value={file.content || ""}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "off",
        scrollBeyondLastLine: false,
      }}
    />
  );
}
