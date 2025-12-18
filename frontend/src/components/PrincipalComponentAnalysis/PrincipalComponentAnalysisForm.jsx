import { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  InfoIcon,
  PlayIcon,
  DownloadIcon,
  Sparkles,
  Trash2,
  BarChart2,
  Target,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function PrincipalComponentAnalysisForm({
  onFileChange,
  onTargetChange,
  targetColumn,
  columns,
  setError,
  setResult,
  loading,
  downloadLoading,
  isTrained,
  file,
  onAnalyze,
  onDownload,
  enableDataCleaning,
  setEnableDataCleaning,
  scaleData,
  setScaleData,
  nComponents,
  setNComponents,
  componentType,
  setComponentType,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleReset = () => {
    onFileChange(null);
    onTargetChange("", []);
    setError(null);
    setResult(null);
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    onFileChange(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      let data = e.target.result;
      let cols = [];
      try {
        if (selectedFile.name.endsWith(".csv")) {
          const text = data;
          const firstLine = text.split("\n")[0];
          cols = firstLine.split(",").map((c) => c.trim());
        } else if (
          selectedFile.name.endsWith(".xls") ||
          selectedFile.name.endsWith(".xlsx")
        ) {
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          cols = json[0].map((c) => c.toString());
        }
        onTargetChange("", cols);
      } catch (err) {
        setError("Unable to parse file columns.");
      }
    };

    if (selectedFile.name.endsWith(".csv")) reader.readAsText(selectedFile);
    else reader.readAsArrayBuffer(selectedFile);
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
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".csv") ||
        droppedFile.name.endsWith(".xls") ||
        droppedFile.name.endsWith(".xlsx"))
    ) {
      handleFileChange(droppedFile);
    } else setError("Please upload a valid CSV, XLS, or XLSX file.");
  };
  const handleAreaClick = () => fileInputRef.current?.click();

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        PCA Configuration
      </h2>

      <div className="space-y-6">
        {/* File Upload */}
        <div
          onClick={handleAreaClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 scale-[1.02]"
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
            onChange={handleInputChange}
          />
          <div className="space-y-3">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
                file
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              }`}
            >
              {file ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {file ? "File Selected" : "Choose File or Drag & Drop"}
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

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Column Selection (Optional) */}
          {columns.length > 0 && (
            <div>
              <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
                Target Column (Optional for Visualization):
              </label>
              <select
                className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={targetColumn}
                onChange={(e) => onTargetChange(e.target.value, columns)}
              >
                <option value="">--None (Unsupervised)--</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                Optional: For coloring points in scatter plots
              </p>
            </div>
          )}

          {/* Component Type Selection */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              Component Selection:
            </label>
            <select
              value={componentType}
              onChange={(e) => {
                setComponentType(e.target.value);
                if (e.target.value === "variance") {
                  setNComponents("0.95"); // Default to 95% variance
                } else {
                  setNComponents(""); // Clear for manual input
                }
              }}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="manual">Manual Number of Components</option>
              <option value="variance">Variance Threshold</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              {componentType === "manual"
                ? "Specify exact number of principal components"
                : "Keep components that explain variance threshold"}
            </p>
          </div>

          {/* Number of Components Input */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              {componentType === "manual"
                ? "Number of Components:"
                : "Variance Threshold (0-1):"}
            </label>
            <input
              type={componentType === "manual" ? "number" : "text"}
              min={componentType === "manual" ? "1" : "0.1"}
              max={componentType === "manual" ? "" : "1"}
              step={componentType === "manual" ? "1" : "0.05"}
              value={nComponents}
              onChange={(e) => {
                const value = e.target.value;
                if (componentType === "manual") {
                  const intValue = parseInt(value);
                  if (!isNaN(intValue) && intValue >= 1) {
                    setNComponents(intValue.toString());
                  } else if (value === "") {
                    setNComponents("");
                  }
                } else {
                  const floatValue = parseFloat(value);
                  if (
                    !isNaN(floatValue) &&
                    floatValue >= 0.1 &&
                    floatValue <= 1
                  ) {
                    setNComponents(floatValue.toString());
                  } else if (value === "") {
                    setNComponents("");
                  } else if (/^\d+(\.\d*)?$/.test(value)) {
                    setNComponents(value);
                  }
                }
              }}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                componentType === "manual"
                  ? "e.g., 3"
                  : "e.g., 0.95 for 95% variance"
              }
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              {componentType === "manual"
                ? "Number of principal components to extract"
                : "Keep components until cumulative variance reaches this threshold"}
            </p>
          </div>

          {/* Scale Data Toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 hover:shadow-md transition-all duration-300 group cursor-pointer"
            onClick={() => setScaleData(!scaleData)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg transition-all duration-300 ${
                  scaleData
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                }`}
              >
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  Standardize Features
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">
                  {scaleData ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                scaleData
                  ? "bg-green-500 dark:bg-green-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                  scaleData ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* Enhanced Data Cleaning Toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 hover:shadow-md transition-all duration-300 group cursor-pointer"
            onClick={() => setEnableDataCleaning(!enableDataCleaning)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg transition-all duration-300 ${
                  enableDataCleaning
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  Smart Data Cleaning
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">
                  {enableDataCleaning ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                enableDataCleaning
                  ? "bg-green-500 dark:bg-green-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                  enableDataCleaning ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="submit"
            onClick={onAnalyze}
            disabled={loading || !file || (componentType === "variance" && (!nComponents || parseFloat(nComponents) <= 0))}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || !file || (componentType === "variance" && (!nComponents || parseFloat(nComponents) <= 0))
                ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-zinc-500 dark:text-zinc-400"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running PCA...
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Run PCA Analysis
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={downloadLoading || !file || !isTrained}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              downloadLoading || !file || !isTrained
                ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-zinc-500 dark:text-zinc-400"
                : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {downloadLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <DownloadIcon className="w-5 h-5" />
                Download PCA Model
              </>
            )}
          </button>
        </div>

        {/* Information Box */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <InfoIcon className="w-4 h-4 text-gray-600 dark:text-zinc-400 mt-0.5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-200 text-sm mb-2">
                PCA Configuration Guide
              </h4>
              <div className="text-xs text-gray-600 dark:text-zinc-400 space-y-1">
                <p>
                  <span className="font-medium">Standardize Features:</span>{" "}
                  {scaleData
                    ? "Enabled - Highly recommended for PCA to give equal importance to all features"
                    : "Disabled - Use raw data values (risk of scale bias)"}
                </p>
                <p>
                  <span className="font-medium">Target Column:</span> Optional.
                  If provided, used only for visualization coloring in 2D/3D
                  plots
                </p>
                <p>
                  <span className="font-medium">Variance Threshold:</span>{" "}
                  Automatically select components that explain specified variance
                  (e.g., 0.95 for 95%)
                </p>
                <p>
                  <span className="font-medium">Data Cleaning:</span>{" "}
                  {enableDataCleaning
                    ? "Enabled - Automatic handling of missing values and categorical encoding"
                    : "Disabled - Raw data processing"}
                </p>
                <p>
                  <span className="font-medium">Output:</span> Transformed data,
                  variance explained, component loadings, and visualizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}