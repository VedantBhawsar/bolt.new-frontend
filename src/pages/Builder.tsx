import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import FileExplorer from "../components/FileExplorer";
import { ChatWidget } from "@/components/ChatWidget";
import Header from "@/components/Header";
import { apiUrl } from "@/config";
import axios from "axios";
import { parseXml } from "@/lib/steps";
import { FileItem, Step, StepType } from "@/types";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebContainer } from "@/hooks/useWebcontainer";
import { CodeEditor } from "@/components/CodeEditor";
import { PreviewFrame } from "@/components/PreviewFrame";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

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

      <div className="grid h-full grid-cols-8 gap-4 p-4">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-2 space-y-4"
        >
          <StepList loading={loading} steps={steps} />
          <ChatWidget prompt={prompt} handleMessageSend={handleMessageSend} />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-6"
        >
          <Card className="bg-gray-800 border-gray-700 h-full">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FileExplorer files={files} onFileSelect={setSelectedFile} />
                </div>
                <div className="bg-gray-900 rounded-none border border-gray-700">
                  {selectedFile && selectedFile.type === "file" ? (
                    <Tabs defaultValue="code" className="w-full">
                      <TabsList className="w-full bg-gray-800 border-b border-gray-700">
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="code" className="p-0">
                        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                          <span className="text-sm text-gray-300">
                            {selectedFile.name}
                          </span>
                        </div>
                        <div className="h-[calc(100vh-300px)]">
                          <CodeEditor file={selectedFile} />
                        </div>
                      </TabsContent>
                      <TabsContent value="preview" className="p-0">
                        <div className="h-[calc(100vh-300px)]">
                          {webcontainer ? (
                            <PreviewFrame
                              files={files}
                              webContainer={webcontainer}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-gray-500"
                              >
                                Initializing development environment...
                              </motion.div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Select a file to view its contents
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Builder;

export function LoadingComponent() {
  return <Skeleton />;
}

export function StepCard({ step }: { step: Step }) {
  return (
    <div className="p-3 px-2  border-gray-800 border grid grid-cols-5 hover:cursor-pointer hover:bg-white/10 ">
      <div className="flex justify-center ">
        {step.status === "completed" ? (
          <CheckCircle className="w-5 h-5" />
        ) : step.status === "in-progress" ? (
          <Clock className="w-5 h-5" />
        ) : step.status === "pending" ? (
          <Circle />
        ) : null}
      </div>
      <div className="col-span-4">
        <h1>{step.title}</h1>
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
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle>Steps</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] overflow-y-scroll">
          {loading && <Skeleton />}
          {steps?.map((step, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <StepCard step={step} />
            </motion.div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
