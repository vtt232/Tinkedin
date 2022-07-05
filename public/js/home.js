import {
  sendRequest,
  addErrorElement,
  showElement,
  hideElement,
} from "./helpers.js";
import { showAlert } from "./alert.js";

const imageInput = document.querySelector(".postImageInput");
const textInput = document.querySelector(".postTextInput");
const createNewPostButton = document.querySelector(".btn-create-new-post");
const postsList = document.querySelector(".posts__list");
const confirmDeletePostForm = document.querySelector(
  ".confirm-delete-container"
);
const confirmDeletePostBackdrop = confirmDeletePostForm.querySelector(
  ".backdrop.confirm-delete-backdrop"
);
const confirmDeletePostCancelButton =
  confirmDeletePostForm.querySelector(".btn--cancel");
const confirmDeletePostSubmitButton =
  confirmDeletePostForm.querySelector(".btn--confirm");

let liveImageEl;
let currentPost;
let currentPostId;

const insertPostToPosts = (postHTML) => {
  postsList.insertAdjacentHTML("afterbegin", postHTML);
};

const imageInputLivePreviewHandler = () => {
  const imageUrl = URL.createObjectURL(imageInput.files[0]);
  createLiveImageElement(imageUrl);
};

const createLiveImageElement = (imageSrc) => {
  if (!liveImageEl) {
    liveImageEl = document.createElement("img");
    liveImageEl.classList.add("post__image");
    textInput.insertAdjacentElement("afterend", liveImageEl);
  }
  liveImageEl.src = imageSrc;
};

const getPostHTML = (post) => {
  const contentHTML = post.content
    ? `<p class="post__content"> ${post.content} </p>`
    : "";
  const imageHTML = post.image
    ? `<img class="post__image" src="/img/posts/${post.image}" />`
    : "";
  const postDateHTML = new Date(post.datePosted).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<li class="post__container" data-post-id = ${post._id}>
  <div class="post">
    <div class="post__avatar-container">
      <img
        class="post__avatar"
        src="/img/users/avatars/${post.user.avatar}"
        alt="User avatar"
      />
    </div>
    <div class="post__info">
      <div class="post__userdata">
        <div class="post__userdisplay">
          <a class="post__name" href="/user/${post.user.username}">${post.user.name}</a>
        </div>
        <p class="post__date">${postDateHTML}</p>
      </div>
      ${contentHTML}
      ${imageHTML}
      <ion-icon name="close-outline" class="post__delete-btn"></ion-icon>
    </div>
  </div>
</li>`;
};

imageInput.addEventListener("change", imageInputLivePreviewHandler);

createNewPostButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const text = textInput.value;
  const image = imageInput.files.length > 0 ? imageInput.files[0] : null;

  try {
    const formData = new FormData();

    if (image) formData.append("image", image);
    if (text) formData.append("content", text);

    const responseData = await sendRequest("/api/v1/posts", {
      method: "POST",
      body: formData,
    });

    const { post } = responseData.data;

    textInput.value = "";
    if (liveImageEl) liveImageEl.remove();

    insertPostToPosts(getPostHTML(post));
    addDeletePostFunction();
  } catch (e) {
    addErrorElement(textInput, e.message);
  }
});

const addDeletePostFunction = () => {
  const deletePostButtons = document.querySelectorAll(".post__delete-btn");
  deletePostButtons.forEach((deletePostButton) => {
    deletePostButton.addEventListener("click", function () {
      currentPost = this.closest(".post__container");
      currentPostId = currentPost.dataset.postId;
      showElement(confirmDeletePostForm);
    });
  });
};

confirmDeletePostBackdrop.addEventListener(
  "click",
  hideElement.bind(null, confirmDeletePostForm)
);
confirmDeletePostCancelButton.addEventListener(
  "click",
  hideElement.bind(null, confirmDeletePostForm)
);

const deletePost = async () => {
  try {
    await sendRequest(`/api/v1/posts/${currentPostId}`, {
      method: "DELETE",
    });

    currentPost.remove();
    hideElement(confirmDeletePostForm);
  } catch (e) {
    showAlert("error", "Something went wrong. Please try again", 2 * 1000);
  }
};

confirmDeletePostSubmitButton.addEventListener("click", deletePost);

addDeletePostFunction();
