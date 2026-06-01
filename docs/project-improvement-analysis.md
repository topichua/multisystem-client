# Project Analysis and Improvement Plan

Analysis date: 2026-06-01

Project: Lantoro, React 19 + TypeScript + Vite + Ant Design + MobX + styled-components + i18next.

This document is based on the current working tree. The worktree already contains uncommitted changes, so some findings apply specifically to the current code state.

## 1. Executive Summary

The project has a generally clear layered structure:

```txt
app -> pages -> features -> shared/components/styled/utils
```

Strengths:

- There is a visible split between `app`, `pages`, `features`, `components`, `styled`, and `utils`.
- Core domains live under `features/*`: auth, products, orders, conversations, clients, integrations.
- Reusable layout primitives already exist: `PaneDetailLayout`, `PaneNavSplitLayout`, `PaneFrame`, `SettingsShell`, `ConversationsShell`.
- i18n is already used for most user-facing text.
- The API layer is separated from UI code, and most stores own async state.

Main issues:

- Several page/controller files have grown too large and mix orchestration, API calls, UI state, form state, validation, upload handling, and payload mapping.
- There are many inline styles and hardcoded layout values that repeat and do not use the existing design tokens.
- Several UI patterns repeat and should be promoted to common/shared components.
- The products area currently contains the new create form, old edit/detail leftovers, and disabled AI/product-detail pieces at the same time.
- Some store methods are unused or are leftovers from older flows.
- There are `console.log` and debug traces in production code.
- Routing sometimes duplicates route literals even though `pagesMap` already exists.

## 2. Large Files and Risk Areas

Largest files by line count:

```txt
924  src/pages/products-page/products-list/controllers/use-product-add-page-controller.ts
656  src/features/conversations/model/conversation-store.ts
611  src/pages/conversation/conversation-details/components/conversation-client-info-panel/__components/client-order-drawers.tsx
596  src/pages/products-page/products-list/form/variants/product-add-variant.utils.ts
532  src/pages/products-page/products-list/controllers/use-products-list-controller.ts
506  src/pages/settings-page/settings-integrations/settings-integrations-page.tsx
487  src/pages/orders-page/order-details/components/order-details-tabs.tsx
460  src/features/products/model/products-store.ts
429  src/features/products/api/products-api.ts
392  src/features/orders/model/orders-store.ts
381  src/pages/products-page/products-list/form/variants/product-variant-images-modal.tsx
```

The risk is not the size alone. The risk is mixed responsibility:

- `use-product-add-page-controller.ts` manages the form, variants, characteristics, media upload/delete, modal state, submit flow, navigation, notifications, and store orchestration.
- `conversation-store.ts` contains list loading, message loading, optimistic send, realtime updates, notification decisions, and mutation generation.
- `client-order-drawers.tsx` contains a large drawer flow with product search, order form state, recommended products, totals, and submit logic.
- `settings-integrations-page.tsx` mixes configuration, filters, card rendering, modal control, and API actions.

Recommendation: do not refactor all of this at once. Start by splitting along the subflows that already exist in the code.

## 3. Hardcoded Text

Most user-facing strings already live in `src/i18n/locales`, but there are still strings that should either be centralized or moved out of implementation code.

Examples:

- `src/utils/date-time.ts`
  - `"Last 30 days"` lives directly in a util. This is user-facing text. Prefer returning a semantic key from the util and formatting the text in UI, or pass i18n text into the formatter.
- `src/api/api-client.ts`
  - `"VITE_API_URL is not defined. Copy .env.example to .env and set your API URL."`
  - This is developer-facing and can remain in code, but it should still be a named constant such as `missingApiUrlMessage`.
- `src/features/conversations/model/conversation-store.ts`
  - `"Something went wrong"` is used as a fallback. Prefer the shared `unknownErrorMessage` helper or an i18n fallback at UI level.
- `src/features/products/model/ai-tools-store.ts`
  - `"Invalid analyze response"` and debug labels.
  - If this can be shown to users, it should go through i18n.
- `src/pages/products-page/products-list/form/variants/use-product-add-variant-table-columns.tsx`
  - Placeholders such as `"SKU-0001"`, `"0.00"`, `"0"`.
  - These do not necessarily need translation, but they should be constants near the form config.
