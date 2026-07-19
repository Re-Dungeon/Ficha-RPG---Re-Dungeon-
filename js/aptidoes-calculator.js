/**
 * AptidoesCalculator - Lógica pura de cálculos de aptidões
 * Responsável por: máximo de níveis, pontos para próximo incremento
 */

const AptidoesCalculator = (() => {
  /**
   * Obtém os atributos primários (tenta múltiplas fontes)
   * @returns {object} Objeto com forca, vitalidade, agilidade, inteligencia, percepcao
   */
  function obterAtributosPrimarios() {
    // Prioridade 1: AtributosManager (fonte de verdade)
    // AtributosManager.personagemData.atributos contém NÚMEROS simples (10, 15, 20, etc.)
    if (window.atributosManager && window.atributosManager.personagemData) {
      const data = window.atributosManager.personagemData;
      
      // ✅ IMPORTANTE: personagemData.atributos já tem os valores TOTAIS
      // (não precisa somar base+extra+bonus, pois syncWithState já faz isso)
      const resultado = {
        forca: data.atributos?.forca || 0,
        vitalidade: data.atributos?.vitalidade || 0,
        agilidade: data.atributos?.agilidade || 0,
        inteligencia: data.atributos?.inteligencia || 0,
        percepcao: data.atributos?.percepcao || 0
      };
      
      console.log('📊 [AptidoesCalculator] Atributos de AtributosManager.personagemData:', resultado);
      console.table(resultado);
      return resultado;
    }

    // Prioridade 2: StateManager (fallback)
    if (window.appState) {
      const state = window.appState.getState();
      if (state.atributos && state.atributos.primarios) {
        const resultado = {
          forca: state.atributos.primarios.forca?.total || 0,
          vitalidade: state.atributos.primarios.vitalidade?.total || 0,
          agilidade: state.atributos.primarios.agilidade?.total || 0,
          inteligencia: state.atributos.primarios.inteligencia?.total || 0,
          percepcao: state.atributos.primarios.percepcao?.total || 0
        };
        console.log('📊 [AptidoesCalculator] Atributos do StateManager (fallback):', resultado);
        return resultado;
      }
    }

    // Fallback padrão
    console.warn('⚠️ [AptidoesCalculator] Usando fallback padrão para atributos');
    console.warn('⚠️ window.atributosManager:', window.atributosManager);
    console.warn('⚠️ window.atributosManager?.personagemData?.atributos:', window.atributosManager?.personagemData?.atributos);
    console.warn('⚠️ window.appState:', window.appState);
    return {
      forca: 10,
      vitalidade: 10,
      agilidade: 10,
      inteligencia: 10,
      percepcao: 10
    };
  }

  /**
   * Calcula a soma dos atributos primários (sem Sorte)
   * @returns {number} Soma total dos atributos primários
   */
  function calcularSomaAtributos() {
    const atributos = obterAtributosPrimarios();
    
    const soma = (
      atributos.forca +
      atributos.vitalidade +
      atributos.agilidade +
      atributos.inteligencia +
      atributos.percepcao
    );

    console.log('➕ [AptidoesCalculator] Soma de atributos:');
    console.log('   Força:', atributos.forca);
    console.log('   Vitalidade:', atributos.vitalidade);
    console.log('   Agilidade:', atributos.agilidade);
    console.log('   Inteligência:', atributos.inteligencia);
    console.log('   Percepção:', atributos.percepcao);
    console.log('   ═════════════════════');
    console.log('   TOTAL:', soma);
    
    return soma;
  }

  /**
   * Calcula o máximo de níveis base pela fórmula
   * Fórmula: ROUND(somaAtributos / 20 + 3)
   * @param {number} somaAtributos - Soma dos atributos primários
   * @returns {number} Máximo base arredondado
   */
  function calcularMaximoBase(somaAtributos) {
    return Math.round(somaAtributos / 20 + 3);
  }

  /**
   * Obtém quantos níveis foram ganhos
   * @returns {number} Campo "Ganhas" do aptidoesManager
   */
  function obterGanhas() {
    if (window.aptidoesManager && window.aptidoesManager.configAptidoes) {
      return window.aptidoesManager.configAptidoes.ganhas || 0;
    }
    if (window.appState) {
      return window.appState.getState().aptidoes?.ganhas || 0;
    }
    return 0;
  }

  /**
   * Calcula o máximo final incluindo modificadores
   * Fórmula: maximoBase + adicionalNiveis + ganhasNiveis
   * @returns {number} Máximo final com modificadores
   */
  function calcularMaximoFinal() {
    const somaAtributos = calcularSomaAtributos();
    const maxBase = calcularMaximoBase(somaAtributos);
    
    const ganhas = obterGanhas();
    const adicionalNiveis = 0; // Para uso futuro
    
    const maxFinal = maxBase + adicionalNiveis + ganhas;
    
    console.log('🎯 [AptidoesCalculator] Máximo Final:', {
      somaAtributos,
      maxBase,
      ganhas,
      adicionalNiveis,
      maxFinal,
      calculo: `${maxBase} + ${adicionalNiveis} + ${ganhas} = ${maxFinal}`
    });
    
    return maxFinal;
  }

  /**
   * Calcula quantos pontos de atributo faltam para próximo +1 máximo
   * Simula incremento progressivo até encontrar novo máximo
   * @returns {number} Pontos faltantes para próximo incremento (0 = já aumenta)
   */
  function calcularAtributoPraProximoMaximo() {
    const somaAtual = calcularSomaAtributos();
    const maxAtual = calcularMaximoBase(somaAtual);

    // Simular incremento progressivo
    for (let i = 1; i <= 100; i++) {
      const novoMax = calcularMaximoBase(somaAtual + i);
      if (novoMax > maxAtual) {
        return i;
      }
    }

    // Se não encontrou incremento até 100, retorna 0 (overflow)
    return 0;
  }

  /**
   * Verifica se pode adicionar nova aptidão
   * @param {number} nivelAtual - Nível atual de aptidões
   * @returns {boolean} True se pode adicionar
   */
  function podeAdicionarAptidao(nivelAtual) {
    const maxFinal = calcularMaximoFinal();
    return nivelAtual < maxFinal;
  }

  /**
   * Verifica se pode fazer upgrade em aptidão
   * @returns {boolean} True se pode fazer upgrade
   */
  function podeUpgradeAptidao() {
    if (!window.appState) return false; // Guard clause
    const state = window.appState.getState();
    const maxFinal = calcularMaximoFinal();
    return state.aptidoes.atual < maxFinal;
  }

  /**
   * Retorna informações completas de aptidões
   * @returns {Object} Objeto com maximo, atributoProxima e validações
   */
  function obterInfoAptidoes() {
    const somaAtributos = calcularSomaAtributos();
    const maxBase = calcularMaximoBase(somaAtributos);
    const maxFinal = calcularMaximoFinal();
    const ganhas = obterGanhas();

    // Obter nível atual de aptidões
    let nivelAtual = 0;
    if (window.aptidoesManager) {
      nivelAtual = window.aptidoesManager.getAtualTotal?.() || 0;
    }

    const atributoProxima = calcularAtributoPraProximoMaximo();

    console.log('🎯 [AptidoesCalculator] ═══════════════════════════════════');
    console.log('🎯 [AptidoesCalculator] RESULTADO FINAL DE APTIDÕES:');
    console.log('🎯   Soma Atributos:', somaAtributos);
    console.log('🎯   Máximo Base (soma/20 + 3):', maxBase);
    console.log('🎯   Ganhas (níveis bônus):', ganhas);
    console.log('🎯   MÁXIMO FINAL:', maxFinal, '← ESTE VALOR VAI NO CAMPO!');
    console.log('🎯   Atributo p/ +1 Máx:', atributoProxima === 0 ? 'Já aumenta!' : `${atributoProxima} pts`);
    console.log('🎯   Nível Atual:', nivelAtual);
    console.log('🎯 [AptidoesCalculator] ═══════════════════════════════════');

    return {
      maximo: maxFinal,
      atributoProxima: atributoProxima,
      podeAdicionar: podeAdicionarAptidao(nivelAtual),
      podeUpgrade: podeUpgradeAptidao(),
      somaAtributos: somaAtributos,
      maxBase: maxBase,
      ganhas: ganhas,
      adicionalNiveis: 0,
      nivelAtual: nivelAtual,
    };
  }

  /**
   * ✅ NOVO: Cache-busting para forçar recálculo dos atributos
   * Usado quando atributos são modificados na aba de atributos
   */
  function invalidateCache() {
    console.log('🔄 [AptidoesCalculator] Invalidando cache - próxima chamada refazará cálculos com dados atualizados');
    // Em um IIFE, não há variáveis em cache a limpar
    // Mas chamamos obterAtributosPrimarios() novamente para refrescar dados
  }

  // Retorno público
  return {
    calcularSomaAtributos,
    calcularMaximoBase,
    calcularMaximoFinal,
    calcularAtributoPraProximoMaximo,
    podeAdicionarAptidao,
    podeUpgradeAptidao,
    obterInfoAptidoes,
    invalidateCache,
  };
})();
