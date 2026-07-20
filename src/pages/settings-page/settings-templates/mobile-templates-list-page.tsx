import {
  ArrowLeftIcon,
  CaretRightIcon,
  ChatTextIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Alert, Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router";

import { getSettingsTemplatePath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";

import type { SettingsTemplatesOutletContext } from "./settings-templates-layout";
import { getTemplatePreview } from "./settings-templates.utils";
import * as S from "./mobile-templates-list-page.styled";

export const MobileTemplatesListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useMessageTemplatesStore();
  const { onCreateClick } = useOutletContext<SettingsTemplatesOutletContext>();

  const sortedTemplates = useMemo(
    () =>
      [...store.templates].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [store.templates],
  );

  return (
    <S.Root>
      <S.Header>
        <S.TitleRow>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("templates.mobile.backToSettingsAria")}
            data-qa="settings-mobile-templates-back"
            onClick={() => navigate(pagesMap.settings)}
          />
          <S.PageTitle level={3}>{t("templates.title")}</S.PageTitle>
        </S.TitleRow>
        <S.CreateButton
          type="primary"
          icon={<PlusIcon />}
          aria-label={t("templates.mobile.createTemplateAria")}
          data-qa="settings-mobile-templates-create"
          onClick={onCreateClick}
        >
          <S.CreateButtonLabel>
            {t("templates.createTemplate")}
          </S.CreateButtonLabel>
        </S.CreateButton>
      </S.Header>

      {store.listError && (
        <Alert type="error" title={store.listError} showIcon />
      )}

      {store.listLoading && sortedTemplates.length === 0 ? (
        <S.StateContainer>
          <CenteredSpinner minHeight={160} />
        </S.StateContainer>
      ) : sortedTemplates.length === 0 ? (
        <S.StateContainer>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("templates.emptyState")}
          />
        </S.StateContainer>
      ) : (
        <S.ListCard>
          {sortedTemplates.map((template) => (
            <S.TemplateItemButton
              key={template.id}
              type="text"
              block
              data-qa={`settings-mobile-template-item-${template.id}`}
              onClick={() => navigate(getSettingsTemplatePath(template.id))}
            >
              <S.ItemContent align="center" gap={12}>
                <S.IconTile aria-hidden="true">
                  <ChatTextIcon />
                </S.IconTile>
                <S.ItemCopy vertical gap={2}>
                  <S.ItemTitle>{template.name}</S.ItemTitle>
                  <S.ItemPreview>
                    {getTemplatePreview(template.template, t)}
                  </S.ItemPreview>
                </S.ItemCopy>
                <S.Caret aria-hidden="true">
                  <CaretRightIcon size={18} />
                </S.Caret>
              </S.ItemContent>
            </S.TemplateItemButton>
          ))}
        </S.ListCard>
      )}
    </S.Root>
  );
});
