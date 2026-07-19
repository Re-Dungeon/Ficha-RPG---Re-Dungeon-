/**
 * CAMADA DE INTERFACE - UI
 * Renderização dinâmica e gerenciamento de interações
 * Re:Dungeon Character Sheet
 */

class UIManager {
  constructor(containerId = 'rpg-content-habilidades') {
    this.container = document.getElementById(containerId);
    this.character = null;
    this.selectedCore = null;
    this.selectedArt = null;
    this.editMode = null; // null, 'art', 'core', 'variation'
    this.clickListener = null; // Armazenar listener para limpeza posterior
    this.attributeSyncInitialized = false; // Flag para evitar múltiplas inicializações
    this.isProcessing = false; // Flag para evitar cliques duplicados
  }

  /**
   * Renderiza a interface completa
   */
  async render(character) {
    this.character = character;

    if (!this.container) {
      console.error('Container não encontrado:', this.container);
      return;
    }

    // 🎨 PRÉ-CARREGAR IMAGENS DO INDEXEDDB ANTES DE RENDERIZAR
    console.log('📸 Pré-carregando imagens do IndexedDB...');
    await this.preloadImagesFromIndexedDB();

    // Limpar listeners antigos antes de re-renderizar
    this.removeEventListeners();
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
    this.updateStats();
    this.renderCores();
    this.renderArts();
    this.renderVariantes();
    
    // Setup listener para sincronizar atributos quando mudarem na aba de Atributos
    if (!this.attributeSyncInitialized) {
      this.setupAttributeSync();
      this.attributeSyncInitialized = true;
    }
  }

  /**
   * Pré-carregar todas as imagens do IndexedDB antes de renderizar os cards
   * Isso garante que as imagens apareçam nos cards
   */
  async preloadImagesFromIndexedDB() {
    if (typeof ImagemStorageManager === 'undefined') {
      console.warn('⚠️ ImagemStorageManager não disponível');
      return;
    }

    try {
      // Carregar imagens de núcleos
      for (const core of this.character.cores) {
        if (core._imagemId && !core.image) {
          try {
            const imagemBase64 = await ImagemStorageManager.carregarImagem(core._imagemId);
            if (imagemBase64) {
              core.image = imagemBase64;
              console.log('✅ Imagem do núcleo carregada:', core._imagemId);
            }
          } catch (e) {
            console.warn('⚠️ Erro ao carregar imagem do núcleo:', core._imagemId, e.message);
          }
        }
      }

      // Carregar imagens de arts
      for (const art of this.character.arts) {
        if (art._imagemId && !art.image) {
          try {
            const imagemBase64 = await ImagemStorageManager.carregarImagem(art._imagemId);
            if (imagemBase64) {
              art.image = imagemBase64;
              console.log('✅ Imagem da art carregada:', art._imagemId);
            }
          } catch (e) {
            console.warn('⚠️ Erro ao carregar imagem da art:', art._imagemId, e.message);
          }
        }

        // Carregar imagens de variações
        for (const variation of art.variations) {
          if (variation._imagemId && !variation.image) {
            try {
              const imagemBase64 = await ImagemStorageManager.carregarImagem(variation._imagemId);
              if (imagemBase64) {
                variation.image = imagemBase64;
                console.log('✅ Imagem da variação carregada:', variation._imagemId);
              }
            } catch (e) {
              console.warn('⚠️ Erro ao carregar imagem da variação:', variation._imagemId, e.message);
            }
          }
        }
      }

      console.log('✅ Pré-carregamento de imagens completo');
    } catch (error) {
      console.error('❌ Erro geral ao pré-carregar imagens:', error);
    }
  }

  /**
   * Remove event listeners antigos para evitar duplicação
   */
  removeEventListeners() {
    // Remover listeners de clique delegado
    if (this.clickListener) {
      this.container.removeEventListener('click', this.clickListener);
    }
  }

  /**
   * Setup de sincronização de atributos em tempo real (executado apenas uma vez)
   */
  setupAttributeSync() {
    console.log('🔧 Iniciando sincronização de atributos');
    
    // Listener para o evento personalizado de mudança de atributos
    window.addEventListener('atributosChanged', () => {
      console.log('📢 Evento atributosChanged recebido');
      this.syncAttributesFromAboutTab();
    });
    
    // Polling agressivo: sincronizar a cada 500ms
    this.attributeSyncInterval = setInterval(() => {
      this.syncAttributesFromAboutTab();
    }, 500);
  }

  /**
   * Template principal da interface
   */
  getTemplate() {
    return `
      <div class="arts-wrapper">
        <!-- HEADER -->
        <div class="arts-header">
          <h2>⚔️ Habilidades & Arts</h2>
        </div>

        <!-- STATS DISPLAY -->
        <div class="arts-stats-panel" id="arts-stats-panel">
          <!-- Preenchido dinamicamente -->
        </div>

        <!-- ATTRIBUTES SECTION -->
        <div class="arts-section">
          <h3>📊 Atributos</h3>
          <div class="arts-attributes-grid" id="arts-attributes-grid">
            <!-- Preenchido dinamicamente -->
          </div>
        </div>

        <!-- CORES SECTION -->
        <div class="arts-section">
          <div class="arts-section-header">
            <h3>🎯 Núcleos</h3>
            <div class="arts-action-group">
              <div class="arts-filter-box">
                <input type="text" id="arts-filter-cores" class="arts-filter-input" placeholder="Filtrar núcleos..." aria-label="Filtrar núcleos">
              </div>
              <select id="arts-filter-cores-type" class="arts-filter-select" aria-label="Filtrar por tipo">
                <option value="">Todos os tipos</option>
                <option value="ofensiva">Ofensiva</option>
                <option value="defensiva">Defensiva</option>
                <option value="estrategica">Estratégica</option>
                <option value="suporte">Suporte</option>
                <option value="controle">Controle</option>
                <option value="invocacao">Invocação</option>
                <option value="transformacao">Transformação</option>
                <option value="passiva">Passiva</option>
                <option value="racial">Racial</option>
              </select>
              <button class="arts-btn arts-btn-small" id="arts-btn-create-core">+ Criar Núcleo</button>
            </div>
          </div>
          <div class="arts-cores-list" id="arts-cores-list">
            <!-- Preenchido dinamicamente -->
          </div>
        </div>

        <!-- ARTS SECTION -->
        <div class="arts-section">
          <div class="arts-section-header">
            <h3>✨ Arts (Habilidades)</h3>
            <div class="arts-action-group">
              <div class="arts-filter-box">
                <input type="text" id="arts-filter-arts" class="arts-filter-input" placeholder="Filtrar habilidades..." aria-label="Filtrar habilidades">
              </div>
              <select id="arts-filter-arts-type" class="arts-filter-select" aria-label="Filtrar por tipo">
                <option value="">Todos os tipos</option>
                <option value="ofensiva">Ofensiva</option>
                <option value="defensiva">Defensiva</option>
                <option value="estrategica">Estratégica</option>
                <option value="suporte">Suporte</option>
                <option value="controle">Controle</option>
                <option value="invocacao">Invocação</option>
                <option value="transformacao">Transformação</option>
                <option value="passiva">Passiva</option>
                <option value="racial">Racial</option>
              </select>
              <button class="arts-btn arts-btn-small" id="arts-btn-create-art" 
                      ${!this.character.cores.length ? 'disabled' : ''}>
                + Criar Art
              </button>
            </div>
          </div>
          <div class="arts-arts-list" id="arts-arts-list">
            <!-- Preenchido dinamicamente -->
          </div>
        </div>

        <!-- VARIANTES SECTION -->
        <div class="arts-section" id="arts-variantes-section">
          <div class="arts-section-header">
            <h3>🌟 Variantes</h3>
            <div class="arts-action-group">
              <div class="arts-filter-box">
                <input type="text" id="arts-filter-variantes" class="arts-filter-input" placeholder="Filtrar variantes..." aria-label="Filtrar variantes">
              </div>
              <select id="arts-filter-variantes-type" class="arts-filter-select" aria-label="Filtrar por tipo">
                <option value="">Todos os tipos</option>
                <option value="Ofensiva">Ofensiva</option>
                <option value="Defensiva">Defensiva</option>
                <option value="Estratégica">Estratégica</option>
                <option value="Suporte">Suporte</option>
                <option value="Controle">Controle</option>
                <option value="Invocação">Invocação</option>
                <option value="Transformação">Transformação</option>
                <option value="Passiva">Passiva</option>
                <option value="Racial">Racial</option>
              </select>
              <button class="arts-btn arts-btn-small" id="arts-btn-create-variante" 
                      ${!this.character.arts.length ? 'disabled' : ''}>
                ✨ Criar Nova Variante
              </button>
            </div>
          </div>
          <div class="arts-variantes-list" id="arts-variantes-list">
            <!-- Preenchido dinamicamente -->
          </div>
        </div>

        <!-- MODALS -->
        <div id="arts-modal-overlay" class="arts-modal-overlay" style="display: none;">
          <div class="arts-modal" id="arts-modal">
            <div class="arts-modal-header">
              <h2 id="arts-modal-title">Modal</h2>
              <button class="arts-modal-close" id="arts-modal-close">&times;</button>
            </div>
            <div class="arts-modal-body" id="arts-modal-body">
              <!-- Preenchido dinamicamente -->
            </div>
            <div class="arts-modal-footer">
              <button class="arts-btn arts-btn-secondary" id="arts-modal-cancel">Cancelar</button>
              <button class="arts-btn arts-btn-primary" id="arts-modal-confirm">Confirmar</button>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * Atualiza painel de estatísticas
   */
  updateStats() {
    const panel = document.getElementById('arts-stats-panel');
    const report = RulesEngine.generateArtsReport(this.character);

    panel.innerHTML = `
      <div class="arts-stats-grid">
        <div class="arts-stat-card">
          <div class="arts-stat-label">Limite de Arts</div>
          <div class="arts-stat-value">${report.maxArts}</div>
        </div>
        <div class="arts-stat-card">
          <div class="arts-stat-label">Arts Ativas</div>
          <div class="arts-stat-value ${report.activeArts >= report.maxArts ? 'warning' : ''}">
            ${report.activeArts}
          </div>
        </div>
        <div class="arts-stat-card">
          <div class="arts-stat-label">Arts Bloqueadas</div>
          <div class="arts-stat-value ${report.blockedArts > 0 ? 'warning' : ''}">
            ${report.blockedArts}
          </div>
          ${report.blockedArts > 0 ? `
            <button id="arts-unlock-btn" class="arts-unlock-btn arts-unlock-animated" style="width: 50%; margin-top: 8px; padding: 6px 12px; font-size: 0.85em;" title="Desbloquear automaticamente as arts bloqueadas">
              🔓 Desbloquear
            </button>
          ` : ''}
        </div>
        <div class="arts-stat-card">
          <div class="arts-stat-label">Variações</div>
          <div class="arts-stat-value">${report.totalVariations}</div>
        </div>
      </div>

      <div class="arts-stats-breakdown">
        <div class="arts-breakdown-group">
          <strong style="display: block; margin-bottom: 8px; font-size: 0.95em; color: #d8b4fe;">📊 Por Tipo:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${Object.entries(report.artsByType)
              .map(([type, count]) => `
                <span class="arts-type-badge" style="background: ${RulesEngine.ART_TYPES[type]?.color || '#999'}; padding: 6px 12px; border-radius: 4px; font-size: 0.9em; font-weight: 500; white-space: nowrap;">
                  ${RulesEngine.ART_TYPES[type]?.icon} ${type}: ${count}
                </span>
              `)
              .join('')}
          </div>
        </div>
        <div class="arts-breakdown-group" style="margin-top: 12px;">
          <strong style="display: block; margin-bottom: 8px; font-size: 0.95em; color: #d8b4fe;">🎯 Por Domínio:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${Object.entries(report.artsByDomain)
              .map(([domain, count]) => `
                <span class="arts-domain-badge" style="background: rgba(216, 180, 254, 0.2); border: 1px solid rgba(216, 180, 254, 0.4); padding: 6px 12px; border-radius: 4px; font-size: 0.9em; font-weight: 500; white-space: nowrap;">
                  Domínio ${domain}: ${count}
                </span>
              `)
              .join('')}
          </div>
        </div>
      </div>

      <div class="arts-stat-bar">
        <div class="arts-stat-bar-fill" 
             style="width: ${(report.activeArts / report.maxArts) * 100}%">
        </div>
        <span class="arts-stat-bar-text">${report.activeArts}/${report.maxArts} slots</span>
      </div>
    `;

    // Setup do botão se existir
    if (report.blockedArts > 0 && window.artsUnlockSystem) {
      setTimeout(() => {
        const btn = document.getElementById('arts-unlock-btn');
        if (btn && !btn.hasListener) {
          btn.addEventListener('click', () => window.artsUnlockSystem.handleUnlock());
          btn.hasListener = true;
          console.log('✅ Listener do botão adicionado via updateStats');
        }
      }, 0);
    }
  }

  /**
   * Renderiza atributos primários (somente leitura, sincronizado com aba de atributos em tempo real)
   */
  renderAttributes() {
    const grid = document.getElementById('arts-attributes-grid');

    // Atributos primários: Força, Vitalidade, Agilidade, Inteligência, Percepção (sem Sorte)
    const primaryAttributes = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao'];

    const attributeLabels = {
      forca: 'Força',
      vitalidade: 'Vitalidade',
      agilidade: 'Agilidade',
      inteligencia: 'Inteligência',
      percepcao: 'Percepção'
    };

    grid.innerHTML = primaryAttributes
      .map(attr => {
        // Busca o valor da aba de Atributos (window.atributosManager)
        let value = 0;
        if (window.atributosManager && window.atributosManager.personagemData?.atributos) {
          value = window.atributosManager.personagemData.atributos[attr] || 0;
        }
        
        return `
          <div class="arts-attribute-item">
            <label>${attributeLabels[attr]}</label>
            <div class="arts-attribute-display">
              <span class="arts-attribute-value" data-attr="${attr}">${value}</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Atualiza os valores dos atributos em tempo real
   */
  syncAttributesFromAboutTab() {
    if (!window.atributosManager) return;

    const primaryAttributes = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao'];
    let hasChanged = false;
    
    primaryAttributes.forEach(attr => {
      const element = document.querySelector(`[data-attr="${attr}"]`);
      if (element && window.atributosManager.personagemData?.atributos) {
        const newValue = window.atributosManager.personagemData.atributos[attr] || 0;
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue !== newValue) {
          element.textContent = newValue;
          hasChanged = true;
          console.log(`✅ Atributo ${attr} atualizado: ${currentValue} → ${newValue}`);
        }
      }
    });

    // Se houve mudança, atualizar stats (que inclui limite de arts e barra)
    if (hasChanged) {
      console.log('🔄 Atualizando stats após sincronização de atributos');
      this.updateStats();
    }
  }

