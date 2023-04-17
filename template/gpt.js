const openingSign = "{";
const closingSign = "}";

const replaceValues = (text, values) => {
  let newText = text;
  Object.keys(values).forEach((key) => {
    const regex = new RegExp(`${openingSign}${key}${closingSign}`, "g");
    newText = newText.replace(regex, values[key]);
  });
  return newText;
};

const formToMap = (form) => {
  const values = {};
  for (let element of form.elements) {
    if (element.name) {
      if (element.type === "checkbox") {
        values[element.name] = element.checked;
      } else {
        values[element.name] = element.value;
      }
    }
  }
  return values;
};

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

let settings = { messages: [], token: "" };
async function loadSettings() {
  settings = await loadJSON("settings");
  return settings;
}

function formattedMessages(values) {
  let { messages } = settings;

  if (values.prompt) {
    messages = [
      {
        content: values.prompt,
        role: "user",
      },
    ];
  }

  return messages.map((message) => {
    return {
      ...message,
      content: replaceValues(message.content, values),
    };
  });
}

async function askQuestion(answerElementId = "answer") {
  /** @type {HTMLFormElement} */
  const form = document.getElementById("form");
  const values = formToMap(form);
  const messages = formattedMessages(values);
  const max_tokens = values.max_tokens ? Number(values.max_tokens) : 1024;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.token}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      n: 1,
      messages,
      max_tokens,
      //temperature: 0.3
    }),
  });

  const data = await response.json();
  const { message } = data.choices[0];

  let answerEl = document.getElementById(answerElementId);
  if (!answerEl) {
    answerEl = document.createElement("textarea");
    answerEl.className = "px-4 w-full px-2";
    answerEl.setAttribute("id", answerElementId);
    answerEl.setAttribute("rows", "18");
    answerEl.style.cssText = `
      background: transparent; 
      margin-top: 10px; 
      border: none; 
      width: 100%;
    `;

    document.body.append(answerEl);
  }

  answerEl.innerHTML = message.content.trim();
}

let counter = 0;
async function buildForm() {
  return new Promise((resolve, reject) => {
    const again = async () => {
      counter++;

      if (counter > 10) {
        alert("Něco se posralo při renderování formuláře");
        return reject();
      }

      let data;
      let dataElement = document.querySelector("[data-form-builder]");

      if (!dataElement) {
        return resolve();
      }

      if (!("jQuery" in window)) {
        const jquery = document.createElement("script");
        jquery.src =
          "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js";
        document.body.append(jquery);

        const jqueryui = document.createElement("script");
        jqueryui.src =
          "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js";
        document.body.append(jqueryui);
        counter = 0;
        return setTimeout(again, 500);
      }

      dataElement.id = "form-data";
      const formData = dataElement.src
        ? await loadJSON(dataElement.id)
        : dataElement.textContent;

      try {
        data = typeof formData === "string" ? JSON.parse(formData) : formData;
      } catch {
        alert("Chyba v JSONu");
      }

      if (!data) {
        return reject();
      }

      let form = document.getElementById("form");
      if (!form) {
        form = document.createElement("form");
        form.setAttribute("id", "form");
        document.body.prepend(form);
      }

      const formRenderer = document.getElementById("form-renderer");
      if (!formRenderer) {
        jQuery(function ($) {
          const formbuilder = document.createElement("script");
          formbuilder.src =
            "https://formbuilder.online/assets/js/form-render.min.js";
          formbuilder.id = "form-renderer";
          document.body.append(formbuilder);
          counter = 0;
          setTimeout(again, 1000);
        });

        return;
      }

      const renderer = $(form).formRender({ formData });
      resolve($);
    };

    again();
  });
}

const loader = document.createElement("div");
loader.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  opacity: 0.6;
`;

loader.innerHTML = `
<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
`;

document.body.append(loader);

async function load() {
  try {
    // load settings
    const settings = await loadSettings();
    const jQuery = await buildForm();
    if(settings.app_title) {
      document.head.title = settings.app_title
    }

    if (!("jQuery" in window)) {
      throw new Error("jQuery not found");
    }

    jQuery(function ($) {
      $("form").on("submit", (e) => {
        e.preventDefault();

        loader.style.display = "flex";
        askQuestion(settings.answer).finally(() => {
          loader.style.display = "none";
        });
      });
    });
  } catch (err) {
    console.log(err);
  } finally {
    loader.style.display = "none";
  }
}

document.body.onload = load;
