import {
  TransactionEntity,
  CustomerEntity,
  KhataEntryEntity,
  DatasetOptionEntity,
  CloudAssistTopicEntity,
} from './entities';

export interface DatabaseSchema {
  transactions: TransactionEntity[];
  customers: CustomerEntity[];
  khataEntries: KhataEntryEntity[];
  datasets: DatasetOptionEntity[];
  cloudTopics: CloudAssistTopicEntity[];
}

const STORAGE_KEY = 'sk_balochi_app_database_v1';

const INITIAL_TRANSACTIONS: TransactionEntity[] = [
  {
    id: 'tx-101',
    title: 'Balochi Embroidered Shawl Batch #4',
    titleUrdu: 'بلوچی کڑھائی والی شال لاٹ نمبر 4',
    amount: 28500,
    type: 'SALE',
    category: 'Apparel & Crafts',
    paymentMode: 'CASH',
    date: '2026-11-02',
    time: '10:15 AM',
    note: 'Wholesale order settled at counter',
  },
  {
    id: 'tx-102',
    title: 'Shopify Store Order #SK-894 (3 Items)',
    titleUrdu: 'شاپیفائی آن لائن آرڈر نمبر 894',
    amount: 14200,
    type: 'SALE',
    category: 'E-Commerce',
    paymentMode: 'ONLINE',
    date: '2026-11-02',
    time: '11:40 AM',
    note: 'Paid via bank transfer',
  },
  {
    id: 'tx-103',
    title: 'Silk Thread & Mirror Work Raw Material',
    titleUrdu: 'ریشمی دھاگہ اور شیشہ ورک خام مال',
    amount: 6800,
    type: 'EXPENSE',
    category: 'Raw Material',
    paymentMode: 'CASH',
    date: '2026-11-02',
    time: '01:05 PM',
    note: 'Purchased from Quetta Market supplier',
  },
  {
    id: 'tx-104',
    title: 'Courier & Packaging Dispatch (TCS / Leopards)',
    titleUrdu: 'کوریئر اور پیکنگ بل',
    amount: 2450,
    type: 'EXPENSE',
    category: 'Logistics',
    paymentMode: 'CASH',
    date: '2026-11-02',
    time: '02:30 PM',
    note: '11 parcels dispatched',
  },
  {
    id: 'tx-105',
    title: 'Digital Nature Print Canvas Set',
    titleUrdu: 'ڈیجیٹل نیچر کینوس سیٹ بکری',
    amount: 19000,
    type: 'SALE',
    category: 'Digital Assets',
    paymentMode: 'CASH',
    date: '2026-11-01',
    time: '05:20 PM',
    note: 'Custom framing included',
  },
  {
    id: 'tx-106',
    title: 'Shop Electricity & Internet Bill',
    titleUrdu: 'دکان کا بجلی اور انٹرنیٹ بل',
    amount: 4500,
    type: 'EXPENSE',
    category: 'Utilities',
    paymentMode: 'ONLINE',
    date: '2026-10-31',
    time: '04:00 PM',
    note: 'Monthly utility settlement',
  },
];

const INITIAL_CUSTOMERS: CustomerEntity[] = [
  {
    id: 'cust-1',
    name: 'Haji Mirza Khan Balochi',
    nameUrdu: 'حاجی مرزا خان بلوچی',
    phone: '0300-8341920',
    city: 'Quetta',
    totalUdhaar: 18500,
    lastUpdated: '2026-11-02',
  },
  {
    id: 'cust-2',
    name: 'Sardar Tariq Mengal Traders',
    nameUrdu: 'سردار طارق مینگل ٹریڈرز',
    phone: '0321-4490123',
    city: 'Karachi',
    totalUdhaar: 32000,
    lastUpdated: '2026-11-01',
  },
  {
    id: 'cust-3',
    name: 'Zainab Boutique & Crafts',
    nameUrdu: 'زینب بوتیک اینڈ کرافٹس',
    phone: '0333-9182736',
    city: 'Lahore',
    totalUdhaar: 9400,
    lastUpdated: '2026-10-30',
  },
  {
    id: 'cust-4',
    name: 'Bilal Ahmed E-Com Reseller',
    nameUrdu: 'بلال احمد آن لائن ری سیلر',
    phone: '0345-7721098',
    city: 'Islamabad',
    totalUdhaar: 0,
    lastUpdated: '2026-10-28',
  },
];

