import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseComponent } from 'src/app/core/models/base.component';
import { AuthTokenService } from 'src/app/core/services/auth-token.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { IndicatorColor } from 'src/app/ui/components/indicator/indicator.component';

import { SettingsService } from '../services/settings.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy {
    public get color(): IndicatorColor {
        return this.auth.isAuthenticated() ? 'green' : 'red';
    }

    public get isOAuthActivated(): boolean {
        return this._oauthActivated;
    }

    private _oauthActivated = false;

    public constructor(
        private readonly auth: AuthService,
        private readonly authTokenService: AuthTokenService,
        private readonly settingsService: SettingsService
    ) {
        super();
    }

    public async ngOnInit(): Promise<void> {
        this.subscriptions.push(
            this.settingsService.getOAuthActivatedObservable().subscribe(value => (this._oauthActivated = value))
        );
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

    public whoAmI(): void {
        this.auth.whoAmI();
    }

    public logout(): void {
        this.auth.logout();
    }

    public isAuthenticated(): boolean {
        return !!this.authTokenService.rawAccessToken;
    }
}
