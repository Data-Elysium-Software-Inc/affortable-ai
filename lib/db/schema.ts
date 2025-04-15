import type { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  numeric,
  serial,
} from "drizzle-orm/pg-core";

// --- TEMPORARY USER TABLE ---
export const temporaryUser = pgTable("TemporaryUser", {
  email: varchar("email", { length: 64 }).notNull().primaryKey(),
  otp: varchar("otp", { length: 6 }).notNull(),
  otpExpires: timestamp("otp_expires").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type TemporaryUser = InferSelectModel<typeof temporaryUser>;

// --- USER TABLE ---
export const user = pgTable("User", {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 64 }),
  messageCount: integer("message_count").notNull().default(0),
  messageLimit: integer("message_limit").notNull().default(100),
  apiBalanceCents: numeric("api_balance_cents", { precision: 10, scale: 2 })
    .notNull()
    .default("10.0"),
  ref: varchar("ref", { length: 255 }),
  resetPasswordOtp: varchar("reset_password_otp", { length: 6 }),
  resetPasswordOtpExpires: timestamp("reset_password_otp_expires"),
  referralCoupon: serial("referral_coupon").unique().notNull(),
  registrationComplete: boolean("is_registration_complete").notNull().default(true),
  registrationType: varchar("registration_type", { enum: ["email", "google"] }).notNull().default("email"),
  lastIpAddress: varchar("last_ip_address", { length: 256 }), // IpV6 is 128 bits, so 256 characters should be enough
});

export type User = InferSelectModel<typeof user>;

// --- CHAT TABLE ---
export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),

  // 1) Add a totalCost column with a default (for existing rows)
  totalCost: numeric("total_cost", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export type Chat = InferSelectModel<typeof chat>;

// --- MESSAGE TABLE ---
export const message = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),

  // Cost of this message
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull().default("0.05"), // or whatever default cost you prefer

  // Which model was used
  modelUsed: varchar("model_used", { length: 100 })
    .notNull()
    .default("unknown"),

  // NEW: Number of tokens in the prompt
  inputTokens: integer("input_tokens").notNull().default(0), // default 0 for existing messages

  // NEW: Number of tokens in the response
  outputTokens: integer("output_tokens").notNull().default(0), // default 0 for existing messages
});

export type Message = InferSelectModel<typeof message>;

// --- VOTE TABLE ---
export const vote = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

// --- DOCUMENT TABLE ---
export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

// --- SUGGESTION TABLE ---
export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

// --- REFERRAL TABLE ---
export const referral = pgTable("Referral", {
  code: varchar("code", { length: 255 }).primaryKey().notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  maxLimit: integer("max_limit").notNull(),
  timesUsed: integer("times_used").notNull().default(0),
});

export type Referral = InferSelectModel<typeof referral>;

export const coupon = pgTable('Coupon', {
  code: varchar('code', { length: 255 }).primaryKey().notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  maxLimit: integer('max_limit').notNull(),
  timesUsed: integer('times_used').notNull().default(0),
});

export type Coupon = InferSelectModel<typeof coupon>;

export const couponRedemption = pgTable(
  "CouponRedemption",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    code: varchar("code", { length: 255 })
      .notNull()
      .default(""),
    redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.code), // Ensure a user can redeem a coupon only once
  })
);

export type CouponRedemption = InferSelectModel<typeof couponRedemption>;


// --- BKASH TABLE ---
export const bkash = pgTable("Bkash", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("createdAt").notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  paymentID: varchar("payment_id", { length: 255 }).notNull().default(""),
  trxID:varchar("transaction_id", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  userMobileNumber: varchar("user_mobile_number", { length: 15 }).notNull(), // Changed to varchar
});

export type Bkash = InferSelectModel<typeof bkash>;


export const bkashAuthToken = pgTable("BkashAuthToken", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  token: varchar("token", { length: 1024 }).notNull(), // Increase the length here
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type BkashAuthToken = InferSelectModel<typeof bkashAuthToken>;

export const ipHistory = pgTable("IpHistory", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  loggedAt: timestamp("logged_at").notNull().defaultNow(),
  ip: varchar("ip", { length: 256 }).notNull(),
});

export type IpHistory = InferSelectModel<typeof ipHistory>;

export const userInterestLog = pgTable(
  "UserInterestLog",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    modelId: text("model_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.modelId, table.createdAt),
  })
);

export type UserInterestLog = InferSelectModel<typeof userInterestLog>;

