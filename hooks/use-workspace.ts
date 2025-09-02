"use client";

import { useQuery } from "@tanstack/react-query";

interface WorkspaceData {
  id: string;
  name: string;
  isPremium: boolean;
  videoCount: number;
}

interface WorkspaceResponse {
  success: boolean;
  workspace: WorkspaceData;
  error?: string;
}

const fetchWorkspace = async (): Promise<WorkspaceData> => {
  const response = await fetch("/api/workspace", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch workspace data");
  }

  const data: WorkspaceResponse = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch workspace");
  }

  return data.workspace;
};

export const useWorkspace = () => {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: fetchWorkspace,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error.message === "Unauthorized") {
        return false;
      }
      return failureCount < 3;
    },
  });
};