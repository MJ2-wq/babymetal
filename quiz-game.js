/* ==========================================================================
   BABYMETAL Fan Portal - Minijuego de Trivia (Lore Quiz)
   ========================================================================== */

const QUIZ_QUESTIONS = [
    {
        question: "¿Cuál es el nombre del dios mítico protector de BABYMETAL?",
        options: [
            "Kitsune-sama (Dios Zorro)",
            "Amaterasu (Diosa del Sol)",
            "Susanoo (Dios del Mar)",
            "Ryu-jin (Dios Dragón)"
        ],
        answer: 0
    },
    {
        question: "¿En qué año se fundó originalmente BABYMETAL como sub-unidad de Sakura Gakuin?",
        options: [
            "2008",
            "2010",
            "2012",
            "2014"
        ],
        answer: 1
    },
    {
        question: "¿Cuál fue el primer sencillo de debut oficial en una disquera multinacional (Major Label)?",
        options: [
            "Megitsune",
            "Ijime, Dame, Zettai",
            "Doki Doki ☆ Morning",
            "Gimme Chocolate!!"
        ],
        answer: 1
    },
    {
        question: "¿Cómo se llama la virtuosa banda de músicos enmascarados de respaldo que toca en vivo con BABYMETAL?",
        options: [
            "Babybones Band",
            "Kami Band",
            "Fox God Symphony",
            "Sakura Instrumental"
        ],
        answer: 1
    },
    {
        question: "¿Qué guitarristas de la famosa banda de Power Metal 'DragonForce' colaboraron en 'Road of Resistance'?",
        options: [
            "Herman Li & Sam Totman",
            "Kerry King & Jeff Hanneman",
            "Kirk Hammett & James Hetfield",
            "Slash & Duff McKagan"
        ],
        answer: 0
    },
    {
        question: "¿Cómo se llama el concepto de unidad espiritual colectiva de BABYMETAL y sus fans?",
        options: [
            "The One",
            "The Fox Army",
            "Metal Galaxy",
            "Kitsune Resistance"
        ],
        answer: 0
    },
    {
        question: "¿Qué ex-integrante fundadora (conocida como Angel of Dance) dejó el grupo en 2018?",
        options: [
            "SU-METAL",
            "MOAMETAL",
            "YUI-METAL",
            "MOMOMETAL"
        ],
        answer: 2
    },
    {
        question: "¿Cuál de estas canciones recientes es una colaboración de baile y metal electrónico con Electric Callboy?",
        options: [
            "Monochrome",
            "RATATATA",
            "PA PA YA!!",
            "Metali!!"
        ],
        answer: 1
    }
];

class LoreQuizGame {
    constructor() {
        this.lobbyScreen = document.getElementById('screen-quiz-lobby');
        this.playScreen = document.getElementById('screen-quiz-play');
        this.resultsScreen = document.getElementById('screen-quiz-results');
        
        this.questionTextEl = document.getElementById('quiz-question-text');
        this.optionsContainer = document.getElementById('quiz-options-container');
        this.progressBar = document.getElementById('quiz-progress-bar');
        this.resultDescEl = document.getElementById('quiz-result-desc');
        this.badgeContainer = document.getElementById('quiz-badges');
        
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.isResponding = false;
        
        this.totalQuestionsCount = 5; // Cada ronda consta de 5 preguntas aleatorias
        
        this.initEvents();
    }

    initEvents() {
        document.getElementById('btn-start-quiz').addEventListener('click', () => this.startQuiz());
        document.getElementById('btn-restart-quiz').addEventListener('click', () => this.startQuiz());
        document.getElementById('btn-lobby-quiz').addEventListener('click', () => this.showLobby());
    }

    resetLobby() {
        this.playScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        this.lobbyScreen.classList.add('active');
    }

    showLobby() {
        this.resultsScreen.classList.remove('active');
        this.lobbyScreen.classList.add('active');
    }

    startQuiz() {
        this.score = 0;
        this.currentIndex = 0;
        this.isResponding = false;
        
        // Seleccionar 5 preguntas al azar
        const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
        this.currentQuestions = shuffled.slice(0, this.totalQuestionsCount);
        
        // Cambiar pantallas
        this.lobbyScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        this.playScreen.classList.add('active');
        
        this.showQuestion();
    }

