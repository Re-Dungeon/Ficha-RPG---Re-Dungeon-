/**
 * SISTEMA DE FUNDO CÓSMICO PROCEDURAL
 * Integração com o mapa astral - Canvas 2D otimizado
 */

// ============================================================================
// CLASSES AUXILIARES
// ============================================================================
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    range(min, max) {
        return min + this.next() * (max - min);
    }

    choice(arr) {
        return arr[Math.floor(this.next() * arr.length)];
    }
}

class CosmicStar {
    constructor(x, y, size, depth, brightness = 1, colors) {
        this.x = x;
        this.y = y;
        this.baseSize = size;
        this.size = size;
        this.depth = depth;
        this.brightness = brightness;
        this.baseColor = colors[Math.floor(Math.random() * colors.length)];
        this.twinkle = Math.random();
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.initialTwinkle = this.twinkle;
    }

    update(time) {
        this.twinkle = this.initialTwinkle + Math.sin(time * this.twinkleSpeed + this.initialTwinkle) * 0.5;
        this.brightness = 0.3 + 0.7 * (this.twinkle + 1) / 2;
        this.size = this.baseSize * this.brightness;
    }

    draw(ctx) {
        const opacity = this.brightness * (0.3 + this.depth * 0.7);
        const rgb = this.hexToRgb(this.baseColor);

        ctx.fillStyle = `rgba(${rgb}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.baseSize > 1.5) {
            const glowSize = this.size * 3;
            const glowOpacity = opacity * 0.3;
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
            gradient.addColorStop(0, `rgba(${rgb}, ${glowOpacity})`);
            gradient.addColorStop(1, `rgba(${rgb}, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '255,255,255';
    }
}

class CosmicParticle {
    constructor(x, y, vx, vy, life = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.005;
        this.vy *= 0.999;
    }

