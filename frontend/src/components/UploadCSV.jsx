import { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function UploadCSV() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setTargetColumn("");
    setColumns([]);

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
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          cols = json[0].map((c) => c.toString());
        }
        setColumns(cols);
      } catch (err) {
        setError("Unable to parse file columns.");
      }
    };

    if (selectedFile.name.endsWith(".csv")) reader.readAsText(selectedFile);
    else reader.readAsBinaryString(selectedFile);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file.");
    if (!targetColumn) return setError("Please select a target column.");

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_column", targetColumn);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = () => fileInputRef.current?.click();

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-700/50 text-gray-100 font-fira-code">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4">
          <TrendingUp className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent tracking-tight">
          Linear Regression Analysis
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Upload your dataset to train a regression model
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div
          onClick={handleAreaClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group ${
            isDragging
              ? "border-blue-400 bg-blue-500/10 scale-[1.02]"
              : file
              ? "border-green-500/50 bg-green-500/5"
              : "border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={handleInputChange}
          />

          <div className="space-y-4">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl transition-colors ${
                file
                  ? "bg-green-500/10 text-green-400"
                  : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
              }`}
            >
              {file ? <CheckCircle2 className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>

            <div className="space-y-2">
              <p className="font-medium text-lg">
                {file ? "File Selected" : "Choose File or Drag & Drop"}
              </p>
              <p className="text-sm text-gray-400">
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
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">Select Target Column:</label>
            <select
              className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : !file
                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/25 active:scale-[0.99]'
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Data...
            </span>
          ) : (
            'Train Regression Model'
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <strong className="font-medium">Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-8 bg-gradient-to-br from-gray-800/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Model Performance
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
              <div className="text-sm text-gray-400 mb-1">R² Score</div>
              <div className="text-2xl font-bold text-green-400">{result.r2}</div>
              <div className="text-xs text-gray-500 mt-1">Test set</div>
            </div>
            
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
              <div className="text-sm text-gray-400 mb-1">MAE</div>
              <div className="text-2xl font-bold text-blue-400">{result.mae}</div>
              <div className="text-xs text-gray-500 mt-1">Mean Absolute Error</div>
            </div>
            
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
              <div className="text-sm text-gray-400 mb-1">Samples</div>
              <div className="text-2xl font-bold text-gray-300">{result.n_samples}</div>
              <div className="text-xs text-gray-500 mt-1">Total data points</div>
            </div>
            
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
              <div className="text-sm text-gray-400 mb-1">Features</div>
              <div className="text-2xl font-bold text-purple-400">{result.n_features}</div>
              <div className="text-xs text-gray-500 mt-1">Numeric features</div>
            </div>
          </div>

          {/* Scatter Plot */}
          {result.predictions && result.actual && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Predictions vs Actual</h4>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    type="number" 
                    dataKey="actual" 
                    name="Actual" 
                    label={{ value: 'Actual', position: 'insideBottom', fill: '#888' }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="predicted" 
                    name="Predicted" 
                    label={{ value: 'Predicted', angle: -90, position: 'insideLeft', fill: '#888' }} 
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  {/* Reference line y=x */}
                  <ReferenceLine x={Math.min(...result.actual)} y={Math.min(...result.actual)} stroke="#ff0000" strokeDasharray="3 3" />
                  <Scatter
                    name="Predictions"
                    data={result.actual.map((val, i) => ({ actual: val, predicted: result.predictions[i] }))}
                    fill="#4f46e5"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="mt-6 p-4 bg-gray-800/20 rounded-xl border border-gray-700/30">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-gray-300">Note:</strong> The model automatically treats the last column as the target variable. 
          Non-numeric columns are excluded from analysis. Supported formats: CSV, Excel (.xls, .xlsx).
        </p>
      </div>
    </div>
  );
}