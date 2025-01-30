import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import FileExplorer from "../components/FileExplorer";
import { ChatWidget } from "@/components/ChatWidget";
import Header from "@/components/Header";

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

  const steps = [
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

  const files = [
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
      <Header prompt="hello world" />

      <div className="grid h-full grid-cols-8 ">
        <div className="col-span-2 p-5">
          <ChatWidget />
        </div>
        <div className="col-span-6  h-full  p-5 ">
          <div className="h-full rounded-lg">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
            <div className="overflow-hidden max-h-full h-80 bg-gray-900 border-t border-gray-700">
              {selectedFile && selectedFile.type === "file" ? (
                <div className="h-full flex flex-col">
                  <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <span className="text-sm text-gray-300">
                      {selectedFile.name}
                    </span>
                  </div>
                  <div className="flex-1 ">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
