import { ApplicationConfig } from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {

  providers: [

    // ROUTER
    provideRouter(routes),

    // HTTP + JWT INTERCEPTOR
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // ANIMATIONS
    provideAnimations(),

    // TOAST NOTIFICATIONS
    provideToastr({
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
      preventDuplicates: true
    })

  ]

};