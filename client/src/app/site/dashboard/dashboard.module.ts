import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UIModule } from 'src/app/ui/ui.module';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SiteComponentsModule } from '../components/site-components.module';

@NgModule({
    imports: [DashboardRoutingModule, CommonModule, UIModule, SiteComponentsModule],
    declarations: [DashboardComponent]
})
export class DashboardModule {}
