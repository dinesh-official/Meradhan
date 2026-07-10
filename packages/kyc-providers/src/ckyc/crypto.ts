import forge from "node-forge";

export function generateSessionKey(): Buffer {
  return Buffer.from(forge.random.getBytesSync(32), "binary");
}

export function aesEncrypt(data: string, key: Buffer): string {
  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher("AES-CBC", key.toString("binary"));
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(data, "utf8"));
  cipher.finish();

  const buffer = forge.util.createBuffer();
  buffer.putBytes(iv);
  buffer.putBytes(cipher.output.getBytes());

  return forge.util.encode64(buffer.getBytes());
}

export function aesDecrypt(base64: string, key: Buffer): string {
  const raw = forge.util.decode64(base64);
  const iv = raw.slice(0, 16);
  const encrypted = raw.slice(16);

  const decipher = forge.cipher.createDecipher(
    "AES-CBC",
    key.toString("binary")
  );
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encrypted));
  decipher.finish();

  return decipher.output.toString();
}

export function encryptSessionKey(
  sessionKey: Buffer,
  cersaiPublicPem: string
): string {
  const publicKey = forge.pki.publicKeyFromPem(cersaiPublicPem);

  const encrypted = publicKey.encrypt(
    sessionKey.toString("binary"),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
      mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()),
    }
  );

  return forge.util.encode64(encrypted);
}

export function decryptSessionKey(
  encryptedKeyBase64: string,
  fiPrivatePem: string
): Buffer {
  const privateKey = forge.pki.privateKeyFromPem(fiPrivatePem);

  const decrypted = privateKey.decrypt(
    forge.util.decode64(encryptedKeyBase64),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
      mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()),
    }
  );

  return Buffer.from(decrypted, "binary");
}
