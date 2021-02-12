import { MatDialog } from '@angular/material/dialog';
import { User } from './../../models/user';
import { BaseComponent } from './../../../../../core/models/base.component';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { UsersService } from '../../services/users.service';
import { UserDetailDialogComponent } from '../user-detail-dialog/user-detail-dialog.component';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent extends BaseComponent implements OnInit, OnDestroy {
    public get users(): User[] {
        return this._users;
    }

    private _users: User[] = [];

    public constructor(private readonly userService: UsersService, private readonly dialog: MatDialog) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.userService.getAllUsersObservable().subscribe(users => (this._users = users)));
    }

    public ngOnDestroy(): void {
        // this.userService.
    }

    public createUser(): void {
        // this.userService.createUser({ username: 'hello' });
        this.showUserDetailDialog();
    }

    public async editUser(user: User): Promise<void> {
        console.log('user', user);
        const detailedUser = await this.userService.getUser(user.userId);
        this.showUserDetailDialog(detailedUser);
    }

    public deleteUser(user: User): void {
        console.log('user', user);
    }

    private async showUserDetailDialog(user?: User): Promise<void> {
        const dialogRef = this.dialog.open(UserDetailDialogComponent, {
            width: '400px',
            disableClose: true,
            data: {
                authenticationTypes: this.userService.getAuthenticationTypesInstantly(),
                user
            }
        });
        const result = await dialogRef.afterClosed().toPromise();
        console.log('result', result);
    }
}
