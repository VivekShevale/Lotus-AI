import {
  AlertCircle,
  Image,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Layers,
  Activity,
  PieChart,
  Brain,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";

export default function ImageClassificationResult({ result, error, datasetInfo }) {
  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-teal-600 dark:text-teal-400"
              style={{ color: entry.color }}
            >
              {entry.name}: {typeof entry.value === 'number' 
                ? entry.name.toLowerCase().includes('accuracy') 
                  ? (entry.value * 100).toFixed(1) + '%'
                  : entry.value.toFixed(4)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get training history data
  const getTrainingHistory = () => {
    if (!result?.history) return [];

    const history = [];
    const epochs = result.history.epochs || 10;

    for (let i = 0; i < epochs; i++) {
      history.push({
        epoch: i + 1,
        train_accuracy: result.history.train_accuracy?.[i] || 0,
        val_accuracy: result.history.val_accuracy?.[i] || 0,
        train_loss: result.history.train_loss?.[i] || 0,
        val_loss: result.history.val_loss?.[i] || 0,
      });
    }

    return history;
  };

  // Get performance metrics data
  const getPerformanceMetrics = () => {
    if (!result) return [];

    return [
      {
        name: "Training Accuracy",
        value: result.train_accuracy,
        color: "#10b981",
        description: "Accuracy on training set",
      },
      {
        name: "Validation Accuracy",
        value: result.val_accuracy,
        color: "#3b82f6",
        description: "Accuracy on validation set",
      },
      {
        name: "Training Loss",
        value: result.train_loss,
        color: "#ef4444",
        description: "Loss on training set",
      },
      {
        name: "Validation Loss",
        value: result.val_loss,
        color: "#f59e0b",
        description: "Loss on validation set",
      },
    ];
  };

  // Get class distribution data
  const getClassDistribution = () => {
    if (!result?.classes) return [];

    return Object.entries(result.classes || {}).map(([className, index]) => ({
      name: className,
      value: result.class_counts?.[className] || 100,
      color: `hsl(${index * 60}, 70%, 60%)`,
    }));
  };

  // Get confusion matrix data (if available)
  const getConfusionMatrixData = () => {
    if (!result?.confusion_matrix) return [];

    const data = [];
    const classes = Object.keys(result.classes || {});
    
    if (classes.length === 0) return [];

    result.confusion_matrix.forEach((row, i) => {
      row.forEach((cell, j) => {
        data.push({
          actual: classes[i],
          predicted: classes[j],
          value: cell,
          isCorrect: i === j,
        });
      });
    });

    return data;
  };

  // Get training time data
  const getTrainingTimeData = () => {
    if (!result?.training_time) return [];

    return [
      { phase: "Data Loading", time: result.training_time.data_loading || 5, color: "#3b82f6" },
      { phase: "Model Building", time: result.training_time.model_building || 3, color: "#8b5cf6" },
      { phase: "Training", time: result.training_time.training || 15, color: "#10b981" },
      { phase: "Evaluation", time: result.training_time.evaluation || 2, color: "#f59e0b" },
    ];
  };

  // Get model architecture info
  const getModelInfo = () => {
    if (!result) return [];

    return [
      { name: "Base Model", value: result.model_architecture || "EfficientNet-B0" },
      { name: "Parameters", value: result.total_params ? (result.total_params / 1e6).toFixed(1) + "M" : "4.0M" },
      { name: "Image Size", value: result.image_size || "224x224" },
      { name: "Batch Size", value: result.batch_size || 32 },
    ];
  };

  // Get performance summary
  const getPerformanceSummary = () => {
    if (!result) return null;

    const accuracyGap = Math.abs(result.train_accuracy - result.val_accuracy);
    let status = "excellent";
    let message = "";
    let color = "green";

    if (accuracyGap > 0.15) {
      status = "overfitting";
      message = "Large gap between train/val accuracy. Consider regularization.";
      color = "red";
    } else if (accuracyGap > 0.08) {
      status = "good";
      message = "Model is learning well with moderate generalization.";
      color = "yellow";
    } else {
      status = "excellent";
      message = "Model shows excellent generalization capability.";
      color = "green";
    }

    return { status, message, color };
  };

  const trainingHistory = getTrainingHistory();
  const performanceMetrics = getPerformanceMetrics();
  const classDistribution = getClassDistribution();
  const confusionMatrixData = getConfusionMatrixData();
  const trainingTimeData = getTrainingTimeData();
  const modelInfo = getModelInfo();
  const performanceSummary = getPerformanceSummary();

  // Colors for charts
  const COLORS = [
    "#10b981", // Green
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#f59e0b", // Orange
    "#ef4444", // Red
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#84cc16", // Lime
  ];

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Image Classification Results
      </h2>

      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong className="font-medium">Error:</strong> {error}
            </div>
          </div>
        )}

        {result && (
          <>
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Image className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-xl font-semibold">Training Results</h3>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Training Accuracy
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(result.train_accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  On training data
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Validation Accuracy
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(result.val_accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  On validation data
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Training Loss
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.train_loss.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Categorical cross-entropy
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Validation Loss
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {result.val_loss.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Model generalization
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            {performanceSummary && (
              <div className={`p-4 rounded-lg border ${
                performanceSummary.color === 'green' 
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : performanceSummary.color === 'yellow'
                  ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    performanceSummary.color === 'green' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : performanceSummary.color === 'yellow'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {performanceSummary.color === 'green' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : performanceSummary.color === 'yellow' ? (
                      <Activity className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-zinc-200">
                      Model Performance: {performanceSummary.status.charAt(0).toUpperCase() + performanceSummary.status.slice(1)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                      {performanceSummary.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Training History Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accuracy Over Time */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Accuracy Progress
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={trainingHistory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      className="dark:stroke-zinc-700"
                    />
                    <XAxis
                      dataKey="epoch"
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                      label={{ value: 'Epoch', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                      domain={[0, 1]}
                      tickFormatter={(value) => (value * 100).toFixed(0) + '%'}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      formatter={(value, name) => [
                        (value * 100).toFixed(1) + '%',
                        name === 'train_accuracy' ? 'Training Accuracy' : 'Validation Accuracy',
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="train_accuracy"
                      name="Training Accuracy"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="val_accuracy"
                      name="Validation Accuracy"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Loss Over Time */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Loss Progress
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={trainingHistory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      className="dark:stroke-zinc-700"
                    />
                    <XAxis
                      dataKey="epoch"
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                      label={{ value: 'Epoch', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      formatter={(value) => [value.toFixed(4), 'Loss']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="train_loss"
                      name="Training Loss"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="val_loss"
                      name="Validation Loss"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Model Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modelInfo.map((info, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50"
                >
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    {info.name}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {info.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Class Distribution */}
            {classDistribution.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Class Distribution
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={classDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {classDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${props.payload.value} images`,
                          props.payload.name,
                        ]}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  {/* Class List */}
                  <div>
                    <div className="space-y-3">
                      {classDistribution.map((cls, index) => (
                        <div
                          key={cls.name}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cls.color || COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {cls.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-zinc-400">
                            {cls.value} images
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-600 dark:text-zinc-400">
                      <p className="font-medium mb-1">Dataset Statistics:</p>
                      <p>• Total classes: {classDistribution.length}</p>
                      <p>• Total images: {classDistribution.reduce((sum, cls) => sum + cls.value, 0)}</p>
                      <p>• Average per class: {Math.round(classDistribution.reduce((sum, cls) => sum + cls.value, 0) / classDistribution.length)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confusion Matrix */}
            {confusionMatrixData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Confusion Matrix
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800"></th>
                        {Object.keys(result.classes || {}).map((className, index) => (
                          <th
                            key={index}
                            className="p-3 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-center font-medium text-sm"
                          >
                            Pred: {className}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(result.classes || {}).map((actualClass, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="p-3 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 font-medium text-sm">
                            Act: {actualClass}
                          </td>
                          {Object.keys(result.classes || {}).map((predictedClass, colIndex) => {
                            const cellData = confusionMatrixData.find(
                              d => d.actual === actualClass && d.predicted === predictedClass
                            );
                            const value = cellData?.value || 0;
                            const isDiagonal = rowIndex === colIndex;
                            const maxValue = Math.max(...confusionMatrixData.map(d => d.value));
                            const intensity = maxValue > 0 ? value / maxValue : 0;
                            
                            return (
                              <td
                                key={colIndex}
                                className="p-3 border border-gray-300 dark:border-zinc-700 text-center font-medium transition-all hover:scale-105"
                                style={{
                                  backgroundColor: isDiagonal
                                    ? `rgba(16, 185, 129, ${intensity * 0.7 + 0.3})`
                                    : `rgba(239, 68, 68, ${intensity * 0.7 + 0.3})`,
                                  color: intensity > 0.5 ? "white" : "inherit",
                                }}
                              >
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Correct Predictions (Diagonal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Incorrect Predictions</span>
                  </div>
                </div>
              </div>
            )}

            {/* Training Time Breakdown */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Training Time Breakdown
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={trainingTimeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    className="dark:stroke-zinc-700"
                  />
                  <XAxis
                    dataKey="phase"
                    stroke="#6b7280"
                    className="dark:stroke-zinc-400"
                  />
                  <YAxis
                    stroke="#6b7280"
                    className="dark:stroke-zinc-400"
                    label={{ value: 'Time (minutes)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} minutes`, 'Time']}
                  />
                  <Bar
                    dataKey="time"
                    name="Time"
                    radius={[4, 4, 0, 0]}
                  >
                    {trainingTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Model Interpretation & Recommendations */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-zinc-200">
                Model Interpretation & Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-zinc-300 mb-2">
                    Current Performance
                  </h5>
                  <ul className="text-sm text-gray-600 dark:text-zinc-400 space-y-1">
                    <li>• Validation accuracy: {(result.val_accuracy * 100).toFixed(1)}%</li>
                    <li>• Accuracy gap: {(Math.abs(result.train_accuracy - result.val_accuracy) * 100).toFixed(1)}%</li>
                    <li>• Loss convergence: {result.train_loss < 0.2 ? "Good" : "Needs improvement"}</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-zinc-300 mb-2">
                    Recommendations
                  </h5>
                  <ul className="text-sm text-gray-600 dark:text-zinc-400 space-y-1">
                    {result.val_accuracy < 0.7 && (
                      <li>• Increase training epochs or add more data</li>
                    )}
                    {result.train_accuracy - result.val_accuracy > 0.15 && (
                      <li>• Add more regularization (dropout, weight decay)</li>
                    )}
                    {classDistribution.length > 10 && (
                      <li>• Consider more complex model architecture</li>
                    )}
                    <li>• Export model for deployment or further fine-tuning</li>
                  </ul>
                </div>
              </div>
              {result.model_path && (
                <div className="mt-4 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Model Saved
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500">
                        {result.model_path}
                      </div>
                    </div>
                    <div className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Ready for download
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!result && !error && (
          <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
            <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No Results Yet</h4>
            <p className="max-w-md mx-auto">
              Upload your image dataset and train the classifier to see performance metrics, 
              training progress, and model analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}