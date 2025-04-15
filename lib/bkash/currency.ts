export interface Currency {
    name: string;
    conversionRate: number;
  }
  
  export const currencies: Array<Currency> = [
    {
      name: "USD",
      conversionRate: 1 / 121.18
    }
  ] as const;
  
  export const DEFAULT_CURRENCY_NAME: string = "USD";
  
  