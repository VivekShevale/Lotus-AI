import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  PlayIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  BotIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CalendarIcon,
  UsersIcon,
  TargetIcon,
  BarChart3Icon,
  ShieldIcon,
  RefreshCwIcon,
  CopyIcon,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../configs/api";

const PredictPage = () => {
  const { modelId } = useParams();
  const [searchParams] = useSearchParams();
  const modelType = searchParams.get("type") || "linear_regression";

  const [file, setFile] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);

  // Load model info
  useEffect(() => {
    const loadModelInfo = async () => {
      try {
        const response = await api.get(
          `/api/model/info/${modelId}?model_type=${modelType}`
        );
        setModelInfo(response.data);
        console.log(response.data);
      } catch (err) {
        setError("Failed to load model information");
      }
    };

    if (modelId) {
      loadModelInfo();
    }
  }, [modelId, modelType]);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
    setPredictions(null);

    // Preview file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = e.target.result;
        let preview = [];

        if (selectedFile.name.endsWith(".csv")) {
          const lines = data.split("\n").slice(0, 6);
          preview = lines.map((line) => line.split(","));
        } else if (
          selectedFile.name.endsWith(".xls") ||
          selectedFile.name.endsWith(".xlsx")
        ) {
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          preview = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 6);
        }

        setPreviewData(preview);
      } catch (err) {
        console.error("Preview error:", err);
      }
    };

    if (selectedFile.name.endsWith(".csv")) {
      reader.readAsText(selectedFile);
    } else {
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handlePredict = async () => {
    if (!file || !modelId) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_id", modelId);
    formData.append("model_type", modelType);

    try {
      const response = await api.post("/api/model/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPredictions(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!predictions) return;

    setDownloading(true);

    // Create CSV with predictions
    let csvContent = "Prediction\n";
    predictions.predictions.forEach((pred) => {
      csvContent += `${pred}\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `predictions_${modelId}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setTimeout(() => setDownloading(false), 1000);
  };

  const handleCopyResults = () => {
    if (!predictions) return;

    const resultsText = predictions.predictions
      .map((p) => p.toString())
      .join("\n");
    navigator.clipboard.writeText(resultsText).then(() => {
      alert("Predictions copied to clipboard!");
    });
  };

  const handleReset = () => {
    setFile(null);
    setPredictions(null);
    setPreviewData([]);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".csv") ||
        droppedFile.name.endsWith(".xls") ||
        droppedFile.name.endsWith(".xlsx"))
    ) {
      handleFileChange(droppedFile);
    } else {
      setError("Please upload a valid CSV, XLS, or XLSX file");
    }
  };

  const handleAreaClick = () => fileInputRef.current?.click();

  const getModelColor = () => {
    const colors = {
      linear_regression: "from-emerald-500 to-teal-600",
      random_forest: "from-amber-500 to-orange-600",
      decision_tree: "from-blue-500 to-indigo-600",
      svm: "from-violet-500 to-purple-600",
      neural_network: "from-rose-500 to-pink-600",
    };
    return colors[modelType] || "from-gray-500 to-zinc-600";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border-b border-emerald-100 dark:border-zinc-800">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to="/my-models"
                  className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Models
                </Link>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-sm text-gray-500 dark:text-zinc-400">
                  Prediction
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Make Predictions
              </h1>
              <p className="text-gray-600 dark:text-zinc-400 mt-1">
                Use your trained model to predict on new data
              </p>
            </div>

            {modelInfo && (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${getModelColor()} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <BotIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                    Model ID
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {modelId.slice(0, 8)}...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Model Info & Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Information */}
            {modelInfo && (
              <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-emerald-100 dark:border-zinc-800 p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Model Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl">
                    <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
                      Algorithm
                    </div>
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {modelType}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl">
                    <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
                      Target
                    </div>
                    <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {modelInfo.target_column}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl">
                    <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
                      Features
                    </div>
                    <div className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {modelInfo.n_features}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 rounded-xl">
                    <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
                      R² Score
                    </div>
                    <div className="text-sm font-bold text-violet-700 dark:text-violet-300">
                      {modelInfo.metrics.accuracy}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Trained on {formatDate(modelInfo.created_at)}</span>
                  </div>
                  {modelInfo.features && (
                    <div className="flex items-start gap-2 mt-3">
                      <TargetIcon className="w-3.5 h-3.5 mt-0.5" />
                      <div>
                        <span className="font-medium">Required features:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {modelInfo.features
                            .slice(0, 5)
                            .map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800"
                              >
                                {feature}
                              </span>
                            ))}
                          {modelInfo.features.length > 5 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-lg">
                              +{modelInfo.features.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-emerald-100 dark:border-zinc-800 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Prediction Data
              </h3>

              <div
                onClick={handleAreaClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 mb-4 ${
                  isDragging
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600 scale-[1.02]"
                    : file
                    ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600"
                    : "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                <div className="space-y-4">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl transition-colors ${
                      file
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {file ? (
                      <CheckCircleIcon className="w-8 h-8" />
                    ) : (
                      <UploadCloud className="w-8 h-8" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {file
                        ? "File Ready for Prediction"
                        : "Choose File or Drag & Drop"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-zinc-400">
                      {file ? (
                        <span className="inline-flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {file.name}
                        </span>
                      ) : (
                        "CSV, XLS, XLSX files supported"
                      )}
                    </p>
                  </div>
                  {file && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Preview */}
              {previewData.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                    Data Preview
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-800">
                          {previewData[0]?.map((header, idx) => (
                            <th
                              key={idx}
                              className="px-3 py-2 text-left font-medium text-gray-700 dark:text-zinc-300 border-b border-gray-200 dark:border-zinc-700"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(1).map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                          >
                            {row.map((cell, cellIdx) => (
                              <td
                                key={cellIdx}
                                className="px-3 py-2 text-gray-600 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">
                    Showing first {previewData.length - 1} rows
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={handlePredict}
                  disabled={loading || !file}
                  className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading || !file
                      ? "bg-gray-300 dark:bg-zinc-700 cursor-not-allowed text-gray-500 dark:text-zinc-400"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-lg active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Making Predictions...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5" />
                      Make Predictions
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={downloading || !predictions}
                  className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    downloading || !predictions
                      ? "bg-gray-300 dark:bg-zinc-700 cursor-not-allowed text-gray-500 dark:text-zinc-400"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-lg active:scale-[0.98]"
                  }`}
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="w-5 h-5" />
                      Download Results
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Results Panel */}
          <div className="space-y-6">
            {/* Results Panel */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-emerald-100 dark:border-zinc-800 p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Prediction Results
                </h3>
                {predictions && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyResults}
                      className="p-2 text-gray-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-lg transition-colors"
                      title="Copy results"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2 text-gray-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-colors"
                      title="Reset"
                    >
                      <RefreshCwIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {error ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
                  <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
                    <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Prediction Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              ) : predictions ? (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                        Prediction Summary
                      </div>
                      <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-lg">
                        Complete
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {predictions.n_predictions}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">
                      predictions generated
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
                        Min Value
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {Math.min(...predictions.predictions).toFixed(4)}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
                        Max Value
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {Math.max(...predictions.predictions).toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* Predictions List */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Predictions Preview
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {predictions.predictions
                        .slice(0, 10)
                        .map((prediction, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700"
                          >
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Row {idx + 1}
                            </div>
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              {prediction.toFixed(4)}
                            </div>
                          </div>
                        ))}
                      {predictions.predictions.length > 10 && (
                        <div className="text-center text-sm text-gray-500 dark:text-zinc-500 py-2">
                          ... and {predictions.predictions.length - 10} more
                          predictions
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <div className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                      Model Information
                    </div>
                    <div className="text-xs text-gray-600 dark:text-zinc-400 space-y-1">
                      <div>ID: {predictions.model_id}</div>
                      <div>Type: {predictions.model_info?.model_type}</div>
                      <div>
                        Trained:{" "}
                        {predictions.model_info?.created_at
                          ? formatDate(predictions.model_info.created_at)
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
                  <TrendingUpIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">
                    Awaiting Predictions
                  </h4>
                  <p className="text-sm">
                    Upload your data and click "Make Predictions" to see results
                  </p>
                </div>
              )}

              {/* Quick Tips */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800">
                <h4 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  Quick Tips
                </h4>
                <ul className="text-xs text-gray-600 dark:text-zinc-400 space-y-1">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5"></div>
                    Ensure your data has all required features
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5"></div>
                    Missing values will cause prediction errors
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5"></div>
                    Results can be downloaded as CSV
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Requirements */}
            {modelInfo?.features && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 backdrop-blur-sm rounded-2xl border border-amber-100 dark:border-amber-800/30 p-5">
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                  <ShieldIcon className="w-4 h-4" />
                  Required Features
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {modelInfo.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-white/70 dark:bg-zinc-900/70 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-3">
                  Your data must contain all these features for successful
                  prediction
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictPage;
