/**
 * SISTEMA DE RAÇAS - INTERFACE DE USUÁRIO
 * Classe principal que gerencia toda a interação com o modal de raças
 * Implementa padrões clean code e modularidade
 */

class RacasUI {
  /**
   * Construtor da classe
   * Inicializa variáveis de estado
   */
  constructor() {
    this.racaAtiva = null;
    this.modal = null;
    this.btnAbrir = null;
    this.btnFechar = null;
    this.listasRacas = null;
    this.painalDetalhes = null;
    this.inicializado = false;

    // ✨ SISTEMA DE SELEÇÃO
    this.racaSelecionadaId = null;
    this.bloqueioAtivo = false;
  }

  /**
   * Inicializa o sistema
   * Chamada uma única vez no carregamento da página
   */
  init() {
    if (this.inicializado) return;

    // Captura elementos do DOM
    this.capturarElementos();

    // Valida se todos os elementos foram encontrados
    if (!this.validarElementos()) {
      console.error('RacasUI: Elementos necessários não encontrados no DOM');
      return;
    }

    // Renderiza lista inicial de raças
    this.renderLista();

    // Carrega raça salva do localStorage ou usa primeira como padrão
    const racaSalva = this.carregarRacaSalva();
    if (racaSalva) {
      // Renderizar detalhes da raça salva
      this.selecionarRaca(racaSalva);
      // E aplicar o bloqueio de seleção
      this.escolherRaca(racaSalva);
      console.log(`✅ Raça salva carregada e renderizada: ${racaSalva}`);
    } else {
      // Seleciona primeira raça como padrão
      const primeiraRaca = obterTodasAsRacas()[0];
      if (primeiraRaca) {
        this.selecionarRaca(primeiraRaca.id);
      }
    }

    // Sincronizar campo da ficha com os dados persistidos (classe + raça)
    this.sincronizarCampoFicha();

    // Vincula eventos
    this.vincularEventos();

    this.inicializado = true;
    console.log('RacasUI: Sistema inicializado com sucesso');
  }

  /**
   * Captura referências aos elementos do DOM
   * @private
   */
  capturarElementos() {
    this.modal = document.getElementById('modal-racas');
    this.btnAbrir = document.getElementById('route-racas');
    this.btnFechar = document.querySelector('.btn-fechar-racas');
    this.btnVoltar = document.querySelector('.btn-voltar-racas');
    this.listaRacas = document.querySelector('.racas-lista');
    this.painalDetalhes = document.querySelector('.raca-detalhes');
  }

  /**
   * Valida se os elementos foram encontrados
   * @private
   * @returns {boolean}
   */
  validarElementos() {
    return (
      this.modal &&
      this.btnAbrir &&
      this.btnFechar &&
      this.btnVoltar &&
      this.listaRacas &&
      this.painalDetalhes
    );
  }

