import axios, { AxiosError } from "axios";

export interface PartyComment {
  id:         number;
  content:    string;
  created_at: string;
  user:       { id: number; name: string } | null;
}

interface ListResponse   { success: true; data: PartyComment[]; }
interface ItemResponse   { success: true; message: string; data: PartyComment; }
interface DeleteResponse { success: true; message: string; }
interface ErrorResponse  { success: false; message: string; }

type ListResult   = ListResponse   | ErrorResponse;
type ItemResult   = ItemResponse   | ErrorResponse;
type DeleteResult = DeleteResponse | ErrorResponse;

function handleError(err: unknown): ErrorResponse {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as ErrorResponse;
    return { success: false, message: body?.message ?? "Unexpected error." };
  }
  return { success: false, message: "Network error." };
}

export async function fetchPartyComments(partyId: number): Promise<ListResult> {
  try {
    const { data } = await axios.get<ListResponse>(`/api/parties/${partyId}/comments`);
    return data;
  } catch (e) { return handleError(e); }
}

export async function storePartyComment(partyId: number, content: string): Promise<ItemResult> {
  try {
    const { data } = await axios.post<ItemResponse>(`/api/parties/${partyId}/comments`, { content });
    return data;
  } catch (e) { return handleError(e); }
}

export async function destroyPartyComment(partyId: number, commentId: number): Promise<DeleteResult> {
  try {
    const { data } = await axios.delete<DeleteResponse>(`/api/parties/${partyId}/comments/${commentId}`);
    return data;
  } catch (e) { return handleError(e); }
}
