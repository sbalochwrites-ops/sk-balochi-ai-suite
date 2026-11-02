import { useEffect, useState, useMemo } from 'react';
import { AppDatabase } from '../database/AppDatabase';
import { transactionDao } from '../dao/TransactionDao';
import { customerKhataDao } from '../dao/CustomerKhataDao';
import { datasetDao } from '../dao/DatasetDao';
import {
  CustomerEntity,
  KhataEntryEntity,
  TransactionEntity,
  TransactionType,
} from '../database/entities';

export function useAppViewModel() {
  const db = useMemo(() => AppDatabase.getInstance(), []);
  const [version, setVersion] = useState(0);

  // Filter states for Roznamcha
  const [txFilter, setTxFilter] = useState<'ALL' | TransactionType>('ALL');
  const [txSearch, setTxSearch] = useState('');

  // Filter states for Udhaar Khata
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-1');

  useEffect(() => {
    return db.subscribe(() => {
      setVersion((v) => v + 1);
    });
  }, [db]);

  const allTransactions = useMemo(
    () => transactionDao.getAllTransactions(),
    [version]
  );

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchesType = txFilter === 'ALL' || tx.type === txFilter;
      const q = txSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        tx.title.toLowerCase().includes(q) ||
        tx.titleUrdu.includes(q) ||
        tx.category.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [allTransactions, txFilter, txSearch]);

  const summaryMetrics = useMemo(() => {
    const base = transactionDao.getSummaryMetrics();
    const totalUdhaarReceivable = customerKhataDao.getTotalReceivableUdhaar();
    return {
      ...base,
      totalUdhaarReceivable,
    };
  }, [version]);

  const customers = useMemo(() => {
    const all = customerKhataDao.getAllCustomers();
    const q = customerSearch.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameUrdu.includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [version, customerSearch]);

  const selectedCustomer: CustomerEntity | undefined = useMemo(() => {
    const all = customerKhataDao.getAllCustomers();
    return all.find((c) => c.id === selectedCustomerId) ?? all[0];
  }, [version, selectedCustomerId]);

  const selectedCustomerEntries: KhataEntryEntity[] = useMemo(() => {
    if (!selectedCustomer) return [];
    return customerKhataDao.getEntriesForCustomer(selectedCustomer.id);
  }, [version, selectedCustomer]);

  const datasets = useMemo(() => datasetDao.getAllDatasets(), [version]);
  const cloudTopics = useMemo(
    () => datasetDao.getCloudAssistTopics(),
    [version]
  );

  // Actions exposed by ViewModel
  const addTransaction = (payload: Omit<TransactionEntity, 'id'>) => {
    transactionDao.insertTransaction(payload);
  };

  const removeTransaction = (id: string) => {
    transactionDao.deleteTransaction(id);
  };

  const addCustomer = (
    payload: Omit<CustomerEntity, 'id' | 'lastUpdated'>
  ) => {
    const created = customerKhataDao.addCustomer(payload);
    setSelectedCustomerId(created.id);
  };

  const addKhataEntry = (payload: Omit<KhataEntryEntity, 'id'>) => {
    customerKhataDao.recordKhataEntry(payload);
  };

  const removeCustomer = (id: string) => {
    customerKhataDao.deleteCustomer(id);
  };

  const addPromptWorkflow = (
    datasetId: string,
    prompt: {
      title: string;
      promptText: string;
      variables: string[];
      expectedOutput: string;
    }
  ) => {
    datasetDao.addPromptToDataset(datasetId, prompt);
  };

  const resetDemoData = () => {
    db.resetDatabase();
  };

  return {
    // Roznamcha state & actions
    transactions: filteredTransactions,
    allTransactions,
    txFilter,
    setTxFilter,
    txSearch,
    setTxSearch,
    summaryMetrics,
    addTransaction,
    removeTransaction,

    // Khata state & actions
    customers,
    customerSearch,
    setCustomerSearch,
    selectedCustomer,
    setSelectedCustomerId,
    selectedCustomerEntries,
    addCustomer,
    addKhataEntry,
    removeCustomer,

    // Datasets & Cloud Assist
    datasets,
    cloudTopics,
    addPromptWorkflow,
    resetDemoData,
  };
}
