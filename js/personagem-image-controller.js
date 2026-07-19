/* ============================================ */
/* PERSONAGEM-IMAGE-CONTROLLER.JS              */
/* Controller para o Modal de Imagem            */
/* ============================================ */

/**
 * PersonagemImageController
 * Responsável por:
 * - Gerenciar o modal de imagem
 * - Processar uploads e URLs
 * - Atualizar o elemento #personagem-imagem
 * - Persistir no IndexedDB
 */

class PersonagemImageController {
    constructor() {
        // Elementos do modal
        this.modal = null;
        this.overlay = null;
        this.closeBtn = null;
        this.cancelBtn = null;
        this.saveBtn = null;
        this.previewImg = null;
        this.previewError = null;
        
        // Inputs
        this.fileInput = null;
        this.urlInput = null;
        this.urlPreviewBtn = null;
        
        // Source tabs
        this.sourceTabs = [];
        this.sourcePanels = [];
        
        // Info elements
        this.uploadInfo = null;
        this.urlInfo = null;
        
        // Estado interno
        this.currentImageData = null;
        this.currentImageType = null;
        
        // Elemento do personagem
        this.personagemImageElement = null;

        this.init();
    }

    /**
     * Inicializa o controller
     * 
     * ✅ ETAPA 2: Fluxo de Persistência F5-Safe
     * Chamado após DOMContentLoaded
     * Carrega imagem do localStorage (já restaurado pelo state-manager)
     */
    init() {
        this.selectElements();
        this.attachEventListeners();
        
        // ✅ NOVO: Aguardar um pequeno delay para garantir que IndexedDB está pronto
        // Isso garante que quando loadSavedImage() for chamado, o IndexedDB estará acessível
        setTimeout(() => {
            console.log('⏳ [PersonagemImageController] Aguardando IndexedDB ficar pronto...');
            this.loadSavedImage();
        }, 100);
    }

    /**
     * Seleciona todos os elementos do DOM
     */
    selectElements() {
        // Modal
        this.modal = document.getElementById('personagem-image-modal');
        this.overlay = document.getElementById('personagem-image-modal-overlay');
        this.closeBtn = document.getElementById('personagem-image-modal-close');
        this.cancelBtn = document.getElementById('personagem-image-modal-cancel');
        this.saveBtn = document.getElementById('personagem-image-modal-save');
        
        // Preview
        this.previewImg = document.getElementById('personagem-image-modal-preview');
        this.previewError = document.getElementById('personagem-image-modal-error');
        
        // Inputs
        this.fileInput = document.getElementById('personagem-image-file-input');
        this.urlInput = document.getElementById('personagem-image-url-input');
        this.urlPreviewBtn = document.getElementById('personagem-image-url-preview-btn');
        
        // Tabs e Painéis
        this.sourceTabs = document.querySelectorAll('.personagem-image-modal__source-tab');
        this.sourcePanels = document.querySelectorAll('.personagem-image-modal__source-panel');
        
        // Infos
        this.uploadInfo = document.getElementById('personagem-image-upload-info');
        this.urlInfo = document.getElementById('personagem-image-url-info');
        
        // Elemento do personagem
        this.personagemImageElement = document.getElementById('personagem-imagem');

        if (!this.personagemImageElement) {
            console.warn('⚠️  Elemento #personagem-imagem não encontrado');
        }
    }

