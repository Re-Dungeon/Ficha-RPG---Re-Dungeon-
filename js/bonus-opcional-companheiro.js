/* ========================================================================== */
/* BONUS-OPCIONAL-COMPANHEIRO.JS                                            */
/* Sistema de Bônus Opcional para Aptidões de Companheiros                  */
/* ========================================================================== */

/**
 * BonusOpcionalCompanheiro
 * Gerencia estado de bônus opcionais para companheiros
 * Semelhante ao sistema principal, mas com persistência separada
 */

const BonusOpcionalCompanheiro = (() => {
  // Chave base para localStorage de companheiros
  const STORAGE_KEY_BASE = 'estadoBonusOpcionaisCom_';

  /**
   * Obter a chave de armazenamento para um companheiro específico
   * @param {number} companeiroId - ID do companheiro
   * @returns {string} Chave de localStorage
   */
  function getStorageKey(companeiroId) {
    return `${STORAGE_KEY_BASE}${companeiroId}`;
  }

  /**
   * Carregar estado de bônus opcionais de um companheiro
   * @param {number} companeiroId - ID do companheiro
   * @returns {Object} Estado carregado
   */
  function carregarEstado(companeiroId) {
    console.log(`📂 [BonusOpcionalCompanheiro] Carregando estado do companheiro ${companeiroId}...`);
    
    try {
      const key = getStorageKey(companeiroId);
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        console.log(`ℹ️ Nenhum estado armazenado para companheiro ${companeiroId}`);
        return {};
      }
      
      const estado = JSON.parse(stored);
      console.log(`✅ Estado carregado:`, estado);
      return estado;
    } catch (e) {
      console.error(`❌ Erro ao carregar estado:`, e);
      return {};
    }
  }

  /**
   * Salvar estado de bônus opcionais de um companheiro
   * @param {number} companeiroId - ID do companheiro
   * @param {Object} estado - Estado a salvar
   */
  function salvarEstado(companeiroId, estado) {
    console.log(`💾 [BonusOpcionalCompanheiro] Salvando estado do companheiro ${companeiroId}...`);
    
    try {
      const key = getStorageKey(companeiroId);
      localStorage.setItem(key, JSON.stringify(estado));
      console.log(`✅ Estado salvo com sucesso`);
    } catch (e) {
      console.error(`❌ Erro ao salvar estado:`, e);
    }
  }

  /**
   * Obter qual bônus está ativo atualmente
   * @param {number} companeiroId - ID do companheiro
   * @param {string} aptidaoId - ID da aptidão
   * @param {number} nivel - Nível da aptidão
   * @returns {string} 'valor' ou 'valorOpcional'
   */
  function getBonusAtivo(companeiroId, aptidaoId, nivel) {
    const estado = carregarEstado(companeiroId);
    const chave = `${aptidaoId}_${nivel}`;
    
    // Se não está na localStorage, retorna 'valor' (padrão)
    const ativo = estado[chave] || 'valor';
    console.log(`🔍 getBonusAtivo(${companeiroId}, ${aptidaoId}, ${nivel}) = ${ativo}`);
    
    return ativo;
  }

  /**
   * Alternar entre valor e valorOpcional
   * @param {number} companeiroId - ID do companheiro
   * @param {string} aptidaoId - ID da aptidão
   * @param {number} nivel - Nível da aptidão
   * @returns {string} Novo valor ativo ('valor' ou 'valorOpcional')
   */
  function alternarBonus(companeiroId, aptidaoId, nivel) {
    console.log(`🔁 [alternarBonus] Alternando ${aptidaoId} nível ${nivel} do companheiro ${companeiroId}`);
    
    const estado = carregarEstado(companeiroId);
    const chave = `${aptidaoId}_${nivel}`;
    
    console.log(`   Estado ANTES:`, estado);
    
    // Se está em 'valor', muda para 'valorOpcional'; senão volta para 'valor'
    const novoEstado = estado[chave] === 'valor' ? 'valorOpcional' : 'valor';
    
    estado[chave] = novoEstado;
    salvarEstado(companeiroId, estado);
    
    console.log(`✅ Novo estado: ${novoEstado}`);
    console.log(`   Estado DEPOIS:`, estado);
    console.log(`   Verificação - localStorage[${getStorageKey(companeiroId)}]:`, localStorage.getItem(getStorageKey(companeiroId)));
    
    return novoEstado;
  }

  /**
   * Limpar bônus opcional de uma aptidão
   * @param {number} companeiroId - ID do companheiro
   * @param {string} aptidaoId - ID da aptidão
   * @param {number} nivel - Nível da aptidão
   */
  function limparBonus(companeiroId, aptidaoId, nivel) {
    console.log(`🧹 [limparBonus] Limpando ${aptidaoId} nível ${nivel}`);
    
    const estado = carregarEstado(companeiroId);
    const chave = `${aptidaoId}_${nivel}`;
    
    delete estado[chave];
    salvarEstado(companeiroId, estado);
    
    console.log(`✅ Bônus limpo`);
  }

  /**
   * Aplicar bônus opcional de uma aptidão
   * Retorna o bônus correto (valor ou valorOpcional) baseado no estado
   * @param {number} companeiroId - ID do companheiro
   * @param {Object} vantagem - Objeto de vantagem {valor, valorOpcional, tipo, ...}
   * @returns {string|null} O bônus a aplicar, ou null se não for opcional
   */
  function aplicarBonusOpcional(companeiroId, vantagem) {
    if (vantagem.tipo !== 'bonus-opcional' || !vantagem.valorOpcional) {
      return null;
    }

    const ativo = getBonusAtivo(companeiroId, vantagem.aptidaoId, vantagem.nivel);
    const bonus = ativo === 'valor' ? vantagem.valor : vantagem.valorOpcional;
    
    console.log(`💎 Aplicar bonus opcional: ${ativo} = ${bonus}`);
    return bonus;
  }

  /**
   * Obter estado completo de um companheiro
   * @param {number} companeiroId - ID do companheiro
   * @returns {Object} Estado completo
   */
  function obterEstadoCompleto(companeiroId) {
    return carregarEstado(companeiroId);
  }

  /**
   * Limpar TODO o estado de um companheiro
   * @param {number} companeiroId - ID do companheiro
   */
  function limparTudo(companeiroId) {
    console.log(`🗑️ [limparTudo] Limpando estado completo do companheiro ${companeiroId}`);
    
    try {
      const key = getStorageKey(companeiroId);
      localStorage.removeItem(key);
      console.log(`✅ Estado completo removido`);
    } catch (e) {
      console.error(`❌ Erro ao limpar estado:`, e);
    }
  }

  // ============================================
  // API Pública
  // ============================================
  return {
    carregarEstado,
    salvarEstado,
    getBonusAtivo,
    alternarBonus,
    limparBonus,
    aplicarBonusOpcional,
    obterEstadoCompleto,
    limparTudo
  };
})();

// Garantir que está disponível globalmente
if (typeof window !== 'undefined') {
  window.bonusOpcionalCompanheiro = BonusOpcionalCompanheiro;
}
