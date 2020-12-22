import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TwoFactorAuthService {
    // public get authValues(): {key: string, value: string}[] {
    //     [{key: 'password', }]
    // }

    public readonly authOptionsAsArray = [
        { key: 'password', value: 'Passwort' },
        { key: 'totp', value: 'QR-Code' },
        { key: 'email', value: 'E-Mail' }
    ];
    // public readonly authOptions = [{ password: 'Passwort' }, { totp: 'QR-Code' }, { email: 'E-Mail' }];
    public readonly authOptions = { password: 'Passwort', totp: 'QR-Code', email: 'E-Mail' };

    public constructor() {}
}
