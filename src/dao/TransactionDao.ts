import { AppDatabase } from '../database/AppDatabase';
import { TransactionEntity, TransactionType } from '../database/entities';

export class TransactionDao {
  private db = AppDatabase.getInstance();

  public getAllTransactions(): TransactionEntity[] {
    return [...this.db.getState().transactions].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }

  public getTransactionsByType(type: TransactionType): TransactionEntity[] {
    return this.getAllTransactions().filter((tx) => tx.type === type);
  }

  public insertTransaction(
    payload: Omit<TransactionEntity, 'id'>
  ): TransactionEntity {
    const newTx: TransactionEntity = {
      ...payload,
      id: `tx-${Date.now()}`,
    };
    this.db.updateState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
    return newTx;
  }

  public deleteTransaction(id: string): void {
    this.db.updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }

  public getSummaryMetrics(): {
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    cashInHand: number;
    todaySales: number;
    todayExpenses: number;
  } {
    const transactions = this.db.getState().transactions;
    const latestDate = transactions[0]?.date ?? '2026-11-02';

    let totalSales = 0;
    let totalExpenses = 0;
    let cashInHand = 0;
    let todaySales = 0;
    let todayExpenses = 0;

    for (const tx of transactions) {
      if (tx.type === 'SALE') {
        totalSales += tx.amount;
        if (tx.paymentMode === 'CASH') cashInHand += tx.amount;
        if (tx.date === latestDate) todaySales += tx.amount;
      } else {
        totalExpenses += tx.amount;
        if (tx.paymentMode === 'CASH') cashInHand -= tx.amount;
        if (tx.date === latestDate) todayExpenses += tx.amount;
      }
    }

    return {
      totalSales,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
      cashInHand,
      todaySales,
      todayExpenses,
    };
  }
}

export const transactionDao = new TransactionDao();
