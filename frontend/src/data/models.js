import {
  FlowerIcon,
  Leaf,
  LeafIcon,
  SproutIcon,
  TreesIcon,
} from "lucide-react";

export const icons = {
  regression: SproutIcon,
  classification: FlowerIcon,
  clustering: TreesIcon,
  ensemble: TreesIcon,
  neural: LeafIcon,
};

export const colors = {
  regression: "from-emerald-400 to-teal-500",
  classification: "from-violet-400 to-purple-500",
  clustering: "from-fuchsia-400 to-pink-500",
  ensemble: "from-amber-400 to-orange-500",
  neural: "from-rose-400 to-pink-500",
};

export const models = [
  {
    id: 1,
    name: "Linear Regression",
    library: "sklearn",
    description:
      "Predict continuous values using linear relationships between variables. Ideal for forecasting and trend analysis.",
    category: "regression",
    trainingTime: "Fast",
    useCases: ["Sales forecasting", "Price prediction", "Trend analysis"],
    slug: "linear-regression",
    howItWorks:
      "Linear regression models the relationship between a dependent variable and one or more independent variables using a linear approach.",
    bestFor: [
      "Predicting continuous values",
      "Forecasting trends",
      "Understanding relationships between variables",
    ],
    icon: Leaf,
    class:
      "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center",
  },
  {
    id: 2,
    name: "Logistic Regression",
    library: "sklearn",
    description:
      "Classify data points using logistic function for binary and multi-class classification problems.",
    category: "classification",
    trainingTime: "Fast",
    useCases: ["Spam detection", "Customer churn", "Medical diagnosis"],
    slug: "logistic-regression",
    howItWorks:
      "Logistic regression uses a logistic function to model the probability of binary and multi-class classification outcomes.",
    bestFor: [
      "Binary classification",
      "Multi-class classification",
      "Probability estimation",
    ],
  },
  {
    id: 3,
    name: "Random Forest",
    library: "sklearn",
    description:
      "Ensemble learning method that combines multiple decision trees for improved accuracy and robustness.",
    category: "ensemble",
    trainingTime: "Medium",
    useCases: ["Credit scoring", "Fraud detection", "Feature importance"],
    slug: "random-forest",
    howItWorks:
      "Random Forest builds multiple decision trees on random subsets of data and combines their predictions for improved accuracy.",
    bestFor: [
      "Handling non-linear relationships",
      "Feature importance analysis",
      "Reducing overfitting",
    ],
  },
  {
    id: 4,
    name: "K-Means Clustering",
    library: "sklearn",
    description:
      "Unsupervised algorithm that groups similar data points into clusters based on feature similarity.",
    category: "clustering",
    trainingTime: "Fast",
    useCases: [
      "Customer segmentation",
      "Image compression",
      "Anomaly detection",
    ],
    slug: "k-means-clustering",
    howItWorks:
      "K-Means partitions data into k clusters by iteratively assigning points to nearest centroids and updating centroid positions.",
    bestFor: [
      "Unsupervised grouping",
      "Customer segmentation",
      "Data exploration",
    ],
  },
  {
    id: 5,
    name: "Neural Network",
    library: "tensorflow",
    description:
      "Deep learning model mimicking neural patterns to analyze complex botanical relationships.",
    category: "neural",
    trainingTime: "Slow",
    useCases: [
      "Image recognition",
      "Genetic pattern analysis",
      "Ecosystem modeling",
    ],
    slug: "neural-network",
    howItWorks:
      "Neural Networks consist of interconnected layers of neurons that learn complex patterns through backpropagation and gradient descent.",
    bestFor: [
      "Complex pattern recognition",
      "High-dimensional data",
      "Non-linear relationships",
    ],
  },
  {
    id: 6,
    name: "Decision Tree",
    library: "sklearn",
    description:
      "Hierarchical decision-making model branching like a tree to classify floral characteristics.",
    category: "classification",
    trainingTime: "Fast",
    useCases: [
      "Leaf classification",
      "Flower type prediction",
      "Growth stage decision",
    ],
    slug: "decision-tree",
    howItWorks:
      "Decision Trees recursively split data based on feature values to create a tree structure for classification or regression.",
    bestFor: [
      "Interpretable models",
      "Feature interactions",
      "Multi-class classification",
    ],
  },
  {
    id: 7,
    name: "Support Vector Machine (SVM)",
    library: "sklearn",
    description:
      "Supervised learning algorithm that finds the optimal hyperplane to separate classes in high-dimensional space.",
    category: "classification",
    trainingTime: "Medium",
    useCases: ["Image classification", "Text categorization", "Bioinformatics"],
    slug: "support-vector-machine",
    howItWorks:
      "SVM identifies the hyperplane that best separates classes by maximizing the margin between support vectors of different classes.",
    bestFor: [
      "High-dimensional datasets",
      "Binary and multi-class classification",
      "Cases with clear margins of separation",
    ],
  },
  {
    id: 8,
    name: "Gradient Boosting",
    library: "sklearn",
    description:
      "Ensemble technique that builds sequential models, each correcting errors of its predecessor for improved accuracy.",
    category: "ensemble",
    trainingTime: "Medium to Slow",
    useCases: [
      "Loan default prediction",
      "Sales forecasting",
      "Fraud detection",
    ],
    slug: "gradient-boosting",
    howItWorks:
      "Gradient Boosting builds multiple weak learners sequentially, where each new model reduces the residual errors of previous models.",
    bestFor: [
      "High accuracy prediction",
      "Structured/tabular data",
      "Handling non-linear relationships",
    ],
  },
  {
    id: 9,
    name: "Principal Component Analysis (PCA)",
    library: "sklearn",
    description:
      "Dimensionality reduction technique that transforms features into a set of uncorrelated components preserving maximum variance.",
    category: "dimensionality-reduction",
    trainingTime: "Fast",
    useCases: ["Data visualization", "Noise reduction", "Feature extraction"],
    slug: "principal-component-analysis",
    howItWorks:
      "PCA identifies the directions (principal components) that maximize the variance in data and projects the data onto these components.",
    bestFor: [
      "Reducing feature dimensionality",
      "Data compression",
      "Exploratory data analysis",
    ],
  },
  {
    id: 10,
    name: "K-Nearest Neighbors (KNN)",
    library: "sklearn",
    description:
      "Instance-based learning algorithm that predicts class or value based on the closest training examples in the feature space.",
    category: "classification",
    trainingTime: "Fast",
    useCases: [
      "Handwriting recognition",
      "Recommendation systems",
      "Medical diagnosis",
    ],
    slug: "k-nearest-neighbors",
    howItWorks:
      "KNN classifies new data points by looking at the 'k' closest neighbors and using majority voting (classification) or averaging (regression).",
    bestFor: [
      "Non-parametric problems",
      "Small datasets",
      "Pattern recognition",
    ],
  },
  {
    id: 11,
    name: "XGBoost",
    library: "xgboost",
    description:
      "Optimized gradient boosting library designed for speed and performance in structured/tabular datasets.",
    category: "ensemble",
    trainingTime: "Medium",
    useCases: ["Customer churn", "Fraud detection", "Sales prediction"],
    slug: "xgboost",
    howItWorks:
      "XGBoost builds additive models in a forward stage-wise fashion and optimizes for a differentiable loss function with regularization.",
    bestFor: [
      "Structured/tabular data",
      "High-performance prediction",
      "Competitions and large datasets",
    ],
  },
  {
    id: 12,
    name: "DBSCAN",
    library: "sklearn",
    description:
      "Density-based clustering algorithm that groups together points that are closely packed and marks outliers in low-density regions.",
    category: "clustering",
    trainingTime: "Fast",
    useCases: ["Anomaly detection", "Geospatial clustering", "Noise filtering"],
    slug: "dbscan",
    howItWorks:
      "DBSCAN expands clusters based on a density criterion, connecting points within a defined distance and marking low-density points as outliers.",
    bestFor: [
      "Arbitrary-shaped clusters",
      "Noise handling",
      "Unsupervised grouping",
    ],
  },
  {
    id: 13,
    name: "Ridge Regression",
    library: "sklearn",
    description:
      "Linear regression model with L2 regularization to prevent overfitting by penalizing large coefficients.",
    category: "regression",
    trainingTime: "Fast",
    useCases: [
      "Predicting house prices",
      "Sales forecasting",
      "Economic modeling",
    ],
    slug: "ridge-regression",
    howItWorks:
      "Ridge regression adds a penalty equal to the square of the magnitude of coefficients to the loss function, reducing model complexity.",
    bestFor: [
      "Handling multicollinearity",
      "Preventing overfitting in linear models",
      "High-dimensional datasets",
    ],
  },
  {
    id: 14,
    name: "Lasso Regression",
    library: "sklearn",
    description:
      "Linear regression model with L1 regularization that can shrink some coefficients to zero for feature selection.",
    category: "regression",
    trainingTime: "Fast",
    useCases: ["Feature selection", "Predicting sales", "Sparse datasets"],
    slug: "lasso-regression",
    howItWorks:
      "Lasso regression adds a penalty equal to the absolute value of coefficients to the loss function, forcing some coefficients to zero.",
    bestFor: [
      "Automatic feature selection",
      "High-dimensional data",
      "Reducing overfitting",
    ],
  },
  {
    id: 15,
    name: "Elastic Net",
    library: "sklearn",
    description:
      "Linear regression combining L1 and L2 regularization to balance feature selection and coefficient shrinkage.",
    category: "regression",
    trainingTime: "Fast",
    useCases: [
      "Predictive modeling with many features",
      "Financial forecasting",
      "Genomics data",
    ],
    slug: "elastic-net",
    howItWorks:
      "Elastic Net combines Lasso (L1) and Ridge (L2) penalties, allowing for both feature selection and coefficient shrinkage in regression.",
    bestFor: [
      "Datasets where Lasso or Ridge alone is insufficient",
      "Handling multicollinearity",
      "High-dimensional data",
    ],
  },
  {
    id: 16,
    name: "AdaBoost",
    library: "sklearn",
    description:
      "Ensemble learning method that combines multiple weak classifiers to create a strong classifier.",
    category: "ensemble",
    trainingTime: "Medium",
    useCases: [
      "Spam detection",
      "Fraud detection",
      "Customer churn prediction",
    ],
    slug: "adaboost",
    howItWorks:
      "AdaBoost trains weak learners sequentially, with each focusing more on the mistakes of the previous, and combines them into a weighted sum for final prediction.",
    bestFor: [
      "Improving accuracy of simple models",
      "Binary classification problems",
      "Handling noisy datasets",
    ],
  },
  {
    id: 17,
    name: "LightGBM",
    library: "lightgbm",
    description:
      "Gradient boosting framework optimized for speed and efficiency, ideal for large datasets and high-performance tasks.",
    category: "ensemble",
    trainingTime: "Medium",
    useCases: ["Sales prediction", "Customer churn", "Fraud detection"],
    slug: "lightgbm",
    howItWorks:
      "LightGBM builds decision trees leaf-wise instead of level-wise and uses histogram-based algorithms for faster training and lower memory usage.",
    bestFor: [
      "Large structured datasets",
      "High-performance prediction tasks",
      "Competitive modeling and Kaggle competitions",
    ],
  },
];
