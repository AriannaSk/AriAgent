import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InvoiceService, Invoice } from './invoice.service';
import { ServiceService, Service } from '../../services/service.service';
import { ApartmentService } from '../../services/apartment.service';
import { HouseService, House } from '../../services/house';
import { AuthService } from '../../services/auth.service';
import {
  BillingInputService,
  BillingInput,
  BillingInputSaveDto
} from '../../services/billing-input.service';

interface ApartmentInfo {
  id: string;
  numurs: number;
  stavs: number;
  istabuSkaits: number;
  iedzivotajuSkaits: number;
  pilnaPlatiba: number;
  dzivojamaPlatiba: number;
  lodzijasPlatiba: number;
  majaId: string;
  iedzivotaji: any[];
}

interface InvoiceLine {
  serviceName: string;
  formulaLabel: string;
  baseValueText: string;
  tariff: number;
  baseAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
}

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-detail.html',
  styleUrls: ['./invoice-detail.css']
})
export class InvoiceDetail implements OnInit {
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly editMode = signal(false);

  readonly invoice = signal<Invoice | null>(null);
  readonly apartment = signal<ApartmentInfo | null>(null);
  readonly house = signal<House | null>(null);
  readonly services = signal<Service[]>([]);
  readonly billingInput = signal<BillingInput | null>(null);

  editForm = {
    waterM3: 0,
    electricityKwh: 0,
    residentsCount: 0
  };

  readonly residentNames = computed(() => {
    const apartment = this.apartment();

    if (!apartment || !Array.isArray(apartment.iedzivotaji)) {
      return [];
    }

    const names = apartment.iedzivotaji
      .map((r: any) => {
        const fullName = `${r?.vards ?? ''} ${r?.uzvards ?? ''}`.trim();
        if (fullName) return fullName;
        return r?.name ?? r?.fullName ?? r?.epasts ?? 'Unknown resident';
      })
      .filter((name: string) => !!name);

    return [...new Set(names)];
  });

