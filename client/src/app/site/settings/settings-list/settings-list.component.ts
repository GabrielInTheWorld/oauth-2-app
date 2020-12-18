import { Component, OnInit } from '@angular/core';

import { RouterService } from './../../services/router.service';

@Component({
    selector: 'app-settings-list',
    templateUrl: './settings-list.component.html',
    styleUrls: ['./settings-list.component.scss']
})
export class SettingsListComponent implements OnInit {
    public constructor(public router: RouterService) {}

    public ngOnInit(): void {}
}
