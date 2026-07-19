/* ============================================================= */
/* PERSONAGEM-IMAGE-HANDLER.JS                                  */
/* Sistema avançado de tratamento de imagens para personagem    */
/* ============================================================= */

/**
 * PersonagemImageHandler
 * Gerencia carregamento, compressão e otimização de imagens do personagem
 * - Compressão automática
 * - Fallback em caso de erro
 * - Suporte a múltiplas fontes
 * - Cache de imagens
 * - Lazy loading opcional
 */

class PersonagemImageHandler {
    constructor() {
        this.imageElement = document.getElementById('personagem-imagem');
        this.loadedImages = new Map(); // Cache de imagens carregadas
        this.loadingTimeout = 5000; // 5 segundos timeout
        this.retryAttempts = 3; // Tentar carregar 3 vezes
        
        if (this.imageElement) {
            this.setupImageHandlers();
            // ✅ Carregar imagem salva do IndexedDB ao inicializar
            setTimeout(() => {
                this.restaurarDoIndexedDB().catch(e => 
                    console.warn('⚠️ Erro ao restaurar imagem:', e)
                );
            }, 500);
        }
    }

    /**
     * Configurar handlers de erro e sucesso
     */
    setupImageHandlers() {
        console.log('🖼️ PersonagemImageHandler inicializado');
        
        // Handler de erro
        this.imageElement.addEventListener('error', (e) => this.handleImageError(e));
        
        // Handler de sucesso
        this.imageElement.addEventListener('load', (e) => this.handleImageSuccess(e));
        
        // Handler de timeout
        this.imageLoadTimeout = null;
    }

    /**
     * Carregar imagem com suporte a múltiplas fontes
     * @param {string|File} imagemSource - URL, base64 ou File
     * @param {object} opcoes - {compress, quality, timeout, retry}
     */
    async carregarImagem(imagemSource, opcoes = {}) {
        const {
            compress = true,
            quality = 0.8,
            timeout = this.loadingTimeout,
            retry = this.retryAttempts,
            fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect fill=%22%23333%22 width=%22400%22 height=%22500%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EPersonagem%3C/text%3E%3C/svg%3E'
        } = opcoes;

        try {
            if (!imagemSource) {
                throw new Error('Fonte de imagem vazia');
            }

            console.log('🔄 [PersonagemImageHandler] Carregando imagem...');

            // Se for File, converter para base64
            let imagemData = imagemSource;
            if (imagemSource instanceof File) {
                imagemData = await this.fileToBase64(imagemSource);
                console.log(`📂 Arquivo convertido: ${imagemSource.name} (${(imagemSource.size/1024).toFixed(2)}KB)`);
            }

            // Comprimir se necessário
            if (compress && typeof imagemData === 'string' && imagemData.startsWith('data:image')) {
                console.log('🗜️ Comprimindo imagem...');
                try {
                    imagemData = await ImagemOtimizacao.procesarImagem(imagemData, {
                        maxWidth: 1024,
                        maxHeight: 1024,
                        quality: quality,
                        tamanhMaximoMB: 3
                    });
                    console.log('✅ Imagem comprimida');
                } catch (e) {
                    console.warn('⚠️ Falha na compressão, usando original:', e);
                    // Continuar com imagem original
                }
            }

            // Carregar com retry
            await this.carregarComRetry(imagemData, retry, timeout);

            // Salvar em cache
            this.loadedImages.set('personagem', imagemData);

            // Salvar em IndexedDB
            if (typeof ImagemStorageManager !== 'undefined' && typeof imagemData === 'string' && imagemData.startsWith('data:image')) {
                console.log('💾 Salvando em IndexedDB...');
                await ImagemStorageManager.salvarImagem('personagem_imagem', imagemData, 'personagem')
                    .catch(e => console.warn('⚠️ Erro ao salvar em IndexedDB:', e));
            }

            console.log('✅ Imagem carregada com sucesso');
            return true;

        } catch (error) {
            console.error('❌ Erro ao carregar imagem:', error);
            this.aplicarFallback(fallbackSrc);
            return false;
        }
    }

