# Product Variant Custom Fields API Contract Analysis

This document analyzes the current frontend contract for product variant custom fields and checks whether this repository contains backend, Swagger, OpenAPI, DTO, or schema references for the desired inline-created characteristic payload.

No application code was changed for this analysis.

## 1. Current Frontend API Types

The current product create API types are defined in:

```txt
src/features/products/model/product-create-api.types.ts
```

Current lifecycle and product type enums:

```ts
export type ProductLifecycleStatus = "draft" | "active" | "archived";

export type ProductType = "single" | "variants";
```

Current custom field type enum used by the frontend response model:

```ts
export type VariantCustomFieldType = "options" | "text";
```

Current custom field definition loaded from the workspace API:

```ts
export type VariantCustomField = {
  id: number;
  key: string;
  label: string;
  type: VariantCustomFieldType;
  options?: string[];
  sortOrder: number;
};
```

Current custom fields response:

```ts
export type VariantCustomFieldsResponse = {
  workspaceId: number;
  items: VariantCustomField[];
};
```

Current create-product custom field value:

```ts
export type CreateProductVariantCustomFieldValue = {
  fieldId: number;
  value: string;
};
```

Current create-product variant payload:

```ts
export type CreateProductVariantPayload = {
  status: ProductLifecycleStatus;
  customFields: CreateProductVariantCustomFieldValue[];
  price: number;
  inStock: boolean;
  quantity: number;
  sku?: string;
  mediaIds: number[];
};
```

Current create-product payload:

