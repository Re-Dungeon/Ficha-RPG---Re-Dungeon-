/**
 * ════════════════════════════════════════════════════════════════════════════════
 * IMAGEM-PERSONAGEM-SYNC.JS
 * SINCRONIZAÇÃO AUTOMÁTICA DA IMAGEM DO PERSONAGEM
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Problema Resolvido:
 * - Imagem do personagem (#personagem-frame) desaparecia ao pressionar F5
 * - loadSavedImage() era chamado no init() mas nem sempre o elemento existia no DOM
 * 
 * Solução:
 * - Sincroniza imagem do IndexedDB/localStorage para o elemento #personagem-frame
 * - Executa ao carregar (DOMContentLoaded) e periodicamente (fallback)
 * - Detecta quando a imagem muda e reaplica automaticamente
 */

class ImagemPersonagemSync {
    constructor() {
        this.lastImagemUrl = null;
        this.syncInterval = null;
        this.personagemFrameElement = null;
        this.personagemImageElement = null;
        this.personagemImageModalPreview = null;  // NOVO: Preview do modal
        
        console.log('🖼️ [ImagemPersonagemSync] Inicializando...');
        this.init();
    }

    /**
     * Inicializa o sistema de sincronização de imagem
     */
    init() {
        // Aguardar que o DOM esteja completamente carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('🖼️ [ImagemPersonagemSync] DOMContentLoaded detectado, iniciando sincronização...');
                this.startSync();
            });
        } else {
            // DOM já está carregado
            this.startSync();
        }
    }

    /**
     * Inicia a sincronização ativa
     */
    startSync() {
        this.selectElements();
        
        // Sincronizar imediatamente na primeira execução
        this.performSync();
        
        // Sincronizar novamente após 200ms (rápido)
        setTimeout(() => {
            this.selectElements();  // Tentar buscar elementos novamente
            console.log('🔄 [ImagemPersonagemSync] Sincronização em 200ms...');
            this.performSync();
        }, 200);
        
        // Sincronizar após 500ms (IndexedDB pode estar ainda carregando)
        setTimeout(() => {
            this.selectElements();  // Tentar buscar elementos novamente
            console.log('🔄 [ImagemPersonagemSync] Sincronização em 500ms...');
            this.performSync();
        }, 500);
        
        // Sincronizar após 1s (safety net)
        setTimeout(() => {
            this.selectElements();  // Tentar buscar elementos novamente
            console.log('🔄 [ImagemPersonagemSync] Sincronização em 1s (safety net)...');
            this.performSync();
        }, 1000);
        
        // Sincronizar após 2s (last resort)
        setTimeout(() => {
            this.selectElements();  // Tentar buscar elementos novamente
            console.log('🔄 [ImagemPersonagemSync] Sincronização em 2s (last resort)...');
            this.performSync();
        }, 2000);
        
        // Sincronizar a cada 3 segundos (fallback contínuo)
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, 3000);
        
        console.log('✅ [ImagemPersonagemSync] Sincronização periódica ativada (agressiva: 200ms, 500ms, 1s, 2s, depois a cada 3s)');

        // Sincronizar quando a aba ficar visível novamente
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👁️ [ImagemPersonagemSync] Aba visível novamente - sincronizando...');
                this.performSync();
            }
        });
    }

    /**
     * Seleciona os elementos do DOM
     */
    selectElements() {
        // Elemento de container
        this.personagemFrameElement = document.getElementById('personagem-frame');
        
        // Elemento <img> que recebe a imagem
        this.personagemImageElement = document.getElementById('personagem-imagem');
        
        // NOVO: Elemento do preview do modal (para sincronização total)
        this.personagemImageModalPreview = document.getElementById('personagem-image-modal-preview');
        
        if (!this.personagemFrameElement) {
            console.warn('⚠️ [ImagemPersonagemSync] Elemento #personagem-frame não encontrado');
        }
        if (!this.personagemImageElement) {
            console.warn('⚠️ [ImagemPersonagemSync] Elemento #personagem-imagem não encontrado');
        }
        if (!this.personagemImageModalPreview) {
            console.warn('⚠️ [ImagemPersonagemSync] Elemento #personagem-image-modal-preview não encontrado');
        }
    }

    /**
     * Sincroniza a imagem salva com o elemento no DOM
     */
    async performSync() {
        try {
            // Tentar encontrar elementos se ainda não foram encontrados
            if (!this.personagemFrameElement || !this.personagemImageElement) {
                this.selectElements();
                // Se ainda não encontrou, retorna
                if (!this.personagemImageElement && !this.personagemFrameElement) {
                    return;
                }
            }

            // Carregar imagem salva de todas as fontes possíveis
            const imagemData = await this.loadImagemSalva();

            if (imagemData && imagemData.dataUrl) {
                const imagemUrl = imagemData.dataUrl;

                // Verificar se a imagem mudou desde a última sincronização
                if (imagemUrl !== this.lastImagemUrl) {
                    console.log('🖼️ [ImagemPersonagemSync] Detectada mudança na imagem, atualizando DOM...');
                    
                    // Aplicar imagem ao elemento #personagem-imagem (novo padrão)
                    if (this.personagemImageElement) {
                        this.personagemImageElement.src = imagemUrl;
                        console.log('✅ [ImagemPersonagemSync] Imagem atualizada em #personagem-imagem');
                    }

                    // Aplicar imagem ao elemento #personagem-frame (compatibilidade)
                    if (this.personagemFrameElement) {
                        this.personagemFrameElement.src = imagemUrl;
                        console.log('✅ [ImagemPersonagemSync] Imagem atualizada em #personagem-frame');
                    }

                    // NOVO: Aplicar imagem ao preview do modal também
                    if (this.personagemImageModalPreview) {
                        this.personagemImageModalPreview.src = imagemUrl;
                        console.log('✅ [ImagemPersonagemSync] Imagem atualizada em #personagem-image-modal-preview');
                    }

                    this.lastImagemUrl = imagemUrl;
                }
            } else {
                // Nenhuma imagem salva
                if (this.lastImagemUrl !== null) {
                    console.log('ℹ️ [ImagemPersonagemSync] Nenhuma imagem salva detectada');
                    this.lastImagemUrl = null;
                }
            }
        } catch (erro) {
            console.error('❌ [ImagemPersonagemSync] Erro ao sincronizar imagem:', erro);
        }
    }

    /**
     * Carrega a imagem salva de todas as fontes possíveis
     * Implementa fallback encadeado para máxima compatibilidade
     * 
     * @returns {Promise<Object>} {dataUrl, source, ...}
     */
    async loadImagemSalva() {
        // CAMADA 1: Referência MINIMAL otimizada no localStorage
        if (window.localStorageManager) {
            try {
                const referencia = window.localStorageManager.loadPersonagemImagemMinimal();
                
                if (referencia && referencia._id && typeof ImagemStorageManager !== 'undefined') {
                    try {
                        const imagemComprimida = await ImagemStorageManager.carregarImagem(referencia._id);
                        if (imagemComprimida) {
                            return {
                                dataUrl: imagemComprimida,
                                source: 'indexeddb_minimal',
                                mimeType: 'image/jpeg'
                            };
                        }
                    } catch (e) {
                        console.warn('⚠️ [ImagemPersonagemSync] Erro ao carregar do IndexedDB (minimal):', e.message);
                    }
                }
            } catch (e) {
                // Silenciosamente ignorar
            }
        }

        // CAMADA 2: Formato antigo com _imagemId
        if (window.localStorageManager) {
            try {
                const imagemAntiga = window.localStorageManager.loadPersonagemImagem();
                
                if (imagemAntiga && imagemAntiga._imagemId && typeof ImagemStorageManager !== 'undefined') {
                    try {
                        const imagemComprimida = await ImagemStorageManager.carregarImagem(imagemAntiga._imagemId);
                        if (imagemComprimida) {
                            return {
                                dataUrl: imagemComprimida,
                                source: 'indexeddb_legacy',
                                mimeType: imagemAntiga.mimeType || 'image/jpeg'
                            };
                        }
                    } catch (e) {
                        console.warn('⚠️ [ImagemPersonagemSync] Erro ao carregar do IndexedDB (legacy):', e.message);
                    }
                } 
                // CAMADA 3: Base64 direto no localStorage (fallback)
                else if (imagemAntiga && imagemAntiga.dataUrl && imagemAntiga.dataUrl.startsWith('data:')) {
                    return {
                        dataUrl: imagemAntiga.dataUrl,
                        source: 'localstorage_base64',
                        mimeType: imagemAntiga.mimeType || 'image/jpeg'
                    };
                } 
                // CAMADA 4: URL direta
                else if (imagemAntiga && imagemAntiga.sourceUrl) {
                    return {
                        dataUrl: imagemAntiga.sourceUrl,
                        source: 'url_direct',
                        mimeType: imagemAntiga.mimeType || 'image/jpeg'
                    };
                }
            } catch (e) {
                // Silenciosamente ignorar
            }
        }

        // CAMADA 5: IndexedDB direto
        if (typeof ImagemStorageManager !== 'undefined') {
            try {
                const imagemDireto = await ImagemStorageManager.carregarImagem('personagem_imagem');
                if (imagemDireto) {
                    return {
                        dataUrl: imagemDireto,
                        source: 'indexeddb_direct',
                        mimeType: 'image/jpeg'
                    };
                }
            } catch (e) {
                // Silenciosamente ignorar
            }
        }

        // CAMADA 6: imageDBManager (compatibilidade legada)
        if (typeof imageDBManager !== 'undefined') {
            try {
                const imagem = await imageDBManager.getImage();
                if (imagem) {
                    return {
                        dataUrl: imagem.dataUrl || imagem.data,
                        source: 'imagedbmanager',
                        mimeType: imagem.mimeType || 'image/jpeg'
                    };
                }
            } catch (e) {
                // Silenciosamente ignorar
            }
        }

        // Nenhuma imagem encontrada
        return null;
    }

    /**
     * Força uma sincronização da imagem
     */
    forceSync() {
        console.log('🔄 [ImagemPersonagemSync] Sincronização forçada solicitada');
        this.performSync();
    }

    /**
     * Desativa o sistema de sincronização
     */
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            console.log('🛑 [ImagemPersonagemSync] Sincronização periódica desativada');
        }
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO GLOBAL
// ════════════════════════════════════════════════════════════════════════════════

// Criar instância global
window.imagemPersonagemSync = new ImagemPersonagemSync();
console.log('✅ [ImagemPersonagemSync] Sistema de sincronização de imagem inicializado');
