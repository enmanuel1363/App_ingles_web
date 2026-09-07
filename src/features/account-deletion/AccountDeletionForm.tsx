"use client";

import Button from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AccountDeletionForm() {
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isValidEmail && confirmed && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("https://formsubmit.co/ajax/learnix737@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: "Nueva solicitud de eliminación de cuenta — Zóe App",
          correo_de_la_cuenta: email.trim(),
          confirmacion: "El usuario aceptó que la eliminación es irreversible.",
        }),
      });

      if (!res.ok) throw new Error("No se pudo enviar la solicitud.");
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.message ||
          "No se pudo enviar tu solicitud. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-800 mb-1">
            Solicitud enviada correctamente
          </p>
          <p className="text-sm text-emerald-700 leading-relaxed">
            Hemos recibido tu solicitud para el correo{" "}
            <strong>{email}</strong>. Será procesada en un plazo máximo de 14
            días hábiles. No necesitas hacer nada más.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-bold text-slate-900 mb-2"
        >
          Correo electrónico vinculado a la cuenta en la app{" "}
          <span className="text-rose-600">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-slate-300 text-cyan-650 focus:ring-cyan-500/40"
        />
        <span className="text-sm text-slate-700 leading-relaxed">
          Entiendo que al proceder se eliminará mi cuenta de forma
          irreversible. <span className="text-rose-600">*</span>
        </span>
      </label>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="danger"
        disabled={!canSubmit}
        isLoading={isSubmitting}
        leftIcon={!isSubmitting && <Trash2 className="w-4 h-4" />}
        className="w-full py-3.5"
      >
        Solicitar eliminación de cuenta
      </Button>
    </form>
  );
}
