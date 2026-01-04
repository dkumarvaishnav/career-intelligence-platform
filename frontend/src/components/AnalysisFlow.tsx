"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, ChevronRight, CheckCircle, AlertCircle, Loader2,
    Target, BarChart3, Briefcase, AlertTriangle, Lightbulb, FileText, Award
} from "lucide-react";

// --- Types matching new backend schema ---
interface SkillScore {
    score: number;
    justification: string;
}

interface SkillBreakdown {
    programming_software_engineering: SkillScore;
    machine_learning_foundations: SkillScore;
    applied_ml_ai_projects: SkillScore;
    mlops_cloud_readiness: SkillScore;
    data_engineering_sql: SkillScore;
    system_design_architecture: SkillScore;
    communication_documentation: SkillScore;
}

interface AnalysisResponse {
    overall_fit: {
        overall_score: number;
        fit_category: string;
        summary: string;
    };
    skill_breakdown: SkillBreakdown;
    demonstrated_work: { description: string; evidence_type: string }[];
    detected_gaps: { gap_name: string; severity: string; why_it_matters: string; missing_evidence: string }[];
    action_plan: { gap_addressed: string; what_to_build: string; project_scope: string; success_outcome: string }[];
    resume_recommendations: { issue_type: string; section_or_bullet: string; recommendation: string }[];
    hiring_verdict: {
        is_hireable_now: boolean;
        verdict: string;
        minimum_bar_missing: string | null;
        final_recommendation: string;
    };
}

// --- Utility ---
function getScoreColor(score: number): string {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    if (score >= 4) return "text-orange-400";
    return "text-red-400";
}

