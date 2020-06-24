import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/core/models/base.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { IndicatorColor } from 'src/app/ui/components/indicator/indicator.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy {
    public get color(): IndicatorColor {
        return this.auth.isAuthenticated() ? 'green' : 'red';
    }

    public get hasInitiated(): boolean {
        return this.pHasInitiated;
    }

    public get disableConfirmButton(): boolean {
        return !this.loginFormHasValues;
    }

    public loginForm: FormGroup;

    private loginFormHasValues = false;

    private pHasInitiated: boolean;

    public constructor(private readonly auth: AuthService, private readonly fb: FormBuilder) {
        super();
    }

    public async ngOnInit(): Promise<void> {
        this.loginForm = this.fb.group({
            username: 'admin',
            password: 'admin'
        });
        this.subscriptions.push(
            this.loginForm.valueChanges.subscribe((value: { username: string; password: string }) => {
                this.checkLoginForm(value);
            }),
            this.auth.InitiateObservable.subscribe(hasInitiated => (this.pHasInitiated = hasInitiated))
        );
        this.checkLoginForm(this.loginForm.value);
    }

    public ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];
    }

    public sayHello(): void {
        this.auth.sayHello().then(answer => console.log('sayHello:', answer));
    }

    public login(): void {
        this.auth.login(this.loginForm.value);
    }

    public whoAmI(): void {
        this.auth.whoAmI();
    }

    public clear(): void {
        this.loginForm.setValue({ username: '', password: '' });
    }

    public logout(): void {
        this.auth.logout();
    }

    public isAuthenticated(): boolean {
        return this.auth.isAuthenticated();
    }

    private checkLoginForm(value: { username: string; password: string }): void {
        this.loginFormHasValues = !!value.password && !!value.username;
    }
}
