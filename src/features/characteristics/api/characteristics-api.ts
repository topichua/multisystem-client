import { apiClient } from "@/api/api-client";

import type {
  Characteristic,
  CharacteristicCreatePayload,
  CharacteristicDetail,
  CharacteristicOptionPayload,
  CharacteristicsListResponse,
  CharacteristicUpdatePayload,
} from "@/features/characteristics/model/characteristic.types";

const basePath = "/workspace/variant-custom-fields";

export const characteristicsApi = {
  list: async (): Promise<CharacteristicsListResponse> => {
    const { data } = await apiClient.get<CharacteristicsListResponse>(basePath);

    return data;
  },

  getById: async (id: number): Promise<CharacteristicDetail> => {
    const { data } = await apiClient.get<CharacteristicDetail>(
      `${basePath}/${id}`,
    );

    return data;
  },

  create: async (
    payload: CharacteristicCreatePayload,
  ): Promise<Characteristic> => {
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

  createOption: async (
    id: number,
    payload: CharacteristicOptionPayload,
  ): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/option`, payload);
  },

  updateOption: async (
    id: number,
    optionId: number,
    payload: CharacteristicOptionPayload,
  ): Promise<void> => {
    await apiClient.put(`${basePath}/${id}/option/${optionId}`, payload);
  },

  deleteOption: async (id: number, optionId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}/option/${optionId}`);
  },

  archive: async (id: number): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/archive`);
  },

  unarchive: async (id: number): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/unarchive`);
  },

  archiveOption: async (id: number, optionId: number): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/option/${optionId}/archive`);
  },

  unarchiveOption: async (id: number, optionId: number): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/option/${optionId}/unarchive`);
  },
};
