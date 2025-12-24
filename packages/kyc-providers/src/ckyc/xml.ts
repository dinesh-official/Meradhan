import { SignedXml } from "xml-crypto";

export function signXML(xml: string, privateKeyPem: string): string {
  const sig = new SignedXml();

  sig.addReference({
    xpath:
      "//*[local-name()='REQ_ROOT' or local-name()='CKYC_DOWNLOAD_REQUEST']",
    transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  });

  sig.loadSignature(privateKeyPem);
  sig.computeSignature(xml);

  return sig.getSignedXml();
}
