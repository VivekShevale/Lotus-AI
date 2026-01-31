# 🌸 Lotus AI - Intelligent ML Model Cultivation Platform

An AI-powered machine learning platform that combines automated dataset analysis, intelligent model recommendations, and seamless model training with a beautiful, intuitive interface.

## 🎯 Overview

Lotus AI is a full-stack application designed to democratize machine learning by providing:

- **📊 Intelligent Dataset Analysis** - AI agents analyze your data quality, detect task types, and extract features
- **🤖 Smart Model Recommendations** - Get personalized ML algorithm suggestions based on your dataset
- **🌱 Model Cultivation** - Train, evaluate, and deploy 20+ machine learning algorithms
- **🔮 Predictions** - Make predictions on new data using trained models
- **📈 Advanced Analytics** - PCA, feature importance, residual analysis, and more
- **💼 Resume Analysis** - AI-powered resume-to-job matching with skill gap analysis

## 📦 Tech Stack

### Backend
- **Framework**: Flask
- **Workflow**: LangGraph (AI agents orchestration)
- **ML/Data**: scikit-learn, pandas, numpy, TensorFlow
- **Storage**: S3 (via R2/Cloudflare)
- **Database**: SQL
- **Deployment**: Vercel

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux
- **Charting**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 16+
Python 3.8+
pip & npm
```

### Backend Setup

1. **Clone and navigate**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment** (`.flaskenv`)
```env
FLASK_ENV=development
FLASK_APP=run.py
R2_ACCESS_KEY=your_key
R2_SECRET_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_ENDPOINT_URL=your_endpoint
```

5. **Run migrations**
```bash
python -m migrations.create_ml_models_table
```

6. **Start server**
```bash
python run.py
# Server runs on http://localhost:5000
```

### Frontend Setup

1. **Navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API** (`src/configs/api.js`)
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
export default API_BASE_URL;
```

4. **Start development server**
```bash
npm run dev
# Opens on http://localhost:5173
```

## 📂 Project Structure

### Backend Architecture

```
backend/
├── app/
│   ├── agents/                 # AI agents for analysis
│   │   ├── quality_agent.py   # Data quality analysis
│   │   ├── task_agent.py      # Task type detection
│   │   ├── feature_agent.py   # Feature engineering suggestions
│   │   └── model_agent.py     # Model recommendations
│   │
│   ├── controllers/           # Business logic
│   │   ├── ml_controller.py   # ML model training
│   │   ├── data_controller.py # Data processing
│   │   ├── clean_controller.py# Data cleaning
│   │   └── auth_controller.py # Authentication
│   │
│   ├── routes/                # API endpoints
│   │   ├── ml_routes.py       # Model training endpoints
│   │   ├── analyze_routes.py  # Analysis endpoints
│   │   ├── data_routes.py     # Data management
│   │   └── model_routes.py    # Model endpoints
│   │
│   ├── services/              # ML algorithms
│   │   ├── ml_service.py      # Core ML models
│   │   ├── clean_service.py   # Data cleaning
│   │   ├── image_classifier.py# CNN models
│   │   └── neural_services.py # Neural networks
│   │
│   ├── database/              # Database layer
│   │   └── sql_db.py         # SQL operations
│   │
│   ├── models/                # Data models
│   │   ├── user.py           # User model
│   │   └── ml_model.py       # ML model storage
│   │
│   ├── langgraph_workflow.py  # Multi-agent workflow
│   └── config.py              # Configuration
│
├── trained_models/            # Saved model files
├── migrations/                # Database migrations
├── requirements.txt           # Python dependencies
└── run.py                     # Application entry point
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx               # Landing page
│   │   ├── DataUpload.jsx         # Data upload & analysis
│   │   ├── ModelTraining.jsx      # Model training hub
│   │   ├── Models.jsx             # Model showcase
│   │   ├── Workflow.jsx           # Workflow builder
│   │   ├── Resume.jsx             # Resume analyzer
│   │   ├── Layout.jsx             # App layout
│   │   └── Neural.jsx             # Neural network training
│   │
│   ├── components/
│   │   ├── DataAnalyzer.jsx       # Dataset analysis UI
│   │   ├── PredictPage.jsx        # Prediction interface
│   │   ├── MyModelsPage.jsx       # Model management
│   │   │
│   │   ├── [Algorithm]/           # Algorithm-specific components
│   │   │   ├── LinearRegression/
│   │   │   ├── LogisticRegression/
│   │   │   ├── SVM/
│   │   │   ├── DecisionTree/
│   │   │   ├── RandomForest/
│   │   │   ├── AdaBoost/
│   │   │   ├── GradientBoosting/
│   │   │   ├── Ridge/
│   │   │   ├── Lasso/
│   │   │   ├── ElasticNet/
│   │   │   ├── KNN/
│   │   │   ├── PCA/
│   │   │   └── ImageClassification/
│   │
│   ├── configs/
│   │   └── api.js              # API configuration
│   │
│   ├── data/
│   │   └── models.js           # Model metadata
│   │
│   ├── features/
│   │   └── themeSlice.js       # Redux theme state
│   │
│   ├── App.jsx                 # Root component
│   └── main.jsx                # Entry point
│
└── package.json
```

