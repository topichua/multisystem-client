import { Spin, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import type { Key, ReactNode } from "react";

import * as S from "./characteristic-library-create-button.styled";

type CharacteristicLibraryDropdownProps = {
  loading: boolean;
  loadError: boolean;
  treeData: DataNode[];
  expandedKeys: Key[];
  onExpand: (keys: Key[]) => void;
  header: ReactNode;
  errorText: ReactNode;
};

export const CharacteristicLibraryDropdown = ({
  loading,
  loadError,
  treeData,
  expandedKeys,
  onExpand,
  header,
  errorText,
}: CharacteristicLibraryDropdownProps) => {
  let body: ReactNode;

  if (loading) {
    body = (
      <S.PopupState>
        <Spin size="small" />
      </S.PopupState>
    );
  } else if (loadError) {
    body = <S.PopupError>{errorText}</S.PopupError>;
  } else {
    body = (
      <S.LibraryTreeShell>
        <Tree
          blockNode
          selectable={false}
          switcherIcon={null}
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={onExpand}
        />
      </S.LibraryTreeShell>
    );
  }

  return (
    <S.PopupPanel>
      <S.PopupHeader>{header}</S.PopupHeader>
      {body}
    </S.PopupPanel>
  );
};