    /**
     * Carregar imagem com retry automático
     */
    async carregarComRetry(imagemData, tentativas = 3, timeout = 5000) {
        for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
            try {
                console.log(`🔄 Tentativa ${tentativa}/${tentativas}...`);
                await this.carregarComTimeout(imagemData, timeout);
                console.log(`✅ Carregada na tentativa ${tentativa}`);
                return;
            } catch (error) {
                console.warn(`⚠️ Tentativa ${tentativa} falhou:`, error.message);
                
                if (tentativa === tentativas) {
                    throw error; // Última tentativa falhou
                }
                
                // Esperar um pouco antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000 * tentativa));
            }
        }
    }

    /**
     * Carregar com timeout
     */
    async carregarComTimeout(imagemData, timeout) {
        return new Promise((resolve, reject) => {
            // Limpar timeout anterior
            if (this.imageLoadTimeout) {
                clearTimeout(this.imageLoadTimeout);
            }

            // Handler único para sucesso
            const onLoadOnce = () => {
                clearTimeout(this.imageLoadTimeout);
                this.imageElement.removeEventListener('load', onLoadOnce);
                resolve();
            };

            // Handler único para erro
            const onErrorOnce = (error) => {
                clearTimeout(this.imageLoadTimeout);
                this.imageElement.removeEventListener('error', onErrorOnce);
                reject(new Error('Falha ao carregar imagem'));
            };

            // Timeout
            this.imageLoadTimeout = setTimeout(() => {
                this.imageElement.removeEventListener('load', onLoadOnce);
                this.imageElement.removeEventListener('error', onErrorOnce);
                reject(new Error('Timeout ao carregar imagem'));
            }, timeout);

            // Adicionar listeners
            this.imageElement.addEventListener('load', onLoadOnce, { once: true });
            this.imageElement.addEventListener('error', onErrorOnce, { once: true });

            // Carregar imagem
            this.imageElement.src = imagemData;
        });
    }

    /**
     * Converter File para base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Erro ao ler arquivo'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Handler de erro
     */
    handleImageError(event) {
        console.warn('⚠️ Erro ao carregar imagem no elemento');
        this.aplicarFallback();
    }

    /**
     * Handler de sucesso
     */
    handleImageSuccess(event) {
        console.log('✅ Imagem carregada e renderizada com sucesso');
        this.imageElement.style.opacity = '1';
        this.imageElement.style.transition = 'opacity 0.3s ease-in';
    }

    /**
     * Aplicar imagem fallback
     */
    aplicarFallback(fallbackSrc = null) {
        console.log('🎭 Aplicando imagem fallback...');
        
        const src = fallbackSrc || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect fill=%22%23444%22 width=%22400%22 height=%22500%22/%3E%3Ctext x=%2250%25%22 y=%2245%25%22 fill=%22%23999%22 text-anchor=%22middle%22 font-size=%2220%22%3EPersonagem%3C/text%3E%3Ctext x=%2250%25%22 y=%2260%25%22 fill=%22%23666%22 text-anchor=%22middle%22 font-size=%2214%22%3E(Imagem indisponível)%3C/text%3E%3C/svg%3E';
        
        if (this.imageElement) {
            this.imageElement.src = src;
            this.imageElement.style.opacity = '0.7';
        }
    }

    /**
     * Restaurar imagem do IndexedDB
     */
    async restaurarDoIndexedDB() {
        try {
            if (typeof ImagemStorageManager === 'undefined') {
                console.warn('⚠️ ImagemStorageManager não disponível');
                return false;
            }

            console.log('📂 Restaurando imagem do IndexedDB...');
            const imagemData = await ImagemStorageManager.carregarImagem('personagem_imagem');
            
            if (imagemData) {
                await this.carregarImagem(imagemData, { compress: false });
                console.log('✅ Imagem restaurada do IndexedDB');
                return true;
            } else {
                console.log('ℹ️ Nenhuma imagem salva no IndexedDB');
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Erro ao restaurar do IndexedDB:', error);
            return false;
        }
    }

    /**
     * Obter informações da imagem carregada
     */
    obterInfo() {
        if (!this.imageElement) {
            return null;
        }

        return {
            src: this.imageElement.src?.substring(0, 100) + '...',
            naturalWidth: this.imageElement.naturalWidth,
            naturalHeight: this.imageElement.naturalHeight,
            displayWidth: this.imageElement.width,
            displayHeight: this.imageElement.height,
            completo: this.imageElement.complete,
            tamanhoEstimado: this.imageElement.src?.length || 0
        };
    }

    /**
     * Limpar cache
     */
    limparCache() {
        console.log('🧹 Limpando cache de imagens...');
        this.loadedImages.clear();
        console.log('✅ Cache limpo');
    }

    /**
     * Deletar imagem do IndexedDB
     */
    async deletarDoIndexedDB() {
        try {
            if (typeof ImagemStorageManager === 'undefined') {
                return false;
            }

            console.log('🗑️ Deletando imagem do IndexedDB...');
            await ImagemStorageManager.deletarImagem('personagem_imagem');
            console.log('✅ Imagem deletada');
            return true;
        } catch (error) {
            console.warn('⚠️ Erro ao deletar:', error);
            return false;
        }
    }
}

// Instância global
window.personagemImageHandler = null;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.personagemImageHandler = new PersonagemImageHandler();
    console.log('✅ PersonagemImageHandler carregado');
});

console.log('✅ PersonagemImageHandler script carregado');
