import {
    AlertCircle,
    BarChart3,
    PieChart,
    TrendingUp,
    Layers,
    Target,
    ArrowRightLeft,
    Percent,
    LineChart as LineChartIcon,
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
    ZAxis,
  } from "recharts";
  
  export default function PrincipalComponentAnalysisResult({ result, error, targetColumn }) {
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
  
    // Get variance explained data for bar chart
    const getVarianceData = () => {
      if (!result?.explained_variance_ratio) return [];
      
      return result.explained_variance_ratio.map((variance, index) => ({
        name: `PC${index + 1}`,
        variance: variance * 100,
        cumulative: result.cumulative_variance?.[index] * 100 || 0,
      }));
    };
  
    // Get cumulative variance data for line chart
    const getCumulativeVarianceData = () => {
      if (!result?.cumulative_variance) return [];
      
      return result.cumulative_variance.map((cumulative, index) => ({
        component: `PC${index + 1}`,
        cumulative: cumulative * 100,
      }));
    };
  
    // Get top features for each component
    const getTopFeaturesData = () => {
      if (!result?.top_features_per_component) return [];
      
      return Object.entries(result.top_features_per_component).map(([pc, features]) => ({
        pc,
        features: Object.entries(features).map(([name, value]) => ({ name, value })),
      }));
    };
  
    // Get transformed data for scatter plot
    const getScatterData = () => {
      if (!result?.transformed_data || result.transformed_data.length === 0) return [];
      
      return result.transformed_data.map((item, index) => ({
        index: index + 1,
        pc1: item.components?.[0] || 0,
        pc2: item.components?.[1] || 0,
        pc3: item.components?.[2] || 0,
        target: item.target,
      }));
    };
  
    // Get loadings data for heatmap visualization
    const getLoadingsData = () => {
      if (!result?.feature_loadings) return [];
      
      const loadings = [];
      Object.entries(result.feature_loadings).forEach(([pc, features]) => {
        Object.entries(features).forEach(([feature, value]) => {
          loadings.push({
            pc,
            feature,
            value: Math.abs(value),
            originalValue: value,
          });
        });
      });
      return loadings;
    };
  
    const varianceData = getVarianceData();
    const cumulativeData = getCumulativeVarianceData();
    const topFeatures = getTopFeaturesData();
    const scatterData = getScatterData();
    const loadingsData = getLoadingsData();
  
    // Colors for charts
    const COLORS = [
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#f59e0b",
      "#ef4444",
      "#ec4899",
      "#14b8a6",
      "#84cc16",
    ];
  
    return (
      <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          PCA Analysis Results
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
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold">PCA Results Summary</h3>
              </div>
  
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    Original Features
                  </div>
                  <div className="text-2xl font-bold text-gray-700 dark:text-zinc-300">
                    {result.original_features}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    Input dimensions
                  </div>
                </div>
  
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    Components
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {result.n_components}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    Reduced dimensions
                  </div>
                </div>
  
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    Samples
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {result.n_samples}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    Data points
                  </div>
                </div>
  
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                    Variance Explained
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {result.cumulative_variance?.[result.cumulative_variance.length - 1] 
                      ? `${(result.cumulative_variance[result.cumulative_variance.length - 1] * 100).toFixed(1)}%`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    Total retained
                  </div>
                </div>
              </div>
  
              {/* Variance Explained Chart */}
              {varianceData.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Variance Explained by Principal Components
                  </h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={varianceData}
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
                        label={{
                          value: 'Variance Explained (%)',
                          angle: -90,
                          position: 'insideLeft',
                          offset: -10,
                          style: { fill: '#6b7280' }
                        }}
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        formatter={(value) => [
                          `${value.toFixed(2)}%`,
                          "Variance",
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="variance"
                        name="Individual Variance"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        name="Cumulative Variance"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
  
              {/* Cumulative Variance Line Chart */}
              {cumulativeData.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5" />
                    Cumulative Variance Explained
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={cumulativeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        className="dark:stroke-zinc-700"
                      />
                      <XAxis
                        dataKey="component"
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                      />
                      <YAxis
                        domain={[0, 100]}
                        label={{
                          value: 'Cumulative Variance (%)',
                          angle: -90,
                          position: 'insideLeft',
                          style: { fill: '#6b7280' }
                        }}
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        formatter={(value) => [
                          `${value.toFixed(2)}%`,
                          "Cumulative Variance",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        name="Cumulative Variance"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
  
              {/* Scatter Plot of PC1 vs PC2 */}
              {scatterData.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Principal Components Scatter Plot (PC1 vs PC2)
                  </h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid
                        stroke="#e5e7eb"
                        className="dark:stroke-zinc-700"
                      />
                      <XAxis
                        type="number"
                        dataKey="pc1"
                        name="PC1"
                        label={{
                          value: 'Principal Component 1',
                          position: 'insideBottom',
                          offset: -10,
                          style: { fill: '#6b7280' }
                        }}
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                      />
                      <YAxis
                        type="number"
                        dataKey="pc2"
                        name="PC2"
                        label={{
                          value: 'Principal Component 2',
                          angle: -90,
                          position: 'insideLeft',
                          offset: 10,
                          style: { fill: '#6b7280' }
                        }}
                        stroke="#6b7280"
                        className="dark:stroke-zinc-400"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  Sample {data.index}
                                </p>
                                <p className="text-blue-600 dark:text-blue-400">
                                  PC1: {data.pc1.toFixed(4)}
                                </p>
                                <p className="text-green-600 dark:text-green-400">
                                  PC2: {data.pc2.toFixed(4)}
                                </p>
                                {data.target && (
                                  <p className="text-purple-600 dark:text-purple-400">
                                    Target: {data.target}
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      {targetColumn ? (
                        // Colored by target if available
                        scatterData
                          .filter(d => d.target)
                          .map((group, index) => {
                            const uniqueTargets = [...new Set(scatterData.map(d => d.target).filter(Boolean))];
                            return (
                              <Scatter
                                key={group.target}
                                name={group.target}
                                data={scatterData.filter(d => d.target === group.target)}
                                fill={COLORS[index % COLORS.length]}
                                shape="circle"
                              />
                            );
                          })
                      ) : (
                        <Scatter
                          name="Data Points"
                          data={scatterData}
                          fill="#3b82f6"
                          shape="circle"
                        />
                      )}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
  
              {/* Top Features per Component */}
              {topFeatures.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    Top Contributing Features per Component
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topFeatures.map((component, index) => (
                      <div
                        key={component.pc}
                        className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          >
                            {component.pc}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {component.pc}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-zinc-400">
                              Top {component.features.length} features
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {component.features.map((feature, idx) => (
                            <div
                              key={`${component.pc}-${feature.name}`}
                              className="flex justify-between items-center p-2 bg-white dark:bg-zinc-800 rounded border border-gray-100 dark:border-zinc-700"
                            >
                              <span className="text-sm text-gray-700 dark:text-zinc-300 truncate">
                                {feature.name}
                              </span>
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {Math.abs(feature.value).toFixed(4)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {/* Component Loadings Table */}
              {result.components && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-zinc-200">
                    Component Loadings (First 3 Components)
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                      <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Feature Name
                          </th>
                          {Object.keys(result.components)
                            .slice(0, 3)
                            .map((pc) => (
                              <th
                                key={pc}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider"
                              >
                                {pc} Loading
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                        {result.feature_names?.slice(0, 10).map((feature, idx) => (
                          <tr key={feature} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {feature}
                            </td>
                            {Object.keys(result.components)
                              .slice(0, 3)
                              .map((pc) => (
                                <td
                                  key={`${feature}-${pc}`}
                                  className="px-6 py-4 whitespace-nowrap text-sm"
                                >
                                  <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mr-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          result.components[pc]?.[idx] >= 0
                                            ? "bg-green-600"
                                            : "bg-red-600"
                                        }`}
                                        style={{
                                          width: `${Math.abs(result.components[pc]?.[idx] || 0) * 50}%`,
                                          marginLeft: result.components[pc]?.[idx] >= 0 ? "0" : "50%",
                                        }}
                                      ></div>
                                    </div>
                                    <span
                                      className={`font-medium ${
                                        result.components[pc]?.[idx] >= 0
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {(result.components[pc]?.[idx] || 0).toFixed(4)}
                                    </span>
                                  </div>
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
  
              {/* Model Information */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration Summary */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-zinc-200">
                    Configuration Summary
                  </h4>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span className="font-medium">Data Scaling:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {result.scale_data ? "Standardized" : "Raw Data"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Target Column:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {result.target_column || "None (Unsupervised)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dimensionality Reduction:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {result.original_features} → {result.n_components}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Variance Retained:</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {result.cumulative_variance?.[result.cumulative_variance.length - 1]
                          ? `${(result.cumulative_variance[result.cumulative_variance.length - 1] * 100).toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
  
                {/* Interpretation Guide */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-green-50 dark:bg-green-900/20">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-zinc-200">
                    Interpretation Guide
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-2">
                    <p>
                      <strong>Variance Explained:</strong> Percentage of original
                      dataset variance captured by each principal component
                    </p>
                    <p>
                      <strong>Component Loadings:</strong> Correlation between
                      original features and principal components. Higher absolute
                      values indicate stronger influence
                    </p>
                    <p>
                      <strong>Scatter Plot:</strong> Projection of data onto first
                      two principal components. Clusters may indicate natural
                      groupings
                    </p>
                    <p>
                      <strong>Model ID:</strong> {result.model_id}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
  
          {/* Empty State */}
          {!result && !error && (
            <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
              <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No PCA Results Yet</h4>
              <p>
                Upload your data and run PCA analysis to see dimensionality reduction results
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }