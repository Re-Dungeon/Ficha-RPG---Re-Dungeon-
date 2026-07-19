/* ============================================ */
/* BONUS-CALCULATOR.JS - Gerenciador de Bônus   */
/* Cálculo centralizado de bônus de aptidões    */
/* ============================================ */

/**
 * BonusCalculator
 * Responsável por:
 * - Manter estado global de bônus de aptidões
 * - Calcular bônus baseado no nível das aptidões
 * - Atualizar automaticamente todos os campos de bônus
 * - Sincronizar com AtributosManager
 */

const BonusCalculator = (() => {
  /**
   * Estado global de bônus por atributo
   * Única fonte da verdade para bônus
   */
  const bonusAptidoes = {
    // Primários
    forca: 0,
    vitalidade: 0,
    agilidade: 0,
    inteligencia: 0,
    percepcao: 0,
    sorte: 0,
    // Secundários
    prontidao: 0,
    ataque: 0,
    defesa: 0,
    reacao: 0,
    precisao: 0,
    evasao: 0,
    // Status
    saude: 0,
    energia: 0,
    fadiga: 0
  };

  /**
   * Mapa de aptidões -> bônus que concedem
   * Estrutura: { aptidaoId: { atributo: bonusValue } }
   */
  const aptidoesBonus = {};

  /**
   * Definição de bônus por aptidão (extraído do catálogo)
   * Cada aptidão terá seus bônus mapeados por nível
   */
  const definicaoBonusAptidoes = {
    // IMPORTANTE: Cada nível ACUMULA com os anteriores
    // Exemplo: Nível 3 de atletismo aplica níveis 1 + 3 juntos
    // Por isso a função usa loop: for (let nivel = 1; nivel <= nivelAtual; nivel++)
    
    'acrobacia': {
      1: { agilidade: 5 },
      3: { reacao: 1 },
      5: { evasao: 1 }
    },
    'alquimia': {
      1: { inteligencia: 5 },
      3: { inteligencia: 0 },  // Mantém bonificação
      5: { }                    // Nível 5 é narrativo (-3 descontrole)
    },
    'ambidestro': {
      1: { precisao: 1 },
      3: { },                   // Nível 3 é narrativo (ataque duplo)
      5: { }                    // Nível 5 é narrativo (ação comum)
    },
    'arcanismo': {
      1: { },                   // Nível 1 é narrativo (-3 dificuldade)
      3: { precisao: 1 },
      5: { }                    // Nível 5 é narrativo (-3 descontrole)
    },
    'atletismo': {
      1: { vitalidade: 5 },
      3: { saude: 50 },
      5: { forca: 5 }
    },
    'atuacao': {
      1: { inteligencia: 5 },
      3: { },                   // Nível 3 é narrativo (-3 obstáculo)
      5: { }                    // Nível 5 é narrativo (imitar vozes)
    },
    'beleza': {
      1: { },                   // Nível 1 é narrativo (+1 testes sociais)
      3: { sorte: 5 },
      5: { }                    // Nível 5 é narrativo (distrair inimigos)
    },
    'camuflagem': {
      1: { prontidao: 0 },      // +20% será calculado em aplicarBonusPercentuais()
      3: { agilidade: 5 },
      5: { reacao: 1 }
    },
    'canto': {
      1: { },                   // Nível 1 é narrativo (+1 encantar/inspirar)
      3: { inteligencia: 5 },
      5: { }                    // Nível 5 é narrativo (+1 reação/precisão a aliados)
    },
    'compreensao': {
      1: { inteligencia: 5 },
      3: { },                   // Nível 3 é narrativo (aprender técnicas)
      5: { }                    // Nível 5 é narrativo (compreender elementos)
    },
    'controleqi': {
      1: { percepcao: 5 },      // Ou inteligência conforme escolha do jogador
      3: { reacao: 1 },
      5: { }                    // Nível 5 é narrativo (interromper Qi)
    },
    'conhecimento': {
      1: { inteligencia: 5 },
      3: { },                   // Nível 3 é narrativo (+1d6 em decifração)
      5: { }                    // Nível 5 é narrativo (relembrar fatos)
    },
    'cultivo': {
      1: { },                   // Nível 1 é narrativo (recuperação dobrada)
      3: { inteligencia: 5 },
      5: { }                    // Nível 5 é narrativo (atravessar barreiras)
    },
    'danca': {
      1: { evasao: 1 },
      3: { agilidade: 5 },
      5: { reacao: 1 }
    },
    'diplomacia': {
      1: { },                   // Nível 1 é narrativo (reduz hostilidade)
      3: { inteligencia: 5 },
      5: { }                    // Nível 5 é narrativo (atuar como mediador)
    },
    'douqi': {
      1: { },                   // Nível 1 é narrativo (dado extra de dano)
      3: { forca: 5 },          // Ou inteligência conforme escolha do jogador
      5: { }                    // Nível 5 é narrativo (ignorar 30% armadura)
    },
    'estrategia': {
      1: { inteligencia: 5 },
      3: { },                   // Nível 3 é narrativo (+1d6 eficiência)
      5: { }                    // Nível 5 é narrativo (vantagem 3x)
    },
    'ferraria': {
      1: { forca: 5 },
      3: { },                   // Nível 3 é narrativo (metal despertar)
      5: { sorte: 5 }
    },
    'folego': {
      1: { vitalidade: 5 },
      3: { },                   // Nível 3 é narrativo (-30% fadiga)
      5: { }                    // Nível 5 é narrativo (recuperar 50% fadiga)
    },
    'furtividade': {
      1: { },                   // Nível 1 é narrativo (-3 obstáculo avistar)
      3: { agilidade: 5 },
      5: { precisao: 1 }
    },
    'idioma': {
      1: { },                   // Nível 1 é narrativo (nova língua)
      3: { inteligencia: 5 },
      5: { }                    // Nível 5 é narrativo (-3 testes sociais estrangeiros)
    },
    'intimidacao': {
      1: { inteligencia: 5 },
      3: { },                   // Nível 3 é narrativo (+1 contra fracos)
      5: { }                    // Nível 5 é narrativo (inimigos hesitam)
    },
    'intuicao': {
      1: { },                   // Nível 1 é narrativo (detectar surpresa)
      3: { percepcao: 5 },
      5: { }                    // Nível 5 é narrativo (+1d4 falta informações)
    },
    'labia': {
      1: { inteligencia: 5 },
      3: { },                   // Nível 3 é narrativo (inverter acusação)
      5: { }                    // Nível 5 é narrativo (-3 testes sociais autoridade)
    },
    'lideranca': {
      1: { },                   // Nível 1 é narrativo (+1 bônus aliados)
      3: { },                   // Nível 3 é narrativo (-3 sanidade/vontade)
      5: { }                    // Nível 5 é narrativo (reorganizar iniciativa)
    },
    'maestria': {
      1: { },                   // Nível 1 é narrativo (+1 maestria)
      3: { },                   // Nível 3 é narrativo (-3 obstáculo área)
      5: { }                    // Nível 5 é narrativo (+5 atributo relacionado)
    },
    'matrizes': {
      1: { inteligencia: 5 },
      3: { prontidao: 0 },      // +20% Prontidão
      5: { }                    // Nível 5 é narrativo (ativar matriz como ação bônus)
    },
    'olhocrtico': {
      1: { precisao: 1 },
      3: { percepcao: 5 },
      5: { }                    // Nível 5 é narrativo (reduzir defesa alvo)
    },
    'percepcao': {
      1: { },                   // Nível 1 é narrativo (detectar sem rolagem)
      3: { percepcao: 5 },
      5: { reacao: 1 }
    },
    'prestidigitacao': {
      1: { precisao: 1 },
      3: { agilidade: 5 },
      5: { }                    // Nível 5 é narrativo (re-rolar dado falho)
    },
    'pressentimento': {
      1: { },                   // Nível 1 é narrativo (+3 reação após evasão falha)
      3: { sorte: 5 },
      5: { }                    // Nível 5 é narrativo (re-rolar falha percepção/reação)
    },
    'religiao': {
      1: { },                   // Nível 1 é narrativo (identificar símbolos)
      3: { },                   // Nível 3 é narrativo (-2 obstáculos religião)
      5: { inteligencia: 5 }
    },
    'sanidade': {
      1: { },                   // Nível 1 é narrativo (-3 dificuldade sanidade)
      3: { vitalidade: 5 },
      5: { }                    // Nível 5 é narrativo (vantagem contra medo 2x)
    },
    'seducao': {
      1: { },                   // Nível 1 é narrativo (-3 ações contra vontade)
      3: { sorte: 5 },
      5: { }                    // Nível 5 é narrativo (inverter hostilidade)
    },
    'selos': {
      1: { },                   // Nível 1 é narrativo (armazenar magias)
      3: { inteligencia: 5 },
      5: { precisao: 1 }
    },
    'sobrevivencia': {
      1: { },                   // Nível 1 é narrativo (-dificuldade conhecimento)
      3: { percepcao: 5 },      // Ou inteligência conforme escolha do jogador
      5: { }                    // Nível 5 é narrativo (detectar trilhas +1d6)
    },
    'tolerancia': {
      1: { },                   // Nível 1 é narrativo (-3 obstáculos)
      3: { },                   // Nível 3 é narrativo (-1 turno venenos/queimaduras)
      5: { }                    // Nível 5 é narrativo (permanecer pé golpe derrubador)
    },
    'unicskill': {
      1: { },                   // Nível 1 é narrativo (Núcleo Extra)
      3: { },                   // Nível 3 é narrativo (+1 ativação/controle)
      5: { }                    // Nível 5 é narrativo (+5 atributo primário)
    },
    'vontade': {
      1: { vitalidade: 5 },
      3: { },                   // Nível 3 é narrativo (+2 resistências mentais)
      5: { }                    // Nível 5 é narrativo (negar efeito mental 1x)
    }
  };

  /**
   * Retorna o estado de bônus atual
   */
  function getBonusAptidoes() {
    return { ...bonusAptidoes };
  }

  /**
   * Inicializa o mapa de bônus a partir do catálogo
   */
  function inicializarBonusAptidoes() {
    // Limpar mapa anterior
    Object.keys(aptidoesBonus).forEach(key => delete aptidoesBonus[key]);

    // Carregar aptidões do AtributosManager se disponível
    if (window.atributosManager && window.atributosManager.personagemData.aptidoesPersonagem) {
      const aptidoes = window.atributosManager.personagemData.aptidoesPersonagem;
      aptidoes.forEach(apt => {
        aptidoesBonus[apt.id] = apt;
      });
    }

    // Ou do AptidoesManager
    if (window.aptidoesManager && window.aptidoesManager.aptidoesPersonagem) {
      window.aptidoesManager.aptidoesPersonagem.forEach(apt => {
        aptidoesBonus[apt.id] = apt;
      });
    }
  }

  /**
   * Recalcula os bônus baseado nas aptidões atuais
   * ✅ REATIVADO - Delega para VantagensAptidoesSystem que possui lógica completa
   * 
   * VantagensAptidoesSystem:
   * - Respeita tipos de bônus (bonus, bonus-percentual, bonus-opcional, efeito)
   * - Mapeia atributos corretamente
   * - Gerencia estado de bônus opcionais
   * - Aplica percentuais dinamicamente
   * 
   * @returns {object} Objeto com bônus calculados
   */
  function recalcularBonusAptidoesAPartirDasAptidoes() {
    console.log('🧮 [BonusCalculator] Recálculo de bônus ATIVADO - Delegando para VantagensAptidoesSystem');

    // Verificar se VantagensAptidoesSystem está disponível
    if (!window.vantagensAptidoesSystem || !window.vantagensAptidoesSystem.recalcularBonusAptidoesAPartirDasAptidoes) {
      console.error('❌ VantagensAptidoesSystem não disponível! Retornando bônus zerados.');
      for (const attr in bonusAptidoes) {
        bonusAptidoes[attr] = 0;
      }
      return bonusAptidoes;
    }

    // Chamar VantagensAptidoesSystem para cálculo completo
    const bonusCalculados = window.vantagensAptidoesSystem.recalcularBonusAptidoesAPartirDasAptidoes();

    // Copiar resultados para bonusAptidoes (estado global)
    for (const [attr, valor] of Object.entries(bonusCalculados)) {
      bonusAptidoes[attr] = valor;
    }

    console.log('✅ Bônus recalculados via VantagensAptidoesSystem:', bonusAptidoes);
    return bonusAptidoes;
  }

  /**
   * Aplica bônus percentuais (converte para valores absolutos)
   * Exemplo: +20% Prontidão
   */
  function aplicarBonusPercentuais() {
    // Camuflagem nível 1: +20% Prontidão
    if (aptidoesBonus['camuflagem'] && aptidoesBonus['camuflagem'].nivel >= 1) {
      // Obter valor base de prontidão
      const prontidaoBase = obterProntidaoBase();
      const bonusPercentual = Math.round(prontidaoBase * 0.20);
      bonusAptidoes['prontidao'] += bonusPercentual;
      console.log(`  💡 Camuflagem +20% Prontidão = +${bonusPercentual}`);
    }
  }

  /**
   * Obtém o valor base de prontidão (para cálculo percentual)
   */
  function obterProntidaoBase() {
    if (window.atributosManager && window.atributosManager.personagemData) {
      const data = window.atributosManager.personagemData;
      const base = data.secundarios?.prontidao || 0;
      return base > 0 ? base : 8;
    }
    return 8; // Fallback
  }

  /**
   * Atualiza um campo de bônus no DOM
   * @param {string} atributo - Nome do atributo
   * @param {HTMLElement} inputElement - Elemento input do popup
   */
  function atualizarInputBonus(atributo, inputElement) {
    if (!inputElement) return;

    const valor = bonusAptidoes[atributo] || 0;
    inputElement.value = valor;

    // Garantir que é readonly
    inputElement.setAttribute('readonly', 'readonly');
  }

  /**
   * Atualiza todos os campos de bônus nos popups
   * Procura por elementos com data-atributo-bonus
   */
  function atualizarTodosBonusNosPopups() {
    console.log('📝 [BonusCalculator] Atualizando todos os campos de bônus no DOM...');

    // Atributos primários e secundários
    const atributos = [
      'forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte',
      'prontidao', 'ataque', 'defesa', 'reacao', 'precisao', 'evasao'
    ];

    atributos.forEach(atributo => {
      // Procurar por input com data-atributo-bonus
      const inputs = document.querySelectorAll(`[data-atributo-bonus="${atributo}"]`);
      inputs.forEach(input => {
        atualizarInputBonus(atributo, input);
      });

      // Procurar por id específico (compatibilidade com atributos-config-modal)
      const input = document.getElementById(`atributos-config-bonus`);
      if (input && input.dataset.atributo === atributo) {
        atualizarInputBonus(atributo, input);
      }
    });

    // Status (Saúde, Energia, Fadiga)
    const statusAtributos = ['saude', 'energia', 'fadiga'];
    statusAtributos.forEach(status => {
      const input = document.querySelector(`[data-status-bonus="${status}"]`);
      if (input) {
        atualizarInputBonus(status, input);
      }
    });

    console.log('✅ Campos de bônus atualizados no DOM');
  }

  /**
   * Ciclo completo de recálculo e atualização
   * ✅ REATIVADO - Executa todas as etapas de sincronização
   * 
   * Fluxo:
   * 1. Recalcula bônus a partir das aptidões
   * 2. Atualiza AtributosManager.atributosBonusAptidoes
   * 3. Atualiza campos de bônus nos popups (readonly)
   * 4. Atualiza campos de status (readonly)
   * 5. Renderiza atributos na tela principal
   */
  function cicloCompletoAtualizacao() {
    console.log('🔄 [BonusCalculator] Iniciando ciclo completo de atualização...');

    try {
      // 0️⃣ NOVO: Garantir que secundários estão calculados
      // CRÍTICO para bônus percentuais (ex: +20% Prontidão, +10% Defesa)
      if (window.atributosConfigModal && typeof window.atributosConfigModal.calcularAtributosSecundarios === 'function') {
        console.log('📊 [BonusCalculator] Recalculando atributos secundários...');
        window.atributosConfigModal.calcularAtributosSecundarios();
      }

      // 0.5️⃣ NOVO: Sincronizar AtributosManager com StateManager
      // Garante que personagemData.secundarios está atualizado para cálculo de percentuais
      if (window.atributosManager && typeof window.atributosManager.syncWithState === 'function') {
        console.log('🔄 [BonusCalculator] Sincronizando AtributosManager...');
        window.atributosManager.syncWithState();
      }

      // 1️⃣ Recalcular bônus
      recalcularBonusAptidoesAPartirDasAptidoes();

      // 2️⃣ Atualizar AtributosManager
      atualizarAtributosManager();

      // 3️⃣ Atualizar popups
      atualizarTodosBonusNosPopups();

      // 4️⃣ Atualizar status
      atualizarBonusStatus();

      // 5️⃣ Renderizar tela principal
      if (window.atributosManager && typeof window.atributosManager.renderizarAtributos === 'function') {
        window.atributosManager.renderizarAtributos();
        console.log('✅ Atributos renderizados na tela principal');
      }

      console.log('✅ Ciclo completo concluído com sucesso');
    } catch (error) {
      console.error('❌ Erro no ciclo completo:', error);
    }
  }

  /**
   * Atualiza os valores de bônus nos campos do modal de status
   * Se o modal está aberto, atualiza em tempo real
   */
  function atualizarBonusStatus() {
    console.log('📝 [BonusCalculator] Atualizando bônus nos campos de status...');

    const statusMap = {
      hp: 'saude',
      energy: 'energia',
      fatigue: 'fadiga'
    };

    for (const [statusType, atributo] of Object.entries(statusMap)) {
      const bonusValue = bonusAptidoes[atributo] || 0;
      console.log(`  📊 ${atributo}: bonusAptidoes[${atributo}] = ${bonusValue}`);

      // Se o StatusConfigModal está aberto, atualizar também
      if (window.statusConfigModal && window.statusConfigModal.state) {
        const state = window.statusConfigModal.state;
        if (state.tempValues[statusType]) {
          state.tempValues[statusType].bonus = bonusValue;
          console.log(`  💡 StatusConfigModal.state.tempValues[${statusType}].bonus = ${bonusValue}`);
        }
      }
      
      // Fallback para StatusConfigModal (capitalize)
      if (window.StatusConfigModal && window.StatusConfigModal.state) {
        const state = window.StatusConfigModal.state;
        if (state.tempValues[statusType]) {
          state.tempValues[statusType].bonus = bonusValue;
          console.log(`  💡 StatusConfigModal (capitalize).state.tempValues[${statusType}].bonus = ${bonusValue}`);
        }
      }

      // Procurar por elementos com data-status-bonus
      const inputs = document.querySelectorAll(`[data-status-bonus="${statusType}"]`);
      inputs.forEach(input => {
        input.value = bonusValue;
      });
    }

    // Se modal de status está aberto, atualizar exibição
    if (window.statusConfigModal && window.statusConfigModal.state && window.statusConfigModal.state.isOpen) {
      try {
        const bonusSpan = document.getElementById('status-config-bonus-value');
        if (bonusSpan) {
          const statusType = window.statusConfigModal.state.activeStatus;
          const statusMap = { hp: 'saude', energy: 'energia', fatigue: 'fadiga' };
          const bonusValue = bonusAptidoes[statusMap[statusType]] || 0;
          bonusSpan.textContent = bonusValue;
          console.log(`  ✏️ Atualizando span #status-config-bonus-value = ${bonusValue}`);
        }
      } catch (e) {
        console.warn('⚠️ Erro ao atualizar span de bônus (statusConfigModal):', e.message);
      }
    }
    
    // Fallback para StatusConfigModal (capitalize)
    if (window.StatusConfigModal && window.StatusConfigModal.state && window.StatusConfigModal.state.isOpen) {
      try {
        const bonusSpan = document.getElementById('status-config-bonus-value');
        if (bonusSpan) {
          const statusType = window.StatusConfigModal.state.activeStatus;
          const statusMap = { hp: 'saude', energy: 'energia', fatigue: 'fadiga' };
          const bonusValue = bonusAptidoes[statusMap[statusType]] || 0;
          bonusSpan.textContent = bonusValue;
          console.log(`  ✏️ Atualizando span #status-config-bonus-value (capitalize) = ${bonusValue}`);
        }
      } catch (e) {
        console.warn('⚠️ Erro ao atualizar span de bônus (StatusConfigModal):', e.message);
      }
    }

    console.log('✅ Bônus de status atualizados');
  }

  /**
   * Atualiza o objeto atributosBonusAptidoes no AtributosManager
   */
  function atualizarAtributosManager() {
    if (!window.atributosManager || !window.atributosManager.personagemData) {
      console.warn('⚠️ AtributosManager não disponível');
      return;
    }

    const data = window.atributosManager.personagemData;
    if (!data.atributosBonusAptidoes) {
      data.atributosBonusAptidoes = {};
    }

    // Copiar bônus calculados
    for (const [atributo, valor] of Object.entries(bonusAptidoes)) {
      data.atributosBonusAptidoes[atributo] = valor;
    }

    console.log('✅ AtributosManager.atributosBonusAptidoes atualizado:', data.atributosBonusAptidoes);
  }

  /**
   * Define manualmente os bônus (para testes ou sincronização)
   */
  function setBonusManual(atributo, valor) {
    if (bonusAptidoes.hasOwnProperty(atributo)) {
      bonusAptidoes[atributo] = valor;
      console.log(`🔧 Bônus manual definido: ${atributo} = ${valor}`);
    }
  }

  /**
   * Retorna o bônus de um atributo específico
   */
  function getBonus(atributo) {
    const bonus = bonusAptidoes[atributo] || 0;
    if (atributo === 'saude' || atributo === 'energia' || atributo === 'fadiga') {
      console.log(`📊 BonusCalculator.getBonus('${atributo}') = ${bonus}, bonusAptidoes atual:`, bonusAptidoes);
    }
    return bonus;
  }

  /**
   * Verifica se um atributo recebe bônus
   */
  function temBonus(atributo) {
    return bonusAptidoes[atributo] > 0;
  }

  /**
   * Reseta todos os bônus (para debug)
   */
  function reset() {
    for (const attr in bonusAptidoes) {
      bonusAptidoes[attr] = 0;
    }
    Object.keys(aptidoesBonus).forEach(key => delete aptidoesBonus[key]);
    console.log('🔄 BonusCalculator resetado');
  }

  // ============================================
  // API Pública
  // ============================================
  return {
    getBonusAptidoes,
    recalcularBonusAptidoesAPartirDasAptidoes,
    cicloCompletoAtualizacao,
    atualizarTodosBonusNosPopups,
    atualizarBonusStatus,
    atualizarAtributosManager,
    setBonusManual,
    getBonus,
    temBonus,
    reset,
    inicializarBonusAptidoes
  };
})();

// Garantir que está disponível globalmente
if (typeof window !== 'undefined') {
  window.bonusCalculator = BonusCalculator;
}
