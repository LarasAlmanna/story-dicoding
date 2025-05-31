import { generateStoryItemTemplate, generateEmptyStoryTemplate, generateErrorTemplate, generateLoaderTemplate, generateBookmarkHeaderTemplate } from "../../../templates/template-creator";
import BookmarkPresenter from "./bookmark-presenter";
import Database from "../../../data/database";

export default class BookmarkPage {
  constructor() {
    this._presenter = null;
  }

  async render() {
    return `
      <div class="bookmark-container">
        ${generateBookmarkHeaderTemplate()}
        <div class="bookmark-content">
          <div id="stories" class="stories"></div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this._presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });

    await this._presenter.showBookmarkedStories();
  }

  _displayStories(stories) {
    const storiesContainer = document.querySelector("#stories");
    storiesContainer.innerHTML = "";

    if (stories.length === 0) {
      storiesContainer.innerHTML = generateEmptyStoryTemplate("Belum ada cerita yang disimpan");
      return;
    }

    storiesContainer.innerHTML = stories.map((story) => generateStoryItemTemplate(story)).join("");
  }

  _showLoading() {
    const storiesContainer = document.querySelector("#stories");
    storiesContainer.innerHTML = generateLoaderTemplate();
  }

  _showError(message) {
    const storiesContainer = document.querySelector("#stories");
    storiesContainer.innerHTML = generateErrorTemplate(message);
  }
}