- `src/features/products/utils/fetch-remote-image-file.ts`
  - Fallback filename `"image"`.
  - Not UI text, but still worth naming as a constant.

Also, text inside `console.log` should not remain in production code:

```txt
src/pages/products-page/products-list/controllers/use-products-list-controller.ts
src/pages/conversation/conversation-details/components/conversation-client-info-panel/__components/client-order-drawers.tsx
src/pages/products-page/products-list/list/products-list-page.tsx
src/features/conversations/model/conversations-socket-store.ts
```

## 4. Hardcoded Numbers and Layout Values

The project has many numbers that encode layout/design decisions:

```txt
width: 360 / 100 / 50
height: 160
maxWidth: 420 / 520 / 720 / 1100
marginTop: 24 / 48
padding: 16 / 24 / 32
gap: 12 / 16 / 24 / 32
modal width: 480 / 720 / 760
table scroll x: 1000 / 1100
image sizes: 48 / 56 / 64 / 80 / 88 / 96
```

Example files:

- `src/pages/products-page/products-list/list/use-products-table-columns.tsx`
  - table column widths: `360`, `100`, `50`
  - product image size: `48`
  - text `maxWidth: 260`
- `src/pages/products-page/products-list/list/products-list-grid.tsx`
  - card image height: `160`
  - card body padding: `12`
- `src/pages/products-page/products-list/list/products-list-page.tsx`
  - main/filter flex sizes: `"1 1 360px"`, `"0 1 300px"`, `maxWidth: 420`
- `src/pages/products-page/products-list/form/sections/product-variants-section.tsx`
  - characteristic select width `380`
  - empty state padding `32`
  - table scroll `x: 1000`
- `src/pages/products-page/products-list/form/variants/product-variant-images-modal.tsx`
  - modal width `720`
  - image tile `88`
- `src/pages/settings-page/settings-integrations/settings-integrations-modal.tsx`
  - modal width `760`
- `src/pages/clients-page/clients-list/clients-list-page.tsx`
  - modal width `480`
  - table widths `160`
- `src/pages/orders-page/orders-list/orders-list-page.tsx`
  - table scroll `x: 1100`
- `src/features/orders/model/orders-store.ts`
  - `defaultPageSize = 50`
- `src/features/products/model/products-store.ts`
  - `defaultPageSize = 10`

Not every number is a problem. The issue is that many of them are spread across UI code, making density and responsive changes harder.

Recommendations:

- Create `src/shared/ui-tokens` or extend `src/styled/definitions`.
- Move domain-specific constants close to their feature:
  - product table column widths
  - product image sizes
  - modal widths
  - page sizes
  - upload limits
  - min search lengths
- Use shared layout tokens:
  - `FORM_SECTION_GAP`
  - `PAGE_CONTENT_MAX_WIDTH`
  - `SIDEBAR_WIDTH`
  - `TABLE_ACTIONS_WIDTH`
  - `IMAGE_THUMB_SIZE_SM/MD/LG`

## 5. Inline Styles

Inline styles are common. Some are acceptable one-off Ant Design tweaks, but many repeat:

- `style={{ margin: 0 }}` on headings.
- `style={{ width: "100%" }}` on inputs/selects.
- `style={{ marginTop: 24 }}` on loaders.
- `style={{ flex: 1, minWidth: 0 }}` in lists/rows.
- `style={{ marginBottom: 0 }}` on form items inside inline rows.
- `style={{ display: "block", marginBottom: 8 }}` for error text.
- `style={{ alignSelf: "flex-start" }}` for add/back buttons.

Reusable component candidates:

- `InlineFormItem`
  - wraps `Form.Item` with `marginBottom: 0`.
- `FullWidthControl`
  - a style helper or styled wrapper for `width: 100%`.
- `PageErrorText`
  - consistent error text in page/list sections.
- `SectionHeading`
  - title + optional description with normalized margins.
- `CenteredEmptyState`
  - empty state panel with dashed border, padding, and background.
- `PageSpinner`
  - standard spinner with consistent top margin/min height.

## 6. Repeated UI Patterns

### 6.1. Shell Pages With Side Menu

Repeated in:

