import { Component, OnInit } from '@angular/core';
import { Video } from '../video';
import { VideoService } from '../video.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-liked-videos',
  imports: [CommonModule, RouterModule],
  templateUrl: './liked-videos.component.html',
  styleUrl: './liked-videos.component.css'
})
export class LikedVideosComponent implements OnInit {
  videos: Video[] = [];
  paginatedVideos: Video[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  videosPerPage: number = 8;
  username: string = '';

  constructor(private videoService: VideoService, private userService: UserService) { }

  ngOnInit() {
    this.username = localStorage.getItem('username') || '';

    this.videoService.videos$.subscribe(allVideos => {
      const user = this.userService.getUser();
      if (user && user.likedVideos && user.likedVideos.length > 0) {
        this.videos = allVideos.filter(video =>
          user.likedVideos.includes(video.id)
        );
      } else {
        this.videos = [];
      }
      this.updatePagination();
    });

    this.videoService.getVideos();
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

  deleteVideo(video: Video) {
    this.videoService.deleteVideo(video);
    this.updatePagination();
  }

  likeVideo(video: Video) {
    this.userService.likeVideo(video.id);
    this.updatePagination();
  }

  isLiked(video: Video) {
    return this.username && video.likedBy.includes(this.username);
  }
}