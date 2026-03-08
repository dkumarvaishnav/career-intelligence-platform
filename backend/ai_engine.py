import os
import time
import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
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
    temperature=0,  # Changed to 0 for deterministic evaluation
    convert_system_message_to_human=True
)

# ===========================================================================================
# COMPREHENSIVE SYSTEM PROMPT FOR CONSISTENT, ROLE-APPROPRIATE RESUME EVALUATION
# ===========================================================================================
# This prompt implements the evaluation framework from the PRD with:
# - Two-phase evaluation: (1) Define role requirements → (2) Evaluate against requirements
# - Consistent rubric tied to PRD's 5 readiness dimensions
# - Deterministic scoring with explicit criteria
# - Role-appropriate assessment (not resume quality in isolation)
# ===========================================================================================

ANALYSIS_PROMPT = """
You are an AI-Driven Resume Intelligence Engine designed to provide diagnostic, explainable role readiness assessments.

CORE MISSION:
Evaluate a resume against ACTUAL entry-level role requirements to answer:
1. Is this candidate ready for {target_role}?
2. What specific skills/experience are blocking them?
3. What should they build next to become ready?

TARGET ROLE: {target_role}
RESUME CONTENT:
{resume_text}

===========================================================================================
PHASE 1: DEFINE ROLE REQUIREMENTS (INTERNAL - NOT IN OUTPUT)
===========================================================================================

Before evaluating, YOU MUST first internally define what {target_role} at entry-level requires:

1. CORE TECHNICAL SKILLS (3-5 non-negotiable skills)
   Example for "Machine Learning Engineer": Python, ML frameworks (scikit-learn/PyTorch/TensorFlow),
   supervised/unsupervised learning, model evaluation, data preprocessing

2. APPLIED EXPERIENCE EXPECTATIONS (What projects/work should they have done?)
   Example: "Built 2-3 end-to-end ML projects with real datasets, deployed at least one model,
   demonstrated understanding of training/validation/testing split"

3. DEPTH INDICATORS (What separates surface knowledge from working proficiency?)
   Example: "Can explain why they chose a specific algorithm, handled class imbalance,
   optimized hyperparameters, evaluated with appropriate metrics"

4. ENTRY-LEVEL BARS (What can we NOT expect from 0-2 years experience?)
   Example: "NOT expected: distributed training, advanced MLOps, research publications,
   leading architecture decisions"

5. TRAJECTORY SIGNALS (What past experiences make this role plausible?)
   Example: "CS/STEM degree OR self-taught with strong portfolio, internships in related field,
   consistent technical project history"

PERFORM THIS ROLE DEFINITION NOW. Use your knowledge of industry hiring standards for entry-level {target_role}.

===========================================================================================
PHASE 2: EVALUATE RESUME AGAINST ROLE REQUIREMENTS
===========================================================================================

Now evaluate the resume using these 5 READINESS DIMENSIONS (from PRD):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 1: CORE SKILLS COVERAGE (Highest Weight - 35% of overall score)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How many of the role's non-negotiable skills does the candidate demonstrate?

SCORING RUBRIC:
- 90-100: Has ALL core skills with strong evidence of application
- 75-89:  Has MOST core skills (80%+) with good evidence
- 60-74:  Has SOME core skills (60-79%) with decent evidence
- 40-59:  Has FEW core skills (40-59%) or weak evidence
- 0-39:   Missing MOST core skills (<40%) or no evidence

EVIDENCE RULES:
✓ Certifications ≠ applied skill (contributes max 10% to coverage)
✓ Listing tools ≠ mastery (must show usage context)
✓ Academic projects count ONLY if depth/complexity shown
✓ Self-taught + portfolio = valid IF projects demonstrate skill

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 2: SKILL DEPTH OVER BREADTH (Weight: 25% of overall score)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Do they understand WHY and HOW, not just WHAT?

DEPTH INDICATORS:
✓ Explains problem-solving decisions (why this approach?)
✓ Shows understanding of trade-offs
✓ Demonstrates debugging/iteration/optimization
✓ Goes beyond tutorials (custom implementations, adaptations)

SCORING RUBRIC:
- 90-100: Strong depth in 3+ skills with clear problem-solving evidence
- 75-89:  Good depth in 2-3 skills with some decision-making shown
- 60-74:  Surface depth in most skills, tutorial-level work
- 40-59:  Shallow understanding, mostly tool usage without context
- 0-39:   No depth demonstrated, just lists skills/tools

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 3: APPLIED EXPERIENCE SIGNALS (Weight: 25% of overall score)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Have they built things and solved real problems?

VALID EXPERIENCE TYPES:
✓ Internships (industry context)
✓ Academic projects (if substantial & well-documented)
✓ Personal projects (if complete & demonstrates ownership)
✓ Open source contributions (if meaningful, not just docs)
✓ Freelance/contract work

SCORING RUBRIC:
- 90-100: 3+ substantial projects/experiences, at least 1 end-to-end ownership
- 75-89:  2-3 solid projects with clear outcomes/learnings
- 60-74:  1-2 projects OR several small projects without depth
- 40-59:  Only coursework/tutorials OR single shallow project
- 0-39:   No applied experience, only theoretical knowledge

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 4: ENTRY-LEVEL EXPECTATIONS CALIBRATION (Weight: 10% of overall score)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Are they positioned appropriately for entry-level, or aiming too high/low?

ENTRY-LEVEL REALITY CHECK:
✓ Strong fundamentals > advanced specialization
✓ Learning ability > extensive experience
✓ 2-3 solid projects > 10 shallow ones
✓ Clear skill application > long tool lists

SCORING RUBRIC:
- 90-100: Well-calibrated for entry-level, realistic positioning
- 75-89:  Mostly appropriate, minor over/under-claiming
- 60-74:  Some misalignment (either inflated claims or underselling)
- 40-59:  Significant misalignment with entry-level expectations
- 0-39:   Completely misaligned (too junior OR overqualified narrative)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 5: TRAJECTORY ALIGNMENT (Weight: 5% of overall score)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Does their past work plausibly lead to this role?

TRAJECTORY SIGNALS:
✓ Consistent technical focus over time
✓ Progressive skill building (each project builds on last)
✓ Relevant domain exposure (e.g., data work → ML role)

SCORING RUBRIC:
- 90-100: Clear, logical path to this role
- 75-89:  Mostly relevant trajectory with some alignment
- 60-74:  Partial relevance, some skill transfer possible
- 40-59:  Weak alignment, significant pivot required
- 0-39:   No clear connection to target role

===========================================================================================
OVERALL SCORE CALCULATION (WEIGHTED AVERAGE)
===========================================================================================

overall_score = (
    core_skills_coverage × 0.35 +
    skill_depth × 0.25 +
    applied_experience × 0.25 +
    entry_level_calibration × 0.10 +
    trajectory_alignment × 0.05
)

FIT CATEGORY MAPPING:
- 80-100: "Strong Fit" (ready to apply now)
- 65-79:  "Near-Fit" (1-2 focused improvements away)
- 45-64:  "Partial Fit" (needs 2-3 major improvements)
- 0-44:   "Not Ready Yet" (needs foundational work)

===========================================================================================
CRITICAL EVALUATION RULES
===========================================================================================

1. EVIDENCE-BASED ONLY: Do NOT hallucinate skills/experience not in resume
2. ROLE-SPECIFIC: Compare against {target_role} requirements, not generic resume quality
3. CONSISTENT RUBRIC: Use the exact score ranges defined above
4. DEPTH > BREADTH: Prefer 3 skills applied deeply over 10 listed shallowly
5. CONTEXT MATTERS: "Used Python" ≠ "Built production Python API with FastAPI"
6. HONEST GAPS: If core skill missing, score reflects this (don't be generous)
7. CONSTRUCTIVE TONE: Diagnostic, not judgmental. Focus on "what's next" not "what's wrong"

===========================================================================================
OUTPUT FORMAT
===========================================================================================

Generate a JSON response with this EXACT structure:

{{
  "overall_fit": {{
    "overall_score": <0-100>,  // Calculated using weighted dimensions above
    "fit_category": "Strong Fit" | "Near-Fit" | "Partial Fit" | "Not Ready Yet",
    "summary": "2-3 sentences: (1) What core requirements they meet, (2) What they're missing, (3) Overall readiness verdict"
  }},

  "skill_breakdown": {{
    // IMPORTANT: Evaluate these 7 dimensions against the ROLE REQUIREMENTS you defined in Phase 1
    // Each score (0-10) should reflect: Does the resume show evidence of this skill AT THE LEVEL needed for {target_role}?

    "programming_software_engineering": {{
      "score": <0-10>,  // 10=strong evidence of required programming skills, 0=no evidence
      "justification": "Evidence from resume + which required programming skills are met/missing"
    }},
    "machine_learning_foundations": {{
      "score": <0-10>,  // Adjust based on if role requires ML (score 0 if not ML role)
      "justification": "Which ML concepts from role requirements are demonstrated in resume"
    }},
    "applied_ml_ai_projects": {{
      "score": <0-10>,  // Quality of ML project work relative to role needs
      "justification": "Compare resume's ML projects against entry-level expectations for {target_role}"
    }},
    "mlops_cloud_readiness": {{
      "score": <0-10>,  // Deployment, cloud, production skills if role requires
      "justification": "Evidence of deployment/production experience vs. role requirements"
    }},
    "data_engineering_sql": {{
      "score": <0-10>,  // SQL, data pipelines, ETL if role requires
      "justification": "Data engineering skills shown vs. needed for {target_role}"
    }},
    "system_design_architecture": {{
      "score": <0-10>,  // Architecture understanding appropriate for entry-level
      "justification": "Evidence of system design thinking vs. entry-level role expectations"
    }},
    "communication_documentation": {{
      "score": <0-10>,  // Documentation, technical writing, presentation
      "justification": "How well candidate communicates technical work in resume"
    }}
  }},
  
  "demonstrated_work": [
    {{
      "description": "Specific verifiable work item that ALIGNS with {target_role} requirements",
      "evidence_type": "Project" | "Deployment" | "Tool Usage" | "End-to-End Ownership"
    }}
    // Include 3-5 items that best demonstrate role-relevant skills
    // ONLY include work with clear evidence in resume (no assumptions)
  ],

  "detected_gaps": [
    {{
      "gap_name": "Specific skill/experience from role requirements that's missing",
      "severity": "High" | "Medium" | "Low",
      // High = core requirement missing, Medium = important but not critical, Low = nice-to-have
      "why_it_matters": "Why this specific gap blocks readiness for {target_role}",
      "missing_evidence": "What concrete evidence from role requirements is absent in resume"
    }}
    // Focus on gaps that matter for {target_role} specifically
    // Prioritize High/Medium severity gaps (these should appear in action_plan)
  ],

  "action_plan": [
    {{
      "gap_addressed": "Which gap from detected_gaps this addresses",
      "what_to_build": "Specific build-oriented project that demonstrates the missing skill",
      "project_scope": "Concrete scope: dataset size, features, timeline (aim for 2-4 week projects)",
      "success_outcome": "What outcome would prove readiness: 'Built X that does Y, demonstrating Z skill'",
      "resources": []  // Leave this empty
    }}
    // Prioritize by impact on overall_score (address High severity gaps first)
    // Focus on moving candidate from current fit_category to next tier
    // Each action should address 1-2 gaps and be achievable in 8-12 week horizon
  ],

  "resume_recommendations": [
    {{
      "issue_type": "Lacks Depth" | "No Proof" | "Missing Metrics" | "Needs Clarification" | "Should Remove",
      "section_or_bullet": "Specific section or bullet point in resume",
      "recommendation": "How to rewrite/improve to better show role-relevant skills"
    }}
    // Focus on improvements that would increase role readiness perception
    // Prioritize bullets that claim skills without showing application
  ],

  "hiring_verdict": {{
    "is_hireable_now": true | false,
    // true if overall_score >= 80 AND no High-severity gaps in core requirements
    "verdict": "Ready to apply" | "Apply after completing specific improvements" | "Needs 3-6 months of focused work",
    "minimum_bar_missing": "If not hireable: which core requirement from Phase 1 is missing (null if hireable)",
    "final_recommendation": "One sentence: Next step to move toward {target_role} readiness"
  }}
}}

===========================================================================================
CONSISTENCY GUIDELINES FOR DETERMINISTIC EVALUATION
===========================================================================================

To ensure the SAME resume + SAME role = SAME score:

1. ALWAYS define role requirements in Phase 1 before scoring
2. USE EXACT rubric thresholds (e.g., 90-100 = ALL core skills, not "most")
3. WEIGHT dimensions consistently (35%, 25%, 25%, 10%, 5%)
4. COUNT skills systematically (don't subjectively judge "enough")
5. MAP fit_category strictly by overall_score ranges
6. ANCHOR gaps to role requirements defined in Phase 1, not general weaknesses

EXAMPLE CONSISTENCY CHECK:
- Resume shows Python, scikit-learn, 2 ML projects with model evaluation
- Role requires: Python, ML frameworks, model evaluation, 2-3 projects
- Core Skills Coverage: 90/100 (has all required skills)
- This should ALWAYS score 90, not vary between 75-92

===========================================================================================
FINAL INSTRUCTIONS
===========================================================================================

1. Perform Phase 1 role definition (internal, not in output)
2. Evaluate resume using 5 dimensions with rubrics
3. Calculate weighted overall_score
4. Generate complete JSON following structure above
5. Ensure all string fields contain substantive, role-specific content
6. Use diagnostic tone: "You have X, you're missing Y, build Z next"

BEGIN EVALUATION NOW.
"""


