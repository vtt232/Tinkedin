/*eslint-disable*/

export const showAlert = (type, msg, time) => {
  const markup = `<div class = 'alert alert--${type}'>${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, time);
};

const hideAlert = () => {
  document.querySelector(".alert").remove();
};
