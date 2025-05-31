import { generateStoryDetailTemplate, generateBookmarkButtonTemplate, generateLoaderTemplate } from "../../../templates/template-creator";
import StoryDetailPresenter from "./story-detail-presenter";
import Database from "../../../data/database";
import StoryModel from "../../../models/story-model";

export default class StoryDetailPage {
  constructor() {
    this._presenter = null;
    this.storyId = null;
    this._bookmarkButton = null;
    this._bookmarkIcon = null;
    this._bookmarkText = null;
  }

  async render() {
    return `
      <section class="content">
        <div id="story-detail" class="story-detail">
          <div id="story-detail-loading" class="story-detail__loading"></div>
        </div>
        <div id="bookmark-actions" class="bookmark-actions"></div>
      </section>
    `;
  }

  async afterRender() {
    if (!this.storyId) {
      this._showError("Story ID tidak ditemukan");
      return;
    }

    this._presenter = new StoryDetailPresenter({
      view: this,
      storyModel: new StoryModel(),
      dbModel: Database,
      storyId: this.storyId,
    });

    const bookmarkActionsElement = document.querySelector("#bookmark-actions");
    bookmarkActionsElement.innerHTML = generateBookmarkButtonTemplate();

    this._bookmarkButton = document.querySelector("#bookmark-button");
    this._bookmarkIcon = this._bookmarkButton.querySelector("svg");
    this._bookmarkText = this._bookmarkButton.querySelector("span");

    if (!this._bookmarkText) {
      console.warn("Bookmark button text element not found in a span. Consider updating template-creator.js");
    }

    this._bookmarkButton.addEventListener("click", async () => {
      if (this._bookmarkButton.classList.contains("bookmark-button--active")) {
        await this._presenter.removeStory();
      } else {
        await this._presenter.saveStory();
      }
    });

    await this._presenter.showStoryDetail();
  }

  showStoryDetail(story) {
    const storyDetailElement = document.querySelector("#story-detail");
    storyDetailElement.innerHTML = "";
    storyDetailElement.innerHTML = generateStoryDetailTemplate(story);
  }

  showLoading() {
    const storyDetailElement = document.querySelector("#story-detail");
    storyDetailElement.innerHTML = generateLoaderTemplate();
  }

  showError(message) {
    const storyDetailElement = document.querySelector("#story-detail");
    storyDetailElement.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <a href="#/" class="button">Back to Home</a>
      </div>
    `;
  }

  updateBookmarkButton(isBookmarked) {
    if (this._bookmarkButton) {
      if (isBookmarked) {
        this._bookmarkButton.classList.add("bookmark-button--active");
        if (this._bookmarkIcon) {
          this._bookmarkIcon.setAttribute("fill", "currentColor");
          this._bookmarkIcon.setAttribute("stroke", "currentColor");
        }
        if (this._bookmarkText) {
          this._bookmarkText.textContent = "Hapus dari Bookmark";
        } else {
          this._bookmarkButton.innerHTML = `
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                 <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
               </svg>
               Hapus dari Bookmark
             `;
        }
      } else {
        this._bookmarkButton.classList.remove("bookmark-button--active");
        if (this._bookmarkIcon) {
          this._bookmarkIcon.setAttribute("fill", "none");
          this._bookmarkIcon.setAttribute("stroke", "currentColor");
        }
        if (this._bookmarkText) {
          this._bookmarkText.textContent = "Simpan ke Bookmark";
        } else {
          this._bookmarkButton.innerHTML = `
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
               </svg>
               Simpan ke Bookmark
             `;
        }
      }
    }
  }

  showSuccess(message) {
    console.log(message);
  }
}
