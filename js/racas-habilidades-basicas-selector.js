/**
 * SISTEMA DE SELEÇÃO DE HABILIDADES RACIAIS BÁSICAS
 * 
 * Gerencia seleção, limite por raridade, persistência e interação
 * Funciona exclusivamente dentro do modal de raças
 */

class HabilidadesBasicasSelector {
  /**
   * Construtor
   */
  constructor() {
    // Estado atual do sistema
    this.racaAtual = null;
    this.habilidadesAtivas = new Set(); // IDs das habilidades ativas
    this.habilidadesTravadas = new Set(); // IDs das habilidades travadas
    
    // Mapa de limite por raridade
    this.limitePorRaridade = {
      'comum': 1,
      'raro': 1,
      'epico': 1,
      'mitico': 3,
      'lendario': 2,
      'celestial': Infinity // Todas
    };

    this.inicializado = false;
  }

  /**
   * Inicializa o sistema
   * @param {RacasUI} racasUI - Referência à instância RacasUI
   */
  init(racasUI) {
    if (this.inicializado) return;

    this.racasUI = racasUI;
    this.inicializado = true;

    console.log('✅ HabilidadesBasicasSelector inicializado');
  }

  /**
   * Configurar quando uma raça é selecionada
   * @param {string} racaId - ID da raça selecionada
   */
  onRacaSelecionada(racaId) {
    const raca = obterRacaPorId(racaId);
    if (!raca) return;

    // Limpar seleção anterior
    this.habilidadesAtivas.clear();
    this.habilidadesTravadas.clear();

    // Atualizar raça atual
    this.racaAtual = racaId;

    // Carregar estado salvo, se existir
    this.carregarEstadoSalvo(racaId);

    // Renderizar controles
    this.renderizarControles(raca);
  }

  /**
   * Obtém o limite de habilidades para uma raridade
   * @param {string} raridade - Raridade da raça
   * @returns {number} Limite máximo de habilidades ativas
   */
  obterLimitePorRaridade(raridade) {
    return this.limitePorRaridade[raridade] || 1;
  }

  /**
   * Obtém a quantidade atual de habilidades ativas
   * @returns {number}
   */
  obterQuantidadeAtiva() {
    return this.habilidadesAtivas.size;
  }

  /**
   * Obtém o limite máximo para a raça atual
   * @returns {number}
   */
  obterLimiteMaximo() {
    const raca = obterRacaPorId(this.racaAtual);
    if (!raca) return 0;

    return this.obterLimitePorRaridade(raca.raridade);
  }

  /**
   * Ativa uma habilidade básica
   * @param {string} habilidadeId - ID da habilidade (índice)
   * @returns {boolean} True se ativou com sucesso
   */
  ativarHabilidade(habilidadeId) {
    // Verificar se está travada
    if (this.habilidadesTravadas.has(habilidadeId)) {
      console.warn(`❌ Habilidade ${habilidadeId} está travada`);
      return false;
    }

    // Verificar se já está ativa
    if (this.habilidadesAtivas.has(habilidadeId)) {
      // Desativar
      this.habilidadesAtivas.delete(habilidadeId);
      console.log(`⭐ Habilidade ${habilidadeId} desativada`);
      return true;
    }

    // Verificar limite
    const limite = this.obterLimiteMaximo();
    if (this.obterQuantidadeAtiva() >= limite) {
      console.warn(`❌ Limite de ${limite} habilidades atingido`);
      return false;
    }

    // Ativar
    this.habilidadesAtivas.add(habilidadeId);
    console.log(`✅ Habilidade ${habilidadeId} ativada`);
    return true;
  }

