"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Command as CommandIcon,
  Search,
  Zap,
  Shield,
  Layers,
  Cpu,
  Terminal as TerminalIcon,
  Activity,
  ChevronRight,
  Plus,
  Box,
  Fingerprint
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// --- Components ---

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

const StatCard = ({ label, value, sub }: { label: string, value: string, sub: string }) => (
  <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md flex flex-col gap-2">
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 font-mono">{label}</span>
    <div className="text-5xl font-black text-white tracking-tighter tabular-nums">{value}</div>
    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{sub}</span>
  </div>
);

// --- Page ---

export default function WhyAnchor19() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      
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
              <span>Status: Authorized</span>
            </div>
            {!user && (
              <Link href="/login" className="px-6 py-2 rounded-full border border-white text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Access_Vault
              </Link>
            )}
          </div>
        </nav>

        {/* The Manifesto Section */}
        <section className="py-40 pt-60 px-8 lg:px-24 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="sticky top-40 space-y-12">
             <div className="space-y-4">
               <span className="text-accent font-black uppercase tracking-[0.4em] text-[10px] font-mono">01 // THE_MANIFESTO</span>
               <h2 className="text-6xl lg:text-8xl font-black tracking-tighter text-white leading-none uppercase">The Noise <br/>Is Fatal.</h2>
             </div>
             <p className="text-xl lg:text-2xl text-zinc-500 leading-relaxed font-medium">
                Modern productivity is a lie. We are sold "features" that are actually distractions. True performance comes from a lack of friction.
             </p>
             <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs">
                   <ChevronRight size={16} className="text-primary" />
                   <span>Tabs are cognitive debt.</span>
                </div>
                <div className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs">
                   <ChevronRight size={16} className="text-primary" />
                   <span>Notification silos destroy focus.</span>
                </div>
                <div className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs">
                   <ChevronRight size={16} className="text-primary" />
                   <span>The GUI is too slow for the mind.</span>
                </div>
             </div>
          </div>

          <div className="space-y-32 pt-20 lg:pt-0">
             <div className="p-12 rounded-[3rem] bg-zinc-900/20 border border-zinc-800/40 backdrop-blur-3xl space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Fingerprint size={80} className="text-primary" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">The 50-Tab Epidemic</h3>
                <p className="text-lg leading-relaxed">
                  Your brain was never meant to track 50 disparate browser tabs across 4 windows. Anchor19 collapses the browser into a unified project context. If you need it, it's there. If you don't, it doesn't exist.
                </p>
             </div>

             <div className="p-12 rounded-[3rem] bg-zinc-900/20 border border-zinc-800/40 backdrop-blur-3xl space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Box size={80} className="text-accent" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Project Silos</h3>
                <p className="text-lg leading-relaxed">
                  Context switching is the primary cause of burnout. We built Anchor19 to isolate projects into secure silos. Switch contexts via a single keystroke, and watch the entire environment adapt to your current goal.
                </p>
             </div>

             <div className="p-12 rounded-[3rem] bg-zinc-900/20 border border-zinc-800/40 backdrop-blur-3xl space-y-8 relative overflow-hidden group border-primary/20 bg-primary/5">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity">
                   <TerminalIcon size={80} className="text-primary" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Terminal Philosophy</h3>
                <p className="text-lg leading-relaxed">
                  We returned to the terminal aesthetic because it works. It is high-contrast, low-latency, and text-driven. It forces clarity. It commands focus.
                </p>
             </div>
          </div>
        </section>

        {/* Interactive Stats Banner */}
        <section className="bg-zinc-900/50 border-y border-zinc-900 py-24 px-8 lg:px-24">
           <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
              <StatCard label="Response_Time" value="<2ms" sub="ZERO LATENCY INPUT" />
              <StatCard label="Project_Density" value="∞" sub="UNLIMITED CONTEXTS" />
              <StatCard label="Cognitive_Load" value="-80%" sub="REDUCED MENTAL DRAG" />
           </div>
        </section>

        {/* Features Matrix */}
        <section className="py-40 px-8 lg:px-24 max-w-[1400px] mx-auto">
           <div className="mb-24 space-y-4 text-center">
             <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] font-mono">02 // SYSTEM_SPECS</span>
             <h2 className="text-5xl lg:text-8xl font-black tracking-tighter text-white uppercase italic">Built For Execution.</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Universal Search", icon: Search, desc: "Press Ctrl+K to find notes, links, or files across all integrated systems in real-time." },
                { title: "Deep Integration", icon: Layers, desc: "Native support for Google Drive, Figma, and GitHub. No more searching across 5 dashboards." },
                { title: "Keyboard Flow", icon: Cpu, desc: "Designed for power users. Execute every action via keyboard shortcuts with zero mouse reliance." },
                { title: "Project Vaults", icon: Shield, desc: "Your data is yours. Encrypted local-first architecture for the security of your mental models." },
                { title: "Quick Capture", icon: Zap, desc: "Flash-save thoughts and links directly into specific projects without breaking your flow." },
                { title: "Focus Mode", icon: TerminalIcon, desc: "A distraction-free terminal aesthetic that hides everything but the task at hand." }
              ].map((feat, i) => (
                <div key={i} className="p-10 rounded-[2rem] bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all flex flex-col gap-6 group">
                   <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-primary transition-colors">
                     <feat.icon size={24} />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-xl font-black text-white uppercase tracking-tight">{feat.title}</h4>
                     <p className="text-sm leading-relaxed text-zinc-500">{feat.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* The High-Contrast Green Section (The "Cool" Thing) */}
        <section className="py-40 px-8 lg:px-24 bg-primary text-black overflow-hidden relative rounded-[3rem] mx-8 lg:mx-16">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
            <div className="space-y-10">
              <span className="font-black uppercase tracking-[0.4em] text-[10px] font-mono opacity-60">03 // THE_IDENTITY</span>
              <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-[0.8] uppercase italic">The Bunker <br/>Identity.</h2>
              <p className="text-2xl font-black max-w-lg leading-tight uppercase">
                 Focus is not about what you look at. It's about what you can afford to ignore.
              </p>
              <div className="pt-4">
                 <div className="inline-block px-8 py-4 bg-black text-primary font-black uppercase tracking-[0.2em] text-xs rounded-xl">
                    SYSTEM_PROTOCOL_ACTIVE
                 </div>
              </div>
            </div>
            <div className="relative">
               <div className="aspect-video bg-black rounded-[2rem] border-[12px] border-black/10 shadow-2xl flex flex-col p-8 lg:p-12 justify-center">
                   <div className="space-y-4 font-mono text-xs lg:text-sm text-zinc-700 font-black uppercase">
                     <p>{`> INIT_SYSTEM_CORE()`}</p>
                     <p className="text-primary">{`> STATUS: OPTIMIZED`}</p>
                     <p>{`> CACHE_PURGE... [DONE]`}</p>
                     <p>{`> LOADING_VAULT... [OK]`}</p>
                     <p className="text-white mt-12">{`// Noise is the enemy of progress.`}</p>
                     <p className="text-white">{`// We built a bunker to stop it.`}</p>
                   </div>
               </div>
            </div>
          </div>
          {/* Decorative Elements for the Green Section */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-10 blur-[150px] -mr-64 -mt-64 rounded-full" />
        </section>

        {/* CTA Footer */}
        <footer className="py-40 px-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
           <div className="absolute inset-0 z-0 opacity-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/20 blur-[200px] rounded-full" />
           </div>
           
           <div className="relative z-10 space-y-12 max-w-2xl">
              <h3 className="text-5xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-none italic">Ground Your <br/>Digital Storm.</h3>
              <p className="text-xl text-zinc-500 font-medium">
                Anchor19 is currently in private access. Join the waitlist to receive your activation key.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href={user ? "/" : "/login"} className="px-12 py-5 bg-primary text-black font-black uppercase tracking-widest text-lg rounded-2xl hover:scale-105 transition-all shadow-glow">
                    {user ? "Back_To_Terminal" : "Request_Access"}
                 </Link>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800 pt-20">ANCHOR19 // EST. 2026 // NOISE_FREE_ZONE</p>
           </div>
        </footer>

      </div>
    </div>
  );
}
