"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Copy, Save, ArrowLeft, Send, Trash2, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AiLabPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskName, setTaskName] = useState("AI Output");
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("kern_ai_lab_data");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.isPending) {
          setTaskName(data.task || "AI Task");
          setPendingData(data);
          runAi(data.task, data.content, data.context);
        } else {
          setContent(data.result || "");
          setOriginalContent(data.result || "");
          setTaskName(data.task || "AI Output");
        }
      } catch (e) {
        console.error("Failed to parse AI lab data");
      }
    }
  }, []);

  const runAi = async (task: string, inputContent: string, context: string) => {
    setIsProcessing(true);
    setError(null);
    
    // 15s Timeout Logic
    const timeoutId = setTimeout(() => {
      if (isProcessing && !content) {
        setError("Generation is taking longer than expected. The AI might be under heavy load.");
      }
    }, 15000);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, content: inputContent, context }),
      });
      const data = await res.json();
      clearTimeout(timeoutId);

      if (data.result) {
        setContent(data.result);
        setOriginalContent(data.result);
        localStorage.setItem("kern_ai_lab_data", JSON.stringify({ task, result: data.result, isPending: false, timestamp: Date.now() }));
      } else {
        setError(data.error || "AI Task failed");
        showToast(data.error || "AI Task failed", "error");
      }
    } catch (err) {
      setError("AI Service unreachable. Check your network connection.");
      showToast("AI Service unreachable", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefine = async () => {
    if (!instruction.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          task: "refine", 
          content: content, 
          context: instruction 
        }),
      });
      const data = await res.json();
      if (data.result) {
        setContent(data.result);
        setInstruction("");
        showToast("Refined by AI", "success");
      } else {
        showToast(data.error || "Refinement failed", "error");
      }
    } catch (err) {
      showToast("AI Service unreachable", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToNotes = async () => {
    if (!user || !content) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/notes`), {
        title: `AI: ${taskName.toUpperCase()}`,
        content: content,
        projectTag: "AI-LAB",
        format: "markdown",
        createdAt: serverTimestamp()
      });
      showToast("Saved to Knowledge Base", "success");
      router.push("/notes");
    } catch (err) {
      showToast("Failed to save", "error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    showToast("Copied to Clipboard", "success");
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      {/* Header */}
      <header className="p-6 border-b border-zinc-800/50 bg-zinc-950/50 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <Sparkles size={14} className="fill-primary" />
              AI Intelligence Lab
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
              Refining: {taskName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 mr-2">
            <button 
              onClick={() => setIsPreview(false)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                !isPreview ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              Edit
            </button>
            <button 
              onClick={() => setIsPreview(true)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                isPreview ? "bg-primary text-white" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              Preview
            </button>
          </div>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
          >
            <Copy size={14} />
            Copy
          </button>
          <button 
            onClick={handleSaveToNotes}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-glow shadow-primary/20"
          >
            <Save size={14} />
            Save to Notes
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12 pb-40">
        <AnimatePresence mode="wait">
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            <div className="absolute -left-10 top-0 hidden xl:flex flex-col gap-4">
              <div className="w-1 h-20 bg-primary/20 rounded-full" />
              <div className="w-1 h-40 bg-zinc-800 rounded-full" />
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 md:p-12 min-h-[60vh] relative group overflow-hidden flex flex-col">
               {/* Aesthetic Background Pattern */}
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Sparkles size={200} className="text-primary" />
              </div>

              {isProcessing && !content ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/20 animate-ping absolute inset-0" />
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center relative">
                      <Sparkles className="text-primary animate-pulse" size={32} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-white">Anchor is thinking...</h2>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 animate-pulse">Processing {taskName}</p>
                    {error && (
                      <div className="mt-4 flex flex-col items-center gap-4">
                        <p className="text-sm text-red-400 font-medium max-w-xs text-center">{error}</p>
                        <button 
                          onClick={() => pendingData && runAi(pendingData.task, pendingData.content, pendingData.context)}
                          className="px-6 py-2 rounded-full bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all"
                        >
                          Retry Execution
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : isPreview ? (
                <div className="flex-1 overflow-y-auto markdown-content custom-scrollbar pr-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full min-h-[50vh] bg-transparent border-none outline-none text-lg leading-relaxed text-zinc-300 font-medium placeholder:text-zinc-700 resize-none custom-scrollbar"
                  placeholder="AI output will appear here..."
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Refinement Bar */}
      <div className="fixed bottom-10 inset-x-0 flex justify-center px-4 z-30">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="w-full max-w-3xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 shadow-2xl flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles size={20} className={cn("text-primary", isProcessing && "animate-spin")} />
          </div>
          <input 
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRefine()}
            placeholder="Ask AI to refine, shorten, or change the tone..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold tracking-tight text-white placeholder:text-zinc-600"
          />
          <button 
            disabled={!instruction.trim() || isProcessing}
            onClick={handleRefine}
            className="w-12 h-12 rounded-2xl bg-zinc-900 hover:bg-white text-zinc-500 hover:text-black transition-all flex items-center justify-center disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-500"
          >
            <Send size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
