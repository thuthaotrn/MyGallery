export interface Video {
    id: number;
    title: string;
    thumbnail: string;
    url: string;
    tags: string[];
    likedBy: string[];
    likes: number;
    views: number;
    createdAt: Date;
    isLiked:boolean|null
}
