import { Routes } from '@angular/router';

import { AllHouses } from './pages/all-houses/all-houses';
import { HouseDetail } from './pages/house-detail/house-detail';
import { ApartmentDetail } from './pages/apartment-detail/apartment-detail';
import { LoginComponent } from './pages/login/login';
import { HouseBilling } from './pages/billing/house-billing';
import { Apartments } from './pages/apartments/apartments';
import { Residents } from './pages/residents/residents';
import { authGuard } from './auth.guard';
import { InvoiceDetail } from './pages/billing/invoice-detail';
import { ResidentApartmentDetail } from './pages/resident-apartment-detail/resident-apartment-detail';

import { ResidentDashboardComponent } from './pages/resident-dashboard/resident-dashboard';
import { ResidentProfileComponent } from './pages/resident-profile/resident-profile';
import { ResidentInvoicesComponent } from './pages/resident-invoices/resident-invoices';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // MANAGER
  {
    path: 'houses',
    component: AllHouses,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },
  {
    path: 'apartments',
    component: Apartments,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },
  {
    path: 'residents',
    component: Residents,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },
  {
    path: 'invoices',
    component: HouseBilling,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },
  {
    path: 'house/:id',
    component: HouseDetail,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },
  {
    path: 'house/:id/billing',
    component: HouseBilling,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },
  {
    path: 'apartment/:id',
    component: ApartmentDetail,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },
  {
    path: 'invoice/:id',
    component: InvoiceDetail,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },

  // RESIDENT
  {
    path: 'resident/dashboard',
    component: ResidentDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['Resident'] }
  },
  {
    path: 'resident/profile',
    component: ResidentProfileComponent,
    canActivate: [authGuard],
    data: { roles: ['Resident'] }
  },
  {
    path: 'resident/invoices',
    component: ResidentInvoicesComponent,
    canActivate: [authGuard],
    data: { roles: ['Resident'] }
  },
  {
    path: 'my-apartments',
    component: Apartments,
    canActivate: [authGuard],
    data: { roles: ['Resident'] }
  },
  {
    path: 'resident/apartment/:id',
    component: ResidentApartmentDetail,
    canActivate: [authGuard],
    data: { roles: ['Resident'] }
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];