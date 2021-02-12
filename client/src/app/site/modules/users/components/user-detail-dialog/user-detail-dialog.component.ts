import { BaseComponent } from './../../../../../core/models/base.component';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { User } from './../../models/user';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface UserDetailDialogData {
    user?: User;
    authenticationTypes: string[];
    [key: string]: any;
}

const AuthenticationTypeValidator = (currentTypes: string[], propertyName: string): ValidatorFn => {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (currentTypes.includes(propertyName) && !control.value) {
            return { required: true };
        }
    };
};

@Component({
    selector: 'app-user-detail-dialog',
    templateUrl: './user-detail-dialog.component.html',
    styleUrls: ['./user-detail-dialog.component.scss']
})
export class UserDetailDialogComponent extends BaseComponent implements OnInit {
    public userForm: FormGroup;

    public get user(): User | undefined {
        return this.data.user;
    }

    public get authenticationTypes(): string[] {
        return this.data.authenticationTypes;
    }

    public get selectedAuthenticationTypes(): string[] {
        return this._selectedTypes;
    }

    public authTypeForm: { [key: string]: string } = {};

    private _selectedTypes: string[] = [];

    public constructor(
        public dialogRef: MatDialogRef<UserDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: UserDetailDialogData,
        private fb: FormBuilder
    ) {
        super();
    }

    public ngOnInit(): void {
        const form = {
            username: [this.user?.username || '', Validators.required],
            authenticationTypes: [this.user?.authenticationTypes || [], Validators.required]
        };
        if (this.user) {
            this._selectedTypes = this.user.authenticationTypes;
            // for (const type of this.user.authenticationTypes) {
            //     form[type] = [this.user[type] || '', Validators.required];
            // }
        }
        this.userForm = this.fb.group(form);
        this.subscriptions.push(
            this.userForm.get('authenticationTypes').valueChanges.subscribe(currentValue => {
                this._selectedTypes = currentValue;
                // this.updateForm();
            })
        );
    }

    public isValid(): boolean {
        const dirtyAuthTypes = this.selectedAuthenticationTypes.filter(type => !this.authTypeForm[type]);
        return this.userForm.valid && !dirtyAuthTypes.length;
    }

    // private updateForm(): void {
    //     for (const type of this.selectedAuthenticationTypes) {
    //         this.userForm.setControl(
    //             type,
    //             this.fb.control('', AuthenticationTypeValidator(this.selectedAuthenticationTypes, type))
    //         );
    //     }
    //     console.log('userForm', this.userForm);
    // }
}
