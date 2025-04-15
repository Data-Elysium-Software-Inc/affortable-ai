import { NextResponse } from "next/server";
import { currencies } from "@/lib/bkash/currency"; // Import the currencies object

export async function GET() {
  try {
    // Find the exchange rate for USD to BDT
    const usdToBdt = currencies.find(currency => currency.name === "USD")?.conversionRate;

    if (!usdToBdt) {
      return NextResponse.json({ error: "Exchange rate for USD not found" }, { status: 404 });
    }

    // Return the exchange rate
    return NextResponse.json({ exchangeRate: usdToBdt });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
