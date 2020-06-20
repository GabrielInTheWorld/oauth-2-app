import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import sha256 from 'fast-sha256';
import * as qs from 'qs';
import * as querystring from 'querystring';
import { BehaviorSubject, Observable } from 'rxjs';
import { sha256 } from 'sha.js';
import * as url from 'url';
import { uuid } from 'uuidv4';

import { HttpService, Answer, HTTPMethod } from './http.service';
import { StorageService } from './storage.service';

// interface Client {
//     clientId: string;
//     clientSecret: string;
// }

interface LoginAnswer extends Answer {
    token: string;
}

interface Server {
    authorizePath: string;
    tokenPath: string;
}

interface Client {
    clientId: string;
    clientSecret: string;
    state: string;
    scope: string;
    redirectUris: string[];
    server: Server;
}

export interface UrlOptions {
    response_type?: string;
    scope?: string;
    client_id: string;
    redirect_uri: string;
    state: string;
    code?: string;
    client_secret?: string;
}

export enum ClientProvider {
    GITHUB = 'github',
    OPENSLIDES = 'openslides',
    CUSTOM = 'custom'
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public get InitiateObservable(): Observable<boolean> {
        return this.initiateSubject.asObservable();
    }

    public get localOAuthUrl(): string {
        return this.buildURL(this.localServer.authorizePath, this.getOptionsForAuthorizing(this.localClient));
    }

    public get githubOAuthUrl(): string {
        return this.buildURL(this.githubServer.authorizePath, this.getOptionsForAuthorizing(this.githubClient));
    }

    public get openslidesOAuthUrl(): string {
        return this.buildURL(this.openslidesServer.authorizePath, this.getOptionsForAuthorizing(this.openslidesClient));
    }

    private accessToken: string;

    private readonly refreshToken: string;

    private readonly state: string;

    private readonly providerStorageKey = 'provider';
    private readonly pkceStateStorageKey = 'pkceState';
    private readonly pkceCodeVerifierStorageKey = 'pkceCodeVerifier';

    private readonly githubServer = {
        authorizePath: 'https://github.com/login/oauth/authorize',
        tokenPath: 'https://github.com/login/oauth/access_token'
    };

    private readonly localServer = {
        authorizePath: 'http://localhost:9001/authorize',
        tokenPath: 'http://localhost:9001/token'
    };

    private readonly openslidesServer = {
        authorizePath: 'http://localhost:8010/authorize',
        tokenPath: 'http://localhost:8010/token'
    };

    private readonly githubClient: Client = {
        clientId: 'b23d89d084a693d4a60d',
        clientSecret: 'bc8cca6314034743710659605d031bb970a027ca',
        scope: 'user',
        redirectUris: ['http://localhost:4200/callback', 'https://oauth-2-app.herokuapp.com/callback'],
        // redirectUris: ['https://oauth-2-app.herokuapp.com/callback'],
        state: '',
        server: this.githubServer
    };

    private readonly localClient: Client = {
        clientId: 'oauth-client-1',
        clientSecret: 'oauth-client-secret-1',
        redirectUris: ['http://localhost:4200'],
        scope: 'foo',
        state: '',
        server: this.localServer
    };

    private readonly openslidesClient: Client = {
        clientId: 'oauth-client-1',
        clientSecret: 'oauth-client-secret-1',
        redirectUris: ['http://localhost:4200/callback'],
        scope: 'user',
        state: 'openslides',
        server: this.openslidesServer
    };

    private readonly initiateSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public constructor(private readonly http: HttpService, private readonly storage: StorageService) {
        this.whoAmI(() => this.initiateSubject.next(true));
        this.localClient.state = uuid();
        this.githubClient.state = uuid();
    }

    public hello(): void {
        this.http.get('/').then(answer => {
            console.log('answer', answer);
            console.log('document.cookie', document.cookie);
        });
    }

