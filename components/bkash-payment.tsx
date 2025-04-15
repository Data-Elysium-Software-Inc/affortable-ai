import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LoaderIcon } from './icons';

interface BkashPaymentProps {
  onClose: () => void;
}

export default function BkashPayment({ onClose }: BkashPaymentProps) {
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    amountUSD: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Fetch the exchange rate from the backend API
    const fetchExchangeRate = async () => {
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();

      if (data.exchangeRate) {
        setExchangeRate(data.exchangeRate);
      }
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
    // If the exchange rate is available, update the amounts
    if (exchangeRate !== null) {
      setPaymentData((prevState) => ({
        ...prevState,
        amountUSD: prevState.amount * exchangeRate,
      }));
    }
  }, [exchangeRate]);

  const handlePayment = async () => {
    setIsLoading(true);

    // Send only the 'amount' field to the backend
    const response = await fetch('/api/make-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: paymentData.amount }), // Only sending the 'amount' field
    });

    const data = await response.json();

    if (data.url) {
      router.push(data.url);
    }
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let amount = parseFloat(e.target.value);
    if (amount < 0) amount = 0; // Prevent negative values
    const amountUSD = (amount * (exchangeRate || 0)).toFixed(2);
    setPaymentData((prevState) => ({
      ...prevState,
      amount,
      amountUSD: parseFloat(amountUSD), // Convert back to number
    }));
  };
  

  const handleAmountUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let amountUSD = parseFloat(e.target.value);
    if (amountUSD < 0) amountUSD = 0; // Prevent negative values
    setPaymentData((prevState) => ({
      ...prevState,
      amountUSD: parseFloat(amountUSD.toFixed(2)), // Clip to 2 decimal points and convert to number
      amount: amountUSD / (exchangeRate || 1),
    }));
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black dark:bg-white bg-opacity-50 dark:bg-opacity-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ delay: 0 }}
      >
        <div className="bg-white dark:bg-neutral-950 p-6 border border-input rounded-lg shadow-lg w-96">
          <div className="text-xl text-black dark:text-white">BKash Payment Information</div>
          <div className="text-sm text-teal-800">Enter The Amount You Want Credit For</div>
          <div className="mt-1 text-sm text-black dark:text-white">BDT:</div>
          <div className="mb-2">
            <input
              type="number"
              value={paymentData.amount}
              onChange={handleAmountChange}
              className="my-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-gray-500 focus:outline-none"
              placeholder="Enter Taka Amount You Want Credit For"
            />
          </div>
          <div className="mt-1 text-sm text-black dark:text-white">USD:</div>
          <div className="mb-2">
            <input
              type="number"
              value={paymentData.amountUSD}
              onChange={handleAmountUSDChange}
              className="my-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-gray-500 focus:outline-none"
              placeholder="USD"
            />
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={handlePayment}
              className="w-full mt-4 px-4 py-2 bg-white dark:bg-neutral-950 hover:bg-gray-300 hover:dark:bg-gray-800 border border-input text-black dark:text-white rounded mr-1 flex justify-center items-center"
            >
              {isLoading ? <LoaderIcon /> : <div>Load</div>}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 bg-white dark:bg-neutral-950 hover:bg-gray-300 hover:dark:bg-gray-800 border border-input text-black dark:text-white rounded ml-1"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
