import type { DataNode } from "antd/es/tree";
import type { Key } from "react";

import type {
  CharacteristicLibraryField,
  CharacteristicLibraryInstallPayload,
  CharacteristicLibraryResponse,
} from "@/features/characteristics/model/characteristic.types";

import {
  LibraryFieldTitle,
  LibraryGroupTitle,
} from "./characteristic-library-tree-titles";

type BuildFieldTreeNodeParams = {
  field: CharacteristicLibraryField;
  key: string;
  groupKey: string;
  installing: boolean;
  onInstallField: (payload: CharacteristicLibraryInstallPayload) => void;
};

type BuildLibraryTreeDataParams = {
  library: CharacteristicLibraryResponse;
  expandedKeys: Key[];
  installingKey: string | null;
  onToggleGroup: (groupKey: string) => void;
  onInstallField: (payload: CharacteristicLibraryInstallPayload) => void;
  onInstallGroup: (groupKey: string) => void;
};

const buildFieldGroupKeyMap = (
  library: CharacteristicLibraryResponse,
): Map<string, string> => {
  const groupKeyByFieldKey = new Map<string, string>();

  for (const group of library.groups) {
    for (const field of group.fields) {
      groupKeyByFieldKey.set(field.key, group.key);
    }
  }

  return groupKeyByFieldKey;
};

const buildFieldTreeNode = ({
  field,
  key,
  groupKey,
  installing,
  onInstallField,
}: BuildFieldTreeNodeParams): DataNode => ({
  key,
  isLeaf: true,
  selectable: false,
  disabled: field.alreadyInstalled,
  title: (
    <LibraryFieldTitle
      field={field}
      groupKey={groupKey}
      installing={installing}
      onInstall={onInstallField}
    />
  ),
});

const bySortOrder = <T extends { sortOrder: number }>(left: T, right: T) =>
  left.sortOrder - right.sortOrder;

export const buildLibraryTreeData = ({
  library,
  expandedKeys,
  installingKey,
  onToggleGroup,
  onInstallField,
  onInstallGroup,
}: BuildLibraryTreeDataParams): DataNode[] => {
  const groupKeyByFieldKey = buildFieldGroupKeyMap(library);
  const expandedKeySet = new Set(expandedKeys);

  const featuredNodes = library.featured.flatMap((field) => {
    const groupKey = groupKeyByFieldKey.get(field.key);

    if (groupKey == null) {
      return [];
    }

    return [
      buildFieldTreeNode({
        field,
        key: `featured:${field.key}`,
        groupKey,
        installing: installingKey === `field:${field.key}`,
        onInstallField,
      }),
    ];
  });

  const groupNodes = [...library.groups].sort(bySortOrder).map((group) => {
    const treeGroupKey = `group:${group.key}`;

    return {
      key: treeGroupKey,
      selectable: false,
      title: (
        <LibraryGroupTitle
          group={group}
          expanded={expandedKeySet.has(treeGroupKey)}
          installing={installingKey === treeGroupKey}
          onToggle={onToggleGroup}
          onInstallGroup={onInstallGroup}
        />
      ),
      children: [...group.fields]
        .sort(bySortOrder)
        .map((field) =>
          buildFieldTreeNode({
            field,
            key: `${treeGroupKey}:${field.key}`,
            groupKey: group.key,
            installing: installingKey === `field:${field.key}`,
            onInstallField,
          }),
        ),
    };
  });

  return [...featuredNodes, ...groupNodes];
};
