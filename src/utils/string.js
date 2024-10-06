const decodeHtml = (html) => {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = html;
  return textArea.value;
};

export const formattedQuestion = (string) => decodeHtml(string);
