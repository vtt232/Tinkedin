import { showElement, hideElement, sendRequest, redirect } from "./helpers.js";
import { showAlert } from "./alert.js";

const loader = document.querySelector(".loader");
const editProfileButton = document.querySelector(".profile__editProfileButton");
const followButton = document.querySelector(".profile__followButton");
const unfollowButton = document.querySelector(".profile__unfollowButton");
const editProfileForm = document.querySelector(".edit-profile-container");
const editProfileFormBackdrop = editProfileForm.querySelector(".backdrop");
const editProfileFormCloseButton =
  editProfileForm.querySelector(".btn--closeForm");
const editProfileFormSaveButton = editProfileForm.querySelector(".btn--save");

const backgroundInput = editProfileForm.querySelector("#background");
const backgroundImageEl = editProfileForm.querySelector(
  ".edit-profile__background"
);
const avatarInput = editProfileForm.querySelector("#avatar");
const avatarImageEl = editProfileForm.querySelector(".edit-profile__avatar");
const nameInput = editProfileForm.querySelector("#name");
const educationInput = editProfileForm.querySelector("#education");
const jobTitleInput = editProfileForm.querySelector("#jobTitle");
const overviewInput = editProfileForm.querySelector("#overview");
const specialitiesInput = editProfileForm.querySelector("#specialities");
const emailInput = editProfileForm.querySelector("#email");
const phoneNumberInput = editProfileForm.querySelector("#phoneNumber");
const websiteInput = editProfileForm.querySelector("#website");
const lookingForJobInput = editProfileForm.querySelector("#lookingForJob");
const resumeInput = document.querySelector("#upload-resume-input");

if (editProfileButton) {
  editProfileButton.addEventListener("click", function () {
    init();
    showElement(editProfileForm);
  });
}

if (followButton) {
  const id = followButton.dataset.id;
  followButton.addEventListener("click", async function () {
    try {
      await sendRequest(`/api/v1/users/follow/${id}`, { method: "PATCH" });
      redirect("");
    } catch {
      showAlert("error", "Something went wrong", 2 * 1000);
    }
  });
}

if (unfollowButton) {
  const id = unfollowButton.dataset.id;
  unfollowButton.addEventListener("click", async function () {
    try {
      await sendRequest(`/api/v1/users/unfollow/${id}`, { method: "PATCH" });
      redirect("");
    } catch {
      showAlert("error", "Something went wrong", 2 * 1000);
    }
  });
}

editProfileFormBackdrop.addEventListener(
  "click",
  hideElement.bind(this, editProfileForm)
);
editProfileFormCloseButton.addEventListener(
  "click",
  hideElement.bind(this, editProfileForm)
);

const imageInputLivePreviewHandler = (input, imageEl) => {
  const imageSrc = URL.createObjectURL(input.files[0]);
  setImage(imageEl, imageSrc);
};

const setImage = (element, imageSrc) => {
  element.src = imageSrc;
};

backgroundInput.addEventListener(
  "change",
  imageInputLivePreviewHandler.bind(this, backgroundInput, backgroundImageEl)
);

avatarInput.addEventListener(
  "change",
  imageInputLivePreviewHandler.bind(this, avatarInput, avatarImageEl)
);

const updateProfile = async () => {
  try {
    const data = {};
    if (avatarInput.files.length > 0) data["avatar"] = avatarInput.files[0];
    if (backgroundInput.files.length > 0)
      data["background"] = backgroundInput.files[0];
    data["name"] = nameInput.value;
    data["education"] = educationInput.value;
    data["jobTitle"] = jobTitleInput.value;
    data["overview"] = overviewInput.value;
    data["skills"] = specialitiesInput.value;
    data["website"] = websiteInput.value;
    data["phoneNumber"] = phoneNumberInput.value;
    data["email"] = emailInput.value;
    data["isLookingForJob"] = lookingForJobInput.checked;

    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));

    await sendRequest("/api/v1/users/me", {
      method: "PATCH",
      body: formData,
    });

    hideElement(editProfileForm);
    redirect("");
  } catch {
    showAlert("error", "Something went wrong", 2 * 1000);
  }
};

editProfileFormSaveButton.addEventListener("click", updateProfile);

const init = async () => {
  const data = await sendRequest("/api/v1/users/me");
  const { user } = data;

  avatarImageEl.src = `/img/users/avatars/${user.avatar}`;
  backgroundImageEl.src = `/img/users/backgrounds/${user.background}`;
  nameInput.value = user.name;
  educationInput.value = user.education;
  jobTitleInput.value = user.jobTitle;
  overviewInput.value = user.overview;
  specialitiesInput.value = user.skills;
  emailInput.value = user.email;
  phoneNumberInput.value = user.phoneNumber;
  websiteInput.value = user.website;
  lookingForJobInput.checked = user.isLookingForJob;
};

if (resumeInput) {
  resumeInput.addEventListener("change", async function () {
    try {
      const formData = new FormData();
      formData.append("resume", resumeInput.files[0]);

      showElement(loader);
      await sendRequest("/api/v1/users/me/resume", {
        method: "PATCH",
        body: formData,
      });

      redirect("");
    } catch {
      showAlert("error", "Something went wrong", 2 * 1000);
    }
  });
}
