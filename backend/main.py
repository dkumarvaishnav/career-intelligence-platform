from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.resume_parser import extract_text_from_pdf
from backend.models import AnalysisRequest, AnalysisResponse # Import models to validate schema early

app = FastAPI(title="Career Intelligence Platform API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev resilience (VS Code ports, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def read_root():
    return {"status": "ok", "service": "career-intelligence-backend"}

@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        return {"filename": file.filename, "text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from backend.ai_engine import analyze_resume

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_endpoint(request: AnalysisRequest):
    """
    Analyzes the resume text against the target role.
    """
    try:
        # Pass just the role title for now, or expand logic to use description
        role = request.target_role.role_title
        if request.target_role.level:
            role += f" ({request.target_role.level})"
            
        return analyze_resume(request.resume_text, role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
