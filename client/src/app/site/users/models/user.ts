import { BaseModel } from 'src/app/core/models/base-model';

export class User extends BaseModel {
    public userId: string;
    public username: string;
    public password: string;
    public authenticationTypes: any[];
}
