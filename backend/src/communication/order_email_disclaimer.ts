const DISCLAIMER_TEXT =
  "Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.";

const OBPP_TEXT =
  "BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).";

const REGISTRATION_TEXT =
  "SEBI Registration No.: INZ000330234\nNSE Member ID: 90480\nBSE Member ID: 6963";

export function splitDisclaimerFromBody(messageBody: string): {
  mainBody: string;
  hasDisclaimerFooter: boolean;
} {
  const disclaimerIndex = messageBody.indexOf("Disclaimer:");
  if (disclaimerIndex === -1) {
    return { mainBody: messageBody, hasDisclaimerFooter: false };
  }
  return {
    mainBody: messageBody.slice(0, disclaimerIndex).trimEnd(),
    hasDisclaimerFooter: true,
  };
}

export function buildOrderEmailDisclaimerHtml(): string {
  return `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="font-size:11px;color:#64748b;line-height:1.5;"><strong>Disclaimer:</strong> ${DISCLAIMER_TEXT}</p>
    <p style="font-size:11px;color:#64748b;line-height:1.5;">${OBPP_TEXT}</p>
    <p style="font-size:11px;color:#64748b;line-height:1.5;">SEBI Registration No.: INZ000330234<br/>NSE Member ID: 90480<br/>BSE Member ID: 6963</p>
  `;
}

export function buildOrderEmailHtmlBody(messageBody: string): string {
  const { mainBody, hasDisclaimerFooter } = splitDisclaimerFromBody(messageBody);
  const mainHtml = mainBody
    .split("\n")
    .map((line) => line.trim())
    .join("<br/>");

  if (!hasDisclaimerFooter) {
    return mainHtml;
  }

  return `${mainHtml}${buildOrderEmailDisclaimerHtml()}`;
}

export function getOrderEmailDisclaimerPlainText(): string {
  return `Disclaimer: ${DISCLAIMER_TEXT}\n\n${OBPP_TEXT}\n\n${REGISTRATION_TEXT}`;
}
