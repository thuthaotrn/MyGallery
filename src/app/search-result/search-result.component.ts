import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService } from '../video.service';
import { Video } from '../video';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';
@Component({
  selector: 'app-search-result',
  imports: [CommonModule, RouterModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css'
})
export class SearchResultComponent {
  videos: Video[] = [];
  paginatedVideos: Video[] = [];
  currentPage: number = 1;
  videosPerPage: number = 8;
  totalPages: number = 0;
  query: string = "";
  username:string="";
  constructor(private videoService: VideoService, private route: ActivatedRoute,private userService:UserService) { }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.query = params['query'] || '';
      this.videoService.loadVideos().then((data) => {
        this.videos = data.filter((video: Video) => {
          const matchTitle = video.title.toLowerCase().includes(this.query.toLowerCase());
          const matchTags = video.tags.some(tag => tag.toLowerCase().includes(this.query));
          return matchTitle || matchTags;
        })
        this.updatePagination();
      })
    })
    this.username=localStorage.getItem('username')||'[]';
  }
  updatePagination() {
    this.totalPages = Math.ceil(this.videos.length / this.videosPerPage);
    const start = (this.currentPage - 1) * this.videosPerPage;
    this.paginatedVideos = this.videos.slice(start, start + this.videosPerPage);
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  toggleDelete(video: Video) {
    this.videoService.deleteVideo(video);
    this.updatePagination();
  }
  likeVideo(video: Video) {
    this.userService.likeVideo(video.id);
    this.updatePagination();
  }
  isLiked(video:Video){
    if(this.username&&video.likedBy.includes(this.username)){
      return true;
    }
    return false;
  }
  watchVideo(video:Video){
    this.userService.watchVideo(video.id);
  }
}
