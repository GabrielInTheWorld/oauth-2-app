import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from 'src/app/core/models/base.component';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-login-site',
    templateUrl: './login-site.component.html',
    styleUrls: ['./login-site.component.scss']
})
export class LoginSiteComponent extends BaseComponent implements OnInit {
    public loginForm: FormGroup;
    public additionalForm: FormGroup;

    public errorMessage = '';
    public showSpinner = false;
    public totpRequired = false;

    private username = '';

    public constructor(private readonly fb: FormBuilder, private readonly auth: AuthService) {
        super();
    }

    public ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['admin', Validators.required],
            password: ['admin', Validators.required]
        });
    }

    public async login(): Promise<void> {
        this.showSpinner = true;
        this.username = this.loginForm.get('username').value;
        const failure = await this.auth.login(this.loginForm.value);
        if (failure.reason) {
            switch (failure.reason) {
                case 'totp':
                    this.prepareTotp();
                    break;
            }
        }
        this.showSpinner = false;
    }

    public async sendTotp(): Promise<void> {
        const failure = await this.auth.confirmTotp(this.username, {
            ...this.loginForm.value,
            ...this.additionalForm.value
        });
        if (failure) {
            this.errorMessage = failure.message;
        }
    }

    public clear(): void {
        this.loginForm.setValue({
            username: '',
            password: ''
            // totp: ''
        });
        this.totpRequired = false;
    }

    private prepareTotp(): void {
        this.totpRequired = true;
        this.additionalForm = this.fb.group({
            totp: ['', Validators.required]
        });
    }
}
