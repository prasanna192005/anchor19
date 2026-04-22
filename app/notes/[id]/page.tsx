"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Clock, Hash } from "lucide-react";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { RichTextEditor } from "@/components/RichTextEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const handleSave = async () => {
    if (!user || !noteId || noteId === "new") return;
    setIsSaving(true);
    try {
      const docRef = doc(db, `users/${user.uid}/notes`, noteId);
      await updateDoc(docRef, {
        ...form,
        updatedAt: serverTimestamp(),
      });
      setLastSaved(new Date());
      showToast("Thought Saved", "success");
    } catch (e) {
      showToast("Save Failure", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !noteId || noteId === "new") return;
    if (confirm("Are you sure you want to purge this record?")) {
      await deleteDoc(doc(db, `users/${user.uid}/notes`, noteId));
      showToast("Knowledge Purged", "error");
      router.push("/notes");
    }
  };

  if (loading || !user) return null;

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
              onClick={() => setForm({ ...form, format: "normal" })}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", form.format === "normal" ? "bg-primary text-white" : "text-zinc-500 hover:text-zinc-300")}
            >Normal</button>
            <button
              type="button"
              onClick={() => {
                setForm({ ...form, format: "markdown" });
                setIsPreview(false);
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
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          <button
            onClick={handleDelete}
            className="text-red-500 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
            title="Delete Note"
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={handleSave}
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