## 🎮 Key Features

### 1. **Dataset Analysis** (`/analyze`)
- **Quality Agent**: Missing values, duplicates, outliers detection
- **Task Agent**: Auto-detects classification vs regression
- **Feature Agent**: Suggests feature engineering techniques
- **Model Agent**: Recommends 5-8 best algorithms with scores

```python
# Example: analyze_dataset_workflow()
# Returns: dataset_info, quality_analysis, task_analysis, 
#          feature_suggestions, model_recommendations
```

### 2. **Model Training**
Supports 20+ algorithms across categories:

#### **Regression** (7)
- Linear Regression
- Ridge Regression
- Lasso Regression
- ElasticNet
- Neural Network Regressor

#### **Classification** (9)
- Logistic Regression
- SVM (Support Vector Machine)
- Decision Tree
- Random Forest
- AdaBoost
- Gradient Boosting
- KNN (K-Nearest Neighbors)

#### **Dimensionality Reduction** (1)
- Principal Component Analysis (PCA)

#### **Deep Learning** (3)
- CNN Image Classifier
- Neural Network (Custom)
- Transfer Learning

### 3. **Model Evaluation**

**Regression Metrics**:
- R² Score, RMSE, MAE, MSE
- Residual analysis
- Coefficient analysis
- Learning curves

**Classification Metrics**:
- Accuracy, Precision, Recall, F1-Score
- Confusion Matrix
- ROC-AUC Curve
- Class distribution

### 4. **Prediction Interface**
- Upload new data
- Auto-validates required features
- Batch predictions with CSV export
- Confidence intervals

### 5. **Resume Analysis**
- 4-Agent system: Parser → JD Analyzer → Skill Gap → ATS Scorer
- TF-IDF + Cosine Similarity for semantic matching
- Personalized learning roadmap
- 50+ skill categories

## 🔌 API Endpoints

### Analysis
```
POST /api/analyze
  - Upload dataset for analysis
  - Returns: quality score, task type, feature suggestions, model recommendations

POST /api/generate_pipeline
  - Generate ML pipeline Python code based on analysis
```

### Model Training
```
POST /api/train/<algorithm>
  - Train specific ML model
  - Returns: model metrics, performance stats

GET /api/models
  - Retrieve all user models

POST /api/predict/<model_id>
  - Make predictions with trained model
```

### Data Management
```
POST /api/clean
  - Clean and preprocess data

GET /api/dataset/<dataset_id>
  - Get dataset information
```

## 📊 Supported Algorithms

### Regression (Continuous Prediction)
| Algorithm | Best For | Hyperparameters |
|-----------|----------|-----------------|
| Linear | Simple relationships | None |
| Ridge | Collinear features | alpha |
| Lasso | Feature selection | alpha |
| ElasticNet | Mixed regularization | alpha, l1_ratio |
| Neural | Complex patterns | layers, units, dropout |

### Classification (Category Prediction)
| Algorithm | Best For | Hyperparameters |
|-----------|----------|-----------------|
| Logistic | Binary/multiclass | C, solver |
| SVM | High-dimensional | C, kernel, gamma |
| Decision Tree | Interpretability | max_depth, min_samples |
| Random Forest | Balanced accuracy | n_estimators, max_depth |
| AdaBoost | Weak learners | n_estimators, learning_rate |
| Gradient Boosting | Max accuracy | n_estimators, learning_rate |
| KNN | Local patterns | n_neighbors, metric |

## 🧠 AI Agents Architecture

### 1. **Quality Agent** (`QualityAgent`)
```python
# Analyzes data quality
- Missing value percentage
- Duplicate rows
- Outlier detection
- Data type validation
- Statistical summaries
```

### 2. **Task Agent** (`TaskAgent`)
```python
# Detects ML task type
- Classification vs Regression
- Multi-class vs Binary
- Imbalance detection
- Target column identification
- Confidence scoring
```

### 3. **Feature Agent** (`FeatureAgent`)
```python
# Suggests feature engineering
- Polynomial features
- Feature scaling
- Encoding recommendations
- Interaction terms
- Dimensionality reduction
```

### 4. **Model Agent** (`ModelAgent`)
```python
# Recommends best algorithms
- Scores each algorithm
- Considers data characteristics
- Provides ranking with reasoning
- Suggests hyperparameters
```

## 🎨 UI Components

### Pages
- **Home** - Landing page with feature showcase
- **DataUpload** - Dataset analysis and exploration
- **ModelTraining** - Algorithm selection and training
- **Models** - Algorithm catalog
- **MyModels** - Trained models management
- **Workflow** - Visual workflow builder
- **Resume** - Resume-to-job analyzer
- **Neural** - Deep learning model builder

