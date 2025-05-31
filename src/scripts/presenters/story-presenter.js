class StoryPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
  }

  async showStories() {
    try {
      const stories = await this._model.getStories();
      this._view.showStories(stories);
    } catch (error) {
      this._view.showError('Failed to load stories');
    }
  }

  async addStory(formData) {
    try {
      await this._model.addStory(formData);
      this._view.showSuccess('Story added successfully');
      window.location.hash = '#/';
    } catch (error) {
      this._view.showError('Failed to add story');
    }
  }
}

export default StoryPresenter; 