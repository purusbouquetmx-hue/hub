document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Hub cargado correctamente');
    
    // ===== ELEMENTOS DEL DOM =====
    const splashScreen = document.getElementById('splashScreen');
    const btnEnter = document.getElementById('btnEnter');
    const hubContainer = document.getElementById('hubContainer');
    const bgMusic = document.getElementById('bgMusic');
    const hoverSound = document.getElementById('hoverSound');
    const muteBtn = document.getElementById('muteBtn');
    const muteIcon = document.getElementById('muteIcon');
    const particlesContainer = document.getElementById('particles');
    const splashParticles = document.getElementById('splashParticles');
    const homeBtn = document.getElementById('homeBtn');

    let isMuted = false;
    let audioUnlocked = false;

    // Volúmenes para el efecto "Audio Ducking"
    const VOLUME_AMBIENTAL = 0.25;       // Volumen normal del fondo
    const VOLUME_AMBIENTAL_BAJO = 0.03;  // Volumen casi mudo al pasar el mouse
    const VOLUME_INTERACTIVO = 0.8;      // Volumen fuerte y nítido para los chimes

    // ===== VERIFICAR AUDIOS =====
    if (bgMusic) {
        bgMusic.addEventListener('error', (e) => console.error('❌ Error audio ambiental:', e));
        bgMusic.addEventListener('canplaythrough', () => console.log('✅ Audio ambiental listo'));
    }

    // ===== CREAR PARTÍCULAS =====
    function createParticles(container, count = 30) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.width = (Math.random() * 3 + 2) + 'px';
            particle.style.height = particle.style.width;
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            container.appendChild(particle);
        }
    }

    if (splashParticles) createParticles(splashParticles, 40);
    if (particlesContainer) createParticles(particlesContainer, 30);

    // ===== 1. BOTÓN "INICIAR EXPERIENCIA" =====
    if (btnEnter) {
        btnEnter.addEventListener('click', async () => {
            console.log('🎬 Iniciando experiencia...');
            splashScreen.classList.add('hidden');
            
            setTimeout(() => {
                hubContainer.classList.add('visible');
            }, 500);

            try {
                if (bgMusic) {
                    bgMusic.volume = VOLUME_AMBIENTAL;
                    await bgMusic.play();
                    audioUnlocked = true;
                    console.log('🎵 Música ambiental iniciada');
                }
            } catch (e) {
                console.error('⚠️ Autoplay bloqueado por el navegador:', e);
            }
        });
    }

    // ===== 2. TARJETAS: AUDIO DUCKING + PARALLAX SEGURO =====
    const cards = document.querySelectorAll('.hub-card');
    
    cards.forEach(card => {
        const cardBg = card.querySelector('.card-bg');
        
        // A) Audio Ducking al entrar
        card.addEventListener('mouseenter', () => {
            if (!isMuted && audioUnlocked) {
                if (bgMusic) bgMusic.volume = VOLUME_AMBIENTAL_BAJO;
                
                const soundFile = card.getAttribute('data-sound');
                if (soundFile && hoverSound) {
                    hoverSound.src = soundFile;
                    hoverSound.volume = VOLUME_INTERACTIVO;
                    hoverSound.currentTime = 0;
                    hoverSound.play().catch(e => {});
                }
            }
        });

        // B) Restaurar audio y fondo al salir
        card.addEventListener('mouseleave', () => {
            if (!isMuted && bgMusic) {
                bgMusic.volume = VOLUME_AMBIENTAL;
            }
            if (cardBg) {
                cardBg.style.transform = '';
            }
        });

        // C) Efecto Parallax SUTIL (SOLO en el fondo, NO bloquea el clic del enlace <a>)
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            
            if (cardBg) {
                cardBg.style.transform = `scale(1.1) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });
    });

    // ===== 3. CONTROL DE SILENCIO =====
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                if (bgMusic) bgMusic.pause();
                if (hoverSound) hoverSound.muted = true;
                muteIcon.textContent = '🔇';
                muteBtn.style.opacity = '0.6';
            } else {
                if (bgMusic) bgMusic.play().catch(e => {});
                if (hoverSound) hoverSound.muted = false;
                muteIcon.textContent = '🔊';
                muteBtn.style.opacity = '1';
                if (bgMusic) bgMusic.volume = VOLUME_AMBIENTAL; 
            }
        });
    }

    // ===== 4. BOTÓN DE REGRESO A INICIO (BLINDADO) =====
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Previene cualquier comportamiento extraño del navegador
            console.log('🏠 Botón de inicio clickeado - Recargando página...');
            window.location.reload();
        });
    }
});