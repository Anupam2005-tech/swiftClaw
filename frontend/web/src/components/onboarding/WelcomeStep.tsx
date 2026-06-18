"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArrowRight, Sparkles, Shield, Gauge, User, Briefcase } from "lucide-react";
import { auth } from "../../lib/firebase/config";
import type { UserProfile } from "../../lib/hooks/useOnboardingStatus";

interface WelcomeStepProps {
  onNext: () => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
};

const PROFESSIONS = ["Developer", "Designer", "Student", "Researcher", "Other"];

export function WelcomeStep({ onNext, userProfile, setUserProfile }: WelcomeStepProps) {
  const [nickname, setNickname] = useState(userProfile.nickname || "");
  const [profession, setProfession] = useState(userProfile.profession || "");

  useEffect(() => {
    const displayName = auth.currentUser?.displayName;
    if (displayName && !nickname) {
      setNickname(displayName);
    }
  }, []);

  useEffect(() => {
    setUserProfile({ nickname: nickname || undefined, profession: profession || undefined });
  }, [nickname, profession, setUserProfile]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sc-accent/20 via-sc-accent/10 to-transparent border border-sc-accent/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-sc-accent" />
          </div>
          <motion.div
            className="absolute -inset-1 rounded-2xl bg-sc-accent/5 blur-lg"
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <h2 className="text-2xl font-bold text-sc-text tracking-tight font-display">
          Welcome to your{" "}
          <span className="font-serif italic font-normal text-sc-accent">Workspace</span>
        </h2>
        <p className="text-sm text-sc-text-muted mt-2 max-w-[380px] leading-relaxed">
          Let's complete a quick setup to connect your LLM credentials and configure your workspace.
        </p>
      </motion.div>

      {/* Profile fields */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-sc-text-muted uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <User className="h-3 w-3" />
            Nickname
            <span className="text-sc-text-muted/50 font-normal normal-case">(optional)</span>
          </label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your display name"
            className="bg-black/30 border-white/10 h-10 text-sm text-sc-text"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-sc-text-muted uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Briefcase className="h-3 w-3" />
            Profession
          </label>
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg h-10 px-3 text-sm text-sc-text outline-none focus:border-sc-accent transition-colors appearance-none cursor-pointer"
          >
            <option value="">Select your profession</option>
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Feature highlights */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-2 mb-6">
        <div className="flex gap-3 items-start bg-white/[0.02] border border-white/5 rounded-lg p-3 hover:bg-white/[0.04] transition-colors">
          <div className="h-7 w-7 rounded-lg bg-sc-accent/10 border border-sc-accent/10 flex items-center justify-center shrink-0">
            <Shield className="h-3.5 w-3.5 text-sc-accent" />
          </div>
          <div className="text-left">
            <h4 className="text-[11px] font-semibold text-sc-text">Encrypted Key Storage</h4>
            <p className="text-[10px] text-sc-text-muted mt-0.5 leading-relaxed">
              AES-256-GCM encryption at rest. We never store raw keys.
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start bg-white/[0.02] border border-white/5 rounded-lg p-3 hover:bg-white/[0.04] transition-colors">
          <div className="h-7 w-7 rounded-lg bg-sc-accent/10 border border-sc-accent/10 flex items-center justify-center shrink-0">
            <Gauge className="h-3.5 w-3.5 text-sc-accent" />
          </div>
          <div className="text-left">
            <h4 className="text-[11px] font-semibold text-sc-text">Auto Failover Routing</h4>
            <p className="text-[10px] text-sc-text-muted mt-0.5 leading-relaxed">
              Requests automatically route to backup models on rate limits or downtime.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button
          onClick={onNext}
          className="w-full h-11 bg-sc-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-sc-accent/90 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
