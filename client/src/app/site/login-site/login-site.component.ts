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

    public showSpinner = false;

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
        await this.auth.login(this.loginForm.value);
        this.showSpinner = false;
    }

    public clear(): void {
        this.loginForm.setValue({
            username: '',
            password: ''
        });
    }
}
