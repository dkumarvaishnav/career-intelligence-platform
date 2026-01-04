from pydantic import BaseModel, Field
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

class OverallFitSummary(BaseModel):
    """Section 1: Overall Fit Summary"""
    overall_score: int = Field(..., ge=0, le=100, description="Score from 0-100")
    fit_category: Literal["Strong Fit", "Near-Fit", "Partial Fit", "Not Ready Yet"]
    summary: str = Field(..., description="2-3 evidence-based sentences explaining the score")

class SkillScore(BaseModel):
    """Individual skill category score"""
    score: int = Field(..., ge=0, le=10, description="Score from 0-10")
    justification: str = Field(..., description="One-line justification tied to resume evidence")

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
    evidence_type: Literal["Project", "Deployment", "Tool Usage", "End-to-End Ownership"]

class DetectedGap(BaseModel):
    """Section 4: Detected gap with severity"""
    gap_name: str
    severity: Literal["Low", "Medium", "High"]
    why_it_matters: str = Field(..., description="Why this gap matters in industry")
    missing_evidence: str = Field(..., description="What concrete evidence is missing")

class ActionItem(BaseModel):
    """Section 5: Actionable improvement item"""
    gap_addressed: str = Field(..., description="Which gap this action addresses")
    what_to_build: str = Field(..., description="Exactly what should be built or refactored")
    project_scope: str = Field(..., description="Suggested project scope")
    success_outcome: str = Field(..., description="What outcome would satisfy a recruiter")

class ResumeRecommendation(BaseModel):
    """Section 6: Resume-level recommendation"""
    issue_type: Literal["Lacks Depth", "No Proof", "Missing Metrics", "Needs Clarification", "Should Remove"]
    section_or_bullet: str = Field(..., description="Which section or bullet this applies to")
    recommendation: str = Field(..., description="Specific coaching feedback")

class HiringVerdict(BaseModel):
    """Section 7: Final hiring readiness verdict"""
    is_hireable_now: bool
    verdict: Literal["Ready to apply", "Apply after completing specific improvements", "Needs 3-6 months of focused work"]
    minimum_bar_missing: Optional[str] = Field(None, description="What minimum bar is missing if not hireable")
    final_recommendation: str = Field(..., description="One clear sentence of advice")

class AnalysisResponse(BaseModel):
    """Complete Hiring-Style Evaluation Report"""
    overall_fit: OverallFitSummary
    skill_breakdown: SkillBreakdown
    demonstrated_work: List[DemonstratedWork]
    detected_gaps: List[DetectedGap]
    action_plan: List[ActionItem]
    resume_recommendations: List[ResumeRecommendation]
    hiring_verdict: HiringVerdict


# Legacy models for backward compatibility (can be removed later)
class Gap(BaseModel):
    name: str
    status: Literal["Missing", "Partial", "Weak Application"]
    description: str

class ReadinessAssessment(BaseModel):
    tier: Literal["Fit", "Near-fit", "Stretch"]
    summary: str
    core_gaps: List[Gap]
