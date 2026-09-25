import { Router } from "express";
import {
  getSalesRepProductDistribution,
  getSummaryMetrics,
  getScoreDistribution,
  getAccountDistributionBySalesRep,
  getAccountSummaryMetrics,
  getAccountsForFitBucket,
  getAccountsForScoreBucket,
} from "../controllers/sltViewController.js";

const router = Router();

router.get("/sales-rep-product-distribution", getSalesRepProductDistribution);
router.get("/summary", getSummaryMetrics);
router.get("/score-distribution", getScoreDistribution);
// Drilldown: individual accounts behind one score bar (or its open/non-open segment).
router.get("/score-distribution/accounts", getAccountsForScoreBucket);
router.get("/account-distribution", getAccountDistributionBySalesRep);
// Drilldown: individual accounts behind one bar segment (rep + high/mid/low).
router.get("/account-distribution/accounts", getAccountsForFitBucket);
router.get("/account-summary", getAccountSummaryMetrics);

export default router;
