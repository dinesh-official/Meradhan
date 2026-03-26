// packages/config/src/constants.ts

export const API_VERSION = "v1";

export const QueueNames = {
  Email: "queue.email",
  Notifications: "queue.notifications",
} as const;

export const Cookies = {
  Session: "session_id",
} as const;

export const RateLimits = {
  DefaultWindow: 60 * 1000, // 1 minute
  DefaultMax: 100,
};

export const PaymentProviders = {
  RAZORPAY: "RAZORPAY",
} as const;

// NSE API Constants
export const NSE_CONSTANTS = {
  // Segment types
  SEGMENT: {
    RFQ: "R",
    DEAL: "D",
  },

  // Deal types
  DEAL_TYPE: {
    BUY: "B",
    SELL: "S",
    DIRECT: "D",
  },

  // Participant and client codes
  PARTICIPANT: {
    CODE: "BCISPL",
    CLIENT_CODE: "MDVZ0U0ON",
  },

  // Quote types
  QUOTE_TYPE: {
    YIELD: "YTM",
    PRICE: "Y",
  },

  // Calculation methods
  CALC_METHOD: {
    ORIGINAL: "O",
    MARKET: "M",
  },

  // Roles
  ROLE: {
    RESPONDER: "R",
    INITIATOR: "I",
  },

  // Deal confirmation status
  CONFIRM_STATUS: {
    ACCEPT: "PC",
    REJECT: "PR",
  },

  // GTD Flag
  GTD_FLAG: {
    YES: "Y",
  },

  // Value negotiable
  VALUE_NEGOTIABLE: {
    YES: "Y",
  },

  // Default values for testing
  DEFAULT: {
    ISIN: "INE752E07NK9",
    VALUE: 0.1,
    QUANTITY: 1,
    YIELD: 2.5,
    SETTLEMENT_TYPE: 0,
    ACCESS_LEVEL: 2,
  },
} as const;

// Order Settlement Constants
export const SettlementStep = {
  ADD_ISIN: "ADD_ISIN",
  ACCEPT_NEGOTIATION: "ACCEPT_NEGOTIATION",
  PROPOSE_DEAL: "PROPOSE_DEAL",
  ACCEPT_OR_REJECT_DEAL: "ACCEPT_OR_REJECT_DEAL",
  UPDATE_ORDER_STATUS: "UPDATE_ORDER_STATUS",
} as const;

export const SettlementStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;
