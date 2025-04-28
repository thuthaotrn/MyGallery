import { Component,OnInit } from '@angular/core';
import { Video } from '../video';
import { VideoService } from '../video.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-stats',
  imports: [CommonModule,TableModule,PaginatorModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent implements OnInit {
  videos:Video[]=[];
  paginatedVideos: Video[] = [];
  currentPage: number = 1;
  videosPerPage: number = 9;
  totalPages: number = 0;
  constructor (private videoService:VideoService){}
  ngOnInit(): void {
    this.videoService.videos$.subscribe(videos => {
      this.videos = videos;
      this.updatePagination();
    });
  }
  updatePagination(): void {
    this.totalPages = Math.ceil(this.videos.length / this.videosPerPage);
    const start = (this.currentPage - 1) * this.videosPerPage;
    this.paginatedVideos=this.videos.slice(start, start + this.videosPerPage);
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
  onSort(event: any): void {
    const sortField = event.field;
    const sortOrder = event.order;

    this.videos = [...this.videos].sort((a, b) => {
        let valueA: any;
        let valueB: any;

        switch (sortField) {
            case 'id':
                valueA = a.id;
                valueB = b.id;
                break;
            case 'title':
                valueA = a.title;
                valueB = b.title;
                break;
            case 'createdAt':
                valueA = a.createdAt;
                valueB = b.createdAt;
                break;
            case 'likedBy.length':
                valueA = a.likedBy?.length || 0;
                valueB = b.likedBy?.length || 0;
                break;
            case 'views':
                valueA = a.views;
                valueB = b.views;
                break;
            default:
                return 0; 
        }

        if (valueA < valueB) return -1 * sortOrder;
        if (valueA > valueB) return 1 * sortOrder;
        return 0;
    });

    this.updatePagination();
}
}
