"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Trap focus / scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="hd-modal-overlay"
      role="dialog"
      aria-modal
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="hd-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-5)",
          }}
        >
          <h2
            id="modal-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: "var(--w-semibold)" as React.CSSProperties["fontWeight"],
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: "var(--leading-tight)",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "var(--touch-min)",
              minHeight: "var(--touch-min)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "var(--text-xl)",
              lineHeight: 1,
              borderRadius: "var(--radius-md)",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