function getSeverityColor(severity: string): string {
    if (severity === "High") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (severity === "Medium") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

function getFitColor(category: string): string {
    if (category === "Strong Fit") return "text-green-400";
    if (category === "Near-Fit") return "text-yellow-400";
    if (category === "Partial Fit") return "text-orange-400";
    return "text-red-400";
}

const skillLabels: Record<keyof SkillBreakdown, string> = {
    programming_software_engineering: "Programming & Software Engineering",
    machine_learning_foundations: "Machine Learning Foundations",
    applied_ml_ai_projects: "Applied ML/AI Projects",
    mlops_cloud_readiness: "MLOps & Cloud Readiness",
    data_engineering_sql: "Data Engineering & SQL",
    system_design_architecture: "System Design & Architecture",
    communication_documentation: "Communication & Documentation"
};

export default function AnalysisFlow() {
    const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
    const [role, setRole] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const startAnalysis = async () => {
        if (!role || !file) return;
        setStep("analyzing");
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const parseRes = await fetch("http://localhost:8000/api/parse-resume", {
                method: "POST",
                body: formData,
            });

            if (!parseRes.ok) throw new Error("Failed to parse resume");
            const parseData = await parseRes.json();

            const analyzeRes = await fetch("http://localhost:8000/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resume_text: parseData.text,
                    target_role: { role_title: role }
                })
            });

            if (!analyzeRes.ok) throw new Error("Analysis failed. Backend error.");
            const analyzeData = await analyzeRes.json();

            setResult(analyzeData);
            setStep("result");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
            setStep("input");
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto min-h-[60vh] relative">
            <AnimatePresence mode="wait">

                {/* INPUT STEP */}
                {step === "input" && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="space-y-2 text-center mb-8">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                Start Calibration
                            </h2>
                            <p className="text-zinc-400">Upload your PDF and define your target.</p>
                        </div>

                        <div className="glass p-6 rounded-2xl space-y-4">
                            <label className="text-sm font-medium text-zinc-300">Target Role</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Senior Data Scientist"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div className="glass p-8 rounded-2xl border-dashed border-2 border-white/10 hover:border-primary/50 transition-all group cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center gap-4 text-zinc-400 group-hover:text-primary transition-colors">
                                <div className="p-4 rounded-full bg-white/5 group-hover:bg-primary/10">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-white group-hover:text-primary">
                                        {file ? file.name : "Drop resume PDF here"}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {file ? "Click to change" : "or click to browse"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={startAnalysis}
                            disabled={!role || !file}
                            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            Analyze Readiness <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* ANALYZING STEP */}
                {step === "analyzing" && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 gap-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-white">Analyzing Skills...</h3>
                            <p className="text-zinc-400">Comparing your profile against {role} standards.</p>
                        </div>
                    </motion.div>
                )}

                {/* RESULT STEP */}
                {step === "result" && result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Section 1: Overall Fit */}
                        <div className="glass p-8 rounded-2xl text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-4">
                                <Target className="w-4 h-4" />
                                Overall Fit Assessment
                            </div>
                            <div className="flex items-center justify-center gap-8 mb-4">
                                <div className="text-6xl font-bold text-white">
                                    {result.overall_fit.overall_score}
                                    <span className="text-2xl text-zinc-500">/100</span>
                                </div>
                                <div className={`text-3xl font-bold ${getFitColor(result.overall_fit.fit_category)}`}>
                                    {result.overall_fit.fit_category}
                                </div>
                            </div>
                            <p className="text-zinc-400 max-w-2xl mx-auto">{result.overall_fit.summary}</p>
                        </div>

                        {/* Section 2: Skill Breakdown */}
                        <div className="glass p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-semibold text-white">Skill Breakdown</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {(Object.entries(result.skill_breakdown) as [keyof SkillBreakdown, SkillScore][]).map(([key, skill]) => (
                                    <div key={key} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-white text-sm">{skillLabels[key]}</span>
                                            <span className={`text-xl font-bold ${getScoreColor(skill.score)}`}>
                                                {skill.score}/10
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${skill.score * 10}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-400">{skill.justification}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Section 3: Demonstrated Work */}
                            <div className="glass p-6 rounded-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <Briefcase className="w-5 h-5 text-green-400" />
                                    <h3 className="text-xl font-semibold text-white">Demonstrated Work</h3>
                                </div>
                                <div className="space-y-3">
                                    {result.demonstrated_work.map((work, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm text-white">{work.description}</p>
                                                    <span className="text-xs text-green-400">{work.evidence_type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 4: Detected Gaps */}
                            <div className="glass p-6 rounded-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                    <h3 className="text-xl font-semibold text-white">Detected Gaps</h3>
                                </div>
                                <div className="space-y-3">
                                    {result.detected_gaps.map((gap, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-white text-sm">{gap.gap_name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded border ${getSeverityColor(gap.severity)}`}>
                                                    {gap.severity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mb-1"><strong>Why it matters:</strong> {gap.why_it_matters}</p>
                                            <p className="text-xs text-zinc-500"><strong>Missing:</strong> {gap.missing_evidence}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Action Plan */}
                        <div className="glass p-6 rounded-2xl border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-semibold text-white">Action Plan</h3>
                            </div>
                            <div className="space-y-4">
                                {result.action_plan.map((item, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-primary mb-1">Addresses: {item.gap_addressed}</p>
                                                <h4 className="font-medium text-white mb-2">{item.what_to_build}</h4>
                                                <p className="text-sm text-zinc-400 mb-2"><strong>Scope:</strong> {item.project_scope}</p>
                                                <p className="text-sm text-green-400"><strong>Success:</strong> {item.success_outcome}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 6: Resume Recommendations */}
                        <div className="glass p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <h3 className="text-xl font-semibold text-white">Resume Recommendations</h3>
                            </div>
                            <div className="space-y-3">
                                {result.resume_recommendations.map((rec, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20 flex-shrink-0">
                                                {rec.issue_type}
                                            </span>
                                            <div>
                                                <p className="text-sm text-zinc-300 mb-1"><strong>{rec.section_or_bullet}</strong></p>
                                                <p className="text-sm text-zinc-400">{rec.recommendation}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 7: Hiring Verdict */}
                        <div className={`glass p-8 rounded-2xl text-center ${result.hiring_verdict.is_hireable_now ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Award className={`w-6 h-6 ${result.hiring_verdict.is_hireable_now ? 'text-green-400' : 'text-yellow-400'}`} />
                                <h3 className="text-xl font-semibold text-white">Hiring Verdict</h3>
                            </div>
                            <div className={`text-2xl font-bold mb-4 ${result.hiring_verdict.is_hireable_now ? 'text-green-400' : 'text-yellow-400'}`}>
                                {result.hiring_verdict.verdict}
                            </div>
                            {result.hiring_verdict.minimum_bar_missing && (
                                <p className="text-zinc-400 mb-4">
                                    <strong>Minimum bar missing:</strong> {result.hiring_verdict.minimum_bar_missing}
                                </p>
                            )}
                            <p className="text-lg text-white">{result.hiring_verdict.final_recommendation}</p>
                        </div>

                        <div className="flex justify-center pt-8">
                            <button
                                onClick={() => { setStep("input"); setResult(null); }}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                Start New Analysis
                            </button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
