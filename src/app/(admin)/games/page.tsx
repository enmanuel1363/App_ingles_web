"use client";

import React from "react";
import { useAuth } from "@/features/login/hooks/useAuth";
import { GameManager } from "@/features/games";

export default function GamesPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-slate-800">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#24DFE2] rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-500 text-sm">Validating host session...</p>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl max-w-md mx-auto my-12 shadow-sm">
        <h3 className="text-lg font-black text-slate-800">Authentication Required</h3>
        <p className="text-slate-500 text-xs mt-2">
          Please log in with your teacher credentials to access the Game Center.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf2]">
      <GameManager currentTeacherProfileId={session.user.id} />
    </div>
  );
}

