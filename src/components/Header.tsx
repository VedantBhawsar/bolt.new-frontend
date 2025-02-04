import { ArrowLeft, Code2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function Header({ prompt }: { prompt: string }) {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <div>
                <h1 className="text-lg font-semibold text-white">
                  AI Website Builder
                </h1>
                <p className="text-sm text-gray-400 max-w-2xl truncate">
                  {prompt}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 rounded-md">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Generating Code</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
