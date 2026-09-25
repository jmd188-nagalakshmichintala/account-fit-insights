import { Router } from "express";
import {
  getCustomers,
  getGroupedCustomers,
  getProductsFitSummary,
  getFleetSizeMax,
  deprioritizeAccount,
  getDeprioritized,
  restoreAccount,
} from "../controllers/customerController.js";

const router = Router();

router.get("/", getCustomers);
router.get("/all", getGroupedCustomers);
router.get("/product-fit-summary", getProductsFitSummary);
router.get("/fleet-size-max", getFleetSizeMax);
router.get("/deprioritized", getDeprioritized);
router.post("/:accountId/deprioritize", deprioritizeAccount);
router.post("/:accountId/restore", restoreAccount);

export default router;
