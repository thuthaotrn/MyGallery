import { Routes } from '@angular/router';
import { VideoListComponent } from './video-list/video-list.component';
import { TagsComponent } from './tags/tags.component';
import { LikedVideosComponent } from './liked-videos/liked-videos.component';
import { HistoryComponent } from './history/history.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { StatsComponent } from './stats/stats.component';
export const routes: Routes = [
    { path: '', component: VideoListComponent }, 
    { path: 'tag/:tag', component: TagsComponent},
    { path: 'likedVideos', component:LikedVideosComponent},
    { path: 'history', component:HistoryComponent},
    { path: 'search', component: SearchResultComponent },
    {path:'stats',component:StatsComponent}

];
