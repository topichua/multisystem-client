import { Select, Tag } from "antd";
import type { SelectProps } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  GroupColoredNameTag,
  GroupOptionWithSwatch,
} from "@/features/conversation-groups/components/group-select-visuals";
import {
  type GroupSelectOptionData,
  toGroupSelectOptions,
} from "@/features/conversation-groups/group-select-options";
import { useEnsureConversationGroupsLoaded } from "@/features/conversation-groups/model/use-ensure-conversation-groups-loaded";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

import * as S from "./conversation.styled";

export const ConversationListGroupFilter = observer(() => {
  const { t } = useTranslation();
  useEnsureConversationGroupsLoaded();

  const groupsStore = useConversationGroupsStore();
  const conversationsStore = useConversationsStore();

  const options = useMemo(
    () => toGroupSelectOptions(groupsStore.groups),
    [groupsStore.groups],
  );

  const tagRender: SelectProps["tagRender"] = (props) => {
    const id = props.value as number;
    const g = groupsStore.groups.find((x) => x.id === id);

    if (!g) {
      return (
        <Tag
          closable={props.closable}
          variant="solid"
          onClose={props.onClose}
          style={{ marginInlineEnd: 4 }}
        >
          {props.label}
        </Tag>
      );
    }

    return (
      <GroupColoredNameTag
        name={g.name}
        color={g.color}
        style={{ marginInlineEnd: 4 }}
        closable={props.closable}
        onClose={props.onClose}
      />
    );
  };

  const loading = groupsStore.listLoading && groupsStore.groups.length === 0;

  return (
    <S.FilterRow>
      <Select
        mode="multiple"
        allowClear
        placeholder={t("conversations.filterAllGroups")}
        loading={loading}
        style={{ width: "100%" }}
        value={conversationsStore.conversationListGroupFilterIds}
        options={options}
        maxTagCount="responsive"
        tagRender={tagRender}
        optionRender={(option) => {
          const data = option.data as GroupSelectOptionData;

          return (
            <GroupOptionWithSwatch label={data.label} color={data.color} />
          );
        }}
        onChange={(ids) => {
          conversationsStore.setConversationListGroupFilterIds(ids ?? []);
        }}
        popupMatchSelectWidth={false}
        showSearch
        optionFilterProp="label"
      />
    </S.FilterRow>
  );
});
