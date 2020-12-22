import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UIModule } from 'src/app/ui/ui.module';

import { ConsoleComponent } from './console/console.component';
import { OauthComponent } from './oauth/oauth.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';
import { TwoAuthHelperComponent } from './two-auth-helper/two-auth-helper.component';

const components = [TwoAuthHelperComponent, ConsoleComponent, OauthComponent, SignOutComponent, DashboardCardComponent];

@NgModule({
    declarations: [...components],
    imports: [UIModule, CommonModule],
    exports: [...components]
})
export class SiteComponentsModule {}
