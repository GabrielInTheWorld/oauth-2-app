import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UIModule } from 'src/app/ui/ui.module';

import { ConsoleComponent } from './console/console.component';
import { OauthComponent } from './oauth/oauth.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';

const components = [ConsoleComponent, OauthComponent, SignOutComponent, DashboardCardComponent];

@NgModule({
    declarations: [...components],
    imports: [UIModule, CommonModule],
    exports: [...components]
})
export class SiteComponentsModule {}