const INITIAL_KHATA_ENTRIES: KhataEntryEntity[] = [
  {
    id: 'kh-1',
    customerId: 'cust-1',
    amount: 25000,
    entryType: 'GIVEN',
    description: '10x Balochi Traditional Caps & Waistcoats (بلوچی ٹوپی اور واسکٹ)',
    date: '2026-10-29',
    billNo: 'INV-401',
  },
  {
    id: 'kh-2',
    customerId: 'cust-1',
    amount: 6500,
    entryType: 'RECEIVED',
    description: 'Cash installment received at shop (نقد قسط وصولی)',
    date: '2026-11-02',
    billNo: 'REC-118',
  },
  {
    id: 'kh-3',
    customerId: 'cust-2',
    amount: 32000,
    entryType: 'GIVEN',
    description: 'Wholesale Balochi Mirror Work Dress Lot (ہول سیل آرڈر)',
    date: '2026-11-01',
    billNo: 'INV-409',
  },
  {
    id: 'kh-4',
    customerId: 'cust-3',
    amount: 15400,
    entryType: 'GIVEN',
    description: 'Handcrafted Leather Sandals Batch (بلوچی چپل سیٹ)',
    date: '2026-10-25',
    billNo: 'INV-388',
  },
  {
    id: 'kh-5',
    customerId: 'cust-3',
    amount: 6000,
    entryType: 'RECEIVED',
    description: 'JazzCash transfer received (جاز کیش وصولی)',
    date: '2026-10-30',
    billNo: 'REC-112',
  },
];

const INITIAL_DATASETS: DatasetOptionEntity[] = [
  {
    id: 'ds-option-1',
    optionLabel: 'Option 1 (Content & Branding)',
    optionTitleUrdu: 'آپشن 1: مواد اور برانڈنگ ڈیٹا سیٹ',
    name: 'SK_Balochi_Content_Dataset',
    description:
      'Dataset for managing prompts, logs, and creative AI text workflows for SK Balochi brand localization, digital nature content, and asset design variables.',
    category: 'CONTENT_BRANDING',
    samplePrompts: [
      {
        id: 'pr-1',
        title: 'Balochi Heritage Brand Localization Prompt',
        promptText:
          'Localize the SK Balochi summer artisan collection campaign into Urdu and Balochi-inflected English, highlighting mountain landscapes, organic cotton, and traditional mirror embroidery.',
        variables: ['collection_name', 'region_tone', 'fabric_spec'],
        expectedOutput:
          'Bilingual campaign headline, 3 storytelling captions, and cultural authenticity notes.',
      },
      {
        id: 'pr-2',
        title: 'Digital Nature & Asset Variable Generator',
        promptText:
          'Generate structured asset design variables for Hingol National Park sunset color palettes, sandstone textures, and botanical motifs for product packaging.',
        variables: ['palette_mood', 'lighting_angle', 'surface_material'],
        expectedOutput:
          'JSON token specification with hex codes, texture descriptors, and print contrast ratios.',
      },
    ],
  },
  {
    id: 'ds-option-2',
    optionLabel: 'Option 2 (Shopify & E-Commerce)',
    optionTitleUrdu: 'آپشن 2: شاپیفائی اور ای کامرس بوٹ ڈیٹا سیٹ',
    name: 'SK_Balochi_Ecom_Bot',
    description:
      'Logs and prompt testing data for Shopify store customer interactions, product descriptions, and automation workflows.',
    category: 'SHOPIFY_ECOM',
    samplePrompts: [
      {
        id: 'pr-3',
        title: 'Shopify SEO Product Description Workflow',
        promptText:
          'Write a high-converting Shopify product description for [product_title] featuring stitch count, wash care instructions, and sizing table in English and Roman Urdu.',
        variables: ['product_title', 'stitch_type', 'delivery_days'],
        expectedOutput:
          'Shopify-ready HTML description with bullet specs, size guide, and COD policy.',
      },
      {
        id: 'pr-4',
        title: 'WhatsApp & Shopify Order Support Bot Log',
        promptText:
          'Respond politely to a customer asking about COD delivery status for Order #[order_id] shipped to [city_name], offering live tracking link and exchange guarantee.',
        variables: ['order_id', 'city_name', 'courier_partner'],
        expectedOutput:
          'Friendly Roman Urdu + English customer support message with tracking details.',
      },
    ],
  },
];

