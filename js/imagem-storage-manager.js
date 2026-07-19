/* ============================================================= */
/* IMAGEM-STORAGE-MANAGER.JS                                     */
/* Sistema de armazenamento de imagens em IndexedDB               */
/* ============================================================= */

/**
 * ImagemStorageManager
 * Gerencia armazenamento de imagens em IndexedDB
 * - Mantém imagens base64 no IndexedDB (muito mais espaço)
 * - localStorage mantém apenas REFERÊNCIAS às imagens
 * - Reduz consumo de localStorage drasticamente
 */

const ImagemStorageManager = (() => {
    const DB_NAME = 'redungeon_imagens';
    const DB_VERSION = 1;
    const STORE_NAME = 'imagens';
    
    let db = null;

    /**
     * Inicializar IndexedDB com fallback gracioso
     */
    async function init() {
        return new Promise((resolve, reject) => {
            console.log('📦 Inicializando IndexedDB para imagens...');
            
            // Verificar se IndexedDB está disponível
            if (!window.indexedDB) {
                console.warn('⚠️ IndexedDB não disponível, usando fallback');
                resolve(null); // Retornar null para indicar que IndexedDB não está disponível
                return;
            }
            
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => {
                console.warn('⚠️ Erro ao abrir IndexedDB, usando fallback:', request.error);
                resolve(null); // Resolver com null em vez de rejeitar
            };
            
            request.onsuccess = () => {
                db = request.result;
                console.log('✅ IndexedDB inicializado');
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                console.log('📊 Criando/atualizando schema do IndexedDB...');
                const database = event.target.result;
                
                // Criar object store se não existir
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('tipo', 'tipo', { unique: false });
                    console.log('✅ Object Store criado');
                }
            };
        });
    }

    /**
     * Salvar imagem em IndexedDB
     * @param {string} id - ID único da imagem (ex: "personagem_imagem", "comp_1_imagem")
     * @param {string} base64Data - Dados em base64
     * @param {string} tipo - Tipo: "personagem" ou "companheiro"
     * @returns {Promise}
     */
    async function salvarImagem(id, base64Data, tipo = 'personagem') {
        // ✅ NOVO: Validar entrada
        if (!id) {
            console.warn('⚠️ ID da imagem não fornecido');
            return Promise.resolve(null);
        }

        if (!base64Data || typeof base64Data !== 'string') {
            console.warn('⚠️ Dados de imagem inválidos:', base64Data);
            return Promise.resolve(null);
        }

        if (!db) {
            await init();
        }

        // Se ainda não tem DB, resolver sem fazer nada
        if (!db) {
            console.warn(`⚠️ IndexedDB indisponível, imagem "${id}" não será salva em BD`);
            return Promise.resolve(id);
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                
                const imagemObj = {
                    id,
                    base64: base64Data,
                    tipo,
                    dataSalva: new Date().getTime(),
                    tamanho: base64Data.length
                };
                
                const request = store.put(imagemObj);
                
                request.onerror = () => {
                    const errorMsg = request.error?.name || 'Erro desconhecido';
                    console.warn('⚠️ Erro ao salvar imagem:', errorMsg);
                    
                    // Se for erro de quota, tenta deletar imagens antigas
                    if (errorMsg === 'QuotaExceededError') {
                        console.warn('⚠️ Quota de IndexedDB excedida, deletando imagens antigas...');
                        limparImagensAntigas()
                            .then(() => {
                                // Tenta novamente
                                const retryRequest = store.put(imagemObj);
                                retryRequest.onsuccess = () => {
                                    console.log(`💾 Imagem "${id}" salva em IndexedDB (retry) (${(imagemObj.tamanho / 1024).toFixed(2)} KB)`);
                                    resolve(id);
                                };
                                retryRequest.onerror = () => {
                                    console.warn('⚠️ Falha ao salvar imagem, continuando sem BD');
                                    resolve(id); // Resolver mesmo com erro
                                };
                            })
                            .catch(e => {
                                console.warn('⚠️ Falha ao limpar imagens, continuando');
                                resolve(id); // Resolver mesmo com erro
                            });
                    } else {
                        console.warn('⚠️ Falha ao salvar imagem, continuando sem persistência');
                        resolve(id); // Resolver em vez de rejeitar
                    }
                };
                
                request.onsuccess = () => {
                    console.log(`💾 Imagem "${id}" salva em IndexedDB (${(imagemObj.tamanho / 1024).toFixed(2)} KB)`);
                    resolve(id);
                };
                
                // Listener para erros de transação
                transaction.onerror = () => {
                    const errorMsg = transaction.error?.name || 'Erro de transação desconhecido';
                    console.error('❌ Erro na transação:', errorMsg);
                    reject(transaction.error);
                };
            } catch (e) {
                console.error('❌ Erro ao processar imagem:', e);
                reject(e);
            }
        });
    }

    /**
     * Deletar imagens antigas para liberar espaço
     * @returns {Promise}
     */
    async function limparImagensAntigas() {
        if (!db) {
            await init();
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const imagens = request.result;
                // Ordena por data (mais antigas primeiro)
                imagens.sort((a, b) => a.dataSalva - b.dataSalva);
                
                // Deleta as 5 imagens mais antigas
                const paraDeleter = imagens.slice(0, 5);
                let deletedCount = 0;
                
                paraDeleter.forEach(img => {
                    const deleteRequest = store.delete(img.id);
                    deleteRequest.onsuccess = () => {
                        deletedCount++;
                        console.log(`🗑️ Imagem "${img.id}" deletada para liberar espaço`);
                        if (deletedCount === paraDeleter.length) {
                            resolve();
                        }
                    };
                });
                
                if (paraDeleter.length === 0) {
                    resolve();
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Carregar imagem do IndexedDB com fallback
     * @param {string} id - ID da imagem
     * @returns {Promise<string|null>}
     */
    async function carregarImagem(id) {
        if (!db) {
            await init();
        }

        // Se ainda não tem DB, retornar null
        if (!db) {
            console.warn(`⚠️ IndexedDB indisponível, não é possível carregar imagem "${id}"`);
            return Promise.resolve(null);
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(id);
                
                request.onerror = () => {
                    console.warn('⚠️ Erro ao carregar imagem:', request.error);
                    resolve(null); // Resolver com null em vez de rejeitar
                };
                
                request.onsuccess = () => {
                    if (request.result) {
                        console.log(`📥 Imagem "${id}" carregada do IndexedDB`);
                        resolve(request.result.base64);
                    } else {
                        console.warn(`⚠️ Imagem "${id}" não encontrada`);
                        resolve(null);
                    }
                };
            } catch (err) {
                console.warn('⚠️ Erro ao carregar imagem:', err);
                resolve(null);
            }
        });
    }

    /**
     * Deletar imagem do IndexedDB
     * @param {string} id - ID da imagem
     * @returns {Promise}
     */
    async function deletarImagem(id) {
        if (!db) {
            await init();
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            
            request.onerror = () => {
                console.error('❌ Erro ao deletar imagem:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                console.log(`🗑️ Imagem "${id}" deletada`);
                resolve();
            };
        });
    }

    /**
     * Listar todas as imagens de um tipo
     * @param {string} tipo - "personagem" ou "companheiro"
     * @returns {Promise<Array>}
     */
    async function listarImagensPorTipo(tipo) {
        if (!db) {
            await init();
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('tipo');
            const request = index.getAll(tipo);
            
            request.onerror = () => {
                console.error('❌ Erro ao listar imagens:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                console.log(`📋 ${request.result.length} imagens de tipo "${tipo}" encontradas`);
                resolve(request.result);
            };
        });
    }

    /**
     * Calcular espaço total usado por imagens
     * @returns {Promise<number>} Tamanho em bytes
     */
    async function calcularEspacoUsado() {
        if (!db) {
            await init();
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            
            request.onerror = () => {
                console.error('❌ Erro ao calcular espaço:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                const totalBytes = request.result.reduce((sum, img) => sum + img.tamanho, 0);
                console.log(`📊 Espaço total de imagens: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
                resolve(totalBytes);
            };
        });
    }

    /**
     * Limpar todas as imagens
     * @returns {Promise}
     */
    async function limparTodas() {
        if (!db) {
            await init();
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();
            
            request.onerror = () => {
                console.error('❌ Erro ao limpar imagens:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                console.log('🗑️ Todas as imagens foram deletadas');
                resolve();
            };
        });
    }

    return {
        init,
        salvarImagem,
        carregarImagem,
        deletarImagem,
        listarImagensPorTipo,
        calcularEspacoUsado,
        limparTodas,
        limparImagensAntigas
    };
})();

console.log('✅ ImagemStorageManager carregado');
