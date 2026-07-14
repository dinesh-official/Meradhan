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

/** Order settlement pipeline stages (matches Prisma OrderSettlementStage). */
export const OrderPipelineStage = {
  STARTED: "started",
  PAYMENT_DONE: "payment_done",
  ADD_ISIN: "add_isin",
  QUOTE_ACCEPT: "quote_accept",
  DEAL_PROPOSE: "deal_propose",
  DEAL_ACCEPT: "deal_accept",
  PG_ROUTING: "pg_routing",
} as const;

export type OrderPipelineStageValue =
  (typeof OrderPipelineStage)[keyof typeof OrderPipelineStage];

/** Per-row status on order_stages: 0 not started, 1 success, 2 fail, 3 waiting. */
export const OrderStageStatus = {
  NOT_STARTED: 0,
  SUCCESS: 1,
  FAIL: 2,
  WAITING: 3,
} as const;

/** Executable pipeline steps (seeded rows), in order. */
export const ORDER_STAGE_SEQUENCE = [
  { stage: OrderPipelineStage.ADD_ISIN, seq: 1 },
  { stage: OrderPipelineStage.QUOTE_ACCEPT, seq: 2 },
  { stage: OrderPipelineStage.DEAL_PROPOSE, seq: 3 },
  { stage: OrderPipelineStage.DEAL_ACCEPT, seq: 4 },
  { stage: OrderPipelineStage.PG_ROUTING, seq: 5 },
] as const;

export const ORDER_STAGE_MAX_ATTEMPTS = 20;

export const ORDER_STAGE_LOCK_TTL_SECONDS = 900; // 15 minutes

export const STAGE_TO_SETTLEMENT_STEP = {
  [OrderPipelineStage.ADD_ISIN]: SettlementStep.ADD_ISIN,
  [OrderPipelineStage.QUOTE_ACCEPT]: SettlementStep.ACCEPT_NEGOTIATION,
  [OrderPipelineStage.DEAL_PROPOSE]: SettlementStep.PROPOSE_DEAL,
  [OrderPipelineStage.DEAL_ACCEPT]: SettlementStep.ACCEPT_OR_REJECT_DEAL,
} as const;