    showQuestion() {
        this.isResponding = false;
        const currentQ = this.currentQuestions[this.currentIndex];
        
        // Actualizar barra de progreso
        const progressPercent = (this.currentIndex / this.totalQuestionsCount) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
        
        this.questionTextEl.textContent = currentQ.question;
        this.optionsContainer.innerHTML = '';
        
        currentQ.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => this.handleOptionClick(idx, btn));
            this.optionsContainer.appendChild(btn);
        });
    }

    handleOptionClick(selectedIndex, clickedBtn) {
        if (this.isResponding) return;
        this.isResponding = true;
        
        const currentQ = this.currentQuestions[this.currentIndex];
        const buttons = this.optionsContainer.querySelectorAll('.quiz-opt-btn');
        
        if (selectedIndex === currentQ.answer) {
            // Acierto
            clickedBtn.classList.add('correct');
            this.score += 1;
            window.playChime(660, 'sine', 0.1, 0.2); // Sonido agradable
        } else {
            // Error
            clickedBtn.classList.add('incorrect');
            buttons[currentQ.answer].classList.add('correct'); // Resaltar correcta
            window.playChime(220, 'triangle', 0.08, 0.25); // Sonido apagado
        }
        
        // Avanzar a la siguiente pregunta tras un breve retardo de 1.2 segundos
        setTimeout(() => {
            this.currentIndex += 1;
            if (this.currentIndex < this.totalQuestionsCount) {
                this.showQuestion();
            } else {
                this.endQuiz();
            }
        }, 1200);
    }

    endQuiz() {
        // Llenar barra de progreso al 100%
        this.progressBar.style.width = '100%';

        // Cambiar pantallas
        this.playScreen.classList.remove('active');
        this.resultsScreen.classList.add('active');

        // Determinar Rango de Lore y medallas
        let loreBadgeId = '';
        let loreBadgeName = '';
        let loreBadgeIcon = '';
        
        if (this.score === 5) {
            loreBadgeId = 'badge_lore_god';
            loreBadgeName = 'Lore God';
            loreBadgeIcon = '👑';
        } else if (this.score >= 3) {
            loreBadgeId = 'badge_lore_apprentice';
            loreBadgeName = 'Lore Apprentice';
            loreBadgeIcon = '📜';
        }

        let descText = `Completaste la trivia histórica. Respondiste correctamente <strong>${this.score} de ${this.totalQuestionsCount}</strong> preguntas.<br>`;
        
        if (loreBadgeId) {
            descText += `<span style="color: var(--gold); font-weight: bold;">¡El Dios Zorro te bendice con su sabiduría eterna! Desbloqueaste: "${loreBadgeName}".</span>`;
            
            // Guardar logros en localStorage
            const unlockedBadges = JSON.parse(localStorage.getItem('babymetal_badges')) || {};
            unlockedBadges[loreBadgeId] = true;
            localStorage.setItem('babymetal_badges', JSON.stringify(unlockedBadges));
        } else {
            descText += 'El Dios Zorro exige que estudies más la mitología de la Metal Resistance. ¡Vuelve a intentarlo!';
        }

        this.resultDescEl.innerHTML = descText;
        this.renderBadges();

        // Tono acústico final
        if (this.score >= 3) {
            window.playChime(523.25, 'sine', 0.1, 0.2);
            setTimeout(() => window.playChime(659.25, 'sine', 0.1, 0.2), 150);
            setTimeout(() => window.playChime(783.99, 'sine', 0.1, 0.3), 300);
        } else {
            window.playChime(220, 'sawtooth', 0.1, 0.4);
        }
    }

    renderBadges() {
        this.badgeContainer.innerHTML = '';
        const unlockedBadges = JSON.parse(localStorage.getItem('babymetal_badges')) || {};

        const allBadges = [
            { id: 'badge_lore_apprentice', name: 'Lore Apprentice', icon: '📜' },
            { id: 'badge_lore_god', name: 'Lore God', icon: '👑' }
        ];

        allBadges.forEach(b => {
            const isUnlocked = !!unlockedBadges[b.id];
            const badgeItem = document.createElement('div');
            badgeItem.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
            badgeItem.innerHTML = `
                <div class="badge-icon" title="${isUnlocked ? '¡Desbloqueado!' : 'Bloqueado'}">${b.icon}</div>
                <div class="badge-name">${b.name}</div>
            `;
            this.badgeContainer.appendChild(badgeItem);
        });
    }
}

// Inicializar juego globalmente
window.quizGame = new LoreQuizGame();
