"use client";

import React, { useEffect, useRef } from "react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  icon?: string;
  isLoading?: boolean;
}

const VARIANT_COLORS: Record<
  NonNullable<ConfirmationModalProps["variant"]>,
  string
> = {
  danger: "#FF0000",
  warning: "#d97706",
  info: "#149A9B",
};

function hexToRgba(hex: string, alpha = 0.08) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon,
  isLoading = false,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleId = "confirmation-modal-title";
  const descriptionId = "confirmation-modal-description";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      // focus modal for a11y
      setTimeout(() => rootRef.current?.focus(), 0);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const color = VARIANT_COLORS[variant];
  const iconBg = hexToRgba(color, 0.12);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = async () => {
    // allow parent to control loading via isLoading prop
    try {
      const res = onConfirm();
      if (res && typeof (res as Promise<void>).then === "function") {
        await res;
      }
    } catch (err) {
      // swallow - parent can surface errors
      // keep modal open so parent may update state
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        ref={rootRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md mx-4 p-6 rounded-2xl bg-white shadow-raised animate-scale-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 rounded-full p-1"
        >
          ✕
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          {icon ? (
            <div
              style={{ backgroundColor: iconBg, color }}
              className="p-3 rounded-full border border-current/10"
            >
              {/* if icon is a path, render image; otherwise don't render */}
              <img src={icon} alt="icon" className="w-6 h-6" />
            </div>
          ) : null}

          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>

          <p id={descriptionId} className="text-sm text-slate-600">
            {message}
          </p>

          <div className="w-full flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium border shadow-sunken-subtle"
            >
              {cancelText}
            </button>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{confirmText}</span>
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


