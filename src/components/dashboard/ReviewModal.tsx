"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, CheckCircle2, RotateCcw, MessageSquare,
    Paperclip, Target, Award, ExternalLink
} from "lucide-react";
import { useAppStore } from "@/store";

interface ReviewModalProps {
    task: any;
    isOpen: boolean;
    onClose: () => void;
}

export function ReviewModal({ task, isOpen, onClose }: ReviewModalProps) {
    const { updateTask, employees } = useAppStore();
    const [feedback, setFeedback] = useState(task.managerFeedback || "");
    const [kpiScores, setKpiScores] = useState<Record<number, number>>(
        task.kpis?.reduce((acc: any, kpi: any, idx: number) => {
            acc[idx] = kpi.score ?? 0;
            return acc;
        }, {}) || {}
    );

    if (!isOpen) return null;

    const assignee = employees.find(e => e.id === task.assigneeId);

    const handleGrade = (idx: number, score: number) => {
        setKpiScores(prev => ({ ...prev, [idx]: score }));
    };

    const submitReview = (finalStatus: "Done" | "In Progress") => {
        const updatedKpis = task.kpis?.map((kpi: any, idx: number) => ({
            ...kpi,
            score: kpiScores[idx] || 0
        }));

        updateTask(task.id, {
            status: finalStatus,
            managerFeedback: feedback,
            kpis: updatedKpis,
            completedDate: finalStatus === "Done" ? new Date().toISOString() : null
        });
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="w-full max-w-2xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden glass-depth shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Award className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">{task.title}</h2>
                                <p className="text-sm text-gray-400">Reviewing submission from <span className="text-emerald-400 font-medium">{assignee?.name || 'Unknown'}</span></p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row h-[500px]">
                        {/* Left Side: Submission Content */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto border-r border-white/10 bg-black/20">
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5" /> Submission Notes
                                </h3>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-300 leading-relaxed italic">
                                    {task.submissionNotes || "No notes provided for this submission."}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                                    <Paperclip className="w-3.5 h-3.5" /> Attachments
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {task.submissionAttachments && task.submissionAttachments.length > 0 ? (
                                        task.submissionAttachments.map((file: string, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                        <ExternalLink className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <span className="text-xs text-gray-300 font-medium truncate max-w-[150px]">{file}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">View File</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl">
                                            <p className="text-xs text-gray-500">No attachments uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right Side: KPI Assessment & Feedback */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-white/5">
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-4 flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5" /> KPI Assessment
                                </h3>
                                <div className="space-y-4">
                                    {task.kpis && task.kpis.length > 0 ? (
                                        task.kpis.map((kpi: any, idx: number) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-gray-300">{kpi.name}</span>
                                                    <span className="text-[10px] font-bold text-emerald-400">{kpiScores[idx] || 0} / {kpi.points} pts</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={kpi.points}
                                                    step="1"
                                                    value={kpiScores[idx] || 0}
                                                    onChange={(e) => handleGrade(idx, parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">No KPIs defined for this task.</p>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Manager Feedback</h3>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-gray-600 focus:border-emerald-500/50 outline-none transition-all resize-none"
                                    rows={4}
                                    placeholder="Provide detailed feedback on the submission..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </section>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-between gap-4">
                        <button
                            onClick={() => submitReview("In Progress")}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all active:scale-95"
                        >
                            <RotateCcw className="w-4 h-4 text-orange-400" /> Send Back
                        </button>
                        <button
                            onClick={() => submitReview("Done")}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            <CheckCircle2 className="w-5 h-5" /> Approve & Complete
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
