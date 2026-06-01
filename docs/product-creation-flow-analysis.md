# Product Creation Flow Analysis

This document describes the current product creation implementation. It is an analysis only; it does not propose or include code changes.

## 1. Entry Point

Product creation starts in `src/pages/products-page/products-list/pages/product-add-page.tsx`.

The create route is registered in `src/app/router/page-routes.tsx`:

```txt
/products/list/add -> ProductAddPage
```

There is also a route:

```txt
/products/list/product/:productId -> ProductAddPage
```

At the moment this route points to the same page component, but the current controller behaves as a create flow rather than a complete edit flow.

The route is nested under:

```txt
PageRoutes
ProtectedRoute
HomePage
ProductsPage
ProductAddPage
```

Application-level providers are configured in `src/main.tsx`, including `RootProviders`, `BrowserRouter`, `AuthProvider`, `CategoriesProvider`, `ProductsProvider`, and other domain providers.

## 2. Form Architecture

The Ant Design Form instance is created in `src/pages/products-page/products-list/controllers/use-product-add-page-controller.ts`:

```ts
const [form] = Form.useForm<ProductAddFormValues>();
```

The `<Form>` is rendered in `src/pages/products-page/products-list/form/product-form.tsx`.

The base form values are defined in `src/pages/products-page/products-list/form/product-form.types.ts`:

```ts
type ProductCreateFormValues = {
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  sourceType: string;
  sourceId: string;
  referenceGroupId: string;
  price: number;
  quantity: number;
  mediaUrl: string;
  categoryId?: number;
};
```

The add page extends that shape in the controller:

```ts
type ProductAddFormValues = ProductCreateFormValues & {
  characteristics: CharacteristicRow[];
  singleCharacteristics: SingleCharacteristicRow[];
  variants: unknown[];
};
```

Main form-controlled fields:

- `name`
- `categoryId`
- `description`
- `price`
- `quantity`
- `status`
- `singleCharacteristics`
- `characteristics`
- editable variant table fields under `variants`

React state controlled by the controller:

- `productType`
- `productVariants`
- `uploadedProductMedia`
- `productMediaUploadingCount`
- `deletingProductMediaId`
- `isCreatingProduct`
- `variantImagesModalVariant`
- `excludedVariantKeys`
- `deletingVariantKey`

Important detail: `productVariants` is the real UI model for variants. The Form `variants` array only mirrors editable table values like `key`, `price`, `quantity`, `sku`, and `discountPrice`.

## 3. Submit Flow

The create button is rendered in `src/pages/products-page/products-list/form/product-form.tsx` as a submit button:

```tsx
<Button type="primary" htmlType="submit" />
```

Step-by-step flow:

1. User clicks Create.
2. Ant Design Form validates mounted `Form.Item` rules.
3. If validation fails, `handleFinishFailed` scrolls to the first invalid field.
4. If validation succeeds, Form calls `onFinish={onSubmit}`.
5. `onSubmit` is `handleCreateProductSubmit` from `use-product-add-page-controller.ts`.
6. The controller merges `productVariants` state with current Form table values using `mergeProductVariantsWithFormValues`.
7. The controller validates variant-specific rules:
   - variants product must have at least one variant
   - duplicate variant keys are blocked
   - manual variants with selected custom fields must have non-empty custom field values
8. If product type is `variants` and there is exactly one variant, a confirmation modal asks whether to create it as a single product.
9. `submitCreateProduct` builds the API payload through `normalizeCreateProductPayload`.
10. `productsApi.createProduct(payload)` sends `POST /products`.
11. On success:

- success message is shown
- `productsStore.loadProducts({ silent: true })` refreshes the list
- `navigateToProductsList()` navigates back to the products list

12. On error:

- `messageApi.error(getApiErrorMessage(...))` displays a user-facing error

13. Loading state is handled by `isCreatingProduct`.

The submit button is disabled while:

```ts
isCreatingProduct || productMediaUploadingCount > 0;
```

## 4. API Flow

Product creation uses:

```txt
POST /products
```

The API function is in `src/features/products/api/products-api.ts`:

```ts
createProduct: async (payload: CreateProductPayload): Promise<ProductDetails>
```

The request payload type is `CreateProductPayload` from `src/features/products/model/product-create-api.types.ts`:

```ts
type CreateProductPayload = {
  name: string;
  description?: string;
  status: ProductLifecycleStatus;
  productType: ProductType;
  sourceType: ProductCreateSourceType;
  price: number;
  currency: ProductCreateCurrency;
  inStock: boolean;
  quantity: number;
  mediaIds: number[];
  categoryId: number;
  variants: CreateProductVariantPayload[];
};
```

Variant payload shape:

