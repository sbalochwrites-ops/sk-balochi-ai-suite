export type TransactionType = 'SALE' | 'EXPENSE';

export interface TransactionEntity {
  id: string;
  title: string;
  titleUrdu: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMode: 'CASH' | 'ONLINE' | 'UDHAAR';
  date: string; // YYYY-MM-DD
  time: string;
  note?: string;
}

export interface CustomerEntity {
  id: string;
  name: string;
  nameUrdu: string;
  phone: string;
  city: string;
  totalUdhaar: number; // positive = customer owes shop (وصول طلب), negative = advance
  lastUpdated: string;
}

export interface KhataEntryEntity {
  id: string;
  customerId: string;
  amount: number;
  entryType: 'GIVEN' | 'RECEIVED'; // GIVEN = ادھار دیا, RECEIVED = وصولی ہوئی
  description: string;
  date: string;
  billNo?: string;
}

export interface DatasetOptionEntity {
  id: string;
  optionLabel: string;
  optionTitleUrdu: string;
  name: string;
  description: string;
  category: 'CONTENT_BRANDING' | 'SHOPIFY_ECOM';
  samplePrompts: {
    id: string;
    title: string;
    promptText: string;
    variables: string[];
    expectedOutput: string;
  }[];
}

export interface CloudAssistTopicEntity {
  id: string;
  question: string;
  questionUrdu: string;
  summary: string;
  bullets: {
    title: string;
    detail: string;
    cliCommand?: string;
  }[];
  references: { label: string; url: string }[];
}
