import {
  getContactsForAccount,
  getAccountInfoForAccount,
  getKpisForAccount,
  getEngagementForAccount,
} from "../services/accountPanelService.js";
import { badRequest } from "../../shared/lib/utils/httpError.js";

function requireAccountId(req) {
  const accountId = req.query.account_id;
  if (!accountId) {
    throw badRequest("account_id query parameter is required");
  }
  return accountId;
}

export const getContacts = async (req, res) => {
  const accountId = requireAccountId(req);
  res.json(await getContactsForAccount(accountId));
};

export const getAccountInfo = async (req, res) => {
  const accountId = requireAccountId(req);
  res.json(await getAccountInfoForAccount(accountId));
};

export const getKpis = async (req, res) => {
  const accountId = requireAccountId(req);
  res.json(await getKpisForAccount(accountId));
};

export const getEngagement = async (req, res) => {
  const accountId = requireAccountId(req);
  res.json(await getEngagementForAccount(accountId));
};
