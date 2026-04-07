import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { ResidentService, Resident } from '../../services/resident.service';
import { ApartmentService } from '../../services/apartment.service';
import { Apartment } from '../../services/apartment';
import { Invoice, InvoiceService } from '../billing/invoice.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resident-dashboard.html',
  styleUrls: ['./resident-dashboard.css']
})
export class ResidentDashboardComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal('');

  readonly resident = signal<Resident | null>(null);
  readonly apartments = signal<Apartment[]>([]);
  readonly latestInvoices = signal<Invoice[]>([]);

  readonly firstApartment = computed<Apartment | null>(() => {
    const list = this.apartments();
    return list.length > 0 ? list[0] : null;
  });

  readonly invoices = computed<Invoice[]>(() => this.latestInvoices());

  readonly latestInvoice = computed<Invoice | null>(() => {
    const list = this.latestInvoices();
    return list.length > 0 ? list[0] : null;
  });

  readonly unpaidInvoicesCount = computed<number>(() => {
    return this.latestInvoices().filter((invoice) => !this.invoicePaid(invoice)).length;
  });

  readonly residentFullName = computed<string>(() => {
    const r = this.resident();
    if (!r) return 'Resident';

    const raw = r as unknown as Record<string, unknown>;
    const first = this.asText(raw['vards']);
    const last = this.asText(raw['uzvards']);

    const full = `${first} ${last}`.trim();
    return full || 'Resident';
  });

  readonly residentPersonalCode = computed<string>(() => {
    const r = this.resident();
    if (!r) return 'Not provided';

    const raw = r as unknown as Record<string, unknown>;
    return this.asText(raw['personasKods']) || 'Not provided';
  });

  readonly residentEmail = computed<string>(() => {
    const r = this.resident();
    if (!r) return 'Not provided';

    const raw = r as unknown as Record<string, unknown>;
    return this.asText(raw['epasts']) || 'Not provided';
  });

  readonly residentPhone = computed<string>(() => {
    const r = this.resident();
    if (!r) return 'Not provided';

    const raw = r as unknown as Record<string, unknown>;
    return this.asText(raw['telefons']) || 'Not provided';
  });

  readonly userInitials = computed<string>(() => {
    const r = this.resident();
    if (!r) return 'R';

    const raw = r as unknown as Record<string, unknown>;
    const first = (
      this.asText(raw['name']) ||
      this.asText(raw['vards']) ||
      'R'
    ).charAt(0);

    const last = (
      this.asText(raw['surname']) ||
      this.asText(raw['uzvards']) ||
      ''
    ).charAt(0);

    return `${first}${last}`.toUpperCase();
  });

  readonly apartmentNumbersText = computed<string>(() => {
    return this.apartments()
      .map(a => `#${a.numurs}`)
      .join(', ');
  });

  constructor(
    private residentService: ResidentService,
    private apartmentService: ApartmentService,
    private invoiceService: InvoiceService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    this.residentService.getMe().subscribe({
      next: (residentData) => {
        this.resident.set(residentData);

        this.apartmentService.getMyApartments().subscribe({
          next: (apartmentData) => {
            const apartments = apartmentData ?? [];
            this.apartments.set(apartments);

            if (apartments.length === 0) {
              this.latestInvoices.set([]);
              this.loading.set(false);
              return;
            }

            // invoices пока оставляем по первой квартире, чтобы не ломать текущую логику
            const firstApartment = apartments[0];

            this.invoiceService.getMyInvoicesByApartment(firstApartment.id).subscribe({
              next: (invoiceData) => {
                const sorted = [...(invoiceData ?? [])].sort((a, b) =>
                  (b.period ?? '').localeCompare(a.period ?? '')
                );

                this.latestInvoices.set(sorted);
                this.loading.set(false);
              },
              error: (err) => {
                console.error('Invoices error:', err);
                this.latestInvoices.set([]);
                this.loading.set(false);
              }
            });
          },
          error: (err) => {
            console.error('Apartments error:', err);
            this.error.set('Failed to load apartments');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Resident error:', err);
        this.error.set('Failed to load resident profile');
        this.loading.set(false);
      }
    });
  }

  houseAddress(apartment: Apartment): string {
    const ap = apartment as any;
    if (!ap) return 'Address unavailable';

    const directAddress =
      ap?.majaNosaukums ||
      ap?.maja?.adrese ||
      ap?.adrese ||
      ap?.houseAddress ||
      ap?.address;

    if (directAddress && String(directAddress).trim()) {
      return String(directAddress).trim();
    }

    const iela = ap?.maja?.iela || ap?.maja?.street || '';
    const majasNumurs =
      ap?.maja?.majasNumurs ||
      ap?.maja?.numurs ||
      ap?.maja?.houseNumber ||
      '';
    const pilseta = ap?.maja?.pilseta || ap?.maja?.city || '';

    const full = [iela, majasNumurs, pilseta].filter(Boolean).join(', ').trim();
    return full || 'Address unavailable';
  }

  openProfile(): void {
    this.router.navigate(['/resident/profile']);
  }

  openApartment(): void {
    this.router.navigate(['/resident/profile']);
  }

  openInvoices(): void {
    this.router.navigate(['/resident/invoices']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  invoicePaid(invoice: Invoice | null | undefined): boolean {
    if (!invoice) return false;

    const raw = invoice as unknown as Record<string, unknown>;

    const direct = raw['isPaid'];
    if (typeof direct === 'boolean') return direct;

    const status = this.asText(raw['status']).toLowerCase();
    if (status === 'paid') return true;
    if (status === 'unpaid' || status === 'overdue') return false;

    return false;
  }

  private asText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}