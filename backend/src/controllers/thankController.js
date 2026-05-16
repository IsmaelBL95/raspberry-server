import { createThank, listThanks } from "../services/thankService.js";

function normalizeAmount(amount) {
  const numericAmount = Number(amount);

  if (!Number.isInteger(numericAmount)) return null;
  if (numericAmount < 1 || numericAmount > 5) return null;

  return numericAmount;
}

export async function createThankController(req, res) {
  const fromUserId = req.identityAuth?.identityId;
  const { toUser, amount, reason } = req.body;

  if (!fromUserId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  if (!toUser || typeof toUser !== "string") {
    return res.status(400).json({
      success: false,
      error: "toUser is required",
    });
  }

  const normalizedAmount = normalizeAmount(amount);

  if (normalizedAmount === null) {
    return res.status(400).json({
      success: false,
      error: "amount must be an integer between 1 and 5",
    });
  }

  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return res.status(400).json({
      success: false,
      error: "reason is required",
    });
  }

  if (reason.trim().length > 280) {
    return res.status(400).json({
      success: false,
      error: "reason must be 280 characters or fewer",
    });
  }

  const result = await createThank({
    fromUserId,
    toUser,
    amount: normalizedAmount,
    reason: reason.trim(),
  });

  if (result.error) {
    return res.status(result.status || 400).json({
      success: false,
      error: result.error,
    });
  }

  return res.status(201).json({
    success: true,
    thank: result.thank,
  });
}

export async function listThanksController(req, res) {
  const { nickname } = req.query;
  const page = req.query.page ?? 1;
  const limit = req.query.limit ?? 10;

  const result = await listThanks({
    nickname: typeof nickname === "string" ? nickname : undefined,
    page,
    limit,
  });

  return res.status(200).json({
    success: true,
    thanks: result.thanks,
    pagination: result.pagination,
  });
}
