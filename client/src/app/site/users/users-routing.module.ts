import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsersDetailComponent } from './users-detail/users-detail.component';
import { UsersListComponent } from './users-list/users-list.component';

const routes: Routes = [
    {
        path: '',
        component: UsersListComponent
    },
    {
        path: 'detail',
        component: UsersDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {}