```ts
type CreateProductVariantPayload = {
  status: ProductLifecycleStatus;
  customFields: CreateProductVariantCustomFieldValue[];
  price: number;
  inStock: boolean;
  quantity: number;
  sku?: string;
  mediaIds: number[];
};
```

The UI types the response as `ProductDetails`, but the create page does not use the returned product directly.

Separate requests involved before or around creation:

- `GET /workspace/variant-custom-fields`
- `POST /products/upload-media`
- `DELETE /products/upload-media/:mediaId`
- `GET /products` after successful creation to refresh the list
- category loading through `categoriesStore.loadCategories`

## 5. Media Upload Flow

Product media UI is implemented in `src/pages/products-page/products-list/form/sections/product-media-section.tsx`.

Uploads use:

```txt
POST /products/upload-media
```

The FormData field name is:

```ts
PRODUCT_MEDIA_UPLOAD_FIELD_NAME = "image";
```

The upload function is:

```ts
productsApi.uploadMedia(file);
```

Backend response:

```ts
type UploadedProductMediaResponse = {
  id: number;
  cdnUrl: string;
  createdAt: string;
};
```

Mapped UI response:

```ts
type ProductUploadedMedia = {
  id: number;
  src: string;
};
```

Images are uploaded before product creation. The create request does not send files; it sends uploaded media ids:

```ts
mediaIds: productMedia.map((item) => item.id);
```

Uploaded product media is stored in controller state:

```ts
uploadedProductMedia: UploadedProductMedia[]
```

If uploaded product media is deleted before saving:

1. The controller checks whether any variant uses that product image.
2. If used by variants, deletion is blocked with a warning.
3. Otherwise `productsApi.deleteUploadedMedia(mediaId)` is called.
4. The media item is removed from `uploadedProductMedia`.

Variant-only media also uses `productsApi.uploadMedia`, but is stored inside a variant as:

```ts
{
  id: number;
  src: string;
  origin: "variant";
}
```

Product images selected for a variant are stored as:

```ts
{
  id: number;
  src: string;
  origin: "product";
}
```

## 6. Variants Flow

Variants are stored in controller state:

```ts
const [productVariants, setProductVariants] = useState<ProductVariantUi[]>([]);
```

The UI variant type is in `src/pages/products-page/products-list/form/variants/product-add-variant.types.ts`:

```ts
type ProductVariantUi = {
  key: string;
  source: "generated" | "manual";
  customFields: ProductVariantUiCustomField[];
  status: ProductStatus;
  price: number;
  inStock: boolean;
  quantity: number;
  sku?: string;
  media: VariantMediaItem[];
};
```

Generated variants:

- created by `generateProductVariantsFromCharacteristics`
- generated from selected characteristics using cartesian product
- regenerated when watched characteristics, price, quantity, status, or loaded custom fields change
- preserve existing row data when the generated stable key still matches

Manual variants:

- created by `createManualVariant`
- key format is `manual:${crypto.randomUUID()}`
- source is `"manual"`
- custom fields are created from currently selected characteristic columns with empty values

Merge and preserve logic:

- `mergeProductVariantsWithFormValues` merges editable Form values into `ProductVariantUi` by stable `key`
- generated variants preserve matching previous `status`, `price`, `quantity`, `sku`, `inStock`, and `media`
- removed generated variants can be tracked in `excludedVariantKeys`
- duplicate detection uses generated keys or manual custom field combinations

Required variant fields:

- `price`
- `quantity`
- manual variant custom field values when custom fields exist

Optional variant fields:

- `sku`
- media

Important limitation: `discountPrice` is rendered in the table Form, but it is not merged into `ProductVariantUi` and is not sent in the create payload.

## 7. Characteristics / Custom Fields Flow

Variant custom fields are loaded through:

```txt
GET /workspace/variant-custom-fields
```

The API function is:

```ts
productsApi.getVariantCustomFields();
```

Store method:

```ts
productsStore.loadVariantCustomFields();
```

The controller triggers loading on mount:

```ts
useEffect(() => {
  void loadVariantCustomFields();
}, [loadVariantCustomFields]);
```

Custom field shape:

```ts
type VariantCustomField = {
  id: number;
  key: string;
  label: string;
  type: "options" | "text";
  options?: string[];
  sortOrder: number;
};
```

Variants mode `Form.List` value shape:

```ts
characteristics: Array<{
  attributeId?: number;
  values?: string[];
}>;
```

Single mode `Form.List` value shape:

```ts
singleCharacteristics: Array<{
  attributeId?: number;
  value?: string;
}>;
```

How `attributeId` and `values` are used:

