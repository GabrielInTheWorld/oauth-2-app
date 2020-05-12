import { Injectable } from '@angular/core';

import { HttpService, Answer, HTTPMethod } from './http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

interface Client {
  clientId: string;
  clientSecret: string;
}

interface LoginAnswer extends Answer {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public get InitiateObservable(): Observable<boolean> {
    return this.initiateSubject.asObservable();
  }

  private accessToken: string;

  private refreshToken: string;

  private state: string;

  private client: Client = {
    clientId: 'RetCOncbac5YQpMNbXDgg-My',
    clientSecret: 'guTALWo7zDzSVCOuOWZN8Z2bMZnfN5IrSVOgINJjYJUJ8CKt'
  };

  private loginEmail = 'disturbed-rattlesnake@example.com';
  private loginPassword = 'Encouraging-Chamois-28';

  private initiateSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public constructor(private http: HttpService) {
    this.whoAmI(() => this.initiateSubject.next(true));
  }

  public hello(): void {
    this.http.get('http://localhost:8000/').then(answer => {
      console.log('answer', answer);
      console.log('document.cookie', document.cookie);
    });
  }

  public login(credentials: { username: string; password: string }): void {
    this.http.post<LoginAnswer>('http://localhost:8000/login', credentials).then(answer => {
      console.log('answer', answer);
      if (answer && answer.success) {
        this.accessToken = answer.token;
      }
      console.log('document.cookies', document.cookie);
    });
  }

  public whoAmI(callback?: () => void): void {
    this.http
      .post<LoginAnswer>('http://localhost:8000/who-am-i')
      .then(answer => {
        console.log('answer', answer);
        if (answer && answer.success) {
          this.accessToken = answer.token;
        }
      })
      .then(() => (callback ? callback() : undefined));
  }

  public logout(): void {
    this.requestSecureRoute(HTTPMethod.POST, 'logout').then(answer => {
      console.log('logout', answer);
      if (answer && answer.success) {
        this.accessToken = null;
      }
    });
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async requestSecureRoute(method: HTTPMethod, path: string, data?: any): Promise<Answer> {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    const pathToServer = `http://localhost:8000/api${path}`;
    const headers: HttpHeaders = new HttpHeaders().set('authentication', this.accessToken);
    switch (method) {
      case HTTPMethod.POST:
        return this.http.post(pathToServer, data, headers);
      case HTTPMethod.GET:
        return this.http.get(pathToServer, headers);
    }
  }
}
