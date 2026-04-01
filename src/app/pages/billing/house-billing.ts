import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InvoiceService, Invoice } from './invoice.service';
import { ServiceService, Service } from '../../services/service.service';

import { ApartmentService } from '../../services/apartment.service';
import { HouseService, House } from '../../services/house';
import { AuthService } from '../../services/auth.service';

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

interface ServiceErrors {
  nosaukums: string;
  tarifs: string;
  nodoklis: string;
  formula: string;
}

interface BillingInputLocal {
  apartmentId: string;
  period: string;
  waterM3: number;
  electricityKwh: number;
  residentsCount: number;
  comment: string;
}

interface BillingInputErrors {
  waterM3: string;
  electricityKwh: string;
  residentsCount: string;
}

@Component({
  selector: 'app-house-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './house-billing.html',
  styleUrls: ['./house-billing.css']
})
export class HouseBilling implements OnInit {
  readonly selectedPeriod = signal(this.getCurrentMonth());

  readonly houses = signal<House[]>([]);
  readonly selectedHouseId = signal('');
  readonly selectedApartmentId = signal('');

  readonly house = signal<House | null>(null);
  readonly apartments = signal<ApartmentInfo[]>([]);
  readonly services = signal<Service[]>([]);
  readonly invoices = signal<Invoice[]>([]);

  readonly billingInputs = signal<BillingInputLocal[]>([]);

  readonly editingService = signal<Service | null>(null);
  readonly editingBillingInput = signal<BillingInputLocal | null>(null);

  readonly selectedServiceForDelete = signal<Service | null>(null);
  readonly showDeleteServiceModal = signal(false);

  readonly loading = signal(false);
  readonly message = signal('');
  readonly isGeneratingAll = signal(false);

  readonly residentApartmentId = signal<string>('');

  readonly serviceErrors = signal<ServiceErrors>({
    nosaukums: '',
    tarifs: '',
    nodoklis: '',
    formula: ''
  });

  readonly billingInputErrors = signal<BillingInputErrors>({
    waterM3: '',
    electricityKwh: '',
    residentsCount: ''
  });

  readonly availableFormulas = [
    { value: 'fixed', label: 'Fixed tariff' },
    { value: 'area * tariff', label: 'Area × tariff' },
    { value: 'maintenance', label: '(Living area + Lodgia) × tariff' },
    { value: 'residents * tariff', label: 'Residents × tariff' },
    { value: 'usage * tariff', label: 'Usage × tariff' }
  ];

