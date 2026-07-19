/**
 * SISTEMA DE DESBLOQUEIO DE ARTS
 * Gerencia o desbloqueio automático de arts bloqueadas
 */

class ArtsUnlockSystem {
    constructor() {
        this.character = null;
        this.uiManager = null;
        this.initialized = false;
    }

    init() {
        console.log('🔓 [ArtsUnlockSystem] Sistema de desbloqueio inicializado');
        this.initialized = true;
    }

    /**
     * Handler do clique no botão de desbloqueio
     */
    handleUnlock() {
        try {
            console.log('\n╔════════════════════════════════════════════╗');
            console.log('║ 🔓 DESBLOQUEANDO ARTS                      ║');
            console.log('╚════════════════════════════════════════════╝');

            // Passo 1: Obter character
            let character = null;
            if (window.artsSystemManager?.character) {
                character = window.artsSystemManager.character;
                console.log('✓ Character obtido de artsSystemManager');
            } else {
                console.error('❌ artsSystemManager não disponível');
                this.showMessage('❌ Sistema não inicializado', 'error');
                return;
            }

            // Passo 2: Verificar dados
            console.log('\n📊 Dados do personagem:');
            const activeArts = character.arts?.filter(a => a.status === 'active') || [];
            const blockedArts = character.arts?.filter(a => a.status === 'blocked') || [];

            console.log(`   📈 Ativas: ${activeArts.length}`);
            console.log(`   🔒 Bloqueadas: ${blockedArts.length}`);

            if (blockedArts.length === 0) {
                console.log('⚠️  Nenhuma art bloqueada');
                this.showMessage('✅ Nenhuma art bloqueada!', 'info');
                return;
            }

            // Passo 3: Calcular limite
            let maxArts = 12;
            try {
                if (window.RulesEngine?.calculateMaxArts) {
                    maxArts = window.RulesEngine.calculateMaxArts(character);
                    console.log(`   📊 Limite: ${maxArts}`);
                } else {
                    const attrs = character.attributes || {};
                    const total = (attrs.forca || 0) + (attrs.vitalidade || 0) + (attrs.agilidade || 0) + (attrs.inteligencia || 0) + (attrs.percepcao || 0);
                    maxArts = Math.round(total * 0.0293);
                    console.log(`   📊 Limite (calculado): ${maxArts}`);
                }
            } catch (e) {
                console.warn('⚠️  Erro ao calcular limite:', e.message);
            }

            // Passo 4: Calcular quantas desbloquear
            const slotsDisponveis = maxArts - activeArts.length;
            const quantidadeDesbloquear = Math.min(slotsDisponveis, blockedArts.length);

            console.log(`\n⚙️  Cálculo:`);
            console.log(`   Slots: ${slotsDisponveis}`);
            console.log(`   Desbloqueando: ${quantidadeDesbloquear}`);

            if (quantidadeDesbloquear <= 0) {
                console.log('⚠️  Sem espaço');
                this.showMessage('❌ Nenhum slot disponível!', 'error');
                return;
            }

            // Passo 5: DESBLOQUEAR as arts
            console.log('\n🔓 Desbloqueando:');
            let desbloqueadas = 0;
            for (let i = 0; i < blockedArts.length && desbloqueadas < quantidadeDesbloquear; i++) {
                const art = blockedArts[i];
                const artName = art.name || `Art #${i}`;
                art.status = 'active';
                desbloqueadas++;
                console.log(`   ✅ ${artName}`);
            }

            console.log(`\n✨ Total: ${desbloqueadas} arte(s)`);

            // Passo 6: Salvar
            console.log('\n💾 Salvando...');
            if (window.StorageManager?.saveCharacter) {
                window.StorageManager.saveCharacter(character);
            }
            if (window.appState?.saveState) {
                window.appState.saveState();
            }

            // Passo 7: Atualizar UI
            this.updateUI();

            // Passo 8: Sucesso
            this.showMessage(`✅ ${desbloqueadas} arte(s) desbloqueada(s)!`, 'success');
            console.log('✅ Desbloqueio completo\n');

        } catch (error) {
            console.error('❌ ERRO:', error.message);
            console.error(error.stack);
            this.showMessage('❌ Erro ao desbloquear', 'error');
        }
    }

    /**
     * Atualiza a UI
     */
    updateUI() {
        try {
            console.log('🎨 [updateUI] Atualizando...');
            
            const uiManager = window.artsSystemManager?.uiManager;
            if (!uiManager) {
                console.warn('⚠️  UIManager não disponível');
                return;
            }

            if (typeof uiManager.renderArts === 'function') {
                console.log('   Renderizando arts...');
                uiManager.renderArts();
            }

            if (typeof uiManager.updateStats === 'function') {
                console.log('   Atualizando stats...');
                uiManager.updateStats();
            }

            console.log('✅ UI atualizada');

        } catch (error) {
            console.error('❌ Erro ao atualizar UI:', error.message);
        }
    }

    /**
     * Mostra mensagem ao usuário
     */
    showMessage(message, type = 'info') {
        try {
            const msgElement = document.createElement('div');
            msgElement.className = `arts-unlock-message arts-unlock-message-${type}`;
            msgElement.textContent = message;
            msgElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                font-weight: 500;
                z-index: 10000;
            `;

            document.body.appendChild(msgElement);

            setTimeout(() => {
                msgElement.style.opacity = '0';
                msgElement.style.transition = 'opacity 0.3s';
                setTimeout(() => msgElement.remove(), 300);
            }, 3000);

        } catch (error) {
            console.warn('⚠️  Erro ao mostrar mensagem:', error);
        }
    }
}

// Inicializar globalmente
window.artsUnlockSystem = new ArtsUnlockSystem();
window.artsUnlockSystem.init();

console.log('🔓 [ArtsUnlockSystem] Pronto');
