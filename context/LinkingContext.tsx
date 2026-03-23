"use client";

import React, { createContext, useContext, useState } from "react";

interface ResourceRef {
  id: string;
  type: "link" | "drive";
  title: string;
}

interface LinkingContextType {
  activeRef: ResourceRef | null;
  copyRef: (ref: ResourceRef) => void;
  clearRef: () => void;
}

const LinkingContext = createContext<LinkingContextType | undefined>(undefined);

export function LinkingProvider({ children }: { children: React.ReactNode }) {
  const [activeRef, setActiveRef] = useState<ResourceRef | null>(null);

  const copyRef = (ref: ResourceRef) => {
    setActiveRef(ref);
  };

  const clearRef = () => {
    setActiveRef(null);
  };

  return (
    <LinkingContext.Provider value={{ activeRef, copyRef, clearRef }}>
      {children}
    </LinkingContext.Provider>
  );
}

export function useLinking() {
  const context = useContext(LinkingContext);
  if (!context) throw new Error("useLinking must be used within LinkingProvider");
  return context;
}
