# Product Inline Characteristics Implementation Plan

This document describes the planned implementation for inline-created product characteristics in the product creation flow.

No application code should be changed until this plan is confirmed.

## Target Behavior

- Existing characteristic fields can still be selected from `GET /workspace/variant-custom-fields`.
- New characteristic fields can be created inline during product creation.
- New fields are not created by a separate request.
- New fields are sent through `POST /products` inside `variants[].customFields`.
- Existing fields are sent as:

```ts
{
  field: {
    id: number;
  }
  value: string;
}
```

- New fields are sent as:

```ts
{
  field: {
    name: string;
    type: "OPTION" | "TEXT";
  }
  value: string;
}
```

- Existing API response field types remain lowercase: `"options"` and `"text"`.
- Create payload field types must be uppercase: `"OPTION"` and `"TEXT"`.
- OPTION fields generate product variant combinations.
- TEXT fields do not generate product variant combinations.
- TEXT fields still need to be included in `customFields` according to the final backend contract.

## 1. Proposed New TypeScript Types

### API Types

File:

```txt
src/features/products/model/product-create-api.types.ts
```

Keep existing response type for loaded workspace fields:

```ts
export type VariantCustomFieldType = "options" | "text";
```

Add create-payload type:

```ts
export type CreateProductCustomFieldType = "OPTION" | "TEXT";
```

Add explicit mapper later in helpers:

```ts
function mapVariantCustomFieldTypeToCreateType(
  type: VariantCustomFieldType,
): CreateProductCustomFieldType {
  return type === "options" ? "OPTION" : "TEXT";
}
```

Replace current create custom field payload:

```ts
export type CreateProductVariantCustomFieldValue = {
  fieldId: number;
  value: string;
};
```

with:

```ts
export type CreateProductVariantCustomFieldExistingFieldValue = {
  field: {
    id: number;
  };
  value: string;
};

export type CreateProductVariantCustomFieldNewFieldValue = {
  field: {
    name: string;
    type: CreateProductCustomFieldType;
  };
  value: string;
};

export type CreateProductVariantCustomFieldValue =
  | CreateProductVariantCustomFieldExistingFieldValue
  | CreateProductVariantCustomFieldNewFieldValue;
```

`CreateProductVariantPayload` can keep:

```ts
customFields: CreateProductVariantCustomFieldValue[];
```

If backend later supports product-level custom fields, add a separate top-level field only after backend confirmation:

```ts
customFields?: CreateProductVariantCustomFieldValue[];
```

Do not add this preemptively if backend only supports variant-level custom fields.

### Characteristic Field Ref Model

File:

```txt
src/pages/products-page/products-list/form/variants/product-add-variant.types.ts
```

Add an internal field reference model:

```ts
export type ExistingCharacteristicFieldRef = {
  kind: "existing";
  id: number;
};

export type NewCharacteristicFieldRef = {
  kind: "new";
  clientKey: string;
  name: string;
  type: "OPTION" | "TEXT";
};

export type CharacteristicFieldRef =
  | ExistingCharacteristicFieldRef
  | NewCharacteristicFieldRef;
```

Add helpers conceptually:

```ts
type CharacteristicFieldKind = CharacteristicFieldRef["kind"];
```

Use `clientKey` for unsaved fields because they do not have backend ids yet.

### Form Row Types

Move form row types out of local components/controller and into shared product form/variant types where practical.

For variant product characteristics:

```ts
export type ProductCharacteristicFormRow = {
  field?: CharacteristicFieldRef;
  values?: string[];
};
```

For single product characteristics:

```ts
export type SingleProductCharacteristicFormRow = {
  field?: CharacteristicFieldRef;
  value?: string;
};
```

This replaces current id-only shapes:

```ts
{
  attributeId?: number;
  values?: string[];
}
```

and:

```ts
{
  attributeId?: number;
  value?: string;
}
```

### ProductVariantUiCustomField Changes

Current:

```ts
export type ProductVariantUiCustomField = {
  fieldId: number;
  fieldKey: string;
  fieldLabel: string;
  value: string;
};
```

Proposed:

