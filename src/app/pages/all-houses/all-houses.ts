import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { HouseService, House } from '../../services/house';
import { AuthService } from '../../services/auth.service';

type HouseField = 'iela' | 'numurs' | 'pilseta' | 'pastaIndekss' | 'valsts';

@Component({
  selector: 'app-all-houses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-houses.html',
  styleUrls: ['./all-houses.css']
})
export class AllHouses implements OnInit {
  readonly houses = signal<House[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string>('');
  readonly searchTerm = signal<string>('');

  readonly showModal = signal<boolean>(false);
  readonly editingHouse = signal<House | null>(null);

  readonly fieldErrors = signal<Record<HouseField, string>>({
    iela: '',
    numurs: '',
    pilseta: '',
    pastaIndekss: '',
    valsts: ''
  });

  readonly touchedFields = signal<Record<HouseField, boolean>>({
    iela: false,
    numurs: false,
    pilseta: false,
    pastaIndekss: false,
    valsts: false
  });

  selectedHouse: House | null = null;
  showDeleteHouseModal = false;

  constructor(
    private houseService: HouseService,
    private router: Router,
    public auth: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadHouses();
  }

  readonly filteredHouses = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) return this.houses();

    return this.houses().filter(h =>
      (h.iela ?? '').toLowerCase().includes(term) ||
      (h.pilseta ?? '').toLowerCase().includes(term) ||
      h.numurs.toString().includes(term)
    );
  });

  private getErrorMessage(
    err: any,
    fallback: string
  ): string {
    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (typeof err?.error?.message === 'string' && err.error.message.trim()) {
      return err.error.message;
    }

    if (typeof err?.message === 'string' && err.message.trim()) {
      return err.message;
    }

    return fallback;
  }

  loadHouses(): void {
    this.loading.set(true);
    this.error.set('');

    this.houseService.getAll().subscribe({
      next: (data: House[]) => {
        this.houses.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load houses:', err);

        const message = this.getErrorMessage(err, 'Failed to load houses');

        this.error.set(message);
        this.loading.set(false);
        this.toastr.error(message, 'Error');
      }
    });
  }

  openHouse(id: string): void {
    const house = this.houses().find(h => h.id === id);
    if (!house) return;

    this.editingHouse.set({ ...house });
    this.resetValidation();
    this.showModal.set(true);
  }

  createHouse(): void {
    this.editingHouse.set({
      id: '',
      iela: '',
      numurs: 0,
      pilseta: '',
      pastaIndekss: '',
      valsts: ''
    });

    this.resetValidation();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingHouse.set(null);
    this.resetValidation();
  }

  resetValidation(): void {
    this.fieldErrors.set({
      iela: '',
      numurs: '',
      pilseta: '',
      pastaIndekss: '',
      valsts: ''
    });

    this.touchedFields.set({
      iela: false,
      numurs: false,
      pilseta: false,
      pastaIndekss: false,
      valsts: false
    });
  }

  updateField(field: keyof House, value: any): void {
    const house = this.editingHouse();
    if (!house) return;

    let updatedValue = value;

    if (field === 'numurs') {
      updatedValue = value === '' ? '' : Number(value);
    }

    this.editingHouse.set({
      ...house,
      [field]: updatedValue
    });

    if (this.isHouseField(field)) {
      this.markTouched(field);
      this.validateField(field);
    }
  }

  isHouseField(field: keyof House): field is HouseField {
    return ['iela', 'numurs', 'pilseta', 'pastaIndekss', 'valsts'].includes(field);
  }

  markTouched(field: HouseField): void {
    this.touchedFields.update(current => ({
      ...current,
      [field]: true
    }));
  }

  validateField(field: HouseField): void {
    const house = this.editingHouse();
    if (!house) return;

    let message = '';
    const textPattern = /^[A-Za-zĀ-žа-яА-ЯЁё\s-]+$/;

    switch (field) {
      case 'iela':
        if (!house.iela || !house.iela.trim()) {
          message = 'Street is required';
        } else if (house.iela.trim().length < 2) {
          message = 'Street must contain at least 2 letters';
        } else if (!textPattern.test(house.iela.trim())) {
          message = 'Street must contain only letters';
        }
        break;

      case 'numurs':
        if (house.numurs === null || house.numurs === undefined || Number.isNaN(Number(house.numurs))) {
          message = 'House number is required';
        } else if (!Number.isInteger(Number(house.numurs))) {
          message = 'House number must be a whole number';
        } else if (Number(house.numurs) <= 0) {
          message = 'House number must be greater than 0';
        }
        break;

      case 'pilseta':
        if (!house.pilseta || !house.pilseta.trim()) {
          message = 'City is required';
        } else if (house.pilseta.trim().length < 2) {
          message = 'City must contain at least 2 letters';
        } else if (!textPattern.test(house.pilseta.trim())) {
          message = 'City must contain only letters';
        }
        break;

      case 'pastaIndekss':
        if (!house.pastaIndekss || !house.pastaIndekss.trim()) {
          message = 'Postal code is required';
        } else if (!/^(LV-\d{4})$/i.test(house.pastaIndekss.trim())) {
          message = 'Use format LV-1234';
        }
        break;

      case 'valsts':
        if (!house.valsts || !house.valsts.trim()) {
          message = 'Country is required';
        } else if (house.valsts.trim().length < 2) {
          message = 'Country must contain at least 2 letters';
        } else if (!textPattern.test(house.valsts.trim())) {
          message = 'Country must contain only letters';
        }
        break;
    }

    this.fieldErrors.update(current => ({
      ...current,
      [field]: message
    }));
  }

  validateAllFields(): boolean {
    const fields: HouseField[] = ['iela', 'numurs', 'pilseta', 'pastaIndekss', 'valsts'];

    this.touchedFields.set({
      iela: true,
      numurs: true,
      pilseta: true,
      pastaIndekss: true,
      valsts: true
    });

    fields.forEach(field => this.validateField(field));

    const errors = this.fieldErrors();
    return !fields.some(field => !!errors[field]);
  }

  hasError(field: HouseField): boolean {
    return this.touchedFields()[field] && !!this.fieldErrors()[field];
  }

  getError(field: HouseField): string {
    return this.fieldErrors()[field];
  }

  saveHouse(): void {
    const house = this.editingHouse();
    if (!house) return;

    if (!this.validateAllFields()) {
      return;
    }

    const payload: House = {
      ...house,
      iela: house.iela.trim(),
      pilseta: house.pilseta.trim(),
      pastaIndekss: house.pastaIndekss.trim(),
      valsts: house.valsts.trim()
    };

    if (!payload.id) {
      this.houseService.create(payload).subscribe({
        next: () => {
          this.loadHouses();
          this.closeModal();
          this.toastr.success('House created successfully', 'Success');
        },
        error: (err) => {
          console.error('Failed to create house:', err);

          const message = this.getErrorMessage(
            err,
            'House with this address already exists.'
          );

          this.error.set(message);
          this.toastr.error(message, 'Error');
        }
      });
    } else {
      this.houseService.update(payload.id, payload).subscribe({
        next: () => {
          this.loadHouses();
          this.closeModal();
          this.toastr.success('House updated successfully', 'Success');
        },
        error: (err) => {
          console.error('Failed to update house:', err);

          const message = this.getErrorMessage(
            err,
            'House with this address already exists.'
          );

          this.error.set(message);
          this.toastr.error(message, 'Error');
        }
      });
    }
  }

  openHouseApartments(id: string): void {
    this.router.navigate(['/house', id]);
  }

  openDeleteHouseModal(h: House): void {
    this.selectedHouse = h;
    this.showDeleteHouseModal = true;
  }

  closeDeleteHouseModal(): void {
    this.showDeleteHouseModal = false;
    this.selectedHouse = null;
  }

  confirmDeleteHouse(): void {
    if (!this.selectedHouse) return;

    this.houseService.delete(this.selectedHouse.id).subscribe({
      next: () => {
        this.houses.update(list =>
          list.filter(h => h.id !== this.selectedHouse!.id)
        );

        this.toastr.success('House deleted successfully', 'Success');
        this.closeDeleteHouseModal();
      },
      error: (err) => {
        console.error('Failed to delete house:', err);

        const message = this.getErrorMessage(err, 'Failed to delete house');

        this.toastr.error(message, 'Error');
      }
    });
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    const letterPattern = /^[A-Za-zĀ-žа-яА-ЯЁё\s-]$/;

    if (!letterPattern.test(event.key)) {
      event.preventDefault();
    }
  }
}