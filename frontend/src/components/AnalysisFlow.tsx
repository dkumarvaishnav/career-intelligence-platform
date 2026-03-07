"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Upload, ChevronRight, CheckCircle, AlertCircle, Loader2,
    Target, BarChart3, Briefcase, AlertTriangle, Lightbulb, FileText, Award,
    Sparkles, TrendingUp, Shield, Zap, ArrowRight, RefreshCw
} from "lucide-react";

// --- API Configuration ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    action_plan: { gap_addressed: string; what_to_build: string; project_scope: string; success_outcome: string; resources?: { title: string; link: string; type: string; }[] }[];
    resume_recommendations: { issue_type: string; section_or_bullet: string; recommendation: string }[];
    hiring_verdict: {
        is_hireable_now: boolean;
        verdict: string;
        minimum_bar_missing: string | null;
        final_recommendation: string;
    };
}

// --- Tab Types ---
type TabId = "summary" | "skills" | "experience" | "gaps" | "action" | "resume";

interface Tab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    description: string;
}

// --- Utility Functions ---
function getScoreColor(score: number): string {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    if (score >= 4) return "text-orange-400";
    return "text-rose-400";
}

function getScoreGradient(score: number): string {
    if (score >= 8) return "from-emerald-500 to-teal-500";
    if (score >= 6) return "from-amber-500 to-yellow-500";
    if (score >= 4) return "from-orange-500 to-amber-500";
    return "from-rose-500 to-red-500";
}

function getSeverityColor(severity: string): string {
    if (severity === "High") return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    if (severity === "Medium") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
}

function getSeverityGlow(severity: string): string {
    if (severity === "High") return "shadow-rose-500/20";
    if (severity === "Medium") return "shadow-amber-500/20";
    return "shadow-sky-500/20";
}

function getFitColor(category: string): string {
    if (category === "Strong Fit") return "text-emerald-400";
    if (category === "Near-Fit") return "text-amber-400";
    if (category === "Partial Fit") return "text-orange-400";
    return "text-rose-400";
}

function getFitGradient(category: string): string {
    if (category === "Strong Fit") return "from-emerald-500 to-teal-500";
    if (category === "Near-Fit") return "from-amber-500 to-yellow-500";
    if (category === "Partial Fit") return "from-orange-500 to-amber-500";
    return "from-rose-500 to-red-500";
}

const skillLabels: Record<keyof SkillBreakdown, { name: string; icon: string }> = {
    programming_software_engineering: { name: "Programming & Software Engineering", icon: "💻" },
    machine_learning_foundations: { name: "Machine Learning Foundations", icon: "🧠" },
    applied_ml_ai_projects: { name: "Applied ML/AI Projects", icon: "🚀" },
    mlops_cloud_readiness: { name: "MLOps & Cloud Readiness", icon: "☁️" },
    data_engineering_sql: { name: "Data Engineering & SQL", icon: "🗄️" },
    system_design_architecture: { name: "System Design & Architecture", icon: "🏗️" },
    communication_documentation: { name: "Communication & Documentation", icon: "📝" }
};

const tabs: Tab[] = [
    { id: "summary", label: "Summary", icon: <Target className="w-4 h-4" />, description: "Overall readiness assessment" },
    { id: "skills", label: "Skills", icon: <BarChart3 className="w-4 h-4" />, description: "Detailed skill breakdown" },
    { id: "experience", label: "Experience", icon: <Briefcase className="w-4 h-4" />, description: "Demonstrated work" },
    { id: "gaps", label: "Gaps", icon: <AlertTriangle className="w-4 h-4" />, description: "Areas for improvement" },
    { id: "action", label: "Action Plan", icon: <Lightbulb className="w-4 h-4" />, description: "Next steps" },
    { id: "resume", label: "Resume Tips", icon: <FileText className="w-4 h-4" />, description: "Document improvements" },
];

// --- Animation Variants ---
const tabContentVariants: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" as const } }
};

const staggerContainer: Variants = {
    animate: { transition: { staggerChildren: 0.05 } }
};

