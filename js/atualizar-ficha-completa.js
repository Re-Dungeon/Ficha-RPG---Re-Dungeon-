/* ================================================= */
/* ATUALIZAR-FICHA-COMPLETA.JS */
/* Orquestrador de Sincronização Completa da Ficha */
/* ================================================= */

/**
 * AtualizarFichaCompleta
 * Responsável por:
 * - Orquestrar atualização completa e segura da ficha
 * - Recalcular APENAS os bônus de aptidões
 * - Sincronizar valores através de todos os sistemas
 * - Atualizar popups e renderização visual
 * - NUNCA alterar valores base ou duplicar bônus
 * 
 * Fluxo Seguro:
 * 1. Recalcular bônus de aptidões (única fonte de verdade: BonusCalculator)
 * 2. Reaplicar bônus no objeto global (atributosBonusAptidoes)
 * 3. Atualizar campos de bônus nos popups
 * 4. Recalcular atributos secundários com base nos primários atualizados
 * 5. Atualizar status baseado em atributos
 * 6. Re-renderizar tudo
 * 7. Salvar no localStorage
 */

const AtualizarFichaCompleta = (() => {
  /**
   * 🔄 ETAPA 1: Recalcular bônus de aptidões
   * Única operação que vai contra o banco de dados de aptidões
   * Respeita os tipos de bônus definidos no VantagensAptidoesSystem
   */
  function etapa1_RecalcularBonusAptidoes() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║ 1️⃣  RECALCULANDO BÔNUS DE APTIDÕES        ║');
    console.log('╚════════════════════════════════════════════╝');

    try {
      // Usar BonusCalculator que já tem toda a lógica de cálculo
      if (window.bonusCalculator && typeof window.bonusCalculator.cicloCompletoAtualizacao === 'function') {
        window.bonusCalculator.cicloCompletoAtualizacao();
        console.log('✅ BonusCalculator: Ciclo completo executado');
        return true;
      } else {
        console.warn('⚠️  BonusCalculator.cicloCompletoAtualizacao não disponível');
        
        // Fallback: Tentar VantagensAptidoesSystem
        if (window.vantagensAptidoesSystem && typeof window.vantagensAptidoesSystem.recalcularBonusAptidoesAPartirDasAptidoes === 'function') {
          window.vantagensAptidoesSystem.recalcularBonusAptidoesAPartirDasAptidoes();
          console.log('✅ VantagensAptidoesSystem: Recálculo executado (fallback)');
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao recalcular bônus de aptidões:', error);
      return false;
    }
    
    return false;
  }

  /**
   * 🔄 ETAPA 2: Sincronizar atributos primários
   * Reaplicar os bônus de aptidões no objeto global
   * NÃO altera valores base, apenas aplica os bônus
   */
  function etapa2_SincronizarPrimarios() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║ 2️⃣  SINCRONIZANDO ATRIBUTOS PRIMÁRIOS     ║');
    console.log('╚════════════════════════════════════════════╝');

    try {
      const stateManager = window.appState;
      if (!stateManager) {
        console.warn('⚠️  StateManager (appState) não disponível');
        return false;
      }

      const state = stateManager.getState();
      if (!state || !state.atributos || !state.atributos.primarios) {
        console.warn('⚠️  Estado de atributos primários não encontrado');
        return false;
      }

      // Obter bônus de aptidões do BonusCalculator
      const bonusAptidoes = window.bonusCalculator?.getBonusAptidoes?.() || {};
      
      const primarios = state.atributos.primarios;
      const atributosPrimarios = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'];

      console.log('  → Reaplicando bônus de aptidões nos primários:');
      
      atributosPrimarios.forEach(attr => {
        if (!primarios[attr]) {
          primarios[attr] = { base: 0, extra: 0, bonus: 0, total: 0 };
        }

        // ⚠️ CRÍTICO: SUBSTITUIR o campo .bonus com bônus recalculados
        // NÃO SOMAR! O campo .bonus é APENAS para bônus de aptidões
        // Precisa ser SUBSTITUÍDO, não ADICIONADO
        const bonusAptidao = bonusAptidoes[attr] || 0;
        const base = primarios[attr].base || 0;
        const extra = primarios[attr].extra || 0;

        // TOTAL = base + extra + bonusAptidoes (NUNCA bonusManual duplicado!)
        const total = base + extra + bonusAptidao;

        console.log(`    ${attr}: ${base} + ${extra} + ${bonusAptidao}(apt) = ${total}`);

        // ✅ SUBSTITUIR o bônus, não somar
        primarios[attr].bonus = bonusAptidao;
        primarios[attr].total = total;
      });

      console.log('✅ Atributos primários sincronizados');
      return true;
    } catch (error) {
      console.error('❌ Erro ao sincronizar primários:', error);
      return false;
    }
  }

  /**
   * 🔄 ETAPA 3: Sincronizar atributos secundários
   * Recalcular com base nos primários já atualizados
   * ✅ IMPORTANTE: Aplicar bônus de aptidão aos secundários também!
   */
  function etapa3_SincronizarSecundarios() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║ 3️⃣  SINCRONIZANDO ATRIBUTOS SECUNDÁRIOS   ║');
    console.log('╚════════════════════════════════════════════╝');

    try {
      const stateManager = window.appState;
      if (!stateManager) {
        console.warn('⚠️  StateManager não disponível');
        return false;
      }

      const state = stateManager.getState();
      if (!state.atributos) {
        console.warn('⚠️  Atributos não encontrados');
        return false;
      }

      // ✅ NOVO: Garantir estrutura de secundários
      if (!state.atributos.secundarios) {
        state.atributos.secundarios = {};
      }

      // ✅ NOVO: Obter bônus de aptidão para sincronizar
      const bonusAptidoes = window.bonusCalculator?.getBonusAptidoes?.() || {};
      console.log('  → Bônus de aptidão para secundários:', bonusAptidoes);

      const secundarios = state.atributos.secundarios;
      const atributosSecundarios = ['prontidao', 'ataque', 'defesa', 'reacao', 'precisao', 'evasao'];

      console.log('  → Aplicando bônus de aptidão aos secundários:');
      
      atributosSecundarios.forEach(attr => {
        if (!secundarios[attr]) {
          secundarios[attr] = { base: 0, extra: 0, bonus: 0, total: 0 };
        }

        // ✅ CRUCIAL: Sincronizar o bonus de aptidão
        const bonusAptidao = bonusAptidoes[attr] || 0;
        secundarios[attr].bonus = bonusAptidao;

        console.log(`    ${attr}: bonus de aptidão = ${bonusAptidao}`);
      });

      // ✅ Recalcular fórmulas com os bônus sincronizados
      if (window.atributosConfigModal && typeof window.atributosConfigModal.calcularAtributosSecundarios === 'function') {
        window.atributosConfigModal.calcularAtributosSecundarios();
        console.log('✅ Secundários recalculados com bônus sincronizados');
        return true;
      }

      console.warn('⚠️  AtributosConfigModal.calcularAtributosSecundarios não disponível');
      return false;
    } catch (error) {
      console.error('❌ Erro ao sincronizar secundários:', error);
      return false;
    }
  }

  /**
   * 🔄 ETAPA 4: Atualizar status (Saúde, Energia, Fadiga)
   * Aplicar bônus de aptidões aos valores de status
   * Sincronizar com StatusBarsManager
   */
  function etapa4_AtualizarStatus() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║ 4️⃣  ATUALIZANDO STATUS                     ║');
    console.log('╚════════════════════════════════════════════╝');

    try {
      const stateManager = window.appState;
      if (!stateManager) {
        console.warn('⚠️  StateManager não disponível');
        return false;
      }

      const state = stateManager.getState();
      if (!state || !state.status || !state.atributos) {
        console.warn('⚠️  Estado de status ou atributos não encontrado');
        return false;
      }

      console.log('  → Recalculando máximos de status:');

      // Obter atributos primários para cálculo
      const primarios = state.atributos.primarios || {};
      const FOR = primarios.forca?.total || 0;
      const VIT = primarios.vitalidade?.total || 0;
      const INT = primarios.inteligencia?.total || 0;
      const PER = primarios.percepcao?.total || 0;
      const SOR = primarios.sorte?.total || 0;

      console.log(`    Primários: FOR=${FOR}, VIT=${VIT}, INT=${INT}, PER=${PER}, SOR=${SOR}`);

      // ✅ CORRIGIDO: Mapear corretamente as chaves de status
      // AppState usa 'hp', 'energia', 'fadiga' (não 'energy' ou 'fatigue')
      const statusTypes = [
        { stateKey: 'hp', managerKey: 'hp', name: 'SAÚDE' },
        { stateKey: 'energia', managerKey: 'energy', name: 'ENERGIA' },
        { stateKey: 'fadiga', managerKey: 'fatigue', name: 'FADIGA' }
      ];

      statusTypes.forEach(statusType => {
        const statusData = state.status[statusType.stateKey];
        if (!statusData) {
          console.warn(`    ⚠️  ${statusType.name} não encontrada em state.status[${statusType.stateKey}]`);
          console.log(`    Chaves disponíveis em state.status:`, Object.keys(state.status));
          return;
        }

        // ✅ CORRIGIDO: Obter bonus do BonusCalculator (mais confiável que StatusBarsManager)
        let base = 0;
        let extra = 0;
        let bonus = 0;

        if (window.statusBarsManager && window.statusBarsManager.state && window.statusBarsManager.state[statusType.managerKey]) {
          const sbmStatus = window.statusBarsManager.state[statusType.managerKey];
          base = sbmStatus.base || 0;
          extra = sbmStatus.extra || 0;
          // ⭐ IMPORTANTE: Usar BonusCalculator para bonus (não StatusBarsManager que pode estar desatualizado)
          bonus = sbmStatus.bonus || 0;
          console.log(`    ${statusType.name} (StatusBarsManager): base=${base}, extra=${extra}, bonus=${bonus}`);
        }

        // ✅ NOVO: Sincronizar bonus do BonusCalculator
        const bonusKey = statusType.stateKey === 'hp' ? 'saude' : statusType.stateKey === 'energia' ? 'energia' : 'fadiga';
        console.log(`    [DIAGNÓSTICO] ${statusType.name}: bonusKey="${bonusKey}", BonusCalculator disponível: ${!!window.bonusCalculator}`);
        if (window.bonusCalculator && typeof window.bonusCalculator.getBonus === 'function') {
          const bonusAtualizado = window.bonusCalculator.getBonus(bonusKey) || 0;
          console.log(`    [DIAGNÓSTICO] ${statusType.name}: getBonus("${bonusKey}") retornou: ${bonusAtualizado}`);
          if (bonusAtualizado !== bonus) {
            console.log(`    ${statusType.name}: bonus atualizado de ${bonus} para ${bonusAtualizado} (via BonusCalculator)`);
            bonus = bonusAtualizado;
          } else {
            console.log(`    ${statusType.name}: bonus mantido em ${bonus} (sem mudanças)`);
          }
        } else {
          console.warn(`    [DIAGNÓSTICO] ${statusType.name}: BonusCalculator.getBonus não disponível!`);
        }

        let maximoCalculado = 0;

        // Calcular máximo baseado no tipo de status
        if (statusType.stateKey === 'hp') {
          // MÁXIMO SAÚDE = ceil(((FOR × 0.3) + (VIT × 0.6) + (SOR × 0.1)) × 2) + (base + extra + bonus)
          const soma = (FOR * 0.3) + (VIT * 0.6) + (SOR * 0.1);
          maximoCalculado = Math.ceil(soma * 2);
          console.log(`    ${statusType.name}: ceil((${FOR}×0.3 + ${VIT}×0.6 + ${SOR}×0.1) × 2) = ${maximoCalculado}`);
        } else if (statusType.stateKey === 'energia') {
          // MÁXIMO ENERGIA = ceil(((INT × 0.6) + (PER × 0.3) + (SOR × 0.1)) × 1.333333) + (base + extra + bonus)
          const soma = (INT * 0.6) + (PER * 0.3) + (SOR * 0.1);
          maximoCalculado = Math.ceil(soma * (200 / 150));
          console.log(`    ${statusType.name}: ceil((${INT}×0.6 + ${PER}×0.3 + ${SOR}×0.1) × 1.333) = ${maximoCalculado}`);
        } else if (statusType.stateKey === 'fadiga') {
          // MÁXIMO FADIGA = ceil((FOR × 0.3) + (VIT × 0.5) + (SOR × 0.2)) + (base + extra + bonus)
          const soma = (FOR * 0.3) + (VIT * 0.5) + (SOR * 0.2);
          maximoCalculado = Math.ceil(soma);
          console.log(`    ${statusType.name}: ceil(${FOR}×0.3 + ${VIT}×0.5 + ${SOR}×0.2) = ${maximoCalculado}`);
        }

        // Máximo final = calculado + (base + extra + bonus)
        const maximoFinal = maximoCalculado + (base + extra + bonus);

        // ✅ Atualizar AppState
        statusData.maximo = maximoFinal;
        statusData.atual = maximoFinal; // ✅ Atual = Máximo

        console.log(`      Máximo final DETALHADO:`);
        console.log(`        Fórmula: ${maximoCalculado} + (base:${base} + extra:${extra} + bonus:${bonus})`);
        console.log(`        Cálculo: ${maximoCalculado} + ${base} + ${extra} + ${bonus} = ${maximoFinal}`);
        console.log(`        ✅ Valor SALVO em state.status[${statusType.stateKey}].maximo = ${statusData.maximo}`);
        console.log(`        ✅ Valor SALVO em state.status[${statusType.stateKey}].atual = ${statusData.atual}`);

        // ✅ Atualizar StatusBarsManager também
        if (window.statusBarsManager && window.statusBarsManager.state && window.statusBarsManager.state[statusType.managerKey]) {
          window.statusBarsManager.state[statusType.managerKey].max = maximoFinal;
          window.statusBarsManager.state[statusType.managerKey].current = maximoFinal; // ✅ Current = Max
          window.statusBarsManager.state[statusType.managerKey].bonus = bonus; // ✅ Sincronizar bonus também!
          console.log(`      ✅ StatusBarsManager.${statusType.managerKey} atualizado (current=max=bonus: ${maximoFinal})`);
        }

        // ⭐ NOVO: Atualizar StatusConfigModal.tempValues também (se modal está aberto)
        if (window.statusConfigModal && window.statusConfigModal.state && window.statusConfigModal.state.tempValues) {
          const modalStateKey = statusType.stateKey; // Usa 'hp', 'energia', 'fadiga'
          if (window.statusConfigModal.state.tempValues[modalStateKey]) {
            window.statusConfigModal.state.tempValues[modalStateKey].current = maximoFinal;
            window.statusConfigModal.state.tempValues[modalStateKey].maximum = maximoFinal;
            window.statusConfigModal.state.tempValues[modalStateKey].bonus = bonus;
            window.statusConfigModal.state.tempValues[modalStateKey].base = base;
            window.statusConfigModal.state.tempValues[modalStateKey].extra = extra;
            console.log(`      ✅ StatusConfigModal.tempValues[${modalStateKey}] sincronizado`);
          }
        }
      });

      // ⭐ NOVO: Sincronizar os 3 status diretamente (sem chamar saveChanges que fecha o modal)
      // Isso garante que os máximos do modal são persistidos no StatusBarsManager e AppState
      const statusTypesModal = ['hp', 'energy', 'fatigue'];
      const appStateStatusMap = { hp: 'hp', energy: 'energia', fatigue: 'fadiga' };
      const statusTypesLabels = { hp: 'Saúde', energy: 'Energia', fatigue: 'Fadiga' };

      statusTypesModal.forEach(statusType => {
        try {
          const values = window.statusConfigModal?.state?.tempValues?.[statusType];
          if (!values || typeof values !== 'object' || !values.current) return;

          console.log(`  → Persistindo ${statusTypesLabels[statusType]}...`);

          // Persistir no StatusBarsManager.state
          if (window.statusBarsManager && window.statusBarsManager.state && window.statusBarsManager.state[statusType]) {
            window.statusBarsManager.state[statusType].current = values.current || 0;
            window.statusBarsManager.state[statusType].base = values.base || 0;
            window.statusBarsManager.state[statusType].extra = values.extra || 0;
            window.statusBarsManager.state[statusType].bonus = values.bonus || 0;
            window.statusBarsManager.state[statusType].max = values.maximum || 0;
            console.log(`    ✅ StatusBarsManager.${statusType} sincronizado`);
          }

          // Persistir no AppState usando as chaves corretas de status
          const stateManager = window.appState;
          if (stateManager) {
            const state = stateManager.getState();
            if (!state.status) state.status = {};
            const appStateKey = appStateStatusMap[statusType] || statusType;
            if (!state.status[appStateKey]) state.status[appStateKey] = {};
            state.status[appStateKey].atual = values.current || 0;
            state.status[appStateKey].maximo = values.maximum || 0;
            stateManager.setState(state);
            console.log(`    ✅ AppState.${appStateKey} sincronizado`);
          }
        } catch (e) {
          console.warn(`  ⚠️ Erro ao sincronizar ${statusTypesLabels[statusType]}:`, e.message);
        }
      });

      console.log('✅ Status recalculado e sincronizado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return false;
    }
  }

  /**
   * 🔄 ETAPA 5: Sincronizar popups com os novos valores
   * Se algum popup estiver aberto, atualizar os campos de bônus
   */
  function etapa5_SincronizarPopups() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║ 5️⃣  SINCRONIZANDO POPUPS                  ║');
    console.log('╚════════════════════════════════════════════╝');

    try {
      // ⭐ SEGURO: Só sincronizar se modais existem e têm dados válidos
      const bonusAptidoes = window.bonusCalculator?.getBonusAptidoes?.() || {};
      
      // Sincronizar AtributosConfigModal (se aberto)
      if (window.atributosConfigModal && window.atributosConfigModal.state) {
        try {
          const state = window.atributosConfigModal.state;
          const atributoAtual = state.statusType;
          
          if (atributoAtual && bonusAptidoes[atributoAtual] !== undefined) {
            console.log(`  → Atualizando popup de ${atributoAtual}`);
            if (state.tempValues && state.tempValues[atributoAtual]) {
              state.tempValues[atributoAtual].bonus = bonusAptidoes[atributoAtual];
              console.log(`    ✅ Bônus de ${atributoAtual} = ${bonusAptidoes[atributoAtual]}`);
            }
          }
        } catch (e) {
          console.warn('  ⚠️ Erro ao sincronizar AtributosConfigModal:', e.message);
        }
      }

      // Sincronizar StatusConfigModal (se aberto)
      if (window.statusConfigModal && window.statusConfigModal.state && window.statusConfigModal.state.activeStatus) {
        try {
          const state = window.statusConfigModal.state;
          const statusAtual = state.activeStatus;
          
          if (statusAtual && state.tempValues && state.tempValues[statusAtual]) {
            const statusTypeMap = {
              'hp': 'saude',
              'energy': 'energia',
              'fatigue': 'fadiga'
            };
            const atributo = statusTypeMap[statusAtual];
            
            if (atributo && bonusAptidoes[atributo] !== undefined) {
              console.log(`  → Atualizando popup de ${atributo}`);
              state.tempValues[statusAtual].bonus = bonusAptidoes[atributo];
              console.log(`    ✅ Bônus de ${atributo} = ${bonusAptidoes[atributo]}`);
            }
          }
          
          // ⭐ NOVO: Recalcular máximo no modal após etapa4
          // Isso garante que se o modal está aberto, ele mostra o valor máximo atualizado
          if (typeof window.statusConfigModal.updateMaxValue === 'function') {
            console.log(`  → Recalculando máximo no StatusConfigModal...`);
            window.statusConfigModal.updateMaxValue();
            console.log(`    ✅ Máximo recalculado no modal`);
          }

          // ⭐ NOVO: Atualizar a UI do modal se estiver aberto
          if (typeof window.statusConfigModal.updateUI === 'function') {
            console.log(`  → Atualizando UI do StatusConfigModal...`);
            window.statusConfigModal.updateUI();
            console.log(`    ✅ UI do modal atualizada`);
          }
        } catch (e) {
          console.warn('  ⚠️ Erro ao sincronizar StatusConfigModal:', e.message);
        }
      }

      console.log('✅ Popups sincronizados');
      return true;
    } catch (error) {
      console.error('❌ Erro ao sincronizar popups:', error);
      return false;
    }
  }

  /**
   * 🔄 ETAPA 6: Re-renderizar a interface
   * Atualizar todos os elementos visuais
   */
  function etapa6_Renderizar() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║ 6️⃣  RE-RENDERIZANDO INTERFACE              ║');
    console.log('╚════════════════════════════════════════════╝');

    try {
      // Re-renderizar atributos na tela principal
      if (window.atributosManager && typeof window.atributosManager.renderizarAtributos === 'function') {
        window.atributosManager.renderizarAtributos();
        console.log('✅ Atributos renderizados');
      }

      // Re-renderizar SVG primários
      if (window.svgAtributosManager && typeof window.svgAtributosManager.renderizarPrimarios === 'function') {
        window.svgAtributosManager.renderizarPrimarios();
        console.log('✅ SVG primários renderizado');
      }

      // Re-renderizar SVG secundários
      if (window.svgAtributosManager && typeof window.svgAtributosManager.renderizarSecundarios === 'function') {
        window.svgAtributosManager.renderizarSecundarios();
        console.log('✅ SVG secundários renderizado');
      }

      // Re-renderizar personagem
      if (window.atributosManager && typeof window.atributosManager.renderizarPersonagem === 'function') {
        window.atributosManager.renderizarPersonagem();
        console.log('✅ Personagem renderizado');
      }

      // Re-renderizar status bars
      if (window.statusBarsManager && typeof window.statusBarsManager.render === 'function') {
        window.statusBarsManager.render();
        console.log('✅ Status bars renderizado');
      }

      // 🎯 Atualizar a box de status na aba de atributos
      atualizarBoxStatusNaAba();

      console.log('✅ Interface re-renderizada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao renderizar:', error);
      return false;
    }
  }

  /**
   * 🎯 Atualizar a box de status na aba de atributos
   * Sincroniza os valores de Saúde, Energia e Fadiga com os elementos HTML
   */
  function atualizarBoxStatusNaAba() {
    console.log('\n  → Atualizando box de status na aba de atributos...');

    try {
      const stateManager = window.appState;
      if (!stateManager) {
        console.warn('  ⚠️  StateManager não disponível');
        return;
      }

      const state = stateManager.getState();
      if (!state || !state.status) {
        console.warn('  ⚠️  Estado de status não encontrado');
        return;
      }

      // Mapear os nomes dos status para os seletores e fields do AppState
      // Usar hp, energia, fadiga (não saude!)
      const statusMap = {
        'hp': { textElement: '#hp-text', appStateKey: 'hp', managerKey: 'hp' },
        'energia': { textElement: '#energy-text', appStateKey: 'energia', managerKey: 'energy' },
        'fadiga': { textElement: '#fatigue-text', appStateKey: 'fadiga', managerKey: 'fatigue' }
      };

      for (const [statusName, config] of Object.entries(statusMap)) {
        const statusData = state.status[config.appStateKey];

        if (statusData) {
          // Ler valores do AppState (que tem os valores reais)
          const atual = statusData.atual || 0;
          const maximo = statusData.maximo || 101;

          // Atualizar elemento HTML
          const textElement = document.querySelector(config.textElement);
          if (textElement) {
            textElement.textContent = `${atual} / ${maximo}`;
            console.log(`    ✅ ${config.appStateKey}: ${atual} / ${maximo}`);
          } else {
            console.warn(`    ⚠️  Elemento ${config.textElement} não encontrado`);
          }

          // 🔄 SINCRONIZAR COM StatusBarsManager
          if (window.statusBarsManager && window.statusBarsManager.state) {
            window.statusBarsManager.state[config.managerKey].max = maximo;
            window.statusBarsManager.state[config.managerKey].current = atual;
            console.log(`    ✅ StatusBarsManager.${config.managerKey} sincronizado (${atual}/${maximo})`);
          }
        } else {
          console.warn(`    ⚠️  Status ${config.appStateKey} não encontrado no AppState`);
        }
      }

      // Re-renderizar as barras de status com os novos máximos
      if (window.statusBarsManager && typeof window.statusBarsManager.render === 'function') {
        window.statusBarsManager.render();
        console.log('    ✅ Barras de status re-renderizadas com máximos sincronizados');
      }

      console.log('  ✅ Box de status na aba de atributos atualizada');
    } catch (error) {
      console.error('  ❌ Erro ao atualizar box de status na aba:', error);
    }
  }

  /**
   * 🔄 ETAPA 7: DESABILITADA - Salvar em localStorage
   * Persistência foi removida do sistema
   * @deprecated Função desativada - nenhuma persistência ativa
   */
  function etapa7_Salvar() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║ 7️⃣  SALVAR DESABILITADO                    ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('⚠️ Persistência foi removida do sistema');
    return true; // Consideramos como sucesso (nada para salvar)
  }

  /**
   * 🎯 FUNÇÃO PRINCIPAL
   * Orquestra todo o processo de atualização segura da ficha
   * 
   * Executa as 7 etapas em ordem, garantindo que não haja conflitos
   */
  function executar() {
    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  💾 INICIANDO ATUALIZAÇÃO COMPLETA DA FICHA          ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    const resultados = {
      etapa1: false,
      etapa2: false,
      etapa3: false,
      etapa4: false,
      etapa5: false,
      etapa6: false,
      etapa7: false
    };

    // Configuração: por padrão, remover/ignorar sincronização completa de atributos
    // Isso atende ao pedido de "tira os atributos do update".
    // Se for necessário reativar, definir `window.atualizarFichaConfig = { skipAtributos: false }`.
    const config = (typeof window.atualizarFichaConfig === 'object') ? window.atualizarFichaConfig : { skipAtributos: true };
    const skipAtributos = (config.skipAtributos === undefined) ? true : !!config.skipAtributos;

    // Executar etapas em ordem
    resultados.etapa1 = etapa1_RecalcularBonusAptidoes();

    if (skipAtributos) {
      console.log('ℹ️ Pulando sincronização de atributos primários e secundários (skipAtributos=true)');
      // Marcar como sucesso para manter fluxo sem executar as funções que alteram atributos
      resultados.etapa2 = true;
      resultados.etapa3 = true;
    } else {
      resultados.etapa2 = etapa2_SincronizarPrimarios();
      resultados.etapa3 = etapa3_SincronizarSecundarios();
    }

    resultados.etapa4 = etapa4_AtualizarStatus();
    resultados.etapa5 = etapa5_SincronizarPopups();
    resultados.etapa6 = etapa6_Renderizar();
    resultados.etapa7 = etapa7_Salvar();

    // Resumo final
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  📊 RESUMO DE EXECUÇÃO                               ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    let sucessos = 0;
    for (const [etapa, resultado] of Object.entries(resultados)) {
      const status = resultado ? '✅' : '❌';
      console.log(`${status} ${etapa}`);
      if (resultado) sucessos++;
    }

    console.log(`\n📈 ${sucessos}/7 etapas executadas com sucesso`);

    if (sucessos === 7) {
      console.log('\n🎉 ✅ ATUALIZAÇÃO COMPLETA FINALIZADA COM SUCESSO!\n');
      return true;
    } else {
      console.log('\n⚠️  Algumas etapas falharam. Veja os erros acima.\n');
      return false;
    }
  }

  // Exportar interface pública
  return {
    executar,
    etapa1_RecalcularBonusAptidoes,
    etapa2_SincronizarPrimarios,
    etapa3_SincronizarSecundarios,
    etapa4_AtualizarStatus,
    etapa5_SincronizarPopups,
    etapa6_Renderizar,
    etapa7_Salvar
  };
})();

// Tornar disponível globalmente
if (typeof window !== 'undefined') {
  window.atualizarFichaCompleta = AtualizarFichaCompleta;
}
