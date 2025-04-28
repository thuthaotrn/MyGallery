import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Video } from './video';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private localStorageKey = 'videos';

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  private videosSubject = new BehaviorSubject<Video[]>([]);
  videos$ = this.videosSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.getVideos();
    }
  }

  loadVideos(): Promise<Video[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve([]);
    }
    const username = localStorage.getItem('username') || '';
    const storedVideos = localStorage.getItem(this.localStorageKey);
    if (storedVideos) {

      const parsedVideos = JSON.parse(storedVideos) as Video[];
      parsedVideos.forEach(video => {
        video.isLiked = video.likedBy.includes(username)
      })
      this.videosSubject.next(parsedVideos);
      return Promise.resolve(parsedVideos);

    }

    return fetch('videos.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch videos.json');
        }
        return response.json();
      })
      .then((videos: Video[]) => {
        videos.forEach(video=>{
          video.isLiked=video.likedBy.includes(username)
        })
        this.saveVideos(videos);
        return videos;
      })
  }


  getVideos(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadVideos();
    }
  }

  updateSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  standardize(str: string) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }

  saveVideo(video: Video) {
    if (isPlatformBrowser(this.platformId)) {
      const videos = this.getVideosFromStorage();
      videos.unshift(video);
      this.saveVideos(videos);
    }
  }

  getVideosFromStorage(): Video[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const storedVideos = localStorage.getItem(this.localStorageKey);
    return storedVideos ? JSON.parse(storedVideos) : [];
  }

  saveVideos(videos: Video[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(videos));
      this.videosSubject.next(videos);
    }
  }

  deleteVideo(video: Video) {
    const videos = this.getVideosFromStorage();
    const filteredVideos = videos.filter((v: Video) => v.id !== video.id);
    this.saveVideos(filteredVideos);
  }

  getAllTags(): { tag: string; numberOfVideos: number }[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const videos = this.getVideosFromStorage();
    const tagsList = new Map<string, number>();

    videos.forEach(video => {
      video.tags.forEach(tag => {
        tagsList.set(tag, (tagsList.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagsList, ([tag, numberOfVideos]) => ({ tag, numberOfVideos }));
  }
}