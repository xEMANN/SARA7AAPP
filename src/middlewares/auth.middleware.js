import * as dbService from "../db/models/dbservice.js";
import TokenModel from "../db/models/token.model.js";
import UserModel from "../db/models/user.model.js";
import { getSignature, verifyToken } from "../utils/tokens/token.utils.js";
import mongoose from "mongoose";

export const tokenTypeEnum = {
  ACCESS: "ACCESS",
  REFRESH: "REFRESH",
};

const decodedToken = async ({ authorization, tokenType = tokenTypeEnum.ACCESS, next } = {}) => {
  if (!authorization) 
    return next(new Error("Authorization header missing", { cause: 401 }));

  const parts = authorization.trim().split(" ");
  const token = parts[parts.length - 1];

  if (!token || typeof token !== "string" || token.length < 10)
    return next(new Error("Token must be a valid string", { cause: 401 }));

  const signatures = await getSignature({ signatureLevel: "ACCESS" });

  let decoded;
  try {
    decoded = verifyToken({
      token,
      secretKey: tokenType === tokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature,
    });
  } catch (err) {
    return next(new Error("Invalid Token", { cause: 401 }));
  }

  if (!decoded.jti) return next(new Error("Invalid Token", { cause: 401 }));

  const revokedToken = await dbService.findOne({
    model: TokenModel,
    filter: { jwtid: decoded.jti },
  });
  if (revokedToken) return next(new Error("Token is Revoked", { cause: 401 }));

  const user = await dbService.findById({
    model: UserModel,
    id: decoded.id,
  });
  if (!user) return next(new Error("No registered account", { cause: 404 }));

  return { user, decoded };
};

export const authentication = ({ tokenType }) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
        next,
      })) || {};

    req.user = user;
    req.decoded = decoded;
    next();
  };
};

export const authorization = ({ accessRoles = [] } = {}) => {
  return (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Unauthorized access", { cause: 403 }));
    }
    next();
  };
};

