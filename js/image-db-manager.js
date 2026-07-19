/* ============================================ */
/* IMAGE-DB-MANAGER.JS - Gerenciador IndexedDB */
/* Tratamento Profissional de Imagens          */
/* ============================================ */

class ImageDBManager {
    constructor() {
        this.dbName = 'ReDungeonDB';
        this.dbVersion = 6;  // Incrementado para criar "personagem-images" store
        this.storeName = 'personagem-images';
        this.db = null;
        this.initPromise = null;
    }

    /**
     * Inicializa IndexedDB profissional
     */
    async initDB() {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Erro ao abrir IndexedDB:', request.error);
                this.initPromise = null;
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB inicializado com sucesso');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('format', 'format', { unique: false });
                    console.log('✅ Object Store criado com índices');
                }
            };
        });

        return this.initPromise;
    }

    /**
     * Salva imagem profissionalmente em IndexedDB com tratamento de erro robusto
     */
    async saveImage(imageData, metadata = {}) {
        try {
            await this.initDB();

            // 🔴 CRÍTICO: Verificar se store existe ANTES de tentar usar
            if (!this.db.objectStoreNames.contains(this.storeName)) {
                const errorMsg = `❌ CRÍTICO: Object Store "${this.storeName}" não existe! Versão do DB pode estar desatualizada.`;
                console.error(errorMsg);
                console.error('Solução: Abra console e execute: indexedDB.deleteDatabase("ReDungeonDB"); location.reload();');
                // Retornar erro para que localStorage seja usado como fallback
                return { success: false, reason: 'store_not_found', message: errorMsg };
            }

            return new Promise((resolve, reject) => {
                try {
                    const transaction = this.db.transaction([this.storeName], 'readwrite');
                    const store = transaction.objectStore(this.storeName);

                    const record = {
                        id: 'personagem-image',
                        data: imageData,
                        mimeType: metadata.mimeType || 'image/png',
                        size: metadata.size || 0,
                        width: metadata.width || 0,
                        height: metadata.height || 0,
                        format: metadata.format || 'unknown',
                        source: metadata.source || 'local', // 'local', 'url', 'clipboard'
                        sourceUrl: metadata.sourceUrl || '',
                        timestamp: new Date().toISOString(),
                        dataUrlLength: typeof imageData === 'string' ? imageData.length : 0
                    };

                    const request = store.put(record);

                    request.onsuccess = () => {
                        console.log('✅ Imagem salva em IndexedDB', {
                            formato: record.format.toUpperCase(),
                            tamanho: this.formatSize(record.size),
                            mimeType: record.mimeType,
                            dimensões: `${record.width}x${record.height}`
                        });
                        resolve(record);
                    };

                    request.onerror = () => {
                        console.error('❌ Erro ao salvar em IndexedDB:', request.error);
                        resolve({ success: false, error: request.error }); // Fallback para localStorage
                    };

                    // Tratamento de erro de transação
                    transaction.onerror = () => {
                        console.error('❌ Erro na transação:', transaction.error);
                        resolve({ success: false, error: transaction.error }); // Fallback para localStorage
                    };

                    transaction.onabort = () => {
                        console.warn('⚠️ Transação abortada');
                        resolve({ success: false, reason: 'aborted' }); // Fallback para localStorage
                    };
                } catch (txError) {
                    console.warn('⚠️ Erro na transação saveImage:', txError.message);
                    resolve({ success: false, error: txError }); // Fallback para localStorage
                }
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar IndexedDB:', error);
            // Falhar graciosamente - localStorage será usado como fallback
            return { success: false, error: error.message };
        }
    }

    /**
     * Recupera imagem do IndexedDB com tratamento robusto
     */
    async getImage() {
        try {
            await this.initDB();

            return new Promise((resolve, reject) => {
                try {
                    // 🔴 CRÍTICO: Verificar se store existe
                    if (!this.db.objectStoreNames.contains(this.storeName)) {
                        console.warn(`⚠️ Object Store "${this.storeName}" não existe`);
                        console.warn('💡 Solução: indexedDB.deleteDatabase("ReDungeonDB"); location.reload();');
                        resolve(null);
                        return;
                    }

                    const transaction = this.db.transaction([this.storeName], 'readonly');
                    const store = transaction.objectStore(this.storeName);
                    const request = store.get('personagem-image');

                    request.onsuccess = () => {
                        if (request.result) {
                            console.log('✅ Imagem recuperada do IndexedDB', {
                                formato: request.result.format.toUpperCase(),
                                tamanho: this.formatSize(request.result.size),
                                dimensões: `${request.result.width}x${request.result.height}`
                            });
                            resolve(request.result);
                        } else {
                            console.log('ℹ️  Nenhuma imagem salva ainda');
                            resolve(null);
                        }
                    };

                    request.onerror = () => {
                        console.error('❌ Erro ao recuperar:', request.error);
                        resolve(null);  // Fallback: retornar null
                    };

                    transaction.onerror = () => {
                        console.error('❌ Erro na transação getImage:', transaction.error);
                        resolve(null);
                    };

                    transaction.onabort = () => {
                        console.warn('⚠️ Transação getImage abortada');
                        resolve(null);
                    };
                } catch (txError) {
                    console.warn('⚠️ Erro na transação getImage:', txError.message);
                    resolve(null);  // Fallback: retornar null
                }
            });
        } catch (error) {
            console.error('❌ Erro no getImage:', error);
            return null;
        }
    }

    /**
     * Limpa imagem do IndexedDB com tratamento robusto
     */
    async clearImage() {
        try {
            await this.initDB();

            return new Promise((resolve, reject) => {
                try {
                    // Verificar se store existe
                    if (!this.db.objectStoreNames.contains(this.storeName)) {
                        console.warn(`⚠️ Object Store "${this.storeName}" não existe`);
                        resolve();
                        return;
                    }

                    const transaction = this.db.transaction([this.storeName], 'readwrite');
                    const store = transaction.objectStore(this.storeName);
                    const request = store.delete('personagem-image');

                    request.onsuccess = () => {
                        console.log('✅ Imagem limpa do IndexedDB');
                        resolve();
                    };

                    request.onerror = () => {
                        console.error('❌ Erro ao limpar:', request.error);
                        resolve();  // Não rejeitar - apenas resolver
                    };

                    transaction.onerror = () => {
                        console.error('❌ Erro na transação clearImage:', transaction.error);
                        resolve();
                    };
                } catch (txError) {
                    console.warn('⚠️ Erro na transação clearImage:', txError.message);
                    resolve();
                }
            });
        } catch (error) {
            console.error('❌ Erro no clearImage:', error);
            // Não relançar erro
            return Promise.resolve();
        }
    }

    /**
     * Detecta formato de imagem
     */
    detectFormat(blob) {
        const type = (blob.type || '').toLowerCase();
        
        if (type.includes('gif')) return 'gif';
        if (type.includes('png')) return 'png';
        if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
        if (type.includes('webp')) return 'webp';
        if (type.includes('svg')) return 'svg';
        if (type.includes('bmp')) return 'bmp';
        if (type.includes('tiff')) return 'tiff';
        
        return 'image';
    }

    /**
     * Converte arquivo local para Data URL com metadados completos
     */
    async fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const dataUrl = e.target.result;
                
                // Detectar dimensões
                const img = new Image();
                img.onload = () => {
                    resolve({
                        dataUrl: dataUrl,
                        mimeType: file.type || 'image/png',
                        size: file.size,
                        width: img.width,
                        height: img.height,
                        format: this.detectFormat(file),
                        name: file.name,
                        source: 'local'
                    });
                };

                img.onerror = () => {
                    // Se não conseguir carregar como imagem, retorna mesmo assim
                    console.warn('⚠️  Não foi possível detectar dimensões, continuando...');
                    resolve({
                        dataUrl: dataUrl,
                        mimeType: file.type || 'image/png',
                        size: file.size,
                        width: 0,
                        height: 0,
                        format: this.detectFormat(file),
                        name: file.name,
                        source: 'local'
                    });
                };

                img.src = dataUrl;
            };

            reader.onerror = (error) => {
                console.error('❌ Erro ao ler arquivo:', error);
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Carrega imagem de URL com suporte CORS profissional
     * Estratégia: Usa Image Tag (melhor compatibilidade com CORS)
     */
    async loadFromURL(url) {
        try {
            console.log('🔄 Carregando imagem de URL:', url);

            // Validar URL
            try {
                new URL(url);
            } catch (e) {
                throw new Error('URL inválida');
            }

            // Carregar via Image Tag APENAS (sem fetch)
            return await new Promise((resolve) => {
                const img = new Image();
                let completed = false;

                const complete = (width, height) => {
                    if (completed) return;
                    completed = true;
                    console.log('✅ Imagem carregada da URL');
                    
                    // Retorna URL como referência (não tenta converter)
                    resolve({
                        dataUrl: url,
                        mimeType: this.detectMimeTypeFromUrl(url),
                        size: 0,
                        width: width,
                        height: height,
                        format: this.detectFormatFromUrl(url),
                        sourceUrl: url,
                        source: 'url'
                    });
                };

                // Suportar CORS
                img.crossOrigin = 'anonymous';
                img.onload = () => complete(img.width, img.height);
                img.onerror = () => complete(0, 0); // Falha? Retorna mesmo assim
                
                // Timeout: desiste após 5s
                setTimeout(() => complete(0, 0), 5000);

                img.src = url;
            });
        } catch (error) {
            console.error('❌ Erro ao carregar URL:', error);
            throw error;
        }
    }

    /**
     * Detecta tipo MIME a partir da URL
     */
    detectMimeTypeFromUrl(url) {
        const lower = url.toLowerCase();
        if (lower.includes('.gif')) return 'image/gif';
        if (lower.includes('.png')) return 'image/png';
        if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
        if (lower.includes('.webp')) return 'image/webp';
        if (lower.includes('.svg')) return 'image/svg+xml';
        if (lower.includes('.bmp')) return 'image/bmp';
        return 'image/png'; // Default
    }

    /**
     * Detecta formato a partir da URL
     */
    detectFormatFromUrl(url) {
        const lower = url.toLowerCase();
        if (lower.includes('.gif')) return 'gif';
        if (lower.includes('.png')) return 'png';
        if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'jpg';
        if (lower.includes('.webp')) return 'webp';
        if (lower.includes('.svg')) return 'svg';
        if (lower.includes('.bmp')) return 'bmp';
        return 'image';
    }

    /**
     * Detecta formato do blob
     */
    detectFormatFromBlob(blob) {
        const type = (blob.type || '').toLowerCase();
        
        if (type.includes('gif')) return 'gif';
        if (type.includes('png')) return 'png';
        if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
        if (type.includes('webp')) return 'webp';
        if (type.includes('svg')) return 'svg';
        if (type.includes('bmp')) return 'bmp';
        if (type.includes('tiff')) return 'tiff';
        
        return 'image';
    }

    /**
     * Converte Blob para Data URL
     */
    async blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => {
                console.error('❌ Erro ao converter Blob para Data URL');
                reject(reader.error);
            };
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Cria URL de objeto de blob
     */
    createObjectURL(blob) {
        return URL.createObjectURL(blob);
    }

    /**
     * Revoga URL de objeto
     */
    revokeObjectURL(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Formata tamanho em bytes para legível
     */
    formatSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Obtém informações completas da imagem salva
     */
    async getImageInfo() {
        const image = await this.getImage();
        if (!image) return null;

        return {
            formato: image.format.toUpperCase(),
            tamanho: this.formatSize(image.size),
            dimensões: `${image.width}x${image.height}px`,
            tipo: image.mimeType,
            origem: image.source === 'url' ? `URL: ${image.sourceUrl}` : 'Arquivo Local',
            salvoEm: image.timestamp
        };
    }

    /**
     * Valida se uma imagem é válida
     */
    async validateImage(imageData) {
        try {
            const img = new Image();
            return await new Promise((resolve) => {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = imageData;
            });
        } catch {
            return false;
        }
    }

    /**
     * Comprime imagem (se necessário)
     */
    async compressImage(blob, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    (compressedBlob) => {
                        console.log(`📦 Imagem comprimida: ${this.formatSize(blob.size)} → ${this.formatSize(compressedBlob.size)}`);
                        resolve(compressedBlob);
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => {
                console.warn('⚠️  Não foi possível comprimir, retornando original');
                resolve(blob);
            };

            img.src = URL.createObjectURL(blob);
        });
    }
}

// Instância global
const imageDBManager = new ImageDBManager();
