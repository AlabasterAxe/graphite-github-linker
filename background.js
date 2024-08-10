function addGitHubButton() {
  const ELEMENT_NODE = 1;

  const userIndex = 5;
  const repoIndex = 6;
  const prNumberIndex = 7;

  const TABS_PANEL_CLASS = "info-panel__tabs";
  const BUTTON_CONTAINER_CLASS = "buttons__button-container";
  const GITHUB_BUTTON_ID = "graphite-github-linker__github-button";

  const buttonElementText =`
  <button class="buttons__button buttons__button__style--quiet buttons__button__size--default buttons__button--icon-only">
    <div class="buttons__button__icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="first-draft__icon">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    </div>
  </button>`;

  let isUpdating = false;

  function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }

  function graphiteToGitHubUrl(url) {
    const parts = url.split("/");
    return `https://github.com/${parts[userIndex]}/${parts[repoIndex]}/pull/${parts[prNumberIndex]}?no-redirect=1`;
  }

  function addGitHubButton(infoPanelTabsElement) {
    if (document.getElementById(GITHUB_BUTTON_ID)) {
      return;
    }
    const buttonElement = htmlToElement(buttonElementText);
    buttonElement.addEventListener("click", () => {
      window.location.href = graphiteToGitHubUrl(window.location.href);
    });
    const ghButton = document.createElement("div");
    ghButton.classList.add(BUTTON_CONTAINER_CLASS);
    ghButton.id = GITHUB_BUTTON_ID;
    ghButton.appendChild(buttonElement);
    infoPanelTabsElement.appendChild(ghButton);
  }

  function recursivelyAttemptFix(element) {
    if (
      element.nodeName === "DIV" &&
      element.classList.contains(TABS_PANEL_CLASS)
    ) {
      addGitHubButton(element);
      return;
    }
    for (const child of element.children) {
      recursivelyAttemptFix(child);
    }
  }

  let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      for (let addedNode of mutation.addedNodes) {
        if (addedNode.nodeType === ELEMENT_NODE) {
          recursivelyAttemptFix(addedNode);
        }
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    if (tab.url.startsWith("https://app.graphite.dev")) {
      chrome.scripting.executeScript({
        target: { tabId },
        function: addGitHubButton,
      });
    }
  }
});
