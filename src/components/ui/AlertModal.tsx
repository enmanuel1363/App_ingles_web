"use client";

import React from "react";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";
import Button from "./Button";

export type AlertType = "success" | "error" | "info";

type AlertModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
};

export default function AlertModal({
  visible,
  onClose,
  title,
  message,
  type = "info",
  buttonText = "Aceptar",
}: AlertModalProps) {
  if (!visible) return null;

  // Icon and color configuration based on alert type
  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-8 h-8" />,
      iconClass: "bg-emerald-50 text-emerald-500 border border-emerald-100",
      defaultTitle: "Éxito",
      buttonVariant: "primary" as const,
    },
    error: {
      icon: <XCircle className="w-8 h-8" />,
      iconClass: "bg-rose-50 text-rose-500 border border-rose-100",
      defaultTitle: "Error",
      buttonVariant: "danger" as const,
    },
    info: {
      icon: <Info className="w-8 h-8" />,
      iconClass: "bg-cyan-50 text-cyan-500 border border-cyan-100",
      defaultTitle: "Información",
      buttonVariant: "outlined" as const,
    },
  };

  const currentConfig = typeConfig[type];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 relative animate-scale-up text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-55 transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Status Icon */}
          <div className={`p-4 rounded-full ${currentConfig.iconClass}`}>
            {currentConfig.icon}
          </div>

          <div className="space-y-2 w-full">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {title || currentConfig.defaultTitle}
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed break-words whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-center pt-2">
          <Button
            variant={currentConfig.buttonVariant}
            onClick={onClose}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
