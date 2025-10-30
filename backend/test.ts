import { NSDLApi } from "kyc-providers";

try {
  const api = new NSDLApi(
    "NR100013",
    "06b2d035ad7d2f12c5d339bec39d58d4fc6e",
    false
  ); // false = test

  const data = await api.checkDANstatus({
    transactionId: '1761824817415',
    dpId: 'IN301151',
    clientId: '25112106',
    fstHoldrPan: 'AADPM2907K'
  })
  console.log(data);

} catch (error) {
  console.log(error?.response?.data);

}