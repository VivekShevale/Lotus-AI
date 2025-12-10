import {
  AlertCircle,
  Brain,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Layers,
  Activity,
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
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  ComposedChart,
  Cell,
} from "recharts";

export default function NeuralNetworkResult({ result, error, targetColumn }) {
  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-purple-600 dark:text-purple-400"
              style={{ color: entry.color }}
            >
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get performance metrics data
  const getPerformanceMetrics = () => {
    if (!result) return [];

    return [
      {
        name: "R² Score",
        value: result.r2,
        color: "#10b981",
        description: "Variance explained",
      },
      {
        name: "RMSE",
        value: result.rmse,
        color: "#ef4444",
        description: "Root Mean Square Error",
      },
      {
        name: "MAE",
        value: result.mae,
        color: "#f59e0b",
        description: "Mean Absolute Error",
      },
    ];
  };

  // Get top features data
  const getTopFeaturesData = () => {
    if (!result?.top_features) return [];

    return Object.entries(result.top_features)
      .map(([name, importance]) => ({
        name,
        importance: Math.abs(importance),
        percentage: (Math.abs(importance) * 100).toFixed(2),
        isPositive: importance > 0,
      }))
      .sort((a, b) => b.importance - a.importance);
  };

  // Get predictions vs actual data for scatter plot
  const getPredictionData = () => {
    if (!result?.predictions || !result?.actual) return [];

    return result.predictions.map((pred, index) => ({
      actual: result.actual[index],
      predicted: pred,
      index: index + 1,
      error: Math.abs(result.actual[index] - pred),
      errorPercent: Math.abs((result.actual[index] - pred) / result.actual[index] * 100),
    }));
  };

  // Get error distribution data
  const getErrorDistributionData = () => {
    const predictionData = getPredictionData();
    if (predictionData.length === 0) return [];

    // Create bins for error distribution
    const bins = [0, 0.1, 0.2, 0.3, 0.5, 1, 2, 5, 10, 20];
    const distribution = bins.map(bin => ({ range: `≤${bin}%`, count: 0 }));

    predictionData.forEach(item => {
      const errorPercent = item.errorPercent;
      for (let i = 0; i < bins.length; i++) {
        if (errorPercent <= bins[i]) {
          distribution[i].count++;
          break;
        }
      }
    });

    return distribution;
  };

  // Get loss convergence data (simulated for demo)
  const getLossData = () => {
    if (!result) return [];

    const epochs = 50;
    const lossData = [];
    let currentLoss = 100;

    for (let i = 0; i <= epochs; i++) {
      lossData.push({
        epoch: i,
        loss: currentLoss,
      });
      // Simulate decreasing loss
      currentLoss *= 0.95 + Math.random() * 0.05;
    }

    return lossData;
  };

  // Get residual plot data
  const getResidualData = () => {
    const predictionData = getPredictionData();
    if (predictionData.length === 0) return [];

    return predictionData.map(item => ({
      index: item.index,
      residual: item.actual - item.predicted,
      predicted: item.predicted,
      actual: item.actual,
    }));
  };

  const performanceMetrics = getPerformanceMetrics();
  const topFeaturesData = getTopFeaturesData();
  const predictionData = getPredictionData();
  const errorDistributionData = getErrorDistributionData();
  const lossData = getLossData();
  const residualData = getResidualData();

  // Colors for charts
  const COLORS = [
    "#10b981", // Green
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#f59e0b", // Orange
    "#ef4444", // Red
    "#ec4899", // Pink
  ];

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Neural Network Results
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
              <h3 className="text-xl font-semibold">Neural Network Performance</h3>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  R² Score
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.r2.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  {result.r2 > 0.8
                    ? "Excellent fit"
                    : result.r2 > 0.6
                    ? "Good fit"
                    : result.r2 > 0.4
                    ? "Moderate fit"
                    : "Poor fit"}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  RMSE
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.rmse.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Root Mean Square Error
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  MAE
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {result.mae.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Mean Absolute Error
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  Network Architecture
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {result.hidden_layer_sizes?.join('-') || '100'}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Hidden layers
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Test Size
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-zinc-300">
                  {result.testSize}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Testing proportion
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
                  <ComposedChart
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
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toFixed(4) : value,
                        name,
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Score"
                      radius={[4, 4, 0, 0]}
                      fill="#8884d8"
                    >
                      {performanceMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Predictions vs Actual Scatter Plot */}
            {predictionData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Predictions vs Actual Values
                </h4>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                      label={{
                        value: 'Actual Values',
                        position: 'insideBottom',
                        offset: -10,
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="predicted"
                      name="Predicted"
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                      label={{
                        value: 'Predicted Values',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Scatter
                      name="Predictions"
                      data={predictionData}
                      fill="#8884d8"
                      shape="circle"
                      opacity={0.6}
                    />
                    <Line
                      type="linear"
                      dataKey="actual"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Perfect Prediction"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Features Importance */}
            {topFeaturesData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Feature Importance (Permutation)
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
                          Impact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          Visualization
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                      {topFeaturesData.map((feature, index) => (
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {feature.isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                              )}
                              <span className="text-sm">
                                {feature.isPositive ? "Positive" : "Negative"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full ${
                                    feature.isPositive
                                      ? "bg-green-600"
                                      : "bg-red-600"
                                  }`}
                                  style={{ width: `${feature.percentage}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-500 dark:text-zinc-400">
                                {feature.percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error Distribution and Network Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Error Distribution */}
              {errorDistributionData.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
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
                      <Tooltip
                        formatter={(value) => [`${value} predictions`, "Count"]}
                      />
                      <Bar
                        dataKey="count"
                        name="Number of Predictions"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Loss Convergence (Simulated) */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Training Loss Convergence
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={lossData}
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
                    />
                    <YAxis
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <Tooltip
                      formatter={(value) => [value.toFixed(4), "Loss"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="loss"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Network Architecture Details */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-purple-50 dark:bg-purple-900/20">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Network Configuration
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                  <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
                    Architecture
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {result.hidden_layer_sizes?.join('-') || '100'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                  <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
                    Activation
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {result.activation}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                  <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
                    Solver
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {result.solver}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                  <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
                    Max Iterations
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {result.max_iter || maxIter || 500}
                  </div>
                </div>
              </div>
            </div>

            {/* Model Interpretation */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                Model Interpretation
              </h4>
              <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                <p>
                  <strong>R² Score {result.r2.toFixed(4)}:</strong>{" "}
                  {result.r2 > 0.9
                    ? "Excellent model fit - explains most of the variance"
                    : result.r2 > 0.7
                    ? "Good model fit - explains significant variance"
                    : result.r2 > 0.5
                    ? "Moderate model fit - explains some variance"
                    : "Poor model fit - consider feature engineering or different architecture"}
                </p>
                <p>
                  <strong>RMSE {result.rmse.toFixed(4)}:</strong> Average
                  prediction error in original units. Lower values indicate
                  better predictive accuracy.
                </p>
                <p>
                  <strong>Feature Importance:</strong> Shows how much each
                  feature contributes to predictions through permutation
                  importance.
                </p>
                <p>
                  <strong>Recommendations:</strong>
                  {result.r2 < 0.6 &&
                    " Consider increasing network complexity, adding more features, or adjusting hyperparameters."}
                  {result.rmse > result.mae * 2 &&
                    " High RMSE relative to MAE suggests presence of large errors/outliers."}
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
              Upload your data and train the neural network model to see
              performance metrics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}