- `attributeId` points to an existing `VariantCustomField.id`
- `values` are selected or typed values for variants mode
- selected characteristics are normalized by `normalizeSelectedCharacteristics`
- generated variants get `customFields` from selected characteristic/value pairs

Characteristics are not sent to the backend as a separate top-level field. They are sent indirectly as variant `customFields`:

```ts
customFields: [
  {
    fieldId: number;
    value: string;
  }
]
```

New characteristic fields are not currently supported. The current UI selects existing custom fields only. Users may type new values into tags fields, but the implementation does not create new field definitions or persist new options.

## 8. Payload Transformation

The payload conversion function is:

```txt
src/pages/products-page/products-list/form/payload/normalize-create-product-payload.ts
```

Function:

```ts
normalizeCreateProductPayload(input): CreateProductPayload
```

Input shape:

```ts
type NormalizeCreateProductPayloadInput = {
  formValues: ProductCreateFormValues;
  productType: ProductType;
  productMedia: UploadedProductMedia[];
  variants: ProductVariantUi[];
};
```

Output shape:

```ts
type CreateProductPayload = {
  name: string;
  description?: string;
  status: ProductLifecycleStatus;
  productType: ProductType;
  sourceType: "manual";
  price: number;
  currency: "UAH";
  inStock: boolean;
  quantity: number;
  mediaIds: number[];
  categoryId: number;
  variants: CreateProductVariantPayload[];
};
```

Inserted product fields:

- `name` from trimmed `formValues.name`
- `description` from trimmed `formValues.description`, only if non-empty
- `status` from normalized `formValues.status`
- `productType` from submit flow
- `sourceType` hardcoded to `"manual"`
- `price` from `formValues.price`
- `currency` hardcoded to `"UAH"`
- `inStock` hardcoded to `true`
- `quantity` from `formValues.quantity`
- `mediaIds` from uploaded product media ids
- `categoryId` from `formValues.categoryId`

Single product variant construction:

- one variant is always created
- price and quantity come from product-level form values
- media ids come from the submitted single variant if one exists
- custom fields come from one submitted variant if present, otherwise from `singleCharacteristics`

Variants product construction:

- every `ProductVariantUi` is mapped to `CreateProductVariantPayload`
- `customFields` become `{ fieldId, value }`
- `media` becomes `mediaIds`
- `sku` is included only when trimmed and non-empty

## 9. Important Dependencies And Side Effects

Important hooks/stores:

- `useProductAddPageController`
- `useProductsListController`
- `useProductsStore`
- `useCategoriesStore`
- `ProductsStore`
- `CategoriesStore`
- `useTranslation`
- Ant Design `message`
- Ant Design `Modal`

Important effects:

- `useProductsListController` loads categories when empty
- `useProductAddPageController` loads variant custom fields on mount
- `useProductAddPageController` regenerates variants when characteristics or base values change

Watched Form values:

```ts
Form.useWatch("characteristics", form);
Form.useWatch("singleCharacteristics", form);
Form.useWatch("price", form);
Form.useWatch("quantity", form);
Form.useWatch("status", form);
```

Dependencies:

- category select depends on `CategoriesStore`
- custom field selects depend on `ProductsStore.variantCustomFields`
- variant generation depends on selected characteristics plus price, quantity, and status
- navigation back to list preserves list return search from route state when present

## 10. Risks For Upcoming Change

Inline creation of new characteristics:

- current code assumes every characteristic has an existing numeric `fieldId`
- select options are built from loaded backend fields
- create payload only sends `{ fieldId, value }`
- no current API/UI path creates field definitions inline

Characteristic type `TEXT / OPTION`:

- current frontend types are lowercase `"text"` and `"options"`
- variants mode currently treats both as variant-generation dimensions
- `generateProductVariantsFromCharacteristics` does not filter by field type
- text fields will currently generate combinations, which conflicts with a requirement that text fields should not generate variants

Option values added inline:

- tags UI allows entering values
- those values are sent as variant custom field values
- new values are not persisted as options of the field definition

Auto-generation of variants from option characteristics:

- generation currently uses all selected characteristics
- to generate from options only, generation and table display logic need a clear split between generating characteristics and descriptive characteristics

Text characteristics that should not generate combinations:

- current `characteristics` list is both the source of variant columns and the source of generation dimensions
- text characteristics may need a separate path or metadata flag

Sending new fields through the same create product endpoint:

- current `CreateProductPayload` supports only existing field ids
- inline-created fields require a richer payload shape or separate pre-create API calls
- duplicate detection and stable keys currently require numeric field ids

Other current risks:

- `discountPrice` is visible in the variant table but ignored by submit payload
- variant-only media can be uploaded and then abandoned if the modal is closed without applying
- first product media item is visually treated as main image, but no explicit main flag is sent
- edit route currently reuses the create page

