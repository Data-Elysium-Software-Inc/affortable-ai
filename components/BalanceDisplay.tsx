import { useEffect, useState } from "react";

const BalanceDisplay = ({ userId }: { userId: string }) => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const res = await fetch(`/api/balance`, {
        headers: { "user-id": userId },
      });

      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      } else {
        console.error("Failed to fetch balance");
      }
    };

    fetchBalance();
  }, [userId]);

  return (
    <div>Balance: {balance !== null ? `${balance} cents` : "Loading..."}</div>
  );
};

export default BalanceDisplay;
