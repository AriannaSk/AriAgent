import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentService, Resident } from '../../services/resident.service';

type ValidationErrors = {
  vards?: string;
  uzvards?: string;
  epasts?: string;
  telefons?: string;
  personasKods?: string;
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
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly showValidation = signal(false);
  readonly validationErrors = signal<ValidationErrors>({});

  resident: Resident | null = null;

  constructor(
    private residentService: ResidentService,
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
    this.validationErrors.set({});

    this.residentService.getMe().subscribe({
      next: (data) => {
        this.resident = { ...data };
        this.loading.set(false);
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

  validateForm(): boolean {
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

  save(): void {
    if (!this.resident) return;

    this.showValidation.set(true);
    this.clearMessages();

    const isValid = this.validateForm();
    if (!isValid) {
      this.error.set('Please correct the highlighted fields');
      return;
    }

    this.saving.set(true);

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
        this.saving.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to update profile');
        this.saving.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/resident/dashboard']);
  }
}