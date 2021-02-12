import { User } from './../../models/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from './../../../../../core/models/base.component';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

export interface AuthTypeValue {
    email?: string;
    totp?: string;
    password?: string;
}

@Component({
    selector: 'app-user-authentication-type-chooser',
    templateUrl: './user-authentication-type-chooser.component.html',
    styleUrls: ['./user-authentication-type-chooser.component.scss']
})
export class UserAuthenticationTypeChooserComponent extends BaseComponent implements OnInit {
    @Input()
    public selectedAuthenticationTypes: string[] = [];

    @Input()
    public user: User;

    @Output()
    public formChange = new EventEmitter<AuthTypeValue>();

    public authTypeForm: FormGroup;

    constructor(private readonly fb: FormBuilder) {
        super();
    }

    ngOnInit(): void {
        console.log('user', this.user);
        this.authTypeForm = this.fb.group({
            email: [this.user?.email || '', Validators.email],
            totp: this.user?.totp || '',
            password: this.user?.password || ''
        });
        this.subscriptions.push(this.authTypeForm.valueChanges.subscribe(value => this.formChange.emit(value)));
    }
}
