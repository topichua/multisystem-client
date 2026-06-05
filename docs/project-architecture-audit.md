# Глобальный аудит проекта Lantoro / Multi-sale

Дата прохода: 2026-06-04  
Статус: черновик после первого полного прохода от `src/main.tsx` по app/pages/features/shared.

## Методика и ограничения

- Исходный код не менялся. Документ фиксирует только наблюдения и план улучшений.
- `npm run typecheck` проходит.
- `npm run lint` проходит.
- Тестовой инфраструктуры не найдено: нет `*.test.*` / `*.spec.*`, нет Vitest/Jest/Testing Library в `package.json`.
- `tokensave` MCP в этой сессии вернул предупреждение, что индекс указывает на другой worktree (`comeet-client`), а локальной `.tokensave` директории в этом репозитории нет. Поэтому семантические выводы ниже сделаны по локальному коду через `rg` и точечное чтение файлов.

Если это поведение `tokensave` не ожидаемое, стоит открыть issue в `https://github.com/aovestdipaperino/tokensave` с описанием, что MCP отдает индекс другого worktree. Перед отправкой нужно убрать из описания любой чувствительный или проприетарный код.

## Целевой стиль

Лучший текущий образец: `products-characteristics` и `products-categories`.

Что в них хорошо:

- `layout.tsx` тонкий: берет controller и раскладывает shell/sidebar/outlet/modal.
- Основная логика вынесена в `controllers/use-...controller.ts`.
- UI-компоненты получают готовые props и почти не знают про routing/store.
- Есть явные loading/error/not-found/invalid-id состояния.
- Используются общие layout primitives: `PaneNavSplitLayout`, `PaneDetailLayout`, `PaneSection...`.
- Route id парсится один раз и дальше работает как `number | null`.
- После delete выбирается следующий разумный route.
- API ошибки проходят через `getApiErrorMessage`.

Рекомендуемый стандарт для похожих страниц:

```txt
page-area/
  controllers/
    use-entity-layout-controller.ts
    use-entity-detail-controller.ts
  components/
    entity-sidebar.tsx
    entity-create-modal.tsx
    entity-detail-header.tsx
    entity-danger-zone.tsx
    entity-*-section.tsx
  entity-layout.tsx
  entity-index.tsx
  entity-detail-view.tsx
  entity.constants.ts
  entity.utils.ts
  entity-layout.styled.tsx
```

## Приоритеты

### P0: исправить потенциальные runtime / UX проблемы

1. `AiToolsProvider` не подключен в `src/main.tsx`, но `InstagramAiPanelConnected` вызывает `useAiToolsStore`.
   - Файлы: `src/features/products/model/ai-tools-provider.tsx`, `src/pages/products-page/products-list/instagram-ai-panel/instagram-ai-panel-connected.tsx`, `src/main.tsx`.
   - Риск: если вернуть `ProductInstagramAiDrawer` в UI, приложение упадет с ошибкой `useAiToolsStore must be used within AiToolsProvider`.
   - Что сделать: либо подключить provider в общий provider composition, либо удалить/изолировать AI flow до готовности.

2. `ProductInstagramAiDrawer` и весь Instagram AI flow сейчас не используются.
   - Файлы: `src/pages/products-page/products-list/instagram-ai-panel/*`, `src/features/products/model/ai-tools-store.ts`, `src/features/products/api/ai-api.ts`.
   - Риск: скрытый мертвый код с невалидным provider wiring.
   - Что сделать: решить статус фичи: включаем как отдельный flow или удаляем до отдельной задачи.

3. `onRemoveVariantOnlyImage` пустой.
   - Файл: `src/pages/products-page/products-list/controllers/use-product-variant-images-controller.ts`.
   - Риск: variant-only image визуально удаляется из draft, но загруженный media resource может остаться на backend/CDN.
   - Что сделать: добавить реальное удаление через API или явно сделать upload временным до submit.

