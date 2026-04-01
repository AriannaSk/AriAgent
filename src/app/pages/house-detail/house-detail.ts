import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private houseService: HouseService,
    private apartmentService: ApartmentService,
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService
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
      }
    });
  }

  openApartment(id: string): void {
    this.router.navigate(['/apartment', id]);
  }

  addApartment(): void {
    const h = this.house();
    if (!h || !h.id) return;

    this.router.navigate(['/apartment', 'new'], {
      queryParams: { houseId: h.id }
    });
  }

  goBack(): void {
    this.router.navigate(['/houses']);
  }
}