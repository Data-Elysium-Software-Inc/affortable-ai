import { NextResponse, NextRequest } from "next/server";
import { executePayment,queryPayment } from "@/lib/bkash/bkash";
import {updateBkashTransaction,updateUserApiBalance,getUserBalance,updateBkashTransactionID} from "@/lib/db/queries"
import { auth } from "@/app/(auth)/auth";
import { currencies } from "@/lib/bkash/currency";
//import { useRouter } from 'next/navigation';

const bkashConfig = {
    base_url: process.env.BKASH_BASE_URL!,
    username: process.env.BKASH_CHECKOUT_URL_USER_NAME!,
    password: process.env.BKASH_CHECKOUT_URL_PASSWORD!,
    app_key: process.env.BKASH_CHECKOUT_URL_APP_KEY!,
    app_secret: process.env.BKASH_CHECKOUT_URL_APP_SECRET!,
};


export async function GET(req: NextRequest) {
    try {

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const query = req.nextUrl.searchParams;
        const paymentId = query.get("paymentID");
        const myUrl = req.nextUrl.origin;

        if (!paymentId) return NextResponse.redirect(`${myUrl}`, 303); // Redirect to the homepage

        const executePaymentResponse = await executePayment(bkashConfig, paymentId);
        
        //condition for handelling no response from the execute payment
        if (!executePaymentResponse || executePaymentResponse.errorCode)  {
            const queryPaymentResponse = await queryPayment(bkashConfig, paymentId)


            if (queryPaymentResponse.statusCode !== "0000") {
                console.log("cancel")
                await updateBkashTransaction(paymentId,"canceled","null")
                await updateBkashTransactionID(paymentId,"null")
                return NextResponse.redirect(`${myUrl}`, 303); // Redirect to the homepage
            }
                
            if(queryPaymentResponse.transactionStatus==="Completed"){
                const currency = currencies.find((currency) => currency.name === "USD");
                const uscentsToTaka = (currency?.conversionRate || 0.00821)*100; 
    
                try {
                    const oldBalance = await getUserBalance(session.user.id); // Wait for balance retrieval
                    // Define start and end times with timezone offset already specified
                    const startTime = new Date("2025-03-30T18:00:00+06:00");
                    const endTime = new Date("2025-04-01T00:00:00+06:00");
                    // Get the current time (internally in UTC)
                    const currentTime = new Date();
                    if (currentTime >= startTime && currentTime < endTime) {
                        const updated_balance = Number(executePaymentResponse.amount) * uscentsToTaka * 1.11 + (oldBalance ?? 0);
                        await updateUserApiBalance(session.user.id ?? "", updated_balance); // Wait for update to complete
                    } else {
                        const updated_balance = Number(executePaymentResponse.amount) * uscentsToTaka + (oldBalance ?? 0);
                        await updateUserApiBalance(session.user.id ?? "", updated_balance); // Wait for update to complete
                    }
                } catch (error) {
                    console.error("Error updating balance:", error);
                }
                await updateBkashTransaction(paymentId,"Successful",queryPaymentResponse.customerMsisdn)
                await updateBkashTransactionID(paymentId,queryPaymentResponse.trxID)

            }else{
                await updateBkashTransaction(paymentId,"Failure","null")
                await updateBkashTransactionID(paymentId,"null")
            }
    
        } 


        if (executePaymentResponse.statusCode !== "0000") {
            console.log("cancel")
            await updateBkashTransaction(paymentId,"canceled","null")
            await updateBkashTransactionID(paymentId,"null")
            return NextResponse.redirect(`${myUrl}`, 303); // Redirect to the homepage
        }
            
        if(executePaymentResponse.transactionStatus==="Completed"){
            const currency = currencies.find((currency) => currency.name === "USD");
            const uscentsToTaka = (currency?.conversionRate || 0.00821)*100; 

            try {
                const oldBalance = await getUserBalance(session.user.id); // Wait for balance retrieval
                // Define start and end times with timezone offset already specified
                const startTime = new Date("2025-03-30T18:00:00+06:00");
                const endTime = new Date("2025-04-01T00:00:00+06:00");
                // Get the current time (internally in UTC)
                const currentTime = new Date();
                if (currentTime >= startTime && currentTime < endTime) {
                    const updated_balance = Number(executePaymentResponse.amount) * uscentsToTaka * 1.11 + (oldBalance ?? 0);
                    await updateUserApiBalance(session.user.id ?? "", updated_balance); // Wait for update to complete
                } else {
                    const updated_balance = Number(executePaymentResponse.amount) * uscentsToTaka + (oldBalance ?? 0);
                    await updateUserApiBalance(session.user.id ?? "", updated_balance); // Wait for update to complete
                }
            } catch (error) {
                console.error("Error updating balance:", error);
            }
            await updateBkashTransaction(paymentId,"Successful",executePaymentResponse.customerMsisdn)
            await updateBkashTransactionID(paymentId,executePaymentResponse.trxID)
        }else{
            await updateBkashTransaction(paymentId,"Failure","null")
            await updateBkashTransactionID(paymentId,"null")
        }


  
        return NextResponse.redirect(`${myUrl}`, 303); // Redirect to the homepage
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong" });
    }
}


