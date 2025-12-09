import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { ArrowLeftIcon, UploadCloudIcon, BotIcon, Play } from "lucide-react";
import LinearForm from "../components/LinearRegression/LinearForm";
import LinearResult from "../components/LinearRegression/LinearResult";
import { colors, icons, models } from "../data/models";
import ModelDetails from "../components/ModelDetailes";
import LogisticForm from "../components/LogisticRegression/LogisticForm";
import LogisticResult from "../components/LogisticRegression/LogisticResult";
import api from "../configs/api";

export default function ModelTraining() {
  const { slug } = useParams();
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
  const [enableDataCleaning, setEnableDataCleaning] = useState(true); // Add this line

  //import title
  const model = models.find((m) => m.slug === slug);
  if (!model) {
    return (
      <div className="text-center p-10 text-red-500 font-bold">
        Model not found
      </div>
    );
  }

  const getModelIcon = (category) => {
    return icons[category] || BotIcon;
  };

  const getIconColor = (category) => {
    return colors[category] || "from-blue-400 to-purple-500";
  };

  const ModelIcon = getModelIcon(model.category);

  // Handle target column change
  const handleTargetChange = (value, cols = null) => {
    if (cols) setColumns(cols);
    setTargetColumn(value);
  };

  // Handle form submission for training - UPDATED
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return setError("Please select a file.");
    if (!targetColumn) return setError("Please select a target column.");

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("model", model.slug);

    if (
      model.slug === "linear-regression" ||
      model.slug === "logistic-regression"
    ) {
      formData.append("file", file);
      formData.append("target_column", targetColumn);
      formData.append("test_size", testSize);
      formData.append("random_state", randomState);
      formData.append("enable_data_cleaning", enableDataCleaning);
    }

    try {
      const res = await api.post("/api/perform", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Axios automatically parses JSON!
      setResult(res.data);
      setIsTrained(true);
    } catch (err) {
      console.error(err);

      if (err.response) {
        // Backend returned an error response
        setError(err.response.data.error || "Server error");
      } else if (err.request) {
        // No response from server
        setError("Cannot reach server.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle model download (unchanged)
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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/models/all")}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 bg-gradient-to-br ${getIconColor(
                model.category
              )} rounded-xl flex items-center justify-center transition-transform duration-300 flex-shrink-0 shadow-sm`}
            >
              <ModelIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {model.name}
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
            {
              label: "Algorithm",
              value: model.name,
              color: "text-blue-600 dark:text-blue-400",
              icon: BotIcon,
            },
            {
              label: "Library",
              value: model.library,
              color: "text-green-600 dark:text-green-400",
              icon: UploadCloudIcon,
            },
            {
              label: "Training Time",
              value: model.trainingTime,
              color: "text-amber-600 dark:text-amber-400",
              icon: Play,
            },
            {
              label: "Use Cases",
              value: model.useCases[0],
              color: "text-purple-600 dark:text-purple-400",
              icon: BotIcon,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {card.label}
                </div>
                <div className={`text-lg font-semibold ${card.color}`}>
                  {card.value}
                </div>
              </div>
              <div
                className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${card.color}`}
              >
                <card.icon className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Training Form Section */}
        <div className="mb-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Training Form with Action Buttons - UPDATED */}
              <div>
                {model.slug == "linear-regression" && (
                  <LinearForm
                    onFileChange={setFile}
                    onTargetChange={handleTargetChange}
                    targetColumn={targetColumn}
                    columns={columns}
                    setResult={setResult}
                    setError={setError}
                    testSize={testSize}
                    setTestSize={setTestSize}
                    randomState={randomState}
                    setRandomState={setRandomState}
                    loading={loading}
                    downloadLoading={downloadLoading}
                    isTrained={isTrained}
                    file={file}
                    onTrain={handleSubmit}
                    onDownload={handleDownloadModel}
                    enableDataCleaning={enableDataCleaning} // Add this prop
                    setEnableDataCleaning={setEnableDataCleaning} // Add this prop
                  />
                )}
                {model.slug == "logistic-regression" && (
                  <LogisticForm
                    onFileChange={setFile}
                    onTargetChange={handleTargetChange}
                    targetColumn={targetColumn}
                    columns={columns}
                    setResult={setResult}
                    setError={setError}
                    testSize={testSize}
                    setTestSize={setTestSize}
                    randomState={randomState}
                    setRandomState={setRandomState}
                    loading={loading}
                    downloadLoading={downloadLoading}
                    isTrained={isTrained}
                    file={file}
                    onTrain={handleSubmit}
                    onDownload={handleDownloadModel}
                    enableDataCleaning={enableDataCleaning} // Add this prop
                    setEnableDataCleaning={setEnableDataCleaning} // Add this prop
                  />
                )}
              </div>

              {/* Prediction Results - Full width below the form */}
              <div>
                {model.slug == "linear-regression" && (
                  <LinearResult result={result} error={error} />
                )}
                {model.slug == "logistic-regression" && (
                  <LogisticResult result={result} error={error} />
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <ModelDetails model={model} />
      </div>
    </div>
  );
}
