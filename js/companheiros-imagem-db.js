/* ============================================================= */
/* COMPANHEIROS-IMAGEM-DB.JS - IndexedDB para Imagens             */
/* Sistema de armazenamento de imagens de companheiros em IDB     */
/* ============================================================= */

/**
 * CompanheirosImagemDB
 * Gerencia armazenamento de imagens de companheiros em IndexedDB
 * Suporta blobs grandes que não cabem em localStorage
 */

class CompanheirosImagemDB {
    constructor() {
        this.dbName = 'redungeon_companheiros';
        this.storeName = 'imagens';
        this.version = 1;
        this.db = null;
        this.pronto = false; // Flag para verificar se está pronto
        
        console.log('🖼️ Inicializando CompanheirosImagemDB...');
        this.inicializar().then(() => {
            this.pronto = true;
            console.log('✅ IndexedDB pronto para usar');
        }).catch(err => {
            console.error('❌ Erro ao inicializar IndexedDB:', err);
        });
    }

    /**
     * Inicializar banco de dados
     */
    inicializar() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('❌ Erro ao abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB aberto com sucesso');
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                console.log('📦 Criando/atualizando estrutura do IndexedDB...');
                const db = e.target.result;
                
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('companheiroId', 'companheiroId', { unique: false });
                    store.createIndex('dataCriacao', 'dataCriacao', { unique: false });
                    console.log('✅ Object Store criado:', this.storeName);
                }
            };
        });
    }

    /**
     * Aguardar que IndexedDB esteja pronto
     */
    async aguardarPronto() {
        let tentativas = 0;
        const maxTentativas = 50; // 5 segundos max (50 * 100ms)
        
        while (!this.pronto && tentativas < maxTentativas) {
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }
        
        if (!this.pronto) {
            console.warn('⚠️ IndexedDB não ficou pronto em tempo hábil');
        }
        
        return this.pronto;
    }

    /**
     * 🖼️ Salvar imagem de companheiro
     * @param {string} companheiroId - ID do companheiro
     * @param {string} imagemBase64 - Imagem em base64 ou URL
     * @param {string} tipo - 'url' ou 'upload'
     */
    async salvarImagem(companheiroId, imagemBase64, tipo = 'upload') {
        // Aguardar IndexedDB estar pronto
        await this.aguardarPronto();
        
        if (!this.db) {
            console.warn('⚠️ IndexedDB não inicializado, tentando inicializar...');
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Procurar imagem existente
            const indexRequest = store.index('companheiroId').getAll(companheiroId);
            
            indexRequest.onsuccess = () => {
                const registros = indexRequest.result;
                let id;

                if (registros.length > 0) {
                    // Atualizar existente
                    id = registros[0].id;
                    console.log(`🔄 Atualizando imagem existente: ${companheiroId}`);
                } else {
                    // Criar novo
                    id = `img_${companheiroId}_${Date.now()}`;
                    console.log(`🆕 Criando novo registro de imagem: ${companheiroId}`);
                }

                const dados = {
                    id: id,
                    companheiroId: companheiroId,
                    imagemBase64: imagemBase64,
                    tipo: tipo,
                    dataCriacao: new Date().toISOString(),
                    dataAtualizacao: new Date().toISOString(),
                    tamanho: imagemBase64.length
                };

                const putRequest = store.put(dados);

                putRequest.onsuccess = () => {
                    console.log(`💾 Imagem salva no IndexedDB: ${companheiroId} (${(dados.tamanho / 1024).toFixed(2)}KB)`);
                    resolve(id);
                };

                putRequest.onerror = () => {
                    console.error('❌ Erro ao salvar imagem:', putRequest.error);
                    reject(putRequest.error);
                };
            };

            indexRequest.onerror = () => {
                console.error('❌ Erro ao buscar imagem existente:', indexRequest.error);
                reject(indexRequest.error);
            };
        });
    }

    /**
     * 🖼️ Recuperar imagem de companheiro
     * @param {string} companheiroId - ID do companheiro
     */
    async recuperarImagem(companheiroId) {
        // Aguardar IndexedDB estar pronto
        await this.aguardarPronto();
        
        if (!this.db) {
            console.warn('⚠️ IndexedDB não inicializado');
            return null;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const indexRequest = store.index('companheiroId').getAll(companheiroId);

            indexRequest.onsuccess = () => {
                const registros = indexRequest.result;
                if (registros.length > 0) {
                    console.log(`✅ Imagem recuperada do IndexedDB: ${companheiroId}`);
                    resolve({
                        dados: registros[0].imagemBase64,
                        tipo: registros[0].tipo,
                        dataCriacao: registros[0].dataCriacao
                    });
                } else {
                    console.log(`ℹ️ Nenhuma imagem encontrada para: ${companheiroId}`);
                    resolve(null);
                }
            };

            indexRequest.onerror = () => {
                console.error('❌ Erro ao recuperar imagem:', indexRequest.error);
                reject(indexRequest.error);
            };
        });
    }

    /**
     * 🗑️ Deletar imagem de companheiro
     * @param {string} companheiroId - ID do companheiro
     */
    async deletarImagem(companheiroId) {
        // Aguardar IndexedDB estar pronto
        await this.aguardarPronto();
        
        if (!this.db) {
            console.warn('⚠️ IndexedDB não inicializado');
            return false;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const indexRequest = store.index('companheiroId').getAll(companheiroId);

            indexRequest.onsuccess = () => {
                const registros = indexRequest.result;
                if (registros.length > 0) {
                    const deleteRequest = store.delete(registros[0].id);
                    
                    deleteRequest.onsuccess = () => {
                        console.log(`🗑️ Imagem deletada: ${companheiroId}`);
                        resolve(true);
                    };

                    deleteRequest.onerror = () => {
                        console.error('❌ Erro ao deletar imagem:', deleteRequest.error);
                        reject(deleteRequest.error);
                    };
                } else {
                    console.log(`ℹ️ Nenhuma imagem para deletar: ${companheiroId}`);
                    resolve(true);
                }
            };

            indexRequest.onerror = () => {
                console.error('❌ Erro ao buscar imagem para deletar:', indexRequest.error);
                reject(indexRequest.error);
            };
        });
    }

    /**
     * 📊 Obter informações de todas as imagens armazenadas
     */
    async obterEstatisticas() {
        // Aguardar IndexedDB estar pronto
        await this.aguardarPronto();
        
        if (!this.db) {
            return { total: 0, tamanho: 0, registros: [] };
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                const registros = getAllRequest.result;
                const tamanhoTotal = registros.reduce((sum, reg) => sum + (reg.tamanho || 0), 0);
                
                console.log(`📊 Estatísticas de imagens: ${registros.length} registros, ${(tamanhoTotal / 1024 / 1024).toFixed(2)}MB`);
                
                resolve({
                    total: registros.length,
                    tamanho: tamanhoTotal,
                    registros: registros.map(r => ({
                        id: r.id,
                        companheiroId: r.companheiroId,
                        tamanho: r.tamanho,
                        tipo: r.tipo,
                        dataCriacao: r.dataCriacao
                    }))
                });
            };

            getAllRequest.onerror = () => {
                console.error('❌ Erro ao obter estatísticas:', getAllRequest.error);
                reject(getAllRequest.error);
            };
        });
    }

    /**
     * 🧹 Limpar todas as imagens (para testes)
     */
    async limparTudo() {
        // Aguardar IndexedDB estar pronto
        await this.aguardarPronto();
        
        if (!this.db) {
            console.warn('⚠️ IndexedDB não inicializado');
            return false;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                console.log('🧹 IndexedDB limpo');
                resolve(true);
            };

            clearRequest.onerror = () => {
                console.error('❌ Erro ao limpar:', clearRequest.error);
                reject(clearRequest.error);
            };
        });
    }
}

// Instância global
let companheirosImagemDB = null;

// Inicializar quando documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        companheirosImagemDB = new CompanheirosImagemDB();
        window.companheirosImagemDB = companheirosImagemDB;
    });
} else {
    companheirosImagemDB = new CompanheirosImagemDB();
    window.companheirosImagemDB = companheirosImagemDB;
}

console.log('✅ CompanheirosImagemDB carregado');
