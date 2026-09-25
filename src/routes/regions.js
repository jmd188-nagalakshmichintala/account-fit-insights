import { Router } from "express";
import { getRegions } from "../controllers/regionController.js";

const router = Router();

router.get("/", getRegions);

export default router;
