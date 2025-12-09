import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UploadCloudIcon,
  BrainIcon,
  PlayCircleIcon,
  Play,
  Layers,
  Zap,
  Cpu,
} from "lucide-react";
import TrainingForm from "./LinearRegression/LinearForm";
import PredictionResult from "./LinearRegression/LinearResult";

export default function NeuralNetworkTraining() {
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
  const [enableDataCleaning, setEnableDataCleaning] = useState(true);
  
  // Neural Network specific states
  const [hiddenLayers, setHiddenLayers] = useState([64, 32]);
  const [activationFunction, setActivationFunction] = useState("relu");
  const [learningRate, setLearningRate] = useState(0.001);
  const [epochs, setEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(32);
  const [validationSplit, setValidationSplit] = useState(0.1);
  const [optimizer, setOptimizer] = useState("adam");

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
    formData.append("enable_data_cleaning", enableDataCleaning);
    formData.append("model_type", "neural_network");
    
    // Neural Network specific parameters
    formData.append("hidden_layers", JSON.stringify(hiddenLayers));
    formData.append("activation_function", activationFunction);
    formData.append("learning_rate", learningRate);
    formData.append("epochs", epochs);
    formData.append("batch_size", batchSize);
    formData.append("validation_split", validationSplit);
    formData.append("optimizer", optimizer);

    try {
      const res = await fetch("/api/perform-neural", {
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
          ?.replace(/"/g, "") || `neural_model_${result.model_id}.h5`;

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

  // Neural Network specific configuration component
  const NeuralNetworkConfig = () => (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <BrainIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        Neural Network Configuration
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hidden Layers */}
        <div>
          <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
            Hidden Layers (comma-separated)
          </label>
          <input
            type="text"
            value={hiddenLayers.join(", ")}
            onChange={(e) => setHiddenLayers(e.target.value.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n)))}
            placeholder="64, 32, 16"
            className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Activation Function */}
        <div>
          <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
            Activation Function
          </label>
          <select
            className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={activationFunction}
            onChange={(e) => setActivationFunction(e.target.value)}
          >
            <option value="relu">ReLU</option>
            <option value="sigmoid">Sigmoid</option>
            <option value="tanh">Tanh</option>
            <option value="softmax">Softmax</option>
            <option value="linear">Linear</option>
          </select>
        </div>

        {/* Learning Rate */}
        <div>
          <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
            Learning Rate
          </label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            max="0.1"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Epochs */}
        <div>
          <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
            Epochs
          </label>
          <input
            type="number"
            min="10"
            max="1000"
            value={epochs}
            onChange={(e) => setEpochs(parseInt(e.target.value))}
            className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Batch Size */}
        <div>
          <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
            Batch Size
          </label>
          <input
            type="number"
            min="8"
            max="256"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Optimizer */}
        <div>
          <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
            Optimizer
          </label>
          <select
            className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={optimizer}
            onChange={(e) => setOptimizer(e.target.value)}
          >
            <option value="adam">Adam</option>
            <option value="sgd">SGD</option>
            <option value="rmsprop">RMSprop</option>
            <option value="adamax">Adamax</option>
          </select>
        </div>

        {/* Validation Split */}
        <div>
          <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
            Validation Split (0-1)
          </label>
          <input
            type="number"
            step="0.05"
            min="0.05"
            max="0.5"
            value={validationSplit}
            onChange={(e) => setValidationSplit(parseFloat(e.target.value))}
            className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Network Architecture Preview */}
        <div className="lg:col-span-3 p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Network Architecture Preview</h3>
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm">
              Input: {columns.length - 1 || "?"} nodes
            </div>
            {hiddenLayers.map((layer, idx) => (
              <>
                <div className="text-gray-400">→</div>
                <div className="px-3 py-1 bg-purple-600 dark:bg-purple-700 text-white rounded-lg text-sm">
                  Hidden {idx + 1}: {layer} nodes
                </div>
              </>
            ))}
            <div className="text-gray-400">→</div>
            <div className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded-lg text-sm">
              Output: 1 node
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <BrainIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Neural Network
              </h1>
              <p className="text-gray-600 dark:text-zinc-400 text-sm">
                Deep learning model for complex pattern recognition
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Algorithm", value: "Neural Network", color: "text-purple-600 dark:text-purple-400", icon: BrainIcon },
            { label: "Library", value: "TensorFlow", color: "text-orange-600 dark:text-orange-400", icon: Cpu },
            { label: "Training Time", value: "Slow", color: "text-amber-600 dark:text-amber-400", icon: Play },
            { label: "Use Cases", value: "Deep Learning", color: "text-pink-600 dark:text-pink-400", icon: Zap },
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

        {/* Training Form Section */}
        <div className="mb-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Neural Network Configuration */}
              <NeuralNetworkConfig />

              {/* Training Form with Action Buttons */}
              <div>
                <TrainingForm
                  onFileChange={setFile}
                  onTargetChange={handleTargetChange}
                  targetColumn={targetColumn}
                  columns={columns}
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
                  enableDataCleaning={enableDataCleaning}
                  setEnableDataCleaning={setEnableDataCleaning}
                />
              </div>

              {/* Prediction Results - Full width below the form */}
              <div>
                <PredictionResult result={result} error={error} />
              </div>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About Neural Networks</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-zinc-400">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">How it works</h4>
              <p>Neural networks mimic the human brain's neural patterns using interconnected layers of nodes (neurons). Each connection learns weights through backpropagation to analyze complex, non-linear relationships in data.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Best for</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Image and pattern recognition</li>
                <li>Complex non-linear relationships</li>
                <li>Natural language processing</li>
                <li>Time series forecasting</li>
                <li>High-dimensional data</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Parameters Explained</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Hidden Layers:</strong> Middle layers that process features</li>
                <li><strong>Activation Function:</strong> Determines neuron output</li>
                <li><strong>Learning Rate:</strong> Step size for weight updates</li>
                <li><strong>Epochs:</strong> Number of training iterations</li>
                <li><strong>Batch Size:</strong> Samples per gradient update</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Tips</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Start with simple architectures (1-2 hidden layers)</li>
                <li>Use ReLU activation for hidden layers</li>
                <li>Normalize input data for better convergence</li>
                <li>Monitor validation loss to prevent overfitting</li>
                <li>Use early stopping for efficient training</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}