4. Integrations modal показывает типы, которые store запрещает подключать.
   - Файлы: `src/pages/settings-page/settings-integrations/settings-integrations-modal.tsx`, `src/features/integrations/model/integrations-store.ts`.
   - Сейчас modal показывает `whatsapp`, `nova-poshta`, `tiktok`, `prom`, но `CONNECTABLE_INTEGRATION_TYPES` содержит только `instagram`, `telegram`.
   - Риск: пользователь кликает, открывается blank auth window, затем получает ошибку "This integration is not available yet".
   - Что сделать: disabled/coming soon для неподдержанных типов или убрать их из modal.

5. В коде остались production `console.log`.
   - `src/pages/products-page/products-list/controllers/use-products-list-controller.ts`: delete error логируется в консоль вместо message.
   - `src/features/conversations/model/conversations-socket-store.ts`: каждый realtime update логируется.
   - `src/pages/conversation/conversation-details/components/conversation-client-info-panel/__components/client-order-drawers.tsx`: checkbox `onChange` делает `console.log`.
   - Что сделать: заменить на UI feedback / dev-only logger / удалить.

6. Есть прямые path literals вместо `pagesMap`.
   - `src/pages/orders-page/orders-list/orders-list-page.tsx`: `navigate(\`/orders/${record.id}\`)`.
   - `src/pages/orders-page/order-details/order-details-page.tsx`: `navigate("/orders/list")`.
   - Что сделать: добавить `getOrderDetailsPath(orderId)` и использовать `pagesMap.ordersList`.

### P1: привести продукты к эталонной структуре

1. `src/pages/products-page/products-list/controllers/use-product-add-page-controller.ts` слишком большой.
   - Размер: 936 строк.
   - Внутри: bootstrap edit mode, media, variants, modal, submit, validation, i18n labels, product type switching.
   - Что сделать:
     - `use-product-edit-bootstrap.ts`
     - `use-product-form-submit-controller.ts`
     - `use-product-variants-controller.ts`
     - оставить в `use-product-add-page-controller.ts` только композицию.

2. `src/pages/products-page/products-list/controllers/use-products-list-controller.ts` содержит большой закомментированный старый flow.
   - Размер файла: 532 строки, значительная часть закомментирована.
   - Риск: устаревший create/edit/autosave код мешает видеть реальный контракт controller.
   - Что сделать: удалить закомментированные блоки; если логика нужна, вынести в отдельный draft/issue, а не хранить в source.

3. `ProductsStore` смешивает URL/list state, draft filter state, product CRUD и variant custom fields.
   - Файл: `src/features/products/model/products-store.ts`.
   - Риск: store сам вызывает `loadProducts()` после изменения фильтров, а `useProductsListUrlSync` тоже оркестрирует загрузку после URL state.
   - Что сделать: выбрать один источник orchestration.
     - Вариант A: store только меняет state, URL sync / controller вызывает загрузку.
     - Вариант B: store владеет загрузкой, URL sync только синхронизирует query без side effects.

4. `productsApi` содержит legacy методы, которые сейчас не вызываются.
   - Используются: `list`, `createProduct`, `updateProduct`, `uploadMedia`, `listCatalogVariants`.
   - Не найдены вызовы: `create`, `createVariant`, `updateVariant`, `deleteVariant`, `listMedia`, `listMediaEffective`, `listVariantMedia`, `createMedia`, `updateMedia`, `deleteUploadedMedia`.
   - Файл: `src/features/products/api/products-api.ts`.
   - Что сделать: проверить с backend roadmap. Если старый API не нужен, удалить или пометить deprecated в отдельной задаче.

5. В product create/update payload есть скрытые продуктовые константы.
   - Файл: `src/pages/products-page/products-list/form/payload/normalize-create-product-payload.ts`.
   - `sourceType = "manual"`, `currency = "UAH"`, `inStock = true`.
   - Что сделать: вынести в `products.constants.ts` или feature config. Если это пользовательские настройки, добавить поля формы.

