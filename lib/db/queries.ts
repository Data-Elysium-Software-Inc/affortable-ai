import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { and, asc, desc, eq, gt, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
  temporaryUser,
  type TemporaryUser,
  type Referral,
  referral,
  coupon,
  type Coupon,
  couponRedemption,
  type CouponRedemption,
  bkash,
  bkashAuthToken,
  ipHistory,
  userInterestLog,
} from "./schema";
import type { BlockKind } from "@/components/block";
import { models } from "../ai/models";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(
  email: string,
  isRegistrationComplete: boolean,
  registrationType: "email" | "google",
  password?: string | null,
  ref?: string | null,
) {
  const salt = genSaltSync(10);
  const hash = password ? hashSync(password, salt) : null;

  let apiBalanceCents: string | undefined;
  let newRef=ref;
  if (newRef) {
    try {
      const referralDetails = await findReferral(newRef);

      if (referralDetails.length > 0) {
        const { code, amount, maxLimit, timesUsed } = referralDetails[0];

        if (timesUsed >= maxLimit) {
          throw new Error("ReferralCodeLimitReached");
        }

        apiBalanceCents = amount.toString();

        await db
          .update(referral)
          .set({ timesUsed: timesUsed + 1 })
          .where(eq(referral.code, code));

        newRef = code;
      }
    } catch (error) {
      console.error("Failed to handle referral details", error);
      throw error;
    }
  }

  try {
    // Create the user in the database
    return await db.insert(user).values({
      createdAt: new Date(),
      email,
      password: hash,
      ref:newRef,
      apiBalanceCents,
      registrationComplete: isRegistrationComplete,
      registrationType,
    }) as User[];
  } catch (error) {
    console.error("Failed to create user in database", error);
    throw error;
  }
}

export async function updateReferralUsageByOne(
  ref?: string | null
): Promise<{ code: string, amount: string | undefined } | undefined> {
  let apiBalanceCents: string | undefined;

  if (ref) {
    try {
      const referralDetails = await findReferral(ref);

      if (referralDetails.length > 0) {
        const { code, amount, maxLimit, timesUsed } = referralDetails[0];

        if (timesUsed >= maxLimit) {
          throw new Error("ReferralCodeLimitReached");
        }

        apiBalanceCents = amount.toString();

        await db
          .update(referral)
          .set({ timesUsed: timesUsed + 1 })
          .where(eq(referral.code, code));

        return {
          code: code,
          amount: apiBalanceCents,
        }
      }
    } catch (error) {
      console.error("Failed to handle referral details", error);
      throw error;
    }
  }
}