  readonly lines = computed<InvoiceLine[]>(() => {
    const apartment = this.apartment();
    const services = this.services();
    const input = this.billingInput();

    if (!apartment || services.length === 0) return [];

    return services.map(service => {
      const formula = this.resolveFormulaKey(service.formula);
      const tariff = Number(service.tarifs) || 0;
      const taxPercent = Number(service.nodoklis) || 0;
      const serviceName = (service.nosaukums ?? '').trim();
      const serviceNameLower = serviceName.toLowerCase();

      let baseAmount = 0;
      let baseValueText = '';
      let formulaLabel = this.getFormulaLabel(service.formula);

      if (formula === 'fixed') {
        formulaLabel = 'Tariff';
        baseAmount = tariff;
        baseValueText = `Tariff ${tariff.toFixed(2)}`;
      } else if (formula === 'maintenance') {
        const fullArea = Number(apartment.pilnaPlatiba) || 0;
        formulaLabel = 'Full area × tariff';
        baseAmount = fullArea * tariff;
        baseValueText = `${fullArea} × ${tariff.toFixed(2)}`;
      } else if (formula === 'area * tariff') {
        const livingArea = Number(apartment.dzivojamaPlatiba) || 0;
        formulaLabel = 'Living area × tariff';
        baseAmount = livingArea * tariff;
        baseValueText = `${livingArea} × ${tariff.toFixed(2)}`;
      } else if (formula === 'residents * tariff') {
        const residents = Number(
          input?.residentsCount ?? this.getApartmentResidentsBase(apartment)
        ) || 0;
        formulaLabel = 'Residents count × tariff';
        baseAmount = residents * tariff;
        baseValueText = `${residents} × ${tariff.toFixed(2)}`;
      } else if (formula === 'usage * tariff') {
        if (
          service.type === 4 ||
          serviceNameLower.includes('water') ||
          serviceNameLower.includes('ūdens') ||
          serviceNameLower.includes('udens')
        ) {
          const water = Number(input?.waterM3) || 0;
          formulaLabel = 'Water m³ × tariff';
          baseAmount = water * tariff;
          baseValueText = `${water} × ${tariff.toFixed(2)}`;
        } else if (
          service.type === 0 ||
          serviceNameLower.includes('electric') ||
          serviceNameLower.includes('elektr')
        ) {
          const electricity = Number(input?.electricityKwh) || 0;
          formulaLabel = 'Electricity kWh × tariff';
          baseAmount = electricity * tariff;
          baseValueText = `${electricity} × ${tariff.toFixed(2)}`;
        } else {
          formulaLabel = 'Usage × tariff';
          baseAmount = 0;
          baseValueText = `0 × ${tariff.toFixed(2)}`;
        }
      } else {
        baseAmount = 0;
        baseValueText = '-';
      }

      const taxAmount = (baseAmount * taxPercent) / 100;
      const totalAmount = baseAmount + taxAmount;

      return {
        serviceName,
        formulaLabel,
        baseValueText,
        tariff,
        baseAmount: Number(baseAmount.toFixed(2)),
        taxPercent,
        taxAmount: Number(taxAmount.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2))
      };
    });
  });

  readonly calculatedTotal = computed(() =>
    Number(this.lines().reduce((sum, line) => sum + line.totalAmount, 0).toFixed(2))
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private apartmentService: ApartmentService,
    private houseService: HouseService,
    private serviceService: ServiceService,
    private billingInputService: BillingInputService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Invoice ID not found');
      this.loading.set(false);
      return;
    }

    this.loadInvoice(id);
  }

  private isOwnApartment(apartment: ApartmentInfo | null): boolean {
    if (!apartment) return false;
    if (this.auth.isManager()) return true;

    const currentUserId = this.auth.getUserId();
    const currentEmail = this.auth.getUserEmail()?.toLowerCase();

    if (!Array.isArray(apartment.iedzivotaji)) return false;

    return apartment.iedzivotaji.some((r: any) => {
      const residentUserId =
        r?.id?.toString?.() ??
        r?.userId?.toString?.() ??
        r?.identityUserId?.toString?.() ??
        null;

      const residentEmail =
        r?.email?.toLowerCase?.() ??
        r?.epasts?.toLowerCase?.() ??
        null;

      return (
        (!!currentUserId && residentUserId === currentUserId) ||
        (!!currentEmail && residentEmail === currentEmail)
      );
    });
  }

  loadInvoice(id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.invoiceService.getById(id).subscribe({
      next: (invoiceData: Invoice) => {
        this.invoice.set(invoiceData);

        this.serviceService.getAll().subscribe({
          next: (servicesData: Service[]) => {
            this.services.set(servicesData ?? []);
            this.loadApartmentAndHouse(invoiceData.apartmentId, invoiceData.period);
          },
          error: (err: unknown) => {
            console.error(err);
            this.error.set('Failed to load services');
            this.loading.set(false);
          }
        });
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to load invoice');
        this.loading.set(false);
      }
    });
  }

  loadApartmentAndHouse(apartmentId: string, period: string): void {
    this.apartmentService.getById(apartmentId).subscribe({
      next: (apartmentData: ApartmentInfo) => {
        if (this.auth.isResident() && !this.isOwnApartment(apartmentData)) {
          this.error.set('You do not have access to this invoice');
          this.loading.set(false);
          return;
        }

        this.apartment.set(apartmentData);

        this.billingInputService.getByApartmentAndPeriod(apartmentId, period).subscribe({
          next: (existingInput: BillingInput) => {
            this.billingInput.set(existingInput);

            this.editForm = {
              waterM3: Number(existingInput.waterM3) || 0,
              electricityKwh: Number(existingInput.electricityKwh) || 0,
              residentsCount: Number(existingInput.residentsCount) || 0
            };

            this.loadHouse(apartmentData);
          },
          error: () => {
            this.billingInput.set(null);

            this.editForm = {
              waterM3: 0,
              electricityKwh: 0,
              residentsCount: this.getApartmentResidentsBase(apartmentData)
            };

            this.loadHouse(apartmentData);
          }
        });
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to load apartment');
        this.loading.set(false);
      }
    });
  }

  private loadHouse(apartmentData: ApartmentInfo): void {
    this.houseService.getById(apartmentData.majaId).subscribe({
      next: (houseData: House) => {
        this.house.set(houseData);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to load house');
        this.loading.set(false);
      }
    });
  }

  startEdit(): void {
    const input = this.billingInput();
    const apartment = this.apartment();

    if (this.auth.isResident() && !this.isOwnApartment(apartment)) {
      this.error.set('You cannot edit this invoice');
      return;
    }

    this.editForm = {
      waterM3: Number(input?.waterM3) || 0,
      electricityKwh: Number(input?.electricityKwh) || 0,
      residentsCount:
        Number(input?.residentsCount ?? (apartment ? this.getApartmentResidentsBase(apartment) : 0)) || 0
    };

    this.success.set('');
    this.error.set('');
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.success.set('');
    this.error.set('');
  }

  saveBillingChanges(): void {
    const invoice = this.invoice();
    const apartment = this.apartment();

    if (!invoice || !apartment) return;

    if (this.auth.isResident() && !this.isOwnApartment(apartment)) {
      this.error.set('You cannot edit this invoice');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const dto: BillingInputSaveDto = {
      apartmentId: invoice.apartmentId,
      period: invoice.period,
      waterM3: Number(this.editForm.waterM3) || 0,
      electricityKwh: Number(this.editForm.electricityKwh) || 0,
      residentsCount: this.auth.isResident()
        ? this.getApartmentResidentsBase(apartment)
        : Number(this.editForm.residentsCount) || 0,
      comment: ''
    };

    this.billingInputService.save(dto).subscribe({
      next: (result) => {
        if (result?.billingInput) {
          this.billingInput.set(result.billingInput);

          this.editForm = {
            waterM3: Number(result.billingInput.waterM3) || 0,
            electricityKwh: Number(result.billingInput.electricityKwh) || 0,
            residentsCount: Number(result.billingInput.residentsCount) || 0
          };
        }

        if (result?.invoice) {
          this.invoice.set(result.invoice);
        }

        this.saving.set(false);
        this.editMode.set(false);
        this.success.set('Billing data updated successfully');

        const invoiceId = result?.invoice?.id ?? invoice.id;
        if (invoiceId) {
          this.loadInvoice(String(invoiceId));
        }
      },
      error: (err: any) => {
        console.error(err);
        this.error.set(err?.error?.message || 'Failed to save billing data');
        this.saving.set(false);
      }
    });
  }

  getApartmentResidentsBase(apartment: ApartmentInfo): number {
    if (Array.isArray(apartment.iedzivotaji)) {
      return apartment.iedzivotaji.length;
    }
    return apartment.iedzivotajuSkaits ?? 0;
  }

  resolveFormulaKey(formula: string): string {
    return (formula || '').trim().toLowerCase();
  }

  getFormulaLabel(formula: string): string {
    const normalized = (formula || '').trim().toLowerCase();

    if (normalized === 'fixed') return 'Tariff';
    if (normalized === 'area * tariff') return 'Living area × tariff';
    if (normalized === 'maintenance') return 'Full area × tariff';
    if (normalized === 'residents * tariff') return 'Residents count × tariff';
    if (normalized === 'usage * tariff') return 'Usage × tariff';

    return formula;
  }

  goBack(): void {
    if (this.auth.isManager()) {
      this.router.navigate(['/manager/billing']);
      return;
    }

    this.router.navigate(['/resident/invoices']);
  }

  printInvoice(): void {
    window.print();
  }
}