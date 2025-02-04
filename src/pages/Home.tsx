import React from "react";
import { useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: {
    preventDefault: () => void;
    target: [
      {
        value: string;
      }
    ];
  }) => {
    event.preventDefault();
    const prompt = event.target[0].value;
    if (prompt.trim()) {
      navigate("/builder", { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Wand2 className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Create Your Dream Website
          </h1>
          <p className="text-lg text-gray-300">
            Describe your website idea, and we'll help you bring it to life.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800  shadow-xl p-6"
        >
          <div className="mb-4">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              What kind of website do you want to create?
            </label>
            <Textarea
              id="prompt"
              name="prompt"
              placeholder="Describe your website idea in detail..."
              className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
          </div>
          <div className="flex justify-end mt-5">
            <Button
              type="submit"
              className="w-fit bg-blue-600 text-white py-2 px-4   hover:bg-blue-700 transition-colors"
            >
              Generate Website
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
