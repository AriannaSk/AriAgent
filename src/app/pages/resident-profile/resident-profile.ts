import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentService, Resident } from '../../services/resident.service';
import { ApartmentService } from '../../services/apartment.service';
import { Apartment } from '../../services/apartment';

type ValidationErrors = {
  vards?: string;
  uzvards?: string;
  epasts?: string;
  telefons?: string;
  personasKods?: string;
};

type ApartmentValidationErrors = {
  numurs?: string;
  stavs?: string;
  istabuSkaits?: string;
  iedzivotajuSkaits?: string;
  pilnaPlatiba?: string;
  dzivojamaPlatiba?: string;
};

@Component({
  selector: 'app-resident-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resident-profile.html',
  styleUrls: ['./resident-profile.css']
})
export class ResidentProfileComponent implements OnInit {
  readonly loading = signal(true);

  readonly savingResident = signal(false);
  readonly savingApartment = signal(false);

  readonly error = signal('');
  readonly success = signal('');

  readonly showValidation = signal(false);
  readonly validationErrors = signal<ValidationErrors>({});

  readonly showApartmentValidation = signal(false);
  readonly apartmentValidationErrors = signal<ApartmentValidationErrors>({});

  resident: Resident | null = null;
  apartmentForm: Apartment | null = null;

