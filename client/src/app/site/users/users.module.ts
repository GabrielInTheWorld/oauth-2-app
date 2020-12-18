import { NgModule } from '@angular/core';
import { UIModule } from 'src/app/ui/ui.module';

import { SiteComponentsModule } from '../components/site-components.module';
import { UsersDetailComponent } from './users-detail/users-detail.component';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
    imports: [UsersRoutingModule, UIModule, SiteComponentsModule],
    declarations: [UsersListComponent, UsersDetailComponent]
})
export class UsersModule {}
