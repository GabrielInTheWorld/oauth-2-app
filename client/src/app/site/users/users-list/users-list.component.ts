import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';

@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
    public constructor(private readonly userService: UsersService) {}

    public ngOnInit(): void {}

    public onAdd(): void {}
}
