const form = document.querySelector("#form");
const result = document.querySelector("#result");

let systemMessage = "";

let settings = { system_message: "", token: "" };
async function loadSettings() {
  settings = await loadJSON("settings");
  return settings;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const values = new FormData(form);
  const length = values.get('length');
  const description = values.get('description');

  const params = {
    model: "gpt-3.5-turbo",
    max_tokens:
      length === "short" ? 200 : length === "medium" ? 500 : 2000,
    messages: [
      {
        role: "system",
        content:  formatMessage(settings.system_message)
      },
      {
        role: "user",
        content: description,
      },
    ],
  };
  generateText(params);
});

function formatMessage(message){
    const values = new FormData(form);
    return message.replace(/{\w+}/g, (match) => values.get(match.slice(1, -1)))
}

async function generateText(params) {
    const data = await sendChatRequest(params)
    result.innerHTML = data.choices[0].message.content
}

async function sendChatRequest({ messages, max_tokens, model, n = 1 }) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.token}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature: 0.5,
        n
      })
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

async function initApp(){
  await loadSettings()
}
initApp()
