import GameRoomHost from "@/features/games/components/GameRoomHost";

type Props = {
  params: Promise<{ roomCode: string }>;
};

export default async function GameRoomPage({ params }: Props) {
  const { roomCode } = await params;

  return (
    <div className="py-6 px-4 bg-[#fffcf2] min-h-screen">
      <GameRoomHost roomCode={roomCode} />
    </div>
  );
}