const INITIAL_CLOUD_TOPICS: CloudAssistTopicEntity[] = [
  {
    id: 'gke-scaling',
    question: '1. How does GKE scale my clusters?',
    questionUrdu: 'گوگل کبرنیٹیز انجن (GKE) میرے کلسٹرز کو کیسے اسکیل کرتا ہے؟',
    summary:
      'Google Kubernetes Engine (GKE) automatically manages scaling through multiple built-in layers:',
    bullets: [
      {
        title: 'Horizontal Pod Autoscaler (HPA)',
        detail:
          'Dynamically adjusts the number of application replicas (Pods) running inside your cluster based on resource usage like CPU or memory metrics.',
        cliCommand:
          'kubectl autoscale deployment sk-balochi-web --cpu-percent=70 --min=2 --max=10',
      },
      {
        title: 'Cluster Autoscaler',
        detail:
          'Automatically handles the underlying infrastructure. When Pods cannot be scheduled due to a lack of available resources, it provisions and adds new compute nodes. Conversely, when nodes become idle or underutilized, it safely shuts them down to save costs.',
        cliCommand:
          'gcloud container clusters update sk-balochi-cluster --enable-autoscaling --min-nodes=1 --max-nodes=8 --zone=asia-south1-a',
      },
      {
        title: 'Vertical Pod Autoscaler (VPA)',
        detail:
          'Analyzes workload resource needs and dynamically resizes the exact CPU and memory requests allocated to individual Pods.',
        cliCommand:
          'gcloud container clusters update sk-balochi-cluster --enable-vertical-pod-autoscaling',
      },
    ],
    references: [
      {
        label: 'GKE Cluster Autoscaler Docs',
        url: 'https://docs.cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler',
      },
    ],
  },
  {
    id: 'pubsub-cross-project',
    question: '2. Can I use Pub/Sub across different Google Cloud projects?',
    questionUrdu: 'کیا میں مختلف گوگل کلاؤڈ پروجیکٹس کے درمیان Pub/Sub استعمال کر سکتا ہوں؟',
    summary:
      'Yes, Pub/Sub fully supports cross-project communication using Identity and Access Management (IAM).',
    bullets: [
      {
        title: 'Cross-Project Topic & Subscription Routing',
        detail:
          'A Publisher application or a Subscription resource in Project A can target a Pub/Sub Topic residing in Project B seamlessly.',
      },
      {
        title: 'IAM Service Account Permissions',
        detail:
          'Grant the sender or consumer service account roles/pubsub.publisher or roles/pubsub.subscriber on the target project resource.',
        cliCommand:
          'gcloud pubsub topics add-iam-policy-binding projects/project-b/topics/ecom-orders --member="serviceAccount:bot@project-a.iam.gserviceaccount.com" --role="roles/pubsub.publisher"',
      },
    ],
    references: [
      {
        label: 'Google Cloud Pub/Sub IAM Access Control',
        url: 'https://cloud.google.com/pubsub/docs/access-control',
      },
    ],
  },
  {
    id: 'cloud-assist-capabilities',
    question: '3. What can I do with Cloud Assist?',
    questionUrdu: 'میں Gemini Cloud Assist کے ساتھ کیا کام کر سکتا ہوں؟',
    summary:
      'Gemini Cloud Assist serves as your integrated AI companion to streamline operations across your cloud architecture:',
    bullets: [
      {
        title: 'Diagnose Problems',
        detail:
          'Analyze cloud resource health, find bottlenecks, and troubleshoot active application errors in real time.',
      },
      {
        title: 'Architecture Planning',
        detail:
          'Generate optimal app deployment recommendations using Application Delivery Controllers (ADC) and cloud best practices.',
      },
      {
        title: 'Financial Optimization',
        detail:
          'Analyze billing trends and pinpoint active ways to reduce or clean up underutilized cloud infrastructure costs.',
      },
      {
        title: 'Support Integration',
        detail:
          'Initiate formal billing inquiries or file specialized technical support tickets directly through the chat dashboard.',
      },
    ],
    references: [
      {
        label: 'Configure Autoscaler Profiles Guide',
        url: 'https://docs.cloud.google.com/kubernetes-engine/docs/how-to/cluster-autoscaler',
      },
    ],
  },
];

export class AppDatabase {
  private static instance: AppDatabase;
  private state: DatabaseSchema;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.state = this.loadFromStorage();
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase();
    }
    return AppDatabase.instance;
  }

  private loadFromStorage(): DatabaseSchema {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
        return {
          transactions: parsed.transactions ?? INITIAL_TRANSACTIONS,
          customers: parsed.customers ?? INITIAL_CUSTOMERS,
          khataEntries: parsed.khataEntries ?? INITIAL_KHATA_ENTRIES,
          datasets: parsed.datasets ?? INITIAL_DATASETS,
          cloudTopics: parsed.cloudTopics ?? INITIAL_CLOUD_TOPICS,
        };
      }
    } catch {
      // Fallback to default seed data
    }
    return {
      transactions: INITIAL_TRANSACTIONS,
      customers: INITIAL_CUSTOMERS,
      khataEntries: INITIAL_KHATA_ENTRIES,
      datasets: INITIAL_DATASETS,
      cloudTopics: INITIAL_CLOUD_TOPICS,
    };
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore storage quota errors in restricted sandboxes
    }
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): DatabaseSchema {
    return this.state;
  }

  public updateState(updater: (prev: DatabaseSchema) => DatabaseSchema): void {
    this.state = updater(this.state);
    this.persist();
  }

  public resetDatabase(): void {
    this.state = {
      transactions: INITIAL_TRANSACTIONS,
      customers: INITIAL_CUSTOMERS,
      khataEntries: INITIAL_KHATA_ENTRIES,
      datasets: INITIAL_DATASETS,
      cloudTopics: INITIAL_CLOUD_TOPICS,
    };
    this.persist();
  }
}