```ts
export type CreateProductPayload = {
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

Conclusion: the current frontend create payload only supports:

```ts
customFields: Array<{
  fieldId: number;
  value: string;
}>;
```

It does not currently support:

```ts
customFields: Array<{
  field: { id: number } | { name: string; type: "OPTION" | "TEXT" };
  value: string;
}>;
```

## 2. Backend / API Expectation

Searched this repository for:

- `swagger`
- `openapi`
- `schema`
- `dto`
- `backend`
- `contract`
- `spec`
- `CreateProductPayload`
- `CreateProductVariantPayload`
- `CreateProductVariantCustomFieldValue`
- `customFields`
- `fieldId`
- `field:`
- `OPTION`
- `TEXT`

Relevant result: no backend DTO, Swagger, OpenAPI, or API schema files were found in the application source. Matches for schema/spec-like names were only from dependencies in `node_modules` or unrelated generated/build output.

The only source of truth in this frontend repository is:

```txt
src/features/products/model/product-create-api.types.ts
src/features/products/api/products-api.ts
src/pages/products-page/products-list/form/payload/normalize-create-product-payload.ts
```

The actual create request function is:

```ts
createProduct: async (
  payload: CreateProductPayload,
): Promise<ProductDetails> => {
  const { data } = await apiClient.post<ProductDetails>(basePath, payload);

  return data;
};
```

Endpoint:

```txt
POST /products
```

Workspace custom field lookup endpoint:

```txt
GET /workspace/variant-custom-fields
```

Current frontend evidence:

- create payload sends `fieldId`
- workspace custom fields are received with lowercase `type: "options" | "text"`
- there is no local evidence that `POST /products` already supports `field: { id }`
- there is no local evidence that `POST /products` already supports `field: { name, type }`
- there is no local authoritative backend enum source confirming `OPTION/TEXT`

Important distinction:

- Existing loaded field definitions use lowercase frontend/API response values: `"options"` and `"text"`.
- The requested create payload examples use uppercase values: `"OPTION"` and `"TEXT"`.

From this repository alone, uppercase `OPTION/TEXT` cannot be verified as accepted by the backend. It may be a new backend contract, but it is not represented in the current frontend types.

## 3. Product-Level vs Variant-Level Characteristics

There is no top-level product `customFields`, `characteristics`, or equivalent field in `CreateProductPayload`.

Current product-level shape:

```ts
{
  (name,
    description,
    status,
    productType,
    sourceType,
    price,
    currency,
    inStock,
    quantity,
    mediaIds,
    categoryId,
    variants);
}
```

All custom fields are sent inside:

```ts
variants[].customFields
```

Single product behavior:

- a single product still creates exactly one variant payload
- single product characteristics are attached to that one variant as `customFields`

Variant product behavior:

- every generated or manual variant receives its own `customFields`

Implication for TEXT characteristics that do not generate variants:

- With the current payload shape, they still need to be sent inside `variants[].customFields`.
- For a single product, send them on the single generated variant.
- For a variant product, if TEXT characteristics describe the whole product rather than a specific variant, the current API shape has no top-level place for them. The least disruptive current-contract-compatible place is to repeat them on every variant, but that is a semantic workaround, not a clean product-level model.
- If backend wants product-level TEXT characteristics, `CreateProductPayload` needs a new top-level field. No such field exists in this repo today.

## 4. Required Final Payload Shapes

The examples below assume the new desired backend contract is:

```ts
customFields: Array<{
  field: { id: number } | { name: string; type: "OPTION" | "TEXT" };
  value: string;
}>;
```

This is not the current frontend contract. It is the target shape implied by the requested examples.

### a. Single Product With Existing Custom Field

```json
{
  "name": "Футболка",
  "description": "Базова футболка",
  "status": "draft",
  "productType": "single",
  "sourceType": "manual",
  "price": 500,
  "currency": "UAH",
  "inStock": true,
  "quantity": 10,
  "mediaIds": [101],
  "categoryId": 5,
  "variants": [
    {
      "status": "draft",
      "customFields": [
        {
          "field": { "id": 1 },
          "value": "Чорний"
        }
      ],
      "price": 500,
      "inStock": true,
      "quantity": 10,
      "mediaIds": []
    }
  ]
}
```

### b. Single Product With New TEXT Field

```json
{
  "name": "Футболка",
  "description": "Базова футболка",
  "status": "draft",
  "productType": "single",
  "sourceType": "manual",
  "price": 500,
  "currency": "UAH",
  "inStock": true,
  "quantity": 10,
  "mediaIds": [101],
  "categoryId": 5,
  "variants": [
    {
      "status": "draft",
      "customFields": [
        {
          "field": { "name": "Опис тканини", "type": "TEXT" },
          "value": "100% бавовна"
        }
      ],
      "price": 500,
      "inStock": true,
      "quantity": 10,
      "mediaIds": []
    }
  ]
}
```

### c. Variant Product With Existing OPTION Field

```json
{
  "name": "Футболка",
  "description": "Футболка з варіантами",
  "status": "draft",
  "productType": "variants",
  "sourceType": "manual",
  "price": 500,
  "currency": "UAH",
  "inStock": true,
  "quantity": 20,
  "mediaIds": [101],
  "categoryId": 5,
  "variants": [
    {
      "status": "draft",
      "customFields": [
        {
          "field": { "id": 1 },
          "value": "Чорний"
        }
      ],
      "price": 500,
      "inStock": true,
      "quantity": 10,
      "sku": "TSHIRT-BLACK",
      "mediaIds": []
    },
    {
      "status": "draft",
      "customFields": [
        {
          "field": { "id": 1 },
          "value": "Білий"
        }
      ],
      "price": 500,
      "inStock": true,
      "quantity": 10,
      "sku": "TSHIRT-WHITE",
      "mediaIds": []
    }
  ]
}
```

### d. Variant Product With New OPTION Field

```json
{
  "name": "Футболка",
  "description": "Футболка з матеріалами",
  "status": "draft",
  "productType": "variants",
  "sourceType": "manual",
  "price": 500,
  "currency": "UAH",
  "inStock": true,
  "quantity": 20,
  "mediaIds": [101],
  "categoryId": 5,
  "variants": [
    {
      "status": "draft",
      "customFields": [
        {
          "field": { "name": "Матеріал", "type": "OPTION" },
          "value": "Бавовна"
        }
      ],
      "price": 500,
      "inStock": true,
      "quantity": 10,
      "mediaIds": []
    },
    {
      "status": "draft",
      "customFields": [
        {
          "field": { "name": "Матеріал", "type": "OPTION" },
          "value": "Льон"
        }
      ],
      "price": 500,
      "inStock": true,
      "quantity": 10,
      "mediaIds": []
    }
  ]
}
```

### e. Variant Product With OPTION + TEXT Characteristics

If TEXT characteristics are variant-level metadata, include the TEXT field on each variant:

```json
{
  "name": "Футболка",
  "description": "Футболка з матеріалами і описом тканини",
  "status": "draft",
  "productType": "variants",
  "sourceType": "manual",
  "price": 500,
  "currency": "UAH",
  "inStock": true,
  "quantity": 20,
  "mediaIds": [101],
  "categoryId": 5,
  "variants": [
    {
      "status": "draft",
      "customFields": [
        {
          "field": { "name": "Матеріал", "type": "OPTION" },
          "value": "Бавовна"
        },
        {
          "field": { "name": "Опис тканини", "type": "TEXT" },
          "value": "100% бавовна"
        }
      ],
      "price": 500,
      "inStock": true,
      "quantity": 10,
      "mediaIds": []
    },
    {
      "status": "draft",
      "customFields": [
        {
          "field": { "name": "Матеріал", "type": "OPTION" },
          "value": "Льон"
        },
        {
          "field": { "name": "Опис тканини", "type": "TEXT" },
          "value": "Легка лляна тканина"
        }
      ],
      "price": 500,
      "inStock": true,
      "quantity": 10,
      "mediaIds": []
    }
  ]
}
```

If TEXT characteristics are product-level metadata, the current payload has no verified top-level place to send them. A backend contract change would be needed, for example:

```json
{
  "customFields": [
    {
      "field": { "name": "Опис тканини", "type": "TEXT" },
      "value": "100% бавовна"
    }
  ],
  "variants": []
}
```

That top-level `customFields` shape is not supported by the current frontend types and is not verified by any local backend schema.

## 5. Type Change Impact

### Frontend Types That Need To Change

`src/features/products/model/product-create-api.types.ts`

- `VariantCustomFieldType`
- `CreateProductVariantCustomFieldValue`
- possibly `VariantCustomField`
- possibly `CreateProductPayload` if product-level custom fields are introduced

Likely target type shape:

```ts
type CreateProductVariantCustomFieldExistingField = {
  field: { id: number };
  value: string;
};

