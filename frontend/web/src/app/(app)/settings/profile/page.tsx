"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { User, LogOut, Trash2, ChevronDown, Check, Copy, CheckCheck, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const PROFESSIONS = ["Developer", "Designer", "Student", "Researcher", "Other"];
const EXPORT_PROMPT = `Export all of my stored memories and any context you've learned about me from past conversations. Preserve my words verbatim where possible, especially for instructions and preferences.

## Categories (output in this order):

1. **Instructions**: Rules I've explicitly asked you to follow going forward — tone, format, style, "always do X", "never do Y", and corrections to your behavior. Only include rules from stored memories, not from conversations.

2. **Identity**: Name, age, location, education, family, relationships, languages, and personal interests.

3. **Career**: Current and past roles, companies, and general skill areas.

4. **Projects**: Projects I meaningfully built or committed to. Ideally ONE entry per project. Include what it does, current status, and any key decisions. Use the project name or a short descriptor as the first words of the entry.

5. **Preferences**: Opinions, tastes, and working-style preferences that apply broadly.

## Format:

Use section headers for each category. Within each category, list one entry per line, sorted by oldest date first. Format each line as:

[YYYY-MM-DD] - Entry content here.

If no date is known, use [unknown] instead.

## Output:
- Wrap the entire export in a single code block for easy copying.
- After the code block, state whether this is the complete set or if more remain.`;

function PromptCodeBlock() {
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EXPORT_PROMPT);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative group">
      <pre className="bg-black/40 border border-white/10 rounded-lg p-3 pr-10 h-24 overflow-y-auto overflow-x-hidden text-[10px] text-sc-text-muted/80 font-mono leading-relaxed scrollbar-premium select-all">
        <code>{EXPORT_PROMPT}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 h-7 w-7 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer"
      >
        {justCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}

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
  const [memoryInput, setMemoryInput] = useState("");
  const [memoryImporting, setMemoryImporting] = useState(false);
  const [memoryImported, setMemoryImported] = useState(false);
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

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.deleteAccount();
      toast({ 
        title: "Account Deleted", 
        description: "Your account and all data have been permanently removed.", 
        variant: "success" 
      });
      await signOut();
    } catch (err) {
      toast({ 
        title: "Deletion Failed", 
        description: "Could not delete your account. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
      setShowDelete(false);
    }
  };

  const handleMemoryImport = async () => {
    if (!memoryInput.trim()) return;
    setMemoryImporting(true);
    setMemoryImported(false);
    try {
      await api.importMemory(memoryInput.trim(), nickname || undefined, profession || undefined);
      setMemoryImported(true);
      setMemoryInput("");
      toast({ title: "Memory Imported", description: "Your personal context has been stored.", variant: "success" });
    } catch {
      toast({ title: "Import Failed", description: "Could not save memory.", variant: "destructive" });
    } finally {
      setMemoryImporting(false);
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
    <Skeleton name="profile-settings" loading={loading} animate="pulse">
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
      <div className="space-y-4 w-full max-w-2xl">
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

      {/* Memory Import */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <h3 className="text-xs font-semibold text-sc-text uppercase tracking-wider flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Memory
        </h3>
        <p className="text-[10px] text-sc-text-muted leading-normal">
          Import personal context from text. Copy the prompt, run it with an AI on your raw notes, then paste the result below.
        </p>

        <div className="space-y-3 w-full max-w-2xl">
          <PromptCodeBlock />

          <textarea
            value={memoryInput}
            onChange={(e) => setMemoryInput(e.target.value)}
            placeholder="Paste your personal notes, background, preferences here..."
            className="w-full h-28 bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-sc-text placeholder:text-sc-text-muted/40 resize-none outline-none focus:border-sc-accent transition-colors scrollbar-premium"
          />

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleMemoryImport}
              disabled={!memoryInput.trim() || memoryImporting}
              className="h-9 px-5 bg-sc-accent text-accent-foreground font-semibold cursor-pointer hover:bg-sc-accent/90 disabled:opacity-50 text-xs"
            >
              {memoryImporting ? <Spinner size="sm" /> : "Import to Memory"}
            </Button>
            {memoryImported && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold animate-in fade-in duration-200">
                <CheckCheck className="h-3 w-3" />
                Imported
              </span>
            )}
          </div>
        </div>
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
            <Button onClick={handleDelete} className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer text-xs">Delete Account</Button>
          </div>
        </div>
      </Modal>
    </div>
    </Skeleton>
  );
}
