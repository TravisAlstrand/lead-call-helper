const THEME_KEY = "lead-call-theme";
const NAME_KEY = "lead-call-name";
const NAME_BLANK = "______";
const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const toggleText = toggle.querySelector(".theme-toggle__text");
const leadType = document.getElementById("lead-type");
const yourName = document.getElementById("your-name");
const clientName = document.getElementById("client-name");
const agentName = document.getElementById("agent-name");
const clientNameSlots = document.querySelectorAll(".client-name");
const scripts = document.querySelectorAll("[data-lead]");
const prefillJump = document.getElementById("prefill-jump");
const leadDetails = document.getElementById("lead-details");
const zip = document.getElementById("zip");
const detailsForm = document.getElementById("lead-details-form");

function readStored(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Storage can be blocked; the page still works for this visit.
  }
}

function currentTheme() {
  return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute(
    "aria-label",
    isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
  );
  toggleText.textContent = isDark ? "Dark" : "Light";
}

function applyName(name) {
  const trimmed = name.trim();
  agentName.textContent = trimmed || NAME_BLANK;
  agentName.classList.toggle("is-set", trimmed.length > 0);
}

function applyClientName(name) {
  const trimmed = name.trim();
  clientNameSlots.forEach((slot) => {
    slot.textContent = trimmed || NAME_BLANK;
    slot.classList.toggle("is-set", trimmed.length > 0);
  });
}

toggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  writeStored(THEME_KEY, next);
});

const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
colorScheme.addEventListener("change", (event) => {
  const stored = readStored(THEME_KEY);
  if (stored === "light" || stored === "dark") return;
  applyTheme(event.matches ? "dark" : "light");
});

const storedName = readStored(NAME_KEY);
if (storedName) {
  yourName.value = storedName;
  applyName(storedName);
}

yourName.addEventListener("change", () => {
  const name = yourName.value.trim();
  yourName.value = name;
  applyName(name);
  writeStored(NAME_KEY, name);
});

clientName.addEventListener("change", () => {
  const name = clientName.value.trim();
  clientName.value = name;
  applyClientName(name);
});

function showSelectedLead() {
  const selected = leadType.value;
  scripts.forEach((script) => {
    script.hidden = script.dataset.lead !== selected;
  });
}

function resetLeadType() {
  leadType.value = "";
  showSelectedLead();
}

leadType.addEventListener("change", showSelectedLead);

// A restored choice would already be selected, so picking it again
// would not count as a change. Always start on the placeholder.
resetLeadType();
window.addEventListener("pageshow", () => {
  resetLeadType();
  updateHousehold();
});

detailsForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

prefillJump.addEventListener("click", (event) => {
  event.preventDefault();
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  leadDetails.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  zip.focus({ preventScroll: true });
});

const insuranceYesNotes = document.getElementById("insurance-notes");
const insuranceNoNotes = document.getElementById("insurance-why");
const insuranceDetails = document.getElementById("insurance-details");
const insuranceWhy = document.getElementById("insurance-why-details");
const healthNotes = document.getElementById("health-notes");
const healthDetails = document.getElementById("health");
const businessId = document.getElementById("business-id");
const dobLine = document.getElementById("dob-line");
const dobLineFamily = document.getElementById("dob-line-family");
const healthLine = document.getElementById("health-line");
const healthReassure = document.getElementById("health-reassure");
const healthLineFamily = document.getElementById("health-line-family");
const healthReassureFamily = document.getElementById("health-reassure-family");
const membersHint = document.getElementById("members-hint");
const membersEmpty = document.getElementById("members-empty");
const members = document.getElementById("members");
const addMember = document.getElementById("add-member");
let memberSeq = 0;

function updateInsuranceNotes(focusNotes) {
  const selected = document.querySelector('input[name="insurance"]:checked');
  const value = selected ? selected.value : "";
  insuranceYesNotes.hidden = value !== "yes";
  insuranceNoNotes.hidden = value !== "no";
  if (!focusNotes) return;
  if (value === "yes") insuranceDetails.focus();
  if (value === "no") insuranceWhy.focus();
}

function updateHealthNotes(focusNotes) {
  const selected = document.querySelector(
    'input[name="health-answer"]:checked',
  );
  const value = selected ? selected.value : "";
  healthNotes.hidden = value !== "yes";
  if (focusNotes && value === "yes") healthDetails.focus();
}

function updateSelfEmployed(focusField) {
  const selected = document.querySelector(
    'input[name="self-employed"]:checked',
  );
  const isYes = selected?.value === "yes";
  businessId.hidden = !isYes;
  if (!focusField || !isYes) return;
  businessId
    .querySelector('input[type="radio"]:not(:disabled)')
    .focus({ preventScroll: true });
}

