import { AlertCircle, Brain, TrendingUp, Activity, Layers } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function NeuralNetworkResult({ result, error }) {
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
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Training history chart data
  const getTrainingHistory = () => {
    if (!result?.training_history) return [];
    
    return result.training_history.map((epoch, idx) => ({
      epoch: idx + 1,
      loss: epoch.loss,
      val_loss: epoch.val_loss,
      accuracy: epoch.accuracy,
      val_accuracy: epoch.val_accuracy
    }));
  };

  // Performance metrics data
  const getPerformanceMetrics = () => {
    if (!result) return [];
    
    return [
      { name: 'Final Loss', value: result.final_loss, fill: '#ef4444' },
      { name: 'Validation Loss', value: result.val_loss, fill: '#f97316' },
      { name: 'Accuracy', value: result.accuracy, fill: '#10b981' },
      { name: 'R² Score', value: result.r2_score, fill: '#3b82f6' },
    ].filter(metric => metric.value !== undefined);
  };

  // Layer information
  const getLayerInfo = () => {
    if (!result?.model_summary) return [];
    return result.model_summary;
  };

  // Prediction vs actual data
  const getPredictionData = () => {
    if (!result?.predictions || !result?.actual) return [];
    
    return result.actual.map((val, i) => ({
      actual: val,
      predicted: result.predictions[i],
      error: Math.abs(val - result.predictions[i])
    }));
  };

  const trainingHistory = getTrainingHistory();
  const performanceMetrics = getPerformanceMetrics();
  const layerInfo = getLayerInfo();
  const predictionData = getPredictionData();

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Final Loss</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.final_loss?.toFixed(4) || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Training loss</div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.accuracy ? `${(result.accuracy * 100).toFixed(2)}%` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Model accuracy</div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">R² Score</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.r2_score?.toFixed(4) || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Variance explained</div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Epochs</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {result.epochs_completed || result.epochs || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Training iterations</div>
              </div>
            </div>

            {/* Training History Chart */}
            {trainingHistory.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Training History
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trainingHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                    <XAxis 
                      dataKey="epoch" 
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <YAxis 
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="loss" 
                      name="Training Loss" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3}
                      className="dark:stroke-red-400 dark:fill-red-400"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="val_loss" 
                      name="Validation Loss" 
                      stroke="#f97316" 
                      fill="#f97316" 
                      fillOpacity={0.3}
                      className="dark:stroke-orange-400 dark:fill-orange-400"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Accuracy History Chart */}
            {trainingHistory.length > 0 && trainingHistory[0].accuracy && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                  Accuracy History
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trainingHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                    <XAxis 
                      dataKey="epoch" 
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <YAxis 
                      stroke="#6b7280"
                      className="dark:stroke-zinc-400"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      name="Training Accuracy" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                      className="dark:stroke-green-400"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="val_accuracy" 
                      name="Validation Accuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      className="dark:stroke-blue-400"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
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

            {/* Model Architecture */}
            {layerInfo.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Model Architecture
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600 dark:text-zinc-400">
                    <thead className="text-xs uppercase bg-gray-100 dark:bg-zinc-800">
                      <tr>
                        <th className="px-4 py-3">Layer Type</th>
                        <th className="px-4 py-3">Output Shape</th>
                        <th className="px-4 py-3">Parameters</th>
                        <th className="px-4 py-3">Activation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layerInfo.map((layer, idx) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-zinc-700">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{layer.type}</td>
                          <td className="px-4 py-3">{layer.output_shape}</td>
                          <td className="px-4 py-3">{layer.parameters?.toLocaleString() || '0'}</td>
                          <td className="px-4 py-3">{layer.activation || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Training Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Total Parameters</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.total_params?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Trainable weights</div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Training Time</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.training_time ? `${result.training_time.toFixed(2)}s` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Seconds</div>
              </div>
            </div>

            {/* Model Interpretation */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-zinc-200">
                Model Interpretation
              </h4>
              <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                <p>
                  <strong>Training History:</strong> Watch for convergence - loss should decrease and stabilize over epochs.
                  Large gaps between training and validation loss may indicate overfitting.
                </p>
                <p>
                  <strong>Final Loss:</strong> Lower values indicate better model fit. 
                  Values under 0.1 are typically excellent for most regression tasks.
                </p>
                <p>
                  <strong>Accuracy/R²:</strong> Higher values indicate better prediction performance. 
                  R² above 0.8 is considered excellent for regression.
                </p>
                {result.early_stopping && (
                  <p className="text-green-600 dark:text-green-400">
                    <strong>✓ Early Stopping Applied:</strong> Training stopped early to prevent overfitting
                  </p>
                )}
                {result.model_id && (
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">
                    Model ID: {result.model_id} | Saved as TensorFlow model
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
            <p>Configure your neural network and train the model to see performance metrics</p>
          </div>
        )}
      </div>
    </div>
  );
}