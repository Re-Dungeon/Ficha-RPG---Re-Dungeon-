/**
 * OTIMIZAÇÕES AVANÇADAS - VEIAS ASTRAIS
 * Sistema de cache, throttling e gerenciamento de recursos
 * Arquivo a ser integrado em: veias-astrais-navegacao.js
 */

class VeiasAstraisPerformanceOptimizer {
  constructor(navigationSystem) {
    this.nav = navigationSystem;
    this.lastBgUpdate = 0;
    this.bgUpdateInterval = 100; // ms
    this.panThrottle = null;
    this.performanceMetrics = {
      fps: 0,
      frameTime: 0,
      lastMeasure: performance.now(),
    };
  }

  /**
   * THROTTLE: Atualizar background-position apenas a cada N ms
   * Reduz recálculos desnecessários durante pan
   */
  throttledBackgroundUpdate(panX, panY) {
    const now = performance.now();
    
    if (now - this.lastBgUpdate < this.bgUpdateInterval) {
      return;
    }

    const bgX = (panX % 100);
    const bgY = (panY % 100);
    
    this.nav.viewport.style.backgroundPosition = `${bgX}px ${bgY}px`;
    this.lastBgUpdate = now;
  }

  /**
   * FRAME RATE DETECTION: Medir FPS e ajustar qualidade
   */
  measureFrameTime() {
    const now = performance.now();
    const frameTime = now - this.performanceMetrics.lastMeasure;
    
    // Calcular FPS (suavizado)
    this.performanceMetrics.fps = Math.round(1000 / frameTime);
    this.performanceMetrics.frameTime = frameTime;
    this.performanceMetrics.lastMeasure = now;

    // Se FPS < 30, ativar modo econômico
    if (this.performanceMetrics.fps < 30) {
      this.enableEconomyMode();
    } else if (this.performanceMetrics.fps > 45) {
      this.disableEconomyMode();
    }

    return this.performanceMetrics.fps;
  }

  /**
   * ECONOMY MODE: Desativar efeitos quando performance cai
   */
  enableEconomyMode() {
    if (this.nav.viewport.classList.contains('economy-mode')) return;
    
    console.warn('⚠️ FPS Baixo - Ativando Modo Econômico');
    this.nav.viewport.classList.add('economy-mode');
    
    // Desativar partículas
    const particles = this.nav.viewport.querySelectorAll('.particle');
    particles.forEach(p => p.style.display = 'none');
    
    // Simplificar animações
    document.documentElement.style.setProperty('--animation-timing', 'auto');
  }

  /**
   * Restaurar efeitos quando performance melhora
   */
  disableEconomyMode() {
    if (!this.nav.viewport.classList.contains('economy-mode')) return;
    
    console.log('✅ Performance Recuperada - Restaurando Efeitos');
    this.nav.viewport.classList.remove('economy-mode');
    
    // Restaurar partículas
    const particles = this.nav.viewport.querySelectorAll('.particle');
    particles.forEach(p => p.style.display = '');
  }

  /**
   * LAZY LOADING: Renderizar nós apenas na viewport
   */
  cullingNodesOutsideViewport() {
    const viewport = this.nav.viewport.getBoundingClientRect();
    const nodesContainer = this.nav.viewport.querySelector('.astral-nodes-container');
    
    if (!nodesContainer) return;

    const nodes = nodesContainer.querySelectorAll('.astral-node');
    let hiddenCount = 0;

    nodes.forEach(node => {
      const nodeRect = node.getBoundingClientRect();
      
      // Verificar se está fora da viewport (com margem)
      const isOutside = 
        nodeRect.right < viewport.left - 200 ||
        nodeRect.left > viewport.right + 200 ||
        nodeRect.bottom < viewport.top - 200 ||
        nodeRect.top > viewport.bottom + 200;

      if (isOutside && node.style.display !== 'none') {
        node.style.display = 'none';
        hiddenCount++;
      } else if (!isOutside && node.style.display === 'none') {
        node.style.display = '';
      }
    });

    if (hiddenCount > 0) {
      console.log(`🎯 Culling: ${hiddenCount} nós fora da viewport`);
    }
  }

  /**
   * DEBOUNCE: Aguardar fim do zoom/pan antes de recalcular
   */
  debounceExpensiveOperation(callback, delay = 300) {
    clearTimeout(this.expensiveOpTimeout);
    this.expensiveOpTimeout = setTimeout(callback, delay);
  }

  /**
   * CACHE DE TRANSFORMS: Evitar recalcular transforms continuamente
   */
  cacheTransforms() {
    const mapElement = this.nav.map;
    if (!mapElement) return;

    // Armazenar transform atual em data attribute
    const transform = window.getComputedStyle(mapElement).transform;
    mapElement.dataset.lastTransform = transform;
  }

  /**
   * RELATÓRIO DE PERFORMANCE
   */
  getPerformanceReport() {
    return {
      fps: this.performanceMetrics.fps,
      frameTime: this.performanceMetrics.frameTime.toFixed(2) + 'ms',
      economyMode: this.nav.viewport.classList.contains('economy-mode'),
      performanceMode: this.nav.viewport.classList.contains('performance-mode'),
    };
  }
}

/**
 * INTEGRAÇÃO COM NAVEGAÇÃO
 * Adicionar ao construtor de VeiasAstraisNavigation:
 * 
 * this.optimizer = new VeiasAstraisPerformanceOptimizer(this);
 * 
 * E chamar no drag/pan loop:
 * 
 * this.optimizer.throttledBackgroundUpdate(panX, panY);
 * this.optimizer.measureFrameTime();
 * this.optimizer.cullingNodesOutsideViewport();
 */

/**
 * HELPERS DE PERFORMANCE PARA CONSOLE
 */
window.veiasAstraisPerf = {
  // Iniciar monitoramento de FPS
  startMonitoring: function() {
    if (!window.veiasAstraisSystem?.navigation?.optimizer) {
      console.error('Optimizer não inicializado');
      return;
    }
    
    this.monitorInterval = setInterval(() => {
      const report = window.veiasAstraisSystem.navigation.optimizer.getPerformanceReport();
      console.log(`FPS: ${report.fps} | Frame: ${report.frameTime} | Economy: ${report.economyMode}`);
    }, 1000);
    
    console.log('✅ Monitoramento iniciado. Use veiasAstraisPerf.stopMonitoring() para parar');
  },

  stopMonitoring: function() {
    clearInterval(this.monitorInterval);
    console.log('⏹️ Monitoramento parado');
  },

  // Forçar modo econômico
  forceEconomyMode: function() {
    window.veiasAstraisSystem?.navigation?.optimizer?.enableEconomyMode();
  },

  // Restaurar modo normal
  normalMode: function() {
    window.veiasAstraisSystem?.navigation?.optimizer?.disableEconomyMode();
  },

  // Ver relatório atual
  report: function() {
    const report = window.veiasAstraisSystem?.navigation?.optimizer?.getPerformanceReport();
    console.table(report);
  }
};

// Exportar classe para uso global
window.VeiasAstraisPerformanceOptimizer = VeiasAstraisPerformanceOptimizer;
