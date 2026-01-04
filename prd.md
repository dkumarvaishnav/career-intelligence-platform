# Product Requirements Document (PRD)

## 1. App Overview & Objectives

### Product Vision
The AI-Driven Resume Intelligence and Career Guidance Platform is designed to help early-career professionals and final-year students in fast-changing technical fields gain **clear, explainable calibration** on their role readiness and a **prioritized path to improvement**.

The platform treats a resume not as a static document, but as a **semantic representation of a candidate’s skills, experience, and trajectory**, and evaluates it against **entry-level, real-world role expectations**.

Rather than predicting outcomes or scoring candidates, the system provides **diagnostic clarity** and **actionable guidance** that answers two core user questions:
1. *Which roles am I realistically ready for right now?*
2. *What exactly is blocking me from my target role, and what should I work on next?*

### Core Objectives
- Establish fair, explainable role readiness for early-career users
- Identify precise, role-specific blockers
- Translate diagnosis into a prioritized, achievable improvement plan
- Build user confidence through clarity, not false optimism or rejection

---

## 2. Target Audience

### Primary Users
- Final-year students and fresh graduates (0–3 years experience)
- Early-career professionals in tech, data, AI, and adjacent fields
- Users actively targeting a specific role and seeking validation or correction

### User Characteristics
- High ambition, low calibration
- Skill-heavy but poorly contextualized resumes
- Limited access to industry-quality feedback loops
- Sensitive to opaque judgments and generic advice

### Key User Need
**Calibration over aspiration** — users want to understand where they stand today and how to move forward with focus and confidence.

---

## 3. Core User Job-to-Be-Done

> **“I want to know which roles I am realistically ready for right now, and what exactly is blocking me from my target role.”**

This job-to-be-done anchors the entire product experience and prioritizes:
- Role readiness over role discovery
- Diagnosis over scoring
- Guided next steps over open-ended exploration

---

## 4. Core Product Flow (High-Level)

1. **User declares a target role**
2. **User uploads resume**
3. **System asks lightweight clarifying questions**
4. **System evaluates role readiness**
5. **System presents diagnostic breakdown**
6. **System delivers a prioritized, role-specific improvement plan**

This flow is focused, diagnostic, and intentionally non-exploratory by default.

---

## 5. Input Model & User Profile Definition

### Required Inputs
- Resume
- Declared target role

### Essential Augmentation
- Lightweight clarifying questions to validate and disambiguate resume claims, such as:
  - Which skills have been used in real projects?
  - Where were they applied (academic, internship, self-driven)?
  - What level best describes usage (basic, working, strong)?

### Optional Supporting Evidence
- Portfolio links, GitHub, project artifacts
- Treated as strengthening signals, not requirements

### Inputs Explicitly De-Emphasized
- Years of experience
- Job titles without context
- Prestige markers (institutions, brand names)
- Pure self-rated confidence scores

The system triangulates between resume claims, user clarifications, and available evidence to form fair, explainable judgments.

---

## 6. Role Readiness Framework

### Readiness Philosophy
Role readiness is a **multi-dimensional diagnostic**, not a single score or probability.

### Core Dimensions
1. **Core Skills Coverage**
   - Alignment with non-negotiable role skills
   - Highest-weight signal

2. **Skill Depth Over Breadth**
   - Meaningful application preferred over long shallow lists

3. **Applied Experience Signals**
   - Projects, internships, hands-on problem solving
   - Academic and self-driven work is valid if applied

4. **Entry-Level Role Expectations**
   - Benchmarked against junior/entry hiring standards only

5. **Trajectory Alignment**
   - Past experiences plausibly point toward the target role
   - Supporting signal, not a gatekeeper

### Readiness Outcomes
- Fit
- Near-fit
- Stretch

### Communication Style
- Diagnostic breakdown:
  - You meet X
  - You partially meet Y
  - You lack Z

Avoids opaque scoring or predictive language in user-facing outputs.

---

## 7. Improvement & Guidance Model

### Core Guidance Principle
**Diagnosis must immediately translate into direction.**

### Guidance Level
- **Action-pattern guidance (default)**

Each identified blocker maps to:
- 1–3 concrete action patterns
- Framed in outcomes, not activities

**Example:**
> “Build one project that answers business questions using joins, aggregations, and window functions on a real dataset.”

### Prioritization
- Blockers ranked by impact on role readiness
- Focused on moving the user between readiness tiers
- Designed for an 8–12 week improvement horizon

### Secondary (Optional) Guidance
- Resume reframing suggestions
- Role-adjacent alternatives already within reach
- Longer-term career planning

These are intentionally outside the core promise.

---

## 8. User Experience & Tone

### Experience Goals
- Focused and diagnostic
- Clear and educational
- Grounded, not judgmental
- Confidence-building through clarity

### Design Principles
- Target-role-first calibration
- Explainability over prediction
- Respect for user autonomy
- Lightweight onboarding

---

## 9. Security & Trust Considerations

- Transparent explanations for all judgments
- Clear communication of what inputs are used and why
- No black-box scoring
- Avoidance of prestige or brand bias
- Respect for user data and consent

---

## 10. Potential Challenges & Mitigations

### Resume Noise & Inflation
- Mitigated through clarifying questions and triangulation

### User Sensitivity to Negative Feedback
- Mitigated through diagnostic framing and improvement-oriented language

### Overreach into Content Marketplace
- Avoided by defaulting to action-pattern guidance, not resource linking

---

## 11. Future Expansion Possibilities

- Longitudinal tracking of readiness progression
- Dynamic role benchmarks as market expectations evolve
- Optional integrations with learning platforms (user-initiated)
- Employer-facing readiness signals (carefully scoped)

---

## 12. Definition of Success

The product succeeds if users:
- Understand where they stand today
- Trust the system’s reasoning
- Feel focused rather than overwhelmed
- Take concrete, targeted steps toward their target role

The platform’s value lies not in prediction, but in **calibration, clarity, and momentum**.

