import { apiClient } from "@/api/api-client";

import type {
  Characteristic,
  CharacteristicCreatePayload,
  CharacteristicsListResponse,
  CharacteristicUpdatePayload,
} from "@/features/characteristics/model/characteristic.types";

const basePath = "/workspace/variant-custom-fields";

export const characteristicsApi = {
  list: async (): Promise<CharacteristicsListResponse> => {
    const { data } = await apiClient.get<CharacteristicsListResponse>(basePath);

    return data;
  },

  create: async (payload: CharacteristicCreatePayload): Promise<Characteristic> => {
    const { data } = await apiClient.post<Characteristic>(basePath, payload);

    return data;
  },

  update: async (
    id: number,
    payload: CharacteristicUpdatePayload,
  ): Promise<Characteristic> => {
    const { data } = await apiClient.patch<Characteristic>(
      `${basePath}/${id}`,
      payload,
    );

    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}`);
  },
};
