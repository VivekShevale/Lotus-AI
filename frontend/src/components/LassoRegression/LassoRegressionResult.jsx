import { useState, useMemo } from "react";
import {
  AlertCircle,
  TrendingUp,
  Target,
  BarChart3,
  GitBranch,
  LineChart as LineChartIcon,
  Zap,
  DollarSign,
  TrendingDown,
  Activity,
  PieChart,
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
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
  Cell, // ADD THIS IMPORT
} from "recharts";

export default function LassoRegressionResult({ result, error, targetColumn }) {
  const [viewMode, setViewMode] = useState("coefficients"); // "coefficients", "predictions", "residuals"

  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className={
                entry.color || entry.stroke || "text-blue-600 dark:text-blue-400"
              }
            >
              {entry.name}:{" "}
              {typeof entry.value === "number"
                ? entry.value.toFixed(4)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Memoized data calculations
  const coefficientData = useMemo(() => {
    if (!result?.feature_coefficients) return [];

    return Object.entries(result.feature_coefficients)
      .map(([name, coefficient]) => ({
        name,
        coefficient: coefficient,
        absolute: Math.abs(coefficient),
        sign: coefficient >= 0 ? "positive" : "negative",
      }))
      .sort((a, b) => b.absolute - a.absolute);
  }, [result?.feature_coefficients]);

  const topFeatures = useMemo(() => {
    if (!result?.top_features) return [];

    return Object.entries(result.top_features)
      .map(([name, coefficient]) => ({
        name,
        coefficient: coefficient,
        absolute: Math.abs(coefficient),
      }))
      .sort((a, b) => b.absolute - a.absolute);
  }, [result?.top_features]);

  const performanceMetrics = useMemo(() => {
    if (!result) return [];

    return [
      { name: "R² Score", value: result.r2_score || 0, fill: "#10b981" },
      { name: "MSE", value: result.mse || 0, fill: "#ef4444" },
      { name: "RMSE", value: result.rmse || 0, fill: "#f59e0b" },
      { name: "MAE", value: result.mae || 0, fill: "#3b82f6" },
    ];
  }, [result]);

  const predictionData = useMemo(() => {
    if (!result?.prediction_data) {
      // If prediction_data is not available, create it from predictions and actual arrays
      if (result?.predictions && result?.actual) {
        return result.predictions.map((pred, index) => ({
          index: index + 1,
          prediction: typeof pred === 'number' ? pred : parseFloat(pred),
          actual: typeof result.actual[index] === 'number' ? result.actual[index] : parseFloat(result.actual[index]),
          error: typeof result.actual[index] === 'number' ? result.actual[index] - pred : parseFloat(result.actual[index]) - parseFloat(pred),
        })).slice(0, 50); // First 50 predictions
      }
      return [];
    }
    return result.prediction_data.slice(0, 50); // First 50 predictions
  }, [result?.prediction_data, result?.predictions, result?.actual]);

  const residualData = useMemo(() => {
    if (!predictionData.length) return [];

    return predictionData.map((item) => ({
      index: item.index,
      residual: item.error,
      actual: item.actual,
      prediction: item.prediction,
      absoluteError: Math.abs(item.error),
    }));
  }, [predictionData]);

  const coefficientDistribution = useMemo(() => {
    const coefficients = coefficientData;
    const positive = coefficients.filter((c) => c.sign === "positive").length;
    const negative = coefficients.filter((c) => c.sign === "negative").length;
    const zero = coefficients.filter((c) => Math.abs(c.coefficient) < 0.0001).length;

    return [
      { name: "Positive", value: positive, color: "#10b981" },
      { name: "Negative", value: negative, color: "#ef4444" },
      { name: "Zero", value: zero, color: "#6b7280" },
    ];
  }, [coefficientData]);

  // Fix R² score calculation for chart
  const r2Score = result?.r2_score || 0;
  const mse = result?.mse || 0;
  const rmse = result?.rmse || 0;
  const mae = result?.mae || 0;

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Lasso Regression Results
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
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold">Model Performance</h3>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  R² Score
                </div>
                <div
                  className={`text-2xl font-bold ${
                    r2Score > 0.8
                      ? "text-green-600 dark:text-green-400"
                      : r2Score > 0.6
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {r2Score.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  {r2Score > 0.8
                    ? "Excellent fit"
                    : r2Score > 0.6
                    ? "Good fit"
                    : r2Score > 0.4
                    ? "Moderate fit"
                    : "Poor fit"}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  RMSE
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {rmse.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Root Mean Squared Error
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  MAE
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mae.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Mean Absolute Error
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Features Selected
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {
                    coefficientData.filter((c) => Math.abs(c.coefficient) >= 0.0001).length
                  }{" "}
                  / {coefficientData.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Non-zero coefficients
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                  Samples
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-zinc-300">
                  {result.n_samples || 0}
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
                  {result.n_features || 0}
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

            {/* View Mode Selector */}
            <div className="flex gap-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg">
              <button
                onClick={() => setViewMode("coefficients")}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  viewMode === "coefficients"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Coefficients
                </div>
              </button>
              <button
                onClick={() => setViewMode("predictions")}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  viewMode === "predictions"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <LineChartIcon className="w-4 h-4" />
                  Predictions
                </div>
              </button>
              <button
                onClick={() => setViewMode("residuals")}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  viewMode === "residuals"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" />
                  Residuals
                </div>
              </button>
            </div>

            {/* Coefficients View */}
            {viewMode === "coefficients" && (
              <>
                {/* Top Features */}
                {topFeatures.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Most Important Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topFeatures.map((feature, index) => (
                        <div
                          key={feature.name}
                          className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {feature.name}
                            </div>
                            <div
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                feature.coefficient >= 0
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {feature.coefficient >= 0 ? "+" : ""}
                              {feature.coefficient.toFixed(4)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-zinc-400">
                            {feature.coefficient >= 0
                              ? "Positive influence"
                              : "Negative influence"}
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  feature.coefficient >= 0
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    Math.abs(feature.coefficient) * 100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coefficient Distribution */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Coefficient Distribution
                    </h4>
                    <div className="space-y-3">
                      {coefficientDistribution.map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {item.name} Coefficients
                              </div>
                              <div className="text-xs text-gray-600 dark:text-zinc-400">
                                {item.value} features
                              </div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {coefficientData.length > 0
                              ? ((item.value / coefficientData.length) * 100).toFixed(1)
                              : "0"}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                      <GitBranch className="w-5 h-5" />
                      Model Configuration
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                        <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                          Alpha (Regularization)
                        </div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {result.alpha || 1.0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                          Higher values increase sparsity
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                        <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                          Max Iterations
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {result.max_iter || 1000}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                        <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                          Test Size
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {result.testSize || 0.3}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Coefficients Table */}
                {coefficientData.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                      All Feature Coefficients
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-lg max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                        <thead className="bg-gray-50 dark:bg-zinc-800 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Feature Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Coefficient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Absolute Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Influence
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                          {coefficientData.map((feature, index) => (
                            <tr
                              key={feature.name}
                              className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {feature.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`font-medium ${
                                    feature.coefficient >= 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {feature.coefficient >= 0 ? "+" : ""}
                                  {feature.coefficient.toFixed(6)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {feature.absolute.toFixed(6)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-32 bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        feature.coefficient >= 0
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${Math.min(
                                          feature.absolute * 100,
                                          100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    Math.abs(feature.coefficient) < 0.0001
                                      ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                      : feature.coefficient >= 0
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {Math.abs(feature.coefficient) < 0.0001 ? (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  ) : feature.coefficient >= 0 ? (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {Math.abs(feature.coefficient) < 0.0001
                                    ? "Zero (Selected Out)"
                                    : feature.coefficient >= 0
                                    ? "Positive"
                                    : "Negative"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Predictions View */}
            {viewMode === "predictions" && (
              <>
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
                          stroke="#6b7280"
                          className="dark:stroke-zinc-400"
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          formatter={(value) => [value.toFixed(4), "Value"]}
                        />
                        <Legend />
                        <Bar
                          dataKey="value"
                          name="Value"
                          radius={[4, 4, 0, 0]}
                        >
                          {performanceMetrics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Predictions vs Actual Chart */}
                {predictionData.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Predictions vs Actual Values
                    </h4>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart
                        data={predictionData.slice(0, 30)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          className="dark:stroke-zinc-700"
                        />
                        <XAxis
                          dataKey="index"
                          stroke="#6b7280"
                          className="dark:stroke-zinc-400"
                          label={{
                            value: "Sample Index",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          className="dark:stroke-zinc-400"
                          label={{
                            value: targetColumn,
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          formatter={(value) => [typeof value === 'number' ? value.toFixed(4) : value, "Value"]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          stroke="#3b82f6"
                          name="Actual Values"
                        />
                        <Line
                          type="monotone"
                          dataKey="prediction"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Predictions"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Predictions Table */}
                {predictionData.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                      Prediction Details (First 20 Samples)
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-lg max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                        <thead className="bg-gray-50 dark:bg-zinc-800 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Index
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Actual Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Prediction
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Error
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Absolute Error
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                              Accuracy
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                          {predictionData.slice(0, 20).map((item) => (
                            <tr
                              key={item.index}
                              className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {item.index}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                                {item.actual.toFixed(4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                                {item.prediction.toFixed(4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm ${
                                    Math.abs(item.error) < (rmse || 1)
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {item.error.toFixed(4)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {Math.abs(item.error).toFixed(4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        Math.abs(item.error) < (rmse || 1)
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${Math.max(
                                          0,
                                          Math.min(
                                            100,
                                            100 -
                                              (Math.abs(item.error) /
                                                ((rmse || 1) * 2)) *
                                                100
                                          )
                                        )}%`,
                                      }}
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
              </>
            )}

            {/* Residuals View */}
            {viewMode === "residuals" && residualData.length > 0 && (
              <>
                {/* Residuals Plot */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Residual Analysis
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
                        dataKey="prediction"
                        name="Prediction"
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                        label={{
                          value: "Predicted Value",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="residual"
                        name="Residual"
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                        label={{
                          value: "Residual (Actual - Predicted)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value) => [typeof value === 'number' ? value.toFixed(4) : value, "Value"]}
                      />
                      <Legend />
                      <Scatter
                        name="Residuals"
                        data={residualData.slice(0, 100)}
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Line
                        type="linear"
                        dataKey={() => 0}
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Zero Line"
                        dot={false}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* Residual Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                    <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                      Mean Residual
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {(
                        residualData.reduce((sum, item) => sum + item.residual, 0) /
                        residualData.length
                      ).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      Should be close to zero
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                    <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                      Std Dev of Residuals
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.sqrt(
                        Math.max(0, residualData.reduce(
                          (sum, item) => sum + Math.pow(item.residual, 2),
                          0
                        ) / residualData.length)
                      ).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      Residual spread
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                    <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                      Max Positive Error
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.max(...residualData.map((r) => r.residual)).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      Largest overprediction
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                    <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                      Max Negative Error
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {Math.min(...residualData.map((r) => r.residual)).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      Largest underprediction
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Model Interpretation */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                Model Interpretation
              </h4>
              <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                <p>
                  <strong>R² Score {r2Score.toFixed(4)}:</strong>{" "}
                  {r2Score > 0.8
                    ? "Excellent model fit - explains most variance"
                    : r2Score > 0.6
                    ? "Good model fit - explains significant variance"
                    : r2Score > 0.4
                    ? "Moderate model fit - explains some variance"
                    : "Poor model fit - consider feature engineering or different model"}
                </p>
                <p>
                  <strong>Feature Selection:</strong>{" "}
                  {coefficientData.filter((c) => Math.abs(c.coefficient) < 0.0001).length}{" "}
                  features were effectively set to zero by Lasso regularization. This
                  simplifies the model and reduces overfitting.
                </p>
                <p>
                  <strong>Alpha ({result.alpha || 1.0}):</strong>{" "}
                  {(result.alpha || 1.0) > 1
                    ? "Strong regularization - many features eliminated"
                    : (result.alpha || 1.0) > 0.1
                    ? "Moderate regularization - balanced feature selection"
                    : "Weak regularization - most features retained"}
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
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No Results Yet</h4>
            <p>
              Upload your data and train the Lasso Regression model to see
              performance metrics and feature coefficients
            </p>
          </div>
        )}
      </div>
    </div>
  );
}