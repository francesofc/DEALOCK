"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface EditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  disabled?: boolean;
}

export function EditDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSave,
  isSaving = false,
  saveLabel,
  disabled = false,
}: EditDrawerProps) {
  const { t } = useTranslation();
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-xl bg-[#0d0d0f] border-l border-white/[0.06] z-50",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/[0.04]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/[0.06]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 hover:bg-white/[0.04]"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || disabled}
            data-testid="drawer-save-button"
            className="bg-white text-black hover:bg-white/90 disabled:opacity-50"
          >
            {isSaving ? `${t.common.save}...` : (saveLabel || t.common.save)}
          </Button>
        </div>
      </div>
    </>
  );
}
