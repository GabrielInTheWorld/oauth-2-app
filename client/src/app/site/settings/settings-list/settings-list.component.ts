import { Component, OnInit } from '@angular/core';

import { RouterService } from './../../services/router.service';
import { TwoFactorAuthService } from './../../../core/services/two-factor-auth.service';

@Component({
    selector: 'app-settings-list',
    templateUrl: './settings-list.component.html',
    styleUrls: ['./settings-list.component.scss']
})
export class SettingsListComponent implements OnInit {
    public get authOptions(): object {
        return this.twoFactorAuth.authOptions;
    }

    public constructor(public router: RouterService, private readonly twoFactorAuth: TwoFactorAuthService) {}

    public ngOnInit(): void {}
}
