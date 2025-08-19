import { useMutation } from "@tanstack/react-query";

interface LogViewResponse {
  success: boolean;
  views?: number;
  error?: string;
}

const logVideoView = async (videoId: string): Promise<LogViewResponse> => {
  const response = await fetch(`/api/videos/${videoId}/views`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to log video view");
  }

  return response.json();
};

export const useLogVideoView = () => {
  return useMutation({
    mutationFn: logVideoView,
    onError: (error) => {
      console.error("Failed to log video view:", error);
    },
  });
};