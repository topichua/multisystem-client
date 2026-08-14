import { ChatTextIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Empty, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type {
  MessageTemplate,
  MessageTemplateListFilter,
} from "@/features/message-templates/model/message-template.types";

import * as S from "./settings-templates-layout.styled";
import { getTemplatePreview } from "./settings-templates.utils";
import { TemplateTypeFilter } from "./template-type-filter";
import { TemplateTypeTag } from "./template-type-tag";

const { Text } = Typography;

type SettingsTemplatesSidebarProps = {
  templates: MessageTemplate[];
  typeFilter: MessageTemplateListFilter;
  activeTemplateId: number | null;
  listLoading: boolean;
  listError: string | null;
  onTypeFilterChange: (value: MessageTemplateListFilter) => void;
  onCreateClick: () => void;
  onTemplateClick: (templateId: number) => void;
};

export const SettingsTemplatesSidebar = ({
  templates,
  typeFilter,
  activeTemplateId,
  listLoading,
  listError,
  onTypeFilterChange,
  onCreateClick,
  onTemplateClick,
}: SettingsTemplatesSidebarProps) => {
  const { t } = useTranslation();

  return (
    <PaneNavSplitLayout.SubSidebar data-qa="layout-settings-templates-sidebar">
      <PaneSectionHeaderStack data-qa="layout-settings-templates-header">
        <PaneSectionTitle>{t("templates.title")}</PaneSectionTitle>
        <Button
          type="primary"
          block
          icon={<PlusIcon />}
          onClick={onCreateClick}
        >
          {t("templates.createTemplate")}
        </Button>
        <TemplateTypeFilter value={typeFilter} onChange={onTypeFilterChange} />
      </PaneSectionHeaderStack>

      <PaneScrollRegion data-qa="layout-settings-templates-nav-scroll">
        {listError && (
          <Alert
            type="error"
            title={listError}
            showIcon
            style={{ margin: "0 8px 12px" }}
          />
        )}
        {listLoading && templates.length === 0 ? (
          <CenteredSpinner minHeight={160} />
        ) : (
          <div data-qa="layout-settings-templates-nav">
            {templates.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("templates.emptyState")}
              />
            ) : (
              templates.map((template) => {
                const isSelected = template.id === activeTemplateId;

                return (
                  <S.TemplateNavItem
                    key={template.id}
                    type="button"
                    $active={isSelected}
                    $inactive={!template.isActive}
                    aria-current={isSelected ? "page" : undefined}
                    onClick={() => onTemplateClick(template.id)}
                  >
                    <Flex align="flex-start" gap={12}>
                      <S.TemplateNavIcon $active={isSelected}>
                        <ChatTextIcon size={18} />
                      </S.TemplateNavIcon>

                      <Flex vertical flex={1} style={{ minWidth: 0 }}>
                        <Flex
                          align="center"
                          gap={8}
                          style={{ minWidth: 0, overflow: "hidden" }}
                        >
                          <Text
                            strong
                            ellipsis={{ tooltip: template.name }}
                            style={{ minWidth: 0, flex: 1 }}
                          >
                            {template.name}
                          </Text>
                          <TemplateTypeTag type={template.type} />
                        </Flex>
                        <Text type="secondary" ellipsis>
                          {getTemplatePreview(template.template, t)}
                        </Text>
                      </Flex>
                    </Flex>
                  </S.TemplateNavItem>
                );
              })
            )}
          </div>
        )}
      </PaneScrollRegion>
    </PaneNavSplitLayout.SubSidebar>
  );
};
