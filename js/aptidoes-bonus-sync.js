/* ============================================ */
/* APTIDOES-BONUS-SYNC.JS - Sincronização      */
/* Bônus de Aptidões → Campos de Atributos    */
/* ============================================ */

/**
 * AptidoesBonusSync
 * 
 * Módulo ISOLADO responsável por:
 * ✅ Monitorar mudanças de aptidões
 * ✅ Disparar sincronizações de bônus
 * ✅ Validar integridade de dados
 * ✅ Registrar eventos de sincronização
 * 
 * IMPORTANTE:
 * - NÃO recalcula bônus (BonusCalculator faz isso)
 * - NÃO modifica valores base
 * - NÃO altera lógica de atributos
 * - APENAS dispara cicloCompletoAtualizacao()
 */

const AptidoesBonusSync = (() => {
  // ═══════════════════════════════════════════
  // ESTADO INTERNO
  // ═══════════════════════════════════════════

  const state = {
    isInitialized: false,
    isInitializing: false,
    lastSyncTime: null,
    syncCount: 0,
    aptidoesMonitoradas: new Map(), // id → { nivel, bônus anteriores }
    debugMode: false,
    initAttempts: 0,  // ✅ NOVO: Contar tentativas de init
    maxInitAttempts: 10  // ✅ NOVO: Máximo de tentativas
  };

  // ═══════════════════════════════════════════
  // INICIALIZAÇÃO
  // ═══════════════════════════════════════════

  /**
   * Inicializa o módulo de sincronização
   * Deve ser chamado APÓS BonusCalculator estar disponível
   */
  function init() {
    console.log('🔄 [AptidoesBonusSync] Inicializando módulo de sincronização...');

    if (state.isInitialized) {
      console.warn('⚠️ [AptidoesBonusSync] Já foi inicializado uma vez');
      return true;
    }

    // Evitar re-entrada durante a inicialização
    if (state.isInitializing) {
      console.debug('💬 [AptidoesBonusSync] Já está em processo de inicialização, aguardando...');
      return false;
    }

    state.isInitializing = true;
    state.initAttempts++;

    // ✅ NOVO: Limite de tentativas para evitar loop infinito
    if (state.initAttempts > state.maxInitAttempts) {
      console.error('❌ [AptidoesBonusSync] Máximo de tentativas de init atingido. Módulo desativado.');
      state.isInitialized = true; // Marcar como "inicializado" para não tentar mais
      state.isInitializing = false;
      return false;
    }

    // Verificar dependências
    if (!window.bonusCalculator) {
      console.debug(`⏳ [AptidoesBonusSync] BonusCalculator não disponível (tentativa ${state.initAttempts}/${state.maxInitAttempts})`);
      state.isInitializing = false;
      setTimeout(init, 500);
      return false;
    }

    if (!window.atributosManager) {
      console.debug(`⏳ [AptidoesBonusSync] AtributosManager não disponível (tentativa ${state.initAttempts}/${state.maxInitAttempts})`);
      state.isInitializing = false;
      setTimeout(init, 500);
      return false;
    }

    // Configurar listeners
    setupAptidoesListeners();
    
    // Fazer sincronização inicial (silenciosamente)
    try {
      syncBonusAptidoesParaAtributos('init');
    } catch (e) {
      console.warn('⚠️ [AptidoesBonusSync] Erro durante sincronização inicial:', e.message);
    }

    state.isInitialized = true;
    state.isInitializing = false;
    console.log(`✅ [AptidoesBonusSync] Módulo inicializado com sucesso (tentativa ${state.initAttempts})`);
    return true;
  }

  // ═══════════════════════════════════════════
  // MONITORAMENTO DE APTIDÕES
  // ═══════════════════════════════════════════

  /**
   * Configura listeners para detectar mudanças de aptidões
   */
  function setupAptidoesListeners() {
    console.log('🎯 [AptidoesBonusSync] Configurando listeners de aptidões...');

    if (!window.aptidoesManager) {
      console.warn('⚠️ AptidoesManager não disponível ainda');
      return;
    }

    // Listener para mudanças na lista de aptidões do personagem
    // Ao adicionar/remover/upar uma aptidão
    const originalUpgrade = window.aptidoesManager.upgradeAptidao;
    if (originalUpgrade) {
      window.aptidoesManager.upgradeAptidao = function(...args) {
        const result = originalUpgrade.apply(this, args);
        // Após upgrade, sincronizar bônus
        setTimeout(() => syncBonusAptidoesParaAtributos('upgrade'), 100);
        return result;
      };
    }

    const originalReset = window.aptidoesManager.resetAptidao;
    if (originalReset) {
      window.aptidoesManager.resetAptidao = function(...args) {
        const result = originalReset.apply(this, args);
        // Após reset, sincronizar bônus
        setTimeout(() => syncBonusAptidoesParaAtributos('reset'), 100);
        return result;
      };
    }

    const originalRemove = window.aptidoesManager.removeAptidao;
    if (originalRemove) {
      window.aptidoesManager.removeAptidao = function(...args) {
        const result = originalRemove.apply(this, args);
        // Após remover, sincronizar bônus
        setTimeout(() => syncBonusAptidoesParaAtributos('remove'), 100);
        return result;
      };
    }

    console.log('✅ [AptidoesBonusSync] Listeners de aptidões configurados');
  }

  // ═══════════════════════════════════════════
  // SINCRONIZAÇÃO PRINCIPAL
  // ═══════════════════════════════════════════

  /**
   * Executa sincronização completa de bônus
   * Esta é a ÚNICA operação que altera a UI de bônus
   * 
   * Fluxo:
   * 1. ✓ Verifica integridade
   * 2. ✓ Dispara BonusCalculator.cicloCompletoAtualizacao()
   * 3. ✓ Valida resultado
   * 4. ✓ Registra eventos
   */
  function syncBonusAptidoesParaAtributos(origem = 'manual') {
    // ✅ Se não foi inicializado, não fazer sincronização
    // (O módulo deve estar inicializado antes, não fazer tentativas aqui)
    if (!state.isInitialized) {
      console.debug('💬 [AptidoesBonusSync] Sincronização ignorada - módulo não inicializado');
      return false;
    }

    console.group(`🔄 [AptidoesBonusSync] Sincronizando bônus (origem: ${origem})`);

    try {
      // 1️⃣ Validar estado
      if (!validarEstado()) {
        console.error('❌ Estado inválido, abortando sincronização');
        console.groupEnd();
        return false;
      }

      // 2️⃣ Executar ciclo completo (ÚNICO ponto onde BonusCalculator é chamado)
      if (window.bonusCalculator && typeof window.bonusCalculator.cicloCompletoAtualizacao === 'function') {
        console.log('📤 Disparando BonusCalculator.cicloCompletoAtualizacao()...');
        window.bonusCalculator.cicloCompletoAtualizacao();
        console.log('✅ Ciclo completo executado');
      } else {
        console.error('❌ BonusCalculator.cicloCompletoAtualizacao não disponível');
        console.groupEnd();
        return false;
      }

      // 3️⃣ Validar resultado
      const resultado = validarResultadoSincronizacao();
      if (!resultado.sucesso) {
        console.error('❌ Validação falhou:', resultado.erros);
        console.groupEnd();
        return false;
      }

      // 4️⃣ Registrar evento
      state.lastSyncTime = new Date();
      state.syncCount++;
      console.log(`✅ Sincronização concluída (Total: ${state.syncCount})`);

      console.groupEnd();
      return true;

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      console.groupEnd();
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // VALIDAÇÃO
  // ═══════════════════════════════════════════

  /**
   * Valida o estado atual do sistema
   */
  function validarEstado() {
    const erros = [];

    // Verificar BonusCalculator
    if (!window.bonusCalculator) {
      erros.push('BonusCalculator não disponível');
    }

    // Verificar AtributosManager
    if (!window.atributosManager || !window.atributosManager.personagemData) {
      erros.push('AtributosManager ou personagemData não disponível');
    }

    // Verificar AptidoesManager
    if (!window.aptidoesManager || !Array.isArray(window.aptidoesManager.aptidoesPersonagem)) {
      erros.push('AptidoesManager ou aptidoesPersonagem não disponível');
    }

    if (erros.length > 0) {
      console.error('❌ [AptidoesBonusSync] Erros de validação:', erros);
      return false;
    }

    return true;
  }

  /**
   * Valida se a sincronização foi bem-sucedida
   */
  function validarResultadoSincronizacao() {
    const resultado = {
      sucesso: true,
      erros: [],
      avisos: []
    };

    try {
      const atributos = window.atributosManager.personagemData;

      // Verificar se atributosBonusAptidoes foi atualizado
      if (!atributos.atributosBonusAptidoes) {
        resultado.erros.push('atributosBonusAptidoes não foi criado');
        resultado.sucesso = false;
        return resultado;
      }

      // Verificar se há alguns bônus (pelo menos um diferente de zero)
      const temBonusNonZero = Object.values(atributos.atributosBonusAptidoes).some(v => v !== 0);
      if (!temBonusNonZero && window.aptidoesManager.aptidoesPersonagem.length > 0) {
        resultado.avisos.push('Nenhum bônus foi aplicado apesar de aptidões ativas');
      }

      // Verificar se campos readonly foram atualizados no DOM
      const inputsComBonus = document.querySelectorAll('[data-atributo-bonus]');
      if (inputsComBonus.length === 0) {
        resultado.avisos.push('Nenhum input com [data-atributo-bonus] encontrado no DOM');
      }

      if (resultado.erros.length > 0) {
        resultado.sucesso = false;
      }

      return resultado;

    } catch (error) {
      resultado.erros.push(`Erro durante validação: ${error.message}`);
      resultado.sucesso = false;
      return resultado;
    }
  }

  // ═══════════════════════════════════════════
  // UTILITÁRIOS E DEBUG
  // ═══════════════════════════════════════════

  /**
   * Habilita modo debug
   */
  function enableDebug() {
    state.debugMode = true;
    console.log('🔍 [AptidoesBonusSync] Modo debug habilitado');
  }

  /**
   * Desabilita modo debug
   */
  function disableDebug() {
    state.debugMode = false;
    console.log('🔍 [AptidoesBonusSync] Modo debug desabilitado');
  }

  /**
   * Retorna informações de status do módulo
   */
  function getStatus() {
    return {
      isInitialized: state.isInitialized,
      syncCount: state.syncCount,
      lastSyncTime: state.lastSyncTime,
      debugMode: state.debugMode,
      timelastSync: state.lastSyncTime ? 
        Math.floor((Date.now() - state.lastSyncTime.getTime()) / 1000) + 's' : 
        'nunca'
    };
  }

  /**
   * Força uma sincronização manual (para testes)
   */
  function forceSync() {
    console.log('🔨 [AptidoesBonusSync] Forçando sincronização manual...');
    return syncBonusAptidoesParaAtributos('force');
  }

  /**
   * Reseta o estado do módulo
   */
  function reset() {
    state.lastSyncTime = null;
    state.syncCount = 0;
    state.aptidoesMonitoradas.clear();
    console.log('🔄 [AptidoesBonusSync] Estado resetado');
  }

  // ═══════════════════════════════════════════
  // EXPORTAÇÃO DE API PÚBLICA
  // ═══════════════════════════════════════════

  return {
    init,
    syncBonusAptidoesParaAtributos,
    enableDebug,
    disableDebug,
    getStatus,
    forceSync,
    reset
  };
})();

// ═══════════════════════════════════════════
// INICIALIZAÇÃO AUTOMÁTICA
// ═══════════════════════════════════════════

// Inicializar quando os managers estiverem prontos
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que tudo foi carregado
    setTimeout(() => {
      if (window.bonusCalculator && window.atributosManager && window.aptidoesManager) {
        AptidoesBonusSync.init();
      } else {
        setTimeout(() => AptidoesBonusSync.init(), 1000);
      }
    }, 500);
  });
} else {
  // DOM já está pronto
  setTimeout(() => {
    if (window.bonusCalculator && window.atributosManager && window.aptidoesManager) {
      AptidoesBonusSync.init();
    }
  }, 500);
}

// Expor globalmente
window.aptidoesBonusSync = AptidoesBonusSync;

console.log('✅ AptidoesBonusSync carregado e disponível em window.aptidoesBonusSync');