function createMember(kind) {
  const id = ++memberSeq;
  const row = document.createElement("article");
  row.className = "member";
  row.dataset.kind = kind;

  const relation =
    kind === "self"
      ? '<p class="member__role">Self</p>'
      : '<button type="button" class="member__remove">Remove Member</button>';
  const relationChoices =
    kind === "relative"
      ? `<div class="choice__options" role="radiogroup" aria-label="Relation">
          <label class="choice__option">
            <input type="radio" name="relation-${id}" value="spouse" />
            <span>Spouse</span>
          </label>
          <label class="choice__option">
            <input type="radio" name="relation-${id}" value="child" />
            <span>Child</span>
          </label>
        </div>`
      : "";

  row.innerHTML = `
    <div class="member__top">
      ${relation}
    </div>
    ${relationChoices}
    <div class="choice__options" role="radiogroup" aria-label="Sex">
      <label class="choice__option">
        <input type="radio" name="sex-${id}" value="male" />
        <span>Male</span>
      </label>
      <label class="choice__option">
        <input type="radio" name="sex-${id}" value="female" />
        <span>Female</span>
      </label>
    </div>
    <div class="member__dob">
      <div class="choice__options" role="radiogroup" aria-label="Date or Age">
        <label class="choice__option">
          <input type="radio" name="dob-mode-${id}" value="date" />
          <span>Date of Birth</span>
        </label>
        <label class="choice__option">
          <input type="radio" name="dob-mode-${id}" value="age" />
          <span>Age</span>
        </label>
      </div>
      <input class="member__date" type="date" aria-label="Date of Birth" autocomplete="off" hidden />
      <input class="member__age" type="text" inputmode="numeric" maxlength="3" placeholder="Age" aria-label="Age" autocomplete="off" hidden />
    </div>
  `;
  return row;
}

function updateDobMode(radio, focusField) {
  const row = radio.closest(".member");
  if (!row) return;
  const date = row.querySelector(".member__date");
  const age = row.querySelector(".member__age");
  const useDate = row.querySelector(
    'input[name^="dob-mode-"][value="date"]',
  ).checked;
  const useAge = row.querySelector(
    'input[name^="dob-mode-"][value="age"]',
  ).checked;
  date.hidden = !useDate;
  age.hidden = !useAge;
  if (!focusField) return;
  if (useAge) age.focus();
  else if (useDate) date.focus();
}

function updateSpouseOptions() {
  const spouseRadios = members.querySelectorAll('input[value="spouse"]');
  const selected = Array.from(spouseRadios).find((radio) => radio.checked);
  spouseRadios.forEach((radio) => {
    radio.disabled = Boolean(selected) && radio !== selected;
  });
}

function updateHousehold() {
  const selected = document.querySelector('input[name="household"]:checked');
  const value = selected ? selected.value : "";
  const isFamily = value === "family" || value === "not-sure";
  dobLine.hidden = isFamily;
  dobLineFamily.hidden = !isFamily;
  healthLine.hidden = isFamily;
  healthReassure.hidden = isFamily;
  healthLineFamily.hidden = !isFamily;
  healthReassureFamily.hidden = !isFamily;
  membersEmpty.hidden = value !== "";
  membersHint.hidden = value === "";
  members.hidden = value === "";
  addMember.hidden = !isFamily;
  members.querySelectorAll('[data-kind="relative"]').forEach((row) => {
    row.hidden = !isFamily;
  });
}

members.append(createMember("self"));

detailsForm.addEventListener("pointerdown", (event) => {
  const option = event.target.closest(".choice__option");
  if (!option) return;
  const radio = option.querySelector("input");
  if (!radio) return;
  radio.dataset.wasChecked = String(radio.checked);
});

detailsForm.addEventListener("click", (event) => {
  const remove = event.target.closest(".member__remove");
  if (remove) {
    remove.closest(".member").remove();
    updateSpouseOptions();
    refreshChecks();
    addMember.focus();
    return;
  }

  if (event.target.closest("#add-member")) {
    const row = createMember("relative");
    members.append(row);
    updateSpouseOptions();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    row.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
    });
    row
      .querySelector('input[type="radio"]:not(:disabled)')
      .focus({ preventScroll: true });
    refreshChecks();
    return;
  }

  const radio = event.target.closest('input[type="radio"]');
  if (!radio || radio.disabled) return;
  const locked = radio.name.startsWith("dob-mode-");
  if (!locked && radio.dataset.wasChecked === "true") {
    radio.checked = false;
  }
  detailsForm
    .querySelectorAll(
      `input[type="radio"][name="${CSS.escape(radio.name)}"]`,
    )
    .forEach((item) => {
      item.dataset.wasChecked = String(item.checked);
    });
  if (radio.name === "insurance") updateInsuranceNotes(radio.checked);
  if (radio.name === "health-answer") updateHealthNotes(radio.checked);
  if (radio.name === "self-employed") updateSelfEmployed(radio.checked);
  if (radio.name === "household") updateHousehold();
  if (radio.name.startsWith("relation-")) updateSpouseOptions();
  refreshChecks();
});