  /**
   * Vincula todos os eventos do sistema
   * @private
   */
  vincularEventos() {
    // Proteção: validar se elementos existem antes de adicionar listeners
    if (!this.btnAbrir || !this.modal) {
      console.warn('⚠️ RacasUI: Elementos críticos não encontrados, sistema parcialmente funcional');
      return;
    }

    // Eventos do botão abrir
    if (this.btnAbrir) {
      this.btnAbrir.addEventListener('click', () => this.abrirModal());
    }

    // Eventos do botão fechar
    if (this.btnFechar) {
      this.btnFechar.addEventListener('click', () => this.fecharModal());
    }

    // Eventos do botão voltar
    if (this.btnVoltar) {
      this.btnVoltar.addEventListener('click', () => this.voltarMenu());
    }

    // Fechar ao clicar fora do modal
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.fecharModal();
      }
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('ativo')) {
        this.fecharModal();
      }
    });

    // Delegação de eventos para itens da lista
    if (this.listaRacas) {
      this.listaRacas.addEventListener('click', (e) => {
        const item = e.target.closest('.raca-item');
        if (item) {
          const racaId = item.dataset.racaId;
          this.selecionarRaca(racaId);
        }
      });
    }

    // Delegação de eventos para abas de habilidades
    this.modal.addEventListener('click', (e) => {
      const tabButton = e.target.closest('.tab-button');
      if (tabButton) {
        const tab = tabButton.dataset.tab;
        this.alternarAbaHabilidades(tab);
      }
    });

    // ✨ SISTEMA DE SELEÇÃO - Eventos dos botões
    this.modal.addEventListener('click', (e) => {
      // Botão "Escolher"
      if (e.target.classList.contains('btn-escolher')) {
        const racaId = e.target.dataset.racaId;
        this.escolherRaca(racaId);
      }

      // Botão "Cadeado" (desbloquear)
      if (e.target.classList.contains('btn-cadeado')) {
        this.alternarBloqueioGlobal();
      }
    });

    // Eventos dos filtros
    const filtroBusca = document.getElementById('filtro-busca-raca');
    const filtroRaridade = document.getElementById('filtro-raridade');

    if (filtroBusca) {
      filtroBusca.addEventListener('input', (e) => {
        this.aplicarFiltros(e.target.value, filtroRaridade?.value || '');
      });
    }

    if (filtroRaridade) {
      filtroRaridade.addEventListener('change', (e) => {
        this.aplicarFiltros(filtroBusca?.value || '', e.target.value);
      });
    }
  }

  /**
   * Abre o modal com animação suave
   * @public
   */
  abrirModal() {
    this.modal.classList.remove('hidden');
    // Forçar reflow para disparar animação
    this.modal.offsetHeight;
    this.modal.classList.add('ativo');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Fecha o modal com animação suave
   * @public
   */
  fecharModal() {
    this.modal.classList.remove('ativo');
    setTimeout(() => {
      this.modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }

  /**
   * Volta para o menu principal (Atributos)
   * Mantém todos os dados salvos
   * @public
   */
  voltarMenu() {
    console.log('🔙 Voltando do modal de raças para o menu principal...');
    this.fecharModal();
    
    // Aguardar a animação de fechamento
    setTimeout(() => {
      const btnMenu = document.getElementById('btn-menu-principal');
      if (btnMenu) {
        btnMenu.click();
        btnMenu.focus();
        console.log('✅ Voltado com sucesso para o menu principal');
      } else {
        console.warn('⚠️ Botão do menu principal não encontrado');
      }
    }, 300);
  }

  /**
   * Renderiza a lista de raças na sidebar
   * @private
   * @param {Array} racas - Array de raças a renderizar (padrão: todas)
   */
  renderLista(racas = null) {
    if (!racas) {
      racas = obterTodasAsRacas();
    }
    this.listaRacas.innerHTML = '';

    if (racas.length === 0) {
      this.listaRacas.innerHTML = '<div class="sem-resultados">Nenhuma raça encontrada</div>';
      return;
    }

    // Estrutura de pastas (categorias)
    const pastas = [
      {
        nome: "Re'Geron",
        icon: '📁',
        image: 'https://i.imgur.com/dDoawMK.jpeg',
        color: '#ef4444',
        aberta: false,
        tipo: "Re'Geron"
      },
      {
        nome: 'The Chaotical Gate',
        icon: '⚡',
        image: 'https://i.imgur.com/1GTo2G2.png',
        color: '#f59e0b',
        aberta: false,
        tipo: 'The Chaotical Gate'
      },
      {
        nome: 'Cultivo',
        icon: '🔮',
        image: 'https://i.imgur.com/LXn1Jej.png',
        color: '#3b82f6',
        aberta: false,
        tipo: 'Cultivo'
      },
      {
        nome: 'One Piece',
        icon: '🏴‍☠️',
        image: 'https://i.imgur.com/vXSjzr6.jpeg',
        color: '#a78bfa',
        aberta: false,
        tipo: 'One Piece'
      },
      {
        nome: 'Bleach',
        icon: '⚔️',
        image: 'https://i.imgur.com/s4CFxTM.png',
        color: '#10b981',
        aberta: false,
        tipo: 'Bleach'
      }
      ,{
        nome: 'A Crônica dos Varkhan',
        icon: '📜',
        image: 'https://i.imgur.com/ejGrhaP.jpeg',
        color: '#7c3aed',
        aberta: false,
        tipo: 'A Crônica dos Varkhan'
      }
    ];

    // Filtrar raças por tipo e atribuir às pastas
    pastas.forEach((pasta) => {
      pasta.racas = racas.filter(raca => raca.tipo === pasta.tipo);
    });

    // Ordenar raças dentro de cada pasta por raridade (prioridade definida)
    const raridadePrioridade = {
      comum: 0,
      raro: 1,
      epico: 2,
      lendario: 3,
      mitico: 4,
      celestial: 5
    };

    pastas.forEach((pasta) => {
      if (Array.isArray(pasta.racas) && pasta.racas.length > 0) {
        pasta.racas.sort((a, b) => {
          const pa = raridadePrioridade[a.raridade] ?? 99;
          const pb = raridadePrioridade[b.raridade] ?? 99;
          if (pa !== pb) return pa - pb;
          // fallback: ordenar por nome
          return (a.nome || '').localeCompare(b.nome || '');
        });
      }
    });

    // Renderizar cada pasta
    pastas.forEach((pasta) => {
      const pastaElement = this.criarPasta(pasta);
      // definir variavel CSS no elemento da pasta para que filhos herdem a cor
      pastaElement.style.setProperty('--folder-color', pasta.color || '#7c6ba8');
      this.listaRacas.appendChild(pastaElement);
    });
  }

  /**
   * Cria um elemento de pasta/categoria
   * @private
   * @param {Object} pasta - Objeto com dados da pasta
   * @returns {HTMLElement}
   */
  criarPasta(pasta) {
    const pastaElement = document.createElement('div');
    pastaElement.className = `rdg-race-folder ${pasta.aberta ? 'rdg-race-folder-opened' : ''}`;
    pastaElement.dataset.folder = pasta.nome.toLowerCase().replace(/[\/\s]/g, '-');

    // Header da pasta
    const headerPasta = document.createElement('div');
    headerPasta.className = 'rdg-race-folder-header';
    // definir variavel CSS de cor por pasta
    headerPasta.style.setProperty('--folder-color', pasta.color || '#7c6ba8');
    headerPasta.innerHTML = `
      <span class="rdg-race-folder-icon">${pasta.aberta ? '▼' : '›'}</span>
      <span class="rdg-race-folder-avatar">${pasta.image ? `<img src="${pasta.image}" alt="${pasta.nome}"/>` : pasta.icon}</span>
      <span class="rdg-race-folder-name">${pasta.nome}</span>
      <span class="rdg-race-folder-count">${pasta.racas.length}</span>
    `;

    pastaElement.appendChild(headerPasta);

    // Container das raças dentro da pasta
    const containerRacas = document.createElement('div');
    containerRacas.className = `rdg-race-folder-content ${pasta.aberta ? 'rdg-race-folder-content-open' : ''}`;

    if (pasta.racas.length > 0) {
      pasta.racas.forEach((raca) => {
        const item = this.criarItemRaca(raca);
        containerRacas.appendChild(item);
      });
    } else {
      // Mostrar mensagem se pasta vazia
      const msgVazia = document.createElement('div');
      msgVazia.className = 'rdg-race-folder-empty';
      msgVazia.textContent = 'Em breve...';
      containerRacas.appendChild(msgVazia);
    }

    pastaElement.appendChild(containerRacas);

    // Adicionar evento para expandir/recolher pasta
    this.vincularEventosPasta(pastaElement);

    return pastaElement;
  }

  /**
   * Vincula eventos à pasta para expandir/recolher
   * @private
   * @param {HTMLElement} pasta - Elemento da pasta
   */
  vincularEventosPasta(pasta) {
    const header = pasta.querySelector('.rdg-race-folder-header');
    const icon = pasta.querySelector('.rdg-race-folder-icon');
    const content = pasta.querySelector('.rdg-race-folder-content');

    header.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const isOpen = pasta.classList.contains('rdg-race-folder-opened');

      if (isOpen) {
        // Fechar
        pasta.classList.remove('rdg-race-folder-opened');
        content.classList.remove('rdg-race-folder-content-open');
        icon.textContent = '›';
      } else {
        // Abrir
        pasta.classList.add('rdg-race-folder-opened');
        content.classList.add('rdg-race-folder-content-open');
        icon.textContent = '▼';
      }
    });
  }

  /**
   * Cria um elemento de item de raça
   * @private
   * @param {Object} raca - Objeto raça
   * @returns {HTMLElement}
   */
  criarItemRaca(raca) {
    const item = document.createElement('div');
    item.className = 'raca-item';
    item.dataset.racaId = raca.id;

    item.innerHTML = `
      <div class="raca-item-nome">${raca.nome}</div>
      <div class="raca-item-raridade raca-raridade ${raca.raridade}">
        ${this.formatarRaridade(raca.raridade)}
      </div>
    `;

    return item;
  }

  /**
   * Seleciona uma raça e atualiza a interface
   * @public
   * @param {string} racaId - ID da raça
   */
  selecionarRaca(racaId) {
    const raca = obterRacaPorId(racaId);
    if (!raca) {
      console.error(`RacasUI: Raça ${racaId} não encontrada`);
      return;
    }

    // Atualiza estado ativo
    this.racaAtiva = racaId;

    // Remove classe ativo de todos os itens
    document.querySelectorAll('.raca-item').forEach((item) => {
      item.classList.remove('ativo');
    });

    // Adiciona classe ativo ao item selecionado
    const itemSelecionado = document.querySelector(
      `.raca-item[data-raca-id="${racaId}"]`
    );
    if (itemSelecionado) {
      itemSelecionado.classList.add('ativo');
    }

    // Renderiza detalhes da raça
    this.renderDetalhes(raca);

    // Scroll suave para o item selecionado
    if (itemSelecionado) {
      itemSelecionado.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }

  /**
   * Renderiza os detalhes da raça no painel principal
   * @private
   * @param {Object} raca - Objeto raça
   */
  renderDetalhes(raca) {
    this.painalDetalhes.innerHTML = `
      <!-- Header da Raça -->
      <div class="raca-header">
        <div class="raca-header-left">
          <h3 class="raca-nome">${raca.nome}</h3>
          <span class="raca-raridade ${raca.raridade}">
            ${this.formatarRaridade(raca.raridade)}
          </span>
        </div>
        <div class="raca-header-right">
          <button class="btn-escolher" data-raca-id="${raca.id}">Escolher</button>
          <button class="btn-cadeado" data-raca-id="${raca.id}" title="Desbloquear">
            🔒
          </button>
        </div>
      </div>

      <!-- Imagem da Raça -->
      <div class="raca-imagem">
        <img src="${raca.imagem}" alt="${raca.nome}" />
      </div>

      <!-- Descrição -->
      <section class="raca-secao raca-descricao">
        <div class="raca-secao-titulo">Descrição</div>
        <p class="raca-descricao-texto">${raca.descricao}</p>
      </section>

      <!-- Atributos -->
      <section class="raca-secao raca-atributos">
        <div class="raca-secao-titulo">Atributos Base</div>
        <div class="atributos-grid">
          ${this.renderAtributos(raca.atributos)}
        </div>
      </section>

      <!-- Limite de Atributo -->
      <section class="raca-secao raca-limite">
        <div class="raca-secao-titulo">Limite Máximo de Atributo</div>
        <div class="limite-container">
          <span class="limite-label">Limite de Atributo</span>
          <span class="limite-valor">${raca.limiteAtributo}</span>
        </div>
      </section>

      <!-- Habilidades -->
      <section class="raca-secao raca-habilidades">
        <div class="raca-secao-titulo">Habilidades Raciais</div>
        
        <!-- Abas de Habilidades -->
        <div class="habilidades-tabs">
          <button class="tab-button active" data-tab="basicas">
            ⭐ Básicas
          </button>
          ${raca.habilidadesAvancadas && raca.habilidadesAvancadas.length > 0 ? `
            <button class="tab-button" data-tab="avancadas">
              🔥 Avançadas
            </button>
          ` : ''}
        </div>

        <!-- Conteúdo das Abas -->
        <div class="habilidades-conteudo">
          <div class="habilidades-painel active" data-painel="basicas">
            ${this.renderHabilidades(raca.habilidadesBasicas || [])}
          </div>
          ${raca.habilidadesAvancadas && raca.habilidadesAvancadas.length > 0 ? `
            <div class="habilidades-painel" data-painel="avancadas">
              ${this.renderHabilidadesAvancadas(raca.habilidadesAvancadas)}
            </div>
          ` : ''}
        </div>
      </section>
    `;

    // ✨ ATUALIZAR ESTADO DOS BOTÕES
    this.atualizarEstadoBotoes(raca.id);

    // 🎯 INTEGRAÇÃO COM SISTEMA DE HABILIDADES BÁSICAS
    setTimeout(() => {
      if (habilidadesBasicasSelector && habilidadesBasicasSelector.inicializado) {
        habilidadesBasicasSelector.onRacaSelecionada(raca.id);
      }
    }, 100);
  }

  /**
   * Renderiza os atributos da raça
   * @private
   * @param {Object} atributos - Objeto com atributos
   * @returns {string} HTML dos atributos
   */
  renderAtributos(atributos) {
    const nomesMapeados = {
      forca: 'Força',
      vitalidade: 'Vitalidade',
      agilidade: 'Agilidade',
      inteligencia: 'Inteligência',
      percepcao: 'Percepção',
      sorte: 'Sorte'
    };

    return Object.entries(atributos)
      .map(
        ([chave, valor]) => `
        <div class="atributo-card">
          <div class="atributo-nome">${nomesMapeados[chave] || chave}</div>
          <div class="atributo-valor">${valor}</div>
        </div>
      `
      )
      .join('');
  }

  /**
   * Renderiza as habilidades da raça (apenas BÁSICAS)
   * @private
   * @param {Array} habilidades - Array de habilidades
   * @returns {string} HTML das habilidades
   */
  renderHabilidades(habilidades) {
    if (!habilidades || !Array.isArray(habilidades)) {
      return '<p class="sem-habilidades">Nenhuma habilidade básica disponível</p>';
    }
    
    // Filtrar apenas habilidades básicas (que NÃO têm propriedade 'tipo')
    const habitliddadesBasicasFiltered = habilidades.filter(h => !h.tipo);
    
    if (habitliddadesBasicasFiltered.length === 0) {
      return '<p class="sem-habilidades">Nenhuma habilidade básica disponível</p>';
    }
    
    const cards = habitliddadesBasicasFiltered
      .map(
        (habilidade) => `
        <div class="habilidade-card">
          <div class="habilidade-nome">${habilidade.nome}</div>
          <div class="habilidade-descricao">${habilidade.descricao}</div>
          <div class="habilidade-bonus">
            ${habilidade.bonus && Array.isArray(habilidade.bonus)
              ? habilidade.bonus
                  .filter(bonus => typeof bonus === 'string')
                  .map(
                    (bonus) => `
              <div class="bonus-item">${bonus}</div>
            `
                  )
                  .join('')
              : '<div class="bonus-item">Sem bônus específico</div>'}
          </div>
        </div>
      `
      )
      .join('');

    // Envolve os cards em um container para permitir controle de grid por painel
    return `<div class="habilidades-container">${cards}</div>`;
  }

  /**
   * Aplica filtros de busca e raridade
   * @private
   * @param {string} busca - Texto de busca por nome
   * @param {string} raridade - Valor de raridade para filtrar
   */
  aplicarFiltros(busca = '', raridade = '') {
    const todasRacas = obterTodasAsRacas();

    let racasFiltradas = todasRacas.filter((raca) => {
      // Filtro por busca (nome)
      const passaBusca = raca.nome.toLowerCase().includes(busca.toLowerCase());

      // Filtro por raridade
      const passaRaridade = !raridade || raca.raridade === raridade;

      return passaBusca && passaRaridade;
    });

    // Renderiza lista filtrada
    this.renderLista(racasFiltradas);

    // Se houver resultados, seleciona o primeiro
    if (racasFiltradas.length > 0) {
      this.selecionarRaca(racasFiltradas[0].id);
    } else {
      // Limpa painel de detalhes
      this.painalDetalhes.innerHTML = '<div class="sem-resultados">Nenhuma raça encontrada com esses filtros</div>';
    }

    console.log(`Filtros aplicados: busca="${busca}", raridade="${raridade}" → ${racasFiltradas.length} raças`);
  }

  /**
   * Renderiza as habilidades avançadas da raça
   * @private
   * @param {Array} habilidades - Array de habilidades avançadas
   * @returns {string} HTML das habilidades avançadas
   */
  renderHabilidadesAvancadas(habilidades) {
    if (!habilidades || !Array.isArray(habilidades)) {
      return '<p class="sem-habilidades">Nenhuma habilidade avançada disponível</p>';
    }

    // Filtrar apenas habilidades avançadas (que TÊM a propriedade 'tipo')
    const habitliddadesAvancadasFiltered = habilidades.filter(h => h.tipo);
    
    if (habitliddadesAvancadasFiltered.length === 0) {
      return '<p class="sem-habilidades">Nenhuma habilidade avançada disponível</p>';
    }

    return habitliddadesAvancadasFiltered
      .map((habilidade) => {
        const bloqueada = !this.verificarRequisito(habilidade);
        const classeBloqueada = bloqueada ? 'habilidade-bloqueada' : '';
        const tipoCor = this.obterCorTipo(habilidade.tipo);

        return `
          <div class="habilidade-card habilidade-avancada ${classeBloqueada}">
            ${bloqueada ? '<div class="overlay-bloqueio"></div>' : ''}
            
            <!-- Header: Nome + Badge de Tipo -->
            <div class="habilidade-header">
              <div class="habilidade-nome">${habilidade.nome}</div>
              ${habilidade.tipo ? `
                <div class="badge-tipo ${tipoCor}">
                  ${habilidade.tipo}
                </div>
              ` : ''}
            </div>

            <!-- Descrição -->
            <div class="habilidade-descricao">${habilidade.descricao}</div>

            <!-- Badges de Informação -->
            <div class="habilidade-badges">
              <span class="badge-info">📍 ${habilidade.alcance || 'N/A'}</span>
              <span class="badge-info">👥 ${habilidade.alvos || 'N/A'}</span>
              <span class="badge-info">🔄 ${habilidade.recarga || '0'}</span>
              <span class="badge-info">💎 ${habilidade.custo || '0'}</span>
              <span class="badge-info">⏱️ ${habilidade.duracao || '0'}</span>
              <span class="badge-info">🎲 ${habilidade.dado || '0'}</span>
            </div>

            <!-- Bônus -->
            <div class="habilidade-bonus">
              ${habilidade.bonus && Array.isArray(habilidade.bonus)
                ? habilidade.bonus
                    .map(
                      (bonus) => `
                  <div class="bonus-item">✓ ${bonus}</div>
                `
                    )
                    .join('')
                : '<div class="bonus-item">Sem bônus específico</div>'}
            </div>

            ${bloqueada ? `
              <div class="habilidade-bloqueio-msg">
                🔒 Bloqueada - Cumpra o requisito para desbloquear
              </div>
            ` : ''}
          </div>
        `;
      })
      .join('');
  }

  /**
   * Obtém a cor baseada no tipo de habilidade
   * @private
   * @param {string} tipo - Tipo da habilidade (Imediata, Duradoura, Sustentada)
   * @returns {string} Classe CSS de cor
   */
  obterCorTipo(tipo) {
    const tipos = {
      'Imediata': 'tipo-imediata',
      'Duradoura': 'tipo-duradoura',
      'Sustentada': 'tipo-sustentada'
    };
    return tipos[tipo] || 'tipo-padrao';
  }

  /**
   * Verifica se um requisito de habilidade foi cumprido
   * @private
   * @param {Object} habilidade - Objeto da habilidade com requisito
   * @param {Object} jogador - Dados do jogador (opcional, para integração futura)
   * @returns {boolean} True se requisito cumprido, false se bloqueado
   */
  verificarRequisito(habilidade, jogador = null) {
    // Se não houver requisito, sempre desbloqueada
    if (!habilidade.requisito) {
      return true;
    }

    // Se houver jogador, verificar nível
    if (jogador && jogador.nivel) {
      const requisito = habilidade.requisito;
      if (requisito.includes('Nível')) {
        const nivelReq = parseInt(requisito.match(/\d+/)[0]);
        return jogador.nivel >= nivelReq;
      }
    }

    // Por padrão, habilidades avançadas estão DESBLOQUEADAS
    // Mudar para false se quiser manter bloqueadas por padrão
    return true;
  }

  /**
   * Alterna entre abas de habilidades
   * @private
   * @param {string} tab - Nome da aba ('basicas' ou 'avancadas')
   */
  alternarAbaHabilidades(tab) {
    // Remove classe 'active' apenas dos botões e painéis dentro do modal de RAÇAS
    this.modal.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    this.modal.querySelectorAll('.habilidades-painel').forEach(painel => {
      painel.classList.remove('active');
    });

    // Adiciona classe 'active' ao botão e painel clicado (apenas dentro do modal)
    this.modal.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    this.modal.querySelector(`[data-painel="${tab}"]`).classList.add('active');

    console.log(`Aba de habilidades alterada para: ${tab}`);
  }

  /**
   * Formata o nome da raridade para display
   * @private
   * @param {string} raridade - Chave da raridade
   * @returns {string} Nome formatado
   */
  formatarRaridade(raridade) {
    const mapa = {
      comum: 'Comum',
      raro: 'Raro',
      epico: 'Épico',
      mitico: 'Mítico',
      lendario: 'Lendário',
      celestial: 'Celestial'
    };
    return mapa[raridade] || raridade;
  }

  /**
   * Obtém a raça ativa atual
   * @public
   * @returns {Object|null} Raça ativa ou null
   */
  obterRacaAtiva() {
    return this.racaAtiva ? obterRacaPorId(this.racaAtiva) : null;
  }

  /**
   * Adiciona uma nova raça ao sistema
   * ⚠️ Nota: Modifique racas-data.js para adicionar permanentemente
   * @public
   * @param {Object} raca - Objeto raça
   */
  adicionarRacaDinamicamente(raca) {
    RACAS_DATABASE.push(raca);
    this.renderLista();
    console.log(`RacasUI: Raça ${raca.nome} adicionada dinamicamente`);
  }

  /**
   * SISTEMA DE SELEÇÃO - Seleciona uma raça como a escolhida
   * @public
   * @param {string} racaId - ID da raça a selecionar
   */
  escolherRaca(racaId) {
    // Verificar se bloqueio já está ativo
    if (this.bloqueioAtivo && this.racaSelecionadaId !== racaId) {
      console.warn('RacasUI: Uma raça já foi escolhida. Desbloqueie para escolher outra.');
      return;
    }

    const raca = obterRacaPorId(racaId);
    if (!raca) {
      console.error(`RacasUI: Raça ${racaId} não encontrada`);
      return;
    }

    // Marcar raça como selecionada
    this.racaSelecionadaId = racaId;
    this.bloqueioAtivo = true;

    // Salvar seleção no localStorage
    this.salvarRacaSelecionada(racaId);

    // Aplicar bloqueio visual
    this.aplicarBloqueioVisual();

    // Atualizar botão na interface
    this.atualizarBotaoSelecionada(racaId);

    // Atualizar campo da ficha
    this.atualizarCampoFicha(raca.nome);

    // ✅ NOVO: Sincronizar popup de informações do jogador
    if (window.popupInfoJogador && typeof window.popupInfoJogador.loadValuesFromState === 'function') {
      window.popupInfoJogador.loadValuesFromState();
      console.log('✅ Popup sincronizado após escolher raça');
    }

    console.log(`✅ Raça "${raca.nome}" selecionada como raça base`);
  }

  /**
   * Aplica bloqueio visual nas raças não selecionadas
   * @private
   */
  aplicarBloqueioVisual() {
    const detalhes = this.painalDetalhes;
    
    // Marcar raça selecionada
    detalhes.classList.add('raca-selecionada');

    // Aplicar bloqueio nas demais raças da lista
    document.querySelectorAll('.raca-item').forEach((item) => {
      const racaId = item.dataset.racaId;
      if (racaId !== this.racaSelecionadaId) {
        // Raças não selecionadas ficam com visual de bloqueadas e não interativas
        item.classList.add('raca-bloqueada');
        item.classList.remove('raca-selecionada');
        item.style.pointerEvents = 'none';
      } else {
        // Raça escolhida: aplicar apenas a classe de selecionada (sem overlay/cadeado)
        item.classList.remove('raca-bloqueada');
        item.classList.add('raca-selecionada');
        item.style.pointerEvents = 'auto';
      }
    });
  }

  /**
   * Remove bloqueio visual de todas as raças
   * @private
   */
  removerBloqueioVisual() {
    // Limpar classes do painel
    this.painalDetalhes.classList.remove('raca-selecionada');

    // Remover bloqueio de todos os itens
    document.querySelectorAll('.raca-item').forEach((item) => {
      item.classList.remove('raca-bloqueada', 'raca-selecionada');
      item.style.pointerEvents = 'auto';
    });
  }

  /**
   * Atualiza o botão para mostrar que raça foi selecionada
   * @private
   * @param {string} racaId - ID da raça
   */
  atualizarBotaoSelecionada(racaId) {
    // Encontrar botão na página
    const botao = document.querySelector(`[data-raca-id="${racaId}"] .btn-escolher`);
    if (botao) {
      botao.textContent = 'Selecionada';
      botao.classList.add('btn-selecionada');
      botao.disabled = true;
    }

    // Restaurar botões das demais raças
    document.querySelectorAll('.btn-escolher').forEach((btn) => {
      if (btn !== botao) {
        btn.textContent = 'Escolher';
        btn.classList.remove('btn-selecionada');
        btn.disabled = true; // Bloqueado pois há raça selecionada
      }
    });
  }

  /**
   * Alterna o bloqueio global (desbloqueio)
   * @public
   */
  alternarBloqueioGlobal() {
    if (!this.bloqueioAtivo) {
      console.warn('RacasUI: Nenhuma raça selecionada para desbloquear');
      return;
    }

    // Limpar seleção
    this.racaSelecionadaId = null;
    this.bloqueioAtivo = false;

    // Limpar raça do localStorage
    this.limparRacaSalva();

    // Remover bloqueio visual
    this.removerBloqueioVisual();

    // Restaurar todos os botões
    document.querySelectorAll('.btn-escolher').forEach((btn) => {
      btn.textContent = 'Escolher';
      btn.classList.remove('btn-selecionada');
      btn.disabled = false;
    });

    // Limpar campo da ficha
    this.limparCampoFicha();

    // ✅ NOVO: Sincronizar popup de informações do jogador
    if (window.popupInfoJogador && typeof window.popupInfoJogador.loadValuesFromState === 'function') {
      window.popupInfoJogador.loadValuesFromState();
      console.log('✅ Popup sincronizado após desbloquear raça');
    }

    console.log('🔓 Bloqueio removido. Você pode escolher outra raça.');
  }

  /**
   * Atualiza o campo da ficha com a raça selecionada
   * @private
   * @param {string} nomeDaRaca - Nome da raça
   */
  atualizarCampoFicha(nomeDaRaca) {
    const campoRaca = document.getElementById('personagem-raca');
    if (!campoRaca) {
      console.warn('RacasUI: Campo "personagem-raca" não encontrado na ficha');
      return;
    }

    // Atualizar apenas a raça (classe é atualizada pelo classes-ui.js)
    campoRaca.textContent = nomeDaRaca;
    campoRaca.classList.add('atualizado');
    
    setTimeout(() => {
      campoRaca.classList.remove('atualizado');
    }, 500);
  }

  /**
   * Limpa o campo da ficha
   * @private
   */
  limparCampoFicha() {
    const campoRaca = document.getElementById('personagem-raca');
    if (!campoRaca) return;

    // Resetar para o texto padrão
    campoRaca.textContent = 'Raça';
    campoRaca.classList.remove('atualizado');
    console.log(`🧹 Campo #personagem-raca resetado: "${campoRaca.textContent}"`);
  }

  /**
   * Retorna a raça atualmente selecionada
   * @public
   * @returns {Object|null} Objeto raça ou null
   */
  obterRacaSelecionada() {
    if (!this.racaSelecionadaId) return null;
    return obterRacaPorId(this.racaSelecionadaId);
  }

  /**
   * Verifica se há bloqueio ativo
   * @public
   * @returns {boolean}
   */
  verificarBloqueioAtivo() {
    return this.bloqueioAtivo;
  }

  /**
   * Atualiza o estado dos botões baseado no bloqueio
   * @private
   * @param {string} racaId - ID da raça atual
   */
  atualizarEstadoBotoes(racaId) {
    const btnEscolher = document.querySelector(`[data-raca-id="${racaId}"] .btn-escolher`);
    const btnCadeado = document.querySelector(`[data-raca-id="${racaId}"] .btn-cadeado`);

    if (!btnEscolher || !btnCadeado) return;

    // Se bloqueio está ativo
    if (this.bloqueioAtivo) {
      if (this.racaSelecionadaId === racaId) {
        // Esta é a raça selecionada
        btnEscolher.textContent = 'Selecionada';
        btnEscolher.classList.add('btn-selecionada');
        btnEscolher.disabled = true;
        btnCadeado.disabled = false; // Cadeado habilitado para desbloquear
      } else {
        // Outra raça foi selecionada, esta fica bloqueada
        btnEscolher.textContent = 'Escolher';
        btnEscolher.classList.remove('btn-selecionada');
        btnEscolher.disabled = true;
        btnCadeado.disabled = true; // Cadeado desabilitado
      }
    } else {
      // Sem bloqueio ativo - todos os botões estão livres
      btnEscolher.textContent = 'Escolher';
      btnEscolher.classList.remove('btn-selecionada');
      btnEscolher.disabled = false;
      btnCadeado.disabled = true; // Cadeado desabilitado quando não há bloqueio
    }
  }

  /**
   * Salva a raça selecionada no localStorage
   * @private
   * @param {string} racaId - ID da raça
   */
  salvarRacaSelecionada(racaId) {
    try {
      localStorage.setItem('redungeon_raca_selecionada', racaId);
      console.log(`💾 Raça "${racaId}" salva no localStorage`);
    } catch (e) {
      console.warn('RacasUI: Não foi possível salvar no localStorage', e);
    }
  }

  /**
   * Carrega a raça selecionada do localStorage
   * @private
   * @returns {string|null} ID da raça ou null
   */
  carregarRacaSalva() {
    try {
      const racaSalva = localStorage.getItem('redungeon_raca_selecionada');
      if (racaSalva) {
        console.log(`📂 Raça carregada do localStorage: "${racaSalva}"`);
        return racaSalva;
      }
      return null;
    } catch (e) {
      console.warn('RacasUI: Não foi possível carregar do localStorage', e);
      return null;
    }
  }

  /**
   * Limpa a raça salva do localStorage
   * @private
   */
  limparRacaSalva() {
    try {
      localStorage.removeItem('redungeon_raca_selecionada');
      console.log('🗑️ Raça removida do localStorage');
    } catch (e) {
      console.warn('RacasUI: Não foi possível limpar localStorage', e);
    }
  }

  /**
   * Sincroniza o campo da ficha com os dados persistidos (raça)
   * Chamado na inicialização para garantir que os dados estejam corretos após reload
   * @private
   */
  sincronizarCampoFicha() {
    const campoRaca = document.getElementById('personagem-raca');
    if (!campoRaca) return;

    try {
      // Buscar raça do localStorage
      const racaSelecionadaId = localStorage.getItem('redungeon_raca_selecionada');

      let nomeRaca = null;

      // Buscar nome da raça APENAS se foi escolhida
      if (racaSelecionadaId) {
        try {
          const raca = typeof obterRacaPorId === 'function' ? obterRacaPorId(racaSelecionadaId) : null;
          if (raca) {
            nomeRaca = raca.nome;
            console.log(`✅ Raça recuperada: ${nomeRaca}`);
          } else {
            console.warn(`⚠️ Raça ${racaSelecionadaId} não encontrada, usando padrão`);
          }
        } catch (e) {
          console.warn('⚠️ Erro ao buscar raça:', e);
        }
      }

      // Atualizar o campo com raça ou padrão
      if (nomeRaca) {
        campoRaca.textContent = nomeRaca;
      } else {
        campoRaca.textContent = 'Raça';
      }
      
      console.log(`✅ Campo sincronizado na inicialização: ${nomeRaca || 'Raça'}`);
    } catch (e) {
      console.error('❌ Erro ao sincronizar campo da ficha:', e);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO AUTOMÁTICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema quando o DOM estiver pronto
 */
function inicializarRacasUI() {
  if (!window.racasUI) {
    try {
      window.racasUI = new RacasUI();
      window.racasUI.init();
      console.log('✅ Sistema de raças inicializado globalmente');
      
      // 🎯 Inicializar sistema de habilidades básicas
      if (typeof habilidadesBasicasSelector !== 'undefined' && habilidadesBasicasSelector) {
        try {
          habilidadesBasicasSelector.init(window.racasUI);
          console.log('✅ Sistema de seleção de habilidades básicas inicializado');
        } catch (error) {
          console.warn('⚠️ Erro ao inicializar habilidades básicas:', error.message);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar RacasUI:', error.message);
      // Criar uma instância vazia para evitar erros posteriores
      window.racasUI = {
        abrirModal: () => console.warn('⚠️ RacasUI não inicializado corretamente'),
        init: () => {}
      };
    }
  }
  return window.racasUI;
}

// Inicializa automaticamente quando o documento está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarRacasUI);
} else {
  // DOM já está pronto
  setTimeout(inicializarRacasUI, 50);
}

