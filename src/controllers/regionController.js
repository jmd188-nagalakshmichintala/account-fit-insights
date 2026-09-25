import { getRegions as getRegionsService } from "../services/regionService.js";

export const getRegions = async (req, res) => {
  res.json(
    await getRegionsService({
      userId: req.user?.userId,
      email: req.user?.email,
    }),
  );
};
