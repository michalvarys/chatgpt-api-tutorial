let systemMessage = "";

let settings = {
  system_message: "",
  token: "",
  n: 1,
  max_tokens: 2048,
  temperature: 0.5,
  frequency_penalty: 0.5,
  presence_penalty: 0.5,
};

async function loadSettings() {
  settings = await loadJSON("settings");
  return settings;
}

function getForm() {
  return document.querySelector("#form") || document.querySelector("form");
}

function formatMessage(message) {
  const form = getForm();
  const values = new FormData(form);
  return message.replace(/{\w+}/g, (match) => values.get(match.slice(1, -1)));
}

async function generateText(params) {
  const data = await sendChatRequest(params);
  const result = document.querySelector("#result");
  result.innerHTML = data.choices[0].message.content;
}

async function sendChatRequest(body) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data;
}

async function loadJSON(elementId) {
  let json = {};
  try {
    const el = document.getElementById(elementId);
    const src = el.getAttribute("src");
    if (!el) {
      throw new Error("settings element not found");
    }
    const response = await fetch(src);
    json = await response.json();
  } catch {}
  return json;
}

async function initApp() {
  await loadSettings();

  const form = getForm();
  if (!form) {
    return alert("Nebyl nalezen žádný formulář");
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const values = new FormData(form);
    const description = values.get("description");

    const {
      model,
      max_tokens,
      n,
      temperature,
      frequency_penalty,
      presence_penalty,
      system_message,
    } = settings;

    generateText({
      model,
      max_tokens,
      n,
      temperature,
      frequency_penalty,
      presence_penalty,
      messages: [
        {
          role: "system",
          content: formatMessage(system_message),
        },
        {
          role: "user",
          content: description,
        },
      ],
    });
  });
}
initApp();