```ts
export type ProductVariantUiCustomField = {
  field: CharacteristicFieldRef;
  fieldKey: string;
  fieldLabel: string;
  fieldType: "OPTION" | "TEXT";
  value: string;
};
```

For existing fields:

- `field.kind = "existing"`
- `field.id = VariantCustomField.id`
- `fieldType = mapVariantCustomFieldTypeToCreateType(existing.type)`
- `fieldLabel = existing.label`
- `fieldKey = existing.key`

For new fields:

- `field.kind = "new"`
- `field.clientKey = crypto.randomUUID()`
- `field.name = user-entered name`
- `field.type = "OPTION" | "TEXT"`
- `fieldType = field.type`
- `fieldLabel = field.name`
- `fieldKey = field.clientKey`

## 2. Migration Strategy

### Safe First Changes

1. Add new create API types without changing runtime payload.
2. Add field ref types in variant UI model.
3. Add pure helper functions for:
   - mapping response type `"options" | "text"` to create type `"OPTION" | "TEXT"`
   - building stable field keys
   - checking whether a field is OPTION or TEXT
   - converting field refs to create payload `field`
4. Update utility functions to accept the new field ref shape while preserving support for existing id-based values during transition.

### What Must Wait For Backend Confirmation

Confirm before switching the live payload:

- `POST /products` accepts `customFields[].field`
- enum values are exactly `"OPTION"` and `"TEXT"`
- old `{ fieldId, value }` can be removed or must be temporarily supported
- repeated new field objects across variants are deduplicated by backend
- TEXT fields belong inside every variant, or backend supports top-level product custom fields

### Avoid Breaking Existing-Field Flow

Keep loaded workspace fields unchanged:

```ts
VariantCustomField.type = "options" | "text";
```

Only map to uppercase at create-payload boundary.

For existing fields, preserve current UX:

- field select still lists `variantCustomFields`
- selected existing fields still resolve options from `field.options`
- generated variants still use stable ids

During migration, keep compatibility helpers capable of reading current rows with `attributeId` if needed, but the final shape should use `field`.

## 3. Variant Generation Changes

Files:

```txt
src/pages/products-page/products-list/form/variants/generate-product-variants.ts
src/pages/products-page/products-list/form/variants/product-add-variant.utils.ts
src/pages/products-page/products-list/controllers/use-product-add-page-controller.ts
```

### Use Only OPTION Fields As Dimensions

Generation input should become:

```ts
export type SelectedCharacteristic = {
  field: CharacteristicFieldRef;
  fieldKey: string;
  fieldLabel: string;
  fieldType: "OPTION" | "TEXT";
  values: string[];
};
```

Before cartesian product, filter dimensions:

```ts
const optionDimensions = selectedCharacteristics.filter(
  (item) => item.fieldType === "OPTION",
);
```

TEXT fields must not enter `cartesianProduct`.

### Keep TEXT Fields Out Of Cartesian Product

TEXT characteristics should be normalized separately:

```ts
const textCharacteristics = selectedCharacteristics.filter(
  (item) => item.fieldType === "TEXT",
);
```

They can be inserted into variant `customFields` after generated OPTION combinations are built.

If backend only supports variant-level custom fields, repeat TEXT fields on each generated variant.

### Preserve Existing Variant Row Data

Current preserve logic is based on stable `variant.key`.

Keep this behavior, but update key generation:

```ts
function getCharacteristicFieldStableKey(
  field: CharacteristicFieldRef,
): string {
  return field.kind === "existing"
    ? `existing:${field.id}`
    : `new:${field.clientKey}`;
}
```

Generated variant key should be built from OPTION fields only:

```ts
`${fieldStableKey}=${value}`;
```

Sort by stable key to keep deterministic output:

```ts
existing:1=Black|new:abc=Cotton
```

TEXT values should not affect the generated variant key, because changing text should not create/remove variant combinations.

### Stable Keys For New Unsaved Fields

New fields need a stable `clientKey` created when the user creates the field inline.

Do not derive identity from name alone because users can rename before save.

Use name normalization only for duplicate prevention, not identity.

## 4. Payload Normalization Changes

File:

