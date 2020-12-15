import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LoginSiteComponent } from './login-site/login-site.component';
import { SiteComponentsModule } from './components/site-components.module';
import { SiteRoutingModule } from './site-routing.module';
import { SiteComponent } from './site.component';
import { UIModule } from '../ui/ui.module';

@NgModule({
    exports: [SiteComponent, LoginSiteComponent],
    imports: [UIModule, SiteRoutingModule, CommonModule, SiteComponentsModule],
    declarations: [SiteComponent, LoginSiteComponent]
})
export class SiteModule {}
