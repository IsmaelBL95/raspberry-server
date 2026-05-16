import mongoose from "mongoose";
import Thank from "../models/Thank.js";
import Identity from "../models/identity.model.js";

const { isValidObjectId } = mongoose;

function parseTargetUserFilter(nicknameOrId) {
  if (!nicknameOrId || typeof nicknameOrId !== "string") return null;

  const clean = nicknameOrId.trim();

  if (!clean) return null;

  if (isValidObjectId(clean)) {
    return { _id: clean };
  }

  return { nicknameCanonical: clean.toLowerCase() };
}

async function resolveIdentityId(nicknameOrId) {
  const filter = parseTargetUserFilter(nicknameOrId);

  if (!filter) return null;

  const identity = await Identity.findOne(filter).select("_id");

  return identity?._id || null;
}

export async function createThank({ fromUserId, toUser, amount, reason }) {
  const targetUserId = await resolveIdentityId(toUser);

  if (!targetUserId) {
    return { error: "Target user not found", status: 404 };
  }

  const thank = await Thank.create({
    fromUser: fromUserId,
    toUser: targetUserId,
    amount,
    reason,
  });

  const populatedThank = await Thank.findById(thank._id).populate(
    "fromUser toUser",
    "nickname avatarUrl"
  );

  return { thank: populatedThank };
}

export async function listThanks({ nickname, page = 1, limit = 10 }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));

  let query = {};

  if (nickname) {
    const identityId = await resolveIdentityId(nickname);

    if (!identityId) {
      return {
        thanks: [],
        pagination: {
          total: 0,
          page: safePage,
          hasNextPage: false,
        },
      };
    }

    query = {
      $or: [{ fromUser: identityId }, { toUser: identityId }],
    };
  }

  const total = await Thank.countDocuments(query);

  const thanks = await Thank.find(query)
    .sort({ timestamp: -1, _id: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .populate("fromUser toUser", "nickname avatarUrl");

  return {
    thanks,
    pagination: {
      total,
      page: safePage,
      hasNextPage: safePage * safeLimit < total,
    },
  };
}
