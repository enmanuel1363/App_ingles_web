import { user_role } from "@/types/global.types";
import { create } from "zustand";

type AuthStoreElements = {
  role: user_role | "";
  setUser: (r: user_role) => void;
  reset: () => void;
};

const useAuthStore = create<AuthStoreElements>((set) => ({
  role: "",
  setUser: (r: user_role) => set(() => ({ role: r })),
  reset: () => set(() => ({ role: "" })),
}));

export default useAuthStore;
