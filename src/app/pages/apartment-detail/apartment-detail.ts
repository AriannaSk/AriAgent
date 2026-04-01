import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApartmentService } from '../../services/apartment.service';
import { Apartment } from '../../services/apartment';
import { ResidentService } from '../../services/resident.service';
import { AuthService } from '../../services/auth.service';

type ResidentValidationField = 'name' | 'surname' | 'personalCode' | 'phone' | 'email';

@Component({
  selector: 'app-apartment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apartment-detail.html',
  styleUrls: ['./apartment-detail.css']
})
export class ApartmentDetail implements OnInit {
  readonly apartment = signal<Apartment | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  selectedResident: any = null;

  residentErrors: Record<ResidentValidationField, string> = {
    name: '',
    surname: '',
    personalCode: '',
    phone: '',
    email: ''
  };

  residentFieldTouched: Record<ResidentValidationField, boolean> = {
    name: false,
    surname: false,
    personalCode: false,
    phone: false,
    email: false
  };

  constructor(
    private route: ActivatedRoute,
    private apartmentService: ApartmentService,
    private residentService: ResidentService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id || id === 'new') {
      if (!this.auth.isManager()) {
        this.router.navigate(['/invoices']);
        return;
      }

      const houseId = this.route.snapshot.queryParamMap.get('houseId');

      this.apartment.set({
        id: null as any,
        numurs: 0,
        stavs: 0,
        istabuSkaits: 1,
        iedzivotajuSkaits: 0,
        pilnaPlatiba: 1,
        dzivojamaPlatiba: 1,
        majaId: houseId ?? '',
        lodzijasPlatiba: 0,
        udensM3: 0,
        iedzivotaji: []
      });

      this.loading.set(false);
      return;
    }

