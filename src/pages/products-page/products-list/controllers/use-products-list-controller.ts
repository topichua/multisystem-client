import type { TableProps } from "antd";
import { useCallback, useEffect, useMemo, useState, type Key } from "react";
import { useLocation, useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { flattenCategories } from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import type { Product } from "@/features/products/model/product.types";
import { readProductsListReturnSearch } from "@/features/products/model/products-list-url";
import { useProductsStore } from "@/features/products/model/use-products-store";

// import {
//   buildProductFieldPatch,
//   isProductFieldUnchanged,
//   resolveMainImageUrlForGallery,
// } from "./product-edit-persist";

export const useProductsListController = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const productsStore = useProductsStore();
  const categoriesStore = useCategoriesStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  // const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (categoriesStore.categories.length === 0) {
      void categoriesStore.loadCategories({ silent: true });
    }
  }, [categoriesStore]);

  const categoryNameById = useMemo(
    () =>
      new Map(
        flattenCategories(categoriesStore.categories).map((category) => [
          category.id,
          category.name,
        ]),
      ),
    [categoriesStore.categories],
  );

  const categoryOptions = useMemo(
    () =>
      flattenCategories(categoriesStore.categories).map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categoriesStore.categories],
  );

  const rowSelection: TableProps<Product>["rowSelection"] = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys),
    }),
    [selectedRowKeys],
  );

  // const notifyError = useCallback(
  //   (error: unknown, fallbackKey: string) => {
  //     messageApi.error(getApiErrorMessage(error, t(fallbackKey)));
  //   },
  //   [messageApi, t],
  // );

  // const notifyAutoSaved = useCallback(() => {
  //   messageApi.success(t('products.autoSaveSuccess'), 2);
  // }, [messageApi, t]);

  // const uploadGalleryImages = useCallback(
  //   async (productId: number, galleryImages: File[]): Promise<void> => {
  //     if (galleryImages.length === 0) {
  //       return;
  //     }

  //     const uploadResults = await Promise.allSettled(
  //       galleryImages.map((image, index) =>
  //         productsApi.uploadProductMedia(productId, image, index),
  //       ),
  //     );

  //     const failedCount = uploadResults.filter(
  //       (result) => result.status === 'rejected',
  //     ).length;

  //     if (failedCount > 0) {
  //       messageApi.error(t('products.media.galleryUploadFailed'));
  //     }

  //     await productsStore.loadProducts({ silent: true });
  //   },
  //   [messageApi, productsStore, t],
  // );

  // const handleCreate = useCallback(
  //   async (
  //     values: ProductCreateFormValues,
  //     coverImage?: File | null,
  //     variantDrafts: ProductVariantDraft[] = [],
  //     galleryImages: File[] = [],
  //     coverUrl?: string | null,
  //     galleryForVariants: GalleryItemForVariantResolve[] = [],
  //   ): Promise<Product | null> => {
  //     if (values.categoryId == null) {
  //       return null;
  //     }

  //     try {
  //       const created = await productsStore.createProduct(
  //         {
  //           name: values.name,
  //           description: values.description,
  //           status: values.status,
  //           sourceType: values.sourceType ?? 'manual',
  //           sourceId: values.sourceId,
  //           referenceGroupId: values.referenceGroupId,
  //           price: values.price,
  //           currency: values.currency,
  //           inStock: values.inStock,
  //           quantity: values.quantity,
  //           mainImageUrl: coverImage
  //             ? ''
  //             : coverUrl?.trim() || (values.mediaUrl ?? '').trim(),
  //           categoryId: values.categoryId,
  //         },
  //         coverImage ?? null,
  //       );

  //       await uploadGalleryImages(created.id, galleryImages);

  //       for (const draft of variantDrafts) {
  //         const { payload, imageFile } = resolveVariantDraftForCreate(
  //           draft,
  //           galleryForVariants,
  //         );
  //         const trimmedUrl = payload.imageUrl.trim();

  //         try {
  //           const createdVariantId = await productsStore.createProductVariant(
  //             created.id,
  //             payload,
  //             imageFile,
  //           );

  //           if (
  //             !imageFile &&
  //             createdVariantId != null &&
  //             trimmedUrl &&
  //             canUseVariantImageUrlForMedia(trimmedUrl)
  //           ) {
  //             if (trimmedUrl.length > PRODUCT_MEDIA_URL_MAX_LENGTH) {
  //               messageApi.error(
  //                 t('products.media.urlTooLong', {
  //                   max: PRODUCT_MEDIA_URL_MAX_LENGTH,
  //                 }),
  //               );
  //             } else {
  //               await productsApi.putVariantMedia(
  //                 created.id,
  //                 createdVariantId,
  //                 {
  //                   url: trimmedUrl,
  //                   type: 'image',
  //                 },
  //               );

  //               await productsStore.loadProductById(created.id);
  //             }
  //           }
  //         } catch (e) {
  //           notifyError(e, 'products.variantCreateFailed');
  //         }
  //       }

  //       messageApi.success(t('products.createSuccess'));
  //       return created;
  //     } catch (e) {
  //       notifyError(e, 'products.createFailed');
  //       return null;
  //     }
  //   },
  //   [notifyError, productsStore, t, messageApi, uploadGalleryImages],
  // );

  // const deleteRemovedGalleryMedia = useCallback(
  //   async (productId: number, removedMediaIds: number[]): Promise<void> => {
  //     if (removedMediaIds.length === 0) {
  //       return;
  //     }

  //     const deleteResults = await Promise.allSettled(
  //       removedMediaIds.map((mediaId) =>
  //         productsApi.deleteMedia(productId, mediaId),
  //       ),
  //     );

  //     const failedCount = deleteResults.filter(
  //       (result) => result.status === 'rejected',
  //     ).length;

  //     if (failedCount > 0) {
  //       messageApi.error(t('products.media.deleteFailed'));
  //     }
  //   },
  //   [messageApi, t],
  // );

  // const persistProductGallery = useCallback(
  //   async (
  //     coverImage?: File | null,
  //     galleryImages: File[] = [],
  //     coverUrl?: string | null,
  //     remainingGalleryUrls: string[] = [],
  //   ): Promise<boolean> => {
  //     const active = productsStore.activeProduct;
  //     if (!active) {
  //       return false;
  //     }

  //     const mainImageUrl = resolveMainImageUrlForGallery(
  //       active,
  //       remainingGalleryUrls,
  //       coverUrl,
  //       coverImage,
  //     );
  //     const removedMediaIds = collectRemovedProductMediaIds(
  //       active,
  //       remainingGalleryUrls,
  //     );
  //     const coverChanged =
  //       coverImage != null ||
  //       mainImageUrl !== (active.mainImageUrl ?? null) ||
  //       removedMediaIds.length > 0 ||
  //       galleryImages.length > 0;

  //     if (!coverChanged) {
  //       return true;
  //     }

  //     try {
  //       await deleteRemovedGalleryMedia(active.id, removedMediaIds);

  //       if (
  //         coverImage != null ||
  //         mainImageUrl !== (active.mainImageUrl ?? null)
  //       ) {
  //         await productsStore.updateProduct(
  //           active.id,
  //           { mainImageUrl },
  //           coverImage ?? null,
  //           {
  //             silent: true,
  //           },
  //         );
  //       }

  //       await uploadGalleryImages(active.id, galleryImages);
  //       await productsStore.loadProductById(active.id, { silent: true });
  //       notifyAutoSaved();
  //       return true;
  //     } catch (e) {
  //       notifyError(e, "products.updateFailed");
  //       return false;
  //     }
  //   },
  //   [
  //     deleteRemovedGalleryMedia,
  //     notifyAutoSaved,
  //     notifyError,
  //     productsStore,
  //     uploadGalleryImages,
  //   ],
  // );

  // const patchProductField = useCallback(
  //   async (
  //     field: keyof ProductEditFormValues,
  //     values: ProductEditFormValues,
  //   ): Promise<boolean> => {
  //     const active = productsStore.activeProduct;
  //     if (!active) {
  //       return false;
  //     }

  //     if (isProductFieldUnchanged(active, field, values)) {
  //       return true;
  //     }

  //     const payload = buildProductFieldPatch(field, values);
  //     if (Object.keys(payload).length === 0) {
  //       return true;
  //     }

  //     try {
  //       await productsStore.updateProduct(active.id, payload, null, {
  //         silent: true,
  //       });
  //       notifyAutoSaved();
  //       return true;
  //     } catch (e) {
  //       notifyError(e, 'products.updateFailed');
  //       return false;
  //     }
  //   },
  //   [notifyAutoSaved, notifyError, productsStore],
  // );

  const navigateToProductsList = useCallback(() => {
    const returnSearch = readProductsListReturnSearch(location.state);
    navigate({
      pathname: pagesMap.productsList,
      ...(returnSearch ? { search: returnSearch } : {}),
    });
  }, [location.state, navigate]);

  const handleDeleteById = useCallback(
    async (productId: number, options?: { navigateToList?: boolean }) => {
      try {
        await productsStore.deleteProduct(productId);
        // messageApi.success(t('products.deleteSuccess'));

        if (options?.navigateToList) {
          navigateToProductsList();
        }
      } catch (e) {
        console.log(e, "products.deleteFailed");
      }
    },
    [navigateToProductsList, productsStore],
  );

  // const handleOpenProduct = useCallback(
  //   (productId: number) => {
  //     navigate(getProductEditPath(productId), {
  //       state: { productsListSearch: location.search },
  //     });
  //   },
  //   [location.search, navigate],
  // );

  // const handleRowClick = useCallback(
  //   (product: Product) => (event: MouseEvent<HTMLElement>) => {
  //     const target = event.target as HTMLElement;
  //     if (
  //       target.closest('.ant-checkbox-wrapper') ||
  //       target.closest('.ant-checkbox') ||
  //       target.closest('button') ||
  //       target.closest('a')
  //     ) {
  //       return;
  //     }

  //     navigate(getProductEditPath(product.id), {
  //       state: { productsListSearch: location.search },
  //     });
  //   },
  //   [location.search, navigate],
  // );

  // const handleCreateVariant = useCallback(
  //   async (
  //     payload: ProductVariantCreatePayload,
  //     imageFile?: File | null,
  //     options?: { silent?: boolean },
  //   ): Promise<void> => {
  //     const productId = productsStore.activeProduct?.id;
  //     if (!productId) {
  //       return;
  //     }

  //     const trimmedUrl = (payload.imageUrl ?? '').trim();

  //     try {
  //       const createdVariantId = await productsStore.createProductVariant(
  //         productId,
  //         {
  //           ...payload,
  //           imageUrl: imageFile ? '' : trimmedUrl,
  //         },
  //         imageFile ?? null,
  //         { silent: options?.silent },
  //       );
  //       if (!imageFile && createdVariantId != null && trimmedUrl) {
  //         if (trimmedUrl.length > PRODUCT_MEDIA_URL_MAX_LENGTH) {
  //           messageApi.error(
  //             t('products.media.urlTooLong', {
  //               max: PRODUCT_MEDIA_URL_MAX_LENGTH,
  //             }),
  //           );
  //         } else {
  //           await productsApi.putVariantMedia(productId, createdVariantId, {
  //             url: trimmedUrl,
  //             type: 'image',
  //           });
  //           await productsStore.loadProductById(productId, {
  //             silent: options?.silent,
  //           });
  //         }
  //       }
  //       if (options?.silent) {
  //         notifyAutoSaved();
  //       } else {
  //         messageApi.success(t('products.variantCreateSuccess'));
  //       }
  //     } catch (e) {
  //       notifyError(e, 'products.variantCreateFailed');
  //     }
  //   },
  //   [messageApi, notifyAutoSaved, notifyError, productsStore, t],
  // );

  // const handleUpdateVariant = useCallback(
  //   async (
  //     variantId: number,
  //     payload: ProductVariantUpdatePayload,
  //     imageFile?: File | null,
  //     options?: { silent?: boolean },
  //   ): Promise<void> => {
  //     const productId = productsStore.activeProduct?.id;
  //     if (!productId) {
  //       return;
  //     }

  //     const trimmedUrl = (payload.imageUrl ?? '').trim();

  //     try {
  //       await productsStore.updateProductVariant(
  //         productId,
  //         variantId,
  //         {
  //           ...payload,
  //           imageUrl: imageFile ? '' : trimmedUrl || null,
  //         },
  //         { silent: options?.silent },
  //       );

  //       if (imageFile) {
  //         const dataUrl = await readFileAsDataUrl(imageFile);
  //         if (dataUrl.length > PRODUCT_MEDIA_URL_MAX_LENGTH) {
  //           messageApi.error(
  //             t('products.media.urlTooLong', {
  //               max: PRODUCT_MEDIA_URL_MAX_LENGTH,
  //             }),
  //           );
  //           return;
  //         }
  //         await productsApi.putVariantMedia(productId, variantId, {
  //           url: dataUrl,
  //           type: 'image',
  //         });
  //         await productsStore.loadProductById(productId, {
  //           silent: options?.silent,
  //         });
  //       } else if (trimmedUrl) {
  //         await productsApi.putVariantMedia(productId, variantId, {
  //           url: trimmedUrl,
  //           type: 'image',
  //         });
  //         await productsStore.loadProductById(productId, {
  //           silent: options?.silent,
  //         });
  //       }

  //       if (options?.silent) {
  //         notifyAutoSaved();
  //       } else {
  //         messageApi.success(t('products.variantUpdateSuccess'));
  //       }
  //     } catch (e) {
  //       notifyError(e, 'products.variantUpdateFailed');
  //     }
  //   },
  //   [messageApi, notifyAutoSaved, notifyError, productsStore, t],
  // );

  // const handleDeleteVariant = useCallback(
  //   async (variantId: number) => {
  //     const productId = productsStore.activeProduct?.id;
  //     if (!productId) {
  //       return;
  //     }

  //     try {
  //       await productsStore.deleteProductVariant(productId, variantId);
  //       messageApi.success(t('products.variantDeleteSuccess'));
  //     } catch (e) {
  //       notifyError(e, 'products.variantDeleteFailed');
  //     }
  //   },
  //   [messageApi, notifyError, productsStore, t],
  // );

  // const refreshActiveProduct = useCallback(async () => {
  //   const id = productsStore.activeProduct?.id;
  //   if (id == null) {
  //     return;
  //   }
  //   try {
  //     await productsStore.loadProductById(id);
  //   } catch (e) {
  //     notifyError(e, 'products.detailLoadFailed');
  //   }
  // }, [notifyError, productsStore]);

  const loadVariantCustomFields = useCallback(() => {
    return productsStore.loadVariantCustomFields();
  }, [productsStore]);

  return {
    // contextHolder,
    productsStore,
    categoryNameById,
    categoryOptions,
    rowSelection,
    navigateToProductsList,
    variantCustomFields: productsStore.variantCustomFields,
    isVariantCustomFieldsLoading: productsStore.variantCustomFieldsLoading,
    loadVariantCustomFields,
    // handleCreate,
    // patchProductField,
    // persistProductGallery,
    handleDeleteById,
    // handleCreateVariant,
    // handleUpdateVariant,
    // handleDeleteVariant,
    // handleOpenProduct,
    // handleRowClick,
    // refreshActiveProduct,
  };
};
