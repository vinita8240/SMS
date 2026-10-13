import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your network connection.';
      } else if (error.status === 401) {
        errorMessage = 'Session expired or unauthorized. Please log in.';
        auth.logout();
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Requested resource not found.';
      } else if (error.status === 409) {
        errorMessage = 'Duplicate record conflict.';
      } else if (error.status >= 500) {
        errorMessage = 'Internal server error. Please try again later.';
      }

      // Don't toast error on silent /me initial failure
      if (!req.url.endsWith('/auth/me')) {
        notify.error('Request Failed', errorMessage);
      }

      return throwError(() => error);
    })
  );
};
