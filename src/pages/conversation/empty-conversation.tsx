import { Empty, Flex } from "antd";
import { useTranslation } from "react-i18next";

export const EmptyConversation = () => {
  const { t } = useTranslation();

  return (
    <Flex
      justify="center"
      align="center"
      style={{ flex: 1, minHeight: 200 }}
      data-qa="layout-conversations-empty-thread"
    >
      <Empty description={t("conversations.selectConversation")} />
    </Flex>
  );
};
