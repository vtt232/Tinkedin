import { showAlert } from "./alert.js";
import { sendRequest, redirect, addErrorElement } from "./helpers.js";

const TIME_WAIT_IF_SUCCESS = 2; //in seconds;

const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector(".auth__login-btn");

let errorElement;

loginButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const username = usernameInput.value;
  const password = passwordInput.value;

  try {
    await sendRequest("/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    showAlert(
      "success",
      "Login successfully. We will redirect you to the homepage",
      TIME_WAIT_IF_SUCCESS * 1000
    );

    setTimeout(() => {
      redirect("");
    }, TIME_WAIT_IF_SUCCESS * 1000);
  } catch (e) {
    if (errorElement) errorElement.remove();
    errorElement = addErrorElement(loginButton, e.message);
  }
});
