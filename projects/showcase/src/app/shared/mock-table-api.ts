import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  country: string;
  company: string;
  balance: number;
}

export interface CustomerPage {
  data: Customer[];
  totalRecords: number;
}

const FIRST_NAMES = ['Amy', 'Anna', 'Ben', 'Carla', 'David', 'Elena', 'Frank', 'Greta', 'Henry', 'Ivy', 'James', 'Klara', 'Liam', 'Mara', 'Noah', 'Olivia', 'Paul', 'Rosa', 'Sam', 'Tina'];
const LAST_NAMES = ['Adams', 'Baker', 'Carter', 'Diaz', 'Evans', 'Fischer', 'Gruber', 'Huber', 'Keller', 'Lang', 'Meyer', 'Novak', 'Ortega', 'Peters', 'Quinn', 'Richter', 'Schmid', 'Tanaka', 'Ustinov', 'Vogel'];
const COUNTRIES = ['Austria', 'Brazil', 'Canada', 'France', 'Germany', 'India', 'Italy', 'Japan', 'Spain', 'USA'];
const COMPANIES = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries', 'Wayne Enterprises', 'Hooli', 'Vandelay', 'Cyberdyne', 'Wonka'];

/** Deterministic in-memory dataset served by the mock endpoint. */
const CUSTOMERS: Customer[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `${FIRST_NAMES[(i * 7) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 13 + Math.floor(i / 20)) % LAST_NAMES.length]}`,
  country: COUNTRIES[(i * 3 + Math.floor(i / 20) * 7) % COUNTRIES.length],
  company: COMPANIES[(i * 11 + Math.floor(i / 20) * 3) % COMPANIES.length],
  balance: ((i * 7919) % 100000) / 10,
}));

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  return (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : 0;
}

/**
 * Simulates a paginating REST endpoint at `GET /api/customers` so the table
 * demo can show server-side mode with `httpResource`. Supports the query
 * params `first`, `rows`, `sortField`, `sortOrder` and `filter`, and responds
 * with `{ data, totalRecords }` after a short artificial latency.
 */
export const mockTableApi: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/customers')) {
    return next(req);
  }
  const first = Number(req.params.get('first') ?? 0);
  const rows = Number(req.params.get('rows') ?? 10);
  const sortField = req.params.get('sortField') as keyof Customer | null;
  const sortOrder = Number(req.params.get('sortOrder') ?? 1);
  const filter = (req.params.get('filter') ?? '').trim().toLowerCase();

  let data = CUSTOMERS;
  if (filter) {
    data = data.filter((customer) =>
      [customer.name, customer.country, customer.company].some((value) =>
        value.toLowerCase().includes(filter),
      ),
    );
  }
  if (sortField) {
    data = [...data].sort((a, b) => sortOrder * compare(a[sortField], b[sortField]));
  }
  const body: CustomerPage = { data: data.slice(first, first + rows), totalRecords: data.length };
  return of(new HttpResponse({ status: 200, body })).pipe(delay(400));
};
