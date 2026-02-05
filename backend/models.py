from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal


# --- Input Models ---

class RoleTarget(BaseModel):
    role_title: str
    description: Optional[str] = None
    level: Optional[str] = "Entry-Level"

class AnalysisRequest(BaseModel):
    resume_text: str
    target_role: RoleTarget


# --- Output Models (Comprehensive Hiring Report) ---

VALID_FIT_CATEGORIES = ["Strong Fit", "Near-Fit", "Partial Fit", "Not Ready Yet"]
VALID_EVIDENCE_TYPES = ["Project", "Deployment", "Tool Usage", "End-to-End Ownership"]
VALID_SEVERITIES = ["Low", "Medium", "High"]
VALID_ISSUE_TYPES = ["Lacks Depth", "No Proof", "Missing Metrics", "Needs Clarification", "Should Remove"]
VALID_VERDICTS = [
    "Ready to apply",
    "Apply after completing specific improvements",
    "Needs 3-6 months of focused work",
]


def _best_match(value: str, valid_options: list[str], default: str) -> str:
    """Find the closest match from valid options, or return default."""
    if value in valid_options:
        return value
    # Try case-insensitive match
    lower_map = {v.lower(): v for v in valid_options}
    if value.lower() in lower_map:
        return lower_map[value.lower()]
    # Try partial match (AI sometimes combines values with /)
    if '/' in value:
        first_part = value.split('/')[0].strip()
        return _best_match(first_part, valid_options, default)
    # Try substring match
    for option in valid_options:
        if option.lower() in value.lower() or value.lower() in option.lower():
            return option
    return default


class OverallFitSummary(BaseModel):
    """Section 1: Overall Fit Summary"""
    overall_score: int = Field(..., ge=0, le=100, description="Score from 0-100")
    fit_category: str = Field(..., description="Strong Fit, Near-Fit, Partial Fit, or Not Ready Yet")
    summary: str = Field(..., description="2-3 evidence-based sentences explaining the score")

    @field_validator('overall_score', mode='before')
    @classmethod
    def round_score(cls, v):
        if isinstance(v, float):
            return round(v)
        return v

    @field_validator('fit_category', mode='before')
    @classmethod
    def normalize_fit_category(cls, v):
        if isinstance(v, str):
            return _best_match(v, VALID_FIT_CATEGORIES, "Partial Fit")
        return v


class SkillScore(BaseModel):
    """Individual skill category score"""
    score: int = Field(..., ge=0, le=10, description="Score from 0-10")
    justification: str = Field(..., description="One-line justification tied to resume evidence")

    @field_validator('score', mode='before')
    @classmethod
    def round_score(cls, v):
        if isinstance(v, float):
            return round(v)
        return v


class SkillBreakdown(BaseModel):
    """Section 2: Skill Breakdown with scores"""
    programming_software_engineering: SkillScore
    machine_learning_foundations: SkillScore
    applied_ml_ai_projects: SkillScore
    mlops_cloud_readiness: SkillScore
    data_engineering_sql: SkillScore
    system_design_architecture: SkillScore
    communication_documentation: SkillScore


class DemonstratedWork(BaseModel):
    """Section 3: What the candidate has demonstrably done"""
    description: str = Field(..., description="Specific verifiable work item")
    evidence_type: str = Field(..., description="Project, Deployment, Tool Usage, or End-to-End Ownership")

    @field_validator('evidence_type', mode='before')
    @classmethod
    def normalize_evidence_type(cls, v):
        if isinstance(v, str):
            return _best_match(v, VALID_EVIDENCE_TYPES, "Project")
        return v


class DetectedGap(BaseModel):
    """Section 4: Detected gap with severity"""
    gap_name: str
    severity: str = Field(..., description="Low, Medium, or High")
    why_it_matters: str = Field(..., description="Why this gap matters in industry")
    missing_evidence: str = Field(..., description="What concrete evidence is missing")

    @field_validator('severity', mode='before')
    @classmethod
    def normalize_severity(cls, v):
        if isinstance(v, str):
            return _best_match(v, VALID_SEVERITIES, "Medium")
        return v


class ActionItem(BaseModel):
    """Section 5: Actionable improvement item"""
    gap_addressed: str = Field(..., description="Which gap this action addresses")
    what_to_build: str = Field(..., description="Exactly what should be built or refactored")
    project_scope: str = Field(..., description="Suggested project scope")
    success_outcome: str = Field(..., description="What outcome would satisfy a recruiter")


class ResumeRecommendation(BaseModel):
    """Section 6: Resume-level recommendation"""
    issue_type: str = Field(..., description="Lacks Depth, No Proof, Missing Metrics, Needs Clarification, or Should Remove")
    section_or_bullet: str = Field(..., description="Which section or bullet this applies to")
    recommendation: str = Field(..., description="Specific coaching feedback")

    @field_validator('issue_type', mode='before')
    @classmethod
    def normalize_issue_type(cls, v):
        if isinstance(v, str):
            return _best_match(v, VALID_ISSUE_TYPES, v)
        return v


class HiringVerdict(BaseModel):
    """Section 7: Final hiring readiness verdict"""
    is_hireable_now: bool
    verdict: str = Field(..., description="Hiring readiness verdict")
    minimum_bar_missing: Optional[str] = Field(None, description="What minimum bar is missing if not hireable")
    final_recommendation: str = Field(..., description="One clear sentence of advice")

    @field_validator('verdict', mode='before')
    @classmethod
    def normalize_verdict(cls, v):
        if isinstance(v, str):
            return _best_match(v, VALID_VERDICTS, v)
        return v


class AnalysisResponse(BaseModel):
    """Complete Hiring-Style Evaluation Report"""
    overall_fit: OverallFitSummary
    skill_breakdown: SkillBreakdown
    demonstrated_work: List[DemonstratedWork]
    detected_gaps: List[DetectedGap]
    action_plan: List[ActionItem]
    resume_recommendations: List[ResumeRecommendation]
    hiring_verdict: HiringVerdict
