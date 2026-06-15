import { useEffect } from "react";
import { useNavigate } from "react-router";

import { getInstagramPostPath } from "@/app/router/pages-map";
import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";
import type { InstagramMediaFilter } from "@/features/instagram/model/instagram.types";
import { useInstagramStore } from "@/features/instagram/model/use-instagram-store";

export const useInstagramPageController = () => {
  const store = useInstagramStore();
  const navigate = useNavigate();
  const selectedIntegration = store.selectedIntegration;
  const selectedKey =
    selectedIntegration != null
      ? String(selectedIntegration.integration_id)
      : undefined;

  useEffect(() => {
    void store.loadIntegrations();
  }, [store]);

  const getFilterCount = (filter: InstagramMediaFilter): number => {
    switch (filter) {
      case "linked":
        return store.linkedMediaCount;
      case "without-product":
        return store.withoutProductMediaCount;
      default:
        return store.mediaItems.length;
    }
  };

  const openPostDetails = (post: InstagramMediaItem): void => {
    store.preparePostDetails(post);
    navigate(getInstagramPostPath(post.id));
  };

  return {
    store,
    selectedIntegration,
    selectedKey,
    initialListLoading:
      !store.listLoaded ||
      (store.listLoading && store.integrations.length === 0),
    initialMediaLoading:
      selectedIntegration != null && !store.mediaLoaded && store.mediaLoading,
    getFilterCount,
    selectIntegrationKey: (key: string) =>
      void store.setSelectedIntegrationKey(key),
    selectMediaFilter: (filter: InstagramMediaFilter) =>
      store.setMediaFilter(filter),
    openPostDetails,
    loadNextMediaPage: () => void store.loadNextMediaPage(),
  };
};

export type InstagramPageController = ReturnType<
  typeof useInstagramPageController
>;