type CreateProductVariantCustomFieldNewField = {
  field: {
    name: string;
    type: "OPTION" | "TEXT";
  };
  value: string;
};

type CreateProductVariantCustomFieldValue =
  | CreateProductVariantCustomFieldExistingField
  | CreateProductVariantCustomFieldNewField;
```

`src/pages/products-page/products-list/form/variants/product-add-variant.types.ts`

Current UI custom field shape is id-based:

```ts
type ProductVariantUiCustomField = {
  fieldId: number;
  fieldKey: string;
  fieldLabel: string;
  value: string;
};
```

It cannot represent an unsaved inline-created field unless a temporary client id or a richer `field` object is added.

### Normalizers / Helpers That Need To Change

`src/pages/products-page/products-list/form/payload/normalize-create-product-payload.ts`

- `normalizeVariantCustomFields`
- `buildSingleProductCustomFields`
- `buildSingleProductVariant`
- `buildVariantsProductVariant`

Current normalizer emits:

```ts
{
  fieldId: field.fieldId,
  value: field.value,
}
```

It would need to emit:

```ts
{
  field: { id: fieldId },
  value
}
```

or:

```ts
{
  field: { name, type },
  value
}
```

`src/pages/products-page/products-list/form/variants/generate-product-variants.ts`

- `SelectedCharacteristic`
- `CharacteristicDimension`
- `FieldValuePair`
- `buildProductVariantKey`
- `resolveCharacteristicDimensions`
- `buildVariantFromPairs`

These are all numeric `fieldId` based. New inline fields need stable client-side identity before backend id exists.

`src/pages/products-page/products-list/form/variants/product-add-variant.utils.ts`

Likely affected:

- `SelectedCharacteristicColumn`
- `CharacteristicFormRow`
- `SingleCharacteristicFormRow`
- `normalizeSingleCharacteristics`
- `normalizeSelectedCharacteristics`
- `mapCharacteristicFieldSelectOptions`
- `getCharacteristicValueOptions`
- `resolveSelectedCharacteristicColumns`
- `createManualVariant`
- `buildVariantKeyFromCustomFields`
- `findDuplicateVariantKeys`
- `updateManualVariantCustomField`

Current utilities assume:

```ts
attributeId?: number
fieldId: number
```

Inline-created fields need a model that can represent:

```ts
field: {
  id: number;
}
```

and:

```ts
field: {
  name: string;
  type: "OPTION" | "TEXT";
}
```

### Components Likely To Break Or Need Changes

`src/pages/products-page/products-list/form/sections/product-variants-section.tsx`

- current `CharacteristicRow` uses `attributeId?: number`
- field select only accepts existing numeric options
- new characteristic creation is not modeled

`src/pages/products-page/products-list/form/sections/single-product-characteristics-section.tsx`

- current `SingleCharacteristicRow` uses `attributeId?: number`
- only existing custom fields can be selected

`src/pages/products-page/products-list/form/variants/use-product-add-variant-table-columns.tsx`

- column resolution and manual custom field editing use `fieldId`
- option detection finds fields by numeric id

`src/pages/products-page/products-list/controllers/use-product-add-page-controller.ts`

- watches `characteristics` and `singleCharacteristics`
- builds field options from existing fields
- regenerates variants from id-based characteristics
- validates manual variants by `customFields`

`src/features/products/api/products-api.ts`

- function body may not change because it posts JSON payload directly
- TypeScript payload type import will change

## 6. Recommendation

### Should `fieldId` Be Replaced With `field` Everywhere?

Not immediately everywhere.

The current UI and generation logic are deeply id-based:

- selected characteristic form rows use `attributeId`
- generated variant keys use `fieldId=value`
- manual variant custom fields use `fieldId`
- duplicate detection sorts by `fieldId`
- option lookups find `VariantCustomField` by numeric id

Replacing `fieldId` everywhere in one step is higher risk because it touches generation, display, duplicate detection, manual editing, single-product characteristics, and payload normalization at the same time.

### Should Both Old And New Shapes Be Supported Temporarily?

Yes, that is the safer migration path.

Recommended internal model:

```ts
type ExistingCharacteristicFieldRef = {
  kind: "existing";
  id: number;
};