def _fix_field_typos(data: dict) -> dict:
    """Fix common field name typos in AI output."""
    # Known typos the AI makes
    FIELD_FIXES = {
        "why_it_matter": "why_it_matters",
        "gap_name_": "gap_name",
        "evidence_types": "evidence_type",
        "is_hireable": "is_hireable_now",
    }

    if isinstance(data, dict):
        fixed = {}
        for key, value in data.items():
            new_key = FIELD_FIXES.get(key, key)
            fixed[new_key] = _fix_field_typos(value)
        return fixed
    elif isinstance(data, list):
        return [_fix_field_typos(item) for item in data]
    return data


def fetch_resources_for_actions(action_items: list) -> list:
    """Fetch real-world resources for action items using Serper.dev."""
    serper_api_key = os.getenv("SERPER_API_KEY")
    if not serper_api_key:
        print("SERPER_API_KEY not found. Skipping resource fetch.")
        return action_items

    for item in action_items:
        query = f"how to {item.get('what_to_build', '')} tutorial OR course OR guide"
        try:
            response = httpx.post(
                "https://google.serper.dev/search",
                headers={
                    "X-API-KEY": serper_api_key,
                    "Content-Type": "application/json"
                },
                json={"q": query, "num": 3},
                timeout=8.0
            )
            data = response.json()
            organic_results = data.get("organic", [])[:3]
            resources = []
            
            for res in organic_results:
                link = res.get("link", "")
                title = res.get("title", "")
                
                # Determine type based on URL
                doc_type = "Article"
                if "youtube.com" in link or "youtu.be" in link:
                    doc_type = "Video"
                elif "coursera.org" in link or "udemy.com" in link or "edx.org" in link:
                    doc_type = "Course"
                elif "github.com" in link:
                    doc_type = "GitHub"
                
                resources.append({
                    "title": title,
                    "link": link,
                    "type": doc_type
                })
                
            item["resources"] = resources
            
        except Exception as e:
            print(f"Error fetching resources for query '{query}': {e}")
            item["resources"] = []
            
    return action_items


