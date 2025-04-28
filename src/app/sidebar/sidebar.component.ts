import { Component } from '@angular/core';
import { VideoService } from '../video.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  tags: { tag: string; numberOfVideos: number }[] = [];
  menuItems = [
    { label: 'Home', link: '' },
    { label: 'History', link: '/history' },
    { label: 'Liked Videos', link: '/likedVideos' },
    { label: 'Stats', link: '/stats' }
  ];
  constructor(private videoService: VideoService, private router: Router) {
    videoService.videos$.subscribe(() => {
      this.tags = this.videoService.getAllTags().sort((tag1, tag2) => {
        return tag2.numberOfVideos - tag1.numberOfVideos;
      });
    })

  }
  navigate(link: string) {
    this.router.navigate([link]);
  }

}
