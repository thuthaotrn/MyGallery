import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  isLoginModalOpen: boolean = true;
  errorMessage: string | null = null;
  @Output() loggedIn = new EventEmitter<{ username: string, token: string }>();

  constructor(private userServive: UserService) { }
  login() {
    this.errorMessage = null;
    fetch('https://dummyjson.com/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({

        username: this.username,
        password: this.password,
        expiresInMins: 30, // optional, defaults to 60
      }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid username or password');
        }
        return res.json();
      })
      .then((data) => {
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('username', data.username);
          this.isLoginModalOpen = false;
          this.loggedIn.emit({
            username: this.username,
            token: data.accessToken
          });
        }
      })
      .catch((error) => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      });
  }
}