6. Есть две модели payload/types для продукта.
   - `src/features/products/model/product.types.ts`: старые `ProductCreatePayload`, `ProductUpdatePayload`, `ProductVariantDraft`.
   - `src/features/products/model/product-create-api.types.ts`: актуальные `CreateProductPayload`, `UpdateProductPayload`.
   - Что сделать: оставить один актуальный контракт. Старые типы удалить вместе с legacy API, если они больше не используются.

7. `ProductForm` и variants sections слишком связаны с controller return type.
   - Файл: `src/pages/products-page/products-list/form/product-form.tsx`.
   - Сейчас props берутся из `ProductAddPageControllerReturn`, из-за чего UI зависит от controller type.
   - Что сделать: определить локальные props types для секций или отдельные view-model types.

8. `ProductVariantsSection` держит Form.List, DnD, characteristic field mapping и variants table в одном компоненте.
   - Файл: `src/pages/products-page/products-list/form/sections/product-variants-section.tsx`.
   - Что сделать:
     - `ProductCharacteristicsBuilder`
     - `ProductVariantsTable`
     - `EmptyVariantsState`
     - `use-sortable-form-list` helper при необходимости.

9. Дублируются display helpers.
   - `statusToColor` / `variantStatusToColor` в list/table/grid.
   - `formatProductPrice` локально в list page.
   - `getVariantTitle` локально в list page.
   - Что сделать: перенести в `features/products/model/product-presenters.ts` или `features/products/utils/product-display.ts`.

10. Цвета и styling местами обходят theme.
    - Примеры: `#9254de`, `#7257d6`, `#f5f5f5`, `#f2f2f2`, inline dashed borders.
    - Файлы: `product-type-section.tsx`, `characteristic-option-value-select.tsx`, `products-list-grid.tsx`, `use-products-table-columns.tsx`, `products-list-filters-panel.tsx`.
    - Что сделать: использовать `styled-components` theme tokens / Ant tokens / существующий `BRAND_PRIMARY`.

11. Для variants logic нужны unit tests.
    - Кандидаты:
      - `generateProductVariantsFromCharacteristics`
      - `buildProductVariantKey`
      - `findDuplicateVariantKeys`
      - `normalizeCreateProductPayload`
      - `normalizeUpdateProductPayload`
      - `productDetailToProductForm`
      - `parseProductsListUrlSearchParams`

### P1: упростить крупные page files

1. `ClientsListPage` сейчас держит все в одном файле.
   - Файл: `src/pages/clients-page/clients-list/clients-list-page.tsx`, 296 строк.
   - Внутри: columns, modal form, mapping, CRUD handlers.
   - Что сделать:
     - `controllers/use-clients-list-controller.ts`
     - `client-form-modal.tsx`
     - `use-clients-table-columns.tsx`

2. `SettingsIntegrationsPage` большой и смешивает controller/UI.
   - Файл: `src/pages/settings-page/settings-integrations/settings-integrations-page.tsx`, 506 строк.
   - Внутри: filter state, grouping, connect/disconnect, layout, cards.
   - Что сделать:
     - `controllers/use-settings-integrations-controller.ts`
     - `integration-type-sidebar.tsx`
     - `integration-type-card.tsx`
     - `integration-account-card.tsx`

3. `OrderDetailsTabs` большой presentational компонент.
   - Файл: `src/pages/orders-page/order-details/components/order-details-tabs.tsx`, 487 строк.
   - Что сделать:
     - `order-overview-tab.tsx`
     - `order-products-tab.tsx`
     - `order-customer-tab.tsx`
     - `order-history-tab.tsx`
   - Дополнительно: переиспользовать `formatMoney` из одного места, сейчас есть отдельные реализации в order details utils и orders table columns.

