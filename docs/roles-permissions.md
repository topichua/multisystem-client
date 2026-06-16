# Roles And Permissions

This document describes how the frontend uses workspace roles, the permissions catalog, and current-user permissions.

## Endpoints

### `GET /workspace/roles`

Returns existing workspace roles.

Response shape:

```ts
{
  items: WorkspaceRole[];
}
```

The role editor uses these fields:

- `id` - route id and PATCH target.
- `slug` - stable backend identifier. It is displayed but not edited in the current form.
- `name` - editable role name.
- `permissions` - enabled boolean permission keys.
- `permissionOptions` - scalar option values keyed by permission option key, for example `orders.visibility`.
- `permissionOptionLists` - list option values keyed by option-list key.
- `resolved` - backend-computed typed permissions. The editor does not save or display this object today.

The API also returns `workspaceId`, `createdAt`, and `updatedAt`. The current role UI does not use them.

### `POST /workspace/roles`

Creates a role.

The roles page exposes create UI from the left column. The modal asks only for `name`; `slug` is generated from the name on the client with `slugifyAscii()` from `src/utils/slugify.ts`.

Examples:

- `Operator` -> `operator`
- `Мой оператор` -> `moy-operator`
- `Мій оператор` -> `miy-operator`

If slug generation produces an empty string, create is blocked and the user sees a validation error.

The initial role is created with the minimal baseline access:

```ts
{
  slug,
  name,
  permissions: ["orders.read"],
  permissionOptions: {
    "orders.visibility": "mine",
  },
}
```

```ts
workspaceRolesApi.create(payload);
```

After a successful create, the store reloads roles and the page navigates to the created role by matching `slug`.

### `PATCH /workspace/roles/:roleId`

Updates editable role fields:

```ts
{
  name,
  permissions,
  permissionOptions,
  permissionOptionLists,
}
```

The frontend builds this payload from the catalog-driven form.

### `DELETE /workspace/roles/:roleId`

Deletes a role.

The role detail header exposes delete UI and then navigates to the next role in `store.sortedRoles`, the previous role, or back to `/team/roles` if no roles remain:

```ts
workspaceRolesApi.delete(roleId);
```

### `GET /permissions/catalog`

Returns the schema for the role form.

Response shape:

```ts
{
  schema: WorkspacePermissionsCatalogSchema;
}
```

This is the source of truth for editable permission fields. The frontend should not duplicate all permission keys as a hardcoded enum.

### `GET /workspace/roles/:roleId/integration-grants`

Returns per-integration grant settings for a role.

Response shape:

```ts
{
  roleId: number;
  grants: Array<{
    integrationType: string;
    integrationId: number;
    integrationName: string;
    permissions: Record<string, string | number | boolean | null>;
  }>;
}
```

The UI uses `integrationName` when present and falls back to a translated `integrationType #id` label.

### `PUT /workspace/roles/:roleId/integration-grants`

Updates integration grants for a role.

The request body is the grants array itself, not an object wrapper. See the Integration Grants section below.

### `GET /workspace/permissions/me`

Returns typed permissions for the current user in the current workspace.

This endpoint is for access checks in the app UI: navigation visibility, disabled buttons, page guards, and action availability. It is separate from role editing.

The frontend does not call this endpoint yet.

## Why We Do Not Keep A Full Client Enum

Permission keys are owned by the backend catalog.

If the frontend hardcodes a full enum like `products.read`, `orders.create`, `workspace.roles`, every backend permission change must be duplicated in the client. That creates two sources of truth.

Instead:

- Role edit UI is generated from `/permissions/catalog`.
- Current user checks should use `/workspace/permissions/me`.
- TypeScript types describe the shape of catalog items, not a full fixed list of all permission keys.

Small client constants are still acceptable for app-specific checks later, for example named helpers like `canManageRoles`, but the role form should stay catalog-driven.

## Catalog Schema

The catalog schema returned by the backend includes:

```ts
{
  version: number;
  storage: Record<string, { type: string; description: string; endpoint?: string }>;
  modules: WorkspacePermissionsCatalogModule[];
}
```

`storage` documents where each storage key is persisted on the backend. The form helpers use catalog item `storage` and `type` fields directly.

Each catalog item supports:

- `type` - `boolean`, `option`, `group`, `integration_grants`, or an unknown future type.
- `key`
- `label`, `description`
- `storage` - `permissions`, `permissionOptions`, `permissionOptionLists`, or `integrationGrants`
- `default`
- `options` - for `option` items
- `scope`, `items` - for `group` items
- `integrationTypes` - for integration-grant child items
- `manageEndpoint` - for `integration_grants`

Unknown catalog item types are ignored by the current UI renderer.

