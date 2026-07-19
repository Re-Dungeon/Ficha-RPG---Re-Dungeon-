/**
 * 🎯 RENDERIZADOR DE CORES (NÚCLEOS) DO COMPANHEIRO
 * Renderiza cards de núcleos salvos na aba de Habilidades
 * Funcionalidade idêntica à aba de Habilidades principal
 */

class CompanheiroArtsRenderer {
    constructor() {
        this.cores = []; // Array para armazenar cores
        this.arts = [];  // Array para armazenar arts
        this.carregando = false;  // ✅ NOVO: Flag para evitar duplicatas durante carregamento
        this.inicializar();
    }

    inicializar() {
        console.log('🎨 [CompanheiroArtsRenderer] Inicializando...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupListeners());
        } else {
            this.setupListeners();
        }
    }

    setupListeners() {
        console.log('🎨 [CompanheiroArtsRenderer] Configurando listeners...');
        
        // Escutar evento de novo núcleo
        window.addEventListener('companheiroCreateCore', (e) => {
            console.log('📢 Evento companheiroCreateCore recebido:', e.detail);
            
            // ✅ NOVO: Validar que o core tem dados válidos
            if (!e.detail || !e.detail.core) {
                console.warn('⚠️ Evento companheiroCreateCore recebido sem core válido');
                return;
            }
            
            const core = e.detail.core;
            if (!core.id || !core.name || core.name.trim() === '') {
                console.warn('⚠️ Núcleo com dados inválidos, ignorando:', core);
                return;
            }
            
            this.addCoreToList(core);
        });

        // Escutar evento de atualizar núcleo
        window.addEventListener('companheiroUpdateCore', (e) => {
            console.log('📢 Evento companheiroUpdateCore recebido:', e.detail);
            this.updateCoreInList(e.detail.core);
        });

        // Escutar evento de deletar núcleo
        window.addEventListener('companheiroDeleteCore', (e) => {
            console.log('📢 Evento companheiroDeleteCore recebido:', e.detail);
            this.removeCoreFromList(e.detail.coreId);
        });

        console.log('✅ [CompanheiroArtsRenderer] Listeners configurados');
    }

    /**
     * Adiciona núcleo à lista renderizada
     */
    addCoreToList(core) {
        // ✅ NOVO: Validar que o core tem dados válidos
        if (!core || !core.id || !core.name || core.name.trim() === '') {
            console.warn('❌ Núcleo com dados inválidos, rejeitando:', core);
            return;
        }

        const listContainer = document.getElementById('companheiro-arts-cores-list');
        if (!listContainer) {
            // Sem console.warn para não poluir o console
            return;
        }

        // ✅ NOVO: Verificar se núcleo já existe (evitar duplicatas)
        const jaExiste = listContainer.querySelector(`[data-core-id="${core.id}"]`);
        if (jaExiste) {
            console.warn('⚠️ Núcleo já existe na lista:', core.id);
            return;
        }

        // Armazenar no array interno (verificar duplicata também)
        const jaExisteNoArray = this.cores.find(c => c.id === core.id);
        if (!jaExisteNoArray) {
            this.cores.push(core);
        }

        console.log(`📝 [addCoreToList] Núcleo "${core.name}" adicionado. carregando=${this.carregando}, persistence=${!!window.companheiroArtsPersistence}`);

        // ✅ NOVO: Salvar núcleo na estrutura do companheiro (persistência) - MAS NÃO se estamos carregando
        if (window.companheiroArtsPersistence && !this.carregando) {
            console.log(`💾 [addCoreToList] Salvando núcleo "${core.name}" em persistência`);
            window.companheiroArtsPersistence.salvarCoresToCompanheiro(core, 'create');
        } else if (this.carregando) {
            console.log(`⏭️ [addCoreToList] NÃO salvando núcleo "${core.name}" - FLAG carregando=true`);
        }

        // Se tinha a mensagem "Nenhum núcleo adicionado", remover
        const emptyMessage = listContainer.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }

        // Criar e adicionar card do núcleo
        const coreCard = document.createElement('div');
        coreCard.className = 'companheiro-arts-core-card';
        coreCard.dataset.coreId = core.id;
        
        // Adicionar classe de tipo para efeito visual
        const coreType = (core.concept || 'sem-tipo').toLowerCase().replace(/\s+/g, '-');
        coreCard.classList.add(`companheiro-arts-core-type-${coreType}`);
        