export async function updateUserReferralInfo(
  userId: string,
  isRegistrationComplete: boolean,
  ref?: string | null,
  amount?: string | null,
) {
  try {
    return await db
      .update(user)
      .set({
        ref,
        apiBalanceCents: amount == null ? undefined : amount,
        registrationComplete: isRegistrationComplete,
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user in database", error);
    throw error;
  }
}

export async function updateUserIpAddress(
  userId: string,
  lastIpAddress: string
) {
  try {
    return await db
      .update(user)
      .set({ lastIpAddress })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user IP address in database", error);
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.update(chat).
                 set(
                  {
                    isDeleted:true
                  }
                ).where(eq(chat.id, id));

  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getNotDeletedChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(and(eq(chat.userId, id), eq(chat.isDeleted, false)))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    console.log("messages in saveMessages in queries.ts");
    console.log(messages);
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (error) {
    console.error("Failed to upvote message in database", error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error("Failed to get votes by chat id from database", error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to save document in database");
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      "Failed to delete documents by id after timestamp from database"
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error("Failed to save suggestions in database");
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      "Failed to get suggestions by document version from database"
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await db
      .delete(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );
  } catch (error) {
    console.error(
      "Failed to delete messages by id after timestamp from database"
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error("Failed to update chat visibility in database");
    throw error;
  }
}
export async function getUserById(userId: string) {
  try {
    const [foundUser] = await db.select().from(user).where(eq(user.id, userId));

    return foundUser || null;
  } catch (error) {
    console.error("Failed to get user by id from database", error);
    throw error;
  }
}

export async function incrementUserMessageCount(
  userId: string,
  incrementAmount: number,
  deductAmount: number
) {
  try {
    return await db
      .update(user)
      .set({
        // Use parameter binding to safely include the increment amount
        messageCount: sql`${user.messageCount} + ${incrementAmount}`,
        // apiBalanceCents: sql`${user.apiBalanceCents} - ${deductAmount}`,
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to increment user message count in database", error);
    throw error;
  }
}

export async function getUserBalance(userId: string): Promise<number | null> {
  try {
    const result = await db
      .select({
        balance: user.apiBalanceCents,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Convert balance to a number if it's a string
    return result.length > 0 ? Number.parseFloat(result[0].balance as string) : null;
  } catch (error) {
    console.error("Failed to get user balance from the database", error);
    throw error;
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(newPassword, salt);

  try {
    return await db
      .update(user)
      .set({
        password: hash,
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user password in database", error);
    throw error;
  }
}

export async function updateUserOtp(
  userId: string,
  otp: string,
  otpExpires: Date
) {
  try {
    return await db
      .update(user)
      .set({
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: otpExpires,
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user OTP in database", error);
    throw error;
  }
}

export async function clearUserOtp(userId: string) {
  try {
    return await db
      .update(user)
      .set({
        resetPasswordOtp: null,
        resetPasswordOtpExpires: null,
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to clear user OTP in database", error);
    throw error;
  }
}

export async function getTemporaryUserByEmail(
  email: string
): Promise<TemporaryUser | null> {
  try {
    const [tempUser] = await db
      .select()
      .from(temporaryUser)
      .where(eq(temporaryUser.email, email));
    return tempUser || null;
  } catch (error) {
    console.error("Failed to get temporary user by email", error);
    throw error;
  }
}

export async function saveTemporaryUser(
  email: string,
  otp: string,
  otpExpires: Date
) {
  try {
    return await db.insert(temporaryUser).values({
      email,
      otp,
      otpExpires,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to save temporary user", error);
    throw error;
  }
}

export async function updateTemporaryUserOtp(
  email: string,
  otp: string,
  otpExpires: Date
) {
  try {
    return await db
      .update(temporaryUser)
      .set({ otp, otpExpires })
      .where(eq(temporaryUser.email, email));
  } catch (error) {
    console.error("Failed to update temporary user OTP", error);
    throw error;
  }
}

export async function deleteTemporaryUserByEmail(email: string) {
  try {
    return await db.delete(temporaryUser).where(eq(temporaryUser.email, email));
  } catch (error) {
    console.error("Failed to delete temporary user", error);
    throw error;
  }
}

export async function findReferral(code: string): Promise<Array<Referral>> {
  try {
    return await db
      .select()
      .from(referral)
      .where(eq(sql`LOWER(${referral.code})`, code.toLowerCase()));
  } catch (error) {
    console.error("Failed to get referral from database");
    throw error;
  }
}

export async function getReferralCouponByEmail(
  email: string
): Promise<number | null> {
  try {
    const result = await db
      .select({
        referralCoupon: user.referralCoupon,
      })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0].referralCoupon;
  } catch (error) {
    console.error("Error fetching referral coupon by email:", error);
    throw new Error("Failed to fetch referral coupon");
  }
}

// export async function updateMessageFields({
//   messageId,
//   cost,
//   modelUsed,
//   inputTokens,
//   outputTokens,
// }: {
//   messageId: string;
//   cost: number;
//   modelUsed: string;
//   inputTokens: number;
//   outputTokens: number;
// }) {
//   try {
//     await db
//       .update(message)
//       .set({
//         cost,
//         modelUsed,
//         inputTokens,
//         outputTokens,
//       })
//       .where(eq(message.id, messageId));
//   } catch (error) {
//     console.error("Failed to update message fields in database", error);
//     throw error;
//   }
// }

// /**
//  * Recompute and update the total cost for a chat by summing all message costs.
//  */
// export async function recalcChatTotalCost(chatId: string) {
//   try {
//     // Sum all costs in the Message table
//     const [result] = await db
//       .select({
//         sumCost: sql<number>`SUM(${message.cost})`,
//       })
//       .from(message)
//       .where(eq(message.chatId, chatId));

//     const totalCost = result?.sumCost ?? 0;

//     // Update the Chat table
//     await db
//       .update(chat)
//       .set({ totalCost })
//       .where(eq(chat.id, chatId));

//     return totalCost;
//   } catch (error) {
//     console.error("Failed to recalc chat total cost in database", error);
//     throw error;
//   }
// }


export async function findCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const [couponDetails] = await db
      .select()
      .from(coupon)
      .where(eq(sql`LOWER(${coupon.code})`, code.toLowerCase()));

    return couponDetails || null;
  } catch (error) {
    console.error("Failed to find coupon by code:", error);
    throw new Error("Failed to find coupon.");
  }
}

export async function hasUserRedeemedCoupon(userId: string, code: string): Promise<boolean> {
  try { 
    const [existingRedemption] = await db
      .select()
      .from(couponRedemption)
      .where(
        and(
          eq(couponRedemption.userId, userId),
          eq(sql`LOWER(${couponRedemption.code})`, code.toLowerCase())
        )
      );

    return !!existingRedemption;
  } catch (error) {
    console.error("Failed to check coupon redemption:", error);
    throw new Error("Failed to check coupon redemption.");
  }
}

export async function redeemCoupon(userId: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    // Fetch the coupon details
    const couponDetails = await findCouponByCode(code);

    // Validate the coupon
    if (!couponDetails) {
      return { success: false, message: "Coupon not found." };
    }

    // Check if the coupon has reached its maximum usage limit
    if (couponDetails.timesUsed >= couponDetails.maxLimit) {
      return { success: false, message: "Coupon limit reached." };
    }

    // Check if the user has already redeemed this coupon
    const alreadyRedeemed = await hasUserRedeemedCoupon(userId, code);

    if (alreadyRedeemed) {
      return { success: false, message: "Coupon already redeemed." };
    }

    // Record the coupon redemption
    await db.insert(couponRedemption).values({
      userId,
      code: couponDetails.code,
      redeemedAt: new Date(),
    });

    // Update the coupon's timesUsed count
    await db
      .update(coupon)
      .set({ timesUsed: sql`${coupon.timesUsed} + 1` })
      .where(eq(coupon.code, couponDetails.code));

    // Update the user's apiBalanceCents
    await db
      .update(user)
      .set({
        apiBalanceCents: sql`${user.apiBalanceCents} + ${couponDetails.amount}`,
      })
      .where(eq(user.id, userId));

    return { success: true, message: "Coupon redeemed successfully." };
  } catch (error) {
    console.error("Failed to redeem coupon:", error);
    // Return an error message without exposing internal errors
    return { success: false, message: "Failed to redeem coupon." };
  }
}

export async function updateUserApiBalance(userId: string, newBalance: number) {
  try {
    // Ensure newBalance is a valid number
    if (Number.isNaN(newBalance)) {
      throw new Error("Invalid balance amount");
    }

    // Convert newBalance to a string to match the numeric column type
    const balanceString = newBalance.toString(); // Ensures two decimal places

    // Update user API balance
    const result = await db
      .update(user)
      .set({ apiBalanceCents: balanceString }) // Store as string
      .where(eq(user.id, userId))
      .returning();

    if (result.length === 0) {
      throw new Error("User not found");
    }

    return result[0]; // Return the updated user
  } catch (error) {
    console.error("Failed to update user API balance:", error);
    throw error;
  }
}


export async function updateChatCost(chatId: string, amountIncrease: number) {
  try {
    // Ensure amountIncrease is a valid number
    if (Number.isNaN(amountIncrease) || amountIncrease < 0) {
      throw new Error("Invalid cost increase amount");
    }

    // Convert amountIncrease to a string to match the numeric column type
    const amountString = amountIncrease.toFixed(2); // Ensures two decimal places

    // Update the total cost for the chat
    const result = await db
      .update(chat)
      .set({ totalCost: sql`${chat.totalCost} + ${amountString}` }) // Increment total cost
      .where(eq(chat.id, chatId))
      .returning();

    if (result.length === 0) {
      throw new Error("Chat not found");
    }

    return result[0]; // Return the updated chat
  } catch (error) {
    console.error("Failed to update chat cost:", error);
    throw error;
  }
}

//---------------------


export async function getLatestBkashTransaction(userId: string) {
  try {
    const result = await db
      .select()
      .from(bkash)
      .where(eq(bkash.userId, userId))
      .orderBy(desc(bkash.createdAt)) // Order by createdAt descending to get the latest
      .limit(1); // Only fetch the latest row

    if (result.length === 0) {
      throw new Error("No Bkash transaction found for this user");
    }

    return result[0];
  } catch (error) {
    console.error("Failed to fetch latest Bkash transaction:", error);
    throw error;
  }
}


export async function insertBkashTransaction(
  userId: string,
  createdAt: Date,
  status: string,
  paymentID: string,
  trxID: string,
  amount: number, // Ensure amount is a number
  userMobileNumber: string // Ensure userMobileNumber is a number
) {
  try {
    const result = await db.insert(bkash).values({
      userId: userId,
      createdAt: createdAt || new Date(),
      status: status,
      paymentID: paymentID,
      trxID:trxID,
      amount: sql.raw(amount.toString()), // Ensure proper numeric handling
      userMobileNumber: userMobileNumber, 
    }).returning(); // Returns the inserted record

    return result[0]; // Returning the inserted record
  } catch (error) {
    console.error("Failed to insert Bkash transaction:", error);
    throw error;
  }
}


export async function updateBkashTransaction(paymentId: string, newStatus: string, newMobileNumber: string) {
  try {
    // Ensure newStatus and newMobileNumber are valid
    console.log(paymentId)
    if (!newStatus || !newMobileNumber) {
      throw new Error("Invalid status or mobile number");
    }

    // Update the Bkash table using transactionId
    const result = await db
      .update(bkash)
      .set({
        status: newStatus,
        userMobileNumber: newMobileNumber
      })
      .where(eq(bkash.paymentID, paymentId))
      .returning();

    if (result.length === 0) {
      throw new Error("Transaction not found");
    }

    return result[0]; // Return the updated record
  } catch (error) {
    console.error("Failed to update Bkash transaction:", error);
    throw error;
  }
}


export async function updateBkashTransactionID(
  paymentId: string, // This refers to paymentID
  TransactionId: string // This refers to trxID
) {
  try {
    // Ensure both transaction IDs are valid
    if (!paymentId || !TransactionId) {
      throw new Error("Invalid transaction IDs");
    }

    // Update the Bkash table: set trxID (transaction_id) to newTransactionId where paymentID (payment_id) matches oldTransactionId
    const result = await db
      .update(bkash)
      .set({
        trxID: TransactionId, // Update transaction_id
      })
      .where(eq(bkash.paymentID, paymentId)) // Find record using payment_id
      .returning();

    if (result.length === 0) {
      throw new Error("Transaction with the provided old transaction ID not found");
    }

    return result[0]; // Return the updated record
  } catch (error) {
    console.error("Failed to update Bkash transaction:", error);
    throw error;
  }
}


//----------------------------


export async function insertBkashAuthToken(userId:string, token:string, createdAt: Date) {
  try {
    const result = await db.insert(bkashAuthToken).values({
      userId: userId,
      token: token,
      createdAt: createdAt,
    }).returning(); // Returns the inserted record

    return result[0]; // Returning the inserted record
  } catch (error) {
    console.error("Failed to insert Bkash auth token:", error);
    throw error;
  }
}


export async function getLatestBkashAuthToken(userId: string) {
  try {
    const result = await db
      .select()
      .from(bkashAuthToken)
      .where( eq(bkashAuthToken.userId, userId))
      .orderBy(desc(bkashAuthToken.createdAt))
      .limit(1);

    return result[0] || null; // Returning the latest token or null if not found
  } catch (error) {
    console.error("Failed to fetch latest Bkash auth token:", error);
    throw error;
  }
}


export async function deleteLatestBkashAuthToken(userId: string) {
  try {
    const latestToken = await getLatestBkashAuthToken(userId);

    // If no token is found, simply return without throwing an error
    if (!latestToken) {
      return { success: true, message: "No token found to delete" };
    }

    // If token is found, delete it
    await db
      .delete(bkashAuthToken)
      .where(eq(bkashAuthToken.id, latestToken.id));

    return { success: true, message: "Latest token deleted successfully" };
  } catch (error) {
    console.error("Failed to delete latest Bkash auth token:", error);
    throw error;
  }
}


export async function updateChatTitle(chatId: string, newTitle: string) {
  try {

    const result= await db
      .update(chat)
      .set({title:newTitle})
      .where(eq(chat.id,chatId))
      .returning();
      
      if (result.length === 0) {
        throw new Error("Chat not found");
      }
      return result[0];
  
    } catch (error) {
    console.error("Failed to update chat title in database", error);
    throw error;
  }
}

export async function logUserIpAddress(userId: string, ip: string) {
  try {
    const result = await db
      .insert(ipHistory)
      .values({
        userId,
        ip,
        loggedAt: new Date(),
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Failed to log IP address in ipHistory table", error);
    throw error;
  }
}

export async function getModelForChat(chatId: string): Promise<string> {
  try {
    const [chatDetails] = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId));

    const model = models.find(model => model.label === chatDetails.modelUsed);

    if (!model) {
      throw new Error("Model not found for chat");
    }

    return model.id;
  } catch (error) {
    console.error("Failed to get model for chat from database", error);
    throw error;
  }
}

export async function insertUserInterest(
  userId: string,
  modelId: string
) {
  try {
    const result = await db.insert(userInterestLog).values({
      userId,
      modelId,
      createdAt: new Date(), 
    });
    return result;
  } catch (error) {
    console.error("Failed to insert model usage log:", error);
    throw error;
  }
}
