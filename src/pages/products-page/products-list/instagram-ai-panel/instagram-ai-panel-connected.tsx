import { observer } from "mobx-react-lite";

import { useUserStore } from "@/features/auth/model/use-user-store";
import { useAiToolsStore } from "@/features/products/model/use-ai-tools-store";

import { InstagramAiPanel } from "./instagram-ai-panel";

type InstagramAiPanelConnectedProps = {
  analyzeBusy: boolean;
  submitLoading: boolean;
  onAnalyzeAndFill: () => void | Promise<void>;
};

export const InstagramAiPanelConnected = observer(
  ({
    analyzeBusy,
    submitLoading,
    onAnalyzeAndFill,
  }: InstagramAiPanelConnectedProps) => {
    const aiToolsStore = useAiToolsStore();
    const { company } = useUserStore();

    return (
      <InstagramAiPanel
        posts={aiToolsStore.postsList}
        accountProfile={aiToolsStore.accountProfile}
        fallbackAccountName={company?.name}
        postsLoading={aiToolsStore.postsLoading}
        postsError={aiToolsStore.postsError}
        selectedPostId={aiToolsStore.selectedPostId}
        onSelectPost={aiToolsStore.setSelectedPostId}
        onRefresh={() => void aiToolsStore.loadPosts()}
        analyzeBusy={analyzeBusy}
        submitLoading={submitLoading}
        analyzeError={aiToolsStore.analyzeError}
        onAnalyzeAndFill={onAnalyzeAndFill}
      />
    );
  },
);
