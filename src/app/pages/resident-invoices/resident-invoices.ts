import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApartmentService } from '../../services/apartment.service';
import { Apartment } from '../../services/apartment';
import { Invoice, InvoiceService } from '../billing/invoice.service';
import { ServiceService, Service } from '../../services/service.service';
import {
  BillingInputService,
  BillingInputSaveDto
} from '../../services/billing-input.service';

type ValidationErrors = {
  apartmentId?: string;
  period?: string;
  waterM3?: string;
  electricityKwh?: string;
  residentsCount?: string;
};

type BillingForm = {
  waterM3: number | null;
  electricityKwh: number | null;
  residentsCount: number | null;
};

type CalculationPreviewLine = {
  serviceName: string;
  formulaLabel: string;
  baseValueText: string;
  tariff: number;
  baseAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
};

@Component({
  selector: 'app-resident-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resident-invoices.html',
  styleUrls: ['./resident-invoices.css']
})
export class ResidentInvoicesComponent implements OnInit {
  readonly apartments = signal<Apartment[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly services = signal<Service[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly saving = signal(false);
  readonly showValidation = signal(false);

  readonly billingForm = signal<BillingForm>({
    waterM3: null,
    electricityKwh: null,
    residentsCount: null
  });

  readonly validationErrors = signal<ValidationErrors>({});

  selectedApartmentId = '';
  selectedPeriod = '';

  constructor(
    private router: Router,
    private apartmentService: ApartmentService,
    private invoiceService: InvoiceService,
    private serviceService: ServiceService,
    private billingInputService: BillingInputService
  ) {}

  ngOnInit(): void {
    this.selectedPeriod = this.getCurrentMonth();
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.apartmentService.getMyApartments().subscribe({
      next: (apartments: Apartment[]) => {
        this.apartments.set(apartments ?? []);

        this.serviceService.getAll().subscribe({
          next: (services: Service[]) => {
            this.services.set(services ?? []);

            if (this.apartments().length > 0) {
              this.selectedApartmentId = String(this.apartments()[0].id ?? '');
              this.prefillDefaultResidentsCount();
              this.loadInvoicesForSelectedApartment();
              this.loadExistingBillingInput();
            }

            this.loading.set(false);
          },
          error: (err: unknown) => {
            console.error(err);
            this.error.set('Unable to load services');
            this.loading.set(false);
          }
        });
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Unable to load billing data');
        this.loading.set(false);
      }
    });
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private loadInvoicesForSelectedApartment(): void {
    if (!this.selectedApartmentId) {
      this.invoices.set([]);
      return;
    }

    this.invoiceService.getMyInvoicesByApartment(this.selectedApartmentId).subscribe({
      next: (data: Invoice[]) => {
        const filtered = (data ?? []).filter(
          x => !this.selectedPeriod || x.period === this.selectedPeriod
        );

        const sorted = [...filtered].sort((a, b) =>
          (b.period || '').localeCompare(a.period || '')
        );

        this.invoices.set(sorted);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Unable to load invoices');
      }
    });
  }

  private loadExistingBillingInput(): void {
    if (!this.selectedApartmentId || !this.selectedPeriod) {
      return;
    }

    this.billingInputService
      .getByApartmentAndPeriod(this.selectedApartmentId, this.selectedPeriod)
      .subscribe({
        next: (data) => {
          this.billingForm.set({
            waterM3: Number(data.waterM3) || 0,
            electricityKwh: Number(data.electricityKwh) || 0,
            residentsCount: Number(data.residentsCount) || 0
          });
        },
        error: () => {
          this.prefillDefaultResidentsCount();
        }
      });
  }

  private prefillDefaultResidentsCount(): void {
    const apartment = this.apartments().find(
      a => String(a.id) === String(this.selectedApartmentId)
    ) as any;

    this.billingForm.set({
      waterM3: 0,
      electricityKwh: 0,
      residentsCount:
        Array.isArray(apartment?.iedzivotaji)
          ? apartment.iedzivotaji.length
          : Number(apartment?.iedzivotajuSkaits ?? 0)
    });
  }

  goBack(): void {
    this.router.navigate(['/resident/dashboard']);
  }

  onApartmentOrPeriodChange(): void {
    this.success.set('');
    this.error.set('');
    this.validate();
    this.loadInvoicesForSelectedApartment();
    this.loadExistingBillingInput();
  }

  updateBillingField(field: keyof BillingForm, value: unknown): void {
    const num = value === '' || value == null ? null : Number(value);

    this.billingForm.update(current => ({
      ...current,
      [field]: Number.isNaN(num) ? null : num
    }));

    this.validate();
  }

  private validate(): boolean {
    const errors: ValidationErrors = {};
    const form = this.billingForm();

    if (!this.selectedApartmentId) {
      errors.apartmentId = 'Please select apartment';
    }

    if (!this.selectedPeriod || !/^\d{4}-\d{2}$/.test(this.selectedPeriod)) {
      errors.period = 'Use format YYYY-MM';
    }

    if (form.waterM3 == null || form.waterM3 < 0) {
      errors.waterM3 = 'Enter valid water usage';
    }

    if (form.electricityKwh == null || form.electricityKwh < 0) {
      errors.electricityKwh = 'Enter valid electricity usage';
    }

    if (form.residentsCount == null || form.residentsCount < 0) {
      errors.residentsCount = 'Enter valid residents count';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  submitBillingInput(): void {
    this.showValidation.set(true);
    this.success.set('');
    this.error.set('');

    if (!this.validate()) {
      this.error.set('Please correct the highlighted fields');
      return;
    }

    this.saving.set(true);

    const form = this.billingForm();

    const dto: BillingInputSaveDto = {
      apartmentId: this.selectedApartmentId,
      period: this.selectedPeriod,
      waterM3: Number(form.waterM3 ?? 0),
      electricityKwh: Number(form.electricityKwh ?? 0),
      residentsCount: Number(form.residentsCount ?? 0),
      comment: ''
    };

    this.billingInputService.save(dto).subscribe({
      next: () => {
        this.loadExistingBillingInput();
        this.loadInvoicesForSelectedApartment();

        this.success.set('Billing data and invoice saved successfully');
        this.saving.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.error.set(err?.error?.message || 'Failed to save billing data');
        this.saving.set(false);
      }
    });
  }

  readonly unpaidCount = computed(() => {
    return this.invoices().filter((invoice: any) => {
      const status = String(invoice?.status ?? '').toLowerCase();
      return status === 'unpaid' || status === 'pending' || status === 'overdue';
    }).length;
  });

  readonly latestAmountText = computed(() => {
    const first = this.invoices()[0] as any;
    const total = first?.total;

    if (typeof total === 'number') {
      return `${total.toFixed(2)} €`;
    }

    return '—';
  });

  waterUsagePreview(): number {
    return Number(this.billingForm().waterM3 ?? 0);
  }

  electricityUsagePreview(): number {
    return Number(this.billingForm().electricityKwh ?? 0);
  }

  residentsCountPreview(): number {
    return Number(this.billingForm().residentsCount ?? 0);
  }

  calculationPreviewLines(): CalculationPreviewLine[] {
    const form = this.billingForm();
    const apartment = this.apartments().find(
      ap => String((ap as any).id) === String(this.selectedApartmentId)
    ) as any;

    if (!apartment || !this.selectedPeriod) {
      return [];
    }

    const water = Number(form.waterM3 ?? 0);
    const electricity = Number(form.electricityKwh ?? 0);
    const residents = Number(form.residentsCount ?? 0);
    const livingArea = Number(apartment?.dzivojamaPlatiba ?? 0);

    return this.services().map((service: Service) => {
      const formula = String(service.formula ?? '').trim().toLowerCase();
      const name = String(service.nosaukums ?? '');
      const tariff = Number(service.tarifs ?? 0);
      const taxPercent = Number(service.nodoklis ?? 0);

      let baseAmount = 0;
      let baseValueText = '';
      let formulaLabel = '';

      if (formula === 'fixed') {
        formulaLabel = 'Tariff';
        baseAmount = tariff;
        baseValueText = `Tariff ${tariff.toFixed(2)}`;
      } else if (formula === 'maintenance') {
        const fullArea = Number(apartment?.pilnaPlatiba ?? 0);
        formulaLabel = 'Full area × tariff';
        baseAmount = fullArea * tariff;
        baseValueText = `${fullArea} × ${tariff.toFixed(2)}`;
      } else if (formula === 'residents * tariff') {
        formulaLabel = 'Residents count × tariff';
        baseAmount = residents * tariff;
        baseValueText = `${residents} × ${tariff.toFixed(2)}`;
      } else if (formula === 'area * tariff') {
        formulaLabel = 'Living area × tariff';
        baseAmount = livingArea * tariff;
        baseValueText = `${livingArea} × ${tariff.toFixed(2)}`;
      } else if (formula === 'usage * tariff') {
        if (
          service.type === 4 ||
          name.toLowerCase().includes('water') ||
          name.toLowerCase().includes('ūdens') ||
          name.toLowerCase().includes('udens')
        ) {
          formulaLabel = 'Water m³ × tariff';
          baseAmount = water * tariff;
          baseValueText = `${water} × ${tariff.toFixed(2)}`;
        } else if (
          service.type === 0 ||
          name.toLowerCase().includes('electric') ||
          name.toLowerCase().includes('elektr')
        ) {
          formulaLabel = 'Electricity kWh × tariff';
          baseAmount = electricity * tariff;
          baseValueText = `${electricity} × ${tariff.toFixed(2)}`;
        } else {
          formulaLabel = 'Usage × tariff';
          baseAmount = 0;
          baseValueText = `0 × ${tariff.toFixed(2)}`;
        }
      } else {
        formulaLabel = formula || '-';
        baseAmount = 0;
        baseValueText = '-';
      }

      const taxAmount = +(baseAmount * taxPercent / 100).toFixed(2);
      const totalAmount = +(baseAmount + taxAmount).toFixed(2);

      return {
        serviceName: name,
        formulaLabel,
        baseValueText,
        tariff,
        baseAmount: +baseAmount.toFixed(2),
        taxPercent,
        taxAmount,
        totalAmount
      };
    });
  }

  calculationPreviewTotal(): number {
    return this.calculationPreviewLines()
      .reduce((sum, line) => sum + line.totalAmount, 0);
  }

  getApartmentNumber(apartmentId: string | number): string {
    const found = this.apartments().find((ap: any) => String(ap.id) === String(apartmentId));
    return found ? `#${found.numurs}` : '—';
  }

  openInvoice(id: string | number | undefined): void {
    if (id == null) return;
    this.router.navigate(['/invoice', id]);
  }
}