### Components
- **DataAnalyzer** - Multi-agent analysis visualization
- **PredictPage** - Prediction interface
- **RightComponent** - Results and metrics display
- **[Algorithm]Form/Result** - Algorithm-specific UI

## 📈 Data Visualization

Uses **Recharts** for interactive charts:
- **Line Charts**: Training curves, trends
- **Bar Charts**: Feature importance, metrics comparison
- **Pie Charts**: Class distribution
- **Scatter Plots**: Predictions vs Actual
- **Heatmaps**: Confusion matrices, correlations

## 🔒 Security Features

- User authentication & authorization
- Secure file upload validation
- API rate limiting
- Environment variable protection
- Input sanitization
- CORS configuration

## 🚀 Deployment

### Backend (Vercel)
```bash
vercel deploy --prod
```
See `.vercelignore` for excluded files.

### Frontend (Vercel)
```bash
npm run build
vercel deploy --prod
```

## 📚 Dependencies

### Python (`requirements.txt`)
```
flask
pandas
numpy
scikit-learn
tensorflow
torch
langgraph
python-dotenv
boto3
```

### Node.js (`package.json`)
```
react
react-router-dom
redux
tailwindcss
recharts
lucide-react
axios
vite
```

## 🔧 Configuration

### Backend Config (`app/config.py`)
- Database connection
- File upload settings
- ML model parameters
- API rate limits

### Frontend Config (`src/configs/api.js`)
- API base URL
- Request timeout
- Error handling

## 📝 Environment Variables

### Backend (.flaskenv)
```env
FLASK_ENV=development
FLASK_APP=run.py
R2_ACCESS_KEY=xxxxx
R2_SECRET_KEY=xxxxx
R2_BUCKET_NAME=models
R2_ENDPOINT_URL=https://xxx.r2.cloudflarestorage.com
DATABASE_URL=postgresql://user:pass@localhost/lotus_ai
SECRET_KEY=your_secret_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Lotus AI
```

## 🧪 Testing

```bash
# Backend
python -m pytest tests/

# Frontend
npm run test
```

## 📖 API Documentation

### Request Format
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: multipart/form-data" \
  -F "file=@dataset.csv"
```

### Response Format
```json
{
  "dataset_info": {
    "rows": 1000,
    "columns": 15,
    "headers": ["col1", "col2", ...]
  },
  "task_analysis": {
    "task_type": "classification",
    "target_column": "target",
    "confidence": 0.95
  },
  "quality_analysis": {
    "quality_score": 78,
    "issues": [...]
  },
  "model_recommendations": [
    {
      "name": "Random Forest",
      "score": 0.92,
      "reason": "..."
    }
  ]
}
```

## 🎓 Usage Examples

### Example 1: Train a Linear Regression Model
```javascript
// Frontend
const response = await fetch('/api/train/linear-regression', {
  method: 'POST',
  body: FormData with file + hyperparameters
});
const result = await response.json();
// result contains: r2, rmse, mae, coefficients
```

### Example 2: Make Predictions
```javascript
const predictions = await fetch('/api/predict/model-123', {
  method: 'POST',
  body: JSON.stringify(newData)
});
```

### Example 3: Analyze Resume
```javascript
// Uses offline NLP + TF-IDF
const analysis = analyzeResume(resumeText, jobDescription);
// Returns: skill gap, ATS score, learning roadmap
```

## 🐛 Troubleshooting

### Backend Issues
```bash
# Port already in use
lsof -i :5000
kill -9 <PID>

# Module not found
pip install --upgrade -r requirements.txt

# Database connection error
Check DATABASE_URL in .flaskenv
```

### Frontend Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Port conflict
npm run dev -- --port 3000
```

## 📊 Project Statistics

- **20+** Algorithms
- **50+** ML/Data Science Libraries
- **100+** UI Components
- **4** AI Agents
- **15+** Visualization Types

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙋 Support

- **Documentation**: See `/docs`
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@lotus-ai.com

## 🌟 Features Roadmap

- [ ] Real-time model monitoring
- [ ] Automated feature engineering pipeline
- [ ] Hyperparameter optimization (Optuna)
- [ ] Model explainability (SHAP, LIME)
- [ ] Ensemble model creation
- [ ] Model versioning & rollback
- [ ] A/B testing framework
- [ ] Multi-GPU training support
- [ ] AutoML capabilities
- [ ] Mobile app

## 📈 Performance Metrics

- **Analysis Time**: < 30s for 10K rows
- **Training Time**: 
  - Linear: < 5s
  - Tree-based: 10-30s
  - Neural Networks: 1-5 min
- **Prediction Latency**: < 100ms per sample
- **API Response Time**: < 1s

## 🔗 Related Resources

- [scikit-learn Documentation](https://scikit-learn.org/)
- [TensorFlow Guide](https://www.tensorflow.org/)
- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Made with 🌸 by Lotus AI Team**

Last Updated: 2025
Version: 1.0.0