- `src/pages/products-page/products-page.tsx`
- `src/pages/orders-page/orders-page.tsx`
- `src/pages/clients-page/clients-page.tsx`
- `src/pages/settings-page/settings-page.tsx`

These pages build `SettingsShell`, `Menu`, compute the selected key from `location.pathname`, and navigate by key.

Recommendation: extract a generic component:

```txt
src/components/settings/section-shell-nav/section-shell-nav.tsx
```

or a more neutral layout component:

```txt
src/components/layout/sidebar-menu-shell/sidebar-menu-shell.tsx
```

Props:

- `title`
- `items`
- `selectedKey`
- `onSelect`
- `children`

### 6.2. Page Detail Header Pattern

Repeated header blocks:

- title/subtitle
- back button
- right-side actions
- `PaneDetailLayout.Header`

Candidate:

```txt
src/components/layout/page-header/page-header.tsx
```

Props:

- `title`
- `subtitle`
- `backLabel`
- `onBack`
- `actions`

### 6.3. CRUD Modal Form Pattern

Repeated create/edit modals:

- groups
- categories
- clients
- integrations

Candidate:

```txt
src/components/forms/entity-modal-form/entity-modal-form.tsx
```

Do not make this too generic immediately. Start with smaller reusable building blocks:

- `ModalFormFooter`
- `RequiredNameRules`
- `DuplicateNameValidator`
- `useEntityFormModalState`

### 6.4. Table Action Buttons

Repeated edit/delete buttons:

- products table/grid
- clients table
- categories detail
- groups detail
- order statuses

Candidate:

```txt
src/components/table/table-row-actions.tsx
```

Props:

- `onEdit`
- `onDelete`
- `deleteConfirmTitle`
- `deleteLoading`
- `editLabel`
- `deleteLabel`

### 6.5. Product/Media Thumbnails

Similar image blocks exist in:

- product list table image
- product grid cover
- order product line image
- catalog variant search image
- product card image
- variant image modal tile

Candidate:

```txt
src/components/media/media-thumbnail.tsx
```

Props:

- `src`
- `alt`
- `size` or `width/height`
- `shape`
- `fallback`
- `objectFit`

### 6.6. Characteristics Row UI

`ProductVariantsSection` and `SingleProductCharacteristicsSection` contain nearly identical logic:

- derive row field
- choose characteristic field
- reset dependent values
- validate new field name
- render delete button
- choose value input/select

Candidate:

```txt
src/pages/products-page/products-list/form/sections/characteristic-row.tsx
```

or, if it becomes reusable outside the product add form:

```txt
src/features/products/components/product-characteristic-row.tsx
```

Start by keeping it inside the page/form area because it is currently tightly coupled to the add form.

## 7. State/Store/API Notes

### 7.1. Stores

Stores generally work, but the style is inconsistent:

- Sometimes a store fully encapsulates an API action (`ProductsStore.createProduct` after the recent change).
- Sometimes a controller calls API directly (`productsApi.uploadMedia`, `productsApi.deleteUploadedMedia` in the product add controller).
- Sometimes a store still contains old unused methods.

Cleanup/decision candidates:

- `ProductsStore.updateProduct`
- `ProductsStore.loadProductById`
- `ProductsStore.clearActiveProduct`
- `ClientsStore.loadClientById`
- `OrdersStore.setStatusId`
- `ConversationStore.clearActiveConversation`
- `AiToolsStore.clearSelectedPost`
- `AiToolsStore.analyzeProduct`

Important: do not delete these automatically. Some may be needed for the upcoming edit/detail page. Make an explicit decision:

- include them in the near-term edit/detail roadmap;
- delete them until there is a real flow;
- or mark them as planned and track them with an issue/TODO.

### 7.2. Products Add Controller

`use-product-add-page-controller.ts` has become the main complexity hotspot.

It currently contains:

- category data from the products list controller
- variant custom fields loading
- form watch state
- characteristics generation
- media upload/delete
- variant-only media upload/delete
- variant image modal state
- product submit validation
- payload normalization
- navigation and notifications

Recommended split:

```txt
useProductAddMediaController
useProductVariantGenerationController
useProductCharacteristicsController
useProductVariantImagesModalController
useProductCreateSubmit
```

