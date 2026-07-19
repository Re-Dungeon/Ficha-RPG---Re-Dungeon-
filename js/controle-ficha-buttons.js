/* ================================================= */
/* CONTROLE-FICHA-BUTTONS.JS */
/* Gerenciamento dos Botões de Controle da Ficha */
/* (Atualizar | Limpar Ficha) */
/* ================================================= */

/**
 * ControleFichaButtons
 * Responsável por:
 * - Gerenciar o botão "Atualizar" (força re-sincronização)
 * - Gerenciar o botão "Limpar Ficha" (apaga localStorage e recarrega)
 * - Isolamento completo - sem modificação de código existente
 */
class ControleFichaButtons {
    constructor() {
        this.btnAtualizar = null;
        this.btnLimparFicha = null;
        this.isUpdating = false;
        
        this.init();
    }

    /**
     * Inicializa os listeners dos botões
     */
    init() {
        console.log('🎮 [ControleFichaButtons] Inicializando...');

        this.waitForDOM(() => {
            // Selecionar botões
            this.btnAtualizar = document.getElementById('btn-atualizar-ficha');
            this.btnLimparFicha = document.getElementById('btn-limpar-ficha');

            if (!this.btnAtualizar) {
                console.log('ℹ️ [ControleFichaButtons] Botão "Atualizar" não encontrado no DOM. Módulo de atualização ficará inativo.');
                return;
            }

            console.log('✅ [ControleFichaButtons] Botão "Atualizar" encontrado');

            // ℹ️ NOTA: Listener do botão "Limpar Ficha" foi removido
            // Agora é gerenciado por limpar-ficha-isolado.js
            if (!this.btnLimparFicha) {
                console.log('ℹ️ [ControleFichaButtons] Botão "Limpar Ficha" será gerenciado por limpar-ficha-isolado.js');
            } else {
                console.log('ℹ️ [ControleFichaButtons] Botão "Limpar Ficha" encontrado (gerenciado por limpar-ficha-isolado.js)');
            }

            // Adicionar listener apenas para o botão "Atualizar"
            this.btnAtualizar.addEventListener('click', () => this.handleAtualizar());

            console.log('✅ [ControleFichaButtons] Listeners adicionados com sucesso');
        });
    }

    /**
     * Aguarda o DOM estar pronto
     * @param {Function} callback - Função a executar
     */
    waitForDOM(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }

