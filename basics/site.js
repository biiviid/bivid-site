const digits = [...document.querySelectorAll(".readout span, .readout b")];
const timerButton = document.querySelector("#timer-button");
const resetButton = document.querySelector("#reset-button");
const timerStatus = document.querySelector("#timer-status");
let startedAt = null;
let frame;
let shownTime = "";

function renderTimer(elapsed) {
  const minutes = Math.floor(elapsed / 60000);
  const seconds = String(Math.floor(elapsed / 1000) % 60).padStart(2, "0");
  const millis = String(Math.floor(elapsed) % 1000).padStart(3, "0");
  const time = `${minutes % 10}:${seconds}.${millis}`;
  if (time !== shownTime) {
    digits.forEach((digit, index) => {
      if (digit.textContent !== time[index]) digit.textContent = time[index];
    });
    shownTime = time;
  }
  return `${minutes} minutes, ${seconds} seconds, ${millis} milliseconds`;
}

function tick(now) {
  if (startedAt === null) return;
  if (now - startedAt >= 600000) {
    finish(599999);
    return;
  }
  renderTimer(Math.max(0, now - startedAt));
  frame = requestAnimationFrame(tick);
}

function finish(elapsed) {
  cancelAnimationFrame(frame);
  startedAt = null;
  timerButton.textContent = "start timer";
  timerStatus.textContent = `stopped at ${renderTimer(elapsed)}.`;
  resetButton.disabled = false;
}

timerButton.disabled = false;
timerButton.addEventListener("click", () => {
  if (startedAt !== null) {
    finish(Math.min(performance.now() - startedAt, 599999));
    return;
  }
  renderTimer(0);
  startedAt = performance.now();
  timerButton.textContent = "stop timer";
  timerStatus.textContent = "timer running.";
  resetButton.disabled = true;
  frame = requestAnimationFrame(tick);
});

resetButton.addEventListener("click", () => {
  renderTimer(0);
  timerStatus.textContent = "timer reset.";
  timerButton.focus();
  resetButton.disabled = true;
});

const screenshotDescriptions = {
  timer: "basics. android timer showing a scramble, solve time, and cube diagram",
  history: "basics. history screen listing individual solve times",
  stats: "basics. stats screen showing session bests and rolling averages",
  charts: "basics. charts screen plotting solve times"
};
const galleryButtons = [...document.querySelectorAll("[data-panel]")];
const appShot = document.querySelector("#app-shot");
galleryButtons.forEach(button => {
  button.addEventListener("click", () => {
    const panel = button.dataset.panel;
    galleryButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    appShot.src = `assets/${panel}.png`;
    appShot.alt = screenshotDescriptions[panel];
  });
});