def fetch_jobs_for_role(target_role: str) -> list:
    """Fetch real-world jobs using Serper.dev, filtered for India or Remote."""
    serper_api_key = os.getenv("SERPER_API_KEY")
    if not serper_api_key:
        print("SERPER_API_KEY not found. Skipping job fetch.")
        return []

    query = f'"{target_role}" ("India" OR "Remote") (site:boards.greenhouse.io OR site:jobs.lever.co OR site:boards.ashbyhq.com OR site:wellfound.com OR site:naukri.com)'
    try:
        response = httpx.post(
            "https://google.serper.dev/search",
            headers={
                "X-API-KEY": serper_api_key,
                "Content-Type": "application/json"
            },
            json={"q": query, "num": 5, "gl": "in"},
            timeout=8.0
        )
        data = response.json()
        organic_results = data.get("organic", [])[:5]
        jobs = []
        
        for res in organic_results:
            link = res.get("link", "")
            title = res.get("title", "")
            snippet = res.get("snippet", "")
            
            # Simple heuristic for extraction
            company = "Company"
            if " - " in title:
                parts = title.split(" - ")
                if len(parts) > 1:
                    company = parts[-1].strip()
                    title = "-".join(parts[:-1]).strip()
            elif " at " in title:
                parts = title.split(" at ")
                if len(parts) > 1:
                    company = parts[1].strip()
                    title = parts[0].strip()
                    
            location = "India / Remote"
            
            jobs.append({
                "title": title,
                "company": company,
                "location": location,
                "link": link,
                "snippet": snippet
            })
            
        return jobs
    except Exception as e:
        print(f"Error fetching jobs for query '{query}': {e}")
        return []

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
            
            fixed_result = _fix_field_typos(result)
            
            if "action_plan" in fixed_result and fixed_result["action_plan"]:
                fixed_result["action_plan"] = fetch_resources_for_actions(fixed_result["action_plan"])

            if "recommended_jobs" not in fixed_result or not fixed_result["recommended_jobs"]:
                fixed_result["recommended_jobs"] = fetch_jobs_for_role(target_role)
                
            return fixed_result
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

