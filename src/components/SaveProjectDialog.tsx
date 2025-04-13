import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";

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
      const projectData = {
        name,
        description,
        prompt,
        isPublic: isPublic === "public",
        files: JSON.stringify(files),
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
        });
      } else {
        // Create new project
        response = await axios.post(`${apiUrl}/projects`, projectData);
        toast({
          title: "Success",
          description: "Project saved successfully!",
        });
      }

      // Close the dialog
      onOpenChange(false);

      // Optionally navigate to projects page
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
          <DialogDescription>
            Save your project to access it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="My awesome project"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="A brief description of your project"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visibility" className="text-right">
              Visibility
            </Label>
            <Select value={isPublic} onValueChange={setIsPublic}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
