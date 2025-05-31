import Database from "../../../../scripts/data/database";

export default class BookmarkPresenter {
  constructor({ view, model = Database }) {
    this._view = view;
    this._model = model;
  }

  async showBookmarkedStories() {
    try {
      this._view._showLoading();
      const stories = await this._model.getAllBookmarkedStories();
      this._view._displayStories(stories);
    } catch (error) {
      this._view._showError(error.message);
    }
  }

  async removeBookmark(storyId) {
    try {
      await this._model.deleteBookmarkedStory(storyId);
      await this.showBookmarkedStories();
    } catch (error) {
      this._view._showError(error.message);
    }
  }
}
