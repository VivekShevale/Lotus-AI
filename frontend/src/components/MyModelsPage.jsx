import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BotIcon,
  SearchIcon,
  FilterIcon,
  PlayIcon,
  DownloadIcon,
  Trash2Icon,
  EyeIcon,
  CalendarIcon,
  TrendingUpIcon,
  BarChart3Icon,
  LayersIcon,
  SparklesIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  InfoIcon,
  TargetIcon,
  FileTextIcon,
  UsersIcon,
  ShieldIcon,
  ZapIcon,
  LeafIcon,
  FlowerIcon,
  TreesIcon,
  SproutIcon,
  CrownIcon,
} from "lucide-react";
import api from "../configs/api"; // Your api instance

const MyModelsPage = () => {
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { value: "all", label: "All Models", icon: LayersIcon },
    {
      value: "linear_regression",
      label: "Linear Regression",
      icon: TrendingUpIcon,
    },
    { value: "random_forest", label: "Random Forest", icon: TreesIcon },
    { value: "decision_tree", label: "Decision Tree", icon: SproutIcon },
    { value: "svm", label: "Support Vector", icon: FlowerIcon },
    { value: "neural_network", label: "Neural Network", icon: SparklesIcon },
    { value: "gradient_boosting", label: "Gradient Boosting", icon: ZapIcon },
  ];

  const statusColors = {
    ready:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    uploading:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    error:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    processing:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  };

  const statusIcons = {
    ready: CheckCircleIcon,
    uploading: ClockIcon,
    error: XCircleIcon,
    processing: ClockIcon,
  };

  const getModelIcon = (modelType) => {
    const icons = {
      linear_regression: TrendingUpIcon,
      random_forest: TreesIcon,
      decision_tree: SproutIcon,
      svm: FlowerIcon,
      neural_network: SparklesIcon,
      gradient_boosting: ZapIcon,
      logistic_regression: BarChart3Icon,
    };
    return icons[modelType] || BotIcon;
  };

  const getModelColor = (modelType) => {
    const colors = {
      linear_regression: "from-emerald-500 to-teal-600",
      random_forest: "from-amber-500 to-orange-600",
      decision_tree: "from-green-500 to-emerald-600",
      svm: "from-violet-500 to-purple-600",
      neural_network: "from-rose-500 to-pink-600",
      gradient_boosting: "from-blue-500 to-indigo-600",
      logistic_regression: "from-cyan-500 to-blue-600",
    };
    return colors[modelType] || "from-gray-500 to-zinc-600";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (err) {
      return dateString;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🌱 Loading models from backend...");
      const response = await api.get("/api/model/list");
      console.log("✅ Backend response:", response.data);

      const rawModels = response.data.models || [];

      // Validate and format model data
      const formattedModels = rawModels.map((model, index) => {
        // Extract model ID - multiple fallbacks
        let modelId = model.model_id;
        if (!modelId && model.object_key) {
          const parts = model.object_key.split("/");
          modelId =
            parts[parts.length - 1]?.replace(".pkl", "") || `model-${index}`;
        }

        // Extract model type - prioritize existing, then from path, then fallback
        let modelType = model.model_type;
        if (!modelType || modelType === "unknown") {
          if (model.object_key) {
            const parts = model.object_key.split("/");
            if (parts.length >= 2) {
              modelType = parts[parts.length - 2]; // Get from folder name
            }
          }
        }
        if (!modelType || modelType === "unknown") {
          // Try to infer from model_id
          if (modelId && modelId.includes("linear_regression")) {
            modelType = "linear_regression";
          } else if (modelId && modelId.includes("random_forest")) {
            modelType = "random_forest";
          } else if (modelId && modelId.includes("decision_tree")) {
            modelType = "decision_tree";
          } else if (modelId && modelId.includes("svm")) {
            modelType = "svm";
          } else if (modelId && modelId.includes("neural_network")) {
            modelType = "neural_network";
          } else {
            modelType = "linear_regression"; // Default
          }
        }

        // Handle metrics
        let metrics = {};
        if (model.metrics) {
          if (typeof model.metrics === "string") {
            try {
              metrics = JSON.parse(model.metrics);
            } catch {
              metrics = {};
            }
          } else {
            metrics = model.metrics;
          }
        }

        // Ensure metrics have proper types
        const safeMetrics = {
          r2: parseFloat(metrics.r2) || 0,
          mae: parseFloat(metrics.mae) || 0,
          rmse: parseFloat(metrics.rmse) || 0,
          n_samples: parseInt(metrics.n_samples) || 0,
          accuracy: parseFloat(metrics.accuracy) || 0,
          precision: parseFloat(metrics.precision) || 0,
          recall: parseFloat(metrics.recall) || 0,
          f1: parseFloat(metrics.f1) || 0,
        };

        // Format dates
        let createdAt = model.created_at;
        if (!createdAt && model.last_modified) {
          createdAt = model.last_modified;
        }
        if (!createdAt) {
          createdAt = new Date().toISOString();
        }

        return {
          // Core identifiers
          model_id: modelId || `model-${index}`,
          model_type: modelType || "linear_regression", // Default to linear regression
          object_key: model.object_key || "",

          // Model information
          target_column: model.target_column || "Unknown Target",
          created_at: createdAt,
          n_features: parseInt(model.n_features) || 0,
          test_size: parseFloat(model.test_size) || 0.2,
          random_state: parseInt(model.random_state) || 42,

          // Performance metrics
          metrics: safeMetrics,

          // Features
          features: Array.isArray(model.features) ? model.features : [],

          // Status
          status: model.status || "ready",

          // File info
          size: parseInt(model.size) || 0,
          last_modified: model.last_modified || "",

          // Additional metadata
          library: model.library || "scikit-learn",
          version: model.version || "1.0",
        };
      });

      console.log("🌿 Formatted models:", formattedModels);
      setModels(formattedModels);
    } catch (err) {
      console.error("❌ Error loading models:", err);

      let errorMessage = "Failed to load models";
      if (err.response) {
        errorMessage =
          err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage =
          "Cannot connect to server. Please check if backend is running.";
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setModels([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteModel = async (modelId, modelType) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this model? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/api/model/delete/${modelId}?model_type=${modelType}`);

      // Show success message
      setModels((prev) => prev.filter((model) => model.model_id !== modelId));

      // Optionally show a toast notification
      alert("Model deleted successfully!");
    } catch (err) {
      console.error("Error deleting model:", err);
      alert(
        "Error deleting model: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const checkModelStatus = async (modelId, modelType) => {
    try {
      const response = await api.get(
        `/api/model/status/${modelId}?model_type=${modelType}`
      );
      return response.data.status || "ready";
    } catch (err) {
      console.error("Error checking status:", err);
      return "error";
    }
  };

  useEffect(() => {
    loadModels();

    // Poll for status updates every 10 seconds
    const interval = setInterval(() => {
      models.forEach(async (model) => {
        if (model.status === "uploading" || model.status === "processing") {
          const status = await checkModelStatus(
            model.model_id,
            model.model_type
          );
          if (status !== model.status) {
            // If status changed, refresh the list
            loadModels();
          }
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Safe filter function
  const getFilteredModels = () => {
    if (!Array.isArray(models)) return [];

    const searchTermLower = searchTerm.toLowerCase();

    return models.filter((model) => {
      if (!model || typeof model !== "object") return false;

      // Safe access with defaults
      const modelId = String(model.model_id || "");
      const modelType = String(model.model_type || "");
      const targetColumn = String(model.target_column || "");

      const matchesSearch =
        modelId.toLowerCase().includes(searchTermLower) ||
        modelType.toLowerCase().includes(searchTermLower) ||
        targetColumn.toLowerCase().includes(searchTermLower);

      const matchesFilter = filter === "all" || modelType === filter;

      return matchesSearch && matchesFilter;
    });
  };

  const filteredModels = getFilteredModels();

  const handleRefresh = () => {
    setRefreshing(true);
    loadModels();
  };

  const getModelTypeLabel = (modelType) => {
    const labels = {
      linear_regression: "Linear Regression",
      random_forest: "Random Forest",
      decision_tree: "Decision Tree",
      svm: "Support Vector Machine",
      neural_network: "Neural Network",
      gradient_boosting: "Gradient Boosting",
    };
    return labels[modelType] || modelType.replace(/_/g, " ").toUpperCase();
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white dark:from-zinc-950 dark:to-zinc-900 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BotIcon className="w-10 h-10 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Cultivating Your Models
              </h3>
              <p className="text-gray-600 dark:text-zinc-400">
                Gathering your trained models from the forest...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border-b border-emerald-100 dark:border-zinc-800 sticky top-0 z-10">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Cultivated Models
              </h1>
              <p className="text-gray-600 dark:text-zinc-400 mt-2">
                All your trained models, ready for deployment and prediction
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/models"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-medium shadow-sm"
              >
                <BotIcon className="w-4 h-4" />
                Train New Model
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search models by ID, type, or target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-emerald-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition-all duration-200 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-emerald-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 bg-white/50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm backdrop-blur-sm min-w-[180px]"
              >
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-emerald-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCwIcon
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {error ? (
          <div className="mb-6 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <AlertCircleIcon className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-rose-800 dark:text-rose-300 mb-1">
                  Error Loading Models
                </h3>
                <p className="text-rose-700 dark:text-rose-400 text-sm">
                  {error}
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCwIcon className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Stats Summary */}
        {models.length > 0 && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-xl border border-emerald-100 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <TreesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {models.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    Total Models
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-xl border border-emerald-100 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {models.filter((m) => m.status === "ready").length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    Ready for Prediction
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-xl border border-emerald-100 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <TargetIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(models.map((m) => m.target_column)).size}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    Unique Targets
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-xl border border-emerald-100 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(models.map((m) => m.model_type)).size}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    Algorithm Types
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Models Grid */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              {models.length === 0 ? (
                <BotIcon className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <SearchIcon className="w-12 h-12 text-amber-500 dark:text-amber-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {models.length === 0
                ? "No Models Cultivated Yet"
                : "No Models Found"}
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              {models.length === 0
                ? "Train your first model to start making predictions"
                : "Try adjusting your search or filter to find models"}
            </p>
            {models.length === 0 && (
              <Link
                to="/models"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                <BotIcon className="w-4 h-4" />
                Cultivate Your First Model
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredModels.map((model) => {
              const ModelIcon = getModelIcon(model.model_type);
              const modelColor = getModelColor(model.model_type);
              const StatusIcon = statusIcons[model.status] || AlertCircleIcon;
              const modelTypeLabel = getModelTypeLabel(model.model_type);

              return (
                <div
                  key={model.model_id}
                  className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-emerald-100 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-xl cursor-pointer group h-full flex flex-col hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-emerald-50 dark:border-zinc-800/50">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${modelColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-lg`}
                        >
                          <ModelIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {modelTypeLabel}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            ID: {model.model_id}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          statusColors[model.status]
                        }`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {model.status?.toUpperCase() || "READY"}
                      </span>
                    </div>

                    {/* Target Column */}
                    <div className="flex items-center gap-2">
                      <TargetIcon className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">
                        {model.target_column}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1">
                    {/* Performance Metrics */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                          Performance
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          R²: {model.metrics.r2?.toFixed(3) || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                          <div className="text-xs text-emerald-700 dark:text-emerald-300">
                            MAE
                          </div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {model.metrics.mae?.toFixed(3) || "N/A"}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            RMSE
                          </div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {model.metrics.rmse?.toFixed(3) || "N/A"}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-violet-50 dark:bg-violet-900/10 rounded-lg">
                          <div className="text-xs text-violet-700 dark:text-violet-300">
                            Features
                          </div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {model.n_features}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Created</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(model.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                          <FileTextIcon className="w-3.5 h-3.5" />
                          <span>Size</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatFileSize(model.size)}
                        </span>
                      </div>

                      {model.metrics.n_samples > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                            <UsersIcon className="w-3.5 h-3.5" />
                            <span>Samples</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {model.metrics.n_samples.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features Preview */}
                    {model.features && model.features.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2">
                          Key Features
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {model.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-[11px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-100 dark:border-emerald-800/30"
                            >
                              {feature.length > 12
                                ? feature.substring(0, 12) + "..."
                                : feature}
                            </span>
                          ))}
                          {model.features.length > 3 && (
                            <span className="px-2 py-1 text-[11px] bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-lg">
                              +{model.features.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="p-4 border-t border-emerald-50 dark:border-zinc-800/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-zinc-800/20 dark:to-emerald-900/10 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/predict/${model.model_id}?type=${model.model_type}`}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          model.status === "ready"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-md"
                            : "bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 cursor-not-allowed"
                        }`}
                        onClick={(e) => {
                          if (model.status !== "ready") {
                            e.preventDefault();
                            alert(
                              "Model is not ready for prediction yet. Please wait for upload to complete."
                            );
                          }
                        }}
                      >
                        <PlayIcon className="w-3.5 h-3.5" />
                        Predict
                      </Link>

                      <button
                        onClick={() =>
                          deleteModel(model.model_id, model.model_type)
                        }
                        className="flex items-center justify-center gap-2 px-3 py-2.5 text-rose-700 dark:text-rose-400 bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        title="Delete Model"
                      >
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Category Filter Chips */}
        {models.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setFilter(category.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === category.value
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                      : "bg-white/70 dark:bg-zinc-800/70 text-gray-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-emerald-100 dark:border-zinc-700"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {category.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State Debug Info */}
        {models.length === 0 && !loading && (
          <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <InfoIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                Debug Information
              </h4>
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-400 space-y-2">
              <p>If you expected to see models, check:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Backend server is running on port 5000</li>
                <li>Models have been trained and saved to R2</li>
                <li>CORS is properly configured</li>
                <li>Check browser console for errors</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyModelsPage;
