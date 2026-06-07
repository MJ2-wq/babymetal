/* ==========================================================================
   BABYMETAL Fan Portal - Minijuego de Ritmo (Kitsune Beat)
   ========================================================================== */

class KitsuneBeatGame {
    constructor() {
        this.canvas = document.getElementById('rhythm-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Elementos de la interfaz
        this.lobbyScreen = document.getElementById('screen-rhythm-lobby');
        this.playScreen = document.getElementById('screen-rhythm-play');
        this.resultsScreen = document.getElementById('screen-rhythm-results');
        
        this.scoreValEl = document.getElementById('rhythm-score-val');
        this.comboValEl = document.getElementById('rhythm-combo-val');
        this.resultDescEl = document.getElementById('rhythm-result-desc');
        this.badgeContainer = document.getElementById('rhythm-badges');
        
        // Configuración y variables de estado del juego
        this.isPlaying = false;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.notes = [];
        this.particles = [];
        
        this.gameDuration = 40000; // 40 segundos de juego
        this.startTime = 0;
        this.noteSpeed = 4.2; // Velocidad de caída
        this.spawnInterval = 750; // ms entre notas
        this.lastSpawnTime = 0;
        this.lanesCount = 4;
        
        // Asignación de Teclas
        this.laneKeys = ['d', 'f', 'j', 'k'];
        this.lanePressed = [false, false, false, false];
        
        // Audio nodes
        this.audioCtx = null;
        this.drumBeatInterval = null;
        
        this.initEvents();
    }

    initEvents() {
        // Selector de juegos (Tabulación)
        const tabs = document.querySelectorAll('.game-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Detener juegos actuales si se cambia de pestaña
                this.stopGame();
                
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mostrar la pantalla correspondiente
                const gameType = tab.getAttribute('data-game');
                if (gameType === 'rhythm') {
                    document.getElementById('screen-rhythm-lobby').classList.add('active');
                    document.getElementById('screen-rhythm-play').classList.remove('active');
                    document.getElementById('screen-rhythm-results').classList.remove('active');
                    
                    document.getElementById('screen-quiz-lobby').classList.remove('active');
                    document.getElementById('screen-quiz-play').classList.remove('active');
                    document.getElementById('screen-quiz-results').classList.remove('active');
                } else {
                    document.getElementById('screen-rhythm-lobby').classList.remove('active');
                    document.getElementById('screen-rhythm-play').classList.remove('active');
                    document.getElementById('screen-rhythm-results').classList.remove('active');
                    
                    document.getElementById('screen-quiz-lobby').classList.add('active');
                    document.getElementById('screen-quiz-play').classList.remove('active');
                    document.getElementById('screen-quiz-results').classList.remove('active');
                    if (window.quizGame) window.quizGame.resetLobby();
                }
            });
        });

        // Botones de control del juego
        document.getElementById('btn-start-rhythm').addEventListener('click', () => this.startGame());
        document.getElementById('btn-restart-rhythm').addEventListener('click', () => this.startGame());
        document.getElementById('btn-lobby-rhythm').addEventListener('click', () => this.showLobby());

        // Eventos del teclado
        window.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            const keyIndex = this.laneKeys.indexOf(e.key.toLowerCase());
            if (keyIndex !== -1 && !this.lanePressed[keyIndex]) {
                this.lanePressed[keyIndex] = true;
                this.handleKeyPress(keyIndex);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (!this.isPlaying) return;
            const keyIndex = this.laneKeys.indexOf(e.key.toLowerCase());
            if (keyIndex !== -1) {
                this.lanePressed[keyIndex] = false;
            }
        });
    }

    showLobby() {
        this.resultsScreen.classList.remove('active');
        this.lobbyScreen.classList.add('active');
    }

    startGame() {
        // Inicializar Audio Context
        this.initAudio();

        // Limpiar estados
        this.isPlaying = true;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.notes = [];
        this.particles = [];
        this.startTime = Date.now();
        this.lastSpawnTime = Date.now();

        // UI
        this.lobbyScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        this.playScreen.classList.add('active');

        // Resetear visuales
        this.scoreValEl.textContent = '0';
        this.comboValEl.textContent = '0';

        // Iniciar sintetizador de batería metal de fondo
        this.startDrumLoop();

        // Iniciar ciclo de juego
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    stopGame() {
        this.isPlaying = false;
        clearInterval(this.drumBeatInterval);
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    // Crea un sintetizador de batería rudimentario que simula un beat pesado de metal
    startDrumLoop() {
        if (this.drumBeatInterval) clearInterval(this.drumBeatInterval);
        
        let beatCount = 0;
        const tempo = 220; // 136 BPM aprox.

        this.drumBeatInterval = setInterval(() => {
            if (!this.isPlaying) return;

            // Kick Drum (Bombo) en tiempos 0 y 2
            if (beatCount % 2 === 0 || beatCount % 4 === 1) {
                this.playKick();
            }

            // Snare (Caja / Tarola) en tiempos 2 y 4
            if (beatCount % 4 === 2) {
                this.playSnare();
            }

            // Platillo Hi-Hat en cada corchea
            this.playHiHat();

            // Ocasionalmente agregar platillo crash pesado
            if (beatCount % 16 === 0) {
                this.playCrash();
            }

            beatCount++;
        }, tempo);
    }

    playKick() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.frequency.setValueAtTime(120, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.16);
    }

    playSnare() {
        // Generar ruido blanco para la caja
        const bufferSize = this.audioCtx.sampleRate * 0.15;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.audioCtx.createBufferSource();
        noiseNode.buffer = buffer;

        const noiseFilter = this.audioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioCtx.destination);

        // Mezclar con un oscilador de frecuencia media para dar cuerpo
        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();
        osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
        oscGain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

        osc.connect(oscGain);
        oscGain.connect(this.audioCtx.destination);

        noiseNode.start();
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
    }

    playHiHat() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(10000, this.audioCtx.currentTime);
        
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 8000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
    }

    playCrash() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(12000, this.audioCtx.currentTime);

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.75);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.8);
    }

    handleKeyPress(laneIndex) {
        // Encontrar la nota más baja en este carril
        let hitRegistered = false;
        const targetY = 350; // Posición de la línea de impacto
        const hitWindow = 45; // Ventana de píxeles aceptable

        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            if (note.lane === laneIndex) {
                const distance = Math.abs(note.y - targetY);
                if (distance < hitWindow) {
                    hitRegistered = true;
                    this.notes.splice(i, 1); // Remover nota
                    
                    // Calcular puntuación basada en la precisión
                    let scoreAdded = 50;
                    let hitQuality = 'BUENO';
                    
                    if (distance < 18) {
                        scoreAdded = 100;
                        hitQuality = '¡PERFECTO!';
                        window.playChime(880, 'sine', 0.1, 0.15); // Sonido brillante
                    } else {
                        window.playChime(660, 'sine', 0.07, 0.15);
                    }

                    this.score += scoreAdded;
                    this.combo += 1;
                    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

                    // Crear partículas de acierto
                    this.spawnParticles(laneIndex, targetY, hitQuality === '¡PERFECTO!' ? '#ffd700' : '#ff1e27');
                    break;
                }
            }
        }

        if (!hitRegistered) {
            // Falla por pulsar cuando no hay notas
            this.triggerMiss();
        }

        // Animación de botón presionado (parpadeo visual en canvas)
        setTimeout(() => {
            // Auto liberar tras un tiempo si se mantiene presionada
        }, 100);
    }

    triggerMiss() {
        this.combo = 0;
        window.playChime(150, 'sawtooth', 0.08, 0.2); // Sonido de zumbido apagado
    }

    spawnParticles(lane, y, color) {
        const laneWidth = this.canvas.width / this.lanesCount;
        const x = lane * laneWidth + laneWidth / 2;
        
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                alpha: 1,
                decay: Math.random() * 0.04 + 0.02,
                color: color
            });
        }
    }

    spawnNote() {
        const randomLane = Math.floor(Math.random() * this.lanesCount);
        this.notes.push({
            lane: randomLane,
            y: 0
        });
    }

    gameLoop(time) {
        if (!this.isPlaying) return;

        // Comprobar si el tiempo de juego ha expirado
        const elapsed = Date.now() - this.startTime;
        if (elapsed >= this.gameDuration) {
            this.endGame();
            return;
        }

        this.update();
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update() {
        const now = Date.now();
        // Generar notas a intervalos regulados
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnNote();
            this.lastSpawnTime = now;
        }

        // Actualizar posición de las notas
        const targetY = 350;
        const missLimit = 385;

        for (let i = this.notes.length - 1; i >= 0; i--) {
            this.notes[i].y += this.noteSpeed;
            
            // Si la nota sobrepasa el límite de impacto sin tocarse
            if (this.notes[i].y > missLimit) {
                this.notes.splice(i, 1);
                this.triggerMiss();
            }
        }

        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Actualizar UI
        this.scoreValEl.textContent = this.score;
        this.comboValEl.textContent = this.combo;
    }

    draw() {
        // Limpiar Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const laneWidth = this.canvas.width / this.lanesCount;
        const targetY = 350;

        // Dibujar Carriles
        for (let i = 0; i < this.lanesCount; i++) {
            const x = i * laneWidth;
            
            // Relleno de fondo del carril si está presionado
            if (this.lanePressed[i]) {
                const grad = this.ctx.createLinearGradient(x, 0, x, this.canvas.height);
                grad.addColorStop(0, 'rgba(255, 30, 39, 0)');
                grad.addColorStop(1, 'rgba(255, 30, 39, 0.08)');
                this.ctx.fillStyle = grad;
                this.ctx.fillRect(x, 0, laneWidth, this.canvas.height);
            }

            // Líneas divisorias de carriles
            this.ctx.strokeStyle = 'rgba(255, 30, 39, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();

            // Dibujar botón de impacto en cada carril
            const btnX = x + laneWidth / 2;
            this.ctx.beginPath();
            this.ctx.arc(btnX, targetY, 20, 0, Math.PI * 2);
            
            if (this.lanePressed[i]) {
                this.ctx.fillStyle = '#ff1e27';
                this.ctx.strokeStyle = '#fff';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#ff1e27';
            } else {
                this.ctx.fillStyle = '#111';
                this.ctx.strokeStyle = 'rgba(255, 30, 39, 0.5)';
                this.ctx.shadowBlur = 0;
            }
            this.ctx.lineWidth = 3;
            this.ctx.fill();
            this.ctx.stroke();

            // Etiquetas de Teclas (D, F, J, K)
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.laneKeys[i].toUpperCase(), btnX, targetY);
        }

        // Línea horizontal de impacto
        this.ctx.strokeStyle = 'rgba(255, 30, 39, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, targetY);
        this.ctx.lineTo(this.canvas.width, targetY);
        this.ctx.stroke();

        // Dibujar Notas (Símbolos del Dios Zorro)
        this.notes.forEach(note => {
            const noteX = note.lane * laneWidth + laneWidth / 2;
            
            // Cuerpo de la nota (Zorro simplificado)
            this.ctx.fillStyle = '#ff1e27';
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#ff1e27';

            this.ctx.beginPath();
            // Forma de punta (máscara de zorro)
            this.ctx.moveTo(noteX, note.y - 12);
            this.ctx.lineTo(noteX + 12, note.y - 2);
            this.ctx.lineTo(noteX + 8, note.y + 12);
            this.ctx.lineTo(noteX, note.y + 4);
            this.ctx.lineTo(noteX - 8, note.y + 12);
            this.ctx.lineTo(noteX - 12, note.y - 2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            // Pequeños ojos dorados
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(noteX - 4, note.y, 2, 0, Math.PI * 2);
            this.ctx.arc(noteX + 4, note.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Dibujar Partículas
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.drumBeatInterval);

        // UI de resultados
        this.playScreen.classList.remove('active');
        this.resultsScreen.classList.add('active');

        // Determinar Rango y Logros
        let rank = 'C';
        let badgeId = '';
        let badgeName = '';
        let badgeIcon = '';

        if (this.score >= 5000) {
            rank = 'S';
            badgeId = 'badge_metal_god';
            badgeName = 'Metal God';
            badgeIcon = '🦊';
        } else if (this.score >= 3000) {
            rank = 'A';
            badgeId = 'badge_kitsune_warrior';
            badgeName = 'Kitsune Warrior';
            badgeIcon = '🤘';
        } else if (this.score >= 1200) {
            rank = 'B';
            badgeId = 'badge_babybones';
            badgeName = 'Babybones';
            badgeIcon = '💀';
        }

        // Descripciones de resultado
        let descHtml = `¡Concierto finalizado! Lograste <strong>${this.score} puntos</strong> con un combo máximo de <strong>${this.maxCombo}x</strong> (Rango ${rank}).<br>`;
        
        if (badgeId) {
            descHtml += `<span style="color: var(--gold); font-weight: bold;">¡Has complacido al Dios Zorro e hiciste pogo épico! Desbloqueaste la medalla: "${badgeName}".</span>`;
            
            // Guardar logro en localStorage
            const unlockedBadges = JSON.parse(localStorage.getItem('babymetal_badges')) || {};
            unlockedBadges[badgeId] = true;
            localStorage.setItem('babymetal_badges', JSON.stringify(unlockedBadges));
        } else {
            descHtml += '¡El Dios Zorro exige más energía para la resistencia! Sigue practicando tu ritmo.';
        }
        
        this.resultDescEl.innerHTML = descHtml;
        this.renderBadges();
        
        // Sonido final de aplausos / platillo épico
        this.playCrash();
        setTimeout(() => this.playCrash(), 200);
        setTimeout(() => this.playCrash(), 400);
    }

    renderBadges() {
        this.badgeContainer.innerHTML = '';
        const unlockedBadges = JSON.parse(localStorage.getItem('babymetal_badges')) || {};

        const allBadges = [
            { id: 'badge_babybones', name: 'Babybones', icon: '💀' },
            { id: 'badge_kitsune_warrior', name: 'Kitsune Warrior', icon: '🤘' },
            { id: 'badge_metal_god', name: 'Metal God', icon: '🦊' }
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
window.rhythmGame = new KitsuneBeatGame();
