import type { FormInstance } from "antd";
import { useCallback } from "react";

import type { ProductDetails } from "@/features/products/model/product.types";

import type {
  ProductCreateFormValues,
  ProductEditFormValues,
} from "../product-modal.types";

type UseProductEditAutosaveParams = {
  form: FormInstance<ProductCreateFormValues>;
  isEditMode: boolean;
  product: ProductDetails | null;
  onPatchProduct?: (
    field: keyof ProductEditFormValues,
    values: ProductEditFormValues,
  ) => Promise<boolean>;
};

export const useProductEditAutosave = ({
  form,
  isEditMode,
  product,
  onPatchProduct,
}: UseProductEditAutosaveParams) => {
  const handleEditFieldBlur = useCallback(
    async (fieldName: keyof ProductEditFormValues) => {
      if (!isEditMode || !onPatchProduct || !product) {
        return;
      }

      try {
        await form.validateFields([fieldName]);
        const values = form.getFieldsValue();
        await onPatchProduct(fieldName, {
          name: values.name,
          description: values.description,
          status: values.status,
          sourceType: values.sourceType,
          sourceId: values.sourceId,
          referenceGroupId: values.referenceGroupId,
          price: values.price,
          currency: values.currency,
          inStock: values.inStock,
          quantity: values.quantity,
          categoryId: values.categoryId,
        });
      } catch {
        // Skip auto-save when the blurred field is invalid.
      }
    },
    [form, isEditMode, onPatchProduct, product],
  );

  return { handleEditFieldBlur };
};
