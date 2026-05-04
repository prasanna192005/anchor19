"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  // Sidebar is pinned open by default on large screens
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isLoginPage = pathname === "/login";
  const showSidebar = user && !isLoginPage;

  const isExpanded = isPinned || isHovered;

  // Global Ctrl+B shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsPinned(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {showSidebar && (
        <Navbar 
          isPinned={isPinned} 
          onHoverChange={setIsHovered}
        />
      )}
      <main className={cn(
        "relative flex-1 min-h-screen transition-all duration-500", 
        showSidebar && (isExpanded ? "pl-20 lg:pl-64" : "pl-20")
      )}>
        {children}
      </main>
    </>
  );
}
