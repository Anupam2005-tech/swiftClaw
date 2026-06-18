"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProviderId, TaskType, ModelPreferences } from "@/lib/types/provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { PROVIDERS } from "./ProviderSelectionStep";

const TASK_INFOS: { task: TaskType; name: string; description: string; requiredProviders: ProviderId[] }[] = [
  {
    task: "chat",
    name: "General Chat",
    description: "Used for conversational queries and coding prompts.",
    requiredProviders: ["claude", "openai", "gemini", "groq", "openrouter", "nvidia"],
  },
  {
    task: "web_search",
    name: "Internet Grounding",
    description: "Powers real-time search queries and fact validation.",
    requiredProviders: ["perplexity", "openai", "gemini"],
  },
  {
    task: "file_analysis",
    name: "File Analysis",
    description: "Indexes documents and local code for grounding queries.",
    requiredProviders: ["claude", "openai", "gemini"],
  },
  {
    task: "image_generation",
    name: "Image Generation (v1.3)",
    description: "Generates visual assets inline in chat threads.",
    requiredProviders: ["openai"],
  },
  {
    task: "video_generation",
    name: "Video Generation (v1.4)",
    description: "Powers async video clip generation pipeline.",
    requiredProviders: ["nvidia"],
  },
];

const PROVIDER_MODELS: Record<ProviderId, { value: string; label: string }[]> = {
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
  claude: [
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "dall-e-3", label: "DALL-E 3" },
  ],
  groq: [
    { value: "llama-3.1-70b", label: "Llama 3.1 70B (Groq)" },
    { value: "llama-3.1-8b", label: "Llama 3.1 8B (Groq)" },
  ],
  perplexity: [
    { value: "sonar-medium", label: "Sonar Medium" },
    { value: "sonar-small", label: "Sonar Small" },
  ],
  openrouter: [
    { value: "meta-llama/llama-3.1-405b", label: "Llama 3.1 405B" },
    { value: "mistralai/mixtral-8x22b", label: "Mixtral 8x22B" },
  ],
  nvidia: [
    { value: "cosmos-video", label: "NVIDIA Cosmos Video" },
    { value: "nemotron-4", label: "Nemotron-4 340B" },
  ],
};

interface TaskModelMappingStepProps {
  selectedProviders: ProviderId[];
  preferences: ModelPreferences | null;
  onPreferenceChange: (task: TaskType, provider: ProviderId, model: string) => void;
  onFinish: () => void;
  onPrev: () => void;
  loading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 16 } },
};

export function TaskModelMappingStep({
  selectedProviders,
  preferences,
  onPreferenceChange,
  onFinish,
  onPrev,
  loading,
}: TaskModelMappingStepProps) {
  if (!preferences) return null;

  const getProviderName = (id: ProviderId) => {
    return PROVIDERS.find((p) => p.id === id)?.name || id;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-xl font-semibold text-sc-text tracking-tight font-display">
          Task Model <span className="font-serif italic font-normal text-sc-accent">Mapping</span>
        </h2>
        <p className="text-xs text-sc-text-muted mt-1 leading-relaxed">
          Map specific agent tasks to your active LLM providers and models.
        </p>
      </motion.div>

      {/* Preferences Grid */}
      <motion.div
        variants={containerVariants}
        className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-none mb-6"
      >
        {TASK_INFOS.map(({ task, name, description, requiredProviders }) => {
          const availableProviders = requiredProviders.filter((p) => selectedProviders.includes(p));
          const isEnabled = availableProviders.length > 0;
          const currentPref = preferences[task];

          return (
            <motion.div
              key={task}
              variants={itemVariants}
              layout
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`p-4 rounded-lg border transition-all ${
                isEnabled
                  ? "border-white/[0.04] bg-white/[0.01]"
                  : "border-white/[0.03] bg-white/[0.005] opacity-50"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  {isEnabled && currentPref && (
                    <div className="h-5 w-5 rounded-full bg-sc-accent/10 border border-sc-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-sc-accent stroke-[3]" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-sc-text">{name}</h4>
                    <p className="text-[10px] text-sc-text-muted mt-0.5 max-w-[220px] leading-normal">
                      {description}
                    </p>
                  </div>
                </div>
                {!isEnabled && (
                  <span className="text-[9px] text-sc-text-muted/65 bg-white/5 px-2 py-0.5 rounded font-mono select-none">
                    Disabled
                  </span>
                )}
              </div>

              {isEnabled && currentPref && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-sc-text-muted uppercase tracking-wider font-semibold">
                      Provider
                    </label>
                    <select
                      value={currentPref.provider}
                      onChange={(e) => {
                        const newProv = e.target.value as ProviderId;
                        const models = PROVIDER_MODELS[newProv] || [];
                        const defaultModel = models[0]?.value || "";
                        onPreferenceChange(task, newProv, defaultModel);
                      }}
                      className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-sc-text outline-none focus:border-sc-accent transition-colors appearance-none cursor-pointer"
                    >
                      {availableProviders.map((provId) => (
                        <option key={provId} value={provId}>
                          {getProviderName(provId)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-sc-text-muted uppercase tracking-wider font-semibold">
                      Model
                    </label>
                    <select
                      value={currentPref.model}
                      onChange={(e) => onPreferenceChange(task, currentPref.provider, e.target.value)}
                      className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-sc-text outline-none focus:border-sc-accent transition-colors appearance-none cursor-pointer"
                    >
                      {(PROVIDER_MODELS[currentPref.provider] || []).map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {!isEnabled && (
                <p className="text-[10px] text-sc-text-muted/75 italic ml-8">
                  Requires one of: {requiredProviders.map((p) => getProviderName(p)).join(", ")} keys.
                </p>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div variants={itemVariants} className="flex gap-3 mt-4 border-t border-white/5 pt-4">
        <Button
          variant="ghost"
          onClick={onPrev}
          disabled={loading}
          className="flex-1 h-11 hover:bg-white/5 cursor-pointer text-sc-text-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <motion.div
          className="flex-1"
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
        >
          <Button
            onClick={onFinish}
            disabled={loading}
            className="w-full h-11 bg-sc-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-sc-accent/90"
          >
            {loading ? <Spinner size="sm" /> : "Finish Setup"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
