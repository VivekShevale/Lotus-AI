import {
    AlertCircle,
    BarChart3,
    PieChart,
    Target,
    Brain,
    Layers,
    TrendingUp,
    Zap,
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
  
  export default function AdaBoostResult({ result, error, targetColumn }) {
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
      if (!result?.top_features) return [];
  
      return Object.entries(result.top_features)
        .map(([name, importance]) => ({
          name,
          importance: importance,
          percentage: (importance * 100).toFixed(2),
        }))
        .sort((a, b) => b.importance - a.importance);
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
  
    // Get AdaBoost configuration info
    const getAdaBoostInfo = () => {
      if (!result) return [];
  
      return [
        { name: "Estimators", value: result.n_estimators || "N/A" },
        { name: "Learning Rate", value: result.learning_rate || "N/A" },
        { name: "Algorithm", value: result.algorithm || "N/A" },
      ];
    };
  
    // Get prediction comparison data
    const getPredictionComparison = () => {
      if (!result?.predictions || !result?.actual) return [];
  
      return result.predictions.slice(0, 20).map((pred, index) => ({
        index: index + 1,
        predicted: pred,
        actual: result.actual[index],
        isCorrect: pred === result.actual[index],
      }));
    };
  
    // Get error rate progression (simulated for AdaBoost)
    const getErrorProgression = () => {
      if (!result?.n_estimators) return [];
  
      const data = [];
      const baseError = 1 - (result.accuracy || 0.7);
      
      for (let i = 1; i <= Math.min(result.n_estimators, 20); i++) {
        // Simulated error reduction as more estimators are added
        const errorReduction = baseError * Math.exp(-0.1 * i);
        data.push({
          estimator: i,
          error: (baseError - errorReduction) * 100,
        });
      }
      
      return data;
    };
  
    const featureImportanceData = getFeatureImportanceData();
    const performanceMetrics = getPerformanceMetrics();
    const adaBoostInfo = getAdaBoostInfo();
    const predictionComparison = getPredictionComparison();
    const errorProgression = getErrorProgression();
  
    // Colors for charts
    const COLORS = [
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#f59e0b",
      "#ef4444",
      "#ec4899",
    ];
  
    return (
      <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AdaBoost Classifier Results
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
                <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold">AdaBoost Model Performance</h3>
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
  
              {/* AdaBoost Configuration */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  AdaBoost Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {adaBoostInfo.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10"
                    >
                      <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                        {item.name}
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {item.value}
                      </div>
                      {item.name === "Algorithm" && (
                        <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                          {result.algorithm === "SAMME" 
                            ? "Real boosting algorithm with probabilities" 
                            : "Discrete boosting algorithm"}
                        </div>
                      )}
                    </div>
                  ))}
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
                    Top Feature Importance
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
                                    className="bg-purple-600 h-3 rounded-full"
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
  
              {/* Error Progression Chart */}
              {errorProgression.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Error Rate Progression
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={errorProgression}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        className="dark:stroke-zinc-700"
                      />
                      <XAxis
                        dataKey="estimator"
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                        label={{ value: 'Number of Estimators', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                        label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        formatter={(value) => [value.toFixed(2) + "%", "Error Rate"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="error"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Error Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
                    Shows how error rate decreases as more weak learners are added (simulated)
                  </p>
                </div>
              )}
  
              {/* Sample Predictions */}
              {predictionComparison.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Sample Predictions (First 20)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                      <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Predicted
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Actual
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Result
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                        {predictionComparison.map((pred, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              {pred.index}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {pred.predicted}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {pred.actual}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  pred.isCorrect
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                              >
                                {pred.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Correct predictions: {predictionComparison.filter(p => p.isCorrect).length}/{predictionComparison.length}</span>
                    </div>
                  </div>
                </div>
              )}
  
              {/* Model Interpretation */}
              <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-purple-50 dark:bg-purple-900/20">
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                  AdaBoost Model Interpretation
                </h4>
                <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                  <p>
                    <strong>
                      Accuracy {(result.accuracy * 100).toFixed(1)}%:
                    </strong>{" "}
                    {result.accuracy > 0.9
                      ? "Excellent ensemble performance"
                      : result.accuracy > 0.8
                      ? "Good ensemble performance"
                      : result.accuracy > 0.7
                      ? "Acceptable ensemble performance"
                      : result.accuracy > 0.6
                      ? "Marginal ensemble performance"
                      : "Poor performance - consider adjusting learning rate or number of estimators"}
                  </p>
                  <p>
                    <strong>AdaBoost Characteristics:</strong>{" "}
                    AdaBoost focuses on difficult samples by giving them more weight in subsequent iterations. 
                    This creates a strong classifier from multiple weak learners.
                  </p>
                  <p>
                    <strong>Learning Rate {result.learning_rate}:</strong>{" "}
                    {result.learning_rate > 1
                      ? "High learning rate - fast learning but may overshoot"
                      : result.learning_rate === 1
                      ? "Standard learning rate"
                      : "Low learning rate - slow but stable learning"}
                  </p>
                  <p>
                    <strong>Number of Estimators ({result.n_estimators}):</strong>{" "}
                    {result.n_estimators > 100
                      ? "Large ensemble - may be computationally expensive"
                      : result.n_estimators > 50
                      ? "Medium ensemble - good balance"
                      : "Small ensemble - may underfit complex patterns"}
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
              <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No Results Yet</h4>
              <p>
                Upload your data and train the AdaBoost classifier to see
                performance metrics
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }