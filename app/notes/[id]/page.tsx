"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Clock, Hash, FileText, Zap, Share2, Sparkles } from "lucide-react";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { RichTextEditor } from "@/components/RichTextEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useHistory } from "@/hooks/useHistory";
import PageSkeleton from "@/components/PageSkeleton";

export default function NoteDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noteId = params?.id as string;
  const { showToast } = useToast();

  const [form, setForm] = useState({ content: "", projectTag: "", format: "normal" as "markdown" | "normal" });
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { logInteraction } = useHistory();
  
  const templates = {
    meeting: `# Meeting: [Topic]
**Date**: ${new Date().toLocaleDateString()}
**Participants**:

## Agenda
- 

## Discussion
- 

## Action Items
- [ ] `,
    journal: `# Journal: ${new Date().toLocaleDateString()}

## Today's Focus
- 

## Accomplishments
- 

## Reflections
- `,
    brief: `# Project Brief: [Project Name]

## Overview

## Objectives

## Key Milestones
- [ ] 

## Resources`,
    bug: `# Bug: [Short Description]

## Severity: [Low/Medium/High]

## Environment

## Steps to Reproduce
1. 

## Expected Behavior

## Actual Behavior`
  };

  const convertMarkdownToHtml = (md: string) => {
    return md
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br />');
  };

  const convertHtmlToMarkdown = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<h1>(.*?)<\/h1>/gim, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/gim, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/gim, '### $1\n')
      .replace(/<b>(.*?)<\/b>/gim, '**$1**')
      .replace(/<strong>(.*?)<\/strong>/gim, '**$1**')
      .replace(/<i>(.*?)<\/i>/gim, '*$1*')
      .replace(/<em>(.*?)<\/em>/gim, '*$1*')
      .replace(/<li>(.*?)<\/li>/gim, '- $1')
      .replace(/<br\s*\/?>/gim, '\n')
      .replace(/<p>(.*?)<\/p>/gim, '$1\n')
      .replace(/<div>(.*?)<\/div>/gim, '$1\n')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const useTemplate = (key: keyof typeof templates) => {
    let content = templates[key];
    if (form.format === "normal") {
      content = convertMarkdownToHtml(content);
    }
    setForm({ ...form, content });
    setIsPreview(false);
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} Template Applied`, "info");
  };

  const handleAiTask = async (task: string) => {
    if (!user || !form.content && task !== "expand") return;
    localStorage.setItem("kern_ai_lab_data", JSON.stringify({
      task,
      content: form.content || `Title: ${form.projectTag}`,
      context: form.projectTag,
      isPending: true,
      timestamp: Date.now()
    }));
    router.push("/ai-lab");
  };

  const handleShare = async () => {
    if (!user || !noteId || noteId === "new") return;
    try {
      const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await updateDoc(doc(db, `users/${user.uid}/notes`, noteId), {
        shareToken,
        isPublic: true
      });
      const shareUrl = `${window.location.origin}/shared/${shareToken}?type=note&owner=${user.uid}&id=${noteId}`;
      navigator.clipboard.writeText(shareUrl);
      showToast("Public Link Copied", "success");
    } catch (e) {
      showToast("Sharing Failed", "error");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchNote = async () => {
      if (!user || !noteId || noteId === "new") return;
      const docRef = doc(db, `users/${user.uid}/notes`, noteId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let content = data.content || "";
        let loadedFormat = data.format || "markdown";
        
        // Smart Identification: if it looks like markdown and has no images, treat as markdown.
        if (loadedFormat === "normal") {
          const plainText = content
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/div>|<\/p>|<\/h[1-6]>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ');
            
          const isMarkdown = /(^|\n\s*)(#{1,6}|\*|-|>)\s/.test(plainText) || /\*\*.*?\*\*/.test(plainText) || /\[.*?\]\(.*?\)/.test(plainText) || /```/.test(plainText) || /---/.test(plainText);
          const hasImage = /<img[^>]*>/i.test(content);
          
          if (isMarkdown && !hasImage) {
            loadedFormat = "markdown";
            content = plainText;
          }
        }

        setForm({
          content: content,
          projectTag: data.projectTag || "",
          format: loadedFormat,
        });
        if (data.updatedAt) {
          setLastSaved(data.updatedAt.toDate());
        }
        setIsPreview(true);
      } else {
        showToast("Thought not found.", "error");
        router.push("/notes");
      }
    };

    fetchNote();
  }, [user, loading, noteId, router]);

  const handleSave = useCallback(async (isAuto = false) => {
    if (!user || !noteId) return;
    
    // Don't auto-save if nothing has changed or content is empty
    if (isAuto && !form.content.trim()) return;

    setIsSaving(true);
    try {
      if (noteId === "new") {
        const docRef = await addDoc(collection(db, `users/${user.uid}/notes`), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setLastSaved(new Date());
        if (!isAuto) showToast("Thought Initialized", "success");
        logInteraction({ title: "New Note", url: "", category: "Vault", type: "note" });
        // Use replace to avoid "new" in history
        router.replace(`/notes/${docRef.id}`);
      } else {
        const docRef = doc(db, `users/${user.uid}/notes`, noteId);
        await updateDoc(docRef, {
          ...form,
          updatedAt: serverTimestamp(),
        });
        setLastSaved(new Date());
        if (!isAuto) showToast("Thought Saved", "success");
      }
    } catch (e) {
      console.error("Save error:", e);
      if (!isAuto) showToast("Save Failure", "error");
    } finally {
      setIsSaving(false);
    }
  }, [user, noteId, form, router, logInteraction, showToast]);

  // Auto-save effect
  useEffect(() => {
    // Only auto-save if there's content and we're not already saving
    if (!form.content.trim()) return;
    
    const timer = setTimeout(() => {
      handleSave(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [form.content, form.projectTag, form.format, handleSave]);

  const handleDelete = async () => {
    if (!user || !noteId || noteId === "new") return;
    if (confirm("Are you sure you want to purge this record?")) {
      await deleteDoc(doc(db, `users/${user.uid}/notes`, noteId));
      showToast("Knowledge Purged", "error");
      router.push("/notes");
    }
  };

  if (loading || !user) return <PageSkeleton variant="detail" />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="flex items-center justify-between p-6 border-b border-zinc-800/50 bg-zinc-950/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-xl"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <Hash size={16} className="text-primary" />
            <input
              type="text"
              value={form.projectTag}
              onChange={(e) => setForm({ ...form, projectTag: e.target.value.toUpperCase() })}
              placeholder="PROJECT TAG"
              className="bg-transparent border-none outline-none font-black text-sm uppercase tracking-widest text-white placeholder:text-zinc-700 w-48"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Format Selector */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                if (form.format === "markdown") {
                  setForm({ ...form, format: "normal", content: convertMarkdownToHtml(form.content) });
                } else {
                  setForm({ ...form, format: "normal" });
                }
              }}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", form.format === "normal" ? "bg-primary text-white" : "text-zinc-500 hover:text-zinc-300")}
            >Normal</button>
            <button
              type="button"
              onClick={() => {
                if (form.format === "normal") {
                  setForm({ ...form, format: "markdown", content: convertHtmlToMarkdown(form.content) });
                  setIsPreview(false);
                } else {
                  setForm({ ...form, format: "markdown" });
                  setIsPreview(false);
                }
              }}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", form.format === "markdown" ? "bg-primary text-white" : "text-zinc-500 hover:text-zinc-300")}
            >Markdown</button>
          </div>

          {/* Edit/Preview Toggle */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", !isPreview ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
            >Edit</button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", isPreview ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
            >Preview</button>
          </div>

          <div className="w-px h-6 bg-zinc-800 mx-2" />

          {lastSaved && (
            <div className="hidden md:flex items-center gap-2 text-zinc-500 mr-2">
              <Clock size={12} className={cn(isSaving && "animate-spin text-primary")} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isSaving ? "Syncing..." : `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
          )}

          <button
            onClick={() => handleAiTask("summarise")}
            className="text-zinc-400 hover:text-primary p-2.5 rounded-xl transition-all"
            title="AI Summarize"
          >
            <Sparkles size={18} />
          </button>

          <button
            onClick={handleShare}
            className="text-zinc-400 hover:text-primary p-2.5 rounded-xl transition-all"
            title="Share Note"
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={handleDelete}
            className="text-red-500 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
            title="Delete Note"
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-glow shadow-primary/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {/* Editor Main Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12">
        {noteId === "new" && !form.content && !isPreview && (
          <div className="mb-10 space-y-6">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary fill-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Initialize with Template</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => useTemplate("meeting")}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-primary/30 hover:bg-zinc-900 transition-all text-left group"
              >
                <FileText size={20} className="text-zinc-600 group-hover:text-primary mb-3" />
                <p className="text-sm font-bold text-white tracking-tight">Meeting Notes</p>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Agenda & Action items</p>
              </button>
              <button 
                onClick={() => useTemplate("journal")}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-primary/30 hover:bg-zinc-900 transition-all text-left group"
              >
                <FileText size={20} className="text-zinc-600 group-hover:text-primary mb-3" />
                <p className="text-sm font-bold text-white tracking-tight">Daily Journal</p>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Reflection & focus</p>
              </button>
              <button 
                onClick={() => useTemplate("brief")}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-primary/30 hover:bg-zinc-900 transition-all text-left group"
              >
                <FileText size={20} className="text-zinc-600 group-hover:text-primary mb-3" />
                <p className="text-sm font-bold text-white tracking-tight">Project Brief</p>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Goals & milestones</p>
              </button>
              <button 
                onClick={() => useTemplate("bug")}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-primary/30 hover:bg-zinc-900 transition-all text-left group"
              >
                <FileText size={20} className="text-zinc-600 group-hover:text-primary mb-3" />
                <p className="text-sm font-bold text-white tracking-tight">Bug Report</p>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Reproduction steps</p>
              </button>

              <button 
                onClick={() => handleAiTask("expand")}
                className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all text-left group relative overflow-hidden"
              >
                <Sparkles size={20} className="text-primary mb-3" />
                <p className="text-sm font-bold text-primary tracking-tight">AI Smart Fill</p>
                <p className="text-[10px] text-primary/60 font-medium mt-1">Generate from tag/title</p>
              </button>
            </div>
          </div>
        )}
        <div className="h-full">
          {!isPreview ? (
            form.format === "normal" ? (
              <RichTextEditor
                value={form.content}
                onChange={(val) => setForm({ ...form, content: val })}
                placeholder="Write your note here... You can paste images and they will automatically be embedded."
              />
            ) : (
              <textarea
                required autoFocus
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-12 py-12 outline-none focus:border-primary/50 transition-all font-medium text-lg leading-relaxed text-white min-h-[600px] resize-y placeholder:text-zinc-800 shadow-xl"
                placeholder="Support markdown... # Header, **bold**, [link](url)"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
            )
          ) : (
            <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-12 py-12 min-h-[600px] overflow-y-auto shadow-xl">
              {(() => {
                let displayFormat = form.format;
                let displayContent = form.content;
                
                if (displayFormat === "normal") {
                  const plainText = displayContent
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<\/div>|<\/p>|<\/h[1-6]>/gi, '\n')
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ');
                    
                  const isMarkdown = /(^|\n\s*)(#{1,6}|\*|-|>)\s/.test(plainText) || /\*\*.*?\*\*/.test(plainText) || /\[.*?\]\(.*?\)/.test(plainText) || /```/.test(plainText) || /---/.test(plainText);
                  const hasImage = /<img[^>]*>/i.test(displayContent);
                  
                  if (isMarkdown && !hasImage) {
                    displayFormat = "markdown";
                    displayContent = plainText;
                  }
                }
                
                return displayFormat === "normal" ? (
                  <div 
                    className="markdown-content prose prose-invert prose-blue max-w-none"
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                  />
                ) : (
                  <div className="markdown-content prose prose-invert prose-blue max-w-none whitespace-pre-wrap">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