COLD_EMAIL_PROMPT = """
You are an expert career coach and technical recruiter.
Write a concise, compelling cold outreach email / cover letter for the candidate applying to the following job:
Company: {company_name}
Job Title: {job_title}
Job Snippet/Description: {job_description}

Here is the candidate's parsed resume:
{resume_text}

Rules:
1. Keep it under 200 words.
2. Start with a strong hook about why the candidate is a fit for this specific role at {company_name}.
3. Highlight 2-3 specific technical achievements from the resume that directly map to the job snippet provided.
4. End with a soft call to action.
5. Do NOT hallucinate skills or experience the candidate does not have.
6. The tone should be professional, confident, and enthusiastic but NOT desperate.

Output ONLY the email body as plain text. Do NOT include JSON, do NOT include markdown code blocks, just the text. Use placeholders like [Your Name] if you can't find it in the resume text.
"""

def generate_cold_email(resume_text: str, job_title: str, company_name: str, job_description: str) -> str:
    """
    Generates a personalized cold email for a specific job using the candidate's resume.
    """
    prompt = ChatPromptTemplate.from_template(COLD_EMAIL_PROMPT)
    chain = prompt | llm | StrOutputParser()
    
    try:
        result = chain.invoke({
            "resume_text": resume_text,
            "job_title": job_title,
            "company_name": company_name,
            "job_description": job_description
        })
        return result
    except Exception as e:
        print(f"Error generating cold email: {e}")
        raise e

