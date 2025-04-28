import { Injectable } from '@angular/core';
import { User } from './user';
import { Video } from './video';
import { VideoService } from './video.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private localStorageKey = 'users';
  private videos: Video[] = [];
  private users: User[] = [];
  private username: string = '';

  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private videoService: VideoService) {
    this.videoService.videos$.subscribe(videos => {
      this.videos = videos;
    });

    this.username = localStorage.getItem('username') || '';

    const savedUsers = localStorage.getItem(this.localStorageKey);
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
      this.usersSubject.next(this.users);
    } else {
      this.fetchAndSaveUsers();
    }
  }

  async fetchAndSaveUsers(): Promise<void> {
    try {
      const res = await fetch('https://dummyjson.com/users');
      const data = await res.json();
      const users: User[] = data.users.map((u: any) => ({
        username: u.username,
        accessToken: u.accessToken,
        likedVideos: [],
        watchHistory: []
      }));
      this.saveUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }

  getUsers(): User[] {
    const users = localStorage.getItem(this.localStorageKey);
    return users ? JSON.parse(users) : [];
  }

  getUser(): User | undefined {
    this.username = localStorage.getItem('username') || '';
    return this.users.find(u => u.username === this.username);
  }

  saveUsers(users: User[]) {
    this.users = users;
    localStorage.setItem(this.localStorageKey, JSON.stringify(users));
    this.usersSubject.next(users);
  }

  likeVideo(videoId: number) {
    this.username = localStorage.getItem('username') || '';
    if (!this.username) return;

    const user = this.users.find(u => u.username === this.username);
    const video = this.videos.find(v => v.id === videoId);

    if (user && video) {

      if (!video.isLiked) {
        video.isLiked = !video.isLiked

        video.likedBy = [...video.likedBy, this.username];
        user.likedVideos = [...user.likedVideos, video.id];

      } else {
        video.isLiked = !video.isLiked

        video.likedBy = video.likedBy.filter(u => u !== this.username);
        user.likedVideos = user.likedVideos.filter(id => id !== videoId);
      }

      video.likes = video.likedBy.length;

      this.saveUsers(this.users);
      this.videoService.saveVideos(this.videos);
    }
  }
  watchVideo(videoId: number) {
    this.username = localStorage.getItem('username') || '';
    if (!this.username) return;

    const user = this.users.find(u => u.username === this.username);
    const video = this.videos.find(v => v.id === videoId);

    if (user && video) {
      video.views += 1;
      const index = user.watchHistory.findIndex(v => v.videoId === videoId);
      if (index !== -1) {
        user.watchHistory.splice(index, 1);
      }
      user.watchHistory.unshift({
        videoId,
        watchedAt: new Date()
      });
      this.saveUsers(this.users);
      this.videoService.saveVideos(this.videos);
    }
  }

  clearWatchHistory() {
    this.username = localStorage.getItem('username') || '';
    if (!this.username) return;

    const user = this.users.find(u => u.username === this.username);
    if (user) {
      user.watchHistory = [];
      this.saveUsers(this.users);
    }
  }

  removeFromWatchHistory(videoId: number) {
    this.username = localStorage.getItem('username') || '';
    if (!this.username) return;

    const user = this.users.find(u => u.username === this.username);
    if (user) {
      user.watchHistory = user.watchHistory.filter(h => h.videoId !== videoId);
      this.saveUsers(this.users);
    }
  }
}