import { getAccountOwners as getAccountOwnersService } from "../services/accountOwnerService.js";

export const getAccountOwners = async (req, res) => {
  res.json(
    await getAccountOwnersService({
      userId: req.user?.userId,
      email: req.user?.email,
    }),
  );
};
