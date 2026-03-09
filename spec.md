# America Channel

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A YouTube-style video channel app themed around America (USA)
- Homepage with a channel banner, channel name, subscriber count, and description
- Video grid displaying American-themed video cards (title, thumbnail, views, duration, upload date)
- Video categories/tabs: All, History, Nature, Culture, Sports, Music
- Individual video detail page/modal with video player area, title, description, likes, views, comments
- Comment section on video detail view (add/view comments)
- Search bar to filter videos by title
- Sidebar with trending/popular videos
- Admin panel to add/edit/delete videos (title, description, thumbnail URL, video URL, category, duration)
- Like/dislike functionality on videos
- Subscriber count display (no auth required, just a button to "subscribe")

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Video records (id, title, description, thumbnailUrl, videoUrl, category, views, likes, dislikes, duration, uploadedAt), Comments (id, videoId, author, text, createdAt), Channel info (name, description, subscriberCount)
2. Backend APIs: getChannel, updateChannel, getVideos, getVideo, addVideo, updateVideo, deleteVideo, likeVideo, dislikeVideo, getComments, addComment, incrementViews
3. Frontend: Channel header with banner, tabs for categories, video grid with cards, video modal/detail with player + comments, search, admin panel for CRUD, subscribe button
