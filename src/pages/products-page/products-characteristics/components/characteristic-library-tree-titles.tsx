import {
  CaretDownIcon,
  CaretRightIcon,
  CheckIcon,
  ListChecksIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import { Button, Spin } from "antd";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type {
  CharacteristicFieldType,
  CharacteristicLibraryField,
  CharacteristicLibraryGroup,
  CharacteristicLibraryInstallPayload,
} from "@/features/characteristics/model/characteristic.types";

import { LIBRARY_GROUP_ICONS } from "./characteristic-library.constants";
import * as S from "./characteristic-library-create-button.styled";

type LibraryFieldTitleProps = {
  field: CharacteristicLibraryField;
  groupKey?: string;
  installing: boolean;
  onInstall: (payload: CharacteristicLibraryInstallPayload) => void;
};

type LibraryGroupTitleProps = {
  group: CharacteristicLibraryGroup;
  expanded: boolean;
  installing: boolean;
  onToggle: (groupKey: string) => void;
  onInstallGroup: (groupKey: string) => void;
};

const FieldTypeIcon = ({ type }: { type: CharacteristicFieldType }) => {
  if (type === "options") {
    return <ListChecksIcon size={16} />;
  }

  return <TextTIcon size={16} />;
};

export const LibraryFieldTitle = ({
  field,
  groupKey,
  installing,
  onInstall,
}: LibraryFieldTitleProps) => {
  const canInstall = !field.alreadyInstalled && !installing;

  const handleClick = () => {
    if (!canInstall) {
      return;
    }

    onInstall(
      groupKey == null ? { key: field.key } : { key: field.key, groupKey },
    );
  };

  return (
    <S.LibraryTreeRow
      $clickable={canInstall}
      $disabled={field.alreadyInstalled}
      role={canInstall ? "button" : undefined}
      tabIndex={canInstall ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (!canInstall) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <S.LibraryTreeIcon aria-hidden>
        <FieldTypeIcon type={field.type} />
      </S.LibraryTreeIcon>

      <S.LibraryTreeName>
        <S.LibraryTreeLabel title={field.label}>
          {field.label}
        </S.LibraryTreeLabel>
        <S.LibraryTreeMeta>({field.typeLabel})</S.LibraryTreeMeta>
      </S.LibraryTreeName>

      {installing ? (
        <S.LibraryTreeExtra aria-hidden>
          <Spin size="small" />
        </S.LibraryTreeExtra>
      ) : field.alreadyInstalled ? (
        <S.LibraryTreeExtra aria-hidden>
          <CheckIcon size={14} />
        </S.LibraryTreeExtra>
      ) : null}
    </S.LibraryTreeRow>
  );
};

export const LibraryGroupTitle = ({
  group,
  expanded,
  installing,
  onToggle,
  onInstallGroup,
}: LibraryGroupTitleProps) => {
  const { t } = useTranslation();
  const treeGroupKey = `group:${group.key}`;
  const hasInstallableFields = group.fields.some(
    (field) => !field.alreadyInstalled,
  );

  const handleToggle = () => {
    onToggle(treeGroupKey);
  };

  const handleAddGroupClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!hasInstallableFields || installing) {
      return;
    }

    onInstallGroup(group.key);
  };

  return (
    <S.LibraryTreeRow
      $clickable
      aria-expanded={expanded}
      role="button"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleToggle();
        }
      }}
    >
      <S.LibraryTreeCaret aria-hidden>
        {expanded ? <CaretDownIcon size={14} /> : <CaretRightIcon size={14} />}
      </S.LibraryTreeCaret>

      <S.LibraryTreeIcon aria-hidden>
        {LIBRARY_GROUP_ICONS[group.icon] ?? "📦"}
      </S.LibraryTreeIcon>

      <S.LibraryTreeName $strong>
        <S.LibraryTreeLabel title={group.label}>
          {group.label}
        </S.LibraryTreeLabel>
      </S.LibraryTreeName>

      {hasInstallableFields ? (
        <S.LibraryTreeGroupAction data-library-group-action>
          <Button
            type="link"
            size="small"
            loading={installing}
            disabled={installing}
            onClick={handleAddGroupClick}
          >
            {t("characteristics.library.addGroup")}
          </Button>
        </S.LibraryTreeGroupAction>
      ) : null}

      <S.LibraryTreeExtra>{group.fieldCount}</S.LibraryTreeExtra>
    </S.LibraryTreeRow>
  );
};
