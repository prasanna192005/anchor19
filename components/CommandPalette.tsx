"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  LayoutDashboard, 
  Link as LinkIcon, 
  CheckSquare, 
  HardDrive, 
  StickyNote,
  Command as CommandIcon,
  ArrowRight,
  LogOut,
  FileText,
  Table,
  Presentation,
  Folder,
  Database,
  Plus,
  CloudDownload
} from "lucide-react";
import { 
  collection,
  query,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user, logOut, gdriveToken, signInWithGoogleDrive } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setQueryText("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user) return;

    const searchEverything = async () => {
      const q = queryText.toLowerCase().trim();
      
      const defaultNav = [
        { id: "go-dash", title: "Dashboard", icon: LayoutDashboard, category: "Navigation", action: () => { router.push("/"); setIsOpen(false); } },
        { id: "go-todos", title: "Todos", icon: CheckSquare, category: "Navigation", action: () => { router.push("/todos"); setIsOpen(false); } },
        { id: "go-links", title: "Links", icon: LinkIcon, category: "Navigation", action: () => { router.push("/links"); setIsOpen(false); } },
        { id: "go-drive", title: "Drive", icon: HardDrive, category: "Navigation", action: () => { router.push("/drive"); setIsOpen(false); } },
        { id: "go-notes", title: "Notes", icon: StickyNote, category: "Navigation", action: () => { router.push("/notes"); setIsOpen(false); } },
      ];

      if (!q) {
        setResults(defaultNav);
        return;
      }

      const smartResults: any[] = [];
      
      // Google Workspace Integration
      const isGoogleDoc = q.includes("docs.google.com/document");
      const isGoogleSheet = q.includes("docs.google.com/spreadsheets");
      const isGoogleSlide = q.includes("docs.google.com/presentation");

      if (isGoogleDoc || isGoogleSheet || isGoogleSlide) {
        const type = isGoogleDoc ? "Doc" : isGoogleSheet ? "Sheet" : "Slide";
        const icon = isGoogleDoc ? FileText : isGoogleSheet ? Table : Presentation;
        smartResults.push({ 
          id: "s-drive", 
          title: `Link ${type} to Central Drive`, 
          icon: icon, 
          category: "Smart Integration", 
          action: () => handleAction("drive", q, { type }) 
        });
      }

      // Action: Add Todo (only if not a link)
      if ((q.startsWith("todo ") || q.startsWith("task ") || q.length > 3) && !q.includes(".")) {
        const title = q.replace(/todo |task /i, "");
        smartResults.push({ id: "s-todo", title: `New Task: ${title}`, icon: CheckSquare, category: "Action", action: () => handleAction("todo", title) });
      }

      // Action: Save Link (if looks like a URL and not already a Google Doc action)
      if ((q.startsWith("http") || q.includes(".")) && smartResults.length === 0) {
        smartResults.push({ id: "s-link", title: `Save to Vault: ${q}`, icon: LinkIcon, category: "Action", action: () => handleAction("link", q) });
      }

      // Quick Command: Sign Out
      if (q.includes("sign out") || q.includes("logout") || q.includes("exit")) {
        smartResults.push({ id: "s-logout", title: "Terminate Session", icon: LogOut, category: "System", action: () => { setIsOpen(false); logOut(); } });
      }

      // Connect GDrive Action
      if (!gdriveToken && q.length > 2) {
        smartResults.push({ 
          id: "s-gconnect", 
          title: "Connect Google Drive for Deep Search", 
          icon: HardDrive, 
          category: "System", 
          action: () => { signInWithGoogleDrive(); setIsOpen(false); } 
        });
      }

      const filteredNav = defaultNav.filter(n => n.title.toLowerCase().includes(q));

      // Dynamic Search across all collections
      let projectResults: any[] = [];
      let todoResults: any[] = [];
      let linkResults: any[] = [];
      let driveResults: any[] = [];

      try {
        const [pSnap, tSnap, lSnap, dSnap] = await Promise.all([
           getDocs(query(collection(db, `users/${user.uid}/projects`), limit(5))),
           getDocs(query(collection(db, `users/${user.uid}/todos`), limit(5))),
           getDocs(query(collection(db, `users/${user.uid}/links`), limit(5))),
           getDocs(query(collection(db, `users/${user.uid}/drive`), limit(5))),
        ]);

        projectResults = pSnap.docs
          .map(doc => ({ 
             id: doc.id, 
             title: doc.data().name, 
             icon: Folder, 
             category: "Projects", 
             action: () => { router.push(`/projects/${doc.id}`); setIsOpen(false); } 
          }))
          .filter(p => p.title.toLowerCase().includes(q));

        todoResults = tSnap.docs
          .map(doc => ({ 
             id: doc.id, 
             title: doc.data().title, 
             icon: CheckSquare, 
             category: "Tasks", 
             action: () => { router.push("/todos"); setIsOpen(false); } 
          }))
          .filter(t => t.title.toLowerCase().includes(q));

        linkResults = lSnap.docs
          .map(doc => ({ 
             id: doc.id, 
             title: doc.data().title, 
             icon: LinkIcon, 
             category: "Vault", 
             action: () => { window.open(doc.data().url, '_blank'); setIsOpen(false); } 
          }))
          .filter(l => l.title.toLowerCase().includes(q));

        driveResults = dSnap.docs
          .map(doc => {
             const data = doc.data();
             const Icon = data.type === "Sheet" ? Table : data.type === "Form" ? Database : data.type === "Slide" ? Presentation : FileText;
             return { 
                id: doc.id, 
                title: data.title, 
                icon: Icon, 
                category: "Local Archive", 
                action: () => { window.open(data.url, '_blank'); setIsOpen(false); } 
             };
          })
          .filter(d => d.title.toLowerCase().includes(q));

        // Deep Search (External GDrive)
        if (gdriveToken && q.length > 2) {
           const gResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name contains '${q}' and trashed = false&fields=files(id, name, mimeType, webViewLink)&pageSize=5`, {
              headers: { Authorization: `Bearer ${gdriveToken}` }
           });
           const gData = await gResponse.json();
           if (gData.files) {
              const deepResults = gData.files.map((file: any) => {
                 let Icon = FileText;
                 if (file.mimeType.includes("spreadsheet")) Icon = Table;
                 if (file.mimeType.includes("presentation")) Icon = Presentation;
                 if (file.mimeType.includes("folder")) Icon = Folder;
                 
                 return {
                    id: file.id,
                    title: file.name,
                    icon: Icon,
                    category: "Deep Search findings",
                    // Main action now ONLY opens the file
                    action: () => { 
                       window.open(file.webViewLink, '_blank'); 
                       setIsOpen(false); 
                    },
                    // Metadata for manual sync
                    source: "gdrive",
                    raw: file
                 };
              });
              driveResults = [...driveResults, ...deepResults];
           }
        }

      } catch (e: any) {
        console.error("Global search failed", e);
      }

      setResults([...smartResults, ...filteredNav, ...projectResults, ...todoResults, ...linkResults, ...driveResults]);
    };

    const timer = setTimeout(searchEverything, 150);
    return () => clearTimeout(timer);
  }, [queryText, isOpen, user, router]);

  const handleAction = async (type: string, content: string, meta?: any) => {
    if (!user || isProcessing) return;
    setIsProcessing(true);
    try {
      if (type === "todo") {
         await addDoc(collection(db, `users/${user.uid}/todos`), {
            title: content,
            status: "Todo",
            priority: "Medium",
            createdAt: serverTimestamp(),
         });
         router.push("/todos");
      } else if (type === "link") {
         await addDoc(collection(db, `users/${user.uid}/links`), {
            title: content.split("/").filter(Boolean).pop()?.split("?")[0] || "New Link",
            url: content.startsWith("http") ? content : `https://${content}`,
            category: "Inbox",
            pinned: false,
            createdAt: serverTimestamp(),
         });
         router.push("/links");
      } else if (type === "drive") {
         await addDoc(collection(db, `users/${user.uid}/drive`), {
            title: meta.title || content.split("/").filter(Boolean).pop()?.split("?")[0] || `New ${meta.type}`,
            url: content,
            type: meta.type,
            projectTag: "Inbox",
            createdAt: serverTimestamp(),
         });
         // Don't redirect if it's a deep search sync (we stay in the flow or open new tab)
         if (!meta.title) {
            router.push("/drive");
         } else {
            showToast(`"${meta.title}" synced to local archive`, "success");
         }
      }
      setIsOpen(false);
      setQueryText("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) results[selectedIndex].action();
    }
  };

  const groupedResults = results.reduce((acc: any, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl pointer-events-auto"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.99, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -10 }}
            className="bg-zinc-900/95 backdrop-blur-3xl w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-zinc-800/50 flex flex-col relative z-10"
          >
            <div className="flex items-center px-8 py-6 gap-4">
              <input 
                ref={inputRef}
                type="text"
                placeholder="Type a command or paste a link..."
                className="w-full bg-transparent border-none outline-none text-xl font-medium tracking-tight text-white placeholder:text-zinc-700"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-3">
              {results.length > 0 ? (
                Object.entries(groupedResults).map(([category, items]: [string, any]) => (
                  <div key={category} className="mb-4">
                    <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{category}</div>
                    {items.map((item: any) => {
                      const isSelected = results.indexOf(item) === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => item.action()}
                          className={cn(
                             "w-full flex items-center px-4 py-3 gap-4 rounded-xl transition-all text-left cursor-pointer group",
                             isSelected ? "bg-primary text-white" : "text-zinc-400 hover:bg-zinc-800/20 hover:text-white"
                          )}
                        >
                          <item.icon size={18} className={cn("shrink-0", isSelected ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                          <span className="font-medium text-sm capitalize truncate flex-1">{item.title}</span>
                          
                          <div className={cn(
                             "flex items-center gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100", 
                             isSelected && "opacity-100"
                          )}>
                             {item.source === "gdrive" && (
                                <>
                                   <button 
                                      onClick={(e) => { 
                                         e.stopPropagation(); 
                                         handleAction("drive", item.raw.webViewLink, { 
                                            type: item.raw.mimeType.includes("spreadsheet") ? "Sheet" : item.raw.mimeType.includes("presentation") ? "Slide" : item.raw.mimeType.includes("folder") ? "Folder" : "Doc", 
                                            title: item.title 
                                         });
                                      }}
                                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 border border-white/10"
                                      title="Add to Drive"
                                   >
                                      <HardDrive size={12} />
                                      <span className="text-[10px] font-bold uppercase">Drive</span>
                                   </button>
                                   <button 
                                      onClick={(e) => { 
                                         e.stopPropagation(); 
                                         handleAction("link", item.raw.webViewLink);
                                      }}
                                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 border border-white/10"
                                      title="Save to Vault"
                                   >
                                      <LinkIcon size={12} />
                                      <span className="text-[10px] font-bold uppercase">Vault</span>
                                   </button>
                                </>
                             )}
                             <ArrowRight size={14} className={cn("opacity-40", isSelected && "translate-x-1")} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-zinc-700 text-sm font-medium">No results found</div>
              )}
            </div>

            <div className="px-8 py-4 bg-zinc-950/50 border-t border-zinc-800/50 flex items-center justify-between">
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                     <kbd className="px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] font-bold text-zinc-500">↑↓</kbd>
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <kbd className="px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] font-bold text-zinc-500">Enter</kbd>
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Select</span>
                  </div>
               </div>
               
               <div className="flex gap-4 opacity-40 hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mr-2">System Shortcuts:</span>
                  <div className="flex items-center gap-1.5">
                     <kbd className="px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] font-bold text-zinc-500">^C</kbd>
                     <span className="text-[9px] font-bold text-zinc-600 uppercase">Copy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <kbd className="px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] font-bold text-zinc-500">^V</kbd>
                     <span className="text-[9px] font-bold text-zinc-600 uppercase">Link</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
