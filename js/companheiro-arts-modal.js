/**
 * 🎯 GERENCIADOR MODAL DE NÚCLEO DO COMPANHEIRO
 * Cria e edita núcleos (cores) para arts/habilidades do companheiro
 * Funcionalidade idêntica à aba de Habilidades principal
 */

class CompanheiroArtsModalManager {
    constructor() {
        this.modalId = 'companheiro-arts-modal-overlay';
        this.modalId_Main = 'companheiro-arts-modal';
        this.currentCompanheiro = null;
        this.editingCoreId = null;
        this.inicializar();
    }

    inicializar() {
        console.log('🎯 [CompanheiroArtsModalManager] Inicializando...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        console.log('🎯 [CompanheiroArtsModalManager] Configurando event listeners...');
        
        // ✅ Botão para criar núcleo
        const createCoreBtn = document.getElementById('companheiro-arts-btn-create-core');
        if (createCoreBtn) {
            createCoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Botão criar núcleo clicado');
                this.showModalCreateCore();
            });
        }

        // ✅ Botão para criar art
        const createArtBtn = document.getElementById('companheiro-arts-btn-create-art');
        if (createArtBtn) {
            createArtBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('✨ Botão criar art clicado');
                this.showModalCreateArt();
            });
        }

        // ✅ Listeners delegados para os botões de ação dos cards (Ver, Editar, Remover)
        const coresList = document.getElementById('companheiro-arts-cores-list');
        if (coresList) {
            // Remove listeners antigos se existirem
            coresList.replaceWith(coresList.cloneNode(true));
            const newCoresList = document.getElementById('companheiro-arts-cores-list');
            
            newCoresList.addEventListener('click', (e) => {
                const button = e.target.closest('button[data-action]');
                if (!button) return;

                e.preventDefault();
                e.stopPropagation();
                
                const action = button.dataset.action;
                const coreId = button.dataset.id;

                if (action === 'view-core' && coreId) {
                    console.log('🔍 Ver núcleo:', coreId);
                    this.showModalViewCore(coreId);
                } else if (action === 'edit-core' && coreId) {
                    console.log('✏️ Editar núcleo:', coreId);
                    this.showModalEditCore(coreId);
                } else if (action === 'delete-core' && coreId) {
                    console.log('🗑️ Deletar núcleo:', coreId);
                    this.deleteCore(coreId);
                }
            });
        }

        // Botão de fechar modal
        const closeBtn = document.getElementById('companheiro-arts-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Botão cancelar
        const cancelBtn = document.getElementById('companheiro-arts-modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // ✅ NOVO: Listener para tecla ESC - fecha o modal aberto
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const overlay = document.getElementById(this.modalId);
                if (overlay && overlay.style.display === 'flex') {
                    this.closeModal();
                }
            }
        });

        // ⚠️ NÃO adicionar listener ao botão confirmar aqui!
        // Cada modal (criar, editar, visualizar) vai configurar seu próprio listener
        // via setConfirmButtonAction() na respectiva função show*()

        // ✅ Filtro por nome de núcleo
        const filterInput = document.getElementById('companheiro-arts-filter-cores');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.filterCores(e.target.value, null);
            });
        }

        // ✅ Filtro por tipo de núcleo
        const filterTypeSelect = document.getElementById('companheiro-arts-filter-type-cores');
        if (filterTypeSelect) {
            filterTypeSelect.addEventListener('change', (e) => {
                const filterInput = document.getElementById('companheiro-arts-filter-cores');
                const searchTerm = filterInput ? filterInput.value : '';
                this.filterCores(searchTerm, e.target.value);
            });
        }

        // ✅ Listeners delegados para os botões de ação dos cards de arts (Ver, Editar, Remover)
        const artsList = document.getElementById('companheiro-arts-arts-list');
        if (artsList) {
            // Remove listeners antigos se existirem
            artsList.replaceWith(artsList.cloneNode(true));
            const newArtsList = document.getElementById('companheiro-arts-arts-list');
            
            newArtsList.addEventListener('click', (e) => {
                const button = e.target.closest('button[data-action]');
                if (!button) return;

                e.preventDefault();
                e.stopPropagation();
                
                const action = button.dataset.action;
                const artId = button.dataset.id;

                if (action === 'view-art' && artId) {
                    console.log('🔍 Ver art:', artId);
                    this.showModalViewArt(artId);
                } else if (action === 'edit-art' && artId) {
                    console.log('✏️ Editar art:', artId);
                    this.showModalEditArt(artId);
                } else if (action === 'delete-art' && artId) {
                    console.log('🗑️ Deletar art:', artId);
                    if (window.companheiroArtsRenderer) {
                        window.companheiroArtsRenderer.removeArtFromList(artId);
                    }
                }
            });
        }

        // ✅ Filtro por nome de art
        const filterArtsInput = document.getElementById('companheiro-arts-filter-arts');
        if (filterArtsInput) {
            filterArtsInput.addEventListener('input', (e) => {
                this.filterArts(e.target.value, null);
            });
        }

        // ✅ Filtro por tipo de art
        const filterTypeArtsSelect = document.getElementById('companheiro-arts-filter-type-arts');
        if (filterTypeArtsSelect) {
            filterTypeArtsSelect.addEventListener('change', (e) => {
                const filterInput = document.getElementById('companheiro-arts-filter-arts');
                const searchTerm = filterInput ? filterInput.value : '';
                this.filterArts(searchTerm, e.target.value);
            });
        }

        // ✅ Botão para criar variante
        const createVarianteBtn = document.getElementById('companheiro-arts-btn-create-variante');
        if (createVarianteBtn) {
            createVarianteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🌟 Botão criar variante clicado');
                this.showModalCreateVariante();
            });
        }

        // ✅ Listeners delegados para os botões de ação dos cards de variantes (Ver, Editar, Remover)
        const variantesList = document.getElementById('companheiro-arts-variantes-list');
        if (variantesList) {
            // Remove listeners antigos se existirem
            variantesList.replaceWith(variantesList.cloneNode(true));
            const newVariantesList = document.getElementById('companheiro-arts-variantes-list');
            
            newVariantesList.addEventListener('click', (e) => {
                const button = e.target.closest('button[data-action]');
                if (!button) return;

                e.preventDefault();
                e.stopPropagation();
                
                const action = button.dataset.action;
                const varianteId = button.dataset.id;
                const artId = button.dataset.artId;

                if (action === 'view-variante' && varianteId && artId) {
                    console.log('🔍 Ver variante:', varianteId);
                    this.showModalViewVariante(artId, varianteId);
                } else if (action === 'edit-variante' && varianteId && artId) {
                    console.log('✏️ Editar variante:', varianteId);
                    this.showModalEditVariante(artId, varianteId);
                } else if (action === 'delete-variante' && varianteId && artId) {
                    console.log('🗑️ Deletar variante:', varianteId);
                    this.deleteVariante(artId, varianteId);
                }
            });
        }

        // ✅ Filtro por nome de variante
        const filterVariantesInput = document.getElementById('companheiro-arts-filter-variantes');
        if (filterVariantesInput) {
            filterVariantesInput.addEventListener('input', (e) => {
                this.filterVariantes(e.target.value, null);
            });
        }

        // ✅ Filtro por tipo de variante
        const filterTypeVariantesSelect = document.getElementById('companheiro-arts-filter-type-variantes');
        if (filterTypeVariantesSelect) {
            filterTypeVariantesSelect.addEventListener('change', (e) => {
                const filterInput = document.getElementById('companheiro-arts-filter-variantes');
                const searchTerm = filterInput ? filterInput.value : '';
                this.filterVariantes(searchTerm, e.target.value);
            });
        }

        // ✅ NOVO: Carregar dados persistidos ao inicializar
        // Garante que variantes apareçam mesmo após F5
        if (window.companheiroArtsSystem) {
            console.log('🔄 [setupEventListeners] Carregando dados persistidos na inicialização...');
            window.companheiroArtsSystem.carregarDadosPersistidos();
        }

        console.log('✅ [CompanheiroArtsModalManager] Event listeners configurados');
    }

    /**
     * Abre modal para criar novo núcleo
     */
    showModalCreateCore() {
        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');

        if (!body || !title) {
            console.warn('⚠️ Modal elements not found');
            return;
        }

        this.editingCoreId = null;
        title.textContent = '✨ Criar Novo Núcleo';

        body.innerHTML = `
            <div class="companheiro-core-modal-container">
                <!-- COLUNA ESQUERDA - IMAGEM -->
                <div class="companheiro-core-modal-section companheiro-core-modal-image-section">
                    <h3 class="companheiro-core-modal-section-title">📸 IMAGEM</h3>
                    <div class="companheiro-core-image-preview" id="companheiro-core-image-preview">
                        <div class="companheiro-preview-placeholder">
                            <span class="companheiro-preview-icon">🎨</span>
                            <p>Nenhuma imagem selecionada</p>
                        </div>
                    </div>
                    <div class="companheiro-core-image-controls">
                        <button type="button" class="companheiro-arts-btn companheiro-arts-btn-primary" id="companheiro-core-upload-btn">UPLOAD</button>
                        <button type="button" class="companheiro-arts-btn companheiro-arts-btn-secondary" id="companheiro-core-url-btn">URL</button>
                        <input type="file" id="companheiro-core-file-input" accept="image/*" style="display: none;">
                        <input type="text" id="companheiro-core-image-url" placeholder="https://exemplo.com/imagem.jpg" style="display: none;">
                    </div>
                    <div class="companheiro-core-image-note">
                        <p style="margin: 0; font-size: 0.75rem; color: #999;">💡 Clique ou arraste uma imagem</p>
                    </div>
                </div>

                <!-- COLUNA DIREITA - INFORMAÇÕES -->
                <div class="companheiro-core-modal-section companheiro-core-modal-info-section">
                    <h3 class="companheiro-core-modal-section-title">📋 INFORMAÇÕES</h3>
                    <form class="companheiro-core-form">
                        <div class="companheiro-core-form-group">
                            <label>NOME *</label>
                            <input type="text" id="form-companheiro-core-name" required placeholder="Ex: Essência Flamejante">
                        </div>
                        <div class="companheiro-core-form-group">
                            <label>TIPO *</label>
                            <select id="form-companheiro-core-type" required>
                                <option value="">Selecione um tipo...</option>
                                <option value="ofensiva">⚔️ Ofensiva</option>
                                <option value="defensiva">🛡️ Defensiva</option>
                                <option value="estrategica">🎯 Estratégica</option>
                                <option value="suporte">💚 Suporte</option>
                                <option value="controle">🌀 Controle</option>
                                <option value="invocacao">🔮 Invocação</option>
                                <option value="transformacao">🧬 Transformação</option>
                                <option value="passiva">🕶️ Passiva</option>
                                <option value="racial">👑 Racial</option>
                            </select>
                        </div>
                        <div class="companheiro-core-form-group">
                            <label>BÔNUS (OPCIONAL)</label>
                            <input type="text" id="form-companheiro-core-bonus" placeholder="Ex: +2 Force">
                        </div>
                        <div class="companheiro-core-form-group">
                            <label>✨ ESSÊNCIA</label>
                            <textarea id="form-companheiro-core-description" placeholder="Texto descritivo do núcleo, explicando sua natureza, origem ou conceito narrativo..."></textarea>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Setup dos eventos de imagem
        this.setupImageUpload();

        // ✅ RECONFIGURAR HANDLER DO BOTÃO CONFIRMAR
        this.setConfirmButtonAction(async () => {
            console.log('🔘 [showModalCreateCore] Botão confirmar clicado, chamando saveCore()');
            await this.saveCore();
        }, '✨ Criar Núcleo');

        // Mostrar modal
        this.openModal();
    }

    /**
     * Configura eventos de upload de imagem
     */
    setupImageUpload() {
        const fileInput = document.getElementById('companheiro-core-file-input');
        const uploadBtn = document.getElementById('companheiro-core-upload-btn');
        const urlBtn = document.getElementById('companheiro-core-url-btn');
        const urlInput = document.getElementById('companheiro-core-image-url');
        const preview = document.getElementById('companheiro-core-image-preview');

        if (!fileInput || !uploadBtn || !preview) return;

        // Clique no botão upload abre file input
        uploadBtn.addEventListener('click', () => fileInput.click());

        // Quando arquivo é selecionado
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`;
                    delete preview.dataset.imageUrl;
                    preview.dataset.imageData = event.target.result;
                    console.log('✅ Imagem do upload definida');
                };
                reader.readAsDataURL(file);
            }
        });

        // Alternar entre upload e URL
        if (urlBtn) {
            urlBtn.addEventListener('click', () => {
                if (urlInput && urlInput.style.display === 'none') {
                    urlInput.style.display = 'block';
                    uploadBtn.textContent = 'VISUALIZAR';
                    delete preview.dataset.imageData;
                } else {
                    if (urlInput) urlInput.style.display = 'none';
                    uploadBtn.textContent = 'UPLOAD';
                }
            });
        }

        // Atualizar preview enquanto digita URL
        if (urlInput) {
            let urlTimeout;
            urlInput.addEventListener('input', () => {
                clearTimeout(urlTimeout);
                urlTimeout = setTimeout(() => {
                    const url = urlInput.value.trim();
                    if (url) {
                        preview.innerHTML = `<img src="${url}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" onerror="this.parentElement.innerHTML='<div class=\\'companheiro-preview-placeholder\\'><span class=\\'companheiro-preview-icon\\'>⚠️</span><p>Erro ao carregar imagem</p></div>';">`;
                        preview.dataset.imageUrl = url;
                        console.log('✅ Preview de URL atualizada:', url);
                    }
                }, 800);
            });

            urlInput.addEventListener('blur', () => {
                clearTimeout(urlTimeout);
                const url = urlInput.value.trim();
                if (url) {
                    preview.innerHTML = `<img src="${url}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" onerror="this.parentElement.innerHTML='<div class=\\'companheiro-preview-placeholder\\'><span class=\\'companheiro-preview-icon\\'>⚠️</span><p>Erro ao carregar imagem</p></div>';">`;
                    preview.dataset.imageUrl = url;
                }
            });
        }
    }

    /**
     * Salva o núcleo criado
     */
    async saveCore() {
        console.log('='.repeat(60));
        console.log('🔍 [saveCore] Iniciando salvamento de núcleo');
        console.log('='.repeat(60));
        
        // DEBUG: Verificar se o body existe e tem conteúdo
        const body = document.getElementById('companheiro-arts-modal-body');
        console.log('📍 [saveCore] Modal body encontrado:', !!body);
        if (body) {
            console.log('📍 [saveCore] Conteúdo do body:', body.innerHTML.substring(0, 200));
        }
        
        const nameInput = document.getElementById('form-companheiro-core-name');
        const typeInput = document.getElementById('form-companheiro-core-type');
        const bonusInput = document.getElementById('form-companheiro-core-bonus');
        const descInput = document.getElementById('form-companheiro-core-description');
        
        console.log('🔎 [saveCore] Elementos encontrados:', {
            nameInput_element: !!nameInput,
            typeInput_element: !!typeInput,
            bonusInput_element: !!bonusInput,
            descInput_element: !!descInput
        });
        
        const name = nameInput?.value?.trim() || '';
        const type = typeInput?.value || '';
        const bonus = bonusInput?.value?.trim() || '';
        const description = descInput?.value?.trim() || '';
        
        console.log('📝 [saveCore] Valores coletados:', {
            name: name,
            name_length: name.length,
            name_is_empty: name === '',
            type: type,
            bonus: bonus,
            description: description
        });

        // ✅ NOVO: Validação básica
        if (!name || name === '') {
            console.warn('❌ [saveCore] Nome do núcleo vazio ou não encontrado, rejeitando');
            console.warn('  - nameInput:', nameInput);
            console.warn('  - nameInput.value:', nameInput?.value);
            console.warn('  - name (after trim):', name);
            alert('⚠️ Por favor, insira um nome para o núcleo');
            return;
        }

        // Sem validação - criar livremente
        const preview = document.getElementById('companheiro-core-image-preview');
        const urlInput = document.getElementById('companheiro-core-image-url');
        const urlFromInput = urlInput?.value?.trim() || null;
        let imageData = preview?.dataset.imageData || preview?.dataset.imageUrl || urlFromInput || null;

        // 🔥 COMPRIMIR IMAGEM DO NÚCLEO ANTES DE SALVAR
        if (imageData?.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
            console.log('📦 Comprimindo imagem do núcleo...');
            imageData = await ImageCompressor.compressImage(imageData, 'core');
        }

        // Criar objeto do núcleo
        const newCore = {
            id: `core_${Date.now()}`,
            name: name,
            concept: type || 'sem-tipo',
            visualForm: bonus || '',
            description: description || '',
            image: imageData,
            createdAt: new Date().toISOString()
        };

        console.log('✅ [saveCore] Núcleo criado:', newCore);
        console.log('='.repeat(60));

        // Disparar evento customizado para que o gerenciador de companheiro capture
        window.dispatchEvent(new CustomEvent('companheiroCreateCore', {
            detail: { core: newCore }
        }));

        // Fechar modal
        this.closeModal();
    }

    /**
     * Abre o modal
     */
    openModal() {
        const overlay = document.getElementById(this.modalId);
        if (overlay) {
            overlay.style.display = 'flex';
            console.log('✅ Modal aberto');
        }
        
        // 🔄 Reconfigure os listeners dos filtros SEMPRE que o modal abre
        this.configureFilterListeners();
    }

    /**
     * 🔄 Reconfigurar listeners dos filtros
     * Garante que os filtros funcionem mesmo após eventos de clonagem
     */
    configureFilterListeners() {
        // ✅ Filtro por nome de núcleo
        const filterInput = document.getElementById('companheiro-arts-filter-cores');
        if (filterInput) {
            // Remover listeners antigos
            filterInput.replaceWith(filterInput.cloneNode(true));
            const newFilterInput = document.getElementById('companheiro-arts-filter-cores');
            newFilterInput.addEventListener('input', (e) => {
                this.filterCores(e.target.value, null);
            });
        }

        // ✅ Filtro por tipo de núcleo
        const filterTypeSelect = document.getElementById('companheiro-arts-filter-type-cores');
        if (filterTypeSelect) {
            filterTypeSelect.replaceWith(filterTypeSelect.cloneNode(true));
            const newFilterTypeSelect = document.getElementById('companheiro-arts-filter-type-cores');
            newFilterTypeSelect.addEventListener('change', (e) => {
                const filterInput = document.getElementById('companheiro-arts-filter-cores');
                const searchTerm = filterInput ? filterInput.value : '';
                this.filterCores(searchTerm, e.target.value);
            });
        }

        // ✅ Filtro por nome de art
        const filterArtsInput = document.getElementById('companheiro-arts-filter-arts');
        if (filterArtsInput) {
            filterArtsInput.replaceWith(filterArtsInput.cloneNode(true));
            const newFilterArtsInput = document.getElementById('companheiro-arts-filter-arts');
            newFilterArtsInput.addEventListener('input', (e) => {
                this.filterArts(e.target.value, null);
            });
        }

        // ✅ Filtro por tipo de art
        const filterTypeArtsSelect = document.getElementById('companheiro-arts-filter-type-arts');
        if (filterTypeArtsSelect) {
            filterTypeArtsSelect.replaceWith(filterTypeArtsSelect.cloneNode(true));
            const newFilterTypeArtsSelect = document.getElementById('companheiro-arts-filter-type-arts');
            newFilterTypeArtsSelect.addEventListener('change', (e) => {
                const filterInput = document.getElementById('companheiro-arts-filter-arts');
                const searchTerm = filterInput ? filterInput.value : '';
                this.filterArts(searchTerm, e.target.value);
            });
        }

        // ✅ Filtro por nome de variante
        const filterVariantesInput = document.getElementById('companheiro-arts-filter-variantes');
        if (filterVariantesInput) {
            filterVariantesInput.replaceWith(filterVariantesInput.cloneNode(true));
            const newFilterVariantesInput = document.getElementById('companheiro-arts-filter-variantes');
            newFilterVariantesInput.addEventListener('input', (e) => {
                this.filterVariantes(e.target.value, null);
            });
        }

        // ✅ Filtro por tipo de variante
        const filterTypeVariantesSelect = document.getElementById('companheiro-arts-filter-type-variantes');
        if (filterTypeVariantesSelect) {
            filterTypeVariantesSelect.replaceWith(filterTypeVariantesSelect.cloneNode(true));
            const newFilterTypeVariantesSelect = document.getElementById('companheiro-arts-filter-type-variantes');
            newFilterTypeVariantesSelect.addEventListener('change', (e) => {
                const filterInput = document.getElementById('companheiro-arts-filter-variantes');
                const searchTerm = filterInput ? filterInput.value : '';
                this.filterVariantes(searchTerm, e.target.value);
            });
        }
    }

    /**
     * Fecha o modal
     */
    closeModal() {
        const overlay = document.getElementById(this.modalId);
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ Modal fechado');
        }
    }

    /**
     * Helper - Configurar botão confirmar com listener específico
     */
    setConfirmButtonAction(callback, buttonText) {
        const confirmBtn = document.getElementById('companheiro-arts-modal-confirm');
        if (!confirmBtn) return;

        // Clonar para remover listeners antigos
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Definir texto
        if (buttonText) newConfirmBtn.textContent = buttonText;

        // Adicionar novo listener
        newConfirmBtn.addEventListener('click', callback);
    }

    /**
     * VER - Visualizar núcleo
     */
    showModalViewCore(coreId) {
        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');
        
        if (!body || !title) {
            console.warn('⚠️ Modal elements not found');
            return;
        }

        // Buscar núcleo no localStorage ou em dados em memória
        let core = null;
        if (window.companheiroArtsRenderer && window.companheiroArtsRenderer.cores) {
            core = window.companheiroArtsRenderer.cores.find(c => c.id === coreId);
        }
        
        if (!core) {
            // Aviso suprimido para manter console limpo
            alert('Núcleo não encontrado');
            return;
        }

        title.textContent = '🔍 Visualizar Núcleo';
        body.innerHTML = `
            <div class="companheiro-core-view-section">
                <div class="companheiro-core-view-image">
                    ${core.image ? `<img src="${core.image}" alt="${core.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : '<div style="width: 100%; height: 300px; background: rgba(216, 180, 254, 0.1); border: 2px dashed rgba(216, 180, 254, 0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(216, 180, 254, 0.5);"><span style="font-size: 3rem;">🎨</span></div>'}
                </div>
                <div class="companheiro-core-view-info">
                    <h3 style="margin: 0 0 1rem 0; color: #d8b4fe; font-size: 1.5rem;">${core.name}</h3>
                    <div class="companheiro-core-info-row">
                        <span style="color: #999;"><strong>Tipo:</strong></span>
                        <span style="color: #e0e0e0;">${core.concept || 'Não definido'}</span>
                    </div>
                    <div class="companheiro-core-info-row">
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

        const cancelBtn = document.getElementById('companheiro-arts-modal-cancel');
        
        if (cancelBtn) {
            cancelBtn.textContent = 'Fechar';
            cancelBtn.onclick = null;
        }

        this.setConfirmButtonAction(() => {
            this.showModalEditCore(coreId);
        }, '✏️ Editar');

        this.openModal();
    }

    /**
     * EDITAR - Editar núcleo
     */
    showModalEditCore(coreId) {
        let core = null;
        if (window.companheiroArtsRenderer && window.companheiroArtsRenderer.cores) {
            core = window.companheiroArtsRenderer.cores.find(c => c.id === coreId);
        }
        
        if (!core) {
            // Aviso suprimido para manter console limpo
            alert('Núcleo não encontrado');
            return;
        }

        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');

        this.editingCoreId = coreId;
        title.textContent = '✏️ Editar Núcleo';

        body.innerHTML = `
            <div class="companheiro-core-modal-container">
                <!-- COLUNA ESQUERDA - IMAGEM -->
                <div class="companheiro-core-modal-section companheiro-core-modal-image-section">
                    <h3 class="companheiro-core-modal-section-title">📸 IMAGEM</h3>
                    <div class="companheiro-core-image-preview" id="companheiro-core-image-preview">
                        ${core.image ? `<img src="${core.image}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : '<div class="companheiro-preview-placeholder"><span class="companheiro-preview-icon">🎨</span><p>Nenhuma imagem selecionada</p></div>'}
                    </div>
                    <div class="companheiro-core-image-controls">
                        <button type="button" class="companheiro-arts-btn companheiro-arts-btn-primary" id="companheiro-core-upload-btn">UPLOAD</button>
                        <button type="button" class="companheiro-arts-btn companheiro-arts-btn-secondary" id="companheiro-core-url-btn">URL</button>
                        <input type="file" id="companheiro-core-file-input" accept="image/*" style="display: none;">
                        <input type="text" id="companheiro-core-image-url" placeholder="https://exemplo.com/imagem.jpg" style="display: none;" value="${core.image && !core.image.startsWith('data:') ? core.image : ''}">
                    </div>
                    <div class="companheiro-core-image-note">
                        <p style="margin: 0; font-size: 0.75rem; color: #999;">💡 Clique ou arraste uma imagem</p>
                    </div>
                </div>

                <!-- COLUNA DIREITA - INFORMAÇÕES -->
                <div class="companheiro-core-modal-section companheiro-core-modal-info-section">
                    <h3 class="companheiro-core-modal-section-title">📋 INFORMAÇÕES</h3>
                    <form class="companheiro-core-form">
                        <div class="companheiro-core-form-group">
                            <label>NOME *</label>
                            <input type="text" id="form-companheiro-core-name" value="${core.name}" required>
                        </div>
                        <div class="companheiro-core-form-group">
                            <label>TIPO *</label>
                            <select id="form-companheiro-core-type" required>
                                <option value="">Selecione um tipo...</option>
                                <option value="ofensiva" ${core.concept === 'ofensiva' ? 'selected' : ''}>⚔️ Ofensiva</option>
                                <option value="defensiva" ${core.concept === 'defensiva' ? 'selected' : ''}>🛡️ Defensiva</option>
                                <option value="estrategica" ${core.concept === 'estrategica' ? 'selected' : ''}>🎯 Estratégica</option>
                                <option value="suporte" ${core.concept === 'suporte' ? 'selected' : ''}>💚 Suporte</option>
                                <option value="controle" ${core.concept === 'controle' ? 'selected' : ''}>🌀 Controle</option>
                                <option value="invocacao" ${core.concept === 'invocacao' ? 'selected' : ''}>🔮 Invocação</option>
                                <option value="transformacao" ${core.concept === 'transformacao' ? 'selected' : ''}>🧬 Transformação</option>
                                <option value="passiva" ${core.concept === 'passiva' ? 'selected' : ''}>🕶️ Passiva</option>
                                <option value="racial" ${core.concept === 'racial' ? 'selected' : ''}>👑 Racial</option>
                            </select>
                        </div>
                        <div class="companheiro-core-form-group">
                            <label>BÔNUS (OPCIONAL)</label>
                            <input type="text" id="form-companheiro-core-bonus" value="${core.visualForm || ''}" placeholder="Ex: +2 Force">
                        </div>
                        <div class="companheiro-core-form-group">
                            <label>✨ ESSÊNCIA</label>
                            <textarea id="form-companheiro-core-description" placeholder="Texto descritivo do núcleo...">${core.description || ''}</textarea>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Setup dos eventos de imagem
        this.setupImageUpload();

        // Atualizar botões do modal
        const cancelBtn = document.getElementById('companheiro-arts-modal-cancel');
        
        if (cancelBtn) {
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.onclick = null;
        }

        this.setConfirmButtonAction(async () => {
            console.log('💾 Botão salvar clicado, coreId:', coreId);
            await this.updateCore(coreId);
        }, '💾 Salvar');

        this.openModal();
    }

    /**
     * ATUALIZAR - Salvar edições do núcleo
     */
    async updateCore(coreId) {
        console.log('='.repeat(60));
        console.log('🔍 [updateCore] Iniciando atualização de núcleo');
        console.log('='.repeat(60));
        
        const nameInput = document.getElementById('form-companheiro-core-name');
        const typeInput = document.getElementById('form-companheiro-core-type');
        const bonusInput = document.getElementById('form-companheiro-core-bonus');
        const descInput = document.getElementById('form-companheiro-core-description');
        
        console.log('🔎 [updateCore] Elementos encontrados:', {
            nameInput_element: !!nameInput,
            typeInput_element: !!typeInput,
            bonusInput_element: !!bonusInput,
            descInput_element: !!descInput,
            coreId: coreId
        });
        
        const name = nameInput?.value?.trim() || '';
        const type = typeInput?.value || '';
        const bonus = bonusInput?.value?.trim() || '';
        const description = descInput?.value?.trim() || '';
        
        console.log('📝 [updateCore] Valores coletados:', {
            name: name,
            name_length: name.length,
            name_is_empty: name === '',
            type: type,
            bonus: bonus,
            description: description
        });

        // ✅ NOVO: Validação básica
        if (!name || name === '') {
            console.warn('❌ [updateCore] Nome do núcleo vazio, rejeitando');
            console.warn('  - nameInput:', nameInput);
            console.warn('  - nameInput.value:', nameInput?.value);
            alert('⚠️ Por favor, insira um nome para o núcleo');
            return;
        }

        // Sem validação - atualizar livremente
        const preview = document.getElementById('companheiro-core-image-preview');
        const urlInput = document.getElementById('companheiro-core-image-url');
        const urlFromInput = urlInput?.value?.trim() || null;
        let imageData = preview?.dataset.imageData || preview?.dataset.imageUrl || urlFromInput || null;

        // 🔥 COMPRIMIR IMAGEM DO NÚCLEO ANTES DE SALVAR
        if (imageData?.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
            console.log('📦 Comprimindo imagem do núcleo para atualização...');
            imageData = await ImageCompressor.compressImage(imageData, 'core');
        }
        
        // Encontrar e atualizar núcleo
        if (window.companheiroArtsRenderer && window.companheiroArtsRenderer.cores) {
            const coreIndex = window.companheiroArtsRenderer.cores.findIndex(c => c.id === coreId);
            if (coreIndex !== -1) {
                const core = window.companheiroArtsRenderer.cores[coreIndex];
                
                // Atualizar campos
                core.name = name;
                core.concept = type || 'sem-tipo';
                core.visualForm = bonus || '';
                core.description = description || '';
                
                // Atualizar imagem apenas se houver nova imagem
                const urlFromInput = urlInput?.value.trim() || null;
                const newImageData = preview?.dataset.imageData || preview?.dataset.imageUrl || urlFromInput;
                if (newImageData) {
                    core.image = newImageData;
                }

                console.log('✅ [updateCore] Núcleo atualizado:', core);
                this.closeModal();
                
                // 🌟 ATUALIZAR BADGES DO NOME DO NÚCLEO NOS CARDS DE ARTS
                const artCards = document.querySelectorAll('[data-core-id]');
                artCards.forEach(card => {
                    // Procurar por badges que contêm o ícone do tipo do núcleo
                    const badges = card.querySelectorAll('span');
                    badges.forEach((badge, index) => {
                        // A primeira badge geralmente é a do núcleo
                        if (index === 0 && badge.textContent.includes(coreId) || badge.dataset.coreId === coreId) {
                            // Atualizar apenas se for um card de art (verificar se tem data-art-id)
                            const artId = card.dataset.artId;
                            if (artId) {
                                const art = window.companheiroArtsRenderer?.arts?.find(a => a.id === artId);
                                if (art && art.coreId === coreId) {
                                    // Renderizar o card novamente para atualizar a badge
                                    if (window.companheiroArtsRenderer?.getArtCardTemplate) {
                                        card.innerHTML = window.companheiroArtsRenderer.getArtCardTemplate(art);
                                    }
                                }
                            }
                        }
                    });
                });
                
                // Forma alternativa: procurar todos os cards que usam esse núcleo
                if (window.companheiroArtsRenderer?.arts) {
                    window.companheiroArtsRenderer.arts.forEach(art => {
                        if (art.coreId === coreId) {
                            const artCard = document.querySelector(`[data-art-id="${art.id}"]`);
                            if (artCard && window.companheiroArtsRenderer?.getArtCardTemplate) {
                                artCard.innerHTML = window.companheiroArtsRenderer.getArtCardTemplate(art);
                            }
                        }
                    });
                }
                
                // Disparar evento para re-renderizar
                window.dispatchEvent(new CustomEvent('companheiroUpdateCore', {
                    detail: { core: core }
                }));
            }
        }
    }

    /**
     * DELETAR - Remover núcleo
     */
    deleteCore(coreId) {
        if (confirm('Tem certeza que deseja remover este núcleo?')) {
            if (window.companheiroArtsRenderer && window.companheiroArtsRenderer.cores) {
                const coreIndex = window.companheiroArtsRenderer.cores.findIndex(c => c.id === coreId);
                if (coreIndex !== -1) {
                    const core = window.companheiroArtsRenderer.cores.splice(coreIndex, 1)[0];
                    console.log('🗑️ Núcleo removido:', core);
                    this.closeModal();
                    
                    // Disparar evento para re-renderizar
                    window.dispatchEvent(new CustomEvent('companheiroDeleteCore', {
                        detail: { coreId: coreId }
                    }));
                }
            }
        }
    }

    /**
     * Filtra núcleos por nome e tipo
     */
    filterCores(searchTerm, filterType) {
        console.log('🔍 [filterCores] Iniciando filtro:', { searchTerm, filterType });
        
        const list = document.getElementById('companheiro-arts-cores-list');
        if (!list) {
            // Sem aviso para manter console limpo
            return;
        }

        const cards = list.querySelectorAll('.companheiro-arts-core-card');
        console.log(`📊 [filterCores] Encontradas ${cards.length} cards`);
        
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach((card, index) => {
            const name = card.querySelector('.companheiro-arts-core-name')?.textContent.toLowerCase() || '';
            const typeElement = card.querySelector('.companheiro-arts-core-type-value')?.textContent.toLowerCase() || '';
            const essence = card.querySelector('.companheiro-arts-core-essence')?.textContent.toLowerCase() || '';
            
            console.log(`  Card ${index + 1}: name="${name}", type="${typeElement}", essence="${essence}"`);
            
            // Verificar se corresponde ao filtro de nome
            const matchesName = !term || name.includes(term) || typeElement.includes(term) || essence.includes(term);
            console.log(`  Card ${index + 1}: matchesName=${matchesName}`);
            
            // Verificar se corresponde ao filtro de tipo
            let matchesType = true;
            if (filterType && filterType !== '') {
                const normalizedType = filterType.toLowerCase();
                const normalizedCardType = typeElement.toLowerCase();
                matchesType = normalizedCardType.includes(normalizedType);
                console.log(`  Card ${index + 1}: matchesType=${matchesType} (filter="${normalizedType}", card="${normalizedCardType}")`);
            }
            
            // Mostrar card se atender aos dois filtros
            const shouldShow = matchesName && matchesType;
            console.log(`  Card ${index + 1}: shouldShow=${shouldShow}`);
            
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        console.log(`✅ [filterCores] ${visibleCount} cards visíveis`);

        // Mostrar mensagem se nenhum resultado
        let message = list.querySelector('.companheiro-arts-no-filter-results');
        
        if (visibleCount === 0 && (term || (filterType && filterType !== ''))) {
            if (!message) {
                message = document.createElement('p');
                message.className = 'companheiro-arts-no-filter-results';
                message.textContent = `Nenhum núcleo encontrado${term ? ` para "${searchTerm}"` : ''}${filterType ? ` do tipo "${filterType}"` : ''}`;
                message.style.cssText = 'color: #e74c3c; text-align: center; padding: 2rem; font-size: 0.95rem;';
                list.appendChild(message);
            }
        } else {
            if (message) message.remove();
        }
    }

    /**
     * 🔍 FILTRAR ARTS POR NOME E TIPO
     * Filtra as arts exibidas baseado em termo de busca e tipo
     */
    filterArts(searchTerm, filterType) {
        console.log('🔍 [filterArts] Iniciando filtro:', { searchTerm, filterType });
        
        const list = document.getElementById('companheiro-arts-arts-list');
        if (!list) {
            // Sem aviso para manter console limpo
            return;
        }

        // Procurar por ambas as classes possíveis
        const cards = list.querySelectorAll('[class*="art-card"]');
        console.log(`📊 [filterArts] Encontradas ${cards.length} cards`);
        
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach((card, index) => {
            // Extrair nome da art (está em h3 dentro da card)
            const nameElement = card.querySelector('h3');
            const name = (nameElement?.textContent || '').toLowerCase().trim();
            
            console.log(`  Card ${index + 1}: nome="${name}"`);
            
            // Extrair tipo (primeiro span com data-art-type ou procurar por padrão)
            let type = '';
            const spans = card.querySelectorAll('span');
            spans.forEach(span => {
                const text = span.textContent.toLowerCase();
                if (text.includes('⚔️') || text.includes('defensiva') || text.includes('estrategica') || 
                    text.includes('suporte') || text.includes('controle') || text.includes('invocacao') ||
                    text.includes('transformacao') || text.includes('passiva') || text.includes('racial') ||
                    text.includes('ofensiva')) {
                    type = text;
                }
            });
            
            console.log(`  Card ${index + 1}: tipo="${type}"`);
            
            // Verificar se corresponde ao filtro de nome
            const matchesName = !term || name.includes(term);
            console.log(`  Card ${index + 1}: matchesName=${matchesName} (term="${term}")`);
            
            // Verificar se corresponde ao filtro de tipo
            let matchesType = true;
            if (filterType && filterType !== '') {
                const normalizedType = filterType.toLowerCase().trim();
                matchesType = type.includes(normalizedType);
                console.log(`  Card ${index + 1}: matchesType=${matchesType} (filterType="${normalizedType}", cardType="${type}")`);
            }
            
            // Mostrar card se atender aos dois filtros
            const shouldShow = matchesName && matchesType;
            console.log(`  Card ${index + 1}: shouldShow=${shouldShow}`);
            
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        console.log(`✅ [filterArts] ${visibleCount} cards visíveis`);

        // Mostrar mensagem se nenhum resultado
        let message = list.querySelector('.companheiro-arts-no-filter-results');
        
        if (visibleCount === 0 && (term || (filterType && filterType !== ''))) {
            if (!message) {
                message = document.createElement('p');
                message.className = 'companheiro-arts-no-filter-results';
                message.textContent = `Nenhuma art encontrada${term ? ` para "${searchTerm}"` : ''}${filterType ? ` do tipo "${filterType}"` : ''}`;
                message.style.cssText = 'color: #e74c3c; text-align: center; padding: 2rem; font-size: 0.95rem;';
                list.appendChild(message);
            }
        } else {
            if (message) message.remove();
        }
    }

    /**
     * 🎨 MODAL PARA CRIAR NOVA ART (HABILIDADE)
     * REFATORADO: Código copiado da aba principal de Arts com IDs adaptados
     * IMPORTANTE: Núcleo é OBRIGATÓRIO - sem núcleo não pode criar art!
     */
    showModalCreateArt() {
        if (!window.companheiroArtsRenderer || !window.companheiroArtsRenderer.cores || !window.companheiroArtsRenderer.cores.length) {
            alert('⚠️ Crie um Núcleo primeiro!');
            return;
        }

        const cores = window.companheiroArtsRenderer.cores;
        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');

        title.textContent = '⚔️ Criar Nova Art';

        body.innerHTML = `
            <form class="companheiro-arts-form">
                <!-- SEÇÃO 1: IMAGEM -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #d8b4fe; font-weight: bold; margin-bottom: 12px; font-size: 0.95em;">📸 IMAGEM DA ART</label>
                    
                    <!-- PREVIEW DA IMAGEM -->
                    <div id="form-comp-art-image-preview" style="
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
                        <button type="button" id="form-comp-art-upload-btn" style="
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
                        <button type="button" id="form-comp-art-url-btn" style="
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
                    <input type="file" id="form-comp-art-image-upload" accept="image/*" style="display: none;">
                    <input type="text" id="form-comp-art-image-url" placeholder="Cole a URL da imagem aqui..." style="
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
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="padding: 0;">
                            <div>
                                <label style="color: #d8b4fe; font-weight: bold;">⚔️ Núcleo Base</label>
                                <select id="form-comp-art-core" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                    <option value="">Selecione...</option>
                                    ${cores.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div style="padding: 0;">
                            <div>
                                <label style="color: #d8b4fe; font-weight: bold;">📛 Nome</label>
                                <input type="text" id="form-comp-art-name" placeholder="Ex: Bola de Fogo" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 3: CLASSIFICAÇÃO (TIPO + AÇÃO) -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">🎯 Tipo de Art</label>
                            <select id="form-comp-art-type" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <option value="">Selecione...</option>
                                <option value="ofensiva">⚔️ Ofensiva</option>
                                <option value="defensiva">🛡️ Defensiva</option>
                                <option value="estrategica">🎯 Estratégica</option>
                                <option value="suporte">💚 Suporte</option>
                                <option value="controle">🌀 Controle</option>
                                <option value="invocacao">🔮 Invocação</option>
                                <option value="transformacao">🧬 Transformação</option>
                                <option value="passiva">🕶️ Passiva</option>
                                <option value="racial">👑 Racial</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚡ Tipo de Ação</label>
                            <select id="form-comp-art-action" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
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
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📍 Domínio</label>
                            <select id="form-comp-art-domain" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <option value="1">Dom 1</option>
                                <option value="2">Dom 2</option>
                                <option value="3">Dom 3</option>
                                <option value="4">Dom 4</option>
                                <option value="5">Dom 5</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">💎 Custo (PM)</label>
                            <input type="text" id="form-comp-art-cost" value="10" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚔️ Dano</label>
                            <input type="text" id="form-comp-art-damage" placeholder="Ex: 2d6+3" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">🔄 Recarga (turnos)</label>
                            <input type="text" id="form-comp-art-reload" value="0" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 5: EFEITO (DURAÇÃO + ALCANCE + ALVOS) -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⏳ Duração</label>
                            <input type="text" id="form-comp-art-duration" placeholder="Ex: 1 turno" value="instantâneo" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📍 Alcance</label>
                            <input type="text" id="form-comp-art-range" placeholder="Ex: 10 metros" value="contato" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                    </div>
                    <div style="margin-top: 12px;">
                        <label style="color: #d8b4fe; font-weight: bold;">🎪 Alvos</label>
                        <input type="text" id="form-comp-art-targets" placeholder="Ex: alvo único" value="alvo único" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                    </div>
                </div>

                <!-- SEÇÃO 6: DESCRIÇÃO -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <label style="color: #d8b4fe; font-weight: bold;">📖 Descrição</label>
                    <textarea id="form-comp-art-description" placeholder="Descrição detalhada da arte..." style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; min-height: 100px; font-family: inherit; margin-top: 4px;"></textarea>
                </div>
            </form>
        `;

        // Configurar preview de imagem
        const imageInput = document.getElementById('form-comp-art-image-upload');
        const imagePreview = document.getElementById('form-comp-art-image-preview');
        const uploadBtn = document.getElementById('form-comp-art-upload-btn');
        const urlBtn = document.getElementById('form-comp-art-url-btn');
        const urlInput = document.getElementById('form-comp-art-image-url');
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
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    currentImage = base64;
                } catch (err) {
                    console.error('❌ Erro ao carregar imagem', err);
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
                    console.error('❌ Erro ao carregar imagem da URL');
                };
                img.src = url;
            }
        });

        // Configurar botão de confirmação
        this.setConfirmButtonAction(async () => {
            const coreId = document.getElementById('form-comp-art-core').value;
            const name = document.getElementById('form-comp-art-name').value.trim();
            const type = document.getElementById('form-comp-art-type').value;
            const action = document.getElementById('form-comp-art-action').value;
            const domain = parseInt(document.getElementById('form-comp-art-domain').value);
            const cost = document.getElementById('form-comp-art-cost').value.trim() || '';
            const reload = document.getElementById('form-comp-art-reload').value.trim() || '';
            const damage = document.getElementById('form-comp-art-damage').value.trim();
            const duration = document.getElementById('form-comp-art-duration').value.trim();
            const range = document.getElementById('form-comp-art-range').value.trim();
            const targets = document.getElementById('form-comp-art-targets').value.trim();
            const description = document.getElementById('form-comp-art-description').value.trim();
            let image = currentImage || '';

            // Validar dados obrigatórios
            if (!coreId) {
                alert('⚠️ Selecione um núcleo');
                return;
            }
            if (!name) {
                alert('⚠️ Insira um nome para a art');
                return;
            }
            if (!type) {
                alert('⚠️ Selecione um tipo de art');
                return;
            }

            // 🔥 COMPRIMIR IMAGEM ANTES DE SALVAR
            if (image?.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
                console.log('📦 Comprimindo imagem da art...');
                image = await ImageCompressor.compressImage(image, 'art');
            }

            const artData = {
                id: 'art_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name, coreId, type, action, domain, cost, reload, damage,
                duration, range, targets, description, image, ativo: true
            };

            // Adicionar art ao renderer
            if (window.companheiroArtsRenderer) {
                window.companheiroArtsRenderer.addArtToList(artData);
            }

            this.closeModal();
        }, '✨ Criar Art');

        this.openModal();
    }

    /**
     * 🔍 VER - Visualizar art
     */
    showModalViewArt(artId) {
        // Buscar art nos dados em memória do renderer
        let art = null;
        let core = null;
        if (window.companheiroArtsRenderer && window.companheiroArtsRenderer.arts) {
            art = window.companheiroArtsRenderer.arts.find(a => a.id === artId);
            if (art && window.companheiroArtsRenderer.cores) {
                core = window.companheiroArtsRenderer.cores.find(c => c.id === art.coreId);
            }
        }
        
        if (!art) return;

        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');

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
                        ${art.image ? `<img src="${art.image}" alt="${art.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="font-size: 3rem; opacity: 0.5;">🎴</span>'}
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
                                <strong>Tipo:</strong> <span style="background: rgba(78,205,196,0.15); padding: 2px 6px; border-radius: 3px;">${art.type || '-'}</span>
                            </p>
                            <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                                <strong>Domínio:</strong> Dom ${art.domain || 1}
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
                                <div style="color: #f39c12; font-size: 1em; font-weight: bold;">${art.action || '-'}</div>
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
                                <div style="color: #e0e0e0; font-size: 0.9em;">${art.duration || '-'}</div>
                            </div>
                            <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alcance</div>
                                <div style="color: #e0e0e0; font-size: 0.9em;">${art.range || '-'}</div>
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

        this.setConfirmButtonAction(() => {
            this.showModalEditArt(art.id);
        }, '✏️ Editar');

        this.openModal();
    }

    /**
     * ✏️ EDITAR - Editar art
     */
    showModalEditArt(artId) {
        // Buscar art nos dados em memória
        let art = null;
        if (window.companheiroArtsRenderer && window.companheiroArtsRenderer.arts) {
            art = window.companheiroArtsRenderer.arts.find(a => a.id === artId);
        }
        
        if (!art) return;

        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');

        title.textContent = '✏️ Editar Art';
        body.innerHTML = `
            <form class="companheiro-arts-form">
                <!-- SEÇÃO 1: IMAGEM -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #d8b4fe; font-weight: bold; margin-bottom: 12px; font-size: 0.95em;">📸 IMAGEM DA ART</label>
                    
                    <!-- PREVIEW DA IMAGEM -->
                    <div id="form-comp-art-edit-image-preview" style="
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
                        ${art.image ? `<img src="${art.image}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="color: #999; font-size: 48px;">🖼️</span>'}
                    </div>
                    
                    <!-- BOTÕES E INPUT -->
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <button type="button" id="form-comp-art-edit-upload-btn" style="
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
                        <button type="button" id="form-comp-art-edit-url-btn" style="
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
                    <input type="file" id="form-comp-art-edit-image-upload" accept="image/*" style="display: none;">
                    <input type="text" id="form-comp-art-edit-image-url" placeholder="Cole a URL da imagem aqui..." style="
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
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="padding: 0;">
                            <div>
                                <label style="color: #d8b4fe; font-weight: bold;">⚔️ Núcleo Base *</label>
                                <select id="form-comp-art-edit-core" disabled style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px; opacity: 0.7; cursor: not-allowed;">
                                    <option value="${art.coreId}" selected>${art.coreId}</option>
                                </select>
                                <small style="color: #888; margin-top: 4px; display: block;">Não pode ser alterado</small>
                            </div>
                        </div>
                        <div style="padding: 0;">
                            <div>
                                <label style="color: #d8b4fe; font-weight: bold;">📛 Nome *</label>
                                <input type="text" id="form-comp-art-edit-name" value="${art.name}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 3: CLASSIFICAÇÃO (TIPO + AÇÃO) -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">🎯 Tipo de Art *</label>
                            <select id="form-comp-art-edit-type" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <option value="">Selecione...</option>
                                <option value="ofensiva" ${art.type === 'ofensiva' ? 'selected' : ''}>⚔️ Ofensiva</option>
                                <option value="defensiva" ${art.type === 'defensiva' ? 'selected' : ''}>🛡️ Defensiva</option>
                                <option value="estrategica" ${art.type === 'estrategica' ? 'selected' : ''}>🎯 Estratégica</option>
                                <option value="suporte" ${art.type === 'suporte' ? 'selected' : ''}>💚 Suporte</option>
                                <option value="controle" ${art.type === 'controle' ? 'selected' : ''}>🌀 Controle</option>
                                <option value="invocacao" ${art.type === 'invocacao' ? 'selected' : ''}>🔮 Invocação</option>
                                <option value="transformacao" ${art.type === 'transformacao' ? 'selected' : ''}>🧬 Transformação</option>
                                <option value="passiva" ${art.type === 'passiva' ? 'selected' : ''}>🕶️ Passiva</option>
                                <option value="racial" ${art.type === 'racial' ? 'selected' : ''}>👑 Racial</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚡ Tipo de Ação *</label>
                            <select id="form-comp-art-edit-action" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
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
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📍 Domínio *</label>
                            <select id="form-comp-art-edit-domain" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <option value="1" ${art.domain == 1 ? 'selected' : ''}>Dom 1</option>
                                <option value="2" ${art.domain == 2 ? 'selected' : ''}>Dom 2</option>
                                <option value="3" ${art.domain == 3 ? 'selected' : ''}>Dom 3</option>
                                <option value="4" ${art.domain == 4 ? 'selected' : ''}>Dom 4</option>
                                <option value="5" ${art.domain == 5 ? 'selected' : ''}>Dom 5</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">💎 Custo (PM) *</label>
                            <input type="text" id="form-comp-art-edit-cost" value="${art.cost || ''}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚔️ Dano</label>
                            <input type="text" id="form-comp-art-edit-damage" value="${art.damage || ''}" placeholder="Ex: 2d6+3" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">🔄 Recarga (turnos)</label>
                            <input type="text" id="form-comp-art-edit-reload" value="${art.reload || ''}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 5: EFEITO (DURAÇÃO + ALCANCE + ALVOS) -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⏳ Duração</label>
                            <input type="text" id="form-comp-art-edit-duration" value="${art.duration || 'instantâneo'}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📍 Alcance</label>
                            <input type="text" id="form-comp-art-edit-range" value="${art.range || 'contato'}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                        </div>
                    </div>
                    <div style="margin-top: 12px;">
                        <label style="color: #d8b4fe; font-weight: bold;">🎪 Alvos</label>
                        <input type="text" id="form-comp-art-edit-targets" value="${art.targets || 'alvo único'}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; margin-top: 4px;">
                    </div>
                </div>

                <!-- SEÇÃO 6: DESCRIÇÃO -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <label style="color: #d8b4fe; font-weight: bold;">📖 Descrição</label>
                    <textarea id="form-comp-art-edit-description" placeholder="Descrição detalhada da arte..." style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; box-sizing: border-box; min-height: 100px; font-family: inherit; margin-top: 4px;">${art.description || ''}</textarea>
                </div>
            </form>
        `;

        // Configurar preview de imagem
        const imageInput = document.getElementById('form-comp-art-edit-image-upload');
        const imagePreview = document.getElementById('form-comp-art-edit-image-preview');
        const uploadBtn = document.getElementById('form-comp-art-edit-upload-btn');
        const urlBtn = document.getElementById('form-comp-art-edit-url-btn');
        const urlInput = document.getElementById('form-comp-art-edit-image-url');
        let currentImage = art.image || '';
        
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
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    currentImage = base64;
                } catch (err) {
                    console.error('❌ Erro ao carregar imagem', err);
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
                    console.error('❌ Erro ao carregar imagem da URL');
                };
                img.src = url;
            }
        });

        this.setConfirmButtonAction(async () => {
            const name = document.getElementById('form-comp-art-edit-name').value.trim();
            const type = document.getElementById('form-comp-art-edit-type').value;
            const action = document.getElementById('form-comp-art-edit-action').value;
            const domain = parseInt(document.getElementById('form-comp-art-edit-domain').value);
            const cost = document.getElementById('form-comp-art-edit-cost').value.trim() || '';
            const reload = document.getElementById('form-comp-art-edit-reload').value.trim() || '';
            const damage = document.getElementById('form-comp-art-edit-damage').value.trim();
            const duration = document.getElementById('form-comp-art-edit-duration').value.trim();
            const range = document.getElementById('form-comp-art-edit-range').value.trim();
            const targets = document.getElementById('form-comp-art-edit-targets').value.trim();
            const description = document.getElementById('form-comp-art-edit-description').value.trim();

            // Validações básicas
            if (!name) {
                alert('⚠️ Insira um nome para a art');
                return;
            }
            if (!type) {
                alert('⚠️ Selecione um tipo de art');
                return;
            }

            // 🔥 COMPRIMIR IMAGEM ANTES DE SALVAR
            let finalImage = currentImage;
            if (finalImage?.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
                console.log('📦 Comprimindo imagem da art para edição...');
                finalImage = await ImageCompressor.compressImage(finalImage, 'art');
            }

            // Atualizar art no renderer
            if (window.companheiroArtsRenderer) {
                const artIndex = window.companheiroArtsRenderer.arts.findIndex(a => a.id === artId);
                if (artIndex !== -1) {
                    const updatedArt = {
                        ...window.companheiroArtsRenderer.arts[artIndex],
                        name, type, action, domain, cost, reload, damage, duration, range, targets, description, image: finalImage
                    };
                    
                    window.companheiroArtsRenderer.arts[artIndex] = updatedArt;
                    
                    // Salvar em persistência
                    if (window.companheiroArtsPersistence) {
                        window.companheiroArtsPersistence.salvarArtToCompanheiro(updatedArt);
                    }
                    
                    // Atualizar card no DOM
                    const artCard = document.querySelector(`[data-art-id="${artId}"]`);
                    if (artCard && window.companheiroArtsRenderer.getArtCardTemplate) {
                        artCard.innerHTML = window.companheiroArtsRenderer.getArtCardTemplate(updatedArt);
                    }
                    
                    // 🌟 ATUALIZAR BADGES DE NOME DA ART NOS CARDS DE VARIANTES
                    const varianteCards = document.querySelectorAll(`[data-art-id="${artId}"]`);
                    varianteCards.forEach(card => {
                        // Procurar o badge de art dentro do card e atualizar
                        const badges = card.querySelectorAll('span');
                        badges.forEach(badge => {
                            if (badge.textContent.includes('📜')) {
                                badge.textContent = `📜 ${updatedArt.name}`;
                            }
                        });
                    });
                }
            }

            this.closeModal();
            
            // ✅ NOVO: Atualizar painel de stats em tempo real
            if (window.companheiroArtsSystem) {
                setTimeout(() => window.companheiroArtsSystem.atualizarStatsPanel(), 100);
            }
        }, '💾 Salvar');

        this.openModal();
    }

    /**
     * 🌟 RENDERIZAR VARIANTES - Exibe todas as variantes de todas as arts
     */
    renderVariantes() {
        const listContainer = document.getElementById('companheiro-arts-variantes-list');
        if (!listContainer) return;

        // Coletar todas as variantes de todas as arts
        const allVariantes = [];
        if (window.companheiroArtsRenderer && window.companheiroArtsRenderer.arts) {
            window.companheiroArtsRenderer.arts.forEach(art => {
                if (art.variantes && Array.isArray(art.variantes)) {
                    art.variantes.forEach(variante => {
                        allVariantes.push({ variante, art });
                    });
                }
            });
        }

        if (allVariantes.length === 0) {
            listContainer.innerHTML = '<p class="empty-message">Nenhuma variante adicionada</p>';
            return;
        }

        listContainer.innerHTML = allVariantes
            .map(({ variante, art }) => this.getVarianteCardTemplate(variante, art))
            .join('');
    }

    /**
     * 🌟 TEMPLATE DE CARD DE VARIANTE - Similar ao template de arts
     */
    getVarianteCardTemplate(variante, art) {
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

        const typeIcon = typeIcons[variante.type] || '❓';
        const actionIcon = actionIcons[variante.action] || '⚡';
        const imageUrl = variante.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Crect fill=%222a1810%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2260%22 y=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23d4a574%22 font-size=%2240%22%3E🌟%3C/text%3E%3C/svg%3E';

        return `
    <div class="variante-card-horizontal" data-variante-id="${variante.id}" data-art-id="${art.id}" style="
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
          <img src="${imageUrl}" alt="${variante.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <!-- INFORMAÇÕES DO HEADER -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <!-- TÍTULO -->
          <div>
            <h3 style="margin: 0; color: #d8b4fe; font-size: 1.2em; font-weight: bold;">
              🌟 ${variante.name}
            </h3>
          </div>
          <!-- ART | TIPO | AÇÃO | DOMÍNIO -->
          <div style="
            display: flex;
            gap: 8px;
            font-size: 0.85em;
            color: #b0b8c1;
            flex-wrap: wrap;
            align-items: center;
          ">
            <span style="
              background: rgba(216, 180, 254, 0.1);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
              color: #d8b4fe;
            ">
              📜 ${art.name}
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
              ${typeIcon} ${variante.type || 'sem-tipo'}
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
              ${actionIcon} ${variante.action || '-'}
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
              🔮 Dominio: ${String(variante.domain || 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: TABELA COM ATRIBUTOS (7 COLUNAS) -->
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
          <div style="color: #e0e0e0; font-weight: bold;">${variante.reload || '0'}</div>
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
          <div style="color: #e0e0e0; font-weight: bold;">${variante.action || '-'}</div>
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
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${variante.duration || '-'}</div>
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
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${variante.range || '-'}</div>
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
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${variante.targets || '-'}</div>
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
          <div style="color: #9b59b6; font-weight: bold;">${variante.cost || '0'}</div>
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
          <div style="color: #e74c3c; font-weight: bold;">${variante.damage || '-'}</div>
        </div>
      </div>

      <!-- SEÇÃO 3: DESCRIÇÃO -->
      <div style="
        padding: 12px 16px;
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
          ${variante.description || 'Sem descrição'}
        </p>
      </div>

      <!-- SEÇÃO 4: BOTÕES DE AÇÃO -->
      <div style="
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        justify-content: space-around;
      ">
        <button class="arts-btn arts-btn-tiny" data-action="view-variante" data-id="${variante.id}" data-art-id="${art.id}" style="
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
        <button class="arts-btn arts-btn-tiny" data-action="edit-variante" data-id="${variante.id}" data-art-id="${art.id}" style="
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
        <button class="arts-btn arts-btn-tiny" data-action="delete-variante" data-id="${variante.id}" data-art-id="${art.id}" style="
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
     * 🌟 CRIAR VARIANTE - Modal para criar nova variante
     */
    showModalCreateVariante(artId) {
        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');

        if (!body || !title) {
            console.warn('⚠️ Modal elements not found');
            return;
        }

        // Verificar se há arts disponíveis
        const artsDisponiveis = window.companheiroArtsRenderer?.arts || [];
        if (artsDisponiveis.length === 0) {
            alert('⚠️ Você precisa criar uma Art antes de criar uma Variante!');
            return;
        }

        title.textContent = '🌟 Criar Nova Variante';
        let selectedArt = artId ? window.companheiroArtsRenderer?.arts?.find(a => a.id === artId) : null;

        body.innerHTML = `
            <form class="companheiro-arts-form">
                <!-- SEÇÃO 1: IMAGEM -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #d8b4fe; font-weight: bold; margin-bottom: 12px; font-size: 0.95em;">📸 IMAGEM DA VARIANTE</label>
                    
                    <!-- PREVIEW DA IMAGEM -->
                    <div id="form-comp-var-new-image-preview" style="
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
                        <button type="button" id="form-comp-var-new-upload-btn" style="
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
                        <button type="button" id="form-comp-var-new-url-btn" style="
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
                    <input type="file" id="form-comp-var-new-image-upload" accept="image/*" style="display: none;">
                    <input type="text" id="form-comp-var-new-image-url" placeholder="Cole a URL da imagem aqui..." style="
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

                <!-- SEÇÃO 2: ART BASE E NOME -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚔️ Art Base *</label>
                            ${artId ? `
                                <select disabled style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px; opacity: 0.7; cursor: not-allowed;">
                                    <option selected>${selectedArt?.name || 'Art não encontrada'}</option>
                                </select>
                                <small style="color: #888; display: block; margin-top: 4px;">Fixa</small>
                            ` : `
                                <input type="text" id="form-comp-var-new-art-search" placeholder="Pesquisar art..." autocomplete="off" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <div id="form-comp-var-new-search-results" style="display: none; max-height: 200px; overflow-y: auto; margin-top: 4px; border: 1px solid rgba(216, 180, 254, 0.3); border-radius: 6px; background: rgba(30, 30, 30, 0.8);"></div>
                                <input type="hidden" id="form-comp-var-new-art-id">
                                <div id="form-comp-var-new-art-selected" style="margin-top: 8px; padding: 8px; background: rgba(216, 180, 254, 0.15); border: 1px solid rgba(216, 180, 254, 0.4); border-radius: 6px; display: none; color: #d8b4fe; font-weight: 500; font-size: 0.9em;"></div>
                            `}
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📛 Nome *</label>
                            <input type="text" id="form-comp-var-new-name" placeholder="Ex: Explosão Maior" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 3: TIPO + AÇÃO -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">🎯 Tipo *</label>
                            <select id="form-comp-var-new-type" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <option value="">Selecione...</option>
                                <option value="ofensiva">⚔️ Ofensiva</option>
                                <option value="defensiva">🛡️ Defensiva</option>
                                <option value="estrategica">🎯 Estratégica</option>
                                <option value="suporte">💚 Suporte</option>
                                <option value="controle">🌀 Controle</option>
                                <option value="invocacao">🔮 Invocação</option>
                                <option value="transformacao">🧬 Transformação</option>
                                <option value="passiva">🕶️ Passiva</option>
                                <option value="racial">👑 Racial</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚡ Ação *</label>
                            <select id="form-comp-var-new-action" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <option value="">Selecione...</option>
                                <option value="Imediata">⚡ Imediata</option>
                                <option value="Duradoura">⏳ Duradoura</option>
                                <option value="Sustentada">♾️ Sustentada</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 4: DOMÍNIO + ATRIBUTOS -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📍 Domínio *</label>
                            <input type="number" id="form-comp-var-new-domain" min="1" max="5" value="1" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                            <small id="form-comp-var-new-domain-help" style="color: #888; display: block; margin-top: 4px;"></small>
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">💎 Custo</label>
                            <input type="text" id="form-comp-var-new-cost" value="0" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚔️ Dano</label>
                            <input type="text" id="form-comp-var-new-damage" placeholder="2d6+3" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">🔄 Recarga</label>
                            <input type="text" id="form-comp-var-new-reload" value="0" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 5: DURAÇÃO + ALCANCE + ALVOS -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⏳ Duração</label>
                            <input type="text" id="form-comp-var-new-duration" placeholder="instantâneo" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📍 Alcance</label>
                            <input type="text" id="form-comp-var-new-range" placeholder="contato" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                    </div>
                    <div style="margin-top: 12px;">
                        <label style="color: #d8b4fe; font-weight: bold;">🎪 Alvos</label>
                        <input type="text" id="form-comp-var-new-targets" placeholder="alvo único" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                    </div>
                </div>

                <!-- SEÇÃO 6: DESCRIÇÃO -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <label style="color: #d8b4fe; font-weight: bold;">📖 Descrição</label>
                    <textarea id="form-comp-var-new-description" placeholder="Descrição da variante..." style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; min-height: 80px; font-family: inherit; margin-top: 4px;"></textarea>
                </div>
            </form>
        `;

        // Configurar preview de imagem
        const imageInput = document.getElementById('form-comp-var-new-image-upload');
        const imagePreview = document.getElementById('form-comp-var-new-image-preview');
        const uploadBtn = document.getElementById('form-comp-var-new-upload-btn');
        const urlBtn = document.getElementById('form-comp-var-new-url-btn');
        const urlInput = document.getElementById('form-comp-var-new-image-url');
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
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    currentImage = base64;
                } catch (err) {
                    console.error('❌ Erro ao carregar imagem', err);
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
                    console.error('❌ Erro ao carregar imagem da URL');
                };
                img.src = url;
            }
        });

        // Setup de busca de arts (se não foi passado artId)
        if (!artId) {
            setTimeout(() => {
                const searchInput = document.getElementById('form-comp-var-new-art-search');
                const resultsDiv = document.getElementById('form-comp-var-new-search-results');
                const selectedDiv = document.getElementById('form-comp-var-new-art-selected');
                const artIdInput = document.getElementById('form-comp-var-new-art-id');

                if (!searchInput) return;

                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    if (!query) {
                        resultsDiv.style.display = 'none';
                        return;
                    }

                    const filtered = (window.companheiroArtsRenderer?.arts || []).filter(a =>
                        a.name.toLowerCase().includes(query)
                    );

                    if (filtered.length === 0) {
                        resultsDiv.innerHTML = '<div style="padding: 8px; color: #888; text-align: center;">Nenhuma art encontrada</div>';
                        resultsDiv.style.display = 'block';
                        return;
                    }

                    resultsDiv.innerHTML = filtered
                        .map(a => `
                            <div class="arts-search-item" data-art-id="${a.id}" style="padding: 8px; cursor: pointer; border-bottom: 1px solid rgba(216, 180, 254, 0.15); transition: background 0.2s; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="color: #d8b4fe;">${a.name}</strong>
                                    <small style="color: #888; display: block;">Tipo: ${a.type || 'sem tipo'} • Dom ${a.domain}</small>
                                </div>
                            </div>
                        `)
                        .join('');
                    resultsDiv.style.display = 'block';

                    resultsDiv.querySelectorAll('.arts-search-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const selArtId = item.dataset.artId;
                            const selArt = window.companheiroArtsRenderer?.arts?.find(a => a.id === selArtId);

                            if (selArt) {
                                selectedArt = selArt;
                                artIdInput.value = selArtId;
                                searchInput.value = selArt.name;
                                resultsDiv.style.display = 'none';
                                selectedDiv.textContent = `✅ ${selArt.name} (Dom ${selArt.domain})`;
                                selectedDiv.style.display = 'block';
                                
                                // Atualizar limite máximo de domínio
                                const domainInput = document.getElementById('form-comp-var-new-domain');
                                const domainHelp = document.getElementById('form-comp-var-new-domain-help');
                                const maxDomain = Math.max(1, selArt.domain - 1);
                                domainInput.max = maxDomain;
                                domainInput.value = Math.min(parseInt(domainInput.value), maxDomain);
                                domainHelp.textContent = `Máximo: Dom ${maxDomain} (Art é Dom ${selArt.domain})`;
                            }
                        });
                    });
                });
            }, 100);
        } else {
            // Atualizar limite de domínio se artId foi passado
            setTimeout(() => {
                if (selectedArt) {
                    const domainInput = document.getElementById('form-comp-var-new-domain');
                    const domainHelp = document.getElementById('form-comp-var-new-domain-help');
                    const maxDomain = Math.max(1, selectedArt.domain - 1);
                    domainInput.max = maxDomain;
                    domainInput.value = Math.min(parseInt(domainInput.value), maxDomain);
                    domainHelp.textContent = `Máximo: Dom ${maxDomain} (Art é Dom ${selectedArt.domain})`;
                }
            }, 50);
        }

        this.setConfirmButtonAction(() => {
            if (!selectedArt) {
                alert('⚠️ Selecione uma Art Base');
                return;
            }

            const name = document.getElementById('form-comp-var-new-name').value.trim();
            const type = document.getElementById('form-comp-var-new-type').value;
            const action = document.getElementById('form-comp-var-new-action').value;
            const domain = parseInt(document.getElementById('form-comp-var-new-domain').value) || 1;
            const cost = document.getElementById('form-comp-var-new-cost').value.trim() || '';
            const reload = document.getElementById('form-comp-var-new-reload').value.trim() || '';
            const damage = document.getElementById('form-comp-var-new-damage').value.trim();
            const duration = document.getElementById('form-comp-var-new-duration').value.trim() || 'instantâneo';
            const range = document.getElementById('form-comp-var-new-range').value.trim() || 'contato';
            const targets = document.getElementById('form-comp-var-new-targets').value.trim() || 'alvo único';
            const description = document.getElementById('form-comp-var-new-description').value.trim();

            // Validações
            if (!name) {
                alert('⚠️ Insira um nome para a variante');
                return;
            }
            if (!type) {
                alert('⚠️ Selecione um tipo');
                return;
            }
            if (!action) {
                alert('⚠️ Selecione uma ação');
                return;
            }

            // ✅ CRÍTICO: Validar que domínio não ultrapassa o da art (art dom 3 = variante máx dom 2)
            const maxDomain = Math.max(1, selectedArt.domain - 1);
            if (domain > maxDomain) {
                alert(`⚠️ Domínio inválido!\n\nA Art é Domínio ${selectedArt.domain}\nVariante máxima: Domínio ${maxDomain}`);
                return;
            }

            // Criar variante
            const variante = {
                id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name, type, action, domain, cost, reload, damage, duration, range, targets, description, image: currentImage
            };

            // Adicionar à art
            if (!selectedArt.variantes) {
                selectedArt.variantes = [];
            }
            selectedArt.variantes.push(variante);

            // Salvar
            if (window.companheiroArtsPersistence) {
                window.companheiroArtsPersistence.salvarArtToCompanheiro(selectedArt);
            }

            // Re-renderizar variantes
            this.renderVariantes();

            this.closeModal();
            alert('✅ Variante criada com sucesso!');
        }, '💫 Criar');

        this.openModal();
    }

    /**
     * 🌟 VER VARIANTE
     */
    showModalViewVariante(artId, varianteId) {
        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');

        if (!body || !title) return;

        const art = window.companheiroArtsRenderer?.arts?.find(a => a.id === artId);
        const variante = art?.variantes?.find(v => v.id === varianteId);

        if (!art || !variante) {
            alert('Variante não encontrada');
            return;
        }

        title.textContent = '🌟 Visualizar Variante';
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
                        ${variante.image ? `<img src="${variante.image}" alt="${variante.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="font-size: 3rem; opacity: 0.5;">🌟</span>'}
                    </div>
                </div>
                
                <!-- COLUNA DIREITA - INFORMAÇÕES -->
                <div style="display: flex; flex-direction: column; justify-content: space-between; padding-right: 20px;">
                    <div>
                        <h3 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 1.4em; font-weight: bold;">${variante.name}</h3>
                        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(216, 180, 254, 0.2);">
                            <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                                <strong>Art Base:</strong> ${art.name}
                            </p>
                            <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                                <strong>Tipo:</strong> <span style="background: rgba(78,205,196,0.15); padding: 2px 6px; border-radius: 3px;">${variante.type || '-'}</span>
                            </p>
                            <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                                <strong>Ação:</strong> ${variante.action || '-'}
                            </p>
                            <p style="margin: 4px 0; color: #b0b8c1; font-size: 0.9em;">
                                <strong>Domínio:</strong> Dom ${variante.domain || 1}
                            </p>
                        </div>

                        <!-- ATRIBUTOS -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; margin-top: 12px;">
                            <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Custo</div>
                                <div style="color: #9b59b6; font-size: 1.2em; font-weight: bold;">${variante.cost || '0'}</div>
                            </div>
                            <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Recarga</div>
                                <div style="color: #d8b4fe; font-size: 1.2em; font-weight: bold;">${variante.reload || 0}</div>
                            </div>
                            <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Dano</div>
                                <div style="color: #e74c3c; font-size: 1.2em; font-weight: bold;">${variante.damage || '-'}</div>
                            </div>
                            <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Duração</div>
                                <div style="color: #e0e0e0; font-size: 0.9em;">${variante.duration || '-'}</div>
                            </div>
                        </div>

                        <!-- RANGE E TARGETS -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alcance</div>
                                <div style="color: #e0e0e0; font-size: 0.9em;">${variante.range || '-'}</div>
                            </div>
                            <div style="background: rgba(216, 180, 254, 0.1); padding: 8px; border-radius: 4px;">
                                <div style="color: #888; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alvos</div>
                                <div style="color: #e0e0e0; font-size: 0.9em;">${variante.targets || '-'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- DESCRIÇÃO -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                <h4 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 1em; font-weight: bold; text-transform: uppercase;">📖 Descrição</h4>
                <p style="margin: 0; color: #d0d0d0; line-height: 1.6; font-size: 0.95em;">${variante.description || 'Sem descrição'}</p>
            </div>
        `;

        this.setConfirmButtonAction(() => {
            this.showModalEditVariante(artId, varianteId);
        }, '✏️ Editar');

        this.openModal();
    }

    /**
     * 🌟 EDITAR VARIANTE
     */
    showModalEditVariante(artId, varianteId) {
        const body = document.getElementById('companheiro-arts-modal-body');
        const title = document.getElementById('companheiro-arts-modal-title');

        if (!body || !title) return;

        const art = window.companheiroArtsRenderer?.arts?.find(a => a.id === artId);
        const variante = art?.variantes?.find(v => v.id === varianteId);

        if (!art || !variante) {
            alert('Variante não encontrada');
            return;
        }

        title.textContent = '✏️ Editar Variante';
        body.innerHTML = `
            <form class="companheiro-arts-form">
                <!-- SEÇÃO 1: IMAGEM -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #d8b4fe; font-weight: bold; margin-bottom: 12px; font-size: 0.95em;">📸 IMAGEM DA VARIANTE</label>
                    
                    <!-- PREVIEW DA IMAGEM -->
                    <div id="form-comp-var-edit-image-preview" style="
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
                        ${variante.image ? `<img src="${variante.image}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="color: #999; font-size: 48px;">🌟</span>'}
                    </div>
                    
                    <!-- BOTÕES E INPUT -->
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <button type="button" id="form-comp-var-edit-upload-btn" style="
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
                        <button type="button" id="form-comp-var-edit-url-btn" style="
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
                    <input type="file" id="form-comp-var-edit-image-upload" accept="image/*" style="display: none;">
                    <input type="text" id="form-comp-var-edit-image-url" placeholder="Cole a URL da imagem aqui..." style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid rgba(216, 180, 254, 0.3);
                        border-radius: 4px;
                        background: rgba(26, 26, 46, 0.6);
                        color: #e0e0e0;
                        display: none;
                        box-sizing: border-box;
                    " value="${variante.image && !variante.image.startsWith('data:') ? variante.image : ''}">
                    
                    <small style="color: #888; display: block;">JPG, PNG, GIF • Máx 1MB</small>
                </div>

                <!-- SEÇÃO 2: ART BASE E NOME -->
                <div style="margin-bottom: 20px; padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚔️ Art Base *</label>
                            <select disabled style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px; opacity: 0.7; cursor: not-allowed;">
                                <option selected>${art.name}</option>
                            </select>
                            <small style="color: #888; display: block; margin-top: 4px;">Não pode ser alterada</small>
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📛 Nome *</label>
                            <input type="text" id="form-comp-var-edit-name" value="${variante.name}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 3: TIPO + AÇÃO -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">🎯 Tipo *</label>
                            <select id="form-comp-var-edit-type" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <option value="">Selecione...</option>
                                <option value="ofensiva" ${variante.type === 'ofensiva' ? 'selected' : ''}>⚔️ Ofensiva</option>
                                <option value="defensiva" ${variante.type === 'defensiva' ? 'selected' : ''}>🛡️ Defensiva</option>
                                <option value="estrategica" ${variante.type === 'estrategica' ? 'selected' : ''}>🎯 Estratégica</option>
                                <option value="suporte" ${variante.type === 'suporte' ? 'selected' : ''}>💚 Suporte</option>
                                <option value="controle" ${variante.type === 'controle' ? 'selected' : ''}>🌀 Controle</option>
                                <option value="invocacao" ${variante.type === 'invocacao' ? 'selected' : ''}>🔮 Invocação</option>
                                <option value="transformacao" ${variante.type === 'transformacao' ? 'selected' : ''}>🧬 Transformação</option>
                                <option value="passiva" ${variante.type === 'passiva' ? 'selected' : ''}>🕶️ Passiva</option>
                                <option value="racial" ${variante.type === 'racial' ? 'selected' : ''}>👑 Racial</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚡ Ação *</label>
                            <select id="form-comp-var-edit-action" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                                <option value="">Selecione...</option>
                                <option value="Imediata" ${variante.action === 'Imediata' ? 'selected' : ''}>⚡ Imediata</option>
                                <option value="Duradoura" ${variante.action === 'Duradoura' ? 'selected' : ''}>⏳ Duradoura</option>
                                <option value="Sustentada" ${variante.action === 'Sustentada' ? 'selected' : ''}>♾️ Sustentada</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 4: DOMÍNIO + ATRIBUTOS -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📍 Domínio</label>
                            <input type="number" id="form-comp-var-edit-domain" min="1" max="5" value="${variante.domain || 1}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">💎 Custo</label>
                            <input type="text" id="form-comp-var-edit-cost" value="${variante.cost || ''}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⚔️ Dano</label>
                            <input type="text" id="form-comp-var-edit-damage" value="${variante.damage || ''}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">🔄 Recarga</label>
                            <input type="text" id="form-comp-var-edit-reload" value="${variante.reload || ''}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 5: DURAÇÃO + ALCANCE + ALVOS -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">⏳ Duração</label>
                            <input type="text" id="form-comp-var-edit-duration" value="${variante.duration || 'instantâneo'}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                        <div>
                            <label style="color: #d8b4fe; font-weight: bold;">📍 Alcance</label>
                            <input type="text" id="form-comp-var-edit-range" value="${variante.range || 'contato'}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                        </div>
                    </div>
                    <div style="margin-top: 12px;">
                        <label style="color: #d8b4fe; font-weight: bold;">🎪 Alvos</label>
                        <input type="text" id="form-comp-var-edit-targets" value="${variante.targets || 'alvo único'}" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; margin-top: 4px;">
                    </div>
                </div>

                <!-- SEÇÃO 6: DESCRIÇÃO -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(216, 180, 254, 0.2);">
                    <label style="color: #d8b4fe; font-weight: bold;">📖 Descrição</label>
                    <textarea id="form-comp-var-edit-description" style="width: 100%; padding: 8px; background: rgba(26, 26, 46, 0.6); border: 1px solid #d8b4fe; border-radius: 4px; color: #e0e0e0; min-height: 80px; font-family: inherit; margin-top: 4px;">${variante.description || ''}</textarea>
                </div>
            </form>
        `;

        // Configurar preview de imagem
        const imageInput = document.getElementById('form-comp-var-edit-image-upload');
        const imagePreview = document.getElementById('form-comp-var-edit-image-preview');
        const uploadBtn = document.getElementById('form-comp-var-edit-upload-btn');
        const urlBtn = document.getElementById('form-comp-var-edit-url-btn');
        const urlInput = document.getElementById('form-comp-var-edit-image-url');
        let currentImage = variante.image || '';
        
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
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    imagePreview.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    currentImage = base64;
                } catch (err) {
                    console.error('❌ Erro ao carregar imagem', err);
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
                    console.error('❌ Erro ao carregar imagem da URL');
                };
                img.src = url;
            }
        });

        this.setConfirmButtonAction(() => {
            const name = document.getElementById('form-comp-var-edit-name').value.trim();
            const type = document.getElementById('form-comp-var-edit-type').value;
            const action = document.getElementById('form-comp-var-edit-action').value;
            const domain = parseInt(document.getElementById('form-comp-var-edit-domain').value) || 1;
            const cost = document.getElementById('form-comp-var-edit-cost').value.trim() || '';
            const reload = document.getElementById('form-comp-var-edit-reload').value.trim() || '';
            const damage = document.getElementById('form-comp-var-edit-damage').value.trim();
            const duration = document.getElementById('form-comp-var-edit-duration').value.trim();
            const range = document.getElementById('form-comp-var-edit-range').value.trim();
            const targets = document.getElementById('form-comp-var-edit-targets').value.trim();
            const description = document.getElementById('form-comp-var-edit-description').value.trim();

            // Validações
            if (!name) {
                alert('⚠️ Insira um nome');
                return;
            }
            if (!type) {
                alert('⚠️ Selecione um tipo');
                return;
            }
            if (!action) {
                alert('⚠️ Selecione uma ação');
                return;
            }

            // Atualizar variante
            const varianteIndex = art.variantes.findIndex(v => v.id === varianteId);
            if (varianteIndex !== -1) {
                art.variantes[varianteIndex] = {
                    ...art.variantes[varianteIndex],
                    name, type, action, domain, cost, reload, damage, duration, range, targets, description, image: currentImage
                };

                // Salvar
                if (window.companheiroArtsPersistence) {
                    window.companheiroArtsPersistence.salvarArtToCompanheiro(art);
                }

                // Re-renderizar
                this.renderVariantes();
            }

            this.closeModal();
            alert('✅ Variante atualizada!');
        }, '💾 Salvar');

        this.openModal();
    }

    /**
     * 🌟 DELETAR VARIANTE
     */
    deleteVariante(artId, varianteId) {
        if (!confirm('🗑️ Deletar esta variante?')) return;

        const art = window.companheiroArtsRenderer?.arts?.find(a => a.id === artId);
        if (art && art.variantes) {
            art.variantes = art.variantes.filter(v => v.id !== varianteId);

            // Salvar
            if (window.companheiroArtsPersistence) {
                window.companheiroArtsPersistence.salvarArtToCompanheiro(art);
            }

            // Re-renderizar
            this.renderVariantes();
        }
    }

    /**
     * 🌟 FILTRAR VARIANTES POR NOME E TIPO
     */
    filterVariantes(searchTerm = '', filterType = null) {
        const cards = document.querySelectorAll('[data-variante-id]');
        
        cards.forEach(card => {
            const varianteId = card.dataset.varianteId;
            const artId = card.dataset.artId;
            
            const art = window.companheiroArtsRenderer?.arts?.find(a => a.id === artId);
            const variante = art?.variantes?.find(v => v.id === varianteId);
            
            if (!variante) {
                card.style.display = 'none';
                return;
            }

            const matchesSearch = variante.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = !filterType || filterType === '' || variante.type?.toLowerCase() === filterType.toLowerCase();
            
            card.style.display = (matchesSearch && matchesType) ? 'flex' : 'none';
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.companheiroArtsModalManager = new CompanheiroArtsModalManager();
        console.log('✅ CompanheiroArtsModalManager inicializado');
    });
} else {
    window.companheiroArtsModalManager = new CompanheiroArtsModalManager();
}

