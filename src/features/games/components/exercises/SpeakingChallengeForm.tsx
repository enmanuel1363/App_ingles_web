"use client";

import React from "react";
import SpeakBeforeTimerForm from "./speaking/SpeakBeforeTimerForm";
import Say5WordsQuicklyForm from "./speaking/Say5WordsQuicklyForm";
import TongueTwisterChallengeForm from "./speaking/TongueTwisterChallengeForm";

interface SpeakingChallengeFormProps {
  subtype: string;
  content: any;
  onChangeContent: (content: any) => void;
}

export default function SpeakingChallengeForm({
  subtype,
  content,
  onChangeContent,
}: SpeakingChallengeFormProps) {
  switch (subtype) {
    case "speak_before_timer":
      return (
        <SpeakBeforeTimerForm
          content={content}
          onChangeContent={onChangeContent}
        />
      );

    case "say_5_words_quickly":
      return (
        <Say5WordsQuicklyForm
          content={content}
          onChangeContent={onChangeContent}
        />
      );

    case "tongue_twister_challenge":
    default:
      return (
        <TongueTwisterChallengeForm
          content={content}
          onChangeContent={onChangeContent}
        />
      );
  }
}
