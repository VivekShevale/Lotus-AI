import { useState, useRef } from "react";
import {
  UploadCloud,
  Folder,
  CheckCircle2,
  InfoIcon,
  PlayIcon,
  DownloadIcon,
  Sparkles,
  Trash2,
  Image,
  Settings,
  Layers,
  Zap,
  Clock,
} from "lucide-react";

export default function ImageClassificationForm({
  onDatasetChange,
  dataset,
  setError,
  setResult,
  loading,
  downloadLoading,
  isTrained,
  onTrain,
  onDownload,
  enableDataAugmentation,
  setEnableDataAugmentation,
  
  // Image Classification specific props
  imgSize,
  setImgSize,
  batchSize,
  setBatchSize,
  epochs,
  setEpochs,
  learningRate,
  setLearningRate,
  modelArchitecture,
  setModelArchitecture,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const datasetInputRef = useRef(null);
  const [datasetInfo, setDatasetInfo] = useState(null);

  const handleReset = () => {
    onDatasetChange(null);
    setError(null);
    setResult(null);
    setDatasetInfo(null);
  };

  const handleDatasetChange = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // Handle zip file upload
    const file = selectedFiles[0];
    if (!file.name.endsWith('.zip')) {
      setError("Please upload a ZIP file containing image dataset");
      return;
    }
    
    onDatasetChange(file);
    setError(null);
    
    // Extract basic info from filename
    const fileName = file.name.replace('.zip', '');
    setDatasetInfo({
      name: fileName,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: 'ZIP Archive',
    });
  };

  const handleInputChange = (e) => handleDatasetChange(e.target.files);
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
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleDatasetChange(droppedFiles);
    }
  };
  const handleAreaClick = () => datasetInputRef.current?.click();

  const modelArchitectures = [
    { value: "efficientnet_b0", label: "EfficientNet-B0 (Recommended)", description: "Fast & accurate" },
    { value: "mobilenet_v2", label: "MobileNet-V2", description: "Lightweight" },
    { value: "resnet50", label: "ResNet50", description: "High accuracy" },
    { value: "vgg16", label: "VGG16", description: "Classic architecture" },
  ];

  const imgSizeOptions = [
    { value: "128", label: "128x128", description: "Fast training" },
    { value: "224", label: "224x224", description: "Standard (Recommended)" },
    { value: "256", label: "256x256", description: "High resolution" },
    { value: "299", label: "299x299", description: "Max accuracy" },
  ];

  const batchSizeOptions = [
    { value: "16", label: "16", description: "Small memory" },
    { value: "32", label: "32", description: "Standard (Recommended)" },
    { value: "64", label: "64", description: "Fast training" },
    { value: "128", label: "128", description: "Large memory required" },
  ];

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Image Classification Configuration
      </h2>

      <div className="space-y-6">
        {/* Dataset Upload */}
        <div
          onClick={handleAreaClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600 scale-[1.02]"
              : dataset
              ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-600"
              : "border-gray-300 dark:border-zinc-700 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-zinc-800 dark:to-blue-900/10 hover:border-gray-400 dark:hover:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700/50"
          }`}
        >
          <input
            ref={datasetInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="space-y-4">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 ${
                dataset
                  ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                  : "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400"
              }`}
            >
              {dataset ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white text-lg">
                {dataset ? "Dataset Uploaded" : "Upload Image Dataset"}
              </p>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {dataset ? (
                  <span className="inline-flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    {datasetInfo?.name || dataset.name}
                  </span>
                ) : (
                  "Drag & drop ZIP file or click to browse"
                )}
              </p>
              
              {dataset && datasetInfo && (
                <div className="mt-4 inline-flex items-center gap-4 text-xs">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    {datasetInfo.size}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                    {datasetInfo.type}
                  </span>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-500 dark:text-zinc-500 max-w-md mx-auto">
                Dataset should be in ZIP format with folder structure:
                <div className="mt-1 font-mono text-xs p-2 rounded">
                  dataset.zip/<br />
                  ├── cat/<br />
                  │   ├── image1.jpg<br />
                  │   └── image2.jpg<br />
                  ├── dog/<br />
                  │   ├── image1.jpg<br />
                  │   └── image2.jpg<br />
                  └── ...
                </div>
              </div>
              
              {dataset && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove dataset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Model Architecture */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Model Architecture
            </label>
            <select
              value={modelArchitecture}
              onChange={(e) => setModelArchitecture(e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              {modelArchitectures.map((arch) => (
                <option key={arch.value} value={arch.value}>
                  {arch.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              {modelArchitectures.find(a => a.value === modelArchitecture)?.description}
            </p>
          </div>

          {/* Image Size */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image Size
            </label>
            <select
              value={imgSize}
              onChange={(e) => setImgSize(parseInt(e.target.value))}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              {imgSizeOptions.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              {imgSizeOptions.find(s => parseInt(s.value) === imgSize)?.description}
            </p>
          </div>

          {/* Batch Size */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Batch Size
            </label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              {batchSizeOptions.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              {batchSizeOptions.find(b => parseInt(b.value) === batchSize)?.description}
            </p>
          </div>

          {/* Epochs */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Training Epochs
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:dark:bg-teal-600"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                  {epochs} Epochs
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-500">
                  {epochs <= 15 ? "Quick training" : epochs <= 30 ? "Standard" : "Extended training"}
                </span>
              </div>
            </div>
          </div>

          {/* Learning Rate */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-2 text-sm font-medium">
              Learning Rate
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0.00001"
                max="0.001"
                step="0.00001"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:dark:bg-blue-600"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                  {learningRate.toFixed(5)}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-500">
                  {learningRate <= 0.0001 ? "Slow & stable" : learningRate <= 0.0005 ? "Balanced" : "Fast convergence"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Augmentation Toggle */}
        <div className="md:col-span-2 lg:col-span-3">
          <div
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/10 dark:to-blue-900/10 hover:shadow-md transition-all duration-300 group cursor-pointer"
            onClick={() => setEnableDataAugmentation(!enableDataAugmentation)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg transition-all duration-300 ${
                  enableDataAugmentation
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  Data Augmentation
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">
                  {enableDataAugmentation
                    ? "Enabled - Random rotations, flips, zooms applied"
                    : "Disabled - Original images only"}
                </div>
              </div>
            </div>

            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                enableDataAugmentation
                  ? "bg-purple-500 dark:bg-purple-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                  enableDataAugmentation ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Augmentation Preview */}
        {enableDataAugmentation && (
          <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-medium text-gray-800 dark:text-zinc-200 text-sm">
                Augmentation Preview
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-800 flex items-center justify-center">
                  <span className="text-xs font-medium">Rotate</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">±20°</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-200 to-green-300 dark:from-green-700 dark:to-green-800 flex items-center justify-center">
                  <span className="text-xs font-medium">Shift</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">10%</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-700 dark:to-yellow-800 flex items-center justify-center">
                  <span className="text-xs font-medium">Zoom</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">±20%</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-red-200 to-red-300 dark:from-red-700 dark:to-red-800 flex items-center justify-center">
                  <span className="text-xs font-medium">Flip</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">Horizontal</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-600 dark:text-zinc-400">
              Applies random transformations during training to improve model generalization
            </p>
          </div>
        )}

        {/* Training Time Estimate */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="font-medium text-gray-800 dark:text-zinc-200 text-sm">
              Estimated Training Time
            </h4>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-zinc-300">
              {(() => {
                const timeEstimate = (epochs * batchSize * imgSize * 0.001).toFixed(1);
                return `${timeEstimate} minutes approx`;
              })()}
            </div>
            <div className="text-xs text-gray-500 dark:text-zinc-500">
              Based on current settings
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
              style={{
                width: `${Math.min(100, epochs * 2 + batchSize * 0.5)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="submit"
            onClick={onTrain}
            disabled={loading || !dataset}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || !dataset
                ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-zinc-500 dark:text-zinc-400"
                : "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Training Model...
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Train Image Classifier
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={downloadLoading || !dataset || !isTrained}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              downloadLoading || !dataset || !isTrained
                ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-zinc-500 dark:text-zinc-400"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-lg active:scale-[0.98]"
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
                Image Classification Information
              </h4>
              <div className="text-xs text-gray-600 dark:text-zinc-400 space-y-1">
                <p>
                  <span className="font-medium">Transfer Learning:</span> Uses
                  pre-trained EfficientNet model, fine-tuned on your dataset
                </p>
                <p>
                  <span className="font-medium">Dataset Format:</span> ZIP file
                  with class folders. Each folder contains images of that class
                </p>
                <p>
                  <span className="font-medium">Recommended:</span> 100-1000
                  images per class, balanced classes for best results
                </p>
                <p>
                  <span className="font-medium">Performance:</span> Model will
                  automatically split data (80% train, 20% validation)
                </p>
                <p>
                  <span className="font-medium">Supported Formats:</span> JPEG,
                  PNG, BMP, GIF images
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}