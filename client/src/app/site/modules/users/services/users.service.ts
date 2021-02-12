import { User } from './../models/user';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from 'src/app/core/services/http.service';
import { SocketService } from 'src/app/core/services/socket.service';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private readonly userSubject = new BehaviorSubject<User[]>([]);
    private readonly authenticationTypeSubject = new BehaviorSubject<string[]>([]);

    public constructor(private readonly http: HttpService, private readonly websocket: SocketService) {
        this.initWebsocketEvents();
    }

    public getAllUsersInstantly(): User[] {
        return this.userSubject.value;
    }

    public getAllUsersObservable(): Observable<User[]> {
        return this.userSubject.asObservable();
    }

    public getAuthenticationTypesInstantly(): string[] {
        console.log('authenticationTypes', this.authenticationTypeSubject.value);
        return this.authenticationTypeSubject.value;
    }

    public async createUser(user: Partial<User>): Promise<void> {
        this.websocket.emit('create-user', user);
    }

    public async getUser(userId: string): Promise<User> {
        return new Promise(resolve => {
            this.websocket.emit<string, User>('get-user', userId).subscribe(_user => {
                resolve(_user);
            });
        });
    }

    private initWebsocketEvents(): void {
        this.websocket.emit('all-users').subscribe(allUsers => {
            console.log('allusers', allUsers);
            if (allUsers && Array.isArray(allUsers)) {
                this.userSubject.next(allUsers);
            }
        });
        this.websocket.emit('all-authentication-types').subscribe(types => {
            console.log('authenticationTypes', types);
            if (types && Array.isArray(types)) {
                this.authenticationTypeSubject.next(types);
            }
        });
    }
}