4. `client-order-drawers.tsx` слишком большой.
   - Файл: `src/pages/conversation/conversation-details/components/conversation-client-info-panel/__components/client-order-drawers.tsx`, 611 строк.
   - Что сделать: вынести order-create controller, order lines table, delivery form, footer/actions.

### P2: слойность и composition

1. `main.tsx` слишком много знает о feature providers.
   - Файл: `src/main.tsx`.
   - Сейчас каждый новый feature provider меняет entrypoint.
   - Что сделать: создать `src/app/feature-providers.tsx` или `AppProviders`, где доменные providers собираются вместе.
   - После этого `main.tsx` должен остаться bootstrap-файлом: css/i18n/dayjs/root/render.

2. Строгая слойность `app -> pages -> features -> shared` сейчас местами нарушается в `src/components`.
   - `src/components/user-profile/user-profile.tsx` импортирует `useAuth` из feature.
   - `src/components/layout/sider/sider.tsx` импортирует `pagesMap` из app.
   - Что сделать:
     - или признать `components` не shared-слоем, а `widgets`;
     - или перенести auth-aware/nav-aware компоненты в `src/app` / `src/pages/home-page`;
     - в `src/components` оставить feature-agnostic primitives.

3. Нет единого route/nav registry.
   - `pagesMap` есть, но quick actions, sider и products/settings меню формируют элементы отдельно.
   - Что сделать: создать typed route/nav definitions для main nav и quick actions, чтобы labels/icons/active match не расходились.

4. Cross-feature UI зависимость в order statuses.
   - `src/pages/orders-page/order-statuses/order-statuses-nav-list.tsx` использует `GroupListLabelRow` из `features/conversation-groups`.
   - Что сделать: вынести общий `ColorLabelRow` в shared/components, а conversation groups и order statuses пусть используют его.

5. `features/products/model/products-store.ts` импортирует `characteristicsApi`.
   - Это cross-feature зависимость products -> characteristics.
   - Возможно нормальная доменная зависимость, но лучше выразить ее явно:
     - либо products variants действительно зависят от variant custom fields и тогда helper/service должен лежать в products;
     - либо загрузка fields должна идти через `CharacteristicsStore`.

### P2: API contracts и normalizers

1. Нормализация API ответов неоднородная.
   - `clientsApi`, `ordersApi`, Instagram parsers защищаются от разных shapes.
   - `characteristicsApi` и часть `productsApi` доверяют типам напрямую.
   - Что сделать: определить правило:
     - для нестабильных endpoint'ов пишем normalizer/parser;
     - для стабильных backend contracts доверяем типу;
     - не смешивать оба подхода без причины.

2. Base paths разбросаны и иногда отличаются стилем.
   - `/products`, `/orders`, `/categories`, `/integrations`, `/workspace/variant-custom-fields`, `/api/instagram/...`.
   - Что сделать: либо оставить локально, либо вынести route constants для API, если backend paths часто меняются.

3. Ошибки местами обрабатываются разными helper'ами.
   - Есть `unknownErrorMessage`, `getApiErrorMessage`, локальные `errorMessage`.
   - Что сделать: для stores использовать `unknownErrorMessage`, для UI messages использовать `getApiErrorMessage`.

4. Auth route guard проверяет только `isAuthenticated`.
   - Файлы: `src/app/router/protected-route.tsx`, `src/features/auth/model/user-provider.tsx`.
   - Риск: при наличии токена UI считается защищенным до фактической проверки `/auth`.
   - Что сделать: добавить session bootstrap state: `authChecking/sessionLoading`, и показывать shell только после проверки или logout при 401.

### P2: realtime/conversations

1. `ConversationDetails` напрямую ходит в `clientsApi`.
   - Файл: `src/pages/conversation/conversation-details/conversation-details.tsx`.
   - Что сделать: вынести association logic в controller hook или feature method:
     - `use-conversation-client-link-controller.ts`
     - или `clientsStore.resolveInstagramAssociation`.

