/**
 * 🐾 SISTEMA DE ARTS/HABILIDADES DO COMPANHEIRO
 * Gerencia cálculos de limite de arts, contagem por tipo/domínio
 * e sincronização com atributos da aba de características
 */

class CompanheiroArtsSystem {
    constructor() {
        this.modalId = 'modalNovoCompanheiro';
        this.inicializar();
    }

    inicializar() {
        console.log('🎯 [CompanheiroArtsSystem] Inicializando...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurarObservadores());
        } else {
            this.configurarObservadores();
        }
    }

    /**
     * Configurar observadores de mudanças na aba de habilidades
     */
    configurarObservadores() {
        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.warn('⚠️ [CompanheiroArtsSystem] Modal não encontrada');
            return;
        }

        // ✅ USAR EVENT DELEGATION para capturar cliques em abas
        // Isso funciona com o novo sistema de alternância de abas
        modal.addEventListener('click', (e) => {
            const btnClicado = e.target.closest('.modal-aba-btn');
            if (btnClicado) {
                const abaAtiva = btnClicado.getAttribute('data-aba');
                if (abaAtiva === 'habilidades') {
                    console.log('🎯 [CompanheiroArtsSystem] Aba de habilidades ativada, atualizando stats...');
                    setTimeout(() => {
                        this.atualizarStatsPanel();
                        // ✅ NOVO: Carregar dados persistidos ao abrir aba
                        this.carregarDadosPersistidos();
                    }, 100);
                }
            }
        });

