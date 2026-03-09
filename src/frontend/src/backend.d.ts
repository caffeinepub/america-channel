import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: bigint;
    title: string;
    duration: string;
    thumbnailUrl: string;
    views: bigint;
    description: string;
    likes: bigint;
    category: string;
    dislikes: bigint;
    videoUrl: string;
    uploadedAt: bigint;
}
export interface Channel {
    name: string;
    description: string;
    subscriberCount: bigint;
}
export interface Comment {
    id: bigint;
    body: string;
    createdAt: bigint;
    author: string;
    videoId: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: bigint, author: string, body: string): Promise<void>;
    addVideo(video: Video): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteVideo(id: bigint): Promise<void>;
    dislikeVideo(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannel(): Promise<Channel>;
    getComments(videoId: bigint): Promise<Array<Comment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: bigint): Promise<Video | null>;
    getVideos(): Promise<Array<Video>>;
    getVideosByCategory(category: string): Promise<Array<Video>>;
    incrementViews(id: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchVideos(keyword: string): Promise<Array<Video>>;
    subscribe(): Promise<void>;
    updateChannel(newChannel: Channel): Promise<void>;
    updateVideo(id: bigint, updatedVideo: Video): Promise<void>;
}
