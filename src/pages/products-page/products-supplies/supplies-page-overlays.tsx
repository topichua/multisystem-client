import type { InventoryHistorySupplyItem } from "@/features/inventory/model/inventory.types";
import { StockSupplyModal } from "@/features/inventory/components/stock-supply-modal/stock-supply-modal";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { InventoryHistorySupplyDrawer } from "@/pages/products-page/products-inventory-history/inventory-history-supply-drawer";

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
  editingSupplyId: number | null;
  onCloseStockSupplyModal: () => void;
  onStockSupplySuccess: () => void;
  selectedSupply: InventoryHistorySupplyItem | null;
  onCloseSupplyDetails: () => void;
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
  editingSupplyId,
  onCloseStockSupplyModal,
  onStockSupplySuccess,
  selectedSupply,
  onCloseSupplyDetails,
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
      key={editingSupplyId ?? "create"}
      open={stockSupplyModalOpen}
      supplyId={editingSupplyId}
      onClose={onCloseStockSupplyModal}
      onSuccess={onStockSupplySuccess}
    />
    <InventoryHistorySupplyDrawer
      open={selectedSupply != null}
      item={selectedSupply}
      onClose={onCloseSupplyDetails}
      hideStockColumn
    />
  </>
);
