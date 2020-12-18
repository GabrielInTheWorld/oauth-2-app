import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UIModule } from 'src/app/ui/ui.module';

import { SettingsListComponent } from './settings-list/settings-list.component';
import { SettingsRoutingModule } from './settings-routing.module';

@NgModule({
    imports: [SettingsRoutingModule, UIModule, CommonModule],
    declarations: [SettingsListComponent]
})
export class SettingsModule {}
