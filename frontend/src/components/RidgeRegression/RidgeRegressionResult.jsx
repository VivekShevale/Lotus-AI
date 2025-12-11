import {
  AlertCircle,
  TrendingUp,
  BarChart3,
  Target,
  LineChart,
  Scale,
  PieChart,
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
  LineChart as RechartsLineChart,
  Line,
  ScatterChart,
  Scatter,
  ComposedChart,
  Cell,
} from "recharts";

export default function RidgeRegressionResult({ result, error, targetColumn }) {
  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-orange-600 dark:text-orange-400"
              style={{ color: entry.color }}
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

  // Get coefficient data for bar chart
  const getCoefficientData = () => {
    if (!result?.top_features) return [];

    return Object.entries(result.top_features)
      .map(([name, coefficient]) => ({
        name,
        coefficient: coefficient,
        absCoefficient: Math.abs(coefficient),
        isPositive: coefficient > 0,
        percentage: Math.abs(coefficient) * 100,
      }))
      .sort((a, b) => b.absCoefficient - a.absCoefficient)
      .slice(0, 10); // Top 10 coefficients
  };

  // Get predictions vs actual data for scatter plot
  const getPredictionData = () => {
    if (!result?.predictions || !result?.actual) return [];

    return result.predictions.map((pred, index) => ({
      actual: result.actual[index],
      predicted: pred,
      index: index + 1,
      error: Math.abs(result.actual[index] - pred),
      errorPercent: Math.abs(
        ((result.actual[index] - pred) / result.actual[index]) * 100
      ),
    }));
  };

  // Get residual plot data
  const getResidualData = () => {
    const predictionData = getPredictionData();
    if (predictionData.length === 0) return [];

    return predictionData.map((item) => ({
      index: item.index,
      residual: item.actual - item.predicted,
      predicted: item.predicted,
      actual: item.actual,
      isPositiveResidual: item.actual - item.predicted > 0,
    }));
  };

  // Get error distribution data
  const getErrorDistributionData = () => {
    const predictionData = getPredictionData();
    if (predictionData.length === 0) return [];

    const bins = [0, 0.1, 0.2, 0.3, 0.5, 1, 2, 5, 10, 20];
    const distribution = bins.map((bin) => ({
      range: `≤${bin}%`,
      count: 0,
      color: bin <= 1 ? "#10b981" : bin <= 5 ? "#f59e0b" : "#ef4444",
    }));

    predictionData.forEach((item) => {
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

  // Get model statistics
  const getModelStats = () => {
    if (!result) return [];

    return [
      {
        name: "Alpha",
        value: result.alpha,
        description: "Regularization strength",
      },
      {
        name: "Features",
        value: result.n_features,
        description: "Input features",
      },
      {
        name: "Samples",
        value: result.n_samples,
        description: "Total data points",
      },
      {
        name: "Test Size",
        value: `${(result.testSize * 100).toFixed(0)}%`,
        description: "Testing proportion",
      },
    ];
  };

  const performanceMetrics = getPerformanceMetrics();
  const coefficientData = getCoefficientData();
  const predictionData = getPredictionData();
  const residualData = getResidualData();
  const errorDistributionData = getErrorDistributionData();
  const modelStats = getModelStats();

  // Colors for charts
  const COLORS = {
    positive: "#10b981", // Green for positive coefficients
    negative: "#ef4444", // Red for negative coefficients
    neutral: "#6b7280", // Gray for neutral
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Ridge Regression Results
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
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-xl font-semibold">
                Ridge Regression Performance
              </h3>
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
                  Alpha (α)
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.alpha}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Regularization strength
                </div>
              </div>
            </div>

            {/* Model Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modelStats.map((stat, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50"
                >
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    {stat.name}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    {stat.description}
                  </div>
                </div>
              ))}
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
                    <YAxis stroke="#6b7280" className="dark:stroke-zinc-400" />
                    <Tooltip
                      content={<CustomTooltip />}
                      formatter={(value) => [
                        typeof value === "number" ? value.toFixed(4) : value,
                        "Value",
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
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Coefficient Analysis */}
            {coefficientData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Feature Coefficients (Top 10)
                </h4>
                <div className="space-y-4">
                  {/* Coefficient Bar Chart */}
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={coefficientData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
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
                        label={{
                          value: "Coefficient Value",
                          position: "insideBottom",
                          offset: -10,
                        }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                        width={90}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        formatter={(value, name) => [
                          value.toFixed(4),
                          name === "coefficient" ? "Coefficient" : name,
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="coefficient"
                        name="Coefficient Value"
                        radius={[0, 4, 4, 0]}
                      >
                        {coefficientData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.isPositive
                                ? COLORS.positive
                                : COLORS.negative
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Coefficient Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-green-50 dark:bg-green-900/20">
                      <div className="text-xs font-medium text-gray-700 dark:text-green-300 mb-1">
                        Positive Impact (
                        {coefficientData.filter((c) => c.isPositive).length})
                      </div>
                      <div className="text-sm text-gray-900 dark:text-green-200">
                        Features that increase the target value
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-red-50 dark:bg-red-900/20">
                      <div className="text-xs font-medium text-gray-700 dark:text-red-300 mb-1">
                        Negative Impact (
                        {coefficientData.filter((c) => !c.isPositive).length})
                      </div>
                      <div className="text-sm text-gray-900 dark:text-red-200">
                        Features that decrease the target value
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-xs font-medium text-gray-700 dark:text-blue-300 mb-1">
                        Regularization Effect
                      </div>
                      <div className="text-sm text-gray-900 dark:text-blue-200">
                        Coefficients shrunk by α={result.alpha}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Predictions vs Actual */}
            {predictionData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Predictions vs Actual Values
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Scatter Plot */}
                  <div>
                    <ResponsiveContainer width="100%" height={350}>
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
                            value: "Actual Values",
                            position: "insideBottom",
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
                            value: "Predicted Values",
                            angle: -90,
                            position: "insideLeft",
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
                          data={predictionData}
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                          name="Perfect Prediction"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Error Distribution */}
                  <div>
                    <h5 className="text-md font-medium mb-3 text-gray-700 dark:text-zinc-300">
                      Error Distribution
                    </h5>
                    <ResponsiveContainer width="100%" height={350}>
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
                          formatter={(value) => [
                            `${value} predictions`,
                            "Count",
                          ]}
                        />
                        <Bar
                          dataKey="count"
                          name="Number of Predictions"
                          radius={[4, 4, 0, 0]}
                        >
                          {errorDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Residual Analysis */}
            {residualData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Residual Analysis
                </h4>
                <ResponsiveContainer width="100%" height={300}>
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
                      dataKey="predicted"
                      name="Predicted"
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                      label={{
                        value: "Predicted Values",
                        position: "insideBottom",
                        offset: -10,
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Scatter
                      name="Residuals"
                      data={residualData}
                      fill="#8884d8"
                      shape="circle"
                      opacity={0.6}
                    />
                    <Line
                      type="linear"
                      yAxisId={0}
                      data={[
                        {
                          predicted: Math.min(
                            ...residualData.map((d) => d.predicted)
                          ),
                          residual: 0,
                        },
                        {
                          predicted: Math.max(
                            ...residualData.map((d) => d.predicted)
                          ),
                          residual: 0,
                        },
                      ]}
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Zero Residual Line"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-gray-600 dark:text-zinc-400">
                  <p>
                    <strong>Residual Pattern Check:</strong>{" "}
                    {residualData.filter(
                      (d) => Math.abs(d.residual) > 2 * result.rmse
                    ).length === 0
                      ? "No significant outliers detected"
                      : "Some large residuals detected - consider checking for outliers"}
                  </p>
                  <p>
                    <strong>Homoscedasticity:</strong>{" "}
                    {Math.abs(
                      residualData.reduce((acc, d) => acc + d.residual, 0) /
                        residualData.length
                    ) < 0.1
                      ? "Residuals appear evenly distributed"
                      : "Possible heteroscedasticity - consider transforming variables"}
                  </p>
                </div>
              </div>
            )}

            {/* Model Interpretation */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-orange-50 dark:bg-orange-900/20">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                Model Interpretation & Recommendations
              </h4>
              <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                <p>
                  <strong>R² Score {result.r2.toFixed(4)}:</strong>{" "}
                  {result.r2 > 0.9
                    ? "Excellent model fit - explains most of the variance"
                    : result.r2 > 0.7
                    ? "Good model fit - regularization working effectively"
                    : result.r2 > 0.5
                    ? "Moderate model fit - consider feature engineering"
                    : "Poor model fit - may need different approach or more data"}
                </p>
                <p>
                  <strong>Alpha Value (α={result.alpha}):</strong>{" "}
                  {result.alpha < 1
                    ? "Low regularization - model may be more complex"
                    : result.alpha === 1
                    ? "Default regularization - balanced complexity"
                    : "High regularization - simpler, more generalized model"}
                </p>
                <p>
                  <strong>Feature Coefficients:</strong> Show the relationship
                  strength and direction between each feature and the target.
                  Larger absolute values = stronger relationship.
                </p>
                <p>
                  <strong>Recommendations:</strong>
                  {result.r2 < 0.6 &&
                    " Consider increasing alpha for stronger regularization or feature selection."}
                  {coefficientData.length > result.n_features * 0.3 &&
                    " Many small coefficients - consider increasing alpha."}
                  {Math.abs(result.rmse) > 2 * result.mae &&
                    " High RMSE suggests outliers - check data quality."}
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
              Upload your data and train the ridge regression model to see
              performance metrics and coefficient analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