```txt
src/pages/products-page/products-list/form/payload/normalize-create-product-payload.ts
```

### Existing Fields

Map:

```ts
{
  field: { kind: "existing", id: 1 },
  value: "Чорний",
}
```

to:

```ts
{
  field: { id: 1 },
  value: "Чорний",
}
```

### New Fields

Map:

```ts
{
  field: {
    kind: "new",
    name: "Матеріал",
    type: "OPTION",
  },
  value: "Бавовна",
}
```

to:

```ts
{
  field: {
    name: "Матеріал",
    type: "OPTION",
  },
  value: "Бавовна",
}
```

### Normalizer Helper

Add a helper conceptually:

```ts
function normalizeCustomFieldRef(
  field: CharacteristicFieldRef,
): CreateProductVariantCustomFieldValue["field"] {
  if (field.kind === "existing") {
    return { id: field.id };
  }

  return {
    name: field.name.trim(),
    type: field.type,
  };
}
```

Then:

```ts
function normalizeVariantCustomFields(
  customFields: ProductVariantUi["customFields"],
): CreateProductVariantCustomFieldValue[] {
  return customFields
    .map((item) => ({
      field: normalizeCustomFieldRef(item.field),
      value: item.value.trim(),
    }))
    .filter((item) => item.value);
}
```

### Where TEXT Fields Should Be Inserted

If backend only supports variant-level custom fields:

- single product: include TEXT fields in the single variant
- variant product: include TEXT fields in each generated/manual variant where they apply
- product-level TEXT fields must be repeated across variants if they describe the product globally

If backend supports top-level product custom fields:

- extend `CreateProductPayload` with top-level `customFields`
- keep variant-generating OPTION fields in `variants[].customFields`
- move product-level TEXT fields to `CreateProductPayload.customFields`
- do not repeat global TEXT fields per variant

This decision should be made only after backend confirmation.

## 5. UI Changes

Files:

```txt
src/pages/products-page/products-list/form/sections/product-variants-section.tsx
src/pages/products-page/products-list/form/sections/single-product-characteristics-section.tsx
src/pages/products-page/products-list/controllers/use-product-add-page-controller.ts
```

### Custom Characteristic Selector

Replace simple `Select` for `attributeId` with a custom selector that can:

- search existing fields
- select existing fields
- offer create-new when no exact match exists
- select type for new field: OPTION or TEXT
- create a local `NewCharacteristicFieldRef`

Implementation can still use Ant Design `Select`, but likely with:

- `showSearch`
- custom `dropdownRender`
- custom option labels
- controlled search value
- local create-new panel inside dropdown

### Existing Fields Display

Each existing option should show:

- field label
- type badge:
  - `OPTION` for current `"options"`
  - `TEXT` for current `"text"`
- option count for OPTION fields:
  - example: `5 options`

### Create-New Panel

Show create-new panel when:

- search text is non-empty
- no existing field has exact normalized label match
- no already-selected existing/new field has same normalized name

Panel fields:

- name, prefilled from search text
- type segmented control: OPTION / TEXT
- create button

When created:

- generate `clientKey`
- write `{ field: NewCharacteristicFieldRef }` into the current Form.List row
- clear value(s) for that row

### OPTION Value Input

For OPTION fields in variants mode:

- use tags/multiple select
- existing OPTION fields can show backend-provided `options`
- new OPTION fields start with empty options but allow typed tags
- values create variant combinations

For OPTION fields in single mode:

- use single select/tag-style input depending on desired UX
- existing fields use backend options
- new fields allow custom typed value

### TEXT Value Input

For TEXT fields:

- variants mode should use a single text input or textarea, not tags
- single mode should use input or textarea
- TEXT value does not generate combinations

In variants mode, decide whether TEXT is:

- global for all generated variants
- editable per variant in the variant table

Recommended first version:

- TEXT field in the characteristics block applies globally and is repeated into every generated variant payload
- manual variant table can still allow editing TEXT per variant later if needed

### Prevent Duplicates

Duplicate field prevention should compare:

- existing field id for existing fields
- normalized name for new fields
- normalized new name against existing field labels

