import { checkAuth, STAFF } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Router } from "express";
import { SlotController } from "./slot.controller";
import { SlotValidation } from "./slot.validation";

const router = Router({ mergeParams: true });

router.get("/", SlotController.getPublicSlots);

router.use(checkAuth(...STAFF));

router.post("/", validateRequest(SlotValidation.openSlotsSchema), SlotController.openSlots);
router.get("/manage", SlotController.getManageSlots);
router.post("/block", validateRequest(SlotValidation.blockSlotsSchema), SlotController.blockSlots);
router.post("/unblock", validateRequest(SlotValidation.unblockSlotsSchema), SlotController.unblockSlots);
router.delete("/:slotId", SlotController.deleteSlot);

export const SlotRoutes = router;
