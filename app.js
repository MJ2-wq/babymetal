const pages = Array.from(document.querySelectorAll("[data-page]"));
const navLinks = Array.from(document.querySelectorAll("[data-route]"));
const menuToggle = document.getElementById("menuToggle");
const closeNav = document.getElementById("closeNav");
const sideNav = document.getElementById("sideNav");
const navScrim = document.getElementById("navScrim");
const routes = new Set(pages.map((page) => page.dataset.page));

function setRoute(route) {
    const target = routes.has(route) ? route : "home";

    pages.forEach((page) => {
        page.classList.toggle("active", page.dataset.page === target);
    });

    navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.route === target);
    });

    if (window.location.hash.replace("#", "") !== target) {
        window.location.hash = target;
    }

    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openMenu() {
    sideNav.classList.add("open");
    navScrim.classList.add("open");
    menuToggle.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    sideNav.classList.remove("open");
    navScrim.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
}

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        setRoute(link.dataset.route);
    });
});

document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.go));
});

menuToggle.addEventListener("click", () => {
    if (sideNav.classList.contains("open")) {
        closeMenu();
        return;
    }

    openMenu();
});
closeNav.addEventListener("click", closeMenu);
navScrim.addEventListener("click", closeMenu);

window.addEventListener("hashchange", () => {
    setRoute(window.location.hash.replace("#", "") || "home");
});

setRoute(window.location.hash.replace("#", "") || "home");

const rsvpButtons = document.querySelectorAll(".rsvp");
rsvpButtons.forEach((button) => {
    const key = `bm-rsvp-${button.dataset.event}`;
    setRsvpState(button, localStorage.getItem(key) === "yes");

    button.addEventListener("click", () => {
        const active = !button.classList.contains("active");
        localStorage.setItem(key, active ? "yes" : "no");
        setRsvpState(button, active);
        playTone(active ? 660 : 330, 0.08);
    });
});

function setRsvpState(button, active) {
    button.classList.toggle("active", active);
    button.textContent = active ? "Confirmado" : "Confirmar";
}

const keys = ["A", "S", "D", "F", "J", "K", "L"];
let targetKey = "A";
let score = 0;
let gameActive = false;
let gameTimer = null;

const keyTarget = document.getElementById("keyTarget");
const scoreEl = document.getElementById("score");
const startGame = document.getElementById("startGame");
const arcadeMessage = document.getElementById("arcadeMessage");

function nextKey() {
    targetKey = keys[Math.floor(Math.random() * keys.length)];
    keyTarget.textContent = targetKey;
}

startGame.addEventListener("click", () => {
    score = 0;
    gameActive = true;
    scoreEl.textContent = score;
    arcadeMessage.textContent = "Tienes 20 segundos.";
    startGame.disabled = true;
    nextKey();

    clearTimeout(gameTimer);
    gameTimer = setTimeout(() => {
        gameActive = false;
        startGame.disabled = false;
        arcadeMessage.textContent = `Reto terminado. Puntuación final: ${score}`;
    }, 20000);
});

window.addEventListener("keydown", (event) => {
    if (!gameActive) return;

    if (event.key.toUpperCase() === targetKey) {
        score += 10;
        scoreEl.textContent = score;
        arcadeMessage.textContent = "Impacto perfecto.";
        playTone(520 + score, 0.04);
        nextKey();
    }
});

const fanForm = document.getElementById("fanForm");
const fanWall = document.getElementById("fanWall");
const postsKey = "bm-fan-posts";
let posts = JSON.parse(localStorage.getItem(postsKey) || "[]");

function renderPosts() {
    fanWall.innerHTML = "";

    if (posts.length === 0) {
        fanWall.innerHTML = '<div class="empty-wall">Todavía no hay mensajes. Sé el primero en firmar.</div>';
        return;
    }

    posts.forEach((post) => {
        const article = document.createElement("article");
        article.className = "fan-post";
        article.innerHTML = `
            <strong>${escapeHTML(post.name)}</strong>
            <p>${escapeHTML(post.message)}</p>
        `;
        fanWall.appendChild(article);
    });
}

fanForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("fanName").value.trim();
    const message = document.getElementById("fanMessage").value.trim();

    if (!name || !message) return;

    posts.unshift({ name, message });
    posts = posts.slice(0, 12);
    localStorage.setItem(postsKey, JSON.stringify(posts));
    fanForm.reset();
    renderPosts();
    playTone(880, 0.08);
});

function escapeHTML(value) {
    return value.replace(/[&<>'"]/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));
}

function playTone(frequency, duration) {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        gain.gain.value = 0.04;
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
    } catch (error) {
        // Audio is optional.
    }
}

renderPosts();

