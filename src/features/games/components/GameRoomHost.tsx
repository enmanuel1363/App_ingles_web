"use client";

import React, { useState, useEffect } from "react";
import { useGameRoom } from "../hooks/useGameRoom";
import { useGetExercisesByGame } from "../hooks/useGames";
import Button from "@/components/ui/Button";
import { Users, Play, Trophy, ArrowRight, ShieldAlert, Sparkles, Clock } from "lucide-react";

interface GameRoomHostProps {
  roomCode: string;
  onClose: () => void;
}

export default function GameRoomHost({ roomCode, onClose }: GameRoomHostProps) {
  const { room, loading, error, changeStatus, changeQuestionIndex, players } = useGameRoom(roomCode);
  const { data: exercises = [], isLoading: loadingExercises } = useGetExercisesByGame(room?.id_game || "");

  const [activeQuestion, setActiveQuestion] = useState<any>(null);

  // Sync active question details when the room index updates
  useEffect(() => {
    if (exercises.length > 0 && room) {
      setActiveQuestion(exercises[room.current_question_index]);
    }
  }, [exercises, room?.current_question_index]);

  if (loading || loadingExercises) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-slate-800">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#24DFE2] rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-500">Loading Game Lobby...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl max-w-md mx-auto">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-800">Lobby Error</h3>
        <p className="text-slate-500 text-xs mt-2 mb-6">
          Could not establish or locate the requested multiplayer lobby.
        </p>
        <Button variant="outlined" onClick={onClose} className="w-full">
          Close Lobby
        </Button>
      </div>
    );
  }

  // Lobby Screen (Waiting for players to join)
  if (room.status === "waiting") {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8 max-w-2xl mx-auto shadow-sm text-center">
        <span className="text-xs font-black tracking-widest text-[#FF9400] uppercase bg-[#FF9400]/10 px-4 py-2 rounded-full">
          Waiting for players
        </span>

        <div className="my-10 space-y-4">
          <p className="text-slate-400 text-sm font-semibold uppercase">Join via the Mobile App with code</p>
          <h1 className="text-6xl font-black text-slate-900 tracking-wider font-mono bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm mx-auto select-all">
            {room.room_code}
          </h1>
        </div>

        {/* Player grid count */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-center space-x-2 text-slate-800 mb-6">
            <Users className="w-5 h-5 text-[#24DFE2]" />
            <span className="font-extrabold text-sm">{players.length} Students Joined</span>
          </div>

          {players.length === 0 ? (
            <p className="text-slate-400 text-xs italic py-4">Waiting for the first student to enter the code...</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-[160px] overflow-y-auto p-2">
              {players.map((player, idx) => (
                <div
                  key={idx}
                  className="bg-[#fffcf2] border border-slate-200/60 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-850 truncate shadow-sm flex items-center justify-center space-x-1"
                >
                  <div className="w-2 h-2 rounded-full bg-[#B4FF2B]"></div>
                  <span>{player}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Game Controls */}
        <div className="mt-8 flex justify-center space-x-3">
          <Button
            variant="primary"
            disabled={players.length === 0}
            leftIcon={<Play className="w-4 h-4 fill-slate-950" />}
            onClick={() => changeStatus("playing")}
            className="px-8 text-slate-950 font-extrabold"
          >
            Start Competition
          </Button>
          <Button variant="outlined" onClick={onClose} className="px-6 border-slate-200">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Active Play Mode
  if (room.status === "playing" && activeQuestion) {
    const isLastQuestion = room.current_question_index + 1 === exercises.length;

    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8 max-w-2xl mx-auto shadow-sm">
        {/* Header indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Live Question Arena</span>
            <h3 className="text-sm font-extrabold text-slate-700">
              Question {room.current_question_index + 1} of {exercises.length}
            </h3>
          </div>
          <div className="flex items-center space-x-1 bg-rose-500/10 text-rose-600 px-3 py-1.5 rounded-full text-xs font-black">
            <Clock className="w-4 h-4" />
            <span>Active</span>
          </div>
        </div>

        {/* Big Screen Display of the Question */}
        <div className="py-12 text-center space-y-6">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1 rounded-md">
            Type: {activeQuestion.type.replace(/_/g, " ")}
          </span>
          <h2 className="text-3xl font-black text-slate-900 leading-snug max-w-xl mx-auto">
            {activeQuestion.name}
          </h2>
          {activeQuestion.description && (
            <p className="text-sm text-slate-500 font-medium italic">
              "{activeQuestion.description}"
            </p>
          )}
        </div>

        {/* Navigation Controls for Host */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
            <Users className="w-4 h-4 text-[#B4FF2B]" />
            <span>{players.length} Students live on controllers</span>
          </div>

          <div className="flex space-x-2">
            {!isLastQuestion ? (
              <Button
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => changeQuestionIndex(room.current_question_index + 1)}
                className="text-slate-900 font-extrabold"
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="primary"
                leftIcon={<Trophy className="w-4 h-4 fill-slate-900" />}
                onClick={() => changeStatus("finished")}
                className="text-slate-900 font-extrabold"
              >
                Complete Game
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game Finished (Leaderboard)
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 max-w-2xl mx-auto shadow-sm text-center">
      <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#B4FF2B]/20 mb-4 animate-bounce">
        <Trophy className="w-16 h-16 text-slate-900" />
      </div>
      <h2 className="text-3xl font-black text-slate-900">Competition Finished!</h2>
      <p className="text-slate-500 font-medium mt-2 mb-8">
        The challenge is complete! Top players are updated in the database logs.
      </p>

      {/* Leaderboard skeleton (derived from student logs) */}
      <div className="bg-[#fffcf2] border border-slate-200/60 rounded-2xl p-6 max-w-md mx-auto text-left space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-200/60 pb-2">
          Final Results
        </h3>
        
        {/* Placeholder: Real rankings would be queried from logs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
            <span className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#FF9400] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Student A</span>
            </span>
            <span>850 pts</span>
          </div>
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
            <span className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-slate-350 text-slate-800 flex items-center justify-center text-[10px]">2</span>
              <span>Student B</span>
            </span>
            <span>720 pts</span>
          </div>
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
            <span className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Student C</span>
            </span>
            <span>690 pts</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center space-x-3">
        <Button variant="primary" onClick={onClose} className="px-8 text-slate-900 font-extrabold">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
