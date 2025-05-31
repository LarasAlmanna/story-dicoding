class HomePresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
  }

  async loadStories() {
    try {
      const stories = await this._model.getStories();
      this._view.showStories(stories);
    } catch (error) {
      this._view.showError('Gagal memuat cerita');
    }
  }
}

export default HomePresenter; 