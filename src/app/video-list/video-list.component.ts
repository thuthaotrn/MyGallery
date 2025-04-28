import { Component, OnInit, Input } from '@angular/core';
import { Video } from '../video';
import { VideoService } from '../video.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MegaMenuModule } from 'primeng/megamenu';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../user.service';
import { User } from '../user';
import { AuthService } from '../auth.service';
import { LikedClassPipe } from '../liked-class.pipe';

@Component({
  selector: 'app-video-list',
  imports: [CommonModule, RouterModule, MatMenuModule, MatButtonModule, MegaMenuModule, LikedClassPipe],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.css'
})
export class VideoListComponent implements OnInit {
  filterTabs = ['All', 'Liked', 'Watched', 'Music', 'Gaming', 'News', 'Movies'];
  activeTab = 'All';
  videos: Video[] = [];
  users: User[] = [];
  filteredVideos: Video[] = [];
  paginatedVideos: Video[] = [];
  currentPage: number = 1;
  videosPerPage: number = 9;
  totalPages: number = 0;
  searchTerm: string = '';
  sortOptions = ['Title', 'Newest', 'Oldest'];
  sortOption = 'Newest';

  username: string | null = null;
  user: User | undefined = undefined;

  constructor(private videoService: VideoService, private userService: UserService, private authService: AuthService) { }

  ngOnInit(): void {
    this.videoService.videos$.subscribe(videos => {
      this.videos = videos;
      this.applyFilter();
    });
    this.videoService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.applyFilter();
    });
    this.authService.username$.subscribe((user) => {
      this.username = user;
      this.applyFilter();
    });
    this.userService.users$.subscribe((users) => {
      this.users = users;
      this.user = this.users.find(u => u.username === this.username);
      this.applyFilter()
    })
    this.authService.checkLoginStatus();
    this.users = this.userService.getUsers();
    this.user = this.users.find(u => u.username === this.username);
  }


  applyFilter(): void {
    const filterTag = this.activeTab === 'All' ? '' : this.activeTab.toLowerCase();
    const termStandardized = this.videoService.standardize(this.searchTerm.toLowerCase())
    const term = this.searchTerm.toLowerCase()
    this.filteredVideos = this.videos.filter((video: Video) => {
      let matchesTab = false;

      if (filterTag === 'liked' && this.username) {
        matchesTab = video.likedBy.includes(this.username);
      } else if (filterTag === 'watched') {
        matchesTab = this.user ? this.user.watchHistory.find(v => v.videoId === video.id) !== undefined : false;
      }
      else {
        matchesTab = filterTag ? video.tags.some(tag => tag.toLowerCase() === filterTag) : true;
      }
      let matchesSearch = this.videoService.standardize(video.title).toLowerCase().includes(termStandardized) ||
        video.tags.some(tag => tag.toLowerCase().includes(term) || video.title.toLowerCase().includes(term));
      return matchesTab && matchesSearch;
    });
    this.updatePagination();
  }

  watchVideo(video: Video) {
    this.userService.watchVideo(video.id);
  }
  sortVideos() {
    if (this.sortOption == 'Title') {
      this.filteredVideos.sort((vid1: Video, vid2: Video) => {
        return vid1.title.localeCompare(vid2.title);
      });
    }
    else if (this.sortOption == 'Newest') {
      this.filteredVideos.sort((vid1: Video, vid2: Video) => {
        return new Date(vid2.createdAt).getTime() - new Date(vid1.createdAt).getTime();
      });
    }
    else {
      this.filteredVideos.sort((vid1: Video, vid2: Video) => {
        return new Date(vid1.createdAt).getTime() - new Date(vid2.createdAt).getTime();
      });
    }
    this.updatePagination();
  }
  onSortChange(option: string) {
    this.sortOption = option;
    this.sortVideos();
  }
  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredVideos.length / this.videosPerPage);
    const start = (this.currentPage - 1) * this.videosPerPage;
    this.paginatedVideos = this.filteredVideos.slice(start, start + this.videosPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  likeVideo(video: Video) {
    this.userService.likeVideo(video.id)
  }
  toggleDelete(video: Video) {
    this.videoService.deleteVideo(video);
    this.updatePagination();
  }
}
