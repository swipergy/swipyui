import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CustomerPage, mockTableApi } from './mock-table-api';

describe('mockTableApi', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockTableApi]))],
    });
    http = TestBed.inject(HttpClient);
  });

  function fetchPage(params: Record<string, string | number>): Promise<CustomerPage> {
    return firstValueFrom(http.get<CustomerPage>('/api/customers', { params }));
  }

  it('returns the requested page slice and the total count', async () => {
    const page = await fetchPage({ first: 0, rows: 5 });
    expect(page.data.length).toBe(5);
    expect(page.totalRecords).toBe(200);

    const next = await fetchPage({ first: 5, rows: 5 });
    expect(next.data.length).toBe(5);
    expect(next.data[0].id).not.toBe(page.data[0].id);
  });

  it('sorts by the requested field and order', async () => {
    const asc = await fetchPage({ first: 0, rows: 200, sortField: 'balance', sortOrder: 1 });
    const balances = asc.data.map((customer) => customer.balance);
    expect(balances).toEqual([...balances].sort((a, b) => a - b));

    const desc = await fetchPage({ first: 0, rows: 1, sortField: 'balance', sortOrder: -1 });
    expect(desc.data[0].balance).toBe(balances[balances.length - 1]);
  });

  it('filters across name, country and company before paginating', async () => {
    const filtered = await fetchPage({ first: 0, rows: 200, filter: 'germany' });
    expect(filtered.totalRecords).toBeGreaterThan(0);
    expect(filtered.totalRecords).toBeLessThan(200);
    expect(filtered.data.every((customer) => customer.country === 'Germany')).toBe(true);
  });

  it('clamps past-the-end pages to an empty slice with the correct total', async () => {
    const page = await fetchPage({ first: 1000, rows: 10 });
    expect(page.data).toEqual([]);
    expect(page.totalRecords).toBe(200);
  });
});
