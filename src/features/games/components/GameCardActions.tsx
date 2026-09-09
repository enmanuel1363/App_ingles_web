"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateRoom } from "../hooks/useGameRoom";
import { useDeleteGame } from "../hooks/useGames";
import { useModal } from "@/components/ui/ModalProvider";
import Button from "@/components/ui/Button";
import { Users, Edit2, Trash2 } from "lucide-react";

interface GameCardActionsProps {
  gameId: string;
  teacherId: string;
}

export default function GameCardActions({
  gameId,
  teacherId,
}: GameCardActionsProps) {
  const router = useRouter();
  const { initializeRoom, loading: startingRoom } = useCreateRoom();
  const deleteGameMutation = useDeleteGame();
  const { confirm, showAlert } = useModal();

  const handleCreateRoom = async () => {
    try {
      const room = await initializeRoom(gameId, teacherId);
      if (room?.room_code) {
        router.push(`/games/room/${room.room_code}`);
      }
    } catch (err) {
      showAlert({
        title: "Error al crear sala",
        message: "No se pudo generar la sala multijugador. Verifica tu conexión.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "¿Eliminar juego?",
      description:
        "¿Estás seguro de que deseas eliminar permanentemente este juego? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!isConfirmed) return;

    try {
      await deleteGameMutation.mutateAsync(gameId);
      showAlert({
        title: "Juego eliminado",
        message: "El juego ha sido eliminado exitosamente.",
        type: "success",
      });
      router.refresh();
    } catch (err) {
      showAlert({
        title: "Error",
        message: "No se pudo eliminar el juego. Intenta de nuevo.",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-2 mt-auto">
      <Button
        variant="outlined"
        leftIcon={<Users className="w-4 h-4" />}
        isLoading={startingRoom}
        onClick={handleCreateRoom}
        className="w-full font-bold border-slate-200 hover:border-cyan-400 hover:text-cyan-700"
      >
        Create Competition Room
      </Button>

      <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2">
        <Link
          href={`/games/${gameId}/edit`}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-semibold text-sm transition-all duration-200"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </Link>

        <Button
          variant="danger"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          isLoading={deleteGameMutation.isPending}
          onClick={handleDelete}
          className="flex-1 font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-100 hover:border-rose-200 py-2 px-3 h-10 rounded-xl"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
