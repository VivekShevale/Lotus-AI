import {
    AlertCircle,
    Trees,
    BarChart3,
    PieChart,
    Target,
    Brain,
    GitBranch,
    Layers,
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
  } from "recharts";
  
  export default function RandomForestResult({ result, error, targetColumn }) {
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
  
    // Get feature importance data for bar chart
    const getFeatureImportanceData = () => {
      if (!result?.feature_importance) return [];
  
      return Object.entries(result.feature_importance)
        .map(([name, importance]) => ({
          name,
          importance: importance,
          percentage: (importance * 100).toFixed(2),
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 15); // Top 15 features for readability
    };
  
    // Get performance metrics for bar chart
    const getPerformanceMetrics = () => {
      if (!result) return [];
  
      const metrics = [
        { name: "Accuracy", value: result.accuracy, fill: "#10b981" },
      ];
  
      if (result.precision !== undefined) {
        metrics.push({
          name: "Precision",
          value: result.precision,
          fill: "#3b82f6",
        });
      }
      if (result.recall !== undefined) {
        metrics.push({ name: "Recall", value: result.recall, fill: "#8b5cf6" });
      }
      if (result.f1_score !== undefined) {
        metrics.push({
          name: "F1-Score",
          value: result.f1_score,
          fill: "#f59e0b",
        });
      }
  
      return metrics;
    };
  
    // Get class distribution data for pie chart
    const getClassDistributionData = () => {
      if (!result?.class_distribution) return [];
  
      return Object.entries(result.class_distribution).map(
        ([className, count]) => ({
          name: className,
          value: count,
          percentage: ((count / result.n_samples) * 100).toFixed(1),
        })
      );
    };
  
    // Get confusion matrix data for visualization
    const getConfusionMatrixHeatmapData = () => {
      if (!result?.confusion_matrix || !result?.classes) return [];
  
      const data = [];
      result.confusion_matrix.forEach((row, i) => {
        row.forEach((cell, j) => {
          data.push({
            actual: result.classes[i],
            predicted: result.classes[j],
            value: cell,
            isCorrect: i === j,
          });
        });
      });
      return data;
    };
  
    // Get class-wise metrics for line chart
    const getClassMetricsData = () => {
      if (!result?.class_report) return [];
  
      return Object.entries(result.class_report).map(([className, metrics]) => ({
        class: className,
        precision: metrics.precision || 0,
        recall: metrics.recall || 0,
        f1_score: metrics["f1-score"] || 0,
      }));
    };
  
    // Get random forest structure info
    const getRandomForestInfo = () => {
      if (!result) return [];
  
      return [
        { name: "Trees", value: result.n_estimators || "N/A" },
        { name: "Max Depth", value: result.max_depth || "N/A" },
        { name: "Avg Leaves", value: result.avg_leaves || "N/A" },
        { name: "Min Samples Split", value: result.min_samples_split || "N/A" },
        { name: "Min Samples Leaf", value: result.min_samples_leaf || "N/A" },
      ];
    };
  
    // Get OOB (Out-of-Bag) score if available
    const getOOBInfo = () => {
      if (!result) return null;
      return result.oob_score !== undefined ? result.oob_score : null;
    };
  
    // Get feature importance comparison across trees
    const getFeatureImportanceVariance = () => {
      if (!result?.feature_importance_variance) return [];
      
      return Object.entries(result.feature_importance_variance)
        .map(([name, variance]) => ({
          name,
          variance: variance,
        }))
        .sort((a, b) => b.variance - a.variance)
        .slice(0, 10);
    };
  
    // Get tree depth distribution
    const getTreeDepthDistribution = () => {
      if (!result?.tree_depths) return [];
      
      const depths = result.tree_depths || [];
      const depthCount = {};
      
      depths.forEach(depth => {
        depthCount[depth] = (depthCount[depth] || 0) + 1;
      });
      
      return Object.entries(depthCount)
        .map(([depth, count]) => ({
          depth: `Depth ${depth}`,
          trees: count,
        }))
        .sort((a, b) => parseInt(a.depth.split(' ')[1]) - parseInt(b.depth.split(' ')[1]));
    };
  
    const featureImportanceData = getFeatureImportanceData();
    const performanceMetrics = getPerformanceMetrics();
    const classDistributionData = getClassDistributionData();
    const confusionMatrixData = getConfusionMatrixHeatmapData();
    const classMetricsData = getClassMetricsData();
    const randomForestInfo = getRandomForestInfo();
    const oobScore = getOOBInfo();
    const featureImportanceVariance = getFeatureImportanceVariance();
    const treeDepthDistribution = getTreeDepthDistribution();
  
    // Colors for charts
    const COLORS = [
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#f59e0b",
      "#ef4444",
      "#ec4899",
      "#14b8a6",
      "#6366f1",
      "#d946ef",
      "#f97316",
    ];
  
    return (
      <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Random Forest Results
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
                <Trees className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold">Model Performance</h3>
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
                    Correct predictions
                  </div>
                </div>
  
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    Precision
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {result.precision !== undefined
                      ? (result.precision * 100).toFixed(1) + "%"
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    Positive predictive value
                  </div>
                </div>
  
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    Recall
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {result.recall !== undefined
                      ? (result.recall * 100).toFixed(1) + "%"
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    Sensitivity
                  </div>
                </div>
  
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    F1-Score
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {result.f1_score !== undefined
                      ? (result.f1_score * 100).toFixed(1) + "%"
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    Harmonic mean
                  </div>
                </div>
              </div>
  
              {/* Out-of-Bag Score (if available) */}
              {oobScore !== null && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      Out-of-Bag Score
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {(oobScore * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                      Unbiased estimate of generalization error
                    </div>
                  </div>
                </div>
              )}
  
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
                    Target Feature
                  </div>
                  <div className="text-2xl font-bold text-gray-700 dark:text-zinc-300">
                    {targetColumn}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    Predicted Feature
                  </div>
                </div>
              </div>
  
              {/* Performance Metrics Chart */}
              {performanceMetrics.length > 0 && (
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
                        content={<CustomTooltip />}
                        formatter={(value) => [
                          (value * 100).toFixed(1) + "%",
                          "Value",
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Score" radius={[4, 4, 0, 0]}>
                        {performanceMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
  
              {/* Feature Importance Table */}
              {featureImportanceData.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Feature Importance (Aggregated)
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                      <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Feature Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Importance Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Visualization
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                        {featureImportanceData.map((feature, index) => (
                          <tr
                            key={feature.name}
                            className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {feature.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {feature.importance.toFixed(4)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {feature.percentage}%
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
                                  <div
                                    className="bg-green-600 h-3 rounded-full"
                                    style={{ width: `${feature.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
  
              {/* Random Forest Configuration and Class Distribution */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Random Forest Configuration */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Random Forest Configuration
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {randomForestInfo.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50"
                        >
                          <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                            {item.name}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
  
                    {result.criterion && (
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                        <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                          Split Criterion
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                          {result.criterion === "gini"
                            ? "Gini Impurity"
                            : "Information Gain (Entropy)"}
                        </div>
                      </div>
                    )}
                    
                    {result.class_weight && (
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                        <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                          Class Weight
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                          {result.class_weight === "balanced"
                            ? "Balanced"
                            : result.class_weight === "balanced_subsample"
                            ? "Balanced Subsample"
                            : "None"}
                        </div>
                      </div>
                    )}
                  </div>
  
                  {/* Tree Depth Distribution */}
                  {treeDepthDistribution.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-md font-semibold mb-3 text-gray-800 dark:text-zinc-200">
                        Tree Depth Distribution
                      </h5>
                      <div className="space-y-2">
                        {treeDepthDistribution.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-24 text-sm text-gray-600 dark:text-zinc-400">
                              {item.depth}
                            </div>
                            <div className="flex-1 bg-gray-200 dark:bg-zinc-700 rounded-full h-4">
                              <div
                                className="bg-blue-600 h-4 rounded-full"
                                style={{
                                  width: `${(item.trees / result.n_estimators) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">
                              {item.trees}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
  
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
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
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
              </div>
  
              {/* Confusion Matrix */}
              {confusionMatrixData.length > 0 && (
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
                              const incorrectColor = COLORS[1]; // green
                              const correctColor = COLORS[0];
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
  
              {/* Class-wise Metrics Table */}
              {classMetricsData.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                    Class-wise Performance Metrics
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                      <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Precision
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Recall
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            F1-Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Support
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                        {classMetricsData.map((classMetric, index) => (
                          <tr
                            key={classMetric.class}
                            className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {classMetric.class}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${classMetric.precision * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {(classMetric.precision * 100).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full"
                                    style={{
                                      width: `${classMetric.recall * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {(classMetric.recall * 100).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-orange-600 h-2 rounded-full"
                                    style={{
                                      width: `${classMetric.f1_score * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {(classMetric.f1_score * 100).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {result.class_distribution?.[classMetric.class] ||
                                "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
  
              {/* Model Interpretation */}
              <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-green-50 dark:bg-green-900/20">
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                  Random Forest Model Interpretation
                </h4>
                <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                  <p>
                    <strong>
                      Accuracy {(result.accuracy * 100).toFixed(1)}%:
                    </strong>{" "}
                    {result.accuracy > 0.9
                      ? "Excellent ensemble performance"
                      : result.accuracy > 0.8
                      ? "Good ensemble performance - Random Forest is working well"
                      : result.accuracy > 0.7
                      ? "Acceptable performance - consider tuning hyperparameters"
                      : result.accuracy > 0.6
                      ? "Marginal performance - may need more trees or feature engineering"
                      : "Poor performance - review features and model configuration"}
                  </p>
                  {oobScore !== null && (
                    <p>
                      <strong>Out-of-Bag Score {(oobScore * 100).toFixed(1)}%:</strong>{" "}
                      {oobScore > 0.8
                        ? "Strong generalization ability"
                        : oobScore > 0.7
                        ? "Good generalization - low overfitting risk"
                        : oobScore > 0.6
                        ? "Moderate generalization - monitor for overfitting"
                        : "Weak generalization - high risk of overfitting"}
                    </p>
                  )}
                  <p>
                    <strong>Feature Importance:</strong> Shows aggregated feature
                    importance across all trees in the forest. More stable and
                    reliable than single tree importance.
                  </p>
                  <p>
                    <strong>Ensemble Strength:</strong> {result.n_estimators}{" "}
                    trees provide robustness against overfitting. Consider
                    increasing trees for more stable predictions (up to
                    computational limits).
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
              <Trees className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No Results Yet</h4>
              <p>
                Upload your data and train the Random Forest model to see
                ensemble performance metrics
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }