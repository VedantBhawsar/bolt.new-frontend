import { useWebContainer } from "@/hooks/useWebcontainer";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2, RefreshCw, ExternalLink, Eye } from "lucide-react";
import { motion } from "framer-motion";

export function PreviewFrame() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const webContainer = useWebContainer();

  async function installDependencies() {
    if (!webContainer) return 1;

    setLoading(true);
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
    setReloading(true);
    setError("");
    try {
      await installDependencies();
      if (webContainer) {
        const devProcess = await webContainer.spawn("npm", ["run", "dev"]);
        webContainer.on("server-ready", (port, url: string) => {
          setUrl(url);
          setReloading(false);
          setLoading(false);
        });
      }
    } catch (error) {
      console.error("Error reloading preview:", error);
      setError("Failed to reload preview environment.");
      setReloading(false);
    }
  }

  async function startDevServer() {
    let retryCount = 0;
    const maxRetries = 3;

    if (!webContainer) {
      setError("WebContainer is not supported in this environment.");
      setLoading(false);
      return;
    }

    try {
      while (retryCount < maxRetries) {
        let exitCode = await installDependencies();
        if (exitCode === 0) break;
        retryCount++;

        if (retryCount >= maxRetries) {
          throw new Error("Installation failed after multiple attempts");
        }

        // Wait briefly before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const devProcess = await webContainer.spawn("npm", ["run", "dev"]);
      webContainer.on("server-ready", (port, url: string) => {
        setUrl(url);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error initializing preview:", error);
      setError("Failed to initialize preview environment.");
      setLoading(false);
    }
  }

  useEffect(() => {
    startDevServer();
  }, [webContainer]);

  const openInNewTab = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <Eye className="w-4 h-4 text-blue-400 mr-2" />
          <h2 className="text-sm font-medium text-gray-200">Live Preview</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReload}
            disabled={loading || reloading}
            className="h-8 px-2 text-gray-400 hover:text-gray-200"
          >
            {reloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          {url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="h-8 px-2 text-gray-400 hover:text-gray-200"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-hidden bg-white">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-900">
            <div className="text-red-500 mb-4">{error}</div>
            <Button
              variant="outline"
              onClick={handleReload}
              disabled={reloading}
              className="flex items-center"
            >
              {reloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-900 text-gray-300">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-400" />
            </motion.div>
            <p className="text-center">Initializing preview environment...</p>
            <p className="text-xs text-gray-500 mt-2">
              This might take a few moments
            </p>
          </div>
        ) : !url ? (
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-900 text-gray-300">
            <p className="mb-2">Waiting for development server...</p>
          </div>
        ) : (
          <iframe
            src={url}
            title="Live Preview"
            className="w-full h-full border-0"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
