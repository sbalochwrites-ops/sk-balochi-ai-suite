import React, { useState } from 'react';
import {
  FolderTree,
  Database,
  Layers,
  Cpu,
  Monitor,
  Box,
  Copy,
  Check,
  ArrowUpRight,
  FileCode,
  Search,
  Download,
  Code2,
} from 'lucide-react';
import { ScreenTab } from '../components/TopBar';

interface ArchitectureNode {
  id: string;
  name: string;
  pathAndroid: string;
  pathWeb: string;
  layer:
    | 'DATABASE'
    | 'DAO'
    | 'VIEWMODEL'
    | 'SCREENS'
    | 'COMPONENTS'
    | 'CONFIG';
  layerUrdu: string;
  titleUrdu: string;
  summaryUrdu: string;
  summaryEn: string;
  methodsOrProps: string[];
  kotlinCode: string;
  tsCode: string;
  sqlSchema?: string;
  linkedTab?: ScreenTab;
}

const ARCHITECTURE_NODES: ArchitectureNode[] = [
  // DATABASE LAYER
  {
    id: 'db-appdatabase',
    name: 'AppDatabase',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/data/local/AppDatabase.kt',
    pathWeb: 'src/database/AppDatabase.ts',
    layer: 'DATABASE',
    layerUrdu: 'ڈیٹا بیس لیئر (Database)',
    titleUrdu: 'مرکزی روم / لوکل ڈیٹا بیس انجن',
    summaryUrdu:
      'یہ کلاس پوری ایپ کا مرکزی ڈیٹا بیس سنگلٹن (Singleton) ہے۔ اس میں تمام ٹیبلز (Transactions, Customers, KhataEntries, Datasets) رجسٹرڈ ہیں اور یہ تمام DAO آبجیکٹس فراہم کرتی ہے۔',
    summaryEn:
      'Core Singleton database instance managing schema persistence, table initialization, and reactive state listeners across all entities.',
    methodsOrProps: [
      'getInstance(context): AppDatabase',
      'transactionDao(): TransactionDao',
      'customerKhataDao(): CustomerKhataDao',
      'datasetDao(): DatasetDao',
      'resetDatabase(): void',
    ],
    sqlSchema: `-- SQLite / Room Generated Schema for SK Balochi Khata
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    titleUrdu TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('SALE', 'EXPENSE')),
    category TEXT NOT NULL,
    paymentMode TEXT NOT NULL CHECK(paymentMode IN ('CASH', 'ONLINE', 'UDHAAR')),
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    note TEXT
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    nameUrdu TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    totalUdhaar REAL NOT NULL DEFAULT 0,
    lastUpdated TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS khata_entries (
    id TEXT PRIMARY KEY NOT NULL,
    customerId TEXT NOT NULL,
    amount REAL NOT NULL,
    entryType TEXT NOT NULL CHECK(entryType IN ('GIVEN', 'RECEIVED')),
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    billNo TEXT,
    FOREIGN KEY(customerId) REFERENCES customers(id) ON DELETE CASCADE
);`,
    kotlinCode: `package com.skbalochi.khata.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.skbalochi.khata.data.local.dao.CustomerKhataDao
import com.skbalochi.khata.data.local.dao.DatasetDao
import com.skbalochi.khata.data.local.dao.TransactionDao
import com.skbalochi.khata.data.local.entity.*

@Database(
    entities = [
        TransactionEntity::class,
        CustomerEntity::class,
        KhataEntryEntity::class,
        DatasetOptionEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao
    abstract fun customerKhataDao(): CustomerKhataDao
    abstract fun datasetDao(): DatasetDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "sk_balochi_khata.db"
                )
                .fallbackToDestructiveMigration()
                .build()
                .also { INSTANCE = it }
            }
        }
    }
}`,
    tsCode: `export class AppDatabase {
  private static instance: AppDatabase;
  private state: DatabaseSchema;
  private listeners: Set<() => void> = new Set();

  public static getInstance(): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase();
    }
    return AppDatabase.instance;
  }

  public getState(): DatabaseSchema { return this.state; }
  public updateState(updater: (prev: DatabaseSchema) => DatabaseSchema): void {
    this.state = updater(this.state);
    this.persist();
  }
}`,
  },
  {
    id: 'db-entities',
    name: 'DatabaseEntities',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/data/local/entity/Entities.kt',
    pathWeb: 'src/database/entities.ts',
    layer: 'DATABASE',
    layerUrdu: 'ڈیٹا بیس لیئر (Entities)',
    titleUrdu: 'ڈیٹا بیس ٹیبلز اور اینٹیٹیز (Entities)',
    summaryUrdu:
      'اس فائل میں روزنامچہ بکری/خرچہ (TransactionEntity)، گاہک کھاتہ (CustomerEntity)، ادھار انٹری (KhataEntryEntity)، اور اے آئی ڈیٹا سیٹ (DatasetOptionEntity) کے مکمل اسٹریکچرز موجود ہیں۔',
    summaryEn:
      'Defines relational table schemas, primary keys, and foreign key relationships for Transactions, Customers, Khata Ledger Entries, and AI Prompt Datasets.',
    methodsOrProps: [
      'TransactionEntity (id, title, titleUrdu, amount, type, category, paymentMode, date)',
      'CustomerEntity (id, name, nameUrdu, phone, city, totalUdhaar, lastUpdated)',
      'KhataEntryEntity (id, customerId, amount, entryType, description, date, billNo)',
      'DatasetOptionEntity (id, name, description, category, samplePrompts)',
    ],
    kotlinCode: `package com.skbalochi.khata.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val title: String,
    val titleUrdu: String,
    val amount: Double,
    val type: String, // "SALE" | "EXPENSE"
    val category: String,
    val paymentMode: String, // "CASH" | "ONLINE" | "UDHAAR"
    val date: String,
    val time: String,
    val note: String? = null
)

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey val id: String,
    val name: String,
    val nameUrdu: String,
    val phone: String,
    val city: String,
    val totalUdhaar: Double,
    val lastUpdated: String
)

@Entity(
    tableName = "khata_entries",
    foreignKeys = [
        ForeignKey(
            entity = CustomerEntity::class,
            parentColumns = ["id"],
            childColumns = ["customerId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("customerId")]
)
data class KhataEntryEntity(
    @PrimaryKey val id: String,
    val customerId: String,
    val amount: Double,
    val entryType: String, // "GIVEN" | "RECEIVED"
    val description: String,
    val date: String,
    val billNo: String? = null
)`,
    tsCode: `export interface TransactionEntity {
  id: string;
  title: string;
  titleUrdu: string;
  amount: number;
  type: 'SALE' | 'EXPENSE';
  category: string;
  paymentMode: 'CASH' | 'ONLINE' | 'UDHAAR';
  date: string;
  time: string;
  note?: string;
}

export interface CustomerEntity {
  id: string;
  name: string;
  nameUrdu: string;
  phone: string;
  city: string;
  totalUdhaar: number;
  lastUpdated: string;
}`,
  },

  // DAO LAYER
  {
    id: 'dao-transaction',
    name: 'TransactionDao',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/data/local/dao/TransactionDao.kt',
    pathWeb: 'src/dao/TransactionDao.ts',
    layer: 'DAO',
    layerUrdu: 'ڈی اے او لیئر (DAO)',
    titleUrdu: 'روزنامچہ بکری اور خرچہ DAO',
    summaryUrdu:
      'یہ DAO روزنامچہ کی تمام بکری (Sales)، اخراجات (Expenses)، نقد گلہ (Cash in Hand)، اور منافع (Net Profit) کی کیوریز چلاتا ہے۔',
    summaryEn:
      'Data Access Object for querying, filtering, inserting, and aggregating daily sales, shop expenses, and net cash in hand.',
    methodsOrProps: [
      'getAllTransactions(): Flow<List<TransactionEntity>>',
      'getTransactionsByType(type: TransactionType): List<TransactionEntity>',
      'insertTransaction(tx: TransactionEntity): void',
      'deleteTransaction(id: String): void',
      'getSummaryMetrics(): SummaryMetrics',
    ],
    kotlinCode: `package com.skbalochi.khata.data.local.dao

import androidx.room.*
import com.skbalochi.khata.data.local.entity.TransactionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY date DESC, time DESC")
    fun getAllTransactions(): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE type = :txType ORDER BY date DESC")
    fun getTransactionsByType(txType: String): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity)

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun deleteTransaction(id: String)

    @Query("SELECT COALESCE(SUM(amount), 0.0) FROM transactions WHERE type = 'SALE'")
    fun observeTotalSales(): Flow<Double>

    @Query("SELECT COALESCE(SUM(amount), 0.0) FROM transactions WHERE type = 'EXPENSE'")
    fun observeTotalExpenses(): Flow<Double>
}`,
    tsCode: `export class TransactionDao {
  private db = AppDatabase.getInstance();

  public getAllTransactions(): TransactionEntity[] {
    return [...this.db.getState().transactions].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }

  public insertTransaction(payload: Omit<TransactionEntity, 'id'>): TransactionEntity {
    const newTx: TransactionEntity = { ...payload, id: \`tx-\${Date.now()}\` };
    this.db.updateState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
    return newTx;
  }
}`,
    linkedTab: 'roznamcha',
  },
  {
    id: 'dao-customer-khata',
    name: 'CustomerKhataDao',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/data/local/dao/CustomerKhataDao.kt',
    pathWeb: 'src/dao/CustomerKhataDao.ts',
    layer: 'DAO',
    layerUrdu: 'ڈی اے او لیئر (DAO)',
    titleUrdu: 'گاہک ادھار کھاتہ اور وصولی DAO',
    summaryUrdu:
      'یہ DAO گاہکوں کے کھاتے، ادھار دی گئی رقم (GIVEN)، وصول شدہ رقم (RECEIVED)، اور کل قابلِ وصول ادھار (Total Receivable) کا حساب رکھتا ہے۔',
    summaryEn:
      'Manages customer ledgers, automatic balance recalculation on Udhaar Given vs Payment Received, and total receivable queries.',
    methodsOrProps: [
      'getAllCustomers(): List<CustomerEntity>',
      'getEntriesForCustomer(customerId: String): List<KhataEntryEntity>',
      'addCustomer(customer: CustomerEntity): CustomerEntity',
      'recordKhataEntry(entry: KhataEntryEntity): KhataEntryEntity',
      'getTotalReceivableUdhaar(): number',
    ],
    kotlinCode: `package com.skbalochi.khata.data.local.dao

import androidx.room.*
import com.skbalochi.khata.data.local.entity.CustomerEntity
import com.skbalochi.khata.data.local.entity.KhataEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CustomerKhataDao {
    @Query("SELECT * FROM customers ORDER BY totalUdhaar DESC")
    fun getAllCustomers(): Flow<List<CustomerEntity>>

    @Query("SELECT * FROM khata_entries WHERE customerId = :customerId ORDER BY date DESC")
    fun getEntriesForCustomer(customerId: String): Flow<List<KhataEntryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertKhataEntry(entry: KhataEntryEntity)

    @Query("UPDATE customers SET totalUdhaar = MAX(0, totalUdhaar + :delta), lastUpdated = :date WHERE id = :customerId")
    suspend fun updateCustomerBalance(customerId: String, delta: Double, date: String)

    @Transaction
    suspend fun recordKhataEntryAndUpdateBalance(entry: KhataEntryEntity) {
        insertKhataEntry(entry)
        val delta = if (entry.entryType == "GIVEN") entry.amount else -entry.amount
        updateCustomerBalance(entry.customerId, delta, entry.date)
    }
}`,
    tsCode: `export class CustomerKhataDao {
  private db = AppDatabase.getInstance();

  public getAllCustomers(): CustomerEntity[] {
    return [...this.db.getState().customers].sort((a, b) => b.totalUdhaar - a.totalUdhaar);
  }

  public recordKhataEntry(payload: Omit<KhataEntryEntity, 'id'>): KhataEntryEntity {
    // Atomically appends KhataEntry and recalculates Customer totalUdhaar
    ...
  }
}`,
    linkedTab: 'khata',
  },
  {
    id: 'dao-dataset',
    name: 'DatasetDao',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/data/local/dao/DatasetDao.kt',
    pathWeb: 'src/dao/DatasetDao.ts',
    layer: 'DAO',
    layerUrdu: 'ڈی اے او لیئر (DAO)',
    titleUrdu: 'SK Balochi ڈیٹا سیٹ اور پرامپٹ DAO',
    summaryUrdu:
      'یہ DAO گوگل اے آئی اسٹوڈیو کے لیے SK_Balochi_Content_Dataset اور SK_Balochi_Ecom_Bot کے پرامپٹس اور لاگز کو محفوظ اور منظم کرتا ہے۔',
    summaryEn:
      'Provides structured access to SK_Balochi_Content_Dataset, SK_Balochi_Ecom_Bot prompt templates, and Cloud Assist documentation.',
    methodsOrProps: [
      'getAllDatasets(): List<DatasetOptionEntity>',
      'getCloudAssistTopics(): List<CloudAssistTopicEntity>',
      'addPromptToDataset(datasetId: String, prompt: PromptSpec): void',
    ],
    kotlinCode: `package com.skbalochi.khata.data.local.dao

import androidx.room.*
import com.skbalochi.khata.data.local.entity.DatasetOptionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DatasetDao {
    @Query("SELECT * FROM datasets ORDER BY id ASC")
    fun getAllDatasets(): Flow<List<DatasetOptionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveDataset(dataset: DatasetOptionEntity)
}`,
    tsCode: `export class DatasetDao {
  private db = AppDatabase.getInstance();

  public getAllDatasets(): DatasetOptionEntity[] {
    return this.db.getState().datasets;
  }

  public addPromptToDataset(datasetId: string, prompt: PromptSpec): void {
    ...
  }
}`,
    linkedTab: 'datasets',
  },

  // VIEWMODEL LAYER
  {
    id: 'vm-appviewmodel',
    name: 'KhataViewModel (useAppViewModel)',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/ui/viewmodel/KhataViewModel.kt',
    pathWeb: 'src/viewmodel/useAppViewModel.ts',
    layer: 'VIEWMODEL',
    layerUrdu: 'ویو ماڈل لیئر (ViewModel)',
    titleUrdu: 'مرکزی MVVM ویو ماڈل اور اسٹیٹ کنٹرولر',
    summaryUrdu:
      'یہ ویو ماڈل DAO لیئر اور UI سکرینز کے درمیان پل کا کام کرتا ہے۔ سرچ فلٹرز، روزنامچہ سمری، منتخب گاہک کا کھاتہ، اور نئے اندراجات کے تمام فنکشنز یہاں موجود ہیں۔',
    summaryEn:
      'Reactive ViewModel bridging DAO streams to UI state, exposing search/filter state, computed profit/udhaar metrics, and mutation actions.',
    methodsOrProps: [
      'transactions / txFilter / txSearch',
      'summaryMetrics (totalSales, totalExpenses, netProfit, cashInHand, totalUdhaarReceivable)',
      'customers / selectedCustomer / selectedCustomerEntries',
      'addTransaction() / addCustomer() / addKhataEntry() / addPromptWorkflow()',
    ],
    kotlinCode: `package com.skbalochi.khata.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skbalochi.khata.data.local.dao.CustomerKhataDao
import com.skbalochi.khata.data.local.dao.DatasetDao
import com.skbalochi.khata.data.local.dao.TransactionDao
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class KhataViewModel @Inject constructor(
    private val transactionDao: TransactionDao,
    private val customerKhataDao: CustomerKhataDao,
    private val datasetDao: DatasetDao
) : ViewModel() {

    private val _txFilter = MutableStateFlow("ALL")
    val uiState: StateFlow<KhataUiState> = combine(
        transactionDao.getAllTransactions(),
        customerKhataDao.getAllCustomers(),
        _txFilter
    ) { transactions, customers, filter ->
        val sales = transactions.filter { it.type == "SALE" }.sumOf { it.amount }
        val expenses = transactions.filter { it.type == "EXPENSE" }.sumOf { it.amount }
        KhataUiState(
            transactions = transactions.filter { filter == "ALL" || it.type == filter },
            customers = customers,
            totalSales = sales,
            totalExpenses = expenses,
            netProfit = sales - expenses
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), KhataUiState())
}`,
    tsCode: `export function useAppViewModel() {
  const db = useMemo(() => AppDatabase.getInstance(), []);
  const [version, setVersion] = useState(0);
  useEffect(() => db.subscribe(() => setVersion((v) => v + 1)), [db]);

  const summaryMetrics = useMemo(() => ({
    ...transactionDao.getSummaryMetrics(),
    totalUdhaarReceivable: customerKhataDao.getTotalReceivableUdhaar(),
  }), [version]);

  return { transactions, customers, summaryMetrics, addTransaction, addCustomer, addKhataEntry };
}`,
  },

  // SCREENS LAYER
  {
    id: 'screen-structure',
    name: 'ProjectStructureScreen',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/ui/screens/ProjectStructureScreen.kt',
    pathWeb: 'src/screens/ProjectStructureScreen.tsx',
    layer: 'SCREENS',
    layerUrdu: 'سکرینز لیئر (Screens)',
    titleUrdu: 'پروجیکٹ ٹری سٹرکچر اور آرکیٹیکچر انسپکٹر سکرین',
    summaryUrdu:
      'تمام کمپونینٹس، DAO، ڈیٹا بیس، ویو ماڈل، اور سکرینز کا تفصیلی ٹری سٹرکچر مع کوڈ پریویو اور اردو وضاحت دکھانے والی سکرین۔',
    summaryEn:
      'Interactive architectural tree explorer inspecting every Database entity, DAO, ViewModel, Screen, and Component in Kotlin & TypeScript.',
    methodsOrProps: [
      'Interactive File Tree (Android Room/Compose + React/TS)',
      'Layer Filter (All, Database, DAO, ViewModel, Screens, Components)',
      'Live Code, SQL DDL & Gradle Inspector with 1-Click Copy',
    ],
    kotlinCode: `@Composable
fun ProjectStructureScreen(
    nodes: List<ArchitectureNode>,
    onNavigateToScreen: (ScreenTab) -> Unit
) {
    Row(modifier = Modifier.fillMaxSize()) {
        LazyColumn(modifier = Modifier.weight(0.45f)) {
            items(nodes) { node -> TreeItemRow(node) }
        }
        CodeInspectorPane(modifier = Modifier.weight(0.55f))
    }
}`,
    tsCode: `export const ProjectStructureScreen: React.FC<Props> = ({ onNavigateTab }) => {
  // Renders interactive ASCII + Folder Tree and side-by-side Code/Schema Inspector
};`,
    linkedTab: 'structure',
  },
  {
    id: 'screen-roznamcha',
    name: 'RoznamchaScreen',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/ui/screens/RoznamchaScreen.kt',
    pathWeb: 'src/screens/RoznamchaScreen.tsx',
    layer: 'SCREENS',
    layerUrdu: 'سکرینز لیئر (Screens)',
    titleUrdu: 'روزنامچہ (بکری، خرچہ اور نقد گلہ) سکرین',
    summaryUrdu:
      'دکان کی روزانہ بکری (Sales)، اخراجات (Expenses)، خالص منافع (Net Profit) اور نقد گلہ (Cash in Hand) کا مکمل حساب کتاب دکھانے والی سکرین۔',
    summaryEn:
      'Daily cashbook ledger displaying KPI summary cards, category filters, bilingual Urdu/English transaction rows, and instant entry creation.',
    methodsOrProps: [
      '4 KPI Summary Cards (Total Sales, Total Expenses, Net Profit, Cash in Hand)',
      'Segmented Filter (All Entries, Sales Only, Expenses Only)',
      'Search & Delete Transaction Actions',
    ],
    kotlinCode: `@Composable
fun RoznamchaScreen(
    viewModel: KhataViewModel,
    onOpenNewEntryModal: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        KpiSummaryGrid(state.summaryMetrics)
        TransactionFilterBar(state.txFilter, viewModel::setFilter)
        TransactionLazyList(state.transactions, viewModel::deleteTransaction)
    }
}`,
    tsCode: `export const RoznamchaScreen: React.FC<RoznamchaScreenProps> = ({
  transactions, summaryMetrics, txFilter, setTxFilter, onAddClick, onDeleteTx
}) => { ... };`,
    linkedTab: 'roznamcha',
  },
  {
    id: 'screen-khata',
    name: 'UdhaarKhataScreen',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/ui/screens/UdhaarKhataScreen.kt',
    pathWeb: 'src/screens/UdhaarKhataScreen.tsx',
    layer: 'SCREENS',
    layerUrdu: 'سکرینز لیئر (Screens)',
    titleUrdu: 'گاہک ادھار کھاتہ اور وصولی سکرین',
    summaryUrdu:
      'گاہکوں کی فہرست، ہر گاہک کا بقایا ادھار، نئی وصولی یا ادھار انٹری، اور واٹس ایپ پر ادھار ریمائنڈر بھیجنے کی سہولت۔',
    summaryEn:
      'Split-pane Customer Udhaar Ledger with customer directory, individual transaction history, Vasooli/Udhaar entry form, and WhatsApp reminder generator.',
    methodsOrProps: [
      'Customer Directory List with Udhaar Balance',
      'Customer Ledger History (GIVEN / ادھار دیا vs RECEIVED / وصولی)',
      'WhatsApp Bilingual Payment Reminder Generator',
    ],
    kotlinCode: `@Composable
fun UdhaarKhataScreen(
    customers: List<CustomerEntity>,
    selectedCustomer: CustomerEntity?,
    entries: List<KhataEntryEntity>,
    onRecordEntry: (KhataEntryEntity) -> Unit
) { ... }`,
    tsCode: `export const UdhaarKhataScreen: React.FC<UdhaarKhataScreenProps> = ({
  customers, selectedCustomer, selectedCustomerEntries, onSelectCustomer, onAddKhataEntry
}) => { ... };`,
    linkedTab: 'khata',
  },
  {
    id: 'screen-datasets',
    name: 'DatasetStudioScreen',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/ui/screens/DatasetStudioScreen.kt',
    pathWeb: 'src/screens/DatasetStudioScreen.tsx',
    layer: 'SCREENS',
    layerUrdu: 'سکرینز لیئر (Screens)',
    titleUrdu: 'SK Balochi اے آئی ڈیٹا سیٹ اور کلاؤڈ اسسٹ سکرین',
    summaryUrdu:
      'SK_Balochi_Content_Dataset اور SK_Balochi_Ecom_Bot کو ایک کلک میں کاپی کرنے، نئے پرامپٹس شامل کرنے، اور GKE / PubSub کلاؤڈ کمانڈز دیکھنے کی سکرین۔',
    summaryEn:
      'Dedicated workspace for copying SK_Balochi_Content_Dataset & SK_Balochi_Ecom_Bot fields into Google AI Studio, managing prompt workflows, and inspecting GKE/PubSub CLI commands.',
    methodsOrProps: [
      'Option 1: SK_Balochi_Content_Dataset (1-Click Copy Name & Description)',
      'Option 2: SK_Balochi_Ecom_Bot (1-Click Copy Name & Description)',
      'Interactive Prompt Builder + GKE Scaling & Pub/Sub Reference',
    ],
    kotlinCode: `@Composable
fun DatasetStudioScreen(
    datasets: List<DatasetOptionEntity>,
    cloudTopics: List<CloudAssistTopicEntity>,
    onAddPrompt: (String, PromptSpec) -> Unit
) { ... }`,
    tsCode: `export const DatasetStudioScreen: React.FC<DatasetStudioScreenProps> = ({
  datasets, cloudTopics, onAddPromptWorkflow
}) => { ... };`,
    linkedTab: 'datasets',
  },
  {
    id: 'screen-reports',
    name: 'ReportsScreen',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/ui/screens/ReportsScreen.kt',
    pathWeb: 'src/screens/ReportsScreen.tsx',
    layer: 'SCREENS',
    layerUrdu: 'سکرینز لیئر (Screens)',
    titleUrdu: 'مالیاتی رپورٹس اور کیٹیگری تجزیہ سکرین',
    summaryUrdu:
      'کیٹیگری کے لحاظ سے بکری اور اخراجات کا موازنہ، ادائیگی کے طریقوں (نقد، آن لائن، ادھار) کا تناسب، اور CSV ایکسپورٹ کی سہولت۔',
    summaryEn:
      'Financial analytics breakdown by category and payment mode, net margin calculation, and 1-click CSV ledger export.',
    methodsOrProps: [
      'Category Breakdown Table with Revenue & Expense Columns',
      'Net Profit Margin & Receivable Metrics',
      'Export Full Roznamcha & Khata CSV',
    ],
    kotlinCode: `@Composable
fun ReportsScreen(
    transactions: List<TransactionEntity>,
    customers: List<CustomerEntity>,
    onExportCsv: () -> Unit
) { ... }`,
    tsCode: `export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  allTransactions, customers, summaryMetrics, onResetDemoData
}) => { ... };`,
    linkedTab: 'reports',
  },

  // COMPONENTS LAYER
  {
    id: 'comp-topbar',
    name: 'TopBar & MobileNav',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/ui/components/TopBar.kt',
    pathWeb: 'src/components/TopBar.tsx',
    layer: 'COMPONENTS',
    layerUrdu: 'کمپونینٹس لیئر (Components)',
    titleUrdu: 'ٹاپ نیویگیشن بار اور موبائل باٹم بار',
    summaryUrdu:
      'ڈیسک ٹاپ کے لیے 3-Zone ٹاپ بار اور موبائل صارفین کے لیے انگوٹھے کی پہنچ (Thumb-Zone) میں باٹم نیویگیشن بار۔',
    summaryEn:
      'Responsive navigation bar implementing the 3-zone desktop header and 5-tab mobile bottom navigation bar.',
    methodsOrProps: [
      'activeTab: ScreenTab',
      'onSelectTab: (tab: ScreenTab) => void',
      'onQuickAddTransaction: () => void',
    ],
    kotlinCode: `@Composable
fun SkBalochiTopBar(
    activeTab: ScreenTab,
    onSelectTab: (ScreenTab) -> Unit,
    onQuickAdd: () -> Unit
) { ... }`,
    tsCode: `export const TopBar: React.FC<TopBarProps> = ({
  activeTab, onSelectTab, onQuickAddTransaction
}) => { ... };`,
  },
  {
    id: 'comp-modals',
    name: 'TransactionModal & CustomerModal',
    pathAndroid:
      'app/src/main/java/com/skbalochi/khata/ui/components/EntryDialogs.kt',
    pathWeb: 'src/components/TransactionModal.tsx',
    layer: 'COMPONENTS',
    layerUrdu: 'کمپونینٹس لیئر (Components)',
    titleUrdu: 'بکری/خرچہ اور گاہک اندراج ڈائیلاگ کمپونینٹس',
    summaryUrdu:
      'نئی بکری، خرچہ یا نیا گاہک کھاتہ شامل کرنے کے لیے اردو اور انگلش ان پٹ فارم کمپونینٹس۔',
    summaryEn:
      'Reusable modal dialogs with validation for creating Roznamcha transactions and onboarding new Khata customers.',
    methodsOrProps: [
      'TransactionModal (isOpen, onClose, onSave)',
      'CustomerModal (isOpen, onClose, onSaveCustomer)',
    ],
    kotlinCode: `@Composable
fun TransactionEntryDialog(
    onDismiss: () -> Unit,
    onConfirm: (TransactionEntity) -> Unit
) { ... }`,
    tsCode: `export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen, onClose, onSave
}) => { ... };`,
  },

  // CONFIG & ENTRY POINT LAYER
  {
    id: 'config-gradle-main',
    name: 'MainActivity & build.gradle.kts',
    pathAndroid: 'app/build.gradle.kts & MainActivity.kt',
    pathWeb: 'package.json & src/App.tsx',
    layer: 'CONFIG',
    layerUrdu: 'کنفیگریشن اور مین ایکٹیویٹی (Entry Point)',
    titleUrdu: 'اینڈرائیڈ گریڈل، Hilt DI اور مین ایکٹیویٹی سیٹ اپ',
    summaryUrdu:
      'اینڈرائیڈ اسٹوڈیو میں Room Database، Hilt Dependency Injection، اور Jetpack Compose چلانے کے لیے مکمل گریڈل ڈپینڈنسیز اور MainActivity کوڈ۔',
    summaryEn:
      'Complete Android Gradle configuration (Room, Hilt, Coroutines, Jetpack Compose) and MainActivity NavHost wiring.',
    methodsOrProps: [
      'androidx.room:room-runtime & room-ktx (2.6.1)',
      'com.google.dagger:hilt-android (2.51)',
      'androidx.lifecycle:lifecycle-viewmodel-compose',
      '@AndroidEntryPoint MainActivity',
    ],
    kotlinCode: `// app/build.gradle.kts
dependencies {
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:\$roomVersion")
    implementation("androidx.room:room-ktx:\$roomVersion")
    ksp("androidx.room:room-compiler:\$roomVersion")

    // Hilt Dependency Injection
    implementation("com.google.dagger:hilt-android:2.51.1")
    ksp("com.google.dagger:hilt-compiler:2.51.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.09.00"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")
}

// MainActivity.kt
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SKBalochiKhataTheme {
                SKBalochiMainApp()
            }
        }
    }
}`,
    tsCode: `// src/App.tsx
export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('structure');
  const vm = useAppViewModel();
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <TopBar activeTab={activeTab} onSelectTab={setActiveTab} ... />
      <main>...</main>
    </div>
  );
}`,
  },
];

