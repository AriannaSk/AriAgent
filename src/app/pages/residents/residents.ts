import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentService } from '../../services/resident.service';

interface DzivoklisShort {
  id: string;
  numurs: number;
  majaNosaukums?: string;
}

interface Resident {
  id: string;
  vards: string;
  uzvards: string;
  personasKods?: string;
  telefons?: string;
  epasts?: string;
  isOwner?: boolean;
  dzivokli?: DzivoklisShort[];
}

type ResidentValidationField = 'name' | 'surname' | 'personalCode' | 'phone' | 'email';

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './residents.html',
  styleUrls: ['./residents.css']
})
export class Residents implements OnInit {

  readonly residents = signal<Resident[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');

  editingResident: Resident | null = null;

  selectedResidentForDelete: Resident | null = null;
  showDeleteModal = false;

  isSaving = false;

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
    private residentService: ResidentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadResidents();
  }

  loadResidents(): void {
    this.loading.set(true);

    this.residentService.getAllResidents().subscribe({
      next: (data: Resident[]) => {
        this.residents.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  readonly filteredResidents = computed(() => {
    const term = this.searchTerm().toLowerCase();

    if (!term) return this.residents();

    return this.residents().filter((r: Resident) =>
      r.vards.toLowerCase().includes(term) ||
      r.uzvards.toLowerCase().includes(term) ||
      (r.personasKods ?? '').toLowerCase().includes(term) ||
      (r.epasts ?? '').toLowerCase().includes(term) ||
      (r.telefons ?? '').toLowerCase().includes(term)
    );
  });

  getTotalLinkedApartments(): number {
    return this.residents().reduce((sum, resident) => {
      return sum + (resident.dzivokli?.length ?? 0);
    }, 0);
  }

  openEditModal(resident: Resident): void {
    this.editingResident = { ...resident };
    this.resetResidentValidation();
  }

  closeEditModal(): void {
    this.editingResident = null;
    this.resetResidentValidation();
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
    if (!this.editingResident) return;

    const textPattern = /^[A-Za-zĀ-žА-Яа-яЁё\s-]+$/;

    switch (field) {
      case 'name': {
        const value = (this.editingResident.vards ?? '').trim();

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
        const value = (this.editingResident.uzvards ?? '').trim();

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
        const value = (this.editingResident.personasKods ?? '').trim();

        if (value && !/^\d{6}-\d{5}$/.test(value)) {
          this.residentErrors.personalCode = 'Use format 123456-12345';
        } else {
          this.residentErrors.personalCode = '';
        }
        break;
      }

      case 'phone': {
        const value = (this.editingResident.telefons ?? '').trim();

        if (value && !/^\+?[0-9]{8,15}$/.test(value)) {
          this.residentErrors.phone = 'Phone must contain 8 to 15 digits';
        } else {
          this.residentErrors.phone = '';
        }
        break;
      }

      case 'email': {
        const value = (this.editingResident.epasts ?? '').trim();

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

  private validateResidentPreview(): boolean {
    if (!this.editingResident) return false;

    const textPattern = /^[A-Za-zĀ-žА-Яа-яЁё\s-]+$/;

    const name = (this.editingResident.vards ?? '').trim();
    const surname = (this.editingResident.uzvards ?? '').trim();
    const personalCode = (this.editingResident.personasKods ?? '').trim();
    const phone = (this.editingResident.telefons ?? '').trim();
    const email = (this.editingResident.epasts ?? '').trim();

    if (!name || name.length < 2 || !textPattern.test(name)) return false;
    if (!surname || surname.length < 2 || !textPattern.test(surname)) return false;
    if (personalCode && !/^\d{6}-\d{5}$/.test(personalCode)) return false;
    if (phone && !/^\+?[0-9]{8,15}$/.test(phone)) return false;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

    return true;
  }

  residentFormInvalid(): boolean {
    if (!this.editingResident) return true;
    return !this.validateResidentPreview();
  }

  saveResident(): void {
    if (!this.editingResident) return;

    if (!this.validateAllResidentFields()) {
      return;
    }

    this.isSaving = true;

    const dto = {
      id: this.editingResident.id,
      vards: this.editingResident.vards.trim(),
      uzvards: this.editingResident.uzvards.trim(),
      personasKods: (this.editingResident.personasKods ?? '').trim(),
      telefons: (this.editingResident.telefons ?? '').trim(),
      epasts: (this.editingResident.epasts ?? '').trim(),
      isOwner: this.editingResident.isOwner || false,
      dzivoklisIds: this.editingResident.dzivokli?.map((d: DzivoklisShort) => d.id) || []
    };

    this.residentService.update(this.editingResident.id, dto)
      .subscribe({
        next: () => {
          this.isSaving = false;

          this.residents.update((list: Resident[]) =>
            list.map((r: Resident) =>
              r.id === this.editingResident!.id
                ? { ...this.editingResident! }
                : r
            )
          );

          this.closeEditModal();
        },
        error: () => {
          this.isSaving = false;
          alert('Update failed');
        }
      });
  }

  deleteResident(resident: Resident): void {
    this.editingResident = null;
    this.selectedResidentForDelete = resident;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedResidentForDelete = null;
  }

  confirmDelete(): void {
    if (!this.selectedResidentForDelete) return;

    const id = this.selectedResidentForDelete.id;

    this.residentService.delete(id).subscribe({
      next: () => {
        this.residents.update(list =>
          list.filter(r => r.id !== id)
        );

        this.closeDeleteModal();
      },
      error: () => {
        alert('Delete failed');
      }
    });
  }

  goToApartment(id: string): void {
    this.router.navigate(['/apartment', id]);
  }
}