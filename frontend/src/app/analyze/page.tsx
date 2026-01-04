import AnalysisFlow from "@/components/AnalysisFlow";

export default function AnalyzePage() {
    return (
        <main className="min-h-screen bg-background py-20 px-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

            <AnalysisFlow />
        </main>
    );
}
