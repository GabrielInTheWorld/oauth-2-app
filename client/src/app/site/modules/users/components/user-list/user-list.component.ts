import { User } from './../../models/user';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
    @Input()
    public users: User[] = [];

    @Output()
    public onEditUser = new EventEmitter<User>();

    @Output()
    public onDeleteUser = new EventEmitter<User>();

    public constructor() {}

    public ngOnInit(): void {}
}
