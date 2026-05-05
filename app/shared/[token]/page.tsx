"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Table, Presentation, Database, Link as LinkIconAlt, FolderOpen, ExternalLink, Hash, Clock, ShieldCheck } from "lucide-react";
import PageSkeleton from "@/components/PageSkeleton";
import { cn } from "@/lib/utils";

const typeStyles = {
  Sheet: { color: "#16A34A", icon: Table, bg: "rgba(22, 163, 74, 0.1)" },
  Form: { color: "#9333EA", icon: Database, bg: "rgba(147, 51, 234, 0.1)" },
  Doc: { color: "#2563EB", icon: FileText, bg: "rgba(37, 99, 235, 0.1)" },
  Slide: { color: "#EAB308", icon: Presentation, bg: "rgba(234, 179, 8, 0.1)" },
  Folder: { color: "#71717a", icon: FolderOpen, bg: "rgba(113, 113, 122, 0.1)" },
  Link: { color: "#4F46E5", icon: LinkIconAlt, bg: "rgba(79, 70, 229, 0.1)" },
};

const stripFormatting = (text: string) => {
  if (!text) return "";
  let clean = text.replace(/<[^>]*>?/gm, '');
  clean = clean.replace(/[#*`>~_-]/g, "");
  return clean.trim();
};

export default function SharedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params?.token as string;
  const type = searchParams?.get("type") || "note";
  const ownerId = searchParams?.get("owner");
  const resourceId = searchParams?.get("id");

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedResource = async () => {
      if (!token || !ownerId || !resourceId) {
        setError("Invalid secure link parameters.");
        setLoading(false);
        return;
      }

      try {
        const collectionName = type === "note" ? "notes" : type === "todo" ? "todos" : "drive";
        const docRef = doc(db, `users/${ownerId}/${collectionName}`, resourceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.isPublic && data.shareToken === token) {
            setResource(data);
          } else {
            setError("This resource is private or the link has expired.");
          }
        } else {
          setError("Resource not found in the Anchor19 network.");
        }
      } catch (e) {
        console.error(e);
        setError("Unauthorized access or network failure.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedResource();
  }, [token, type, ownerId, resourceId]);

  if (loading) return <PageSkeleton variant="detail" />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <ShieldCheck size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter mb-2 italic">ACCESS_DENIED</h1>
        <p className="text-zinc-500 max-w-md font-medium text-sm leading-relaxed">{error}</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="mt-8 bg-zinc-900 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none" />
      
      {/* Header */}
      <header className="p-8 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <span className="font-black text-white text-xl">A</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tighter italic leading-none">ANCHOR19_SECURE_VIEW</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1">Read-only knowledge node</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified Secure</span>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 md:p-16 relative z-10">
        {type === "note" ? (
          <article className="space-y-12">
            <header className="space-y-6">
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 w-fit">
                <Hash size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{resource.projectTag || "GENERAL"}</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                {resource.content?.split('\n')[0].replace(/^#+\s*/, '') || "Untitled Thought"}
              </h2>
              <div className="flex items-center gap-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Modified {resource.updatedAt?.toDate().toLocaleDateString()}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                <span>Anchor19 Vault</span>
              </div>
            </header>

            <div className="markdown-content prose prose-invert prose-blue max-w-none">
              {resource.format === "normal" ? (
                <div dangerouslySetInnerHTML={{ __html: resource.content }} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {resource.content}
                </ReactMarkdown>
              )}
            </div>
          </article>
        ) : type === "todo" ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-2xl">
              <ShieldCheck size={40} className="text-primary" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter text-center italic">{resource.title}</h2>
            <div className="mt-8 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full", resource.status === "Done" ? "bg-emerald-500" : "bg-primary")} />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{resource.status || "Todo"}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <TypeIcon type={resource.type || "Doc"} />
            <h2 className="text-3xl font-black text-white tracking-tighter mt-8 text-center italic">{resource.title}</h2>
            <p className="text-zinc-500 font-medium mt-3 text-center max-w-md">{resource.notes || "This is a shared resource from a project drive."}</p>
            
            <div className="mt-12 p-8 rounded-[3rem] bg-zinc-950 border border-zinc-800 flex flex-col items-center gap-6 shadow-2xl">
               <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  <ExternalLink size={14} />
                  Target Resource Link
               </div>
               <p className="text-zinc-400 font-mono text-xs break-all max-w-xs text-center opacity-50">{resource.url}</p>
               <a 
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-glow shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
               >
                 Open Resource
                 <ExternalLink size={16} />
               </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-zinc-800/50 text-center relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 italic">SYSTEM_PROTOCOL_v1.5.0 // ANCHOR19</p>
      </footer>
    </div>
  );
}

function TypeIcon({ type }: { type: string }) {
  const style = typeStyles[type as keyof typeof typeStyles] || typeStyles.Doc;
  const Icon = style.icon;
  
  return (
    <div 
      className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center shrink-0 border border-zinc-800 shadow-2xl"
      style={{ 
        backgroundColor: style.bg,
        borderColor: `${style.color}33`
      }}
    >
      <Icon size={40} style={{ color: style.color }} />
    </div>
  );
}
