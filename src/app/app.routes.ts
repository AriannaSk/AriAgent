import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

import { LoginComponent } from './pages/login/login';
import { AllHouses } from './pages/all-houses/all-houses';
import { HouseDetail } from './pages/house-detail/house-detail';
import { HouseBilling } from './pages/billing/house-billing';
import { InvoiceDetail } from './pages/billing/invoice-detail';
import { Apartments } from './pages/apartments/apartments';
import { Residents } from './pages/residents/residents';
import { ResidentDashboardComponent } from './pages/resident-dashboard/resident-dashboard';
import { ResidentApartmentDetail } from './pages/resident-apartments/resident-apartments';
import { ResidentInvoicesComponent } from './pages/resident-invoices/resident-invoices';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'houses',
    component: AllHouses,
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
    path: 'manager/billing/:id',
    component: HouseBilling,
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
    path: 'invoice/:id',
    component: InvoiceDetail,
    canActivate: [authGuard],
    data: { roles: ['Manager'] }
  },

  {
    path: 'resident/dashboard',
    component: ResidentDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['Resident'] }
  },
  {
    path: 'resident/apartment/:id',
    component: ResidentApartmentDetail,
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
    path: 'resident/invoice/:id',
    component: InvoiceDetail,
    canActivate: [authGuard],
    data: { roles: ['Resident'] }
  },

  { path: '**', redirectTo: 'login' }
];