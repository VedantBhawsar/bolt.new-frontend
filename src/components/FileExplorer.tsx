import React from "react";
import {
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileJson,
  FileText,
} from "lucide-react";
import type { FileItem as FileType } from "../types";

interface FileExplorerProps {
  files: FileType[];
  onFileSelect: (file: FileType) => void;
  selectedFile: FileType | null;
}

const FileExplorerItem: React.FC<{
  file: FileType;
  depth?: number;
  onFileSelect: (file: FileType) => void;
  selectedFile: FileType | null;
}> = ({ file, depth = 0, onFileSelect, selectedFile }) => {
  const [isOpen, setIsOpen] = React.useState(depth === 0); // Auto-open first level
  const [isHovered, setIsHovered] = React.useState(false);

  const isSelected = selectedFile?.path === file.path;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext === "json") return <FileJson className="w-4 h-4 text-yellow-500" />;
    if (["js", "jsx", "ts", "tsx"].includes(ext || ""))
      return <FileCode className="w-4 h-4 text-blue-400" />;
    if (["md", "txt"].includes(ext || ""))
      return <FileText className="w-4 h-4 text-gray-400" />;
    if (["html", "htm"].includes(ext || ""))
      return <FileCode className="w-4 h-4 text-orange-400" />;
    if (ext === "css") return <FileCode className="w-4 h-4 text-purple-400" />;

    return <File className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-3 px-3 py-2 
          transition-all duration-200 ease-in-out
          ${isHovered ? "bg-gray-800" : ""}
          ${isSelected ? "bg-gray-700" : ""}
          ${file.type === "file" ? "hover:text-blue-400" : ""}
          relative group
        `}
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        onClick={() => {
          if (file.type === "folder") {
            setIsOpen(!isOpen);
          } else {
            onFileSelect(file);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover indicator */}
        <div
          className={`
            absolute left-0 top-0 w-1 h-full bg-blue-500 
            transition-all duration-200
            ${
              isSelected
                ? "opacity-100"
                : isHovered
                ? "opacity-70"
                : "opacity-0"
            }
          `}
        />

        <div className="w-4 flex items-center">
          {file.type === "folder" && (
            <div className="transition-transform duration-200 ease-in-out">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}
        </div>

        {file.type === "folder" ? (
          <Folder
            className={`w-4 h-4 ${
              isOpen ? "text-yellow-400" : "text-yellow-500"
            } transition-colors duration-200`}
          />
        ) : (
          getFileIcon(file.name)
        )}

        <span
          className={`
          text-sm font-medium
          ${isSelected ? "text-blue-400" : ""}
          ${
            file.type === "file"
              ? "text-gray-300 group-hover:text-blue-400"
              : "text-gray-200"
          }
          transition-colors duration-200
        `}
        >
          {file.name}
        </span>
      </div>

      {file.type === "folder" && (
        <div
          className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
        `}
        >
          {file.children?.map((child, index) => (
            <FileExplorerItem
              key={index}
              file={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  onFileSelect,
  selectedFile,
}) => {
  // Sort files: folders first, then files, both alphabetically
  const sortedFiles = [...files].sort((a, b) => {
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="h-full flex flex-col bg-gray-900 border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800 flex items-center">
        <Folder className="w-4 h-4 text-yellow-500 mr-2" />
        <h2 className="text-sm font-medium text-gray-200">Project Files</h2>
      </div>

      <div className="overflow-y-auto flex-grow">
        {sortedFiles.map((file, index) => (
          <FileExplorerItem
            key={index}
            file={file}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}

        {files.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No files yet
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
