/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   CORPO IMORTAL - GERENCIADOR DE DADOS
   
   Responsável por:
   - Armazenar dados do sistema de Corpo Imortal
   - Gerenciar estado global
   - Persistir dados no localStorage
   - Validar integridade de dados
   - Executar cálculos de bônus
   
   Data: 1 de março de 2026
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalDados {
    constructor() {
        this.chave_storage = 'corpoImortalData';
        this.dados = this.carregar();
    }

    /**
     * Carrega dados do localStorage ou usa padrão
     */
    carregar() {
        const salvo = localStorage.getItem(this.chave_storage);
        
        if (salvo) {
            try {
                const dados = JSON.parse(salvo);
                console.log('✅ Dados de Corpo Imortal carregados:', dados);
                
                // Validar estrutura
                if (this.validarDados(dados)) {
                    return dados;
                }
            } catch (e) {
                console.error('❌ Erro ao carregar dados de Corpo Imortal:', e);
                localStorage.removeItem(this.chave_storage);
            }
        }
        
        console.log('⚠️ Usando dados padrão de Corpo Imortal');
        return this.dadosPadrao();
    }

    /**
     * Valida a integridade dos dados
     */
    validarDados(dados) {
        // Verificar estrutura básica
        if (!dados || typeof dados !== 'object') return false;
        if (typeof dados.pontosDisponiveis !== 'number') return false;
        if (typeof dados.dantian !== 'number') return false;
        if (typeof dados.meridianos !== 'number') return false;
        if (typeof dados.refino !== 'number') return false;
        if (typeof dados.marEspiritual !== 'number') return false;

        // Validar valores (nunca negativo, nunca mais de 6)
        const valores = [dados.pontosDisponiveis, dados.dantian, dados.meridianos, dados.refino, dados.marEspiritual];
        
        for (const valor of valores) {
            if (valor < 0) return false;
        }

        // Funcões não podem passar de 6
        if (dados.dantian > 6 || dados.meridianos > 6 || dados.refino > 6 || dados.marEspiritual > 6) {
            return false;
        }

        // 🔧 Adicionar estrutura de melhorias desbloqueadas se não existir (para compatibilidade com dados antigos)
        if (!dados.melhoriasDesbloqueadas) {
            dados.melhoriasDesbloqueadas = {
                dantian: [],
                meridianos: [],
                refino: [],
                marEspiritual: []
            };
        }

        return true;
    }

    /**
     * Retorna dados padrão
     */
    dadosPadrao() {
        return {
            pontosDisponiveis: 0,
            dantian: 0,
            meridianos: 0,
            refino: 0,
            marEspiritual: 0,
            // 🔧 Nova estrutura: rastreia melhorias específicas desbloqueadas
            // Formato: { "dantian": [{ nivel: 3, nome: "Caminho do Dou Qí", index: 0 }, ...], ... }
            melhoriasDesbloqueadas: {
                dantian: [],
                meridianos: [],
                refino: [],
                marEspiritual: []
            }
        };
    }

    /**
     * Salva dados no localStorage
     */
    salvar() {
        try {
            localStorage.setItem(this.chave_storage, JSON.stringify(this.dados));
            console.log('✅ Dados de Corpo Imortal salvos');
            return true;
        } catch (e) {
            console.error('❌ Erro ao salvar dados:', e);
            return false;
        }
    }

    /**
     * Calcula pontos disponíveis baseado na soma dos atributos primários
     * Fórmula: (FOR + VIT + AGI + INT + PER + SOR) / 50 (arredondado para baixo)
     */
    calcularPontosDisponiveis() {
        const stateManager = window.appState;
        if (!stateManager) {
            console.warn('⚠️ StateManager não disponível para cálculo de pontos');
            return 0;
        }

        try {
            const state = stateManager.getState();
            const primarios = state.atributos?.primarios || {};

            // Obter totais dos 6 atributos primários
            const FOR = primarios.forca?.total || 0;
            const VIT = primarios.vitalidade?.total || 0;
            const AGI = primarios.agilidade?.total || 0;
            const INT = primarios.inteligencia?.total || 0;
            const PER = primarios.percepcao?.total || 0;
            const SOR = primarios.sorte?.total || 0;

            // Soma total dos atributos
            const somaTotal = FOR + VIT + AGI + INT + PER + SOR;

            // Calcula pontos disponíveis (dividido por 50, arredondado para baixo)
            const pontosCalculados = Math.floor(somaTotal / 50);

            console.log(`💎 Cálculo de Pontos Disponíveis: (${FOR}+${VIT}+${AGI}+${INT}+${PER}+${SOR}) / 50 = ${somaTotal} / 50 = ${pontosCalculados}`);

            return pontosCalculados;
        } catch (e) {
            console.error('❌ Erro ao calcular pontos disponíveis:', e);
            return 0;
        }
    }

    /**
     * Atualiza os pontos disponíveis automaticamente
     */
    atualizarPontosDisponiveis() {
        const novosPontos = this.calcularPontosDisponiveis();
        this.dados.pontosDisponiveis = novosPontos;
        this.salvar();
        console.log(`✅ Pontos disponíveis atualizados para: ${novosPontos}`);
    }

    /**
     * Adiciona pontos disponíveis
     */
    adicionarPontos(quantidade) {
        this.dados.pontosDisponiveis += quantidade;
        this.salvar();
    }

    /**
     * Tenta fazer upgrade de uma função
     */
    fazerUpgrade(funcao) {
        // Verificar se tem ponto disponível
        if (this.dados.pontosDisponiveis <= 0) {
            console.warn('⚠️ Nenhum ponto disponível');
            return false;
        }

        // Verificar se a função existe e não atingiu máximo
        if (!this.dados.hasOwnProperty(funcao)) {
            console.error('❌ Função inválida:', funcao);
            return false;
        }

        if (this.dados[funcao] >= 6) {
            console.warn('⚠️ Função já está no máximo (6 pontos)');
            return false;
        }

        // Fazer upgrade
        this.dados[funcao]++;
        this.dados.pontosDisponiveis--;
        this.salvar();

        console.log(`✅ ${funcao} atualizado para ${this.dados[funcao]}`);
        return true;
    }

    /**
     * Desbloqueia uma melhoria específica
     * @param {string} funcao - Nome da função (dantian, meridianos, etc)
     * @param {object} melhoria - Objeto da melhoria
     * @param {number} nivel - Nível em que a melhoria foi desbloqueada
     * @param {number} index - Índice da melhoria no array de melhorias do nível
     */
    desbloquearMelhoria(funcao, melhoria, nivel, index) {
        if (!this.dados.melhoriasDesbloqueadas[funcao]) {
            this.dados.melhoriasDesbloqueadas[funcao] = [];
        }

        // Verificar se já foi desbloqueada
        const jaExiste = this.dados.melhoriasDesbloqueadas[funcao].some(m => 
            m.nivel === nivel && m.index === index && m.nome === melhoria.nome
        );

        if (!jaExiste) {
            this.dados.melhoriasDesbloqueadas[funcao].push({
                nivel: nivel,
                nome: melhoria.nome,
                index: index,
                descricao: melhoria.descricao,
                tipo: melhoria.tipo,
                efeito: melhoria.efeito,
                dataDesbloqueio: new Date().toISOString()
            });
            
            console.log(`✨ Melhoria desbloqueada: ${melhoria.nome} (${funcao} nível ${nivel})`);
            this.salvar();
        }
    }
    resetar() {
        if (confirm('⚠️ Deseja RESETAR todos os dados de Corpo Imortal? Esta ação não pode ser desfeita!')) {
            // 🔧 CORREÇÃO: Resetar tudo mas recalcular pontos disponíveis
            // em vez de zerar (como antes)
            this.dados = this.dadosPadrao();
            
            // Recalcular pontos baseado nos atributos atuais
            this.atualizarPontosDisponiveis();
            
            this.salvar();
            console.log('✅ Dados resetados com pontos recalculados');
            return true;
        }
        return false;
    }

    /**
     * Obtém bônus totais calculados
     */
    calcularBonusFinais() {
        return {
            dantian: this.calcularBonusDantian(),
            meridianos: this.calcularBonusMeridianos(),
            refino: this.calcularBonusRefino(),
            marEspiritual: this.calcularBonusMarEspiritual()
        };
    }

    calcularBonusDantian() {
        const nivel = this.dados.dantian;
        return {
            absorcao_qí: nivel * 5,
            armazenamento: nivel * 3
        };
    }

    calcularBonusMeridianos() {
        const nivel = this.dados.meridianos;
        return {
            dado_cultivo: nivel * 1,
            eficiencia_fluxo: nivel * 4
        };
    }

    calcularBonusRefino() {
        const nivel = this.dados.refino;
        return {
            hp_maximo: nivel * 2,
            ataque: nivel * 1,
            defesa: nivel * 1,
            limite_atributo: Math.floor(nivel / 2) * 1
        };
    }

    calcularBonusMarEspiritual() {
        const nivel = this.dados.marEspiritual;
        return {
            capacidade_qí: nivel * 6,
            estabilidade: nivel * 3
        };
    }

    /**
     * Obtém a próxima melhoria disponível para uma função
     */
    obterProximaMelhoria(funcao) {
        console.log(`🔍 Obtendo próxima melhoria para ${funcao}...`);
        const nivelAtual = this.dados[funcao] || 0;
        const proximoNivel = nivelAtual + 1;

        console.log(`   Nível atual: ${nivelAtual}, Próximo nível: ${proximoNivel}`);

        // Verificar se pode fazer upgrade (máximo 6)
        if (proximoNivel > 6) {
            console.warn(`⚠️ Máximo de níveis atingido para ${funcao}`);
            return null;
        }

        // Obter melhoria usando a função de corpo-imortal-melhorias.js
        if (typeof obterMelhorias === 'function') {
            const melhorias = obterMelhorias(funcao, proximoNivel);
            console.log(`   Melhorias obtidas:`, melhorias);
            return melhorias && melhorias.length > 0 ? melhorias[0] : null;
        }

        console.warn('⚠️ Função obterMelhorias não disponível');
        return null;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   CORPO IMORTAL - GERENCIADOR DE UI
   
   Responsável por:
   - Renderizar HTML do popup
   - Gerenciar interações do usuário
   - Animar elementos
   - Atualizar display
   
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalUI {
    constructor() {
        this.dados = new CorpoImortalDados();
        this.isAberto = false;
        this.funcoes = {
            dantian: { nome: 'Dantian', icone: '🔵', descricao: 'Absorção e armazenamento de Qí' },
            meridianos: { nome: 'Meridianos', icone: '🟢', descricao: 'Eficiência de fluxo e cultivo' },
            refino: { nome: 'Refino Corporal', icone: '🔴', descricao: 'Vida, Ataque e Defesa' },
            marEspiritual: { nome: 'Mar Espiritual', icone: '🟣', descricao: 'Capacidade e estabilidade total' }
        };
        
        this.init();
    }

    /**
     * Inicializa o sistema
     */
    init() {
        console.log('🔧 Inicializando CorpoImortalUI...');
        this.criarOverlay();
        this.criarPopup();
        this.anexarEventos();
        console.log('✅ CorpoImortalUI inicializado com sucesso');
        
        // Debug
        console.log('🔍 Overlay existe?', !!document.getElementById('corpo-imortal-overlay'));
        console.log('🔍 Popup existe?', !!document.getElementById('popup-corpo-imortal'));
    }

    /**
     * Cria overlay do popup
     */
    criarOverlay() {
        if (document.getElementById('corpo-imortal-overlay')) {
            console.log('⚠️ Overlay já existe');
            return;
        }

        console.log('🔨 Criando overlay...');
        const overlay = document.createElement('div');
        overlay.id = 'corpo-imortal-overlay';
        overlay.className = 'corpo-imortal-overlay';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.fechar();
            }
        });
        document.body.appendChild(overlay);
        console.log('✅ Overlay criado e anexado ao body');
    }

    /**
     * Cria estrutura HTML do popup
     */
    criarPopup() {
        if (document.getElementById('popup-corpo-imortal')) {
            console.log('⚠️ Popup já existe');
            return;
        }

        console.log('🔨 Criando popup...');
        const popup = document.createElement('div');
        popup.id = 'popup-corpo-imortal';
        popup.className = 'corpo-imortal-popup';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-labelledby', 'corpo-imortal-title');
        popup.setAttribute('aria-modal', 'true');

        // Será atualizado em renderizar()
        // Anexar dentro do overlay
        const overlay = document.getElementById('corpo-imortal-overlay');
        if (overlay) {
            overlay.appendChild(popup);
            console.log('✅ Popup criado e anexado ao overlay');
        } else {
            console.warn('⚠️ Overlay não encontrado, anexando ao body');
            document.body.appendChild(popup);
        }
    }

    /**
     * Anexa eventos globais
     */
    anexarEventos() {
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isAberto) {
                this.fechar();
            }
        });

        // Botão do menu principal
        const botaoMenu = document.getElementById('menu-btn-corpo-imortal');
        if (botaoMenu) {
            botaoMenu.addEventListener('click', () => this.abrir());
        }
    }

    /**
     * Abre o popup
     */
    abrir() {
        console.log('📖 Abrindo popup de Corpo Imortal...');
        this.isAberto = true;
        
        // ✅ Atualizar pontos disponíveis ANTES de renderizar
        this.dados.atualizarPontosDisponiveis();
        
        this.renderizar();
        
        const overlay = document.getElementById('corpo-imortal-overlay');
        if (!overlay) {
            console.error('❌ ERRO: Overlay não encontrado!');
            console.log('🔍 Verificando estrutura DOM...');
            console.log('Body:', document.body);
            console.log('Todos os divs:', document.querySelectorAll('div[id*="corpo"]'));
            return;
        }
        
        console.log('✅ Overlay encontrado, adicionando classe ativo');
        overlay.classList.add('ativo');
        console.log('✅ Classe ativo adicionada ao overlay');
        console.log('✅ Overlay classes:', overlay.className);
    }

    /**
     * Fecha o popup
     */
    fechar() {
        console.log('📕 Fechando popup de Corpo Imortal...');
        this.isAberto = false;
        const overlay = document.getElementById('corpo-imortal-overlay');
        if (overlay) {
            overlay.classList.remove('ativo');
            console.log('✅ Overlay fechado');
            // NÃO remover do DOM, apenas esconder com CSS
        } else {
            console.warn('⚠️ Overlay não encontrado ao fechar');
        }
    }

    /**
     * Volta para o menu principal
     */
    voltarMenu() {
        console.log('🔙 Voltando do Corpo Imortal para o menu principal...');
        this.fechar();
        
        // Aguardar a animação de fechamento
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

    /**
     * Renderiza o conteúdo completo do popup
     */
    renderizar() {
        console.log('🎨 Renderizando popup...');
        const popup = document.getElementById('popup-corpo-imortal');
        if (!popup) {
            console.error('❌ ERRO: Popup não encontrado ao renderizar!');
            return;
        }

        console.log('📝 Gerando HTML do popup...');
        popup.innerHTML = this.gerarHTML();
        
        console.log('🔗 Anexando eventos aos botões...');
        this.anexarEventosBotoes();
        
        console.log('✅ Popup renderizado com sucesso');
    }

    /**
     * Gera HTML completo do popup
     */
    gerarHTML() {
        console.log('📄 Gerando HTML...');
        const html = `
            <!-- Header -->
            <div class="corpo-imortal-header">
                <div>
                    <h2 id="corpo-imortal-title">🌟 Corpo Imortal</h2>
                    <div class="corpo-imortal-header-subtitle">Sistema de Cultivo Espiritual</div>
                </div>
                <div class="corpo-imortal-header-actions">
                    <button class="btn-codex-corpo-imortal" id="btn-codex-header" title="Ver Codex">📖</button>
                    <button class="btn-voltar-corpo-imortal" id="btn-voltar-menu" title="Voltar">↩</button>
                    <button class="btn-fechar-corpo-imortal" id="btn-fechar-corpo-imortal" title="Fechar">✘</button>
                </div>
            </div>

            <!-- Seção de Pontos Disponíveis -->
            <div id="corpo-imortal-pontos-disponiveis" class="corpo-imortal-pontos-disponiveis">
                <span class="corpo-imortal-pontos-label">💎 Pontos Disponíveis:</span>
                <span class="corpo-imortal-pontos-valor">${this.dados.dados.pontosDisponiveis}</span>
                <span class="corpo-imortal-pontos-info">(Use para fazer upgrade)</span>
            </div>

            <!-- Conteúdo Principal (Scroll) -->
            <div class="corpo-imortal-content">
                <!-- Seção: Níveis da Fundação -->
                <h3 class="corpo-imortal-section-title">📊 Níveis da Fundação</h3>
                <div class="corpo-imortal-grid">
                    ${this.gerarCards()}
                </div>

                <!-- Seção: Melhorias Desbloqueadas -->
                <div class="corpo-imortal-melhorias">
                    <h3 class="corpo-imortal-section-title">✨ Melhorias Desbloqueadas</h3>
                    <ul class="corpo-imortal-melhorias-list">
                        ${this.gerarMelhorias()}
                    </ul>
                </div>
            </div>

            <!-- Footer -->
            <div class="corpo-imortal-footer">
                <button class="corpo-imortal-reset-btn" id="btn-resetar-corpo-imortal" title="Resetar todos os dados">
                    🔄 Resetar
                </button>
                <div class="corpo-imortal-footer-info">
                    Máximo 6 pontos por função • Os dados são salvos automaticamente
                </div>
            </div>
        `;
        console.log('✅ HTML gerado com sucesso, tamanho:', html.length, 'chars');
        return html;
    }

    /**
     * Gera cards das 4 funções
     */
    gerarCards() {
        console.log('🎴 Gerando cards das funções...');
        let html = '';

        for (const [chave, info] of Object.entries(this.funcoes)) {
            const nivel = this.dados.dados[chave];
            const percentual = (nivel / 6) * 100;
            const isPerfeito = nivel === 6;
            const classePerfeito = isPerfeito ? 'perfeito' : '';
            const classeCard = chave.replace(/Espiritual/, '').toLowerCase();

            html += `
                <div class="corpo-imortal-card ${classeCard} ${classePerfeito}" id="corpo-${chave}">
                    <div class="corpo-imortal-card-icon">${info.icone}</div>
                    <h4 class="corpo-imortal-card-title">${info.nome}</h4>
                    <div class="corpo-imortal-card-nivel">
                        <span class="corpo-imortal-card-nivel-label">Nível</span>
                        <span class="corpo-imortal-card-nivel-valor" id="corpo-${chave}-nivel">${nivel}</span>
                    </div>
                    <div class="corpo-imortal-card-bar">
                        <div class="corpo-imortal-card-bar-fill" style="width: ${percentual}%"></div>
                    </div>
                    <p style="font-size: 0.875rem; color: rgba(255,255,255,0.6); margin: 0.5rem 0 0 0;">${info.descricao}</p>
                    <div class="corpo-imortal-card-buttons">
                        <button class="corpo-imortal-upgrade-btn" data-funcao="${chave}" 
                                ${nivel >= 6 ? 'disabled' : ''}>
                            ⬆️ Fazer Upgrade
                        </button>
                        <button class="corpo-imortal-visualizar-btn" data-funcao="${chave}" title="Ver detalhes dos upgrades">
                            👁️ Visualizar
                        </button>
                    </div>
                </div>
            `;
        }

        console.log('✅ Cards gerados, total:', Object.keys(this.funcoes).length, 'funções');
        return html;
    }

    /**
     * Gera lista de melhorias desbloqueadas com detalhes
     */
    gerarMelhorias() {
        console.log('✨ Gerando melhorias detalhadas...');
        
        let html = '<div class="corpo-imortal-melhorias-container">';
        
        // Mapear funções aos nomes corretos
        const funcoes = {
            'dantian': 'Dantian',
            'meridianos': 'Meridianos',
            'refino': 'Refino Corporal',
            'marEspiritual': 'Mar Espiritual'
        };
        
        // Gerar seção para cada função
        for (const [chaveFunc, nomeFunc] of Object.entries(funcoes)) {
            const nivel = this.dados.dados[chaveFunc];
            // 🔧 CORREÇÃO: Usar APENAS as melhorias desbloqueadas
            // Não acumular todas do nível - apenas as que foram compradas
            let melhorias = [];
            
            if (this.dados.dados.melhoriasDesbloqueadas && 
                this.dados.dados.melhoriasDesbloqueadas[chaveFunc]) {
                melhorias = this.dados.dados.melhoriasDesbloqueadas[chaveFunc];
            }
            
            const classeStatus = nivel > 0 ? 'desbloqueado' : 'bloqueado';
            const statusIcon = nivel > 0 ? '✅' : '❌';
            
            html += `
                <div class="corpo-imortal-melhorias-secao ${classeStatus}">
                    <div class="corpo-imortal-melhorias-titulo">
                        <span>${statusIcon} ${nomeFunc} (Nível ${nivel})</span>
                    </div>
                    <ul class="corpo-imortal-melhorias-lista">
                        ${melhorias.length > 0 ? formatarMelhorias(melhorias) : '<li style="opacity: 0.6; font-style: italic;">Nenhuma melhoria desbloqueada ainda - Ganhe pontos para desbloquear</li>'}
                    </ul>
                </div>
            `;
        }
        
        html += '</div>';
        console.log('✅ Melhorias detalhadas geradas');
        return html;
    }

    /**
     * Anexa eventos aos botões
     */
    anexarEventosBotoes() {
        console.log('🔗 Anexando eventos aos botões...');
        
        // Verificar se os eventos já foram anexados
        const popup = document.getElementById('popup-corpo-imortal');
        if (!popup) {
            console.warn('⚠️ Popup não encontrado ao anexar eventos');
            return;
        }

        // Usar delegação de eventos - anexar no popup uma única vez por seção
        
        // Botão de fechar
        const btnFechar = popup.querySelector('#btn-fechar-corpo-imortal');
        if (btnFechar && !btnFechar.dataset.eventosAnexados) {
            console.log('✅ Botão fechar encontrado');
            btnFechar.addEventListener('click', () => this.fechar());
            btnFechar.dataset.eventosAnexados = 'true';
        }

        // Botão de Codex no header
        const btnCodexHeader = popup.querySelector('#btn-codex-header');
        if (btnCodexHeader && !btnCodexHeader.dataset.eventosAnexados) {
            console.log('📖 Botão Codex header encontrado');
            btnCodexHeader.addEventListener('click', () => {
                this.abrirMenuCodex();
            });
            btnCodexHeader.dataset.eventosAnexados = 'true';
        }

        // Botão de voltar ao menu
        const btnVoltarMenu = popup.querySelector('#btn-voltar-menu');
        if (btnVoltarMenu && !btnVoltarMenu.dataset.eventosAnexados) {
            console.log('🏠 Botão voltar menu encontrado');
            btnVoltarMenu.addEventListener('click', () => {
                this.voltarMenu();
            });
            btnVoltarMenu.dataset.eventosAnexados = 'true';
        }

        // Botões de upgrade
        const botoesUpgrade = popup.querySelectorAll('.corpo-imortal-upgrade-btn');
        console.log('📌 Botões de upgrade encontrados:', botoesUpgrade.length);
        
        botoesUpgrade.forEach((btn, index) => {
            if (!btn.dataset.eventosAnexados) {
                const funcao = btn.getAttribute('data-funcao');
                console.log(`  Botão ${index + 1}: ${funcao}`);
                btn.addEventListener('click', (e) => {
                    this.confirmarUpgrade(funcao);
                });
                btn.dataset.eventosAnexados = 'true';
            }
        });

        // Botões de visualizar upgrades
        const botoesVisualizar = popup.querySelectorAll('.corpo-imortal-visualizar-btn');
        console.log('👁️ Botões de visualizar encontrados:', botoesVisualizar.length);
        
        botoesVisualizar.forEach((btn, index) => {
            if (!btn.dataset.eventosAnexados) {
                const funcao = btn.getAttribute('data-funcao');
                console.log(`  Botão visualizar ${index + 1}: ${funcao}`);
                btn.addEventListener('click', (e) => {
                    this.visualizarUpgrades(funcao);
                });
                btn.dataset.eventosAnexados = 'true';
            }
        });

        // Botão de reset
        const btnReset = popup.querySelector('#btn-resetar-corpo-imortal');
        if (btnReset && !btnReset.dataset.eventosAnexados) {
            console.log('✅ Botão reset encontrado');
            btnReset.addEventListener('click', () => {
                if (this.dados.resetar()) {
                    this.renderizar();
                }
            });
            btnReset.dataset.eventosAnexados = 'true';
        }
        
        console.log('✅ Eventos anexados com sucesso');
    }

    /**
     * Abre um menu para escolher qual Codex visualizar
     */
    abrirMenuCodex() {
        console.log('📖 Abrindo menu de seleção de Codex...');
        
        const funcoes = [
            { chave: 'dantian', nome: '🔵 Dantian' },
            { chave: 'meridianos', nome: '🟢 Meridianos' },
            { chave: 'refino', nome: '🔴 Refino Corporal' },
            { chave: 'marEspiritual', nome: '🟣 Mar Espiritual' }
        ];
        
        const botoesHTML = funcoes.map(f => `
            <button class="corpo-imortal-menu-opcao" data-funcao="${f.chave}" style="
                padding: 1rem;
                margin: 0.5rem 0;
                width: 100%;
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: white;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            ">${f.nome}</button>
        `).join('');
        
        const menuHTML = `
            <div class="corpo-imortal-modal-overlay" id="corpo-imortal-menu-codex">
                <div class="corpo-imortal-modal-content" style="max-width: 500px;">
                    <div class="corpo-imortal-modal-header">
                        <h3>📖 Escolha uma Fundação</h3>
                        <button class="corpo-imortal-modal-close" aria-label="Fechar">✕</button>
                    </div>
                    
                    <div class="corpo-imortal-modal-body">
                        <p style="margin-top: 0; opacity: 0.85;">Selecione qual fundação deseja explorar no Codex:</p>
                        ${botoesHTML}
                    </div>
                </div>
            </div>
        `;
        
        const menuElement = document.createElement('div');
        menuElement.innerHTML = menuHTML;
        document.body.appendChild(menuElement.firstElementChild);
        
        // Adicionar eventos
        const menuOverlay = document.getElementById('corpo-imortal-menu-codex');
        if (!menuOverlay) return;
        
        const btnClose = menuOverlay.querySelector('.corpo-imortal-modal-close');
        const botoesOpcoes = menuOverlay.querySelectorAll('.corpo-imortal-menu-opcao');
        
        const fecharMenu = () => {
            menuOverlay.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => menuOverlay.remove(), 300);
        };
        
        btnClose?.addEventListener('click', fecharMenu);
        menuOverlay.addEventListener('click', (e) => {
            if (e.target === menuOverlay) fecharMenu();
        });
        
        botoesOpcoes.forEach(btn => {
            btn.addEventListener('click', () => {
                const funcao = btn.getAttribute('data-funcao');
                fecharMenu();
                setTimeout(() => this.abrirCodex(funcao), 300);
            });
            btn.addEventListener('mouseenter', (e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.borderColor = 'rgba(255,255,255,0.4)';
            });
            btn.addEventListener('mouseleave', (e) => {
                e.target.style.background = 'rgba(255,255,255,0.08)';
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            });
        });
    }

    /**
     * Visualiza os upgrades disponíveis para uma função
     */
    visualizarUpgrades(funcao) {
        console.log(`👁️ Visualizando upgrades de: ${funcao}`);
        
        const nivel = this.dados.dados[funcao];
        const nomesFuncoes = {
            'dantian': '🔵 Dantian',
            'meridianos': '🟢 Meridianos',
            'refino': '🔴 Refino Corporal',
            'marEspiritual': '🟣 Mar Espiritual'
        };
        
        const nomeFuncao = nomesFuncoes[funcao] || funcao;
        
        // 🔧 CORREÇÃO: Mostrar APENAS as melhorias que foram efetivamente desbloqueadas
        // Usar a lista de melhoriasDesbloqueadas, não acumular todas do nível
        let melhorias = [];
        if (this.dados.dados.melhoriasDesbloqueadas && 
            this.dados.dados.melhoriasDesbloqueadas[funcao]) {
            melhorias = this.dados.dados.melhoriasDesbloqueadas[funcao];
        }
        
        // Formatar melhorias para exibição
        let melhorasHTML = '';
        if (melhorias.length > 0) {
            melhorasHTML = melhorias.map((m, i) => {
                const nome = m.nome || 'Melhoria Desconhecida';
                const tipo = m.tipo === 'ativa' ? '⚡ Ativa' : '🛡️ Passiva';
                const descricao = m.descricao ? `<br><span style="opacity: 0.8; font-size: 0.95rem;">${m.descricao}</span>` : '';
                return `
                    <li style="padding: 1rem; margin-bottom: 0.8rem; background: rgba(255,255,255,0.08); border-left: 4px solid rgba(255,255,255,0.3); border-radius: 6px; transition: all 0.3s ease;">
                        <span style="display: inline-block; margin-right: 0.8rem; font-weight: bold; color: rgba(255,255,255,0.8);">💎 ${i + 1}.</span>
                        <span style="color: rgba(255,255,255,0.9); font-weight: 600;">${nome}</span>
                        <span style="margin-left: 0.5rem; font-size: 0.85rem; opacity: 0.75;">${tipo}</span>
                        ${descricao}
                    </li>
                `;
            }).join('');
        } else {
            melhorasHTML = `<li style="padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 8px; text-align: center;">
                🔒 Nenhuma melhoria desbloqueada ainda.<br>
                Faça upgrade para desbloquear novas melhorias!
            </li>`;
        }
        
        // Criar modal de visualização
        const modalHTML = `
            <div class="corpo-imortal-modal-overlay" id="corpo-imortal-modal-upgrades">
                <div class="corpo-imortal-modal-content">
                    <div class="corpo-imortal-modal-header">
                        <h3>${nomeFuncao} - Nível ${nivel}/6</h3>
                        <div class="corpo-imortal-modal-header-actions">
                            <button class="corpo-imortal-modal-close" aria-label="Fechar">✕</button>
                        </div>
                    </div>
                    
                    <div class="corpo-imortal-modal-body">
                        <h4 style="margin-top: 0; margin-bottom: 1.5rem; font-size: 1.2rem; color: rgba(255,255,255,0.95);">✨ Melhorias Desbloqueadas</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${melhorasHTML}
                        </ul>
                    </div>
                    
                    <div class="corpo-imortal-modal-footer">
                        <button class="corpo-imortal-modal-btn" style="background: var(--ci-accent-primary);">
                            ✓ Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar modal ao DOM
        const container = document.body;
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        container.appendChild(modalElement.firstElementChild);
        
        // Adicionar eventos
        const overlay = document.getElementById('corpo-imortal-modal-upgrades');
        if (!overlay) return;
        
        const btnClose = overlay.querySelector('.corpo-imortal-modal-close');
        const btnFechar = overlay.querySelector('.corpo-imortal-modal-btn');
        
        const fecharModal = () => {
            overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => overlay.remove(), 300);
        };
        
        btnClose?.addEventListener('click', fecharModal);
        btnFechar?.addEventListener('click', fecharModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharModal();
        });
    }

    /**
     * Abre o Codex mostrando todos os upgrades possíveis
     */
    abrirCodex(funcao) {
        console.log(`📖 Abrindo Codex de: ${funcao}`);
        
        const nomesFuncoes = {
            'dantian': '🔵 Dantian',
            'meridianos': '🟢 Meridianos',
            'refino': '🔴 Refino Corporal',
            'marEspiritual': '🟣 Mar Espiritual'
        };
        
        const nomeFuncao = nomesFuncoes[funcao] || funcao;
        
        // Gerar conteúdo do Codex
        let codexHTML = '';
        
        for (let nivel = 1; nivel <= 6; nivel++) {
            const melhoriasDuNivel = obterMelhoriasDuNivel(funcao, nivel);
            
            const melhorasFormatadas = melhoriasDuNivel.length > 0 
                ? melhoriasDuNivel.map((m, i) => {
                    const nome = m.nome || 'Melhoria Desconhecida';
                    const tipo = m.tipo === 'ativa' ? '⚡ Ativa' : '🛡️ Passiva';
                    const descricao = m.descricao ? `<div style="opacity: 0.8; font-size: 0.9rem; margin-top: 0.4rem;">${m.descricao}</div>` : '';
                    return `
                        <div style="padding: 0.75rem; margin-bottom: 0.6rem; background: rgba(255,255,255,0.05); border-left: 3px solid rgba(255,255,255,0.2); border-radius: 4px;">
                            <div style="font-weight: 600; color: rgba(255,255,255,0.95);">${nome}</div>
                            <span style="font-size: 0.85rem; opacity: 0.7;">${tipo}</span>
                            ${descricao}
                        </div>
                    `;
                }).join('')
                : '<div style="opacity: 0.6; font-style: italic; padding: 0.75rem;">Sem melhorias neste nível</div>';
            
            codexHTML += `
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.08); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.15);">
                        📊 Nível ${nivel} / 6
                    </div>
                    ${melhorasFormatadas}
                </div>
            `;
        }
        
        // Criar modal do Codex
        const codexModalHTML = `
            <div class="corpo-imortal-modal-overlay" id="corpo-imortal-codex-modal">
                <div class="corpo-imortal-modal-content" style="max-width: 800px;">
                    <div class="corpo-imortal-modal-header">
                        <h3>📖 Codex - ${nomeFuncao}</h3>
                        <button class="corpo-imortal-modal-close" aria-label="Fechar">✕</button>
                    </div>
                    
                    <div class="corpo-imortal-modal-body" style="font-size: 0.95rem;">
                        <p style="margin-top: 0; opacity: 0.85;">Visualize todos os upgrades possíveis para ${nomeFuncao}. Organize sua progressão e planeje seus upgrades!</p>
                        ${codexHTML}
                    </div>
                    
                    <div class="corpo-imortal-modal-footer">
                        <button class="corpo-imortal-modal-btn" style="background: var(--ci-accent-primary);">
                            ✓ Fechar Codex
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar modal ao DOM
        const container = document.body;
        const codexElement = document.createElement('div');
        codexElement.innerHTML = codexModalHTML;
        container.appendChild(codexElement.firstElementChild);
        
        // Adicionar eventos
        const codexOverlay = document.getElementById('corpo-imortal-codex-modal');
        if (!codexOverlay) return;
        
        const btnCloseCodex = codexOverlay.querySelector('.corpo-imortal-modal-close');
        const btnFecharCodex = codexOverlay.querySelector('.corpo-imortal-modal-btn');
        
        const fecharCodex = () => {
            codexOverlay.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => codexOverlay.remove(), 300);
        };
        
        btnCloseCodex?.addEventListener('click', fecharCodex);
        btnFecharCodex?.addEventListener('click', fecharCodex);
        codexOverlay.addEventListener('click', (e) => {
            if (e.target === codexOverlay) fecharCodex();
        });
    }

    /**
     * Abre popup para escolher qual upgrade comprar
     */
    confirmarUpgrade(funcao) {
        console.log(`📋 Abrindo lista de upgrades para ${funcao}...`);
        
        // Garantir que this.dados existe
        if (!this.dados) {
            console.error('❌ ERRO: this.dados não está inicializado!');
            this.mostrarAviso('❌ Erro ao carregar dados do upgrade!');
            return;
        }

        const nivelAtual = this.dados.dados[funcao] || 0;
        const proximoNivel = nivelAtual + 1;

        // Verificar se já está no máximo
        if (proximoNivel > 6) {
            this.mostrarAviso(`⚠️ ${this.funcoes[funcao].nome} já atingiu o máximo nível (6)!`);
            return;
        }

        // Obter todas as melhorias do próximo nível
        if (typeof obterMelhorias !== 'function') {
            console.error('❌ Função obterMelhorias não disponível');
            this.mostrarAviso('❌ Erro ao carregar upgrades!');
            return;
        }

        const melhorias = obterMelhorias(funcao, proximoNivel);
        if (!melhorias || melhorias.length === 0) {
            this.mostrarAviso('❌ Nenhuma melhoria disponível para este nível!');
            return;
        }

        console.log(`✅ ${melhorias.length} melhoria(s) encontrada(s)`, melhorias);

        const funcaoInfo = this.funcoes[funcao];

        // Criar overlay com lista de upgrades
        const overlay = document.createElement('div');
        overlay.className = 'corpo-imortal-modal-overlay';
        
        // Gerar HTML dos upgrades
        const upgradesHTML = melhorias.map((melhoria, index) => `
            <div class="upgrade-item" data-index="${index}">
                <div class="upgrade-item-header">
                    <h5>${melhoria.nome}</h5>
                    <span class="melhoria-tipo">${melhoria.tipo}</span>
                </div>
                <p class="upgrade-item-descricao">${melhoria.descricao}</p>
                <button class="btn-comprar-upgrade" data-funcao="${funcao}" data-index="${index}">
                    💎 Comprar (${melhoria.custo || 1} ponto)
                </button>
            </div>
        `).join('');

        overlay.innerHTML = `
            <div class="corpo-imortal-modal-content">
                <div class="corpo-imortal-modal-header">
                    <h3>💎 Upgrades Disponíveis</h3>
                    <button class="btn-fechar-modal" title="Fechar">✘</button>
                </div>
                <div class="corpo-imortal-modal-body">
                    <div class="upgrade-info-header">
                        <h4>${funcaoInfo.icone} ${funcaoInfo.nome}</h4>
                        <p><strong>Nível Atual:</strong> ${nivelAtual}/6 → <strong>Próximo:</strong> ${proximoNivel}/6</p>
                        <p><strong>Pontos Disponíveis:</strong> <span class="saldo-valor">${this.dados.dados.pontosDisponiveis}</span></p>
                    </div>
                    
                    <div class="upgrades-lista">
                        ${upgradesHTML}
                    </div>
                </div>
                <div class="corpo-imortal-modal-footer">
                    <button class="btn-cancelar">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Botão de fechar (X)
        const btnFechar = overlay.querySelector('.btn-fechar-modal');
        if (btnFechar) {
            btnFechar.addEventListener('click', () => {
                overlay.remove();
            });
        }

        // Botão cancelar
        const btnCancelar = overlay.querySelector('.btn-cancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                overlay.remove();
            });
        }

        // Botões de compra
        const botoesComprar = overlay.querySelectorAll('.btn-comprar-upgrade');
        botoesComprar.forEach((btn) => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                const melhoriaEscolhida = melhorias[index];
                // 🔧 Passar também o índice para rastrear qual melhoria foi escolhida
                this.executarUpgrade(funcao, melhoriaEscolhida, index);
                overlay.remove();
            });
        });

        // Fechar ao clicar no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    /**
     * Executa o upgrade escolhido
     */
    executarUpgrade(funcao, melhoria, melhoriaIndex = 0) {
        console.log(`💫 Executando upgrade de ${funcao}:`, melhoria);
        
        const custo = melhoria.custo || 1;

        // Verificar se tem pontos suficientes
        if (this.dados.dados.pontosDisponiveis < custo) {
            this.mostrarAviso(`❌ Pontos insuficientes! Você precisa de ${custo} ponto(s).`);
            return;
        }

        // Obter o nível ANTES do upgrade
        const nivelAnterior = this.dados.dados[funcao];
        const proximoNivel = nivelAnterior + 1;

        // Fazer o upgrade
        if (!this.dados.fazerUpgrade(funcao)) {
            this.mostrarAviso('❌ Erro ao fazer upgrade!');
            return;
        }

        // 🔧 Desbloquear a melhoria específica escolhida
        this.dados.desbloquearMelhoria(funcao, melhoria, proximoNivel, melhoriaIndex);

        this.mostrarAviso(`✅ ${melhoria.nome} - Upgrade concluído!`);
        this.animarUpgrade(funcao);
        
        // Atualizar UI
        setTimeout(() => {
            this.renderizar();
        }, 300);
    }

    /**
     * Executa upgrade com animações
     */
    fazerUpgrade(funcao) {
        if (!this.dados.fazerUpgrade(funcao)) {
            this.mostrarAviso('❌ Não é possível fazer upgrade! Verifique se tem pontos suficientes.');
            return;
        }

        this.mostrarAviso(`✅ Upgrade feito em ${this.funcoes[funcao].nome}!`);

        // Animar
        this.animarUpgrade(funcao);
        
        // Atualizar UI
        setTimeout(() => {
            this.renderizar();
        }, 300);

        console.log(`✅ Upgrade feito em ${funcao}`);
    }

    /**
     * Anima o upgrade
     */
    animarUpgrade(funcao) {
        const card = document.getElementById(`corpo-${funcao}`);
        if (!card) return;

        // Efeito de brilho
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = 'corpo-imortal-pontilho-brilho 0.6s ease-out';
        }, 10);

        // Criar partículas
        this.criarParticulas(card, funcao);
    }

    /**
     * Cria partículas visuais
     */
    criarParticulas(elemento, funcao) {
        const rect = elemento.getBoundingClientRect();
        const cores = {
            dantian: '#60a5fa',
            meridianos: '#34d399',
            refino: '#f87171',
            marEspiritual: '#d8b4fe'
        };
        const cor = cores[funcao] || '#ffffff';

        for (let i = 0; i < 5; i++) {
            const particula = document.createElement('div');
            particula.className = 'corpo-imortal-particula';
            particula.textContent = '✨';
            particula.style.left = rect.left + rect.width / 2 + 'px';
            particula.style.top = rect.top + rect.height / 2 + 'px';
            particula.style.color = cor;
            particula.style.setProperty('--tx', (Math.random() - 0.5) * 40 + 'px');
            particula.style.animation = 'corpo-imortal-particula-subir 1s ease-out forwards';
            
            document.body.appendChild(particula);
            setTimeout(() => particula.remove(), 1000);
        }
    }

    /**
     * Mostra aviso visual
     */
    mostrarAviso(mensagem) {
        const aviso = document.createElement('div');
        aviso.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 8px;
            font-weight: 700;
            z-index: 99999;
            animation: fadeInOut 1.5s ease-out forwards;
        `;
        aviso.textContent = mensagem;
        document.body.appendChild(aviso);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                30% { opacity: 1; }
                70% { opacity: 1; }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            aviso.remove();
            style.remove();
        }, 1500);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   INICIALIZAÇÃO
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

// Aguarda DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.corpoImortalUI = new CorpoImortalUI();
    });
} else {
    window.corpoImortalUI = new CorpoImortalUI();
}
