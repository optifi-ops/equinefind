"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AccountSettingsPage() {
  const { user, profile, isOrganizer } = useAuth();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-charcoal">Settings</h1>
        <p className="text-slate text-sm mt-1">Account information</p>
      </header>

      <div className="card p-6 space-y-4">
        <div>
          <p className="text-xs text-slate uppercase tracking-wider">Email</p>
          <p className="text-charcoal mt-0.5">{user?.email}</p>
        </div>

        <div>
          <p className="text-xs text-slate uppercase tracking-wider">Role</p>
          <div className="mt-1">
            <span className={`px-2.5 py-1 text-xs rounded-full ${
              isOrganizer ? "bg-hunter/10 text-hunter" : "bg-mist text-slate"
            }`}>
              {profile?.role ?? "user"}
            </span>
          </div>
        </div>

        {profile?.display_name && (
          <div>
            <p className="text-xs text-slate uppercase tracking-wider">Display Name</p>
            <p className="text-charcoal mt-0.5">{profile.display_name}</p>
          </div>
        )}

        {profile?.compete_name && (
          <div>
            <p className="text-xs text-slate uppercase tracking-wider">Competition Name</p>
            <p className="text-charcoal mt-0.5">{profile.compete_name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
