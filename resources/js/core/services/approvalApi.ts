import axios, { AxiosError } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApprovalModule = "invoices" | "customers";

export interface ApprovalUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

export interface HierarchyLevel {
  id?: number;
  level_order: number;
  user: ApprovalUser | null;
}

export interface ApprovalSettings {
  approval_type:    "no_approval" | "simple_approval" | "multi_level";
  notify_on_submit: boolean;
  notify_who:       "non_approver" | "all" | "specific_email" | null;
  notify_email:     string | null;
  notify_submitter: boolean;
  approvers:        ApprovalUser[];
  hierarchy:        HierarchyLevel[];
}

export interface SaveApprovalPayload {
  approval_type:    "no_approval" | "simple_approval" | "multi_level";
  notify_on_submit: boolean;
  notify_who:       "non_approver" | "all" | "specific_email" | null;
  notify_email:     string | null;
  notify_submitter: boolean;
  approver_ids:     number[];
  hierarchy:        { user_id: number | null }[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchApprovalSettings(
  module: ApprovalModule
): Promise<{ success: true; data: ApprovalSettings } | { success: false; message: string }> {
  try {
    const { data } = await axios.get<{ success: true; data: ApprovalSettings }>(
      `/api/approvals/${module}`
    );
    return data;
  } catch (err) {
    return { success: false, message: extractMessage(err) };
  }
}

export async function saveApprovalSettings(
  module: ApprovalModule,
  payload: SaveApprovalPayload
): Promise<{ success: true; message: string } | { success: false; message: string }> {
  try {
    const { data } = await axios.put<{ success: true; message: string }>(
      `/api/approvals/${module}`,
      payload
    );
    return data;
  } catch (err) {
    return { success: false, message: extractMessage(err) };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response) {
    return (err.response.data as { message?: string })?.message ?? "An unexpected error occurred.";
  }
  return "Network error. Please check your connection.";
}
