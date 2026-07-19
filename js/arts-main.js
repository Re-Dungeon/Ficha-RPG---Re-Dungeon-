/**
 * MAIN - INICIALIZAÇÃO E ORQUESTRAÇÃO
 * Ponto de entrada do sistema de habilidades
 * Re:Dungeon Character Sheet
 */

class ArtsSystemManager {
  constructor() {
    this.character = null;
    this.uiManager = null;
    this.initialized = false;
  }

  /**
   * Inicializa o sistema completo
   */
  async init() {
    try {
      console.log('🚀 Inicializando Sistema de Habilidades...');

      // 0. Inicializar ImagemStorageManager
      try {
        await ImagemStorageManager.init();
        console.log('✅ ImagemStorageManager pronto');
      } catch (e) {
        console.warn('⚠️ IndexedDB indisponível:', e);
      }

      // 1. Carregar dados do storage (agora é async)
      this.character = await StorageManager.loadCharacter();
      console.log('✅ Personagem carregado:', this.character.name);

      // 2. Validar dados
      const validation = RulesEngine.validateCharacter(this.character);

      // 3. Auto-bloquear arts se necessário
      const blockResult = RulesEngine.autoBlockArts(this.character);
      if (blockResult.blocked || blockResult.unblocked) {
        console.log(blockResult.message);
        StorageManager.saveCharacter(this.character);
      }

      // 4. Inicializar UI
      this.uiManager = new UIManager('rpg-content-habilidades');
      this.uiManager.render(this.character);

      // 5. Configurar sincronização entre abas
      this.setupStorageSync();

      // 6. Configurar eventos globais
      this.setupGlobalEvents();

      this.initialized = true;
      console.log('✅ Sistema de Habilidades inicializado com sucesso!');

      StorageManager.notify('⚔️ Sistema de Habilidades carregado', 'success', 1500);
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema:', error);
      StorageManager.notify('❌ Erro ao inicializar sistema', 'error');
    }
  }

  /**
   * Configura sincronização de dados entre abas
   */
  setupStorageSync() {
    StorageManager.initStorageSyncListener((character) => {
      this.character = character;
      this.uiManager.render(character);
      console.log('🔄 Dados sincronizados de outra aba');
    });
  }

  /**
   * Configura eventos globais
   */
  setupGlobalEvents() {
    // Auto-salvar periodicamente (30 segundos)
    setInterval(() => {
      // 🔒 BLOQUEIO: Não salvar durante importação ou limpeza
      if (window.isImportandoFicha || sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA') ||
          sessionStorage.getItem('LIMPEZA_FICHA_ATIVA')) {
        console.log('🔒 [ArtsSystem] Auto-salvamento bloqueado - Operação em progresso');
        return;
      }

      if (this.initialized) {
        StorageManager.saveCharacter(this.character);
      }
    }, 30000);

    // Salvar ao sair da página
    window.addEventListener('beforeunload', () => {
      // 🔒 BLOQUEIO: Não salvar durante importação ou limpeza
      if (window.isImportandoFicha || sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA') ||
          sessionStorage.getItem('LIMPEZA_FICHA_ATIVA')) {
        console.log('🔒 [ArtsSystem] Salvamento beforeunload bloqueado - Operação em progresso');
        return;
      }

      StorageManager.saveCharacter(this.character);
    });

    // Dados salvos (evento customizado)
    window.addEventListener('artsDataSaved', (e) => {
      console.log('💾 Dados salvos:', e.detail.timestamp);
    });

    // 🔥 NOVO: Detectar mudanças de atributos em TEMPO REAL
    // Quando os atributos mudam, recalcular limite de arts e desbloquear se necessário
    window.addEventListener('atributosAtualizados', (e) => {
      console.log('🎯 [Arts] Atributos foram atualizados! Recalculando limite de arts...');
      
      try {
        // Recalcular o limite máximo de arts com os novos atributos
        const novoLimite = RulesEngine.calculateMaxArts(this.character);
        console.log(`📊 Novo limite de arts: ${novoLimite}`);
        
        // Tentar desbloquear arts se o novo limite permitir
        const result = RulesEngine.autoBlockArts(this.character);
        if (result.unblocked > 0) {
          console.log(`✅ ${result.unblocked} arte(s) desbloqueada(s)!`);
          StorageManager.saveCharacter(this.character);
          
          // Rerenderizar UI para mostrar as mudanças
          if (this.uiManager) {
            this.uiManager.render(this.character);
            console.log('🎨 UI atualizada com novas arts desbloqueadas');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao processar atualização de atributos:', error);
      }
    });

    // 🔥 NOVO: Listener adicional para evento genérico de atualização de ficha
    window.addEventListener('fichaAtualizada', (e) => {
      console.log('🎯 [Arts] Ficha foi atualizada! Verificando arts...');
      
      try {
        const result = RulesEngine.autoBlockArts(this.character);
        if (result.blocked > 0 || result.unblocked > 0) {
          StorageManager.saveCharacter(this.character);
          if (this.uiManager) {
            this.uiManager.render(this.character);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao processar atualização de ficha:', error);
      }
    });
  }

  /**
   * Obter relatório completo do sistema
   */
  getReport() {
    return {
      character: this.character,
      stats: RulesEngine.generateArtsReport(this.character),
      validation: RulesEngine.validateCharacter(this.character),
      storageInfo: StorageManager.getStorageInfo()
    };
  }

  /**
   * Re-renderizar UI
   */
  render() {
    if (this.uiManager) {
      this.uiManager.render(this.character);
    }
  }
}

// ============ INICIALIZAÇÃO GLOBAL ============

// Variável global para acesso fácil
window.artsSystem = null;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
  // Esperar um pouco para garantir que o container existe
  setTimeout(async () => {
    const container = document.getElementById('rpg-content-habilidades');
    if (container) {
      window.artsSystemManager = new ArtsSystemManager();
      window.artsSystem = window.artsSystemManager; // Alias para compatibilidade
      await window.artsSystemManager.init();
    }
  }, 100);
});

// Expor funções úteis globais
window.artsDebug = {
  getCharacter: () => window.artsSystem?.character,
  getReport: () => window.artsSystem?.getReport(),
  getStorageInfo: () => StorageManager.getStorageInfo(),
  clearStorage: () => StorageManager.resetCharacter(),
  validateCharacter: () => RulesEngine.validateCharacter(window.artsSystem?.character),
  logStorage: () => {
    const char = window.artsSystem?.character;
    console.table({
      character: char?.name,
      cores: char?.cores.length,
      arts: char?.arts.length,
      maxArts: RulesEngine.calculateMaxArts(char),
      activeArts: char?.getActiveArts().length,
      blockedArts: char?.getBlockedArts().length
    });
  }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ArtsSystemManager };
}