## 11. Files Map

| File                                                                                             | Responsibility                                                          | Likely future changes             |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | --------------------------------- |
| `src/app/router/page-routes.tsx`                                                                 | Product routes, including add route                                     | Only if route structure changes   |
| `src/app/router/pages-map.ts`                                                                    | Route constants                                                         | Probably not                      |
| `src/pages/products-page/products-page.tsx`                                                      | Products shell and nested outlet                                        | Probably not                      |
| `src/pages/products-page/products-list/pages/product-add-page.tsx`                               | Add page composition                                                    | Maybe, if controller props change |
| `src/pages/products-page/products-list/controllers/use-product-add-page-controller.ts`           | Main orchestration: form, state, media, variants, submit                | Yes                               |
| `src/pages/products-page/products-list/controllers/use-products-list-controller.ts`              | Categories/custom fields bridge and navigation                          | Maybe                             |
| `src/pages/products-page/products-list/form/product-form.tsx`                                    | Form layout and submit binding                                          | Maybe                             |
| `src/pages/products-page/products-list/form/product-form.types.ts`                               | Form value types and defaults                                           | Yes                               |
| `src/pages/products-page/products-list/form/sections/product-main-info-section.tsx`              | Main product fields and status                                          | Maybe                             |
| `src/pages/products-page/products-list/form/sections/product-type-section.tsx`                   | Single/variants selection                                               | Maybe                             |
| `src/pages/products-page/products-list/form/sections/product-media-section.tsx`                  | Product media upload UI                                                 | Probably not                      |
| `src/pages/products-page/products-list/form/sections/single-product-characteristics-section.tsx` | Single product custom fields UI                                         | Yes                               |
| `src/pages/products-page/products-list/form/sections/product-variants-section.tsx`               | Variant characteristics and variants table                              | Yes                               |
| `src/pages/products-page/products-list/form/variants/generate-product-variants.ts`               | Variant combination generation                                          | Yes                               |
| `src/pages/products-page/products-list/form/variants/product-add-variant.utils.ts`               | Variant normalization, merge, duplicate detection, manual variant logic | Yes                               |
| `src/pages/products-page/products-list/form/variants/product-add-variant.types.ts`               | Variant UI types                                                        | Yes                               |
| `src/pages/products-page/products-list/form/variants/use-product-add-variant-table-columns.tsx`  | Variant table columns/editing                                           | Yes                               |
| `src/pages/products-page/products-list/form/variants/product-variant-images-modal.tsx`           | Variant media picker/upload modal                                       | Probably not                      |
| `src/pages/products-page/products-list/form/payload/normalize-create-product-payload.ts`         | Final API payload normalization                                         | Yes                               |
| `src/features/products/api/products-api.ts`                                                      | Product/media/custom field API calls                                    | Maybe, depending on backend       |
| `src/features/products/model/product-create-api.types.ts`                                        | Product create API types                                                | Yes                               |
| `src/features/products/model/products-store.ts`                                                  | Products store and custom field loading                                 | Maybe                             |
| `src/pages/products-page/products-list/form/media/product-image-upload.ts`                       | Image validation                                                        | Probably not                      |

## 12. Final Summary

Current product creation flow:

1. `ProductAddPage` obtains all behavior from `useProductAddPageController`.
2. The controller creates the Ant Design Form and owns non-form state.
3. `ProductForm` renders product type, main info, media, and either single characteristics or variants.
4. Product and variant images are uploaded before product creation.
5. Variant custom fields are loaded from workspace API.
6. Variants are generated from selected characteristics or added manually.
7. Form table values are merged into the variant UI model.
8. `normalizeCreateProductPayload` converts form values, uploaded media, and variants into `CreateProductPayload`.
9. `productsApi.createProduct` posts to `/products`.
10. On success, the product list reloads and navigation returns to `/products/list`.

Current limitations:

- no inline creation of characteristic definitions
- no persistence of newly typed option values as field options
- text characteristics currently generate variant combinations
- create payload only supports existing numeric `fieldId`
- `discountPrice` is rendered but not sent
- edit route points to the create page without a complete edit flow

Recommended future change points:

- `product-create-api.types.ts`
- `product-form.types.ts`
- `product-variants-section.tsx`
- `single-product-characteristics-section.tsx`
- `generate-product-variants.ts`
- `product-add-variant.utils.ts`
- `normalize-create-product-payload.ts`
- maybe `products-api.ts` and `products-store.ts`

Areas to avoid touching unless necessary:

- route shell and layout
- products list navigation/filter logic
- generic media validation
- existing product media UI, unless media semantics change
