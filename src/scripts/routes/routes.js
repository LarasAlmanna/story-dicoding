import HomePage from "../views/pages/home/home-page";
import AboutPage from "../views/pages/about/about-page";
import AddStoryPage from "../views/pages/add-story/addStory-page.js";
import LoginPage from "../views/pages/login/login-page";
import LogoutPage from "../views/pages/logout/logout-page";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/add-story": new AddStoryPage(),
  "/login": new LoginPage(),
  "/logout": new LogoutPage(),
};

export default routes;
