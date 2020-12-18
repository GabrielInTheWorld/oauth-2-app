import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';

import { User } from '../users/models/user';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    public constructor(private readonly http: HttpService) {}

    public async getAllUsers(): Promise<User[]> {
        const result = await this.http.post('/api/users/get-all');
        console.log('result', result);
        return result.data;
    }

    public async createUser(user: Partial<User>): Promise<void> {
        const result = await this.http.post('/api/users/create', user);
        console.log('result', result);
    }
}
