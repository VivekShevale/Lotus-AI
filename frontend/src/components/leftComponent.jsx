import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, InfoIcon } from "lucide-react";
import * as XLSX from "xlsx";

export default function LeftComponent({
  onFileChange,
  onTargetChange,
  targetColumn,
  columns,
  setError,
  testSize,
  setTestSize,
  randomState,
  setRandomState,
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
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
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col gap-6">
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
          </div>
        </div>
      </div>

      {/* Target Column Selection */}
      {columns.length > 0 && (
        <div>
          <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
            Select Target Column:
          </label>
          <select
            className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
          className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
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
          className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Information Box */}
      <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <InfoIcon className="w-4 h-4 text-gray-600 dark:text-zinc-400 mt-0.5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-zinc-200 text-sm mb-2">
              Data Processing Information
            </h4>
            <div className="text-xs text-gray-600 dark:text-zinc-400 space-y-1">
              <p>
                <span className="font-medium">Automatic filtering:</span>{" "}
                Non-numeric columns are excluded from analysis
              </p>
              <p>
                <span className="font-medium">Target selection:</span> Choose
                your prediction variable
              </p>
              <p>
                <span className="font-medium">Supported formats:</span> CSV,
                XLS, XLSX
              </p>
              <p>
                <span className="font-medium">Model training:</span> Train-test
                split with standardized features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}