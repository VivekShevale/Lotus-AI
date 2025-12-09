import { AlertCircle, TrendingUp, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Line,
  ReferenceLine,
  Cell,
} from "recharts";

export default function LinearResult({ result, error }) {
  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">
            {label}
          </p>
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
            Data Point
          </p>
          <p className="text-green-600 dark:text-green-400">
            Actual: {payload[0].payload.actual}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            Predicted: {payload[0].payload.predicted}
          </p>
          <p className="text-red-600 dark:text-red-400">
            Error: {(payload[0].payload.actual - payload[0].payload.predicted).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get top features data for bar chart
  const getTopFeaturesData = () => {
    if (!result?.top_features) return [];
    
    return Object.entries(result.top_features)
      .map(([name, importance]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        importance: Math.abs(importance),
        coefficient: importance,
        sign: importance > 0 ? 'positive' : 'negative'
      }))
      .sort((a, b) => b.importance - a.importance);
  };

  // Get performance metrics for bar chart
  const getPerformanceMetrics = () => {
    if (!result) return [];
    
    return [
      { name: 'R² Score', value: result.r2, fill: '#10b981' },
      { name: 'MAE', value: result.mae, fill: '#3b82f6' },
      { name: 'RMSE', value: result.rmse, fill: '#8b5cf6' },
    ];
  };

  // Get scatter plot data for predictions vs actual
  const getScatterData = () => {
    if (!result?.predictions || !result?.actual) return [];
    
    return result.actual.map((val, i) => ({ 
      actual: val, 
      predicted: result.predictions[i],
      error: Math.abs(val - result.predictions[i])
    }));
  };

  // Get error distribution data
  const getErrorDistributionData = () => {
    if (!result?.predictions || !result?.actual) return [];
    
    const errors = result.actual.map((val, i) => 
      Math.abs(val - result.predictions[i])
    );
    
    // Create bins for error distribution
    const maxError = Math.max(...errors);
    const binSize = maxError / 5;
    const bins = Array.from({ length: 5 }, (_, i) => ({
      range: `${(i * binSize).toFixed(1)}-${((i + 1) * binSize).toFixed(1)}`,
      count: 0
    }));
    
    errors.forEach(error => {
      const binIndex = Math.min(Math.floor(error / binSize), 4);
      bins[binIndex].count++;
    });
    
    return bins;
  };

  // Calculate regression line for scatter plot
  const getRegressionLine = () => {
    if (!result?.predictions || !result?.actual) return [];
    
    const data = getScatterData();
    const minActual = Math.min(...result.actual);
    const maxActual = Math.max(...result.actual);
    
    // Simple linear fit for the regression line
    return [
      { actual: minActual, predicted: minActual },
      { actual: maxActual, predicted: maxActual }
    ];
  };

  const topFeaturesData = getTopFeaturesData();
  const performanceMetrics = getPerformanceMetrics();
  const scatterData = getScatterData();
  const errorDistributionData = getErrorDistributionData();
  const regressionLine = getRegressionLine();

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Regression Results
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
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">R² Score</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.r2}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Variance explained</div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">MAE</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.mae}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Mean Absolute Error</div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">RMSE</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {result.rmse}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Root Mean Square Error</div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Features</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {result.n_features}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Numeric features</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Samples</div>
                <div className="text-2xl font-bold text-gray-700 dark:text-zinc-300">{result.n_samples}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Total data points</div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Test Size</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result.testSize}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Holdout set</div>
              </div>
            </div>

            {/* Performance Metrics Chart */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Metrics
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                  <XAxis 
                    dataKey="name" 
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

            {/* Predictions vs Actual Scatter Plot */}
            {scatterData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5" />
                  Predictions vs Actual
                </h4>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                    <XAxis 
                      type="number" 
                      dataKey="actual" 
                      name="Actual" 
                      label={{ 
                        value: 'Actual Values', 
                        position: 'insideBottom', 
                        fill: '#374151',
                        className: "dark:fill-zinc-400"
                      }} 
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <YAxis 
                      type="number" 
                      dataKey="predicted" 
                      name="Predicted" 
                      label={{ 
                        value: 'Predicted Values', 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: '#374151',
                        className: "dark:fill-zinc-400"
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
                    
                    {/* Regression line */}
                    <Line
                      type="linear"
                      dataKey="predicted"
                      data={regressionLine}
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Regression Line"
                      className="dark:stroke-red-400"
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
                    <div className="w-3 h-1 bg-[#ef4444] dark:bg-red-400"></div>
                    <span>Regression Line</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-[#10b981] border border-dashed dark:bg-green-400"></div>
                    <span>Perfect Prediction (y=x)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Distribution */}
            {errorDistributionData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                  Error Distribution
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
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

            {/* Top Features */}
            {topFeaturesData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                  Top Feature Importance
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topFeaturesData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
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
                        `${value.toFixed(4)} (Coefficient: ${props.payload.coefficient.toFixed(4)})`,
                        'Absolute Importance'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="importance" 
                      name="Feature Importance" 
                      radius={[0, 4, 4, 0]}
                    >
                      {topFeaturesData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.sign === 'positive' ? '#10b981' : '#ef4444'} 
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

            {/* Model Interpretation */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                Model Interpretation
              </h4>
              <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                <p>
                  <strong>R² Score {result.r2}:</strong>{" "}
                  {result.r2 > 0.8 
                    ? "Excellent fit - the model explains most of the variance in the data"
                    : result.r2 > 0.6 
                    ? "Good fit - the model explains a significant portion of the variance"
                    : result.r2 > 0.4
                    ? "Moderate fit - the model explains some variance"
                    : "Poor fit - the model explains little variance"
                  }
                </p>
                <p>
                  <strong>Feature Coefficients:</strong> Positive coefficients indicate that as the feature increases, 
                  the target variable tends to increase. Negative coefficients indicate an inverse relationship.
                </p>
                <p>
                  <strong>Error Metrics:</strong> MAE represents average prediction error, while RMSE gives more weight 
                  to larger errors.
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
            <p>Upload your data and train the regression model to see performance metrics</p>
          </div>
        )}
      </div>
    </div>
  );
}