Duplicate values for OPTION fields:

- trim values
- remove empty values
- dedupe case-insensitively or case-sensitively depending on product requirements
- recommended: case-insensitive duplicate prevention, preserve first entered casing

## 6. Validation Rules

### Required Field

Every characteristic row must have a selected or inline-created field:

```ts
field != null;
```

### Required Type For New Fields

For `field.kind === "new"`:

- `name.trim()` is required
- `type` is required
- `type` must be `"OPTION"` or `"TEXT"`

### OPTION Needs At Least One Value

For `fieldType === "OPTION"`:

- variants mode: `values.length >= 1`
- single mode: `value.trim()` required

### TEXT Needs Non-Empty Value

For `fieldType === "TEXT"`:

- `value.trim()` required
- in variants mode, do not accept `values[]` as generation values for TEXT

### Duplicate Characteristics Are Not Allowed

Block duplicates within a form section:

- same existing field id
- same new field `clientKey`
- same normalized new field name
- new field name equal to existing field label

### Generated Variant Count Protection

Before generating cartesian product, estimate:

```ts
variantCount = optionDimensions.reduce(
  (total, dimension) => total * dimension.values.length,
  1,
);
```

Add a max threshold before rendering/updating table.

Recommended initial threshold:

```ts
MAX_GENERATED_VARIANTS = 100;
```

If exceeded:

- show warning/error
- do not regenerate variants
- preserve previous variants

## 7. File-by-File Plan

### `src/features/products/model/product-create-api.types.ts`

Add:

- `CreateProductCustomFieldType = "OPTION" | "TEXT"`
- existing/new custom field payload union

Change:

- `CreateProductVariantCustomFieldValue` from `{ fieldId, value }` to `{ field, value }` union

Do not change:

- `VariantCustomFieldType = "options" | "text"` unless backend response changes

### `src/pages/products-page/products-list/form/product-form.types.ts`

Update add/create form-related types if they are centralized there.

Move toward:

```ts
characteristics: ProductCharacteristicFormRow[];
singleCharacteristics: SingleProductCharacteristicFormRow[];
```

Keep `defaultCreateValues` unchanged for base product fields.

### `src/pages/products-page/products-list/form/sections/product-variants-section.tsx`

Replace current id-only row handling:

```ts
attributeId?: number;
values?: string[];
```

with:

```ts
field?: CharacteristicFieldRef;
values?: string[];
value?: string;
```

Responsibilities:

- render custom characteristic selector
- render OPTION input as tags/multiple values
- render TEXT input as simple input/textarea
- clear values when field changes
- show create-new panel
- prevent duplicate field selection

### `src/pages/products-page/products-list/form/sections/single-product-characteristics-section.tsx`

Same selector model as variants section.

Differences:

- OPTION uses one value
- TEXT uses one text value
- no variant generation logic

### `src/pages/products-page/products-list/form/variants/product-add-variant.types.ts`

Add:

- `CharacteristicFieldRef`
- `ExistingCharacteristicFieldRef`
- `NewCharacteristicFieldRef`
- `ProductCharacteristicFormRow`
- `SingleProductCharacteristicFormRow`

Change:

- `ProductVariantUiCustomField` to store `field: CharacteristicFieldRef`
- add `fieldType: "OPTION" | "TEXT"`

### `src/pages/products-page/products-list/form/variants/generate-product-variants.ts`

Change:

- `SelectedCharacteristic` from id-based to field-ref-based
- dimensions should include only `fieldType === "OPTION"`
- generated keys should use stable field key:
  - `existing:${id}`
  - `new:${clientKey}`

Preserve:

- previous variant data lookup by stable key
- cartesian product logic

Exclude:

- TEXT fields from cartesian product

### `src/pages/products-page/products-list/form/variants/product-add-variant.utils.ts`

Update:

- normalization of selected characteristics
- normalization of single characteristics
- duplicate field detection
- field option mapping
- characteristic value options lookup
- selected characteristic columns
- manual variant creation
- duplicate variant key building
- manual custom field update

Add helpers:

