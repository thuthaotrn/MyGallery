import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VideoService } from '../video.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Video } from '../video';
import { MatMenuModule } from '@angular/material/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatMenuModule, ToolbarModule, IconFieldModule, InputIconModule, InputTextModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  constructor(
    private router: Router,
    private videoService: VideoService,
    private authService: AuthService
  ) { }

  searchQuery = "";
  username: string | null = null;
  showLoginModal = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  @Output() toggleLoginModal = new EventEmitter<boolean>();
  sidebarVisible = true;
  isLoggedIn: boolean = false;

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.authService.username$.subscribe((user) => {
      this.username = user;
    });
    this.authService.checkLoginStatus();
  }

  sidebarStateChange() {
    this.sidebarVisible = !this.sidebarVisible;
    this.toggleSidebar.emit(this.sidebarVisible);
  }

  openLoginModal() {
    this.showLoginModal = true;
    this.toggleLoginModal.emit(this.showLoginModal);
  }

  handleLoginSuccess(userData: { username: string, token: string }) {
    this.authService.login(userData.username, userData.token);
    this.showLoginModal = false;
  }

  logout() {
    this.authService.logout();
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value.trim().toLowerCase();
    this.videoService.updateSearchTerm(searchTerm);
  }

  clearSearch() {
    this.searchQuery = "";
    this.videoService.updateSearchTerm("");
  }

  navigateToSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { query: this.searchQuery },
      });
    }
  }

  addVideoForm = new FormGroup({
    id: new FormControl<number | null>(null),
    title: new FormControl('', [Validators.required]),
    thumbnail: new FormControl(''),
    url: new FormControl('', [Validators.required, Validators.pattern('(https?://.*)')]),
    tags: new FormArray([]),
    likedBy: new FormArray([]),
    likes: new FormControl(0),
    views: new FormControl(0),
    createdAt: new FormControl<Date | null>(null)
  });

  private localStorageKey = 'videos';
  thumbnailPreview: string | ArrayBuffer | null = '';

  onFileChange(event: any) {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreview = reader.result as string;
        this.addVideoForm.patchValue({ thumbnail: this.thumbnailPreview });
      };
      reader.readAsDataURL(file);
    }
  }
  alertMessage='';
  alertClass = 'alert-success';
  showAlert = false;

  triggerAlert() {
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 2000);
  }

  saveVideo() {
    if (this.addVideoForm.valid) {
      const formValue = this.addVideoForm.value;

      const savedVideos: Video[] = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');

      const newId = savedVideos.length > 0 ? savedVideos[0].id + 1 : 1;
      const newVideo: Video = {
        id: newId,
        title: formValue.title!,
        thumbnail: formValue.thumbnail || '',
        url: formValue.url!,
        tags: formValue.tags as string[] || [],
        likedBy: formValue.likedBy as string[] || [],
        likes: 0,
        views: 0,
        createdAt: new Date(),
        isLiked:null
      };
      this.videoService.saveVideo(newVideo);
      this.alertMessage='Video added successfully!'
      this.triggerAlert()
      this.resetForm();
    }
  }

  onThumbnailUrlChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const url = inputElement.value.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      this.thumbnailPreview = url;
      this.addVideoForm.patchValue({ thumbnail: url });
    }
  }

  get tags() {
    return this.addVideoForm.get('tags') as FormArray;
  }

  addTag(tagInput: HTMLInputElement) {
    const tag = tagInput.value.trim();
    if (tag) {
      this.tags.push(new FormControl(tag));
      tagInput.value = '';
    }
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  resetForm(): void {
    this.addVideoForm.reset();
    this.thumbnailPreview = '';
    this.tags.clear();
  }
 

}
