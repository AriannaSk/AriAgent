import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApartmentService } from '../../services/apartment.service';
import { HouseService, House } from '../../services/house';
import { Apartment } from '../../services/apartment';
import { ResidentService } from '../../services/resident.service';
import { AuthService } from '../../services/auth.service';

type ResidentValidationField = 'name' | 'surname' | 'personalCode' | 'phone' | 'email';

@Component({
  selector: 'app-apartments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apartments.html',
  styleUrls: ['./apartments.css']
})
export class Apartments implements OnInit {

  readonly apartments = signal<Apartment[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');

  private housesMap: Record<string, House> = {};

  selectedApartment: Apartment | null = null;
  showDeleteModal = false;

  editingApartment: Apartment | null = null;
  showEditModal = false;

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
        private apartmentService: ApartmentService,
        private houseService: HouseService,
        private residentService: ResidentService,
        public auth: AuthService,
        private router: Router
      ) {}

      ngOnInit(): void {
      if (this.auth.isResident()) {
        this.loadMyApartments();
      } else {
        this.loadAllApartments();
      }
    }
    openApartmentDetails(apartment: Apartment): void {
  this.router.navigate(['/apartment', apartment.id]);
}

  loadAllApartments(): void {
    this.loading.set(true);

    this.houseService.getAll().subscribe({
      next: (houses) => {
        this.housesMap = {};

        houses.forEach(h => {
          this.housesMap[h.id] = h;
        });

        const allApartments: Apartment[] = [];
        let loadedCount = 0;

        if (houses.length === 0) {
          this.apartments.set([]);
          this.loading.set(false);
          return;
        }

        houses.forEach(h => {
          this.apartmentService.getByHouseId(h.id).subscribe({
            next: (apts) => {
              allApartments.push(...(apts ?? []));
              loadedCount++;

              if (loadedCount === houses.length) {
                this.apartments.set(allApartments);
                this.loading.set(false);
              }
            },
            error: () => {
              loadedCount++;

              if (loadedCount === houses.length) {
                this.apartments.set(allApartments);
                this.loading.set(false);
              }
            }
          });
        });
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
  loadMyApartments(): void {
  this.loading.set(true);

  this.apartmentService.getMyApartments().subscribe({
    next: (apartments) => {
      this.apartments.set(apartments ?? []);
      this.loading.set(false);
    },
    error: (err) => {
      console.error(err);
      this.apartments.set([]);
      this.loading.set(false);
    }
  });
  
}

  readonly filteredApartments = computed(() => {
    const term = this.searchTerm().toLowerCase();

    if (!term) return this.apartments();

    return this.apartments().filter(a => {
      const house = this.housesMap[a.majaId];

      const address = house
        ? `${house.iela} ${house.numurs} ${house.pilseta}`.toLowerCase()
        : '';

      const residents = (a.iedzivotaji ?? [])
        .map(r => `${r.vards} ${r.uzvards}`.toLowerCase())
        .join(' ');

      return (
        a.numurs.toString().includes(term) ||
        address.includes(term) ||
        residents.includes(term)
      );
    });
  });

  getHouseName(ap: Apartment): string {

  // для resident
  if ((ap as any).majaNosaukums) {
    return (ap as any).majaNosaukums;
  }

  // для manager
  const h = this.housesMap[ap.majaId];

  if (!h) return 'Unknown house';

  return `${h.iela} ${h.numurs}, ${h.pilseta}`;
}

  getResidentsCount(ap: Apartment): number {
    return ap.iedzivotaji?.length ?? 0;
  }

  getTotalResidents(): number {
    return this.apartments().reduce((sum, apartment) => {
      return sum + (apartment.iedzivotaji?.length ?? 0);
    }, 0);
  }

  deleteApartment(a: Apartment): void {
    this.selectedApartment = a;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedApartment = null;
  }

  confirmDelete(): void {
    if (!this.selectedApartment) return;

    this.apartmentService.delete(this.selectedApartment.id).subscribe(() => {
      this.apartments.update(list =>
        list.filter(a => a.id !== this.selectedApartment!.id)
      );

      this.closeDeleteModal();
    });
  }

  openEditModal(a: Apartment): void {
    this.editingApartment = JSON.parse(JSON.stringify(a));
    this.showEditModal = true;
    this.selectedResident = null;
    this.resetResidentValidation();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingApartment = null;
    this.selectedResident = null;
    this.resetResidentValidation();
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

  saveApartment(): void {
    const ap = this.editingApartment;
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

    const payload = {
      id: ap.id,
      numurs: Number(ap.numurs),
      stavs: Number(ap.stavs),
      istabuSkaits: Number(ap.istabuSkaits),
      iedzivotajuSkaits: ap.iedzivotaji?.length ?? 0,
      pilnaPlatiba: Number(ap.pilnaPlatiba),
      dzivojamaPlatiba: Number(ap.dzivojamaPlatiba),
      majaId: ap.majaId,
      iedzivotajsIds: (ap.iedzivotaji ?? []).map((r: any) => r.id)
    };

    this.apartmentService.update(ap.id, payload as any).subscribe({
      next: () => {
        this.loadAllApartments();
        this.closeEditModal();
      },
      error: (err) => {
        console.error(err);
        alert('Update failed');
      }
    });
  }

  addResident(): void {
    this.selectedResident = {
      id: '',
      vards: '',
      uzvards: '',
      personasKods: '',
      telefons: '',
      epasts: '',
      isOwner: false
    };

    this.resetResidentValidation();
  }

  editResident(r: any): void {
    this.selectedResident = { ...r };
    this.resetResidentValidation();
  }

  closeResidentModal(): void {
    this.selectedResident = null;
    this.resetResidentValidation();
  }

  deleteResident(id: string): void {
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
    const ap = this.editingApartment;
    if (!ap || !this.selectedResident) return;

    if (!this.validateAllResidentFields()) {
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000);

    const dto = {
      id: this.selectedResident.id || '',
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
      this.residentService.update(this.selectedResident.id, dto).subscribe({
        next: () => {
          this.reloadApartment();
        },
        error: (err) => {
          console.error(err);
          alert(err?.error?.message || JSON.stringify(err?.error) || 'Update failed');
        }
      });
    } else {
      this.residentService.create(dto).subscribe({
        next: () => {
          this.reloadApartment();
        },
        error: (err) => {
          console.error(err);
          alert(err?.error?.message || JSON.stringify(err?.error) || 'Create failed');
        }
      });
    }
  }
  

  reloadApartment(): void {
    const ap = this.editingApartment;
    if (!ap) return;

    this.apartmentService.getById(ap.id).subscribe({
      next: (data) => {
        this.editingApartment = data;
        this.selectedResident = null;
        this.resetResidentValidation();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to reload apartment');
      }
    });
  }
  
}