import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthTokenService } from './auth-token.service';

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
    public constructor(private readonly authTokenService: AuthTokenService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // console.log('request', request);
        // console.log('accessToken', this.authTokenService.rawAccessToken);
        // console.log('headers:', request.headers);
        // request = request.clone({
        //     setHeaders: {
        //         authentication: this.authTokenService.rawAccessToken
        //     }
        // });
        if (this.authTokenService.rawAccessToken) {
            request = request.clone({
                setHeaders: {
                    authentication: this.authTokenService.rawAccessToken
                }
            });
        }
        // try {
        // } catch (e) {
        //     console.log('something went wrong:', e);
        // }
        return next.handle(request).pipe(
            tap(
                httpEvent => {
                    if (httpEvent instanceof HttpResponse && httpEvent.headers.get('Authentication')) {
                        this.authTokenService.setRawAccessToken(httpEvent.headers.get('Authentication'));
                    }
                },
                error => {
                    if (error instanceof HttpErrorResponse) {
                    }
                }
            )
        );
    }
}