  constructor(
    private residentService: ResidentService,
    private apartmentService: ApartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.showValidation.set(false);
    this.showApartmentValidation.set(false);
    this.validationErrors.set({});
    this.apartmentValidationErrors.set({});

    this.residentService.getMe().subscribe({
      next: (residentData) => {
        this.resident = { ...residentData };

        this.apartmentService.getMyApartments().subscribe({
          next: (apartmentData) => {
            const firstApartment =
              apartmentData && apartmentData.length > 0
                ? apartmentData[0]
                : null;

            this.apartmentForm = firstApartment ? { ...firstApartment } : null;

            console.log('RESIDENT PROFILE APARTMENT DATA:', this.apartmentForm);
            console.log('RESIDENT PROFILE APARTMENT JSON:', JSON.stringify(this.apartmentForm, null, 2));

            this.loading.set(false);
          },
          error: (err) => {
            console.error(err);
            this.apartmentForm = null;
            this.error.set('Failed to load apartment information');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  clearMessages(): void {
    this.error.set('');
    this.success.set('');
  }

  houseAddress(): string {
    const ap = this.apartmentForm as any;
    if (!ap) return 'Address unavailable';

    const directAddress =
      ap?.maja?.adrese ||
      ap?.adrese ||
      ap?.majaNosaukums ||
      ap?.houseAddress ||
      ap?.address;

    if (directAddress && String(directAddress).trim()) {
      return String(directAddress).trim();
    }

    const iela = ap?.maja?.iela || ap?.maja?.street || '';
    const majasNumurs = ap?.maja?.majasNumurs || ap?.maja?.numurs || ap?.maja?.houseNumber || '';
    const pilseta = ap?.maja?.pilseta || ap?.maja?.city || '';
    const valsts = ap?.maja?.valsts || ap?.maja?.country || '';
    const pastaIndekss = ap?.maja?.pastaIndekss || ap?.maja?.postalCode || '';

    const line1 = [iela, majasNumurs].filter(Boolean).join(' ').trim();
    const line2 = [pilseta, pastaIndekss].filter(Boolean).join(', ').trim();
    const full = [line1, line2, valsts].filter(Boolean).join(', ').trim();

    return full || 'Address unavailable';
  }

  validateResidentForm(): boolean {
    const errors: ValidationErrors = {};

    if (!this.resident) {
      this.validationErrors.set(errors);
      return false;
    }

    const vards = this.resident.vards?.trim() || '';
    const uzvards = this.resident.uzvards?.trim() || '';
    const epasts = this.resident.epasts?.trim() || '';
    const telefons = this.resident.telefons?.trim() || '';
    const personasKods = this.resident.personasKods?.trim() || '';

    const nameRegex = /^[A-Za-zĀ-ž\s-]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    const personalCodeRegex = /^\d{6}-\d{5}$/;

    if (!vards) {
      errors.vards = 'Name is required';
    } else if (vards.length < 2) {
      errors.vards = 'Name must contain at least 2 characters';
    } else if (!nameRegex.test(vards)) {
      errors.vards = 'Name may contain only letters, spaces and hyphens';
    }

    if (!uzvards) {
      errors.uzvards = 'Surname is required';
    } else if (uzvards.length < 2) {
      errors.uzvards = 'Surname must contain at least 2 characters';
    } else if (!nameRegex.test(uzvards)) {
      errors.uzvards = 'Surname may contain only letters, spaces and hyphens';
    }

    if (!epasts) {
      errors.epasts = 'Email is required';
    } else if (!emailRegex.test(epasts)) {
      errors.epasts = 'Enter a valid email address';
    }

    if (!telefons) {
      errors.telefons = 'Phone number is required';
    } else if (!phoneRegex.test(telefons)) {
      errors.telefons = 'Phone must contain only digits and may start with +';
    }

    if (!personasKods) {
      errors.personasKods = 'Personal code is required';
    } else if (!personalCodeRegex.test(personasKods)) {
      errors.personasKods = 'Format must be like 030303-11112';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  validateApartmentForm(): boolean {
    const errors: ApartmentValidationErrors = {};

    if (!this.apartmentForm) {
      this.apartmentValidationErrors.set(errors);
      return false;
    }

    const numurs = Number(this.apartmentForm.numurs);
    const stavs = Number(this.apartmentForm.stavs);
    const istabuSkaits = Number(this.apartmentForm.istabuSkaits);
    const iedzivotajuSkaits = Number(this.apartmentForm.iedzivotajuSkaits);
    const pilnaPlatiba = Number(this.apartmentForm.pilnaPlatiba);
    const dzivojamaPlatiba = Number(this.apartmentForm.dzivojamaPlatiba);

    if (!Number.isFinite(numurs) || numurs < 1 || numurs > 1000) {
      errors.numurs = 'Apartment number must be between 1 and 1000';
    }

    if (!Number.isFinite(stavs) || stavs < 0 || stavs > 100) {
      errors.stavs = 'Floor must be between 0 and 100';
    }

    if (!Number.isFinite(istabuSkaits) || istabuSkaits < 1 || istabuSkaits > 10) {
      errors.istabuSkaits = 'Rooms count must be between 1 and 10';
    }

    if (!Number.isFinite(iedzivotajuSkaits) || iedzivotajuSkaits < 0 || iedzivotajuSkaits > 20) {
      errors.iedzivotajuSkaits = 'Residents count must be between 0 and 20';
    }

    if (!Number.isFinite(pilnaPlatiba) || pilnaPlatiba < 1 || pilnaPlatiba > 1000) {
      errors.pilnaPlatiba = 'Total area must be between 1 and 1000';
    }

    if (!Number.isFinite(dzivojamaPlatiba) || dzivojamaPlatiba < 1 || dzivojamaPlatiba > 1000) {
      errors.dzivojamaPlatiba = 'Living area must be between 1 and 1000';
    } else if (Number.isFinite(pilnaPlatiba) && dzivojamaPlatiba > pilnaPlatiba) {
      errors.dzivojamaPlatiba = 'Living area cannot be greater than total area';
    }

    this.apartmentValidationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveResident(): void {
    if (!this.resident) return;

    this.showValidation.set(true);
    this.clearMessages();

    const isValid = this.validateResidentForm();
    if (!isValid) {
      this.error.set('Please correct the highlighted resident fields');
      return;
    }

    this.savingResident.set(true);

    const dto = {
      id: this.resident.id,
      vards: this.resident.vards?.trim() || '',
      uzvards: this.resident.uzvards?.trim() || '',
      personasKods: this.resident.personasKods?.trim() || '',
      telefons: this.resident.telefons?.trim() || '',
      epasts: this.resident.epasts?.trim() || '',
      isOwner: this.resident.isOwner ?? false,
      dzivoklisIds: (this.resident.dzivokli ?? []).map(x => x.id)
    };

    this.residentService.update(this.resident.id, dto).subscribe({
      next: () => {
        this.success.set('Profile updated successfully');
        this.savingResident.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to update profile');
        this.savingResident.set(false);
      }
    });
  }

  saveApartment(): void {
    if (!this.apartmentForm) return;

    this.showApartmentValidation.set(true);
    this.clearMessages();

    const isValid = this.validateApartmentForm();
    if (!isValid) {
      this.error.set('Please correct the highlighted apartment fields');
      return;
    }

    this.savingApartment.set(true);

    const dto: Apartment = {
      ...this.apartmentForm,
      id: this.apartmentForm.id,
      numurs: Number(this.apartmentForm.numurs),
      stavs: Number(this.apartmentForm.stavs),
      istabuSkaits: Number(this.apartmentForm.istabuSkaits),
      iedzivotajuSkaits: Number(this.apartmentForm.iedzivotajuSkaits),
      pilnaPlatiba: Number(this.apartmentForm.pilnaPlatiba),
      dzivojamaPlatiba: Number(this.apartmentForm.dzivojamaPlatiba),
      lodzijasPlatiba: Number((this.apartmentForm as any).lodzijasPlatiba ?? 0),
      udensM3: Number((this.apartmentForm as any).udensM3 ?? 0),
      majaId: this.apartmentForm.majaId,
      iedzivotaji: this.apartmentForm.iedzivotaji ?? []
    };

    console.log('SAVE APARTMENT DTO:', dto);

    // ВАЖНО:
    // Этот вызов заработает только если в ApartmentService есть updateMyApartment()
    // и на backend есть PUT /api/Dzivoklis/my/{id} для Resident
    this.apartmentService.updateMyApartment(this.apartmentForm.id, dto as any).subscribe({
      next: () => {
        this.success.set('Apartment updated successfully');
        this.savingApartment.set(false);
      },
      error: (err) => {
        console.error(err);

        if (err?.status === 403) {
          this.error.set('You do not have permission to update this apartment.');
        } else {
          this.error.set('Failed to update apartment');
        }

        this.savingApartment.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/resident/dashboard']);
  }
}