    this.apartmentService.getById(id).subscribe({
      next: (data: Apartment) => {
        if (this.auth.isResident() && !this.isOwnApartment(data)) {
          this.error.set('You do not have access to this apartment');
          this.loading.set(false);
          return;
        }

        this.apartment.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/invoices']);
      }
    });
  }

  private isOwnApartment(apartment: Apartment | null): boolean {
    if (!apartment) return false;
    if (this.auth.isManager()) return true;

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

  addResident(): void {
    if (!this.auth.isManager()) {
      return;
    }

    this.selectedResident = {
      id: null,
      vards: '',
      uzvards: '',
      personasKods: '',
      telefons: '',
      epasts: '',
      isOwner: false
    };

    this.resetResidentValidation();
    this.openResidentModal();
  }

  editResident(resident: any): void {
    if (!this.auth.isManager()) {
      return;
    }

    this.selectedResident = {
      id: resident.id,
      vards: resident.vards ?? '',
      uzvards: resident.uzvards ?? '',
      personasKods: resident.personasKods ?? '',
      telefons: resident.telefons ?? '',
      epasts: resident.epasts ?? '',
      isOwner: resident.isOwner ?? false
    };

    this.resetResidentValidation();
    this.openResidentModal();
  }

  private openResidentModal(): void {
    const modalElement = document.getElementById('residentModal');

    if (modalElement && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  private closeResidentModal(): void {
    const modalElement = document.getElementById('residentModal');

    if (modalElement && (window as any).bootstrap) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }

    (document.activeElement as HTMLElement)?.blur();
  }

  private reloadApartment(): void {
    const ap = this.apartment();
    if (!ap || !ap.id) return;

    this.apartmentService.getById(ap.id).subscribe({
      next: (data) => {
        if (this.auth.isResident() && !this.isOwnApartment(data)) {
          this.error.set('You do not have access to this apartment');
          return;
        }

        this.apartment.set({ ...data });
        this.closeResidentModal();
        this.selectedResident = null;
        this.resetResidentValidation();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  normalizeIntegerField(ap: Apartment, field: 'numurs' | 'stavs' | 'istabuSkaits'): void {
    const value = (ap as any)[field];

    if (value === '' || value === null || value === undefined) {
      return;
    }

    const normalized = Number(value);

    if (!Number.isNaN(normalized)) {
      (ap as any)[field] = normalized;
    }
  }

  normalizeDecimalField(ap: Apartment, field: 'pilnaPlatiba' | 'dzivojamaPlatiba'): void {
    const value = (ap as any)[field];

    if (value === '' || value === null || value === undefined) {
      return;
    }

    const normalized = Number(value);

    if (!Number.isNaN(normalized)) {
      (ap as any)[field] = normalized;
    }
  }

  allowOnlyWholeNumbers(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    const pattern = /^[A-Za-zĀ-žА-Яа-яЁё\s-]$/;

    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  apartmentNumberInvalid(ap: Apartment): boolean {
    return !Number.isInteger(Number(ap.numurs)) || Number(ap.numurs) <= 0;
  }

  floorInvalid(ap: Apartment): boolean {
    return !Number.isInteger(Number(ap.stavs)) || Number(ap.stavs) < 0;
  }

  roomsInvalid(ap: Apartment): boolean {
    return !Number.isInteger(Number(ap.istabuSkaits)) || Number(ap.istabuSkaits) < 1;
  }

  fullAreaInvalid(ap: Apartment): boolean {
    return Number(ap.pilnaPlatiba) <= 0 || Number.isNaN(Number(ap.pilnaPlatiba));
  }

  livingAreaInvalid(ap: Apartment): boolean {
    return Number(ap.dzivojamaPlatiba) <= 0 || Number.isNaN(Number(ap.dzivojamaPlatiba));
  }

  areaRelationInvalid(ap: Apartment): boolean {
    return Number(ap.dzivojamaPlatiba) > Number(ap.pilnaPlatiba);
  }

  apartmentBusinessInvalid(ap: Apartment): boolean {
    return (
      this.apartmentNumberInvalid(ap) ||
      this.floorInvalid(ap) ||
      this.roomsInvalid(ap) ||
      this.fullAreaInvalid(ap) ||
      this.livingAreaInvalid(ap) ||
      this.areaRelationInvalid(ap)
    );
  }

  save(): void {
    if (!this.auth.isManager()) {
      return;
    }

    const ap = this.apartment();
    if (!ap) return;

    if (this.apartmentNumberInvalid(ap)) {
      alert('Apartment number must be a whole number greater than 0');
      return;
    }

    if (this.floorInvalid(ap)) {
      alert('Floor must be a whole number 0 or greater');
      return;
    }

    if (this.roomsInvalid(ap)) {
      alert('Rooms must be a whole number at least 1');
      return;
    }

    if (this.fullAreaInvalid(ap)) {
      alert('Full area must be greater than 0');
      return;
    }

    if (this.livingAreaInvalid(ap)) {
      alert('Living area must be greater than 0');
      return;
    }

    if (this.areaRelationInvalid(ap)) {
      alert('Living area cannot be greater than full area');
      return;
    }

    const basePayload = {
      numurs: Number(ap.numurs),
      stavs: Number(ap.stavs),
      istabuSkaits: Number(ap.istabuSkaits),
      iedzivotajuSkaits: ap.iedzivotaji.length,
      pilnaPlatiba: Number(ap.pilnaPlatiba),
      dzivojamaPlatiba: Number(ap.dzivojamaPlatiba),
      majaId: ap.majaId,
      iedzivotajsIds: ap.iedzivotaji.map(r => r.id)
    };

    if (!ap.id) {
      this.apartmentService.create(basePayload as any).subscribe({
        next: () => {
          this.router.navigate(['/house', ap.majaId]);
        },
        error: (err) => {
          console.error('Create error:', err);
          alert(JSON.stringify(err.error));
        }
      });
      return;
    }

    const updatePayload = {
      id: ap.id,
      ...basePayload
    };

    this.apartmentService.update(ap.id, updatePayload as any).subscribe({
      next: () => {
        this.router.navigate(['/house', ap.majaId]);
      },
      error: (err) => {
        console.error('Update error:', err);
        alert(JSON.stringify(err.error));
      }
    });
  }

  goBack(): void {
    const ap = this.apartment();

    if (!ap || !ap.majaId) {
      this.router.navigate(['/invoices']);
      return;
    }

    if (this.auth.isManager()) {
      this.router.navigate(['/house', ap.majaId]);
    } else {
      this.router.navigate(['/invoices']);
    }
  }

  deleteResident(id: string): void {
    if (!this.auth.isManager()) {
      return;
    }

    if (!confirm('Delete this resident?')) return;

    this.residentService.delete(id).subscribe({
      next: () => {
        this.reloadApartment();
      },
      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  resetResidentValidation(): void {
    this.residentErrors = {
      name: '',
      surname: '',
      personalCode: '',
      phone: '',
      email: ''
    };

    this.residentFieldTouched = {
      name: false,
      surname: false,
      personalCode: false,
      phone: false,
      email: false
    };
  }

  touchResidentField(field: ResidentValidationField): void {
    this.residentFieldTouched[field] = true;
  }

  validateResidentField(field: ResidentValidationField): void {
    if (!this.selectedResident) return;

    const textPattern = /^[A-Za-zĀ-žА-Яа-яЁё\s-]+$/;

    switch (field) {
      case 'name': {
        const value = (this.selectedResident.vards ?? '').trim();

        if (!value) {
          this.residentErrors.name = 'Name is required';
        } else if (value.length < 2) {
          this.residentErrors.name = 'Name must contain at least 2 letters';
        } else if (!textPattern.test(value)) {
          this.residentErrors.name = 'Name must contain only letters';
        } else {
          this.residentErrors.name = '';
        }
        break;
      }

      case 'surname': {
        const value = (this.selectedResident.uzvards ?? '').trim();

        if (!value) {
          this.residentErrors.surname = 'Surname is required';
        } else if (value.length < 2) {
          this.residentErrors.surname = 'Surname must contain at least 2 letters';
        } else if (!textPattern.test(value)) {
          this.residentErrors.surname = 'Surname must contain only letters';
        } else {
          this.residentErrors.surname = '';
        }
        break;
      }

      case 'personalCode': {
        const value = (this.selectedResident.personasKods ?? '').trim();

        if (value && !/^\d{6}-\d{5}$/.test(value)) {
          this.residentErrors.personalCode = 'Use format 123456-12345';
        } else {
          this.residentErrors.personalCode = '';
        }
        break;
      }

      case 'phone': {
        const value = (this.selectedResident.telefons ?? '').trim();

        if (value && !/^\+?[0-9]{8,15}$/.test(value)) {
          this.residentErrors.phone = 'Phone must contain 8 to 15 digits';
        } else {
          this.residentErrors.phone = '';
        }
        break;
      }

      case 'email': {
        const value = (this.selectedResident.epasts ?? '').trim();

        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          this.residentErrors.email = 'Enter a valid email address';
        } else {
          this.residentErrors.email = '';
        }
        break;
      }
    }
  }

  validateAllResidentFields(): boolean {
    const fields: ResidentValidationField[] = ['name', 'surname', 'personalCode', 'phone', 'email'];

    fields.forEach(field => {
      this.residentFieldTouched[field] = true;
      this.validateResidentField(field);
    });

    return !fields.some(field => !!this.residentErrors[field]);
  }

  residentFormInvalid(): boolean {
    if (!this.selectedResident) return true;

    return !this.validateResidentPreview();
  }

  private validateResidentPreview(): boolean {
    const textPattern = /^[A-Za-zĀ-žА-Яа-яЁё\s-]+$/;

    const name = (this.selectedResident.vards ?? '').trim();
    const surname = (this.selectedResident.uzvards ?? '').trim();
    const personalCode = (this.selectedResident.personasKods ?? '').trim();
    const phone = (this.selectedResident.telefons ?? '').trim();
    const email = (this.selectedResident.epasts ?? '').trim();

    if (!name || name.length < 2 || !textPattern.test(name)) return false;
    if (!surname || surname.length < 2 || !textPattern.test(surname)) return false;
    if (personalCode && !/^\d{6}-\d{5}$/.test(personalCode)) return false;
    if (phone && !/^\+?[0-9]{8,15}$/.test(phone)) return false;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

    return true;
  }

  saveResident(): void {
    if (!this.auth.isManager()) {
      return;
    }

    if (!this.selectedResident) return;

    const ap = this.apartment();
    if (!ap) return;

    if (!ap.id) {
      alert('Save apartment first before adding residents');
      return;
    }

    if (!this.validateAllResidentFields()) {
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000);

    const baseDto = {
      vards: this.selectedResident.vards.trim(),
      uzvards: this.selectedResident.uzvards.trim(),
      personasKods:
        this.selectedResident.personasKods && this.selectedResident.personasKods.trim() !== ''
          ? this.selectedResident.personasKods.trim()
          : `${code}-12345`,
      telefons: (this.selectedResident.telefons ?? '').trim(),
      epasts: (this.selectedResident.epasts ?? '').trim(),
      isOwner: this.selectedResident.isOwner ?? false,
      dzivoklisIds: [ap.id]
    };

    if (this.selectedResident.id) {
      const updateDto = {
        id: this.selectedResident.id,
        ...baseDto
      };

      this.residentService.update(this.selectedResident.id, updateDto).subscribe({
        next: () => {
          this.reloadApartment();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Update failed');
        }
      });

      return;
    }

    this.residentService.create(baseDto).subscribe({
      next: () => {
        this.reloadApartment();
      },
      error: (err) => {
        console.error(err);
        alert(JSON.stringify(err.error));
      }
    });
  }
}