type NewCharacteristicFieldRef = {
  kind: "new";
  clientKey: string;
  name: string;
  type: "OPTION" | "TEXT";
};

type CharacteristicFieldRef =
  | ExistingCharacteristicFieldRef
  | NewCharacteristicFieldRef;
```

Then payload normalization can map:

```ts
{
  kind: ("existing", id);
}
```

to:

```ts
{ field: { id }, value }
```

and:

```ts
{
  kind: ("new", name, type);
}
```

to:

```ts
{ field: { name, type }, value }
```

This lets the UI keep stable client keys for new fields before the backend creates real ids.

### Safest Migration Path

1. Confirm backend create contract externally because this repo does not contain backend DTO/OpenAPI proof for `field: { id } | { name, type }`.
2. Add new frontend create-payload types while keeping old loaded field response types intact.
3. Introduce a field reference model that can represent existing and new fields.
4. Update form value shapes from `attributeId?: number` to a richer field reference or separate existing/new fields.
5. Update generation to use only OPTION fields as dimensions.
6. Decide where TEXT fields live:
   - repeat on every variant if backend only supports variant-level custom fields
   - add top-level product custom fields only if backend supports it
7. Update payload normalizer last, after UI state can represent both existing and new fields.
8. Keep compatibility with existing loaded fields by mapping existing field ids to the new payload shape.

Recommended final create custom field payload:

```ts
type CreateProductVariantCustomFieldValue =
  | {
      field: { id: number };
      value: string;
    }
  | {
      field: {
        name: string;
        type: "OPTION" | "TEXT";
      };
      value: string;
    };
```

Open backend questions that must be confirmed before implementation:

- Does `POST /products` accept `field` instead of `fieldId` today?
- Are enum values exactly `"OPTION"` and `"TEXT"`?
- Does backend still accept old `{ fieldId, value }`?
- Can new field definitions be repeated across multiple variants in one create request and deduplicated by backend?
- If a new OPTION field appears in multiple variants, should the same `{ name, type }` object be repeated for each value?
- Where should non-variant-generating TEXT characteristics go for a variant product?
- Is there or will there be a top-level product `customFields` field?
