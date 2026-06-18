"use client";

import { useState, useEffect, useRef } from "react";
import { MediaJob } from "../types/agent";
import { api } from "../api/client";

export const useMediaJob = (jobId: string | undefined) => {
  const [job, setJob] = useState<MediaJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setError(null);
      return;
    }

    const fetchJob = async () => {
      try {
        const status = await api.getMediaJob(jobId);
        setJob(status);
        
        if (status.status === "done" || status.status === "failed") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch media job status");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    setLoading(true);
    fetchJob().finally(() => setLoading(false));

    // Poll every 2 seconds!
    intervalRef.current = setInterval(fetchJob, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId]);

  return {
    job,
    loading,
    error,
  };
};
