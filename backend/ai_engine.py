import os
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from backend.models import AnalysisResponse

# Load API Key
from dotenv import load_dotenv
import pathlib

env_path = pathlib.Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError(f"GOOGLE_API_KEY not found. Checked: {env_path}")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.1,
    convert_system_message_to_human=True 
)

# Comprehensive Hiring Evaluation Prompt
ANALYSIS_PROMPT = """
You are a Senior AI/ML Hiring Manager conducting a comprehensive resume evaluation.
You are NOT a chat assistant. You are an evaluation engine in a product pipeline.
The resume is already provided. Produce a COMPLETE evaluation report.

TARGET ROLE: {target_role}

RESUME CONTENT:
{resume_text}

---

EVALUATION RULES:
- Certifications ≠ applied skill
- Listing tools ≠ mastery  
- Academic projects count only if depth is shown
- Be honest, firm, and constructive
- Do NOT hallucinate experience
- Do NOT assume skills not evidenced

---

Generate a JSON response with this EXACT structure:

{{
  "overall_fit": {{
    "overall_score": <0-100>,
    "fit_category": "Strong Fit" | "Near-Fit" | "Partial Fit" | "Not Ready Yet",
    "summary": "2-3 evidence-based sentences explaining the score"
  }},
  
  "skill_breakdown": {{
    "programming_software_engineering": {{
      "score": <0-10>,
      "justification": "One-line justification tied to resume evidence"
    }},
    "machine_learning_foundations": {{
      "score": <0-10>,
      "justification": "..."
    }},
    "applied_ml_ai_projects": {{
      "score": <0-10>,
      "justification": "..."
    }},
    "mlops_cloud_readiness": {{
      "score": <0-10>,
      "justification": "..."
    }},
    "data_engineering_sql": {{
      "score": <0-10>,
      "justification": "..."
    }},
    "system_design_architecture": {{
      "score": <0-10>,                                                                                                                                                                                                                                                                                                                          
      "justification": "..."
    }},
    "communication_documentation": {{
      "score": <0-10>,
      "justification": "..."
    }}
  }},
  
  "demonstrated_work": [
    {{
      "description": "Specific verifiable work the candidate has done",
      "evidence_type": "Project" | "Deployment" | "Tool Usage" | "End-to-End Ownership"
    }}
  ],
  
  "detected_gaps": [
    {{
      "gap_name": "Name of the gap",
      "severity": "Low" | "Medium" | "High",
      "why_it_matters": "Why this gap matters in industry",
      "missing_evidence": "What concrete evidence is missing"
    }}
  ],
  
  "action_plan": [
    {{
      "gap_addressed": "Which gap this addresses",
      "what_to_build": "Exactly what should be built or refactored",
      "project_scope": "Suggested project scope and timeline",
      "success_outcome": "What outcome would satisfy a recruiter"
    }}
  ],
  
  "resume_recommendations": [
    {{
      "issue_type": "Lacks Depth" | "No Proof" | "Missing Metrics" | "Needs Clarification" | "Should Remove",
      "section_or_bullet": "Which section or bullet this applies to",
      "recommendation": "Specific coaching feedback"
    }}
  ],
  
  "hiring_verdict": {{
    "is_hireable_now": true | false,
    "verdict": "Ready to apply" | "Apply after completing specific improvements" | "Needs 3-6 months of focused work",
    "minimum_bar_missing": "What minimum bar is missing (null if hireable)",
    "final_recommendation": "One clear sentence of advice"
  }}
}}

IMPORTANT:
- demonstrated_work: Include 3-5 items of ONLY verifiable work (no assumptions)
- detected_gaps: Include ALL Medium and High severity gaps
- action_plan: Provide build-oriented instructions for each Medium/High gap
- resume_recommendations: Be specific about which bullets/sections need improvement
- All string fields must be filled with substantive content
"""


def analyze_resume(resume_text: str, target_role: str, max_retries: int = 3) -> dict:
    """
    Analyzes resume text against target role using LLM.
    Returns a comprehensive hiring-style evaluation report.
    """
    parser = JsonOutputParser(pydantic_object=AnalysisResponse)
    prompt = ChatPromptTemplate.from_template(ANALYSIS_PROMPT)
    chain = prompt | llm | parser
    
    last_error = None
    for attempt in range(max_retries):
        try:
            result = chain.invoke({
                "resume_text": resume_text, 
                "target_role": target_role,
            })
            return result
        except Exception as e:
            last_error = e
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait_time = (2 ** attempt) * 5
                print(f"Rate limit hit (attempt {attempt + 1}/{max_retries}). Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"AI Error: {e}")
                raise e
    
    print(f"AI Error after {max_retries} retries: {last_error}")
    raise last_error
