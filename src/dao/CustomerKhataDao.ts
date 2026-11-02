import { AppDatabase } from '../database/AppDatabase';
import { CustomerEntity, KhataEntryEntity } from '../database/entities';

export class CustomerKhataDao {
  private db = AppDatabase.getInstance();

  public getAllCustomers(): CustomerEntity[] {
    return [...this.db.getState().customers].sort(
      (a, b) => b.totalUdhaar - a.totalUdhaar
    );
  }

  public getEntriesForCustomer(customerId: string): KhataEntryEntity[] {
    return this.db
      .getState()
      .khataEntries.filter((entry) => entry.customerId === customerId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  public addCustomer(
    payload: Omit<CustomerEntity, 'id' | 'lastUpdated'>
  ): CustomerEntity {
    const today = new Date().toISOString().slice(0, 10);
    const customer: CustomerEntity = {
      ...payload,
      id: `cust-${Date.now()}`,
      lastUpdated: today,
    };

    this.db.updateState((prev) => {
      const khataEntries = [...prev.khataEntries];
      if (payload.totalUdhaar > 0) {
        khataEntries.unshift({
          id: `kh-${Date.now()}`,
          customerId: customer.id,
          amount: payload.totalUdhaar,
          entryType: 'GIVEN',
          description: 'Opening Udhaar Balance (ابتدائی ادھار کھاتہ)',
          date: today,
          billNo: `OPN-${Math.floor(100 + Math.random() * 900)}`,
        });
      }
      return {
        ...prev,
        customers: [customer, ...prev.customers],
        khataEntries,
      };
    });

    return customer;
  }

  public recordKhataEntry(
    payload: Omit<KhataEntryEntity, 'id'>
  ): KhataEntryEntity {
    const newEntry: KhataEntryEntity = {
      ...payload,
      id: `kh-${Date.now()}`,
    };

    this.db.updateState((prev) => {
      const updatedCustomers = prev.customers.map((c) => {
        if (c.id !== payload.customerId) return c;
        const delta =
          payload.entryType === 'GIVEN' ? payload.amount : -payload.amount;
        return {
          ...c,
          totalUdhaar: Math.max(0, c.totalUdhaar + delta),
          lastUpdated: payload.date,
        };
      });

      return {
        ...prev,
        customers: updatedCustomers,
        khataEntries: [newEntry, ...prev.khataEntries],
      };
    });

    return newEntry;
  }

  public deleteCustomer(customerId: string): void {
    this.db.updateState((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== customerId),
      khataEntries: prev.khataEntries.filter(
        (k) => k.customerId !== customerId
      ),
    }));
  }

  public getTotalReceivableUdhaar(): number {
    return this.db
      .getState()
      .customers.reduce((acc, c) => acc + Math.max(0, c.totalUdhaar), 0);
  }
}

export const customerKhataDao = new CustomerKhataDao();