    public login(credentials: { username: string; password: string }): void {
        this.http.post<LoginAnswer>('/login', credentials).then(answer => {
            console.log('answer', answer);
            if (answer && answer.success) {
                this.accessToken = answer.token;
            }
            console.log('document.cookies', document.cookie);
        });
    }

    /**
     * @deprecated
     *
     * Where is this used?
     */
    public loginWithGithub(): void {}

    public async oAuth2(provider: ClientProvider): Promise<void> {
        const client = this.getClientByProvider(provider);
        const state = this.generateRandomString();
        const codeVerifier = this.generateRandomString();
        await this.storage.set(this.pkceStateStorageKey, state);
        await this.storage.set(this.pkceCodeVerifierStorageKey, codeVerifier);
        await this.storage.set(this.providerStorageKey, provider);

        // const codeChallenge = await this.pkceChallengeFromVerifier(codeVerifier);
        const codeChallenge = this.sha(codeVerifier);

        const authUrl = `${client.server.authorizePath}?response_type=code&client_id=${encodeURIComponent(
            client.clientId
        )}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(
            client.scope
        )}&redirect_uri=${encodeURIComponent(client.redirectUris[0])}&code_challenge=${encodeURIComponent(
            codeChallenge
        )}&code_challenge_method=S256`;

        window.location.href = authUrl;
    }

    public async oAuth2Callback(code: string, state: string): Promise<void> {
        const provider = await this.storage.get<ClientProvider>(this.providerStorageKey);
        const storedState = await this.storage.get<string>(this.pkceStateStorageKey);
        const storedCodeVerifier = await this.storage.get(this.pkceCodeVerifierStorageKey);
        const client = this.getClientByProvider(provider);

        console.log('storedState', storedState, state, state.substr(state.indexOf('state')));

        if (storedState !== state) {
            return;
        }
        window.history.replaceState({}, null, '/');
        this.http
            .post(
                '/token',
                {
                    grant_type: 'authorization_code',
                    code,
                    client_id: client.clientId,
                    redirect_uri: client.redirectUris[0],
                    code_verifier: storedCodeVerifier
                },
                null,
                'http://localhost:8010'
            )
            .then(answer => console.log('answer from token-endpoint', answer));
    }

    public whoAmI(callback?: () => void): void {
        this.http
            .post<LoginAnswer>('/who-am-i')
            .then(answer => {
                console.log('answer', answer);
                if (answer && answer.success) {
                    this.accessToken = answer.token;
                }
            })
            .then(() => (callback ? callback() : undefined));
    }

    public logout(): void {
        this.requestSecureRoute(HTTPMethod.POST, 'logout').then(answer => {
            console.log('logout', answer);
            if (answer && answer.success) {
                this.accessToken = null;
            }
        });
    }

    public isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    public getAccessToken(code: string, state: string, provider: ClientProvider): any {
        const client = this.getClientByProvider(provider);
        // const formData = qs.stringify({
        //     grant_type: 'authorization_code',
        //     // grant_type: 'code',
        //     code,
        //     redirect_uri: client.redirectUris[0],
        //     state
        // });
        // console.log('formData', formData);
        // const headers = {
        //     'Content-Type': 'application/x-www-form-urlencoded',
        //     Authorization: `Basic ${this.encodeClientCredentials(client.clientId, client.clientSecret)}`
        // };
        console.log('get auth-token', code, state, client);
        return (
            this.http
                .post(this.buildURL(client.server.tokenPath, this.getOptionsForToken(client, code)))

                // return this.http
                //     .post(client.server.tokenPath, { body: formData }, new HttpHeaders(headers))
                .then(answer => console.log('answer from accesstoken', answer))
        );
        // return this.http.post(this.githubServer.tokenPath, )
    }

    // private initState(): void {}

