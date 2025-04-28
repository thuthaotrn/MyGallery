import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule, FormsModule, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'MyGallery';
  sidebarVisible = true;
  showLoginModal: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.checkLoginStatus();
  }

  onSidebarStateChange(state: boolean) {
    this.sidebarVisible = state;
    console.log(this.sidebarVisible);
  }
  
  handleLoginSuccess(userData: { username: string, token: string }) {
    this.authService.login(userData.username, userData.token);
    this.showLoginModal = false;
  }
  
  openLoginModal(state: boolean) {
    this.showLoginModal = state;
    console.log(this.showLoginModal);
  }
}