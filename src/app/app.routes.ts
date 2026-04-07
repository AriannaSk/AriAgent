import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

import { LoginComponent } from './pages/login/login';
import { AllHouses } from './pages/all-houses/all-houses';
import { HouseDetail } from './pages/house-detail/house-detail';
import { HouseBilling } from './pages/billing/house-billing';
import { InvoiceDetail } from './pages/billing/invoice-detail';
import { Apartments } from './pages/apartments/apartments';
import { ApartmentDetail } from './pages/apartment-detail/apartment-detail';
import { Residents } from './pages/residents/residents';
import { ResidentDashboardComponent } from './pages/resident-dashboard/resident-dashboard';
import { ResidentApartmentDetail } from './pages/resident-apartments/resident-apartments';
import { ResidentInvoicesComponent } from './pages/resident-invoices/resident-invoices';
import { ResidentProfileComponent } from './pages/resident-profile/resident-profile';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: '',
    canActivate: [authGuard],
    data: { roles: ['Manager'] },
    children: [
      { path: 'houses', component: AllHouses },
      { path: 'house/:id', component: HouseDetail },
      { path: 'apartments', component: Apartments },
      { path: 'apartment/:id', component: ApartmentDetail },
      { path: 'manager/billing/:id', component: HouseBilling },
      { path: 'invoices', component: HouseBilling },
      { path: 'residents', component: Residents },
      { path: 'invoice/:id', component: InvoiceDetail }
    ]
  },

 {
  path: 'resident',
  canActivate: [authGuard],
  data: { roles: ['Resident'] },
  children: [
    { path: 'dashboard', component: ResidentDashboardComponent },
    { path: 'profile', component: ResidentProfileComponent },
    { path: 'apartment/:id', component: ResidentApartmentDetail },
    { path: 'invoices', component: ResidentInvoicesComponent }
  ]
},

  { path: '**', redirectTo: 'login' }
];