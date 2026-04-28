"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowLeft,
  Command as CommandIcon,
  Search,
  Zap,
  Terminal as TerminalIcon,
  CheckSquare,
  StickyNote,
  Hash,
  Keyboard,
  Link as LinkIcon,
  Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const GlitchText = ({ text }: { text: string }) => {
  return (
    <span className="relative inline-block group">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-primary opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] group-hover:-translate-y-[1px] transition-all duration-75">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 text-accent opacity-0 group-hover:opacity-70 group-hover:-translate-x-[2px] group-hover:translate-y-[1px] transition-all duration-75">
        {text}
      </span>
    </span>
  );
};

export default function HowToUse() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-primary selection:text-black overflow-x-hidden pb-40">
      
      {/* CRT Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] opacity-30" />

      {/* Decorative Grids */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(174,213,0,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-mesh opacity-10" />
      </div>

      <div className="relative z-10">
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 p-8 lg:px-16 flex justify-between items-center mix-blend-difference z-50">
          <Link href="/" className="group flex items-center gap-4 text-white hover:text-primary transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform">
              <ArrowLeft size={18} />
            </div>
            <span className="font-black tracking-tighter uppercase text-sm">Return_Home</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex flex-col items-end text-[8px] font-mono font-black tracking-[0.4em] uppercase opacity-40">
              <span>Station: 19-DELTA</span>
              <span>Manual: V1.0</span>
            </div>
            {!user && (
              <Link href="/login" className="px-6 py-2 rounded-full border border-white text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Access_Vault
              </Link>
            )}
          </div>
        </nav>

        {/* Header Section */}
        <section className="pt-40 px-8 lg:px-24 max-w-[1400px] mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3 text-primary font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-8">
              <TerminalIcon size={14} />
              <span>Operational_Guidelines</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter text-white uppercase italic">
              <GlitchText text="SYSTEM" /> <br/>PROTOCOL
            </h1>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto pt-4">
              Anchor19 is not a typical note-taking app. It is a high-speed command center. Learn the core protocols to execute without friction.
            </p>
        </section>

        {/* 1. Universal Search / Command Palette */}
        <section className="py-32 px-8 lg:px-24 max-w-[1200px] mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1 p-12 rounded-[3rem] bg-zinc-900/20 border border-zinc-800/40 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                   <CommandIcon size={120} />
                 </div>
                 
                 <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl relative z-10">
                    <div className="flex items-center gap-4 text-zinc-500 mb-6 border-b border-zinc-800 pb-4">
                       <Search size={18} />
                       <span className="font-mono text-sm">Search or jump to...</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                          <div className="flex items-center gap-3"><Zap size={16} /> <span className="font-bold text-sm">Todo Prepare presentation</span></div>
                          <kbd className="font-mono text-[10px] uppercase">↵ Execute</kbd>
                       </div>
                       <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 text-zinc-400">
                          <div className="flex items-center gap-3"><StickyNote size={16} /> <span className="font-bold text-sm">Note Meeting minutes</span></div>
                       </div>
                       <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 text-zinc-400">
                          <div className="flex items-center gap-3"><CommandIcon size={16} /> <span className="font-bold text-sm">dark mode</span></div>
                       </div>
                    </div>
                 </div>
             </div>
             
             <div className="order-1 lg:order-2 space-y-6">
                <span className="text-accent font-black uppercase tracking-[0.4em] text-[10px] font-mono">01 // COMMAND_CENTER</span>
                <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-white uppercase">The Palette.</h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  Your mouse is too slow. The Command Palette is the nervous system of Anchor19. It instantly searches notes, tasks, files, and links.
                </p>
                
                <div className="space-y-4 pt-4">
                   <div className="flex items-start gap-4 border-b border-zinc-900/50 pb-4">
                     <kbd className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold whitespace-nowrap shadow-md text-sm">Ctrl + K</kbd>
                     <div>
                       <h4 className="text-white font-bold uppercase tracking-widest text-xs">Summon the Palette</h4>
                       <p className="text-zinc-500 text-sm mt-1">Works globally. Type to instantly search across all Projects, Notes, Links, and Drive files.</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-4 border-b border-zinc-900/50 pb-4">
                     <span className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-primary font-mono font-bold whitespace-nowrap shadow-md text-sm">todo [text]</span>
                     <div>
                       <h4 className="text-white font-bold uppercase tracking-widest text-xs">Fast Creation</h4>
                       <p className="text-zinc-500 text-sm mt-1">Type <code>todo [task]</code> or <code>note [content]</code> to instantly create items.</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-4 border-b border-zinc-900/50 pb-4">
                     <span className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold whitespace-nowrap shadow-md text-sm">rename @[item] to @[name]</span>
                     <div>
                       <h4 className="text-white font-bold uppercase tracking-widest text-xs">NLP Rename</h4>
                       <p className="text-zinc-500 text-sm mt-1">Use <code>@</code> to mention any item in your workspace and rename it instantly.</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-4 border-b border-zinc-900/50 pb-4">
                     <span className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold whitespace-nowrap shadow-md text-sm">move @[item] to @[project]</span>
                     <div>
                       <h4 className="text-white font-bold uppercase tracking-widest text-xs">NLP Organization</h4>
                       <p className="text-zinc-500 text-sm mt-1">Move a note, task, or file into a specific Project Silo without dragging.</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-4 border-b border-zinc-900/50 pb-4">
                     <span className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-accent font-mono font-bold whitespace-nowrap shadow-md text-sm">frame: [tone] [text]</span>
                     <div>
                       <h4 className="text-white font-bold uppercase tracking-widest text-xs">AI Text Framing</h4>
                       <p className="text-zinc-500 text-sm mt-1">Type <code>frame: formal [text]</code> or <code>frame: casual [text]</code> to have AI rewrite it and copy to clipboard.</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-4 border-b border-zinc-900/50 pb-4">
                     <span className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-red-500 font-mono font-bold whitespace-nowrap shadow-md text-sm">del @[item]</span>
                     <div>
                       <h4 className="text-white font-bold uppercase tracking-widest text-xs">NLP Deletion</h4>
                       <p className="text-zinc-500 text-sm mt-1">Type <code>delete @[item]</code> to quickly purge a specific record from the system.</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-4">
                     <kbd className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold whitespace-nowrap shadow-md text-sm">Ctrl + Z</kbd>
                     <div>
                       <h4 className="text-white font-bold uppercase tracking-widest text-xs">System Undo</h4>
                       <p className="text-zinc-500 text-sm mt-1">Press <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Ctrl+Z</kbd> outside the palette to instantly undo the last deletion, rename, or move.</p>
                     </div>
                   </div>
                </div>
             </div>
           </div>
        </section>

        {/* 2. The Core Loop */}
        <section className="py-32 px-8 lg:px-24 max-w-[1200px] mx-auto border-t border-zinc-900/50">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             
             <div className="space-y-6">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] font-mono">02 // DATA_INGESTION</span>
                <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-white uppercase">Quick Capture.</h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  Ideas are volatile. When a thought hits, you need to save it before the context is lost. Do not organize. Just capture.
                </p>
                <div className="flex flex-col gap-6 pt-4">
                   <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                     <div className="flex items-center gap-3 text-white mb-2"><CheckSquare size={18} className="text-primary" /> <h4 className="font-bold uppercase tracking-widest text-xs">Dashboard Input</h4></div>
                     <p className="text-sm text-zinc-500">The main dashboard has a massive input field. Type a task, hit Enter. It's immediately logged as an active objective.</p>
                   </div>
                   <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                     <div className="flex items-center gap-3 text-white mb-2"><Keyboard size={18} className="text-accent" /> <h4 className="font-bold uppercase tracking-widest text-xs">Auto-Save Editor</h4></div>
                     <p className="text-sm text-zinc-500">Notes save themselves 3 seconds after you stop typing. The system handles the persistence; you handle the thinking.</p>
                   </div>
                </div>
             </div>

             <div className="p-12 rounded-[3rem] bg-zinc-900/20 border border-zinc-800/40 backdrop-blur-3xl relative overflow-hidden group shadow-2xl flex flex-col gap-6">
                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <Plus size={16} className="text-primary" />
                   </div>
                   <input 
                     type="text"
                     disabled
                     value="Initialize new objective..."
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-zinc-600 outline-none"
                   />
                </div>
                <div className="p-4 rounded-xl bg-zinc-950/50 border border-dashed border-zinc-800 flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(209,255,0,0.8)]" />
                   <span className="text-xs font-mono font-bold text-white tracking-widest uppercase">System Syncing...</span>
                </div>
             </div>
             
           </div>
        </section>

        {/* 3. Project Tags */}
        <section className="py-32 px-8 lg:px-24 max-w-[1200px] mx-auto border-t border-zinc-900/50">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1 p-12 rounded-[3rem] bg-zinc-900/20 border border-zinc-800/40 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 w-fit">
                      <Hash size={14} className="text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-white">MARKETING_Q3</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 w-fit opacity-70">
                      <Hash size={14} className="text-accent" />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-300">SYSTEM_REFACTOR</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 w-fit opacity-40">
                      <Hash size={14} className="text-zinc-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-500">GENERAL</span>
                    </div>
                 </div>
             </div>
             
             <div className="order-1 lg:order-2 space-y-6">
                <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] font-mono">03 // ORGANIZATION</span>
                <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-white uppercase">The Silos.</h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  Folders are rigid. Anchor19 uses Project Tags (`#`) to group context. A single word links Notes, Tasks, and Links together across the platform.
                </p>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                  In the note editor, look for the Hash icon in the top left. Type a project name (like <span className="text-primary">ALPHA</span>). Now, when you search "Alpha" in the Command Palette, that note will immediately surface.
                </p>
             </div>
           </div>
        </section>

      </div>
    </div>
  );
}
