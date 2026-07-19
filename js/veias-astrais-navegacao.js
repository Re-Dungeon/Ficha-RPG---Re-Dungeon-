/**
 * SISTEMA DE VEIAS ASTRAIS - NAVEGAÇÃO E INTERAÇÃO
 * Drag, zoom, pan e gerenciamento de mapa expansivo
 * Performance otimizada com RAF e transform
 */

class VeiasAstraisNavigation {
    constructor(system) {
        this.system = system;
        this.viewport = document.getElementById('astral-viewport');
        this.map = document.getElementById('astral-map');
        this.zoomIndicator = document.getElementById('zoom-indicator');
        
        // Estado de transformação
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.minZoom = 0.5;
        this.maxZoom = 3;
        
        // Estado de drag
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragPanX = 0;
        this.dragPanY = 0;
        
        // RAF para smooth updates
        this.animationFrameId = null;
        
        // Configuração
        this.zoomSpeed = 0.15;
        this.smoothTransition = false;
        
        this.init();
    }

    init() {
        this.setupDragListeners();
        this.setupZoomListeners();
        this.setupButtonListeners();
        this.updateMapTransform();
        console.log('✨ VeiasAstraisNavigation inicializado');
    }

    /**
     * SISTEMA DE DRAG
     */
    setupDragListeners() {
        this.viewport.addEventListener('mousedown', (e) => this.startDragging(e));
        this.viewport.addEventListener('mousemove', (e) => this.onDragging(e));
        this.viewport.addEventListener('mouseup', () => this.stopDragging());
        this.viewport.addEventListener('mouseleave', () => this.stopDragging());

        // Touch events para mobile
        this.viewport.addEventListener('touchstart', (e) => this.startDragging(e.touches[0]));
        this.viewport.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.onDragging(e.touches[0]);
        });
        this.viewport.addEventListener('touchend', () => this.stopDragging());
    }

    startDragging(e) {
        // Ignorar se clicou em elemento interativo (botões, inputs, etc)
        const target = e.target;
        if (target.closest('.control-btn') || 
            target.closest('button') ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('select')) {
            return;
        }

        this.isDragging = true;
        this.viewport.classList.add('dragging');

        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragPanX = this.panX;
        this.dragPanY = this.panY;
    }

    onDragging(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;

        this.panX = this.dragPanX + deltaX;
        this.panY = this.dragPanY + deltaY;

        this.smoothTransition = false;
        this.updateMapTransform();
    }

    stopDragging() {
        this.isDragging = false;
        this.viewport.classList.remove('dragging');
    }

    /**
     * SISTEMA DE ZOOM
     */
    setupZoomListeners() {
        // Zoom com mouse wheel
        this.viewport.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }

            const delta = e.deltaY > 0 ? -1 : 1;
            this.zoom += delta * this.zoomSpeed;
            this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));

            this.smoothTransition = false;
            this.updateMapTransform();
            this.updateZoomIndicator();
        }, { passive: false });

        // Pinch zoom para touch
        let lastDistance = 0;
        this.viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();

                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                const distance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );

                if (lastDistance > 0) {
                    const delta = distance - lastDistance > 0 ? 1 : -1;
                    this.zoom += delta * this.zoomSpeed * 0.5;
                    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
                    
                    this.smoothTransition = false;
                    this.updateMapTransform();
                    this.updateZoomIndicator();
                }

                lastDistance = distance;
            }
        }, { passive: false });

        this.viewport.addEventListener('touchend', () => {
            lastDistance = 0;
        });
    }

    /**
     * BOTÕES DE CONTROLE
     */
    setupButtonListeners() {
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const resetViewBtn = document.getElementById('reset-view-btn');
        const settingsBtn = document.getElementById('astral-settings-btn');
        const settingsPanel = document.getElementById('astral-settings-panel');
        const performanceToggle = document.getElementById('astral-performance-toggle');
        const settingsApplyBtn = document.getElementById('astral-settings-apply-btn');
        const settingsCloseBtn = document.getElementById('astral-settings-close-btn');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.handleZoomIn());
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.handleZoomOut());
        }

        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.resetView());
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.toggleSettingsPanel());
        }

        if (settingsCloseBtn) {
            settingsCloseBtn.addEventListener('click', () => this.hideSettingsPanel());
        }

        if (settingsApplyBtn) {
            settingsApplyBtn.addEventListener('click', () => this.applyAstralSettings());
        }

        if (performanceToggle) {
            performanceToggle.checked = Boolean(this.system.performanceMode);
            performanceToggle.addEventListener('change', () => {
                this.system.setPerformanceMode(performanceToggle.checked);
                this.updatePerformanceStatus();
            });
        }

        if (settingsPanel) {
            settingsPanel.addEventListener('click', (event) => {
                if (event.target === settingsPanel) {
                    this.hideSettingsPanel();
                }
            });
        }
        window.addEventListener('resize', () => this.positionSettingsPanel());
        this.updatePerformanceStatus();
    }

    handleZoomIn() {
        this.zoom = Math.min(this.maxZoom, this.zoom + this.zoomSpeed * 2);
        this.smoothTransition = true;
        this.updateMapTransform();
        this.updateZoomIndicator();
    }

    handleZoomOut() {
        this.zoom = Math.max(this.minZoom, this.zoom - this.zoomSpeed * 2);
        this.smoothTransition = true;
        this.updateMapTransform();
        this.updateZoomIndicator();
    }

    resetView() {
        this.panX = 0;
        this.panY = 0;
        this.zoom = 1;
        this.smoothTransition = true;
        this.updateMapTransform();
        this.updateZoomIndicator();
    }

    toggleSettingsPanel() {
        const panel = document.getElementById('astral-settings-panel');
        if (!panel) return;
        const isHidden = panel.classList.contains('hidden');
        if (isHidden) {
            panel.classList.remove('hidden');
            panel.classList.add('visible');
            this.positionSettingsPanel();
        } else {
            panel.classList.add('hidden');
            panel.classList.remove('visible');
        }
        this.updatePerformanceStatus();
    }

    hideSettingsPanel() {
        const panel = document.getElementById('astral-settings-panel');
        if (!panel) return;
        panel.classList.add('hidden');
        panel.classList.remove('visible');
    }

    positionSettingsPanel() {
        const panel = document.getElementById('astral-settings-panel');
        const button = document.getElementById('astral-settings-btn');
        if (!panel || !button || panel.classList.contains('hidden')) return;

        const buttonRect = button.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 10;

        const spaceAbove = buttonRect.top;
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const placeAbove = spaceAbove > panelRect.height + margin && spaceAbove > spaceBelow;
        const top = placeAbove
            ? Math.max(margin, buttonRect.top - panelRect.height - margin)
            : Math.min(viewportHeight - panelRect.height - margin, buttonRect.bottom + margin);
        const left = Math.min(
            Math.max(margin, buttonRect.left + buttonRect.width / 2 - panelRect.width / 2),
            viewportWidth - panelRect.width - margin
        );

        panel.style.top = `${top}px`;
        panel.style.left = `${left}px`;
        panel.dataset.placement = placeAbove ? 'top' : 'bottom';
    }

    applyAstralSettings() {
        const performanceToggle = document.getElementById('astral-performance-toggle');
        if (!performanceToggle) return;
        this.system.setPerformanceMode(performanceToggle.checked);
        this.hideSettingsPanel();
        this.updatePerformanceStatus();
    }

    updatePerformanceStatus() {
        const statusEl = document.getElementById('astral-settings-status');
        const settingsBtn = document.getElementById('astral-settings-btn');
        const performanceToggle = document.getElementById('astral-performance-toggle');
        if (statusEl) {
            const modeText = this.system.performanceMode ? 'Performance ativado' : 'Modo normal';
            statusEl.textContent = `Status: ${modeText}`;
        }
        if (settingsBtn) {
            settingsBtn.innerHTML = this.system.performanceMode ? '<span>⚡ Otimizado</span>' : '<span>⚙️ Otimizar</span>';
        }
        if (performanceToggle) {
            performanceToggle.checked = Boolean(this.system.performanceMode);
        }
    }

    /**
     * ATUALIZAR TRANSFORMAÇÃO DO MAPA
     */
    updateMapTransform() {
        const transitionClass = this.smoothTransition ? 'with-transition' : '';
        
        this.map.className = `astral-map ${transitionClass}`;
        this.map.style.transform = `translate(-50%, -50%) scale(${this.zoom}) translate(${this.panX / this.zoom}px, ${this.panY / this.zoom}px)`;
    }

    /**
     * ATUALIZAR INDICADOR DE ZOOM
     */
    updateZoomIndicator() {
        if (this.zoomIndicator) {
            const zoomPercent = Math.round(this.zoom * 100);
            this.zoomIndicator.textContent = `${zoomPercent}%`;
        }
    }

    /**
     * MÉTODOS UTILITÁRIOS
     */

    // Converter coordenada de screen para map
    screenToMap(screenX, screenY) {
        const rect = this.viewport.getBoundingClientRect();
        const viewportX = screenX - rect.left;
        const viewportY = screenY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const mapX = (viewportX - centerX) / this.zoom - this.panX / this.zoom;
        const mapY = (viewportY - centerY) / this.zoom - this.panY / this.zoom;

        return { mapX, mapY };
    }

    // Focar em uma posição do mapa
    focusOn(mapX, mapY, zoom = 1.5) {
        this.zoom = zoom;
        
        const rect = this.viewport.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        this.panX = centerX - mapX * this.zoom;
        this.panY = centerY - mapY * this.zoom;

        this.smoothTransition = true;
        this.updateMapTransform();
        this.updateZoomIndicator();
    }

    // Animar para núcleo central
    focusCore() {
        this.focusOn(0, 0, 1);
    }
}

/**
 * INTEGRAÇÃO COM SISTEMA
 */
// Exportar para uso global
window.VeiasAstraisNavigation = VeiasAstraisNavigation;

