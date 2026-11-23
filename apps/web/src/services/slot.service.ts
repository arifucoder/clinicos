import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { BlockSlotsResult, ManageSlotDay, OpenSlotsResult, PublicSlotsResult } from "@/types/slot.types";
import type { BlockSlotsPayload, OpenSlotsPayload } from "@/zod/slot.validation";

// doctorId: "me" (doctor নিজে) অথবা doctorProfile-এর id (ADMINS) — একই service দুই page-এ
const base = (doctorId: string) => `/doctors/${doctorId}/slots`;

const getManageSlots = (doctorId: string, range: { from: string; to: string }) =>
	httpClient.get<ManageSlotDay[]>(`${base(doctorId)}/manage`, { params: range });

const openSlots = (doctorId: string, payload: OpenSlotsPayload) =>
	httpClient.post<OpenSlotsResult>(base(doctorId), payload);

const blockSlots = (doctorId: string, payload: BlockSlotsPayload) =>
	httpClient.post<BlockSlotsResult>(`${base(doctorId)}/block`, payload);

const unblockSlots = (doctorId: string, slotIds: string[]) =>
	httpClient.post<{ unblocked: number }>(`${base(doctorId)}/unblock`, { slotIds });

const deleteSlot = (doctorId: string, slotId: string) => httpClient.delete<null>(`${base(doctorId)}/${slotId}`);

// public profile page: আজ থেকে booking window-এর শেষ পর্যন্ত (api নিজে range ঠিক করে)। login লাগে না
const getPublicSlots = (doctorId: string) => httpClient.get<PublicSlotsResult>(base(doctorId), { auth: false });

export const SlotService = { getPublicSlots, getManageSlots, openSlots, blockSlots, unblockSlots, deleteSlot };
