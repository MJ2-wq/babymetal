/* ==========================================================================
   BABYMETAL Fan Portal - Lógica de Control Principal (SPA, Eventos & Guestbook)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initHamburger();
    initNavigation();
    initEvents();
    initGuestbook();
    initKitsuneEasterEgg();
});

// ==========================================================================
// 0. Menú Hamburguesa — Panel lateral de navegación
// ==========================================================================
function initHamburger() {
    const btn     = document.getElementById('hamburger-btn');
    const nav     = document.getElementById('main-nav');
    const overlay = document.getElementById('nav-overlay');
    if (!btn || !nav || !overlay) return;

    function openMenu() {
        nav.classList.add('open');
        overlay.classList.add('active');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Evitar scroll del fondo
    }

    function closeMenu() {
        nav.classList.remove('open');
        overlay.classList.remove('active');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // Abrir / cerrar con el botón
    btn.addEventListener('click', () => {
        nav.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Cerrar al hacer clic en el overlay
    overlay.addEventListener('click', closeMenu);

    // Cerrar al seleccionar una opción del menú
    document.querySelectorAll('#main-nav-links li').forEach(li => {
        li.addEventListener('click', closeMenu);
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}


// ==========================================================================
// 1. Navegación SPA (Single Page Application)
// ==========================================================================
function initNavigation() {
    const navLinks = document.querySelectorAll('#main-nav-links li');
    const sections = document.querySelectorAll('main section');
    const logoNav = document.getElementById('nav-logo');
    const heroPlayBtn = document.getElementById('btn-hero-play');
    const heroLoreBtn = document.getElementById('btn-hero-lore');

    // Función para cambiar de sección de manera fluida
    function navigateTo(sectionId) {
        sections.forEach(sec => {
            sec.classList.remove('active');
            if (sec.id === sectionId) {
                // Pequeño retardo para dar efecto de transición
                setTimeout(() => {
                    sec.classList.add('active');
                }, 50);
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        // Hacer scroll suave hacia arriba al cambiar de pestaña
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Navegación mediante links del menú
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-section');
            navigateTo(target);
            // Actualizar la URL sin recargar
            history.pushState(null, null, `#${target}`);
        });
    });

    // Clic en el logotipo redirige al inicio
    logoNav.addEventListener('click', () => navigateTo('home'));

    // Botones del Hero de Inicio
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', () => navigateTo('arcade'));
    }
    if (heroLoreBtn) {
        heroLoreBtn.addEventListener('click', () => navigateTo('members'));
    }

    // Controlar navegación del botón de volver al inicio al usar historial del navegador
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1) || 'home';
        navigateTo(hash);
    });

    // Cargar la pestaña correcta según el hash de la URL
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        navigateTo(initialHash);
    }
}

// ==========================================================================
// 2. Sección de Eventos & RSVP (Confirmación de Asistencia)
// ==========================================================================
const TOUR_EVENTS = [
    {
        id: 'ev_tokyo_2026',
        date: '15 de Julio, 2026',
        title: 'Fox God Return Ritual',
        location: 'Tokyo Dome, Tokio, Japón',
        baseRsvp: 55000
    },
    {
        id: 'ev_london_2026',
        date: '22 de Agosto, 2026',
        title: 'Metalverse Invasion Live',
        location: 'Wembley Arena, Londres, Reino Unido',
        baseRsvp: 12500
    },
    {
        id: 'ev_newyork_2026',
        date: '10 de Septiembre, 2026',
        title: 'The Metal Galaxy Legend',
        location: 'Madison Square Garden, Nueva York, EE. UU.',
        baseRsvp: 18200
    },
    {
        id: 'ev_buenosaires_2026',
        date: '04 de Octubre, 2026',
        title: 'Kitsune Ritual in the South',
        location: 'Estadio River Plate, Buenos Aires, Argentina',
        baseRsvp: 45000
    },
    {
        id: 'ev_cdmx_2026',
        date: '18 de Noviembre, 2026',
        title: 'Apocrypha - The Legend of Sun and Moon',
        location: 'Auditorio Nacional, CDMX, México',
        baseRsvp: 9800
    }
];

function initEvents() {
    const timeline = document.getElementById('events-timeline');
    if (!timeline) return;

    // Obtener estados de RSVP guardados en localStorage
    let userRsvps = JSON.parse(localStorage.getItem('babymetal_rsvps')) || {};

    timeline.innerHTML = '';

    TOUR_EVENTS.forEach(event => {
        const isAttending = !!userRsvps[event.id];
        const displayCount = event.baseRsvp + (isAttending ? 1 : 0);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'timeline-item';
        itemDiv.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <span class="event-date">${event.date}</span>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-location">
                    <span>📍</span> ${event.location}
                </div>
                <div class="event-footer">
                    <button class="btn-metal btn-rsvp ${isAttending ? 'attending' : ''}" data-event-id="${event.id}">
                        ${isAttending ? '✓ Asistiendo' : 'Confirmar Asistencia'}
                    </button>
                    <div class="rsvp-count">
                        <span id="count-${event.id}">${displayCount.toLocaleString()}</span> fans asistirán
                    </div>
                </div>
            </div>
        `;
        timeline.appendChild(itemDiv);
    });

    // Delegación de eventos para el botón de RSVP
    timeline.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-rsvp')) {
            const btn = e.target;
            const eventId = btn.getAttribute('data-event-id');
            const event = TOUR_EVENTS.find(ev => ev.id === eventId);
            
            userRsvps = JSON.parse(localStorage.getItem('babymetal_rsvps')) || {};
            const isNowAttending = !userRsvps[eventId];

            if (isNowAttending) {
                userRsvps[eventId] = true;
                btn.classList.add('attending');
                btn.textContent = '✓ Asistiendo';
                playChime(440, 'triangle', 0.1, 0.2); // Tono de éxito
            } else {
                delete userRsvps[eventId];
                btn.classList.remove('attending');
                btn.textContent = 'Confirmar Asistencia';
                playChime(330, 'triangle', 0.05, 0.1); // Tono de cancelación
            }

            localStorage.setItem('babymetal_rsvps', JSON.stringify(userRsvps));

            // Actualizar contador visual
            const countSpan = document.getElementById(`count-${eventId}`);
            if (countSpan && event) {
                const finalCount = event.baseRsvp + (isNowAttending ? 1 : 0);
                countSpan.textContent = finalCount.toLocaleString();
                countSpan.classList.add('score-up');
                setTimeout(() => countSpan.classList.remove('score-up'), 300);
            }
        }
    });
}

// ==========================================================================
// 3. Muro de Comentarios (Guestbook)
// ==========================================================================
function initGuestbook() {
    const form = document.getElementById('guestbook-form');
    const wall = document.getElementById('comments-wall');
    if (!form || !wall) return;

    // Cargar comentarios iniciales por defecto si localStorage está vacío
    let comments = JSON.parse(localStorage.getItem('babymetal_comments'));
    if (!comments) {
        comments = [
            {
                id: 1,
                name: 'Kitsune_Sama_Fan',
                faction: 'su',
                song: 'Megitsune',
                message: '¡La voz de SU-METAL me da escalofríos! El concierto en Tokio Dome de 2016 es lo mejor que le ha pasado a la música. ¡Saludes desde Colombia! 🤘🦊',
                timestamp: Date.now() - 3600000 * 24, // hace 1 día
                reactions: 42
            },
            {
                id: 2,
                name: 'MoaDimpleLover',
                faction: 'moa',
                song: 'Gimme Chocolate!!',
                message: 'Moametal tiene la sonrisa más radiante del metal mundial. Sus coreografías me inspiran a entrenar duro todos los días. ¡Larga vida al Dios Zorro! 💖⚡',
                timestamp: Date.now() - 3600000 * 8, // hace 8 horas
                reactions: 28
            }
        ];
        localStorage.setItem('babymetal_comments', JSON.stringify(comments));
    }

    function renderComments() {
        wall.innerHTML = '';
        comments = JSON.parse(localStorage.getItem('babymetal_comments')) || [];

        // Ordenar del más nuevo al más antiguo
        const sortedComments = [...comments].sort((a, b) => b.timestamp - a.timestamp);

        if (sortedComments.length === 0) {
            wall.innerHTML = `
                <div class="glass-panel" style="text-align: center; color: var(--text-muted);">
                    Aún no hay mensajes en la resistencia. ¡Sé el primero en dejar un comentario de metal!
                </div>
            `;
            return;
        }

        sortedComments.forEach(c => {
            const dateStr = new Date(c.timestamp).toLocaleDateString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Mapear facción a texto legible
            const factionNames = { su: 'SU-METAL Faction', moa: 'MOAMETAL Faction', momo: 'MOMOMETAL Faction' };

            const card = document.createElement('div');
            card.className = 'comment-card';
            card.innerHTML = `
                <div class="comment-header">
                    <span class="comment-user">${escapeHTML(c.name)}</span>
                    <span class="comment-faction ${c.faction}">${factionNames[c.faction]}</span>
                </div>
                <p class="comment-text">${escapeHTML(c.message)}</p>
                <div class="comment-footer">
                    <span class="comment-fav-song">Canción Favorita: ${c.song}</span>
                    <div class="comment-reactions">
                        <button class="btn-reaction" data-comment-id="${c.id}">
                            🤘 <span id="react-count-${c.id}">${c.reactions}</span>
                        </button>
                    </div>
                </div>
            `;
            wall.appendChild(card);
        });
    }

    // Enviar nuevo comentario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('fan-name');
        const factionRadio = document.querySelector('input[name="fan-faction"]:checked');
        const songSelect = document.getElementById('fan-song');
        const messageInput = document.getElementById('fan-message');

        const newComment = {
            id: Date.now(),
            name: nameInput.value.trim(),
            faction: factionRadio.value,
            song: songSelect.value,
            message: messageInput.value.trim(),
            timestamp: Date.now(),
            reactions: 0
        };

        comments = JSON.parse(localStorage.getItem('babymetal_comments')) || [];
        comments.push(newComment);
        localStorage.setItem('babymetal_comments', JSON.stringify(comments));

        // Limpiar campos del formulario
        nameInput.value = '';
        messageInput.value = '';

        // Renderizar de nuevo
        renderComments();

        // Efecto acústico de metal al publicar
        playChime(660, 'sawtooth', 0.15, 0.4);
    });

    // Manejar reacciones de signos del zorro (🤘)
    wall.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-reaction');
        if (btn) {
            const commentId = parseInt(btn.getAttribute('data-comment-id'));
            comments = JSON.parse(localStorage.getItem('babymetal_comments')) || [];

            const index = comments.findIndex(c => c.id === commentId);
            if (index !== -1) {
                comments[index].reactions += 1;
                localStorage.setItem('babymetal_comments', JSON.stringify(comments));

                // Sonido de clic
                playChime(500, 'sine', 0.05, 0.1);

                // Actualizar número en el DOM
                const countSpan = document.getElementById(`react-count-${commentId}`);
                if (countSpan) {
                    countSpan.textContent = comments[index].reactions;
                    countSpan.classList.add('score-up');
                    setTimeout(() => countSpan.classList.remove('score-up'), 250);
                }
            }
        }
    });

    renderComments();
}

// Escapar texto HTML para evitar XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================================================
// 4. Huevo de Pascua / Sonido Web Audio API
// ==========================================================================
function initKitsuneEasterEgg() {
    const mascot = document.getElementById('kitsune-mascot-btn');
    if (!mascot) return;

    mascot.addEventListener('click', () => {
        // Generar un arpegio épico del Dios Zorro utilizando Web Audio API
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Arpegio de Do mayor
        const tempo = 120; // ms de retardo entre notas

        notes.forEach((freq, index) => {
            setTimeout(() => {
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                osc.type = index % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

                gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                // Desvanecimiento suave
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);

                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                osc.start();
                osc.stop(audioCtx.currentTime + 0.7);
            }, index * tempo);
        });

        // Efecto visual: destello rojo en el fondo temporal
        document.body.style.transition = 'background-color 0.1s ease';
        document.body.style.backgroundColor = 'rgba(255, 30, 39, 0.12)';
        
        setTimeout(() => {
            document.body.style.backgroundColor = '';
        }, 150);
    });
}

// Función helper reutilizable para sonidos sintéticos simples
function playChime(frequency, type = 'sine', volume = 0.1, duration = 0.3) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration + 0.1);
    } catch (e) {
        console.warn('AudioContext no soportado o bloqueado por interacción del navegador.');
    }
}
window.playChime = playChime; // Hacer accesible para los minijuegos
