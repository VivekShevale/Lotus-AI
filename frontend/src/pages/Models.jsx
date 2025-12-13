import { useState } from "react";
import { Link } from "react-router-dom";
import { colors, icons, models } from "../data/models";
import {
  BotIcon,
  SearchIcon,
  FilterIcon,
  PlayIcon,
  SproutIcon,
  FlowerIcon,
  LeafIcon,
  TreesIcon,
  Sun,
  CrownIcon, // Added CrownIcon for exclusive badge
} from "lucide-react";

const ModelsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const categories = [
    { value: "all", label: "All Models", icon: FlowerIcon },
    { value: "regression", label: "Growth Regression", icon: SproutIcon },
    {
      value: "classification",
      label: "Species Classification",
      icon: TreesIcon,
    },
    { value: "clustering", label: "Habitat Clustering", icon: FlowerIcon },
    { value: "ensemble", label: "Forest Ensembles", icon: TreesIcon },
    { value: "neural", label: "Neural Roots", icon: LeafIcon },
  ];

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.useCases.some((useCase) =>
        useCase.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesFilter = filter === "all" || model.category === filter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (category) => {
    const colors = {
      regression:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30",
      classification:
        "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800/30",
      clustering:
        "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:border-fuchsia-800/30",
      ensemble:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30",
      neural:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30",
    };
    return (
      colors[category] ||
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
    );
  };

  const getModelIcon = (category) => {
    return icons[category] || BotIcon;
  };

  const getIconColor = (category) => {
    return colors[category] || "from-blue-400 to-purple-500";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Train Model
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 mt-1">
              Select an algorithm and upload your data to train a model
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search learning algorithms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-rose-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition-all duration-200 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-rose-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 bg-white/50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm backdrop-blur-sm"
              >
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <option
                      key={category.value}
                      value={category.value}
                      className="flex items-center gap-2"
                    >
                      {category.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((model) => {
            const ModelIcon = getModelIcon(model.category);
            return (
              <Link
                key={model.id}
                to={`/models/${model.slug}`}
                className="block"
              >
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-rose-100 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-lg dark:hover:shadow-emerald-900/20 cursor-pointer group h-full flex flex-col hover:-translate-y-1">
                  {/* Card Header */}
                  <div className="p-5 border-b border-rose-50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${getIconColor(
                          model.category
                        )} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-sm`}
                      >
                        <ModelIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-sm truncate">
                              {model.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                              {model.library}
                            </p>
                          </div>
                          {/* Exclusive Badge */}
                          {model.Exclusive && (
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium">
                                <CrownIcon className="w-2.5 h-2.5" />
                                Exclusive
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1">
                    <p className="text-gray-600 dark:text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                      {model.description}
                    </p>

                    {/* Category Badge */}
                    <div className="mb-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(
                          model.category
                        )}`}
                      >
                        {categories.find((c) => c.value === model.category)
                          ?.label || model.category}
                      </span>
                    </div>

                    {/* Model Metadata */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-gray-500 dark:text-zinc-500">
                        Training
                      </span>
                      <span className="font-medium text-gray-700 dark:text-zinc-300">
                        {model.trainingTime}
                      </span>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 dark:text-zinc-500 mb-2">
                        Applications:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {model.useCases.slice(0, 3).map((useCase, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-[11px] bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-100 dark:border-rose-800/30"
                          >
                            {useCase}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 border-t border-rose-50 dark:border-zinc-800/50 bg-gradient-to-r from-rose-50/30 to-emerald-50/30 dark:from-zinc-800/20 dark:to-emerald-900/10 rounded-b-2xl">
                    <div className="flex items-center justify-center group-hover:gap-2 transition-all duration-300">
                      <span className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-xs font-medium transition-colors">
                        <PlayIcon className="w-3 h-3" />
                        Cultivate Model
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Empty State */}
        {filteredModels.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-yellow-200 dark:bg-yellow-900/40 rounded-full flex items-center justify-center mx-auto mb-6 transition-shadow duration-300">
              <Sun
                className="w-10 h-10 text-yellow-500 dark:text-yellow-300"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No models found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search terms to find available
              models.
            </p>
          </div>
        )}
        
        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === category.value
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-white/50 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-rose-100 dark:border-zinc-700"
                }`}
              >
                <Icon className="w-3 h-3" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;