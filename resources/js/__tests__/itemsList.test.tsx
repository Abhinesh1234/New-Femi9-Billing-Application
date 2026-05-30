/**
 * Unit tests — Items List page
 * Covers both admin (super_admin) and party portal login scenarios.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router";
import authReducer, { type AuthUser } from "../core/redux/authSlice";
import type { ItemListRecord } from "../core/services/itemApi";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_ITEMS: ItemListRecord[] = [
  {
    id: 1, name: "Widget A", sku: "WGT-001", item_type: "goods", form_type: "standard",
    selling_price: "100.00", cost_price: "60.00", track_inventory: true,
    reorder_point: 5, unit: "pcs", image: null, refs: null,
    is_composite: false, composite_type: null, components: [],
    created_at: "2024-01-03T00:00:00.000Z",
  },
  {
    id: 2, name: "Service B", sku: "SVC-001", item_type: "service", form_type: "standard",
    selling_price: "500.00", cost_price: "200.00", track_inventory: false,
    reorder_point: null, unit: null, image: null, refs: null,
    is_composite: false, composite_type: null, components: [],
    created_at: "2024-01-02T00:00:00.000Z",
  },
  {
    id: 3, name: "Alpha Goods", sku: "ALG-001", item_type: "goods", form_type: "standard",
    selling_price: "250.00", cost_price: "150.00", track_inventory: true,
    reorder_point: 10, unit: "kg", image: null, refs: null,
    is_composite: false, composite_type: null, components: [],
    created_at: "2024-01-01T00:00:00.000Z",
  },
];

const ADMIN_USER: AuthUser = {
  id: 1, name: "Super Admin", phone: null, email: "admin@test.com", avatar: null,
  user_type: "super_admin", role_id: null, permissions: null,
};

const PARTY_USER: AuthUser = {
  id: 10, name: "Party User", phone: null, email: "party@test.com", avatar: null,
  user_type: "party", role_id: null, permissions: {},
  party_id: 5, party_code: "P001", party_name: "Test Party",
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../core/cache/itemCache", () => ({
  readItemList:     vi.fn(() => MOCK_ITEMS),
  getItemList:      vi.fn(() => Promise.resolve(MOCK_ITEMS)),
  bustAllItemCache: vi.fn(),
}));

vi.mock("../core/cache/mutationEvents", () => ({
  onMutation:  vi.fn(() => () => {}),
  emitMutation: vi.fn(),
}));

vi.mock("../core/hooks/useWindowFocusRefresh", () => ({
  useWindowFocusRefresh: vi.fn(),
}));

vi.mock("../core/services/itemApi", () => ({
  fetchStockTotals: vi.fn(() =>
    Promise.resolve({ success: true, data: { "1": "25.00", "3": "10.00" } })
  ),
}));

vi.mock("../core/utils/exportUtils", () => ({
  exportToPdfPrint:  vi.fn(),
  exportToExcelFile: vi.fn(() => Promise.resolve()),
}));

vi.mock("../components/footer/footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("../components/page-header/pageHeader", () => ({
  default: ({ title, badgeCount }: { title: string; badgeCount?: number }) => (
    <div data-testid="page-header">
      <span data-testid="page-title">{title}</span>
      {badgeCount !== undefined && (
        <span data-testid="badge-count">{badgeCount}</span>
      )}
    </div>
  ),
}));

/**
 * Datatable stub: renders each record as a table row so tests can verify
 * item presence and order. Captures columns for column-visibility tests.
 */
let capturedColumns: any[] = [];

vi.mock("../components/dataTable", () => ({
  default: ({ dataSource, columns }: any) => {
    capturedColumns = columns ?? [];
    return (
      <table data-testid="datatable">
        <tbody>
          {(dataSource ?? []).map((record: any) => (
            <tr key={record.id} data-testid={`item-row-${record.id}`}>
              <td data-testid={`item-name-${record.id}`}>{record.name}</td>
              <td data-testid={`item-type-${record.id}`}>{record.item_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

vi.mock("../components/dataTable/dataTableSearch", () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext:     ({ children }: any) => <>{children}</>,
  closestCenter:  vi.fn(),
  PointerSensor:  vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor:      vi.fn(),
  useSensors:     vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext:             ({ children }: any) => <>{children}</>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: () => ({
    attributes: {}, listeners: {}, setNodeRef: vi.fn(),
    transform: null, transition: null, isDragging: false,
  }),
  arrayMove: (arr: any[], from: number, to: number) => {
    const res = [...arr];
    const [item] = res.splice(from, 1);
    res.splice(to, 0, item);
    return res;
  },
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: vi.fn(() => "") } },
}));

// Static import — vi.mock() is hoisted above imports by Vitest, so mocks are
// already registered before this module is evaluated.
import ItemsList from "../feature-module/Pages/inventory/items/itemsList";

// ── Test helpers ──────────────────────────────────────────────────────────────

function buildStore(user: AuthUser) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user, token: "test-token", isAuthenticated: true, isLoading: false },
    },
  });
}

