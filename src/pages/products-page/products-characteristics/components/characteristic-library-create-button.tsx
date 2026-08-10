import { CaretDownIcon, PlusIcon } from "@phosphor-icons/react";
import { Dropdown, Flex } from "antd";

import { CharacteristicLibraryDropdown } from "./characteristic-library-dropdown";
import { useCharacteristicLibraryCreateButton } from "./use-characteristic-library-create-button";

type CharacteristicLibraryCreateButtonProps = {
  onCreateClick: () => void;
};

export const CharacteristicLibraryCreateButton = ({
  onCreateClick,
}: CharacteristicLibraryCreateButtonProps) => {
  const {
    dropdownOpen,
    expandedKeys,
    loadError,
    loading,
    setExpandedKeys,
    treeData,
    handleOpenChange,
    t,
  } = useCharacteristicLibraryCreateButton();

  return (
    <Dropdown.Button
      type="primary"
      icon={<CaretDownIcon size={12} />}
      trigger={["click"]}
      open={dropdownOpen}
      menu={{ items: [] }}
      onClick={onCreateClick}
      style={{ width: "min-content" }}
      onOpenChange={handleOpenChange}
      popupRender={() => (
        <CharacteristicLibraryDropdown
          loading={loading}
          loadError={loadError}
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          header={t("characteristics.library.addFromTemplate")}
          errorText={t("characteristics.library.loadFailed")}
        />
      )}
    >
      <Flex align="center" gap={6}>
        <PlusIcon size={16} />
        {t("characteristics.createCharacteristic")}
      </Flex>
    </Dropdown.Button>
  );
};
