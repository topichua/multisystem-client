# Roles And Permissions

This document describes how the frontend uses workspace roles, the permissions catalog, and current-user permissions.

## Endpoints

### `GET /workspace/roles`

Returns existing workspace roles.

The role editor uses these fields:

- `id` - route id and PATCH target.
- `slug` - stable backend identifier. It is displayed but not edited in the current form.
- `name` - editable role name.
- `permissions` - enabled boolean permission keys.
- `permissionOptions` - scalar option values keyed by permission option key, for example `orders.visibility`.
- `permissionOptionLists` - list option values keyed by option-list key.
- `resolved` - backend-computed typed permissions. The editor does not save this object.

### `POST /workspace/roles`

Creates a role.

The roles page exposes create UI from the left column. The modal asks only for `name`; `slug` is generated from the name on the client.

Examples:

- `Operator` -> `operator`
- `Мой оператор` -> `moy-operator`
- `Мій оператор` -> `miy-operator`

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
workspaceRolesApi.create(payload)
```

### `PATCH /workspace/roles/:roleId`

Updates editable role fields:

```ts
{
  name,
  permissions,
  permissionOptions,
  permissionOptionLists
}
```

The frontend builds this payload from the catalog-driven form.

### `DELETE /workspace/roles/:roleId`

Deletes a role.

The role detail header exposes delete UI and then navigates to a neighbor role or back to `/team/roles`:

```ts
workspaceRolesApi.delete(roleId)
```

### `GET /permissions/catalog`

Returns the schema for the role form.

This is the source of truth for editable permission fields. The frontend should not duplicate all permission keys as a hardcoded enum.

### `GET /workspace/permissions/me`

Returns typed permissions for the current user in the current workspace.

This endpoint is for access checks in the app UI: navigation visibility, disabled buttons, page guards, and action availability. It is separate from role editing.

## Why We Do Not Keep A Full Client Enum

Permission keys are owned by the backend catalog.

If the frontend hardcodes a full enum like `products.read`, `orders.create`, `workspace.roles`, every backend permission change must be duplicated in the client. That creates two sources of truth.

Instead:

- Role edit UI is generated from `/permissions/catalog`.
- Current user checks should use `/workspace/permissions/me`.
- TypeScript types describe the shape of catalog items, not a full fixed list of all permission keys.

Small client constants are still acceptable for app-specific checks later, for example named helpers like `canManageRoles`, but the role form should stay catalog-driven.

## Catalog To Form Mapping

Catalog modules become visual sections.

```json
{
  "module": "products",
  "label": "Product",
  "items": []
}
```

Each module renders a section with `label` as the title.

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
- The group key itself is not saved unless a nested item says so.

## Permissions UI

The role detail page renders the right column as permission module cards.

Each module card shows:

- Module icon.
- Module label from catalog.
- Enabled boolean permissions count, for example `1/5`.
- A module action: `Enable all` or `Disable all`.
- Rows for boolean permissions and options.

Boolean permission rows use switches. Option rows use segmented controls.

The implementation intentionally uses Ant Design components first (`Card`, `Flex`, `Switch`, `Segmented`, `Tag`, `Button`) and only small token-aware inline layout styles. This keeps the page compatible with the app dark theme.

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
- Grant data is loaded from `GET /workspace/roles/:roleId/integration-grants`.
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
]
```

The form uses the catalog children of `integration_grants` to render each grant permission:

- `option` items become segmented controls.
- `boolean` items become switches.
- Items with `integrationTypes` are only shown for matching integrations.

When `conversations.full_access` is enabled, per-integration controls are disabled because the catalog says full access ignores per-integration grants.

## Save Algorithm

The current implementation uses helper functions in:

```txt
src/pages/team-page/team-role-form-utils.ts
```

### Initial Form Values

`toTeamRoleFormValues(role, schema)`:

1. Collects known permission keys from catalog boolean items stored in `permissions`.
2. Sets checkbox values from `role.permissions`.
3. Copies `role.permissionOptions`.
4. Applies catalog option defaults when the role has no value.
5. Copies `role.permissionOptionLists`.

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
  permissionOptionLists
}
```

Preserving unknown keys matters because the backend can expose role data that the current frontend renderer does not yet understand.

## Current Frontend Files

Role feature:

```txt
src/features/workspace-roles/api/workspace-roles-api.ts
src/features/workspace-roles/model/workspace-role.types.ts
src/features/workspace-roles/model/workspace-roles-store.ts
src/features/workspace-roles/model/workspace-roles-provider.tsx
src/features/workspace-roles/model/use-workspace-roles-store.ts
```

Role page:

```txt
src/pages/team-page/team-roles-page.tsx
src/pages/team-page/team-role-detail-view.tsx
src/pages/team-page/team-role-permissions-form.tsx
src/pages/team-page/team-role-form-utils.ts
src/pages/team-page/team-role-permissions-i18n.ts
```

Routing:

```txt
src/app/router/page-routes.tsx
src/app/router/pages-map.ts
```

## Current Page Flow

1. User opens `/team/roles`.
2. `TeamRolesPage` calls `workspaceRolesStore.loadInitialData()`.
3. Store loads roles and catalog in parallel.
4. Left column renders roles from `store.sortedRoles`.
5. Index route redirects to the first role.
6. Detail route `/team/roles/:roleId` renders a form from `store.catalog`.
7. Save calls `PATCH /workspace/roles/:roleId`.
8. If the catalog has `integration_grants`, save also calls `PUT /workspace/roles/:roleId/integration-grants`.
9. Store silently reloads roles and integration grants after save.

## Frontend Access Checks Later

Role editing is not the same as checking current-user access.

For app restrictions, add a separate permissions store around:

```txt
GET /workspace/permissions/me
```

That store should expose typed helpers, for example:

```ts
canViewProducts
canCreateOrders
canManageRoles
canInviteMembers
canReadIntegration(type, id)
```

Components should use those helpers instead of reading nested permission objects directly.

## Next Steps

The next backend-integrated steps should be:

1. Build a separate current-user permissions store around `GET /workspace/permissions/me`.
2. Add small permission helpers on top of that store, for example `canManageRoles()`, `canViewOrders()`, `canInviteMembers()`, `canReadIntegration(type, id)`.
3. Start applying those helpers in real UI entry points: sidebar items, page routes, action buttons, editable forms, and conversation or Instagram actions.
4. Decide the app behavior for forbidden actions: hide, disable, or redirect, and keep that behavior consistent across pages.
5. Add focused tests for role payload builders and permission helpers, because most of the risk is in mapping catalog data to API payloads and UI checks.