detailsForm.addEventListener("change", (event) => {
  const radio = event.target;
  if (radio.type === "radio") {
    if (radio.name === "insurance") updateInsuranceNotes(true);
    if (radio.name === "health-answer") updateHealthNotes(true);
    if (radio.name === "self-employed") updateSelfEmployed(true);
    if (radio.name === "household") updateHousehold();
    if (radio.name.startsWith("dob-mode-")) updateDobMode(radio, true);
    if (radio.name.startsWith("relation-")) updateSpouseOptions();
  }
  refreshChecks();
});

detailsForm.addEventListener("input", refreshChecks);

updateInsuranceNotes(false);
updateHealthNotes(false);
updateSelfEmployed(false);
updateHousehold();

function checkedLabel(name) {
  const radio = document.querySelector(
    `input[type="radio"][name="${CSS.escape(name)}"]:checked`,
  );
  if (!radio) return "";
  const span = radio.closest("label")?.querySelector("span");
  return span ? span.textContent.trim() : radio.value;
}

function fieldValue(id) {
  const field = document.getElementById(id);
  return field ? field.value.trim() : "";
}

function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${match[2]}/${match[3]}/${match[1]}`;
}

function describeMember(row) {
  const role = row.querySelector(".member__role");
  const relation = row.querySelector('input[name^="relation-"]:checked');
  const who = relation
    ? relation.closest("label").querySelector("span").textContent.trim()
    : role
      ? role.textContent.trim()
      : "";
  const sex = row.querySelector('input[name^="sex-"]:checked');
  const sexLabel = sex
    ? sex.closest("label").querySelector("span").textContent.trim()
    : "";
  const useAge = row.querySelector(
    'input[name^="dob-mode-"][value="age"]',
  )?.checked;
  let when = "";
  if (useAge) {
    const age = row.querySelector(".member__age").value.trim();
    if (age) when = `Age ${age}`;
  } else {
    const date = formatDate(row.querySelector(".member__date").value);
    if (date) when = `Date of Birth ${date}`;
  }
  return [who, sexLabel, when].filter(Boolean).join(", ");
}

function buildResults() {
  const lines = ["Lead Call Notes"];
  const client = fieldValue("client-name");
  const agent = fieldValue("your-name");
  const lead = document.getElementById("lead-type");
  const leadLabel =
    lead && lead.value ? lead.selectedOptions[0].textContent.trim() : "";
  if (client) lines.push(`Client: ${client}`);
  if (agent) lines.push(`Agent: ${agent}`);
  if (leadLabel) lines.push(`Lead Type: ${leadLabel}`);

  const details = [];
  const add = (label, value) => {
    if (value) details.push(`${label}: ${value}`);
  };

  add("Zip Code", fieldValue("zip"));
  add("Household", checkedLabel("household"));

  const insurance = checkedLabel("insurance");
  add("Current Insurance", insurance);
  if (insurance === "Yes") add("Type/Amount", fieldValue("insurance-details"));
  if (insurance === "No") add("Why Is That?", fieldValue("insurance-why-details"));

  if (!members.hidden) {
    const people = [...members.querySelectorAll(".member")]
      .filter((row) => !row.hidden)
      .map(describeMember)
      .filter(Boolean);
    if (people.length) {
      details.push("Who's Covered:");
      people.forEach((person) => details.push(`- ${person}`));
    }
  }

  const health = checkedLabel("health-answer");
  add("Health Notes", health);
  if (health === "Yes") add("Details", fieldValue("health"));
  add("Optional Follow-Up", fieldValue("health-followup"));

  add("Coverage Type", checkedLabel("coverage-focus"));
  add("Additional Coverage", checkedLabel("coverage-extras"));

  const selfEmployed = checkedLabel("self-employed");
  add("Self-Employed Income", selfEmployed);
  if (selfEmployed === "Yes") add("Business Tax ID", checkedLabel("business-id"));

  add("Household Income", fieldValue("household-income"));
  add("Extra Notes", fieldValue("extra-notes"));

  if (details.length) lines.push("", ...details);
  else lines.push("", "No details entered yet.");
  return `${lines.join("\n")}\n`;
}

function resultsFilename() {
  const client = fieldValue("client-name")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return client ? `lead-notes-${client}.txt` : "lead-notes.txt";
}

function flashResults(button, message) {
  window.clearTimeout(Number(button.dataset.timer));
  if (!button.dataset.label) button.dataset.label = button.textContent.trim();
  button.textContent = message;
  button.dataset.timer = String(
    window.setTimeout(() => {
      button.textContent = button.dataset.label;
    }, 1600),
  );
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => copyTextFallback(text));
  }
  return copyTextFallback(text);
}

function copyTextFallback(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return copied ? Promise.resolve() : Promise.reject(new Error("copy failed"));
}

function memberComplete(row) {
  if (row.hidden) return true;
  const sex = row.querySelector('input[name^="sex-"]:checked');
  const useAge = row.querySelector(
    'input[name^="dob-mode-"][value="age"]',
  )?.checked;
  const useDate = row.querySelector(
    'input[name^="dob-mode-"][value="date"]',
  )?.checked;
  const when = useAge
    ? row.querySelector(".member__age").value.replace(/\D/g, "").length >= 2
    : useDate && row.querySelector(".member__date").value.trim() !== "";
  if (row.dataset.kind === "relative") {
    const relation = row.querySelector('input[name^="relation-"]:checked');
    return Boolean(relation && sex && when);
  }
  return Boolean(sex && when);
}

function sectionComplete(section) {
  switch (section.dataset.check) {
    case "zip":
      return fieldValue("zip").replace(/\D/g, "").length >= 5;
    case "household":
      return Boolean(document.querySelector('input[name="household"]:checked'));
    case "insurance":
      return Boolean(document.querySelector('input[name="insurance"]:checked'));
    case "covered": {
      if (!document.querySelector('input[name="household"]:checked')) return false;
      return [...members.querySelectorAll(".member")].every(memberComplete);
    }
    case "health": {
      const value = document.querySelector(
        'input[name="health-answer"]:checked',
      )?.value;
      if (value === "no") return true;
      if (value === "yes") return fieldValue("health") !== "";
      return false;
    }
    case "coverage":
      return Boolean(
        document.querySelector('input[name="coverage-focus"]:checked'),
      );
    case "extras":
      return Boolean(
        document.querySelector('input[name="coverage-extras"]:checked'),
      );
    case "self-employed": {
      const value = document.querySelector(
        'input[name="self-employed"]:checked',
      )?.value;
      if (value === "no") return true;
      if (value === "yes") {
        return Boolean(document.querySelector('input[name="business-id"]:checked'));
      }
      return false;
    }
    case "income":
      return fieldValue("household-income") !== "";
    default:
      return true;
  }
}

function refreshChecks() {
  document.querySelectorAll("[data-check]").forEach((section) => {
    const complete = sectionComplete(section);
    section.classList.toggle("is-complete", complete);
    const status = section.querySelector(".ask__status");
    if (status) status.textContent = complete ? "Complete" : "Incomplete";
  });
}

function missingSections() {
  return [...document.querySelectorAll("[data-check]")].filter(
    (section) => !section.classList.contains("is-complete"),
  );
}

document.querySelectorAll("[data-check]").forEach((section) => {
  const status = document.createElement("span");
  status.className = "ask__status";
  section.prepend(status);
});
refreshChecks();

const resultsWarn = document.getElementById("results-warn");
const resultsWarnList = document.getElementById("results-warn-list");
const resultsWarnContinue = document.getElementById("results-warn-continue");
let pendingResults = null;

function openResultsWarn(action, label) {
  pendingResults = action;
  resultsWarnContinue.textContent = label;
  resultsWarnList.replaceChildren(
    ...missingSections().map((section) => {
      const item = document.createElement("li");
      item.textContent = section.dataset.label;
      return item;
    }),
  );
  resultsWarn.showModal();
}

function runResults(action, anywayLabel) {
  refreshChecks();
  if (!missingSections().length) {
    action();
    return;
  }
  openResultsWarn(action, anywayLabel);
}

resultsWarn.addEventListener("close", () => {
  pendingResults = null;
});

resultsWarn.addEventListener("click", (event) => {
  if (event.target === resultsWarn) resultsWarn.close();
});

document.getElementById("results-warn-back").addEventListener("click", () => {
  const first = missingSections()[0];
  resultsWarn.close();
  if (!first) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  first.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "center",
  });
  first.querySelector("input, textarea, select, button")?.focus({
    preventScroll: true,
  });
});

resultsWarnContinue.addEventListener("click", () => {
  const action = pendingResults;
  resultsWarn.close();
  action?.();
});

function copyResults() {
  const button = document.getElementById("copy-results");
  copyText(buildResults()).then(
    () => flashResults(button, "Copied"),
    () => flashResults(button, "Copy Failed"),
  );
}

function downloadResults() {
  const file = new Blob([buildResults()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = resultsFilename();
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById("copy-results").addEventListener("click", () => {
  runResults(copyResults, "Copy Anyway");
});

document.getElementById("download-results").addEventListener("click", () => {
  runResults(downloadResults, "Download Anyway");
});

applyTheme(currentTheme());