## Catalog To Form Mapping

Catalog modules become visual sections.

```json
{
  "module": "products",
  "label": "Product",
  "items": []
}
```

Each module renders a section with a translated module label. The fallback label comes from catalog `label`.

### Boolean Items

Catalog:

```json
{
  "type": "boolean",
  "key": "products.read",
  "storage": "permissions",
  "default": false
}
```

Form behavior:

- Render a switch.
- Initial checked state is `role.permissions.includes("products.read")`.
- On save, checked boolean keys are written to `permissions: string[]`.

### Option Items

Catalog:

```json
{
  "type": "option",
  "key": "orders.visibility",
  "storage": "permissionOptions",
  "default": "mine",
  "options": [
    { "value": "all", "label": "All" },
    { "value": "mine", "label": "Mine" }
  ]
}
```

Form behavior:

- Render a segmented control when catalog provides option values.
- Initial value is `role.permissionOptions["orders.visibility"]`.
- If the role has no value, use catalog `default`.
- On save, write the selected value to `permissionOptions["orders.visibility"]`.

### Option List Items

Catalog items with `storage: "permissionOptionLists"` are supported in payload builders:

- `toWorkspaceRoleFormValues()` copies existing values and applies catalog list defaults.
- `buildWorkspaceRoleUpdatePayload()` writes known list fields and preserves unknown existing lists.

There is no dedicated option-list UI yet. If the backend starts returning these fields, the current editor will preserve them on save but will not render controls for them.

### Group Items

Catalog:

```json
{
  "type": "group",
  "key": "orders.scope",
  "label": "Visibility",
  "scope": {},
  "items": []
}
```

Form behavior:

- Render nested rows inside the module card.
- `scope` is rendered as its own catalog item, usually an option segmented control.
- Nested `items` are rendered recursively.
- The group `label` is not rendered as a separate row today.
- The group key itself is not saved unless a nested item says so.

## Permissions UI

The role detail page renders the right column as permission module cards.

Each module card shows:

- Module icon from a small client map in `team-role-permissions-module-card.tsx`:
  - `analytics`, `clients`, `conversations`, `orders`, `products`, `workspace`
  - unknown modules fall back to the workspace icon
- Module label from catalog via i18n.
- Enabled boolean permissions count, for example `1/5`.
- A module action: `Enable all` or `Disable all`.
- Rows for boolean permissions and options.

Boolean permission rows use switches. Option rows use segmented controls.

The implementation intentionally uses Ant Design components first (`Card`, `Flex`, `Switch`, `Segmented`, `Tag`, `Button`) and only small token-aware inline layout styles. This keeps the page compatible with the app dark theme.

### Permission Dependency Rules

The UI applies client-side dependency rules on top of catalog rows:

1. Module read gate.
   - If a module has a root boolean key `{module}.read`, that key becomes the module gate.
   - Other boolean permissions in the module are disabled while the gate is off.
   - Option rows in the module are also disabled while the gate is off.

2. Nested read parent.
   - For boolean keys with at least three dot segments, the UI looks for a parent read key by replacing the last segment with `.read`.
   - Example: `workspace.members.invite` depends on `workspace.members.read`.
   - Child boolean permissions are disabled while the parent read permission is off.

3. Cascading disable.
   - When a parent boolean permission is turned off, dependent child boolean permissions in the same module are automatically unchecked.

4. Counter behavior.
   - The `selectedCount/total` tag counts only enabled boolean permissions. Disabled rows are excluded from the numerator even if their switch state is still `true` in form state.

### Integration Grants

Catalog:

```json
{
  "type": "integration_grants",
  "key": "integration_grants",
  "storage": "integrationGrants",
  "manageEndpoint": "/workspace/roles/:roleId/integration-grants"
}
```

Current behavior:

- The role form renders this item inside the conversations module card.
- Grant data is loaded from `GET /workspace/roles/:roleId/integration-grants` when the catalog contains an `integration_grants` item.
- Grant data is saved through `PUT /workspace/roles/:roleId/integration-grants`.
- It is not included in the regular role PATCH payload.

Reason:

- The catalog declares a separate management endpoint.
- Backend stores per-integration access separately from role `permissions` and `permissionOptions`.

The `PUT` request body is the grants array itself, not an object wrapper:

```ts
[
  {
    integrationType: "instagram",
    integrationId: 1,
    permissions: {
      read: "mine",
      write: "mine",
      assignResponsibility: true,
      instagramCommentsView: true,
      instagramCommentsWrite: true,
    },
  },
];
```

The form uses the catalog children of `integration_grants` to render each grant permission:

