import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { HouseService, House } from '../../services/house';
import { ApartmentService } from '../../services/apartment.service';
import { Apartment } from '../../services/apartment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-house-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './house-detail.html',
  styleUrls: ['./house-detail.css']
})
export class HouseDetail implements OnInit {
  readonly house = signal<House | null>(null);
  readonly apartments = signal<Apartment[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  selectedApartment: Apartment | null = null;
  showDeleteApartmentModal = false;

  constructor(
    private houseService: HouseService,
    private apartmentService: ApartmentService,
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id || id === 'new') {
        this.house.set(null);
        this.apartments.set([]);
        this.loading.set(false);
        this.error.set('Invalid house id');
        return;
      }

      this.loadHouse(id);
    });
  }

  private getErrorMessage(err: any, fallback: string): string {
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

  loadHouse(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.houseService.getById(id).subscribe({
      next: (data) => {
        this.house.set(data);
        this.loadApartments(id);
      },
      error: (err) => {
        console.error(err);
        this.house.set(null);
        this.apartments.set([]);
        this.error.set('Failed to load house');
        this.loading.set(false);
        this.toastr.error('Failed to load house', 'Error');
      }
    });
  }

  loadApartments(houseId: string): void {
    this.apartmentService.getByHouseId(houseId).subscribe({
      next: (data) => {
        this.apartments.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.apartments.set([]);
        this.error.set('Failed to load apartments');
        this.loading.set(false);
        this.toastr.error('Failed to load apartments', 'Error');
      }
    });
  }

  openApartment(id: string): void {
    this.router.navigate(['/apartment', id]);
  }

  addApartment(): void {
    if (!this.auth.isManager()) return;

    const h = this.house();
    if (!h || !h.id) return;

    this.router.navigate(['/apartment', 'new'], {
      queryParams: { houseId: h.id }
    });
  }

  openDeleteApartmentModal(apartment: Apartment): void {
    this.selectedApartment = apartment;
    this.showDeleteApartmentModal = true;
  }

  closeDeleteApartmentModal(): void {
    this.showDeleteApartmentModal = false;
    this.selectedApartment = null;
  }

  confirmDeleteApartment(): void {
    if (!this.auth.isManager() || !this.selectedApartment) return;

    this.apartmentService.delete(this.selectedApartment.id).subscribe({
      next: () => {
        this.apartments.update(list =>
          list.filter(a => a.id !== this.selectedApartment!.id)
        );

        this.toastr.success('Apartment deleted successfully', 'Success');
        this.closeDeleteApartmentModal();
      },
      error: (err) => {
        console.error(err);

        const message = this.getErrorMessage(err, 'Failed to delete apartment');
        this.toastr.error(message, 'Error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/houses']);
  }
}