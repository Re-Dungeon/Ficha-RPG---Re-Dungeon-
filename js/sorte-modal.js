/* ============================================ */
/* SORTE-MODAL.JS - Sistema de Fortuna        */
/* Gerenciador do modal de Sorte              */
/* ============================================ */

/**
 * SorteModal
 * Responsável por:
 * - Gerenciar o modal de Sorte
 * - Carregar dados da ficha
 * - Controlar abertura/fechamento
 * - Editar bônus de sorte
 * - Executar rolagens futuras
 */
class SorteModal {
    constructor() {
        console.log('🎲 [SorteModal] Inicializando...');
        
        this.isOpen = false;
        this.sorteData = {
            sorteTotal: 0,
            fortunaAtual: 0,
            bonusSorte: 0,
            disponivel: true
        };
        
        this.init();
    }

    /**
     * Inicializa o sistema
     */
    init() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupModal());
        } else {
            this.setupModal();
        }
        
        // Expor globalmente
        window.sorteModal = this;
        console.log('✅ [SorteModal] Disponível em window.sorteModal');
    }

    /**
     * Configura o modal após DOM estar pronto
     */
    setupModal() {
        console.log('🎲 [SorteModal] Configurando modal...');
        
        try {
            // Buscar elementos do DOM
            this.overlay = document.querySelector('.sorte-modal-overlay');
            this.container = document.querySelector('.sorte-modal-container');
            this.closeBtn = document.querySelector('.sorte-modal-close-btn');
            this.backBtn = document.querySelector('.btn-voltar-sorte');
            
            // Verificar se modal existe
            if (!this.overlay || !this.container) {
                console.error('❌ [SorteModal] Modal não encontrado no HTML!');
                return;
            }

            // Buscar campos de informação
            this.sorteTotal_el = document.getElementById('sorte-total-value');
            this.fortunaAtual_el = document.getElementById('fortuna-atual-value');
            this.bonusSorte_el = document.getElementById('bonus-sorte-display');
            this.statusSection_el = document.querySelector('.sorte-status-section');
            
            // Buscar botões
            this.btnRolar = document.getElementById('btn-sorte-rolar');
            this.btnLoja = document.getElementById('btn-sorte-loja');
            
            // Configurar listeners
            this.setupListeners();
            
            // Carregar dados iniciais
            this.loadSorteData();
            
            console.log('✅ [SorteModal] Modal configurado com sucesso');
        } catch (error) {
            console.error('❌ [SorteModal] Erro ao configurar modal:', error);
        }
    }

    /**
     * Configura os listeners de eventos
     */
    setupListeners() {
        // ✅ LISTENER NO BOTÃO route-sorte (NOVO)
        const btnRouteSorte = document.getElementById('route-sorte');
        if (btnRouteSorte) {
            btnRouteSorte.addEventListener('click', () => this.open());
            console.log('✅ [SorteModal] Listener adicionado em route-sorte');
        } else {
            console.warn('⚠️ [SorteModal] Botão route-sorte não encontrado');
        }

        // Fechar ao clicar no X
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Voltar ao menu ao clicar na seta voltar
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.voltarMenu());
        }
        
        // Fechar ao clicar no overlay (fundo escurecido)
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }
        
        // Bônus Base é apenas display (Sorte ÷ 25), não editável
        // Nenhum listener necessário
        
        // Botão Rolar
        if (this.btnRolar) {
            this.btnRolar.addEventListener('click', () => this.handleRolar());
        }
        
        // Botão Loja (futuro)
        if (this.btnLoja) {
            this.btnLoja.addEventListener('click', () => this.handleLoja());
        }
        
        // ✅ LISTENERS PARA EVENTOS EXTERNOS (NOVO)
        this.setupExternalListeners();
        
        console.log('✅ [SorteModal] Listeners configurados');
    }

    /**
     * Configura listeners para eventos da ficha
     */
    setupExternalListeners() {
        try {
            // Escuta mudanças de atributos
            window.addEventListener('atributosChanged', () => {
                console.log('📢 [SorteModal] Atributos mudaram, recarregando...');
                this.loadSorteData();
            });

            // Escuta atualização geral da ficha
            window.addEventListener('fichaAtualizada', () => {
                console.log('📢 [SorteModal] Ficha atualizada, sincronizando...');
                this.loadSorteData();
            });

            // Escuta mudanças de Sorte especificamente
            window.addEventListener('sorteChanged', (e) => {
                console.log('📢 [SorteModal] Sorte mudou:', e.detail);
                this.loadSorteData();
            });

            console.log('✅ [SorteModal] Listeners externos configurados');
        } catch (error) {
            console.warn('⚠️ [SorteModal] Erro ao configurar listeners externos:', error);
        }
    }

    /**
     * Carrega dados de sorte da ficha
     */
    loadSorteData() {
        try {
            // Buscar estado global
            if (!window.appState) {
                console.warn('⚠️ [SorteModal] StateManager não disponível');
                return;
            }

            // Carregar todos os dados em sequência
            this.loadSorteTotal();
            this.calcularFortunaBase();
            this.loadFortunaAtual();
            this.loadBonusSorte();
            this.checkDisponibilidade();
            this.syncWithFicha();

            // ✅ Atualizar UI
            this.renderSorteData();

            console.log('✅ [SorteModal] Dados carregados:', this.sorteData);
        } catch (error) {
            console.error('❌ [SorteModal] Erro ao carregar dados:', error);
        }
    }

    /**
     * Carrega Sorte Total do StateManager
     */
    loadSorteTotal() {
        try {
            const state = window.appState.getState();
            const sorteTotal = state.atributos?.primarios?.sorte?.total || 0;
            
            this.sorteData.sorteTotal = sorteTotal;
            console.log(`📊 [SorteModal] Sorte Total carregado: ${sorteTotal}`);
        } catch (error) {
            console.warn('⚠️ [SorteModal] Erro ao carregar Sorte Total:', error);
        }
    }

    /**
     * Calcula Fortuna Base = Sorte ÷ 25
     */
    calcularFortunaBase() {
        try {
            const fortunaBase = Math.floor(this.sorteData.sorteTotal / 25);
            this.sorteData.fortunaBase = fortunaBase;
            console.log(`📊 [SorteModal] Fortuna Base calculada: ${fortunaBase} (Sorte: ${this.sorteData.sorteTotal})`);
        } catch (error) {
            console.warn('⚠️ [SorteModal] Erro ao calcular Fortuna Base:', error);
        }
    }

    /**
     * Carrega Fortuna Atual
     * ESTRATÉGIA: Fortuna começa em 0 até que o jogador role o dado
     * - Se nada foi guardado: Fortuna Atual = 0
     * - Se foi guardado: Usa o valor guardado
     */
    loadFortunaAtual() {
        try {
            const stored = localStorage.getItem('redungeon_fortuna_atual');
            
            // Se não existe valor guardado, começa em 0 (não em Fortuna Base!)
            if (!stored) {
                this.sorteData.fortunaAtual = 0;
                console.log(`💰 [SorteModal] Fortuna Atual inicializada em 0 (nenhuma rolagem ainda)`);
            } else {
                const valor = parseInt(stored, 10);
                // Se o valor é inválido ou negativo, volta a 0
                this.sorteData.fortunaAtual = valor >= 0 ? valor : 0;
                console.log(`💰 [SorteModal] Fortuna Atual carregada do storage: ${this.sorteData.fortunaAtual}`);
            }
        } catch (error) {
            console.warn('⚠️ [SorteModal] Erro ao carregar Fortuna Atual:', error);
            this.sorteData.fortunaAtual = 0;
        }
    }

    /**
     * Calcula Bônus Base (Sorte ÷ 25)
     * Nota: Bônus Base é calculado automaticamente, não editável
     */
    loadBonusSorte() {
        try {
            // Bônus Base = Sorte ÷ 25
            this.sorteData.bonusSorte = Math.floor(this.sorteData.sorteTotal / 25);
            console.log(`⭐ [SorteModal] Bônus Base calculado: ${this.sorteData.bonusSorte} (Sorte: ${this.sorteData.sorteTotal})`);
        } catch (error) {
            console.warn('⚠️ [SorteModal] Erro ao calcular Bônus Base:', error);
            this.sorteData.bonusSorte = 0;
        }
    }

    /**
     * Sincroniza com mudanças na ficha de atributos
     */
    syncWithFicha() {
        try {
            // Se Sorte Total mudou, recalcular Fortuna Base
            // Mas manter Fortuna Atual se ainda for válida
            const novaBase = Math.floor(this.sorteData.sorteTotal / 25);
            
            if (this.sorteData.fortunaBase !== novaBase) {
                console.log(`🔄 [SorteModal] Sorte mudou! Base anterior: ${this.sorteData.fortunaBase}, Nova: ${novaBase}`);
                this.sorteData.fortunaBase = novaBase;
                
                // Se Fortuna Atual era inválida, resetar para base
                if (this.sorteData.fortunaAtual < 0) {
                    this.sorteData.fortunaAtual = novaBase;
                    this.setFortunaToStorage(novaBase);
                }
            }
            
            console.log('✅ [SorteModal] Sincronização com ficha concluída');
        } catch (error) {
            console.warn('⚠️ [SorteModal] Erro ao sincronizar com ficha:', error);
        }
    }

    /**
     * Salva Fortuna no localStorage
     */
    setFortunaToStorage(valor) {
        try {
            // Validar não pode ser negativo
            if (valor < 0) {
                console.warn('⚠️ [SorteModal] Tentativa de salvar Fortuna negativa bloqueada');
                valor = 0;
            }

            localStorage.setItem('redungeon_fortuna_atual', valor.toString());
            console.log(`💰 [SorteModal] Fortuna salva: ${valor}`);
        } catch (error) {
            console.error('❌ [SorteModal] Erro ao salvar Fortuna:', error);
        }
    }

    /**
     * Verifica disponibilidade de rolagem (uma vez por dia)
     */
    checkDisponibilidade() {
        try {
            const ultimaRolagem = localStorage.getItem('redungeon_ultima_rolagem_sorte');
            const hoje = this.getTodayDate();

            if (!ultimaRolagem || ultimaRolagem !== hoje) {
                this.sorteData.disponivel = true;
                this.sorteData.foiRoladoHoje = false;
            } else {
                this.sorteData.disponivel = false;
                this.sorteData.foiRoladoHoje = true;
            }

            console.log(`📅 [SorteModal] Disponível para rolar: ${this.sorteData.disponivel} | Hoje: ${hoje}`);
        } catch (error) {
            console.warn('⚠️ [SorteModal] Erro ao verificar disponibilidade:', error);
            this.sorteData.disponivel = true;
        }
    }

    /**
     * Salva data da última rolagem
     */
    salvarUltimaRolagem() {
        try {
            const hoje = this.getTodayDate();
            localStorage.setItem('redungeon_ultima_rolagem_sorte', hoje);
            console.log(`📅 [SorteModal] Última rolagem registrada: ${hoje}`);
        } catch (error) {
            console.error('❌ [SorteModal] Erro ao salvar data:', error);
        }
    }

    /**
     * Obtém data de hoje em formato YYYY-MM-DD
     */
    getTodayDate() {
        const hoje = new Date();
        return hoje.toISOString().split('T')[0];
    }

    /**
     * Renderiza dados de sorte no modal
     */
    renderSorteData() {
        try {
            // Atualizar Sorte Total
            if (this.sorteTotal_el) {
                this.sorteTotal_el.textContent = this.sorteData.sorteTotal || '0';
            }

            // Atualizar Fortuna Atual
            if (this.fortunaAtual_el) {
                this.fortunaAtual_el.textContent = this.sorteData.fortunaAtual || '0';
            }

            // Atualizar Bônus Base (Display apenas - não editável)
            if (this.bonusSorte_el) {
                this.bonusSorte_el.textContent = this.sorteData.bonusSorte || '0';
            }

            // Atualizar status
            this.updateStatus();

            console.log('✅ [SorteModal] UI renderizada');
        } catch (error) {
            console.error('❌ [SorteModal] Erro ao renderizar:', error);
        }
    }

    /**
     * Atualiza seção de status
     */
    updateStatus() {
        if (!this.statusSection_el) return;

        if (this.sorteData.disponivel) {
            this.statusSection_el.classList.add('available');
            this.statusSection_el.classList.remove('unavailable');
            this.statusSection_el.textContent = '✓ Disponível para rolar hoje';
            
            if (this.btnRolar) {
                this.btnRolar.disabled = false;
            }
        } else {
            this.statusSection_el.classList.add('unavailable');
            this.statusSection_el.classList.remove('available');
            this.statusSection_el.textContent = '✗ Você já usou sua Fortuna hoje';
            
            if (this.btnRolar) {
                this.btnRolar.disabled = true;
            }
        }
    }

    /**
     * Nota: saveBonusSorte() foi removido
     * Bônus Base é apenas um display calculado (Sorte ÷ 25)
     * Não é editável pelo usuário
     */

    /**
     * Executa rolagem de Fortuna
     * Fórmula: Ganho = Fortuna Base + Bônus + Aleatório(-2 a +2)
     */
    rolarFortuna() {
        try {
            console.log('🎲 [SorteModal] Iniciando rolagem de Fortuna...');
            
            // Validação 1: Verificar se já foi rolado hoje
            if (!this.sorteData.disponivel) {
                console.warn('⚠️ [SorteModal] Você já usou sua Fortuna hoje!');
                this.updateStatus();
                return false;
            }

            // Validação 2: Verificar se tem Sorte
            if (this.sorteData.sorteTotal <= 0) {
                console.warn('⚠️ [SorteModal] Sorte zerada, não pode rolar!');
                this.updateStatus();
                return false;
            }

            // ========================================
            // CAMADA 1: Calcular Total de Dados
            // ========================================
            const dadosBase = Math.floor(Math.random() * 6) + 1; // 1~6
            const dadosExtras = Math.floor(this.sorteData.sorteTotal / 20); // Sorte ÷ 20
            const totalDados = dadosBase + dadosExtras;

            console.log(`📊 [SorteModal] CAMADA 1 - Determinação de Dados:`);
            console.log(`   - Dados Base (1~6): ${dadosBase}`);
            console.log(`   - Dados Extras (Sorte ÷ 20): ${dadosExtras}`);
            console.log(`   - Total de Dados: ${totalDados}`);

            // ========================================
            // CAMADA 2: Executar Rolagem dos Dados
            // ========================================
            let somaDados = 0;
            const resultadosDados = [];
            
            for (let i = 0; i < totalDados; i++) {
                const dado = Math.floor(Math.random() * 6) + 1; // 1~6
                somaDados += dado;
                resultadosDados.push(dado);
            }

            console.log(`🎲 [SorteModal] CAMADA 2 - Rolagem dos Dados:`);
            console.log(`   - Dados rolados: [${resultadosDados.join(', ')}]`);
            console.log(`   - Soma da rolagem: ${somaDados}`);

            // ========================================
            // CAMADA 3: Aplicar Bônus
            // ========================================
            const bonus = this.sorteData.bonusSorte; // Bônus de Sorte (se houver)
            const resultadoFinal = somaDados + bonus;
            const novaFortuna = Math.max(0, resultadoFinal); // Nunca negativa

            console.log(`⭐ [SorteModal] CAMADA 3 - Aplicação de Bônus:`);
            console.log(`   - Soma da Rolagem: ${somaDados}`);
            console.log(`   - Bônus de Sorte: ${bonus}`);
            console.log(`   - Resultado Final: ${resultadoFinal}`);
            console.log(`   - 💰 FORTUNA ATUAL: ${novaFortuna}`);

            // ========================================
            // Salvar e Atualizar Estado
            // ========================================
            this.setFortunaToStorage(novaFortuna);
            this.salvarUltimaRolagem();
            
            // Atualizar estado local
            this.sorteData.fortunaAtual = novaFortuna;
            this.sorteData.disponivel = false;

            // Mostrar animação
            this.mostrarAnimacaoRolagem(novaFortuna);

            // Atualizar UI
            this.renderSorteData();

            // Disparar evento com detalhes completos
            window.dispatchEvent(new CustomEvent('fortunaRolada', {
                detail: {
                    dadosBase: dadosBase,
                    dadosExtras: dadosExtras,
                    totalDados: totalDados,
                    somaDados: somaDados,
                    resultadosDados: resultadosDados,
                    bonus: bonus,
                    resultadoFinal: resultadoFinal,
                    fortunaAtual: novaFortuna
                }
            }));

            console.log(`✅ [SorteModal] Rolagem concluída com sucesso!`);
            console.log(`   Fortuna Atual definida para: ${novaFortuna}`);
            return true;

        } catch (error) {
            console.error('❌ [SorteModal] Erro ao rolar Fortuna:', error);
            return false;
        }
    }

    /**
     * Mostra animação de rolagem com novo valor de Fortuna
     */
    mostrarAnimacaoRolagem(novaFortuna) {
        try {
            if (!this.fortunaAtual_el) return;

            // Adicionar classe de animação
            this.fortunaAtual_el.classList.add('roll-animation');

            // Criar elemento flutuante com novo valor de Fortuna
            const floatNumber = document.createElement('div');
            floatNumber.className = 'fortuna-float-number';
            floatNumber.textContent = `+${novaFortuna}`;
            floatNumber.style.color = '#FFD700'; // Dourado
            floatNumber.title = `Nova Fortuna Atual: ${novaFortuna}`;
            
            this.fortunaAtual_el.parentElement.appendChild(floatNumber);

            // Animar elemento
            setTimeout(() => {
                floatNumber.classList.add('float-up');
            }, 10);

            // Remover elemento após animação
            setTimeout(() => {
                floatNumber.remove();
                this.fortunaAtual_el.classList.remove('roll-animation');
            }, 1500);

            console.log('✅ [SorteModal] Animação de rolagem exibida');
        } catch (error) {
            console.warn('⚠️ [SorteModal] Erro ao exibir animação:', error);
        }
    }

    /**
     * Handler para botão Loja (futuro - integração posterior)
     */
    handleLoja() {
        try {
            console.log('🏪 [SorteModal] Abrindo Loja de Sorte... (futuro)');
            // Aqui será integrado o sistema de loja de Sorte
        } catch (error) {
            console.error('❌ [SorteModal] Erro ao abrir loja:', error);
        }
    }

    /**
     * Handler para botão Rolar
     */
    handleRolar() {
        try {
            this.rolarFortuna();
        } catch (error) {
            console.error('❌ [SorteModal] Erro no handler Rolar:', error);
        }
    }

    /**
     * Abre o modal
     */
    open() {
        try {
            if (!this.overlay) {
                console.error('❌ [SorteModal] Overlay não encontrado');
                return;
            }

            // Carregar dados mais recentes
            this.loadSorteData();

            // Mostrar overlay
            this.overlay.classList.remove('hidden');
            this.overlay.classList.add('active');
            this.isOpen = true;

            // Focar no primeiro input
            if (this.bonusSorte_el) {
                setTimeout(() => this.bonusSorte_el.focus(), 300);
            }

            console.log('✅ [SorteModal] Modal aberto');
        } catch (error) {
            console.error('❌ [SorteModal] Erro ao abrir modal:', error);
        }
    }

    /**
     * Fecha o modal
     */
    close() {
        try {
            if (!this.overlay) {
                console.error('❌ [SorteModal] Overlay não encontrado');
                return;
            }

            // Esconder overlay
            this.overlay.classList.add('hidden');
            this.overlay.classList.remove('active');
            this.isOpen = false;

            console.log('✅ [SorteModal] Modal fechado');
        } catch (error) {
            console.error('❌ [SorteModal] Erro ao fechar modal:', error);
        }
    }

    /**
     * Volta para o menu principal
     * Mantém todos os dados salvos
     */
    voltarMenu() {
        console.log('🔙 Voltando do modal de sorte para o menu principal...');
        this.close();
        
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
     * Alterna abertura/fechamento do modal
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Debug: Mostra dados atuais
     */
    debug() {
        console.log('🎲 [SorteModal] Debug Info:');
        console.log('  Sorte Total:', this.sorteData.sorteTotal);
        console.log('  Fortuna Atual:', this.sorteData.fortunaAtual);
        console.log('  Bônus de Sorte:', this.sorteData.bonusSorte);
        console.log('  Disponível:', this.sorteData.disponivel);
        console.log('  Modal Aberto:', this.isOpen);
    }
}

// Inicializar quando o script carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SorteModal();
    });
} else {
    new SorteModal();
}