        console.log('✅ [CompanheiroArtsSystem] Observadores configurados');
    }

    /**
     * ✅ NOVO: Carregar dados persistidos de cores, arts e variantes
     */
    carregarDadosPersistidos() {
        console.log('💾 [carregarDadosPersistidos] Carregando dados persistidos...');
        
        if (!window.companheiroArtsPersistence) {
            return;
        }

        // ✅ NOVO: Verificar se renderer está carregado, se não, tentar novamente depois
        if (!window.companheiroArtsRenderer) {
            setTimeout(() => this.carregarDadosPersistidos(), 500);
            return;
        }

        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // ✅ NOVO: Ativar flag de carregamento para evitar re-salvamento
        window.companheiroArtsRenderer.carregando = true;
        console.log('🔄 Flag carregando = true');

        // ✅ CRÍTICO: LIMPAR ARRAYS ANTES DE CARREGAR (evitar compartilhamento de dados entre companheiros)
        window.companheiroArtsRenderer.cores = [];
        window.companheiroArtsRenderer.arts = [];
        console.log('🧹 Arrays cores e arts limpas');

        // Carregar e renderizar cores
        const cores = window.companheiroArtsPersistence.carregarCoresDoCompanheiro();
        console.log(`📊 Cores carregadas: ${cores.length}`);
        
        const coresList = modal.querySelector('#companheiro-arts-cores-list');
        if (coresList) {
            coresList.innerHTML = ''; // Limpar lista
            
            if (cores.length > 0) {
                cores.forEach(core => {
                    window.companheiroArtsRenderer.addCoreToList(core);
                });
            } else {
                coresList.innerHTML = '<p class="empty-message">Nenhum núcleo adicionado</p>';
            }
        }

        // Carregar e renderizar arts
        const arts = window.companheiroArtsPersistence.carregarArtsDoCompanheiro();
        console.log(`📊 Arts carregadas: ${arts.length}`);
        
        const artsList = modal.querySelector('#companheiro-arts-arts-list');
        if (artsList) {
            artsList.innerHTML = ''; // Limpar lista
            
            if (arts.length > 0) {
                arts.forEach(art => {
                    window.companheiroArtsRenderer.addArtToList(art);
                });
            } else {
                artsList.innerHTML = '<p class="empty-message">Nenhuma habilidade adicionada</p>';
            }
        }

        // Carregar e renderizar variantes
        const variantes = window.companheiroArtsPersistence.carregarVariantesDoCompanheiro();
        console.log(`📊 Variantes carregadas: ${variantes.length}`);
        
        // ✅ NOVO: Renderizar variantes
        if (window.companheiroArtsModalManager) {
            window.companheiroArtsModalManager.renderVariantes();
        }

        // ✅ NOVO: Desativar flag de carregamento
        window.companheiroArtsRenderer.carregando = false;
        console.log('🔄 Flag carregando = false');
    }

    /**
     * 📊 CALCULAR MÁXIMO DE ARTS
     * Usa a fórmula: (FOR + VIT + AGI + PER + INT) * 0.0293
     */
    calcularMaxArts(modal = null) {
        if (!modal) {
            modal = document.getElementById(this.modalId);
        }
        if (!modal) return 0;

        // Obter valores dos atributos
        const forca = this.obterTotalAtributo(modal, 'forca');
        const vitalidade = this.obterTotalAtributo(modal, 'vitalidade');
        const agilidade = this.obterTotalAtributo(modal, 'agilidade');
        const inteligencia = this.obterTotalAtributo(modal, 'inteligencia');
        const percepcao = this.obterTotalAtributo(modal, 'percepcao');

        const total = forca + vitalidade + agilidade + inteligencia + percepcao;
        const limite = Math.round(total * 0.0293);

        console.log(`📊 [calcularMaxArts] FOR:${forca} VIT:${vitalidade} AGI:${agilidade} INT:${inteligencia} PER:${percepcao} = ${total} * 0.0293 = ${limite}`);

        return Math.max(0, limite);
    }

    /**
     * Obter valor total de um atributo (base + extra + bonus)
     */
    obterTotalAtributo(modal, atributo) {
        const inputBase = modal.querySelector(`#comp-char-${atributo}-base`);
        const inputExtra = modal.querySelector(`#comp-char-${atributo}-extra`);
        const spanBonus = modal.querySelector(`#comp-char-${atributo}-bonus`);

        const base = inputBase ? parseInt(inputBase.value) || 0 : 0;
        const extra = inputExtra ? parseInt(inputExtra.value) || 0 : 0;
        const bonus = spanBonus ? parseInt(spanBonus.textContent) || 0 : 0;

        return base + extra + bonus;
    }

    /**
     * 🎯 CONTAR ARTS ATIVOS
     * Conta arts que possuem status "ativo"
     */
    contarArtsAtivos(companheiro) {
        if (!companheiro || !companheiro.arts) return 0;
        return companheiro.arts.filter(art => art.ativo !== false).length;
    }

    /**
     * 🔒 CONTAR ARTS BLOQUEADAS
     * Conta arts que possuem status "bloqueado"
     */
    contarArtsBloqueadas(companheiro) {
        if (!companheiro || !companheiro.arts) return 0;
        return companheiro.arts.filter(art => art.bloqueado === true).length;
    }

    /**
     * 🌟 CONTAR VARIAÇÕES
     * Conta total de variações de todas as arts
     */
    contarVariacoes(companheiro) {
        if (!companheiro || !companheiro.arts) return 0;
        return companheiro.arts.reduce((sum, art) => {
            return sum + (art.variantes?.length || 0);
        }, 0);
    }

    /**
     * 📚 AGRUPAR ARTS POR TIPO
     * Analisa campo "type" de cada art
     */
    agruparPorTipo(companheiro) {
        const tipos = {};

        if (!companheiro || !companheiro.arts) return tipos;

        companheiro.arts.forEach(art => {
            const tipo = art.type || 'indefinido';
            tipos[tipo] = (tipos[tipo] || 0) + 1;
        });

        console.log(`📊 Arts por Tipo:`, tipos);
        return tipos;
    }

    /**
     * 🎯 AGRUPAR ARTS POR DOMÍNIO
     * Analisa campo "domain" de cada art (1-5)
     */
    agruparPorDominio(companheiro) {
        const dominios = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (!companheiro || !companheiro.arts) return dominios;

        companheiro.arts.forEach(art => {
            const dominio = art.domain || 1;
            if (dominios.hasOwnProperty(dominio)) {
                dominios[dominio]++;
            }
        });

        console.log(`🎯 Arts por Domínio:`, dominios);
        return dominios;
    }

    /**
     * 📉 GERAR RELATÓRIO COMPLETO
     * Retorna todas as estatísticas em um objeto
     */
    gerarRelatorio(companheiro, modal = null) {
        if (!modal) {
            modal = document.getElementById(this.modalId);
        }

        const maxArts = this.calcularMaxArts(modal);
        const artsAtivos = this.contarArtsAtivos(companheiro);
        const artsBloqueadas = this.contarArtsBloqueadas(companheiro);
        const totalVariacoes = this.contarVariacoes(companheiro);
        const artsPorTipo = this.agruparPorTipo(companheiro);
        const artsPorDominio = this.agruparPorDominio(companheiro);

        const relatorio = {
            maxArts,
            artsAtivos,
            artsBloqueadas,
            totalVariacoes,
            artsPorTipo,
            artsPorDominio,
            percentualUsado: maxArts > 0 ? Math.round((artsAtivos / maxArts) * 100) : 0
        };

        console.log(`📋 [gerarRelatorio]`, relatorio);
        return relatorio;
    }

    /**
     * 🔒 AUTO-BLOQUEIO DE ARTS
     * Bloqueia/desbloqueia arts automaticamente baseado no limite máximo
     */
    aplicarAutoBloqueio(companheiro, maxArts) {
        if (!companheiro || !companheiro.arts) return;

        // Contar arts ativas (não bloqueadas)
        const artsAtivas = companheiro.arts.filter(art => art.ativo !== false && art.bloqueado !== true);
        
        // Se tem mais arts ativas que o limite, bloquear as mais recentes
        if (artsAtivas.length > maxArts) {
            const excedentes = artsAtivas.length - maxArts;
            
            // Ordenar por criação (as mais recentes) e bloquear
            artsAtivas.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))
                .slice(0, excedentes) // Pega as mais recentes
                .forEach(art => {
                    art.bloqueado = true;
                    art.ativo = false;
                });
            
            console.log(`🔒 [aplicarAutoBloqueio] ${excedentes} art(s) bloqueada(s) automaticamente`);
        }
        
        // Tentar desbloquear arts bloqueadas se houver espaço
        const artsBloqueadas = companheiro.arts.filter(art => art.bloqueado === true);
        const artsAtivosAtuais = companheiro.arts.filter(art => art.ativo !== false && art.bloqueado !== true);
        
        if (artsAtivosAtuais.length < maxArts && artsBloqueadas.length > 0) {
            let desbloqueadas = 0;
            for (const art of artsBloqueadas) {
                if (artsAtivosAtuais.length < maxArts) {
                    art.bloqueado = false;
                    art.ativo = true;
                    artsAtivosAtuais.push(art);
                    desbloqueadas++;
                }
            }
            if (desbloqueadas > 0) {
                console.log(`🔓 [aplicarAutoBloqueio] ${desbloqueadas} art(s) desbloqueada(s) automaticamente`);
            }
        }
    }

    /**
     * 🔄 ATUALIZAR PAINEL DE STATS
     * Renderiza o painel com todos os dados
     */
    atualizarStatsPanel(companheiro = null, modal = null) {
        if (!modal) {
            modal = document.getElementById(this.modalId);
        }
        if (!modal) {
            console.warn('⚠️ Modal não encontrada');
            return;
        }

        // Obter companheiro em edição se não fornecido
        if (!companheiro) {
            const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
            if (companheiroEmEdicao) {
                companheiro = window.companheirosManager?.obterPorId?.(companheiroEmEdicao);
            }
        }

        if (!companheiro) {
            console.warn('⚠️ Nenhum companheiro fornecido');
            return;
        }

        // Gerar relatório
        const relatorio = this.gerarRelatorio(companheiro, modal);
        
        // ✅ NOVO: Aplicar auto-bloqueio antes de atualizar o painel
        this.aplicarAutoBloqueio(companheiro, relatorio.maxArts);
        
        // Recalcular relatório após auto-bloqueio
        const relatorioAtualizado = this.gerarRelatorio(companheiro, modal);

        // Atualizar painel stats
        const panel = modal.querySelector('#companheiro-arts-stats-panel');
        if (!panel) {
            console.warn('⚠️ Painel de stats não encontrado');
            return;
        }

        // Renderizar cards de stats
        panel.innerHTML = `
            <div class="companheiro-arts-stats-grid">
                <div class="companheiro-arts-stat-card">
                    <div class="companheiro-arts-stat-label">Limite de Arts</div>
                    <div class="companheiro-arts-stat-value">${relatorioAtualizado.maxArts}</div>
                </div>
                <div class="companheiro-arts-stat-card">
                    <div class="companheiro-arts-stat-label">Arts Ativas</div>
                    <div class="companheiro-arts-stat-value ${relatorioAtualizado.artsAtivos >= relatorioAtualizado.maxArts ? 'warning' : ''}">
                        ${relatorioAtualizado.artsAtivos}
                    </div>
                </div>
                <div class="companheiro-arts-stat-card">
                    <div class="companheiro-arts-stat-label">Arts Bloqueadas</div>
                    <div class="companheiro-arts-stat-value ${relatorioAtualizado.artsBloqueadas > 0 ? 'warning' : ''}">
                        ${relatorioAtualizado.artsBloqueadas}
                    </div>
                </div>
                <div class="companheiro-arts-stat-card">
                    <div class="companheiro-arts-stat-label">Variações</div>
                    <div class="companheiro-arts-stat-value">${relatorioAtualizado.totalVariacoes}</div>
                </div>
            </div>

            <div class="companheiro-arts-stats-breakdown">
                <div class="companheiro-arts-breakdown-group" style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <strong style="font-size: 0.95em; color: #d8b4fe; white-space: nowrap;">📊 Por Tipo:</strong>
                    <div id="companheiro-arts-por-tipo" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${this.renderTiposBadges(relatorioAtualizado.artsPorTipo)}
                    </div>
                </div>
                <div class="companheiro-arts-breakdown-group" style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                    <strong style="font-size: 0.95em; color: #d8b4fe; white-space: nowrap;">🎯 Por Domínio:</strong>
                    <div id="companheiro-arts-por-dominio" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${this.renderDominiosBadges(relatorioAtualizado.artsPorDominio)}
                    </div>
                </div>
            </div>

            <div class="companheiro-arts-stat-bar">
                <div class="companheiro-arts-stat-bar-fill" style="width: ${relatorioAtualizado.maxArts > 0 ? (relatorioAtualizado.artsAtivos / relatorioAtualizado.maxArts) * 100 : 0}%"></div>
                <span class="companheiro-arts-stat-bar-text">${relatorioAtualizado.artsAtivos}/${relatorioAtualizado.maxArts} slots</span>
            </div>
        `;

        console.log('✅ [atualizarStatsPanel] Painel atualizado');
    }

    /**
     * Renderizar badges de tipos
     */
    renderTiposBadges(tipos) {
        // Mapeamento de tipos para emojis e cores (customizar conforme necessário)
        const tiposMap = {
            'ofensiva': { icon: '⚔️', color: '#e74c3c', label: 'Ofensiva' },
            'defensiva': { icon: '🛡️', color: '#3498db', label: 'Defensiva' },
            'estrategica': { icon: '🧠', color: '#f39c12', label: 'Estratégica' },
            'suporte': { icon: '✨', color: '#2ecc71', label: 'Suporte' },
            'controle': { icon: '🎮', color: '#9b59b6', label: 'Controle' },
            'invocacao': { icon: '👥', color: '#1abc9c', label: 'Invocação' },
            'transformacao': { icon: '🔄', color: '#e91e63', label: 'Transformação' },
            'passiva': { icon: '⭐', color: '#95a5a6', label: 'Passiva' },
            'racial': { icon: '🏰', color: '#d8b4fe', label: 'Racial' }
        };

        // Mostrar TODOS os tipos com rótulos (label) definidos no mapa
        return Object.entries(tiposMap)
            .map(([tipo, info]) => {
                const count = tipos[tipo] || 0;
                return `<span class="companheiro-arts-type-badge" style="background: ${info.color}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 0.9em; font-weight: 500; white-space: nowrap; display: inline-block;">
                    ${info.icon} ${info.label}: ${count}
                </span>`;
            })
            .join('');
    }

    /**
     * Renderizar badges de domínios
     */
    renderDominiosBadges(dominios) {
        // Mostrar TODOS os domínios de 1 a 5
        return [1, 2, 3, 4, 5]
            .map(dominio => {
                const count = dominios[dominio] || 0;
                return `<span class="companheiro-arts-domain-badge" style="background: rgba(216, 180, 254, 0.2); border: 1px solid rgba(216, 180, 254, 0.4); padding: 6px 12px; border-radius: 4px; font-size: 0.9em; font-weight: 500; white-space: nowrap; display: inline-block; color: #d8b4fe;">
                    Domínio ${dominio}: ${count}
                </span>`;
            })
            .join('');
    }
}

// Instância global
window.companheiroArtsSystem = new CompanheiroArtsSystem();

console.log('✅ CompanheiroArtsSystem carregado');

