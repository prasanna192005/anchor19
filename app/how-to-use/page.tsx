"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Command as CommandIcon, Search, Zap, 
  Terminal as TerminalIcon, CheckSquare, StickyNote, 
  Hash, Keyboard, Link as LinkIcon, Plus, BookOpen,
  MousePointer2, Network, Clock, Edit3, Code, MessageSquare
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const sections = [
  { id: "intro", title: "00. Getting Started", icon: BookOpen },
  { id: "palette", title: "01. Command Palette", icon: CommandIcon },
  { id: "navigation", title: "02. UI & Navigation", icon: MousePointer2 },
  { id: "editor", title: "03. Rich Text & Slash Commands", icon: Edit3 },
  { id: "canvas", title: "04. Infinite Canvas", icon: Network },
  { id: "vault", title: "05. Resource Vault", icon: LinkIcon },
  { id: "timeline", title: "06. Activity Trace", icon: Clock },
];

export default function HowToUse() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");

  useEffect(() => setMounted(true), []);

  // ScrollSpy Logic
  useEffect(() => {
    const observers = new Map();
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-primary selection:text-black overflow-x-hidden pb-40">
      
      {/* Background Grids */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(174,213,0,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-mesh opacity-[0.03]" />
      </div>

      {/* Top Navigation */}
      <nav className="w-full p-8 lg:px-16 flex justify-between items-center mix-blend-difference z-50 pointer-events-none absolute top-0 left-0 right-0">
        <Link href="/" className="group flex items-center gap-4 text-white hover:text-primary transition-colors pointer-events-auto">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform">
            <ArrowLeft size={18} />
          </div>
          <span className="font-black tracking-tighter uppercase text-sm">Return_Home</span>
        </Link>
        
        <div className="flex items-center gap-6 pointer-events-auto">
          {!user && (
            <Link href="/login" className="px-6 py-2 rounded-full border border-white text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Access_Vault
            </Link>
          )}
        </div>
      </nav>

      <div className="relative z-10 flex max-w-[1600px] mx-auto pt-24 h-screen">
        
        {/* Left Sidebar (Sticky) */}
        <aside className="w-72 hidden lg:flex flex-col shrink-0 h-[calc(100vh-6rem)] sticky top-24 px-12 py-10 border-r border-white/5 custom-scrollbar">
          <div className="mb-10">
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic">Manual.</h2>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] mt-1">Anchor19 Engine</p>
          </div>

          <div className="flex flex-col gap-2">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-sm font-bold uppercase tracking-wider relative overflow-hidden group",
                    isActive ? "text-primary bg-primary/10 border border-primary/20" : "text-zinc-500 hover:text-white hover:bg-zinc-900/50 border border-transparent"
                  )}
                >
                  <Icon size={16} className={cn("shrink-0 transition-colors", isActive ? "text-primary" : "text-zinc-600 group-hover:text-white")} />
                  <span className="relative z-10">{section.title.split('. ')[1]}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="doc-nav-glow"
                      className="absolute left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(209,255,0,0.8)]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Documentation Content */}
        <main className="flex-1 px-8 lg:px-24 py-10 pb-64 overflow-y-auto custom-scrollbar h-[calc(100vh-6rem)] scroll-smooth">
          
          {/* 00. Intro */}
          <section id="intro" className="mb-32 scroll-mt-32">
            <div className="flex items-center gap-3 text-primary font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              <TerminalIcon size={14} /> <span>00 // Getting_Started</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-white uppercase italic mb-8">
              Welcome to<br/>Anchor19.
            </h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-xl text-zinc-400 font-medium leading-relaxed mb-6">
                Anchor19 is a high-speed, local-first command center designed for rapid thought capture and seamless organization. 
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-3">For New Users</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Think of Anchor19 as your digital brain. Don't worry about organizing things into strict folders. Just dump your notes, links, and tasks into the dashboard, and use the powerful search to find them later.
                  </p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
                  <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-3">For Techies</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Anchor19 relies on NLP (Natural Language Processing) and keyboard-first interactions. Every note or task is a node in a flat graph, bound together by metadata tags rather than hierarchical file paths.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 01. Palette */}
          <section id="palette" className="mb-32 scroll-mt-32">
             <div className="flex items-center gap-3 text-accent font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              <CommandIcon size={14} /> <span>01 // Core_Engine</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase mb-8">The Command Palette.</h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              The mouse is slow. The Command Palette is the nervous system of Anchor19. Press <kbd className="px-2 py-1 bg-zinc-800 rounded font-mono text-white text-sm border border-zinc-700 mx-1 shadow-sm">Ctrl + K</kbd> anywhere in the app to summon it.
            </p>

            <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[2rem] p-8 lg:p-12 backdrop-blur-sm relative overflow-hidden mb-12">
              <div className="absolute -right-10 -top-10 opacity-[0.03]">
                <CommandIcon size={250} />
              </div>
              <h3 className="text-white font-bold text-xl mb-6">NLP Commands Reference</h3>
              <div className="space-y-4 relative z-10">
                <CommandRow 
                  cmd="todo [task]" 
                  desc="Instantly creates a new checkbox task on your dashboard." 
                  example="todo Prepare Q3 presentation for marketing"
                />
                <CommandRow 
                  cmd="note [title]" 
                  desc="Creates a fresh markdown note and opens the editor." 
                  example="note Meeting minutes 05/12"
                />
                <CommandRow 
                  cmd="rename @[item] to [new]" 
                  desc="Selects an existing node and renames it without opening it." 
                  example="rename @Meeting_Notes to @Archived_Notes"
                  highlight
                />
                <CommandRow 
                  cmd="move @[item] to @[project]" 
                  desc="Transfers an item into a project silo without drag-and-drop." 
                  example="move @Wireframes to @Project_Apollo"
                  highlight
                />
                <CommandRow 
                  cmd="del @[item]" 
                  desc="Rapid deletion of an item." 
                  example="del @Old_Invoice"
                  alert
                />
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 text-primary">
              <p className="text-sm font-bold flex items-center gap-3">
                <Zap size={18} /> Pro Tip: You can press Tab while typing a command to auto-complete it!
              </p>
            </div>
          </section>

          {/* 02. Navigation */}
          <section id="navigation" className="mb-32 scroll-mt-32">
             <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              <MousePointer2 size={14} /> <span>02 // Interface</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase mb-8">Adaptive Navigation.</h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              Anchor19 respects your screen real estate. The sidebar adapts to your working style dynamically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-6">
                  <MousePointer2 className="text-white" size={20} />
                </div>
                <h3 className="text-white font-black text-xl uppercase mb-3">Hover to Peek</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                  By default, the sidebar is collapsed to maximize your workspace. Simply move your mouse over the icons on the left edge, and the sidebar will smoothly expand over the content to reveal full labels.
                </p>
              </div>

              <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Keyboard className="text-primary" size={20} />
                </div>
                <h3 className="text-white font-black text-xl uppercase mb-3">Pin with Ctrl+B</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                  Doing heavy navigation? Press <kbd className="font-mono text-xs text-white bg-zinc-800 px-1.5 py-0.5 rounded mx-1">Ctrl+B</kbd> (or Cmd+B) anywhere. The sidebar will permanently lock into the expanded state and push your dashboard content over perfectly.
                </p>
              </div>
            </div>
          </section>

          {/* 03. Editor */}
          <section id="editor" className="mb-32 scroll-mt-32">
             <div className="flex items-center gap-3 text-secondary font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              <Edit3 size={14} /> <span>03 // Knowledge_Capture</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase mb-8">Slash Commands.</h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              The Notes editor is powered by a high-performance, Notion-style slash command engine. Keep your hands on the keyboard and format at the speed of thought.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50">
                  <h3 className="text-white font-bold text-xl mb-4">Type <kbd className="px-2 py-1 bg-zinc-800 rounded font-mono text-white text-sm border border-zinc-700 mx-1">/</kbd> to open</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                     Type <code className="text-primary bg-primary/10 px-1 rounded">/</code> anywhere in your note to instantly summon the floating block menu. Use your arrow keys to navigate and hit Enter to inject complex blocks.
                  </p>
                  <ul className="space-y-3 text-sm text-zinc-400">
                     <li className="flex items-center gap-3"><CheckSquare size={16} className="text-primary"/> <strong>Checklists:</strong> Interactive task lists</li>
                     <li className="flex items-center gap-3"><Code size={16} className="text-zinc-300"/> <strong>Code Blocks:</strong> Monospace pre-formatted blocks</li>
                     <li className="flex items-center gap-3"><MessageSquare size={16} className="text-secondary"/> <strong>Callouts:</strong> Highlighted attention blocks</li>
                  </ul>
               </div>

               <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50">
                  <h3 className="text-white font-bold text-xl mb-4">Block Escaping</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                     Got stuck inside a Code Block or Callout? We've engineered robust escape hatches to keep you moving smoothly.
                  </p>
                  <ul className="space-y-4">
                     <li className="flex gap-4">
                       <kbd className="px-2 py-1 bg-zinc-800 rounded font-mono text-white text-xs border border-zinc-700 h-fit">Esc</kbd>
                       <span className="text-zinc-500 text-sm">Instantly jump out of the current block into the normal editor below it.</span>
                     </li>
                     <li className="flex gap-4">
                       <kbd className="px-2 py-1 bg-zinc-800 rounded font-mono text-white text-xs border border-zinc-700 h-fit whitespace-nowrap">Shift+Enter</kbd>
                       <span className="text-zinc-500 text-sm">Force split the block and exit below without breaking your flow.</span>
                     </li>
                  </ul>
               </div>
            </div>
          </section>

          {/* 04. Canvas */}
          <section id="canvas" className="mb-32 scroll-mt-32">
             <div className="flex items-center gap-3 text-accent font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              <Network size={14} /> <span>03 // Spatial_UI</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase mb-8">Infinite Canvas.</h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              The <strong>Projects</strong> view ditches the standard list view for a fully functional spatial canvas powered by React Flow.
            </p>

            <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[2rem] p-8 backdrop-blur-sm relative overflow-hidden">
               <ul className="space-y-6">
                 <li className="flex gap-4">
                   <div className="mt-1 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-white text-xs font-bold">1</div>
                   <div>
                     <h4 className="text-white font-bold text-lg mb-1">Spatial Memory</h4>
                     <p className="text-zinc-500 text-sm">Humans remember *where* things are better than *what* they are named. Drag project nodes around the canvas to group related initiatives physically.</p>
                   </div>
                 </li>
                 <li className="flex gap-4">
                   <div className="mt-1 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-white text-xs font-bold">2</div>
                   <div>
                     <h4 className="text-white font-bold text-lg mb-1">Edge Connections</h4>
                     <p className="text-zinc-500 text-sm">Click and drag between handles on project cards to draw relationships between them, creating a visual map of dependencies.</p>
                   </div>
                 </li>
                 <li className="flex gap-4">
                   <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                   <div>
                     <h4 className="text-white font-bold text-lg mb-1">Deep Dive</h4>
                     <p className="text-zinc-500 text-sm">Double-click any project node to dive into its dedicated silo, filtering all tasks, notes, and links globally to match that project.</p>
                   </div>
                 </li>
               </ul>
            </div>
          </section>

          {/* 05. Vault */}
          <section id="vault" className="mb-32 scroll-mt-32">
             <div className="flex items-center gap-3 text-primary font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              <LinkIcon size={14} /> <span>04 // Resources</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase mb-8">The Vault.</h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              The <strong>Links</strong> section is your curated resource vault. We automatically pull favicons and organize your links into perfectly aligned masonry grids.
            </p>
            
            <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50">
               <h3 className="text-white font-bold text-xl mb-4">Tag Filtering</h3>
               <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                 When saving a link, assign it a tag (like <code className="text-primary bg-primary/10 px-1 rounded">DevTools</code> or <code className="text-accent bg-accent/10 px-1 rounded">Inspo</code>). The vault automatically generates a horizontally scrolling filter bar at the top of the page. Click a tag to instantly filter your massive link library without reloading.
               </p>
               <h3 className="text-white font-bold text-xl mb-4">Right-Click Context Menu</h3>
               <p className="text-zinc-500 text-sm leading-relaxed">
                 Don't forget to right-click links! The custom context menu lets you copy the URL, edit the metadata, or pin the link to the top of your vault.
               </p>
            </div>
          </section>

          {/* 06. Timeline */}
          <section id="timeline" className="mb-32 scroll-mt-32">
             <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              <Clock size={14} /> <span>05 // Auditing</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase mb-8">Activity Trace.</h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              The <strong>History</strong> page provides an immutable, chronological trace of your interactions. Every time you open a note, click a link, or modify a task, the engine silently logs it. Use this to retrace your steps or remember what you were working on yesterday.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}

// Helper component for the Command Palette section
function CommandRow({ cmd, desc, example, highlight = false, alert = false }: { cmd: string, desc: string, example: string, highlight?: boolean, alert?: boolean }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-4 p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="md:w-1/3 shrink-0">
        <code className={cn(
          "px-3 py-1.5 rounded-lg font-mono font-bold text-sm inline-block shadow-sm",
          alert ? "bg-red-500/10 text-red-500 border border-red-500/20" :
          highlight ? "bg-white/5 text-white border border-white/10" :
          "bg-primary/10 text-primary border border-primary/20"
        )}>
          {cmd}
        </code>
      </div>
      <div className="md:w-2/3">
        <p className="text-white font-medium text-sm mb-2">{desc}</p>
        <p className="text-zinc-500 text-xs font-mono bg-black/50 p-2 rounded-lg border border-white/5 truncate">
          <span className="opacity-50 select-none">{'> '}</span>{example}
        </p>
      </div>
    </div>
  );
}
