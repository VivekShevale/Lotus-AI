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
  Layers,
  Zap,
  Settings,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function NeuralNetworkForm({
  onFileChange,
  onTargetChange,
  targetColumn,
  columns,
  setError,
  setResult,
  testSize,
  setTestSize,
  randomState,
  setRandomState,
  loading,
  downloadLoading,
  isTrained,
  file,
  onTrain,
  onDownload,
  enableDataCleaning,
  setEnableDataCleaning,
  
  // Neural Network specific props
  hiddenLayerSizes,
  setHiddenLayerSizes,
  activation,
  setActivation,
  solver,
  setSolver,
  maxIter,
  setMaxIter,
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

  // Helper function to parse hidden layer sizes
  const parseHiddenLayerSizes = (value) => {
    try {
      return value
        .split(",")
        .map((x) => parseInt(x.trim()))
        .filter((x) => !isNaN(x) && x > 0);
    } catch {
      return [100]; // default
    }
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Neural Network Configuration
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
              ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600"
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
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Target Column Selection */}
          {columns.length > 0 && (
            <div>
              <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
                Select Target Column:
              </label>
              <select
                className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={targetColumn}
                onChange={(e) => onTargetChange(e.target.value)}
              >
                <option value="">--Select--</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Test Size Input */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              Test Size (0-1):
            </label>
            <input
              type="number"
              step="0.05"
              min="0.05"
              max="0.95"
              value={testSize}
              onChange={(e) => setTestSize(parseFloat(e.target.value))}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              Proportion of data for testing
            </p>
          </div>

          {/* Random State Input */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              Random State:
            </label>
            <input
              type="number"
              value={randomState}
              onChange={(e) => setRandomState(parseInt(e.target.value))}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              For reproducibility
            </p>
          </div>

          {/* Hidden Layer Sizes */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              Hidden Layer Sizes:
            </label>
            <input
              type="text"
              value={hiddenLayerSizes}
              onChange={(e) => setHiddenLayerSizes(e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., 100,50,25"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              Comma-separated neurons per layer
            </p>
          </div>

          {/* Activation Function */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              Activation Function:
            </label>
            <select
              value={activation}
              onChange={(e) => setActivation(e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="relu">ReLU (Recommended)</option>
              <option value="tanh">Tanh</option>
              <option value="logistic">Logistic</option>
              <option value="identity">Identity</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              Non-linearity function
            </p>
          </div>

          {/* Solver */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              Solver:
            </label>
            <select
              value={solver}
              onChange={(e) => setSolver(e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="adam">Adam (Recommended)</option>
              <option value="lbfgs">L-BFGS</option>
              <option value="sgd">SGD</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              Weight optimization algorithm
            </p>
          </div>

          {/* Max Iterations */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              Max Iterations:
            </label>
            <input
              type="number"
              min="100"
              max="2000"
              value={maxIter}
              onChange={(e) => setMaxIter(parseInt(e.target.value))}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              Maximum training iterations
            </p>
          </div>

          {/* Enhanced Data Cleaning Toggle */}
          <div className="md:col-span-2 lg:col-span-3">
            <div
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 hover:shadow-md transition-all duration-300 group cursor-pointer"
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
                    {enableDataCleaning
                      ? "Enabled - Automatic scaling & preprocessing"
                      : "Disabled - Manual preprocessing required"}
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
        </div>

        {/* Network Architecture Preview */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-gray-800 dark:text-zinc-200 text-sm">
              Network Architecture Preview
            </h4>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
                Input Layer
              </div>
              <div className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                <span className="text-sm font-medium">n_features</span>
              </div>
            </div>
            
            <Zap className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
            
            {hiddenLayerSizes
              .split(",")
              .filter(x => x.trim())
              .map((size, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
                    Hidden {idx + 1}
                  </div>
                  <div className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <span className="text-sm font-medium">{size.trim()}</span>
                  </div>
                  <Zap className="w-4 h-4 text-gray-400 dark:text-zinc-500 mx-auto mt-2" />
                </div>
              ))}
            
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
                Output Layer
              </div>
              <div className="px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded">
                <span className="text-sm font-medium">1</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-zinc-400 text-center">
            Activation: {activation} | Solver: {solver} | Max Iter: {maxIter}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="submit"
            onClick={onTrain}
            disabled={loading || !file || !targetColumn}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || !file || !targetColumn
                ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-zinc-500 dark:text-zinc-400"
                : "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Training Neural Network...
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Train Neural Network
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={downloadLoading || !file || !targetColumn || !isTrained}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              downloadLoading || !file || !targetColumn || !isTrained
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
                Download Model
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
                Neural Network Information
              </h4>
              <div className="text-xs text-gray-600 dark:text-zinc-400 space-y-1">
                <p>
                  <span className="font-medium">Hidden Layers:</span> Specify
                  network architecture (e.g., "100,50" = 2 hidden layers with
                  100 and 50 neurons)
                </p>
                <p>
                  <span className="font-medium">ReLU Activation:</span>{" "}
                  Recommended for most regression problems, avoids vanishing
                  gradient
                </p>
                <p>
                  <span className="font-medium">Adam Solver:</span> Adaptive
                  learning rate optimization, works well for most datasets
                </p>
                <p>
                  <span className="font-medium">Automatic Scaling:</span> Input
                  features are automatically standardized for better convergence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}