        document.addEventListener('DOMContentLoaded', () => {
            callback();
        }, { once: true });
    }

    /**
     * Handler do botão "Atualizar"
     * Orquestra a atualização completa e segura da ficha
     * Delegando para AtualizarFichaCompleta
     */
    handleAtualizar() {
        console.log('🔄 [ControleFichaButtons] Botão Atualizar clicado');

        if (this.isUpdating) {
            console.log('⏳ Atualização já em progresso...');
            return;
        }

        this.isUpdating = true;
        this.btnAtualizar.disabled = true;
        this.btnAtualizar.classList.add('loading');

        try {
            // Verificar se AtualizarFichaCompleta está disponível
            if (!window.atualizarFichaCompleta) {
                console.error('❌ AtualizarFichaCompleta não carregado. Carregue atualizar-ficha-completa.js');
                this.showErrorMessage('❌ Módulo de atualização não carregado.');
                return;
            }

            // Executar o orquestrador de atualização
            const sucesso = window.atualizarFichaCompleta.executar();

            // Feedback visual baseado no resultado
            if (sucesso) {
                this.showSuccessMessage('✅ Ficha atualizada e salva com sucesso!');
            } else {
                this.showErrorMessage('⚠️ Atualização concluída com avisos. Verifique o console.');
            }

        } catch (error) {
            console.error('❌ [ControleFichaButtons] Erro ao atualizar ficha:', error);
            console.error('Stack:', error.stack);
            this.showErrorMessage('❌ Erro ao atualizar ficha. Veja o console.');
        } finally {
            this.isUpdating = false;
            this.btnAtualizar.disabled = false;
            this.btnAtualizar.classList.remove('loading');
        }
    }

    /**
     * Handler do botão "Limpar Ficha"
     * ⚠️ REMOVIDO - Lógica movida para limpar-ficha-isolado.js
     * Este módulo (limpar-ficha-isolado.js) é responsável por:
     * - Gerenciar o botão "Limpar Ficha" de forma completamente isolada
     * - Garantir que flags sejam removidas ANTES do reload
     * - Prevenir interferências com import ou outras operações
     * 
     * ✅ BENEFÍCIOS DO ISOLAMENTO:
     * - Não interfere com controle-ficha-buttons.js
     * - Lógica dedicada apenas à limpeza
     * - Segurança aumentada (confirmação dupla)
     * - Rastreamento detalhado no console
     */
    handleLimparFicha() {
        // ℹ️ NOTA: Esta função não faz mais nada
        // O botão é gerenciado por limpar-ficha-isolado.js
        console.log('ℹ️ [ControleFichaButtons] handleLimparFicha está desabilitado');
        console.log('   → Use limpar-ficha-isolado.js para gerenciar o botão "Limpar Ficha"');
    }

    /**
     * Mostra mensagem de sucesso
     * @param {string} message - Mensagem a exibir
     */
    showSuccessMessage(message) {
        console.log(`✅ ${message}`);
        // Opcional: Adicionar notificação visual aqui se existir sistema de toast
        // Por enquanto, apenas log
    }

    /**
     * Mostra mensagem de erro
     * @param {string} message - Mensagem a exibir
     */
    showErrorMessage(message) {
        console.error(`❌ ${message}`);
        // Opcional: Adicionar notificação visual aqui se existir sistema de toast
        // Por enquanto, apenas log
    }

    /**
     * Retorna a sigla do atributo para display
     * @param {string} atributo - Nome do atributo
     * @returns {string} Sigla do atributo
     */
    getNomeSiglaAtributo(atributo) {
        const siglas = {
            forca: 'FOR',
            vitalidade: 'VIT',
            agilidade: 'AGI',
            inteligencia: 'INT',
            percepcao: 'PER',
            sorte: 'SOR',
            prontidao: 'PRONT',
            ataque: 'ATK',
            defesa: 'DEF',
            reacao: 'REA',
            precisao: 'PREC',
            evasao: 'EVA'
        };
        return siglas[atributo] || atributo.toUpperCase();
    }

    /**
     * Retorna status do controle
     */
    getStatus() {
        return {
            isUpdating: this.isUpdating,
            btnAtualizar: this.btnAtualizar ? 'encontrado' : 'não encontrado',
            btnLimparFicha: this.btnLimparFicha ? 'encontrado' : 'não encontrado'
        };
    }

    /**
     * Diagnóstico completo dos sistemas disponíveis
     */
    diagnoseAvailableSystems() {
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║  🔍 DIAGNÓSTICO DE SISTEMAS DISPONÍVEIS               ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        console.log('🔹 BonusCalculator:');
        console.log('   - Disponível:', window.bonusCalculator ? '✅ SIM' : '❌ NÃO');
        if (window.bonusCalculator) {
            console.log('   - cicloCompletoAtualizacao:', typeof window.bonusCalculator.cicloCompletoAtualizacao);
        }

        console.log('\n🔹 AtributosManager:');
        console.log('   - Disponível:', window.atributosManager ? '✅ SIM' : '❌ NÃO');
        if (window.atributosManager) {
            console.log('   - renderizarAtributos:', typeof window.atributosManager.renderizarAtributos);
            console.log('   - renderizarPersonagem:', typeof window.atributosManager.renderizarPersonagem);
        }

        console.log('\n🔹 SvgAtributosManager (window.svgAtributosManager):');
        console.log('   - Disponível:', window.svgAtributosManager ? '✅ SIM' : '❌ NÃO');
        if (window.svgAtributosManager) {
            console.log('   - renderizarPrimarios:', typeof window.svgAtributosManager.renderizarPrimarios);
            console.log('   - renderizarSecundarios:', typeof window.svgAtributosManager.renderizarSecundarios);
        }

        console.log('\n🔹 StatusBarsManager (objeto, não classe):');
        console.log('   - Disponível:', window.statusBarsManager ? '✅ SIM' : '❌ NÃO');
        if (window.statusBarsManager) {
            console.log('   - render (NÃO renderizar):', typeof window.statusBarsManager.render);
            console.log('   - updateBar:', typeof window.statusBarsManager.updateBar);
        }

        console.log('\n🔹 AptidoesBonusSync:');
        console.log('   - Disponível:', window.aptidoesBonusSync ? '✅ SIM' : '❌ NÃO');
        if (window.aptidoesBonusSync) {
            console.log('   - forceSync:', typeof window.aptidoesBonusSync.forceSync);
        }

        console.log('\n🔹 Botões do ControleFichaButtons:');
        console.log('   - btnAtualizar:', this.btnAtualizar ? '✅ Encontrado' : '❌ Não encontrado');
        console.log('   - btnLimparFicha:', this.btnLimparFicha ? '✅ Encontrado' : '❌ Não encontrado');

        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║  FIM DO DIAGNÓSTICO                                   ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Aguardar DOMContentLoaded para inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📍 [ControleFichaButtons] DOMContentLoaded acionado');
        window.controleFichaButtons = new ControleFichaButtons();
    });
} else {
    // Se o DOM já foi carregado
    console.log('📍 [ControleFichaButtons] Inicializando imediatamente (DOM já carregado)');
    window.controleFichaButtons = new ControleFichaButtons();
}
