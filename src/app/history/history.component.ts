import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService } from '../video.service';
import { Video } from '../video';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { LikedClassPipe } from '../liked-class.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule,LikedClassPipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  videos: Video[] = [];
  paginatedVideos: Video[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  videosPerPage: number = 8;
  username: string = '';


  constructor(private videoService: VideoService, private userService: UserService) { }

  ngOnInit() {
    const user = this.userService.getUser();
    this.videoService.loadVideos().then((data) => {
      if (user && user.watchHistory) {
        const map = new Map(user.watchHistory.map(history => [history.videoId, history.watchedAt]))
        this.videos = data.filter((video: Video) =>
          user.watchHistory.some(history => history.videoId === video.id)
        ).sort((vid1: Video, vid2: Video) => {
          const watchAtA = map.get(vid1.id) ? new Date(map.get(vid1.id)!).getTime() : 0;
          const watchAtB = map.get(vid2.id) ? new Date(map.get(vid2.id)!).getTime() : 0;
          return watchAtB - watchAtA;
        });
        this.updatePagination();
      }
    });
    this.username = localStorage.getItem('username') || '[]';


  }

  updatePagination() {
    this.totalPages = Math.ceil(this.videos.length / this.videosPerPage);
    const start = (this.currentPage - 1) * this.videosPerPage;
    this.paginatedVideos = this.videos.slice(start, start + this.videosPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  watchVideo(video: Video) {
    this.userService.watchVideo(video.id);
    this.ngOnInit();
  }

  clearHistory() {
    const user = this.userService.getUser();
    if (user) {
      user.watchHistory = [];
      const users = this.userService.getUsers();
      const updatedUsers = users.map(u => (u.username === user.username ? user : u));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

    this.videos = [];
    this.paginatedVideos = [];
    this.currentPage = 1;
    this.totalPages = 0;
  }

  removeFromWatchHistory(video: Video) {
    const user = this.userService.getUser();
    if (user) {
      user.watchHistory = user.watchHistory.filter(history => history.videoId !== video.id);
      const users = this.userService.getUsers();
      const updatedUsers = users.map(u => (u.username === user.username ? user : u));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

    this.videos = this.videos.filter(v => v.id !== video.id);
    this.updatePagination();
  }

  deleteVideo(video: Video) {
    this.videoService.deleteVideo(video);
    this.videos = this.videos.filter(v => v.id !== video.id);
    this.updatePagination();
  }
  likeVideo(video: Video) {
    this.userService.likeVideo(video.id);
    this.updatePagination();
  }

}