- `option` items become segmented controls.
- `boolean` items become switches.
- Items with `integrationTypes` are only shown for matching integrations.

Each grant is stored in form state under:

```ts
integrationGrants[`${integrationType}:${integrationId}`];
```

When `conversations.full_access` is enabled, per-integration controls are disabled because full access ignores per-integration grants.

Load and save rules:

- Integration grants are loaded when the detail view opens and the catalog contains `integration_grants`.
- Save is disabled while integration grants are still loading.
- Integration grants are included in save only after the first load for that role has completed successfully.
- If the grants request failed, the role PATCH can still save, but grants PUT is skipped until grants are loaded.

Empty grants state:

- If the role has no connected integrations, the UI shows an empty-state message instead of grant cards.

## Save Algorithm

The current implementation uses helper functions in:

```txt
src/features/workspace-roles/utils/workspace-role-form.ts
```

### Form Value Shape

```ts
type WorkspaceRoleFormValues = {
  name: string;
  permissions?: Record<string, boolean>;
  permissionOptions?: Record<string, string | number | boolean | null>;
  permissionOptionLists?: Record<string, string[]>;
  integrationGrants?: Record<
    string,
    {
      integrationType: string;
      integrationId: number;
      permissions: Record<string, string | number | boolean | null>;
    }
  >;
};
```

### Initial Form Values

`toWorkspaceRoleFormValues(role, schema, integrationGrants = [])`:

1. Collects known permission keys from catalog boolean items stored in `permissions`.
2. Sets checkbox values from `role.permissions`.
3. Copies `role.permissionOptions`.
4. Applies catalog option defaults when the role has no value.
5. Copies `role.permissionOptionLists` and applies catalog list defaults when missing.
6. Builds `integrationGrants` from the loaded grants list, merged with catalog defaults per `integrationType`.

The detail view resets form values when `role`, `catalog`, or loaded `integrationGrants` change.

### PATCH Payload

`buildWorkspaceRoleUpdatePayload(role, schema, values)`:

1. Collects checked known permissions from the form.
2. Preserves existing role permission keys that are not present in the current catalog.
3. Writes visible option fields into `permissionOptions`.
4. Preserves unknown existing `permissionOptions`.
5. Writes known option-list fields if catalog provides any.
6. Sends:

```ts
{
  name,
  permissions,
  permissionOptions,
  permissionOptionLists,
}
```

Preserving unknown keys matters because the backend can expose role data that the current frontend renderer does not yet understand.

### Integration Grants Payload

`buildWorkspaceRoleIntegrationGrantsPayload(schema, currentGrants, values)`:

1. Iterates over the currently loaded grants list. New integrations are not invented on the client.
2. For each grant, merges form values for visible catalog child items.
3. Falls back to catalog defaults for missing child values.
4. Preserves existing grant permission keys that are not represented in the current catalog children.

Save orchestration lives in `WorkspaceRolesStore.updateRoleWithIntegrationGrants()`:

1. `PATCH /workspace/roles/:roleId`
2. optional `PUT /workspace/roles/:roleId/integration-grants`
3. silent reload of roles and, when applicable, integration grants

## State And Provider

`WorkspaceRolesProvider` is registered in `src/app/feature-providers.tsx` and exposes a MobX store through React context.

`WorkspaceRolesStore` currently tracks:

- `roles`, `catalog`
- `integrationGrantsByRoleId`
- loading and error state for roles list, catalog, integration grants, save, and delete
- `sortedRoles` - roles sorted by `id`

Store methods used by the roles page:

- `loadInitialData()` - roles + catalog in parallel
- `loadIntegrationGrants(roleId)`
- `createRole(payload)`
- `updateRoleWithIntegrationGrants(roleId, rolePayload, integrationGrantsPayload?)`
- `deleteRole(roleId)`

## Localization

Catalog labels are translated in `src/pages/team-page/team-roles/team-role-permissions-i18n.ts`.

Translation key patterns:

- `team.permissions.modules.{module}`
- `team.permissions.items.{itemKey}`
- `team.permissions.optionValues.{itemKey}.{value}`
- `team.permissions.integrationGrantFallback`
- `integrations.types.{integrationType}.label`

If a translation key is missing, the UI falls back to catalog `label` or `description`, or to the raw catalog value.

Locale files:

```txt
src/i18n/locales/en.json
src/i18n/locales/uk.json
```

## Resolved Permissions Type

`WorkspaceRole.resolved` has a typed frontend shape in `workspace-role.types.ts` (`WorkspaceRoleResolvedPermissions`). It mirrors backend-computed access for products, orders, conversations, clients, workspace, analytics, and `integrationGrants`.

