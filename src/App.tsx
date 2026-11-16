/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TopBar, ScreenTab } from './components/TopBar';
import { TransactionModal } from './components/TransactionModal';
import { CustomerModal } from './components/CustomerModal';
import { useAppViewModel } from './viewmodel/useAppViewModel';
import { ProjectStructureScreen } from './screens/ProjectStructureScreen';
import { RoznamchaScreen } from './screens/RoznamchaScreen';
import { UdhaarKhataScreen } from './screens/UdhaarKhataScreen';
import { DatasetStudioScreen } from './screens/DatasetStudioScreen';
import { ReportsScreen } from './screens/ReportsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('structure');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [txModalDefaults, setTxModalDefaults] = useState<{
    type?: 'SALE' | 'EXPENSE';
    paymentMode?: 'CASH' | 'ONLINE' | 'UDHAAR';
  }>({
    type: 'SALE',
    paymentMode: 'CASH',
  });

  const vm = useAppViewModel();

  const handleOpenTransactionModal = (
    type: 'SALE' | 'EXPENSE' = 'SALE',
    paymentMode: 'CASH' | 'ONLINE' | 'UDHAAR' = 'CASH'
  ) => {
    setTxModalDefaults({ type, paymentMode });
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] pb-28 md:pb-12">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickAddTransaction={() => handleOpenTransactionModal('SALE', 'CASH')}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'structure' && (
          <ProjectStructureScreen onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'roznamcha' && (
          <RoznamchaScreen
            transactions={vm.transactions}
            summaryMetrics={vm.summaryMetrics}
            txFilter={vm.txFilter}
            setTxFilter={vm.setTxFilter}
            txSearch={vm.txSearch}
            setTxSearch={vm.setTxSearch}
            onOpenNewEntry={() => handleOpenTransactionModal('SALE', 'CASH')}
            onOpenNewEntryWithType={handleOpenTransactionModal}
            onDeleteTransaction={vm.removeTransaction}
            onNavigateTab={setActiveTab}
            totalCustomersCount={vm.customers.length}
          />
        )}

        {activeTab === 'khata' && (
          <UdhaarKhataScreen
            customers={vm.customers}
            customerSearch={vm.customerSearch}
            setCustomerSearch={vm.setCustomerSearch}
            selectedCustomer={vm.selectedCustomer}
            onSelectCustomer={vm.setSelectedCustomerId}
            selectedCustomerEntries={vm.selectedCustomerEntries}
            onOpenNewCustomerModal={() => setIsCustomerModalOpen(true)}
            onAddKhataEntry={vm.addKhataEntry}
            onDeleteCustomer={vm.removeCustomer}
          />
        )}

        {activeTab === 'datasets' && (
          <DatasetStudioScreen
            datasets={vm.datasets}
            cloudTopics={vm.cloudTopics}
            onAddPromptWorkflow={vm.addPromptWorkflow}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsScreen
            allTransactions={vm.allTransactions}
            customers={vm.customers}
            summaryMetrics={vm.summaryMetrics}
            onResetDemoData={vm.resetDemoData}
          />
        )}
      </main>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={vm.addTransaction}
        initialType={txModalDefaults.type}
        initialPaymentMode={txModalDefaults.paymentMode}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSaveCustomer={vm.addCustomer}
      />
    </div>
  );
}

