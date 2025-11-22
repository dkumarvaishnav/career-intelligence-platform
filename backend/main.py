# backend/main.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Career Intelligence Platform API")

# --- Models ---
class Resume(BaseModel):
    name: str
    skills: list[str]

# --- Routes ---
@app.get("/")
def home():
    return {"message": "Career Intelligence Platform API is live 🚀"}

@app.post("/parse_resume/")
def parse_resume(resume: Resume):
    # Just a dummy response for now
    return {
        "name": resume.name,
        "skills": resume.skills,
        "parsed": True
    }

@app.get("/recommendations/")
def get_recommendations():
    # Dummy placeholder
    return {
        "recommendations": [
            {"title": "Data Scientist", "required_skills": ["Python", "ML", "SQL"]},
            {"title": "Backend Engineer", "required_skills": ["Python", "APIs", "Databases"]}
        ]
    }

@app.get("/skill_gap/")
def skill_gap():
    # Dummy placeholder
    return {
        "gaps": [
            {"skill": "Deep Learning", "current_level": "None", "required_level": "Intermediate"},
            {"skill": "SQL", "current_level": "Beginner", "required_level": "Advanced"}
        ]
    }
