import { redirect, sendRequest, showElement, hideElement } from "./helpers.js";
import { showAlert } from "./alert.js";

const homeLink = document.querySelector(".nav__item--home");
const profileLink = document.querySelector(".nav__item--profile");
const jobsLink = document.querySelector(".nav__item--jobs");
const logOutLink = document.querySelector(".nav__item--logout");
const logOutModal = document.querySelector(".confirm-logout-container");
const logOutModalBackdrop = logOutModal.querySelector(".backdrop");
const logOutModalCancelButton = logOutModal.querySelector(".btn--cancel");
const logOutModalConfirmButton = logOutModal.querySelector(".btn--confirm");

homeLink.addEventListener("click", redirect.bind(this, "/"));
profileLink.addEventListener("click", redirect.bind(this, "myProfile"));
jobsLink.addEventListener("click", redirect.bind(this, "jobs"));
logOutLink.addEventListener("click", showElement.bind(this, logOutModal));

logOutModalBackdrop.addEventListener(
  "click",
  hideElement.bind(this, logOutModal)
);
logOutModalCancelButton.addEventListener(
  "click",
  hideElement.bind(this, logOutModal)
);
logOutModalConfirmButton.addEventListener("click", async function () {
  try {
    await sendRequest("/api/v1/users/logout");

    redirect("login");
  } catch {
    showAlert("error", "Something went wrong", 2 * 1000);
  }
});
