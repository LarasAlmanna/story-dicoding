import { addStory as apiAddStory, getStories as apiGetStories } from "../data/api.js";
import database from "../data/database.js";

const API_ENDPOINT = "https://story-api.dicoding.dev/v1";

class StoryModel {
  constructor() {
    this._accessToken = localStorage.getItem("accessToken");
  }

  async getStories() {
    try {
      const token = sessionStorage.getItem("accessToken");
      let stories;

      try {
        // Try to get stories from API first
        if (typeof apiGetStories === "function") {
          const responseJson = await apiGetStories(token);
          stories = responseJson.listStory;
        } else {
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const response = await fetch(`${API_ENDPOINT}/stories`, { headers });
          const responseJson = await response.json();
          stories = responseJson.listStory;
        }

        // Store stories in IndexedDB for offline use
        await database.clearAllStories(); // Clear old data
        for (const story of stories) {
          await database.putStory(story);
        }
      } catch (error) {
        console.log("Failed to fetch from API, trying IndexedDB:", error);
        // If API fails, try to get stories from IndexedDB
        stories = await database.getAllStories();
        if (!stories || stories.length === 0) {
          throw new Error("No stories available offline");
        }
      }

      return stories;
    } catch (error) {
      console.error("Error fetching stories:", error);
      throw error;
    }
  }

  async addStory(formData) {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        throw new Error("You must be logged in to add a story");
      }

      // Try to add story to API
      try {
        const response = await apiAddStory(token, formData);
        // Store the new story in IndexedDB
        await database.putStory(response.story);
        return response;
      } catch (error) {
        console.log("Failed to add story to API, storing offline:", error);
        // If API fails, store the story locally
        const offlineStory = {
          id: `offline_${Date.now()}`,
          description: formData.get("description"),
          photoUrl: URL.createObjectURL(formData.get("photo")),
          createdAt: new Date().toISOString(),
          name: "Offline User",
          lat: formData.get("lat"),
          lon: formData.get("lon"),
        };
        await database.putStory(offlineStory);
        return { story: offlineStory, message: "Story saved offline" };
      }
    } catch (error) {
      console.error("Error adding story:", error);
      throw error;
    }
  }

  async syncOfflineStories() {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) return;

      const offlineStories = await database.getAllStories();

      for (const story of offlineStories) {
        if (story.id.startsWith("offline_")) {
          try {
            const formData = new FormData();
            formData.append("description", story.description);

            // Convert photoUrl back to File
            let photoBlob;
            try {
              const response = await fetch(story.photoUrl);
              photoBlob = await response.blob();
              formData.append("photo", photoBlob, "photo.jpg");
            } catch (fetchError) {
              console.error("Failed to fetch photoUrl for offline sync:", fetchError);
              // Skip syncing this story if photo cannot be fetched
              continue;
            }

            formData.append("lat", story.lat);
            formData.append("lon", story.lon);

            await apiAddStory(token, formData);
            await database.deleteStory(story.id);
          } catch (error) {
            console.error("Failed to sync offline story:", error);
          }
        }
      }
      // After syncing, refresh stories to include newly synced ones
      await this.getStories();
    } catch (error) {
      console.error("Error syncing offline stories:", error);
    }
  }
}

export default StoryModel;
