import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createPayment } from "@/lib/bkash/bkash";
import {insertBkashTransaction} from "@/lib/db/queries"
import { auth } from "@/app/(auth)/auth";

const bkashConfig = {
    base_url: process.env.BKASH_BASE_URL!,
    username: process.env.BKASH_CHECKOUT_URL_USER_NAME!,
    password: process.env.BKASH_CHECKOUT_URL_PASSWORD!,
    app_key: process.env.BKASH_CHECKOUT_URL_APP_KEY!,
    app_secret: process.env.BKASH_CHECKOUT_URL_APP_SECRET!,
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();
        const myUrl = req.headers.get("origin") || "https://affortable.ai";
        const paymentId = uuidv4().substring(0, 10);

        const paymentDetails = {
            amount: amount,
            callbackURL: `${myUrl}/api/callback`,
            orderID: paymentId,
            reference: "1",
        }

        console.log('paymentDetails', paymentDetails);

        const createPaymentResponse = await createPayment(bkashConfig, paymentDetails)
        console.log(createPaymentResponse);

        // const originalDate = createPaymentResponse.paymentCreateTime

        // // Create a valid date string
        // const formattedDateString = originalDate.replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})[:.](\d+)\sGMT([+-]\d{4})/, '$1.$2$3');
        
        // // Convert the string to a Date object
        // const date = new Date(formattedDateString);
        
        // // Convert the date to ISO string
        // const isoDate = date.toISOString();
        const createdAt = new Date();
        
        const transactionData = {
            userId: session.user.id,
            createdAt: createdAt, // Now this is in ISO 8601 format
            authToken: 'someAuthToken', // Replace with the actual auth token if needed
            status: createPaymentResponse.transactionStatus, // Example: 'Initiated'
            paymentID: createPaymentResponse.paymentID, // Transaction ID from the response
            trxID:'',
            amount: parseFloat(createPaymentResponse.amount), // Convert amount to a number
            userMobileNumber: "", // Replace with the user's mobile number if available
        };
          
          // Insert the         transaction into your database
          await insertBkashTransaction(transactionData.userId, transactionData.createdAt,transactionData.status, transactionData.paymentID,transactionData.trxID, transactionData.amount, transactionData.userMobileNumber);

        if (createPaymentResponse.statusCode !== "0000") {
            return NextResponse.json({ message: "Payment Failed" });
        }


       return NextResponse.json({ message: "Payment Success", url: createPaymentResponse.bkashURL });
       
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong" });
    }
}