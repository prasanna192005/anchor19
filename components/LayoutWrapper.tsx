"use client";

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
  
  const isLoginPage = pathname === "/login";
  const showSidebar = user && !isLoginPage;

  return (
    <>
      {showSidebar && <Navbar />}
      <main className={cn("relative flex-1 min-h-screen transition-all duration-500", showSidebar && "pl-20 lg:pl-64")}>
        {children}
      </main>
    </>
  );
}
