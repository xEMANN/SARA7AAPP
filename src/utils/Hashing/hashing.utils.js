import bcrypt from "bcrypt";

export const hash = async ({ plaintext = "", saltRound = Number(process.env.salt)} = {}) => {
  return await bcrypt.hash(plaintext, saltRound);
};

export const compare = async ({ plaintext = "", hash = "" } = {}) => {
  return await bcrypt.compare(plaintext, hash);
};
