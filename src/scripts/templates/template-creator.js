export const generateStoryItemTemplate = (story) => `
  <article class="story-card">
    <a href="#/story?id=${story.id}" class="story-link">
      <div class="story-header">
        <div class="user-info">
          <div class="user-avatar">
            ${story.name.charAt(0).toUpperCase()}
          </div>
          <span class="username">${story.name}</span>
        </div>
      </div>
      
      <div class="story-image">
        <img src="${story.photoUrl}" 
             alt="Foto cerita oleh ${story.name}" 
             loading="lazy">
      </div>
      
      <div class="story-content">
        <p class="story-description">${story.description}</p>
        <span class="story-date">${new Date(story.createdAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</span>
      </div>
    </a>
  </article>
`;

export const generateEmptyStoryTemplate = (message) => `
  <div class="empty-state">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
    <p>${message}</p>
  </div>
`;

export const generateErrorTemplate = (message) => `
  <div class="error-message">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <p>${message}</p>
    <a href="#/" class="button">Kembali ke Beranda</a>
  </div>
`;

export const generateLoaderTemplate = () => `
  <div class="loading-spinner">
    <div class="loading"></div>
  </div>
`;

export const generateStoryDetailTemplate = (story) => `
  <article class="story-detail">
    <div class="story-detail__header">
      <div class="user-info">
        <div class="user-avatar">
          ${story.name.charAt(0).toUpperCase()}
        </div>
        <div class="user-details">
          <span class="username">${story.name}</span>
          <span class="story-date">${new Date(story.createdAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</span>
        </div>
      </div>
    </div>
    
    <div class="story-detail__image">
      <img src="${story.photoUrl}" 
           alt="Foto cerita oleh ${story.name}" 
           loading="lazy">
    </div>
    
    <div class="story-detail__content">
      <p class="story-description">${story.description}</p>
      ${
        story.lat && story.lon
          ? `
        <div class="story-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</span>
          <a href="https://www.google.com/maps?q=${story.lat},${story.lon}" 
             target="_blank" 
             class="location-link">
            Lihat di Maps
          </a>
        </div>
      `
          : ""
      }
    </div>
  </article>
`;

export const generateBookmarkButtonTemplate = () => `
  <button id="bookmark-button" class="bookmark-button">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
    <span>Simpan ke Bookmark</span>
  </button>
`;

export const generateBookmarkHeaderTemplate = () => `
  <div class="bookmark-header">
    <h1 class="bookmark-title">Bookmarked Stories</h1>
    <p class="bookmark-description">Your saved stories will appear here</p>
  </div>
`;