```ts
getCharacteristicFieldStableKey(field);
getCharacteristicFieldLabel(field, availableFields);
getCharacteristicFieldType(field, availableFields);
isOptionCharacteristic(field, availableFields);
isTextCharacteristic(field, availableFields);
mapResponseFieldTypeToCreateFieldType(type);
normalizeCharacteristicName(name);
```

### `src/pages/products-page/products-list/form/variants/use-product-add-variant-table-columns.tsx`

Update:

- column ids from numeric `fieldId` to stable field keys
- generated characteristic display should read `field` refs
- manual characteristic editing should update by stable field key
- OPTION manual cells use select when options exist
- TEXT manual cells use input

### `src/pages/products-page/products-list/controllers/use-product-add-page-controller.ts`

Update:

- watched row types
- field option builders
- product type switching cleanup
- variant generation effect
- manual variant creation
- duplicate/manual missing-field validation
- payload submit path

Important:

- only OPTION selected characteristics should trigger generated variant changes
- TEXT changes should update `customFields` without creating/removing variants
- if TEXT fields are repeated across variants, changing TEXT should update all variants' TEXT custom fields while preserving price, quantity, sku, media

### `src/pages/products-page/products-list/form/payload/normalize-create-product-payload.ts`

Update:

- `normalizeVariantCustomFields`
- `buildSingleProductCustomFields`
- `buildSingleProductVariant`
- `buildVariantsProductVariant`

Output:

```ts
{
  field: { id },
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

Do not emit `fieldId` once backend confirms new contract.

## 8. Risk List

### What Can Break

- existing field selection if the form row shape changes too abruptly
- variant regeneration if stable keys change incorrectly
- user-edited variant price/quantity/sku/media if previous variant preservation fails
- manual variants if custom field update lookup changes from `fieldId` to field ref
- duplicate detection if new fields use names and existing fields use ids
- payload compatibility if backend does not accept new `field` shape
- TEXT semantics if backend expects product-level rather than variant-level custom fields
- large cartesian products from OPTION values can freeze UI

### Manual Checks

Existing field flow:

- create single product with existing text field
- create single product with existing option field
- create variant product with existing option field
- verify payload uses `{ field: { id } }`

Inline new field flow:

- create single product with new TEXT field
- create single product with new OPTION field
- create variant product with new OPTION field
- create variant product with existing OPTION + new OPTION
- create variant product with OPTION + TEXT
- verify TEXT does not affect variant count
- verify OPTION values generate combinations

Variant preservation:

- generate variants
- edit price, quantity, sku
- add/remove OPTION values
- confirm unchanged variant keys preserve edits
- add TEXT value and confirm variant count stays same

Media:

- upload product media
- attach product media to variant
- upload variant-only media
- regenerate variants
- verify media preservation/deletion behavior remains correct

Validation:

- empty new field name
- missing new field type
- OPTION with no values
- TEXT with empty value
- duplicate existing field
- duplicate new field name
- new field name equal to existing field label
- too many generated variants

API:

- inspect final `POST /products` payload in browser devtools
- verify uppercase `OPTION` / `TEXT`
- verify no `fieldId` remains after final switch
- verify backend creates/deduplicates inline field definitions as expected

### Automated Checks

At minimum after implementation:

```sh
npm run typecheck
npm run lint
```

Recommended focused unit tests if a test setup is added later:

- custom field type mapper
- field stable key builder
- selected characteristic normalization
- variant generation with OPTION only
- TEXT passthrough behavior
- payload normalization for existing and new fields
- duplicate characteristic detection

## 9. Suggested Implementation Order

1. Add and compile new types without changing rendered UI.
2. Add helper functions for field refs and type mapping.
3. Update payload types and normalizer behind a small adapter.
4. Update variant generation to use field refs and OPTION-only dimensions.
5. Update utility functions to support field refs.
6. Update single characteristics UI.
7. Update variant characteristics UI.
8. Update variant table columns to use stable field keys.
9. Update controller watchers, generation effect, validation, and submit flow.
10. Run `npm run typecheck` and `npm run lint`.
11. Manually verify create flows and request payloads.

Do not start implementation until backend contract questions are resolved or the team explicitly accepts the assumed contract.
