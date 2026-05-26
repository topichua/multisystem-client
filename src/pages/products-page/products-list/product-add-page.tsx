import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button, Flex, Popconfirm, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import AIAssistanceIcon from "@/components/icons/ai-assistance/AIAssistance.svg?react";
import { pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";

import { AiToolsProvider } from "@/features/products/model/ai-tools-provider";

import { ProductCreateForm } from "./product-create-form";
import { useProductsListController } from "./use-products-list-controller";
import styled, { css } from "styled-components";

export const ProductAddPage = observer(() => {
  const { productId } = useParams<{ productId?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isEditMode = productId != null;
  const [aiToolsOpen, setAiToolsOpen] = useState(false);

  const {
    contextHolder,
    categoryOptions,
    handleCreate,
    patchProductField,
    persistProductGallery,
    handleDeleteById,
    handleCreateVariant,
    handleUpdateVariant,
    handleDeleteVariant,
    refreshActiveProduct,
    navigateToProductsList,
    productsStore,
  } = useProductsListController();

  useEffect(() => {
    if (!isEditMode) {
      productsStore.clearActiveProduct();
      return;
    }

    const id = Number(productId);
    if (!Number.isFinite(id) || id < 1) {
      navigate(pagesMap.productsList, { replace: true });
      return;
    }

    productsStore.clearActiveProduct();
    void productsStore.loadProductById(id);

    return () => {
      productsStore.clearActiveProduct();
    };
  }, [isEditMode, navigate, productId, productsStore]);

  const activeProduct = productsStore.activeProduct;
  const pageLoading =
    isEditMode &&
    (productsStore.detailLoading ||
      (activeProduct == null && productsStore.detailError == null));

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Header
          data-qa={
            isEditMode
              ? "layout-product-edit-header"
              : "layout-product-add-header"
          }
        >
          <Flex vertical gap={12} style={{ width: "100%" }}>
            <Button
              type="text"
              icon={<ArrowLeftIcon size={20} />}
              onClick={navigateToProductsList}
              style={{ alignSelf: "flex-start", paddingInlineStart: 0 }}
            >
              {t("products.detailBackToList")}
            </Button>
            <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
              <PaneSectionTitle>
                {isEditMode
                  ? t("products.modalEditTitle")
                  : t("products.modalCreateTitle")}
              </PaneSectionTitle>
              <Flex gap={8} wrap="wrap">
                {isEditMode && activeProduct ? (
                  <Popconfirm
                    title={t("products.deleteConfirm")}
                    onConfirm={() =>
                      void handleDeleteById(activeProduct.id, {
                        navigateToList: true,
                      })
                    }
                  >
                    <Button
                      danger
                      loading={productsStore.deleteLoading}
                      disabled={pageLoading}
                    >
                      {t("products.delete")}
                    </Button>
                  </Popconfirm>
                ) : null}
                {!isEditMode ? (
                  <AiButton
                    $filled
                    icon={<AIAssistanceIcon />}
                    onClick={() => setAiToolsOpen(true)}
                  >
                    Add with Instagram using AI
                  </AiButton>
                ) : null}
              </Flex>
            </Flex>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body
          data-qa={
            isEditMode ? "layout-product-edit-body" : "layout-product-add-body"
          }
        >
          <Spin spinning={pageLoading}>
            <AiToolsProvider>
              <ProductCreateForm
                mode={isEditMode ? "edit" : "create"}
                product={activeProduct}
                aiToolsOpen={aiToolsOpen}
                setAiToolsOpen={setAiToolsOpen}
                categoryOptions={categoryOptions}
                submitLoading={productsStore.saveLoading}
                variantDeleteLoadingId={productsStore.variantDeleteLoadingId}
                onCreateVariant={handleCreateVariant}
                onUpdateVariant={handleUpdateVariant}
                onDeleteVariant={handleDeleteVariant}
                onProductRefresh={refreshActiveProduct}
                onSubmit={async (
                  values,
                  coverImage,
                  variantDrafts,
                  galleryImages,
                  coverUrl,
                  galleryForVariants,
                ) => {
                  const created = await handleCreate(
                    values,
                    coverImage,
                    variantDrafts,
                    galleryImages,
                    coverUrl,
                    galleryForVariants,
                  );

                  if (created) {
                    navigateToProductsList();
                  }

                  return created;
                }}
                onPatchProduct={patchProductField}
                onPersistGallery={persistProductGallery}
              />
            </AiToolsProvider>
          </Spin>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});

const AiButton = styled(Button)<{ $filled: boolean }>`
  border: none;
  font-weight: 600;
  color: ${(props) => props.theme.colors.base.blue[8]}!important;

  &:not(:disabled):not(.ant-btn-disabled):hover,
  &:not(:disabled):not(.ant-btn-disabled):focus {
    background: linear-gradient(
      45deg,
      ${(props) => props.theme.colors.base.blue[3]} 0%,
      ${(props) => props.theme.colors.base.red[3]} 100%
    );
    border: none;
  }

  ${(props) =>
    props.$filled
      ? css`
          background: linear-gradient(
            45deg,
            ${(props) => props.theme.colors.base.blue[2]} 0%,
            ${(props) => props.theme.colors.base.red[2]} 100%
          );
          border: none;
        `
      : css`
          background: transparent;
          &[disabled] {
            background: transparent;
          }
          border: none;
        `}
`;
