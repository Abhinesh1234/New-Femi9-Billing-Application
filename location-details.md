# Location Module — Complete Reference

## Table of Contents

1. [Overview](#overview)
2. [Page 1 — Location List](#page-1--location-list)
3. [Page 2 — Location Overview](#page-2--location-overview)
4. [Page 3 — Add / Edit Location](#page-3--add--edit-location)
5. [API Service Layer](#api-service-layer)
6. [Backend — Model](#backend--model)
7. [Backend — Validation Requests](#backend--validation-requests)
8. [Backend — Controller](#backend--controller)
9. [Caching Strategy](#caching-strategy)
10. [Data Flow](#data-flow)
11. [Validation](#validation)
12. [Error Handling](#error-handling)
13. [Performance](#performance)
14. [Security](#security)

---

## Overview

The Location module spans three pages and a shared API service layer.

| File | Route | Purpose |
|---|---|---|
| `locationList.tsx` | `/locations` | Browse all locations in list or grid view |
| `locationOverview.tsx` | `/locations/:id` | Two-pane detail view with history tab |
| `location.tsx` | `/locations/new`, `/locations/:id/edit` | Add or edit a single location |
| `locationApi.ts` | — | Axios service layer for all location endpoints |

**Technology stack:** React 18, TypeScript, Vite, React Router v6, react-bootstrap Toast/Modal, react-select, @dnd-kit/core, Axios, Laravel 11, Eloquent SoftDeletes.

**Location types:** `business` (operational office, supports transaction series, optional parent) and `warehouse` (stock storage, always requires a parent business location).

---

## Page 1 — Location List

**File:** `resources/js/feature-module/Pages/inventory/locations/locationList.tsx`

### UI Layout

- **PageHeader** — title "Locations", badge showing total count, Export button, functional Refresh button (spinning icon animation via `.spin-animation` CSS class).
- **Card header** — search input (left), "Transaction Series Preferences" link + "New Location" button (right).
- **Toolbar row** — type filter dropdown (All / Business / Warehouse) on the left; "Manage Columns" button (list view only) + List/Grid view toggle on the right.
- **Content area** — switches between list table and grid cards based on `view` state.

### List View

- Uses the `Datatable` component (Ant Design table wrapper).
- **Tree rendering:** locations are organized into a parent-child tree using `buildTree()`. Root nodes always appear first; siblings are sorted alphabetically. Each row shows indented connector lines (vertical trunks, horizontal elbows, circle nodes) drawn with absolutely-positioned `<div>` elements. The geometry is calculated from `depth`, `isLastSibling`, and `ancestorLast[]` arrays.
- **Fixed columns:** Name (always first), Action (always last). Both are locked in the "Customize Columns" modal.
- **Resizable columns:** every column header is rendered via the `ResizableTitle` component, which adds a drag handle on the right edge (or left edge for the last column). Minimum column width is 60px. Widths are persisted to `localStorage` under key `femi9_locations_col_widths`.
- **Default visible columns:** Default Transaction Series, Type, Address Details. Hidden by default: Parent Location, Created By, Status, Created Date.
- **Name column:** shows a 40×40 logo thumbnail (fallback: `ti-building` icon), clickable location name (navigates to overview), star button for setting primary, and an "Inactive" badge when `is_active === false`.
- **Star button behaviour:** outline star is hidden by default; appears on row hover via CSS `[data-star-hover]` attribute toggled by `onMouseEnter`/`onMouseLeave`. A filled amber star replaces the button for the current primary location.
- **Row click:** navigates to `/locations/:id`.
- **Address column:** displays city + state label + country label (from `STATE_LABELS` / `COUNTRY_LABELS` lookup maps), joined by spaces.
- **Search:** filters the tree and preserves ancestors of matching nodes so hierarchy context is always visible. Ancestor expansion is computed by walking `parent_id` chains up the `allById` map.

### Grid View

- Responsive grid: `col-xxl-3 col-xl-4 col-md-6`.
- Each card shows type badge, inactive badge (if applicable), name, parent name ("Root Location" if none), logo thumbnail, address summary, default transaction series, creator avatar, and creation date.
- Grid uses separate search logic (`gridRows` memo) that matches across: name, type, parent name, default series name, city, state, country, created-by name.
- **Load More** button appends 12 more cards each click (`gridPage` state, starts at 12).
- Grid page resets to 12 when switching to grid view.

### View Toggle Persistence

View preference ("list" or "grid") is persisted to `localStorage` under key `femi9_locations_view` and restored on mount.

### Set Primary Flow

1. Clicking the star on any non-primary location opens the "Mark As Primary Location" confirmation modal.
2. On confirm, an **optimistic update** immediately marks the target as primary and all others as non-primary (`setLocations` functional updater captures a snapshot before mutation).
3. `setPrimaryLocation(id)` API call is made.
4. On success: toast "The location has been marked as primary."
5. On failure: attempts `fetchLocations()` to get a fresh server state. If that also fails, restores the pre-optimistic snapshot and shows an error toast.
6. During the operation, `settingPrimary` state replaces the star with a spinner (`ti-loader-2`).

### Column Customization Modal

- Opened via "Manage Columns" button.
- Fixed rows for Name (top) and Action (bottom), both shown with lock icon and "Fixed" badge, non-interactive.
- Sortable rows for all other columns using `@dnd-kit` drag-and-drop (`PointerSensor` + `KeyboardSensor`).
- Column search filters the displayed rows.
- Changes are applied only when "Save" is clicked (draft state: `draftOrder`, `draftVisible`).

### Error State

When `fetchLocations()` fails, a `loadError` string is stored and an `alert-danger` banner with a "Retry" button is shown inside the card body.

### Toast Notifications

Centered at the top of the viewport (`position: fixed; top: 0; start: 50%`). Green circle with checkmark for success, red circle with X for error. Auto-dismisses after 4 seconds. Timer is cleared on unmount to prevent memory leaks.

---

## Page 2 — Location Overview

**File:** `resources/js/feature-module/Pages/inventory/locations/locationOverview.tsx`

### Layout

Full-viewport two-pane layout (`height: calc(100vh - 57px)`, `overflow: hidden`):

- **Left panel (340px, `d-none d-xl-flex`):** locations tree/list — visible only on xl+ screens.
- **Right panel (flex: 1):** independently scrollable detail area.

### Left Panel

**Search & filter bar (sticky top):**
- Text input with search icon and clear (×) button.
- Filter dropdown button — shows a red dot indicator when a non-"all" filter is active.
- Filter options: "Active Locations" and "Deleted Locations" (toggled via `listFilter` state).

**Location tree (active/all mode):**
- Built from `allLocations` via `useMemo` into a recursive `TreeNode` structure.
- Root nodes show a chevron expand/collapse button; child nodes show a circle dot connector.
- Active item highlighted with `#fff1f0` background and red text/border.
- Connector lines drawn with absolute `<div>` elements (upper stub + lower continuation based on `isLast`).
- Each row has a 3-dot actions dropdown: Edit, Add Sub-Location, Delete.
- Primary star shown as amber SVG for `is_primary` locations.
- On click, navigates to `/locations/:id`.

**Deleted locations mode:**
- Fetched lazily on first filter switch to "deleted" (with `deletedLocationsCache` for subsequent accesses).
- Flat list (no tree), dimmed opacity for icons.
- Each row has a "Restore" button (red pill style).
- Loading spinner during initial fetch.

**Search in left panel:**
- When search text is present, switches to flat filtered results (searches `name` only).
- Works in both active and deleted modes.

**Auto-navigation:**
- On filter change, navigates to the first visible location in the new view.
- Uses `pendingDeletedNav` ref to handle the case where deleted locations haven't loaded yet.

**Auto-expand:**
- All parent nodes (those with children) are auto-expanded on load via `useEffect` that computes `withChildren` set.

**Auto-scroll:**
- Active item is scrolled into view with `scrollIntoView({ block: "center", behavior: "instant" })` after a 50ms delay whenever `id` or `allLocations` changes.

### Right Panel — Header

- 56×56 logo/icon.
- Name with primary star (SVG), status badge (Active/Inactive with colored dot, or "Deleted" badge), Type badge, Level badge (1 = no parent, 2 = has parent).
- **Actions dropdown** (hidden if location is deleted): Edit, Add Sub-Location, Make Primary (hidden if already primary), Delete.
- **Restore button** (shown instead of Actions when location is deleted).
- **Refresh button:** icon button with spinning animation (`spin-animation` class), protected by `refreshingRef` to prevent concurrent calls.
- **Close button:** navigates to `/locations`.

### Right Panel — Tabs

Pill-style tab switcher. Two tabs:

1. **Overview** — location details.
2. **History** — paginated audit log.

Tab key can be pre-selected via React Router navigation state (`{ tab: "history" }`).

### Overview Tab

**Location Information card:**
- 2-column grid layout using `LocInfoRow` component.
- Left column: Type (badge), Parent Location (clickable link), Status (badge), Primary Location (Yes/No).
- Right column: Phone, Logo type, Created By.
- Full-width bottom row: Created On (date + time in `en-IN` locale).

**Address card:**
- Displays address parts as stacked lines (attention, street1, street2, city+pincode, state decoded, country decoded).
- Shows "No address provided." when empty.
- **"View on Map" button** — builds a Google Maps search query from all address parts (including attention, streets, city, pin code, decoded state, decoded country), URL-encoded, opened in a new tab with `noopener,noreferrer`.

**Transaction Series card:**
- Shows default series name as a link (navigates to series detail page) or "Default Transaction Series" text.
- Subtitle: "Applied across Sales, Purchases & Inventory".

**Last Updated footer:**
- Inline pill (`#f8f9fa` background, `#e9ecef` border).
- Displays `updated_at` with fallback to `created_at` when `updated_at` is null.

### History Tab

- Paginated audit log fetched from `/api/location-audit-logs/:id` via `fetchLocationAuditLogs`.
- Cached per `(locationId, page)` key in module-level `auditCache` Map — no re-fetch on repeated tab switches.
- **Timestamp normalization:** backend timestamps have no timezone info (`"YYYY-MM-DD HH:MM:SS"`). The component detects the absence of a timezone indicator using `/Z$|[+-]\d{2}:\d{2}$/` and appends `'T'` + `'Z'` to treat the value as UTC, preventing 5.5h IST offset.
- **Timeline layout:** left-aligned vertical line (`#e9ecef`, 2px wide, position absolute). Each audit entry has a circle icon absolutely centered to its card.
- **Supported events:** created, updated, deleted, restored, child_deleted, child_restored.
- **Updated event diff:** shows a table of changed fields with strikethrough old value and highlighted new value. Fields skipped: `updated_at`, `created_at`, `deleted_at`, `remember_token`, `email_verified_at`. Address sub-fields are diffed individually.
- **Human-readable field labels:** `FIELD_LABELS` and `ADDR_LABELS` maps convert raw keys to display names. Boolean/enum values are decoded (e.g. `is_active: 1` → "Active").
- **child_deleted / child_restored events:** show which sub-location was affected in a red pill.
- **Pagination:** prev/next buttons, page X of Y counter, total records count. Pagination controls hidden when only one page.
- **Actor footer:** shows user initial avatar + name or email.

### Confirmation Dialog

Custom modal (`ConfirmDialog`) used for Delete, Restore, Make Primary actions:
- Backdrop with blur (`rgba(15,23,42,0.45)`, `backdrop-filter: blur(2px)`).
- Icon circle (configurable color/bg/icon).
- Title + message.
- Cancel + Confirm buttons.
- `busy` state disables both buttons and shows spinner on the confirm button during async operation.
- Closing by clicking backdrop is blocked while `busy`.

### Delete Flow

1. Calls `collectDescendants()` (frontend BFS) to identify all descendants.
2. Confirms with dialog showing count of sub-locations that will also be deleted.
3. On confirm: `destroyLocation(targetId)`.
4. On success: removes the deleted location and all descendants from `allLocations`; adds them (with `deleted_at: now()`) to `deletedLocations`; invalidates their audit cache entries; invalidates parent's audit cache.
5. If current view is among the deleted, navigates to parent → first remaining location → `/locations` (in that priority order) after 600ms.

### Restore Flow

1. Shows confirmation dialog noting sub-locations will also be restored.
2. Calls `restoreLocation(targetId)`.
3. On success: removes all restored IDs from `deletedLocations`; adds them back to `allLocations` with `deleted_at: null`; invalidates audit caches for all restored IDs and their parent.
4. If no deleted locations remain and filter is "deleted", switches filter to "active".

### Make Primary Flow

1. Shows confirmation with current primary's name in message.
2. Calls `setPrimaryLocation(id)`.
3. On success: updates `location.is_primary`, updates all `allLocations` entries, updates `locationsCache`.

### Stale Fetch Guard

`detailFetchRef` is a ref counter incremented on every `id` change. Async fetch responses are discarded if `token !== detailFetchRef.current`, preventing stale responses from rapid navigation overwriting newer data.

---

## Page 3 — Add / Edit Location

**File:** `resources/js/feature-module/Pages/inventory/locations/location.tsx`

### Page Header

`PageHeader` with:
- Dynamic title: "Add Location" / "Edit Location".
- No badge, no export.
- Close button (calls `goBack()` — `navigate(-1)` with fallback to `/`).
- Functional Refresh button: clears all 3 module-level option caches (`locationsOptionsCache`, `seriesEntriesCache`, `allUsersCache`) and re-fetches in parallel using `Promise.all`. Does not reset any form field values.

### Initial Data Load

Single `useEffect` runs once on mount. Fetches in parallel:
- `fetchLocations({ active_only: true })` — parent location dropdown options.
- `fetchSeries()` — transaction series dropdown options.
- `fetchUsers({ all: true })` — users for location access panel.
- `fetchLocation(id)` (edit mode only) — current location data to pre-fill the form.

Cache hits (`locationsOptionsCache`, `seriesEntriesCache`, `allUsersCache`) resolve instantly without network calls. Errors for each source are shown as individual toasts without blocking the rest of the form.

**Edit mode self-exclusion:** after loading locations, the current location's own ID is filtered out of the parent dropdown options to prevent circular parent assignment.

**Add Sub-Location flow:** when navigated via "Add Sub-Location" from the overview page, `routerState.parentId` and `routerState.parentName` pre-fill the parent location and check the "This is a Child Location" checkbox.

### Form Fields

**Location Type (required):**
- Two clickable radio cards: "Business Location" and "Warehouse Only Location".
- Active card has red border + faint red background + filled radio dot.
- Switching type clears type-specific validation errors.

**Logo (Business only):**
- Dropdown: "Same as Organization Logo" / "Upload a New Logo".
- When "Upload a New Logo" is selected: 240×200 upload area with preview.
- File input is hidden; clicking the label triggers it.
- File cleared between clicks (`e.target.value = ""`).
- **Blob URL lifecycle:** `URL.createObjectURL` on new file selection; previous blob revoked immediately. Blob is also revoked on the clear button click and on component unmount via `useEffect` cleanup.
- File size limit: 1 MB (checked client-side before creating the blob URL).
- Accepted formats: any `image/*`.

**Name (required):**
- `maxLength={100}`, `is-invalid` class on validation error, `invalid-feedback` message.
- Error cleared on change.

**Parent Location:**
- Business type: shown only when "This is a Child Location" checkbox is checked. Required when checked.
- Warehouse type: always shown and required.
- Options from `availableLocations` (excludes self in edit mode).

**Address fields:**
- Attention: `maxLength={100}`
- Street 1, Street 2: `maxLength={255}`
- City: `maxLength={100}`
- Pin Code: `maxLength={10}`
- Country: CommonSelect dropdown (India, US, UK, UAE, Singapore). Changing country resets state.
- State: CommonSelect filtered by selected country (`stateOptions[country.value]`).
- Phone: `maxLength={20}`
- Fax: `maxLength={20}`

**Website URL:**
- `type="url"`, `maxLength={500}`.
- Client-side validation: must start with `http://` or `https://` (case-insensitive regex `/^https?:\/\//i`).
- `is-invalid` class + `invalid-feedback` message. Error cleared on change.

**Transaction Number Series (Business only, required):**
- `SeriesField` component — react-select multi-select with custom `MenuList` that appends a "+ Add Series" button.
- `onMouseDown` + `e.preventDefault()` on the "+ Add Series" button prevents the select menu from closing before the action triggers.
- Validation error shown below; cleared when selection changes.

**Default Transaction Number Series (Business only, required):**
- Single-select `CommonSelect` from the same series entries list.

**Add Series Modal:**
- Opens inline within the page (react-bootstrap Modal, `size="xl"`, scrollable).
- Series name field with Enter key shortcut.
- Module settings table (10 modules: Invoice, Sales Order, Purchase Order, etc.) with per-module prefix, starting number, restart numbering (None / Every Month / Every Year), and a live preview column.
- Prefix supports dynamic tokens (%FYS_YYYY%, %FYE_YY%, %TY_YYYY%, %TD%, %TM%) inserted via a portal dropdown with flyout sub-menus. Portal positions the dropdown using `getBoundingClientRect()` and adjusts for viewport edge collision.
- On save: new series is appended to `seriesEntries` + cache, automatically pre-selected in the multi-select field.
- Modal state fully resets when closed (`useEffect` on `show`).

**Location Access panel:**
- Header area with count badge and description text.
- User search input with portal dropdown (positioned via `getBoundingClientRect()`). Dropdown filters users already added. Scroll anywhere closes the dropdown (`window.addEventListener("scroll", close, true)`). Blur closes with 150ms delay to allow click on dropdown items.
- User list table: avatar (image or initial), name, email, read-only role input, remove button.
- Role field is read-only ("Staff" default). Roles cannot be changed from this UI.
- `addAccessUser` prevents duplicate additions by checking existing IDs.

### Validation

Runs on Save button click. Required fields:
- Name (non-empty after trim)
- Website URL format (if provided)
- Parent Location (if warehouse type, or if business + child checkbox checked)
- Transaction Number Series (if business type)
- Default Transaction Number Series (if business type)

On failure: inline field errors set (`errors` state) AND a toast "Please fill in all required fields before saving."

### Save Flow

1. `validate()` — inline errors + toast on failure.
2. If `logo === "custom"` and a new `logoFile` is selected: `uploadLocationLogo(file)` first. On upload failure, aborts save.
3. Builds payload including all form state.
4. Calls `storeLocation(payload)` (create) or `updateLocation(id, payload)` (edit).
5. On success: success toast, navigate after 1500ms to overview (edit) or back (create).
6. On failure: error toast with server message.
7. `finally`: clears `saving` state.

### Sticky Footer Bar

Always visible at the bottom of the viewport (`position: sticky; bottom: 0; z-index: 100`). Contains Save/Update button (with spinner during save) and Cancel button.

---

## API Service Layer

**File:** `resources/js/core/services/locationApi.ts`

All requests go through Axios. Base URL: `/api/locations`.

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `fetchLocations(params?)` | GET | `/api/locations` | List all locations. Params: `active_only`, `type`, `trashed` |
| `fetchLocation(id)` | GET | `/api/locations/:id` | Single location with full relations |
| `storeLocation(payload)` | POST | `/api/locations` | Create new location |
| `updateLocation(id, payload)` | PUT | `/api/locations/:id` | Update existing location |
| `destroyLocation(id)` | DELETE | `/api/locations/:id` | Soft-delete location |
| `setPrimaryLocation(id)` | POST | `/api/locations/:id/set-primary` | Set as primary |
| `restoreLocation(id)` | POST | `/api/locations/:id/restore` | Restore soft-deleted |
| `uploadLocationLogo(file)` | POST | `/api/locations/upload-logo` | Upload logo image (multipart) |

**Error handling:** all functions catch `AxiosError` and extract `err.response.data.message`. Non-Axios errors return "Network error." All return a discriminated union (`success: true | false`).

**TypeScript interfaces:**
- `LocationListItem` — full location shape including optional `address`, `parent`, `default_txn_series`, `created_by`, `deleted_at`, `updated_at`.
- `StoreLocationPayload` — create/update payload shape with optional nested `address` and `access_users`.

---

## Backend — Model

**File:** `app/Models/Location.php`

**Traits:** `SoftDeletes` — enables soft deletion via `deleted_at` column.

**Fillable fields:** `name`, `type`, `parent_id`, `logo_type`, `logo_path`, `website_url`, `primary_contact_id`, `txn_series_id`, `default_txn_series_id`, `address`, `access_users`, `is_active`, `is_primary`, `created_by`.

**Casts:**
- `address` → `array` (stored as JSON)
- `access_users` → `array` (stored as JSON)
- `is_active` → `boolean`
- `is_primary` → `boolean`

**Relationships:**
- `parent()` → `BelongsTo(Location, parent_id)`
- `children()` → `HasMany(Location, parent_id)`
- `txnSeries()` → `BelongsTo(TransactionSeries, txn_series_id)`
- `defaultTxnSeries()` → `BelongsTo(TransactionSeries, default_txn_series_id)`
- `createdBy()` → `BelongsTo(User, created_by)`

**Query scopes:**
- `scopeActive` — filters `is_active = true`
- `scopeOfType($type)` — filters by `type`, no-op if null
- `scopeSearch($term)` — `LIKE %term%` on `name`, no-op if null

---

## Backend — Validation Requests

### StoreLocationRequest

| Field | Rules |
|---|---|
| `name` | required, string, min:1, max:255 |
| `type` | required, in:business,warehouse |
| `parent_id` | nullable, integer, exists:locations,id |
| `is_active` | boolean |
| `logo_type` | nullable, in:org,custom |
| `logo_path` | nullable, string, max:500 |
| `website_url` | nullable, url, max:500 |
| `primary_contact_id` | nullable, integer, exists:users,id |
| `txn_series_id` | nullable, integer, exists:transaction_series,id |
| `default_txn_series_id` | nullable, integer, exists:transaction_series,id |
| `address` | nullable, array |
| `address.attention` | nullable, string, max:255 |
| `address.street1` | nullable, string, max:255 |
| `address.street2` | nullable, string, max:255 |
| `address.city` | nullable, string, max:100 |
| `address.pin_code` | nullable, string, max:20 |
| `address.country` | nullable, string, max:10 |
| `address.state` | nullable, string, max:10 |
| `address.phone` | nullable, string, max:30 |
| `address.fax` | nullable, string, max:30 |
| `access_users` | nullable, array |
| `access_users.*.user_id` | required, integer, exists:users,id |
| `access_users.*.role` | required, string, max:50 |

**Custom validator:** `withValidator` checks for duplicate `user_id` entries in `access_users`.

**Upload validation** (handled separately in `uploadLogo()`): `required|image|mimes:jpg,jpeg,png,svg,webp|max:2048`.

### UpdateLocationRequest

- Identical rules but all top-level fields prefixed with `sometimes|` (partial update support).
- **Extra guard in `withValidator`:** checks `parent_id !== route id` to prevent a location being set as its own parent.
- Duplicate `user_id` check same as Store.

---

## Backend — Controller

**File:** `app/Http/Controllers/Api/LocationController.php`

### index()

Fetches locations with explicit column selection (no `SELECT *`) and eager loads `parent`, `createdBy`, `defaultTxnSeries`. Supports query params: `search`, `type`, `active_only`, `trashed`. Returns flat JSON array (tree is built client-side).

### store()

Sets `created_by` from the authenticated user. Creates the location and writes an audit log entry (`created` event). Returns 201 with the created location (with eager-loaded relations).

### show()

Uses `withTrashed()` so deleted locations are still accessible for restore workflows. Eager loads `parent`, `children`, `defaultTxnSeries`, `createdBy`.

### update()

Captures `$old = $location->toArray()` before update for audit diff. Writes `updated` audit log with old and new arrays. Returns fresh model.

### destroy()

1. Calls `collectDescendantIds($id)` — BFS traversal collecting the root and every descendant ID using `withTrashed()->where('parent_id', $parentId)->pluck('id')`.
2. For each ID: writes `deleted` audit log, then `$loc->delete()` (soft delete).
3. Writes a `child_deleted` audit entry on the parent if applicable.

### setPrimary()

Wraps in `DB::transaction()`: sets `is_primary = false` for all locations, then `is_primary = true` for the target. Atomically prevents two locations having `is_primary = true` simultaneously. Writes `set_primary` audit log.

### restore()

Uses `collectDescendantIds($id, onlyTrashed: true)` — same BFS but scoped to `onlyTrashed()`. Restores each location and writes `restored` audit log. Writes `child_restored` on the parent. Returns `restored_ids` array so the frontend can update its deleted/active lists.

### uploadLogo()

Validates MIME type and file size (max 2048 KB). Stores to `storage/app/public/locations/logos/`. Returns the storage path.

### Audit Helper

`audit()` creates an `AuditLog` record with: `auditable_type`, `auditable_id`, `event`, `user_id`, `ip_address`, `user_agent`, `old_values` (JSON), `new_values` (JSON). Audit writes are always wrapped in `try/catch(Throwable)` so a failed audit never breaks the main operation.

### Logging

`Log::info()` written for create, update, delete operations. All `catch(Throwable $e)` blocks call `$this->logException()` and return a generic JSON error response.

---

## Caching Strategy

### Module-Level Caches (React)

Three module-scope variables survive component remounts and are shared across all instances:

| Variable | What it holds | Invalidated by |
|---|---|---|
| `locationsOptionsCache` | `Option[]` for parent dropdown | Refresh button, save success |
| `seriesEntriesCache` | `SeriesEntry[]` for series dropdowns | Refresh button, save success |
| `allUsersCache` | `UserListItem[]` for access panel | Refresh button |

In `locationOverview.tsx`:

| Variable | What it holds | Invalidated by |
|---|---|---|
| `locationsCache` | `LocationListItem[]` for left panel | Refresh, delete, restore, make-primary |
| `deletedLocationsCache` | `LocationListItem[]` for deleted list | Refresh, delete, restore |
| `auditCache` (Map) | `{logs, lastPage, total}` keyed by `"${id}-${page}"` | Refresh, delete, restore |

### Audit Cache Invalidation Details

On delete: all keys matching `"${deletedId}-*"` are removed for the deleted location and all its descendants. The parent's keys (`"${parentId}-*"`) are also cleared since the backend writes a `child_deleted` audit entry there.

On restore: same pattern — all restored IDs' keys removed, plus the parent's keys.

On refresh: `auditCache.clear()` — full clear.

---

## Data Flow

### Location List Load

```
mount → load() → fetchLocations() → setLocations(res.data) → buildTree() → Datatable
```

### Location Overview Load

```
mount →
  [parallel]
    fetchLocations() → locationsCache → setAllLocations() → buildTree → left panel
    fetchLocation(id) → setLocation() → right panel detail
  [on history tab open]
    auditCache check → miss → fetchLocationAuditLogs(id, page) → auditCache.set() → timeline
```

### Add/Edit Location Load

```
mount →
  [parallel]
    locationsOptionsCache check → miss → fetchLocations({active_only:true}) → setAvailableLocations (filtered)
    seriesEntriesCache check → miss → fetchSeries() → setSeriesEntries()
    allUsersCache check → miss → fetchUsers({all:true}) → setAllUsers()
    isEdit → fetchLocation(id) → pre-fill all form fields
```

### Save Flow

```
validate() → uploadLocationLogo (if new file) → storeLocation/updateLocation → toast → navigate (1500ms delay)
```

### Timestamp Handling (History Tab)

Backend returns `"YYYY-MM-DD HH:MM:SS"` (no timezone). Frontend normalizes:
```ts
const utcTs = /Z$|[+-]\d{2}:\d{2}$/.test(rawTs) ? rawTs : rawTs.replace(' ', 'T') + 'Z';
const dateObj = new Date(utcTs);
```
This treats all backend timestamps as UTC, preventing timezone offset errors (e.g. IST +5:30 showing times 5.5 hours ahead).

---

## Validation

### Client-Side (location.tsx)

| Field | Rule |
|---|---|
| Name | Non-empty after `.trim()` |
| Website URL | If non-empty: must match `/^https?:\/\//i` |
| Parent Location | Required if: warehouse type, or business + child checkbox checked |
| Transaction Series | Required if business type, at least one selected |
| Default Transaction Series | Required if business type |

All validation runs in the `validate()` function before any async operation. Each field independently clears its error on change via `clr(key)`.

On validation failure: inline `is-invalid` + `invalid-feedback` shown per field, AND a consolidated toast notification shown at the top.

### Server-Side (StoreLocationRequest / UpdateLocationRequest)

- `name`: required, max 255 chars.
- `type`: must be `business` or `warehouse`.
- `parent_id`: must exist in `locations` table.
- `website_url`: Laravel `url` rule (must be a valid URL).
- All ID references (`txn_series_id`, `default_txn_series_id`, `primary_contact_id`, `access_users.*.user_id`) validated via `exists:` rules.
- Duplicate `user_id` in `access_users`: caught in `withValidator()`.
- Self-parent guard (update only): `parent_id !== route id` checked in `withValidator()`.
- Logo upload: MIME type (jpg, jpeg, png, svg, webp) and 2 MB max enforced server-side.

---

## Error Handling

### Frontend

| Scenario | Handling |
|---|---|
| List load failure | `loadError` state → inline alert banner with Retry button |
| Detail load failure | `error` state → `alert-danger` block replacing the right panel |
| Left panel list load failure | Toast "Failed to load locations list." |
| Audit log load failure | Toast "Failed to load activity history." + spinner cleared |
| Audit log network error | Toast "Network error loading activity history." |
| Form save failure | Toast with server error message |
| Logo upload failure | Toast with server message, save aborted |
| Set primary failure | Attempt full refresh; if refresh also fails, restore snapshot + toast |
| Delete failure | Toast "Failed to delete location." |
| Restore failure | Toast "Failed to restore location." |
| Make primary failure | Toast with server message |
| Refresh failure | Toast "Network error during refresh." |
| Users load failure | Toast "Failed to load users for location access." |
| Series load failure | Toast with server message |
| Locations dropdown failure | Toast with server message, empty options used |

All toast timers are stored in `toastTimerRef` and cleared on component unmount to prevent state updates on unmounted components.

### Backend

All controller actions are wrapped in `try/catch(Throwable)`. Specific 404 handling for `ModelNotFoundException` returns a clean 404 JSON response. All other exceptions are logged via `$this->logException()` and return a 500 with a generic message. Audit failures never propagate (wrapped in their own `try/catch`).

---

## Performance

### Network

- **All dropdown data loaded in one parallel `Promise.all`** on mount — avoids waterfall fetches.
- **Module-level caches** prevent re-fetching on remounts and navigation within the location module. Cache is only invalidated explicitly (refresh button or after mutations).
- **Audit log caching per page** prevents re-fetching when switching tabs or navigating back to the same page+location.
- **Lazy loading deleted locations** — only fetched when the "Deleted" filter is selected.
- **`active_only: true`** parameter on the parent location dropdown fetch excludes inactive locations from the result set.
- **Explicit `SELECT` columns** in `index()` — no `SELECT *`, avoids over-fetching.
- **Eager loading** in `index()` and `show()` — prevents N+1 queries for `parent`, `defaultTxnSeries`, `createdBy`.

### Frontend Rendering

- **`useMemo`** used for: tree building, filtered tree, grid search results, column definitions, filtered draft columns in the modal, `treeBase` + `tree` + `filteredFlatLocations` in overview.
- **`useCallback`** used for: `handleRefresh`, `handleSetPrimary`, `handleResize`, `openUserDrop`.
- **Tree rendering** is recursive but capped by real data depth (practical max 2 levels).
- **Grid "Load More"** pattern (`gridPage` state + `slice(0, gridPage)`) renders only 12 cards initially, avoiding DOM bloat for large location counts.
- **`detailFetchRef` counter** discards stale responses from rapid navigation — no redundant state updates.
- **`refreshingRef`** ref guard prevents concurrent refresh calls without triggering a re-render.
- **Column widths persisted to `localStorage`** — no re-computation on re-render, no additional API calls.

### Memory

- **Blob URL cleanup:** `logoBlobRef` tracks the active preview blob URL. It is revoked on new file selection, on clear button click, and on component unmount (`useEffect` cleanup).
- **Toast timer cleanup:** `toastTimerRef` is cleared on unmount in all three pages.
- **Resize event listeners** are added and removed per drag interaction (`document.removeEventListener` in `onMouseUp`).
- **Scroll listener for user dropdown** is added with `{ passive: true }` equivalent and removed on `userDropOpen` change.

---

## Security

### Authentication

All API endpoints require an authenticated user (Laravel Sanctum / session guard). `$request->user()->id` is used to record `created_by` and audit `user_id` — the frontend never sends a user ID for these fields.

### Input Validation (Server-Side)

- All inputs validated in Form Request classes before reaching the controller.
- `exists:` rules on all foreign keys prevent orphaned references.
- `url` rule on `website_url` prevents non-URL strings from being stored.
- `mimes:` + `max:` on logo upload prevent non-image and oversized file uploads.
- `type` field restricted to `in:business,warehouse` enum.
- `logo_type` restricted to `in:org,custom`.
- Duplicate access users caught in `withValidator()`.
- Self-parent circular reference caught in `withValidator()` on update.

### Audit Trail

Every mutation (create, update, delete, restore, set-primary, access-update) writes an `AuditLog` record with: `user_id`, `ip_address`, `user_agent`, `old_values`, `new_values`. This provides a full forensic trail of all changes.

### File Upload

- MIME type whitelist enforced server-side (`jpg, jpeg, png, svg, webp`).
- Max size enforced server-side (2 MB via Laravel `max:2048`).
- Max size also enforced client-side (1 MB check before blob creation) for immediate user feedback.
- Files stored under `storage/app/public/locations/logos/` — not in a web-accessible location by default; served via Laravel's `storage:link`.
- File input value cleared between selections (`e.target.value = ""`) to allow re-selecting the same file.

### External Links

- "View on Map" opens Google Maps in a new tab with `rel="noopener noreferrer"`, preventing the new tab from accessing the opener's `window` object.
- Address is URL-encoded via `encodeURIComponent()` before appending to the Google Maps URL.

### XSS Prevention

- All user content rendered via React's JSX (textContent, not `dangerouslySetInnerHTML`), so React handles escaping automatically.
- Audit log field values formatted through `fmtAuditVal()` which returns plain strings rendered as text nodes.

### Data Exposure

- `index()` uses explicit `SELECT` columns — does not return `website_url`, `access_users`, `txn_series_id`, or other sensitive columns in the list endpoint.
- `show()` returns the full model but only to authenticated users viewing a specific location.

### Soft Delete Integrity

- `destroyLocation()` performs cascading soft-delete on all descendants using BFS before deleting the parent — no orphaned child records left pointing to a deleted parent.
- `restoreLocation()` cascade-restores using `onlyTrashed()` BFS — only restores records that were soft-deleted, not pre-existing active children.
- `setPrimary()` uses `DB::transaction()` — atomically ensures only one location has `is_primary = true` at any time, even under concurrent requests.
