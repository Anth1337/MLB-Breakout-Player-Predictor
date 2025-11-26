# MLB-Breakout-Player-Predictor

# MLB Breakout Predictor

A full-stack web application that predicts which MLB and minor league players have the potential to break out as star performers, using advanced baseball statistics and machine learning.

## 📊 Project Overview

This project combines data engineering, machine learning, and web development to create an interactive platform for identifying baseball's next breakout stars. By analyzing advanced metrics from Baseball Savant and Baseball Reference, the system provides probability-based predictions with interpretable insights.

### Core Components

- **Data Pipeline**: Automated scraping and processing of baseball statistics
- **ML Model**: Ensemble-based prediction system for player breakout potential
- **Web Interface**: Interactive dashboard for exploring predictions and player insights
- **Backend API**: RESTful service for predictions and data management

## 🎯 Features

- **Player Search & Discovery**: Find players by name, position, age, level, or team
- **Breakout Predictions**: Probability-based forecasts with confidence intervals
- **Player Profiles**: Comprehensive stat pages with trends and visualizations
- **Interpretable AI**: SHAP values showing which features drive each prediction
- **Historical Comparisons**: Similar player analysis from past breakouts
- **Real-time Updates**: Daily prediction refreshes during the season
- **Multiple Breakout Tiers**: Star, above-average, and solid contributor categories

## 🏗️ Architecture

```
┌─────────────────┐
│   Web Frontend  │
│   (React + TS)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│ (Flask/FastAPI) │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│   ML   │ │PostgreSQL│
│ Model  │ │ Database │
└────────┘ └──────────┘
         ▲
         │
┌─────────────────┐
│ Data Scraping   │
│    Pipeline     │
└─────────────────┘
```

## 📁 Project Structure

```
mlb-breakout-predictor/
├── data/
│   ├── raw/                    # Raw scraped data
│   ├── processed/              # Cleaned and transformed data
│   └── models/                 # Trained ML models
├── scraping/
│   ├── baseball_savant.py      # Statcast data scraper
│   ├── baseball_reference.py   # Baseball Reference scraper
│   └── utils.py                # Scraping utilities
├── preprocessing/
│   ├── clean_data.py           # Data cleaning functions
│   ├── feature_engineering.py  # Feature creation
│   └── validation.py           # Data validation
├── modeling/
│   ├── train.py                # Model training pipeline
│   ├── evaluate.py             # Model evaluation
│   ├── predict.py              # Prediction functions
│   └── interpretability.py     # SHAP and feature importance
├── backend/
│   ├── app.py                  # Flask/FastAPI application
│   ├── routes/                 # API endpoints
│   ├── database/               # Database models and queries
│   └── config.py               # Configuration
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   └── utils/              # Utility functions
│   └── public/                 # Static assets
├── tests/                      # Unit and integration tests
├── notebooks/                  # Jupyter notebooks for EDA
├── requirements.txt            # Python dependencies
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/mlb-breakout-predictor.git
cd mlb-breakout-predictor
```

2. **Set up Python environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

5. **Set up the database**
```bash
createdb mlb_breakout
python backend/database/init_db.py
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
python app.py
# API will run on http://localhost:5000
```

2. **Start the frontend development server**
```bash
cd frontend
npm start
# App will open on http://localhost:3000
```

3. **Run the data pipeline** (separate terminal)
```bash
python scraping/run_pipeline.py
```

## 📊 Data Collection

### Data Sources

**Baseball Savant** (Statcast metrics):
- Exit velocity, launch angle, barrel rate
- Sprint speed, hard hit percentage
- Expected stats (xwOBA, xBA, xSLG)

**Baseball Reference**:
- Traditional statistics (AVG, OPS, ERA, WHIP)
- Historical performance across all levels
- Minor league statistics

### Scraping Guidelines

- Respects `robots.txt` on both sites
- Implements 2-3 second delays between requests
- Includes retry logic with exponential backoff
- Caches data to minimize redundant requests
- Logs all scraping activity

### Data Update Schedule

- **Daily**: Current season player statistics
- **Weekly**: Minor league statistics
- **Monthly**: Historical data validation

## 🤖 Machine Learning Model

### Breakout Definition

A player "breaks out" when they achieve one of the following:

- **Tier 1 (Star)**: Reaches top 10% in position-specific metrics
- **Tier 2 (Above-Average)**: Reaches top 30% in position-specific metrics  
- **Tier 3 (Solid Contributor)**: 20%+ improvement in key performance metrics

### Features

**Player Development Indicators**:
- Year-over-year improvement rates
- Age-adjusted performance metrics
- Level-adjusted statistics (AAA vs MLB)
- Consistency metrics across recent games

**Statcast-Based Features**:
- Quality of contact trends
- Expected vs actual stats differential
- Plate discipline improvements
- Physical tools (sprint speed, exit velocity)

**Historical Patterns**:
- Similar player trajectories
- Career development curves

### Model Architecture

Ensemble approach combining:
- **XGBoost**: Primary model for tabular data
- **Random Forest**: Feature importance validation
- **Logistic Regression**: Interpretable baseline

### Training Details

- **Training period**: 2015-2023 historical data
- **Validation strategy**: Time-based split (no future data leakage)
- **Class imbalance**: SMOTE oversampling + class weights
- **Hyperparameter tuning**: Optuna-based optimization

### Evaluation Metrics

- **Precision/Recall**: Balancing false positives vs missed breakouts
- **ROC-AUC**: Overall discrimination ability
- **Calibration**: Probability accuracy assessment
- **Top-K Accuracy**: Are actual breakouts in top predictions?

