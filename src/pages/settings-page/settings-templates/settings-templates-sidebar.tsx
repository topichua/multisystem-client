import { ChatTextIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Empty, Flex, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import type { MessageTemplate } from "@/features/message-templates/model/message-template.types";

import * as S from "./settings-templates-layout.styled";
import { getTemplatePreview } from "./settings-templates.utils";

const { Text } = Typography;

type SettingsTemplatesSidebarProps = {
  templates: MessageTemplate[];
  activeTemplateId: number | null;
  listLoading: boolean;
  listError: string | null;
  onCreateClick: () => void;
  onTemplateClick: (templateId: number) => void;
};

export const SettingsTemplatesSidebar = ({
  templates,
  activeTemplateId,
  listLoading,
  listError,
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
      </PaneSectionHeaderStack>

      <PaneScrollRegion data-qa="layout-settings-templates-nav-scroll">
        {listError ? (
          <Alert
            type="error"
            title={listError}
            showIcon
            style={{ margin: "0 8px 12px" }}
          />
        ) : null}
        {listLoading && templates.length === 0 ? (
          <Spin style={{ margin: 24 }} />
        ) : (
          <div data-qa="layout-settings-templates-nav">
            {templates.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("templates.emptyState")}
              />
            ) : (
              templates.map((template) => {
                const isActive = template.id === activeTemplateId;

                return (
                  <S.TemplateNavItem
                    key={template.id}
                    type="button"
                    $active={isActive}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => onTemplateClick(template.id)}
                  >
                    <Flex align="flex-start" gap={12}>
                      <S.TemplateNavIcon $active={isActive}>
                        <ChatTextIcon size={18} />
                      </S.TemplateNavIcon>

                      <Flex vertical flex={1} style={{ minWidth: 0 }}>
                        <Text strong ellipsis={{ tooltip: template.name }}>
                          {template.name}
                        </Text>
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
