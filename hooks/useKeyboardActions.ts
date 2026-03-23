"use client";

import { useEffect } from "react";

interface KeyboardActions {
  onCopy?: () => void;
  onRename?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
}

export function useKeyboardActions({ onCopy, onRename, onPaste, onDelete }: KeyboardActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for CTRL/CMD key
      const isCmd = e.ctrlKey || e.metaKey;

      if (isCmd && e.key.toLowerCase() === "c" && onCopy) {
        // Only trigger if no text is selected on the page
        if (!window.getSelection()?.toString()) {
          e.preventDefault();
          onCopy();
        }
      }

      if (isCmd && e.key.toLowerCase() === "r" && onRename) {
        e.preventDefault();
        onRename();
      }

      if (isCmd && e.key.toLowerCase() === "v" && onPaste) {
        e.preventDefault();
        onPaste();
      }

      if (e.key === "Delete" && onDelete) {
        e.preventDefault();
        onDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCopy, onRename, onPaste, onDelete]);
}
