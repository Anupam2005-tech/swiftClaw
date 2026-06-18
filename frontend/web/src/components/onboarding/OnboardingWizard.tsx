"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStatus } from "../../lib/hooks/useOnboardingStatus";
import { WelcomeStep } from "./WelcomeStep";
import { ProviderSelectionStep } from "./ProviderSelectionStep";
import { KeyEntryStep } from "./KeyEntryStep";
import { TaskModelMappingStep } from "./TaskModelMappingStep";
const STEP_LABELS = ["Welcome", "Providers", "API Keys", "Task Mapping"];

const stepVariants = {
  initial: { opacity: 0, x: 40, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
  exit: { opacity: 0, x: -40, scale: 0.97, transition: { duration: 0.15 } },
};

export function OnboardingWizard() {
  const {
    step,
    nextStep,
    prevStep,
    selectedProviders,
    toggleProvider,
    apiKeys,
    setApiKey,
    preferences,
    updatePreference,
    finishOnboarding,
    loading,
    userProfile,
    setUserProfile,
  } = useOnboardingStatus();

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <WelcomeStep
            onNext={nextStep}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        );
      case 1:
        return (
          <ProviderSelectionStep
            selected={selectedProviders}
            onToggle={toggleProvider}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 2:
        return (
          <KeyEntryStep
            selectedProviders={selectedProviders}
            apiKeys={apiKeys}
            onKeyChange={setApiKey}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <TaskModelMappingStep
            selectedProviders={selectedProviders}
            preferences={preferences}
            onPreferenceChange={updatePreference}
            onFinish={finishOnboarding}
            onPrev={prevStep}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[500px] rounded-2xl border border-white/[0.06] bg-black/50 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
      <div className="absolute -top-20 -left-20 h-40 w-40 bg-sc-accent/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 h-40 w-40 bg-sc-accent/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-sc-accent/30 to-transparent" />

      {/* Step Indicators */}
      <div className="flex justify-between items-center mb-8 border-b border-white/[0.04] pb-4 relative z-10">
        {STEP_LABELS.map((label, index) => {
          const isActive = index === step;
          const isCompleted = index < step;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5 flex-1 relative">
              {index > 0 && (
                <div
                  className={`absolute right-1/2 top-2.5 h-[1px] -translate-y-1/2 w-full z-0 ${
                    index <= step ? "bg-sc-accent/30" : "bg-white/[0.04]"
                  }`}
                />
              )}

              <motion.div
                animate={
                  isActive
                    ? { scale: 1.15, borderColor: "rgba(255,253,249,0.5)", backgroundColor: "rgba(255,253,249,0.12)" }
                    : isCompleted
                    ? { scale: 1, borderColor: "rgba(255,253,249,0.2)", backgroundColor: "rgba(255,253,249,0.06)" }
                    : { scale: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(0,0,0,0.4)" }
                }
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`h-5 w-5 rounded-full border z-10 flex items-center justify-center text-[10px] font-semibold ${
                  isActive ? "shadow-[0_0_10px_rgba(255,253,249,0.15)]" : ""
                }`}
              >
                {index + 1}
              </motion.div>
              <span
                className={`text-[8px] uppercase tracking-wider font-semibold select-none hidden sm:block ${
                  isActive ? "text-sc-text" : "text-sc-text-muted/50"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="min-h-[280px] flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
export default OnboardingWizard;
