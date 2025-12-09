import { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  InfoIcon,
  DownloadIcon,
  AlertCircle,
  Sparkles,
  Trash2,
  Filter,
  Layers,
  Scissors,
  Wand2,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Leaf,
  Flower,
  Trees,
  Sprout,
  Droplets,
  Sun,
  CloudRain,
  LeafyGreenIcon,
  RecycleIcon,
} from "lucide-react";
import api from "../configs/api";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeCleaningStep, setActiveCleaningStep] = useState(1);

  const [cleaningOptions, setCleaningOptions] = useState([
    {
      id: 1,
      name: "Remove Duplicates",
      icon: <Trees className="w-4 h-4" />,
      enabled: true,
      description: "Remove duplicate rows",
      param: "remove_duplicates",
    },
    {
      id: 2,
      name: "Handle Missing",
      icon: <Scissors className="w-4 h-4" />,
      enabled: true,
      description: "Fill missing values intelligently",
      param: "handle_missing",
    },
    {
      id: 3,
      name: "Clean Text",
      icon: <Filter className="w-4 h-4" />,
      enabled: true,
      description: "Clean and standardize text data",
      param: "clean_text",
    },
    {
      id: 4,
      name: "Remove Outliers",
      icon: <Sprout className="w-4 h-4" />,
      enabled: true,
      description: "Remove statistical outliers",
      param: "remove_outliers",
    },
  ]);

  const [advancedOptions, setAdvancedOptions] = useState({
    missingThreshold: 0.6,
    outlierMethod: "iqr",
    scaleFeatures: false,
    verbose: true,
  });

  const fileInputRef = useRef(null);

  const toggleCleaningOption = (id) => {
    setCleaningOptions((options) =>
      options.map((option) =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
  };

  const updateAdvancedOption = (key, value) => {
    setAdvancedOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    const validExtensions = [".csv", ".xls", ".xlsx", ".txt"];
    const fileExtension = selectedFile.name
      .toLowerCase()
      .slice(selectedFile.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      setError("Please upload a valid CSV or Excel file (.csv, .xls, .xlsx)");
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (selectedFile.size > maxSize) {
      setError("File size exceeds 50MB limit. Please upload a smaller file.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleInputChange = (e) => handleFileChange(e.target.files[0]);

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
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleAreaClick = () => fileInputRef.current?.click();

  const handleCleanAndDownload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    let step = 1;
    const animateSteps = setInterval(() => {
      // Get only the enabled steps
      const enabledSteps = cleaningOptions.filter((option) => option.enabled);
      if (enabledSteps.length === 0) return; // nothing to animate

      // Find the index of the current active step in the enabled list
      const currentIndex = enabledSteps.findIndex(
        (option) => option.id === step
      );

      // Move to the next enabled step
      const nextIndex = (currentIndex + 1) % enabledSteps.length;
      const nextStep = enabledSteps[nextIndex].id;

      setActiveCleaningStep(nextStep);
      step = nextStep;
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      cleaningOptions.forEach((option) => {
        formData.append(option.param, option.enabled.toString());
      });

      formData.append("missing_threshold", advancedOptions.missingThreshold);
      formData.append("outlier_method", advancedOptions.outlierMethod);
      formData.append("scale_features", advancedOptions.scaleFeatures);
      formData.append("verbose", advancedOptions.verbose);

      const tempCsv = await file.text();
      const rows = tempCsv.split("\n").length - 1;
      formData.append("original_rows", rows);

      const response = await api.post("/api/clean", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // IMPORTANT
      });

      // Extract stats
      const stats = {
        original_rows: parseInt(response.headers["x-original-rows"]) || 0,
        cleaned_rows: parseInt(response.headers["x-cleaned-rows"]) || 0,
        removed_rows: parseInt(response.headers["x-removed-rows"]) || 0,
      };

      // Download CSV
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      let filename = "cleaned_data.csv";
      const cd = response.headers["content-disposition"];
      if (cd) {
        const match = cd.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 100);

      setResult(stats);
    } catch (err) {
      console.error("Cleaning error:", err);

      if (err.response && err.response.data) {
        try {
          const text = await err.response.data.text();
          setError(text);
        } catch {
          setError("Server returned an error.");
        }
      } else if (err.request) {
        setError("Cannot connect to server.");
      } else {
        setError(err.message);
      }
    } finally {
      clearInterval(animateSteps);
      setActiveCleaningStep(1);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setCleaningOptions((options) =>
      options.map((opt) => ({ ...opt, enabled: true }))
    );
    setAdvancedOptions({
      missingThreshold: 0.6,
      outlierMethod: "iqr",
      scaleFeatures: false,
      verbose: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/20 via-white to-teal-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="border-b border-emerald-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-11 h-11 bg-gradient-to-br from-green-400 to-green-600 rounded-xl 
  flex items-center justify-center shadow-sm"
              >
                <RecycleIcon className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Garden
                </h1>

                <p className="text-gray-600 dark:text-zinc-400">
                  Cultivate and nurture your datasets with gentle cleaning tools
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Processing
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Upload Card */}
          <div className="mb-6">
            <div className="p-5 rounded-2xl border border-emerald-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Plant Your Data Seed
                </h2>
                <div className="text-sm text-gray-500 dark:text-zinc-400">
                  Supported: .csv, .xls, .xlsx
                </div>
              </div>

              <div
                onClick={handleAreaClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 scale-[1.01] shadow-inner"
                    : file
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                    : "border-emerald-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 hover:border-emerald-300 dark:hover:border-emerald-600"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                  onChange={handleInputChange}
                />

                <div className="space-y-5">
                  <div className="relative mx-auto w-20 h-20">
                    <div
                      className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                        file
                          ? "bg-emerald-100 dark:bg-emerald-900/20"
                          : "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20"
                      }`}
                    ></div>
                    <div className="relative flex items-center justify-center w-full h-full">
                      {file ? (
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <UploadCloud className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {file
                        ? "Seed Planted Successfully"
                        : "Drop your dataset seed here"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-zinc-400">
                      {file ? (
                        <span className="inline-flex items-center gap-2 bg-white/70 dark:bg-zinc-800/70 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </span>
                      ) : (
                        "or click to browse • CSV, XLS, XLSX formats accepted"
                      )}
                    </p>
                  </div>

                  {file && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove file
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Cultivation Process */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cultivation Steps */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                  Garden Cultivation Process
                </h2>

                <div className="space-y-6">
                  {/* Garden Steps - Now clickable */}
                  <div className="flex items-center justify-between">
                    {cleaningOptions.map((option, index) => (
                      <div key={option.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => toggleCleaningOption(option.id)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                              loading && activeCleaningStep === option.id
                                ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white scale-110 shadow-sm"
                                : option.enabled
                                ? "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-600 dark:text-emerald-400 hover:scale-105"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105"
                            }`}
                            disabled={loading}
                          >
                            {option.icon}
                          </button>
                          <span
                            className={`text-xs mt-1.5 font-medium ${
                              option.enabled
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {option.name.split(" ")[0]}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {option.enabled ? "On" : "Off"}
                          </span>
                        </div>
                        {index < cleaningOptions.length - 1 && (
                          <div
                            className={`w-14 h-0.5 mx-2 ${
                              option.enabled
                                ? "bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Advanced Options */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Missing Value Threshold
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={advancedOptions.missingThreshold}
                        onChange={(e) =>
                          updateAdvancedOption(
                            "missingThreshold",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Drop columns with &gt;
                        {Math.round(advancedOptions.missingThreshold * 100)}%
                        missing
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Outlier Detection
                      </label>
                      <select
                        value={advancedOptions.outlierMethod}
                        onChange={(e) =>
                          updateAdvancedOption("outlierMethod", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm"
                      >
                        <option value="iqr">IQR Method</option>
                        <option value="zscore">Z-Score Method</option>
                      </select>
                    </div>
                  </div>

                  {/* Cultivate Button */}
                  <button
                    onClick={handleCleanAndDownload}
                    disabled={loading || !file}
                    className={`w-full py-3.5 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      loading || !file
                        ? "bg-gray-200 dark:bg-zinc-800 cursor-not-allowed text-gray-500 dark:text-zinc-400"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white active:scale-[0.99] shadow-sm hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/20"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Cultivating Garden...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Start Cultivation
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Garden Tools */}
            <div className="space-y-6">
              {/* Garden Tools - Now just informational without toggles */}
              {/* <div className="p-5 rounded-2xl border border-emerald-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                  Garden Tools
                </h2>

                <div className="space-y-3">
                  {cleaningOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                        option.enabled
                          ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800"
                          : "bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`p-2 rounded-lg transition-colors ${
                            option.enabled
                              ? "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${
                              option.enabled
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-zinc-300"
                            }`}
                          >
                            {option.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400">
                            {option.description}
                          </div>
                        </div>
                      </div>

                      <div className={`text-xs px-2 py-1 rounded ${
                        option.enabled
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}>
                        {option.enabled ? "Active" : "Inactive"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-emerald-100 dark:border-zinc-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-zinc-400">
                      Click icons in Cultivation Process to toggle
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {cleaningOptions.filter((o) => o.enabled).length}/
                      {cleaningOptions.length}
                    </span>
                  </div>
                </div>
              </div> */}

              {/* Garden Stats */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200 dark:border-zinc-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Garden Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/50 dark:bg-zinc-900/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      4
                    </div>
                    <div className="text-xs text-gray-600 dark:text-zinc-400">
                      Tools
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-zinc-900/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {cleaningOptions.filter((o) => o.enabled).length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-zinc-400">
                      Active
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-zinc-900/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                      50MB
                    </div>
                    <div className="text-xs text-gray-600 dark:text-zinc-400">
                      Max Size
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-zinc-900/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                      Fast
                    </div>
                    <div className="text-xs text-gray-600 dark:text-zinc-400">
                      Processing
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Garden Button */}
              <button
                onClick={handleReset}
                className="w-full py-3 px-5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-rose-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-rose-50/30 dark:hover:bg-zinc-800 active:scale-[0.99] hover:border-rose-300 dark:hover:border-rose-600"
              >
                <Trash2 className="w-4 h-4" />
                Clear Garden
              </button>
            </div>
          </div>

          {/* Results & Error Display */}
          {(result || error) && (
            <div className="mt-6 animate-slideUp">
              {/* Error Message */}
              {error && (
                <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/10">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/20 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-rose-800 dark:text-rose-300">
                        Garden Alert
                      </h3>
                      <p className="text-rose-700 dark:text-rose-400 text-sm mt-0.5">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Message */}
              {result && (
                <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-emerald-800 dark:text-emerald-300">
                        Harvest Complete
                      </h3>
                      <p className="text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">
                        Your garden has been cultivated and harvested
                      </p>
                    </div>
                  </div>

                  {/* Garden Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/50 dark:bg-zinc-900/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-gray-800 dark:text-gray-300">
                        {result.original_rows}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                        Original Rows
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        {result.cleaned_rows}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                        Cleaned Rows
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                        {result.removed_rows}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                        Rows Removed
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                        {result.duplicates_removed}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                        Duplicates
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-sm">
                      <DownloadIcon className="w-3.5 h-3.5" />
                      <span>Cleaned file downloaded automatically</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Garden Wisdom Panels */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1.5">
                Why Clean Data?
              </h4>
              <p className="text-gray-600 dark:text-zinc-400 text-sm">
                Clean data provides better insights, more accurate models, and
                reliable analysis results.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center mb-3">
                <InfoIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1.5">
                Best Practices
              </h4>
              <ul className="text-gray-600 dark:text-zinc-400 text-sm space-y-0.5">
                <li>Always backup original data</li>
                <li>Review cleaning results</li>
                <li>Understand each transformation</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1.5">
                Data Privacy
              </h4>
              <p className="text-gray-600 dark:text-zinc-400 text-sm">
                Your data is processed locally and never stored. All operations
                are temporary and secure.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-zinc-500 text-sm">
              Processes CSV, XLS, XLSX files up to 50MB • Server:
              http://localhost:5000
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
