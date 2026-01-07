from typing import Dict, List, Any, TypedDict
from langgraph.graph import StateGraph, END
import numpy as np
import pandas as pd
from app.agents.quality_agent import QualityAgent
from app.agents.task_agent import TaskAgent
from app.agents.feature_agent import FeatureAgent
from app.agents.model_agent import ModelAgent


class AnalysisState(TypedDict):
    """State for the analysis workflow"""

    data: List[Dict]
    columns: List[str]
    filename: str
    task_type: str
    quality_analysis: Dict[str, Any]
    task_analysis: Dict[str, Any]
    feature_suggestions: List[Dict[str, Any]]
    model_recommendations: List[Dict[str, Any]]
    dataset_info: Dict[str, Any]
    error: str


def analyze_dataset_workflow(
    data: List[Dict],
    columns: List[str],
    task_type: str = None,
    filename: str = "dataset.csv",
) -> Dict[str, Any]:
    """
    Main workflow for dataset analysis using LangGraph

    Args:
        data: List of dictionaries representing rows
        columns: List of column names
        task_type: Optional task type override
        filename: Original filename

    Returns:
        Complete analysis results
    """

    # Initialize state
    state: AnalysisState = {
        "data": data,
        "columns": columns,
        "filename": filename,
        "task_type": task_type,
        "quality_analysis": None,
        "task_analysis": None,
        "feature_suggestions": None,
        "model_recommendations": None,
        "dataset_info": None,
        "error": None,
    }

    try:
        # Step 1: Initialize agents
        quality_agent = QualityAgent()
        task_agent = TaskAgent()
        feature_agent = FeatureAgent()
        model_agent = ModelAgent()

        # Step 2: Basic dataset info
        df = pd.DataFrame(data)
        state["dataset_info"] = {
            "rows": int(len(df)),  # Convert to int
            "columns": int(len(columns)),  # Convert to int
            "headers": columns,
            "memory_usage_mb": float(
                df.memory_usage(deep=True).sum() / 1024 / 1024
            ),  # Convert to float
        }

        # Step 3: Quality analysis
        print("Running quality analysis...")
        state["quality_analysis"] = quality_agent.analyze(data, columns)

        # Convert numpy types in quality analysis
        if state["quality_analysis"]:
            state["quality_analysis"] = convert_numpy_types(state["quality_analysis"])

        # Step 4: Task detection
        print("Detecting task type...")
        state["task_analysis"] = task_agent.detect(
            data, columns, state["quality_analysis"]["stats"]
        )

        # Convert numpy types in task analysis
        if state["task_analysis"]:
            state["task_analysis"] = convert_numpy_types(state["task_analysis"])

        # Override task type if provided
        if task_type and task_type in ["classification", "regression"]:
            state["task_analysis"]["task_type"] = str(task_type)
            state["task_analysis"]["confidence"] = 0.95
            if "reasoning" not in state["task_analysis"]:
                state["task_analysis"]["reasoning"] = []
            state["task_analysis"]["reasoning"].append(
                f"Task type overridden to {task_type}"
            )

        # Step 5: Feature engineering suggestions
        print("Generating feature suggestions...")
        state["feature_suggestions"] = feature_agent.suggest(
            state["quality_analysis"]["stats"],
            columns,
            state["task_analysis"].get("task_type"),
        )

        # Convert numpy types in feature suggestions
        if state["feature_suggestions"]:
            state["feature_suggestions"] = convert_numpy_types(
                state["feature_suggestions"]
            )

        # Step 6: Model recommendations
        print("Recommending models...")
        state["model_recommendations"] = model_agent.recommend(
            state["quality_analysis"]["stats"],
            state["task_analysis"],
            state["dataset_info"]["rows"],
        )

        # Convert numpy types in model recommendations
        if state["model_recommendations"]:
            state["model_recommendations"] = convert_numpy_types(
                state["model_recommendations"]
            )

        # Prepare final response
        result = {
            "success": True,
            "dataset_info": state["dataset_info"],
            "quality": state["quality_analysis"],
            "task": state["task_analysis"],
            "features": state["feature_suggestions"],
            "models": state["model_recommendations"],
            "pipeline_ready": True,
        }

        # Final conversion of all numpy types
        result = convert_numpy_types(result)

        return result

    except Exception as e:
        import traceback

        error_msg = f"Workflow error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)

        return {
            "success": False,
            "error": str(error_msg),
            "dataset_info": state.get("dataset_info", {}),
            "quality": convert_numpy_types(
                state.get("quality_analysis", {"issues": [], "stats": {}})
            ),
            "task": convert_numpy_types(state.get("task_analysis", {})),
            "features": [],
            "models": [],
        }


def convert_numpy_types(obj):
    """Convert numpy types to Python native types recursively"""
    if isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    elif isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif pd.isna(obj):
        return None
    elif hasattr(obj, "dtype") and np.issubdtype(obj.dtype, np.bool_):
        return bool(obj)
    else:
        return obj


# Alternative: LangGraph implementation (if you want to use the graph structure)
def create_analysis_graph():
    """Create a LangGraph workflow for dataset analysis"""

    def quality_node(state: AnalysisState) -> AnalysisState:
        """Run quality analysis"""
        try:
            agent = QualityAgent()
            state["quality_analysis"] = agent.analyze(state["data"], state["columns"])
        except Exception as e:
            state["error"] = f"Quality analysis failed: {str(e)}"
        return state

    def task_node(state: AnalysisState) -> AnalysisState:
        """Run task detection"""
        try:
            agent = TaskAgent()
            state["task_analysis"] = agent.detect(
                state["data"], state["columns"], state["quality_analysis"]["stats"]
            )

            # Override task type if provided
            if state["task_type"]:
                state["task_analysis"]["task_type"] = state["task_type"]
                state["task_analysis"]["confidence"] = 0.95
        except Exception as e:
            state["error"] = f"Task detection failed: {str(e)}"
        return state

    def feature_node(state: AnalysisState) -> AnalysisState:
        """Generate feature suggestions"""
        try:
            agent = FeatureAgent()
            state["feature_suggestions"] = agent.suggest(
                state["quality_analysis"]["stats"],
                state["columns"],
                state["task_analysis"].get("task_type"),
            )
        except Exception as e:
            state["error"] = f"Feature engineering failed: {str(e)}"
        return state

    def model_node(state: AnalysisState) -> AnalysisState:
        """Generate model recommendations"""
        try:
            agent = ModelAgent()
            state["model_recommendations"] = agent.recommend(
                state["quality_analysis"]["stats"],
                state["task_analysis"],
                len(state["data"]),
            )
        except Exception as e:
            state["error"] = f"Model recommendation failed: {str(e)}"
        return state

    # Create the graph
    workflow = StateGraph(AnalysisState)

    # Add nodes
    workflow.add_node("quality", quality_node)
    workflow.add_node("task", task_node)
    workflow.add_node("features", feature_node)
    workflow.add_node("models", model_node)

    # Add edges
    workflow.add_edge("quality", "task")
    workflow.add_edge("task", "features")
    workflow.add_edge("features", "models")
    workflow.add_edge("models", END)

    # Set entry point
    workflow.set_entry_point("quality")

    return workflow.compile()