    private async requestSecureRoute(method: HTTPMethod, path: string, data?: any): Promise<Answer> {
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        const pathToServer = `/api${path}`;
        const headers: HttpHeaders = new HttpHeaders().set('authentication', this.accessToken);
        switch (method) {
            case HTTPMethod.POST:
                return this.http.post(pathToServer, data, headers);
            case HTTPMethod.GET:
                return this.http.get(pathToServer, headers);
        }
    }

    private buildURL(path: string, options: UrlOptions, hash?: string): string {
        const newUrl = url.parse(path, true);
        delete newUrl.search;
        if (!newUrl.query) {
            newUrl.query = {};
        }
        for (const key in options) {
            newUrl.query[key] = (options as any)[key];
        }
        if (hash) {
            newUrl.hash = hash;
        }
        return url.format(newUrl);
    }

    private getOptionsForAuthorizing(clientObject: Client): UrlOptions {
        return {
            client_id: clientObject.clientId,
            scope: clientObject.scope,
            //   redirect_uri: Server.PORT === 8000 ? this.client.redirectUris[0] : this.client.redirectUris[1],
            redirect_uri: clientObject.redirectUris[0],
            state: clientObject.state,
            response_type: 'code'
        };
    }

    private getOptionsForToken(client: Client, authCode: string): UrlOptions {
        return {
            client_id: client.clientId,
            client_secret: client.clientSecret,
            redirect_uri: client.redirectUris[0],
            state: client.state,
            code: authCode
        };
    }

    private getClientByProvider(provider: ClientProvider): Client {
        switch (provider) {
            case ClientProvider.GITHUB:
                return this.githubClient;
            case ClientProvider.OPENSLIDES:
                return this.openslidesClient;
            default:
                return this.localClient;
        }
    }

    private arrayBufferToString(buffer: ArrayBuffer): string {
        return String.fromCharCode.apply(null, new Uint16Array(buffer));
    }

    private stringToArrayBuffer(value: string): ArrayBuffer {
        const buffer = new ArrayBuffer(value.length * 2);
        const view = new Uint16Array(buffer);
        for (let i = 0, valueLength = value.length; i < valueLength; ++i) {
            view[i] = value.charCodeAt(i);
        }
        return buffer;
    }

    /**
     * PKCE-Helper functions.
     * See `https://github.com/aaronpk/pkce-vanilla-js/blob/master/index.html`
     */

    // Generate a secure random string using the browser crypto functions
    private generateRandomString(): string {
        const array = new Uint32Array(28);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => `0${dec.toString(16)}`.substr(-2)).join('');
    }

    // Calculate the SHA256 hash of the input text.
    // Returns a promise that resolves to an ArrayBuffer
    private sha256(plain: string): PromiseLike<ArrayBuffer> {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest('SHA-256', data);
    }

    private sha(plain: string): string {
        return new sha256().update(plain).digest('hex');
        // return sha256(plain)
    }

    // // Base64-urlencodes the input string
    // private base64urlencode(str: ArrayBuffer): string {
    //     // Convert the ArrayBuffer to string using Uint8 array to conver to what btoa accepts.
    //     // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    //     // Then convert the base64 encoded to base64url encoded
    //     //   (replace + with -, replace / with _, trim trailing =)
    //     return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    //         .replace(/\+/g, '-')
    //         .replace(/\//g, '_')
    //         .replace(/=+$/, '');
    // }

    // // Return the base64-urlencoded sha256 hash for the PKCE challenge
    // private async pkceChallengeFromVerifier(codeVerifier: string): Promise<string> {
    //     const hashedCode = await this.sha256(codeVerifier);
    //     // const hashedCode = sha256(codeVerifier )
    //     console.log('hashedCode', hashedCode);
    //     // const decoder = new TextDecoder();
    //     // console.log('decode', decoder.decode(hashedCode));
    //     // return decoder.decode(hashedCode);
    //     return this.base64urlencode(hashedCode);
    //     // return sha256(hashedCode)
    // }
}
