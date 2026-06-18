"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProviderInfo, ProviderId } from "../../lib/types/provider";
import { ProviderCard } from "./ProviderCard";
import { Button } from "../ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

const PROVIDERS: ProviderInfo[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Multimodal expert with large context windows.",
    keyUrl: "https://aistudio.google.com/",
    capabilities: ["chat", "file_analysis", "image_analysis", "video_analysis"],
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    description: "State-of-the-art coding and reasoning assistant.",
    keyUrl: "https://console.anthropic.com/",
    capabilities: ["chat", "file_analysis", "image_analysis"],
  },
  {
    id: "openai",
    name: "OpenAI GPT",
    description: "General intelligence, image, and vision specialist.",
    keyUrl: "https://platform.openai.com/api-keys",
    capabilities: ["chat", "file_analysis", "image_analysis", "image_generation"],
  },
  {
    id: "groq",
    name: "Groq Cloud",
    description: "Ultra-low latency inference using Llama 3.",
    keyUrl: "https://console.groq.com/keys",
    capabilities: ["chat"],
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Online grounded web search model access.",
    keyUrl: "https://www.perplexity.ai/settings/api",
    capabilities: ["chat", "web_search"],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Aggregate pricing access to hundreds of open-source models.",
    keyUrl: "https://openrouter.ai/keys",
    capabilities: ["chat"],
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    description: "Capable visual foundation and video generators.",
    keyUrl: "https://build.nvidia.com/",
    capabilities: ["chat", "video_generation"],
  },
];

interface ProviderSelectionStepProps {
  selected: ProviderId[];
  onToggle: (id: ProviderId) => void;
  onNext: () => void;
  onPrev: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
};

export function ProviderSelectionStep({
  selected,
  onToggle,
  onNext,
  onPrev,
}: ProviderSelectionStepProps) {
  const canProceed = selected.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-xl font-semibold text-sc-text tracking-tight font-display">
          Select LLM <span className="font-serif italic font-normal text-sc-accent">Providers</span>
        </h2>
        <p className="text-xs text-sc-text-muted mt-1 leading-relaxed">
          Which model providers do you want to configure? You can choose multiple. At least one is required.
        </p>
      </motion.div>

      {/* Grid of Providers */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-none mb-6"
      >
        {PROVIDERS.map((provider) => (
          <motion.div key={provider.id} variants={itemVariants}>
            <ProviderCard
              provider={provider}
              selected={selected.includes(provider.id)}
              onToggle={() => onToggle(provider.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div variants={itemVariants} className="flex gap-3 mt-4 border-t border-white/5 pt-4">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="flex-1 h-11 hover:bg-white/5 cursor-pointer text-sc-text-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <motion.div
          className="flex-1"
          whileHover={canProceed ? { scale: 1.01 } : {}}
          whileTap={canProceed ? { scale: 0.99 } : {}}
        >
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="w-full h-11 bg-sc-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-sc-accent/90 disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
export { PROVIDERS };
