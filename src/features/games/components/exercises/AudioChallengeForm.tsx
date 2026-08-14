"use client";

import React from "react";
import MatchAudioToTextForm from "./listening/MatchAudioToTextForm";
import IdentifyAudioForm from "./listening/IdentifyAudioForm";
import FastAudioModeForm from "./listening/FastAudioModeForm";

interface AudioChallengeFormProps {
  subtype: string;
  content: {
    audioUrl?: File | string;
    options?: string[];
    correctAnswer?: string;
    playbackRate?: number;
    items?: { phrase: string; answer: string }[];
  };
  onChangeContent: (content: any) => void;
}

export default function AudioChallengeForm({
  subtype,
  content,
  onChangeContent,
}: AudioChallengeFormProps) {
  if (subtype === "match_audio_to_text") {
    return (
      <MatchAudioToTextForm
        content={content}
        onChangeContent={onChangeContent}
      />
    );
  }

  if (subtype === "identify_audio") {
    return (
      <IdentifyAudioForm
        content={content}
        onChangeContent={onChangeContent}
      />
    );
  }

  return (
    <FastAudioModeForm
      content={content}
      onChangeContent={onChangeContent}
    />
  );
}
