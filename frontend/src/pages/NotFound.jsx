import { Link } from "react-router-dom";
import { 
  Sprout, 
  Leaf, 
  Trees, 
  Home, 
  ArrowLeft,
  SearchX,
  Flower 
} from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full mx-auto text-center">
        {/* Decorative botanical elements */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-emerald-200/50 dark:border-emerald-800/30 rounded-full"></div>
            <div className="absolute w-32 h-32 border border-emerald-300/40 dark:border-emerald-700/40 rounded-full"></div>
          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-300 dark:border-emerald-500 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20">
              <SearchX className="w-12 h-12 text-emerald-500 dark:text-emerald-300" />
            </div>
            
            {/* Floating botanical icons */}
            <Sprout className="absolute -top-2 -left-4 w-8 h-8 text-emerald-400 dark:text-emerald-500 rotate-12" />
            <Leaf className="absolute -top-2 -right-4 w-8 h-8 text-emerald-500 dark:text-emerald-400 -rotate-12" />
            <Flower className="absolute -bottom-4 -left-6 w-10 h-10 text-rose-400 dark:text-rose-500 rotate-45" />
            <Trees className="absolute -bottom-4 -right-6 w-10 h-10 text-green-500 dark:text-green-400 -rotate-45" />
          </div>
        </div>

        {/* Error code with botanical styling */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <span className="text-8xl font-bold text-emerald-600 dark:text-emerald-400">4</span>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-8xl font-bold text-emerald-600 dark:text-emerald-400">4</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Path Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-md mx-auto">
            The forest path you're looking for has grown over or doesn't exist. 
            Let's guide you back to familiar trails.
          </p>
        </div>

        {/* Decorative separator */}
        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/50 dark:via-emerald-700/50 to-transparent"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-400 dark:bg-green-500"></div>
          <div className="w-2 h-2 rounded-full bg-teal-400 dark:bg-teal-500"></div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/50 dark:via-emerald-700/50 to-transparent"></div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Return to Home
          </Link>
          
          <Link
            to="/models"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-medium rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Browse Models
          </Link>
        </div>

        {/* Helpful suggestions */}
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center justify-center gap-2">
            <Sprout className="w-4 h-4" />
            Trail Tips
          </h3>
          <ul className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></div>
              Check the URL for typos or spelling errors
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></div>
              Use the search to find specific models
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></div>
              Navigate through the main menu paths
            </li>
          </ul>
        </div>

        {/* Subtle footer */}
        <div className="mt-10 pt-6 border-t border-emerald-100/50 dark:border-emerald-800/20">
          <p className="text-xs text-gray-500 dark:text-zinc-500">
            Lost in the forest? Every path leads somewhere new. 
            <span className="text-emerald-500 dark:text-emerald-400 ml-1">
              Embrace the journey.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;