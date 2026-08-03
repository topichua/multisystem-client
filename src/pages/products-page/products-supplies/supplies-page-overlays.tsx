import { StockSupplyModal } from "@/features/inventory/components/stock-supply-modal/stock-supply-modal";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";

import { SuppliesFiltersDrawer } from "./supplies-filters-drawer";
import type { SuppliesPanelFilters } from "./supplies-filters.constants";

type SuppliesPageOverlaysProps = {
  filtersOpen: boolean;
  draftFilters: SuppliesPanelFilters;
  members: WorkspaceMember[];
  onCloseFilters: () => void;
  onDraftChange: (filters: SuppliesPanelFilters) => void;
  onResetDraft: () => void;
  onApplyFilters: () => void;
  stockSupplyModalOpen: boolean;
  onCloseStockSupplyModal: () => void;
  onStockSupplySuccess: () => void;
};

export const SuppliesPageOverlays = ({
  filtersOpen,
  draftFilters,
  members,
  onCloseFilters,
  onDraftChange,
  onResetDraft,
  onApplyFilters,
  stockSupplyModalOpen,
  onCloseStockSupplyModal,
  onStockSupplySuccess,
}: SuppliesPageOverlaysProps) => (
  <>
    <SuppliesFiltersDrawer
      open={filtersOpen}
      draftFilters={draftFilters}
      members={members}
      onClose={onCloseFilters}
      onDraftChange={onDraftChange}
      onResetDraft={onResetDraft}
      onApply={onApplyFilters}
    />
    <StockSupplyModal
      open={stockSupplyModalOpen}
      onClose={onCloseStockSupplyModal}
      onSuccess={onStockSupplySuccess}
    />
  </>
);
