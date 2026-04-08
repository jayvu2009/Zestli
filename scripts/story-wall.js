const ZESTLI_STORAGE_KEY = "zestli-stories";

const starterStories = [
  {
    id: "starter-1",
    author: "Anonymous",
    email: "",
    story:
      "I was having the worst day, and then my Zestli meal showed up with a handwritten note that made me tear up. Thank you!",
    createdAt: "2025-08-15T12:00:00.000Z",
    replies: [],
    starter: true,
  },
  {
    id: "starter-2",
    author: "Anonymous",
    email: "",
    story:
      "I really love the way Zestli caring about my feeling, that is really really touched. And I just broke up with my boyfriend yesterday btw. He is so horrible!!!!",
    createdAt: "2025-08-16T12:00:00.000Z",
    replies: [],
    starter: true,
  },
  {
    id: "starter-3",
    author: "Anonymous",
    email: "",
    story:
      "I had a rough shift at work. My manager had been unfairly critical again — small mistakes turned into big lectures, and I ended up crying in the back room. When I got home, I was too drained to cook, so I ordered from Zestli for the first time. I wasn’t expecting anything special... but inside the box was a short handwritten note that read: ‘You are doing your best. That’s more than enough.’ I sat there and cried again, but this time it wasn’t because of the day — it was because someone out there cared enough to write that. Thank you, Zestli. I needed that more than you know.",
    createdAt: "2025-08-17T12:00:00.000Z",
    replies: [],
    starter: true,
  },
];

function readStories() {
  try {
    const savedStories = JSON.parse(localStorage.getItem(ZESTLI_STORAGE_KEY));
    return Array.isArray(savedStories) ? savedStories : [];
  } catch (error) {
    return [];
  }
}

function writeStories(stories) {
  localStorage.setItem(ZESTLI_STORAGE_KEY, JSON.stringify(stories));
}

function getStories() {
  const savedStories = readStories();
  const storiesById = new Map();

  starterStories.forEach((story) => {
    storiesById.set(story.id, story);
  });

  savedStories.forEach((story) => {
    storiesById.set(story.id, story);
  });

  return Array.from(storiesById.values()).sort((firstStory, secondStory) => {
    return new Date(secondStory.createdAt) - new Date(firstStory.createdAt);
  });
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatStory(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function saveStory(story) {
  const savedStories = readStories();
  savedStories.unshift(story);
  writeStories(savedStories);
}

function saveReply(storyId, reply) {
  const savedStories = readStories();
  const storyIndex = savedStories.findIndex((story) => story.id === storyId);
  if (storyIndex === -1) {
    const starterStory = starterStories.find((story) => story.id === storyId);
    if (!starterStory) return;
    const newStory = {
      ...starterStory,
      replies: [...starterStory.replies, reply],
      starter: false,
    };
    savedStories.unshift(newStory);
    writeStories(savedStories);
    return;
  }

  const updatedStory = {
    ...savedStories[storyIndex],
    replies: [...(savedStories[storyIndex].replies || []), reply],
  };
  savedStories.splice(storyIndex, 1, updatedStory);
  writeStories(savedStories);
}

function attachStoryForm() {
  const storyForm = document.querySelector("[data-story-form]");
  const formFeedback = document.querySelector("[data-story-feedback]");
  if (!storyForm) return;

  storyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(storyForm);
    const author = (formData.get("name") || "").toString().trim() || "Anonymous";
    const email = (formData.get("email") || "").toString().trim();
    const storyText = (formData.get("story") || "").toString().trim();

    if (!storyText) {
      if (formFeedback) {
        formFeedback.textContent = "Please share your story before submitting.";
      }
      return;
    }

    saveStory({
      id: createId("story"),
      author,
      email,
      story: storyText,
      createdAt: new Date().toISOString(),
      replies: [],
    });

    if (formFeedback) {
      formFeedback.textContent = "Your story was added to the message wall.";
    }

    storyForm.reset();
    window.location.href = "message-wall.html";
  });
}

function buildReplyMarkup(replies = []) {
  if (!replies.length) return "";

  return `
    <div class="mt-5 space-y-3 border-t border-[#EFE5D3] pt-4">
      ${replies
        .map(
          (reply) => `
            <div class="rounded-2xl bg-[#FAF4EA] p-4">
              <p class="text-sm leading-6 text-[#245C44]">${formatStory(reply.message)}</p>
              <p class="mt-2 text-xs text-gray-500">— ${escapeHtml(reply.author || "Anonymous")}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderStories() {
  const storyList = document.querySelector("[data-story-list]");
  if (!storyList) return;

  const stories = getStories();

  storyList.innerHTML = stories
    .map(
      (story) => `
        <article class="rounded-2xl bg-white p-5 shadow sm:p-7">
          <p class="text-lg italic leading-8 text-[#245C44]">"${formatStory(story.story)}"</p>
          <p class="mt-3 text-sm text-gray-500">– ${escapeHtml(story.author || "Anonymous")}</p>
          ${buildReplyMarkup(story.replies)}
          <button
            class="mt-5 text-sm font-semibold text-[#F75C2F] underline underline-offset-4"
            type="button"
            data-reply-toggle="${story.id}"
          >
            Reply
          </button>
          <form class="mt-4 hidden space-y-3" data-reply-form="${story.id}">
            <textarea
              class="min-h-[110px] w-full rounded-xl border border-[#D7D9DF] p-3"
              rows="3"
              name="reply"
              placeholder="Write your reply..."
              required
            ></textarea>
            <input
              class="w-full rounded-xl border border-[#D7D9DF] p-3"
              type="text"
              name="name"
              placeholder="Your name (private)"
            />
            <input
              class="w-full rounded-xl border border-[#D7D9DF] p-3"
              type="email"
              name="email"
              placeholder="Your email (private)"
            />
            <button class="rounded-full bg-[#245C44] px-5 py-3 text-white transition hover:bg-green-800" type="submit">
              Send
            </button>
          </form>
        </article>
      `
    )
    .join("");

  storyList.querySelectorAll("[data-reply-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = storyList.querySelector(`[data-reply-form="${button.dataset.replyToggle}"]`);
      if (form) {
        form.classList.toggle("hidden");
      }
    });
  });

  storyList.querySelectorAll("[data-reply-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const storyId = form.getAttribute("data-reply-form");
      const formData = new FormData(form);
      const message = (formData.get("reply") || "").toString().trim();
      const author = (formData.get("name") || "").toString().trim() || "Anonymous";

      if (!message || !storyId) return;

      saveReply(storyId, {
        id: createId("reply"),
        author,
        message,
        createdAt: new Date().toISOString(),
      });

      renderStories();
    });
  });
}

function attachMobileMenu() {
  const menuButton = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-menu]");
  if (!menuButton || !menu) return;

  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("hidden");
    menuButton.setAttribute("aria-expanded", String(!isOpen));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  attachMobileMenu();
  attachStoryForm();
  renderStories();
});
