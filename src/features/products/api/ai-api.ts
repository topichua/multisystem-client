import { apiClient } from "@/api/api-client";

export const aiApi = {
  getPosts: async (): Promise<unknown> => {
    const { data } = await apiClient.get<unknown>("/api/instagram/media");
    return data;
  },

  analyzeProduct: async (mediaId: string): Promise<unknown> => {
    const { data } = await apiClient.get<unknown>(
      "/api/instagram/analyze-product",
      {
        params: { mediaId },
      },
    );
    return data;
  },
};
