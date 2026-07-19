/**
 * 💾 GERENCIADOR DE PERSISTÊNCIA DE ARTS/CORES/VARIANTES DO COMPANHEIRO
 * Salva e carrega cores, arts e variantes do companheiro no localStorage
 */

class CompanheiroArtsPersistence {
    constructor() {
        this.saveTimer = null;  // ✅ NOVO: Timer para batch save
        this.saveDelay = 500;   // Aguarda 500ms antes de salvar
        this.inicializar();
    }

    inicializar() {
        console.log('💾 [CompanheiroArtsPersistence] Inicializando...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupListeners());
        } else {
            this.setupListeners();
        }
    }

    /**
     * ✅ NOVO: Salvar com batching para evitar exceder quota
     */
    agendarSave() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        
        this.saveTimer = setTimeout(() => {
            try {
                window.companheirosManager?.salvarNoStorage();
                console.log('💾 [Persistence] Batch save executado');
            } catch (error) {
                console.error('❌ [Persistence] Erro ao salvar:', error.message);
                if (error.name === 'QuotaExceededError') {
                    console.warn('⚠️ localStorage cheio! Limpando cache desnecessário...');
                    this.limparCache();
                }
            }
        }, this.saveDelay);
    }

    /**
     * ✅ NOVO: Limpar cache de imagens para liberar espaço
     */
    limparCache() {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        if (!companheiroEmEdicao) return;

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro) return;

        let imagensCortadas = 0;

        // Limpar imagens de núcleos (manter apenas 256KB de imagem)
        if (companheiro.cores) {
            companheiro.cores.forEach(core => {
                if (core.image && typeof core.image === 'string' && core.image.startsWith('data:')) {
                    const sizeMB = core.image.length / 1024 / 1024;
                    if (sizeMB > 0.25) {  // Se imagem > 256KB
                        console.warn(`🖼️ Imagem de núcleo "${core.name}" muito grande (${sizeMB.toFixed(2)}MB), removendo`);
                        core.image = null;
                        imagensCortadas++;
                    }
                }
            });
        }

        // Limpar imagens de arts
        if (companheiro.arts) {
            companheiro.arts.forEach(art => {
                if (art.image && typeof art.image === 'string' && art.image.startsWith('data:')) {
                    const sizeMB = art.image.length / 1024 / 1024;
                    if (sizeMB > 0.25) {  // Se imagem > 256KB
                        console.warn(`🖼️ Imagem de art "${art.name}" muito grande (${sizeMB.toFixed(2)}MB), removendo`);
                        art.image = null;
                        imagensCortadas++;
                    }
                }
            });
        }

        if (imagensCortadas > 0) {
            console.log(`✅ ${imagensCortadas} imagens cortadas para liberar espaço`);
            try {
                window.companheirosManager?.salvarNoStorage();
                console.log('✅ Storage salvo com sucesso após limpeza');
            } catch (error) {
                console.error('❌ Ainda sem espaço mesmo após limpeza:', error.message);
            }
        }
    }

    setupListeners() {
        console.log('💾 [CompanheiroArtsPersistence] Configurando listeners...');
        
        // Quando criar/atualizar/deletar núcleo
        window.addEventListener('companheiroCreateCore', (e) => {
            console.log('💾 [Persistence] Núcleo CREATE event recebido:', e.detail);
            
            // ✅ NOVO: Validar dados
            if (!e.detail || !e.detail.core || !e.detail.core.name) {
                console.warn('⚠️ [Persistence] Núcleo com dados inválidos, ignorando');
                return;
            }
            
            this.salvarCoresToCompanheiro(e.detail.core, 'create');
        });

        window.addEventListener('companheiroUpdateCore', (e) => {
            console.log('💾 [Persistence] Núcleo UPDATE event recebido:', e.detail);
            
            // ✅ NOVO: Validar dados
            if (!e.detail || !e.detail.core || !e.detail.core.name) {
                console.warn('⚠️ [Persistence] Núcleo com dados inválidos, ignorando');
                return;
            }
            
            this.salvarCoresToCompanheiro(e.detail.core, 'update');
        });

        window.addEventListener('companheiroDeleteCore', (e) => {
            console.log('💾 [Persistence] Núcleo DELETE event recebido:', e.detail);
            this.deletarCoreDoCompanheiro(e.detail.coreId);
        });

        console.log('✅ [CompanheiroArtsPersistence] Listeners configurados');
    }

    /**
     * Salvar núcleo para o companheiro em edição
     */
    salvarCoresToCompanheiro(core, action = 'create') {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) {
            console.warn('⚠️ Nenhum companheiro em edição');
            return;
        }

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro) {
            console.error('❌ Companheiro não encontrado:', companheiroEmEdicao);
            return;
        }

        // Inicializar array cores se não existir
        if (!companheiro.cores) {
            companheiro.cores = [];
        }

        if (action === 'create') {
            // Verificar se já existe com mesmo ID
            const existe = companheiro.cores.find(c => c.id === core.id);
            if (!existe) {
                companheiro.cores.push(core);
                console.log('✅ Núcleo salvo na estrutura do companheiro');
            } else {
                console.warn('⚠️ Núcleo com ID já existe');
            }
        } else if (action === 'update') {
            const index = companheiro.cores.findIndex(c => c.id === core.id);
            if (index !== -1) {
                companheiro.cores[index] = core;
                console.log('✅ Núcleo atualizado na estrutura do companheiro');
            }
        }

        // ✅ NOVO: Usar agendarSave() para batch save
        this.agendarSave();
    }

    /**
     * Deletar núcleo do companheiro
     */
    deletarCoreDoCompanheiro(coreId) {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) {
            console.warn('⚠️ Nenhum companheiro em edição');
            return;
        }

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro) return;

        if (companheiro.cores) {
            companheiro.cores = companheiro.cores.filter(c => c.id !== coreId);
            // Também remover arts associadas
            if (companheiro.arts) {
                companheiro.arts = companheiro.arts.filter(a => a.coreId !== coreId);
            }
            this.agendarSave();
            console.log('✅ Núcleo deletado do companheiro');
        }
    }

    /**
     * Salvar art para o companheiro em edição
     */
    salvarArtToCompanheiro(art) {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) {
            console.warn('⚠️ Nenhum companheiro em edição');
            return;
        }

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro) {
            console.error('❌ Companheiro não encontrado');
            return;
        }

        // Inicializar array arts se não existir
        if (!companheiro.arts) {
            companheiro.arts = [];
        }

        // Verificar se já existe
        const existe = companheiro.arts.find(a => a.id === art.id);
        if (!existe) {
            companheiro.arts.push(art);
            console.log('✅ Art salva na estrutura do companheiro');
        } else {
            console.warn('⚠️ Art com ID já existe');
        }

        // ✅ NOVO: Usar agendarSave() para batch save
        this.agendarSave();
    }

    /**
     * Atualizar art
     */
    atualizarArtDoCompanheiro(art) {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) return;

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro || !companheiro.arts) return;

        const index = companheiro.arts.findIndex(a => a.id === art.id);
        if (index !== -1) {
            companheiro.arts[index] = art;
            window.companheirosManager?.salvarNoStorage();
            console.log('✅ Art atualizada na estrutura do companheiro');
        }
    }

    /**
     * Deletar art do companheiro
     */
    deletarArtDoCompanheiro(artId) {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) return;

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro || !companheiro.arts) return;

        companheiro.arts = companheiro.arts.filter(a => a.id !== artId);
        this.agendarSave();
        console.log('✅ Art deletada do companheiro');
    }

    /**
     * Salvar variante do companheiro
     */
    salvarVarianteDoCompanheiro(variante) {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) return;

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro) return;

        if (!companheiro.variantes) {
            companheiro.variantes = [];
        }

        const existe = companheiro.variantes.find(v => v.id === variante.id);
        if (!existe) {
            companheiro.variantes.push(variante);
            console.log('✅ Variante salva na estrutura do companheiro');
        }

        this.agendarSave();
    }

    /**
     * Deletar variante do companheiro
     */
    deletarVarianteDoCompanheiro(varianteId) {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) return;

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro || !companheiro.variantes) return;

        companheiro.variantes = companheiro.variantes.filter(v => v.id !== varianteId);
        this.agendarSave();
        console.log('✅ Variante deletada do companheiro');
    }

    /**
     * Carregar cores do companheiro para renderizar
     */
    carregarCoresDoCompanheiro() {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) return [];

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro || !companheiro.cores) return [];

        return companheiro.cores;
    }

    /**
     * Carregar arts do companheiro para renderizar
     */
    carregarArtsDoCompanheiro() {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) return [];

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro || !companheiro.arts) return [];

        return companheiro.arts;
    }

    /**
     * Carregar variantes do companheiro para renderizar
     */
    carregarVariantesDoCompanheiro() {
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        
        if (!companheiroEmEdicao) return [];

        const companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
        if (!companheiro || !companheiro.variantes) return [];

        return companheiro.variantes;
    }
}

// Instância global
window.companheiroArtsPersistence = new CompanheiroArtsPersistence();

console.log('✅ CompanheiroArtsPersistence carregado');
