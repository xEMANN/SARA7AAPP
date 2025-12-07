import crypto from "node:crypto";
import fs from "node:fs";

if (!fs.existsSync("public_key.pem") || !fs.existsSync("private_key.pem")) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });

  fs.writeFileSync("public_key.pem", publicKey);
  fs.writeFileSync("private_key.pem", privateKey);
}

export const assymmetricEncrypt = (plaintext) => {
  const buffer = Buffer.from(plaintext, "utf8");
  const encrypted = crypto.publicEncrypt(
    {
      key: fs.readFileSync("public_key.pem", "utf8"),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );
  return encrypted.toString("base64"); 
};

export const assymmetricDecrypt = (cipherText) => {
  const buffer = Buffer.from(cipherText, "base64");  
  const decrypted = crypto.privateDecrypt(
    {
      key: fs.readFileSync("private_key.pem", "utf8"),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );
  return decrypted.toString("utf8");
};
