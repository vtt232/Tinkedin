import { showAlert } from "./alert.js";
import { sendRequest, redirect, addErrorElement } from "./helpers.js";

const TIME_WAIT_IF_SUCCESS = 2; //in seconds;

const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const emailInput = document.querySelector("#email");
const phoneNumberInput = document.querySelector("#phoneNumber");
const websiteInput = document.querySelector("#website");
const isCompanyInput = document.querySelector("#isCompany");
const signUpButton = document.querySelector(".auth__signUp-btn");

let errorElement;

signUpButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const username = usernameInput.value;
  const password = passwordInput.value;
  const email = emailInput.value;
  const phoneNumber = phoneNumberInput.value;
  const website = websiteInput.value;
  const isCompany = isCompanyInput.checked;

  try {
    await sendRequest("/api/v1/users/signUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        email,
        phoneNumber,
        website,
        isCompany,
      }),
    });

    showAlert(
      "success",
      "Sign up successfully. We will redirect you to the homepage",
      TIME_WAIT_IF_SUCCESS * 1000
    );

    setTimeout(() => {
      redirect("");
    }, TIME_WAIT_IF_SUCCESS * 1000);
  } catch (e) {
    if (errorElement) errorElement.remove();
    errorElement = addErrorElement(signUpButton, e.message);
  }
});