  /**
   * Alterna travamento de uma habilidade
   * @param {string} habilidadeId - ID da habilidade
   * @returns {boolean} True se está travada após alternar
   */
  alternarTravamento(habilidadeId) {
    // Só pode travar se está ativa
    if (!this.habilidadesAtivas.has(habilidadeId)) {
      console.warn(`❌ Não é possível travar habilidade inativa`);
      return false;
    }

    if (this.habilidadesTravadas.has(habilidadeId)) {
      this.habilidadesTravadas.delete(habilidadeId);
      console.log(`🔓 Habilidade ${habilidadeId} destravada`);
      return false;
    } else {
      this.habilidadesTravadas.add(habilidadeId);
      console.log(`🔒 Habilidade ${habilidadeId} travada`);
      return true;
    }
  }

  /**
   * Verifica se habilidade está ativa
   * @param {string} habilidadeId - ID da habilidade
   * @returns {boolean}
   */
  estaAtiva(habilidadeId) {
    return this.habilidadesAtivas.has(habilidadeId);
  }

  /**
   * Verifica se habilidade está travada
   * @param {string} habilidadeId - ID da habilidade
   * @returns {boolean}
   */
  estaTravada(habilidadeId) {
    return this.habilidadesTravadas.has(habilidadeId);
  }

  /**
   * Renderiza os controles de seleção nas habilidades básicas
   * @private
   * @param {Object} raca - Objeto da raça
   */
  renderizarControles(raca) {
    // Aguardar DOM ser renderizado
    setTimeout(() => {
      const painalBasicas = document.querySelector('.habilidades-painel[data-painel="basicas"]');
      if (!painalBasicas) return;

      // Buscar todos os cards de habilidades
      const cards = painalBasicas.querySelectorAll('.habilidade-card');
      
      cards.forEach((card, index) => {
        // Limpar controles anteriores
        const controlesAntigos = card.querySelector('.habilidade-controles');
        if (controlesAntigos) controlesAntigos.remove();

        // Criar ID baseado no índice
        const habilidadeId = `hab-basica-${index}`;

        // Criar container de controles
        const controles = document.createElement('div');
        controles.className = 'habilidade-controles';
        const estaAtiva = this.estaAtiva(habilidadeId);
        const estaTravada = this.estaTravada(habilidadeId);
        
        controles.innerHTML = `
          <button class="btn-ativar-habilidade" data-hab-id="${habilidadeId}" 
                  title="${estaAtiva ? 'Desativar habilidade' : 'Ativar habilidade'}">
            ${estaAtiva ? '⚡' : '◯'}
          </button>
          <button class="btn-travar-habilidade" data-hab-id="${habilidadeId}" 
                  title="${estaTravada ? 'Destravar habilidade' : 'Travar habilidade'}" style="display: ${estaAtiva ? 'block' : 'none'}">
            ${estaTravada ? '🔒' : '🔓'}
          </button>
        `;

        // Adicionar ao card
        card.appendChild(controles);

        // Adicionar classes visuais
        this.atualizarEstadoVisual(card, habilidadeId);
      });

      // Renderizar contador
      this.renderizarContador(raca, painalBasicas);

      // Vincular eventos
      this.vincularEventos(painalBasicas);

      console.log('✅ Controles de habilidades básicas renderizados');
    }, 100);
  }

  /**
   * Renderiza o contador visual X/Y
   * @private
   * @param {Object} raca - Objeto da raça
   * @param {Element} painalBasicas - Painel de habilidades básicas
   */
  renderizarContador(raca, painalBasicas) {
    // Encontrar o título da seção
    const secao = painalBasicas.closest('.raca-secao');
    if (!secao) return;

    const titulo = secao.querySelector('.raca-secao-titulo');
    if (!titulo) return;

    // Remover contador antigo
    const contadorAntigo = titulo.querySelector('.badge-contador');
    if (contadorAntigo) contadorAntigo.remove();

    // Criar novo contador
    const limite = this.obterLimitePorRaridade(raca.raridade);
    const ativa = this.obterQuantidadeAtiva();
    
    // Exibir emoticon ♾️ para celestial ao invés de "Infinity"
    const limiteExibicao = limite === Infinity ? '♾️' : limite;

    const contador = document.createElement('span');
    contador.className = 'badge-contador';
    contador.innerHTML = `${ativa}/${limiteExibicao}`;
    contador.title = `${ativa} habilidades ativas de ${limite} permitidas`;

    titulo.appendChild(contador);
  }

