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
  timerButton.firstChild.nodeValue = "Start timer ";
  timerStatus.textContent = `Stopped at ${renderTimer(elapsed)}.`;
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
  timerButton.firstChild.nodeValue = "Stop timer ";
  timerStatus.textContent = "Timer running.";
  resetButton.disabled = true;
  frame = requestAnimationFrame(tick);
});

resetButton.addEventListener("click", () => {
  renderTimer(0);
  timerStatus.textContent = "Timer reset.";
  timerButton.focus();
  resetButton.disabled = true;
});

const screenshots = {
  timer: [
    "basics. Android timer showing a scramble, solve time, and cube diagram",
    "Start with a 3×3 scramble and an optional 15-second inspection. Once you start the solve, the clock takes over the screen."
  ],
  history: [
    "basics. history screen listing individual solve times",
    "Review individual solves in a named session, revisit their scrambles, and apply +2 or DNF penalties."
  ],
  stats: [
    "basics. stats screen showing session bests and rolling averages",
    "Track personal bests, session averages, and rolling averages such as ao5 and ao12."
  ],
  charts: [
    "basics. charts screen plotting solve times",
    "See how your times change over a session and where most of your solves land."
  ]
};
const galleryButtons = [...document.querySelectorAll("[data-panel]")];
const appShot = document.querySelector("#app-shot");
const galleryCaption = document.querySelector("#gallery-caption");
galleryButtons.forEach(button => {
  button.addEventListener("click", () => {
    const panel = button.dataset.panel;
    const [alt, caption] = screenshots[panel];
    galleryButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    appShot.src = `assets/${panel}.png`;
    appShot.alt = alt;
    galleryCaption.textContent = caption;
  });
});
