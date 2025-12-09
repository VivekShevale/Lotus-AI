import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UploadCloudIcon,
  BotIcon,
  PlayIcon,
  DownloadIcon,
} from "lucide-react";
import LeftComponent from "../components/leftComponent";
import RightComponent from "../components/rightComponent";

export default function ModelTrainingPage() {
  const navigate = useNavigate();

  // State hooks
  const [file, setFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [isTrained, setIsTrained] = useState(false);

  // Handle target column change
  const handleTargetChange = (value, cols = null) => {
    if (cols) setColumns(cols);
    setTargetColumn(value);
  };

  // Handle form submission for training
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
    formData.append("test_size", testSize);
    formData.append("random_state", randomState);

    try {
      const res = await fetch("/api/perform", {
        method: "POST",
        body: formData,
      });

      let data;
      if (res.ok) {
        data = await res.json();
        setResult(data);
        setIsTrained(true);
      } else {
        const errText = await res.text();
        throw new Error(errText || "Server error");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle model download
  const handleDownloadModel = async () => {
    if (!result?.model_id) {
      setError("No trained model available for download");
      return;
    }

    setDownloadLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/download-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model_id: result.model_id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      const filename =
        response.headers
          .get("content-disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `model_${result.model_id}.pkl`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadLoading(false);
    }
  };

  // Helper for button classes
  const buttonClass = (enabled, color) =>
    `w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
      !enabled
        ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-zinc-500 dark:text-zinc-400"
        : color
    }`;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/models")}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BotIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Linear Regression
              </h1>
              <p className="text-gray-600 dark:text-zinc-400 text-sm">
                Train your model with uploaded data
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Algorithm", value: "Linear Regression", color: "text-blue-600 dark:text-blue-400", icon: BotIcon },
            { label: "Library", value: "scikit-learn", color: "text-green-600 dark:text-green-400", icon: UploadCloudIcon },
            { label: "Training Time", value: "Fast", color: "text-amber-600 dark:text-amber-400", icon: PlayIcon },
            { label: "Use Cases", value: "Regression", color: "text-purple-600 dark:text-purple-400", icon: BotIcon },
          ].map((card, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{card.label}</div>
                <div className={`text-lg font-semibold ${card.color}`}>{card.value}</div>
              </div>
              <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 max-w-md">
            <LeftComponent
              onFileChange={setFile}
              onTargetChange={handleTargetChange}
              targetColumn={targetColumn}
              columns={columns}
              setError={setError}
              testSize={testSize}
              setTestSize={setTestSize}
              randomState={randomState}
              setRandomState={setRandomState}
            />

            {/* Train Button */}
            <button
              type="submit"
              disabled={loading || !file || !targetColumn}
              className={buttonClass(!loading && file && targetColumn, "bg-blue-600 hover:bg-blue-700 text-white")}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Training Model...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <PlayIcon className="w-5 h-5" />
                  Train Model
                </span>
              )}
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownloadModel}
              disabled={downloadLoading || !file || !targetColumn || !isTrained}
              className={buttonClass(!downloadLoading && file && targetColumn && isTrained, "bg-green-400 hover:bg-green-500 text-white")}
            >
              {downloadLoading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Downloading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <DownloadIcon className="w-5 h-5" />
                  Download Model
                </span>
              )}
            </button>
          </div>

          <div className="flex-1">
            <RightComponent result={result} error={error} />
          </div>
        </form>

        {/* Additional Information */}
        <div className="mt-8 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About Linear Regression</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-zinc-400">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">How it works</h4>
              <p>Linear regression models the relationship between a dependent variable and one or more independent variables using a linear approach.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Best for</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Predicting continuous values</li>
                <li>Forecasting trends</li>
                <li>Understanding relationships between variables</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