## 🌐 API Documentation

### Endpoints

#### Get Player Prediction
```
GET /api/player/{player_id}/prediction
```
Returns breakout probability and supporting metrics for a specific player.

#### Search Players
```
GET /api/players/search?name={name}&position={position}&min_probability={threshold}
```
Search and filter players by various criteria.

#### Top Breakout Candidates
```
GET /api/breakouts/top?limit={n}&tier={tier}
```
Retrieve the top N players by breakout probability.

#### Player Profile
```
GET /api/player/{player_id}/profile
```
Complete player statistics, trends, and historical data.

#### Similar Players
```
GET /api/player/{player_id}/similar?limit={n}
```
Find historically similar players who broke out.

### Response Format

```json
{
  "player_id": "123456",
  "name": "John Doe",
  "breakout_probability": 0.73,
  "confidence_interval": [0.65, 0.81],
  "tier_probabilities": {
    "star": 0.15,
    "above_average": 0.35,
    "solid": 0.23
  },
  "key_factors": [
    {"feature": "exit_velocity_improvement", "impact": 0.23},
    {"feature": "age_adjusted_ops", "impact": 0.18}
  ],
  "similar_players": [
    {"name": "Historical Player", "similarity": 0.89}
  ]
}
```

## 📈 Model Interpretability

### SHAP Values
Each prediction includes SHAP (SHapley Additive exPlanations) values showing:
- Which features contributed most to the prediction
- Direction of impact (positive or negative)
- Magnitude of each feature's contribution

### Feature Importance
Global feature importance rankings across all predictions to understand:
- Which metrics are most predictive overall
- Position-specific importance patterns
- How feature importance has evolved over time

### Counterfactual Analysis
"What-if" scenarios showing:
- "If exit velocity improved by 2 mph, probability would increase to X%"
- Required improvements to reach different breakout tiers
- Comparison of improvement paths

## 🧪 Testing

### Run all tests
```bash
pytest tests/
```

### Run specific test suites
```bash
pytest tests/test_scraping.py
pytest tests/test_model.py
pytest tests/test_api.py
```

### Coverage report
```bash
pytest --cov=. --cov-report=html
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Create new project on Railway/Render
2. Connect GitHub repository
3. Configure environment variables
4. Deploy from main branch

### Frontend Deployment (Vercel/Netlify)

1. Connect repository to Vercel/Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build/`
4. Configure environment variables
5. Deploy

### Database Setup (Production)

1. Provision PostgreSQL instance
2. Run migration scripts
3. Set up automated backups
4. Configure connection pooling

## 📊 Project Timeline

- **Weeks 1-2**: Data collection pipeline and database setup
- **Weeks 3-4**: Data cleaning, EDA, and feature engineering
- **Weeks 5-6**: Model development and evaluation
- **Weeks 7-8**: Backend API development
- **Weeks 9-10**: Frontend development
- **Week 11**: Integration and testing
- **Week 12**: Deployment and documentation

## 🛠️ Technology Stack

### Backend
- **Language**: Python 3.9+
- **Framework**: Flask or FastAPI
- **ML Libraries**: scikit-learn, XGBoost, LightGBM, SHAP
- **Data Processing**: pandas, NumPy
- **Scraping**: BeautifulSoup, Scrapy, requests
- **Database**: PostgreSQL, SQLAlchemy

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts or Chart.js
- **State Management**: React Context/Redux
- **HTTP Client**: Axios

### DevOps
- **Version Control**: Git, GitHub
- **CI/CD**: GitHub Actions
- **Containerization**: Docker (optional)
- **Monitoring**: Sentry (error tracking)

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mlb_breakout

# API Keys (if needed)
BASEBALL_REFERENCE_API_KEY=your_key_here

# Flask/FastAPI
SECRET_KEY=your_secret_key
DEBUG=False

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/TypeScript
- Write tests for new features
- Update documentation as needed

## 📚 Resources

### Baseball Analytics
- [FanGraphs Library](https://library.fangraphs.com/)
- "The Book: Playing the Percentages in Baseball" by Tom Tango
- [Baseball Prospectus](https://www.baseballprospectus.com/)

### Machine Learning
- [scikit-learn Documentation](https://scikit-learn.org/)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [SHAP Documentation](https://shap.readthedocs.io/)

### Web Development
- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## ⚠️ Known Issues & Limitations

1. **Minor League Data**: Limited Statcast data availability for minor leaguers
2. **Sample Size**: Young players with minimal MLB experience have wider confidence intervals
3. **Context Changes**: Model may not fully account for team/position changes
4. **Concept Drift**: Baseball evolves; model requires periodic retraining
5. **Rate Limiting**: Aggressive scraping may result in temporary blocks

## 🔮 Future Enhancements

- [ ] Add injury risk prediction
- [ ] Incorporate defensive metrics
- [ ] Real-time game-by-game updates
- [ ] Mobile app development
- [ ] Fantasy baseball integration
- [ ] Automated scouting report generation
- [ ] Multi-language support
- [ ] Public API with rate limiting
- [ ] Pitcher-specific breakout models
- [ ] Trade impact analysis

## 🙏 Acknowledgments

- Baseball Savant for Statcast data
- Baseball Reference for comprehensive statistics
- The baseball analytics community for research and insights
- Open source contributors to the libraries used in this project


Project Link: [https://github.com/yourusername/mlb-breakout-predictor](https://github.com/yourusername/mlb-breakout-predictor)

---

**Note**: This project is for educational and research purposes. Always respect website terms of service and rate limits when scraping data.
