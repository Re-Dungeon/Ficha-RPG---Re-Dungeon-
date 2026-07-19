/**
 * SISTEMA DE CLASSES - INTERFACE DE USUÁRIO
 * Classe principal que gerencia toda a interação com o modal de classes
 * Implementa padrões clean code e modularidade
 * Copiado do sistema de raças com adaptações para classes
 */

class ClassesUI {
  /**
   * Construtor da classe
   * Inicializa variáveis de estado
   */
  constructor() {
    this.classeAtiva = null;
    this.modal = null;
    this.btnAbrir = null;
    this.btnFechar = null;
    this.listasClasses = null;
    this.painalDetalhes = null;
    this.xpBarFill = null;
    this.xpBarStatus = null;
    this.xpBarCurrent = null;
    this.xpBarNext = null;
    this.inicializado = false;

    // ✨ SISTEMA DE MULTICLASSE
    this.classesSelecionadas = []; // Array de IDs de classes selecionadas
    this.bloqueioAtivo = false;
  }

  /**
   * Ajusta o tamanho da fonte das descrições das habilidades para evitar corte.
   * Reduz o tamanho em passos até o texto caber ou atingir um tamanho mínimo.
   */
  ajustarDescricoesHabilidades() {
    try {
      console.log('[ClassesUI] ajustarDescricoesHabilidades chamado');
      const container = this.painalDetalhes;
      if (!container) return;

      const descricoes = container.querySelectorAll('.habilidade-descricao');
      descricoes.forEach((el) => {
        // Reset para o tamanho original (baseado no CSS)
        const estilo = window.getComputedStyle(el);
        let fontSize = parseFloat(estilo.fontSize) || 13;
        const minFontSize = 10; // px

        // Garantir propriedades que influenciam cálculo
        el.style.whiteSpace = 'normal';
        el.style.overflow = 'hidden';
        el.style.display = 'block';

        // Se o texto não está cortado, nada a fazer
        if (!(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)) {
          el.style.fontSize = '';
          return;
        }

        // Diminuir até caber ou atingir minFontSize
        while ((el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) && fontSize > minFontSize) {
          fontSize -= 1;
          el.style.fontSize = `${fontSize}px`;
        }

        // Se mesmo assim não coube, aplicar truncamento com -webkit-line-clamp
        if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
          el.style.display = '-webkit-box';
          const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight) || (fontSize * 1.2);
          const lines = Math.floor(el.clientHeight / lineHeight) || 3;
          el.style.webkitLineClamp = lines;
          el.style.webkitBoxOrient = 'vertical';
          el.style.overflow = 'hidden';
        }
      });
    } catch (err) {
      console.error('Erro ao ajustar descrições de habilidades:', err);
    }
  }

  /**
   * Inicializa o sistema
   * Chamada uma única vez no carregamento da página
   */
  init() {
    if (this.inicializado) return;

    try {
      // Captura elementos do DOM
      this.capturarElementos();

      // Valida se todos os elementos foram encontrados
      if (!this.validarElementos()) {
        console.error('ClassesUI: Elementos necessários não encontrados no DOM');
        console.error('[DEBUG] Elementos encontrados:', {
          modal: !!this.modal,
          btnFechar: !!this.btnFechar,
          btnVoltar: !!this.btnVoltar,
          listaClasses: !!this.listaClasses,
          painalDetalhes: !!this.painalDetalhes
        });
        return;
      }

      // ✨ CARREGA CLASSES SALVAS DO LOCALSTORAGE PRIMEIRO
      const classesSalvas = this.carregarClassesSalvas();
      if (classesSalvas && classesSalvas.length > 0) {
        this.classesSelecionadas = [...classesSalvas];
        this.bloqueioAtivo = true;
        console.log(`✅ ${classesSalvas.length} classe(s) carregada(s) do localStorage: ${classesSalvas.join(', ')}`);
      }

      // Renderiza lista inicial de classes
      try {
        this.renderLista();
        console.log('✅ renderLista() concluída com sucesso');
      } catch (renderError) {
        console.error('❌ Erro ao chamar renderLista():', renderError);
      }

      // Seleciona primeira classe para exibir detalhes
      if (classesSalvas && classesSalvas.length > 0) {
        // Se há classes salvas, renderizar detalhes da primeira
        this.selecionarClasse(classesSalvas[0]);
        // ✨ Atualizar visual dos botões APÓS renderizar lista e detalhes
        this.atualizarBotoesSelecionados();
        // ✨ Atualizar visual do bloqueio
        this.aplicarBloqueioVisual();
      } else {
        // Seleciona primeira classe como padrão
        const primeiraClasse = obterTodasAsClasses()[0];
        if (primeiraClasse) {
          this.selecionarClasse(primeiraClasse.id);
        }
      }

      // ✨ Sincronizar campo da ficha com os dados persistidos (com delay para garantir dados carregados)
      setTimeout(() => {
        this.sincronizarCampoFicha();
      }, 50);

      // Vincula eventos
      this.vincularEventos();

      this.inicializado = true;
      console.log('✅ ClassesUI: Sistema inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro durante inicialização de ClassesUI:', error);
      throw error;
    }
  }

  /**
   * Captura referências aos elementos do DOM
   * @private
   */
  capturarElementos() {
    this.modal = document.getElementById('modal-classes');
    this.btnAbrir = document.getElementById('route-classes');
    this.btnFechar = document.querySelector('.btn-fechar-classes');
    this.btnVoltar = document.querySelector('.btn-voltar-classes');
    this.listaClasses = document.querySelector('.classes-lista');
    this.painalDetalhes = document.querySelector('.classe-detalhes');
    this.xpBarFill = document.getElementById('classes-xp-fill');
    this.xpBarStatus = document.getElementById('classes-xp-status');
    this.xpBarCurrent = document.getElementById('classes-xp-current');
    this.xpBarNext = document.getElementById('classes-xp-next');
    
    console.log('[DEBUG capturarElementos]', {
      modal: !!this.modal,
      btnAbrir: !!this.btnAbrir,
      btnFechar: !!this.btnFechar,
      btnVoltar: !!this.btnVoltar,
      listaClasses: !!this.listaClasses,
      painalDetalhes: !!this.painalDetalhes
      , xpBarFill: !!this.xpBarFill
      , xpBarStatus: !!this.xpBarStatus
      , xpBarCurrent: !!this.xpBarCurrent
      , xpBarNext: !!this.xpBarNext
    });
  }

  /**
   * Valida se os elementos foram encontrados
   * @private
   * @returns {boolean}
   */
  validarElementos() {
    return (
      this.modal &&
      this.btnFechar &&
      this.btnVoltar &&
      this.listaClasses &&
      this.painalDetalhes
    );
  }

  /**
   * Vincula todos os eventos do sistema
   * @private
   */
  vincularEventos() {
    // Proteção: validar se elementos críticos existem antes de adicionar listeners
    if (!this.btnAbrir || !this.modal) {
      console.warn('⚠️ ClassesUI: Elementos críticos não encontrados, sistema parcialmente funcional');
      return;
    }

    // Eventos do botão abrir
    if (this.btnAbrir) {
      this.btnAbrir.addEventListener('click', () => this.abrirModal());
    }

    // Se o botão não foi encontrado ainda, tentar novamente após delay
    if (!this.btnAbrir) {
      setTimeout(() => {
        const btn = document.getElementById('menu-btn-classes');
        if (btn) {
          btn.addEventListener('click', () => this.abrirModal());
          console.log('✅ Botão de classes vinculado após delay');
        }
      }, 500);
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
    if (this.listaClasses) {
      this.listaClasses.addEventListener('click', (e) => {
        const item = e.target.closest('.classe-item');
        if (item) {
          const classeId = item.dataset.classeId;
          this.selecionarClasse(classeId);
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

    // ✨ Delegação de eventos para botões de seleção de habilidades da classe
    this.modal.addEventListener('click', (e) => {
      console.log('🖱️ Click detectado no modal:', e.target);
      const btnSelecionar = e.target.closest('.btn-selecionar-habilidade');
      if (btnSelecionar) {
        console.log('✅ Botão de seleção encontrado!', btnSelecionar);
        const habilidadeNome = btnSelecionar.dataset.habilidadeNome;
        const classeId = btnSelecionar.dataset.classeId;
        const classeNome = btnSelecionar.dataset.classeNome;
        const classeDescricao = btnSelecionar.dataset.classeDescricao;
        
        console.log('🎯 Dados extraídos:', { habilidadeNome, classeId, classeNome, classeDescricao });
        
        // Verifica se está selecionado ou não
        const estaSelecionado = btnSelecionar.classList.contains('selecionado');
        console.log('📌 Estado atual:', estaSelecionado ? 'SELECIONADO' : 'NÃO SELECIONADO');
        
        if (estaSelecionado) {
          this.removerHabilidadeArt(habilidadeNome, classeNome);
        } else {
          this.adicionarHabilidadeArt(habilidadeNome, classeNome, classeDescricao, classeId, btnSelecionar);
        }
      } else {
        console.log('❌ Botão de seleção NÃO encontrado. Target:', e.target);
      }
    });

    // ✨ SISTEMA DE SELEÇÃO - Eventos dos botões
    this.modal.addEventListener('click', (e) => {
      // Botão "Escolher"
      if (e.target.classList.contains('btn-escolher')) {
        const classeId = e.target.dataset.classeId;
        this.escolherClasse(classeId);
      }

      // Botão "Cadeado" (desbloquear)
      if (e.target.classList.contains('btn-cadeado')) {
        this.alternarBloqueioGlobal();
      }
    });

    // Eventos dos filtros
    const filtroBusca = document.getElementById('filtro-busca-classe');
    const filtroRaridade = document.getElementById('filtro-raridade-classe');

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

    // Atualizar barra de experiência de desbloqueio de classes
    this.bindPowerCombatUpdates();
  }

  /**
   * Vincula a barra de desbloqueio ao Power Combat calculado.
   * @private
   */
  bindPowerCombatUpdates() {
    const atualizar = (valor) => this.updateXpBar(valor);

    if (window.powerCombatCalculator && typeof window.powerCombatCalculator.onChange === 'function') {
      window.powerCombatCalculator.onChange(atualizar);
      this.updateXpBar(window.powerCombatCalculator.valorPC);
      return;
    }

    // Fallback: polling caso o calculador não tenha sido inicializado ainda
    const intervalId = setInterval(() => {
      if (window.powerCombatCalculator) {
        clearInterval(intervalId);
        if (typeof window.powerCombatCalculator.onChange === 'function') {
          window.powerCombatCalculator.onChange(atualizar);
        }
        this.updateXpBar(window.powerCombatCalculator.valorPC);
      }
    }, 300);
  }

  /**
   * Atualiza a barra de desbloqueio de classes com base no Power Combat.
   * @param {number} pc
   */
  updateXpBar(pc = 0) {
    if (!this.xpBarFill || !this.xpBarStatus || !this.xpBarCurrent || !this.xpBarNext) {
      return;
    }

    const thresholds = [100, 200, 300];
    const progress = Math.min(100, Math.max(0, (pc / thresholds[thresholds.length - 1]) * 100));
    const level = thresholds.filter((threshold) => pc >= threshold).length;
    const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1];

    this.xpBarFill.style.width = `${progress}%`;
    this.xpBarCurrent.textContent = `${Math.min(pc, thresholds[thresholds.length - 1])} / ${thresholds[thresholds.length - 1]} PC`;

    if (level >= thresholds.length) {
      this.xpBarStatus.textContent = 'Todas as classes desbloqueadas';
      this.xpBarNext.textContent = 'Máximo alcançado';
    } else {
      this.xpBarStatus.textContent = `Meta ${level + 1} de ${thresholds.length} a ${nextThreshold} PC`;
      this.xpBarNext.textContent = `Próxima meta: ${nextThreshold} PC`;
    }

    this.updateXpMarkers(pc, thresholds);
  }

  /**
   * Atualiza o estado visual dos marcadores da barra.
   * @private
   */
  updateXpMarkers(pc, thresholds) {
    const markers = this.modal.querySelectorAll('.classes-xp-marker');
    markers.forEach((marker) => {
      const threshold = Number(marker.dataset.threshold) || 0;
      if (pc >= threshold) {
        marker.classList.add('ativo');
      } else {
        marker.classList.remove('ativo');
      }
    });
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
    
    // ✨ Atualizar estado dos botões ao abrir o modal
    this.atualizarBotoesSelecionados();
    this.updateXpBar(window.powerCombatCalculator?.valorPC || 0);
    console.log('✅ Modal de classes aberto - botões atualizados');
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
    console.log('🔙 Voltando do modal de classes para o menu principal...');
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
   * Renderiza a lista de classes na sidebar
   * @private
   * @param {Array} classes - Array de classes a renderizar (padrão: todas)
   */
  renderLista(classes = null) {
    if (!classes) {
      classes = obterTodasAsClasses();
    }
    console.log(`[DEBUG renderLista] Total de classes a renderizar: ${classes.length}`);
    this.listaClasses.innerHTML = '';

    if (classes.length === 0) {
      this.listaClasses.innerHTML = '<div class="sem-resultados">Nenhuma classe encontrada</div>';
      console.warn('[DEBUG renderLista] Nenhuma classe encontrada!');
      return;
    }

    // Agrupar classes por raridade para a pasta Re'Dungeon
    const agrupadoPorRaridade = {
      comum: [],
      raro: [],
      epico: [],
      lendario: [],
      mitico: []
    };

    classes.forEach((classe) => {
      if (agrupadoPorRaridade[classe.raridade]) {
        agrupadoPorRaridade[classe.raridade].push(classe);
      }
    });

    // Criar array de classes ordenadas por raridade
    const classesOrdenadas = [];
    const ordemRaridades = ['comum', 'raro', 'epico', 'lendario', 'mitico'];
    ordemRaridades.forEach((raridade) => {
      classesOrdenadas.push(...agrupadoPorRaridade[raridade]);
    });
    console.log(`[DEBUG renderLista] Classes ordenadas por raridade: ${classesOrdenadas.length}`);

    // Estrutura de pastas (categorias)
    const pastas = [
      {
        nome: "Re'Dungeon",
        icon: '⚔️',
        image: 'https://i.imgur.com/dDoawMK.jpeg',
        color: '#ef4444',
        aberta: false,
        classes: [],
        mostrarRaridade: true
      },
      {
        nome: 'The Chaotical Gate',
        icon: '⚡',
        image: 'https://i.imgur.com/1GTo2G2.png',
        color: '#f59e0b',
        aberta: false,
        classes: [],
        mostrarRaridade: false
      },
      {
        nome: 'Cultivo',
        icon: '🔮',
        image: 'https://i.imgur.com/LXn1Jej.png',
        color: '#3b82f6',
        aberta: false,
        classes: [],
        mostrarRaridade: false
      },
      {
        nome: 'One Piece',
        icon: '🏴‍☠️',
        image: 'https://i.imgur.com/vXSjzr6.jpeg',
        color: '#a78bfa',
        aberta: false,
        classes: [],
        mostrarRaridade: false
      },
      {
        nome: 'Bleach',
        icon: '⚔️',
        image: 'https://i.imgur.com/s4CFxTM.png',
        color: '#10b981',
        aberta: false,
        classes: [],
        mostrarRaridade: false
      },
      {
        nome: 'A Crônica dos Varkhan',
        icon: '📜',
        image: 'https://i.imgur.com/ejGrhaP.jpeg',
        color: '#7c3aed',
        aberta: false,
        classes: [],
        mostrarRaridade: false
      },
    ];

    // Alocar classes nas pastas corretas usando o campo `colecao` (se existir)
    const pastaMap = new Map(pastas.map(p => [p.nome, p]));
    classesOrdenadas.forEach((classe) => {
      const destinoNome = classe.colecao && pastaMap.has(classe.colecao) ? classe.colecao : "Re'Dungeon";
      const destino = pastaMap.get(destinoNome);
      destino.classes.push(classe);
    });

    // Renderizar cada pasta
    pastas.forEach((pasta) => {
      console.log(`[DEBUG renderLista] Renderizando pasta "${pasta.nome}" com ${pasta.classes.length} classes`);
      const pastaElement = this.criarPasta(pasta);
      // definir variavel CSS no elemento da pasta para que filhos herdem a cor (se fornecida)
      pastaElement.style.setProperty('--folder-color', pasta.color || '#7c6ba8');
      this.listaClasses.appendChild(pastaElement);
    });
    console.log(`[DEBUG renderLista] Renderização concluída. Pastas criadas: ${pastas.length}`);
  }

  /**
   * Cria um elemento de pasta/categoria para classes
   * @private
   * @param {Object} pasta - Objeto com dados da pasta
   * @returns {HTMLElement}
   */
  criarPasta(pasta) {
    console.log(`[DEBUG criarPasta] Criando pasta: ${pasta.nome}, classes: ${pasta.classes.length}, mostrarRaridade: ${pasta.mostrarRaridade}`);
    
    const pastaElement = document.createElement('div');
    pastaElement.className = `rdg-class-folder ${pasta.aberta ? 'rdg-class-folder-opened' : ''}`;
    pastaElement.dataset.folder = pasta.nome.toLowerCase().replace(/[\/\s]/g, '-');

    // Header da pasta
    const headerPasta = document.createElement('div');
    headerPasta.className = 'rdg-class-folder-header';
    // setar variavel de cor no header tambem (para compatibilidade com estilos locais)
    headerPasta.style.setProperty('--folder-color', pasta.color || '#7c6ba8');
    headerPasta.innerHTML = `
      <span class="rdg-class-folder-icon">${pasta.aberta ? '▼' : '›'}</span>
      <span class="rdg-class-folder-avatar">${pasta.image ? `<img src="${pasta.image}" alt="${pasta.nome}"/>` : pasta.icon}</span>
      <span class="rdg-class-folder-name">${pasta.nome}</span>
      <span class="rdg-class-folder-count">${pasta.classes.length}</span>
    `;

    // (ajuste de descrições será chamado após renderDetalhes)

    pastaElement.appendChild(headerPasta);

    // Container das classes dentro da pasta
    const containerClasses = document.createElement('div');
    containerClasses.className = `rdg-class-folder-content ${pasta.aberta ? 'rdg-class-folder-content-open' : ''}`;

    if (pasta.classes.length > 0) {
      if (pasta.mostrarRaridade) {
        // Agrupar classes por raridade para exibição
        const agrupadoPorRaridade = {
          comum: [],
          raro: [],
          epico: [],
          lendario: [],
          mitico: []
        };

        pasta.classes.forEach((classe) => {
          if (agrupadoPorRaridade[classe.raridade]) {
            agrupadoPorRaridade[classe.raridade].push(classe);
          }
        });

        // Renderizar cada raridade como seção
        const ordemRaridades = ['comum', 'raro', 'epico', 'lendario', 'mitico'];
        ordemRaridades.forEach((raridade) => {
          const classesRaridade = agrupadoPorRaridade[raridade];
          if (classesRaridade.length > 0) {
            // Criar cabeçalho da raridade
            const secaoRaridade = document.createElement('div');
            secaoRaridade.className = 'rdg-raridade-secao';

            const headerRaridade = document.createElement('div');
            headerRaridade.className = `rdg-raridade-header ${raridade}`;
            headerRaridade.innerHTML = `
              <span>${this.formatarRaridade(raridade)}</span>
              <span class="rdg-raridade-count">(${classesRaridade.length})</span>
            `;
            secaoRaridade.appendChild(headerRaridade);

            // Criar container para classes da raridade
            const containerRaridade = document.createElement('div');
            containerRaridade.className = 'rdg-raridade-classes';

            classesRaridade.forEach((classe) => {
              const item = this.criarItemClasse(classe);
              containerRaridade.appendChild(item);
            });

            secaoRaridade.appendChild(containerRaridade);
            containerClasses.appendChild(secaoRaridade);
          }
        });
      } else {
        // Sem organização por raridade, só lista as classes
        pasta.classes.forEach((classe) => {
          const item = this.criarItemClasse(classe);
          containerClasses.appendChild(item);
        });
      }
    } else {
      // Mostrar mensagem se pasta vazia
      const msgVazia = document.createElement('div');
      msgVazia.className = 'rdg-class-folder-empty';
      msgVazia.textContent = 'Em breve...';
      containerClasses.appendChild(msgVazia);
    }

    pastaElement.appendChild(containerClasses);

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
    const header = pasta.querySelector('.rdg-class-folder-header');
    const icon = pasta.querySelector('.rdg-class-folder-icon');
    const content = pasta.querySelector('.rdg-class-folder-content');

    header.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const isOpen = pasta.classList.contains('rdg-class-folder-opened');

      if (isOpen) {
        // Fechar
        pasta.classList.remove('rdg-class-folder-opened');
        content.classList.remove('rdg-class-folder-content-open');
        icon.textContent = '›';
      } else {
        // Abrir
        pasta.classList.add('rdg-class-folder-opened');
        content.classList.add('rdg-class-folder-content-open');
        icon.textContent = '▼';
      }
    });
  }

  /**
   * Cria um elemento de item de classe
   * @private
   * @param {Object} classe - Objeto classe
   * @returns {HTMLElement}
   */
  criarItemClasse(classe) {
    const item = document.createElement('div');
    item.className = 'classe-item';
    item.dataset.classeId = classe.id;

    item.innerHTML = `
      <div class="classe-item-nome">${classe.nome}</div>
      <div class="classe-item-raridade classe-raridade ${classe.raridade}">
        ${this.formatarRaridade(classe.raridade)}
      </div>
    `;

    // Definir cor de seleção específica para esta classe (prioridade: campo 'cor' -> mapa por id -> pasta/fallback)
    const corDaClasse = this.obterCorClasse(classe) || '';
    if (corDaClasse) {
      item.style.setProperty('--selection-color', corDaClasse);

      // Converter HEX para componentes RGB e expor como variável --selection-color-rgb
      const hex = corDaClasse.replace('#', '');
      let r = 0, g = 0, b = 0;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);
      }
      item.style.setProperty('--selection-color-rgb', `${r}, ${g}, ${b}`);
    }

    return item;
  }

  /**
   * Seleciona uma classe e atualiza a interface
   * @public
   * @param {string} classeId - ID da classe
   */
  selecionarClasse(classeId) {
    const classe = obterClassePorId(classeId);
    if (!classe) {
      console.error(`ClassesUI: Classe ${classeId} não encontrada`);
      return;
    }

    // Atualiza estado ativo
    this.classeAtiva = classeId;
    this.classeAtual = classe; // Armazena a classe atual para uso nos botões

    // Remove classe ativo de todos os itens
    document.querySelectorAll('.classe-item').forEach((item) => {
      item.classList.remove('ativo');
    });

    // Adiciona classe ativo ao item selecionado
    const itemSelecionado = document.querySelector(
      `.classe-item[data-classe-id="${classeId}"]`
    );
    if (itemSelecionado) {
      itemSelecionado.classList.add('ativo');
    }

    // Renderiza detalhes da classe
    this.renderDetalhes(classe);

    // ✨ Atualizar estado de TODOS os botões
    this.atualizarBotoesSelecionados();

    // Scroll suave para o item selecionado
    if (itemSelecionado) {
      itemSelecionado.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }

  /**
   * Renderiza os detalhes da classe no painel principal
   * @private
   * @param {Object} classe - Objeto classe
   */
  renderDetalhes(classe) {
    const imagemClasse = classe.imagem || classe.image || '';
    const imagemEhURL = typeof imagemClasse === 'string' && /^(https?:\/\/|\/|data:)/i.test(imagemClasse);
    const imagemHTML = imagemEhURL
      ? `<img
           src="${imagemClasse}"
           alt="${classe.nome}"
           onerror="this.onerror=null; this.src='https://i.imgur.com/0uGU22m.png';"
         />`
      : `<div class="classe-imagem-placeholder">${imagemClasse || '🎭'}</div>`;

    this.painalDetalhes.innerHTML = `
      <!-- Header da Classe -->
      <div class="classe-header">
        <div class="classe-header-left">
          <h3 class="classe-nome">${classe.nome}</h3>
          <span class="classe-raridade ${classe.raridade}">
            ${this.formatarRaridade(classe.raridade)}
          </span>
        </div>
        <div class="classe-header-right">
          <button class="btn-escolher" data-classe-id="${classe.id}">Escolher</button>
          <button class="btn-cadeado" data-classe-id="${classe.id}" title="Desbloquear">🔒</button>
        </div>
      </div>

      <!-- Imagem da Classe -->
      <div class="classe-imagem">
        ${imagemHTML}
      </div>

      <!-- Descrição -->
      <section class="classe-secao classe-descricao">
        <div class="classe-secao-titulo">Descrição</div>
        <p class="classe-descricao-texto">${classe.descricao}</p>
      </section>

      <!-- Atributos -->
      <section class="classe-secao classe-atributos">
        <div class="classe-secao-titulo">Atributos Base</div>
        <div class="atributos-grid">
          ${this.renderAtributos(classe.atributos)}
        </div>
      </section>

      <!-- Habilidades -->
      <section class="classe-secao classe-habilidades">
        <div class="classe-secao-titulo">Habilidades da Classe</div>
        
        <!-- Abas de Habilidades -->
        <div class="habilidades-tabs">
          <button class="tab-button active" data-tab="basicas">
            ⭐ Básicas
          </button>
          ${classe.habilidadesAvancadas && classe.habilidadesAvancadas.length > 0 ? `
            <button class="tab-button" data-tab="avancadas">
              ✨ Avançadas
            </button>
          ` : ''}
          ${classe.habilidadesExtremas && classe.habilidadesExtremas.length > 0 ? `
            <button class="tab-button" data-tab="extremas">
              ⚡ Extremas
            </button>
          ` : ''}
        </div>

        <!-- Conteúdo das Abas -->
        <div class="habilidades-conteudo">
          <div class="habilidades-painel active" data-painel="basicas">
            ${this.renderHabilidades(classe.habilidadesBasicas || [], classe)}
          </div>
          ${classe.habilidadesAvancadas && classe.habilidadesAvancadas.length > 0 ? `
            <div class="habilidades-painel" data-painel="avancadas">
              ${this.renderHabilidades(classe.habilidadesAvancadas || [], classe)}
            </div>
          ` : ''}
          ${classe.habilidadesExtremas && classe.habilidadesExtremas.length > 0 ? `
            <div class="habilidades-painel" data-painel="extremas">
              ${this.renderHabilidades(classe.habilidadesExtremas || [], classe)}
            </div>
          ` : ''}
        </div>
      </section>

    `;

    // Ajusta descrições longas para caber no card (reduz fonte se necessário)
    // Pequeno delay para garantir que o DOM esteja calculado/renderizado
    setTimeout(() => this.ajustarDescricoesHabilidades(), 50);

    // ✨ Não chama mais atualizarEstadoBotoes aqui
    // Isso é chamado de selecionarClasse()
  }

  /**
   * Renderiza os atributos da classe
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
      percepcao: 'Percepção'
    };

    return Object.entries(atributos)
      .filter(([chave]) => chave !== 'sorte') // Remove Sorte
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
   * Renderiza as habilidades da classe (apenas BÁSICAS)
   * @private
   * @param {Array} habilidades - Array de habilidades
   * @returns {string} HTML das habilidades
   */
  renderHabilidades(habilidades, classe) {
    if (!habilidades || !Array.isArray(habilidades)) {
      return '<p class="sem-habilidades">Nenhuma habilidade básica disponível</p>';
    }
    
    if (habilidades.length === 0) {
      return '<p class="sem-habilidades">Nenhuma habilidade básica disponível</p>';
    }
    
    return habilidades
      .map((habilidade) => {
        const bloqueada = !this.verificarRequisito(habilidade);
        const classeBloqueada = bloqueada ? 'habilidade-bloqueada' : '';
        const tipoCor = this.obterCorTipo(habilidade.tipo);

        // Verificar se esta habilidade já foi selecionada (Art já existe)
        const jaSelecionada = this.verificarSeHabilidadeEstaAdicionada(habilidade.nome, classe?.nome || '');
        const classeButtonSelecionado = jaSelecionada ? 'selecionado' : '';
        const corButton = jaSelecionada ? (this.obterCorClasse(classe) || '#4ade80') : '#888';

        return `
          <div class="habilidade-card habilidade-classe ${classeBloqueada}">
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
            <div class="habilidade-badges-classe">
              <span class="badge-info-classe">📍 ${habilidade.alcance || 'N/A'}</span>
              <span class="badge-info-classe">👥 ${habilidade.alvos || 'N/A'}</span>
              <span class="badge-info-classe">🔄 ${habilidade.recarga || '0'}</span>
              <span class="badge-info-classe">💎 ${habilidade.custo || '0'}</span>
              <span class="badge-info-classe">⏱️ ${habilidade.duracao || '0'}</span>
              <span class="badge-info-classe">🎲 ${habilidade.dado || '0'}</span>
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

            <!-- Rodapé com Botão de Seleção -->
            <div class="habilidade-footer">
              <span class="habilidade-adicional"></span>
              <button class="btn-selecionar-habilidade ${classeButtonSelecionado}" 
                      data-habilidade-nome="${habilidade.nome}" 
                      data-classe-id="${classe?.id || ''}" 
                      data-classe-nome="${classe?.nome || ''}" 
                      data-classe-descricao="${(classe?.descricao || '').replace(/"/g, '&quot;')}"
                      data-tooltip="${jaSelecionada ? 'Clique para remover' : 'Clique para adicionar'}"
                      title="${jaSelecionada ? 'Habilidade selecionada' : 'Selecionar esta habilidade'}">
                ✓
              </button>
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
   * Aplica filtros de busca e raridade
   * @private
   * @param {string} busca - Texto de busca por nome
   * @param {string} raridade - Valor de raridade para filtrar
   */
  aplicarFiltros(busca = '', raridade = '') {
    const todasClasses = obterTodasAsClasses();

    let classesFiltradas = todasClasses.filter((classe) => {
      // Filtro por busca (nome)
      const passaBusca = classe.nome.toLowerCase().includes(busca.toLowerCase());

      // Filtro por raridade
      const passaRaridade = !raridade || classe.raridade === raridade;

      return passaBusca && passaRaridade;
    });

    // Renderiza lista filtrada
    this.renderLista(classesFiltradas);

    // Se houver resultados, seleciona o primeiro
    if (classesFiltradas.length > 0) {
      this.selecionarClasse(classesFiltradas[0].id);
    } else {
      // Limpa painel de detalhes
      this.painalDetalhes.innerHTML = '<div class="sem-resultados">Nenhuma classe encontrada com esses filtros</div>';
    }

    console.log(`Filtros aplicados: busca="${busca}", raridade="${raridade}" → ${classesFiltradas.length} classes`);
  }

  /**
   * Renderiza as habilidades avançadas da classe
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

            <!-- Atributos em 2 linhas -->
            <div class="habilidade-atributos">
              <div class="atributo-linha">
                ${habilidade.alcance ? `<span class="atrib">📍 ${habilidade.alcance}</span>` : ''}
                ${habilidade.alvos ? `<span class="atrib">👥 ${habilidade.alvos}</span>` : ''}
                ${habilidade.recarga ? `<span class="atrib">🔄 ${habilidade.recarga}</span>` : ''}
              </div>
              <div class="atributo-linha">
                ${habilidade.custo ? `<span class="atrib">💎 ${habilidade.custo}</span>` : ''}
                ${habilidade.duracao ? `<span class="atrib">⏱️ ${habilidade.duracao}</span>` : ''}
                ${habilidade.dado ? `<span class="atrib">🎲 ${habilidade.dado}</span>` : ''}
              </div>
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
    // Remove classe 'active' apenas dos botões e painéis dentro do modal de CLASSES
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
   * Obtém a classe ativa atual
   * @public
   * @returns {Object|null} Classe ativa ou null
   */
  obterClasseAtiva() {
    return this.classeAtiva ? obterClassePorId(this.classeAtiva) : null;
  }

  /**
   * Obtém a cor usada para destacar uma classe quando selecionada.
   * Procura em propriedades do objeto (cor / color) e faz fallback para um mapa
   * de cores por id para classes comuns. Se nada for encontrado, retorna null.
   * @private
   * @param {Object} classe
   * @returns {string|null} cor em hexadecimal ou null
   */
  obterCorClasse(classe) {
    if (!classe) return null;

    // Priorizar propriedade explícita
    if (classe.cor) return classe.cor;
    if (classe.color) return classe.color;
    if (classe.corHex) return classe.corHex;

    // Mapa por id/nome para casos onde dados não fornecem cor
    const mapa = {
      guerreiro: '#b22222',
      mago: '#4169e1',
      arqueiro: '#ffd700',
      clerigo: '#ffd700',
      ladrao: '#2f4f4f',
      paladino: '#ffd700',
      xama: '#228b22',
      assassino: '#000000',
      cavaleiro: '#696969'
    };

    const key = (classe.id || (classe.nome || '').toLowerCase()).toString().toLowerCase();
    return mapa[key] || null;
  }

  /**
   * Retorna cor de contraste (texto) para uma cor de fundo em HEX.
   * Simples cálculo de luminância para escolher preto ou branco.
   * @private
   * @param {string} hex - Ex: '#aabbcc' ou 'aabbcc'
   * @returns {string} '#000' ou '#fff'
   */
  obterCorContraste(hex) {
    if (!hex) return '#000';
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    // Calcular luminância relativa
    const luminance = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
    return luminance > 0.6 ? '#000' : '#fff';
  }

  /**
   * Adiciona uma nova classe ao sistema
   * ⚠️ Nota: Modifique classes-data.js para adicionar permanentemente
   * @public
   * @param {Object} classe - Objeto classe
   */
  adicionarClasseDinamicamente(classe) {
    CLASSES_DATABASE.push(classe);
    this.renderLista();
    console.log(`ClassesUI: Classe ${classe.nome} adicionada dinamicamente`);
  }

  /**
   * SISTEMA DE MULTICLASSE - Adiciona ou remove classe da seleção
   * LIMITE: Máximo de 3 classes
   * @public
   * @param {string} classeId - ID da classe a adicionar/remover
   */
  escolherClasse(classeId) {
    const classe = obterClassePorId(classeId);
    if (!classe) {
      console.error(`ClassesUI: Classe ${classeId} não encontrada`);
      return;
    }

    // Verificar se classe já está selecionada
    const indexClasse = this.classesSelecionadas.indexOf(classeId);
    const jaEstadaselecionada = indexClasse !== -1;

    if (jaEstadaselecionada) {
      // REMOVER classe (desmarcar multiclasse)
      this.classesSelecionadas.splice(indexClasse, 1);
      console.log(`🔓 Classe "${classe.nome}" removida da multiclasse`);
    } else {
      // Verificar limite de 3 classes
      if (this.classesSelecionadas.length >= 3) {
        console.warn(`⛔ Limite de 3 classes atingido! Remova uma classe antes de adicionar outra.`);
        return;
      }
      
      // ADICIONAR classe (primeira seleção ou adicionar como multiclasse)
      this.classesSelecionadas.push(classeId);
      console.log(`✅ Classe "${classe.nome}" adicionada à multiclasse`);
    }

    // Se há classes selecionadas, ativar bloqueio
    this.bloqueioAtivo = this.classesSelecionadas.length > 0;

    // Salvar seleções no localStorage
    this.salvarClassesSelecionadas(this.classesSelecionadas);

    // Aplicar bloqueio visual
    this.aplicarBloqueioVisual();
    // Atualizar botão na interface
    this.atualizarBotoesSelecionados();

    // Atualizar campo da ficha com todas as classes
    this.atualizarCampoFicha();

    // ✅ Sincronizar popup de informações do jogador
    if (window.popupInfoJogador && typeof window.popupInfoJogador.loadValuesFromState === 'function') {
      window.popupInfoJogador.loadValuesFromState();
      console.log('✅ Popup sincronizado após escolher classe');
    }

    console.log(`📊 Multiclasse atualizada: ${this.classesSelecionadas.length}/3 classe(s) selecionada(s)`);
  }

  /**
   * Aplica bloqueio visual - marcando classes selecionadas
   * @private
   */
  aplicarBloqueioVisual() {
    const detalhes = this.painalDetalhes;
    
    if (this.bloqueioAtivo && this.classesSelecionadas.length > 0) {
      // Marcar painel como tendo seleção ativa
      detalhes.classList.add('classe-selecionada');
    } else {
      detalhes.classList.remove('classe-selecionada');
    }

    // Atualizar botões sem re-renderizar a lista para preservar o estado das pastas abertas
    this.atualizarBotoesSelecionados();

    // Aplicar visual nas classes da lista
    document.querySelectorAll('.classe-item').forEach((item) => {
      const classeId = item.dataset.classeId;
      if (this.classesSelecionadas.includes(classeId)) {
        item.classList.add('classe-selecionada');
        item.style.pointerEvents = 'auto';
      } else {
        item.classList.remove('classe-bloqueada', 'classe-selecionada');
        item.style.pointerEvents = 'auto';
      }
    });
  }

  /**
   * Remove bloqueio visual de todas as classes
   * @private
   */
  removerBloqueioVisual() {
    // Limpar classes do painel
    this.painalDetalhes.classList.remove('classe-selecionada');

    // Remover bloqueio de todos os itens
    document.querySelectorAll('.classe-item').forEach((item) => {
      item.classList.remove('classe-bloqueada', 'classe-selecionada');
      item.style.pointerEvents = 'auto';
    });
  }

  /**
   * Atualiza o estado de TODOS os botões de escolha baseado no multiclasse
   * Bloqueia botões de classes não selecionadas quando limite de 3 é atingido
   * @private
   */
  atualizarBotoesSelecionados() {
    const limiteAtingido = this.classesSelecionadas.length >= 3;

    // Atualizar todos os botões
    document.querySelectorAll('.btn-escolher').forEach((btn) => {
      const classeId = btn.dataset.classeId;
      const jaSelecionada = this.classesSelecionadas.includes(classeId);

      if (jaSelecionada) {
        // Classe foi selecionada
        btn.textContent = 'Multiclasse';
        btn.classList.add('btn-selecionada');
        btn.classList.remove('btn-bloqueado');
        // Usar cor da classe para o botão, com fallback para verde antigo
        const corClasse = this.obterCorClasse(obterClassePorId(classeId)) || '#4ade80';
        btn.style.backgroundColor = corClasse;
        btn.style.color = this.obterCorContraste(corClasse);
        btn.disabled = false; // Pode remover
        btn.title = 'Clique para remover desta multiclasse';
      } else {
        // Classe não foi selecionada
        if (limiteAtingido) {
          // Limite atingido - bloquear botão
          btn.textContent = '🔒 Limite atingido';
          btn.classList.add('btn-bloqueado');
          btn.classList.remove('btn-selecionada');
          btn.style.backgroundColor = '#666';
          btn.style.color = '#aaa';
          btn.disabled = true;
          btn.title = 'Limite de 3 classes atingido. Remova uma para adicionar outra.';
        } else {
          // Limite não atingido - botão disponível
          btn.textContent = 'Escolher';
          btn.classList.remove('btn-selecionada', 'btn-bloqueado');
          btn.style.backgroundColor = '';
          btn.style.color = '';
          btn.disabled = false;
          btn.title = 'Clique para adicionar esta classe';
        }
      }
    });

    // ✨ Atualizar botões de seleção de HABILIDADES também
    this.atualizarBotoesHabilidades();
  }

  /**
   * Atualiza o estado dos botões de seleção de habilidades
   * Sincroniza com as Arts existentes do personagem
   * @private
   */
  atualizarBotoesHabilidades() {
    if (!this.classeAtual) {
      console.warn('⚠️ Nenhuma classe ativa para atualizar botões de habilidades');
      return;
    }

    // Obter classe ativa
    const classe = this.classeAtual;
    console.log(`🔄 Atualizando botões de habilidades para: ${classe.nome}`);

    // Buscar todos os botões de seleção de habilidades
    const botoesHabilidades = document.querySelectorAll('.btn-selecionar-habilidade');
    
    botoesHabilidades.forEach((btn) => {
      const habilidadeNome = btn.dataset.habilidadeNome;
      const classeNome = btn.dataset.classeNome;

      // Verificar se a habilidade foi adicionada como Art
      const jaSelecionada = this.verificarSeHabilidadeEstaAdicionada(habilidadeNome, classeNome);

      if (jaSelecionada) {
        // Marcar como selecionado
        btn.classList.add('selecionado');
        btn.setAttribute('data-tooltip', 'Clique para remover');
        btn.setAttribute('title', 'Habilidade selecionada');
      } else {
        // Desmarcar como selecionado
        btn.classList.remove('selecionado');
        btn.setAttribute('data-tooltip', 'Clique para adicionar');
        btn.setAttribute('title', 'Selecionar esta habilidade');
      }
    });

    console.log(`✅ Botões de habilidades atualizados para ${classe.nome}`);
  }

  /**
   * Limpa TODAS as classes da multiclasse (reset completo)
   * @public
   */
  alternarBloqueioGlobal() {
    if (!this.bloqueioAtivo || this.classesSelecionadas.length === 0) {
      console.warn('ClassesUI: Nenhuma classe selecionada para limpar');
      return;
    }

    // Limpar todas as seleções
    this.classesSelecionadas = [];
    this.bloqueioAtivo = false;

    // Limpar classes do localStorage
    this.limparClassesSalvas();

    // Remover bloqueio visual
    this.removerBloqueioVisual();

    // Restaurar todos os botões
    document.querySelectorAll('.btn-escolher').forEach((btn) => {
      btn.textContent = 'Escolher';
      btn.classList.remove('btn-selecionada');
      btn.style.backgroundColor = '';
    });

    // Limpar campo da ficha
    this.limparCampoFicha();

    // ✅ Sincronizar popup de informações do jogador
    if (window.popupInfoJogador && typeof window.popupInfoJogador.loadValuesFromState === 'function') {
      window.popupInfoJogador.loadValuesFromState();
      console.log('✅ Popup sincronizado após limpar multiclasse');
    }

    console.log('🔓 Todas as classes removidas da multiclasse.');
  }

  /**
   * Atualiza o campo da ficha com as classes selecionadas
   * Sincroniza #personagem-classe (classes selecionadas)
   * @private
   */
  atualizarCampoFicha() {
    // Construir nome das classes selecionadas
    let nomeClasses = 'Classe';
    if (this.classesSelecionadas.length > 0) {
      const nomes = this.classesSelecionadas.map(id => {
        const classe = obterClassePorId(id);
        return classe ? classe.nome : id;
      });
      nomeClasses = nomes.length === 1 ? nomes[0] : nomes.join(' ➠ ');
    }

    // Atualizar campo simples de classe (#personagem-classe)
    const campoClasse = document.getElementById('personagem-classe');
    if (campoClasse) {
      campoClasse.textContent = nomeClasses;
      campoClasse.classList.add('atualizado');
      
      setTimeout(() => {
        campoClasse.classList.remove('atualizado');
      }, 500);
    }
  }
  /**
   * Limpa o campo da ficha
   * @private
   */
  limparCampoFicha() {
    // Limpar campo simples de classe
    const campoClasse = document.getElementById('personagem-classe');
    if (campoClasse) {
      campoClasse.textContent = 'Classe';
      campoClasse.classList.remove('atualizado');
      console.log(`🧹 Campo #personagem-classe resetado: "Classe"`);
    }
  }

  /**
   * Retorna todas as classes selecionadas
   * @public
   * @returns {Array} Array de objetos classe
   */
  obterClassesSelecionadas() {
    return this.classesSelecionadas.map(id => obterClassePorId(id)).filter(c => c !== null);
  }

  /**
   * Retorna a primeira classe selecionada
   * @public
   * @returns {Object|null} Objeto classe ou null
   */
  obterClasseSelecionada() {
    if (this.classesSelecionadas.length === 0) return null;
    return obterClassePorId(this.classesSelecionadas[0]);
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
   * Atualiza o estado dos botões baseado na multiclasse
   * @private
   * @param {string} classeId - ID da classe atual
   */
  atualizarEstadoBotoes(classeId) {
    const btnEscolher = document.querySelector(`[data-classe-id="${classeId}"] .btn-escolher`);
    const btnCadeado = document.querySelector(`[data-classe-id="${classeId}"] .btn-cadeado`);

    if (!btnEscolher || !btnCadeado) return;

    const estadaselecionada = this.classesSelecionadas.includes(classeId);

    if (estadaselecionada) {
      // Esta classe foi selecionada
      btnEscolher.textContent = 'Multiclasse';
      btnEscolher.classList.add('btn-selecionada');
      const corBtn = this.obterCorClasse(obterClassePorId(classeId)) || '#4ade80';
      btnEscolher.style.backgroundColor = corBtn;
      btnEscolher.style.color = this.obterCorContraste(corBtn);
      btnCadeado.disabled = false; // Cadeado habilitado para remover
    } else {
      // Esta classe NÃO foi selecionada
      btnEscolher.textContent = 'Escolher';
      btnEscolher.classList.remove('btn-selecionada');
      btnEscolher.style.backgroundColor = '';
      btnCadeado.disabled = true; // Cadeado desabilitado
    }
  }

  /**
   * Salva as classes selecionadas no localStorage
   * @private
   * @param {Array} classeIds - Array de IDs de classes
   */
  salvarClassesSelecionadas(classeIds) {
    try {
      localStorage.setItem('redungeon_classes_selecionadas', JSON.stringify(classeIds));
      console.log(`💾 ${classeIds.length} classe(s) salva(s) no localStorage`);
    } catch (e) {
      console.warn('ClassesUI: Não foi possível salvar no localStorage', e);
    }
  }

  /**
   * Carrega as classes selecionadas do localStorage
   * @private
   * @returns {Array|null} Array de IDs de classes ou null
   */
  carregarClassesSalvas() {
    try {
      const classesSalvas = localStorage.getItem('redungeon_classes_selecionadas');
      if (classesSalvas) {
        const classesArray = JSON.parse(classesSalvas);
        console.log(`📂 ${classesArray.length} classe(s) carregada(s) do localStorage`);
        return classesArray;
      }
      return null;
    } catch (e) {
      console.warn('ClassesUI: Não foi possível carregar do localStorage', e);
      return null;
    }
  }

  /**
   * Limpa as classes salvas do localStorage
   * @private
   */
  limparClassesSalvas() {
    try {
      localStorage.removeItem('redungeon_classes_selecionadas');
      console.log('🗑️ Classes removidas do localStorage');
    } catch (e) {
      console.warn('ClassesUI: Não foi possível limpar localStorage', e);
    }
  }

  /**
   * Sincroniza o campo da ficha com os dados persistidos (multiclasse)
   * Chamado na inicialização para garantir que os dados estejam corretos após reload
   * @private
   */
  sincronizarCampoFicha() {
    const campoClasse = document.getElementById('personagem-classe');
    
    if (!campoClasse) {
      console.warn('⚠️ Campo da ficha não encontrado no DOM');
      return;
    }

    try {
      // Buscar classes do localStorage
      const classesSelecionadasIds = this.carregarClassesSalvas() || [];

      let nomeClasses = 'Classe';

      // Buscar nomes das classes APENAS se foram escolhidas
      if (classesSelecionadasIds.length > 0) {
        try {
          // Verificar se obterClassePorId existe
          if (typeof obterClassePorId !== 'function') {
            console.warn('⚠️ Função obterClassePorId não disponível ainda');
            // Tentar novamente após delay
            setTimeout(() => this.sincronizarCampoFicha(), 100);
            return;
          }

          const nomes = classesSelecionadasIds.map(id => {
            const classe = obterClassePorId(id);
            if (!classe) {
              console.warn(`⚠️ Classe ${id} não encontrada`);
              return null;
            }
            return classe.nome;
          }).filter(n => n !== null);
          
          if (nomes.length > 0) {
            nomeClasses = nomes.length === 1 ? nomes[0] : nomes.join(' ➠ ');
            console.log(`✅ ${nomes.length} classe(s) recuperada(s): ${nomeClasses}`);
          } else {
            console.warn('⚠️ Nenhum nome de classe foi recuperado');
          }
        } catch (e) {
          console.warn('⚠️ Erro ao buscar classes:', e);
        }
      }

      // Atualizar campo simples de classe
      campoClasse.textContent = nomeClasses;

      console.log(`✅ Campo sincronizado na inicialização: ${nomeClasses}`);
    } catch (e) {
      console.error('❌ Erro ao sincronizar campos da ficha:', e);
    }
  }

  /**
   * Adiciona uma habilidade como Art e cria/atualiza o Núcleo da classe
   * @private
   */
  adicionarHabilidadeArt(habilidadeNome, classeNome, classeDescricao, classeId, btnSelecionar) {
    console.log('📝 Iniciando adicionarHabilidadeArt:', { habilidadeNome, classeNome, classeId });
    
    try {
      // Aguardar ArtsSystem estar pronto
      const aguardarArtsSystem = () => {
        return new Promise((resolve) => {
          let tentativas = 0;
          const verificar = setInterval(() => {
            if (window.artsSystem && window.artsSystem.character) {
              console.log('✅ ArtsSystem encontrado!');
              clearInterval(verificar);
              resolve();
            }
            tentativas++;
            if (tentativas > 50) { // 5 segundos de timeout
              console.warn('⚠️ Timeout aguardando ArtsSystem');
              clearInterval(verificar);
              resolve();
            }
          }, 100);
        });
      };

      aguardarArtsSystem().then(() => {
        console.log('🔍 Verificando ArtsSystem...');
        if (!window.artsSystem || !window.artsSystem.character) {
          console.error('❌ ArtsSystem não inicializado');
          return;
        }

        const character = window.artsSystem.character;
        console.log('📊 Character encontrado, cores existentes:', character.cores.length);

        // Verificar se Núcleo da classe já existe
        let core = character.cores.find(c => c.name === classeNome);

        if (!core) {
          console.log('🆕 Criando novo Núcleo para:', classeNome);
          // Gerar descrição automática baseada no nome da classe
          const descricaoGerada = this.gerarDescricaoNucleo(classeNome);
          
          // Criar novo Núcleo
          core = new Core({
            name: classeNome,
            description: descricaoGerada,
            concept: this.analisarTiposDasHabilidades(classeId), // Tipo mais frequente
            visualForm: '', // Bônus opcional vazio
            coreType: this.analisarTiposDasHabilidades(classeId)
          });
          character.addCore(core);
          console.log(`✅ Núcleo criado: ${classeNome}`, core);
        } else {
          console.log('♻️ Usando Núcleo existente:', core.name);
        }

        // Obter habilidade completa
        const classe = obterClassePorId(classeId);
        if (!classe) {
          console.error(`❌ Classe ${classeId} não encontrada`);
          return;
        }

        let habilidade = classe.habilidadesBasicas.find(h => h.nome === habilidadeNome);
        
        // Se não encontrar em básicas, procurar em avançadas
        if (!habilidade && classe.habilidadesAvancadas) {
          habilidade = classe.habilidadesAvancadas.find(h => h.nome === habilidadeNome);
        }

        // Se não encontrar em avançadas, procurar em extremas
        if (!habilidade && classe.habilidadesExtremas) {
          habilidade = classe.habilidadesExtremas.find(h => h.nome === habilidadeNome);
        }

        if (!habilidade) {
          console.error(`❌ Habilidade ${habilidadeNome} não encontrada`);
          return;
        }

        console.log('🎨 Habilidade encontrada:', habilidade.nome);

        // Determinar o tipo correto de Art baseado na habilidade
        const tipoArt = this.determinarTipoArt(habilidade);
        console.log(`📊 Tipo de Art determinado: ${tipoArt}`);

        // Criar Art a partir da habilidade
        const art = new Art({
          name: habilidadeNome,
          coreId: core.id,
          type: tipoArt, // Tipo inteligente: ofensiva, defensiva, estrategica, suporte, controle, invocacao, transformacao, passiva
          artType: tipoArt, // Mesmo tipo para artType
          action: habilidade.tipo || 'Imediata', // Imediata, Duradoura ou Sustentada
          description: habilidade.descricao,
          cost: habilidade.custo || 0,
          cooldown: habilidade.recarga || 0,
          duration: habilidade.duracao || 'Sustentada',
          range: habilidade.alcance || 'Pessoal',
          targets: habilidade.alvos || 'Você',
          damage: habilidade.dado || '0',
          reload: habilidade.recarga || 0,
          image: null
        });

        character.addArt(art);
        console.log(`✅ Art adicionada: ${habilidadeNome}`);

        // Marcar botão como selecionado com animação
        btnSelecionar.classList.add('selecionado');
        btnSelecionar.setAttribute('data-tooltip', 'Clique para remover');
        btnSelecionar.setAttribute('title', 'Habilidade selecionada');
        btnSelecionar.textContent = '✓';
        
        // Efeito visual de seleção bem-sucedida
        btnSelecionar.style.animation = 'none';
        setTimeout(() => {
          btnSelecionar.style.animation = '';
        }, 10);
        
        console.log('🎯 Botão marcado como selecionado');

        // Salvar dados
        StorageManager.saveCharacter(character);
        console.log('💾 Character salvo');

        // Atualizar UI do ArtsSystem
        if (window.artsSystem && window.artsSystem.uiManager && window.artsSystem.uiManager.render) {
          window.artsSystem.uiManager.render(window.artsSystem.character);
          console.log('🎨 ArtsSystem render() chamado');
        }
      });

    } catch (error) {
      console.error('❌ Erro ao adicionar habilidade como Art:', error);
    }
  }

  /**
   * Remove uma habilidade da seção de Arts
   * @private
   */
  removerHabilidadeArt(habilidadeNome, classeNome) {
    try {
      if (!window.artsSystem || !window.artsSystem.character) {
        console.warn('⚠️ ArtsSystem não inicializado, tentando novamente...');
        setTimeout(() => this.removerHabilidadeArt(habilidadeNome, classeNome), 500);
        return;
      }

      const character = window.artsSystem.character;
      const core = character.cores.find(c => c.name === classeNome);

      if (!core) {
        console.warn(`⚠️ Núcleo ${classeNome} não encontrado`);
        return;
      }

      // Encontrar e remover Arts com esse nome
      const artsParaRemover = character.arts.filter(a => a.name === habilidadeNome && a.coreId === core.id);
      
      artsParaRemover.forEach(art => {
        character.removeArt(art.id);
        console.log(`✅ Art removida: ${habilidadeNome}`);
      });

      // Desmarcar botão com animação
      const btnSelecionar = document.querySelector(`[data-habilidade-nome="${habilidadeNome}"]`);
      if (btnSelecionar) {
        // Efeito visual antes de remover a classe
        btnSelecionar.style.animation = 'pulse-selection 0.6s ease-out';
        
        setTimeout(() => {
          btnSelecionar.classList.remove('selecionado');
          btnSelecionar.setAttribute('data-tooltip', 'Clique para adicionar');
          btnSelecionar.setAttribute('title', 'Selecionar esta habilidade');
          btnSelecionar.textContent = '✓';
          btnSelecionar.style.animation = '';
        }, 300);
      }

      // Salvar dados
      StorageManager.saveCharacter(character);

      // Atualizar UI do ArtsSystem
      if (window.artsSystem && window.artsSystem.uiManager && window.artsSystem.uiManager.render) {
        window.artsSystem.uiManager.render(window.artsSystem.character);
      }

    } catch (error) {
      console.error('❌ Erro ao remover habilidade de Arts:', error);
    }
  }

  /**
   * Analisa as habilidades de uma classe e retorna o tipo mais frequente
   * @private
   */
  analisarTiposDasHabilidades(classeId) {
    const classe = obterClassePorId(classeId);
    if (!classe) return 'Estratégica';

    const tipos = classe.habilidadesBasicas
      .map(h => h.tipo)
      .filter(t => t && t !== 'N/A');

    if (tipos.length === 0) return 'Estratégica';

    // Contar frequência
    const frequencia = {};
    tipos.forEach(tipo => {
      frequencia[tipo] = (frequencia[tipo] || 0) + 1;
    });

    // Retornar tipo mais frequente
    return Object.keys(frequencia).reduce((a, b) => 
      frequencia[a] > frequencia[b] ? a : b
    );
  }

  /**
   * Determina o tipo de Art baseado na habilidade
   * Analisa a descrição e nome para classificar corretamente
   * Ordem: Passiva > Invocação > Transformação > Controle > Suporte > Defensiva > Estratégica > Ofensiva
   * @private
   * @param {Object} habilidade - Objeto da habilidade
   * @returns {string} Tipo de Art (ofensiva, defensiva, estrategica, suporte, controle, invocacao, transformacao, passiva)
   */
  determinarTipoArt(habilidade) {
    const descricao = (habilidade.descricao || '').toLowerCase();
    const nome = (habilidade.nome || '').toLowerCase();
    const tipo = (habilidade.tipo || '').toLowerCase();
    const bonus = (habilidade.bonus || []).map(b => b.toLowerCase()).join(' ');

    console.log(`🔍 Analisando tipo de Art para: ${habilidade.nome}`);

    // ═══════════════════════════════════════════════════════════════════════
    // 1️⃣ PASSIVA - Sempre ativa ou ativação automática
    // ═══════════════════════════════════════════════════════════════════════
    if (tipo === 'passiva' || tipo === 'passíva') {
      console.log('✓ Classificado como PASSIVA (tipo declarado)');
      return 'passiva';
    }

    const passivaPalavras = ['sempre', 'passiva', 'automática', 'ativação automática', 'permanente', 'contínua', 'enquanto ativa'];
    if (passivaPalavras.some(p => descricao.includes(p) || nome.includes(p))) {
      console.log('✓ Classificado como PASSIVA (keywords)');
      return 'passiva';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2️⃣ INVOCAÇÃO - Criar entidades, armas, espíritos
    // ═══════════════════════════════════════════════════════════════════════
    const invocacaoPalavras = ['invoca', 'convoca', 'criatura', 'entidade', 'espírito', 'summon', 'criando', 'chamado', 'contrato', 'pacto', 'conjura criatura', 'rasgão planar', 'invocação'];
    if (invocacaoPalavras.some(p => descricao.includes(p) || nome.includes(p) || bonus.includes(p))) {
      console.log('✓ Classificado como INVOCAÇÃO (keywords)');
      return 'invocacao';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3️⃣ TRANSFORMAÇÃO - Mudar forma, estado ou modo de combate
    // ═══════════════════════════════════════════════════════════════════════
    const transformacaoPalavras = ['transforma', 'muda forma', 'estado', 'modo de', 'transformação', 'desperta', 'ascende', 'evolui', 'forma de', 'forma suprema'];
    if (transformacaoPalavras.some(p => descricao.includes(p) || nome.includes(p) || bonus.includes(p))) {
      console.log('✓ Classificado como TRANSFORMAÇÃO (keywords)');
      return 'transformacao';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4️⃣ CONTROLE - Imobilizar, paralisar, puxar, empurrar, selar
    // ═══════════════════════════════════════════════════════════════════════
    const controlePalavras = ['imobiliz', 'paralisa', 'prende', 'puxar', 'empurra', 'selar', 'desestabil', 'atordoa', 'congelá', 'enraíz', 'fixa', 'aprision', 'bloqueia movimento', 'não pode se mover', 'fixado', 'contenção', 'restrição', 'desestabiliz'];
    if (controlePalavras.some(p => descricao.includes(p) || nome.includes(p) || bonus.includes(p))) {
      console.log('✓ Classificado como CONTROLE (keywords)');
      return 'controle';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5️⃣ SUPORTE - Buffs, cura, fortalecimento aliado
    // ═══════════════════════════════════════════════════════════════════════
    const suportePalavras = ['cura', 'recupera', 'bônus', 'buff', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', 'aumenta', 'aliad', 'amigo', 'fornece', 'concede', 'bônus atributo', 'resistência', 'escudo de', 'aura de', 'harmonia', 'acorde', 'voz que cura', 'luz restauradora', 'milagre'];
    if (suportePalavras.some(p => descricao.includes(p) || nome.includes(p) || bonus.includes(p))) {
      console.log('✓ Classificado como SUPORTE (keywords)');
      return 'suporte';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6️⃣ DEFENSIVA - Proteção, escudo, redução de dano
    // ═══════════════════════════════════════════════════════════════════════
    const defensivaPalavras = ['proteção', 'escudo', 'defesa', 'reduz dano', 'redução de dano', 'resistência', 'absorve', 'diminui dano', 'bastião', 'aura de misericórdia', 'guardião', 'juramento', 'postura defensiva', 'contragolpe', 'bloqueio', 'contra corte'];
    if (defensivaPalavras.some(p => descricao.includes(p) || nome.includes(p) || bonus.includes(p))) {
      console.log('✓ Classificado como DEFENSIVA (keywords)');
      return 'defensiva';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 7️⃣ ESTRATÉGICA - Controle de campo, debuffs, manipulação tática
    // ═══════════════════════════════════════════════════════════════════════
    const estrategicaPalavras = ['controle de campo', 'debuff', 'tático', 'manipulação', 'ilumine', 'marcado', 'marca de', 'penalidade', '-1 em', '-2 em', '-3 em', 'reduz', 'fraqueza', 'instabilidade', 'zona de', 'armadilha', 'perda de', 'diminui', 'desvantagem'];
    if (estrategicaPalavras.some(p => descricao.includes(p) || nome.includes(p) || bonus.includes(p))) {
      console.log('✓ Classificado como ESTRATÉGICA (keywords)');
      return 'estrategica';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 8️⃣ OFENSIVA - Dano direto, ataques
    // PADRÃO: Se nenhuma categoria se aplica, é OFENSIVA
    // ═══════════════════════════════════════════════════════════════════════
    const ofensivaPalavras = ['dano', 'ataque', 'golpe', 'explosão', 'rajada', 'impacto', 'ferida', 'causa', 'dispara', 'lança', 'libera', 'conjura', 'descarrega', 'descarga', 'flecha', 'projétil', 'colisão', 'choque'];
    if (ofensivaPalavras.some(p => descricao.includes(p) || nome.includes(p) || bonus.includes(p))) {
      console.log('✓ Classificado como OFENSIVA (keywords)');
      return 'ofensiva';
    }

    // Se não corresponder a nada específico, é OFENSIVA por padrão
    console.log('✓ Classificado como OFENSIVA (padrão)');
    return 'ofensiva';
  }

  /**   */
  gerarDescricaoNucleo(classeNome) {
    const descricoes = {
      'Guerreiro': 'Núcleo de combate direto e defesa implacável. Domina armaduras e armas, absorvendo dano enquanto desferem golpes poderosos.',
      'Mago': 'Núcleo de manipulação mágica arcana. Canaliza energias elementais para lançar feitiços devastadores à distância.',
      'Arqueiro': 'Núcleo de precisão e velocidade. Domina o arco com precisão cirúrgica e rapidez impressionante em combate à distância.',
      'Sacerdote': 'Núcleo de poder divino e cura sagrada. Intermediário entre o divino e o mortal, curando aliados e amaldiçoando inimigos.',
      'Assassino': 'Núcleo de sigilo e letalidade. Sombra entre sombras, ataca nas trevas com precisão mortal e desaparece sem deixar rastros.',
      'Ranger': 'Núcleo de rastreamento e combate versátil. Mestre da natureza e do arco, combina mobilidade com precisão devastadora.',
      'Paladino': 'Núcleo de justiça sagrada e defesa. Guerreiro divino que protege aliados enquanto desferem ataques sagrados.',
      'Bardo': 'Núcleo de magia e persuasão. Manipula música e magia para suportar aliados enquanto desestabiliza inimigos.',
      'Druida': 'Núcleo de magia natural e transformação. Domina as forças da natureza e pode assumir forma animal em combate.',
      'Bruxo': 'Núcleo de magia sombria e pactual. Canaliza poder através de pactos, infligindo maldições devastadoras.'
    };

    // Se existe descrição específica para a classe, usa
    if (descricoes[classeNome]) {
      return descricoes[classeNome];
    }

    // Caso contrário, gera uma descrição genérica
    return `Núcleo de ${classeNome.toLowerCase()}. Manifesta todas as artes e habilidades características desta classe, canalizando seus poderes em combate.`;
  }

  /**
   * Verifica se uma habilidade já foi adicionada como Art
   * @private
   */
  verificarSeHabilidadeEstaAdicionada(habilidadeNome, classeNome) {
    // Se ArtsSystem não está pronto, tentar via localStorage
    if (!window.artsSystem || !window.artsSystem.character) {
      // Tentar carregar do localStorage
      try {
        const stored = localStorage.getItem('redungeon_character');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.data && data.data.arts) {
            const arts = data.data.arts;
            // Procurar Art com o nome da habilidade
            const artEncontrada = arts.find(a => a.name === habilidadeNome);
            if (artEncontrada) {
              // Verificar se o Core também existe e tem o mesmo nome da classe
              const cores = data.data.cores || [];
              const coreEncontrado = cores.find(c => c.id === artEncontrada.coreId && c.name === classeNome);
              return !!coreEncontrado;
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ Erro ao verificar localStorage:', e);
      }
      return false;
    }

    const character = window.artsSystem.character;
    const core = character.cores.find(c => c.name === classeNome);

    if (!core) {
      return false;
    }

    // Verificar se existe uma Art com esse nome vinculada a este Núcleo
    return character.arts.some(a => a.name === habilidadeNome && a.coreId === core.id);
  }


}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO AUTOMÁTICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema quando o DOM estiver pronto
 */
function inicializarClassesUI() {
  if (!window.classesUI) {
    try {
      window.classesUI = new ClassesUI();
      
      // Aguardar menu principal estar pronto (para garantir que botão existe)
      if (document.getElementById('menu-btn-classes')) {
        try {
          window.classesUI.init();
          console.log('✅ Sistema de classes inicializado globalmente');
        } catch (error) {
          console.warn('⚠️ Erro ao chamar init():', error.message);
          // Tentar novamente após um pouco
          setTimeout(() => {
            try {
              window.classesUI.init();
              console.log('✅ Sistema de classes inicializado globalmente (após delay)');
            } catch (e) {
              console.error('❌ Erro ao inicializar classes após delay:', e.message);
            }
          }, 200);
        }
      } else {
        // Se botão ainda não existe, aguardar um pouco mais
        setTimeout(() => {
          try {
            if (window.classesUI && typeof window.classesUI.init === 'function') {
              window.classesUI.init();
              console.log('✅ Sistema de classes inicializado globalmente (após delay)');
            }
          } catch (error) {
            console.warn('⚠️ Erro ao inicializar classes após delay:', error.message);
          }
        }, 300);
      }
    } catch (error) {
      console.error('❌ Erro ao criar ClassesUI:', error.message);
      // Criar uma instância vazia para evitar erros posteriores
      window.classesUI = {
        abrirModal: () => console.warn('⚠️ ClassesUI não inicializado corretamente'),
        init: () => {}
      };
    }
  }
  return window.classesUI;
}

// Inicializa automaticamente quando o documento está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarClassesUI);
} else {
  // DOM já está pronto - aguardar um pouco para garantir que tudo está pronto
  setTimeout(inicializarClassesUI, 50);
}
