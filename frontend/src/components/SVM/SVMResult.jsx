import {
  AlertCircle,
  Brain,
  Target,
  BarChart3,
  Shield,
  Zap,
  Cpu,
  PieChart,
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
  PieChart as RechartPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts";

export default function SVMResult({ result, error, targetColumn }) {
  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-blue-600 dark:text-blue-400">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for scatter plot
  const ScatterTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">
            Prediction vs Actual
          </p>
          <p className="text-green-600 dark:text-green-400">
            Actual: {payload[0].payload.actual}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            Predicted: {payload[0].payload.predicted}
          </p>
          <p className="text-red-600 dark:text-red-400">
            Error: {payload[0].payload.error || "N/A"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get performance metrics for bar chart
  const getPerformanceMetrics = () => {
    if (!result) return [];

    return [
      { name: "Accuracy", value: result.accuracy * 100, fill: "#10b981" },
      { name: "Precision", value: result.precision * 100, fill: "#3b82f6" },
      { name: "Recall", value: result.recall * 100, fill: "#8b5cf6" },
      { name: "F1-Score", value: result.f1_score * 100, fill: "#f59e0b" },
    ];
  };

  // Get top features data (only for linear kernel)
  const getTopFeaturesData = () => {
    if (
      !result?.top_features ||
      result.top_features === "Not available for non-linear kernels"
    ) {
      return [];
    }

    return Object.entries(result.top_features)
      .map(([name, importance]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        importance: Math.abs(importance),
        coefficient: importance,
        sign: importance > 0 ? "positive" : "negative",
      }))
      .sort((a, b) => b.importance - a.importance);
  };

  // Get scatter plot data for predictions vs actual
  const getScatterData = () => {
    if (!result?.predictions || !result?.actual) return [];

    const uniqueValues = [
      ...new Set([...result.actual, ...result.predictions]),
    ];
    const jitter = 0.2; // Add jitter for visualization

    return result.actual.map((actualVal, i) => {
      const predictedVal = result.predictions[i];
      return {
        actual: actualVal + (Math.random() - 0.5) * jitter,
        predicted: predictedVal + (Math.random() - 0.5) * jitter,
        error: Math.abs(actualVal - predictedVal),
        isCorrect: actualVal === predictedVal,
      };
    });
  };

  // Get confusion matrix data
  const getConfusionMatrixData = () => {
    if (!result?.predictions || !result?.actual) return [];

    const uniqueClasses = [
      ...new Set([...result.actual, ...result.predictions]),
    ].sort();
    const matrix = {};

    // Initialize matrix
    uniqueClasses.forEach((actual) => {
      matrix[actual] = {};
      uniqueClasses.forEach((predicted) => {
        matrix[actual][predicted] = 0;
      });
    });

    // Fill matrix
    result.actual.forEach((actual, i) => {
      const predicted = result.predictions[i];
      matrix[actual][predicted] += 1;
    });

    return {
      classes: uniqueClasses,
      matrix: matrix,
    };
  };

  // Get error distribution data
  const getErrorDistributionData = () => {
    if (!result?.predictions || !result?.actual) return [];

    const errors = result.actual.map((val, i) =>
      Math.abs(val - result.predictions[i])
    );

    // Create bins for error distribution
    const maxError = Math.max(...errors);
    const binSize = Math.max(1, Math.ceil(maxError / 5));
    const bins = [];

    for (let i = 0; i < 5; i++) {
      const min = i * binSize;
      const max = (i + 1) * binSize;
      const count = errors.filter((e) => e >= min && e < max).length;
      bins.push({
        range: `${min}-${max}`,
        count: count,
      });
    }

    return bins;
  };

  // Get SVM configuration info
  const getSVMConfigData = () => {
    if (!result) return [];

    return [
      { name: "Kernel", value: result.kernel || "rbf" },
      { name: "C Parameter", value: result.C || 1.0 },
      { name: "Gamma", value: result.gamma || "scale" },
      { name: "Degree", value: result.degree || "N/A" },
      { name: "Probability", value: result.probability ? "Yes" : "No" },
      { name: "Shrinking", value: result.shrinking ? "Yes" : "No" },
    ];
  };

  // Get class distribution for pie chart
  const getClassDistributionData = () => {
    if (!result?.actual) return [];

    const distribution = {};
    result.actual.forEach((val) => {
      distribution[val] = (distribution[val] || 0) + 1;
    });

    const colors = [
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#f59e0b",
      "#ef4444",
      "#ec4899",
    ];

    return Object.entries(distribution).map(([name, value], index) => ({
      name: `Class ${name}`,
      value,
      percentage: ((value / result.actual.length) * 100).toFixed(1),
      fill: colors[index % colors.length],
    }));
  };

  const performanceMetrics = getPerformanceMetrics();
  const topFeaturesData = getTopFeaturesData();
  const scatterData = getScatterData();
  const confusionMatrix = getConfusionMatrixData();
  const errorDistributionData = getErrorDistributionData();
  const svmConfigData = getSVMConfigData();
  const classDistributionData = getClassDistributionData();

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Support Vector Machine (SVM) Results
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
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-semibold">SVM Model Performance</h3>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Accuracy
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(result.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Overall correctness
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Precision
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(result.precision * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  True positives / predicted positives
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Recall
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {(result.recall * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  True positives / actual positives
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  F1-Score
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {(result.f1_score * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Harmonic mean
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Samples
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-zinc-300">
                  {result.n_samples}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Total data points
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Features
                </div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {result.n_features}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Input features
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Target
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-zinc-300">
                  {targetColumn || result.target_column || "N/A"}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Predicted feature
                </div>
              </div>
            </div>

            {/* Performance Metrics Chart */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Metrics
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={performanceMetrics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    className="dark:stroke-zinc-700"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    className="dark:stroke-zinc-400"
                  />
                  <YAxis
                    stroke="#6b7280"
                    className="dark:stroke-zinc-400"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value.toFixed(1)}%`, "Value"]}
                    content={<CustomTooltip />}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Score (%)" radius={[4, 4, 0, 0]}>
                    {performanceMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* SVM Configuration */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                SVM Configuration
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {svmConfigData.map((config, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50"
                  >
                    <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                      {config.name}
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {config.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Importance (only for linear kernel) */}
            {topFeaturesData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Feature Importance (Linear Kernel Only)
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topFeaturesData}
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      className="dark:stroke-zinc-700"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                      width={100}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value.toFixed(
                          4
                        )} (Coefficient: ${props.payload.coefficient.toFixed(
                          4
                        )})`,
                        "Absolute Importance",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="importance"
                      name="Importance"
                      radius={[0, 4, 4, 0]}
                    >
                      {topFeaturesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.sign === "positive" ? "#10b981" : "#ef4444"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#10b981] rounded"></div>
                    <span>Positive Coefficient</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ef4444] rounded"></div>
                    <span>Negative Coefficient</span>
                  </div>
                </div>
              </div>
            )}

            {/* Predictions vs Actual Scatter Plot */}
            {scatterData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Predictions vs Actual
                </h4>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      className="dark:stroke-zinc-700"
                    />
                    <XAxis
                      type="number"
                      dataKey="actual"
                      name="Actual"
                      label={{
                        value: "Actual Values",
                        position: "insideBottom",
                        fill: "#374151",
                        className: "dark:fill-zinc-400",
                      }}
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <YAxis
                      type="number"
                      dataKey="predicted"
                      name="Predicted"
                      label={{
                        value: "Predicted Values",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#374151",
                        className: "dark:fill-zinc-400",
                      }}
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <Tooltip content={<ScatterTooltip />} />
                    <Legend />

                    {/* Perfect prediction line (y=x) */}
                    <ReferenceLine
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      className="dark:stroke-green-400"
                    />

                    <Scatter
                      name="Data Points"
                      data={scatterData}
                      fill="#4f46e5"
                      className="dark:fill-blue-500"
                    />
                  </ScatterChart>
                </ResponsiveContainer>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#4f46e5] rounded-full dark:bg-blue-500"></div>
                    <span>Data Points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-[#10b981] border border-dashed dark:bg-green-400"></div>
                    <span>Perfect Prediction (y=x)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confusion Matrix */}
            {confusionMatrix.classes && confusionMatrix.classes.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                  Confusion Matrix
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800"></th>
                        {confusionMatrix.classes.map((className, index) => (
                          <th
                            key={index}
                            className="p-3 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-center font-medium"
                          >
                            Predicted: {className}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {confusionMatrix.classes.map((actualClass, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="p-3 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 font-medium">
                            Actual: {actualClass}
                          </td>
                          {confusionMatrix.classes.map(
                            (predictedClass, colIndex) => {
                              const value =
                                confusionMatrix.matrix[actualClass]?.[
                                  predictedClass
                                ] || 0;
                              const isDiagonal = rowIndex === colIndex;
                              const maxValue = Math.max(
                                ...confusionMatrix.classes.map((cls) =>
                                  Math.max(
                                    ...confusionMatrix.classes.map(
                                      (pred) =>
                                        confusionMatrix.matrix[cls]?.[pred] || 0
                                    )
                                  )
                                )
                              );
                              const intensity =
                                maxValue > 0 ? value / maxValue : 0;
                              const correctColor = "#10b981"; // green
                              const incorrectColor = "#3b82f6"; // blue

                              return (
                                <td
                                  key={colIndex}
                                  className="p-3 border border-gray-300 dark:border-zinc-700 text-center font-medium"
                                  style={{
                                    backgroundColor: isDiagonal
                                      ? `${correctColor}${Math.floor(
                                          (intensity * 0.8 + 0.2) * 255
                                        )
                                          .toString(16)
                                          .padStart(2, "0")}`
                                      : `${incorrectColor}${Math.floor(
                                          (intensity * 0.8 + 0.2) * 255
                                        )
                                          .toString(16)
                                          .padStart(2, "0")}`,
                                    color:
                                      intensity > 0.5 ? "white" : "inherit",
                                  }}
                                >
                                  {value}
                                </td>
                              );
                            }
                          )}
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
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Incorrect Predictions</span>
                  </div>
                </div>
              </div>
            )}

            {/* Class Distribution and Error Distribution */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Distribution */}
              {classDistributionData.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Class Distribution
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartPieChart>
                      <Pie
                        data={classDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) =>
                          `${name}: ${percentage}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {classDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${props.payload.value} (${props.payload.percentage}%)`,
                          "Count",
                        ]}
                      />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Error Distribution */}
              {errorDistributionData.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                    Error Distribution
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={errorDistributionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        className="dark:stroke-zinc-700"
                      />
                      <XAxis
                        dataKey="range"
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                      />
                      <YAxis
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Number of Predictions"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        className="dark:fill-orange-500"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Model Interpretation */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-purple-50 dark:bg-purple-900/20">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                SVM Model Interpretation
              </h4>
              <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                <p>
                  <strong>
                    Accuracy {(result.accuracy * 100).toFixed(1)}%:
                  </strong>{" "}
                  {result.accuracy > 0.9
                    ? "Excellent classification performance - SVM is separating classes very well"
                    : result.accuracy > 0.8
                    ? "Good classification performance - SVM is effectively separating classes"
                    : result.accuracy > 0.7
                    ? "Acceptable classification performance - consider tuning hyperparameters"
                    : result.accuracy > 0.6
                    ? "Marginal performance - try different kernel or feature engineering"
                    : "Poor performance - consider different algorithm or extensive parameter tuning"}
                </p>
                <p>
                  <strong>Kernel Type ({result.kernel}):</strong>{" "}
                  {result.kernel === "linear"
                    ? "Linear kernel creates straight decision boundaries"
                    : result.kernel === "rbf"
                    ? "RBF kernel creates complex, non-linear decision boundaries"
                    : result.kernel === "poly"
                    ? "Polynomial kernel can capture polynomial relationships"
                    : "Sigmoid kernel similar to neural network activation"}
                </p>
                <p>
                  <strong>Regularization (C={result.C}):</strong>{" "}
                  {result.C > 1
                    ? "Lower regularization - model may overfit to training data"
                    : result.C < 1
                    ? "Higher regularization - model may underfit"
                    : "Standard regularization - good balance between fit and generalization"}
                </p>
                {result.model_id && (
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">
                    Model ID: {result.model_id}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!result && !error && (
          <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
            <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No Results Yet</h4>
            <p>
              Upload your data and train the SVM model to see classification
              results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
