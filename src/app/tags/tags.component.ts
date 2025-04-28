import { Component } from '@angular/core';
import { VideoService } from '../video.service';
import { ActivatedRoute } from '@angular/router';
import { Video } from '../video';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { LikedClassPipe } from '../liked-class.pipe';
@Component({
  selector: 'app-tags',
  imports: [CommonModule, RouterModule,LikedClassPipe],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.css'
})
export class TagsComponent {
  videos: Video[] = [];
  paginatedVideos: Video[] = [];
  tag: string = "";
  username: string = "";
  currentPage: number = 1;
  totalPages: number = 0;
  videosPerPage: number = 9;
  constructor(private videoService: VideoService, private route: ActivatedRoute, private userService: UserService) { }
  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.tag = params.get('tag') || ''; 
      this.videoService.loadVideos().then((data) => {
        console.log(data)
        this.videos = data.filter((video: Video) => {
          return video.tags.includes(this.tag)
        });
        console.log(this.videos)
        this.updatePagination();
        console.log(this.paginatedVideos)
      });

    });
    this.username = localStorage.getItem('username') || '[]';

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

  likeVideo(video: Video) {
    this.userService.likeVideo(video.id);
  }

  watchVideo(video:Video){
    this.userService.watchVideo(video.id)
  }
  deleteVideo(video:Video){
    this.videoService.deleteVideo(video)
    this.updatePagination()
  }
}
