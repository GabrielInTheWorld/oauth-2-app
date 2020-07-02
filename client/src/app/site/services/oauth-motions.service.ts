import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';
import { AuthService, TokenType } from 'src/app/core/services/auth.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class OauthMotionsService {
    private readonly oauthRoute = 'oauth/motions';

    private token: TokenType = null;

    public constructor(private readonly http: HttpService, private readonly auth: AuthService) {
        auth.TokenTypeObservable.subscribe(token => (this.token = token));
    }

    public async getAll(): Promise<any> {
        return this.http.get(
            `${this.oauthRoute}/all`,
            null,
            new HttpHeaders().set('authorization', this.token.accessToken),
            null,
            AuthService.getOAuthServerURL()
        );
    }

    public async get(id: string): Promise<any> {
        return this.http.post(
            `${this.oauthRoute}/get`,
            { id },
            new HttpHeaders().set('authorization', this.token.accessToken),
            AuthService.getOAuthServerURL()
        );
    }
}
