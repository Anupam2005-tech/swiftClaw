"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { User, LogOut, Trash2, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PROFESSIONS = ["Developer", "Designer", "Student", "Researcher", "Other"];

export default function ProfileSettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [profession, setProfession] = useState("");
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [profDropdownOpen, setProfDropdownOpen] = useState(false);
  const profDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profDropdownRef.current && !profDropdownRef.current.contains(e.target as Node)) {
        setProfDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await api.getProfile();
        setNickname(profile.nickname || "");
        setProfession(profile.profession || "");
      } catch {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveProfile({ nickname, profession });
      toast({ title: "Profile Updated", description: "Your profile has been saved.", variant: "success" });
    } catch {
      toast({ title: "Save Failed", description: "Could not update your profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" className="border-t-transparent border-sc-text/30" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Pane title */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-sm font-semibold text-sc-text uppercase tracking-wider flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </h2>
        <p className="text-[10px] text-sc-text-muted mt-1 leading-normal">
          Manage your display name, profession, and account settings.
        </p>
      </div>

      {/* Profile form */}
      <div className="space-y-4 w-full max-w-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-sc-text-muted uppercase tracking-wider font-semibold">Email</label>
          <Input value={user?.email || ""} disabled className="bg-black/30 border-white/10 h-10 text-sc-text/60 cursor-not-allowed text-xs" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-sc-text-muted uppercase tracking-wider font-semibold">Nickname</label>
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Your display name" className="bg-black/30 border-white/10 h-10 text-sc-text text-xs" />
        </div>

        {/* Custom Profession Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-sc-text-muted uppercase tracking-wider font-semibold">Profession</label>
          <div ref={profDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setProfDropdownOpen(!profDropdownOpen)}
              className="w-full flex items-center justify-between h-10 bg-black/30 border border-white/10 rounded-md px-3 text-xs text-sc-text outline-none focus:border-sc-accent transition-colors cursor-pointer"
            >
              <span className={profession ? "text-sc-text" : "text-sc-text-muted/50"}>
                {profession || "Select profession"}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-sc-text-muted/50 shrink-0 ml-2 transition-transform duration-200", profDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {profDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="absolute z-10 top-full mt-1 left-0 right-0 bg-[#0D0D0D] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                >
                  {PROFESSIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setProfession(p); setProfDropdownOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-colors cursor-pointer",
                        profession === p ? "bg-white/10 text-sc-text" : "text-sc-text-muted hover:bg-white/5 hover:text-sc-text"
                      )}
                    >
                      <span className="flex-1">{p}</span>
                      {profession === p && <Check className="h-3 w-3 text-sc-accent shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="h-10 px-6 bg-sc-accent text-accent-foreground font-semibold cursor-pointer hover:bg-sc-accent/90 disabled:opacity-50 w-full sm:w-auto text-xs">
          {saving ? <Spinner size="sm" /> : "Save Changes"}
        </Button>
      </div>

      {/* Actions */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <h3 className="text-xs font-semibold text-sc-text uppercase tracking-wider">Account Actions</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setShowSignOut(true)} className="flex items-center gap-2 h-10 bg-white/5 hover:bg-white/10 text-sc-text border border-white/10 cursor-pointer w-full sm:w-auto text-xs">
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </Button>
          <Button onClick={() => setShowDelete(true)} className="flex items-center gap-2 h-10 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 cursor-pointer w-full sm:w-auto text-xs">
            <Trash2 className="h-4 w-4 shrink-0" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Modal isOpen={showSignOut} onClose={() => setShowSignOut(false)} title="Sign Out">
        <div className="flex flex-col gap-4 text-xs select-none">
          <p className="text-sc-text-muted leading-relaxed">Are you sure you want to sign out? Your conversations and settings will be preserved.</p>
          <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
            <Button variant="ghost" onClick={() => setShowSignOut(false)} className="h-10 px-4 hover:bg-white/5 cursor-pointer text-sc-text-muted text-xs">Cancel</Button>
            <Button onClick={signOut} className="h-10 px-4 bg-sc-accent text-accent-foreground font-semibold cursor-pointer hover:bg-sc-accent/90 text-xs">Sign Out</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Account">
        <div className="flex flex-col gap-4 text-xs select-none">
          <p className="text-sc-text-muted leading-relaxed">This will permanently delete your account and all associated data, including conversations, keys, and preferences. This action cannot be undone.</p>
          <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
            <Button variant="ghost" onClick={() => setShowDelete(false)} className="h-10 px-4 hover:bg-white/5 cursor-pointer text-sc-text-muted text-xs">Cancel</Button>
            <Button className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer text-xs">Delete Account</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
