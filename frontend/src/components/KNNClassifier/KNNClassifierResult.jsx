import { AlertCircle, Target, BarChart3, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function KNNClassifierResult({ result, error }) {
  // Colors constant for consistent coloring
  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
  ];

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

  // Get performance metrics for bar chart
  const getPerformanceMetrics = () => {
    if (!result) return [];

    return [
      { name: "Accuracy", value: result.accuracy, fill: "#10b981" },
      { name: "Precision", value: result.precision, fill: "#3b82f6" },
      { name: "Recall", value: result.recall, fill: "#8b5cf6" },
      { name: "F1 Score", value: result.f1_score, fill: "#f59e0b" },
    ];
  };

  // Get class distribution data for pie chart
  const getClassDistributionData = () => {
    if (!result?.class_distribution) return [];

    return Object.entries(result.class_distribution).map(
      ([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      })
    );
  };

  // Get feature importance data for KNN (based on feature variance)
  const getFeatureImportanceData = () => {
    if (!result?.feature_importance) return [];

    return Object.entries(result.feature_importance)
      .map(([name, importance]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        importance: importance,
        fullName: name,
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10); // Top 10 features
  };

  // Get misclassification analysis data
  const getMisclassificationData = () => {
    if (!result?.confusion_matrix) return [];

    const matrix = result.confusion_matrix;
    const misclassifications = [];

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (i !== j && matrix[i][j] > 0) {
          misclassifications.push({
            actualClass: result.classes?.[i] || i,
            predictedClass: result.classes?.[j] || j,
            count: matrix[i][j],
            percentage:
              (matrix[i][j] / matrix.flat().reduce((a, b) => a + b, 0)) * 100,
          });
        }
      }
    }

    return misclassifications
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const performanceMetrics = getPerformanceMetrics();
  const classDistributionData = getClassDistributionData();
  const featureImportanceData = getFeatureImportanceData();
  const misclassificationData = getMisclassificationData();

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        KNN Classifier Results
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
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold">Classification Performance</h3>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Accuracy
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(result.accuracy * 100).toFixed(2)}%
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
                  {(result.precision * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Quality of predictions
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Recall
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {(result.recall * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Sensitivity
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  F1 Score
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {(result.f1_score * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Balance of precision/recall
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  K Value
                </div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {result.k_value || "N/A"}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Number of neighbors
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Classes
                </div>
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {result.n_classes || (result.classes ? result.classes.length : "N/A")}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Distinct classes
                </div>
              </div>

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
                  Test Size
                </div>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {result.testSize}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Holdout set
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
                    domain={[0, 1]}
                    stroke="#6b7280"
                    className="dark:stroke-zinc-400"
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${(value * 100).toFixed(2)}%`,
                      "Score",
                    ]}
                    content={<CustomTooltip />}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Score"
                    radius={[4, 4, 0, 0]}
                  >
                    {performanceMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Confusion Matrix */}
            {result?.confusion_matrix && result?.classes && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Confusion Matrix
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800"></th>
                        {result.classes.map((className, index) => (
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
                      {result.classes.map((actualClass, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="p-3 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 font-medium">
                            Actual: {actualClass}
                          </td>
                          {result.classes.map((predictedClass, colIndex) => {
                            const value =
                              result.confusion_matrix[rowIndex][colIndex];
                            const isDiagonal = rowIndex === colIndex;
                            const maxValue = Math.max(
                              ...result.confusion_matrix.flat()
                            );
                            const intensity = value / maxValue;
                            const correctColor = COLORS[0]; // green
                            const incorrectColor = COLORS[1]; // blue
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
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Incorrect Predictions</span>
                  </div>
                </div>
              </div>
            )}

            {/* Class Distribution */}
            {classDistributionData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Class Distribution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={classDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {classDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Samples"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700 dark:text-zinc-300">
                      Class Details
                    </h5>
                    {classDistributionData.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-zinc-800"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: entry.fill }}
                          ></div>
                          <span className="text-sm text-gray-700 dark:text-zinc-300">
                            {entry.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.value} samples
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feature Importance */}
            {featureImportanceData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                  Top Feature Importance (Variance)
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={featureImportanceData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      className="dark:stroke-zinc-700"
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
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        value.toFixed(4),
                        "Importance (Variance)",
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return payload[0].payload.fullName;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="importance"
                      name="Feature Importance"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      className="dark:fill-purple-500"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Misclassification Analysis Table */}
            {misclassificationData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                  Detailed Misclassifications
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-zinc-800">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          Actual Class
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          Predicted As
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                      {misclassificationData.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {item.actualClass}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {item.predictedClass}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {item.count}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {item.percentage.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* KNN Parameters Summary */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                Model Configuration
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-zinc-400">
                    Algorithm:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {result.algorithm || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-zinc-400">
                    Weights:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {result.weights || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-zinc-400">
                    Metric:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {result.metric || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-zinc-400">
                    Random State:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {result.random_state || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Model Interpretation */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-green-50 dark:bg-green-900/20">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                Interpretation Guide
              </h4>
              <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                <p>
                  <strong>Accuracy {(result.accuracy * 100).toFixed(2)}%:</strong>{" "}
                  {result.accuracy > 0.9
                    ? "Excellent classification performance"
                    : result.accuracy > 0.8
                    ? "Good performance - suitable for most applications"
                    : result.accuracy > 0.7
                    ? "Acceptable performance - consider tuning parameters"
                    : "Poor performance - review data or model parameters"}
                </p>
                <p>
                  <strong>K Value ({result.n_neighbors}):</strong> A smaller K is
                  more sensitive to noise, while a larger K provides smoother
                  decision boundaries. Consider trying different values.
                </p>
                <p>
                  <strong>Confusion Matrix:</strong> Diagonal cells show correct
                  predictions. Off-diagonal cells show misclassifications -
                  analyze patterns for systematic errors.
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
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No Results Yet</h4>
            <p>
              Upload your data and train the KNN Classifier to see performance
              metrics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}