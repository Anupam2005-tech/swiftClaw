"use client";

import React from "react";
import { ModelPreferences, TaskType, ProviderId } from "../../lib/types/provider";
import { Spinner } from "../ui/spinner";
import { PROVIDERS } from "../onboarding/ProviderSelectionStep";
import { AlertCircle, Sliders } from "lucide-react";
import { useAllProviderModels } from "@/lib/hooks/useProviderModels";
import { ModelSelect } from "@/components/ui/model-select";

interface ModelPreferencesTableProps {
  preferences: ModelPreferences | null;
  activeKeys: ProviderId[];
  onPreferenceChange: (task: TaskType, provider: ProviderId, model: string) => void;
  loading: boolean;
}

const TASK_ROWS: { task: TaskType; name: string; description: string; requiredProviders: ProviderId[] }[] = [
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



export function ModelPreferencesTable({
  preferences,
  activeKeys,
  onPreferenceChange,
  loading,
}: ModelPreferencesTableProps) {
  const { modelMap, loading: modelsLoading } = useAllProviderModels(activeKeys);

  if (loading || !preferences) {
    return (
      <div className="flex items-center justify-center p-12 text-sc-text-muted/40">
        <Spinner size="md" className="border-t-transparent border-sc-text/40" />
      </div>
    );
  }

  const getProviderName = (id: ProviderId) => {
    return PROVIDERS.find((p) => p.id === id)?.name || id;
  };

  const getModelsFor = (provider: ProviderId) => {
    return modelMap[provider] || [];
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {activeKeys.length === 0 && (
        <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/15 text-yellow-400/90 flex gap-2.5 items-start mb-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <p className="leading-relaxed leading-normal">
            No active keys configured in your Vault. Add keys in the API Keys tab to map task models.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {TASK_ROWS.map(({ task, name, description, requiredProviders }) => {
          const availableProviders = requiredProviders.filter((p) => activeKeys.includes(p));
          const isEnabled = availableProviders.length > 0;
          const currentPref = preferences[task];

          return (
            <div
              key={task}
              className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                isEnabled
                  ? "border-white/5 bg-white/[0.01]"
                  : "border-white/5 bg-white/[0.002] opacity-40 select-none cursor-not-allowed"
              }`}
            >
              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-sc-text flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-sc-text-muted/50" />
                  {name}
                </h4>
                <p className="text-[10px] text-sc-text-muted mt-1 leading-normal max-w-[340px]">
                  {description}
                </p>
              </div>

              {/* Preferences Configuration Dropdowns */}
              {isEnabled && currentPref ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center shrink-0 w-full sm:w-auto">
                  {/* Provider Selector */}
                  <div className="flex flex-col gap-1 w-full sm:w-[130px]">
                    <label className="text-[8px] text-sc-text-muted uppercase tracking-wider font-semibold">
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
                      className="bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[11px] text-sc-text outline-none focus:border-sc-accent transition-colors"
                    >
                      {availableProviders.map((provId) => (
                        <option key={provId} value={provId}>
                          {getProviderName(provId)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model Selector */}
                  <div className="flex flex-col gap-1 w-full sm:w-[150px]">
                    <label className="text-[8px] text-sc-text-muted uppercase tracking-wider font-semibold">
                      Active Model
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
              ) : (
                <div className="text-[10px] text-sc-text-muted/65 italic bg-white/5 px-3 py-2 rounded shrink-0 w-full sm:w-auto text-center">
                  Requires one of: {requiredProviders.map((p) => getProviderName(p)).join(", ")} keys.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default ModelPreferencesTable;