const FULL_ASCII_TREE = `SK_Balochi_Khata_Project/
├── database/                         # 01. ڈیٹا بیس لیئر (Room / Local Persistence)
│   ├── AppDatabase.kt (.ts)          # مرکزی سنگلٹن ڈیٹا بیس اور ٹیبل کنفیگریشن
│   └── Entities.kt (.ts)             # Transaction, Customer, KhataEntry, Dataset ٹیبلز
│
├── dao/                              # 02. ڈی اے او لیئر (Data Access Objects)
│   ├── TransactionDao.kt (.ts)       # روزنامچہ بکری، خرچہ اور نقد گلہ کیوریز
│   ├── CustomerKhataDao.kt (.ts)     # گاہک کھاتہ، ادھار اور وصولی بیلنس کیوریز
│   └── DatasetDao.kt (.ts)           # SK_Balochi_Content_Dataset & Ecom_Bot کیوریز
│
├── viewmodel/                        # 03. ویو ماڈل لیئر (MVVM State & Business Logic)
│   └── KhataViewModel.kt             # ری ایکٹو اسٹیٹ، فلٹرز، منافع اور ادھار کیلکولیشن
│       (useAppViewModel.ts)
│
├── screens/                          # 04. سکرینز لیئر (UI Screens)
│   ├── ProjectStructureScreen.tsx    # تمام کمپونینٹس، DAO، ڈیٹا بیس اور سکرینز کا ٹری
│   ├── RoznamchaScreen.tsx           # روزانہ بکری، خرچہ اور نقد گلہ ڈیش بورڈ
│   ├── UdhaarKhataScreen.tsx         # گاہک ادھار کھاتہ، لیجر اور واٹس ایپ ریمائنڈر
│   ├── DatasetStudioScreen.tsx       # AI Studio Datasets & Gemini Cloud Assist
│   └── ReportsScreen.tsx             # مالیاتی رپورٹس، کیٹیگری چارٹس اور CSV ایکسپورٹ
│
├── components/                       # 05. ری یوزایبل کمپونینٹس (UI Components)
│   ├── TopBar.tsx                    # ڈیسک ٹاپ ٹاپ بار اور موبائل باٹم نیویگیشن
│   ├── TransactionModal.tsx          # بکری اور خرچہ اندراج ڈائیلاگ
│   └── CustomerModal.tsx             # نیا گاہک کھاتہ بنانے کا ڈائیلاگ
│
└── config/                           # 06. اینڈرائیڈ گریڈل اور مین انٹری پوائنٹ
    ├── build.gradle.kts              # Room, Hilt, Coroutines, Jetpack Compose Setup
    └── MainActivity.kt (App.tsx)     # روٹ نیویگیشن اور تھیم کنٹینر`;

