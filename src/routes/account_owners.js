import { Router } from "express";
import { getAccountOwners } from "../controllers/accountOwnerController.js";

const router = Router();

router.get("/", getAccountOwners);

export default router;