    draw(ctx) {
        const opacity = this.life / this.maxLife;
        ctx.fillStyle = `rgba(106, 201, 255, ${opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * opacity, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive() {
        return this.life > 0;
    }
}

class CosmicConstellationNode {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.baseRadius = radius;
        this.radius = radius;
        this.angle = Math.random() * Math.PI * 2;
        this.angularVelocity = (Math.random() - 0.5) * 0.0001;
        this.brightness = Math.random() * 0.5 + 0.5;
        this.pulsing = Math.random() * Math.PI * 2;
    }

    update(time) {
        this.pulsing += 0.002;
        this.brightness = 0.5 + Math.sin(this.pulsing) * 0.5;
        this.angle += this.angularVelocity;
    }

    draw(ctx) {
        const size = this.baseRadius * (0.5 + this.brightness * 0.5);
        ctx.fillStyle = `rgba(106, 201, 255, ${this.brightness * 0.7})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();

        const glowSize = size * 2.5;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
        gradient.addColorStop(0, `rgba(106, 201, 255, ${this.brightness * 0.3})`);
        gradient.addColorStop(1, `rgba(106, 201, 255, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================
class AstralCosmicBackground {
    constructor(autoInit = true) {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.particles = [];
        this.constellationNodes = [];
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.time = 0;
        this.animationId = null;

        this.config = {
            STARS_NEAR: 600,      // Aumentado de 300 para 600 (mais estrelas visíveis)
            STARS_MID: 1200,      // Aumentado de 800 para 1200
            STARS_FAR: 3500,      // Aumentado de 2500 para 3500
            PARTICLES: 150,
            CONSTELLATION_NODES: 50,
            CIRCLE_COUNT: 12,
            STAR_COLORS: ['#ffffff', '#e0e8ff', '#c9d9ff', '#a8c5ff', '#87b1ff', '#66c9ff', '#4acfff'],
            NEBULA_COLORS: ['#4a9eff', '#2a6eff', '#1a4eff', '#0a2eff'],
            GLOW_INTENSITY: 2,
            ANIMATION_SPEED: 0.0005,
        };

        if (autoInit) {
            this.init();
        }
    }

    init() {
        console.log('🌌 Inicializando AstralCosmicBackground...');
        
        // Verificar se astral-viewport já existe, senão esperar
        let attempts = 0;
        const maxAttempts = 100; // ~10 segundos (100 * 100ms)
        
        const checkViewport = () => {
            try {
                const viewport = document.getElementById('astral-viewport');
                if (viewport) {
                    console.log('✅ astral-viewport encontrado, criando canvas...');
                    this.createCanvas();
                    this.setupEventListeners();
                    this.generateStars();
                    this.generateConstellations();
                    console.log(`✨ Geradas ${this.stars.length} estrelas e ${this.constellationNodes.length} nós de constelação`);
                    console.log(`🎬 Iniciando animação...`);
                    this.animate();
                } else {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`⏳ astral-viewport ainda não existe, tentativa ${attempts}/${maxAttempts}...`);
                        // Retry após 100ms se viewport ainda não existe
                        setTimeout(checkViewport, 100);
                    } else {
                        console.error('❌ astral-viewport nunca foi encontrado após tentativas');
                    }
                }
            } catch (error) {
                console.error('❌ Erro durante inicialização:', error);
            }
        };
        
        checkViewport();
    }

    createCanvas() {
        try {
            const wrapper = document.createElement('div');
            wrapper.className = 'astral-cosmic-background';
            // ✅ CRÍTICO: Garantir visibilidade imediata
            wrapper.style.visibility = 'visible';
            wrapper.style.opacity = '1';
            wrapper.style.display = 'block';

            this.canvas = document.createElement('canvas');
            this.canvas.className = 'astral-cosmic-canvas';
            this.canvas.id = 'astral-cosmic-canvas-element';
            // ✅ CRÍTICO: Garantir visibilidade do canvas
            this.canvas.style.visibility = 'visible';
            this.canvas.style.opacity = '1';
            this.canvas.style.display = 'block';
            
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

            if (!this.ctx) {
                throw new Error('Não foi possível obter contexto 2D do canvas');
            }

            this.resizeCanvas();
            wrapper.appendChild(this.canvas);

            const overlay = document.createElement('div');
            overlay.className = 'astral-cosmic-overlay';
            wrapper.appendChild(overlay);

            const vignette = document.createElement('div');
            vignette.className = 'astral-vignette';
            wrapper.appendChild(vignette);

            // Inserir no viewport antes do mapa astral
            const astralViewport = document.getElementById('astral-viewport');
            
            if (astralViewport) {
                // Inserir ANTES de todos os elementos para ficar atrás
                astralViewport.style.position = 'relative';
                astralViewport.style.backgroundColor = 'transparent';
                astralViewport.insertBefore(wrapper, astralViewport.firstChild);
                console.log('✨ Fundo cósmico inserido no astral-viewport');
                console.log(`📐 Viewport tamanho: ${astralViewport.clientWidth}x${astralViewport.clientHeight}`);
            } else {
                console.warn('⚠️ astral-viewport não encontrado');
                const astralContent = document.querySelector('.veias-astrais-main') || 
                                     document.querySelector('.astral-content') || 
                                     document.body;
                astralContent.insertBefore(wrapper, astralContent.firstChild);
            }

            window.addEventListener('resize', () => this.resizeCanvas());
            
            // ⚠️ CRÍTICO: Forçar reflow/repaint para resolver problema de visibilidade
            // Quando a modal está hidden, o canvas não renderiza até que DevTools seja aberto
            // Esta seção força a recalculação de layout
            setTimeout(() => {
                console.log('🔄 Forçando reflow/repaint do canvas...');
                
                // ✅ GARANTIR VISIBILIDADE
                wrapper.style.visibility = 'visible';
                wrapper.style.opacity = '1';
                wrapper.style.display = 'block';
                this.canvas.style.visibility = 'visible';
                this.canvas.style.opacity = '1';
                this.canvas.style.display = 'block';
                
                // Force reflow lendo offsetHeight
                const _ = wrapper.offsetHeight;
                const __ = this.canvas.offsetHeight;
                
                // Trigger reflow adicionando/removendo classe
                wrapper.classList.add('force-repaint');
                wrapper.offsetHeight; // Force reflow
                wrapper.classList.remove('force-repaint');
                
                console.log('🎨 Forçando render inicial do canvas');
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                console.log('✅ Canvas renderizado com sucesso');
            }, 50);
        } catch (error) {
            console.error('❌ Erro ao criar canvas:', error);
        }
    }

    resizeCanvas() {
        try {
            const viewport = document.getElementById('astral-viewport') || this.canvas?.parentElement;
            const width = viewport ? viewport.clientWidth : window.innerWidth;
            const height = viewport ? viewport.clientHeight : window.innerHeight;
            
            if (this.canvas && this.ctx) {
                this.canvas.width = width * window.devicePixelRatio;
                this.canvas.height = height * window.devicePixelRatio;
                this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                
                if (this.canvas.parentElement) {
                    console.log(`📐 Canvas redimensionado: ${width}x${height} (DPR: ${window.devicePixelRatio})`);
                    console.log(`📐 Canvas visível: ${this.canvas.offsetWidth}x${this.canvas.offsetHeight}`);
                } else {
                    console.warn('⚠️ Canvas ainda não inserido no DOM');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao redimensionar canvas:', error);
        }
    }

    generateStars() {
        this.stars = [];
        
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;

        console.log(`📐 Gerando estrelas para canvas de ${width}x${height}`);

        // Estrelas distantes
        for (let i = 0; i < this.config.STARS_FAR; i++) {
            const rng = new SeededRandom(i * 12345 + Math.random() * 99999);
            const x = Math.random() * width;
            const y = Math.random() * height;
            this.stars.push(new CosmicStar(
                x,
                y,
                rng.range(0.2, 0.5),
                rng.range(0.4, 0.6),
                rng.range(0.4, 0.8),
                this.config.STAR_COLORS
            ));
        }

        // Estrelas médias
        for (let i = 0; i < this.config.STARS_MID; i++) {
            const rng = new SeededRandom((i + this.config.STARS_FAR) * 12345 + Math.random() * 99999);
            const x = Math.random() * width;
            const y = Math.random() * height;
            this.stars.push(new CosmicStar(
                x,
                y,
                rng.range(0.6, 1.2),
                rng.range(0.6, 0.85),
                rng.range(0.7, 1),
                this.config.STAR_COLORS
            ));
        }

        // Estrelas próximas
        for (let i = 0; i < this.config.STARS_NEAR; i++) {
            const rng = new SeededRandom((i + this.config.STARS_FAR + this.config.STARS_MID) * 12345 + Math.random() * 99999);
            const x = Math.random() * width;
            const y = Math.random() * height;
            this.stars.push(new CosmicStar(
                x,
                y,
                rng.range(1.5, 3.5),
                rng.range(0.85, 1),
                rng.range(0.8, 1),
                this.config.STAR_COLORS
            ));
        }
        
        console.log(`✨ ${this.stars.length} estrelas geradas com sucesso`);
    }

    generateConstellations() {
        this.constellationNodes = [];
        const viewport = document.getElementById('astral-viewport') || this.canvas?.parentElement;
        const centerX = viewport ? viewport.clientWidth / 2 : window.innerWidth / 2;
        const centerY = viewport ? viewport.clientHeight / 2 : window.innerHeight / 2;

        for (let circle = 0; circle < 3; circle++) {
            const radius = 150 + circle * 80;
            const nodeCount = 6 + circle * 4;

            for (let i = 0; i < nodeCount; i++) {
                const angle = (i / nodeCount) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                this.constellationNodes.push(new CosmicConstellationNode(x, y, 2 + circle * 0.5));
            }
        }
    }

    drawNebulas(width, height) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Nebulosas radiais
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 300;
            const nebX = centerX + Math.cos(angle) * distance;
            const nebY = centerY + Math.sin(angle) * distance;

            const gradient = this.ctx.createRadialGradient(nebX, nebY, 0, nebX, nebY, 400);
            gradient.addColorStop(0, `rgba(74, 158, 255, 0.02)`);
            gradient.addColorStop(0.5, `rgba(74, 158, 255, 0.005)`);
            gradient.addColorStop(1, `rgba(74, 158, 255, 0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(nebX, nebY, 400, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Nebulosa central
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 500);
        gradient.addColorStop(0, `rgba(42, 110, 255, 0.01)`);
        gradient.addColorStop(0.5, `rgba(42, 110, 255, 0.005)`);
        gradient.addColorStop(1, `rgba(42, 110, 255, 0)`);
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 500, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawAstrolabe(time, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Apenas o núcleo pulsante central (simples e limpo)
        const coreRadius = 3 + Math.sin(time * 0.0004) * 1;
        const coreOpacity = 0.7 + Math.sin(time * 0.0004) * 0.3;

        const coreGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 3);
        coreGradient.addColorStop(0, `rgba(106, 201, 255, ${coreOpacity * 0.6})`);
        coreGradient.addColorStop(1, `rgba(106, 201, 255, 0)`);
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, coreRadius * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Ponto central brilhante
        this.ctx.fillStyle = `rgba(255, 255, 255, ${coreOpacity})`;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawConstellationLines() {
        const viewport = document.getElementById('astral-viewport') || this.canvas?.parentElement;
        const centerX = viewport ? viewport.clientWidth / 2 : window.innerWidth / 2;
        const centerY = viewport ? viewport.clientHeight / 2 : window.innerHeight / 2;

        for (let i = 0; i < this.constellationNodes.length; i++) {
            for (let j = i + 1; j < this.constellationNodes.length; j++) {
                const node1 = this.constellationNodes[i];
                const node2 = this.constellationNodes[j];
                const dx = node2.x - node1.x;
                const dy = node2.y - node1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200 && distance > 50) {
                    const opacity = (1 - distance / 200) * 0.3 * (node1.brightness + node2.brightness) / 2;
                    this.ctx.strokeStyle = `rgba(106, 201, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(node1.x, node1.y);
                    this.ctx.lineTo(node2.x, node2.y);
                    this.ctx.stroke();
                }
            }

            const node1 = this.constellationNodes[i];
            const dx = centerX - node1.x;
            const dy = centerY - node1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 500) {
                const opacity = (1 - distance / 500) * 0.15 * node1.brightness;
                this.ctx.strokeStyle = `rgba(106, 201, 255, ${opacity})`;
                this.ctx.lineWidth = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(node1.x, node1.y);
                this.ctx.lineTo(centerX, centerY);
                this.ctx.stroke();
            }
        }
    }

    animate = () => {
        // ✅ CRÍTICO: Verificar se canvas e context existem
        if (!this.canvas || !this.ctx) {
            console.warn('⚠️ Canvas ou context não disponível, reiniciando animação...');
            this.animationId = requestAnimationFrame(this.animate);
            return;
        }

        this.time += 1;
        
        if (this.time === 1) {
            console.log('🎬 Primeira frame de animação!');
            // ✅ Garantir que o canvas está visível
            if (this.canvas.parentElement) {
                this.canvas.parentElement.style.visibility = 'visible';
                this.canvas.parentElement.style.opacity = '1';
                this.canvas.parentElement.style.display = 'block';
            }
            this.canvas.style.visibility = 'visible';
            this.canvas.style.opacity = '1';
            this.canvas.style.display = 'block';
        }
        
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;

        // Background
        const bgGradient = this.ctx.createLinearGradient(0, 0, width, height);
        bgGradient.addColorStop(0, '#000000');
        bgGradient.addColorStop(0.25, '#0a0f1a');
        bgGradient.addColorStop(0.5, '#0d1829');
        bgGradient.addColorStop(0.75, '#0a0f1a');
        bgGradient.addColorStop(1, '#000000');

        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, width, height);

        // Desenhar elementos
        this.drawNebulas(width, height);

        for (let star of this.stars) {
            star.update(this.time);
            star.draw(this.ctx);
        }

        this.drawAstrolabe(this.time, width, height);

        for (let node of this.constellationNodes) {
            node.update(this.time);
        }
        this.drawConstellationLines();
        for (let node of this.constellationNodes) {
            node.draw(this.ctx);
        }

        // Partículas
        if (Math.random() < 0.02) {
            const px = this.mouseX + (Math.random() - 0.5) * 100;
            const py = this.mouseY + (Math.random() - 0.5) * 100;
            const vx = (Math.random() - 0.5) * 0.3;
            const vy = (Math.random() - 0.5) * 0.3 - 0.2;
            this.particles.push(new CosmicParticle(px, py, vx, vy, Math.random() * 0.5 + 0.3));
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (!this.particles[i].isAlive()) {
                this.particles.splice(i, 1);
            } else {
                this.particles[i].draw(this.ctx);
            }
        }

        // Respiração luminosa
        const breathe = Math.sin(this.time * 0.00005) * 0.02;
        this.ctx.fillStyle = `rgba(106, 201, 255, ${breathe * 0.1})`;
        this.ctx.fillRect(0, 0, width, height);

        // ✅ CRÍTICO: Usar bind para garantir que 'this' seja preservado
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        // ✅ PROTEÇÃO: Monitorar se o canvas fica escondido
        const checkCanvasVisibility = () => {
            if (this.canvas && this.canvas.parentElement) {
                const wrapper = this.canvas.parentElement;
                
                // Forçar propriedades de visibilidade
                if (wrapper.style.visibility !== 'visible' || wrapper.style.opacity !== '1' || wrapper.style.display === 'none') {
                    console.warn('⚠️ Canvas wrapper estava escondido, restaurando...');
                    wrapper.style.visibility = 'visible';
                    wrapper.style.opacity = '1';
                    wrapper.style.display = 'block';
                }
                
                if (this.canvas.style.visibility !== 'visible' || this.canvas.style.opacity !== '1' || this.canvas.style.display === 'none') {
                    console.warn('⚠️ Canvas estava escondido, restaurando...');
                    this.canvas.style.visibility = 'visible';
                    this.canvas.style.opacity = '1';
                    this.canvas.style.display = 'block';
                }
            }
        };

        // Checar a cada 5 segundos
        setInterval(checkCanvasVisibility, 5000);

        document.addEventListener('mousemove', (e) => {
            const viewport = document.getElementById('astral-viewport');
            if (viewport) {
                const rect = viewport.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            } else {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            }

            const offsetX = (this.mouseX - (this.canvas?.clientWidth || 0) / 2) * 0.02;
            const offsetY = (this.mouseY - (this.canvas?.clientHeight || 0) / 2) * 0.02;

            if (this.canvas && this.canvas.parentElement) {
                this.canvas.parentElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            }
        });

        // ⚠️ CRÍTICO: Observar mudanças na visibilidade da modal
        const modal = document.getElementById('veias-astrais-modal');
        if (modal) {
            const observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    if (mutation.attributeName === 'class') {
                        const isVisible = !modal.classList.contains('hidden');
                        if (isVisible) {
                            console.log('🎨 Modal ficou visível! Forçando inicialização do canvas...');
                            
                            // ✅ CRÍTICO: Se a animação ainda não começou, começar agora
                            if (!this.animationId) {
                                console.log('▶️ Iniciando animação do canvas (primeira abertura)');
                                this.animate();
                            }
                            
                            // Force reflow/repaint
                            if (this.canvas && this.canvas.parentElement) {
                                const _ = this.canvas.parentElement.offsetHeight;
                                this.canvas.parentElement.classList.add('force-repaint');
                                this.canvas.parentElement.offsetHeight; // Force reflow
                                this.canvas.parentElement.classList.remove('force-repaint');
                                
                                // ✅ Garantir visibilidade
                                this.canvas.parentElement.style.visibility = 'visible';
                                this.canvas.parentElement.style.opacity = '1';
                                this.canvas.parentElement.style.display = 'block';
                                this.canvas.style.visibility = 'visible';
                                this.canvas.style.opacity = '1';
                                this.canvas.style.display = 'block';
                                
                                console.log('✅ Canvas renderizado e visível após mostrar modal');
                            }
                        }
                    }
                }
            });
            
            observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        }

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.generateStars();
            this.generateConstellations();
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.remove();
        }
    }
}

// ============================================================================
// INICIALIZAÇÃO IMEDIATA
// ============================================================================
console.log('🌌 Script astral-cosmic-background.js carregado');

// Função para criar o canvas ANTES de qualquer coisa
function initializeCosmicBackground() {
    console.log('🚀 Iniciando background cósmico...');
    
    // ✅ CRÍTICO: Criar instance IMEDIATAMENTE, mesmo se modal não estiver visível
    // A lógica de espera pela modal está dentro da classe
    if (!window.astralCosmicBackground) {
        window.astralCosmicBackground = new AstralCosmicBackground(true);
        console.log('✅ AstralCosmicBackground instância criada');
    }
}

// ✅ NOVO: Também vincular ao evento de abertura da modal
// Isso garante que se o script carregar ANTES da modal ser criada,
// o canvas será inicializado assim que a modal abrir
function setupModalListener() {
    const modal = document.getElementById('veias-astrais-modal');
    if (modal) {
        // Observer para detectar quando a modal fica visível
        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isHidden = modal.classList.contains('hidden');
                    console.log(`📢 Modal class mudou - hidden: ${isHidden}`);
                    
                    if (!isHidden && window.astralCosmicBackground) {
                        console.log('🎨 Modal ficou visível, forçando inicialização do canvas...');
                        // Forçar render imediato
                        window.astralCosmicBackground.resizeCanvas();
                        window.astralCosmicBackground.generateStars();
                        window.astralCosmicBackground.generateConstellations();
                        
                        if (!window.astralCosmicBackground.animationId) {
                            console.log('▶️ Iniciando animação do canvas');
                            window.astralCosmicBackground.animate();
                        }
                    }
                }
            }
        });
        
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        console.log('✅ Modal listener configurado');
    }
}

// Iniciar imediatamente
if (document.readyState === 'loading') {
    console.log('⏳ DOM ainda carregando, aguardando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        initializeCosmicBackground();
        setupModalListener();
    });
} else {
    console.log('✅ DOM já carregado, inicializando imediatamente...');
    initializeCosmicBackground();
    setupModalListener();
}
