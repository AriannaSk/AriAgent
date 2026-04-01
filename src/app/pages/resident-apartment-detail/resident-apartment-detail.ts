import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ApartmentService } from '../../services/apartment.service';
import { Apartment } from '../../services/apartment';
import { Invoice, InvoiceService } from '../billing/invoice.service';

@Component({
  selector: 'app-resident-apartment-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resident-apartment-detail.html',
  styleUrls: ['./resident-apartment-detail.css']
})
export class ResidentApartmentDetail implements OnInit {
  readonly apartment = signal<Apartment | null>(null);
  readonly invoices = signal<Invoice[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apartmentService: ApartmentService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/resident/dashboard']);
      return;
    }

    this.loadApartment(id);
    this.loadInvoices(id);
  }

  private loadApartment(id: string): void {
    this.apartmentService.getMyApartmentById(id).subscribe({
      next: (data: Apartment) => {
        this.apartment.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Unable to load apartment');
        this.loading.set(false);
      }
    });
  }

  private loadInvoices(id: string): void {
    this.invoiceService.getMyInvoicesByApartment(id).subscribe({
      next: (data: Invoice[]) => {
        this.invoices.set(data ?? []);
      },
      error: (err: unknown) => {
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/resident/dashboard']);
  }

  addressText(ap: Apartment | null): string {
  if (!ap) return 'Address unavailable';

  const raw = ap as unknown as Record<string, unknown>;
  const residents = raw['iedzivotaji'] as Array<Record<string, unknown>> | undefined;

  if (residents?.length) {
    const firstResident = residents[0];
    const dzivokli = firstResident['dzivokli'] as Array<Record<string, unknown>> | undefined;

    if (dzivokli?.length) {
      const address = dzivokli[0]['majaNosaukums'];
      if (typeof address === 'string' && address.trim()) {
        return address.trim();
      }
    }
  }

  return 'Address unavailable';
}
}