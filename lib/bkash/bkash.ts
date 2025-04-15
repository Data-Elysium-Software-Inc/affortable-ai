"use server";

import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";
import {insertBkashAuthToken, getLatestBkashAuthToken, deleteLatestBkashAuthToken} from "@/lib/db/queries"
import { NextResponse, NextRequest } from "next/server";

interface BkashConfig {
  base_url: string | undefined;
  username: string | undefined;
  password: string | undefined;
  app_key: string | undefined;
  app_secret: string | undefined;
}

interface PaymentDetails {
  amount: number;
  callbackURL: string;
  orderID: string;
  reference: string;
}

export async function createPayment(
  bkashConfig: BkashConfig,
  paymentDetails: PaymentDetails
) {
  try {
    const { amount, callbackURL, orderID, reference } = paymentDetails;
    if (!amount || amount < 1) {
      return { statusCode: 2065, statusMessage: "Invalid amount" };
    }
    if (!callbackURL) {
      return { statusCode: 2065, statusMessage: "callbackURL required" };
    }

    const response = await fetch(
      `${bkashConfig?.base_url}/tokenized/checkout/create`,
      {
        method: "POST",
        headers: await authHeaders(bkashConfig),
        body: JSON.stringify({
          mode: "0011",
          currency: "BDT",
          intent: "sale",
          amount,
          callbackURL,
          payerReference: reference || "1",
          merchantInvoiceNumber: orderID || "Inv_" + uuidv4().substring(0, 6),
        }),
      }
    );
    return await response.json();
  } catch (e) {
    console.error("Create Bkash Payment Error:", e);
    return e;
  }
}

export async function executePayment(
  bkashConfig: BkashConfig,
  paymentID: string
) {
  try {
    const response = await fetch(
      `${bkashConfig?.base_url}/tokenized/checkout/execute`,
      {
        method: "POST",
        headers: await authHeaders(bkashConfig),
        body: JSON.stringify({ paymentID }),
      }
    );
    return await response.json();
  } catch (error) {
    console.log("Error from bkash executePayment: ", error);
    return null;
  }
}

const authHeaders = async (bkashConfig: BkashConfig): Promise<Record<string, string>> => {
  const token = await grantToken(bkashConfig);
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    authorization: token || "",
    "x-app-key": bkashConfig?.app_key || "",
  };
};

let bkashToken: { token: string | null; createdAt: number } = { token: null, createdAt: 0 };

const grantToken = async (bkashConfig: BkashConfig) => {
  try {

    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Check if token exists and is still valid (valid for 1 hour)
    const tokenRow = await getLatestBkashAuthToken(session.user.id);
    if (tokenRow && tokenRow.token && Date.now() - new Date(tokenRow.createdAt).getTime() < 3300000) {
      return tokenRow.token;
    }
    

    // Token expired or doesn't exist, fetch a new one
    return await setToken(bkashConfig);
  } catch (e) {
    console.log(e);
    return null;
  }
};

const setToken = async (bkashConfig: BkashConfig) => {
  try {

    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${bkashConfig?.base_url}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: tokenHeaders(bkashConfig),
        body: JSON.stringify(tokenParameters(bkashConfig)),
      }
    );
    const data = await response.json();

    if (data?.id_token) {
      // Store token and timestamp globally
      await deleteLatestBkashAuthToken(session.user.id);
      await insertBkashAuthToken(session.user.id, data.id_token, new Date(Date.now()));
      
    }

    return data?.id_token;
  } catch (e) {
    console.error("Error setting Bkash token:", e);
    return null;
  }
};


const tokenParameters = (bkashConfig: BkashConfig) => ({
  app_key: bkashConfig?.app_key || "",
  app_secret: bkashConfig?.app_secret || "",
});

const tokenHeaders = (bkashConfig: BkashConfig): Record<string, string> => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  username: bkashConfig?.username || "",
  password: bkashConfig?.password || "",
});


export async function queryPayment(
  bkashConfig: BkashConfig,
  paymentID: string
) {
  try {
    const response = await fetch(
      `${bkashConfig?.base_url}/tokenized/checkout/payment/status`,
      {
        method: "POST",
        headers: await authHeaders(bkashConfig),
        body: JSON.stringify({ paymentID }),
      }
    );
    
    // Wait for the response to be parsed as JSON and return it
    const data = await response.json();
    
    // Log the parsed JSON response
    return data;
  } catch (error) {
    console.log("Error from bkash executeQuery: ", error);
    return null;
  }
}
