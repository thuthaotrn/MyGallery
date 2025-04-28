// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private usernameSubject = new BehaviorSubject<string | null>(null);
  
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  username$ = this.usernameSubject.asObservable();

  login(username: string, token: string) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('username', username);
    this.isLoggedInSubject.next(true);
    this.usernameSubject.next(username);
    window.location.reload();
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    this.isLoggedInSubject.next(false);
    this.usernameSubject.next(null);
    window.location.reload();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      this.isLoggedInSubject.next(true);
      this.usernameSubject.next(username);
    }
  }
}