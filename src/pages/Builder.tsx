import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import { ArrowLeft, Code2, Sparkles } from "lucide-react";
import StepsList from "../components/StepsList";
import FileExplorer from "../components/FileExplorer";
import type { Step, File } from "../types";

const Builder: React.FC = () => {
  const location = useLocation();
  const prompt = location.state?.prompt;
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileContents, setFileContents] = React.useState<string>("");
  const [editorKey, setEditorKey] = React.useState(0);

  // Mock file contents - in a real app, this would come from your backend
  const getFileContent = (file: File) => {
    return `// ${file.name}\n// This is a mock content for demonstration\n\nfunction Example() {\n  return <div>Content of ${file.name}</div>;\n}`;
  };

  // Update file contents when a file is selected
  React.useEffect(() => {
    if (selectedFile && selectedFile.type === "file") {
      setFileContents(getFileContent(selectedFile));
    }
  }, [selectedFile]);

  // Handle split resize end
  const handleSplitDragEnd = () => {
    setEditorKey((prev) => prev + 1);
  };

  // Redirect if no prompt is provided
  if (!prompt) {
    return <Navigate to="/" replace />;
  }

  const steps: Step[] = [
    {
      id: 1,
      title: "Analyzing Prompt",
      description:
        "Processing your requirements and planning the website structure",
      status: "completed",
    },
    {
      id: 2,
      title: "Setting Up Project",
      description: "Creating project files and installing dependencies",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Building Components",
      description: "Generating React components based on your requirements",
      status: "pending",
    },
    {
      id: 4,
      title: "Styling",
      description: "Applying styles and making your website beautiful",
      status: "pending",
    },
  ];

  const files: File[] = [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "components",
          type: "folder",
          children: [
            { name: "Header.tsx", type: "file" },
            { name: "Footer.tsx", type: "file" },
          ],
        },
        { name: "App.tsx", type: "file" },
        { name: "main.tsx", type: "file" },
      ],
    },
    {
      name: "public",
      type: "folder",
      children: [{ name: "index.html", type: "file" }],
    },
  ];

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
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <a
                href="/"
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </a>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-xl">
                  <Sparkles className="w-6 h-6 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    AI Website Builder
                  </h1>
                  <p className="text-sm text-gray-300/90 mt-1 max-w-2xl truncate">
                    {prompt}
                    {!prompt && (
                      <span className="italic text-gray-500">
                        Start describing your website...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2.5 px-4 py-2.5 bg-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-800/50">
                <div className="animate-pulse">
                  <Code2 className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Generating Code
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Split
        className="flex-1 flex"
        sizes={[20, 80]}
        minSize={200}
        gutterSize={4}
        onDragEnd={handleSplitDragEnd}
        gutterStyle={() => ({
          backgroundColor: "#374151",
          cursor: "col-resize",
        })}
      >
        <div className="overflow-y-auto">
          <StepsList steps={steps} />
        </div>
        <Split
          direction="vertical"
          sizes={[40, 60]}
          minSize={100}
          gutterSize={4}
          onDragEnd={handleSplitDragEnd}
          gutterStyle={() => ({
            backgroundColor: "#374151",
            cursor: "row-resize",
          })}
        >
          <div className="overflow-y-auto">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>
          <div className="overflow-hidden bg-gray-900 border-t border-gray-700">
            {selectedFile && selectedFile.type === "file" ? (
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="text-sm text-gray-300">
                    {selectedFile.name}
                  </span>
                </div>
                <div className="flex-1">
                  <Editor
                    key={editorKey}
                    height="100%"
                    language={getLanguageFromFileName(selectedFile.name)}
                    value={fileContents}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      readOnly: true,
                      lineNumbers: "on",
                      renderLineHighlight: "all",
                      scrollbar: {
                        vertical: "visible",
                        horizontal: "visible",
                      },
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a file to view its contents
              </div>
            )}
          </div>
        </Split>
      </Split>
    </div>
  );
};

export default Builder;
