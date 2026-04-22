"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  StickyNote,
  Search,
  Trash2,
  Clock,
  Maximize2,
  X,
  Tag,
  PlusCircle,
  Hash,
  Copy,
  Edit2
} from "lucide-react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useKeyboardActions } from "@/hooks/useKeyboardActions";
import { useContextMenu } from "@/context/ContextMenuContext";


const stripFormatting = (text: string) => {
  if (!text) return "";
  // Remove HTML image tags completely (to strip base64 strings)
  let clean = text.replace(/<img[^>]*>/g, "[Image]");
  // Remove markdown image tags
  clean = clean.replace(/!\[.*?\]\(.*?\)/g, "[Image]");
  // Remove base64 strings if any slipped through
  clean = clean.replace(/data:image\/[a-zA-Z]+;base64,[^\s"']+/g, "");
  // Remove other HTML tags
  clean = clean.replace(/<[^>]*>?/gm, '');
  // Remove basic markdown symbols like #, *, -, etc
  clean = clean.replace(/[#*`>~_-]/g, "");
  return clean;
};

export default function NotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showMenu, hideMenu } = useContextMenu();

  const [notes, setNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();
  const [hoveredNote, setHoveredNote] = useState<any>(null);

  const deleteNoteFunc = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/notes`, id));
      showToast("Knowledge Purged", "error");
    } catch (e) {
      showToast("Purge Failure", "error");
    }
  };

  useKeyboardActions({
    onCopy: () => {
      if (hoveredNote) {
        navigator.clipboard.writeText(hoveredNote.content);
        showToast("Knowledge Copied to Clipboard", "success");
      }
    },
    onDelete: () => {
      if (hoveredNote) deleteNoteFunc(hoveredNote.id);
    }
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, `users/${user.uid}/notes`), orderBy("updatedAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);



  const deleteNote = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/notes`, id));
    showToast("Knowledge Purged", "error");
  };

  const duplicateNote = async (note: any) => {
    if (!user || !note) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/notes`), {
        content: note.content,
        projectTag: note.projectTag || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      showToast("Thought Duplicated", "success");
    } catch (e) {
      showToast("Duplication Failure", "error");
    }
  };

  const handleNoteContextMenu = (e: React.MouseEvent, note: any) => {
    e.preventDefault();
    showMenu(e.clientX, e.clientY, [
      {
        label: "Edit Reference",
        icon: <Edit2 size={14} />,
        onClick: () => {
          router.push(`/notes/${note.id}`);
        }
      },
      { label: "Duplicate Thought", icon: <Copy size={14} />, onClick: () => duplicateNote(note) },
      { label: "Purge Record", icon: <Trash2 size={14} />, onClick: () => deleteNoteFunc(note.id), variant: "destructive" },
    ], note.projectTag || "General Thought");
  };

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.projectTag?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background p-8 lg:p-16 flex flex-col gap-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Knowledge Base</h1>
          <p className="text-zinc-500 text-sm font-medium">Quick thoughts and detailed brainstorming.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-zinc-950 border border-zinc-900 px-6 py-3.5 rounded-2xl flex items-center gap-4 w-80 transition-all focus-within:border-primary/50 shadow-glow shadow-primary/5">
            <Search size={18} className="text-zinc-600" />
            <input
              type="text"
              placeholder="Search knowledge..."
              className="bg-transparent border-none outline-none text-base flex-1 font-bold text-white placeholder:text-zinc-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              router.push("/notes/new");
            }}
            className="bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-bold shadow-soft hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Initialize Thought
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onMouseEnter={() => setHoveredNote(note)}
              onMouseLeave={() => setHoveredNote(null)}
              onClick={() => {
                router.push(`/notes/${note.id}`);
              }}
              onContextMenu={(e) => handleNoteContextMenu(e, note)}
              className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-zinc-700 hover:shadow-xl transition-all group flex flex-col min-h-[200px] cursor-pointer relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900">
                  <Hash size={12} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {note.projectTag || 'General'}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden relative">
                <h2 className="text-xl font-bold text-white mb-3 line-clamp-1">
                  {note.title || (stripFormatting(note.content).trim().split('\n')[0].substring(0, 40))}
                </h2>
                {/* A simple overlay to fade out long content */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900/50 to-transparent z-10 pointer-events-none" />
                <div className="text-zinc-500 leading-relaxed text-sm line-clamp-4 font-medium whitespace-pre-wrap">
                  {stripFormatting(note.content)}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {note.updatedAt ? new Date(note.updatedAt.toDate()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'recently'}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/notes/${note.id}`);
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                >
                  Edit Reference
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-32 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
            <StickyNote size={40} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-600 text-sm font-medium">No notes created yet.</p>
          </div>
        )}
      </div>


    </div>
  );
}