const staggerItem: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// --- Tab Content Components ---
function SummaryTab({ result }: { result: AnalysisResponse }) {
    const scorePercentage = result.overall_fit.overall_score;

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
            {/* Hero Score Section */}
            <motion.div variants={staggerItem} className="relative overflow-hidden rounded-3xl glass p-8 md:p-12">
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getFitGradient(result.overall_fit.fit_category)} opacity-10`} />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Score Circle */}
                    <div className="relative">
                        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                            <circle
                                cx="60" cy="60" r="52"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-white/10"
                            />
                            <motion.circle
                                cx="60" cy="60" r="52"
                                stroke="url(#scoreGradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${scorePercentage * 3.27} 327`}
                                initial={{ strokeDasharray: "0 327" }}
                                animate={{ strokeDasharray: `${scorePercentage * 3.27} 327` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" className={`${getFitColor(result.overall_fit.fit_category).replace('text-', 'stop-color-')}`} style={{ stopColor: result.overall_fit.fit_category === "Strong Fit" ? "#10b981" : result.overall_fit.fit_category === "Near-Fit" ? "#f59e0b" : result.overall_fit.fit_category === "Partial Fit" ? "#f97316" : "#f43f5e" }} />
                                    <stop offset="100%" className="text-primary" style={{ stopColor: "#6366f1" }} />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                className="text-5xl font-bold text-white"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                {scorePercentage}
                            </motion.span>
                            <span className="text-zinc-400 text-sm">/100</span>
                        </div>
                    </div>

                    {/* Fit Category & Summary */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getFitGradient(result.overall_fit.fit_category)} mb-4`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-white font-semibold">{result.overall_fit.fit_category}</span>
                        </motion.div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Role Readiness Assessment</h2>
                        <p className="text-zinc-300 text-lg leading-relaxed">{result.overall_fit.summary}</p>
                    </div>
                </div>
            </motion.div>

            {/* Hiring Verdict Card */}
            <motion.div
                variants={staggerItem}
                className={`rounded-3xl p-8 border-2 ${result.hiring_verdict.is_hireable_now
                    ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/30'
                    : 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30'}`}
            >
                <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-2xl ${result.hiring_verdict.is_hireable_now ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                        <Award className={`w-8 h-8 ${result.hiring_verdict.is_hireable_now ? 'text-emerald-400' : 'text-amber-400'}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Hiring Verdict</h3>
                        <p className={`text-2xl font-bold mb-4 ${result.hiring_verdict.is_hireable_now ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {result.hiring_verdict.verdict}
                        </p>
                        {result.hiring_verdict.minimum_bar_missing && (
                            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-black/20">
                                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-zinc-300 text-sm">
                                    <span className="text-amber-400 font-medium">Minimum bar missing:</span> {result.hiring_verdict.minimum_bar_missing}
                                </p>
                            </div>
                        )}
                        <p className="text-lg text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            {result.hiring_verdict.final_recommendation}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStat
                    icon={<BarChart3 className="w-5 h-5" />}
                    label="Skills Evaluated"
                    value="7"
                    color="text-primary"
                />
                <QuickStat
                    icon={<CheckCircle className="w-5 h-5" />}
                    label="Demonstrated Work"
                    value={result.demonstrated_work.length.toString()}
                    color="text-emerald-400"
                />
                <QuickStat
                    icon={<AlertTriangle className="w-5 h-5" />}
                    label="Gaps Identified"
                    value={result.detected_gaps.length.toString()}
                    color="text-amber-400"
                />
                <QuickStat
                    icon={<Lightbulb className="w-5 h-5" />}
                    label="Action Items"
                    value={result.action_plan.length.toString()}
                    color="text-cyan-400"
                />
            </motion.div>
        </motion.div>
    );
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div className="glass rounded-2xl p-5 text-center hover:scale-105 transition-transform duration-300">
            <div className={`inline-flex p-2 rounded-xl bg-white/5 ${color} mb-3`}>{icon}</div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-zinc-400">{label}</div>
        </div>
    );
}

function SkillsTab({ result }: { result: AnalysisResponse }) {
    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <motion.div variants={staggerItem} className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Skill Breakdown</h2>
                <p className="text-zinc-400 text-lg">Detailed assessment of your technical competencies</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5">
                {(Object.entries(result.skill_breakdown) as [keyof SkillBreakdown, SkillScore][]).map(([key, skill], index) => (
                    <motion.div
                        key={key}
                        variants={staggerItem}
                        custom={index}
                        className="glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">{skillLabels[key].icon}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-white text-sm group-hover:text-primary transition-colors">
                                        {skillLabels[key].name}
                                    </h3>
                                    <div className={`text-2xl font-bold ${getScoreColor(skill.score)}`}>
                                        {skill.score}<span className="text-sm text-zinc-500">/10</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-3">
                                    <motion.div
                                        className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(skill.score)}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.score * 10}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                                </div>

                                <p className="text-sm text-zinc-400 leading-relaxed">{skill.justification}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

function ExperienceTab({ result }: { result: AnalysisResponse }) {
    const evidenceTypeColors: Record<string, string> = {
        "Project": "bg-violet-500/20 text-violet-400 border-violet-500/30",
        "Deployment": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        "Tool Usage": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        "End-to-End Ownership": "bg-amber-500/20 text-amber-400 border-amber-500/30"
    };

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <motion.div variants={staggerItem} className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Demonstrated Work</h2>
                <p className="text-zinc-400 text-lg">Verified accomplishments from your resume</p>
            </motion.div>

            {result.demonstrated_work.length === 0 ? (
                <motion.div variants={staggerItem} className="glass rounded-2xl p-12 text-center">
                    <Briefcase className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No demonstrated work items found in your resume.</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {result.demonstrated_work.map((work, index) => (
                        <motion.div
                            key={index}
                            variants={staggerItem}
                            custom={index}
                            className="glass rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 border-l-4 border-emerald-500/50"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-emerald-500/10">
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-lg mb-3">{work.description}</p>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${evidenceTypeColors[work.evidence_type] || evidenceTypeColors["Project"]}`}>
                                        <TrendingUp className="w-3 h-3" />
                                        {work.evidence_type}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function GapsTab({ result }: { result: AnalysisResponse }) {
    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <motion.div variants={staggerItem} className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Detected Gaps</h2>
                <p className="text-zinc-400 text-lg">Areas requiring attention for your target role</p>
            </motion.div>

            {result.detected_gaps.length === 0 ? (
                <motion.div variants={staggerItem} className="glass rounded-2xl p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-400 font-medium">No significant gaps detected!</p>
                </motion.div>
            ) : (
                <div className="space-y-5">
                    {result.detected_gaps.map((gap, index) => (
                        <motion.div
                            key={index}
                            variants={staggerItem}
                            custom={index}
                            className={`glass rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 shadow-lg ${getSeverityGlow(gap.severity)}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${gap.severity === "High" ? "bg-rose-500/20" : gap.severity === "Medium" ? "bg-amber-500/20" : "bg-sky-500/20"}`}>
                                        <AlertTriangle className={`w-5 h-5 ${gap.severity === "High" ? "text-rose-400" : gap.severity === "Medium" ? "text-amber-400" : "text-sky-400"}`} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-white">{gap.gap_name}</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(gap.severity)}`}>
                                    {gap.severity} Priority
                                </span>
                            </div>

                            <div className="space-y-3 pl-12">
                                <div className="p-4 rounded-xl bg-white/5">
                                    <p className="text-sm text-zinc-300">
                                        <span className="text-amber-400 font-medium">Why it matters:</span> {gap.why_it_matters}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5">
                                    <p className="text-sm text-zinc-400">
                                        <span className="text-rose-400 font-medium">Missing evidence:</span> {gap.missing_evidence}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function ActionTab({ result }: { result: AnalysisResponse }) {
    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <motion.div variants={staggerItem} className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Action Plan</h2>
                <p className="text-zinc-400 text-lg">Prioritized steps to improve your role readiness</p>
            </motion.div>

            {result.action_plan.length === 0 ? (
                <motion.div variants={staggerItem} className="glass rounded-2xl p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-400 font-medium">You&apos;re in great shape! No immediate actions needed.</p>
                </motion.div>
            ) : (
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-cyan-500 to-emerald-500 hidden md:block" />

                    <div className="space-y-6">
                        {result.action_plan.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={staggerItem}
                                custom={index}
                                className="relative md:pl-20"
                            >
                                {/* Timeline Node */}
                                <div className="absolute left-4 top-8 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/30 hidden md:flex">
                                    {index + 1}
                                </div>

                                <div className="glass rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 border-l-4 border-primary/50 md:border-l-0">
                                    <div className="flex items-center gap-3 mb-4 md:hidden">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                                            Addresses: {item.gap_addressed}
                                        </span>
                                    </div>

                                    <div className="hidden md:block mb-3">
                                        <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                                            Addresses: {item.gap_addressed}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-primary" />
                                        {item.what_to_build}
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Project Scope</p>
                                            <p className="text-sm text-zinc-300">{item.project_scope}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Success Outcome</p>
                                            <p className="text-sm text-emerald-300">{item.success_outcome}</p>
                                        </div>
                                    </div>

                                    {item.resources && item.resources.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Recommended Resources</p>
                                            <div className="flex flex-col gap-2">
                                                {item.resources.map((res, i) => (
                                                    <a
                                                        key={i}
                                                        href={res.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/link border border-white/5 hover:border-primary/30"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            {res.type === "Video" ? (
                                                                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                                                </div>
                                                            ) : res.type === "Course" ? (
                                                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                                </div>
                                                            ) : res.type === "GitHub" ? (
                                                                <div className="p-2 rounded-lg bg-zinc-500/20 text-zinc-400">
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                                                </div>
                                                            ) : (
                                                                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col truncate">
                                                                <span className="text-sm font-medium text-zinc-300 group-hover/link:text-white transition-colors truncate">
                                                                    {res.title}
                                                                </span>
                                                                <span className="text-xs text-zinc-500 font-mono truncate max-w-[200px] md:max-w-xs block">
                                                                    {new URL(res.link).hostname}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover/link:text-primary transition-colors flex-shrink-0" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function ResumeTab({ result }: { result: AnalysisResponse }) {
    const issueTypeStyles: Record<string, { bg: string; icon: React.ReactNode }> = {
        "Lacks Depth": { bg: "bg-amber-500/20 text-amber-400", icon: <TrendingUp className="w-4 h-4" /> },
        "No Proof": { bg: "bg-rose-500/20 text-rose-400", icon: <Shield className="w-4 h-4" /> },
        "Missing Metrics": { bg: "bg-violet-500/20 text-violet-400", icon: <BarChart3 className="w-4 h-4" /> },
        "Needs Clarification": { bg: "bg-cyan-500/20 text-cyan-400", icon: <AlertCircle className="w-4 h-4" /> },
        "Should Remove": { bg: "bg-zinc-500/20 text-zinc-400", icon: <AlertTriangle className="w-4 h-4" /> }
    };

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <motion.div variants={staggerItem} className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Resume Recommendations</h2>
                <p className="text-zinc-400 text-lg">Specific improvements for your resume document</p>
            </motion.div>

            {result.resume_recommendations.length === 0 ? (
                <motion.div variants={staggerItem} className="glass rounded-2xl p-12 text-center">
                    <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-400 font-medium">Your resume looks excellent! No improvements needed.</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {result.resume_recommendations.map((rec, index) => {
                        const style = issueTypeStyles[rec.issue_type] || issueTypeStyles["Needs Clarification"];

                        return (
                            <motion.div
                                key={index}
                                variants={staggerItem}
                                custom={index}
                                className="glass rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${style.bg}`}>
                                        {style.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg}`}>
                                                {rec.issue_type}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-zinc-500" />
                                            <span className="text-sm font-medium text-white">{rec.section_or_bullet}</span>
                                        </div>
                                        <p className="text-zinc-300">{rec.recommendation}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// --- Main Component ---
export default function AnalysisFlow() {
    const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
    const [role, setRole] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<TabId>("summary");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // Helper function to check if backend is available
    const checkBackendHealth = async (): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/health`, {
                method: "GET",
            });
            return response.ok;
        } catch {
            return false;
        }
    };

    // Helper function with retry logic for API calls
    const fetchWithRetry = async (
        url: string,
        options: RequestInit,
        maxRetries: number = 3
    ): Promise<Response> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📡 Attempt ${attempt}/${maxRetries}: ${url}`);
                const response = await fetch(url, options);
                return response;
            } catch (error) {
                console.error(`❌ Attempt ${attempt} failed:`, error);

                if (attempt === maxRetries) {
                    throw error;
                }

                // Check if backend is available before retrying
                console.log("🔄 Checking backend health before retry...");
                const isHealthy = await checkBackendHealth();

                if (!isHealthy) {
                    console.log("⏳ Backend not ready, waiting 2 seconds...");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.log("✅ Backend is healthy, retrying immediately...");
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        throw new Error("All retry attempts failed");
    };

    const startAnalysis = async () => {
        if (!role || !file) return;
        setStep("analyzing");
        setError("");

        try {
            console.log("📤 Starting resume analysis...");
            console.log("📋 Target role:", role);
            console.log("📄 File:", file.name);

            // Check backend health before starting
            console.log("🔍 Checking backend availability...");
            const isHealthy = await checkBackendHealth();
            if (!isHealthy) {
                throw new Error("BACKEND_NOT_AVAILABLE");
            }
            console.log("✅ Backend is available");

            // Parse Resume
            const formData = new FormData();
            formData.append("file", file);

            console.log("📤 Sending resume to backend for parsing...");
            const parseRes = await fetchWithRetry(
                `${API_URL}/api/parse-resume`,
                {
                    method: "POST",
                    body: formData,
                },
                3
            );

            console.log("📥 Parse response:", parseRes.status, parseRes.statusText);
            if (!parseRes.ok) {
                const errorText = await parseRes.text();
                console.error("Parse error:", errorText);
                throw new Error("Failed to parse resume. Please ensure you uploaded a valid PDF file.");
            }

            const parseData = await parseRes.json();
            console.log("✅ Resume parsed successfully, text length:", parseData.text?.length || 0);

            console.log("🤖 Sending for AI analysis...");
            console.log("⏱️ This may take 30-60 seconds...");

            // Create AbortController with 3-minute timeout for long-running AI analysis
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.error("⏱️ Analysis timed out after 3 minutes");
                controller.abort();
            }, 180000); // 3 minutes (increased from 2)

            const analyzeRes = await fetch(`${API_URL}/api/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resume_text: parseData.text,
                    target_role: { role_title: role }
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log("📥 Analysis response:", analyzeRes.status, analyzeRes.statusText);
            if (!analyzeRes.ok) {
                const errorText = await analyzeRes.text();
                console.error("Analysis error:", errorText);
                throw new Error(`Analysis failed: ${errorText || 'Backend error'}`);
            }

            const analyzeData = await analyzeRes.json();
            console.log("✅ Analysis complete! Overall score:", analyzeData.overall_fit?.overall_score);

            setResult(analyzeData);
            setActiveTab("summary");
            setStep("result");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            const errorName = err instanceof Error ? err.name : 'UnknownError';
            console.error("❌ Full error object:", err);
            console.error("❌ Error name:", errorName);
            console.error("❌ Error message:", errorMessage);

            // Check for specific error types
            if (errorMessage === "BACKEND_NOT_AVAILABLE") {
                setError(
                    "🔌 Backend Not Available\n\n" +
                    "Cannot connect to the backend server.\n\n" +
                    "Please start the backend:\n" +
                    "1. Open terminal in project folder\n" +
                    "2. Run: python -m backend.main\n\n" +
                    "Or use START.bat to start all services."
                );
            } else if (errorName === 'AbortError') {
                setError(
                    "⏱️ Analysis Timed Out\n\n" +
                    "The AI analysis took longer than 3 minutes.\n\n" +
                    "Try:\n" +
                    "- Check Backend Server window for errors\n" +
                    "- Verify GOOGLE_API_KEY in backend/.env\n" +
                    "- Try with a shorter resume"
                );
            } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError") || errorMessage === "Load failed") {
                setError(
                    "🔌 Connection Lost\n\n" +
                    "Connection to backend failed. Possible causes:\n" +
                    "- Backend server stopped or crashed\n" +
                    "- Network issue\n\n" +
                    "Please try again. If error persists:\n" +
                    "1. Check Backend Server window for errors\n" +
                    "2. Restart with: python -m backend.main"
                );
            } else {
                setError(`❌ Error: ${errorMessage}\n\nCheck browser console (F12) for details.`);
            }
            setStep("input");
        }
    };

    const renderTabContent = () => {
        if (!result) return null;

        switch (activeTab) {
            case "summary": return <SummaryTab result={result} />;
            case "skills": return <SkillsTab result={result} />;
            case "experience": return <ExperienceTab result={result} />;
            case "gaps": return <GapsTab result={result} />;
            case "action": return <ActionTab result={result} />;
            case "resume": return <ResumeTab result={result} />;
            default: return null;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto min-h-[60vh] relative px-4">
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
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4"
                            >
                                <Sparkles className="w-4 h-4" />
                                AI-Powered Analysis
                            </motion.div>
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400">
                                Start Your Calibration
                            </h2>
                            <p className="text-zinc-400 text-lg">Upload your resume and define your career target</p>
                        </div>

                        <div className="glass p-6 rounded-2xl space-y-4">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                Target Role
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. ML Engineer, Data Scientist, Backend Developer"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-lg"
                            />
                        </div>

                        <div className="glass p-10 rounded-2xl border-dashed border-2 border-white/10 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center gap-4 text-zinc-400 group-hover:text-primary transition-colors relative z-0">
                                <div className="p-5 rounded-2xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-xl text-white group-hover:text-primary transition-colors">
                                        {file ? file.name : "Drop your resume PDF here"}
                                    </p>
                                    <p className="text-sm text-zinc-500 mt-2">
                                        {file ? "Click to change file" : "or click to browse your files"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span className="whitespace-pre-wrap text-sm">{error}</span>
                                </div>
                            </motion.div>
                        )}

                        <button
                            onClick={startAnalysis}
                            disabled={!role || !file}
                            className="w-full py-5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-lg text-white shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-3 group"
                        >
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Analyze My Readiness
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}

                {/* ANALYZING STEP */}
                {step === "analyzing" && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 gap-8"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
                            <div className="relative z-10 p-8 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30">
                                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <h3 className="text-3xl font-bold text-white">Analyzing Your Profile</h3>
                            <p className="text-zinc-400 text-lg">Comparing against <span className="text-primary font-medium">{role}</span> standards...</p>
                        </div>
                        <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-3 h-3 rounded-full bg-primary"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* RESULT STEP */}
                {step === "result" && result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Tab Navigation - Fixed at top */}
                        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
                            <div className="max-w-6xl mx-auto px-4 py-3">
                                <div className="glass rounded-2xl p-2">
                                    <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                                    ? "text-white"
                                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                            >
                                                {activeTab === tab.id && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute inset-0 bg-gradient-to-r from-primary/80 to-violet-600/80 rounded-xl"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                    />
                                                )}
                                                <span className="relative z-10">{tab.icon}</span>
                                                <span className="relative z-10">{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spacer for fixed tab bar */}
                        <div className="h-4" />

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                variants={tabContentVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Start New Analysis */}
                        <div className="flex justify-center pt-8 pb-12">
                            <button
                                onClick={() => { setStep("input"); setResult(null); setActiveTab("summary"); }}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                Start New Analysis
                            </button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
