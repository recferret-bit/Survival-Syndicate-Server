import { z } from 'zod';

export const CurrencyRateItemSchema = z.object({
  fromCurrency: z.string().length(3, 'From currency must be 3 characters'),
  toCurrency: z.string().length(3, 'To currency must be 3 characters'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  rate: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Rate must be a positive number string'),
});

export const GetRatesRequestSchema = z.object({
  fromCurrency: z.string().length(3).optional(),
  toCurrency: z.string().length(3).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const GetRatesResponseSchema = z.object({
  rates: z.array(CurrencyRateItemSchema),
});

export type CurrencyRateItem = z.infer<typeof CurrencyRateItemSchema>;
export type GetRatesRequest = z.infer<typeof GetRatesRequestSchema>;
export type GetRatesResponse = z.infer<typeof GetRatesResponseSchema>;

export const CurrencyRateSubjects = {
  GET_RATES: 'currency-rate.get.v1',
} as const;