After that, `useProductAddPageController` should only compose those hooks and assemble props for `ProductForm`.

### 7.3. Products List Controller

`use-products-list-controller.ts` contains a lot of commented old edit/detail code.

Recommendations:

- Remove dead commented blocks.
- Keep only list concerns:
  - category options
  - row selection
  - delete handler
  - return navigation
  - variant custom fields only if the add page truly needs them here.
- Consider a separate `useProductCategoryOptions` hook.

### 7.4. API Layer

`products-api.ts` is large and contains old/new methods side by side. This creates a risk of mixing the old `create` method and the newer `createProduct` method.

Recommendations:

- Split API by area:
  - `products-list-api.ts`
  - `product-create-api.ts`
  - `product-media-api.ts`
  - `product-variants-api.ts`
- Or keep a single exported object but group sections inside the file and remove old methods when they are no longer needed.
- Put typed response normalization close to the API layer instead of in UI code.

## 8. Routing and Navigation

Problems:

- `page-routes.tsx` route path literals duplicate `pagesMap`: `"products"`, `"list/add"`, `"orders"`, `"settings"`.
- `pagesMap` contains absolute paths while the route tree uses relative paths. This is fine, but there is no single source for route segments.
- `/products/list/product/:productId` already exists, but the edit page is not ready and navigation is temporarily disabled with TODOs in the list page.

Recommendations:

- Add `routeSegments` next to `pagesMap`.
- For the edit/detail route, either:
  - remove the route until the edit page is ready;
  - route to an explicit placeholder page;
  - or add a `ProductEditPage` skeleton with disabled controls.

The current state can be confusing because the URL looks like edit/detail, while the route renders `ProductAddPage`.

## 9. i18n

After the locale cleanup, `en` and `uk` keys are synchronized. This is good.

Improvements:

- Add a missing/extra key check script:

```txt
scripts/check-i18n-keys.mjs
```

- Add a package script:

```json
"i18n:check": "node scripts/check-i18n-keys.mjs"
```

- For dynamic keys (`orders.sources.${source}`, `products.listSort.${value}`), keep enum/type mappings close to the domain model so keys do not silently break when API values change.
- Avoid user-facing text inside utils (`date-time.ts`).

## 10. Logging and Debugging

Found locations:

```txt
src/pages/products-page/products-list/controllers/use-products-list-controller.ts
src/pages/conversation/conversation-details/components/conversation-client-info-panel/__components/client-order-drawers.tsx
src/pages/products-page/products-list/list/products-list-page.tsx
src/features/conversations/model/conversations-socket-store.ts
src/features/products/model/ai-tools-store.ts
```

Recommendation:

- Remove debug `console.log` calls.
- For dev-only diagnostics, use a helper:

```ts
export const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log(...args);
};
```

- For production errors, use UI notifications or a centralized error reporter.

## 11. Component/Shared Candidates

High priority:

```txt
src/components/table/table-row-actions.tsx
src/components/media/media-thumbnail.tsx
src/components/layout/page-header.tsx
src/components/feedback/page-spinner.tsx
src/components/feedback/page-error.tsx
src/components/forms/inline-form-item.tsx
```

Medium priority:

```txt
src/components/layout/sidebar-menu-shell.tsx
src/components/empty/empty-state-panel.tsx
src/components/forms/entity-modal-form.tsx
src/components/selects/searchable-check-list.tsx
```

Product-local reusable components:

```txt
src/pages/products-page/products-list/form/sections/characteristic-row.tsx
src/pages/products-page/products-list/form/media/product-media-gallery.tsx
src/pages/products-page/products-list/form/variants/variant-media-picker.tsx
```

Important: do not move everything into `shared` prematurely. If a component is currently needed only by the product add form, keep it inside the products page/form area. Promote only truly feature-agnostic pieces to `src/components`.

## 12. Improvement Plan

### Phase 0: Fast Safe Cleanup

Goal: remove noise and reduce risk without architectural refactoring.

1. Remove debug logs:
   - `products-list-page.tsx`
   - `client-order-drawers.tsx`
   - `use-products-list-controller.ts`
2. Remove old commented product edit/create code from `use-products-list-controller.ts`.
3. Decide what to do with `/products/list/product/:productId`:
   - placeholder page;
   - disabled edit page;
   - or temporarily remove the route.
