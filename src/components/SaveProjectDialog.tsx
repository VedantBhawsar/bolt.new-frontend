import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "@/config";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Globe, Lock } from "lucide-react";

interface SaveProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  files: any[];
  projectId?: string;
}

export function SaveProjectDialog({
  open,
  onOpenChange,
  prompt,
  files,
  projectId,
}: SaveProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState("private");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // If projectId is provided, load existing project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (projectId && open) {
        try {
          const response = await axios.get(`${apiUrl}/projects/${projectId}`);
          const projectData = response.data;

          setName(projectData.name || "");
          setDescription(projectData.description || "");
          setIsPublic(projectData.isPublic ? "public" : "private");
        } catch (error) {
          console.error("Error fetching project data:", error);
          toast({
            title: "Error",
            description: "Failed to load project data",
            variant: "destructive",
          });
        }
      }
    };

    fetchProjectData();
  }, [projectId, open, toast]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Only reset if not editing an existing project
      if (!projectId) {
        setName("");
        setDescription("");
        setIsPublic("private");
      }
    }
  }, [open, projectId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Process files to ensure they're serializable
      const processedFiles = files.map((file) => {
        // Create a clean copy of the file without any circular references
        return {
          name: file.name,
          type: file.type,
          path: file.path,
          content: file.content,
          children: file.children
            ? file.children.map((child) => ({
                name: child.name,
                type: child.type,
                path: child.path,
                content: child.content,
              }))
            : [],
        };
      });

      const projectData = {
        name,
        description,
        prompt,
        isPublic: isPublic === "public",
        files: JSON.stringify(processedFiles),
      };

      let response;

      if (projectId) {
        // Update existing project
        response = await axios.put(
          `${apiUrl}/projects/${projectId}`,
          projectData
        );
        toast({
          title: "Success",
          description: "Project updated successfully!",
          variant: "default",
        });
      } else {
        // Create new project
        response = await axios.post(`${apiUrl}/projects`, projectData);
        toast({
          title: "Success",
          description: "Project saved successfully!",
          variant: "default",
        });
      }

      // Close the dialog
      onOpenChange(false);

      // Navigate to projects page
      navigate("/projects");
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-100 flex items-center">
            <Save className="mr-2 h-5 w-5 text-blue-400" />
            {projectId ? "Update Project" : "Save Project"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {projectId
              ? "Update your project details below."
              : "Save your project to access it later."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-gray-300">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My awesome project"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              placeholder="A brief description of your project"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visibility" className="text-right text-gray-300">
              Visibility
            </Label>
            <Select value={isPublic} onValueChange={setIsPublic}>
              <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-gray-100">
                <SelectItem
                  value="private"
                  className="focus:bg-gray-600 focus:text-white"
                >
                  <div className="flex items-center">
                    <Lock className="mr-2 h-4 w-4 text-yellow-400" />
                    <span>Private</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="public"
                  className="focus:bg-gray-600 focus:text-white"
                >
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-green-400" />
                    <span>Public</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {projectId ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {projectId ? "Update Project" : "Save Project"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
