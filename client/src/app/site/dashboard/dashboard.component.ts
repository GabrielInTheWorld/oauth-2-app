import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, ClientProvider } from 'src/app/core/services/auth.service';
import { IndicatorColor } from 'src/app/ui/components/indicator/indicator.component';
import { StorageService } from 'src/app/core/services/storage.service';
import { BaseComponent } from 'src/app/core/models/BaseComponent';

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

    // public get localOAuthUrl(): string {
    //     // this.clientProvider = ClientProvider.OPENSLIDES;
    //     // console.log('localOAuthUrl', this.auth.localOAuthUrl);
    //     return this.auth.openslidesOAuthUrl;
    // }

    // public get githubOAuthUrl(): string {
    //     // console.log('githubOAuthUrl', this.auth.githubOAuthUrl);
    //     // this.clientProvider = ClientProvider.GITHUB;
    //     // return this.auth.githubOAuthUrl;
    // }

    public loginForm: FormGroup;

    private loginFormHasValues = false;

    private pHasInitiated: boolean;

    // private subscriptions: Subscription[] = [];

    // private clientProvider: ClientProvider = ClientProvider.CUSTOM;

    public constructor(
        private readonly auth: AuthService,
        private readonly fb: FormBuilder,
        private readonly route: ActivatedRoute,
        private readonly storage: StorageService
    ) {
        super();
    }

    public async ngOnInit(): Promise<void> {
        await this.getProviderFromStorage();
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
        // this.subscriptions.push(
        //     this.route.url.subscribe(urlSegments => console.log('urlSegments', urlSegments)),
        //     this.route.queryParams.subscribe((queryParams: { state: string; code?: string }) => {
        //         console.log('queryParams', queryParams);
        //         console.log('provider', this.clientProvider);
        //         if (queryParams.code) {
        //             this.auth.oAuth2Callback(queryParams.code, queryParams.state);
        //         }
        //     })
        // );
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

    public setAuthenticationProvider(provider: string): void {
        // this.clientProvider = provider as ClientProvider;
        // this.storage.set(this.providerStorageKey, provider);
    }

    private checkLoginForm(value: { username: string; password: string }): void {
        this.loginFormHasValues = !!value.password && !!value.username;
    }

    private async getProviderFromStorage(): Promise<void> {
        // const provider = await this.storage.get<ClientProvider>(this.providerStorageKey);
        // console.log('provider', provider);
        // this.clientProvider = provider;
    }
}
