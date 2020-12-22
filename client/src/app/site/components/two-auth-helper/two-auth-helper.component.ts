import { HttpService } from 'src/app/core/services/http.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as QrCodeStyling from 'qr-code-styling';

import { TwoFactorAuthService } from './../../../core/services/two-factor-auth.service';

@Component({
    selector: 'app-two-auth-helper',
    templateUrl: './two-auth-helper.component.html',
    styleUrls: ['./two-auth-helper.component.scss']
})
export class TwoAuthHelperComponent implements OnInit {
    public get authOptions(): any[] {
        return this.twoFactorAuth.authOptionsAsArray;
    }

    public get filteredOptions(): any[] {
        return this.twoFactorAuth.authOptionsAsArray.filter(option => option.key !== 'totp');
    }

    public qrCode: any;

    public twoFactorForm: FormControl;
    public otherFactorForm: FormControl;

    public constructor(
        private readonly http: HttpService,
        private readonly twoFactorAuth: TwoFactorAuthService,
        private readonly fb: FormBuilder
    ) {}

    public ngOnInit(): void {
        this.twoFactorForm = this.fb.control([['password'], Validators.required]);
        this.otherFactorForm = this.fb.control([['password'], Validators.required]);
        this.twoFactorForm.valueChanges.subscribe(value => console.log('value', value));
        console.log('onInit', this.twoFactorForm.value);
        // this.twoFactorForm = this.fb.group({
        //     authFactors: [['password'], Validators.required]
        // });
    }

    public async confirmValues(formControl: FormControl): Promise<void> {
        console.log('formControl', formControl.value);
        const answer = await this.http.post<any>('api/settings/set-authentication', {
            authenticationTypes: formControl.value,
            values: {}
        });
        console.log('answer', answer);
        const totpUri = answer.totpUri;
        const qrCode: HTMLElement = new QrCodeStyling({
            data: totpUri
        });
        // this.qrCode = qrCode;
        qrCode.append(document.querySelector('#canvas'));
    }
}
