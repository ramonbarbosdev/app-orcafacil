import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';

// registerLocaleDataaleData(localePt, 'pt-BR');

bootstrapApplication(App, {
  providers: [
    ConfirmationService,
    MessageService,
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideHttpClient(),
    // withInterceptors([
    //   TokenInterceptor,
    //   Error403Interceptor,
    //   Error401Interceptor,
    //   TenantInterceptor,
    // ])
    provideRouter(routes),

    ...appConfig.providers,
  ],
}).catch((err) => console.error(err));