import React from "react";
import { File, Folder, ChevronRight, ChevronDown } from "lucide-react";
import type { FileItem as FileType } from "../types";

interface FileExplorerProps {
  files: FileType[];
  onFileSelect: (file: FileType) => void;
}

const FileExplorerItem: React.FC<{
  file: FileType;
  depth?: number;
  onFileSelect: (file: FileType) => void;
}> = ({ file, depth = 0, onFileSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-3 px-3 py-2 
          transition-all duration-200 ease-in-out
          ${isHovered ? 'bg-gray-100/5' : ''}
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
            absolute left-0 top-0 w-0.5 h-full bg-blue-500 
            transition-all duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0'}
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
          <Folder className={`w-4 h-4 ${isOpen ? 'text-yellow-400' : 'text-yellow-500'} transition-colors duration-200`} />
        ) : (
          <File className="w-4 h-4 text-blue-400" />
        )}

        <span className={`
          text-sm font-medium
          ${file.type === "file" ? "text-gray-300 group-hover:text-blue-400" : "text-gray-200"}
          transition-colors duration-200
        `}>
          {file.name}
        </span>
      </div>

      {file.type === "folder" && (
        <div className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}>
          {file.children?.map((child, index) => (
            <FileExplorerItem
              key={index}
              file={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Folder className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Explorer</h2>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {files.map((file, index) => (
          <FileExplorerItem key={index} file={file} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;