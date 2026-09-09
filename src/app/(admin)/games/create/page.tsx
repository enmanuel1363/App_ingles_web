import { createClient } from "@/lib/supabaseServer";
import GameCreator from "@/features/games/components/GameCreator";
import { redirect } from "next/navigation";

export default async function CreateGamePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/games");
  }

  return (
    <div className="min-h-screen bg-[#fffcf2]">
      <GameCreator teacherId={user.id} />
    </div>
  );
}
