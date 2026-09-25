import { Router } from "express";
import {
  getContacts,
  getAccountInfo,
  getKpis,
  getEngagement,
} from "../controllers/accountPanelController.js";

const router = Router();

router.get("/contacts", getContacts);
router.get("/account-info", getAccountInfo);
router.get("/kpis", getKpis);
router.get("/engagement", getEngagement);

export default router;