  /**
   * Renderiza lista de núcleos
   */
  renderCores() {
    const list = document.getElementById('arts-cores-list');
    this.renderAttributes();

    if (this.character.cores.length === 0) {
      list.innerHTML = '<p class="arts-empty-state">Nenhum núcleo criado. Crie um para começar!</p>';
      return;
    }

    list.innerHTML = this.character.cores
      .map(core => this.getCoreTemplate(core))
      .join('');
  }

  /**
   * Template de núcleo individual
   */
  getCoreTemplate(core) {
    const arts = this.character.getArtsByCore(core.id);

    return `
      <div class="arts-core-card arts-core-type-${(core.concept || 'sem-tipo').toLowerCase().replace(/\s+/g, '-')}" data-core-id="${core.id}" style="position: relative;">
        <!-- CONTADOR NO CANTO SUPERIOR DIREITO -->
        <div style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #d8b4fe 0%, #d8b4fe 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 10;
        ">
          📜 ${arts.length} art(s)
        </div>
        
        <!-- HEADER COM IMAGEM E TÍTULO -->
        <div class="arts-core-top">
          <div class="arts-core-image-placeholder">
            ${core.image ? `<img src="${core.image}" alt="${core.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : '<span class="image-icon">🎨</span>'}
          </div>
          <div class="arts-core-header-info">
            <h4 class="arts-core-name">${core.name}</h4>
            <div class="arts-core-header-divider"></div>
            <p class="arts-core-type"><strong>Tipo:</strong> ${core.concept || 'Sem tipo'}</p>
            <p class="arts-core-essence"><strong>Essência:</strong> ${core.visualForm || 'Não definida'}</p>
          </div>
        </div>

        <!-- DIVISOR -->
        <div class="arts-core-divider"></div>

        <!-- DESCRIÇÃO -->
        <div class="arts-core-description-section">
          <h5 class="arts-core-description-title">✨ ESSÊNCIA</h5>
          <p class="arts-core-description">${core.description || 'Sem descrição'}</p>
        </div>

        <!-- DIVISOR -->
        <div class="arts-core-divider"></div>

        <!-- FOOTER COM AÇÕES -->
        <div class="arts-core-footer" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button class="arts-btn arts-btn-tiny" data-action="view-core" data-id="${core.id}" style="flex: 1; min-width: 50px; padding: 4px 8px; font-size: 0.75em; background: #3498db; border: none; border-radius: 4px; color: white; cursor: pointer; transition: all 0.2s;">🔍 Ver</button>
          <button class="arts-btn arts-btn-tiny" data-action="edit-core" data-id="${core.id}" style="flex: 1; min-width: 55px; padding: 4px 8px; font-size: 0.75em; background: #f39c12; border: none; border-radius: 4px; color: white; cursor: pointer; transition: all 0.2s;">✏️ Editar</button>
          <button class="arts-btn arts-btn-tiny arts-btn-danger" data-action="delete-core" data-id="${core.id}" style="flex: 1; min-width: 60px; padding: 4px 8px; font-size: 0.75em; background: #e74c3c; border: none; border-radius: 4px; color: white; cursor: pointer; transition: all 0.2s;">🗑️ Remover</button>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza lista de arts
   */
  renderArts() {
    const list = document.getElementById('arts-arts-list');

    if (this.character.arts.length === 0) {
      list.innerHTML = '<p class="arts-empty-state">Nenhuma arte criada. Crie uma a partir de um núcleo!</p>';
      return;
    }

    list.innerHTML = this.character.arts
      .map(art => this.getArtTemplate(art))
      .join('');
  }

  /**
   * Template de art individual
   */
  getArtTemplate(art) {
    const core = this.character.getCore(art.coreId);
    
    // ✨ Usar novo template horizontal se disponível
    if (window.ArtUIEnhancement && window.ArtUIEnhancement.getArtCardTemplate) {
      return window.ArtUIEnhancement.getArtCardTemplate(art, core);
    }
    
    // Fallback para template antigo
    const typeInfo = RulesEngine.ART_TYPES[art.type] || {};
    const domainInfo = RulesEngine.getDomainInfo(art.domain);

    return `
      <div class="arts-art-card arts-art-type-${(art.type || 'sem-tipo').toLowerCase().replace(/\s+/g, '-')} ${art.status === 'blocked' ? 'blocked' : ''}" data-art-id="${art.id}">
        <div class="arts-art-header">
          <div class="arts-art-title">
            <h4>${art.name}</h4>
            <p class="arts-art-meta">
              <span class="arts-type-badge" style="background: ${typeInfo.color || '#999'}">
                ${typeInfo.icon} ${typeInfo.name || art.type}
              </span>
              <span class="arts-domain-badge">Dom ${art.domain}: ${domainInfo?.name || 'Desconhecido'}</span>
              ${art.status === 'blocked' ? '<span class="arts-status-badge">Bloqueada</span>' : ''}
            </p>
          </div>
          <div class="arts-art-core">
            <strong>Núcleo:</strong> ${core?.name || 'Desconhecido'}
          </div>
        </div>

        <div class="arts-art-details">
          <div class="arts-detail-row">
            <span><strong>Custo:</strong> ${art.cost || '0'}</span>
            <span><strong>Recarga:</strong> ${art.reload || '0'}</span>
            <span><strong>Duração:</strong> ${art.duration}</span>
          </div>
          <div class="arts-detail-row">
            <span><strong>Alcance:</strong> ${art.range}</span>
            <span><strong>Alvos:</strong> ${art.targets}</span>
          </div>
          <div class="arts-art-description">
            ${art.description || 'Sem descrição'}
          </div>
        </div>

        <div class="arts-art-actions">
          <button class="arts-btn arts-btn-tiny" data-action="edit-art" data-id="${art.id}">✏️</button>
          <button class="arts-btn arts-btn-tiny arts-btn-danger" data-action="delete-art" data-id="${art.id}">🗑️</button>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza lista de variantes (todas as variações de todas as arts)
   */
  renderVariantes() {
    const list = document.getElementById('arts-variantes-list');

    // Coletar todas as variações de todas as arts
    const allVariantes = [];
    this.character.arts.forEach(art => {
      art.variations.forEach(variation => {
        allVariantes.push({ variation, art });
      });
    });

    if (allVariantes.length === 0) {
      list.innerHTML = '<p class="arts-empty-state">Nenhuma variante criada. Crie uma variação em uma arte!</p>';
      return;
    }

    list.innerHTML = allVariantes
      .map(({ variation, art }) => this.getVarianteTemplate(variation, art))
      .join('');
  }

  /**
   * Template de variante individual para a seção de variantes
   */
  getVarianteTemplate(variation, art) {
    // ✨ Usar novo template horizontal se disponível
    if (window.ArtUIEnhancement && window.ArtUIEnhancement.getVarianteCardTemplate) {
      return window.ArtUIEnhancement.getVarianteCardTemplate(variation, art);
    }
    
    // Fallback para template antigo
    const domainInfo = RulesEngine.getDomainInfo(variation.domain);
    const core = this.character.getCore(art.coreId);

    return `
      <div class="arts-variante-card arts-art-type-${(art.type || 'sem-tipo').toLowerCase().replace(/\s+/g, '-')}">
        <div class="arts-variante-header">
          <div class="arts-variante-title">
            <h5>${variation.name}</h5>
            <p class="arts-variante-meta">
              <span class="arts-domain-badge">Dom ${variation.domain}: ${domainInfo?.name || 'Desconhecido'}</span>
            </p>
          </div>
          <div class="arts-variante-origin">
            <small><strong>Art:</strong> ${art.name}</small>
            <small><strong>Núcleo:</strong> ${core?.name || 'Desconhecido'}</small>
          </div>
        </div>

        <div class="arts-variante-description">
          ${variation.description || 'Sem descrição'}
        </div>

        <div class="arts-variante-actions">
          <button class="arts-btn arts-btn-tiny" data-action="edit-variation" data-art-id="${art.id}" data-var-id="${variation.id}">✏️</button>
          <button class="arts-btn arts-btn-tiny arts-btn-danger" data-action="delete-variation" data-art-id="${art.id}" data-var-id="${variation.id}">🗑️</button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Remover listener anterior se existir
    if (this.clickListener) {
      this.container.removeEventListener('click', this.clickListener);
    }

    // Criar novo listener bound ao contexto
    this.clickListener = async (e) => {
      // Evitar processamento duplicado enquanto uma ação está em andamento
      if (this.isProcessing) {
        console.warn('⚠️ Operação já em andamento, ignorando clique...');
        return;
      }

      const target = e.target;

      // Cores
      if (target.dataset.action === 'view-core') {
        await this.showModalViewCore(target.dataset.id);
      }
      if (target.dataset.action === 'edit-core') {
        await this.showModalEditCore(target.dataset.id);
      }
      if (target.dataset.action === 'delete-core') {
        await this.deleteCore(target.dataset.id);
      }

      // Arts
      if (target.dataset.action === 'view-art') {
        await this.showModalViewArt(target.dataset.id);
      }
      if (target.dataset.action === 'edit-art') {
        await this.showModalEditArt(target.dataset.id);
      }
      if (target.dataset.action === 'delete-art') {
        await this.deleteArt(target.dataset.id);
      }

      // Variations
      if (target.dataset.action === 'view-variation') {
        await this.showModalViewVariation(target.dataset.artId, target.dataset.varId);
      }
      if (target.dataset.action === 'create-variation') {
        await this.showModalCreateVariation(target.dataset.id);
      }
      if (target.dataset.action === 'edit-variation') {
        await this.showModalEditVariation(target.dataset.artId, target.dataset.varId);
      }
      if (target.dataset.action === 'delete-variation') {
        await this.deleteVariation(target.dataset.artId, target.dataset.varId);
      }

      // Top buttons
      if (target.id === 'arts-btn-create-core') {
        await this.showModalCreateCore();
      }
      if (target.id === 'arts-btn-create-art') {
        await this.showModalCreateArt();
      }
      if (target.id === 'arts-btn-create-variante') {
        await this.showModalCreateVariation();
      }
    };

    // Adicionar listener ao container
    this.container.addEventListener('click', this.clickListener);

    // Modal close - APENAS botão X e Cancelar (sem overlay click)
    const closeBtn = document.getElementById('arts-modal-close');
    const cancelBtn = document.getElementById('arts-modal-cancel');

    closeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModal();
    });

    cancelBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModal();
    });

    // Listener para tecla ESC - fecha o modal aberto
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlay = document.getElementById('arts-modal-overlay');
        if (overlay && overlay.style.display === 'flex') {
          this.closeModal();
        }
      }
    });

    // Filter listeners
    this.setupFilterListeners();
  }

  /**
   * Configura listeners para os filtros dinâmicos
   */
  setupFilterListeners() {
    const filterCores = document.getElementById('arts-filter-cores');
    const filterCoresType = document.getElementById('arts-filter-cores-type');
    const filterArts = document.getElementById('arts-filter-arts');
    const filterArtsType = document.getElementById('arts-filter-arts-type');
    const filterVariantes = document.getElementById('arts-filter-variantes');
    const filterVariantesType = document.getElementById('arts-filter-variantes-type');

    if (filterCores) {
      filterCores.addEventListener('input', (e) => {
        const typeFilter = filterCoresType ? filterCoresType.value : '';
        this.filterCores(e.target.value, typeFilter);
      });
    }

    if (filterCoresType) {
      filterCoresType.addEventListener('change', (e) => {
        const searchTerm = filterCores ? filterCores.value : '';
        this.filterCores(searchTerm, e.target.value);
      });
    }

    if (filterArts) {
      filterArts.addEventListener('input', (e) => {
        const typeFilter = filterArtsType ? filterArtsType.value : '';
        this.filterArts(e.target.value, typeFilter);
      });
    }

    if (filterArtsType) {
      filterArtsType.addEventListener('change', (e) => {
        const searchTerm = filterArts ? filterArts.value : '';
        this.filterArts(searchTerm, e.target.value);
      });
    }

    if (filterVariantes) {
      filterVariantes.addEventListener('input', (e) => {
        const typeFilter = filterVariantesType ? filterVariantesType.value : '';
        this.filterVariantes(e.target.value, typeFilter);
      });
    }

    if (filterVariantesType) {
      filterVariantesType.addEventListener('change', (e) => {
        const searchTerm = filterVariantes ? filterVariantes.value : '';
        this.filterVariantes(searchTerm, e.target.value);
      });
    }
  }

  /**
   * Filtra núcleos por nome e tipo em tempo real
   */
  filterCores(searchTerm, filterType = '') {
    const list = document.getElementById('arts-cores-list');
    const cards = list.querySelectorAll('.arts-core-card');
    const term = searchTerm.toLowerCase().trim();

    let visibleCount = 0;

    cards.forEach(card => {
      const name = card.querySelector('.arts-core-name')?.textContent.toLowerCase() || '';
      const concept = card.querySelector('.arts-core-type')?.textContent.toLowerCase() || '';
      const essence = card.querySelector('.arts-core-essence')?.textContent.toLowerCase() || '';
      
      // Verificar se corresponde ao filtro de nome
      const matchesName = !term || name.includes(term) || concept.includes(term) || essence.includes(term);
      
      // Verificar se corresponde ao filtro de tipo
      let matchesType = true;
      if (filterType) {
        const normalizedType = filterType.toLowerCase();
        const normalizedCardType = concept.toLowerCase();
        matchesType = normalizedCardType.includes(normalizedType);
      }
      
      // Mostrar card se atender aos dois filtros
      const shouldShow = matchesName && matchesType;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visibleCount++;
    });

    // Mostrar mensagem se nenhum resultado
    if (visibleCount === 0 && (term || filterType)) {
      if (!list.querySelector('.arts-no-filter-results')) {
        const message = document.createElement('p');
        message.className = 'arts-no-filter-results';
        message.textContent = `Nenhum núcleo encontrado${term ? ` para "${searchTerm}"` : ''}${filterType ? ` do tipo "${filterType}"` : ''}`;
        list.appendChild(message);
      }
    } else {
      const message = list.querySelector('.arts-no-filter-results');
      if (message) message.remove();
    }
  }

  /**
   * Filtra arts por nome e tipo em tempo real
   */
  filterArts(searchTerm, filterType = '') {
    const list = document.getElementById('arts-arts-list');
    // Suporta ambos os templates: novo (art-card-horizontal) e antigo (arts-art-card)
    const cards = list.querySelectorAll('.art-card-horizontal, .arts-art-card');
    const term = searchTerm.toLowerCase().trim();

    let visibleCount = 0;

    cards.forEach(card => {
      // Template novo: art-card-horizontal usa h3
      let name = card.querySelector('h3')?.textContent.toLowerCase() || '';
      // Template antigo: arts-art-card usa .arts-art-title h4
      if (!name) {
        name = card.querySelector('.arts-art-title h4')?.textContent.toLowerCase() || '';
      }
      
      // Procurar núcleo em ambos os templates
      let core = card.querySelector('p')?.textContent.toLowerCase() || '';
      if (!core) {
        core = card.querySelector('.arts-art-core')?.textContent.toLowerCase() || '';
      }

      // Procurar tipo em ambos os templates
      let artType = '';
      // Template novo
      const typeSpan = card.querySelector('.art-type-badge');
      if (typeSpan) {
        artType = typeSpan.textContent.toLowerCase();
      } else {
        // Template antigo
        const typeSpanOld = card.querySelector('.arts-type-badge');
        if (typeSpanOld) {
          artType = typeSpanOld.textContent.toLowerCase();
        }
      }
      
      // Verificar se corresponde ao filtro de nome
      const matchesName = !term || name.includes(term) || core.includes(term);
      
      // Verificar se corresponde ao filtro de tipo
      let matchesType = true;
      if (filterType) {
        const normalizedType = filterType.toLowerCase();
        const normalizedArtType = artType.toLowerCase();
        matchesType = normalizedArtType.includes(normalizedType);
      }
      
      // Mostrar card se atender aos dois filtros
      const shouldShow = matchesName && matchesType;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visibleCount++;
    });

    // Mostrar mensagem se nenhum resultado
    if (visibleCount === 0 && (term || filterType)) {
      if (!list.querySelector('.arts-no-filter-results')) {
        const message = document.createElement('p');
        message.className = 'arts-no-filter-results';
        message.textContent = `Nenhuma arte encontrada${term ? ` para "${searchTerm}"` : ''}${filterType ? ` do tipo "${filterType}"` : ''}`;
        list.appendChild(message);
      }
    } else {
      const message = list.querySelector('.arts-no-filter-results');
      if (message) message.remove();
    }
  }

  /**
   * Filtra variantes por nome e tipo em tempo real
   */
  filterVariantes(searchTerm, filterType = '') {
    const list = document.getElementById('arts-variantes-list');
    // Suporta ambos os templates: novo (variation-card-horizontal) e antigo (arts-variante-card)
    const cards = list.querySelectorAll('.variation-card-horizontal, .arts-variante-card');
    const term = searchTerm.toLowerCase().trim();

    let visibleCount = 0;

    cards.forEach(card => {
      // Template novo: variation-card-horizontal usa h3
      let name = card.querySelector('h3')?.textContent.toLowerCase() || '';
      // Template antigo: arts-variante-card usa .arts-variante-title h5
      if (!name) {
        name = card.querySelector('.arts-variante-title h5')?.textContent.toLowerCase() || '';
      }
      
      // Procurar art em ambos os templates
      let art = card.querySelector('p')?.textContent.toLowerCase() || '';
      if (!art) {
        art = card.querySelector('.arts-variante-origin')?.textContent.toLowerCase() || '';
      }

      // Procurar tipo em ambos os templates
      let variantType = '';
      // Template novo
      const typeSpan = card.querySelector('.variation-type-badge');
      if (typeSpan) {
        variantType = typeSpan.textContent.toLowerCase();
      } else {
        // Template antigo
        const typeSpanOld = card.querySelector('.arts-type-badge');
        if (typeSpanOld) {
          variantType = typeSpanOld.textContent.toLowerCase();
        }
      }
      
      // Verificar se corresponde ao filtro de nome
      const matchesName = !term || name.includes(term) || art.includes(term);
      
      // Verificar se corresponde ao filtro de tipo
      let matchesType = true;
      if (filterType) {
        const normalizedType = filterType.toLowerCase();
        const normalizedVarType = variantType.toLowerCase();
        matchesType = normalizedVarType.includes(normalizedType);
      }
      
      // Mostrar card se atender aos dois filtros
      const shouldShow = matchesName && matchesType;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visibleCount++;
    });

    // Mostrar mensagem se nenhum resultado
    if (visibleCount === 0 && (term || filterType)) {
      if (!list.querySelector('.arts-no-filter-results')) {
        const message = document.createElement('p');
        message.className = 'arts-no-filter-results';
        message.textContent = `Nenhuma variante encontrada${term ? ` para "${searchTerm}"` : ''}${filterType ? ` do tipo "${filterType}"` : ''}`;
        list.appendChild(message);
      }
    } else {
      const message = list.querySelector('.arts-no-filter-results');
      if (message) message.remove();
    }
  }

  /**
   * MODALS - Visualizar Núcleo
   */
  async showModalViewCore(coreId) {
    const core = this.character.getCore(coreId);
    if (!core) return;

    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');
    const footer = document.getElementById('arts-modal-footer');

    title.textContent = '🔍 Visualizar Núcleo';
    
    // 🎨 Tentar carregar imagem do IndexedDB se houver _imagemId
    let imagemURL = core.image; // Fallback para URL ou null
    
    if (core._imagemId && typeof ImagemStorageManager !== 'undefined') {
      try {
        const imagemBase64 = await ImagemStorageManager.carregarImagem(core._imagemId);
        if (imagemBase64) {
          imagemURL = imagemBase64;
          console.log('📥 ✅ Imagem do núcleo carregada do IndexedDB');
        } else {
          // Usando fallback sem aviso
        }
      } catch (e) {
        console.warn('⚠️ Erro ao carregar imagem do IndexedDB, usando fallback:', e.message);
      }
    }
    
    body.innerHTML = `
      <div class="core-view-section">
        <div class="core-view-image">
          ${imagemURL ? `<img src="${imagemURL}" alt="${core.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : '<div style="width: 100%; height: 300px; background: rgba(216, 180, 254, 0.1); border: 2px dashed rgba(216, 180, 254, 0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(216, 180, 254, 0.5);"><span style="font-size: 3rem;">🎨</span></div>'}
        </div>
        <div class="core-view-info">
          <h3 style="margin: 0 0 1rem 0; color: #d8b4fe; font-size: 1.5rem;">${core.name}</h3>
          <div class="core-info-row">
            <span style="color: #999;"><strong>Tipo:</strong></span>
            <span style="color: #e0e0e0;">${core.concept || 'Não definido'}</span>
          </div>
          <div class="core-info-row">
            <span style="color: #999;"><strong>Bônus:</strong></span>
            <span style="color: #e0e0e0;">${core.visualForm || 'Nenhum'}</span>
          </div>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(216, 180, 254, 0.2);">
            <h4 style="margin: 0 0 0.8rem 0; color: #d8b4fe; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.5px;">✨ Essência</h4>
            <p style="margin: 0; color: #d0d0d0; line-height: 1.6; font-size: 0.95rem;">${core.description || 'Sem descrição'}</p>
          </div>
        </div>
      </div>
    `;

    const cancelBtn = document.getElementById('arts-modal-cancel');
    const confirmBtn = document.getElementById('arts-modal-confirm');
    
    cancelBtn.textContent = 'Fechar';
    confirmBtn.textContent = '✏️ Editar';
    
    cancelBtn.onclick = () => this.closeModal();
    confirmBtn.onclick = () => {
      this.showModalEditCore(core.id);
    };

    this.showModal();
  }

  /**
   * MODALS - Visualizar Art
   */
  async showModalViewArt(artId) {
    const art = this.character.getArt(artId);
    if (!art) return;

    const core = this.character.getCore(art.coreId);
    const typeInfo = RulesEngine.ART_TYPES[art.type] || {};
    const domainInfo = RulesEngine.getDomainInfo(art.domain);

    // 🎨 Tentar carregar imagem do IndexedDB se houver _imagemId
    let imagemURL = art.image || null;
    
    if (art._imagemId && typeof ImagemStorageManager !== 'undefined') {
      try {
        const imagemBase64 = await ImagemStorageManager.carregarImagem(art._imagemId);
        if (imagemBase64) {
          imagemURL = imagemBase64;
          console.log('📥 ✅ Imagem da art carregada do IndexedDB');
        }
      } catch (e) {
        console.warn('⚠️ Erro ao carregar imagem do IndexedDB:', e.message);
      }
    }

    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');
    const footer = document.getElementById('arts-modal-footer');

    title.textContent = '🔍 Visualizar Art';
    body.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <!-- COLUNA ESQUERDA - IMAGEM -->
        <div>
          <div style="
            width: 100%;
            aspect-ratio: 1;
            background: rgba(0,0,0,0.3);
            border: 2px solid rgba(216, 180, 254, 0.3);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${imagemURL ? `<img src="${imagemURL}" alt="${art.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="font-size: 3rem; opacity: 0.5;">🎴</span>'}
          </div>
        </div>
        
        <!-- COLUNA DIREITA - INFORMAÇÕES -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; padding-right: 20px;">
          <div>
            <h3 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 1.4em; font-weight: bold;">${art.name}</h3>
            <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(216, 180, 254, 0.2);">
              <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                <strong>Núcleo:</strong> ${core?.name || 'Desconhecido'}
              </p>
              <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                <strong>Tipo:</strong> <span style="background: ${typeInfo.color ? typeInfo.color + '33' : 'rgba(78,205,196,0.15)'}; padding: 2px 6px; border-radius: 3px;">${typeInfo.icon} ${art.type}</span>
              </p>
              <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                <strong>Domínio:</strong> Dom ${art.domain}: ${domainInfo?.name || 'Desconhecido'}
              </p>
            </div>

            <!-- ATRIBUTOS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; margin-top: 12px;">
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Custo</div>
                <div style="color: #9b59b6; font-size: 1.2em; font-weight: bold;">${art.cost || '0'}</div>
              </div>
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Recarga</div>
                <div style="color: #d8b4fe; font-size: 1.2em; font-weight: bold;">${art.reload || '0'}</div>
              </div>
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Ação</div>
                <div style="color: #f39c12; font-size: 1em; font-weight: bold;">${art.action}</div>
              </div>
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Dano</div>
                <div style="color: #e74c3c; font-size: 1.2em; font-weight: bold;">${art.damage || '-'}</div>
              </div>
            </div>

            <!-- EFEITOS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Duração</div>
                <div style="color: #e0e0e0; font-size: 0.9em;">${art.duration}</div>
              </div>
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alcance</div>
                <div style="color: #e0e0e0; font-size: 0.9em;">${art.range}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DESCRIÇÃO -->
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
        <h4 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 1em; font-weight: bold; text-transform: uppercase;">📖 Descrição</h4>
        <p style="margin: 0; color: #d0d0d0; line-height: 1.6; font-size: 0.95em;">${art.description || 'Sem descrição'}</p>
      </div>
    `;

    const cancelBtn = document.getElementById('arts-modal-cancel');
    const confirmBtn = document.getElementById('arts-modal-confirm');
    
    cancelBtn.textContent = 'Fechar';
    confirmBtn.textContent = '✏️ Editar';
    
    cancelBtn.onclick = () => this.closeModal();
    confirmBtn.onclick = () => {
      this.showModalEditArt(art.id);
    };

    this.showModal();
  }

  /**
   * MODALS - Visualizar Variante
   */
  async showModalViewVariation(artId, varId) {
    const art = this.character.getArt(artId);
    const variation = art?.variations.find(v => v.id === varId);
    if (!art || !variation) return;

    // 🎨 Tentar carregar imagem do IndexedDB se houver _imagemId
    let imagemURL = variation.image || null;
    
    if (variation._imagemId && typeof ImagemStorageManager !== 'undefined') {
      try {
        const imagemBase64 = await ImagemStorageManager.carregarImagem(variation._imagemId);
        if (imagemBase64) {
          imagemURL = imagemBase64;
          console.log('📥 ✅ Imagem da variação carregada do IndexedDB');
        }
      } catch (e) {
        console.warn('⚠️ Erro ao carregar imagem do IndexedDB:', e.message);
      }
    }

    // Mapa de emoticons para tipos
    const typeIcons = {
      'ofensiva': '⚔️',
      'Ofensiva': '⚔️',
      'defensiva': '🛡️',
      'Defensiva': '🛡️',
      'estrategica': '🎯',
      'Estratégica': '🎯',
      'suporte': '💚',
      'Suporte': '💚',
      'controle': '🌀',
      'Controle': '🌀',
      'invocacao': '🔮',
      'Invocação': '🔮',
      'transformacao': '🧬',
      'Transformação': '🧬',
      'passiva': '🕶️',
      'Passiva': '🕶️',
      'racial': '👑',
      'Racial': '👑'
    };

    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');

    title.textContent = '🔍 Visualizar Variante';
    body.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <!-- COLUNA ESQUERDA - IMAGEM -->
        <div>
          <div style="
            width: 100%;
            aspect-ratio: 1;
            background: rgba(0,0,0,0.3);
            border: 2px solid rgba(216, 180, 254, 0.3);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${imagemURL ? `<img src="${imagemURL}" alt="${variation.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="font-size: 3rem; opacity: 0.5;">🎴</span>'}
          </div>
        </div>
        
        <!-- COLUNA DIREITA - INFORMAÇÕES -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; padding-right: 20px;">
          <div>
            <h3 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 1.4em; font-weight: bold;">${variation.name}</h3>
            <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(216, 180, 254, 0.2);">
              <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                <strong>Variante de:</strong> ${art?.name || 'Desconhecido'}
              </p>
              <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                <strong>Tipo:</strong> ${typeIcons[variation.type] || '❓'} ${variation.type || '-'}
              </p>
              <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                <strong>Domínio:</strong> Dom ${variation.domain}
              </p>
            </div>

            <!-- ATRIBUTOS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; margin-top: 12px;">
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Custo</div>
                <div style="color: #9b59b6; font-size: 1.2em; font-weight: bold;">${variation.cost || '0'}</div>
              </div>
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Recarga</div>
                <div style="color: #d8b4fe; font-size: 1.2em; font-weight: bold;">${variation.reload || '0'}</div>
              </div>
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Ação</div>
                <div style="color: #f39c12; font-size: 1em; font-weight: bold;">${variation.action || '-'}</div>
              </div>
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Dano</div>
                <div style="color: #e74c3c; font-size: 1.2em; font-weight: bold;">${variation.damage || '-'}</div>
              </div>
            </div>

            <!-- EFEITOS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Duração</div>
                <div style="color: #e0e0e0; font-size: 0.9em;">${variation.duration || '-'}</div>
              </div>
              <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alcance</div>
                <div style="color: #e0e0e0; font-size: 0.9em;">${variation.range || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DESCRIÇÃO -->
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
        <h4 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 1em; font-weight: bold; text-transform: uppercase;">📖 Descrição</h4>
        <p style="margin: 0; color: #d0d0d0; line-height: 1.6; font-size: 0.95em;">${variation.description || 'Sem descrição'}</p>
      </div>
    `;

    const cancelBtn = document.getElementById('arts-modal-cancel');
    const confirmBtn = document.getElementById('arts-modal-confirm');
    
    cancelBtn.textContent = 'Fechar';
    confirmBtn.textContent = '✏️ Editar';
    
    cancelBtn.onclick = () => this.closeModal();
    confirmBtn.onclick = () => {
      this.showModalEditVariation(artId, varId);
    };

    this.showModal();
  }

  /**
   * MODALS - Editar Variante
   */
  async showModalEditVariation(artId, varId) {
    const art = this.character.getArt(artId);
    const variation = art?.variations.find(v => v.id === varId);
    if (!art || !variation) return;

    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');

    title.textContent = '✏️ Editar Variante';

    // 🎨 Tentar carregar imagem do IndexedDB se houver _imagemId
    let imagemExibicao = variation.image || null;
    
    if (variation._imagemId && typeof ImagemStorageManager !== 'undefined') {
      try {
        const imagemBase64 = await ImagemStorageManager.carregarImagem(variation._imagemId);
        if (imagemBase64) {
          imagemExibicao = imagemBase64;
          console.log('📥 ✅ Imagem da variação carregada do IndexedDB para edição');
        }
      } catch (e) {
        console.warn('⚠️ Erro ao carregar imagem do IndexedDB:', e.message);
      }
    }
    body.innerHTML = `
      <form class="arts-form">
        <!-- SEÇÃO 1: IMAGEM -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; color: #d8b4fe; font-weight: bold; margin-bottom: 12px; font-size: 0.95em;">📸 IMAGEM DA VARIANTE</label>
          
          <!-- PREVIEW DA IMAGEM -->
          <div id="form-var-image-preview" style="
            width: 100%;
            aspect-ratio: 16/9;
            border: 2px solid rgba(216, 180, 254, 0.4);
            border-radius: 8px;
            background: rgba(26, 26, 46, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 12px;
          ">
            ${imagemExibicao ? `<img src="${imagemExibicao}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="color: #999; font-size: 48px;">🖼️</span>'}
          </div>
          
          <!-- BOTÕES E INPUT -->
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <button type="button" id="form-var-upload-btn" style="
              flex: 1;
              padding: 10px 12px;
              background: #d8b4fe;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            ">📁 Arquivo</button>
            <button type="button" id="form-var-url-btn" style="
              flex: 1;
              padding: 10px 12px;
              background: #9b59b6;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            ">🔗 URL</button>
          </div>
          
          <!-- INPUTS ESCONDIDOS -->
          <input type="file" id="form-var-image-upload" accept="image/*" style="display: none;">
          <input type="text" id="form-var-image-url" placeholder="Cole a URL da imagem aqui..." style="
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(216, 180, 254, 0.3);
            border-radius: 4px;
            background: rgba(26, 26, 46, 0.6);
            color: #e0e0e0;
            display: none;
            box-sizing: border-box;
          " value="${variation.image && !variation.image.startsWith('data:') ? variation.image : ''}">
          
          <small style="color: #888; display: block;">JPG, PNG, GIF • Máx 1MB</small>
        </div>

        <!-- SEÇÃO 2: NOME E ART -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⚔️ Art Pai *</label>
              <select disabled style="opacity: 0.7; cursor: not-allowed;">
                <option selected>${art.name}</option>
              </select>
              <small style="color: #888; display: block; margin-top: 4px;">Não pode ser alterada</small>
            </div>
            <div class="arts-form-group">
              <label>📛 Nome *</label>
              <input type="text" id="form-var-name" value="${variation.name}" required>
            </div>
          </div>
        </div>

        <!-- SEÇÃO 3: TIPO + AÇÃO -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>🎯 Tipo *</label>
              <select id="form-var-type" required>
                <option value="">Selecione...</option>
                <option value="Ofensiva" ${variation.type === 'Ofensiva' ? 'selected' : ''}>⚔️ Ofensiva</option>
                <option value="Defensiva" ${variation.type === 'Defensiva' ? 'selected' : ''}>🛡️ Defensiva</option>
                <option value="Estratégica" ${variation.type === 'Estratégica' ? 'selected' : ''}>🎯 Estratégica</option>
                <option value="Suporte" ${variation.type === 'Suporte' ? 'selected' : ''}>💚 Suporte</option>
                <option value="Controle" ${variation.type === 'Controle' ? 'selected' : ''}>🌀 Controle</option>
                <option value="Invocação" ${variation.type === 'Invocação' ? 'selected' : ''}>🔮 Invocação</option>
                <option value="Transformação" ${variation.type === 'Transformação' ? 'selected' : ''}>🧬 Transformação</option>
                <option value="Passiva" ${variation.type === 'Passiva' ? 'selected' : ''}>🕶️ Passiva</option>
                <option value="Racial" ${variation.type === 'Racial' ? 'selected' : ''}>👑 Racial</option>
              </select>
            </div>
            <div class="arts-form-group">
              <label>⚡ Ação *</label>
              <select id="form-var-action" required>
                <option value="">Selecione...</option>
                <option value="Imediata" ${variation.action === 'Imediata' ? 'selected' : ''}>⚡ Imediata</option>
                <option value="Duradoura" ${variation.action === 'Duradoura' ? 'selected' : ''}>⏱️ Duradoura</option>
                <option value="Sustentada" ${variation.action === 'Sustentada' ? 'selected' : ''}>🔄 Sustentada</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SEÇÃO 4: DOMÍNIO + CUSTO + DANO -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>📍 Domínio *</label>
              <input type="number" id="form-var-domain" min="1" max="5" value="${variation.domain}" required>
            </div>
            <div class="arts-form-group">
              <label>💎 Custo (PM)</label>
              <input type="text" id="form-var-cost" placeholder="Ex: 10, 1d6+5" value="${variation.cost || 0}">
            </div>
          </div>
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⚔️ Dano</label>
              <input type="text" id="form-var-damage" value="${variation.damage || ''}" placeholder="Ex: 2d6+3">
            </div>
            <div class="arts-form-group">
              <label>🔄 Recarga (turnos)</label>
              <input type="text" id="form-var-reload" placeholder="Ex: 3, 2d4" value="${variation.reload || 0}">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 5: DURAÇÃO + ALCANCE + ALVOS -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⏳ Duração</label>
              <input type="text" id="form-var-duration" value="${variation.duration || ''}" placeholder="Ex: 1 turno">
            </div>
            <div class="arts-form-group">
              <label>📍 Alcance</label>
              <input type="text" id="form-var-range" value="${variation.range || ''}" placeholder="Ex: 10 metros">
            </div>
          </div>
          <div class="arts-form-row">
            <div class="arts-form-group" style="grid-column: 1 / -1;">
              <label>🎪 Alvos</label>
              <input type="text" id="form-var-targets" value="${variation.targets || ''}" placeholder="Ex: alvo único">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 6: DESCRIÇÃO -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-group">
            <label>📖 Descrição</label>
            <textarea id="form-var-description" style="min-height: 100px;">${variation.description || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    // Configurar preview de imagem
    const imageInput = document.getElementById('form-var-image-upload');
    const imagePreview = document.getElementById('form-var-image-preview');
    const uploadBtn = document.getElementById('form-var-upload-btn');
    const urlBtn = document.getElementById('form-var-url-btn');
    const urlInput = document.getElementById('form-var-image-url');
    let currentImage = imagemExibicao || '';
    
    // Botão Arquivo
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      imageInput.click();
    });
    
    // Botão URL
    urlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (urlInput.style.display === 'none') {
        urlInput.style.display = 'block';
        uploadBtn.style.opacity = '0.5';
        uploadBtn.disabled = true;
      } else {
        urlInput.style.display = 'none';
        uploadBtn.style.opacity = '1';
        uploadBtn.disabled = false;
      }
    });
    
    // Input de Arquivo
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const base64 = await window.ArtUIEnhancement.fileToBase64(file);
          imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
          currentImage = base64;
        } catch (err) {
          StorageManager.notify('❌ Erro ao carregar imagem', 'error');
        }
      }
    });
    
    // Input de URL
    urlInput.addEventListener('change', () => {
      const url = urlInput.value.trim();
      if (url) {
        const img = new Image();
        img.onload = () => {
          imagePreview.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
          currentImage = url;
        };
        img.onerror = () => {
          StorageManager.notify('❌ Erro ao carregar imagem da URL', 'error');
        };
        img.src = url;
      }
    });

    this.showModal(async () => {
      const name = document.getElementById('form-var-name').value.trim();
      const type = document.getElementById('form-var-type').value;
      const action = document.getElementById('form-var-action').value;
      const domain = parseInt(document.getElementById('form-var-domain').value);
      const cost = document.getElementById('form-var-cost').value.trim() || 0;
      const reload = document.getElementById('form-var-reload').value.trim() || 0;
      const damage = document.getElementById('form-var-damage').value.trim();
      const duration = document.getElementById('form-var-duration').value.trim();
      const range = document.getElementById('form-var-range').value.trim();
      const targets = document.getElementById('form-var-targets').value.trim();
      const description = document.getElementById('form-var-description').value.trim();

      if (!name) {
        StorageManager.notify('⚠️ Nome é obrigatório', 'warning');
        return;
      }

      variation.name = name;
      variation.type = type;
      variation.action = action;
      variation.domain = domain;
      variation.cost = cost;
      variation.reload = reload;
      variation.damage = damage;
      variation.duration = duration;
      variation.range = range;
      variation.targets = targets;
      variation.description = description;

      // 🎨 OTIMIZAÇÃO DE IMAGEM - Usar IndexedDB para base64 + localStorage para referência minimal
      if (currentImage) {
        // Detectar se é base64 (upload)
        if (currentImage.startsWith('data:')) {
          console.log('📸 Detectada imagem base64 (upload) para variação');
          const imagemId = `art_var_${variation.id}`;
          
          // Salvar no IndexedDB
          if (typeof ImagemStorageManager !== 'undefined') {
            try {
              // 🔥 COMPRIMIR ANTES DE SALVAR
              let imagemParaSalvar = currentImage;
              if (typeof ImageCompressor !== 'undefined') {
                console.log('📦 Comprimindo imagem da variação...');
                imagemParaSalvar = await ImageCompressor.compressImage(currentImage, 'variation');
              }

              await ImagemStorageManager.salvarImagem(imagemId, imagemParaSalvar, 'art');
              console.log('✅ Imagem da variação salva no IndexedDB:', imagemId);
              
              // Salvar referência minimal no localStorage
              localStorageManager.saveVariacaoImagemMinimal(variation.id, 1);
              
              // Armazenar apenas a referência na variação
              variation.image = null; // Remover base64 do objeto
              variation._imagemId = imagemId; // Guardar ID para referência
              console.log('💾 Referência minimal salva em localStorage (88% de economia)');
            } catch (e) {
              console.error('❌ Erro ao salvar imagem no IndexedDB:', e);
              // Fallback: armazenar como antes
              variation.image = currentImage;
            }
          } else {
            // Se ImagemStorageManager não está disponível, armazenar como antes
            console.warn('⚠️ ImagemStorageManager não disponível, usando armazenamento tradicional');
            variation.image = currentImage;
          }
        } else {
          // URL externa - apenas armazenar a URL
          variation.image = currentImage;
          console.log('🔗 Imagem de URL externa armazenada:', currentImage);
        }
      } else {
        variation.image = null;
      }

      StorageManager.saveCharacter(this.character);
      await this.render(this.character);
      StorageManager.notify('✅ Variante atualizada!', 'success');
    });
  }

  /**
   * MODALS - Criar Núcleo
   */
  showModalCreateCore() {
    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');

    title.textContent = '✨ Criar Novo Núcleo';
    body.innerHTML = `
      <div class="core-modal-container">
        <!-- COLUNA ESQUERDA - IMAGEM -->
        <div class="core-modal-section core-modal-image-section">
          <h3 class="core-modal-section-title">📸 IMAGEM</h3>
          <div class="core-image-preview" id="core-image-preview">
            <div class="preview-placeholder">
              <span class="preview-icon">🎨</span>
              <p>Nenhuma imagem selecionada</p>
            </div>
          </div>
          <div class="core-image-controls">
            <button type="button" class="arts-btn arts-btn-primary" id="core-upload-btn">UPLOAD</button>
            <button type="button" class="arts-btn arts-btn-secondary" id="core-url-btn">URL</button>
            <input type="file" id="core-file-input" accept="image/*" style="display: none;">
            <input type="text" id="core-image-url" placeholder="https://exemplo.com/imagem.jpg" style="display: none;">
          </div>
          <div class="core-image-note">
            <p style="margin: 0; font-size: 0.75rem; color: #999;">💡 Clique ou arraste uma imagem</p>
          </div>
        </div>

        <!-- COLUNA DIREITA - INFORMAÇÕES -->
        <div class="core-modal-section core-modal-info-section">
          <h3 class="core-modal-section-title">📋 INFORMAÇÕES</h3>
          <form class="core-form">
            <div class="core-form-group">
              <label>NOME *</label>
              <input type="text" id="form-core-name" required placeholder="Ex: Essência Flamejante">
            </div>
            <div class="core-form-group">
              <label>TIPO *</label>
              <select id="form-core-type" required>
                <option value="">Selecione um tipo...</option>
                ${Object.entries(RulesEngine.ART_TYPES || {})
                  .map(([key, info]) => `<option value="${key}">${info.icon} ${info.name}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="core-form-group">
              <label>BÔNUS (OPCIONAL)</label>
              <input type="text" id="form-core-bonus" placeholder="Ex: +2 Force">
            </div>
            <div class="core-form-group">
              <label>✨ ESSÊNCIA</label>
              <textarea id="form-core-description" placeholder="Texto descritivo do núcleo, explicando sua natureza, origem ou conceito narrativo..."></textarea>
            </div>
          </form>
        </div>
      </div>
    `;

    // Upload de imagem
    const fileInput = body.querySelector('#core-file-input');
    const uploadBtn = body.querySelector('#core-upload-btn');
    const urlBtn = body.querySelector('#core-url-btn');
    const urlInput = body.querySelector('#core-image-url');
    const preview = body.querySelector('#core-image-preview');

    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          preview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
          // 🔥 IMPORTANTE: Limpar URL anterior e definir apenas o imageData
          delete preview.dataset.imageUrl;
          preview.dataset.imageData = event.target.result;
          console.log('✅ Imagem do upload definida');
        };
        reader.readAsDataURL(file);
      }
    });

    urlBtn.addEventListener('click', () => {
      if (urlInput.style.display === 'none') {
        urlInput.style.display = 'block';
        uploadBtn.textContent = 'VISUALIZAR';
        // 🔥 Limpar imageData quando muda para URL
        delete preview.dataset.imageData;
      } else {
        urlInput.style.display = 'none';
        uploadBtn.textContent = 'URL';
      }
    });

    // 🔥 Debounce para atualizar preview enquanto digita
    let urlTimeout;
    urlInput.addEventListener('input', () => {
      clearTimeout(urlTimeout);
      urlTimeout = setTimeout(() => {
        const url = urlInput.value.trim();
        if (url) {
          preview.innerHTML = `<img src="${url}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" onerror="this.parentElement.innerHTML='<div class=\\'preview-placeholder\\'><span class=\\'preview-icon\\'>⚠️</span><p>Erro ao carregar imagem</p></div>';">`;
          preview.dataset.imageUrl = url;
          console.log('✅ Preview de URL atualizada:', url);
        }
      }, 800); // Aguarda 800ms depois de parar de digitar
    });

    // 🔥 Atualizar ao sair do campo também
    urlInput.addEventListener('blur', () => {
      clearTimeout(urlTimeout);
      const url = urlInput.value.trim();
      if (url) {
        preview.innerHTML = `<img src="${url}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" onerror="this.parentElement.innerHTML='<div class=\\'preview-placeholder\\'><span class=\\'preview-icon\\'>⚠️</span><p>Erro ao carregar imagem</p></div>';">`;
        preview.dataset.imageUrl = url;
      }
    });

    this.showModal(async () => {
      const name = document.getElementById('form-core-name').value.trim();
      const type = document.getElementById('form-core-type').value;
      const bonus = document.getElementById('form-core-bonus').value.trim();
      const description = document.getElementById('form-core-description').value.trim();
      // 🔥 Garantir que a URL digitada seja capturada mesmo sem blur
      const urlFromInput = urlInput.value.trim();
      const imageData = preview.dataset.imageData || preview.dataset.imageUrl || urlFromInput || null;

      if (!name || !type) {
        StorageManager.notify('⚠️ Preencha os campos obrigatórios', 'warning');
        return;
      }

      this.character.addCore({ name, concept: type, visualForm: bonus, description, image: imageData });
      StorageManager.saveCharacter(this.character);
      await this.render(this.character);
      StorageManager.notify('✅ Núcleo criado com sucesso!', 'success');
    });
  }

  /**
   * MODALS - Editar Núcleo
   */
  async showModalEditCore(coreId) {
    const core = this.character.getCore(coreId);
    if (!core) return;

    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');

    title.textContent = '✏️ Editar Núcleo';
    
    // 🎨 Tentar carregar imagem do IndexedDB se houver _imagemId
    let imagemExibicao = core.image || null;
    
    if (core._imagemId && typeof ImagemStorageManager !== 'undefined') {
      try {
        const imagemBase64 = await ImagemStorageManager.carregarImagem(core._imagemId);
        if (imagemBase64) {
          imagemExibicao = imagemBase64;
          console.log('📥 ✅ Imagem do núcleo carregada do IndexedDB para edição');
        }
      } catch (e) {
        console.warn('⚠️ Erro ao carregar imagem do IndexedDB:', e.message);
      }
    }
    
    body.innerHTML = `
      <div class="core-modal-container">
        <!-- COLUNA ESQUERDA - IMAGEM -->
        <div class="core-modal-section core-modal-image-section">
          <h3 class="core-modal-section-title">📸 IMAGEM</h3>
          <div class="core-image-preview" id="core-image-preview">
            ${imagemExibicao ? `<img src="${imagemExibicao}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">` : '<div class="preview-placeholder"><span class="preview-icon">🎨</span><p>Nenhuma imagem selecionada</p></div>'}

          </div>
          <div class="core-image-controls">
            <button type="button" class="arts-btn arts-btn-primary" id="core-upload-btn">UPLOAD</button>
            <button type="button" class="arts-btn arts-btn-secondary" id="core-url-btn">URL</button>
            <input type="file" id="core-file-input" accept="image/*" style="display: none;">
            <input type="text" id="core-image-url" placeholder="https://exemplo.com/imagem.jpg" style="display: none;" value="${core.image && !core.image.startsWith('data:') ? core.image : ''}">
          </div>
          <div class="core-image-note">
            <p style="margin: 0; font-size: 0.75rem; color: #999;">💡 Clique ou arraste uma imagem</p>
          </div>
        </div>

        <!-- COLUNA DIREITA - INFORMAÇÕES -->
        <div class="core-modal-section core-modal-info-section">
          <h3 class="core-modal-section-title">📋 INFORMAÇÕES</h3>
          <form class="core-form">
            <div class="core-form-group">
              <label>NOME *</label>
              <input type="text" id="form-core-name" value="${core.name}" required>
            </div>
            <div class="core-form-group">
              <label>TIPO *</label>
              <select id="form-core-type" required>
                <option value="">Selecione um tipo...</option>
                ${Object.entries(RulesEngine.ART_TYPES || {})
                  .map(([key, info]) => `<option value="${key}" ${core.concept === key ? 'selected' : ''}>${info.icon} ${info.name}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="core-form-group">
              <label>BÔNUS (OPCIONAL)</label>
              <input type="text" id="form-core-bonus" value="${core.visualForm || ''}">
            </div>
            <div class="core-form-group">
              <label>✨ ESSÊNCIA</label>
              <textarea id="form-core-description">${core.description || ''}</textarea>
            </div>
          </form>
        </div>
      </div>
    `;

    // Upload de imagem
    const fileInput = body.querySelector('#core-file-input');
    const uploadBtn = body.querySelector('#core-upload-btn');
    const urlBtn = body.querySelector('#core-url-btn');
    const urlInput = body.querySelector('#core-image-url');
    const preview = body.querySelector('#core-image-preview');

    if (core.image && core.image.startsWith('data:')) {
      preview.dataset.imageData = core.image;
    } else if (core.image) {
      preview.dataset.imageUrl = core.image;
    }

    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          preview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
          // 🔥 IMPORTANTE: Limpar URL anterior e definir apenas o imageData
          delete preview.dataset.imageUrl;
          preview.dataset.imageData = event.target.result;
          console.log('✅ Imagem do upload definida');
        };
        reader.readAsDataURL(file);
      }
    });

    urlBtn.addEventListener('click', () => {
      if (urlInput.style.display === 'none') {
        urlInput.style.display = 'block';
        uploadBtn.textContent = 'VISUALIZAR';
        // 🔥 Limpar imageData quando muda para URL
        delete preview.dataset.imageData;
      } else {
        urlInput.style.display = 'none';
        uploadBtn.textContent = 'UPLOAD';
      }
    });

    // 🔥 Debounce para atualizar preview enquanto digita
    let urlTimeout;
    urlInput.addEventListener('input', () => {
      clearTimeout(urlTimeout);
      urlTimeout = setTimeout(() => {
        const url = urlInput.value.trim();
        if (url) {
          preview.innerHTML = `<img src="${url}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" onerror="this.parentElement.innerHTML='<div class=\\'preview-placeholder\\'><span class=\\'preview-icon\\'>⚠️</span><p>Erro ao carregar imagem</p></div>';">`;
          preview.dataset.imageUrl = url;
          console.log('✅ Preview de URL atualizada:', url);
        }
      }, 800); // Aguarda 800ms depois de parar de digitar
    });

    // 🔥 Atualizar ao sair do campo também
    urlInput.addEventListener('blur', () => {
      clearTimeout(urlTimeout);
      const url = urlInput.value.trim();
      if (url) {
        preview.innerHTML = `<img src="${url}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" onerror="this.parentElement.innerHTML='<div class=\\'preview-placeholder\\'><span class=\\'preview-icon\\'>⚠️</span><p>Erro ao carregar imagem</p></div>';">`;
        preview.dataset.imageUrl = url;
      }
    });

    this.showModal(async () => {
      const name = document.getElementById('form-core-name').value.trim();
      const type = document.getElementById('form-core-type').value;
      const bonus = document.getElementById('form-core-bonus').value.trim();
      const description = document.getElementById('form-core-description').value.trim();
      // 🔥 Garantir que a URL digitada seja capturada mesmo sem blur
      const urlFromInput = urlInput.value.trim();
      const imageData = preview.dataset.imageData || preview.dataset.imageUrl || urlFromInput || core.image;

      if (!name || !type) {
        StorageManager.notify('⚠️ Preencha os campos obrigatórios', 'warning');
        return;
      }

      core.name = name;
      core.concept = type;
      core.visualForm = bonus;
      core.description = description;

      // 🎨 OTIMIZAÇÃO DE IMAGEM - Usar IndexedDB para base64 + localStorage para referência minimal
      if (imageData) {
        // Detectar se é base64 (upload)
        if (imageData.startsWith('data:')) {
          console.log('📸 Detectada imagem base64 (upload) para núcleo');
          const imagemId = `art_core_${core.id}`;
          
          // Salvar no IndexedDB
          if (typeof ImagemStorageManager !== 'undefined') {
            try {
              // 🔥 COMPRIMIR ANTES DE SALVAR
              let imagemParaSalvar = imageData;
              if (typeof ImageCompressor !== 'undefined') {
                console.log('📦 Comprimindo imagem do núcleo...');
                imagemParaSalvar = await ImageCompressor.compressImage(imageData, 'core');
              }

              await ImagemStorageManager.salvarImagem(imagemId, imagemParaSalvar, 'art');
              console.log('✅ Imagem do núcleo salva no IndexedDB:', imagemId);
              
              // Salvar referência minimal no localStorage
              localStorageManager.saveNucleoImagemMinimal(imagemId, 1);
              
              // Armazenar apenas a referência no core
              core.image = null; // Remover base64 do objeto
              core._imagemId = imagemId; // Guardar ID para referência
              console.log('💾 Referência minimal salva em localStorage (88% de economia)');
            } catch (e) {
              console.error('❌ Erro ao salvar imagem no IndexedDB:', e);
              // Fallback: armazenar como antes
              core.image = imageData;
            }
          } else {
            // Se ImagemStorageManager não está disponível, armazenar como antes
            console.warn('⚠️ ImagemStorageManager não disponível, usando armazenamento tradicional');
            core.image = imageData;
          }
        } else {
          // URL externa - apenas armazenar a URL
          core.image = imageData;
          console.log('🔗 Imagem de URL externa armazenada:', imageData);
        }
      } else {
        core.image = null;
      }

      StorageManager.saveCharacter(this.character);
      await this.render(this.character);
      StorageManager.notify('✅ Núcleo atualizado!', 'success');
    });
  }

  /**
   * MODALS - Criar Art
   */
  showModalCreateArt() {
    if (!this.character.cores.length) {
      StorageManager.notify('⚠️ Crie um Núcleo primeiro!', 'warning');
      return;
    }

    const report = RulesEngine.generateArtsReport(this.character);
    const canCreate = report.canCreateNewArt;

    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');

    title.textContent = '⚔️ Criar Nova Art';

    if (!canCreate) {
      // ✨ Buscar atributos em tempo real da aba de Atributos
      let forca = 0, vitalidade = 0, agilidade = 0, percepcao = 0, inteligencia = 0;
      
      if (window.atributosManager && window.atributosManager.personagemData?.atributos) {
        forca = Number(window.atributosManager.personagemData.atributos.forca) || 0;
        vitalidade = Number(window.atributosManager.personagemData.atributos.vitalidade) || 0;
        agilidade = Number(window.atributosManager.personagemData.atributos.agilidade) || 0;
        percepcao = Number(window.atributosManager.personagemData.atributos.percepcao) || 0;
        inteligencia = Number(window.atributosManager.personagemData.atributos.inteligencia) || 0;
      } else if (this.character.attributes) {
        forca = this.character.attributes.forca || 0;
        vitalidade = this.character.attributes.vitalidade || 0;
        agilidade = this.character.attributes.agilidade || 0;
        percepcao = this.character.attributes.percepcao || 0;
        inteligencia = this.character.attributes.inteligencia || 0;
      }

      // Calcular quanto precisa aumentar
      const total = forca + vitalidade + agilidade + percepcao + inteligencia;
      const neededTotal = Math.ceil(report.maxArts / 0.0293) + 1; // +1 para segurança
      const needed = Math.max(0, neededTotal - total);

      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- HEADER COM ALERTA -->
          <div style="
            background: linear-gradient(135deg, #d8b4fe 0%, #b8945c 100%);
            padding: 20px;
            border-radius: 8px;
            color: white;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
          ">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <span style="font-size: 28px;">🚫</span>
              <h3 style="margin: 0; font-size: 1.3em; font-weight: bold;">Limite de Arts Atingido</h3>
            </div>
            <p style="margin: 0; opacity: 0.95; font-size: 0.95em;">
              Você já criou o máximo de <strong>${report.maxArts} arts ativas</strong>
            </p>
          </div>

          <!-- STATS ATUAIS - RESPONSIVO -->
          <div style="
            background: linear-gradient(135deg, #2d3436 0%, #1e272e 100%);
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #d8b4fe;
          ">
            <p style="margin: 0 0 12px 0; color: #bdc3c7; font-size: 0.9em; font-weight: bold; text-transform: uppercase;">📊 Seus Atributos Atuais</p>
            <div style="
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
              gap: 10px;
              min-width: 0;
            ">
              <div style="
                background: rgba(216, 180, 254, 0.1);
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #d8b4fe;
                text-align: center;
              ">
                <div style="color: #95a5a6; font-size: 0.75em; margin-bottom: 4px; text-transform: uppercase;">Força</div>
                <div style="color: #d8b4fe; font-size: 1.8em; font-weight: bold;">${forca}</div>
              </div>
              <div style="
                background: rgba(231, 76, 60, 0.1);
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #e74c3c;
                text-align: center;
              ">
                <div style="color: #95a5a6; font-size: 0.75em; margin-bottom: 4px; text-transform: uppercase;">Vitalidade</div>
                <div style="color: #e74c3c; font-size: 1.8em; font-weight: bold;">${vitalidade}</div>
              </div>
              <div style="
                background: rgba(241, 196, 15, 0.1);
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #f1c40f;
                text-align: center;
              ">
                <div style="color: #95a5a6; font-size: 0.75em; margin-bottom: 4px; text-transform: uppercase;">Agilidade</div>
                <div style="color: #f1c40f; font-size: 1.8em; font-weight: bold;">${agilidade}</div>
              </div>
              <div style="
                background: rgba(155, 89, 182, 0.1);
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #9b59b6;
                text-align: center;
              ">
                <div style="color: #95a5a6; font-size: 0.75em; margin-bottom: 4px; text-transform: uppercase;">Percepção</div>
                <div style="color: #9b59b6; font-size: 1.8em; font-weight: bold;">${percepcao}</div>
              </div>
              <div style="
                background: rgba(52, 152, 219, 0.1);
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #3498db;
                text-align: center;
              ">
                <div style="color: #95a5a6; font-size: 0.75em; margin-bottom: 4px; text-transform: uppercase;">Inteligência</div>
                <div style="color: #3498db; font-size: 1.8em; font-weight: bold;">${inteligencia}</div>
              </div>
            </div>
          </div>

          <!-- SOLUÇÕES -->
          <div style="
            background: linear-gradient(135deg, #d8b4fe 0%, #27ae60 100%);
            padding: 16px;
            border-radius: 8px;
            color: white;
          ">
            <p style="margin: 0 0 12px 0; font-size: 0.9em; font-weight: bold; text-transform: uppercase;">✨ Como Desbloquear?</p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Aumente seus atributos <strong>Força, Vitalidade, Agilidade, Percepção ou Inteligência</strong> na aba de Atributos</li>
              <li>Remova uma art existente para liberar um slot</li>
              <li>Ou desbloqueie arts bloqueadas aumentando os atributos</li>
            </ul>
            ${needed > 0 ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 0.9em;">
                💡 <strong>Dica:</strong> Você precisa aumentar seus atributos em um total de <strong>+${needed} pontos</strong> para criar mais arts.
              </div>
            ` : ''}
          </div>

          <!-- DICA EXTRA -->
          <div style="
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            padding: 14px;
            border-radius: 8px;
            color: white;
            display: flex;
            gap: 12px;
            align-items: flex-start;
          ">
            <span style="font-size: 20px; flex-shrink: 0;">💡</span>
            <div>
              <div style="font-weight: bold; margin-bottom: 4px;">Arts Bloqueadas</div>
              <div style="font-size: 0.9em; opacity: 0.95;">Qualquer art bloqueada será desbloqueada automaticamente quando seus atributos forem suficientes.</div>
            </div>
          </div>
        </div>
      `;
      this.showModal(() => {}, 'Entendido');
      return;
    }

    body.innerHTML = `
      <form class="arts-form">
        <!-- SEÇÃO 1: IMAGEM -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; color: #d8b4fe; font-weight: bold; margin-bottom: 12px; font-size: 0.95em;">📸 IMAGEM DA ART</label>
          
          <!-- PREVIEW DA IMAGEM -->
          <div id="form-art-image-preview" style="
            width: 100%;
            aspect-ratio: 16/9;
            border: 2px solid rgba(216, 180, 254, 0.4);
            border-radius: 8px;
            background: rgba(26, 26, 46, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 12px;
          ">
            <span style="color: #999; font-size: 48px;">🖼️</span>
          </div>
          
          <!-- BOTÕES E INPUT -->
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <button type="button" id="form-art-upload-btn" style="
              flex: 1;
              padding: 10px 12px;
              background: #d8b4fe;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            ">📁 Arquivo</button>
            <button type="button" id="form-art-url-btn" style="
              flex: 1;
              padding: 10px 12px;
              background: #9b59b6;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            ">🔗 URL</button>
          </div>
          
          <!-- INPUTS ESCONDIDOS -->
          <input type="file" id="form-art-image-upload" accept="image/*" style="display: none;">
          <input type="text" id="form-art-image-url" placeholder="Cole a URL da imagem aqui..." style="
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(216, 180, 254, 0.3);
            border-radius: 4px;
            background: rgba(26, 26, 46, 0.6);
            color: #e0e0e0;
            display: none;
            box-sizing: border-box;
          ">
          
          <small style="color: #888; display: block;">JPG, PNG, GIF • Máx 1MB</small>
        </div>

        <!-- SEÇÃO 2: NÚCLEO E NOME (CRÍTICO) -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⚔️ Núcleo Base</label>
              <select id="form-art-core">
                <option value="">Selecione...</option>
                ${this.character.cores.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="arts-form-group">
              <label>📛 Nome</label>
              <input type="text" id="form-art-name" placeholder="Ex: Bola de Fogo">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 3: CLASSIFICAÇÃO (TIPO + AÇÃO) -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>🎯 Tipo de Art</label>
              <select id="form-art-type">
                <option value="">Selecione...</option>
                ${Object.entries(RulesEngine.ART_TYPES || {})
                  .map(([key, info]) => `<option value="${key}">${info.icon} ${info.name}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="arts-form-group">
              <label>⚡ Tipo de Ação</label>
              <select id="form-art-action">
                <option value="">Selecione...</option>
                <option value="Imediata">⚡ Imediata</option>
                <option value="Duradoura">⏱️ Duradoura</option>
                <option value="Sustentada">🔄 Sustentada</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SEÇÃO 4: ATRIBUTOS (DOMÍNIO + CUSTO + DANO) -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>📍 Domínio</label>
              <select id="form-art-domain">
                ${Object.entries(RulesEngine.DOMAINS || {})
                  .map(([key, info]) => `<option value="${key}">Dom ${key}: ${info.name}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="arts-form-group">
              <label>💎 Custo (PM)</label>
              <input type="text" id="form-art-cost" placeholder="Ex: 10, 1d6+5" value="10">
            </div>
          </div>
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⚔️ Dano</label>
              <input type="text" id="form-art-damage" placeholder="Ex: 2d6+3">
            </div>
            <div class="arts-form-group">
              <label>🔄 Recarga (turnos)</label>
              <input type="text" id="form-art-reload" placeholder="Ex: 3, 2d4" value="0">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 5: EFEITO (DURAÇÃO + ALCANCE + ALVOS) -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⏳ Duração</label>
              <input type="text" id="form-art-duration" placeholder="Ex: 1 turno" value="instantâneo">
            </div>
            <div class="arts-form-group">
              <label>📍 Alcance</label>
              <input type="text" id="form-art-range" placeholder="Ex: 10 metros" value="contato">
            </div>
          </div>
          <div class="arts-form-row">
            <div class="arts-form-group" style="grid-column: 1 / -1;">
              <label>🎪 Alvos</label>
              <input type="text" id="form-art-targets" placeholder="Ex: alvo único" value="alvo único">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 6: DESCRIÇÃO -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-group">
            <label>📖 Descrição</label>
            <textarea id="form-art-description" placeholder="Descrição detalhada da arte..." style="min-height: 100px;"></textarea>
          </div>
        </div>
      </form>
    `;

    // Configurar preview de imagem
    const imageInput = document.getElementById('form-art-image-upload');
    const imagePreview = document.getElementById('form-art-image-preview');
    const uploadBtn = document.getElementById('form-art-upload-btn');
    const urlBtn = document.getElementById('form-art-url-btn');
    const urlInput = document.getElementById('form-art-image-url');
    let currentImage = '';
    
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      imageInput.click();
    });
    
    urlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (urlInput.style.display === 'none') {
        urlInput.style.display = 'block';
        uploadBtn.style.opacity = '0.5';
        uploadBtn.disabled = true;
      } else {
        urlInput.style.display = 'none';
        uploadBtn.style.opacity = '1';
        uploadBtn.disabled = false;
      }
    });
    
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const base64 = await window.ArtUIEnhancement.fileToBase64(file);
          imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
          currentImage = base64;
        } catch (err) {
          StorageManager.notify('❌ Erro ao carregar imagem', 'error');
        }
      }
    });
    
    urlInput.addEventListener('change', () => {
      const url = urlInput.value.trim();
      if (url) {
        const img = new Image();
        img.onload = () => {
          imagePreview.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
          currentImage = url;
        };
        img.onerror = () => {
          StorageManager.notify('❌ Erro ao carregar imagem da URL', 'error');
        };
        img.src = url;
      }
    });
    
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const base64 = await window.ArtUIEnhancement.fileToBase64(file);
          imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
          imageInput.dataset.base64 = base64;
        } catch (err) {
          StorageManager.notify('❌ Erro ao carregar imagem', 'error');
        }
      }
    });

    this.showModal(async () => {
      const coreId = document.getElementById('form-art-core').value;
      const name = document.getElementById('form-art-name').value.trim();
      const type = document.getElementById('form-art-type').value;
      const action = document.getElementById('form-art-action').value;
      const domain = parseInt(document.getElementById('form-art-domain').value);
      const cost = document.getElementById('form-art-cost').value.trim() || 0;
      const reload = document.getElementById('form-art-reload').value.trim() || 0;
      const damage = document.getElementById('form-art-damage').value.trim();
      const duration = document.getElementById('form-art-duration').value.trim();
      const range = document.getElementById('form-art-range').value.trim();
      const targets = document.getElementById('form-art-targets').value.trim();
      const description = document.getElementById('form-art-description').value.trim();
      let image = currentImage || '';

      // 🔥 COMPRIMIR IMAGEM ANTES DE SALVAR
      if (image && image.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
        console.log('📦 Comprimindo imagem da nova art...');
        image = await ImageCompressor.compressImage(image, 'art');
      }

      const artData = {
        name, coreId, type, action, domain, cost, reload, damage,
        duration, range, targets, description, image
      };

      const art = new Art(artData);

      const ruleValidation = RulesEngine.validateArt(art, this.character);
      if (!ruleValidation.valid) {
        StorageManager.notify(`❌ ${ruleValidation.errors[0]}`, 'error');
        return;
      }

      this.character.addArt(art);
      RulesEngine.autoBlockArts(this.character);
      StorageManager.saveCharacter(this.character);
      await this.render(this.character);
      StorageManager.notify('✅ Art criada com sucesso!', 'success');
    });
  }

  /**
   * MODALS - Editar Art
   */
  async showModalEditArt(artId) {
    const art = this.character.getArt(artId);
    if (!art) return;

    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');

    title.textContent = '✏️ Editar Art';
    
    // 🎨 Tentar carregar imagem do IndexedDB se houver _imagemId
    let imagemExibicao = art.image || null;
    
    if (art._imagemId && typeof ImagemStorageManager !== 'undefined') {
      try {
        const imagemBase64 = await ImagemStorageManager.carregarImagem(art._imagemId);
        if (imagemBase64) {
          imagemExibicao = imagemBase64;
          console.log('📥 ✅ Imagem da art carregada do IndexedDB para edição');
        }
      } catch (e) {
        console.warn('⚠️ Erro ao carregar imagem do IndexedDB:', e.message);
      }
    }
    
    body.innerHTML = `
      <form class="arts-form">
        <!-- SEÇÃO 1: IMAGEM -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; color: #d8b4fe; font-weight: bold; margin-bottom: 12px; font-size: 0.95em;">📸 IMAGEM DA ART</label>
          
          <!-- PREVIEW DA IMAGEM -->
          <div id="form-art-image-preview" style="
            width: 100%;
            aspect-ratio: 16/9;
            border: 2px solid rgba(216, 180, 254, 0.4);
            border-radius: 8px;
            background: rgba(26, 26, 46, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 12px;
          ">
            ${imagemExibicao ? `<img src="${imagemExibicao}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="color: #999; font-size: 48px;">🖼️</span>'}
          </div>
          
          <!-- BOTÕES E INPUT -->
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <button type="button" id="form-art-upload-btn" style="
              flex: 1;
              padding: 10px 12px;
              background: #d8b4fe;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            ">📁 Arquivo</button>
            <button type="button" id="form-art-url-btn" style="
              flex: 1;
              padding: 10px 12px;
              background: #9b59b6;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            ">🔗 URL</button>
          </div>
          
          <!-- INPUTS ESCONDIDOS -->
          <input type="file" id="form-art-image-upload" accept="image/*" style="display: none;">
          <input type="text" id="form-art-image-url" placeholder="Cole a URL da imagem aqui..." style="
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(216, 180, 254, 0.3);
            border-radius: 4px;
            background: rgba(26, 26, 46, 0.6);
            color: #e0e0e0;
            display: none;
            box-sizing: border-box;
          " value="${art.image && !art.image.startsWith('data:') ? art.image : ''}">
          
          <small style="color: #888; display: block;">JPG, PNG, GIF • Máx 1MB</small>
        </div>

        <!-- SEÇÃO 2: NÚCLEO E NOME (CRÍTICO) -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⚔️ Núcleo Base *</label>
              <select id="form-art-core" required disabled style="opacity: 0.7; cursor: not-allowed;">
                <option value="${art.coreId}" selected>${art.coreId}</option>
              </select>
              <small style="color: #888; display: block; margin-top: 4px;">Não pode ser alterado</small>
            </div>
            <div class="arts-form-group">
              <label>📛 Nome *</label>
              <input type="text" id="form-art-name" value="${art.name}" required>
            </div>
          </div>
        </div>

        <!-- SEÇÃO 3: CLASSIFICAÇÃO (TIPO + AÇÃO) -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>🎯 Tipo de Art *</label>
              <select id="form-art-type" required>
                ${Object.entries(RulesEngine.ART_TYPES || {})
                  .map(([key, info]) => `<option value="${key}" ${art.type === key ? 'selected' : ''}>${info.icon} ${info.name}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="arts-form-group">
              <label>⚡ Tipo de Ação *</label>
              <select id="form-art-action" required>
                <option value="">Selecione...</option>
                <option value="Imediata" ${art.action === 'Imediata' ? 'selected' : ''}>⚡ Imediata</option>
                <option value="Duradoura" ${art.action === 'Duradoura' ? 'selected' : ''}>⏱️ Duradoura</option>
                <option value="Sustentada" ${art.action === 'Sustentada' ? 'selected' : ''}>🔄 Sustentada</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SEÇÃO 4: ATRIBUTOS (DOMÍNIO + CUSTO + DANO) -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>📍 Domínio *</label>
              <select id="form-art-domain" required>
                ${Object.entries(RulesEngine.DOMAINS || {})
                  .map(([key, info]) => `<option value="${key}" ${art.domain == key ? 'selected' : ''}>Dom ${key}: ${info.name}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="arts-form-group">
              <label>💎 Custo (PM) *</label>
              <input type="text" id="form-art-cost" required placeholder="Ex: 10, 1d6+5" value="${art.cost}">
            </div>
          </div>
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⚔️ Dano</label>
              <input type="text" id="form-art-damage" value="${art.damage || ''}" placeholder="Ex: 2d6+3">
            </div>
            <div class="arts-form-group">
              <label>🔄 Recarga (turnos)</label>
              <input type="text" id="form-art-reload" placeholder="Ex: 3, 2d4" value="${art.reload || 0}">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 5: EFEITO (DURAÇÃO + ALCANCE + ALVOS) -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⏳ Duração</label>
              <input type="text" id="form-art-duration" value="${art.duration}">
            </div>
            <div class="arts-form-group">
              <label>📍 Alcance</label>
              <input type="text" id="form-art-range" value="${art.range}">
            </div>
          </div>
          <div class="arts-form-row">
            <div class="arts-form-group" style="grid-column: 1 / -1;">
              <label>🎪 Alvos</label>
              <input type="text" id="form-art-targets" value="${art.targets}">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 6: DESCRIÇÃO -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-group">
            <label>📖 Descrição</label>
            <textarea id="form-art-description" style="min-height: 100px;">${art.description || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    // Configurar preview de imagem
    const imageInput = document.getElementById('form-art-image-upload');
    const imagePreview = document.getElementById('form-art-image-preview');
    const uploadBtn = document.getElementById('form-art-upload-btn');
    const urlBtn = document.getElementById('form-art-url-btn');
    const urlInput = document.getElementById('form-art-image-url');
    let currentImage = imagemExibicao || '';
    
    // Botão Arquivo
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      imageInput.click();
    });
    
    // Botão URL
    urlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (urlInput.style.display === 'none') {
        urlInput.style.display = 'block';
        uploadBtn.style.opacity = '0.5';
        uploadBtn.disabled = true;
      } else {
        urlInput.style.display = 'none';
        uploadBtn.style.opacity = '1';
        uploadBtn.disabled = false;
      }
    });
    
    // Input de Arquivo
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const base64 = await window.ArtUIEnhancement.fileToBase64(file);
          imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
          currentImage = base64;
        } catch (err) {
          StorageManager.notify('❌ Erro ao carregar imagem', 'error');
        }
      }
    });
    
    // Input de URL
    urlInput.addEventListener('change', () => {
      const url = urlInput.value.trim();
      if (url) {
        const img = new Image();
        img.onload = () => {
          imagePreview.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
          currentImage = url;
        };
        img.onerror = () => {
          StorageManager.notify('❌ Erro ao carregar imagem da URL', 'error');
        };
        img.src = url;
      }
    });

    this.showModal(async () => {
      const name = document.getElementById('form-art-name').value.trim();
      const type = document.getElementById('form-art-type').value;
      const action = document.getElementById('form-art-action').value;
      const domain = parseInt(document.getElementById('form-art-domain').value);
      const cost = document.getElementById('form-art-cost').value.trim() || 0;
      const reload = document.getElementById('form-art-reload').value.trim() || 0;
      const damage = document.getElementById('form-art-damage').value.trim();
      const duration = document.getElementById('form-art-duration').value.trim();
      const range = document.getElementById('form-art-range').value.trim();
      const targets = document.getElementById('form-art-targets').value.trim();
      const description = document.getElementById('form-art-description').value.trim();

      if (!name || !type || !action || !domain) {
        StorageManager.notify('⚠️ Preencha os campos obrigatórios (*)', 'warning');
        return;
      }

      art.name = name;
      art.type = type;
      art.action = action;
      art.domain = domain;
      art.cost = cost;
      art.reload = reload;
      art.damage = damage;
      art.duration = duration;
      art.range = range;
      art.targets = targets;
      art.description = description;

      // 🎨 OTIMIZAÇÃO DE IMAGEM - Usar IndexedDB para base64 + localStorage para referência minimal
      if (currentImage) {
        // Detectar se é base64 (upload)
        if (currentImage.startsWith('data:')) {
          console.log('📸 Detectada imagem base64 (upload) para art');
          const imagemId = `art_${art.id}`;
          
          // Salvar no IndexedDB
          if (typeof ImagemStorageManager !== 'undefined') {
            try {
              // 🔥 COMPRIMIR ANTES DE SALVAR
              let imagemParaSalvar = currentImage;
              if (typeof ImageCompressor !== 'undefined') {
                console.log('📦 Comprimindo imagem da art...');
                imagemParaSalvar = await ImageCompressor.compressImage(currentImage, 'art');
              }

              await ImagemStorageManager.salvarImagem(imagemId, imagemParaSalvar, 'art');
              console.log('✅ Imagem da art salva no IndexedDB:', imagemId);
              
              // Salvar referência minimal no localStorage
              localStorageManager.saveArtImagemMinimal(art.id, 1);
              
              // Armazenar apenas a referência na art
              art.image = null; // Remover base64 do objeto
              art._imagemId = imagemId; // Guardar ID para referência
              console.log('💾 Referência minimal salva em localStorage (88% de economia)');
            } catch (e) {
              console.error('❌ Erro ao salvar imagem no IndexedDB:', e);
              // Fallback: armazenar como antes
              art.image = currentImage;
            }
          } else {
            // Se ImagemStorageManager não está disponível, armazenar como antes
            console.warn('⚠️ ImagemStorageManager não disponível, usando armazenamento tradicional');
            art.image = currentImage;
          }
        } else {
          // URL externa - apenas armazenar a URL
          art.image = currentImage;
          console.log('🔗 Imagem de URL externa armazenada:', currentImage);
        }
      } else {
        art.image = null;
      }

      const validation = RulesEngine.validateArt(art, this.character);
      if (!validation.valid) {
        StorageManager.notify(`❌ ${validation.errors[0]}`, 'error');
        return;
      }

      StorageManager.saveCharacter(this.character);
      await this.render(this.character);
      StorageManager.notify('✅ Art atualizada!', 'success');
    });
  }

  /**
   * MODALS - Criar Variação
   */
  async showModalCreateVariation(artId) {
    const art = this.character.getArt(artId);
    const body = document.getElementById('arts-modal-body');
    const title = document.getElementById('arts-modal-title');

    title.textContent = `☀️ Criar Nova Variante`;
    let selectedArt = art;

    body.innerHTML = `
      <form class="arts-form">
        <!-- SEÇÃO 1: IMAGEM -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; color: #d8b4fe; font-weight: bold; margin-bottom: 12px; font-size: 0.95em;">📸 IMAGEM DA VARIANTE</label>
          
          <!-- PREVIEW DA IMAGEM -->
          <div id="form-var-new-image-preview" style="
            width: 100%;
            aspect-ratio: 16/9;
            border: 2px solid rgba(216, 180, 254, 0.4);
            border-radius: 8px;
            background: rgba(26, 26, 46, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 12px;
          ">
            <span style="color: #999; font-size: 48px;">🖼️</span>
          </div>
          
          <!-- BOTÕES E INPUT -->
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <button type="button" id="form-var-new-upload-btn" style="
              flex: 1;
              padding: 10px 12px;
              background: #d8b4fe;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            ">📁 Arquivo</button>
            <button type="button" id="form-var-new-url-btn" style="
              flex: 1;
              padding: 10px 12px;
              background: #9b59b6;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            ">🔗 URL</button>
          </div>
          
          <!-- INPUTS ESCONDIDOS -->
          <input type="file" id="form-var-new-image-upload" accept="image/*" style="display: none;">
          <input type="text" id="form-var-new-image-url" placeholder="Cole a URL da imagem aqui..." style="
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(216, 180, 254, 0.3);
            border-radius: 4px;
            background: rgba(26, 26, 46, 0.6);
            color: #e0e0e0;
            display: none;
            box-sizing: border-box;
          ">
          
          <small style="color: #888; display: block;">JPG, PNG, GIF • Máx 1MB</small>
        </div>

        <!-- SEÇÃO 2: ART BASE + NOME -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⚔️ Art Base *</label>
              ${art ? `
                <select disabled style="opacity: 0.7; cursor: not-allowed;">
                  <option selected>${art.name}</option>
                </select>
                <small style="color: #888; display: block; margin-top: 4px;">Fixa</small>
              ` : `
                <input type="text" id="form-var-new-art-search" placeholder="Pesquisar art..." autocomplete="off">
                <div class="arts-search-results" id="arts-var-new-search-results" style="display: none; max-height: 200px; overflow-y: auto; margin-top: 0.5rem; border: 1px solid rgba(216, 180, 254, 0.3); border-radius: 6px; background: rgba(30, 30, 30, 0.8);"></div>
                <input type="hidden" id="form-var-new-art-id">
                <div id="form-var-new-art-selected" style="margin-top: 0.5rem; padding: 0.75rem; background: rgba(216, 180, 254, 0.15); border: 1px solid rgba(216, 180, 254, 0.4); border-radius: 6px; display: none; color: #d8b4fe; font-weight: 500;"></div>
              `}
            </div>
            <div class="arts-form-group">
              <label>📛 Nome *</label>
              <input type="text" id="form-var-new-name" required placeholder="Ex: Explosão de Fogo">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 3: TIPO + AÇÃO -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>🎯 Tipo *</label>
              <select id="form-var-new-type" required>
                <option value="">Selecione...</option>
                <option value="Ofensiva">⚔️ Ofensiva</option>
                <option value="Defensiva">🛡️ Defensiva</option>
                <option value="Estratégica">🎯 Estratégica</option>
                <option value="Suporte">💚 Suporte</option>
                <option value="Controle">🌀 Controle</option>
                <option value="Invocação">🔮 Invocação</option>
                <option value="Transformação">🧬 Transformação</option>
                <option value="Passiva">🕶️ Passiva</option>
                <option value="Racial">👑 Racial</option>
              </select>
            </div>
            <div class="arts-form-group">
              <label>⚡ Ação *</label>
              <select id="form-var-new-action" required>
                <option value="">Selecione...</option>
                <option value="Imediata">⚡ Imediata</option>
                <option value="Duradoura">⏱️ Duradoura</option>
                <option value="Sustentada">🔄 Sustentada</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SEÇÃO 4: DOMÍNIO + CUSTO + DANO -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>📍 Domínio *</label>
              <input type="number" id="form-var-new-domain" min="1" max="5" value="1" required>
            </div>
            <div class="arts-form-group">
              <label>💎 Custo (PM)</label>
              <input type="text" id="form-var-new-cost" placeholder="Ex: 10, 1d6+5" value="0">
            </div>
          </div>
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⚔️ Dano</label>
              <input type="text" id="form-var-new-damage" placeholder="Ex: 2d6+3">
            </div>
            <div class="arts-form-group">
              <label>🔄 Recarga (turnos)</label>
              <input type="text" id="form-var-new-reload" placeholder="Ex: 3, 2d4" value="0">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 5: DURAÇÃO + ALCANCE + ALVOS -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-row">
            <div class="arts-form-group">
              <label>⏳ Duração</label>
              <input type="text" id="form-var-new-duration" placeholder="Ex: 1 turno">
            </div>
            <div class="arts-form-group">
              <label>📍 Alcance</label>
              <input type="text" id="form-var-new-range" placeholder="Ex: 10 metros">
            </div>
          </div>
          <div class="arts-form-row">
            <div class="arts-form-group" style="grid-column: 1 / -1;">
              <label>🎪 Alvos</label>
              <input type="text" id="form-var-new-targets" placeholder="Ex: alvo único">
            </div>
          </div>
        </div>

        <!-- SEÇÃO 6: DESCRIÇÃO -->
        <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
          <div class="arts-form-group">
            <label>📖 Descrição</label>
            <textarea id="form-var-new-description" style="min-height: 100px;"></textarea>
          </div>
        </div>
      </form>
    `;

    // Configurar preview de imagem
    const imageInput = document.getElementById('form-var-new-image-upload');
    const imagePreview = document.getElementById('form-var-new-image-preview');
    const uploadBtn = document.getElementById('form-var-new-upload-btn');
    const urlBtn = document.getElementById('form-var-new-url-btn');
    const urlInput = document.getElementById('form-var-new-image-url');
    let currentImage = '';
    
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      imageInput.click();
    });
    
    urlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (urlInput.style.display === 'none') {
        urlInput.style.display = 'block';
        uploadBtn.style.opacity = '0.5';
        uploadBtn.disabled = true;
      } else {
        urlInput.style.display = 'none';
        uploadBtn.style.opacity = '1';
        uploadBtn.disabled = false;
      }
    });
    
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const base64 = await window.ArtUIEnhancement.fileToBase64(file);
          imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
          currentImage = base64;
        } catch (err) {
          StorageManager.notify('❌ Erro ao carregar imagem', 'error');
        }
      }
    });
    
    urlInput.addEventListener('change', () => {
      const url = urlInput.value.trim();
      if (url) {
        const img = new Image();
        img.onload = () => {
          imagePreview.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
          currentImage = url;
        };
        img.onerror = () => {
          StorageManager.notify('❌ Erro ao carregar imagem da URL', 'error');
        };
        img.src = url;
      }
    });

    // Setup de busca de arts (se não foi passado artId)
    if (!art) {
      setTimeout(() => {
        const searchInput = document.getElementById('form-var-new-art-search');
        const resultsDiv = document.getElementById('arts-var-new-search-results');
        const selectedDiv = document.getElementById('form-var-new-art-selected');
        const artIdInput = document.getElementById('form-var-new-art-id');

        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          if (!query) {
            resultsDiv.style.display = 'none';
            return;
          }

          const filtered = this.character.arts.filter(a => 
            a.name.toLowerCase().includes(query)
          );

          if (filtered.length === 0) {
            resultsDiv.innerHTML = '<div style="padding: 0.75rem; color: #888; text-align: center;">Nenhuma art encontrada</div>';
            resultsDiv.style.display = 'block';
            return;
          }

          resultsDiv.innerHTML = filtered
            .map(a => {
              const core = this.character.getCore(a.coreId);
              return `
                <div class="arts-search-item" data-art-id="${a.id}" style="padding: 0.75rem; cursor: pointer; border-bottom: 1px solid rgba(216, 180, 254, 0.15); transition: background 0.2s; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #d8b4fe;">${a.name}</strong>
                    <small style="color: #888; display: block;">Núcleo: ${core?.name || 'Desconhecido'}</small>
                  </div>
                  <small style="color: #666;">Dom ${a.domain}</small>
                </div>
              `;
            })
            .join('');
          resultsDiv.style.display = 'block';

          resultsDiv.querySelectorAll('.arts-search-item').forEach(item => {
            item.addEventListener('click', () => {
              const selArtId = item.dataset.artId;
              const selArt = this.character.getArt(selArtId);
              const selCore = this.character.getCore(selArt.coreId);
              
              selectedArt = selArt;
              artIdInput.value = selArtId;
              searchInput.value = selArt.name;
              resultsDiv.style.display = 'none';
              selectedDiv.textContent = `✅ ${selArt.name} (Dom ${selArt.domain}) - Núcleo: ${selCore.name}`;
              selectedDiv.style.display = 'block';
            });
          });
        });
      }, 100);
    }

    this.showModal(async () => {
      if (!selectedArt) {
        StorageManager.notify('⚠️ Selecione uma Art Base', 'warning');
        return;
      }

      const name = document.getElementById('form-var-new-name').value.trim();
      const type = document.getElementById('form-var-new-type').value;
      const action = document.getElementById('form-var-new-action').value;
      const domain = parseInt(document.getElementById('form-var-new-domain').value);
      const cost = document.getElementById('form-var-new-cost').value.trim() || 0;
      const reload = document.getElementById('form-var-new-reload').value.trim() || 0;
      const damage = document.getElementById('form-var-new-damage').value.trim();
      const duration = document.getElementById('form-var-new-duration').value.trim();
      const range = document.getElementById('form-var-new-range').value.trim();
      const targets = document.getElementById('form-var-new-targets').value.trim();
      const description = document.getElementById('form-var-new-description').value.trim();

      console.log('🔍 DEBUG - Criando variante:', {
        name, type, action, domain, cost, reload, damage, duration, range, targets, description,
        selectedArtId: selectedArt.id,
        selectedArtDomain: selectedArt.domain
      });

      if (!name || !type || !action) {
        StorageManager.notify('⚠️ Preencha os campos obrigatórios', 'warning');
        return;
      }

      const variation = new Variation({
        name,
        type,
        action,
        domain,
        cost,
        reload,
        damage,
        duration,
        range,
        targets,
        description,
        image: null  // Será preenchido com a lógica de otimização abaixo
      });

      console.log('📦 Variante criada:', variation);

      // 🎨 OTIMIZAÇÃO DE IMAGEM - Usar IndexedDB para base64 + localStorage para referência minimal
      if (currentImage) {
        // Detectar se é base64 (upload)
        if (currentImage.startsWith('data:')) {
          console.log('📸 Detectada imagem base64 (upload) para nova variação');
          const imagemId = `art_var_${variation.id}`;
          
          // Salvar no IndexedDB
          if (typeof ImagemStorageManager !== 'undefined') {
            try {
              // 🔥 COMPRIMIR ANTES DE SALVAR
              let imagemParaSalvar = currentImage;
              if (typeof ImageCompressor !== 'undefined') {
                console.log('📦 Comprimindo imagem da variação...');
                imagemParaSalvar = await ImageCompressor.compressImage(currentImage, 'variation');
              }

              await ImagemStorageManager.salvarImagem(imagemId, imagemParaSalvar, 'art');
              console.log('✅ Imagem da variação salva no IndexedDB:', imagemId);
              
              // Salvar referência minimal no localStorage
              localStorageManager.saveVariacaoImagemMinimal(variation.id, 1);
              
              // Armazenar apenas a referência na variação
              variation._imagemId = imagemId; // Guardar ID para referência
              console.log('💾 Referência minimal salva em localStorage (88% de economia)');
            } catch (e) {
              console.error('❌ Erro ao salvar imagem no IndexedDB:', e);
              // Fallback: armazenar como antes
              variation.image = currentImage;
            }
          } else {
            // Se ImagemStorageManager não está disponível, armazenar como antes
            console.warn('⚠️ ImagemStorageManager não disponível, usando armazenamento tradicional');
            variation.image = currentImage;
          }
        } else {
          // URL externa - apenas armazenar a URL
          variation.image = currentImage;
          console.log('🔗 Imagem de URL externa armazenada:', currentImage);
        }
      }

      const validation = RulesEngine.validateVariation(variation, selectedArt);
      console.log('✔️ Validação:', validation);

      if (!validation.valid) {
        StorageManager.notify(`❌ ${validation.errors[0]}`, 'error');
        return;
      }

      console.log('💾 Adicionando variante à art...');
      selectedArt.addVariation(variation);
      console.log('✅ Variante adicionada. Art agora tem', selectedArt.variations.length, 'variações');

      StorageManager.saveCharacter(this.character);
      console.log('💾 Personagem salvo');

      await this.render(this.character);
      console.log('🎨 Render completo');

      StorageManager.notify('✅ Variante criada com sucesso!', 'success');
    });
  }

  /**
   * DELETE - Núcleo
   */
  async deleteCore(coreId) {
    if (confirm('Tem certeza? Todas as arts derivadas serão removidas também.')) {
      try {
        this.isProcessing = true;
        console.log('🗑️ Iniciando exclusão do núcleo:', coreId);
        
        this.character.removeCore(coreId);
        StorageManager.saveCharacter(this.character);
        StorageManager.notify('✅ Núcleo removido', 'success');
        
        console.log('✅ Núcleo removido com sucesso');
        await this.render(this.character);
      } catch (error) {
        console.error('❌ Erro ao remover núcleo:', error);
        StorageManager.notify('❌ Erro ao remover núcleo', 'error');
      } finally {
        this.isProcessing = false;
      }
    }
  }

  /**
   * DELETE - Art
   */
  async deleteArt(artId) {
    if (confirm('Tem certeza? Todas as variações serão removidas também.')) {
      try {
        this.isProcessing = true;
        console.log('🗑️ Iniciando exclusão da art:', artId);
        
        RulesEngine.removeArtWithVariations(this.character, artId);
        RulesEngine.autoBlockArts(this.character);
        StorageManager.saveCharacter(this.character);
        StorageManager.notify('✅ Art removida', 'success');
        
        console.log('✅ Art removida com sucesso');
        
        // ✨ Atualizar botões do modal de classes se estiver ativo
        if (window.classesUI) {
          // Forçar atualização dos botões de habilidades
          if (window.classesUI.atualizarBotoesHabilidades) {
            console.log('🔄 Atualizando botões de habilidades no modal...');
            window.classesUI.atualizarBotoesHabilidades();
          }
          // Também atualizar todos os botões
          if (window.classesUI.atualizarBotoesSelecionados) {
            console.log('🔄 Atualizando todos os botões do modal de classes...');
            window.classesUI.atualizarBotoesSelecionados();
          }
        }
        
        await this.render(this.character);
      } catch (error) {
        console.error('❌ Erro ao remover art:', error);
        StorageManager.notify('❌ Erro ao remover art', 'error');
      } finally {
        this.isProcessing = false;
      }
    }
  }

  /**
   * DELETE - Variação
   */
  async deleteVariation(artId, variationId) {
    try {
      this.isProcessing = true;
      console.log('🗑️ Iniciando exclusão da variação:', variationId);
      
      const art = this.character.getArt(artId);
      if (art) {
        art.removeVariation(variationId);
        StorageManager.saveCharacter(this.character);
        StorageManager.notify('✅ Variação removida', 'success');
        
        console.log('✅ Variação removida com sucesso');
        await this.render(this.character);
      }
    } catch (error) {
      console.error('❌ Erro ao remover variação:', error);
      StorageManager.notify('❌ Erro ao remover variação', 'error');
    } finally {
      this.isProcessing = false;
    }
  }


  /**
   * Modal Controls
   */
  showModal(onConfirm, confirmText = 'Confirmar') {
    const overlay = document.getElementById('arts-modal-overlay');
    const confirmBtn = document.getElementById('arts-modal-confirm');

    overlay.style.display = 'flex';

    if (onConfirm) {
      confirmBtn.textContent = confirmText;
      confirmBtn.onclick = () => {
        onConfirm();
        this.closeModal();
      };
    }
  }

  hideModal() {
    this.closeModal();
  }

  closeModal() {
    const overlay = document.getElementById('arts-modal-overlay');
    overlay.style.display = 'none';
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIManager };
}

