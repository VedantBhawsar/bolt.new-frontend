import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "@/config";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, Eye, Globe, Lock } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  prompt: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchProjects();
  }, [isAuthenticated, navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/projects/user`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load your projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await axios.delete(`${apiUrl}/projects/${id}`);
      setProjects(projects.filter((project) => project.id !== id));
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePublicStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`${apiUrl}/projects/${id}`, {
        isPublic: !currentStatus,
      });

      // Update the local state to reflect the change
      setProjects(
        projects.map((project) =>
          project.id === id ? { ...project, isPublic: !currentStatus } : project
        )
      );

      toast({
        title: "Success",
        description: `Project is now ${!currentStatus ? "public" : "private"}.`,
      });
    } catch (error) {
      console.error("Error updating project visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update project visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openProject = (project: Project) => {
    navigate("/builder", {
      state: { prompt: project.prompt, projectId: project.id },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <Button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-medium text-gray-300 mb-4">
              No projects yet
            </h2>
            <p className="text-gray-400 mb-6">
              Create your first project by describing what you want to build.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-medium text-white truncate">
                      {project.name}
                    </h2>
                    <div className="flex space-x-1">
                      {project.isPublic ? (
                        <Globe className="h-4 w-4 text-green-400" />
                      ) : (
                        <Lock className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <p className="text-gray-500 text-xs mb-4">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        togglePublicStatus(project.id, project.isPublic)
                      }
                    >
                      {project.isPublic ? "Make Private" : "Make Public"}
                    </Button>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openProject(project)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteProject(project.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
