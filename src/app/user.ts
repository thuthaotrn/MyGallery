export interface User {
    username: string;
    accessToken: string;
    likedVideos: number[];
    watchHistory: {
        videoId: number;
        watchedAt: Date;
    }[];
}
