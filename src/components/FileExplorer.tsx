import React from 'react';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import type { File as FileType } from '../types';

interface FileExplorerProps {
  files: FileType[];
  onFileSelect: (file: FileType) => void;
}

const FileExplorerItem: React.FC<{ file: FileType; depth?: number; onFileSelect: (file: FileType) => void }> = ({ 
  file, 
  depth = 0,
  onFileSelect
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-800 cursor-pointer ${file.type === 'file' ? 'hover:text-blue-400' : ''}`}
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={() => {
          if (file.type === 'folder') {
            setIsOpen(!isOpen);
          } else {
            onFileSelect(file);
          }
        }}
      >
        <div className="w-4 flex items-center">
          {file.type === 'folder' && (
            isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
        {file.type === 'folder' ? (
          <Folder className="w-4 h-4 text-yellow-500" />
        ) : (
          <File className="w-4 h-4 text-blue-400" />
        )}
        <span className="text-sm text-gray-300">{file.name}</span>
      </div>
      {file.type === 'folder' && isOpen && file.children?.map((child, index) => (
        <FileExplorerItem key={index} file={child} depth={depth + 1} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  return (
    <div className="h-full bg-gray-900 border-l border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">File Explorer</h2>
      </div>
      <div className="overflow-y-auto">
        {files.map((file, index) => (
          <FileExplorerItem key={index} file={file} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;