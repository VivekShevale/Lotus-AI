import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ConnectionLineType,
  ReactFlowProvider,
  MarkerType,
  useReactFlow,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  BotIcon,
  SearchIcon,
  FilterIcon,
  PlayIcon,
  SproutIcon,
  FlowerIcon,
  LeafIcon,
  TreesIcon,
  Sun,
  ZapIcon,
  WorkflowIcon,
  DatabaseIcon,
  BarChartIcon,
  CpuIcon,
  SettingsIcon,
  PlusIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  SaveIcon,
  LinkIcon,
  XIcon,
  ChevronRightIcon,
  ColumnsIcon,
  GitBranchIcon,
  ShareIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  EditIcon,
  CodeIcon,
  FileTextIcon,
  LayersIcon,
  GitForkIcon,
  SlidersIcon,
  LineChartIcon,
  CheckIcon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import api from "../configs/api";

// Import models array
import { models } from "../data/models";

// Define data types
const DataTypes = {
  CSV: 'csv',
  JSON: 'json',
  TEXT: 'text',
  DATAFRAME: 'dataframe',
  MODEL: 'model',
  RESULT: 'result',
  PROCESSED_DATA: 'processed_data',
  ANY: 'any'
};

// Custom node components
const ModelNode = ({ data, selected }) => {
  const ModelIcon = data.icon || CpuIcon;
  
  // Determine input and output types
  const inputTypes = data.inputTypes || [DataTypes.PROCESSED_DATA, DataTypes.DATAFRAME];
  const outputTypes = data.outputTypes || [DataTypes.MODEL, DataTypes.RESULT];
  
  return (
    <div className={`bg-white dark:bg-zinc-800 border-2 ${selected ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-emerald-300 dark:border-emerald-600'} rounded-xl p-3 min-w-[220px] shadow-lg hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30 transition-all duration-200 relative group`}>
      {/* Input Handles - Multiple for different input types */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
        {inputTypes.map((type, index) => (
          <Handle
            key={`input-${type}-${index}`}
            id={`input-${type}`}
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              top: `${30 + (index * 20)}%`,
              backgroundColor: getHandleColor(type),
              border: `2px solid ${getHandleColor(type)}`
            }}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-8 h-8 bg-gradient-to-br ${data.color || 'from-emerald-400 to-green-400'} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <ModelIcon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{data.label || 'ML Model'}</h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{data.library || 'scikit-learn'}</p>
          </div>
        </div>
        {selected && (
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        )}
        {data.isExecuting && (
          <Loader2Icon className="w-4 h-4 text-blue-500 animate-spin" />
        )}
        {data.isSuccess && (
          <CheckIcon className="w-4 h-4 text-green-500" />
        )}
        {data.isError && (
          <AlertCircleIcon className="w-4 h-4 text-red-500" />
        )}
      </div>
      
      <div className="space-y-1 mb-2">
        {data.useCases?.slice(0, 2).map((useCase, idx) => (
          <span key={idx} className="inline-block px-2 py-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
            {useCase}
          </span>
        ))}
      </div>
      
      {/* Data Type Indicators */}
      <div className="flex gap-1 mb-2">
        {inputTypes.map(type => (
          <span key={`in-${type}`} className="px-1.5 py-0.5 text-[8px] bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded">
            ← {type}
          </span>
        ))}
        {outputTypes.map(type => (
          <span key={`out-${type}`} className="px-1.5 py-0.5 text-[8px] bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded">
            {type} →
          </span>
        ))}
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <ZapIcon className="w-3 h-3" />
            Training:
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{data.trainingTime || '0 sec'}</span>
        </div>
        {data.accuracy && (
          <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
            <span>Accuracy:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{data.accuracy}</span>
          </div>
        )}
        {data.status && (
          <div className={`text-[10px] px-2 py-0.5 rounded ${
            data.status === 'executing' ? 'bg-blue-100 text-blue-700' :
            data.status === 'success' ? 'bg-green-100 text-green-700' :
            data.status === 'error' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {data.status}
          </div>
        )}
      </div>
      
      {/* Output Handles - Multiple for different output types */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
        {outputTypes.map((type, index) => (
          <Handle
            key={`output-${type}-${index}`}
            id={`output-${type}`}
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              top: `${30 + (index * 20)}%`,
              backgroundColor: getHandleColor(type),
              border: `2px solid ${getHandleColor(type)}`
            }}
          />
        ))}
      </div>
      
      <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded">
        {data.id?.substring(0, 4)}
      </div>
    </div>
  );
};

const DataNode = ({ data, selected }) => {
  // Determine input and output types
  const outputTypes = data.outputTypes || [DataTypes.CSV, DataTypes.DATAFRAME];
  
  return (
    <div className={`bg-white dark:bg-zinc-800 border-2 ${selected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-blue-300 dark:border-blue-600'} rounded-xl p-3 min-w-[200px] shadow-lg relative group`}>
      {/* Output Handles */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
        {outputTypes.map((type, index) => (
          <Handle
            key={`output-${type}-${index}`}
            id={`output-${type}`}
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              top: `${30 + (index * 20)}%`,
              backgroundColor: getHandleColor(type),
              border: `2px solid ${getHandleColor(type)}`
            }}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
          <DatabaseIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">CSV Dataset</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Data Source</p>
        </div>
        {data.isExecuting && (
          <Loader2Icon className="w-4 h-4 text-blue-500 animate-spin" />
        )}
        {data.isSuccess && (
          <CheckIcon className="w-4 h-4 text-green-500" />
        )}
      </div>
      
      {/* Data Type Indicators */}
      <div className="flex gap-1 mb-2">
        {outputTypes.map(type => (
          <span key={`out-${type}`} className="px-1.5 py-0.5 text-[8px] bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded">
            {type} →
          </span>
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-zinc-400">Size:</span>
          <span className="font-medium text-gray-900 dark:text-white">{data.size || '0MB'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-zinc-400">Features:</span>
          <span className="font-medium text-gray-900 dark:text-white">{data.features || '0'}</span>
        </div>
        {data.file && (
          <div className="text-xs text-gray-500 dark:text-zinc-400 truncate">
            📄 {data.file.name}
          </div>
        )}
        {data.status && (
          <div className={`text-[10px] px-2 py-0.5 rounded ${
            data.status === 'ready' ? 'bg-gray-100 text-gray-700' :
            data.status === 'executing' ? 'bg-blue-100 text-blue-700' :
            data.status === 'success' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {data.status}
          </div>
        )}
      </div>
      
      {selected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
      )}
    </div>
  );
};

const OutputNode = ({ data, selected }) => {
  // Determine input types
  const inputTypes = data.inputTypes || [DataTypes.RESULT, DataTypes.MODEL, DataTypes.JSON];
  
  return (
    <div className={`bg-white dark:bg-zinc-800 border-2 ${selected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-purple-300 dark:border-purple-600'} rounded-xl p-3 min-w-[200px] shadow-lg relative group`}>
      {/* Input Handles */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
        {inputTypes.map((type, index) => (
          <Handle
            key={`input-${type}-${index}`}
            id={`input-${type}`}
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              top: `${30 + (index * 20)}%`,
              backgroundColor: getHandleColor(type),
              border: `2px solid ${getHandleColor(type)}`
            }}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
          <BarChartIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Model Results</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Results Output</p>
        </div>
        {data.isExecuting && (
          <Loader2Icon className="w-4 h-4 text-blue-500 animate-spin" />
        )}
        {data.isSuccess && (
          <CheckIcon className="w-4 h-4 text-green-500" />
        )}
      </div>
      
      {/* Data Type Indicators */}
      <div className="flex gap-1 mb-2">
        {inputTypes.map(type => (
          <span key={`in-${type}`} className="px-1.5 py-0.5 text-[8px] bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded">
            ← {type}
          </span>
        ))}
      </div>
      
      <div className="space-y-2">
        {data.metrics?.slice(0, 2).map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-zinc-400 truncate">{metric.name}:</span>
            <span className="font-medium text-gray-900 dark:text-white bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
              {metric.value}
            </span>
          </div>
        ))}
      </div>
      
      {data.result && (
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(data.result, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `model_results_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="w-full mt-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-xs flex items-center justify-center gap-1"
        >
          <DownloadIcon className="w-3 h-3" />
          Download Results
        </button>
      )}
      
      {selected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-purple-500 animate-pulse"></div>
      )}
    </div>
  );
};

const ProcessingNode = ({ data, selected }) => {
  // Determine input and output types
  const inputTypes = data.inputTypes || [DataTypes.CSV, DataTypes.DATAFRAME];
  const outputTypes = data.outputTypes || [DataTypes.PROCESSED_DATA, DataTypes.DATAFRAME];
  
  return (
    <div className={`bg-white dark:bg-zinc-800 border-2 ${selected ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-amber-300 dark:border-amber-600'} rounded-xl p-3 min-w-[220px] shadow-lg relative group`}>
      {/* Input Handles */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
        {inputTypes.map((type, index) => (
          <Handle
            key={`input-${type}-${index}`}
            id={`input-${type}`}
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              top: `${30 + (index * 20)}%`,
              backgroundColor: getHandleColor(type),
              border: `2px solid ${getHandleColor(type)}`
            }}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Data Preprocessor</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400">{data.type || 'Processing'}</p>
        </div>
        {data.isExecuting && (
          <Loader2Icon className="w-4 h-4 text-blue-500 animate-spin" />
        )}
        {data.isSuccess && (
          <CheckIcon className="w-4 h-4 text-green-500" />
        )}
        {data.isError && (
          <AlertCircleIcon className="w-4 h-4 text-red-500" />
        )}
      </div>
      
      {/* Data Type Indicators */}
      <div className="flex gap-1 mb-2">
        {inputTypes.map(type => (
          <span key={`in-${type}`} className="px-1.5 py-0.5 text-[8px] bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded">
            ← {type}
          </span>
        ))}
        {outputTypes.map(type => (
          <span key={`out-${type}`} className="px-1.5 py-0.5 text-[8px] bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded">
            {type} →
          </span>
        ))}
      </div>
      
      {data.params && (
        <div className="space-y-2">
          {Object.entries(data.params).slice(0, 2).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-400 truncate">{key}:</span>
              <span className="font-medium text-gray-900 dark:text-white bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Output Handles */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
        {outputTypes.map((type, index) => (
          <Handle
            key={`output-${type}-${index}`}
            id={`output-${type}`}
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              top: `${30 + (index * 20)}%`,
              backgroundColor: getHandleColor(type),
              border: `2px solid ${getHandleColor(type)}`
            }}
          />
        ))}
      </div>
      
      {selected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-500 animate-pulse"></div>
      )}
    </div>
  );
};

const nodeTypes = {
  modelNode: ModelNode,
  dataNode: DataNode,
  outputNode: OutputNode,
  processingNode: ProcessingNode,
};

// Helper function to get handle color based on data type
const getHandleColor = (dataType) => {
  switch (dataType) {
    case DataTypes.CSV:
      return '#3b82f6'; // Blue
    case DataTypes.JSON:
      return '#8b5cf6'; // Purple
    case DataTypes.TEXT:
      return '#10b981'; // Emerald
    case DataTypes.DATAFRAME:
      return '#f59e0b'; // Amber
    case DataTypes.MODEL:
      return '#ec4899'; // Pink
    case DataTypes.RESULT:
      return '#6366f1'; // Indigo
    case DataTypes.PROCESSED_DATA:
      return '#14b8a6'; // Teal
    default:
      return '#6b7280'; // Gray
  }
};

// Helper function to check if data types are compatible
const areDataTypesCompatible = (sourceTypes, targetTypes) => {
  return sourceTypes.some(sourceType => 
    targetTypes.includes(sourceType) || 
    targetTypes.includes(DataTypes.ANY) ||
    sourceType === DataTypes.ANY
  );
};

// Get model by slug
const getModelBySlug = (slug) => {
  return models.find(model => model.slug === slug) || models[0];
};

// Node Configuration Panel (n8n-style)
const NodeConfigPanel = ({ 
  selectedNode, 
  onUpdateNode, 
  onClose, 
  edges, 
  nodes,
  onDeleteEdge 
}) => {
  const [config, setConfig] = useState(selectedNode?.data || {});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = () => {
    onUpdateNode(selectedNode.id, config);
    onClose(); // Close panel after save
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setConfig({ 
        ...config, 
        file: uploadedFile, 
        size: `${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB` 
      });
    }
  };

  // Get incoming and outgoing edges for this node
  const incomingEdges = edges.filter(edge => edge.target === selectedNode?.id);
  const outgoingEdges = edges.filter(edge => edge.source === selectedNode?.id);
  
  // Get connected nodes
  const incomingNodes = incomingEdges.map(edge => 
    nodes.find(node => node.id === edge.source)
  ).filter(Boolean);
  
  const outgoingNodes = outgoingEdges.map(edge => 
    nodes.find(node => node.id === edge.target)
  ).filter(Boolean);

  const getModelParameters = (modelSlug) => {
    const params = {
      common: {
        testSize: true,
        randomState: true,
        targetColumn: true,
        enableDataCleaning: true,
      },
      specific: {}
    };

    switch (modelSlug) {
      case 'decision-tree':
        params.specific = {
          criterion: true,
          maxDepth: true,
          minSamplesSplit: true,
          minSamplesLeaf: true,
        };
        break;
      case 'KNN':
        params.specific = {
          nNeighbors: true,
          weights: true,
          algorithm: true,
          metric: true,
        };
        break;
      case 'random-forest':
        params.specific = {
          nEstimators: true,
          criterion: true,
          maxDepth: true,
          minSamplesSplit: true,
          minSamplesLeaf: true,
          classWeight: true,
        };
        break;
      case 'neural-network':
        params.specific = {
          hiddenLayerSizes: true,
          activation: true,
          solver: true,
          maxIter: true,
        };
        break;
      case 'linear-regression':
      case 'logistic-regression':
      default:
        params.specific = {};
    }

    return params;
  };

  const renderConfigFields = () => {
    if (!selectedNode) return null;

    switch (selectedNode.type) {
      case 'dataNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Upload CSV File
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      <FileTextIcon className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadIcon className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Click to upload</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">CSV or Excel files</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            {file && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  File uploaded successfully. This will be processed when workflow runs.
                </p>
              </div>
            )}
            
            {/* Data Type Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Output Data Types
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(DataTypes).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      const currentTypes = config.outputTypes || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      setConfig({ ...config, outputTypes: newTypes });
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      (config.outputTypes || []).includes(type)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'modelNode':
        const selectedModel = getModelBySlug(config.algorithm || 'random-forest');
        const modelParams = getModelParameters(selectedModel.slug);

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Select Algorithm
              </label>
              <select
                value={config.algorithm || 'random-forest'}
                onChange={(e) => {
                  const model = getModelBySlug(e.target.value);
                  setConfig({ 
                    ...config, 
                    algorithm: e.target.value,
                    label: model.name,
                    library: model.library,
                    icon: model.icon || CpuIcon,
                    color: model.class ? model.class.match(/from-(.*?)\s+to-(.*?)\s+/)[0] : 'from-emerald-400 to-green-400'
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
              >
                {models.map(model => (
                  <option key={model.slug} value={model.slug}>
                    {model.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {selectedModel.description}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Selected Model: {selectedModel.name}</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedModel.useCases?.slice(0, 3).map((useCase, idx) => (
                  <span key={idx} className="inline-block px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {useCase}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400">{selectedModel.howItWorks}</p>
            </div>

            {/* Data Type Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Input Data Types
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.values(DataTypes).map(type => (
                  <button
                    key={`in-${type}`}
                    onClick={() => {
                      const currentTypes = config.inputTypes || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      setConfig({ ...config, inputTypes: newTypes });
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      (config.inputTypes || []).includes(type)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    ← {type}
                  </button>
                ))}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Output Data Types
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(DataTypes).map(type => (
                  <button
                    key={`out-${type}`}
                    onClick={() => {
                      const currentTypes = config.outputTypes || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      setConfig({ ...config, outputTypes: newTypes });
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      (config.outputTypes || []).includes(type)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    {type} →
                  </button>
                ))}
              </div>
            </div>

            {/* Common Parameters */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Model Configuration</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Target Column (will auto-detect if empty)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for auto-detection"
                  value={config.targetColumn || ''}
                  onChange={(e) => setConfig({ ...config, targetColumn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Test Size (0.1 to 0.5)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={config.testSize || 0.3}
                  onChange={(e) => setConfig({ ...config, testSize: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Random State
                </label>
                <input
                  type="number"
                  value={config.randomState || 101}
                  onChange={(e) => setConfig({ ...config, randomState: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableDataCleaning"
                  checked={config.enableDataCleaning !== false}
                  onChange={(e) => setConfig({ ...config, enableDataCleaning: e.target.checked })}
                  className="rounded text-emerald-500 mr-2"
                />
                <label htmlFor="enableDataCleaning" className="text-sm text-gray-700 dark:text-zinc-300">
                  Enable Data Cleaning
                </label>
              </div>
            </div>

            {/* Model-specific Parameters */}
            {modelParams.specific.criterion && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Criterion
                </label>
                <select
                  value={config.criterion || 'gini'}
                  onChange={(e) => setConfig({ ...config, criterion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                >
                  <option value="gini">Gini Impurity</option>
                  <option value="entropy">Information Gain (Entropy)</option>
                  <option value="log_loss">Log Loss</option>
                </select>
              </div>
            )}

            {modelParams.specific.maxDepth && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Max Depth
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  value={config.maxDepth || ''}
                  onChange={(e) => setConfig({ ...config, maxDepth: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            )}

            {modelParams.specific.nEstimators && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Number of Estimators
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={config.nEstimators || 200}
                  onChange={(e) => setConfig({ ...config, nEstimators: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            )}

            {modelParams.specific.minSamplesSplit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Minimum Samples Split
                </label>
                <input
                  type="number"
                  min="2"
                  value={config.minSamplesSplit || 2}
                  onChange={(e) => setConfig({ ...config, minSamplesSplit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            )}

            {modelParams.specific.minSamplesLeaf && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Minimum Samples Leaf
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.minSamplesLeaf || 1}
                  onChange={(e) => setConfig({ ...config, minSamplesLeaf: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            )}

            {modelParams.specific.nNeighbors && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Number of Neighbors (k)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.nNeighbors || 5}
                  onChange={(e) => setConfig({ ...config, nNeighbors: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            )}

            {modelParams.specific.weights && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Weights
                </label>
                <select
                  value={config.weights || 'uniform'}
                  onChange={(e) => setConfig({ ...config, weights: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                >
                  <option value="uniform">Uniform</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            )}

            {modelParams.specific.hiddenLayerSizes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Hidden Layer Sizes
                </label>
                <input
                  type="text"
                  placeholder="e.g., (100,) or (50, 25)"
                  value={config.hiddenLayerSizes || '(100,)'}
                  onChange={(e) => setConfig({ ...config, hiddenLayerSizes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            )}

            {modelParams.specific.activation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Activation Function
                </label>
                <select
                  value={config.activation || 'relu'}
                  onChange={(e) => setConfig({ ...config, activation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                >
                  <option value="relu">ReLU</option>
                  <option value="tanh">Tanh</option>
                  <option value="logistic">Logistic</option>
                  <option value="identity">Identity</option>
                </select>
              </div>
            )}

            {modelParams.specific.solver && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Solver
                </label>
                <select
                  value={config.solver || 'adam'}
                  onChange={(e) => setConfig({ ...config, solver: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                >
                  <option value="adam">Adam</option>
                  <option value="lbfgs">L-BFGS</option>
                  <option value="sgd">SGD</option>
                </select>
              </div>
            )}

            {modelParams.specific.maxIter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Maximum Iterations
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  value={config.maxIter || 500}
                  onChange={(e) => setConfig({ ...config, maxIter: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            )}
          </div>
        );

      case 'processingNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Processing Type
              </label>
              <select
                value={config.type || 'Cleaning & Scaling'}
                onChange={(e) => setConfig({ ...config, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
              >
                <option value="Cleaning & Scaling">Cleaning & Scaling</option>
                <option value="Feature Engineering">Feature Engineering</option>
                <option value="Normalization">Normalization</option>
                <option value="Encoding">Encoding</option>
                <option value="Augmentation">Augmentation</option>
              </select>
            </div>
            
            {/* Data Type Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Input Data Types
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.values(DataTypes).map(type => (
                  <button
                    key={`in-${type}`}
                    onClick={() => {
                      const currentTypes = config.inputTypes || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      setConfig({ ...config, inputTypes: newTypes });
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      (config.inputTypes || []).includes(type)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    ← {type}
                  </button>
                ))}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Output Data Types
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(DataTypes).map(type => (
                  <button
                    key={`out-${type}`}
                    onClick={() => {
                      const currentTypes = config.outputTypes || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      setConfig({ ...config, outputTypes: newTypes });
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      (config.outputTypes || []).includes(type)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    {type} →
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Scaling Method
              </label>
              <select
                value={config.scalingMethod || 'Standard'}
                onChange={(e) => setConfig({ ...config, scalingMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
              >
                <option value="Standard">Standard</option>
                <option value="MinMax">MinMax</option>
                <option value="Robust">Robust</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Missing Value Handling
              </label>
              <select
                value={config.missingValues || 'Impute'}
                onChange={(e) => setConfig({ ...config, missingValues: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
              >
                <option value="Impute">Impute</option>
                <option value="Drop">Drop</option>
                <option value="Ignore">Ignore</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableCleaning"
                checked={config.enableCleaning !== false}
                onChange={(e) => setConfig({ ...config, enableCleaning: e.target.checked })}
                className="rounded text-emerald-500 mr-2"
              />
              <label htmlFor="enableCleaning" className="text-sm text-gray-700 dark:text-zinc-300">
                Enable Data Cleaning
              </label>
            </div>
          </div>
        );

      case 'outputNode':
        return (
          <div className="space-y-4">
            {/* Data Type Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Input Data Types
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(DataTypes).map(type => (
                  <button
                    key={`in-${type}`}
                    onClick={() => {
                      const currentTypes = config.inputTypes || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      setConfig({ ...config, inputTypes: newTypes });
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      (config.inputTypes || []).includes(type)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    ← {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Output Format
              </label>
              <select
                value={config.outputFormat || 'json'}
                onChange={(e) => setConfig({ ...config, outputFormat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="text">Text</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
            <SettingsIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No configuration available for this node type</p>
          </div>
        );
    }
  };

  const renderEdgesSection = () => {
    return (
      <div className="space-y-3 mt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Connections</h4>
        
        {/* Incoming Connections */}
        {incomingEdges.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700 dark:text-zinc-300">Inputs:</h5>
            <div className="space-y-1">
              {incomingEdges.map((edge, idx) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                return (
                  <div key={edge.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getHandleColor(edge.data?.dataType || DataTypes.ANY) }}
                      ></div>
                      <span className="text-xs text-gray-700 dark:text-zinc-300">
                        From: {sourceNode?.data?.label || sourceNode?.id}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-zinc-500">
                        ({edge.data?.dataType || 'any'})
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteEdge(edge.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      title="Remove connection"
                    >
                      <TrashIcon className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Outgoing Connections */}
        {outgoingEdges.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700 dark:text-zinc-300">Outputs:</h5>
            <div className="space-y-1">
              {outgoingEdges.map((edge, idx) => {
                const targetNode = nodes.find(n => n.id === edge.target);
                return (
                  <div key={edge.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getHandleColor(edge.data?.dataType || DataTypes.ANY) }}
                      ></div>
                      <span className="text-xs text-gray-700 dark:text-zinc-300">
                        To: {targetNode?.data?.label || targetNode?.id}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-zinc-500">
                        ({edge.data?.dataType || 'any'})
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteEdge(edge.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      title="Remove connection"
                    >
                      <TrashIcon className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {incomingEdges.length === 0 && outgoingEdges.length === 0 && (
          <div className="text-center py-4">
            <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-zinc-400">No connections yet</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              Drag handles to connect nodes
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!selectedNode) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col">
      <div className="border-b border-gray-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedNode.type === 'dataNode' ? 'bg-gradient-to-br from-blue-400 to-cyan-400' :
              selectedNode.type === 'modelNode' ? 'bg-gradient-to-br from-emerald-400 to-green-400' :
              selectedNode.type === 'processingNode' ? 'bg-gradient-to-br from-amber-400 to-orange-400' :
              'bg-gradient-to-br from-purple-400 to-pink-400'
            }`}>
              {selectedNode.type === 'dataNode' && <DatabaseIcon className="w-5 h-5 text-white" />}
              {selectedNode.type === 'modelNode' && <CpuIcon className="w-5 h-5 text-white" />}
              {selectedNode.type === 'processingNode' && <SettingsIcon className="w-5 h-5 text-white" />}
              {selectedNode.type === 'outputNode' && <BarChartIcon className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Node Configuration</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{selectedNode.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <XIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Data Type Compatibility</h4>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Configure input/output data types. Connections are only allowed between compatible data types.
            </p>
          </div>

          {renderConfigFields()}
          
          {/* Edges Management Section */}
          {renderEdgesSection()}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-zinc-800 p-4">
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <CheckIcon className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Node Library Panel
const NodeLibraryPanel = ({ onAddNode, isOpen, onClose }) => {
  const nodeCategories = [
    {
      name: "Data Sources",
      icon: DatabaseIcon,
      color: "from-blue-400 to-cyan-400",
      nodes: [
        { 
          type: "dataNode", 
          label: "CSV Dataset", 
          icon: FileTextIcon,
          defaultData: {
            outputTypes: [DataTypes.CSV, DataTypes.DATAFRAME]
          }
        },
        { 
          type: "dataNode", 
          label: "JSON Data", 
          icon: DatabaseIcon,
          defaultData: {
            outputTypes: [DataTypes.JSON, DataTypes.DATAFRAME]
          }
        },
        { 
          type: "dataNode", 
          label: "Text Data", 
          icon: LayersIcon,
          defaultData: {
            outputTypes: [DataTypes.TEXT]
          }
        },
      ],
    },
    {
      name: "Processing",
      icon: SettingsIcon,
      color: "from-amber-400 to-orange-400",
      nodes: [
        { 
          type: "processingNode", 
          label: "Data Preprocessor", 
          icon: SettingsIcon,
          defaultData: {
            inputTypes: [DataTypes.CSV, DataTypes.DATAFRAME, DataTypes.PROCESSED_DATA],
            outputTypes: [DataTypes.PROCESSED_DATA, DataTypes.DATAFRAME]
          }
        },
        { 
          type: "processingNode", 
          label: "Feature Engineering", 
          icon: SlidersIcon,
          defaultData: {
            inputTypes: [DataTypes.DATAFRAME, DataTypes.PROCESSED_DATA],
            outputTypes: [DataTypes.DATAFRAME]
          }
        },
        { 
          type: "modelNode", 
          label: "ML Model", 
          icon: CpuIcon,
          defaultData: {
            inputTypes: [DataTypes.PROCESSED_DATA, DataTypes.DATAFRAME],
            outputTypes: [DataTypes.MODEL, DataTypes.RESULT]
          }
        },
      ],
    },
    {
      name: "Output",
      icon: BarChartIcon,
      color: "from-purple-400 to-pink-400",
      nodes: [
        { 
          type: "outputNode", 
          label: "Model Results", 
          icon: BarChartIcon,
          defaultData: {
            inputTypes: [DataTypes.RESULT, DataTypes.MODEL, DataTypes.JSON],
            outputTypes: []
          }
        },
        { 
          type: "outputNode", 
          label: "Export Results", 
          icon: DownloadIcon,
          defaultData: {
            inputTypes: [DataTypes.RESULT, DataTypes.JSON, DataTypes.CSV],
            outputTypes: []
          }
        },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col">
      <div className="border-b border-gray-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Node Library</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <XIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="relative mt-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {nodeCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.name}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                </div>
                <div className="space-y-2">
                  {category.nodes.map((node, idx) => {
                    const NodeIcon = node.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => onAddNode(node.type, node.label, node.defaultData)}
                        className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-3 group"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/reactflow", JSON.stringify({
                            type: node.type,
                            data: { 
                              label: node.label,
                              ...node.defaultData
                            }
                          }));
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30">
                          <NodeIcon className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-sm text-gray-700 dark:text-zinc-300">{node.label}</span>
                          <div className="flex gap-1 mt-1">
                            {node.defaultData?.inputTypes?.slice(0, 2).map(type => (
                              <span key={type} className="text-[8px] px-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                ←{type}
                              </span>
                            ))}
                            {node.defaultData?.outputTypes?.slice(0, 2).map(type => (
                              <span key={type} className="text-[8px] px-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                                {type}→
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper function to get execution order
const getExecutionOrder = (nodes, edges) => {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const incomingEdges = new Map();
  const outgoingEdges = new Map();
  
  nodes.forEach(node => {
    incomingEdges.set(node.id, []);
    outgoingEdges.set(node.id, []);
  });
  
  edges.forEach(edge => {
    incomingEdges.get(edge.target).push(edge.source);
    outgoingEdges.get(edge.source).push(edge.target);
  });
  
  const visited = new Set();
  const order = [];
  
  const visit = (nodeId) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    // Visit all dependencies first
    incomingEdges.get(nodeId).forEach(depId => visit(depId));
    
    order.push(nodeId);
  };
  
  // Start from nodes with no dependencies
  nodes.forEach(node => {
    if (incomingEdges.get(node.id).length === 0) {
      visit(node.id);
    }
  });
  
  // Also visit any remaining nodes (for circular dependencies)
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  });
  
  return order;
};

// Helper function to find compatible data type for connection
const findCompatibleDataType = (sourceNode, targetNode) => {
  const sourceOutputTypes = sourceNode.data?.outputTypes || [DataTypes.ANY];
  const targetInputTypes = targetNode.data?.inputTypes || [DataTypes.ANY];
  
  // Find first compatible data type
  const compatibleType = sourceOutputTypes.find(sourceType => 
    targetInputTypes.includes(sourceType) || 
    targetInputTypes.includes(DataTypes.ANY) ||
    sourceType === DataTypes.ANY
  );
  
  // If no exact match, use ANY if available
  if (!compatibleType) {
    if (targetInputTypes.includes(DataTypes.ANY)) return DataTypes.ANY;
    if (sourceOutputTypes.includes(DataTypes.ANY)) return DataTypes.ANY;
  }
  
  return compatibleType || DataTypes.ANY;
};

// Main Workflow Component
const ModelWorkflow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showLibraryPanel, setShowLibraryPanel] = useState(false);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [executionStatus, setExecutionStatus] = useState('ready');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const { screenToFlowPosition } = useReactFlow();

  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  useEffect(() => {
    // Initialize with default nodes
    setNodes([
      {
        id: 'data-1',
        type: 'dataNode',
        position: { x: 100, y: 250 },
        data: {
          label: 'CSV Dataset',
          size: '0MB',
          features: '0',
          samples: '0',
          file: null,
          isExecuting: false,
          isSuccess: false,
          status: 'ready',
          outputTypes: [DataTypes.CSV, DataTypes.DATAFRAME]
        },
      },
      {
        id: 'process-1',
        type: 'processingNode',
        position: { x: 350, y: 250 },
        data: {
          label: 'Data Preprocessor',
          type: 'Cleaning & Scaling',
          params: {
            'Scaling': 'Standard',
            'Missing': 'Impute',
          },
          isExecuting: false,
          isSuccess: false,
          status: 'ready',
          enableCleaning: true,
          scalingMethod: 'Standard',
          missingValues: 'Impute',
          inputTypes: [DataTypes.CSV, DataTypes.DATAFRAME, DataTypes.PROCESSED_DATA],
          outputTypes: [DataTypes.PROCESSED_DATA, DataTypes.DATAFRAME]
        },
      },
      {
        id: 'model-1',
        type: 'modelNode',
        position: { x: 600, y: 250 },
        data: {
          label: 'ML Model',
          library: 'scikit-learn',
          algorithm: 'random-forest',
          category: 'ensemble',
          trainingTime: '0 sec',
          useCases: ['Classification'],
          accuracy: '0%',
          targetColumn: '',
          testSize: 0.3,
          randomState: 101,
          enableDataCleaning: true,
          isExecuting: false,
          isSuccess: false,
          status: 'ready',
          icon: CpuIcon,
          color: 'from-emerald-400 to-green-400',
          inputTypes: [DataTypes.PROCESSED_DATA, DataTypes.DATAFRAME],
          outputTypes: [DataTypes.MODEL, DataTypes.RESULT]
        },
      },
      {
        id: 'output-1',
        type: 'outputNode',
        position: { x: 850, y: 250 },
        data: {
          label: 'Model Results',
          metrics: [],
          result: null,
          isExecuting: false,
          isSuccess: false,
          status: 'ready',
          inputTypes: [DataTypes.RESULT, DataTypes.MODEL, DataTypes.JSON]
        },
      },
    ]);

    setEdges([
      {
        id: 'e1-2',
        source: 'data-1',
        target: 'process-1',
        type: 'smoothstep',
        animated: false,
        style: { stroke: getHandleColor(DataTypes.CSV), strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getHandleColor(DataTypes.CSV),
        },
        data: { dataType: DataTypes.CSV }
      },
      {
        id: 'e2-3',
        source: 'process-1',
        target: 'model-1',
        type: 'smoothstep',
        animated: false,
        style: { stroke: getHandleColor(DataTypes.PROCESSED_DATA), strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getHandleColor(DataTypes.PROCESSED_DATA),
        },
        data: { dataType: DataTypes.PROCESSED_DATA }
      },
      {
        id: 'e3-4',
        source: 'model-1',
        target: 'output-1',
        type: 'smoothstep',
        animated: false,
        style: { stroke: getHandleColor(DataTypes.RESULT), strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getHandleColor(DataTypes.RESULT),
        },
        data: { dataType: DataTypes.RESULT }
      },
    ]);
  }, []);

  const onConnect = useCallback(
    (params) => {
      // Get source and target nodes
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Check if connection already exists
      const existingEdge = edges.find(
        edge => edge.source === params.source && edge.target === params.target
      );
      
      if (existingEdge) {
        return; // Don't create duplicate connection
      }
      
      // Find compatible data type for the connection
      const compatibleDataType = findCompatibleDataType(sourceNode, targetNode);
      
      // Check if connection is valid based on data types
      const sourceOutputTypes = sourceNode.data?.outputTypes || [DataTypes.ANY];
      const targetInputTypes = targetNode.data?.inputTypes || [DataTypes.ANY];
      
      const isValidConnection = areDataTypesCompatible(sourceOutputTypes, targetInputTypes);
      
      if (!isValidConnection) {
        console.warn('Invalid connection: Data types not compatible');
        // You could show a toast notification here
        return;
      }

      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        animated: isExecuting,
        style: { 
          stroke: getHandleColor(compatibleDataType), 
          strokeWidth: 3 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getHandleColor(compatibleDataType),
        },
        data: { dataType: compatibleDataType }
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges, isExecuting, edges, nodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    setShowConfigPanel(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setShowConfigPanel(false);
  }, []);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, ...newData },
        };
      }
      return node;
    }));
  }, [setNodes]);

  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter(edge => edge.id !== edgeId));
  }, [setEdges]);

  const addNode = useCallback((type, label, defaultData = {}) => {
    const newNodeId = `node-${Date.now()}`;
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    let newNode = {
      id: newNodeId,
      type,
      position,
      data: { 
        label: label || (type === 'modelNode' ? 'ML Model' : 'New Node'),
        ...defaultData
      },
    };

    // Set default data based on node type
    switch (type) {
      case 'dataNode':
        newNode.data = {
          ...newNode.data,
          label: label || 'CSV Dataset',
          size: '0MB',
          features: '0',
          samples: '0',
          file: null,
          isExecuting: false,
          isSuccess: false,
          status: 'ready',
          outputTypes: defaultData.outputTypes || [DataTypes.CSV, DataTypes.DATAFRAME]
        };
        break;
      case 'modelNode':
        const defaultModel = getModelBySlug('random-forest');
        newNode.data = {
          ...newNode.data,
          label: label || 'ML Model',
          library: defaultModel.library,
          algorithm: defaultModel.slug,
          category: defaultModel.category,
          trainingTime: defaultModel.trainingTime || '0 sec',
          useCases: defaultModel.useCases || ['General'],
          accuracy: '0%',
          targetColumn: '',
          testSize: 0.3,
          randomState: 101,
          enableDataCleaning: true,
          isExecuting: false,
          isSuccess: false,
          status: 'ready',
          icon: defaultModel.icon || CpuIcon,
          color: defaultModel.class ? 
            defaultModel.class.match(/from-(.*?)\s+to-(.*?)\s+/)[0] : 
            'from-emerald-400 to-green-400',
          inputTypes: defaultData.inputTypes || [DataTypes.PROCESSED_DATA, DataTypes.DATAFRAME],
          outputTypes: defaultData.outputTypes || [DataTypes.MODEL, DataTypes.RESULT]
        };
        break;
      case 'processingNode':
        newNode.data = {
          ...newNode.data,
          label: label || 'Data Preprocessor',
          type: 'Cleaning & Scaling',
          params: { Method: 'Default' },
          isExecuting: false,
          isSuccess: false,
          status: 'ready',
          enableCleaning: true,
          scalingMethod: 'Standard',
          missingValues: 'Impute',
          inputTypes: defaultData.inputTypes || [DataTypes.CSV, DataTypes.DATAFRAME, DataTypes.PROCESSED_DATA],
          outputTypes: defaultData.outputTypes || [DataTypes.PROCESSED_DATA, DataTypes.DATAFRAME]
        };
        break;
      case 'outputNode':
        newNode.data = {
          ...newNode.data,
          label: label || 'Model Results',
          metrics: [],
          result: null,
          isExecuting: false,
          isSuccess: false,
          status: 'ready',
          inputTypes: defaultData.inputTypes || [DataTypes.RESULT, DataTypes.MODEL, DataTypes.JSON]
        };
        break;
    }

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newNodeId);
    setShowConfigPanel(true);
    setShowLibraryPanel(false);
  }, [setNodes, screenToFlowPosition]);

  const deleteNode = useCallback(() => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
      ));
      setSelectedNodeId(null);
      setShowConfigPanel(false);
    }
  }, [selectedNodeId, setNodes, setEdges]);

  const executeDataNode = async (nodeId, nodeData) => {
    try {
      if (!nodeData.file) {
        throw new Error('No file uploaded');
      }

      // For data node, just prepare the file
      updateNodeData(nodeId, {
        isExecuting: false,
        isSuccess: true,
        status: 'success',
        size: nodeData.size || `${(nodeData.file.size / 1024 / 1024).toFixed(2)}MB`
      });

      return {
        type: DataTypes.CSV,
        data: nodeData.file,
        metadata: {
          size: nodeData.size,
          features: nodeData.features
        }
      };
    } catch (error) {
      updateNodeData(nodeId, {
        isExecuting: false,
        isError: true,
        status: 'error'
      });
      throw error;
    }
  };

  const executeProcessingNode = async (nodeId, nodeData, inputData) => {
    try {
      if (!inputData || !inputData.data) {
        throw new Error('No input data provided');
      }

      updateNodeData(nodeId, {
        isExecuting: false,
        isSuccess: true,
        status: 'success'
      });

      // Pass through the data with processing info
      return {
        type: DataTypes.PROCESSED_DATA,
        data: inputData.data,
        processing: {
          enableCleaning: nodeData.enableCleaning !== false,
          scalingMethod: nodeData.scalingMethod,
          missingValues: nodeData.missingValues
        },
        metadata: inputData.metadata
      };
    } catch (error) {
      updateNodeData(nodeId, {
        isExecuting: false,
        isError: true,
        status: 'error'
      });
      throw error;
    }
  };

  const executeModelNode = async (nodeId, nodeData, inputData) => {
    try {
      if (!inputData || !inputData.data) {
        throw new Error('No input data provided');
      }

      const formData = new FormData();
      formData.append("model", nodeData.algorithm);
      formData.append("file", inputData.data);
      
      if (nodeData.targetColumn) {
        formData.append("target_column", nodeData.targetColumn);
      }
      
      formData.append("test_size", nodeData.testSize || 0.3);
      formData.append("random_state", nodeData.randomState || 101);
      formData.append("enable_data_cleaning", nodeData.enableDataCleaning !== false);

      // Add algorithm-specific parameters
      switch (nodeData.algorithm) {
        case 'decision-tree':
          formData.append("criterion", nodeData.criterion || 'gini');
          formData.append("max_depth", nodeData.maxDepth || '');
          formData.append("min_samples_split", nodeData.minSamplesSplit || 2);
          formData.append("min_samples_leaf", nodeData.minSamplesLeaf || 1);
          break;
        case 'KNN':
          formData.append("n_neighbors", nodeData.nNeighbors );
          formData.append("weights", nodeData.weights);
          formData.append("algorithm", nodeData.algorithm);
          formData.append("metric", nodeData.metric);
          break;
        case 'random-forest':
          formData.append("n_estimators", nodeData.nEstimators || 200);
          formData.append("criterion", nodeData.criterion || 'gini');
          formData.append("max_depth", nodeData.maxDepth || '');
          formData.append("min_samples_split", nodeData.minSamplesSplit || 2);
          formData.append("min_samples_leaf", nodeData.minSamplesLeaf || 1);
          formData.append("class_weight", nodeData.classWeight || '');
          break;
        case 'neural-network':
          formData.append("hidden_layer_sizes", nodeData.hiddenLayerSizes || '(100,)');
          formData.append("activation", nodeData.activation || 'relu');
          formData.append("solver", nodeData.solver || 'adam');
          formData.append("max_iter", nodeData.maxIter || 500);
          break;
      }

      const res = await api.post("/api/perform", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = res.data;

      // Update node with results
      const accuracy = result.accuracy || result.r2 || 0;
      const selectedModel = getModelBySlug(nodeData.algorithm);
      updateNodeData(nodeId, {
        isExecuting: false,
        isSuccess: true,
        status: 'success',
        accuracy: `${(accuracy * 100).toFixed(2)}%`,
        result: result,
        label: selectedModel.name,
        trainingTime: `${(result.trainingTime || 0).toFixed(1)} sec`
      });

      return {
        type: DataTypes.RESULT,
        data: result,
        model: selectedModel.name,
        metadata: {
          accuracy: accuracy,
          trainingTime: result.trainingTime
        }
      };
    } catch (error) {
      console.error('Model execution error:', error);
      updateNodeData(nodeId, {
        isExecuting: false,
        isError: true,
        status: 'error'
      });
      throw error;
    }
  };

  const executeOutputNode = async (nodeId, nodeData, inputData) => {
    try {
      if (!inputData || !inputData.data) {
        throw new Error('No model results provided');
      }

      // Update node with metrics
      const metrics = [];
      if (inputData.data.accuracy !== undefined) {
        metrics.push({ name: 'Accuracy', value: `${(inputData.data.accuracy * 100).toFixed(2)}%` });
      }
      if (inputData.data.r2 !== undefined) {
        metrics.push({ name: 'R² Score', value: inputData.data.r2.toFixed(4) });
      }
      if (inputData.data.precision !== undefined) {
        metrics.push({ name: 'Precision', value: inputData.data.precision.toFixed(4) });
      }
      if (inputData.data.recall !== undefined) {
        metrics.push({ name: 'Recall', value: inputData.data.recall.toFixed(4) });
      }
      if (inputData.data.f1_score !== undefined) {
        metrics.push({ name: 'F1 Score', value: inputData.data.f1_score.toFixed(4) });
      }

      updateNodeData(nodeId, {
        isExecuting: false,
        isSuccess: true,
        status: 'success',
        metrics: metrics,
        result: inputData.data
      });

      return inputData;
    } catch (error) {
      updateNodeData(nodeId, {
        isExecuting: false,
        isError: true,
        status: 'error'
      });
      throw error;
    }
  };

  const executeNode = async (nodeId, inputData) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    // Update node status to executing
    updateNodeData(nodeId, {
      isExecuting: true,
      status: 'executing'
    });

    setExecutionLog(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      nodeId: nodeId,
      nodeLabel: node.data.label,
      status: 'executing'
    }]);

    try {
      let result;
      switch (node.type) {
        case 'dataNode':
          result = await executeDataNode(nodeId, node.data);
          break;
        case 'processingNode':
          result = await executeProcessingNode(nodeId, node.data, inputData);
          break;
        case 'modelNode':
          result = await executeModelNode(nodeId, node.data, inputData);
          break;
        case 'outputNode':
          result = await executeOutputNode(nodeId, node.data, inputData);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      setExecutionLog(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        nodeId: nodeId,
        nodeLabel: node.data.label,
        status: 'success'
      }]);

      return result;
    } catch (error) {
      setExecutionLog(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        nodeId: nodeId,
        nodeLabel: node.data.label,
        status: 'error',
        error: error.message
      }]);
      throw error;
    }
  };

  const executeWorkflow = useCallback(async () => {
    if (isExecuting || nodes.length === 0) return;
    
    setIsExecuting(true);
    setExecutionStatus('running');
    setExecutionLog([{
      timestamp: new Date().toLocaleTimeString(),
      message: 'Workflow execution started',
      status: 'info'
    }]);

    // Reset all node statuses
    setNodes(nds => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        isExecuting: false,
        isSuccess: false,
        isError: false,
        status: 'ready'
      }
    })));

    // Animate edges
    setEdges(eds => eds.map(edge => ({
      ...edge,
      animated: true,
    })));

    try {
      // Get execution order based on dependencies
      const executionOrder = getExecutionOrder(nodes, edges);
      
      // Map to store results for each node
      const nodeResults = new Map();
      
      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        // Get input data from connected upstream nodes
        const incomingEdges = edges.filter(edge => edge.target === nodeId);
        let inputData = null;
        
        if (incomingEdges.length > 0) {
          // Get results from the first upstream node (assuming single input for simplicity)
          const sourceNodeId = incomingEdges[0].source;
          inputData = nodeResults.get(sourceNodeId);
        }

        const result = await executeNode(nodeId, inputData);
        nodeResults.set(nodeId, result);
      }

      setExecutionStatus('success');
      setExecutionLog(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: 'Workflow execution completed successfully',
        status: 'success'
      }]);
    } catch (error) {
      console.error('Workflow execution error:', error);
      setExecutionStatus('error');
      setExecutionLog(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: `Workflow execution failed: ${error.message}`,
        status: 'error'
      }]);
    } finally {
      setIsExecuting(false);
      
      // Stop animation after delay
      setTimeout(() => {
        setEdges(eds => eds.map(edge => ({
          ...edge,
          animated: false,
        })));
      }, 1000);
    }
  }, [isExecuting, nodes, edges, setNodes, setEdges]);

  const arrangeNodes = useCallback(() => {
    const arrangedNodes = nodes.map((node, index) => ({
      ...node,
      position: { x: 150 + (index * 300), y: 300 },
    }));
    setNodes(arrangedNodes);
  }, [nodes, setNodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dragData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      const type = dragData.type;
      const defaultData = dragData.data || {};

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(type, defaultData.label || 'New Node', defaultData);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Left Sidebar - Node Library Toggle */}
      <div className="w-12 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setShowLibraryPanel(!showLibraryPanel)}
          className={`p-2 rounded-lg ${showLibraryPanel ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
          title="Node Library"
        >
          <LayersIcon className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={arrangeNodes}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          title="Arrange Nodes"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
        </button>
        <div className="w-full border-t border-gray-200 dark:border-zinc-800 my-2"></div>
        <button
          onClick={executeWorkflow}
          disabled={isExecuting || nodes.length === 0}
          className={`p-2 rounded-lg ${isExecuting ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'} disabled:opacity-50`}
          title="Execute Workflow"
        >
          {isExecuting ? (
            <Loader2Icon className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <PlayIcon className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
          )}
        </button>
      </div>

      {/* Node Library Panel */}
      <NodeLibraryPanel
        isOpen={showLibraryPanel}
        onAddNode={addNode}
        onClose={() => setShowLibraryPanel(false)}
      />

      {/* Main Workflow Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Workflow Header */}
        <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white min-w-[200px]"
                placeholder="Workflow name..."
              />
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  executionStatus === 'running' ? 'bg-blue-500 text-white' :
                  executionStatus === 'success' ? 'bg-emerald-500 text-white' :
                  executionStatus === 'error' ? 'bg-red-500 text-white' :
                  'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300'
                }`}>
                  {executionStatus === 'running' ? 'Running...' :
                   executionStatus === 'success' ? 'Completed' :
                   executionStatus === 'error' ? 'Failed' : 'Ready'}
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">
                  {nodes.length} nodes • {edges.length} connections
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedNodeId && (
                <>
                  <button
                    onClick={deleteNode}
                    className="px-3 py-1.5 text-xs border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <TrashIcon className="w-3 h-3" />
                    Delete Node
                  </button>
                  <button
                    onClick={() => setShowConfigPanel(true)}
                    className="px-3 py-1.5 text-xs border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-1"
                  >
                    <EditIcon className="w-3 h-3" />
                    Configure
                  </button>
                </>
              )}
              <button className="px-3 py-1.5 text-xs border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-1">
                <SaveIcon className="w-3 h-3" />
                Save
              </button>
              <button className="px-3 py-1.5 text-xs border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-1">
                <UploadIcon className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              data: { ...node.data, selected: node.id === selectedNodeId }
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionLineStyle={{ stroke: '#10b981', strokeWidth: 3 }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950"
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode={['Delete', 'Backspace']}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              style: { strokeWidth: 3 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
              },
            }}
          >
            <Background
              variant="dots"
              gap={20}
              size={1}
              color="#6b7280"
              className="dark:opacity-20"
            />
            <Controls
              className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg"
              showInteractive={false}
            />
            <MiniMap
              className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg"
              nodeStrokeColor={(node) => {
                switch (node.type) {
                  case 'dataNode': return '#3b82f6';
                  case 'modelNode': return '#10b981';
                  case 'processingNode': return '#f59e0b';
                  case 'outputNode': return '#8b5cf6';
                  default: return '#6b7280';
                }
              }}
              nodeColor={(node) => {
                switch (node.type) {
                  case 'dataNode': return '#dbeafe';
                  case 'modelNode': return '#d1fae5';
                  case 'processingNode': return '#fef3c7';
                  case 'outputNode': return '#ede9fe';
                  default: return '#f3f4f6';
                }
              }}
            />
            <Panel position="top-right" className="space-y-2">
              <button
                onClick={() => setShowLibraryPanel(true)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-zinc-700"
              >
                <PlusIcon className="w-3 h-3" />
                Add Node
              </button>
            </Panel>
          </ReactFlow>

          {/* Connection Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Drag nodes from library to canvas
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Connect compatible data types
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                Click nodes to configure
              </span>
            </div>
          </div>

          {/* Execution Log */}
          {executionLog.length > 0 && (
            <div className="absolute bottom-4 right-4 w-80 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-3 border-b border-gray-200 dark:border-zinc-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Execution Log</h4>
              </div>
              <div className="p-3 space-y-2">
                {executionLog.slice(-10).map((log, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-emerald-500' :
                        log.status === 'error' ? 'bg-red-500' :
                        log.status === 'executing' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-500 dark:text-zinc-400">{log.timestamp}</span>
                      <span className="text-gray-900 dark:text-white truncate">
                        {log.nodeLabel || log.message}
                      </span>
                    </div>
                    {log.error && (
                      <p className="text-red-500 text-[10px] mt-1">{log.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              <span>Workflow ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              <span>Last saved: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Double-click nodes to edit</span>
              <span>Press Delete to remove selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Configuration Panel */}
      {showConfigPanel && selectedNode && (
        <NodeConfigPanel
          selectedNode={selectedNode}
          onUpdateNode={updateNodeData}
          onClose={() => setShowConfigPanel(false)}
          edges={edges}
          nodes={nodes}
          onDeleteEdge={deleteEdge}
        />
      )}
    </div>
  );
};

// Main Models Page
const Workflow = () => {
  return (
    <div className="h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ML Workflow Builder
              </h1>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                Drag and drop to build machine learning pipelines
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg text-sm flex items-center gap-2">
                <PlayIcon className="w-4 h-4" />
                Run Workflow
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Workflow Builder */}
      <div className="flex-1">
        <ReactFlowProvider>
          <ModelWorkflow />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default Workflow;