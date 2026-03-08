"""
Career Intelligence Platform - Backend API
"""

import asyncio
import logging
import os
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.resume_parser import extract_text_from_pdf
from backend.models import AnalysisRequest, AnalysisResponse, CoverLetterRequest, CoverLetterResponse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Validate AI engine loads on startup."""
    logger.info("=" * 60)
    logger.info("Career Intelligence Platform Backend Starting...")
    logger.info("=" * 60)
    try:
        from backend.ai_engine import analyze_resume
        logger.info("AI Engine loaded successfully")
        logger.info("Ready to accept requests!")
        logger.info("=" * 60)
    except Exception as e:
        logger.error(f"Failed to load AI Engine: {e}")
        raise
    yield
    logger.info("Backend shutting down...")


app = FastAPI(
    title="Career Intelligence Platform API",
    description="AI-powered resume evaluation and career guidance",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins so Lovable and other frontends can connect
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions to prevent server crash."""
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "type": type(exc).__name__}
    )


@app.get("/")
def root():
    return RedirectResponse(url="/docs")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "career-intelligence-backend", "version": "1.0.0"}


@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """Parse PDF resume and extract text."""
    logger.info(f"Parsing resume: {file.filename}")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        logger.info(f"Resume parsed: {len(text)} characters")
        return {"filename": file.filename, "text": text}
    except Exception as e:
        logger.error(f"Failed to parse resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_endpoint(request: AnalysisRequest):
    """Analyze resume against target role using AI (30-60 seconds)."""
    from backend.ai_engine import analyze_resume

    role = request.target_role.role_title
    if request.target_role.level:
        role += f" ({request.target_role.level})"

    logger.info(f"ANALYSIS REQUEST | Role: {role} | Resume: {len(request.resume_text)} chars")

    try:
        # Run blocking AI call in a thread so it doesn't freeze the server
        result = await asyncio.to_thread(analyze_resume, request.resume_text, role)

        score = result.get('overall_fit', {}).get('overall_score', 'N/A')
        category = result.get('overall_fit', {}).get('fit_category', 'N/A')
        logger.info(f"ANALYSIS COMPLETE | Score: {score}/100 | Category: {category}")

        return result

    except Exception as e:
        logger.error(f"ANALYSIS FAILED | {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}. Server is still running."
        )


@app.post("/api/generate-email", response_model=CoverLetterResponse)
async def generate_email_endpoint(request: CoverLetterRequest):
    """Generate a cohesive cold email based on resume and job."""
    from backend.ai_engine import generate_cold_email
    
    logger.info(f"EMAIL GEN REQUEST | Job: {request.job_title} at {request.company_name}")
    
    try:
        email_body = await asyncio.to_thread(
            generate_cold_email,
            request.resume_text,
            request.job_title,
            request.company_name,
            request.job_description
        )
        return {"email_body": email_body}
    except Exception as e:
        logger.error(f"EMAIL GEN FAILED | {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Email generation failed: {str(e)}."
        )


# Run directly with: python -m backend.main
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
