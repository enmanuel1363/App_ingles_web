import { createClient } from "@/lib/supabaseServer";
import { GamesPageClient } from "@/features/games";

export default async function GamesRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl max-w-md mx-auto my-12 shadow-sm">
        <h3 className="text-lg font-black text-slate-800">Authentication Required</h3>
        <p className="text-slate-500 text-xs mt-2">
          Please log in with your teacher credentials to access the Game Center.
        </p>
      </div>
    );
  }

  return <GamesPageClient currentTeacherProfileId={user.id} />;
}
