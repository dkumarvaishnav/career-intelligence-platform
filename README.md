# Career Intelligence Platform

AI-powered platform for:
- Resume parsing
- Skill gap analysis
- Skill ontology visualization
- Course recommendation system

---

## 1. Prerequisites

- Python 3.10+ (recommended)
- Git

---

## 2. Project Setup (Run these commands one by one)

```bash
# 1. Clone the repository
git clone [https://github.com/dkumarvaishnav/career-intelligence-platform.git](https://github.com/dkumarvaishnav/career-intelligence-platform.git)
cd career-intelligence-platform

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# (Windows PowerShell)
venv\Scripts\activate
# (Linux/Mac)
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt
```

## 2.1. Install spaCy model (needed for resume parsing)

```bash
python -m spacy download en_core_web_sm
```

---

## 3. Run the App

```bash
streamlit run app.py
```

Then open browser: [http://localhost:8501](http://localhost:8501/)

---

## 4. Git Workflow (Team)

```bash
# Get latest changes
git pull origin main

# Add your work
git add .

# Commit your work
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

---

## 5. Updating Dependencies

Whenever you install a new Python library:

```bash
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Updated dependencies"
git push origin main
```