import fs from "fs";
import { CKYCClient } from ".";

const cersaiPublicKeyPem = fs.readFileSync("cer/Cersai_pub.cer", "utf8");

const fiPrivateKeyPem = fs.readFileSync("cer/Cersai_pub.cer", "utf8");

const client = new CKYCClient({
  fiCode: "IN0106",
  env: "TEST",
  cersaiPublicKeyPem,
  fiPrivateKeyPem,
});

async function main() {
  const response = await client.searchByPAN("ABCDE1234A");
  console.log(response);
}

main();
