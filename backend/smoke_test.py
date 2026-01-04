import httpx
import asyncio
import os

async def test_backend():
    print("Testing Career Intelligence Platform Backend...")
    
    # Create test resume text
    test_resume = """
    John Doe
    Software Engineer | ML Enthusiast
    
    EXPERIENCE:
    ML Engineer Intern - TechCorp (6 months)
    - Built data processing pipelines for ML training datasets
    - Implemented image classification model using PyTorch
    - Deployed model to AWS SageMaker for inference
    
    PROJECTS:
    - Sentiment Analysis Tool: Built NLP classifier using BERT, achieved 92% accuracy
    - Data Pipeline: Created ETL pipeline using Apache Airflow
    
    SKILLS:
    Python, PyTorch, TensorFlow, SQL, Docker, AWS, Git
    
    EDUCATION:
    BS Computer Science - State University
    """

    url = "http://127.0.0.1:8000/api/analyze"
    print(f"Testing {url}...")
    
    async with httpx.AsyncClient() as client:
        payload = {
            "resume_text": test_resume,
            "target_role": {
                "role_title": "ML Engineer",
                "level": "Entry-Level"
            }
        }
        
        # Long timeout for LLM
        resp = await client.post(url, json=payload, timeout=120.0)
        
        if resp.status_code != 200:
            print(f"Failed: {resp.text}")
            return
        
        result = resp.json()
        print("\n" + "="*60)
        print("EVALUATION COMPLETE!")
        print("="*60)
        
        # Overall Fit
        fit = result['overall_fit']
        print(f"\n📊 OVERALL FIT: {fit['overall_score']}/100 - {fit['fit_category']}")
        print(f"   {fit['summary']}")
        
        # Skill Breakdown
        print(f"\n📈 SKILL BREAKDOWN:")
        for skill, data in result['skill_breakdown'].items():
            print(f"   {skill}: {data['score']}/10")
        
        # Demonstrated Work
        print(f"\n✅ DEMONSTRATED WORK: {len(result['demonstrated_work'])} items")
        
        # Gaps
        print(f"\n⚠️  DETECTED GAPS: {len(result['detected_gaps'])} gaps")
        for gap in result['detected_gaps']:
            print(f"   - {gap['gap_name']} [{gap['severity']}]")
        
        # Action Plan
        print(f"\n💡 ACTION PLAN: {len(result['action_plan'])} items")
        
        # Hiring Verdict
        verdict = result['hiring_verdict']
        print(f"\n🎯 HIRING VERDICT: {verdict['verdict']}")
        print(f"   Hireable now: {verdict['is_hireable_now']}")
        print(f"   {verdict['final_recommendation']}")

if __name__ == "__main__":
    asyncio.run(test_backend())
