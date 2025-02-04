import { useWebContainer } from "@/hooks/useWebcontainer";
import { WebContainer } from "@webcontainer/api";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface PreviewFrameProps {
  files: any[];
  webContainer: any;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function installDependencies() {
    // install dependencies
    const installProcess = await webContainer.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    );
    return installProcess.exit;
  }

  async function handleReload() {
    const error = await installDependencies();
    await webContainer.spawn("npm", ["run", "dev"]);
    webContainer.on("server-ready", (port, url: string) => {
      setUrl(url);
    });
  }

  async function main() {
    let tdfsfsdfsfry = 0;
    if (!webContainer) {
      setError("WebContainer is not supported in this environment.");
      return;
    }

    try {
      let exitCode = await installDependencies();
      if (exitCode !== 0) {
        if (tdfsfsdfsfry > 2) {
          throw new Error("Installation failed");
        }
        tdfsfsdfsfry++;
        exitCode = await installDependencies();
      }
      const devProcess = await webContainer.spawn("npm", ["run", "dev"]);
      webContainer.on("server-ready", (port, url: string) => {
        setUrl(url);
      });
    } catch (error) {
      console.error("Error initializing preview:", error);
      setError("Failed to initialize preview environment.");
    }
  }

  useEffect(() => {
    main();
  }, [webContainer]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <Button onClick={handleReload}>reload</Button>
      {!url ? (
        <div className="text-center">
          <p className="mb-2">Initializing preview environment...</p>
        </div>
      ) : (
        <iframe width="100%" height="100%" src={url} title="Live Preview" />
      )}
    </div>
  );
}