interface ProjectStructureScreenProps {
  onNavigateTab: (tab: ScreenTab) => void;
}

export const ProjectStructureScreen: React.FC<ProjectStructureScreenProps> = ({
  onNavigateTab,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<
    'ALL' | ArchitectureNode['layer']
  >('ALL');
  const [selectedNodeId, setSelectedNodeId] =
    useState<string>('db-appdatabase');
  const [codeLang, setCodeLang] = useState<'KOTLIN' | 'TYPESCRIPT' | 'SQL'>(
    'KOTLIN'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = ARCHITECTURE_NODES.filter((node) => {
    const matchesLayer =
      selectedLayer === 'ALL' || node.layer === selectedLayer;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      node.name.toLowerCase().includes(q) ||
      node.titleUrdu.includes(q) ||
      node.summaryUrdu.includes(q) ||
      node.summaryEn.toLowerCase().includes(q);
    return matchesLayer && matchesSearch;
  });

  const activeNode =
    ARCHITECTURE_NODES.find((n) => n.id === selectedNodeId) ??
    ARCHITECTURE_NODES[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownloadBlueprint = () => {
    const lines: string[] = [
      '====================================================================',
      'SK BALOCHI KHATA & AI DATASET STUDIO - FULL PROJECT ARCHITECTURE',
      'Project Structure: تمام کمپونینٹس، DAO، ڈیٹا بیس، ویو ماڈل، اور سکرینز کا تفصیلی ٹری سٹرکچر',
      '====================================================================\n',
      FULL_ASCII_TREE,
      '\n====================================================================\n',
    ];

    for (const node of ARCHITECTURE_NODES) {
      lines.push(`### [${node.layer}] ${node.name} (${node.titleUrdu})`);
      lines.push(`Android Path: ${node.pathAndroid}`);
      lines.push(`Web Path:     ${node.pathWeb}`);
      lines.push(`Summary (EN): ${node.summaryEn}`);
      lines.push(`Summary (UR): ${node.summaryUrdu}\n`);
      lines.push(`--- Kotlin Implementation ---`);
      lines.push(node.kotlinCode);
      lines.push(`\n--- TypeScript Implementation ---`);
      lines.push(node.tsCode);
      lines.push(
        '\n--------------------------------------------------------------------\n'
      );
    }

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SK_Balochi_Full_Project_Structure_And_Code.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const displayedCode =
    codeLang === 'SQL'
      ? activeNode.sqlSchema ??
        ARCHITECTURE_NODES[0].sqlSchema ??
        activeNode.kotlinCode
      : codeLang === 'KOTLIN'
      ? activeNode.kotlinCode
      : activeNode.tsCode;

  return (
    <div className="space-y-8">
      {/* Header Banner with Bilingual Context */}
      <section className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
              <span>Clean MVVM Architecture</span>
              <span aria-hidden="true">·</span>
              <span>
                Database &rarr; DAO &rarr; ViewModel &rarr; Screens &rarr;
                Components
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Project Structure &amp; Complete Tree Hierarchy
            </h1>
            <p
              dir="rtl"
              className="text-base sm:text-lg text-[var(--primary)] font-semibold urdu"
            >
              Project Structure: تمام کمپونینٹس، DAO، ڈیٹا بیس، ویو ماڈل، اور
              سکرینز کا تفصیلی ٹری سٹرکچر۔
            </p>
            <p className="text-sm text-[var(--text-sec)] leading-relaxed">
              Explore the complete architectural blueprint below. Click any
              module in the tree to inspect its Database schema, DAO queries,
              ViewModel state, or UI Screen code in both Android (Kotlin / Room
              / Jetpack Compose) and Web (React / TypeScript).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy(FULL_ASCII_TREE, 'ascii-tree')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold transition-colors min-h-[40px]"
            >
              {copiedId === 'ascii-tree' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tree Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Tree Structure</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadBlueprint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] transition-colors min-h-[40px]"
            >
              <Download className="w-4 h-4 text-[var(--primary)]" />
              <span>Download Full Code (.txt)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('datasets')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] transition-colors min-h-[40px]"
            >
              <span>SK Balochi Datasets</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Architectural Layer Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[var(--border)]">
          {[
            {
              layer: 'DATABASE' as const,
              label: '01. Database',
              urdu: 'ڈیٹا بیس اور ٹیبلز',
              count: '2 Files · 4 Tables',
              icon: Database,
            },
            {
              layer: 'DAO' as const,
              label: '02. DAO Layer',
              urdu: 'ڈیٹا ایکسیس آبجیکٹس',
              count: '3 DAOs · 14 Queries',
              icon: Layers,
            },
            {
              layer: 'VIEWMODEL' as const,
              label: '03. ViewModel',
              urdu: 'ویو ماڈل کنٹرولر',
              count: '1 MVVM Store',
              icon: Cpu,
            },
            {
              layer: 'SCREENS' as const,
              label: '04. Screens',
              urdu: 'ایپ کی تمام سکرینز',
              count: '5 UI Screens',
              icon: Monitor,
            },
            {
              layer: 'COMPONENTS' as const,
              label: '05. Components',
              urdu: 'ری یوزایبل کمپونینٹس',
              count: '3 Shared Modules',
              icon: Box,
            },
            {
              layer: 'CONFIG' as const,
              label: '06. Gradle & Entry',
              urdu: 'گریڈل اور مین سیٹ اپ',
              count: 'Room + Hilt + Compose',
              icon: Code2,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedLayer === item.layer;
            return (
              <button
                key={item.layer}
                type="button"
                onClick={() =>
                  setSelectedLayer(isSelected ? 'ALL' : item.layer)
                }
                className={`text-left p-3.5 rounded-xl border transition-colors ${
                  isSelected
                    ? 'bg-[var(--primary-light)] border-[var(--primary)]'
                    : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {item.label}
                  </span>
                  <Icon className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <p className="text-xs text-[var(--primary)] urdu mt-1">
                  {item.urdu}
                </p>
                <p className="text-[11px] font-mono-num text-[var(--text-sec)] mt-1">
                  {item.count}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Split View: Left = Detailed Tree Hierarchy, Right = Live Module Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Tree & Filterable Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-[var(--primary)]" />
                  <span>Interactive Project Tree</span>
                </h2>
                <p className="text-xs text-[var(--text-sec)] urdu mt-0.5">
                  کسی بھی فائل پر کلک کر کے اس کی تفصیل اور کوڈ دیکھیں
                </p>
              </div>
              {selectedLayer !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedLayer('ALL')}
                  className="text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  Show All Layers
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative mt-4">
              <Search className="w-4 h-4 text-[var(--text-ter)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search DAO, Database, ViewModel, Screen..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:border-[var(--primary)] outline-none"
              />
            </div>

            {/* Grouped Tree Nodes */}
            <div className="mt-4 space-y-4">
              {(
                [
                  {
                    key: 'DATABASE',
                    label: 'database/',
                    urdu: 'ڈیٹا بیس لیئر',
                  },
                  {
                    key: 'DAO',
                    label: 'dao/',
                    urdu: 'ڈی اے او (DAO) لیئر',
                  },
                  {
                    key: 'VIEWMODEL',
                    label: 'viewmodel/',
                    urdu: 'ویو ماڈل (ViewModel) لیئر',
                  },
                  {
                    key: 'SCREENS',
                    label: 'screens/',
                    urdu: 'سکرینز (Screens) لیئر',
                  },
                  {
                    key: 'COMPONENTS',
                    label: 'components/',
                    urdu: 'کمپونینٹس (Components) لیئر',
                  },
                  {
                    key: 'CONFIG',
                    label: 'config/',
                    urdu: 'گریڈل اور مین سیٹ اپ',
                  },
                ] as const
              ).map((group) => {
                const groupNodes = filteredNodes.filter(
                  (n) => n.layer === group.key
                );
                if (groupNodes.length === 0) return null;

                return (
                  <div key={group.key} className="space-y-1.5">
                    <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[var(--surface-2)]">
                      <span className="text-xs font-mono-num font-semibold text-[var(--text)]">
                        ├── {group.label}
                      </span>
                      <span className="text-xs text-[var(--primary)] urdu">
                        {group.urdu}
                      </span>
                    </div>

                    <div className="pl-4 space-y-1">
                      {groupNodes.map((node, idx) => {
                        const isLast = idx === groupNodes.length - 1;
                        const isSelected = activeNode.id === node.id;
                        return (
                          <button
                            key={node.id}
                            type="button"
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-[var(--primary-light)] border-[var(--primary)]'
                                : 'bg-[var(--bg)] border-transparent hover:border-[var(--border)]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono-num text-[var(--text-ter)]">
                                  {isLast ? '└──' : '├──'}
                                </span>
                                <FileCode className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                                <span className="text-xs font-mono-num font-semibold text-[var(--text)] truncate">
                                  {node.name}
                                </span>
                              </div>
                              <p
                                dir="rtl"
                                className="text-xs text-[var(--text-sec)] urdu mt-1 pr-4"
                              >
                                {node.titleUrdu}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Copyable ASCII Tree Box */}
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">
                  Complete Directory Tree (ASCII)
                </h3>
                <p className="text-xs text-[var(--text-sec)] urdu">
                  مکمل فولڈر اور فائل ٹری سٹرکچر
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(FULL_ASCII_TREE, 'ascii-block')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
              >
                {copiedId === 'ascii-block' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Tree</span>
                  </>
                )}
              </button>
            </div>
            <pre className="mt-3 p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono-num text-[var(--text)] overflow-x-auto leading-relaxed">
              {FULL_ASCII_TREE}
            </pre>
          </div>
        </div>

        {/* Right Column: Detailed Inspector for Selected Node (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[var(--border)]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
                <span>{activeNode.layer}</span>
                <span aria-hidden="true">·</span>
                <span className="urdu">{activeNode.layerUrdu}</span>
              </div>
              <h2 className="text-xl font-bold text-[var(--text)] font-mono-num">
                {activeNode.name}
              </h2>
              <p className="text-base font-semibold text-[var(--primary)] urdu">
                {activeNode.titleUrdu}
              </p>
            </div>

            {activeNode.linkedTab && activeNode.linkedTab !== 'structure' && (
              <button
                type="button"
                onClick={() => onNavigateTab(activeNode.linkedTab!)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold transition-colors shrink-0 min-h-[40px]"
              >
                <span>Open Live Screen</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* File Paths in Android & Web */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <div className="text-[11px] font-medium text-[var(--text-sec)]">
                Android (Kotlin / Room / Compose) Path
              </div>
              <div className="text-xs font-mono-num text-[var(--text)] mt-1 break-all">
                {activeNode.pathAndroid}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <div className="text-[11px] font-medium text-[var(--text-sec)]">
                Web (React / TypeScript) Path
              </div>
              <div className="text-xs font-mono-num text-[var(--text)] mt-1 break-all">
                {activeNode.pathWeb}
              </div>
            </div>
          </div>

          {/* Bilingual Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <h3 className="text-xs font-semibold text-[var(--text-sec)] mb-1.5">
                Architectural Responsibility (English)
              </h3>
              <p className="text-sm text-[var(--text)] leading-relaxed">
                {activeNode.summaryEn}
              </p>
            </div>
            <div
              dir="rtl"
              className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
            >
              <h3 className="text-xs font-semibold text-[var(--text-sec)] urdu mb-1.5">
                تفصیلی کردار اور ذمہ داری (اردو)
              </h3>
              <p className="text-sm text-[var(--text)] urdu leading-relaxed">
                {activeNode.summaryUrdu}
              </p>
            </div>
          </div>

          {/* Exposed Methods, Queries, or Props */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-sec)] mb-2.5">
              Key Methods, Queries &amp; Properties (فنکشنز اور کیوریز)
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {activeNode.methodsOrProps.map((sig, i) => (
                <div
                  key={i}
                  className="px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs font-mono-num text-[var(--text)] flex items-center justify-between gap-2"
                >
                  <span>{sig}</span>
                  <span className="text-[11px] text-[var(--text-ter)]">
                    #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Implementation Preview with Language Switcher */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface-2)]">
                <button
                  type="button"
                  onClick={() => setCodeLang('KOTLIN')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    codeLang === 'KOTLIN'
                      ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                      : 'text-[var(--text-sec)] hover:text-[var(--text)]'
                  }`}
                >
                  Kotlin (Room / MVVM)
                </button>
                <button
                  type="button"
                  onClick={() => setCodeLang('TYPESCRIPT')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    codeLang === 'TYPESCRIPT'
                      ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                      : 'text-[var(--text-sec)] hover:text-[var(--text)]'
                  }`}
                >
                  TypeScript (React)
                </button>
                <button
                  type="button"
                  onClick={() => setCodeLang('SQL')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    codeLang === 'SQL'
                      ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                      : 'text-[var(--text-sec)] hover:text-[var(--text)]'
                  }`}
                >
                  SQLite Schema (DDL)
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy(displayedCode, `code-${activeNode.id}`)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
              >
                {copiedId === `code-${activeNode.id}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>Code Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-mono-num text-[var(--text)] overflow-x-auto leading-relaxed">
              {displayedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
