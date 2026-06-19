"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProviderId, TaskType, ModelPreferences } from "@/lib/types/provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { PROVIDERS } from "./ProviderSelectionStep";
import { useAllProviderModels } from "@/lib/hooks/useProviderModels";
import { ModelSelect } from "@/components/ui/model-select";

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
  const { modelMap, loading: modelsLoading } = useAllProviderModels(selectedProviders);

  if (!preferences) return null;

  const getProviderName = (id: ProviderId) => {
    return PROVIDERS.find((p) => p.id === id)?.name || id;
  };

  const getModelsFor = (provider: ProviderId) => {
    return modelMap[provider] || [];
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
                        const models = getModelsFor(newProv);
                        const defaultModel = models[0]?.id || "";
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
                    <ModelSelect
                      value={currentPref.model}
                      models={getModelsFor(currentPref.provider)}
                      onChange={(m) => onPreferenceChange(task, currentPref.provider, m)}
                      disabled={modelsLoading}
                      placeholder={modelsLoading ? "Loading..." : undefined}
                    />
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
