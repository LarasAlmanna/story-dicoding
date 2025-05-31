import Database from "../../../../scripts/data/database";
import StoryModel from "../../../../scripts/models/story-model";

export default class StoryDetailPresenter {
  constructor({ view, storyModel = new StoryModel(), dbModel = Database, storyId }) {
    this._view = view;
    this._storyModel = storyModel;
    this._dbModel = dbModel;
    this._storyId = storyId;
  }

  async showStoryDetail() {
    try {
      this._view.showLoading();
      // Mengambil story dari database IndexedDB
      const story = await this._dbModel.getStoryById(this._storyId);
      if (!story) {
        // Jika tidak ditemukan di IndexedDB, coba ambil dari API
        // Note: Ini hanya sebagai fallback, idealnya story sudah ada di IndexedDB setelah home page dimuat
        console.log(`Story with ID ${this._storyId} not found in IndexedDB, trying API.`);
        const apiStory = await this._storyModel.getStoryById(this._storyId);
        if (!apiStory) {
          throw new Error("Story not found");
        }
        // Simpan story dari API ke IndexedDB untuk penggunaan selanjutnya
        await this._dbModel.putStory(apiStory);
        this._view.showStoryDetail(apiStory);
      } else {
        this._view.showStoryDetail(story);
      }
      await this._checkBookmarkStatus();
    } catch (error) {
      console.error("Error showing story detail:", error);
      this._view.showError(error.message);
    }
  }

  async _checkBookmarkStatus() {
    try {
      const bookmarkedStory = await this._dbModel.getBookmarkedStoryById(this._storyId);
      this._view.updateBookmarkButton(!!bookmarkedStory);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }

  async saveStory() {
    try {
      // Ambil story dari database (yang seharusnya sudah disinkronkan dari API)
      const story = await this._dbModel.getStoryById(this._storyId);
      if (!story) {
        throw new Error("Story not found in database.");
      }
      await this._dbModel.putBookmarkedStory(story);
      this._view.showSuccess("Story berhasil disimpan ke bookmark");
      this._view.updateBookmarkButton(true);
    } catch (error) {
      console.error("Error saving story:", error);
      this._view.showError(error.message);
    }
  }

  async removeStory() {
    try {
      await this._dbModel.deleteBookmarkedStory(this._storyId);
      this._view.showSuccess("Story berhasil dihapus dari bookmark");
      this._view.updateBookmarkButton(false);
    } catch (error) {
      console.error("Error removing story:", error);
      this._view.showError(error.message);
    }
  }
}
