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
import DecisionTreeForm from "../components/DecisionTree/DecisionTreeForm";
import DecisionTreeResult from "../components/DecisionTree/DecisionTreeResult";
import KNNClassifierForm from "../components/KNNClassifier/KNNClassifierForm";
import KNNClassifierResult from "../components/KNNClassifier/KNNClassifierResult";
import RandomForestForm from "../components/RandomForest/RandomForestForm";
import RandomForestResult from "../components/RandomForest/RandomForestResult";
import NeuralNetworkForm from "../components/NeuralRegressor/RegressorForm";
import NeuralNetworkResult from "../components/NeuralRegressor/RegressorResult";
import RidgeRegressionForm from "../components/RidgeRegression/RidgeRegressionForm";
import RidgeRegressionResult from "../components/RidgeRegression/RidgeRegressionResult";
import ImageClassificationForm from "../components/ImageClassification/ImageClassificationForm";
import ImageClassificationResult from "../components/ImageClassification/ImageClassificationResult";
import SVMForm from "../components/SVM/SVMForm";
import SVMResult from "../components/SVM/SVMResult";
import LassoRegressionForm from "../components/LassoRegression/LassoRegressionForm";
import LassoRegressionResult from "../components/LassoRegression/LassoRegressionResult";
import ElasticNetForm from "../components/ElasticNetRegression/ElasticNetForm";
import ElasticNetResult from "../components/ElasticNetRegression/ElasticNetResult";

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
  const [criterion, setCriterion] = useState(null);
  const [maxDepth, setMaxDepth] = useState(0);
  const [minSamplesSplit, setMinSamplesSplit] = useState(2);
  const [minSamplesLeaf, setMinSamplesLeaf] = useState(1);
  const [nNeighbors, setNNeighbors] = useState(5);
  const [weights, setWeights] = useState("uniform");
  const [algorithm, setAlgorithm] = useState("auto");
  const [metric, setMetric] = useState("minkowski");
  const [nEstimators, setNEstimators] = useState(100);
  const [classWeight, setClassWeight] = useState(null);
  // SVM
  const [svmC, setSvmC] = useState(1.0);
  const [kernel, setKernel] = useState("rbf");
  const [gamma, setGamma] = useState("scale");
  const [customGamma, setCustomGamma] = useState(0.1);
  const [degree, setDegree] = useState(3);
  const [shrinking, setShrinking] = useState(true);
  const [probability, setProbability] = useState(false);
  //neural-network-regressor
  const [hiddenLayerSizes, setHiddenLayerSizes] = useState("100");
  const [activation, setActivation] = useState("relu");
  const [solver, setSolver] = useState("adam");
  const [maxIter, setMaxIter] = useState(500);

  const [alpha, setAlpha] = useState(1.0);

  //Image Classifier
  const [dataset, setDataset] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [enableDataAugmentation, setEnableDataAugmentation] = useState(true);

  // Image Classification specific state
  const [imgSize, setImgSize] = useState(224);
  const [batchSize, setBatchSize] = useState(32);
  const [epochs, setEpochs] = useState(10);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [modelArchitecture, setModelArchitecture] = useState("efficientnet_b0");

 
  // Lasso Regression specific states
  const [fitIntercept, setFitIntercept] = useState(true);
  const [tol, setTol] = useState(0.0001);
  const [selection, setSelection] = useState("cyclic"); // "cyclic" or "random"
  const [normalize, setNormalize] = useState(false);

  
  // ElasticNet specific states
  const [l1Ratio, setL1Ratio] = useState(0.5); // L1/L2 balance (0-1)

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

  const handleDatasetChange = (file) => {
    setDataset(file);
    setIsTrained(false);
    setResult(null);
    setError(null);

    // Extract basic info
    if (file) {
      setDatasetInfo({
        name: file.name.replace(".zip", ""),
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        type: "Image Dataset (ZIP)",
        uploadedAt: new Date().toLocaleString(),
      });
    }
  };

  // Handle form submission for training - UPDATED
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (model.slug !== "image-classifier") {
      if (!file) return setError("Please select a file.");

      if (!targetColumn) return setError("Please select a target column.");
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("model", model.slug);

    if (
      model.slug === "linear-regression" ||
      model.slug === "logistic-regression" ||
      model.slug === "decision-tree" ||
      model.slug === "KNN" ||
      model.slug === "random-forest" ||
      model.slug === "neural-network" ||
      model.slug === "ridge-regression" ||
      model.slug === "support-vector-machine" ||
      model.slug === "lasso-regression" ||
      model.slug === "elastic-net"
    ) {
      formData.append("file", file);
      formData.append("target_column", targetColumn);
      formData.append("test_size", testSize);
      formData.append("random_state", randomState);
      formData.append("enable_data_cleaning", enableDataCleaning);
    }
    if (model.slug === "decision-tree") {
      // Decision Tree specific parameters
      formData.append("criterion", criterion); // "gini" or "entropy"
      formData.append("max_depth", maxDepth); // Send empty string if null for unlimited
      formData.append("min_samples_split", minSamplesSplit);
      formData.append("min_samples_leaf", minSamplesLeaf);
    }
    if (model.slug === "KNN") {
      // KNN Classifier specific parameters
      formData.append("n_neighbors", nNeighbors);
      formData.append("weights", weights);
      formData.append("algorithm", algorithm);
      formData.append("metric", metric);
    }
    if (model.slug === "random-forest") {
      // Random Forest Classifier specific parameters
      formData.append("n_estimators", nEstimators);
      formData.append("criterion", criterion); // "gini" or "entropy"
      formData.append("max_depth", maxDepth || ""); // Send empty string if null for unlimited
      formData.append("min_samples_split", minSamplesSplit);
      formData.append("min_samples_leaf", minSamplesLeaf);
      formData.append("class_weight", classWeight || ""); // Send empty string if null
    }
    if (model.slug === "neural-network") {
      formData.append("hidden_layer_sizes", hiddenLayerSizes);
      formData.append("activation", activation);
      formData.append("solver", solver);
      formData.append("max_iter", maxIter);
    }
    if (model.slug === "ridge-regression") {
      formData.append("alpha", alpha);
    }
    if (model.slug === "image-classifier") {
      formData.append("dataset", dataset);
      formData.append("img_size", imgSize);
      formData.append("batch_size", batchSize);
      formData.append("epochs", epochs);
      formData.append("learning_rate", learningRate);
      formData.append("model_architecture", modelArchitecture);
      formData.append("data_augmentation", enableDataAugmentation);
    }
    if (model.slug === "support-vector-machine") {
      // SVM Classifier specific parameters
      formData.append("C", svmC);
      formData.append("kernel", kernel);

      // Handle gamma parameter
      if (gamma === "custom" && customGamma) {
        formData.append("gamma", customGamma);
      } else {
        formData.append("gamma", gamma);
      }

      // Only append degree if kernel is polynomial
      if (kernel === "poly") {
        formData.append("degree", degree);
      }

      formData.append("shrinking", shrinking);
      formData.append("probability", probability);

      // Only append class_weight if not "none"
      if (classWeight !== "none") {
        formData.append("class_weight", classWeight);
      }
    }
    if (model.slug === "lasso-regression") {
      // Lasso Regression specific parameters
      formData.append("alpha", alpha || 1.0);
      formData.append("fit_intercept", fitIntercept);
      formData.append("max_iter", maxIter || 1000);
      formData.append("tol", tol || 0.0001);
      formData.append("selection", selection || "cyclic");
      formData.append("normalize", normalize);
    }
    if (model.slug === "elastic-net") {
      // ElasticNet specific parameters
      formData.append("alpha", alpha || 1.0);
      formData.append("l1_ratio", l1Ratio || 0.5);
      formData.append("max_iter", maxIter || 1000);
      formData.append("fit_intercept", fitIntercept);
      formData.append("tol", tol || 0.0001);
      formData.append("selection", selection || "cyclic");
      formData.append("normalize", normalize);
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
                {model.slug === "decision-tree" && (
                  <DecisionTreeForm
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
                    enableDataCleaning={enableDataCleaning}
                    setEnableDataCleaning={setEnableDataCleaning}
                    // Decision Tree specific props
                    criterion={criterion}
                    setCriterion={setCriterion}
                    maxDepth={maxDepth}
                    setMaxDepth={setMaxDepth}
                    minSamplesSplit={minSamplesSplit}
                    setMinSamplesSplit={setMinSamplesSplit}
                    minSamplesLeaf={minSamplesLeaf}
                    setMinSamplesLeaf={setMinSamplesLeaf}
                  />
                )}
                {model.slug == "KNN" && (
                  <KNNClassifierForm
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
                    enableDataCleaning={enableDataCleaning}
                    setEnableDataCleaning={setEnableDataCleaning}
                    nNeighbors={nNeighbors}
                    setNNeighbors={setNNeighbors}
                    weights={weights}
                    setWeights={setWeights}
                    algorithm={algorithm}
                    setAlgorithm={setAlgorithm}
                    metric={metric}
                    setMetric={setMetric}
                  />
                )}
                {model.slug == "random-forest" && (
                  <RandomForestForm
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
                    enableDataCleaning={enableDataCleaning}
                    setEnableDataCleaning={setEnableDataCleaning}
                    nEstimators={nEstimators}
                    setNEstimators={setNEstimators}
                    criterion={criterion}
                    setCriterion={setCriterion}
                    maxDepth={maxDepth}
                    setMaxDepth={setMaxDepth}
                    minSamplesSplit={minSamplesSplit}
                    setMinSamplesSplit={setMinSamplesSplit}
                    minSamplesLeaf={minSamplesLeaf}
                    setMinSamplesLeaf={setMinSamplesLeaf}
                    classWeight={classWeight}
                    setClassWeight={setClassWeight}
                  />
                )}
                {model.slug == "neural-network" && (
                  <NeuralNetworkForm
                    onFileChange={setFile}
                    onTargetChange={handleTargetChange}
                    targetColumn={targetColumn}
                    columns={columns}
                    setError={setError}
                    setResult={setResult}
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
                    hiddenLayerSizes={hiddenLayerSizes}
                    setHiddenLayerSizes={setHiddenLayerSizes}
                    activation={activation}
                    setActivation={setActivation}
                    solver={solver}
                    setSolver={setSolver}
                    maxIter={maxIter}
                    setMaxIter={setMaxIter}
                  />
                )}
                {model.slug == "ridge-regression" && (
                  <RidgeRegressionForm
                    onFileChange={setFile}
                    onTargetChange={handleTargetChange}
                    targetColumn={targetColumn}
                    columns={columns}
                    setError={setError}
                    setResult={setResult}
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
                    alpha={alpha}
                    setAlpha={setAlpha}
                  />
                )}
                {model.slug === "image-classifier" && (
                  <ImageClassificationForm
                    onDatasetChange={handleDatasetChange}
                    dataset={dataset}
                    setError={setError}
                    setResult={setResult}
                    loading={loading}
                    downloadLoading={downloadLoading}
                    isTrained={isTrained}
                    onTrain={handleSubmit}
                    onDownload={handleDownloadModel}
                    enableDataAugmentation={enableDataAugmentation}
                    setEnableDataAugmentation={setEnableDataAugmentation}
                    imgSize={imgSize}
                    setImgSize={setImgSize}
                    batchSize={batchSize}
                    setBatchSize={setBatchSize}
                    epochs={epochs}
                    setEpochs={setEpochs}
                    learningRate={learningRate}
                    setLearningRate={setLearningRate}
                    modelArchitecture={modelArchitecture}
                    setModelArchitecture={setModelArchitecture}
                  />
                )}
                {model.slug == "support-vector-machine" && (
                  <SVMForm
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
                    enableDataCleaning={enableDataCleaning}
                    setEnableDataCleaning={setEnableDataCleaning}
                    // SVM specific props
                    svmC={svmC}
                    setSvmC={setSvmC}
                    kernel={kernel}
                    setKernel={setKernel}
                    gamma={gamma}
                    setGamma={setGamma}
                    customGamma={customGamma}
                    setCustomGamma={setCustomGamma}
                    degree={degree}
                    setDegree={setDegree}
                    shrinking={shrinking}
                    setShrinking={setShrinking}
                    probability={probability}
                    setProbability={setProbability}
                    classWeight={classWeight}
                    setClassWeight={setClassWeight}
                  />
                )}
                {model.slug === "lasso-regression" && (
                  <LassoRegressionForm
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
                    enableDataCleaning={enableDataCleaning}
                    setEnableDataCleaning={setEnableDataCleaning}
                    // Lasso Regression specific props
                    alpha={alpha}
                    setAlpha={setAlpha}
                    fitIntercept={fitIntercept}
                    setFitIntercept={setFitIntercept}
                    maxIter={maxIter}
                    setMaxIter={setMaxIter}
                    tol={tol}
                    setTol={setTol}
                    selection={selection}
                    setSelection={setSelection}
                    normalize={normalize}
                    setNormalize={setNormalize}
                  />
                )}
                {model.slug === "elastic-net" && (
                  <ElasticNetForm
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
                    enableDataCleaning={enableDataCleaning}
                    setEnableDataCleaning={setEnableDataCleaning}
                    // ElasticNet specific props
                    alpha={alpha}
                    setAlpha={setAlpha}
                    l1Ratio={l1Ratio}
                    setL1Ratio={setL1Ratio}
                    maxIter={maxIter}
                    setMaxIter={setMaxIter}
                    fitIntercept={fitIntercept}
                    setFitIntercept={setFitIntercept}
                    tol={tol}
                    setTol={setTol}
                    selection={selection}
                    setSelection={setSelection}
                    normalize={normalize}
                    setNormalize={setNormalize}
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
                {model.slug == "decision-tree" && (
                  <DecisionTreeResult
                    result={result}
                    error={error}
                    targetColumn={targetColumn}
                  />
                )}
                {model.slug == "KNN" && (
                  <KNNClassifierResult
                    result={result}
                    error={error}
                    targetColumn={targetColumn}
                  />
                )}
                {model.slug == "random-forest" && (
                  <RandomForestResult
                    result={result}
                    error={error}
                    targetColumn={targetColumn}
                  />
                )}
                {model.slug == "neural-network" && (
                  <NeuralNetworkResult
                    result={result}
                    error={error}
                    targetColumn={targetColumn}
                  />
                )}
                {model.slug == "ridge-regression" && (
                  <RidgeRegressionResult
                    result={result}
                    error={error}
                    targetColumn={targetColumn}
                  />
                )}
                {model.slug === "image-classifier" && (
                  <ImageClassificationResult
                    result={result}
                    error={error}
                    datasetInfo={datasetInfo}
                    />
                )}
                {model.slug == "support-vector-machine" && result && (
                  <SVMResult
                    result={result}
                    error={error}
                    targetColumn={targetColumn}
                  />
                )}
                {model.slug == "lasso-regression" && (
                  <LassoRegressionResult
                    result={result}
                    error={error}
                    targetColumn={targetColumn}
                  />
                )}
                {model.slug == "elastic-net" && (
                  <ElasticNetResult
                    result={result}
                    error={error}
                    targetColumn={targetColumn}
                  />
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