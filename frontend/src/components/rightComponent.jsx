import { AlertCircle, TrendingUp, BarChart3 } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export default function RightComponent({ result, error }) {
  // Custom tooltip for scatter plot
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">
            Actual: {payload[0].payload.actual}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            Predicted: {payload[0].payload.predicted}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for feature importance
  const FeatureTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">
            {label}
          </p>
          <p className="text-purple-600 dark:text-purple-400">
            Coefficient: {payload[0].value.toFixed(4)}
          </p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {payload[0].value > 0 ? "Positive impact" : "Negative impact"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Generate confusion matrix-like scatter plot data
  const getConfusionData = () => {
    if (!result?.predictions || !result?.actual) return [];
    
    return result.actual.map((actual, i) => ({
      actual,
      predicted: result.predictions[i],
      correct: actual === result.predictions[i] ? "Correct" : "Incorrect"
    }));
  };

  // Prepare feature importance data
  const getFeatureData = () => {
    if (!result?.top_features) return [];
    
    return Object.entries(result.top_features).map(([name, importance]) => ({
      name: name.length > 20 ? name.substring(0, 20) + "..." : name,
      importance: Math.abs(importance),
      sign: importance > 0 ? "positive" : "negative"
    }));
  };

  // Calculate class distribution
  const getClassDistribution = () => {
    if (!result?.actual) return [];
    
    const distribution = result.actual.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(distribution).map(([name, value]) => ({
      name: `Class ${name}`,
      value
    }));
  };

  const confusionData = getConfusionData();
  const featureData = getFeatureData();
  const classDistribution = getClassDistribution();

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col gap-6">
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
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
            Classification Performance
          </h3>

          {/* Classification Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(result.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Overall accuracy</div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Precision</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(result.precision * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Weighted precision</div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Recall</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(result.recall * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Weighted recall</div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">F1 Score</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {(result.f1_score * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Weighted F1</div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Samples</div>
              <div className="text-2xl font-bold text-gray-700 dark:text-zinc-300">{result.n_samples}</div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Total data points</div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Features</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result.n_features}</div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Numeric features</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictions vs Actual Scatter Plot */}
            {result.predictions && result.actual && (
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Predictions vs Actual
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb" 
                      className="dark:stroke-zinc-700" 
                    />
                    <XAxis 
                      type="category"
                      dataKey="actual"
                      name="Actual"
                      label={{ 
                        value: 'Actual Class', 
                        position: 'insideBottom', 
                        fill: '#374151',
                        className: "dark:fill-zinc-400"
                      }} 
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <YAxis 
                      type="category"
                      dataKey="predicted"
                      name="Predicted"
                      label={{ 
                        value: 'Predicted Class', 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: '#374151',
                        className: "dark:fill-zinc-400"
                      }} 
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={<CustomTooltip />}
                    />
                    <Legend />
                    <Scatter
                      name="Predictions"
                      data={confusionData}
                      fill="#4f46e5"
                      className="dark:fill-blue-500"
                    >
                      {confusionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={entry.correct === "Correct" ? "#10b981" : "#ef4444"}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                    <span>Correct Predictions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
                    <span>Incorrect Predictions</span>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Importance */}
            {result.top_features && (
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                  Top Feature Importance
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="dark:stroke-zinc-700" />
                    <XAxis type="number" stroke="#6b7280" className="dark:stroke-zinc-400" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                      width={80}
                    />
                    <Tooltip content={<FeatureTooltip />} />
                    <Bar dataKey="importance" name="Coefficient Magnitude">
                      {featureData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={entry.sign === "positive" ? "#10b981" : "#ef4444"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                    <span>Positive Impact</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
                    <span>Negative Impact</span>
                  </div>
                </div>
              </div>
            )}

            {/* Class Distribution */}
            {classDistribution.length > 0 && (
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                  Class Distribution
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {classDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={[
                            '#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'
                          ][index % 5]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Model Interpretation */}
          <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
              Model Interpretation
            </h4>
            <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
              <p>
                <strong>Accuracy {result.accuracy}:</strong>{" "}
                {result.accuracy > 0.9 
                  ? "Excellent classification performance"
                  : result.accuracy > 0.8 
                  ? "Good classification performance"
                  : result.accuracy > 0.7
                  ? "Acceptable classification performance"
                  : "Poor classification performance - consider feature engineering or different algorithm"
                }
              </p>
              <p>
                The scatter plot shows correct (green) and incorrect (red) predictions. 
                Feature importance indicates which features most influence the classification.
              </p>
              {result.top_features && (
                <p>
                  <strong>Top influential feature:</strong>{" "}
                  {Object.keys(result.top_features)[0]} -{" "}
                  {Object.values(result.top_features)[0] > 0 
                    ? "positively correlates with target class" 
                    : "negatively correlates with target class"}
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
          <p>Upload your data and train the model to see classification metrics</p>
        </div>
      )}
    </div>
  );
}