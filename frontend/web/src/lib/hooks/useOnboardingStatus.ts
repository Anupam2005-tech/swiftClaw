"use client";

import { useState, useEffect } from "react";
import { ProviderId, ModelPreferences, TaskType } from "../types/provider";
import { api } from "../api/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  nickname?: string;
  profession?: string;
}

export const useOnboardingStatus = () => {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedProviders, setSelectedProviders] = useState<ProviderId[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState<ModelPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  useEffect(() => {
    const loadDefaultPrefs = async () => {
      const defaultPrefs = await api.getPreferences();
      setPreferences(defaultPrefs);
    };
    loadDefaultPrefs();
  }, []);

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const toggleProvider = (id: ProviderId) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const setApiKey = (provider: ProviderId, key: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: key }));
  };

  const updatePreference = (task: TaskType, provider: ProviderId, model: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [task]: { task, provider, model },
    });
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      if (userProfile.nickname || userProfile.profession) {
        await api.saveProfile(userProfile);
      }

      for (const provider of selectedProviders) {
        const key = apiKeys[provider];
        if (key) {
          await api.addKey(provider, key);
        }
      }

      if (preferences) {
        await api.setPreferences(preferences);
      }

      await api.completeOnboarding();
      await refreshUser();
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
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
  };
};
