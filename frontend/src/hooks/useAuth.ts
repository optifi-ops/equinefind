"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";

export function useAuth() {
  const ctx = useContext(AuthContext);
  return {
    ...ctx,
    isOrganizer: ctx.profile?.role === "organizer" || ctx.profile?.role === "admin",
    isAdmin: ctx.profile?.role === "admin",
  };
}
