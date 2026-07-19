/* ============================================ */
/* RENDER-VANTAGENS-APTIDOES.JS                */
/* Sistema de Renderização de Vantagens        */
/* ============================================ */

/**
 * RenderVantagensAptidoes
 * Responsável por:
 * - Renderizar a box "Vantagens Desbloqueadas" com cards
 * - Exibir efeitos narrativos
 * - Mostrar bônus com impacto
 * - Renderizar botões de alternância para bônus opcionais
 */

const RenderVantagensAptidoes = (() => {
  const SELECTOR_VANTAGENS_LIST = '#aptidoes-vantagens-list';

  /**
   * Renderiza a lista de vantagens desbloqueadas como cards
   */
  function renderizar() {
    console.log('🎨 [RenderVantagensAptidoes] Renderizando vantagens desbloqueadas...');

    const container = document.querySelector(SELECTOR_VANTAGENS_LIST);
    if (!container) {
      console.error('❌ Container de vantagens não encontrado:', SELECTOR_VANTAGENS_LIST);
      return;
    }

    // ✅ CARREGAR estado de bônus opcionais ANTES de usar
    if (window.vantagensAptidoesSystem?.carregarEstadoBonusOpcionais) {
      window.vantagensAptidoesSystem.carregarEstadoBonusOpcionais();
      console.log('📂 Estado de bônus opcionais carregado');
    }

    // Obter vantagens desbloqueadas
    const vantagens = window.vantagensAptidoesSystem?.obterVantagensDesbloqueadas?.() || [];

    if (!vantagens || vantagens.length === 0) {
      container.innerHTML = '<div class="aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
      console.log('ℹ️ Nenhuma vantagem para renderizar');
      return;
    }

    console.log(`📌 Renderizando ${vantagens.length} vantagens`);

    // Renderizar cards
    let html = '';
    vantagens.forEach(vant => {
      html += renderizarCardVantagem(vant);
    });

    container.innerHTML = html;

    // Configurar listeners para botões de alternância
    setupListenersAlternancia(container);

    console.log('✅ Vantagens renderizadas com sucesso');
  }

  /**
   * Renderiza um card de vantagem
   */
  function renderizarCardVantagem(vant) {
    const tipoClass = vant.tipo || 'bonus';
    const tipoEmojis = {
      'bonus': '💰',
      'bonus-duplo': '⚡',
      'bonus-percentual': '📊',
      'bonus-opcional': '🔁',
      'efeito': '📝'
    };

    const emoji = tipoEmojis[vant.tipo] || '•';
    const nomeLimpo = vant.aptidaoNome || vant.aptidaoId;

    let html = `<div class="vantagem-item ${tipoClass}">`;
    
    html += `<div class="vantagem-header">`;
    html += `<span class="vantagem-nome ${tipoClass}">${emoji} ${nomeLimpo} - Nível ${vant.nivel}</span>`;
    html += `<span class="vantagem-nivel">Tipo: ${vant.tipo}</span>`;
    html += `</div>`;
    
    // ⚠️ IMPORTANTE: Para bonus-opcional, mostrar o valor ATIVO atualmente
    let textoEfeito = vant.valor;
    if (vant.tipo === 'bonus-opcional' && vant.valorOpcional) {
      const ativoAtualmente = window.vantagensAptidoesSystem?.getBonusOpcionalAtivo?.(vant.aptidaoId, vant.nivel) || 'valor';
      textoEfeito = ativoAtualmente === 'valor' ? vant.valor : vant.valorOpcional;
      console.log(`📊 [DEBUG] Bonus opcional ${vant.aptidaoId} nível ${vant.nivel}: ativo=${ativoAtualmente}, texto=${textoEfeito}`);
    }
    
    html += `<div class="vantagem-efeito">${textoEfeito}</div>`;

    // Se é bônus opcional, mostrar botão de alternância
    if (vant.tipo === 'bonus-opcional' && vant.valorOpcional) {
      const ativoAtualmente = window.vantagensAptidoesSystem?.getBonusOpcionalAtivo?.(vant.aptidaoId, vant.nivel) || 'valor';
      const textoAtivo = ativoAtualmente === 'valor' ? vant.valor : vant.valorOpcional;

      html += `<div class="vantagem-acoes">
        <button class="btn-alternar-bonus-opcional" 
                data-aptidao-id="${vant.aptidaoId}" 
                data-nivel="${vant.nivel}"
                title="Alternar entre: ${vant.valor} e ${vant.valorOpcional}">
          🔁 ${textoAtivo}
        </button>
      </div>`;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Configura listeners para botões de alternância
   */
  function setupListenersAlternancia(container) {
    console.log('⚙️ [setupListenersAlternancia] Inicializando...');

    // Selecionar todos os botões diretamente
    const botoes = container.querySelectorAll('.btn-alternar-bonus-opcional');
    console.log(`📌 Encontrados ${botoes.length} botões de alternância`);

    // Remover listeners antigos
    botoes.forEach((btn) => {
      if (btn._clickHandler) {
        btn.removeEventListener('click', btn._clickHandler);
      }
    });

    // Adicionar listener direto em cada botão
    botoes.forEach((btn, idx) => {
      const aptidaoId = btn.getAttribute('data-aptidao-id');
      const nivel = parseInt(btn.getAttribute('data-nivel'));
      
      console.log(`  ✅ Configurando botão ${idx + 1}: aptidao=${aptidaoId}, nivel=${nivel}`);

      btn._clickHandler = (e) => {
        console.log(`\n🔁 ===== CLIQUE NO BOTÃO ${aptidaoId} NÍVEL ${nivel} =====`);
        e.preventDefault();
        e.stopPropagation();

        console.log(`1️⃣ Alternando bônus opcional`);
        if (window.vantagensAptidoesSystem?.alternarBonusOpcional) {
          const resultado = window.vantagensAptidoesSystem.alternarBonusOpcional(aptidaoId, nivel);
          console.log(`2️⃣ ✅ Alternância executada. Novo estado: ${resultado}`);
          
          // ⚠️ NOVO: Atualizar APENAS o texto do botão e do efeito, SEM re-renderizar
          const vantagem = window.vantagensAptidoesSystem?.obterVantagensDesbloqueadas?.()?.find(v => 
            v.aptidaoId === aptidaoId && v.nivel === nivel
          );
          
          if (vantagem) {
            // Determinar qual texto mostrar
            const novoTexto = resultado === 'valor' ? vantagem.valor : vantagem.valorOpcional;
            
            // Atualizar o texto do botão
            btn.textContent = `🔁 ${novoTexto}`;
            console.log(`   Botão atualizado para: ${novoTexto}`);
            
            // Atualizar o texto do efeito (procurar o elemento .vantagem-efeito anterior)
            const card = btn.closest('.vantagem-item');
            if (card) {
              const efeito = card.querySelector('.vantagem-efeito');
              if (efeito) {
                efeito.textContent = novoTexto;
                console.log(`   Efeito atualizado para: ${novoTexto}`);
              }
            }
          }
        } else {
          console.error(`2️⃣ ❌ vantagensAptidoesSystem.alternarBonusOpcional não disponível!`);
          return;
        }

        console.log(`3️⃣ Salvando estado do bonus opcional...`);
        // ⚠️ CRÍTICO: Salvar o novo estado
        if (window.vantagensAptidoesSystem?.salvarEstadoBonusOpcionais) {
          window.vantagensAptidoesSystem.salvarEstadoBonusOpcionais();
          console.log(`3️⃣ ✅ Estado salvo em localStorage`);
        }

        console.log(`4️⃣ Recalculando bônus...`);
        // ⚠️ Para COMPANHEIROS: Chamar método específico do CompanheirosModal
        if (window.companheirosModalController && typeof window.companheirosModalController.recalcularBonusCompanheiroAtual === 'function') {
          console.log(`4️⃣ Usando recalcularBonusCompanheiroAtual...`);
          window.companheirosModalController.recalcularBonusCompanheiroAtual();
          console.log(`4️⃣ ✅ Bônus de companheiro recalculado\n`);
        } else if (window.bonusCalculator?.recalcularBonusAptidoesAPartirDasAptidoes) {
          console.log(`4️⃣ Usando recalcularBonusAptidoesAPartirDasAptidoes...`);
          window.bonusCalculator.recalcularBonusAptidoesAPartirDasAptidoes();
          console.log(`4️⃣ ✅ Bônus de aptidões recalculado\n`);
        } else if (window.bonusCalculator?.cicloCompletoAtualizacao) {
          console.log(`4️⃣ Usando cicloCompletoAtualizacao (fallback)...`);
          // Fallback para ciclo completo se método específico não existir
          window.bonusCalculator.cicloCompletoAtualizacao();
          console.log(`4️⃣ ✅ Ciclo completo concluído\n`);
        } else {
          console.warn(`4️⃣ ⚠️ Nenhum sistema de recalcular bônus encontrado!`);
        }
      };

      btn.addEventListener('click', btn._clickHandler);
    });

    console.log('✅ Setup de listeners concluído');
  }

  /**
   * Retorna a referência do container
   */
  function getContainer() {
    return document.querySelector(SELECTOR_VANTAGENS_LIST);
  }

  /**
   * Limpa a renderização
   */
  function limpar() {
    const container = getContainer();
    if (container) {
      container.innerHTML = '<div class="aptidoes-empty-message">Carregando vantagens...</div>';
    }
  }

  // ============================================
  // API Pública
  // ============================================
  return {
    renderizar,
    limpar,
    getContainer
  };
})();

// Garantir que está disponível globalmente
if (typeof window !== 'undefined') {
  window.renderVantagensAptidoes = RenderVantagensAptidoes;
}