    /**
     * Anexa event listeners
     */
    attachEventListeners() {
        // Botões de fechar
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        this.cancelBtn?.addEventListener('click', () => this.closeModal());
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeModal();
            }
        });

        // Botão de salvar
        this.saveBtn?.addEventListener('click', () => this.saveImage());

        // Tabs
        this.sourceTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSourceTab(e.target));
        });

        // File input
        this.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        this.fileInput?.parentElement?.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileInput.parentElement.querySelector('.personagem-image-modal__file-label')
                ?.classList.add('personagem-image-modal__file-label--drag-over');
        });

        this.fileInput?.parentElement?.addEventListener('dragleave', (e) => {
            if (e.target === this.fileInput.parentElement) {
                this.fileInput.parentElement.querySelector('.personagem-image-modal__file-label')
                    ?.classList.remove('personagem-image-modal__file-label--drag-over');
            }
        });

        this.fileInput?.parentElement?.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileInput.parentElement.querySelector('.personagem-image-modal__file-label')
                ?.classList.remove('personagem-image-modal__file-label--drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.fileInput.files = files;
                this.handleFileSelect({ target: this.fileInput });
            }
        });

        // URL Preview
        this.urlPreviewBtn?.addEventListener('click', () => this.previewFromURL());

        // Enter no URL input
        this.urlInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.previewFromURL();
            }
        });

        // Tecla ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('personagem-image-modal--active')) {
                this.closeModal();
            }
        });
    }

    /**
     * Abre o modal
     */
    openModal() {
        if (this.modal) {
            this.modal.classList.add('personagem-image-modal--active');
            this.modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Fecha o modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('personagem-image-modal--active');
            this.modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Reset
            this.currentImageData = null;
            this.currentImageType = null;
            this.resetForm();
        }
    }

    /**
     * Recarrega a imagem salva do IndexedDB com tratamento profissional + OTIMIZAÇÃO
     */
    async loadSavedImage() {
        try {
            console.log('🔄 Buscando imagem salva...');
            
            let savedImage = null;

            // ✅ PRIMEIRO: Tentar carregar referência MINIMAL do localStorage (OTIMIZADO)
            if (window.localStorageManager) {
                try {
                    const imagemLocalStorage = window.localStorageManager.loadPersonagemImagemMinimal();
                    
                    if (imagemLocalStorage && imagemLocalStorage._id) {
                        console.log('📂 Detectado: Referência minimal otimizada, buscando em IndexedDB...');
                        
                        if (typeof ImagemStorageManager !== 'undefined') {
                            try {
                                const imagemComprimida = await ImagemStorageManager.carregarImagem(
                                    imagemLocalStorage._id
                                );
                                
                                if (imagemComprimida) {
                                    savedImage = {
                                        dataUrl: imagemComprimida,
                                        mimeType: 'image/jpeg',
                                        source: 'indexeddb',
                                        width: 0,
                                        height: 0
                                    };
                                    console.log('✅ Imagem restaurada do IndexedDB (referência otimizada)');
                                }
                            } catch (e) {
                                console.warn('⚠️ Erro ao restaurar do IndexedDB:', e.message);
                            }
                        }
                    }
                } catch (error) {
                    console.log('ℹ️ Nenhuma referência otimizada no localStorage, tentando fallbacks...');
                }
            }

            // ⚠️ COMPATIBILIDADE: Detectar e migrar dados antigos automaticamente
            if (!savedImage && window.localStorageManager) {
                try {
                    const imagemAntiga = window.localStorageManager.loadPersonagemImagem();
                    
                    if (imagemAntiga) {
                        // Detectar base64 antigo em localStorage (PROBLEMA)
                        if (imagemAntiga.dataUrl && imagemAntiga.dataUrl.startsWith('data:')) {
                            console.log('🔄 Detectado: base64 antigo em localStorage, migrando para IndexedDB...');
                            
                            if (typeof ImagemStorageManager !== 'undefined') {
                                try {
                                    // Mover para IndexedDB
                                    const imagemId = await ImagemStorageManager.salvarImagem(
                                        'personagem_imagem',
                                        imagemAntiga.dataUrl,
                                        'personagem'
                                    );
                                    
                                    // Atualizar localStorage com apenas referência minimalista
                                    window.localStorageManager.savePersonagemImagemMinimal(imagemId, 1);
                                    
                                    savedImage = {
                                        dataUrl: imagemAntiga.dataUrl,
                                        mimeType: imagemAntiga.mimeType || 'image/jpeg',
                                        source: 'migrated',
                                        width: imagemAntiga.width || 0,
                                        height: imagemAntiga.height || 0
                                    };
                                    
                                    console.log('✅ Base64 antigo migrado para IndexedDB com sucesso');
                                } catch (e) {
                                    console.warn('⚠️ Erro ao migrar:', e.message);
                                    // Usar imagem antiga por enquanto
                                    savedImage = {
                                        dataUrl: imagemAntiga.dataUrl,
                                        mimeType: imagemAntiga.mimeType || 'image/jpeg',
                                        source: 'localstorage_legacy',
                                        width: imagemAntiga.width || 0,
                                        height: imagemAntiga.height || 0
                                    };
                                }
                            }
                        }
                        // Referência antigo com _imagemId
                        else if (imagemAntiga._imagemId) {
                            console.log('📂 Detectado: Formato antigo com _imagemId, buscando em IndexedDB...');
                            
                            if (typeof ImagemStorageManager !== 'undefined') {
                                try {
                                    const imagemComprimida = await ImagemStorageManager.carregarImagem(
                                        imagemAntiga._imagemId
                                    );
                                    
                                    if (imagemComprimida) {
                                        savedImage = {
                                            dataUrl: imagemComprimida,
                                            mimeType: imagemAntiga.mimeType || 'image/jpeg',
                                            source: 'indexeddb',
                                            width: imagemAntiga.width || 0,
                                            height: imagemAntiga.height || 0
                                        };
                                        
                                        // Atualizar localStorage para novo formato otimizado
                                        window.localStorageManager.savePersonagemImagemMinimal(imagemAntiga._imagemId, 1);
                                        console.log('✅ Imagem restaurada e localStorage atualizado para formato otimizado');
                                    }
                                } catch (e) {
                                    console.warn('⚠️ Erro ao restaurar do IndexedDB:', e.message);
                                }
                            }
                        }
                        // URL direta
                        else if (imagemAntiga.sourceUrl) {
                            console.log('🔗 Detectado: URL direta, carregando...');
                            savedImage = {
                                dataUrl: imagemAntiga.sourceUrl,
                                mimeType: imagemAntiga.mimeType || 'image/jpeg',
                                source: 'url',
                                sourceUrl: imagemAntiga.sourceUrl,
                                width: imagemAntiga.width || 0,
                                height: imagemAntiga.height || 0
                            };
                        }
                    }
                } catch (error) {
                    console.log('ℹ️ Nenhuma imagem nos fallbacks de compatibilidade');
                }
            }

            // ✅ ÚLTIMO FALLBACK: Se não encontrar em nenhum lugar, tenta IndexedDB direto
            if (!savedImage) {
                console.log('🔄 Última tentativa: buscando imagem salva diretamente em IndexedDB...');
                if (typeof ImagemStorageManager !== 'undefined') {
                    try {
                        const imagemDireto = await ImagemStorageManager.carregarImagem('personagem_imagem');
                        if (imagemDireto) {
                            savedImage = {
                                dataUrl: imagemDireto,
                                mimeType: 'image/jpeg',
                                source: 'indexeddb',
                                width: 0,
                                height: 0
                            };
                            console.log('✅ Imagem encontrada diretamente no IndexedDB');
                        }
                    } catch (e) {
                        console.warn('⚠️ Erro ao buscar do IndexedDB:', e.message);
                    }
                }
                
                // Fallback: tentar imageDBManager (compatibilidade)
                if (!savedImage && typeof imageDBManager !== 'undefined') {
                    try {
                        savedImage = await imageDBManager.getImage();
                        console.log('✅ Imagem encontrada via imageDBManager');
                    } catch (e) {
                        console.warn('⚠️ Erro com imageDBManager:', e.message);
                    }
                }
            }
            
            if (savedImage && (savedImage.dataUrl || savedImage.data)) {
                const dataUrl = savedImage.dataUrl || savedImage.data;
                console.log('✅ Imagem encontrada:', {
                    source: savedImage.source || 'unknown',
                    formato: savedImage.format?.toUpperCase() || 'Desconhecido',
                    tamanho: imageDBManager?.formatSize(savedImage.size) || 'N/A',
                    dimensões: `${savedImage.width || '?'}x${savedImage.height || '?'}`,
                    isDataUrl: dataUrl?.startsWith('data:') ? 'Sim' : 'Não (URL)'
                });

                // Aplicar imagem salva ao elemento #personagem-imagem
                if (typeof dataUrl === 'string') {
                    this.updatePersonagemImage(dataUrl);
                    console.log('✅ Imagem aplicada ao #personagem-imagem');
                } else {
                    console.warn('⚠️  Formato de dados não reconhecido');
                }
            } else {
                console.log('ℹ️  Nenhuma imagem previamente salva. Usando padrão.');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar imagem salva:', error);
            console.log('ℹ️  Continuando com imagem padrão...');
        }
    }

    /**
     * Alterna entre os tabs de fonte
     */
    switchSourceTab(tab) {
        const sourceType = tab.getAttribute('data-source');
        
        // Remover classe ativa de todos os tabs
        this.sourceTabs.forEach(t => t.classList.remove('personagem-image-modal__source-tab--active'));
        
        // Adicionar classe ativa ao tab clicado
        tab.classList.add('personagem-image-modal__source-tab--active');
        
        // Esconder todos os painéis
        this.sourcePanels.forEach(panel => {
            panel.classList.remove('personagem-image-modal__source-panel--active');
        });
        
        // Mostrar painel selecionado
        const panelToShow = Array.from(this.sourcePanels).find(
            panel => panel.getAttribute('data-source') === sourceType
        );
        panelToShow?.classList.add('personagem-image-modal__source-panel--active');
    }

    /**
     * Processa seleção de arquivo com validação profissional
     */
    async handleFileSelect(event) {
        const file = event.target.files?.[0];
        
        if (!file) return;

        // Validar tipo
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            this.uploadInfo.textContent = `❌ Tipo não suportado: ${file.type}`;
            this.uploadInfo.style.color = '#ff9c9c';
            return;
        }

        // Validar tamanho (máximo 50MB para IndexedDB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            this.uploadInfo.textContent = '❌ Arquivo muito grande (máximo 50MB)';
            this.uploadInfo.style.color = '#ff9c9c';
            return;
        }

        try {
            console.log(`📁 Arquivo selecionado: ${file.name}`);
            
            // Converter arquivo para Data URL com metadados
            const imageData = await imageDBManager.fileToDataURL(file);
            
            // Atualizar preview
            this.showPreview(imageData.dataUrl);
            
            // Armazenar dados
            this.currentImageData = imageData;
            this.currentImageType = 'local';
            
            const sizeKB = (imageData.size / 1024).toFixed(2);
            this.uploadInfo.textContent = `✅ ${file.name} (${sizeKB} KB) - ${imageData.width}x${imageData.height}px`;
            this.uploadInfo.style.color = '#a6e3a1';
            
            console.log('✅ Arquivo processado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao processar arquivo:', error);
            this.uploadInfo.textContent = '❌ Erro ao processar arquivo';
            this.uploadInfo.style.color = '#ff9c9c';
        }
    }

    /**
     * Processa preview de URL com tratamento profissional
     */
    async previewFromURL() {
        const url = this.urlInput?.value?.trim();
        
        if (!url) {
            this.urlInfo.textContent = '⚠️  Insira uma URL válida';
            this.urlInfo.style.color = '#f1c96b';
            return;
        }

        try {
            console.log(`🔗 Carregando URL: ${url}`);
            
            // Validar URL
            new URL(url);
            
            // Carregar imagem de URL com tratamento profissional
            const imageData = await imageDBManager.loadFromURL(url);
            
            // Atualizar preview
            this.showPreview(imageData.dataUrl);
            
            // Armazenar dados
            this.currentImageData = imageData;
            this.currentImageType = 'url';
            
            const sizeKB = (imageData.size / 1024).toFixed(2);
            this.urlInfo.textContent = `✅ ${imageData.format.toUpperCase()} (${sizeKB} KB) - ${imageData.width}x${imageData.height}px`;
            this.urlInfo.style.color = '#a6e3a1';
            
            console.log('✅ URL carregada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar URL:', error);
            this.urlInfo.textContent = `❌ Erro: ${error.message.substring(0, 40)}`;
            this.urlInfo.style.color = '#ff9c9c';
            this.showError();
        }
    }

    /**
     * Mostra a pré-visualização com suporte a GIFs e imagens pesadas
     */
    showPreview(source) {
        this.previewError?.style.setProperty('display', 'none');
        this.previewImg.style.opacity = '0.5';
        
        console.log('🖼️  Carregando preview...');
        
        // Carregar imagem
        this.previewImg.src = source;
        
        // Callback quando carrega
        const onLoad = () => {
            console.log('✅ Preview carregado');
            this.previewImg.style.opacity = '1';
            this.previewImg.removeEventListener('load', onLoad);
            this.previewImg.removeEventListener('error', onError);
        };

        const onError = () => {
            console.warn('⚠️  Aviso ao carregar preview, mas continuando...');
            this.previewImg.style.opacity = '1';
            this.previewImg.removeEventListener('load', onLoad);
            this.previewImg.removeEventListener('error', onError);
        };

        // Adicionar listeners
        this.previewImg.addEventListener('load', onLoad);
        this.previewImg.addEventListener('error', onError);

        // Timeout para imagens pesadas
        setTimeout(() => {
            if (this.previewImg.style.opacity === '0.5') {
                console.log('⏱️  Timeout de preview, forçando exibição');
                this.previewImg.style.opacity = '1';
                this.previewImg.removeEventListener('load', onLoad);
                this.previewImg.removeEventListener('error', onError);
            }
        }, 5000);
    }

    /**
     * Mostra erro de carregamento
     */
    showError() {
        this.previewError?.style.setProperty('display', 'flex');
        this.previewImg.style.opacity = '0.2';
    }

    /**
     * Atualiza a imagem do personagem no elemento #personagem-imagem
     * Garantir que é o ÚNICO elemento que exibe a imagem
     */
    updatePersonagemImage(source) {
        if (!this.personagemImageElement) {
            console.error('❌ CRÍTICO: Elemento #personagem-imagem não encontrado no DOM');
            return false;
        }

        try {
            this.personagemImageElement.src = source;
            console.log('✅ Imagem atualizada no #personagem-imagem:', source.substring(0, 50));
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar #personagem-imagem:', error);
            return false;
        }
    }

    /**
     * Salva a imagem com tratamento profissional
     */
    async saveImage() {
        if (!this.currentImageData) {
            console.warn('⚠️  Nenhuma imagem selecionada para salvar');
            this.showSaveError('Selecione uma imagem');
            return;
        }

        try {
            this.saveBtn.disabled = true;
            this.saveBtn.textContent = '⏳ Salvando...';

            let metadata = {};

            // Se for dados de URL ou local
            if (typeof this.currentImageData === 'object' && this.currentImageData.dataUrl) {
                // Dados completos com metadados
                metadata = {
                    mimeType: this.currentImageData.mimeType,
                    size: this.currentImageData.size || 0,
                    width: this.currentImageData.width || 0,
                    height: this.currentImageData.height || 0,
                    format: this.currentImageData.format,
                    source: this.currentImageData.source,
                    sourceUrl: this.currentImageData.sourceUrl || ''
                };

                // Se for URL direta (não conseguiu converter para Data URL)
                if (this.currentImageData.dataUrl === this.currentImageData.sourceUrl) {
                    console.log('💾 Salvando URL como referência (não foi possível converter)');
                } else {
                    console.log('💾 Salvando como Data URL completo');
                }

                // 🔴 ESTRATÉGIA OTIMIZADA: localStorage é suficiente + rápido
                // IndexedDB é opcional e pode ser lento em alguns browsers
                let indexedDBSkipped = false;
                
                // Tentar IndexedDB apenas como bônus (não bloqueia)
                if (typeof imageDBManager !== 'undefined' && imageDBManager.saveImage) {
                    try {
                        // Salvar em background SEM esperar (fire and forget)
                        imageDBManager.saveImage(this.currentImageData.dataUrl, metadata)
                            .then(() => console.log('✅ Bônus: Imagem também salva em IndexedDB'))
                            .catch(err => console.warn('⚠️ IndexedDB falhou (OK, apenas em RAM):', err.message));
                    } catch (err) {
                        console.warn('⚠️ IndexedDB não disponível');
                    }
                }

                // ✅ Aplicar imagem ao elemento (visualmente funciona SEMPRE)
                this.updatePersonagemImage(this.currentImageData.dataUrl);
                console.log('✅ Imagem aplicada ao #personagem-imagem (apenas em RAM)');

                // ✅ PERSISTIR OTIMIZADO
                if (window.localStorageManager) {
                    try {
                        // Diferenciar entre URL direta e base64
                        const isDirectUrl = this.currentImageData.source === 'url' || 
                                          (!this.currentImageData.dataUrl.startsWith('data:'));
                        
                        if (isDirectUrl) {
                            // URLs diretas: salvar apenas a referência
                            const imagemDataUrl = {
                                _imagemId: null, // sem IndexedDB para URLs
                                sourceUrl: this.currentImageData.sourceUrl || this.currentImageData.dataUrl,
                                source: 'url',
                                mimeType: this.currentImageData.mimeType || 'image/jpeg',
                                width: this.currentImageData.width || 0,
                                height: this.currentImageData.height || 0
                            };
                            
                            window.localStorageManager.savePersonagemImagem(imagemDataUrl);
                            console.log('💾 URL da imagem salva em localStorage (otimizado)', {
                                url: imagemDataUrl.sourceUrl.substring(0, 50) + '...',
                                tamanho: JSON.stringify(imagemDataUrl).length + ' bytes'
                            });
                        } else {
                            // Base64: comprimir e salvar em IndexedDB
                            console.log('🗜️ Comprimindo imagem base64...');
                            
                            let imagemComprimida = this.currentImageData.dataUrl;
                            
                            // Tentar comprimir
                            if (typeof ImagemOtimizacao !== 'undefined') {
                                try {
                                    imagemComprimida = await ImagemOtimizacao.procesarImagem(
                                        this.currentImageData.dataUrl,
                                        {
                                            maxWidth: 1024,
                                            maxHeight: 1024,
                                            quality: 0.8,
                                            tamanhMaximoMB: 3
                                        }
                                    );
                                    console.log('✅ Imagem comprimida com sucesso');
                                } catch (e) {
                                    console.warn('⚠️ Falha ao comprimir, usando original:', e.message);
                                }
                            }
                            
                            // Salvar em IndexedDB
                            let imagemId = null;
                            if (typeof ImagemStorageManager !== 'undefined') {
                                try {
                                    imagemId = await ImagemStorageManager.salvarImagem(
                                        'personagem_imagem',
                                        imagemComprimida,
                                        'personagem'
                                    );
                                    console.log('💾 Imagem salva em IndexedDB:', imagemId);
                                } catch (e) {
                                    console.warn('⚠️ Erro ao salvar em IndexedDB:', e.message);
                                }
                            }
                            
                            // Salvar apenas referência em localStorage
                            const imagemDataIndexedDB = {
                                _imagemId: imagemId,
                                source: 'indexeddb',
                                mimeType: this.currentImageData.mimeType,
                                width: this.currentImageData.width || 0,
                                height: this.currentImageData.height || 0
                            };
                            
                            window.localStorageManager.savePersonagemImagem(imagemDataIndexedDB);
                            console.log('💾 Referência salva em localStorage (otimizado)', {
                                imagemId: imagemId,
                                tamanho: JSON.stringify(imagemDataIndexedDB).length + ' bytes'
                            });
                        }
                    } catch (error) {
                        console.warn('⚠️ Erro ao salvar imagem:', error.message);
                    }
                }
            } else {
                console.error('❌ Dados de imagem inválidos');
                this.showSaveError('Dados inválidos');
                return;
            }

            // ✅ NOVO: Forçar sincronização de imagem após salvar
            if (window.imagemPersonagemSync && typeof window.imagemPersonagemSync.forceSync === 'function') {
                console.log('🔄 [PersonagemImageController] Forçando sincronização de imagem...');
                window.imagemPersonagemSync.forceSync();
            }

            // ✅ Sucesso
            this.saveBtn.textContent = '✅ Salvo!';
            this.saveBtn.classList.add('personagem-image-modal__btn--success');

            setTimeout(() => this.resetSaveButton(), 1500);

        } catch (error) {
            console.error('❌ Erro crítico ao salvar:', error);
            this.showSaveError('Erro: ' + (error.message || 'desconhecido').substring(0, 30));
            this.saveBtn.disabled = false;
        }
    }

    /**
     * Reseta o botão de salvar
     */
    resetSaveButton() {
        this.closeModal();
        this.saveBtn.textContent = 'Salvar Imagem';
        this.saveBtn.classList.remove('personagem-image-modal__btn--success');
        this.saveBtn.disabled = false;
    }

    /**
     * Mostra erro ao salvar
     */
    showSaveError(message) {
        this.saveBtn.textContent = '❌ ' + message.substring(0, 30);
        setTimeout(() => {
            this.saveBtn.textContent = 'Salvar Imagem';
            this.saveBtn.disabled = false;
        }, 3000);
    }

    /**
     * Reseta o formulário
     */
    resetForm() {
        if (this.fileInput) this.fileInput.value = '';
        if (this.urlInput) this.urlInput.value = '';
        if (this.uploadInfo) this.uploadInfo.textContent = '';
        if (this.urlInfo) this.urlInfo.textContent = '';
        this.previewError?.style.setProperty('display', 'none');
        if (this.previewImg) this.previewImg.style.opacity = '1';
    }

    /**
     * Valida se existe imagem válida no preview
     */
    hasValidPreview() {
        return this.currentImageData !== null && this.currentImageType !== null;
    }
}

// Instância global e inicialização
let personagemImageController = null;

document.addEventListener('DOMContentLoaded', () => {
    personagemImageController = new PersonagemImageController();
});
