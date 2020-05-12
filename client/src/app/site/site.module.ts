import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginSiteComponent } from './login-site/login-site.component';
import { SiteRoutingModule } from './site-routing.module';
import { SiteComponent } from './site.component';
import { UIModule } from '../ui/ui.module';

@NgModule({
  exports: [SiteComponent, LoginSiteComponent, DashboardComponent],
  imports: [UIModule, SiteRoutingModule, CommonModule],
  declarations: [SiteComponent, LoginSiteComponent, DashboardComponent]
})
export class SiteModule {}