The role editor does not read `resolved` today. It is expected to become useful for debugging or read-only role summaries later, but current-user access checks should still come from `GET /workspace/permissions/me`.

## Current Frontend Files

Role feature:

```txt
src/features/workspace-roles/api/workspace-roles-api.ts
src/features/workspace-roles/model/workspace-role.types.ts
src/features/workspace-roles/model/workspace-roles-store.ts
src/features/workspace-roles/model/workspace-roles-store-context.ts
src/features/workspace-roles/model/workspace-roles-provider.tsx
src/features/workspace-roles/model/use-workspace-roles-store.ts
src/features/workspace-roles/utils/workspace-role-form.ts
```

Role page:

```txt
src/pages/team-page/team-roles/team-roles-page.tsx
src/pages/team-page/team-roles/team-roles-index.tsx
src/pages/team-page/team-roles/team-role-detail-view.tsx
src/pages/team-page/team-roles/team-role-permissions-form.tsx
src/pages/team-page/team-roles/team-role-permissions-module-card.tsx
src/pages/team-page/team-roles/team-role-permissions-form.utils.ts
src/pages/team-page/team-roles/team-role-permissions-i18n.ts
```

App wiring:

```txt
src/app/feature-providers.tsx
src/app/router/page-routes.tsx
src/app/router/pages-map.ts
src/app/router/navigation.tsx
src/utils/slugify.ts
```

Routes:

- `/team/roles` - roles list shell with create modal
- `/team/roles/:roleId` - role detail and permissions form
- team section nav includes both members and roles

## Current Page Flow

1. User opens `/team/roles`.
2. `TeamRolesPage` calls `workspaceRolesStore.loadInitialData()`.
3. Store loads roles and catalog in parallel.
4. Left column renders roles from `store.sortedRoles`.
5. Index route redirects to the first role.
6. Detail route `/team/roles/:roleId` renders a form from `store.catalog`.
7. If the catalog contains `integration_grants`, the detail view loads grants for the selected role.
8. Save validates the Ant Design form, builds role and optional grants payloads, and calls `updateRoleWithIntegrationGrants()`.
9. Save calls `PATCH /workspace/roles/:roleId`.
10. If grants were loaded successfully, save also calls `PUT /workspace/roles/:roleId/integration-grants`.
11. Store silently reloads roles and integration grants after save.

Create flow:

1. User opens the create modal from the left column.
2. Client generates `slug` from `name`.
3. `POST /workspace/roles` sends the baseline permissions payload.
4. Store reloads roles and navigates to the created role.

## Frontend Access Checks Later

Role editing is not the same as checking current-user access.

For app restrictions, add a separate permissions store around:

```txt
GET /workspace/permissions/me
```

That store should expose typed helpers, for example:

```ts
canViewProducts;
canCreateOrders;
canManageRoles;
canInviteMembers;
canReadIntegration(type, id);
```

Components should use those helpers instead of reading nested permission objects directly.

### Planned Usage Pattern

The intended frontend usage later should look like this:

1. Load `GET /workspace/permissions/me` once at workspace level.
2. Store the typed response in a dedicated permissions store, separate from role-editing state.
3. Expose small semantic helpers instead of leaking raw nested objects into page code.
4. Use those helpers in routing, navigation, page entry checks, and action buttons.

Suggested store surface:

```ts
type WorkspacePermissionsStore = {
  permissions: WorkspacePermissionsMe | null;
  loadMyPermissions(): Promise<void>;
  canViewProducts(): boolean;
  canCreateOrders(): boolean;
  canManageRoles(): boolean;
  canInviteMembers(): boolean;
  canReadIntegration(type: string, id: number): boolean;
};
```

Component usage should stay simple:

```ts
const permissions = useWorkspacePermissionsStore();

if (!permissions.canManageRoles()) {
  return <Navigate to={pagesMap.teamMembers} replace />;
}
```

```ts
<Button disabled={!permissions.canCreateOrders()}>
  {t("orders.create")}
</Button>
```

This keeps permission logic in one place. If the backend response changes, the adaptation happens in the permissions store and helper layer, not across dozens of UI components.

## Next Steps

The next backend-integrated steps should be:

1. Build a separate current-user permissions store around `GET /workspace/permissions/me`.
2. Add small permission helpers on top of that store, for example `canManageRoles()`, `canViewOrders()`, `canInviteMembers()`, `canReadIntegration(type, id)`.
3. Start applying those helpers in real UI entry points: sidebar items, page routes, action buttons, editable forms, and conversation or Instagram actions.
4. Decide the app behavior for forbidden actions: hide, disable, or redirect, and keep that behavior consistent across pages.
5. Add catalog UI support for `permissionOptionLists` when the backend starts using list-based permissions.