        coreCard.innerHTML = this.getCoreCardTemplate(core);

        listContainer.appendChild(coreCard);
        console.log('✅ Núcleo renderizado no DOM:', core.name);
    }

    /**
     * Atualiza núcleo na lista
     */
    updateCoreInList(core) {
        // Atualizar no array interno
        const coreIndex = this.cores.findIndex(c => c.id === core.id);
        if (coreIndex !== -1) {
            console.log('🔄 Atualizando núcleo existente no array:', core.id);
            this.cores[coreIndex] = core;
        } else {
            console.log('➕ Adicionando núcleo ao array (não existia):', core.id);
            this.cores.push(core);
        }

        // Atualizar card visual (encontrar e substituir o conteúdo interno)
        const coreCard = document.querySelector(`[data-core-id="${core.id}"]`);
        if (coreCard) {
            console.log('🎨 Atualizando card visual do núcleo:', core.id);
            coreCard.innerHTML = this.getCoreCardTemplate(core);
            
            // Atualizar classe de tipo se mudou
            const coreType = (core.concept || 'sem-tipo').toLowerCase().replace(/\s+/g, '-');
            // Remover todas as classes de tipo antigas
            coreCard.className = coreCard.className.replace(/companheiro-arts-core-type-\S+/g, '');
            // Adicionar nova classe de tipo
            coreCard.classList.add(`companheiro-arts-core-type-${coreType}`);
            
            console.log('✅ Núcleo atualizado na lista:', core.name);
        } else {
            // Sem aviso para manter console limpo
        }
    }

    /**
     * Remove núcleo da lista
     */
    removeCoreFromList(coreId) {
        // Remover do array interno
        this.cores = this.cores.filter(c => c.id !== coreId);

        // ✅ NOVO: Deletar núcleo da estrutura do companheiro
        if (window.companheiroArtsPersistence) {
            window.companheiroArtsPersistence.deletarCoreDoCompanheiro(coreId);
        }

        const coreCard = document.querySelector(`[data-core-id="${coreId}"]`);
        if (coreCard) {
            coreCard.remove();
            console.log('✅ Núcleo removido:', coreId);
            
            // Verificar se lista está vazia
            const listContainer = document.getElementById('companheiro-arts-cores-list');
            if (listContainer && listContainer.children.length === 0) {
                listContainer.innerHTML = '<p class="empty-message">Nenhum núcleo adicionado</p>';
            }
        }
    }

    /**
     * Template do card do núcleo (idêntico ao da aba principal)
     */
    getCoreCardTemplate(core) {
        const artsCount = this.countArtsByCore(core.id);
        return `
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
                📜 ${artsCount} art(s)
            </div>
            
            <!-- HEADER COM IMAGEM E TÍTULO -->
            <div class="companheiro-arts-core-top">
                <div class="companheiro-arts-core-image-placeholder">
                    ${core.image ? `<img src="${core.image}" alt="${core.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : '<span class="image-icon">🎨</span>'}
                </div>
                <div class="companheiro-arts-core-header-info">
                    <h4 class="companheiro-arts-core-name">${core.name}</h4>
                    <div class="companheiro-arts-core-header-divider"></div>
                    <p class="companheiro-arts-core-type"><strong>Tipo:</strong> <span class="companheiro-arts-core-type-value">${core.concept || 'Sem tipo'}</span></p>
                    <p class="companheiro-arts-core-essence"><strong>Essência:</strong> ${core.visualForm || 'Não definida'}</p>
                </div>
            </div>

            <!-- DIVISOR -->
            <div class="companheiro-arts-core-divider"></div>

            <!-- DESCRIÇÃO -->
            <div class="companheiro-arts-core-description-section">
                <h5 class="companheiro-arts-core-description-title">✨ ESSÊNCIA</h5>
                <p class="companheiro-arts-core-description">${core.description || 'Sem descrição'}</p>
            </div>

            <!-- DIVISOR -->
            <div class="companheiro-arts-core-divider"></div>

            <!-- FOOTER COM AÇÕES -->
            <div class="companheiro-arts-core-footer" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button class="companheiro-arts-btn companheiro-arts-btn-small" data-action="view-core" data-id="${core.id}" style="flex: 1; min-width: 50px; padding: 4px 8px; font-size: 0.75em; background: #3498db; border: none; border-radius: 4px; color: white; cursor: pointer; transition: all 0.2s;">🔍 Ver</button>
                <button class="companheiro-arts-btn companheiro-arts-btn-small" data-action="edit-core" data-id="${core.id}" style="flex: 1; min-width: 55px; padding: 4px 8px; font-size: 0.75em; background: #f39c12; border: none; border-radius: 4px; color: white; cursor: pointer; transition: all 0.2s;">✏️ Editar</button>
                <button class="companheiro-arts-btn companheiro-arts-btn-small" data-action="delete-core" data-id="${core.id}" style="flex: 1; min-width: 60px; padding: 4px 8px; font-size: 0.75em; background: #e74c3c; border: none; border-radius: 4px; color: white; cursor: pointer; transition: all 0.2s;">🗑️ Remover</button>
            </div>
        `;
    }

    /**
     * Remove núcleo da lista
     */
    removeCoreFromList(coreId) {
        const coreCard = document.querySelector(`[data-core-id="${coreId}"]`);
        if (coreCard) {
            coreCard.remove();
            console.log('✅ Núcleo removido:', coreId);
            
            // Verificar se lista está vazia
            const listContainer = document.getElementById('companheiro-arts-cores-list');
            if (listContainer && listContainer.children.length === 0) {
                listContainer.innerHTML = '<p class="empty-message">Nenhum núcleo adicionado</p>';
            }
        }
    }

    /**
     * Adiciona estilos CSS para os cards de núcleo
     */
    injectCoreCardStyles() {
        if (document.getElementById('companheiro-core-card-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'companheiro-core-card-styles';
        style.textContent = `
            .companheiro-arts-core-card {
                background: linear-gradient(135deg, rgba(216, 180, 254, 0.08), rgba(216, 180, 254, 0.05));
                border: 2px solid #d8b4fe;
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.3s ease;
                animation: slideIn 0.3s ease-out;
                display: flex;
                flex-direction: column;
                position: relative;
                padding-top: 3rem;
            }

            .companheiro-arts-core-card:hover {
                box-shadow: 0 12px 28px rgba(216, 180, 254, 0.25);
                transform: translateY(-4px);
                border-color: #e6b800;
            }

            .companheiro-arts-core-top {
                display: flex;
                gap: 1.2rem;
                padding: 1.2rem;
                align-items: flex-start;
                margin-top: -3rem;
            }

            .companheiro-arts-core-image-placeholder {
                width: 130px;
                height: 130px;
                min-width: 130px;
                background: linear-gradient(135deg, rgba(216, 180, 254, 0.15), rgba(216, 180, 254, 0.1));
                border: 2px dashed rgba(216, 180, 254, 0.4);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                color: rgba(216, 180, 254, 0.6);
            }

            .companheiro-arts-core-header-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                padding-right: 130px;
            }

            .companheiro-arts-core-name {
                margin: 0;
                color: #d8b4fe;
                font-size: 1.3rem;
                font-weight: 700;
                line-height: 1.3;
            }

            .companheiro-arts-core-header-divider {
                height: 1px;
                background: linear-gradient(to right, #d8b4fe, transparent);
                opacity: 0.5;
                margin: 0.3rem 0;
            }

            .companheiro-arts-core-type,
            .companheiro-arts-core-essence {
                margin: 0;
                font-size: 0.85rem;
                color: #a0a0a0;
                line-height: 1.4;
            }

            .companheiro-arts-core-divider {
                height: 1px;
                background: linear-gradient(to right, rgba(216, 180, 254, 0.3), transparent);
                margin: 0;
            }

            .companheiro-arts-core-description-section {
                padding: 1.2rem;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
                min-height: 120px;
            }

            .companheiro-arts-core-description-title {
                margin: 0;
                color: #d8b4fe;
                font-size: 0.95rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .companheiro-arts-core-description {
                margin: 0;
                color: #d0d0d0;
                font-size: 0.9rem;
                line-height: 1.5;
                overflow: hidden;
                display: -webkit-box;
                line-clamp: 4;
                -webkit-line-clamp: 4;
                -webkit-box-orient: vertical;
                word-wrap: break-word;
                overflow-wrap: break-word;
                word-break: break-word;
            }

            .companheiro-arts-core-footer {
                display: flex;
                gap: 0.5rem;
                padding: 1rem 1.2rem;
                align-items: center;
                flex-wrap: wrap;
                justify-content: space-between;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos de card de núcleo injetados');
    }

    /**
     * 🎨 RENDERIZAR ARTS (HABILIDADES)
     * Adiciona uma art ao container visual
     */
    addArtToList(art) {
        const listContainer = document.getElementById('companheiro-arts-arts-list');
        if (!listContainer) {
            // Sem aviso para manter console limpo
            return;
        }

        // ✅ CRÍTICO: Validar que art tem coreId válido
        if (!art.coreId || art.coreId === '') {
            console.error('❌ [addArtToList] REJEITADA: Art sem coreId!', art);
            alert('❌ ERRO: Não é possível criar uma Art sem um Núcleo!\n\nPor favor, selecione um núcleo.');
            return;
        }

        // ✅ CRÍTICO: Validar que o núcleo realmente existe
        const coreExists = this.cores.some(c => c.id === art.coreId);
        if (!coreExists) {
            console.error('❌ [addArtToList] REJEITADA: Núcleo não existe!', {
                coreIdSolicitado: art.coreId,
                nucleosDisponiveis: this.cores.map(c => c.id)
            });
            alert(`❌ ERRO: O Núcleo "${art.coreId}" não existe!\n\nPor favor, crie um núcleo primeiro.`);
            return;
        }

        // ✅ NOVO: Verificar se art já existe (evitar duplicatas)
        const jaExiste = listContainer.querySelector(`[data-art-id="${art.id}"]`);
        if (jaExiste) {
            console.warn('⚠️ Art já existe na lista:', art.id);
            return;
        }

        // Armazenar art no array interno (verificar duplicata também)
        const jaExisteNoArray = this.arts.find(a => a.id === art.id);
        if (!jaExisteNoArray) {
            this.arts.push(art);
        }

        console.log(`📝 [addArtToList] Art "${art.name}" adicionada. carregando=${this.carregando}, persistence=${!!window.companheiroArtsPersistence}`);

        // ✅ NOVO: Salvar art na estrutura do companheiro (persistência) - MAS NÃO se estamos carregando
        if (window.companheiroArtsPersistence && !this.carregando) {
            console.log(`💾 [addArtToList] Salvando art "${art.name}" em persistência`);
            window.companheiroArtsPersistence.salvarArtToCompanheiro(art);
        } else if (this.carregando) {
            console.log(`⏭️ [addArtToList] NÃO salvando art "${art.name}" - FLAG carregando=true`);
        }

        // Se tinha a mensagem "Nenhuma habilidade adicionada", remover
        const emptyMessage = listContainer.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }

        // Criar e adicionar card da art
        const artCard = document.createElement('div');
        artCard.className = 'companheiro-arts-art-card';
        artCard.dataset.artId = art.id;
        artCard.innerHTML = this.getArtCardTemplate(art);

        listContainer.appendChild(artCard);
        console.log('✅ Art renderizada no DOM:', art.name);

        // Atualizar contador de arts nos núcleos
        this.updateCoreArtsCount(art.coreId);
        
        // ✅ NOVO: Atualizar painel de stats em tempo real
        if (window.companheiroArtsSystem) {
            setTimeout(() => window.companheiroArtsSystem.atualizarStatsPanel(), 100);
        }
    }

    /**
     * 🎨 TEMPLATE DE CARD DE ART - IDÊNTICO AO PRINCIPAL
     * Estrutura visual com imagem, header, tabela de atributos, descrição e botões
     */
    getArtCardTemplate(art) {
        const typeIcons = {
            'ofensiva': '⚔️',
            'defensiva': '🛡️',
            'estrategica': '🎯',
            'suporte': '💚',
            'controle': '🌀',
            'invocacao': '🔮',
            'transformacao': '🧬',
            'passiva': '🕶️',
            'racial': '👑'
        };

        const actionIcons = {
            'Imediata': '⚡',
            'imediata': '⚡',
            'Duradoura': '⏳',
            'duradoura': '⏳',
            'Sustentada': '♾️',
            'sustentada': '♾️'
        };

        // Mapa de cores para cada tipo de núcleo
        const coreTypeColors = {
            'ofensiva': { bg: 'rgba(231, 76, 60, 0.2)', text: '#e74c3c', icon: '⚔️' },
            'defensiva': { bg: 'rgba(52, 152, 219, 0.2)', text: '#3498db', icon: '🛡️' },
            'estrategica': { bg: 'rgba(155, 89, 182, 0.2)', text: '#9b59b6', icon: '🎯' },
            'suporte': { bg: 'rgba(46, 204, 113, 0.2)', text: '#2ecc71', icon: '💚' },
            'controle': { bg: 'rgba(241, 196, 15, 0.2)', text: '#f39c12', icon: '🌀' },
            'invocacao': { bg: 'rgba(155, 89, 182, 0.2)', text: '#9b59b6', icon: '🔮' },
            'transformacao': { bg: 'rgba(41, 128, 185, 0.2)', text: '#2980b9', icon: '🧬' },
            'passiva': { bg: 'rgba(127, 140, 141, 0.2)', text: '#7f8c8d', icon: '🕶️' },
            'racial': { bg: 'rgba(241, 196, 15, 0.2)', text: '#f1c40f', icon: '👑' }
        };

        const typeIcon = typeIcons[art.type] || '❓';
        const actionIcon = actionIcons[art.action] || '⚡';
        const imageUrl = art.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Crect fill=%22%232a1810%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2260%22 y=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23d4a574%22 font-size=%2240%22%3E🎴%3C/text%3E%3C/svg%3E';

        // Buscar núcleo para pegar nome e tipo
        let coreName = art.coreId || 'Sem Núcleo';
        let coreType = 'ofensiva';
        if (window.companheiroArtsRenderer && window.companheiroArtsRenderer.cores) {
            const core = window.companheiroArtsRenderer.cores.find(c => c.id === art.coreId);
            if (core) {
                coreName = core.name;
                coreType = core.type || 'ofensiva';
            }
        }

        const coreColor = coreTypeColors[coreType] || coreTypeColors['ofensiva'];

        return `
    <div class="art-card-horizontal" data-art-id="${art.id}" style="
      background: linear-gradient(135deg, #0a0e14 0%, #13171f 100%);
      border: 2px solid rgba(216, 180, 254, 0.5);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
    ">
      <!-- SEÇÃO 1: HEADER COM IMAGEM E TÍTULO -->
      <div style="
        display: flex;
        gap: 16px;
        padding: 16px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <!-- IMAGEM 120x120 -->
        <div style="
          width: 120px;
          height: 120px;
          min-width: 120px;
          border-radius: 6px;
          background: rgba(0,0,0,0.4);
          border: 2px solid rgba(216, 180, 254, 0.4);
          overflow: hidden;
        ">
          <img src="${imageUrl}" alt="${art.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <!-- INFORMAÇÕES DO HEADER -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <!-- TÍTULO -->
          <div>
            <h3 style="margin: 0; color: #d8b4fe; font-size: 1.2em; font-weight: bold;">
              ${art.name}
            </h3>
          </div>
          <!-- NÚCLEO | TIPO | AÇÃO | DOMÍNIO -->
          <div style="
            display: flex;
            gap: 8px;
            font-size: 0.85em;
            color: #b0b8c1;
            flex-wrap: wrap;
            align-items: center;
          ">
            <span style="
              background: ${coreColor.bg};
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
              color: ${coreColor.text};
            ">
              ${coreColor.icon} ${coreName}
            </span>
            <span style="
              background: rgba(216, 180, 254, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
            ">
              ${typeIcon} ${art.type || 'sem-tipo'}
            </span>
            <span style="
              background: rgba(243, 156, 18, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
            ">
              ${actionIcon} ${art.action || '-'}
            </span>
            <span style="
              background: rgba(156, 39, 176, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
              color: #d8b3e6;
            ">
              🔮 Dominio: ${String(art.domain || 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: TABELA COM ATRIBUTOS -->
      <div style="
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: rgba(216, 180, 254, 0.15);
        padding: 1px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <!-- RECARGA -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Recarga</div>
          <div style="color: #e0e0e0; font-weight: bold;">${art.reload || '0'}</div>
        </div>
        <!-- AÇÃO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Ação</div>
          <div style="color: #e0e0e0; font-weight: bold;">${art.action || '-'}</div>
        </div>
        <!-- DURAÇÃO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Duração</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${art.duration || '-'}</div>
        </div>
        <!-- ALCANCE -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alcance</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${art.range || '-'}</div>
        </div>
        <!-- ALVOS -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alvos</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${art.targets || '-'}</div>
        </div>
        <!-- CUSTO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #9b59b6; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Custo</div>
          <div style="color: #9b59b6; font-weight: bold;">${art.cost || '0'}</div>
        </div>
        <!-- DANO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #e74c3c; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Dano</div>
          <div style="color: #e74c3c; font-weight: bold;">${art.damage || '-'}</div>
        </div>
      </div>

      <!-- SEÇÃO 3: DESCRIÇÃO -->
      <div style="
        padding: 16px 20px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <h5 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 0.85em; font-weight: bold; text-transform: uppercase;">DESCRIÇÃO:</h5>
        <p style="
          margin: 0;
          color: #b0b8c1;
          font-size: clamp(0.75em, 2vw, 0.95em);
          line-height: 1.6;
          word-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">
          ${art.description || 'Sem descrição'}
        </p>
      </div>

      <!-- SEÇÃO 4: BOTÕES DE AÇÃO -->
      <div style="
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        justify-content: space-around;
      ">
        <button class="arts-btn arts-btn-tiny" data-action="view-art" data-id="${art.id}" style="
          flex: 1;
          padding: 10px 12px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.9em;
        ">🔍 Ver</button>
        <button class="arts-btn arts-btn-tiny" data-action="edit-art" data-id="${art.id}" style="
          flex: 1;
          padding: 10px 12px;
          background: #f39c12;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.9em;
        ">✏️ Editar</button>
        <button class="arts-btn arts-btn-tiny" data-action="delete-art" data-id="${art.id}" style="
          flex: 1;
          padding: 10px 12px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.9em;
        ">🗑️ Remover</button>
      </div>
    </div>
  `;
    }

    /**
     * Conta quantas arts estão atreladas a um núcleo específico
     */
    countArtsByCore(coreId) {
        return this.arts.filter(art => art.coreId === coreId).length;
    }

    /**
     * Atualiza o contador de arts no card do núcleo
     */
    updateCoreArtsCount(coreId) {
        const coreCard = document.querySelector(`[data-core-id="${coreId}"]`);
        if (!coreCard) return;

        const artsCount = this.countArtsByCore(coreId);
        const countBadge = coreCard.querySelector('div[style*="position: absolute"]');
        
        if (countBadge) {
            countBadge.textContent = `📜 ${artsCount} art(s)`;
        }
    }

    /**
     * Remove uma art da lista
     */
    removeArtFromList(artId) {
        // Remover do array
        const artIndex = this.arts.findIndex(a => a.id === artId);
        if (artIndex !== -1) {
            const removedArt = this.arts[artIndex];
            this.arts.splice(artIndex, 1);
            
            // ✅ NOVO: Deletar art da estrutura do companheiro
            if (window.companheiroArtsPersistence) {
                window.companheiroArtsPersistence.deletarArtDoCompanheiro(artId);
            }
            
            // Atualizar contador do núcleo
            if (removedArt.coreId) {
                this.updateCoreArtsCount(removedArt.coreId);
            }
        }

        // Remover do DOM
        const artCard = document.querySelector(`[data-art-id="${artId}"]`);
        if (artCard) {
            artCard.remove();
        }

        // Se não houver mais arts, mostrar mensagem vazia
        const artsList = document.getElementById('companheiro-arts-arts-list');
        if (artsList && artsList.children.length === 0) {
            artsList.innerHTML = '<p class="empty-message">Nenhuma habilidade adicionada</p>';
        }
        
        // ✅ NOVO: Atualizar painel de stats em tempo real
        if (window.companheiroArtsSystem) {
            setTimeout(() => window.companheiroArtsSystem.atualizarStatsPanel(), 100);
        }
    }
}

// ============ INICIALIZAÇÃO ============
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.companheiroArtsRenderer = new CompanheiroArtsRenderer();
        window.companheiroArtsRenderer.injectCoreCardStyles();
        console.log('✅ CompanheiroArtsRenderer inicializado');
    });
} else {
    window.companheiroArtsRenderer = new CompanheiroArtsRenderer();
    window.companheiroArtsRenderer.injectCoreCardStyles();
}