2. `ConversationStore.dispatchOutboundSend` содержит временный дополнительный GET после send.
   - Файл: `src/features/conversations/model/conversation-store.ts`.
   - Комментарий уже есть: POST не возвращает полный message object.
   - Что сделать: зафиксировать backend contract задачу; после изменения API удалить extra GET.

3. Socket store должен логировать только в dev.
   - Файл: `src/features/conversations/model/conversations-socket-store.ts`.
   - Что сделать: `if (import.meta.env.DEV) console.log(...)` или общий logger.

### P3: UI/theme/i18n consistency

1. В проекте смешаны Phosphor icons и Ant icons.
   - По guidelines лучше использовать `@phosphor-icons/react`.
   - Ant icons сейчас в quick actions и integrations.
   - Что сделать: заменить там, где нет причины держать Ant icons.

2. Много локальных hex/rgba вне theme.
   - Не все надо убирать: design tokens themselves в `src/styled` нормальны.
   - Но page-level hardcode лучше постепенно заменить на theme tokens.

3. User-facing строки в целом идут через i18n, но есть служебные fallback строки.
   - Примеры: errors `"Something went wrong"`, `"This integration is not available yet"`, `"Product category is required"`.
   - Что сделать: UI-facing ошибки переводить через i18n, internal throw можно оставить англ.

4. `UserProfile` содержит placeholder menu items.
   - Файл: `src/components/user-profile/user-profile.tsx`.
   - Что сделать: заменить на реальные пункты или убрать до появления функциональности.

## Что оставить как стандарт

- `PaneNavSplitLayout`, `PaneDetailLayout`, `PaneSection...`.
- Controller hook + dumb components pattern из categories/characteristics.
- `getApiErrorMessage` для UI error messages.
- `category-tree.ts`, `products-categories.utils.ts`, `products-characteristics.utils.ts` как пример чистых helpers.
- Разделение API/model/provider/store/context/use-store внутри features.

## Предлагаемый порядок работ

1. P0 cleanup:
   - решить статус AI flow и `AiToolsProvider`;
   - исправить `onRemoveVariantOnlyImage`;
   - disabled unsupported integrations;
   - убрать `console.log`;
   - заменить route literals в orders.

2. Products cleanup:
   - удалить закомментированный код из `use-products-list-controller.ts`;
   - убрать legacy `productsApi` методы и старые payload types, если backend уже на новом контракте;
   - вынести product display helpers;
   - split `use-product-add-page-controller.ts`.

3. Ввести тесты для чистой логики:
   - поставить Vitest;
   - покрыть variants generation, payload normalization, url parsing, category tree, order details utils, conversation message upsert.

4. Привести CRUD/list-detail страницы к эталону:
   - clients list;
   - settings integrations;
   - settings groups;
   - order statuses;
   - order details tabs.

5. Слойность:
   - вынести `FeatureProviders`;
   - решить, что такое `src/components`: shared primitives или widgets;
   - создать route/nav registry.

## Краткий список кандидатов на удаление/перепроверку

- `ProductInstagramAiDrawer` и `InstagramAiPanelConnected` не используются.
- `buildVariantDraftsFromInstagramAnalyze`, `resolveVariantDraftForCreate`, `fetchRemoteImageFile` выглядят как остатки старого Instagram create flow.
- Старые product API методы: `create`, `createVariant`, `updateVariant`, `deleteVariant`, `listMedia*`, `createMedia`, `updateMedia`, `deleteUploadedMedia`.
- `productToCreateValues`, `productToEditValues`, `ProductEditFormValues` выглядят как старый edit/create mapping.
- Большой закомментированный код в `use-products-list-controller.ts`.

Перед удалением нужно сделать отдельный `rg` по ветке/плану backend API и проверить, что эти экспорты не нужны для ближайшего восстановления Instagram flow.