4. Add `scripts/check-i18n-keys.mjs`.
5. Add `npm run i18n:check`.

### Phase 1: Design Tokens and Hardcoded Layout

Goal: stop spreading layout values across UI code.

1. Add product list constants:

```txt
src/pages/products-page/products-list/list/products-list-layout.constants.ts
```

2. Extract:
   - table widths
   - image sizes
   - filter panel width
   - scroll x
3. Add shared constants:

```txt
src/components/layout/layout.constants.ts
src/components/media/media.constants.ts
```

4. Replace the most repeated inline styles:
   - `margin: 0` headings
   - `marginBottom: 0` form items
   - `width: 100%` controls
   - common spinner/empty margins

### Phase 2: Products Area Simplification

Goal: make the product create flow maintainable.

1. Split `use-product-add-page-controller.ts`:

```txt
useProductAddMediaController
useProductCharacteristicsController
useProductVariantGenerationController
useProductVariantImagesModalController
useProductCreateSubmit
```

2. Extract the characteristic row:

```txt
form/sections/characteristic-row.tsx
```

3. Remove duplication between:
   - `ProductVariantsSection`
   - `SingleProductCharacteristicsSection`
4. Decide what to do with `instagram-ai-panel`:
   - if the feature is needed soon, connect the provider/use flow;
   - if not, remove it or move it to a feature branch.
5. Decide what to do with product detail/edit files that are currently deleted or unused.

### Phase 3: Common UI Extraction

Goal: reduce duplication between pages.

1. Extract `TableRowActions`.
2. Extract `MediaThumbnail`.
3. Extract `PageHeader`.
4. Extract `PageSpinner` and `PageError`.
5. Extract sidebar shell/menu abstraction for settings/products/orders/clients.

### Phase 4: Store/API Consistency

Goal: make data flow predictable.

1. Adopt this rule:
   - UI/controllers call stores;
   - stores call API;
   - API knows nothing about UI.
2. Decide for product media:
   - upload/delete stay as direct API calls in the controller;
   - or move them into the store.
3. Split the large `products-api.ts` into domain sections or files.
4. Review unused store methods and delete or mark them as planned.
5. Add minimal tests for pure functions:
   - `normalizeCreateProductPayload`
   - `generateProductVariantsFromCharacteristics`
   - `product-add-variant.utils`
   - `products-list-url`
   - `build-order-create-payload`

### Phase 5: Quality Gates

Goal: catch issues automatically.

1. Add checks:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run format:check`
   - `npm run i18n:check`
2. Add a lightweight unused-files check script or introduce `knip`.
3. Add convention docs:

```txt
docs/frontend-conventions.md
docs/i18n-conventions.md
docs/store-api-conventions.md
```

## 13. Prioritized Backlog

P0:

- Remove debug logs.
- Remove or fix the products edit route.
- Remove commented old blocks from `use-products-list-controller.ts`.
- Add i18n key checking.

P1:

- Split `use-product-add-page-controller.ts`.
- Extract the characteristic row.
- Extract product list constants.
- Create `MediaThumbnail`.

P2:

- Extract `TableRowActions`.
- Extract `PageHeader`.
- Extract common spinner/error/empty components.
- Split `products-api.ts`.

P3:

- Decide the long-term architecture for product edit/detail.
- Connect or remove the Instagram AI flow.
- Add unit tests for pure product/order functions.
- Add unused code analysis to CI/local scripts.

## 14. What Not To Do Immediately

- Do not move everything into `shared` in one large PR. That will create abstractions without proven value.
- Do not refactor conversations realtime and product add flow at the same time.
- Do not delete store methods that may be needed by edit/detail flow until the product edit decision is made.
- Do not replace Ant Design primitives with custom primitives if the only problem is style duplication.

## 15. Recommended First PR

The safest first PR:

1. Remove debug logs.
2. Add `scripts/check-i18n-keys.mjs`.
3. Add `npm run i18n:check`.
4. Remove commented dead code from `use-products-list-controller.ts`.
5. Extract product list constants:
   - table widths
   - image size
   - grid cover height
   - filter panel width
6. Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run i18n:check
```

This gives a quick win without changing application behavior.