  /**
   * Atualiza estado visual do card
   * @private
   * @param {Element} card - Card da habilidade
   * @param {string} habilidadeId - ID da habilidade
   */
  atualizarEstadoVisual(card, habilidadeId) {
    const estaAtiva = this.estaAtiva(habilidadeId);
    const estaTravada = this.estaTravada(habilidadeId);

    // Remover classes anteriores
    card.classList.remove('habilidade-ativa', 'habilidade-travada', 'habilidade-apagada');

    if (estaAtiva) {
      card.classList.add('habilidade-ativa');
    }

    if (estaTravada) {
      card.classList.add('habilidade-travada');
    }

    // Verificar se deve aparecer apagada (limite atingido)
    const limite = this.obterLimiteMaximo();
    if (this.obterQuantidadeAtiva() >= limite && !estaAtiva) {
      card.classList.add('habilidade-apagada');
    }
  }

  /**
   * Vincula eventos aos botões
   * @private
   * @param {Element} painalBasicas - Painel de habilidades básicas
   */
  vincularEventos(painalBasicas) {
    // Remover listeners antigos (delegação)
    painalBasicas.removeEventListener('click', this._handleClick);
    
    // Criar handler
    this._handleClick = (e) => {
      const btnAtivar = e.target.closest('.btn-ativar-habilidade');
      const btnTravar = e.target.closest('.btn-travar-habilidade');

      if (btnAtivar) {
        const habilidadeId = btnAtivar.dataset.habId;
        this.ativarHabilidade(habilidadeId);
        this.atualizarUI(painalBasicas);
      }

      if (btnTravar) {
        const habilidadeId = btnTravar.dataset.habId;
        this.alternarTravamento(habilidadeId);
        this.atualizarUI(painalBasicas);
      }
    };

    painalBasicas.addEventListener('click', this._handleClick);
  }

  /**
   * Atualiza toda a UI após alteração
   * @private
   * @param {Element} painalBasicas - Painel de habilidades básicas
   */
  atualizarUI(painalBasicas) {
    const raca = obterRacaPorId(this.racaAtual);
    if (!raca) return;

    // Atualizar cada card
    const cards = painalBasicas.querySelectorAll('.habilidade-card');
    cards.forEach((card, index) => {
      const habilidadeId = `hab-basica-${index}`;
      this.atualizarEstadoVisual(card, habilidadeId);

      // Atualizar botões
      const btnAtivar = card.querySelector('.btn-ativar-habilidade');
      const btnTravar = card.querySelector('.btn-travar-habilidade');

      if (btnAtivar) {
        const estaAtiva = this.estaAtiva(habilidadeId);
        btnAtivar.textContent = estaAtiva ? '⚡' : '◯';
        btnAtivar.title = estaAtiva ? 'Desativar habilidade' : 'Ativar habilidade';
      }

      if (btnTravar) {
        const estaAtiva = this.estaAtiva(habilidadeId);
        const estaTravada = this.estaTravada(habilidadeId);
        btnTravar.style.display = estaAtiva ? 'block' : 'none';
        btnTravar.textContent = estaTravada ? '🔒' : '🔓';
        btnTravar.title = estaTravada ? 'Destravar habilidade' : 'Travar habilidade';
      }
    });

    // Atualizar contador
    this.renderizarContador(raca, painalBasicas);

    // Salvar estado
    this.salvarEstado();
  }

