import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import FileExplorer from "../components/FileExplorer";
import { ChatWidget } from "@/components/ChatWidget";
import Header from "@/components/Header";
import { apiUrl } from "@/config";
import axios from "axios";
import { parseXml } from "@/lib/steps";
import { FileItem, Step, StepType } from "@/types";
import {
  CheckCircle,
  Circle,
  Clock,
  Save,
  Terminal,
  MonitorPlay,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebContainer } from "@/hooks/useWebcontainer";
import { CodeEditor } from "@/components/CodeEditor";
import { PreviewFrame } from "@/components/PreviewFrame";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { SaveProjectDialog } from "@/components/SaveProjectDialog";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Builder: React.FC = () => {
  const location = useLocation();
  const prompt = location.state?.prompt as string;
  const [selectedFile, setSelectedFile] = React.useState<FileItem | null>(null);
  const [responseHistory, setResponseHistory] = useState([]);
  const [fileContents, setFileContents] = React.useState<string>("");
  const [steps, setSteps] = useState<Step[]>();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = React.useState<FileItem[]>([]);
  const webcontainer = useWebContainer();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const projectId = location.state?.projectId as string;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("editor");

  const getFileContent = (file: FileItem) => {
    return file.content;
  };

  React.useEffect(() => {
    if (selectedFile && selectedFile.type === "file") {
      setFileContents(getFileContent(selectedFile));
    }
  }, [selectedFile]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      ?.filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = [...originalFiles];
          const finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            const currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              const file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              /// in a folder
              const folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps?.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function initBuilder() {
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/template`, {
        prompt: prompt.trim(),
      });

      const { uiPrompts, prompts } = response.data;
      setSteps(
        parseXml(uiPrompts[0]).map((x: Step) => ({
          ...x,
          status: "pending",
        }))
      );

      setResponseHistory((prev) => [...prompts, prompt]);

      const response1 = await axios.post(`${apiUrl}/chat`, {
        messages: [...prompts, prompt].map((prompt) => ({
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        })),
      });

      setSteps((prev) => prev?.concat(...parseXml(response1.data.message)));
      console.log(response1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initBuilder();
  }, []);

  async function handleMessageSend(newPrompt: string) {
    if (!newPrompt) {
      return;
    }
    const response1 = await axios.post(`${apiUrl}/chat`, {
      messages: [...responseHistory, newPrompt].map((prompt) => ({
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      })),
    });

    setSteps((prev) => prev?.concat(...parseXml(response1.data.message)));
  }

  if (!prompt) {
    return <Navigate to="/" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gray-900 text-white"
    >
      <Header prompt={prompt} />

      <div className="grid h-[calc(100vh-5rem)] grid-cols-8 gap-4 p-4">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-2 flex flex-col space-y-4"
        >
          <Card className="flex-shrink-0 border-gray-700 bg-gray-800/50 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-blue-400">
                Build Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StepList loading={loading} steps={steps} />
            </CardContent>
          </Card>

          <Card className="flex-grow border-gray-700 bg-gray-800/50 shadow-lg overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-blue-400">
                Chat Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0">
              <ChatWidget
                prompt={prompt}
                handleMessageSend={handleMessageSend}
              />
            </CardContent>
          </Card>

          {isAuthenticated && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setSaveDialogOpen(true)}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Project
            </Button>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-6 space-y-4"
        >
          <Card className="border-gray-700 bg-gray-800/50 shadow-lg overflow-hidden h-[calc(100vh-7rem)]">
            <Tabs
              defaultValue="editor"
              className="h-full flex flex-col"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <div className="border-b border-gray-700 px-4">
                <TabsList className="bg-transparent mt-2">
                  <TabsTrigger
                    value="editor"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400"
                  >
                    <Terminal className="mr-2 h-4 w-4" />
                    Code Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400"
                  >
                    <MonitorPlay className="mr-2 h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="editor"
                className="flex-grow flex overflow-hidden m-0 p-0"
              >
                <div className="w-1/4 border-r border-gray-700 overflow-auto">
                  <FileExplorer
                    files={files}
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                  />
                </div>
                <div className="w-3/4 h-full overflow-hidden">
                  {selectedFile && selectedFile.type === "file" ? (
                    <CodeEditor
                      value={fileContents}
                      onChange={(value) => {
                        setFileContents(value);
                        if (selectedFile) {
                          selectedFile.content = value;
                          setFiles([...files]);
                        }
                      }}
                      language={selectedFile?.name?.split(".").pop() || ""}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Select a file to edit</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-grow m-0 p-0">
                <PreviewFrame />
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      <SaveProjectDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        prompt={prompt}
        files={files}
        projectId={projectId}
      />
    </motion.div>
  );
};

export default Builder;

export function LoadingComponent() {
  return <div>Loading...</div>;
}

export function StepCard({ step }: { step: Step }) {
  return (
    <div className="flex items-start space-x-3 py-2 px-3 rounded-md bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        {step.status === "completed" ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : step.status === "pending" ? (
          <Clock size={16} className="text-yellow-500 animate-pulse" />
        ) : (
          <Circle size={16} className="text-gray-500" />
        )}
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{step.title}</p>
        <p className="text-xs text-gray-400 truncate">{step.description}</p>
      </div>
    </div>
  );
}

export function StepList({
  loading,
  steps,
}: {
  loading: boolean;
  steps: Step[];
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="h-4 w-4 rounded-full bg-gray-700" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full bg-gray-700" />
              <Skeleton className="h-3 w-4/5 bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-400 text-sm">No steps found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
      <div className="space-y-2">
        {steps.map((step, index) => (
          <StepCard key={index} step={step} />
        ))}
      </div>
    </ScrollArea>
  );
}