  private readonly billingStorageKey = 'billing-inputs';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService,
    private invoiceService: InvoiceService,
    private serviceService: ServiceService,
    private apartmentService: ApartmentService,
    private houseService: HouseService
  ) {}

  ngOnInit(): void {
    this.loadServices();

    if (this.auth.isManager()) {
      const routeHouseId = this.route.snapshot.paramMap.get('id');

      if (routeHouseId) {
        this.selectedHouseId.set(routeHouseId);
        this.loadSelectedHouse(routeHouseId);
      } else {
        this.loadHouses();
      }

      return;
    }

    if (this.auth.isResident()) {
      this.initializeResidentMode();
      return;
    }

    this.message.set('Access denied');
  }

  private initializeResidentMode(): void {
    const jwtApartmentId = this.tryGetApartmentIdFromToken();
    const jwtHouseId = this.tryGetHouseIdFromToken();

    if (jwtApartmentId && jwtHouseId) {
      this.residentApartmentId.set(jwtApartmentId);
      this.selectedApartmentId.set(jwtApartmentId);
      this.selectedHouseId.set(jwtHouseId);
      this.loadSelectedHouse(jwtHouseId);
      return;
    }

    if (jwtHouseId) {
      this.selectedHouseId.set(jwtHouseId);
      this.loadSelectedHouse(jwtHouseId);
      return;
    }

    this.message.set(
      'Resident mode requires apartmentId/houseId in JWT or a dedicated backend endpoint like getMyApartment().'
    );
  }

  private tryGetApartmentIdFromToken(): string | null {
    const authAny = this.auth as any;

    if (typeof authAny.getApartmentId === 'function') {
      return authAny.getApartmentId();
    }

    return null;
  }

  private tryGetHouseIdFromToken(): string | null {
    const authAny = this.auth as any;

    if (typeof authAny.getHouseId === 'function') {
      return authAny.getHouseId();
    }

    return null;
  }

  private isOwnApartment(apartmentId: string): boolean {
    if (this.auth.isManager()) {
      return true;
    }

    const residentId = this.residentApartmentId();

    if (residentId) {
      return residentId === apartmentId;
    }

    const apartment = this.getApartment(apartmentId);
    if (!apartment) {
      return false;
    }

    const currentUserId = this.auth.getUserId();
    const currentEmail = this.auth.getUserEmail()?.toLowerCase();

    if (!Array.isArray(apartment.iedzivotaji)) {
      return false;
    }

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

  loadHouses(): void {
    if (!this.auth.isManager()) {
      return;
    }

    this.houseService.getAll().subscribe({
      next: (data: House[]) => {
        this.houses.set(data ?? []);
      },
      error: (err: any) => {
        console.error('LOAD HOUSES ERROR:', err);
        this.houses.set([]);
        this.message.set('Failed to load houses');
      }
    });
  }

  loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (data: Service[]) => {
        this.services.set(data ?? []);
      },
      error: (err: any) => {
        console.error('LOAD SERVICES ERROR:', err);
        this.services.set([]);
      }
    });
  }

  onHouseChange(): void {
    if (!this.auth.isManager()) {
      return;
    }

    const houseId = this.selectedHouseId();

    if (!houseId) {
      this.house.set(null);
      this.apartments.set([]);
      this.invoices.set([]);
      this.billingInputs.set([]);
      this.selectedApartmentId.set('');
      this.message.set('');
      return;
    }

    this.loadSelectedHouse(houseId);
  }

  onApartmentChange(): void {}

  onPeriodChange(): void {
    this.loadBillingInputs();
    this.loadInvoices();
  }

  loadSelectedHouse(houseId: string): void {
    this.loading.set(true);
    this.message.set('');

    this.houseService.getById(houseId).subscribe({
      next: (data: House) => {
        this.house.set(data);
        this.selectedHouseId.set(houseId);
        this.loadApartments();
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('LOAD HOUSE ERROR:', err);
        this.house.set(null);
        this.apartments.set([]);
        this.invoices.set([]);
        this.billingInputs.set([]);
        this.loading.set(false);
        this.message.set('Failed to load house');
      }
    });
  }

  loadApartments(): void {
    const houseId = this.selectedHouseId();

    if (!houseId) {
      this.apartments.set([]);
      this.billingInputs.set([]);
      this.invoices.set([]);
      return;
    }

    this.apartmentService.getByHouseId(houseId).subscribe({
      next: (data: ApartmentInfo[]) => {
        const allApartments = data ?? [];

        if (this.auth.isResident()) {
          let residentApartment =
            allApartments.find(a => a.id === this.residentApartmentId()) ??
            allApartments.find(a => this.isOwnApartment(a.id));

          if (!residentApartment && this.selectedApartmentId()) {
            residentApartment = allApartments.find(a => a.id === this.selectedApartmentId());
          }

          const residentApartments = residentApartment ? [residentApartment] : [];

          if (residentApartment) {
            this.residentApartmentId.set(residentApartment.id);
            this.selectedApartmentId.set(residentApartment.id);
          }

          this.apartments.set(residentApartments);
        } else {
          this.apartments.set(allApartments);
        }

        this.loadBillingInputs();
        this.loadInvoices();
      },
      error: (err: any) => {
        console.error('LOAD APARTMENTS ERROR:', err);
        this.apartments.set([]);
        this.billingInputs.set([]);
        this.invoices.set([]);
      }
    });
  }

  loadInvoices(): void {
    const apartmentIds = this.apartments().map(a => a.id);

    if (apartmentIds.length === 0) {
      this.invoices.set([]);
      return;
    }

    this.invoiceService.getAll().subscribe({
      next: (data: Invoice[]) => {
        const filtered = (data ?? []).filter(i =>
          i.period === this.selectedPeriod() &&
          !!i.apartmentId &&
          apartmentIds.includes(i.apartmentId)
        );

        this.invoices.set(filtered);
      },
      error: (err: any) => {
        console.error('LOAD INVOICES ERROR:', err);
        this.invoices.set([]);
      }
    });
  }

  getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  houseName(): string {
    const h = this.house();
    if (!h) return '';
    return `${h.iela} ${h.numurs}, ${h.pilseta}`;
  }

  getFormulaLabel(formula: string): string {
    const found = this.availableFormulas.find(f => f.value === formula);
    return found?.label ?? formula;
  }

  getApartment(apartmentId: string): ApartmentInfo | undefined {
    return this.apartments().find(a => a.id === apartmentId);
  }

  getApartmentResidentsBase(apartmentId: string): number {
    const apartment = this.getApartment(apartmentId);
    if (!apartment) return 0;

    if (Array.isArray(apartment.iedzivotaji)) {
      return apartment.iedzivotaji.length;
    }

    return apartment.iedzivotajuSkaits ?? 0;
  }

  readonly filteredApartments = computed(() => {
    if (this.auth.isResident()) {
      const ownId = this.residentApartmentId() || this.selectedApartmentId();

      if (!ownId) {
        return this.apartments();
      }

      return this.apartments().filter(a => a.id === ownId);
    }

    const apartmentId = this.selectedApartmentId();

    if (!apartmentId) {
      return this.apartments();
    }

    return this.apartments().filter(a => a.id === apartmentId);
  });

  readonly generatedCount = computed(() =>
    this.filteredApartments().filter(a => !!this.getInvoiceForApartment(a.id)).length
  );

  readonly missingCount = computed(() =>
    this.filteredApartments().filter(a => !this.getInvoiceForApartment(a.id)).length
  );

  readonly total = computed(() =>
    this.filteredApartments().reduce((sum, a) => {
      const inv = this.getInvoiceForApartment(a.id);
      return sum + (inv?.total ?? 0);
    }, 0)
  );

  private readAllBillingInputsFromStorage(): BillingInputLocal[] {
    try {
      const raw = localStorage.getItem(this.billingStorageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private writeAllBillingInputsToStorage(items: BillingInputLocal[]): void {
    localStorage.setItem(this.billingStorageKey, JSON.stringify(items));
  }

  loadBillingInputs(): void {
    const apartmentIds = this.apartments().map(a => a.id);
    const period = this.selectedPeriod();

    if (apartmentIds.length === 0) {
      this.billingInputs.set([]);
      return;
    }

    const all = this.readAllBillingInputsFromStorage();
    const filtered = all.filter(x =>
      x.period === period &&
      apartmentIds.includes(x.apartmentId)
    );

    this.billingInputs.set(filtered);
  }

  getBillingInputForApartment(apartmentId: string): BillingInputLocal | undefined {
    return this.billingInputs().find(x =>
      x.apartmentId === apartmentId &&
      x.period === this.selectedPeriod()
    );
  }

  getBillingWater(apartmentId: string): number {
    return this.getBillingInputForApartment(apartmentId)?.waterM3 ?? 0;
  }

  getBillingElectricity(apartmentId: string): number {
    return this.getBillingInputForApartment(apartmentId)?.electricityKwh ?? 0;
  }

  getBillingResidents(apartmentId: string): number {
    const input = this.getBillingInputForApartment(apartmentId);
    if (input) return input.residentsCount;
    return this.getApartmentResidentsBase(apartmentId);
  }

  openBillingInput(apartmentId: string): void {
    if (this.auth.isResident() && !this.isOwnApartment(apartmentId)) {
      this.message.set('You cannot edit billing data for another apartment');
      return;
    }

    const existing = this.getBillingInputForApartment(apartmentId);

    if (existing) {
      this.editingBillingInput.set({ ...existing });
      this.validateBillingInputForm();
      return;
    }

    this.editingBillingInput.set({
      apartmentId,
      period: this.selectedPeriod(),
      waterM3: 0,
      electricityKwh: 0,
      residentsCount: this.getApartmentResidentsBase(apartmentId),
      comment: ''
    });

    this.validateBillingInputForm();
  }

  closeBillingInputModal(): void {
    this.editingBillingInput.set(null);
    this.billingInputErrors.set({
      waterM3: '',
      electricityKwh: '',
      residentsCount: ''
    });
  }

  validateBillingInputForm(): void {
    const item = this.editingBillingInput();
    if (!item) return;

    const errors: BillingInputErrors = {
      waterM3: '',
      electricityKwh: '',
      residentsCount: ''
    };

    if (Number.isNaN(Number(item.waterM3)) || Number(item.waterM3) < 0) {
      errors.waterM3 = 'Water must be 0 or greater';
    }

    if (Number.isNaN(Number(item.electricityKwh)) || Number(item.electricityKwh) < 0) {
      errors.electricityKwh = 'Electricity must be 0 or greater';
    }

    if (Number.isNaN(Number(item.residentsCount)) || Number(item.residentsCount) < 0) {
      errors.residentsCount = 'Residents count must be 0 or greater';
    }

    this.billingInputErrors.set(errors);
  }

  billingInputFormInvalid(): boolean {
    const e = this.billingInputErrors();
    return !!(e.waterM3 || e.electricityKwh || e.residentsCount);
  }

  saveBillingInput(): void {
    const item = this.editingBillingInput();
    if (!item) return;

    if (this.auth.isResident() && !this.isOwnApartment(item.apartmentId)) {
      this.message.set('You cannot save billing data for another apartment');
      return;
    }

    this.validateBillingInputForm();

    if (this.billingInputFormInvalid()) {
      return;
    }

    const normalized: BillingInputLocal = {
      apartmentId: item.apartmentId,
      period: item.period,
      waterM3: Number(item.waterM3),
      electricityKwh: Number(item.electricityKwh),
      residentsCount: this.auth.isResident()
        ? this.getApartmentResidentsBase(item.apartmentId)
        : Number(item.residentsCount),
      comment: (item.comment ?? '').trim()
    };

    const all = this.readAllBillingInputsFromStorage();
    const filtered = all.filter(x =>
      !(x.apartmentId === normalized.apartmentId && x.period === normalized.period)
    );

    filtered.push(normalized);
    this.writeAllBillingInputsToStorage(filtered);
    this.loadBillingInputs();
    this.closeBillingInputModal();
    this.message.set('Billing data saved successfully');
  }

  getInvoiceForApartment(apartmentId: string): Invoice | undefined {
    return this.invoices().find(i =>
      i.apartmentId === apartmentId &&
      i.period === this.selectedPeriod()
    );
  }

  resolveFormulaKey(formula: string): string {
    return formula.trim().toLowerCase();
  }

  calculateServiceAmount(service: Service, apartment: ApartmentInfo, input: BillingInputLocal | undefined): number {
    const formula = this.resolveFormulaKey(service.formula);
    const tariff = Number(service.tarifs) || 0;
    const serviceName = (service.nosaukums ?? '').trim().toLowerCase();

    if (formula === 'fixed') {
      return tariff;
    }

    if (formula === 'area * tariff') {
      return (Number(apartment.dzivojamaPlatiba) || 0) * tariff;
    }

    if (formula === 'maintenance') {
      return ((Number(apartment.dzivojamaPlatiba) || 0) + (Number(apartment.lodzijasPlatiba) || 0)) * tariff;
    }

    if (formula === 'residents * tariff') {
      const residentsCount = Number(input?.residentsCount ?? this.getApartmentResidentsBase(apartment.id)) || 0;
      return residentsCount * tariff;
    }

    if (formula === 'usage * tariff') {
      if (serviceName.includes('udens') || serviceName.includes('water')) {
        return (Number(input?.waterM3) || 0) * tariff;
      }

      if (serviceName.includes('elektr') || serviceName.includes('electric')) {
        return (Number(input?.electricityKwh) || 0) * tariff;
      }

      return (Number(input?.waterM3) || 0) * tariff;
    }

    return 0;
  }

  calculateInvoiceTotalForApartment(apartmentId: string): number {
    const apartment = this.getApartment(apartmentId);
    if (!apartment) return 0;

    const input = this.getBillingInputForApartment(apartmentId);

    const total = this.services().reduce((sum, service) => {
      const baseAmount = this.calculateServiceAmount(service, apartment, input);
      const tax = Number(service.nodoklis) || 0;
      const amountWithTax = baseAmount + (baseAmount * tax / 100);
      return sum + amountWithTax;
    }, 0);

    return Number(total.toFixed(2));
  }

  hasBillingInput(apartmentId: string): boolean {
    return !!this.getBillingInputForApartment(apartmentId);
  }

  hasTotalMismatch(apartmentId: string): boolean {
    const invoice = this.getInvoiceForApartment(apartmentId);
    if (!invoice?.total) return false;

    const calculated = this.calculateInvoiceTotalForApartment(apartmentId);
    return Math.abs(Number(invoice.total) - Number(calculated)) >= 0.01;
  }

  canGenerateInvoice(apartmentId: string): boolean {
    if (!this.auth.isManager()) return false;
    if (this.getInvoiceForApartment(apartmentId)) return false;
    if (this.services().length === 0) return false;
    return !!this.getBillingInputForApartment(apartmentId);
  }

  generateInvoiceForApartment(apartmentId: string): void {
    if (!this.auth.isManager()) {
      this.message.set('Only manager can generate invoices');
      return;
    }

    if (this.getInvoiceForApartment(apartmentId)) {
      this.message.set('Invoice for this period already exists');
      return;
    }

    if (this.services().length === 0) {
      this.message.set('Add services before generating invoices');
      return;
    }

    const input = this.getBillingInputForApartment(apartmentId);
    if (!input) {
      this.message.set('Enter billing data for this apartment first');
      return;
    }

    const apartment = this.getApartment(apartmentId);
    if (!apartment) return;

    const total = this.calculateInvoiceTotalForApartment(apartmentId);

    const payload: Invoice = {
      apartmentId,
      period: this.selectedPeriod(),
      invoiceIdentifier: `INV-${this.selectedPeriod()}-${apartment.numurs}`,
      total
    };

    this.invoiceService.create(payload).subscribe({
      next: () => {
        this.message.set('Invoice generated successfully');
        this.loadInvoices();
      },
      error: (err: any) => {
        console.error('CREATE INVOICE ERROR:', err);
        this.message.set(err?.error?.message || 'Failed to generate invoice');
      }
    });
  }

  async generateAllInvoices(): Promise<void> {
    if (!this.auth.isManager()) {
      this.message.set('Only manager can generate invoices');
      return;
    }

    const apartmentsToGenerate = this.filteredApartments().filter(a => !this.getInvoiceForApartment(a.id));

    if (apartmentsToGenerate.length === 0) {
      this.message.set('All invoices for this period are already generated');
      return;
    }

    if (this.services().length === 0) {
      this.message.set('Add services before generating invoices');
      return;
    }

    const readyApartments = apartmentsToGenerate.filter(a => this.hasBillingInput(a.id));

    if (readyApartments.length === 0) {
      this.message.set('Enter billing data before generating invoices');
      return;
    }

    this.isGeneratingAll.set(true);
    this.message.set('');

    for (const apartment of readyApartments) {
      const total = this.calculateInvoiceTotalForApartment(apartment.id);

      const payload: Invoice = {
        apartmentId: apartment.id,
        period: this.selectedPeriod(),
        invoiceIdentifier: `INV-${this.selectedPeriod()}-${apartment.numurs}`,
        total
      };

      await new Promise<void>((resolve) => {
        this.invoiceService.create(payload).subscribe({
          next: () => resolve(),
          error: (err: any) => {
            console.error('CREATE INVOICE ERROR:', err);
            resolve();
          }
        });
      });
    }

    this.isGeneratingAll.set(false);
    this.message.set('Invoices generated successfully');
    this.loadInvoices();
  }

  openInvoice(invoiceId?: string): void {
    if (!invoiceId) return;
    this.router.navigate(['/invoice', invoiceId]);
  }

  addService(): void {
    if (!this.auth.isManager()) {
      this.message.set('Only manager can manage services');
      return;
    }

        this.editingService.set({
        nosaukums: '',
        tarifs: 0,
        nodoklis: 0,
        formula: 'fixed',
        type: 0
   });

    this.validateServiceForm();
  }

  editService(service: Service): void {
    if (!this.auth.isManager()) {
      this.message.set('Only manager can manage services');
      return;
    }

    this.editingService.set({ ...service });
    this.validateServiceForm();
  }

  cancelEdit(): void {
    this.editingService.set(null);
    this.serviceErrors.set({
      nosaukums: '',
      tarifs: '',
      nodoklis: '',
      formula: ''
    });
  }

  validateServiceForm(): void {
    const item = this.editingService();
    if (!item) return;

    const errors: ServiceErrors = {
      nosaukums: '',
      tarifs: '',
      nodoklis: '',
      formula: ''
    };

    if (!item.nosaukums || !item.nosaukums.trim()) {
      errors.nosaukums = 'Service name is required';
    } else if (item.nosaukums.trim().length < 2) {
      errors.nosaukums = 'Service name must contain at least 2 characters';
    }

    if (Number.isNaN(Number(item.tarifs)) || Number(item.tarifs) < 0) {
      errors.tarifs = 'Tariff must be 0 or greater';
    }

    if (Number.isNaN(Number(item.nodoklis)) || Number(item.nodoklis) < 0 || Number(item.nodoklis) > 100) {
      errors.nodoklis = 'Tax must be between 0 and 100';
    }

    if (!this.availableFormulas.some(f => f.value === item.formula)) {
      errors.formula = 'Select a valid formula';
    }

    this.serviceErrors.set(errors);
  }

  serviceFormInvalid(): boolean {
    const errors = this.serviceErrors();
    return !!(errors.nosaukums || errors.tarifs || errors.nodoklis || errors.formula);
  }

  saveService(): void {
    if (!this.auth.isManager()) {
      this.message.set('Only manager can manage services');
      return;
    }

    const item = this.editingService();
    if (!item) return;

    this.validateServiceForm();

    if (this.serviceFormInvalid()) {
      return;
    }

    const payload: Service = {
      ...item,
      nosaukums: item.nosaukums.trim(),
      tarifs: Number(item.tarifs),
      nodoklis: Number(item.nodoklis),
      formula: item.formula
    };

    if (!payload.id) {
      this.serviceService.create(payload).subscribe({
        next: () => {
          this.loadServices();
          this.cancelEdit();
          this.message.set('Service created successfully');
        },
        error: (err: any) => {
          console.error('CREATE SERVICE ERROR:', err);
          this.message.set('Failed to create service');
        }
      });
    } else {
      this.serviceService.update(payload.id, payload).subscribe({
        next: () => {
          this.loadServices();
          this.cancelEdit();
          this.message.set('Service updated successfully');
        },
        error: (err: any) => {
          console.error('UPDATE SERVICE ERROR:', err);
          this.message.set('Failed to update service');
        }
      });
    }
  }

  deleteService(service: Service): void {
    if (!this.auth.isManager()) {
      this.message.set('Only manager can manage services');
      return;
    }

    this.editingService.set(null);
    this.selectedServiceForDelete.set(service);
    this.showDeleteServiceModal.set(true);
  }

  closeDeleteServiceModal(): void {
    this.showDeleteServiceModal.set(false);
    this.selectedServiceForDelete.set(null);
  }

  confirmDeleteService(): void {
    if (!this.auth.isManager()) {
      this.message.set('Only manager can manage services');
      return;
    }

    const service = this.selectedServiceForDelete();
    if (!service?.id) return;

    this.serviceService.delete(service.id).subscribe({
      next: () => {
        this.loadServices();
        this.closeDeleteServiceModal();
        this.message.set('Service deleted successfully');
      },
      error: (err: any) => {
        console.error('DELETE SERVICE ERROR:', err);
        this.message.set('Failed to delete service');
      }
    });
  }
}