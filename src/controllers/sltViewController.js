import {
  getSalesRepProductDistribution as getSalesRepProductDistributionService,
  getSummaryMetrics as getSummaryMetricsService,
  getScoreDistribution as getScoreDistributionService,
  getAccountDistributionBySalesRep as getAccountDistributionBySalesRepService,
  getAccountSummaryMetrics as getAccountSummaryMetricsService,
  getAccountsForFitBucket as getAccountsForFitBucketService,
  getAccountsForScoreBucket as getAccountsForScoreBucketService,
} from "../services/sltViewService.js";
import { parseSltViewFilters } from "../utils/filterParsing.js";
import { badRequest } from "../../shared/lib/utils/httpError.js";
import {
  clampPageSize,
  normalizePageNumber,
  normalizeBoolean,
} from "../utils/validation.js";

const VALID_BUCKETS = new Set(["high", "mid", "low"]);

export const getSalesRepProductDistribution = async (req, res) => {
  const user = { userId: req.user?.userId, email: req.user?.email };
  const filters = parseSltViewFilters(req.query);
  const data = await getSalesRepProductDistributionService(user, filters);
  res.json(data);
};

export const getSummaryMetrics = async (req, res) => {
  const user = { userId: req.user?.userId, email: req.user?.email };
  const filters = parseSltViewFilters(req.query);
  const data = await getSummaryMetricsService(user, filters);
  res.json(data);
};

export const getScoreDistribution = async (req, res) => {
  const user = { userId: req.user?.userId, email: req.user?.email };
  const filters = parseSltViewFilters(req.query, true);
  const data = await getScoreDistributionService(user, filters);
  res.json(data);
};

export const getAccountDistributionBySalesRep = async (req, res) => {
  const user = { userId: req.user?.userId, email: req.user?.email };
  const filters = parseSltViewFilters(req.query);
  const data = await getAccountDistributionBySalesRepService(user, filters);
  res.json(data);
};

// Records behind one bar segment (rep + high/mid/low), for the SLT view drilldown modal.
export const getAccountsForFitBucket = async (req, res) => {
  const user = { userId: req.user?.userId, email: req.user?.email };
  const filters = parseSltViewFilters(req.query);
  const bucket = req.query.bucket;

  if (!VALID_BUCKETS.has(bucket)) {
    throw badRequest(
      `Invalid bucket: ${bucket}. Must be one of high, mid, low.`,
    );
  }

  const data = await getAccountsForFitBucketService(user, filters, bucket, {
    page: normalizePageNumber(req.query.page),
    pageSize: clampPageSize(req.query.pageSize),
  });
  res.json(data);
};

// Records behind one score bar (or its open/non-open segment), for the "Products
// Across Propensity Scores" drilldown modal.
export const getAccountsForScoreBucket = async (req, res) => {
  const user = { userId: req.user?.userId, email: req.user?.email };
  const filters = parseSltViewFilters(req.query);
  const score = Number(req.query.score);

  if (!Number.isInteger(score) || score < 1 || score > 10) {
    throw badRequest(
      `Invalid score: ${req.query.score}. Must be an integer 1-10.`,
    );
  }

  const hasOpenOpp = normalizeBoolean(req.query.hasOpenOpp);

  const data = await getAccountsForScoreBucketService(
    user,
    filters,
    score,
    hasOpenOpp,
    {
      page: normalizePageNumber(req.query.page),
      pageSize: clampPageSize(req.query.pageSize),
    },
  );
  res.json(data);
};

export const getAccountSummaryMetrics = async (req, res) => {
  const user = { userId: req.user?.userId, email: req.user?.email };
  const filters = parseSltViewFilters(req.query);
  const data = await getAccountSummaryMetricsService(user, filters);
  res.json(data);
};
