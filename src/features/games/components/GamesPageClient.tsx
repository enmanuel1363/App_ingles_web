"use client";

import React from "react";
import GameManager from "./GameManager";

type Props = {
  currentTeacherProfileId: string;
};

export default function GamesPageClient({ currentTeacherProfileId }: Props) {
  return (
    <div className="min-h-screen bg-[#fffcf2]">
      <GameManager currentTeacherProfileId={currentTeacherProfileId} />
    </div>
  );
}
