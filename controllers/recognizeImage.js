const { createWorker } = require("tesseract.js");

const worker = createWorker();

const convertImageToText = async (image) => {
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(image);

  return text;
};

module.exports = { convertImageToText };