  /**
   * Salva o estado no localStorage
   * @private
   */
  salvarEstado() {
    if (!this.racaAtual) return;

    const chave = `raca-habilidades-${this.racaAtual}`;
    const estado = {
      racaId: this.racaAtual,
      ativas: Array.from(this.habilidadesAtivas),
      travadas: Array.from(this.habilidadesTravadas),
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(chave, JSON.stringify(estado));
      console.log(`💾 Estado salvo para ${this.racaAtual}:`, estado);
      console.log(`   localStorage.getItem('${chave}'):`, localStorage.getItem(chave));
    } catch (e) {
      console.error('❌ Erro ao salvar estado:', e);
    }
  }

  /**
   * Carrega o estado do localStorage
   * @private
   * @param {string} racaId - ID da raça
   */
  carregarEstadoSalvo(racaId) {
    const chave = `raca-habilidades-${racaId}`;
    
    try {
      const estadoSalvo = localStorage.getItem(chave);
      if (estadoSalvo) {
        const estado = JSON.parse(estadoSalvo);
        this.habilidadesAtivas = new Set(estado.ativas || []);
        this.habilidadesTravadas = new Set(estado.travadas || []);
        console.log(`📂 Estado carregado para ${racaId}`);
      }
    } catch (e) {
      console.error('Erro ao carregar estado:', e);
    }
  }

  /**
   * Limpa o estado de uma raça
   * @param {string} racaId - ID da raça (opcional, usa atual)
   */
  limparEstado(racaId = null) {
    const id = racaId || this.racaAtual;
    if (!id) return;

    const chave = `raca-habilidades-${id}`;
    try {
      localStorage.removeItem(chave);
      console.log(`🗑️ Estado deletado para ${id}`);
    } catch (e) {
      console.error('Erro ao deletar estado:', e);
    }
  }

  /**
   * Retorna dados das habilidades ativas da raça atual
   * @returns {Object} { ativas: [], travadas: [], limite: number }
   */
  obterDadosAtuais() {
    return {
      racaId: this.racaAtual,
      ativas: Array.from(this.habilidadesAtivas),
      travadas: Array.from(this.habilidadesTravadas),
      limite: this.obterLimiteMaximo(),
      quantidade: this.obterQuantidadeAtiva()
    };
  }

  /**
   * Restaura habilidades a partir de dados JSON
   * Utilizado durante importação de ficha
   * @param {Object} dadosJSON - Dados com estrutura { ativas, travadas, racaId }
   */
  restaurarDeJSON(dadosJSON) {
    if (!dadosJSON || !dadosJSON.racaId) {
      console.warn('⚠️ Dados inválidos para restauração');
      return false;
    }

    try {
      const raca = obterRacaPorId(dadosJSON.racaId);
      if (!raca) {
        console.warn(`⚠️ Raça ${dadosJSON.racaId} não encontrada`);
        return false;
      }

      // Limpar estado anterior
      this.habilidadesAtivas.clear();
      this.habilidadesTravadas.clear();

      // Restaurar raça atual
      this.racaAtual = dadosJSON.racaId;

      // Restaurar habilidades
      this.habilidadesAtivas = new Set(dadosJSON.ativas || []);
      this.habilidadesTravadas = new Set(dadosJSON.travadas || []);

      console.log(`✅ Habilidades raciais restauradas para ${dadosJSON.racaId}:`, {
        ativas: Array.from(this.habilidadesAtivas),
        travadas: Array.from(this.habilidadesTravadas)
      });

      return true;
    } catch (erro) {
      console.error('❌ Erro ao restaurar habilidades do JSON:', erro);
      return false;
    }
  }

  /**
   * Re-renderiza os controles com o estado atual
   * Útil após restauração para atualizar a UI
   * @public
   */
  reRenderizarControles() {
    if (!this.racaAtual) {
      console.warn('⚠️ Nenhuma raça ativa para re-renderizar');
      return;
    }

    const raca = obterRacaPorId(this.racaAtual);
    if (raca) {
      this.renderizarControles(raca);
      console.log('✅ Controles re-renderizados com sucesso');
    }
  }
}

// Instância global
const habilidadesBasicasSelector = new HabilidadesBasicasSelector();
