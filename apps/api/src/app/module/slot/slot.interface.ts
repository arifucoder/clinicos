import type * as z from "zod";
import type { SlotValidation } from "./slot.validation";

export type TOpenSlotsPayload = z.infer<typeof SlotValidation.openSlotsSchema>;
export type TBlockSlotsPayload = z.infer<typeof SlotValidation.blockSlotsSchema>;
export type TUnblockSlotsPayload = z.infer<typeof SlotValidation.unblockSlotsSchema>;
export type TManageSlotQuery = z.infer<typeof SlotValidation.manageSlotQuerySchema>;
export type TPublicSlotQuery = z.infer<typeof SlotValidation.publicSlotQuerySchema>;