async function renderItemsList(user: AuthUser) {
  const store = buildStore(user);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    </Provider>
  );
  // Flush microtasks from async effects (fetchStockTotals etc.)
  await act(async () => {});
}

// ── Admin tests ───────────────────────────────────────────────────────────────

describe("ItemsList — admin (super_admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedColumns = [];
    localStorage.clear();
  });

  it("renders the page header with title 'Items'", async () => {
    await renderItemsList(ADMIN_USER);
    expect(screen.getByTestId("page-title")).toHaveTextContent("Items");
  });

  it("shows a badge with the total item count (3)", async () => {
    await renderItemsList(ADMIN_USER);
    expect(screen.getByTestId("badge-count")).toHaveTextContent("3");
  });

  it("renders all 3 items in the table", async () => {
    await renderItemsList(ADMIN_USER);
    expect(screen.getByTestId("item-row-1")).toBeTruthy();
    expect(screen.getByTestId("item-row-2")).toBeTruthy();
    expect(screen.getByTestId("item-row-3")).toBeTruthy();
  });

  it("displays each item's name in the table", async () => {
    await renderItemsList(ADMIN_USER);
    expect(screen.getByTestId("item-name-1")).toHaveTextContent("Widget A");
    expect(screen.getByTestId("item-name-2")).toHaveTextContent("Service B");
    expect(screen.getByTestId("item-name-3")).toHaveTextContent("Alpha Goods");
  });

  it("shows the 'New Item' button", async () => {
    await renderItemsList(ADMIN_USER);
    expect(screen.getByText("New Item")).toBeTruthy();
  });

  it("shows the search input", async () => {
    await renderItemsList(ADMIN_USER);
    expect(screen.getByTestId("search-input")).toBeTruthy();
  });

  it("shows the 'Manage Columns' button in list view", async () => {
    await renderItemsList(ADMIN_USER);
    expect(screen.getByText("Manage Columns")).toBeTruthy();
  });

  it("includes 'Purchase Rate' in the Manage Columns modal (admin only)", async () => {
    await renderItemsList(ADMIN_USER);
    fireEvent.click(screen.getByText("Manage Columns"));
    await waitFor(() => expect(screen.getByText("Customize Columns")).toBeTruthy());
    expect(screen.getByText("Purchase Rate")).toBeTruthy();
  });

  it("shows all other column options in the Manage Columns modal", async () => {
    await renderItemsList(ADMIN_USER);
    fireEvent.click(screen.getByText("Manage Columns"));
    await waitFor(() => expect(screen.getByText("Customize Columns")).toBeTruthy());
    expect(screen.getByText("SKU")).toBeTruthy();
    expect(screen.getByText("Type")).toBeTruthy();
    expect(screen.getByText("Selling Price")).toBeTruthy();
    expect(screen.getByText("Unit")).toBeTruthy();
  });

  it("filter dropdown buttons are present in the DOM", async () => {
    await renderItemsList(ADMIN_USER);
    // Buttons are inside <ul><li> inside .dropdown-menu — select by text content
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    expect(allBtns.some((b) => b.textContent?.includes("Goods"))).toBe(true);
    expect(allBtns.some((b) => b.textContent?.includes("Services"))).toBe(true);
    expect(allBtns.some((b) => b.textContent?.includes("Deleted Items"))).toBe(true);
  });

  it("filtering by 'Goods' shows only goods items (ids 1 and 3)", async () => {
    await renderItemsList(ADMIN_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const goodsBtn = allBtns.find((b) => b.textContent?.trim() === "Goods")!;
    fireEvent.click(goodsBtn);
    await waitFor(() => {
      expect(screen.getByTestId("item-row-1")).toBeTruthy(); // Widget A — goods
      expect(screen.getByTestId("item-row-3")).toBeTruthy(); // Alpha Goods — goods
      expect(screen.queryByTestId("item-row-2")).toBeNull(); // Service B — hidden
    });
  });

  it("filtering by 'Services' shows only service items (id 2)", async () => {
    await renderItemsList(ADMIN_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const servicesBtn = allBtns.find((b) => b.textContent?.trim() === "Services")!;
    fireEvent.click(servicesBtn);
    await waitFor(() => {
      expect(screen.getByTestId("item-row-2")).toBeTruthy();  // Service B — service
      expect(screen.queryByTestId("item-row-1")).toBeNull();  // Widget A — hidden
      expect(screen.queryByTestId("item-row-3")).toBeNull();  // Alpha Goods — hidden
    });
  });

  it("badge count updates to 2 when filtering by Goods", async () => {
    await renderItemsList(ADMIN_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const goodsBtn = allBtns.find((b) => b.textContent?.trim() === "Goods")!;
    fireEvent.click(goodsBtn);
    await waitFor(() =>
      expect(screen.getByTestId("badge-count")).toHaveTextContent("2")
    );
  });

  it("badge count updates to 1 when filtering by Services", async () => {
    await renderItemsList(ADMIN_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const servicesBtn = allBtns.find((b) => b.textContent?.trim() === "Services")!;
    fireEvent.click(servicesBtn);
    await waitFor(() =>
      expect(screen.getByTestId("badge-count")).toHaveTextContent("1")
    );
  });

  it("sort by Name A–Z renders Alpha Goods (id=3) before Widget A (id=1)", async () => {
    await renderItemsList(ADMIN_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const nameAZBtn = allBtns.find((b) => b.textContent?.includes("Name A"))!;
    fireEvent.click(nameAZBtn);
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      const ids = rows.map((r) => r.getAttribute("data-testid")).filter(Boolean);
      expect(ids.indexOf("item-row-3")).toBeLessThan(ids.indexOf("item-row-1"));
    });
  });

  it("sort by Name Z–A renders Widget A (id=1) before Alpha Goods (id=3)", async () => {
    await renderItemsList(ADMIN_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const nameZABtn = allBtns.find((b) => b.textContent?.includes("Name Z"))!;
    fireEvent.click(nameZABtn);
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      const ids = rows.map((r) => r.getAttribute("data-testid")).filter(Boolean);
      expect(ids.indexOf("item-row-1")).toBeLessThan(ids.indexOf("item-row-3"));
    });
  });

  it("sort by Oldest renders Alpha Goods (oldest) before Widget A (newest)", async () => {
    await renderItemsList(ADMIN_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const oldestBtn = allBtns.find((b) => b.textContent?.includes("Oldest"))!;
    fireEvent.click(oldestBtn);
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      const ids = rows.map((r) => r.getAttribute("data-testid")).filter(Boolean);
      expect(ids.indexOf("item-row-3")).toBeLessThan(ids.indexOf("item-row-1"));
    });
  });

  it("shows list/grid view toggle buttons", async () => {
    await renderItemsList(ADMIN_USER);
    expect(screen.getByTitle("List view")).toBeTruthy();
    expect(screen.getByTitle("Grid view")).toBeTruthy();
  });

  it("switching to grid view hides the 'Manage Columns' button", async () => {
    await renderItemsList(ADMIN_USER);
    fireEvent.click(screen.getByTitle("Grid view"));
    await waitFor(() =>
      expect(screen.queryByText("Manage Columns")).toBeNull()
    );
  });

  it("switching to grid view shows item names in card layout", async () => {
    await renderItemsList(ADMIN_USER);
    fireEvent.click(screen.getByTitle("Grid view"));
    await waitFor(() => {
      expect(screen.getByText("Widget A")).toBeTruthy();
      expect(screen.getByText("Service B")).toBeTruthy();
      expect(screen.getByText("Alpha Goods")).toBeTruthy();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("ItemsList — party portal login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedColumns = [];
    localStorage.clear();
  });

  it("renders the page header with title 'Items'", async () => {
    await renderItemsList(PARTY_USER);
    expect(screen.getByTestId("page-title")).toHaveTextContent("Items");
  });

  it("renders all 3 items in the table", async () => {
    await renderItemsList(PARTY_USER);
    expect(screen.getByTestId("item-row-1")).toBeTruthy();
    expect(screen.getByTestId("item-row-2")).toBeTruthy();
    expect(screen.getByTestId("item-row-3")).toBeTruthy();
  });

  it("displays each item's name", async () => {
    await renderItemsList(PARTY_USER);
    expect(screen.getByTestId("item-name-1")).toHaveTextContent("Widget A");
    expect(screen.getByTestId("item-name-2")).toHaveTextContent("Service B");
    expect(screen.getByTestId("item-name-3")).toHaveTextContent("Alpha Goods");
  });

  it("does NOT show the 'New Item' button (party has no create permission)", async () => {
    await renderItemsList(PARTY_USER);
    expect(screen.queryByText("New Item")).toBeNull();
  });

  it("does NOT include 'Purchase Rate' in the Manage Columns modal", async () => {
    await renderItemsList(PARTY_USER);
    fireEvent.click(screen.getByText("Manage Columns"));
    await waitFor(() => expect(screen.getByText("Customize Columns")).toBeTruthy());
    expect(screen.queryByText("Purchase Rate")).toBeNull();
  });

  it("still includes other column options in the Manage Columns modal", async () => {
    await renderItemsList(PARTY_USER);
    fireEvent.click(screen.getByText("Manage Columns"));
    await waitFor(() => expect(screen.getByText("Customize Columns")).toBeTruthy());
    expect(screen.getByText("SKU")).toBeTruthy();
    expect(screen.getByText("Type")).toBeTruthy();
    expect(screen.getByText("Selling Price")).toBeTruthy();
    expect(screen.getByText("Unit")).toBeTruthy();
  });

  it("item type filter still works for party users: Goods only", async () => {
    await renderItemsList(PARTY_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const goodsBtn = allBtns.find((b) => b.textContent?.trim() === "Goods")!;
    fireEvent.click(goodsBtn);
    await waitFor(() => {
      expect(screen.getByTestId("item-row-1")).toBeTruthy();
      expect(screen.getByTestId("item-row-3")).toBeTruthy();
      expect(screen.queryByTestId("item-row-2")).toBeNull();
    });
  });

  it("item type filter works for party users: Services only", async () => {
    await renderItemsList(PARTY_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const servicesBtn = allBtns.find((b) => b.textContent?.trim() === "Services")!;
    fireEvent.click(servicesBtn);
    await waitFor(() => {
      expect(screen.getByTestId("item-row-2")).toBeTruthy();
      expect(screen.queryByTestId("item-row-1")).toBeNull();
      expect(screen.queryByTestId("item-row-3")).toBeNull();
    });
  });

  it("search input is present", async () => {
    await renderItemsList(PARTY_USER);
    expect(screen.getByTestId("search-input")).toBeTruthy();
  });

  it("sort controls are present", async () => {
    await renderItemsList(PARTY_USER);
    // "Newest" appears in both the toggle button and the dropdown item — use getAllByText
    expect(screen.getAllByText("Newest").length).toBeGreaterThan(0);
  });

  it("list/grid view toggle is present", async () => {
    await renderItemsList(PARTY_USER);
    expect(screen.getByTitle("List view")).toBeTruthy();
    expect(screen.getByTitle("Grid view")).toBeTruthy();
  });

  it("sort by Name A–Z renders Alpha Goods before Widget A", async () => {
    await renderItemsList(PARTY_USER);
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("button.dropdown-item"));
    const nameAZBtn = allBtns.find((b) => b.textContent?.includes("Name A"))!;
    fireEvent.click(nameAZBtn);
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      const ids = rows.map((r) => r.getAttribute("data-testid")).filter(Boolean);
      expect(ids.indexOf("item-row-3")).toBeLessThan(ids.indexOf("item-row-1"));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("ItemsList — column visibility logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedColumns = [];
    localStorage.clear();
  });

  it("admin: cost_price column IS included in table columns when enabled", async () => {
    localStorage.setItem(
      "femi9_items_col_visible",
      JSON.stringify(["sku", "item_type", "selling_price", "track_inventory", "reorder_point", "cost_price"])
    );
    await renderItemsList(ADMIN_USER);
    const colKeys = capturedColumns.map((c: any) => c.key);
    expect(colKeys).toContain("cost_price");
  });

  it("party: cost_price column is NOT in table columns even when it is in saved preferences", async () => {
    localStorage.setItem(
      "femi9_items_col_visible",
      JSON.stringify(["sku", "item_type", "selling_price", "track_inventory", "reorder_point", "cost_price"])
    );
    await renderItemsList(PARTY_USER);
    const colKeys = capturedColumns.map((c: any) => c.key);
    expect(colKeys).not.toContain("cost_price");
  });

  it("admin: all default columns are present in the table", async () => {
    await renderItemsList(ADMIN_USER);
    const colKeys = capturedColumns.map((c: any) => c.key);
    expect(colKeys).toContain("name");
    expect(colKeys).toContain("sku");
    expect(colKeys).toContain("item_type");
    expect(colKeys).toContain("selling_price");
    expect(colKeys).toContain("track_inventory");
    expect(colKeys).toContain("reorder_point");
  });

  it("party: name column is still present in table columns", async () => {
    await renderItemsList(PARTY_USER);
    const colKeys = capturedColumns.map((c: any) => c.key);
    expect(colKeys).toContain("name");
  });
});
