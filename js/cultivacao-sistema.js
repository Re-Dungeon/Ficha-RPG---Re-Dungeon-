/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   CULTIVAÇÃO - GERENCIADOR DE DADOS
   
   Responsável por:
   - Armazenar dados do sistema de cultivação
   - Gerenciar estado global
   - Persistir dados no localStorage
   - Executar cálculos de progresso
   
   Data: 27 de fevereiro de 2026
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CultivacaoDadosManager {
    constructor() {
        this.chave_storage = 'cultivacao_dados';
        this.mundo_ativo = 'elder-gods';
        this.dados = this.carregar();
    }

    carregar() {
        const salvo = localStorage.getItem(this.chave_storage);
        if (salvo) {
            try {
                const dados = JSON.parse(salvo);
                console.log('✅ Dados de cultivação carregados do localStorage:', dados);
                // Validar estrutura de dados
                if (!dados.universal || !dados.universal.dantian || typeof dados.universal.dantian.maximo === 'undefined') {
                    // Dados corrompidos ou em formato antigo, usar padrão
                    console.warn('Dados corrompidos detectados, usando padrão');
                    localStorage.removeItem(this.chave_storage);
                    return this.dados_padrao();
                }
                // Migrar dados antigos para novo formato
                if (dados.universal && dados.universal.dantian) {
                    if (dados.universal.dantian.inferior !== undefined) {
                        // Migrar de formato antigo
                        const dantian_inf_atual = dados.universal.dantian.inferior?.atual || 0;
                        dados.universal.dantian = {
                            atual: dantian_inf_atual,
                            maximo: 50
                        };
                    }
                    if (dados.universal.meridianos && dados.universal.meridianos.total !== undefined) {
                        // Migrar de formato antigo
                        const limpos = dados.universal.meridianos.limpos || 0;
                        dados.universal.meridianos = {
                            limpos: limpos,
                            maximo: 314,
                            principais_limpos: 0,
                            principais_maximo: 12
                        };
                    }
                }
                // Garantir que alma existe
                if (!dados.universal.alma) {
                    dados.universal.alma = {
                        atual: 0,
                        maximo: 100
                    };
                }
                // Garantir que mar_espiritual tem todos os campos
                if (!dados.universal.mar_espiritual) {
                    dados.universal.mar_espiritual = {
                        estado: 'Sereno',
                        tamanho: 0,
                        pureza: 0,
                        estabilidade: 0,
                        descricao: ''
                    };
                } else if (!dados.universal.mar_espiritual.descricao) {
                    dados.universal.mar_espiritual.descricao = '';
                }
                
                // 🔧 Garantir compatibilidade com novo formato de Mar Espiritual
                if (!dados.universal.mar_espiritual.elemento) {
                    dados.universal.mar_espiritual.elemento = 'agua';
                }
                if (!dados.universal.mar_espiritual.densidade && dados.universal.mar_espiritual.densidade !== 0) {
                    dados.universal.mar_espiritual.densidade = 0;
                }
                // Remover campos antigos
                delete dados.universal.mar_espiritual.pureza;
                delete dados.universal.mar_espiritual.estabilidade;
                return dados;
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
                localStorage.removeItem(this.chave_storage);
                return this.dados_padrao();
            }
        }
        console.log('⚠️ Nenhum dado encontrado no localStorage, usando padrão');
        return this.dados_padrao();
    }

    dados_padrao() {
        return {
            mundo_ativo: 'elder-gods',
            universal: {
                alma: {
                    atual: 0,
                    maximo: 100
                },
                dantian: {
                    atual: 0,
                    maximo: 50
                },
                meridianos: {
                    limpos: 0,
                    maximo: 314,
                    principais_limpos: 0,
                    principais_maximo: 12
                },
                tecnica: {
                    nome: 'Técnica do Vácuo',
                    tipo_energia: 'Essência Primordial',
                    descricao: 'Uma técnica fundamental de cultivo',
                    concentracao: '',
                    dado: '1d4'
                },
                mar_espiritual: {
                    estado: 'Sereno',
                    tamanho: 0,
                    elemento: 'agua',  // 🔧 NOVO: Elemento do Mar (de CULTIVACAO_ELEMENTOS)
                    densidade: 0,       // 🔧 NOVO: Densidade do Qi (de CULTIVACAO_DENSIDADES_QI)
                    descricao: ''
                }
            },
            elder_gods: {
                rank: 1,
                nome_rank: 'Corpo Temperado',
                nivel: 1,
                xp_atual: 0,
                xp_necessario: 100,
                xp_total: 0,
                risco_tribulacao: false
            },
            boreal_line: {
                rank: 1,
                nome_rank: 'Cristalização',
                nivel: 1,
                sub_rank: 0,
                nome_sub_rank: '',
                fragmentos: 0,
                qi_acumulado: 0,
                mana: 0,
                estagio_mana: 'Inicial'
            },
            murim: {
                rank: 1,
                nome_rank: 'Fundação Turva',
                nivel: 1,
                qi_acumulado: 0,
                fragmentos: 0,
                progresso_formacao: 0,
                petalas: 0,
                estagio_petala: 'Inicial',
                nucleo_espiritual: {
                    cor: 'Cinzento',
                    potencial: 50
                },
                canais_dao: 0,
                talento: 'Normal'
            }
        };
    }

    salvar() {
        try {
            localStorage.setItem(this.chave_storage, JSON.stringify(this.dados));
            console.log('✅ Dados de cultivação salvos com sucesso');
        } catch (e) {
            console.error('❌ Erro ao salvar dados de cultivação:', e);
        }
    }

    // Getters gerais
    obter_mundo_ativo() {
        return this.dados.mundo_ativo;
    }

    definir_mundo_ativo(mundo) {
        this.dados.mundo_ativo = mundo;
        this.mundo_ativo = mundo;
        this.salvar();
    }

    // Getters Universais
    obter_alma() {
        return this.dados.universal.alma;
    }

    obter_dantian() {
        return this.dados.universal.dantian;
    }

    obter_meridianos() {
        return this.dados.universal.meridianos;
    }

    obter_tecnica() {
        return this.dados.universal.tecnica;
    }

    obter_mar_espiritual() {
        return this.dados.universal.mar_espiritual;
    }

    // Setters Universais
    atualizar_alma(atual, maximo) {
        if (maximo !== undefined) {
            this.dados.universal.alma.maximo = Math.max(maximo, 1);
        }
        this.dados.universal.alma.atual = Math.min(atual, this.dados.universal.alma.maximo);
        this.salvar();
    }

    atualizar_dantian(atual, maximo) {
        if (maximo !== undefined) {
            this.dados.universal.dantian.maximo = Math.max(maximo, 1);
        }
        this.dados.universal.dantian.atual = Math.min(atual, this.dados.universal.dantian.maximo);
        this.salvar();
    }

    atualizar_meridianos(limpos) {
        this.dados.universal.meridianos.limpos = Math.min(limpos, this.dados.universal.meridianos.maximo);
        this.salvar();
    }

    atualizar_mar_espiritual(dados) {
        this.dados.universal.mar_espiritual = {
            estado: dados.estado || 'Sereno',
            tamanho: dados.tamanho !== null && dados.tamanho !== undefined ? parseInt(dados.tamanho) : null,
            elemento: dados.elemento || null,
            densidade: dados.densidade !== null && dados.densidade !== undefined ? parseInt(dados.densidade) : null,
            descricao: dados.descricao || ''
        };
        this.salvar();
    }

    atualizar_tecnica(nome, tipo_energia, descricao, concentracao, dado) {
        this.dados.universal.tecnica = {
            nome,
            tipo_energia,
            descricao,
            concentracao,
            dado
        };
        this.salvar();
    }

    // Getters Elder Gods
    obter_elder_gods() {
        return this.dados.elder_gods;
    }

    ganhar_xp_elder_gods(quantidade) {
        this.dados.elder_gods.xp_atual += quantidade;
        this.dados.elder_gods.xp_total += quantidade;

        // Verificar avanço de nível
        while (this.dados.elder_gods.xp_atual >= this.dados.elder_gods.xp_necessario) {
            this.dados.elder_gods.xp_atual -= this.dados.elder_gods.xp_necessario;
            this.dados.elder_gods.nivel += 1;

            if (this.dados.elder_gods.nivel > 9) {
                this.dados.elder_gods.nivel = 1;
                this.rompimento_rank_elder_gods();
            }
        }

        this.salvar();
    }

    rompimento_rank_elder_gods() {
        this.dados.elder_gods.rank += 1;
        this.dados.elder_gods.nivel = 1;
        
        const ranks = [
            'Corpo Temperado',
            'Fundação Inicial',
            'Transformação de Qí',
            'Verdadeira Fundação',
            'Formação da Alma',
            'Alma Nascente',
            'Rei Espiritual',
            'Nirvana',
            'Meio Santo',
            'Santo Espiritual',
            'Príncipe Santo',
            'Rei Santo',
            'Santo Imperial',
            'Imperador Marcial',
            'Deidade'
        ];

        if (this.dados.elder_gods.rank <= ranks.length) {
            this.dados.elder_gods.nome_rank = ranks[this.dados.elder_gods.rank - 1];
            this.dados.elder_gods.xp_necessario = Math.min(100 * this.dados.elder_gods.rank, 500);
        }

        // Verificar risco de tribulação (ranks altos)
        if (this.dados.elder_gods.rank >= 8) {
            this.dados.elder_gods.risco_tribulacao = true;
        }

        this.salvar();
    }

    // Getters Boreal Line
    obter_boreal_line() {
        return this.dados.boreal_line;
    }

    obter_cristal(indice) {
        if (this.dados.boreal_line && this.dados.boreal_line.cristais && Array.isArray(this.dados.boreal_line.cristais)) {
            return this.dados.boreal_line.cristais[indice];
        }
        return null;
    }

    atualizar_cristal(indice, dados) {
        if (this.dados.boreal_line && this.dados.boreal_line.cristais && Array.isArray(this.dados.boreal_line.cristais) && this.dados.boreal_line.cristais[indice]) {
            this.dados.boreal_line.cristais[indice] = {
                ...this.dados.boreal_line.cristais[indice],
                ...dados
            };
            this.salvar();
        }
    }

    // Calcular XP necessário para formar um núcleo de mana baseado no rank (dobra a cada rank)
    calcular_xp_mana_boreal_line(rank) {
        return 100 * Math.pow(2, rank - 1);
    }

    ganhar_fragmentos_boreal_line(quantidade) {
        this.dados.boreal_line.fragmentos += quantidade;
        this.dados.boreal_line.qi_acumulado += quantidade * 10;

        // Converter fragmentos em núcleos de mana (XP necessário dobra a cada rank)
        const xp_por_mana = this.calcular_xp_mana_boreal_line(this.dados.boreal_line.rank);
        let mana_formada = 0;
        
        while (this.dados.boreal_line.fragmentos >= xp_por_mana) {
            this.dados.boreal_line.fragmentos -= xp_por_mana;
            this.dados.boreal_line.mana += 1;
            mana_formada++;
        }
        
        if (mana_formada > 0) {
            console.log(`❄️ ${mana_formada} núcleo(s) de mana formado(s)! (XP por núcleo: ${xp_por_mana})`);
        }

        this.salvar();
    }

    avancar_rank_boreal_line() {
        // Estrutura de ranks com sub-ranks
        const ranks_config = [
            { rank: 1, nome: 'Cristalização', sub_ranks: [] },
            { rank: 2, nome: 'Formação da Gema', sub_ranks: [] },
            { rank: 3, nome: 'Estilhaçamento', sub_ranks: [] },
            { 
                rank: 4, 
                nome: 'Corpo Existencial', 
                sub_ranks: [
                    { num: 1, emoji: '🔹', nome: 'Cristalização do Dantian' },
                    { num: 2, emoji: '🔹', nome: 'Força Cristalina' },
                    { num: 3, emoji: '🔹', nome: 'Cristalização Mental' }
                ] 
            },
            { 
                rank: 5, 
                nome: 'Reconstrução Corpórea', 
                sub_ranks: [
                    { num: 1, emoji: '1️⃣', nome: 'Purificação das Impurezas' },
                    { num: 2, emoji: '2️⃣', nome: 'Reforja Óssea' },
                    { num: 3, emoji: '3️⃣', nome: 'Ascensão Muscular' },
                    { num: 4, emoji: '4️⃣', nome: 'Refinamento dos Órgãos' },
                    { num: 5, emoji: '5️⃣', nome: 'Despertar dos Sentidos' }
                ] 
            },
            { rank: 5.5, nome: 'Semi-Deus', sub_ranks: [] },
            { rank: 6, nome: 'Apoteose (Deus Menor)', sub_ranks: [] },
            { rank: 7, nome: 'Deus Maior', sub_ranks: [] }
        ];

        // Encontrar configuração atual
        const config_atual = ranks_config.find(r => r.rank === this.dados.boreal_line.rank);
        
        if (config_atual && config_atual.sub_ranks.length > 0 && this.dados.boreal_line.sub_rank < config_atual.sub_ranks.length) {
            // Avançar sub-rank dentro do rank atual
            this.dados.boreal_line.sub_rank += 1;
            const sub_rank_info = config_atual.sub_ranks[this.dados.boreal_line.sub_rank - 1];
            this.dados.boreal_line.nome_sub_rank = `${sub_rank_info.emoji} ${sub_rank_info.nome}`;
        } else {
            // Avançar para próximo rank
            const idx_proximo = ranks_config.findIndex(r => r.rank === this.dados.boreal_line.rank) + 1;
            
            if (idx_proximo < ranks_config.length) {
                this.dados.boreal_line.rank = ranks_config[idx_proximo].rank;
                this.dados.boreal_line.nome_rank = ranks_config[idx_proximo].nome;
                this.dados.boreal_line.sub_rank = 0;
                this.dados.boreal_line.nome_sub_rank = '';
            }
        }

        // Reset dos Núcleos de Mana ao avançar
        this.dados.boreal_line.mana = 0;
        this.dados.boreal_line.estagio_mana = 'Inicial';

        this.salvar();
    }

    obter_ranks_boreal_line_config() {
        return [
            { rank: 1, nome: 'Cristalização', sub_ranks: [] },
            { rank: 2, nome: 'Formação da Gema', sub_ranks: [] },
            { rank: 3, nome: 'Estilhaçamento', sub_ranks: [] },
            { 
                rank: 4, 
                nome: 'Corpo Existencial', 
                sub_ranks: [
                    { num: 1, emoji: '🔹', nome: 'Cristalização do Dantian' },
                    { num: 2, emoji: '🔹', nome: 'Força Cristalina' },
                    { num: 3, emoji: '🔹', nome: 'Cristalização Mental' }
                ] 
            },
            { 
                rank: 5, 
                nome: 'Reconstrução Corpórea', 
                sub_ranks: [
                    { num: 1, emoji: '1️⃣', nome: 'Purificação das Impurezas' },
                    { num: 2, emoji: '2️⃣', nome: 'Reforja Óssea' },
                    { num: 3, emoji: '3️⃣', nome: 'Ascensão Muscular' },
                    { num: 4, emoji: '4️⃣', nome: 'Refinamento dos Órgãos' },
                    { num: 5, emoji: '5️⃣', nome: 'Despertar dos Sentidos' }
                ] 
            },
            { rank: 5.5, nome: 'Semi-Deus', sub_ranks: [] },
            { rank: 6, nome: 'Apoteose (Deus Menor)', sub_ranks: [] },
            { rank: 7, nome: 'Deus Maior', sub_ranks: [] }
        ];
    }

    // Getters Murim
    obter_murim() {
        return this.dados.murim;
    }

    // Calcular XP necessário para formar uma pétala baseado no rank (dobra a cada rank)
    calcular_xp_petala_murim(rank) {
        return 100 * Math.pow(2, rank - 1);
    }

    ganhar_fragmentos_murim(quantidade) {
        this.dados.murim.fragmentos += quantidade;
        this.dados.murim.qi_acumulado += quantidade * 10;

        // Converter fragmentos em lótus (XP necessário dobra a cada rank)
        const xp_por_petala = this.calcular_xp_petala_murim(this.dados.murim.rank);
        let petalas_formadas = 0;
        
        while (this.dados.murim.fragmentos >= xp_por_petala) {
            this.dados.murim.fragmentos -= xp_por_petala;
            this.dados.murim.petalas += 1;
            petalas_formadas++;
        }
        
        if (petalas_formadas > 0) {
            console.log(`🌸 ${petalas_formadas} pétala(s) formada(s)! (XP por pétala: ${xp_por_petala})`);
        }

        this.salvar();
    }

    adicionar_petala_murim() {
        this.dados.murim.petalas += 1;
        this.salvar();
    }

    avancar_estagio_murim() {
        const estagios = ['Inicial', 'Refinada', 'Superior', 'Perfeita'];
        const indice_atual = estagios.indexOf(this.dados.murim.estagio_petala);
        
        if (indice_atual < estagios.length - 1) {
            this.dados.murim.estagio_petala = estagios[indice_atual + 1];
            this.salvar();
        }
    }

    avancar_rank_murim() {
        this.dados.murim.rank += 1;

        const ranks = [
            'Fundação Turva',
            'Fundação Límpida',
            'Núcleo Espiritual',
            'Corpo Sagrado',
            'Imortal Transcendente',
            'Deus Celestial',
            'Imperador Imortal',
            'Soberano Supremo'
        ];

        if (this.dados.murim.rank <= ranks.length) {
            this.dados.murim.nome_rank = ranks[this.dados.murim.rank - 1];
        }

        // Reset das Lótus do Céu Imortal ao avançar de rank
        this.dados.murim.petalas = 0;
        this.dados.murim.estagio_petala = 'Inicial';

        this.salvar();
    }

    calcular_risco_geral() {
        let risco = 0;

        // Verificar estabilidade dos meridianos (baseado no progresso de limpeza)
        if (this.dados.universal && this.dados.universal.meridianos) {
            const eficiencia_meridianos = (this.dados.universal.meridianos.limpos / this.dados.universal.meridianos.maximo) * 100;
            if (eficiencia_meridianos < 50) {
                risco += 30;
            }
        }

        // Verificar tribulação (Elder Gods)
        if (this.dados.elder_gods && this.dados.elder_gods.risco_tribulacao) {
            risco += 40;
        }

        // Verificar cristais corrompidos (Boreal Line) - verificação segura
        if (this.dados.boreal_line && this.dados.boreal_line.cristais && Array.isArray(this.dados.boreal_line.cristais)) {
            if (this.dados.boreal_line.cristais.some(c => c.estado === 'Corrompido')) {
                risco += 50;
            }
        }

        return Math.min(risco, 100);
    }

    // Limpar dados corrompidos
    limpar_dados() {
        localStorage.removeItem(this.chave_storage);
        this.dados = this.dados_padrao();
        this.salvar();
        console.log('Dados limpos e resetados para padrão');
    }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   CULTIVAÇÃO - GERENCIADOR DE UI
   
   Responsável por:
   - Renderizar elementos do popup
   - Atualizar visual
   - Gerenciar animações
   - Handlers de eventos
   
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CultivacaoUIManager {
    constructor(dados_manager) {
        this.dados = dados_manager;
        this.modal = null;
        this.aberto = false;
        this.mundo_atual = 'elder-gods';

        this.criar_estrutura_html();
        this.setup_listeners();
    }

    criar_estrutura_html() {
        const overlay = document.createElement('div');
        overlay.id = 'cultivacao-overlay';
        overlay.className = 'cultivacao-overlay';

        overlay.innerHTML = `
            <div class="cultivacao-container">
                <!-- HEADER -->
                <header class="cultivacao-header">
                    <div class="cultivacao-titulo">
                        <span class="cultivacao-titulo-icone">🌌</span>
                        <h2>Sistema de Cultivação</h2>
                    </div>
                    
                    <div class="cultivacao-header-info">
                        <div class="cultivacao-info-item">
                            <span class="cultivacao-info-label">Mundo</span>
                            <span class="cultivacao-mundo-badge" id="cult-mundo-nome">The Elder Gods</span>
                        </div>
                        <div class="cultivacao-info-item">
                            <span class="cultivacao-info-label">Rank</span>
                            <span class="cultivacao-info-valor" id="cult-rank-atual">1</span>
                        </div>
                        <div class="cultivacao-info-item">
                            <span class="cultivacao-info-label">Nível</span>
                            <span class="cultivacao-info-valor" id="cult-nivel-atual">1</span>
                        </div>
                    </div>

                    <div class="cultivacao-header-buttons">
                        <button class="cultivacao-voltar-btn" id="cultivacao-voltar" title="Voltar para Menu">↩</button>
                        <button class="cultivacao-fechar-btn" id="cult-fechar-btn">✕</button>
                    </div>
                </header>

                <!-- ABAS -->
                <div class="cultivacao-abas-container">
                    <button class="cultivacao-aba ativo" data-mundo="elder-gods">
                        <span class="cultivacao-aba-icone">⭐</span>
                        <span>The Elder Gods</span>
                    </button>
                    <button class="cultivacao-aba" data-mundo="boreal-line">
                        <span class="cultivacao-aba-icone">❄️</span>
                        <span>Boreal Line</span>
                    </button>
                    <button class="cultivacao-aba" data-mundo="murim">
                        <span class="cultivacao-aba-icone">🌿</span>
                        <span>Legends of Murim</span>
                    </button>
                </div>

                <!-- CORPO PRINCIPAL -->
                <div class="cultivacao-corpo">
                    <!-- SEÇÃO UNIVERSAL (sempre visível) -->
                    <div class="cultivacao-universal-section">
                        <!-- DANTIAN -->
                        <!-- ALMA -->
                        <div>
                            <div class="cultivacao-section-titulo">
                                <span class="cultivacao-section-titulo-icone">✨</span>
                                <span>Alma</span>
                            </div>
                            <div class="cultivacao-bar-wrapper cultivacao-clickable" id="alma-barra-click">
                                <div class="cultivacao-bar-header">
                                    <span class="cultivacao-bar-label">Essência da Alma</span>
                                    <span class="cultivacao-bar-stat" id="alma-stat">0 / 100</span>
                                </div>
                                <div class="cultivacao-bar-container">
                                    <div class="cultivacao-bar-fill" id="alma-bar"></div>
                                    <div class="cultivacao-bar-valor" id="alma-valor">0%</div>
                                </div>
                            </div>
                        </div>

                        <!-- DANTIAN -->
                        <div>
                            <div class="cultivacao-section-titulo">
                                <span class="cultivacao-section-titulo-icone">🔴</span>
                                <span>Dantian</span>
                            </div>
                            <div class="cultivacao-bar-wrapper cultivacao-clickable" id="dantian-barra-click">
                                <div class="cultivacao-bar-header">
                                    <span class="cultivacao-bar-label">Energia do Dantian</span>
                                    <span class="cultivacao-bar-stat" id="dantian-stat">0 / 50</span>
                                </div>
                                <div class="cultivacao-bar-container">
                                    <div class="cultivacao-bar-fill" id="dantian-bar"></div>
                                    <div class="cultivacao-bar-valor" id="dantian-valor">0%</div>
                                </div>
                            </div>
                        </div>

                        <!-- MERIDIANOS -->
                        <div>
                            <div class="cultivacao-section-titulo">
                                <span class="cultivacao-section-titulo-icone">🌀</span>
                                <span>Meridianos (0/12 principais)</span>
                            </div>
                            <div class="cultivacao-bar-wrapper cultivacao-clickable" id="meridiano-barra-click">
                                <div class="cultivacao-bar-header">
                                    <span class="cultivacao-bar-label">Meridianos Limpos</span>
                                    <span class="cultivacao-bar-stat" id="meridiano-stat">0 / 314</span>
                                </div>
                                <div class="cultivacao-bar-container">
                                    <div class="cultivacao-bar-fill" id="meridiano-bar"></div>
                                    <div class="cultivacao-bar-valor" id="meridiano-valor">0%</div>
                                </div>
                            </div>
                        </div>

                        <!-- TÉCNICA DE CULTIVO -->
                        <div class="cultivacao-tecnica-card">
                            <div class="cultivacao-tecnica-header">
                                <div class="cultivacao-tecnica-titulo">
                                    <span>📜 Técnica de Cultivo</span>
                                </div>
                                <div class="cultivacao-tecnica-expandir" id="tecnica-expandir">▼</div>
                            </div>
                            <div class="cultivacao-tecnica-conteudo" id="tecnica-conteudo">
                                <div class="cultivacao-tecnica-form">
                                    <div class="cultivacao-form-group">
                                        <label class="cultivacao-form-label">Nome da Técnica</label>
                                        <input type="text" class="cultivacao-form-input" id="tecnica-nome" placeholder="Ex: Técnica do Vácuo" maxlength="50">
                                    </div>
                                    <div class="cultivacao-form-group">
                                        <label class="cultivacao-form-label">Tipo de Energia</label>
                                        <input type="text" class="cultivacao-form-input" id="tecnica-energia" placeholder="Ex: Essência Primordial" maxlength="50">
                                    </div>
                                    <div class="cultivacao-form-group">
                                        <label class="cultivacao-form-label">Descrição</label>
                                        <textarea class="cultivacao-form-textarea" id="tecnica-desc" placeholder="Descrição da técnica..." maxlength="300"></textarea>
                                    </div>
                                    <div class="cultivacao-form-group">
                                        <label class="cultivacao-form-label">Concentração</label>
                                        <input type="text" class="cultivacao-form-input" id="tecnica-concentracao" placeholder="Ex: Nível avançado" maxlength="100">
                                    </div>
                                    <div class="cultivacao-form-group">
                                        <label class="cultivacao-form-label">Rolagem de Dado</label>
                                        <input type="text" class="cultivacao-form-input" id="tecnica-dado" placeholder="Ex: 1d4, 1d6+2, 2d10" maxlength="50">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- MAR ESPIRITUAL -->
                        <div class="cultivacao-mar-card" id="mar-card-clicavel" style="cursor: pointer;">
                            <div class="cultivacao-section-titulo">
                                <span class="cultivacao-section-titulo-icone">🌊</span>
                                <span>Mar Espiritual</span>
                            </div>
                            <div class="cultivacao-mar-conteudo">
                                <div class="cultivacao-mar-grid">
                                    <div class="cultivacao-mar-item">
                                        <div class="cultivacao-mar-label">Estado</div>
                                        <div class="cultivacao-mar-valor" id="mar-estado">Sereno</div>
                                    </div>
                                    <div class="cultivacao-mar-item">
                                        <div class="cultivacao-mar-label">Tamanho</div>
                                        <div class="cultivacao-mar-valor" id="mar-tamanho">—</div>
                                    </div>
                                    <div class="cultivacao-mar-item">
                                        <div class="cultivacao-mar-label">Elemento</div>
                                        <div class="cultivacao-mar-valor" id="mar-elemento">—</div>
                                    </div>
                                    <div class="cultivacao-mar-item">
                                        <div class="cultivacao-mar-label">Densidade</div>
                                        <div class="cultivacao-mar-valor" id="mar-densidade">—</div>
                                    </div>
                                </div>
                                <div class="cultivacao-mar-descricao">
                                    <div class="cultivacao-mar-descricao-label">Descrição</div>
                                    <div class="cultivacao-mar-descricao-valor" id="mar-descricao">—</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MUNDOS ESPECÍFICOS -->
                    
                    <!-- THE ELDER GODS -->
                    <div class="cultivacao-mundo elder-gods-mundo ativo" data-mundo="elder-gods" id="mundo-elder-gods">
                        <div class="cultivacao-mundo-elder-gods">
                            <div class="elder-gods-rank-card">
                                <div class="elder-gods-rank-info">
                                    <div class="elder-gods-rank-nome" id="egods-rank-nome">Corpo Temperado</div>
                                    <div class="elder-gods-nivel" id="egods-nivel">Nível 1 / 9</div>
                                </div>
                                <div class="elder-gods-rank-stats">
                                    <div class="elder-gods-stat-item">
                                        <div class="elder-gods-stat-label">Rank</div>
                                        <div class="elder-gods-stat-valor" id="egods-rank-num">1</div>
                                    </div>
                                    <div class="elder-gods-stat-item">
                                        <div class="elder-gods-stat-label">XP Total</div>
                                        <div class="elder-gods-stat-valor" id="egods-xp-total">0</div>
                                    </div>
                                </div>
                            </div>

                            <div class="elder-gods-progresso">
                                <div class="cultivacao-bar-wrapper">
                                    <div class="cultivacao-bar-header">
                                        <span class="cultivacao-bar-label">Progresso de Nível</span>
                                        <span class="cultivacao-bar-stat" id="egods-xp-stat">0 / 100</span>
                                    </div>
                                    <div class="cultivacao-bar-container">
                                        <div class="cultivacao-bar-fill" id="egods-xp-bar"></div>
                                        <div class="cultivacao-bar-valor" id="egods-xp-valor">0%</div>
                                    </div>
                                </div>

                                <div class="elder-gods-acoes">
                                    <button class="cultivacao-btn cultivacao-btn-primary" id="egods-ganhar-xp">
                                        ✨ Adicionar XP
                                    </button>
                                    <button class="cultivacao-btn" id="egods-romper" disabled>
                                        ⚡ Rompimento (Nível 9)
                                    </button>
                                </div>
                            </div>

                            <div class="elder-gods-tabela">
                                <div class="elder-gods-tabela-header">
                                    <div>Rank</div>
                                    <div>Nome</div>
                                    <div>Níveis</div>
                                    <div>Atributos</div>
                                    <div>Máximo</div>
                                </div>
                                <div id="egods-tabela-conteudo"></div>
                            </div>
                        </div>
                    </div>

                    <!-- BOREAL LINE -->
                    <div class="cultivacao-mundo boreal-line-mundo" data-mundo="boreal-line" id="mundo-boreal-line">
                        <div class="cultivacao-mundo-boreal-line">
                            <div class="boreal-line-rank-card">
                                <div class="boreal-line-rank-info">
                                    <div class="boreal-line-rank-nome" id="bl-rank-nome">Cristalização</div>
                                    <div class="boreal-line-sub-rank-nome" id="bl-sub-rank-nome" style="display: none;"></div>
                                </div>
                                <div class="elder-gods-rank-stats">
                                    <div class="elder-gods-stat-item">
                                        <div class="elder-gods-stat-label">Rank</div>
                                        <div class="elder-gods-stat-valor" id="bl-rank-num">1</div>
                                    </div>
                                </div>
                            </div>

                            <div class="boreal-line-mana-corporal-card">
                                <div class="boreal-line-mana-corporal-header">
                                    <div class="boreal-line-mana-corporal-imagem">
                                        <img src="https://i.imgur.com/Y2dxgGq.png" alt="Mana Corporal" class="boreal-line-mana-img">
                                    </div>
                                    <div class="boreal-line-mana-corporal-info">
                                        <div class="cultivacao-section-titulo">
                                            <span class="cultivacao-section-titulo-icone">⚡</span>
                                            <span>Mana Corporal</span>
                                        </div>
                                        <div class="boreal-line-xp-info">
                                            <div class="boreal-line-xp-text"><span id="bl-xp-atual">0</span> / <span id="bl-xp-maximo">100</span> XP</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="boreal-line-xp-bar-container">
                                    <div class="boreal-line-xp-bar-background">
                                        <div class="boreal-line-xp-bar-fill" id="bl-xp-fill" style="width: 0%"></div>
                                    </div>
                                </div>
                                <div class="boreal-line-xp-label">Próximo Núcleo de Mana em <span id="bl-fragmentos-restantes">100</span> fragmentos</div>
                            </div>

                            <div>
                                <div class="cultivacao-section-titulo">
                                    <span class="cultivacao-section-titulo-icone">❄️</span>
                                    <span>Núcleos de Mana Formados</span>
                                </div>
                                <div class="boreal-line-mana-container" id="bl-mana-container"></div>
                            </div>

                            <div class="elder-gods-acoes">
                                <button class="cultivacao-btn cultivacao-btn-primary" id="bl-ganhar-xp">
                                    ⚡ Adicionar Mana
                                </button>
                                <button class="cultivacao-btn" id="bl-avancar">
                                    ❄️ Avançar Rank
                                </button>
                            </div>

                            <div class="boreal-line-tabela">
                                <div class="boreal-line-tabela-header">
                                    <div>Rank</div>
                                    <div>Nome</div>
                                    <div>Sub-Ranks</div>
                                    <div>Núcleos</div>
                                </div>
                                <div id="bl-tabela-conteudo"></div>
                            </div>
                        </div>
                    </div>

                    <!-- LEGENDS OF MURIM -->
                    <div class="cultivacao-mundo murim-mundo" data-mundo="murim" id="mundo-murim">
                        <div class="cultivacao-mundo-murim">
                            <div class="murim-rank-card">
                                <div class="murim-rank-info">
                                    <div class="murim-rank-nome" id="murim-rank-nome">Fundação Turva</div>
                                </div>
                                <div class="elder-gods-rank-stats">
                                    <div class="elder-gods-stat-item">
                                        <div class="elder-gods-stat-label">Rank</div>
                                        <div class="elder-gods-stat-valor" id="murim-rank-num">1</div>
                                    </div>
                                </div>
                            </div>

                            <div class="murim-xp-bar-section">
                                <div class="cultivacao-section-titulo">
                                    <span class="cultivacao-section-titulo-icone">✨</span>
                                    <span>Experiência da Lótus</span>
                                </div>
                                <div class="murim-xp-info">
                                    <div class="murim-xp-text"><span id="murim-xp-atual">0</span> / <span id="murim-xp-maximo">100</span> XP</div>
                                </div>
                                <div class="murim-xp-bar-container">
                                    <div class="murim-xp-bar-background">
                                        <div class="murim-xp-bar-fill" id="murim-xp-fill" style="width: 0%"></div>
                                    </div>
                                </div>
                                <div class="murim-xp-label">Próxima pétala em <span id="murim-fragmentos-restantes">100</span> fragmentos</div>
                            </div>

                            <div>
                                <div class="cultivacao-section-titulo">
                                    <span class="cultivacao-section-titulo-icone">🌸</span>
                                    <span>Lótus do Céu Imortal</span>
                                </div>
                                <div class="murim-petalas" id="murim-petalas-container"></div>
                            </div>

                            <div class="elder-gods-acoes">
                                <button class="cultivacao-btn cultivacao-btn-primary" id="murim-ganhar-qi">
                                    ✨ Adicionar Qi
                                </button>
                                <button class="cultivacao-btn" id="murim-avancar-rank">
                                    ⬆️ Avançar Rank
                                </button>
                                <button class="cultivacao-btn" id="murim-adicionar-petala">
                                    🌸 Adicionar Pétala
                                </button>
                            </div>

                            <div class="murim-tabela">
                                <div class="murim-tabela-header">
                                    <div>Rank</div>
                                    <div>Nome</div>
                                    <div>Pétalas</div>
                                    <div>Descrição</div>
                                </div>
                                <div id="murim-tabela-conteudo"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.modal = overlay;

        // POPUPS DE EDIÇÃO
        this.criar_popup_alma();
        this.criar_popup_dantian();
        this.criar_popup_meridianos();
        this.criar_popup_mar_espiritual();
        this.criar_popup_egods_xp();
        this.criar_popup_murim_qi();
        this.criar_popup_boreal_line_mana();
    }

    criar_popup_alma() {
        const popup = document.createElement('div');
        popup.id = 'popup-alma';
        popup.className = 'cultivacao-popup';
        popup.innerHTML = `
            <div class="cultivacao-popup-overlay" id="popup-alma-overlay"></div>
            <div class="cultivacao-popup-conteudo">
                <div class="cultivacao-popup-header">
                    <span class="cultivacao-popup-titulo">✨ Editar Alma</span>
                    <button class="cultivacao-popup-fechar" id="popup-alma-fechar">✕</button>
                </div>
                <div class="cultivacao-popup-body">
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Valor Atual</label>
                        <input type="number" class="cultivacao-popup-input" id="popup-alma-input" min="0" value="0" placeholder="Valor atual">
                    </div>
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Valor Máximo</label>
                        <input type="number" class="cultivacao-popup-input" id="popup-alma-maximo" min="1" value="100" placeholder="Valor máximo">
                    </div>
                </div>
                <div class="cultivacao-popup-footer">
                    <button class="cultivacao-popup-button cultivacao-popup-button-salvar" id="popup-alma-salvar">Salvar</button>
                    <button class="cultivacao-popup-button cultivacao-popup-button-cancelar" id="popup-alma-cancelar">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    criar_popup_dantian() {
        const popup = document.createElement('div');
        popup.id = 'popup-dantian';
        popup.className = 'cultivacao-popup';
        popup.innerHTML = `
            <div class="cultivacao-popup-overlay" id="popup-dantian-overlay"></div>
            <div class="cultivacao-popup-conteudo">
                <div class="cultivacao-popup-header">
                    <span class="cultivacao-popup-titulo">🔴 Editar Dantian</span>
                    <button class="cultivacao-popup-fechar" id="popup-dantian-fechar">✕</button>
                </div>
                <div class="cultivacao-popup-body">
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Valor Atual</label>
                        <input type="number" class="cultivacao-popup-input" id="popup-dantian-input" min="0" value="0" placeholder="Valor atual">
                    </div>
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Valor Máximo</label>
                        <input type="number" class="cultivacao-popup-input" id="popup-dantian-maximo" min="1" value="50" placeholder="Valor máximo">
                    </div>
                </div>
                <div class="cultivacao-popup-footer">
                    <button class="cultivacao-popup-button cultivacao-popup-button-salvar" id="popup-dantian-salvar">Salvar</button>
                    <button class="cultivacao-popup-button cultivacao-popup-button-cancelar" id="popup-dantian-cancelar">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    criar_popup_egods_xp() {
        const popup = document.createElement('div');
        popup.id = 'popup-egods-xp';
        popup.className = 'cultivacao-popup';
        popup.innerHTML = `
            <div class="cultivacao-popup-overlay" id="popup-egods-xp-overlay"></div>
            <div class="cultivacao-popup-conteudo">
                <div class="cultivacao-popup-header">
                    <span class="cultivacao-popup-titulo">⭐ Adicionar XP (The Elder Gods)</span>
                    <button class="cultivacao-popup-fechar" id="popup-egods-xp-fechar">✕</button>
                </div>
                <div class="cultivacao-popup-body">
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Quantidade de XP a Adicionar</label>
                        <input type="number" class="cultivacao-popup-input" id="popup-egods-xp-input" min="1" value="10" placeholder="Digite a quantidade">
                    </div>
                    <div class="cultivacao-popup-info">
                        <small>XP Atual: <span id="popup-egods-xp-info">0</span> / <span id="popup-egods-xp-max">100</span></small>
                    </div>
                </div>
                <div class="cultivacao-popup-footer">
                    <button class="cultivacao-popup-button cultivacao-popup-button-salvar" id="popup-egods-xp-salvar">Adicionar</button>
                    <button class="cultivacao-popup-button cultivacao-popup-button-cancelar" id="popup-egods-xp-cancelar">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    criar_popup_murim_qi() {
        const popup = document.createElement('div');
        popup.id = 'popup-murim-qi';
        popup.className = 'cultivacao-popup';
        popup.innerHTML = `
            <div class="cultivacao-popup-overlay" id="popup-murim-qi-overlay"></div>
            <div class="cultivacao-popup-conteudo">
                <div class="cultivacao-popup-header">
                    <span class="cultivacao-popup-titulo">🌠 Adicionar Qi (Legends of Murim)</span>
                    <button class="cultivacao-popup-fechar" id="popup-murim-qi-fechar">✕</button>
                </div>
                <div class="cultivacao-popup-body">
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Quantidade de Fragmentos a Adicionar</label>
                        <input type="number" class="cultivacao-popup-input" id="popup-murim-qi-input" min="1" value="10" placeholder="Digite a quantidade">
                    </div>
                    <div class="cultivacao-popup-info">
                        <small>XP da Lótus: <span id="popup-murim-qi-info">0</span>/100 | Total coletado: <span id="popup-murim-qi-total">0</span></small>
                    </div>
                </div>
                <div class="cultivacao-popup-footer">
                    <button class="cultivacao-popup-button cultivacao-popup-button-salvar" id="popup-murim-qi-salvar">Adicionar</button>
                    <button class="cultivacao-popup-button cultivacao-popup-button-cancelar" id="popup-murim-qi-cancelar">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    criar_popup_boreal_line_mana() {
        const popup = document.createElement('div');
        popup.id = 'popup-boreal-line-mana';
        popup.className = 'cultivacao-popup';
        popup.innerHTML = `
            <div class="cultivacao-popup-overlay" id="popup-boreal-line-mana-overlay"></div>
            <div class="cultivacao-popup-conteudo">
                <div class="cultivacao-popup-header">
                    <span class="cultivacao-popup-titulo">❄️ Adicionar Mana (Boreal Line)</span>
                    <button class="cultivacao-popup-fechar" id="popup-boreal-line-mana-fechar">✕</button>
                </div>
                <div class="cultivacao-popup-body">
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Quantidade de Fragmentos a Adicionar</label>
                        <input type="number" class="cultivacao-popup-input" id="popup-boreal-line-mana-input" min="1" value="10" placeholder="Digite a quantidade">
                    </div>
                    <div class="cultivacao-popup-info">
                        <small>Mana Corporal: <span id="popup-boreal-line-mana-info">0</span>/100 | Total coletado: <span id="popup-boreal-line-mana-total">0</span></small>
                    </div>
                </div>
                <div class="cultivacao-popup-footer">
                    <button class="cultivacao-popup-button cultivacao-popup-button-salvar" id="popup-boreal-line-mana-salvar">Adicionar</button>
                    <button class="cultivacao-popup-button cultivacao-popup-button-cancelar" id="popup-boreal-line-mana-cancelar">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    criar_popup_meridianos() {
        const popup = document.createElement('div');
        popup.id = 'popup-meridianos';
        popup.className = 'cultivacao-popup';
        popup.innerHTML = `
            <div class="cultivacao-popup-overlay" id="popup-meridianos-overlay"></div>
            <div class="cultivacao-popup-conteudo">
                <div class="cultivacao-popup-header">
                    <span class="cultivacao-popup-titulo">🌀 Editar Meridianos</span>
                    <button class="cultivacao-popup-fechar" id="popup-meridianos-fechar">✕</button>
                </div>
                <div class="cultivacao-popup-body">
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Meridianos Limpos (0-314)</label>
                        <input type="number" class="cultivacao-popup-input" id="popup-meridianos-input" min="0" max="314" value="0" placeholder="0-314">
                    </div>
                </div>
                <div class="cultivacao-popup-footer">
                    <button class="cultivacao-popup-button cultivacao-popup-button-salvar" id="popup-meridianos-salvar">Salvar</button>
                    <button class="cultivacao-popup-button cultivacao-popup-button-cancelar" id="popup-meridianos-cancelar">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    criar_popup_mar_espiritual() {
        const popup = document.createElement('div');
        popup.id = 'popup-mar';
        popup.className = 'cultivacao-popup cultivacao-popup-mar';
        popup.innerHTML = `
            <div class="cultivacao-popup-overlay" id="popup-mar-overlay"></div>
            <div class="cultivacao-popup-conteudo">
                <div class="cultivacao-popup-header">
                    <span class="cultivacao-popup-titulo">🌊 Editar Mar Espiritual</span>
                    <button class="cultivacao-popup-fechar" id="popup-mar-fechar">✕</button>
                </div>
                <div class="cultivacao-popup-body cultivacao-popup-body-grid">
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Estado</label>
                        <select class="cultivacao-popup-input cultivacao-popup-select" id="popup-mar-estado">
                            <option value="Nebuloso">Nebuloso</option>
                            <option value="Sereno">Sereno</option>
                            <option value="Cristalino">Cristalino</option>
                            <option value="Tempestuoso">Tempestuoso</option>
                            <option value="Congelado">Congelado</option>
                            <option value="Flamejante">Flamejante</option>
                            <option value="Abissal">Abissal</option>
                            <option value="Celestial">Celestial</option>
                            <option value="Fragmentado">Fragmentado</option>
                            <option value="Vazio">Vazio</option>
                            <optgroup label="─ ESTADOS AVANÇADOS ─">
                                <option value="Primordial">Primordial</option>
                                <option value="Divino">Divino</option>
                                <option value="Infinito">Infinito</option>
                                <option value="Espelhado">Espelhado</option>
                                <option value="Devastado">Devastado</option>
                                <option value="Corrompido">Corrompido</option>
                                <option value="Ilusório">Ilusório</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Tamanho do Mar</label>
                        <select class="cultivacao-popup-input cultivacao-popup-select" id="popup-mar-tamanho-select">
                            <option value="">Selecionar tamanho...</option>
                        </select>
                    </div>
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Elemento</label>
                        <select class="cultivacao-popup-input cultivacao-popup-select" id="popup-mar-elemento-select">
                            <option value="">Selecionar elemento...</option>
                        </select>
                    </div>
                    <div class="cultivacao-popup-input-group">
                        <label class="cultivacao-popup-label">Densidade do Qi</label>
                        <select class="cultivacao-popup-input cultivacao-popup-select" id="popup-mar-densidade-select">
                            <option value="">Selecionar densidade...</option>
                        </select>
                    </div>
                    <div class="cultivacao-popup-input-group cultivacao-popup-input-group-full">
                        <label class="cultivacao-popup-label">Descrição</label>
                        <textarea class="cultivacao-popup-input cultivacao-popup-textarea" id="popup-mar-descricao" placeholder="Descreva o estado do seu mar espiritual..." rows="3"></textarea>
                    </div>
                </div>
                <div class="cultivacao-popup-footer">
                    <button class="cultivacao-popup-button cultivacao-popup-button-salvar" id="popup-mar-salvar">Salvar</button>
                    <button class="cultivacao-popup-button cultivacao-popup-button-cancelar" id="popup-mar-cancelar">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    setup_listeners() {
        // Abrir/Fechar
        const btn_abrir = document.getElementById('menu-btn-cultivacao');
        if (btn_abrir) {
            btn_abrir.addEventListener('click', () => this.abrir());
        }

        const btn_fechar = document.getElementById('cult-fechar-btn');
        if (btn_fechar) {
            btn_fechar.addEventListener('click', () => this.fechar());
        }

        const btn_voltar = document.getElementById('cultivacao-voltar');
        if (btn_voltar) {
            btn_voltar.addEventListener('click', () => this.voltarMenuPrincipal());
        }

        const overlay = this.modal;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.fechar();
        });

        // Abas
        document.querySelectorAll('.cultivacao-aba').forEach(aba => {
            aba.addEventListener('click', (e) => {
                const mundo = e.currentTarget.dataset.mundo;
                this.mudar_mundo(mundo);
            });
        });

        // Técnica expansível
        const tecnica_header = document.querySelector('.cultivacao-tecnica-header');
        if (tecnica_header) {
            tecnica_header.addEventListener('click', () => {
                document.getElementById('tecnica-conteudo').classList.toggle('visivel');
                document.getElementById('tecnica-expandir').classList.toggle('expandido');
            });
        }

        // Botões de ação
        document.getElementById('egods-ganhar-xp')?.addEventListener('click', () => this.egods_ganhar_xp());
        document.getElementById('egods-romper')?.addEventListener('click', () => this.egods_romper());
        document.getElementById('bl-ganhar-xp')?.addEventListener('click', () => this.bl_ganhar_xp());
        document.getElementById('bl-avancar')?.addEventListener('click', () => this.bl_avancar());
        document.getElementById('murim-ganhar-qi')?.addEventListener('click', () => this.murim_ganhar_qi());
        document.getElementById('murim-avancar-rank')?.addEventListener('click', () => this.murim_avancar_rank());
        document.getElementById('murim-adicionar-petala')?.addEventListener('click', () => this.murim_adicionar_petala());

        // Atualizar dados ao mudar
        document.getElementById('tecnica-nome')?.addEventListener('change', () => this.salvar_tecnica());
        document.getElementById('tecnica-energia')?.addEventListener('change', () => this.salvar_tecnica());
        document.getElementById('tecnica-desc')?.addEventListener('change', () => this.salvar_tecnica());
        document.getElementById('tecnica-concentracao')?.addEventListener('change', () => this.salvar_tecnica());
        document.getElementById('tecnica-dado')?.addEventListener('change', () => this.salvar_tecnica());

        // Dantian - Abrir popup ao clicar na barra
        document.getElementById('alma-barra-click')?.addEventListener('click', () => {
            this.abrir_popup_alma();
        });

        document.getElementById('dantian-barra-click')?.addEventListener('click', () => {
            this.abrir_popup_dantian();
        });

        // Meridianos - Abrir popup ao clicar na barra
        document.getElementById('meridiano-barra-click')?.addEventListener('click', () => {
            this.abrir_popup_meridianos();
        });

        // 🔧 Mar Espiritual - Selects
        // Popup Elder Gods XP
        document.getElementById('popup-egods-xp-fechar')?.addEventListener('click', () => this.fechar_popup_egods_xp());
        document.getElementById('popup-egods-xp-overlay')?.addEventListener('click', () => this.fechar_popup_egods_xp());
        document.getElementById('popup-egods-xp-cancelar')?.addEventListener('click', () => this.fechar_popup_egods_xp());
        document.getElementById('popup-egods-xp-salvar')?.addEventListener('click', () => this.salvar_popup_egods_xp());
        // Popup Murim Qi
        document.getElementById('popup-murim-qi-fechar')?.addEventListener('click', () => this.fechar_popup_murim_qi());
        document.getElementById('popup-murim-qi-overlay')?.addEventListener('click', () => this.fechar_popup_murim_qi());
        document.getElementById('popup-murim-qi-cancelar')?.addEventListener('click', () => this.fechar_popup_murim_qi());
        document.getElementById('popup-murim-qi-salvar')?.addEventListener('click', () => this.salvar_popup_murim_qi());

        // Popup Boreal Line Mana
        document.getElementById('popup-boreal-line-mana-fechar')?.addEventListener('click', () => this.fechar_popup_boreal_line_mana());
        document.getElementById('popup-boreal-line-mana-overlay')?.addEventListener('click', () => this.fechar_popup_boreal_line_mana());
        document.getElementById('popup-boreal-line-mana-cancelar')?.addEventListener('click', () => this.fechar_popup_boreal_line_mana());
        document.getElementById('popup-boreal-line-mana-salvar')?.addEventListener('click', () => this.salvar_popup_boreal_line_mana());

        // Popup Alma
        document.getElementById('popup-alma-fechar')?.addEventListener('click', () => this.fechar_popup_alma());
        document.getElementById('popup-alma-overlay')?.addEventListener('click', () => this.fechar_popup_alma());
        document.getElementById('popup-alma-cancelar')?.addEventListener('click', () => this.fechar_popup_alma());
        document.getElementById('popup-alma-salvar')?.addEventListener('click', () => this.salvar_popup_alma());

        // Popup Dantian
        document.getElementById('popup-dantian-fechar')?.addEventListener('click', () => this.fechar_popup_dantian());
        document.getElementById('popup-dantian-overlay')?.addEventListener('click', () => this.fechar_popup_dantian());
        document.getElementById('popup-dantian-cancelar')?.addEventListener('click', () => this.fechar_popup_dantian());
        document.getElementById('popup-dantian-salvar')?.addEventListener('click', () => this.salvar_popup_dantian());

        // Popup Meridianos
        document.getElementById('popup-meridianos-fechar')?.addEventListener('click', () => this.fechar_popup_meridianos());
        document.getElementById('popup-meridianos-overlay')?.addEventListener('click', () => this.fechar_popup_meridianos());
        document.getElementById('popup-meridianos-cancelar')?.addEventListener('click', () => this.fechar_popup_meridianos());
        document.getElementById('popup-meridianos-salvar')?.addEventListener('click', () => this.salvar_popup_meridianos());

        // Mar Espiritual - Abrir popup ao clicar no card
        document.getElementById('mar-card-clicavel')?.addEventListener('click', () => {
            this.abrir_popup_mar();
        });

        // Popup Mar Espiritual
        document.getElementById('popup-mar-fechar')?.addEventListener('click', () => this.fechar_popup_mar());
        document.getElementById('popup-mar-overlay')?.addEventListener('click', () => this.fechar_popup_mar());
        document.getElementById('popup-mar-cancelar')?.addEventListener('click', () => this.fechar_popup_mar());
        document.getElementById('popup-mar-salvar')?.addEventListener('click', () => this.salvar_popup_mar());

        this.atualizar_ui();
    }

    abrir() {
        this.modal.classList.add('ativo');
        this.aberto = true;
        this.atualizar_ui();
    }

    fechar() {
        this.modal.classList.remove('ativo');
        this.aberto = false;
    }

    abrir_popup_alma() {
        const popup = document.getElementById('popup-alma');
        if (!popup) return;
        const alma = this.dados.obter_alma();
        if (alma) {
            const inputAtual = document.getElementById('popup-alma-input');
            const inputMax = document.getElementById('popup-alma-maximo');
            if (inputAtual) inputAtual.value = alma.atual || 0;
            if (inputMax) inputMax.value = alma.maximo || 100;
        }
        popup.classList.add('ativo');
    }

    fechar_popup_alma() {
        const popup = document.getElementById('popup-alma');
        if (popup) popup.classList.remove('ativo');
    }

    salvar_popup_alma() {
        const inputAtual = document.getElementById('popup-alma-input');
        const inputMax = document.getElementById('popup-alma-maximo');
        if (!inputAtual || !inputMax) return;
        const valor = Math.min(Math.max(parseInt(inputAtual.value) || 0, 0), 10000);
        const maximo = Math.max(parseInt(inputMax.value) || 100, 1);
        this.dados.atualizar_alma(valor, maximo);
        this.atualizar_ui();
        this.fechar_popup_alma();
    }

    abrir_popup_dantian() {
        const popup = document.getElementById('popup-dantian');
        const dantian = this.dados.obter_dantian();
        document.getElementById('popup-dantian-input').value = dantian.atual;
        document.getElementById('popup-dantian-maximo').value = dantian.maximo;
        popup.classList.add('ativo');
    }

    fechar_popup_dantian() {
        document.getElementById('popup-dantian').classList.remove('ativo');
    }

    salvar_popup_dantian() {
        const valor = Math.min(Math.max(parseInt(document.getElementById('popup-dantian-input').value) || 0, 0), 10000);
        const maximo = Math.max(parseInt(document.getElementById('popup-dantian-maximo').value) || 50, 1);
        this.dados.atualizar_dantian(valor, maximo);
        this.atualizar_ui();
        this.fechar_popup_dantian();
    }

    abrir_popup_meridianos() {
        const popup = document.getElementById('popup-meridianos');
        const meridianos = this.dados.obter_meridianos();
        document.getElementById('popup-meridianos-input').value = meridianos.limpos;
        popup.classList.add('ativo');
    }

    fechar_popup_meridianos() {
        document.getElementById('popup-meridianos').classList.remove('ativo');
    }

    salvar_popup_meridianos() {
        const valor = Math.min(Math.max(parseInt(document.getElementById('popup-meridianos-input').value) || 0, 0), 314);
        this.dados.atualizar_meridianos(valor);
        this.atualizar_ui();
        this.fechar_popup_meridianos();
    }

    abrir_popup_mar() {
        const popup = document.getElementById('popup-mar');
        const mar = this.dados.obter_mar_espiritual();
        
        // Atualizar selects com valores salvos
        document.getElementById('popup-mar-estado').value = mar.estado || 'Sereno';
        document.getElementById('popup-mar-descricao').value = mar.descricao || '';
        
        // Inicializar e preencher Tamanho
        const selectTamanho = document.getElementById('popup-mar-tamanho-select');
        selectTamanho.innerHTML = '<option value="">Selecionar tamanho...</option>';
        CULTIVACAO_TAMANHOS_MAR.forEach((tamanho, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = tamanho.nome + ' - ' + tamanho.nivel;
            selectTamanho.appendChild(option);
        });
        selectTamanho.value = mar.tamanho || '';
        
        // Inicializar e preencher Elemento
        const selectElemento = document.getElementById('popup-mar-elemento-select');
        selectElemento.innerHTML = '<option value="">Selecionar elemento...</option>';
        Object.values(CULTIVACAO_ELEMENTOS).forEach(categoria => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = categoria.nome;
            categoria.elementos.forEach((elem, idx) => {
                const option = document.createElement('option');
                option.value = elem.id;
                option.textContent = elem.nome;
                optgroup.appendChild(option);
            });
            selectElemento.appendChild(optgroup);
        });
        selectElemento.value = mar.elemento || '';
        
        // Inicializar e preencher Densidade
        const selectDensidade = document.getElementById('popup-mar-densidade-select');
        selectDensidade.innerHTML = '<option value="">Selecionar densidade...</option>';
        CULTIVACAO_DENSIDADES_QI.forEach((densidade, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = densidade.nome + ' - ' + densidade.descricao;
            selectDensidade.appendChild(option);
        });
        selectDensidade.value = mar.densidade || '';
        
        popup.classList.add('ativo');
    }

    fechar_popup_mar() {
        document.getElementById('popup-mar').classList.remove('ativo');
    }

    salvar_popup_mar() {
        const estado = document.getElementById('popup-mar-estado').value;
        const tamanhoIdx = document.getElementById('popup-mar-tamanho-select').value;
        const elementoId = document.getElementById('popup-mar-elemento-select').value;
        const densidadeIdx = document.getElementById('popup-mar-densidade-select').value;
        const descricao = document.getElementById('popup-mar-descricao').value;

        this.dados.atualizar_mar_espiritual({
            estado,
            tamanho: tamanhoIdx !== '' ? parseInt(tamanhoIdx) : null,
            elemento: elementoId !== '' ? elementoId : null,
            densidade: densidadeIdx !== '' ? parseInt(densidadeIdx) : null,
            descricao
        });

        this.atualizar_ui();
        this.fechar_popup_mar();
    }

    voltarMenuPrincipal() {
        // Fechar todos os popups
        this.fechar_popup_dantian();
        this.fechar_popup_meridianos();
        this.fechar_popup_mar();

        // Fechar o modal de cultivação
        this.fechar();

        // Voltar para o menu principal
        setTimeout(() => {
            const btnMenu = document.getElementById('btn-menu-principal');
            if (btnMenu) {
                btnMenu.click();
                btnMenu.focus();
                console.log('✅ Voltado com sucesso para o menu principal');
            } else {
                console.warn('⚠️ Botão do menu principal não encontrado');
            }
        }, 300);
    }

    mudar_mundo(mundo) {
        // Atualizar abas
        document.querySelectorAll('.cultivacao-aba').forEach(aba => {
            aba.classList.toggle('ativo', aba.dataset.mundo === mundo);
        });

        // Atualizar conteúdo
        document.querySelectorAll('.cultivacao-mundo').forEach(m => {
            m.classList.toggle('ativo', m.dataset.mundo === mundo);
        });

        this.mundo_atual = mundo;
        this.dados.definir_mundo_ativo(mundo);
        this.atualizar_ui();
    }

    atualizar_ui() {
        this.atualizar_header();
        this.atualizar_universal();
        this.atualizar_mundo_atual();
        this.verificar_risco_geral();
    }

    atualizar_header() {
        const mundos = {
            'elder-gods': 'The Elder Gods',
            'boreal-line': 'Boreal Line',
            'murim': 'Legends of Murim'
        };

        const mundo = this.mundo_atual;
        const dados_mundo = this.obter_dados_mundo_atual();

        document.getElementById('cult-mundo-nome').textContent = mundos[mundo];
        document.getElementById('cult-rank-atual').textContent = dados_mundo.rank || 1;

        // 🔄 NÍVEL diferencia por mundo
        let valor_nivel = 1;
        if (mundo === 'elder-gods') {
            valor_nivel = dados_mundo.nivel || 1; // Elder Gods: nível direto
        } else if (mundo === 'boreal-line') {
            valor_nivel = dados_mundo.mana || 0; // Boreal Line: Núcleos de Mana
        } else if (mundo === 'murim') {
            valor_nivel = dados_mundo.petalas || 0; // Murim: Pétalas do Lótus
        }
        
        document.getElementById('cult-nivel-atual').textContent = valor_nivel;
    }

    atualizar_universal() {
        // Alma
        const alma = this.dados.obter_alma();
        const alma_atual = alma?.atual ?? 0;
        const alma_max = alma?.maximo ?? 100;
        const alma_pct = (alma_atual / alma_max) * 100;
        document.getElementById('alma-bar').style.width = alma_pct + '%';
        document.getElementById('alma-valor').textContent = Math.round(alma_pct) + '%';
        document.getElementById('alma-stat').textContent = `${alma_atual} / ${alma_max}`;

        // Dantian
        const dantian = this.dados.obter_dantian();
        const dant_atual = dantian?.atual ?? 0;
        const dant_max = dantian?.maximo ?? 50;
        const dant_pct = (dant_atual / dant_max) * 100;
        document.getElementById('dantian-bar').style.width = dant_pct + '%';
        document.getElementById('dantian-valor').textContent = Math.round(dant_pct) + '%';
        document.getElementById('dantian-stat').textContent = `${dant_atual} / ${dant_max}`;

        // Meridianos
        const meridiano = this.dados.obter_meridianos();
        const mer_limpos = meridiano?.limpos ?? 0;
        const mer_max = meridiano?.maximo ?? 314;
        const mer_pct = (mer_limpos / mer_max) * 100;
        document.getElementById('meridiano-bar').style.width = mer_pct + '%';
        document.getElementById('meridiano-valor').textContent = Math.round(mer_pct) + '%';
        document.getElementById('meridiano-stat').textContent = `${mer_limpos} / ${mer_max}`;

        // Popups são atualizados quando o usuário abre (no abrir_popup_dantian/meridianos)

        // Técnica
        const tecnica = this.dados.obter_tecnica();
        document.getElementById('tecnica-nome').value = tecnica.nome;
        document.getElementById('tecnica-energia').value = tecnica.tipo_energia;
        document.getElementById('tecnica-desc').value = tecnica.descricao;
        document.getElementById('tecnica-concentracao').value = tecnica.concentracao || '';
        document.getElementById('tecnica-dado').value = tecnica.dado || '1d4';

        // Mar Espiritual
        const mar = this.dados.obter_mar_espiritual();
        document.getElementById('mar-estado').textContent = mar.estado;
        
        // Exibir tamanho (com nome da constante)
        const tamanhoNome = mar.tamanho !== null && mar.tamanho !== undefined 
            ? CULTIVACAO_TAMANHOS_MAR[mar.tamanho]?.nome || '—'
            : '—';
        document.getElementById('mar-tamanho').textContent = tamanhoNome;
        
        // Exibir elemento (com nome da constante)
        let elementoNome = '—';
        if (mar.elemento) {
            for (const categoria of Object.values(CULTIVACAO_ELEMENTOS)) {
                const elem = categoria.elementos.find(e => e.id === mar.elemento);
                if (elem) {
                    elementoNome = elem.nome;
                    break;
                }
            }
        }
        document.getElementById('mar-elemento').textContent = elementoNome;
        
        // Exibir densidade (com nome da constante)
        const densidadeNome = mar.densidade !== null && mar.densidade !== undefined 
            ? CULTIVACAO_DENSIDADES_QI[mar.densidade]?.nome || '—'
            : '—';
        document.getElementById('mar-densidade').textContent = densidadeNome;
        
        document.getElementById('mar-descricao').textContent = mar.descricao || '—';
    }

    atualizar_mundo_atual() {
        switch (this.mundo_atual) {
            case 'elder-gods':
                this.atualizar_elder_gods();
                break;
            case 'boreal-line':
                this.atualizar_boreal_line();
                break;
            case 'murim':
                this.atualizar_murim();
                break;
        }
    }

    atualizar_elder_gods() {
        const dados = this.dados.obter_elder_gods();

        document.getElementById('egods-rank-nome').textContent = dados.nome_rank;
        document.getElementById('egods-nivel').textContent = `Nível ${dados.nivel} / 9`;
        document.getElementById('egods-rank-num').textContent = dados.rank;
        document.getElementById('egods-xp-total').textContent = dados.xp_total;

        const xp_pct = (dados.xp_atual / dados.xp_necessario) * 100;
        document.getElementById('egods-xp-bar').style.width = xp_pct + '%';
        document.getElementById('egods-xp-valor').textContent = Math.round(xp_pct) + '%';
        document.getElementById('egods-xp-stat').textContent = `${dados.xp_atual} / ${dados.xp_necessario}`;

        // Botão de rompimento
        const btn_romper = document.getElementById('egods-romper');
        btn_romper.disabled = dados.nivel < 9;

        // Tabela de ranks
        this.renderizar_tabela_elder_gods();
    }

    renderizar_tabela_elder_gods() {
        const ranks = [
            { nome: 'Corpo Temperado', attr: '+3 a cada 3 níveis', max: '35' },
            { nome: 'Fundação Inicial', attr: '+3 a cada 3 níveis', max: '45' },
            { nome: 'Transformação de Qí', attr: '+3 a cada 3 níveis', max: '55' },
            { nome: 'Verdadeira Fundação', attr: '+5 a cada 3 níveis', max: '65' },
            { nome: 'Formação da Alma', attr: '+5 a cada 3 níveis', max: '75' },
            { nome: 'Alma Nascente', attr: '+5 a cada 3 níveis', max: '85' },
            { nome: 'Rei Espiritual', attr: '+7 a cada 3 níveis', max: '95' },
            { nome: 'Nirvana', attr: '+7 a cada 3 níveis', max: '105' },
            { nome: 'Meio Santo', attr: '+7 a cada 3 níveis', max: '125' },
            { nome: 'Santo Espiritual', attr: '+9 a cada 3 níveis', max: '150' },
            { nome: 'Príncipe Santo', attr: '+9 a cada 3 níveis', max: '175' },
            { nome: 'Rei Santo', attr: '+11 a cada 3 níveis', max: '200' },
            { nome: 'Santo Imperial', attr: '+11 a cada 3 níveis', max: '300' },
            { nome: 'Imperador Marcial', attr: '+15 a cada 3 níveis', max: '400' },
            { nome: 'Deidade', attr: '+15 a cada 3 níveis', max: '500' }
        ];

        const container = document.getElementById('egods-tabela-conteudo');
        if (!container) return;

        container.innerHTML = ranks.map((rank, idx) => `
            <div class="elder-gods-tabela-linha">
                <div class="elder-gods-tabela-celula">${idx + 1}</div>
                <div class="elder-gods-tabela-celula">${rank.nome}</div>
                <div class="elder-gods-tabela-celula">9</div>
                <div class="elder-gods-tabela-celula">${rank.attr}</div>
                <div class="elder-gods-tabela-celula elder-gods-tabela-max">Máx: ${rank.max}</div>
            </div>
        `).join('');
    }

    renderizar_tabela_boreal_line() {
        const ranks_config = this.dados.obter_ranks_boreal_line_config();
        
        const container = document.getElementById('bl-tabela-conteudo');
        if (!container) return;

        container.innerHTML = ranks_config.map((rank, idx) => {
            const sub_ranks_count = rank.sub_ranks ? rank.sub_ranks.length : 0;
            const sub_ranks_text = sub_ranks_count > 0 ? sub_ranks_count : '-';
            
            return `
                <div class="boreal-line-tabela-linha">
                    <div class="boreal-line-tabela-celula">${idx + 1}</div>
                    <div class="boreal-line-tabela-celula">${rank.nome}</div>
                    <div class="boreal-line-tabela-celula">${sub_ranks_text}</div>
                    <div class="boreal-line-tabela-celula">9</div>
                </div>
            `;
        }).join('');
    }

    renderizar_tabela_murim() {
        const ranks = [
            { nome: 'Fundação Turva', desc: 'Início da jornada', petalas: '9' },
            { nome: 'Fundação Límpida', desc: 'Consolidação', petalas: '9' },
            { nome: 'Núcleo Brilhante', desc: 'Transformação inicial', petalas: '9' },
            { nome: 'Formação da Alma', desc: 'Alma despertando', petalas: '9' },
            { nome: 'Imortal Verdadeiro', desc: 'Ascensão máxima', petalas: '9' },
            { nome: 'Semideus', desc: 'Poder sobre-humano', petalas: '9' },
            { nome: 'Deus Menor', desc: 'Deidade encarnada', petalas: '9' },
            { nome: 'Deus Maior', desc: 'Poder absoluto', petalas: '9' }
        ];

        const container = document.getElementById('murim-tabela-conteudo');
        if (!container) return;

        container.innerHTML = ranks.map((rank, idx) => `
            <div class="murim-tabela-linha">
                <div class="murim-tabela-celula">${idx + 1}</div>
                <div class="murim-tabela-celula">${rank.nome}</div>
                <div class="murim-tabela-celula">${rank.petalas}</div>
                <div class="murim-tabela-celula">${rank.desc}</div>
            </div>
        `).join('');
    }

    atualizar_boreal_line() {
        const dados = this.dados.obter_boreal_line();

        document.getElementById('bl-rank-nome').textContent = dados.nome_rank;
        document.getElementById('bl-rank-num').textContent = dados.rank;

        // Mostrar sub-rank se existir
        const bl_sub_rank = document.getElementById('bl-sub-rank-nome');
        if (bl_sub_rank) {
            bl_sub_rank.textContent = dados.nome_sub_rank || '';
            bl_sub_rank.style.display = dados.nome_sub_rank ? 'block' : 'none';
        }

        // Atualizar barra de XP da Mana Corporal (XP necessário dobra a cada rank)
        const xp_atual = dados.fragmentos;
        const xp_maximo = this.dados.calcular_xp_mana_boreal_line(dados.rank);
        const percentual_xp = (xp_atual / xp_maximo) * 100;
        
        document.getElementById('bl-xp-atual').textContent = xp_atual;
        document.getElementById('bl-xp-maximo').textContent = xp_maximo;
        document.getElementById('bl-xp-fill').style.width = percentual_xp + '%';
        document.getElementById('bl-fragmentos-restantes').textContent = xp_maximo - xp_atual;

        // Atualizar estado do botão de avançar rank (só habilita com 9 núcleos de mana)
        const btn_avancar_rank = document.getElementById('bl-avancar');
        if (btn_avancar_rank) {
            const tem_9_mana = dados.mana >= 9;
            btn_avancar_rank.disabled = !tem_9_mana;
            btn_avancar_rank.title = tem_9_mana 
                ? 'Avançar para o próximo rank/sub-rank (9/9 núcleos)' 
                : `Você precisa de 9 núcleos de mana para avançar (${dados.mana}/9)`;
        }

        const container = document.getElementById('bl-mana-container');
        if (!container) return;

        // Mostrar até 9 núcleos de mana visualmente (como as pétalas)
        const mana_visiveis = Math.min(dados.mana, 9);
        container.innerHTML = Array.from({ length: mana_visiveis }).map((_, idx) => `
            <div class="boreal-line-mana-card">
                <div class="boreal-line-mana-icone">
                    <img src="https://i.imgur.com/UJIZLAX.png" alt="Núcleo de Mana" class="boreal-line-mana-nucleo-img">
                </div>
                <div class="boreal-line-mana-nome">Núcleo ${idx + 1}</div>
                <div class="boreal-line-mana-descricao">Estágio: ${dados.estagio_mana}</div>
            </div>
        `).join('');

        // Renderizar tabela de ranks
        this.renderizar_tabela_boreal_line();
    }

    atualizar_murim() {
        const dados = this.dados.obter_murim();

        document.getElementById('murim-rank-nome').textContent = dados.nome_rank;
        document.getElementById('murim-rank-num').textContent = dados.rank;

        // Atualizar barra de XP da Lótus (XP necessário dobra a cada rank)
        const xp_atual = dados.fragmentos;
        const xp_maximo = this.dados.calcular_xp_petala_murim(dados.rank);
        const percentual_xp = (xp_atual / xp_maximo) * 100;
        
        document.getElementById('murim-xp-atual').textContent = xp_atual;
        document.getElementById('murim-xp-maximo').textContent = xp_maximo;
        document.getElementById('murim-xp-fill').style.width = percentual_xp + '%';
        document.getElementById('murim-fragmentos-restantes').textContent = xp_maximo - xp_atual;

        // Atualizar estado do botão de avançar rank (só habilita com 9 pétalas)
        const btn_avancar_rank = document.getElementById('murim-avancar-rank');
        if (btn_avancar_rank) {
            const tem_9_petalas = dados.petalas >= 9;
            btn_avancar_rank.disabled = !tem_9_petalas;
            btn_avancar_rank.title = tem_9_petalas 
                ? 'Avançar para o próximo rank (9/9 pétalas)' 
                : `Você precisa de 9 pétalas para avançar (${dados.petalas}/9)`;
        }

        const container = document.getElementById('murim-petalas-container');
        if (!container) return;

        const petalas_visiveis = Math.min(dados.petalas, 9);
        container.innerHTML = Array.from({ length: petalas_visiveis }).map((_, idx) => `
            <div class="murim-petala-card">
                <div class="murim-petala-icone">🌸</div>
                <div class="murim-petala-nome">Pétala ${idx + 1}</div>
                <div class="murim-petala-descricao">Estágio: ${dados.estagio_petala}</div>
            </div>
        `).join('');

        // Renderizar tabela de ranks
        this.renderizar_tabela_murim();
    }

    obter_dados_mundo_atual() {
        switch (this.mundo_atual) {
            case 'elder-gods':
                return this.dados.obter_elder_gods();
            case 'boreal-line':
                return this.dados.obter_boreal_line();
            case 'murim':
                return this.dados.obter_murim();
            default:
                return {};
        }
    }

    abrir_popup_egods_xp() {
        const popup = document.getElementById('popup-egods-xp');
        const egods = this.dados.obter_elder_gods();
        document.getElementById('popup-egods-xp-info').textContent = egods.xp;
        document.getElementById('popup-egods-xp-max').textContent = egods.xp_para_nivel;
        document.getElementById('popup-egods-xp-input').value = 10;
        popup.classList.add('ativo');
    }

    fechar_popup_egods_xp() {
        document.getElementById('popup-egods-xp').classList.remove('ativo');
    }

    salvar_popup_egods_xp() {
        const valor = Math.max(parseInt(document.getElementById('popup-egods-xp-input').value) || 1, 1);
        this.dados.ganhar_xp_elder_gods(valor);
        this.atualizar_elder_gods();
        this.atualizar_header();
        this.fechar_popup_egods_xp();
    }

    egods_ganhar_xp() {
        this.abrir_popup_egods_xp();
    }

    egods_romper() {
        const dados = this.dados.obter_elder_gods();
        if (dados.nivel === 9) {
            this.dados.rompimento_rank_elder_gods();
            this.atualizar_elder_gods();
            this.atualizar_header();
        }
    }

    bl_ganhar_xp() {
        const popup = document.getElementById('popup-boreal-line-mana');
        const boreal_line = this.dados.obter_boreal_line();
        document.getElementById('popup-boreal-line-mana-info').textContent = boreal_line.fragmentos + '/' + this.dados.calcular_xp_mana_boreal_line(boreal_line.rank);
        document.getElementById('popup-boreal-line-mana-total').textContent = boreal_line.qi_acumulado;
        document.getElementById('popup-boreal-line-mana-input').value = 10;
        popup.classList.add('ativo');
    }

    bl_avancar() {
        const boreal_line = this.dados.obter_boreal_line();
        
        // Verificar se tem 9 núcleos de mana
        if (boreal_line.mana < 9) {
            alert(`⚠️ Você precisa de 9 Núcleos de Mana para avançar de rank!\n\nAtual: ${boreal_line.mana}/9 núcleos`);
            return;
        }
        
        // Avançar de rank e resetar os núcleos de mana
        this.dados.avancar_rank_boreal_line();
        this.atualizar_boreal_line();
        this.atualizar_header();
        
        // Feedback visual - melhorado para mostrar sub-rank se existir
        const boreal_line_atualizado = this.dados.obter_boreal_line();
        const mensagem = boreal_line_atualizado.nome_sub_rank 
            ? `❄️ Parabéns! Você avançou para:\n\n${boreal_line_atualizado.nome_rank}\n${boreal_line_atualizado.nome_sub_rank}\n\nOs Núcleos de Mana foram resetados.`
            : `❄️ Parabéns! Você avançou para ${boreal_line_atualizado.nome_rank}!\n\nOs Núcleos de Mana foram resetados.`;
        alert(mensagem);
    }

    murim_avancar_rank() {
        const murim = this.dados.obter_murim();
        
        // Verificar se tem 9 pétalas formadas
        if (murim.petalas < 9) {
            alert(`⚠️ Você precisa de 9 Lótus do Céu Imortal para avançar de rank!\n\nAtual: ${murim.petalas}/9 pétalas`);
            return;
        }
        
        // Avançar de rank e resetar as pétalas
        this.dados.avancar_rank_murim();
        this.atualizar_murim();
        this.atualizar_header();
        
        // Feedback visual
        alert(`🌸 Parabéns! Você avançou para ${murim.nome_rank}!\n\nAs Lótus do Céu Imortal foram resetadas.`);
    }

    abrir_popup_murim_qi() {
        const popup = document.getElementById('popup-murim-qi');
        const murim = this.dados.obter_murim();
        document.getElementById('popup-murim-qi-info').textContent = murim.fragmentos + '/100';
        document.getElementById('popup-murim-qi-total').textContent = murim.qi_acumulado;
        document.getElementById('popup-murim-qi-input').value = 10;
        popup.classList.add('ativo');
    }

    fechar_popup_murim_qi() {
        document.getElementById('popup-murim-qi').classList.remove('ativo');
    }

    fechar_popup_boreal_line_mana() {
        document.getElementById('popup-boreal-line-mana').classList.remove('ativo');
    }

    salvar_popup_murim_qi() {
        const valor = Math.max(parseInt(document.getElementById('popup-murim-qi-input').value) || 1, 1);
        
        // Detectar qual mundo está ativo
        if (this.mundo_atual === 'murim') {
            this.dados.ganhar_fragmentos_murim(valor);
            this.atualizar_murim();
        } else if (this.mundo_atual === 'boreal-line') {
            this.dados.ganhar_fragmentos_boreal_line(valor);
            this.atualizar_boreal_line();
        }
        
        this.fechar_popup_murim_qi();
    }

    salvar_popup_boreal_line_mana() {
        const valor = Math.max(parseInt(document.getElementById('popup-boreal-line-mana-input').value) || 1, 1);
        this.dados.ganhar_fragmentos_boreal_line(valor);
        this.atualizar_boreal_line();
        this.fechar_popup_boreal_line_mana();
    }

    murim_ganhar_qi() {
        this.abrir_popup_murim_qi();
    }

    murim_adicionar_petala() {
        this.dados.adicionar_petala_murim();
        this.atualizar_murim();
    }

    salvar_tecnica() {
        // 🔒 BLOQUEIO: Não salvar durante importação
        if (window.isImportandoFicha || sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA')) {
            console.log('🔒 [CultivacaoSistema] Salvamento bloqueado - Importação em progresso');
            return;
        }

        const nome = document.getElementById('tecnica-nome').value;
        const energia = document.getElementById('tecnica-energia').value;
        const desc = document.getElementById('tecnica-desc').value;
        const concentracao = document.getElementById('tecnica-concentracao').value || '';
        const dado = document.getElementById('tecnica-dado').value || '1d4';

        this.dados.atualizar_tecnica(nome, energia, desc, concentracao, dado);
    }

    // 🔧 NOVO: Funções para Mar Espiritual com Elementos e Densidade
    
    /**
     * Atualiza a descrição do Mar Espiritual baseado nas seleções
     */
    atualizar_descricao_mar() {
        const tamanho = this.dados.dados.universal.mar_espiritual.tamanho;
        const elemento = this.dados.dados.universal.mar_espiritual.elemento;
        const densidade = this.dados.dados.universal.mar_espiritual.densidade;

        let descricao = '—';

        if (typeof CULTIVACAO_TAMANHOS_MAR !== 'undefined' && 
            typeof CULTIVACAO_DENSIDADES_QI !== 'undefined') {
            
            const tamInfo = CULTIVACAO_TAMANHOS_MAR[tamanho];
            const densInfo = CULTIVACAO_DENSIDADES_QI[densidade];

            // 🔧 Obter nome do elemento
            let nomeElemento = elemento;
            for (const categoria of Object.values(CULTIVACAO_ELEMENTOS)) {
                const elem = categoria.elementos.find(e => e.id === elemento);
                if (elem) {
                    nomeElemento = elem.nome;
                    break;
                }
            }

            if (tamInfo && densInfo) {
                descricao = `Um ${tamInfo.nome.toLowerCase()} de ${nomeElemento.toLowerCase()} em estado de ${densInfo.nome.toLowerCase()}. (${densInfo.descricao})`;
            }
        }

        const descricaoEl = document.getElementById('mar-descricao');
        if (descricaoEl) {
            descricaoEl.textContent = descricao;
        }
    }

    verificar_risco_geral() {
        const risco = this.dados.calcular_risco_geral();
        const container = this.modal?.querySelector('.cultivacao-container');
        
        if (!container) return;

        if (risco > 60) {
            container.classList.add('risco-alto');
        } else {
            container.classList.remove('risco-alto');
        }
    }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   INICIALIZAÇÃO
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const cultivacao_dados = new CultivacaoDadosManager();
    const cultivacao_ui = new CultivacaoUIManager(cultivacao_dados);

    // Expor globalmente para debug
    window.cultivacao = {
        dados: cultivacao_dados,
        ui: cultivacao_ui,
        resetar: () => {
            cultivacao_dados.limpar_dados();
            cultivacao_ui.atualizar_ui();
            console.log('✅ Sistema resetado com sucesso!');
        }
    };

    console.log('💫 Sistema de Cultivação carregado! Use: cultivacao.resetar() para limpar dados');
});
