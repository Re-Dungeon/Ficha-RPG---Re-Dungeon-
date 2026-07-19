/**
 * GERENCIADOR DE PATCH NOTES
 * Sistema para exibir atualizações e mudanças da ficha
 */

class PatchNotesManager {
    constructor() {
        this.modal = document.getElementById('modalPatchNotes');
        this.content = document.getElementById('patch-notes-content');
        this.btnClose = document.getElementById('btn-fechar-patch-notes');
        this.btnConfirm = document.getElementById('btn-fechar-patch-notes-confirm');
        this.checkbox = document.getElementById('chk-nao-mostrar-patch-notes');
        this.currentVersion = 'V2.4.1'; // Versão atual dos patch notes
        this.storageKey = 'ultima-versao-patch-notes-vista';
        
        this.init();
    }

    init() {
        // Configurar listeners
        if (this.btnClose) {
            this.btnClose.addEventListener('click', () => this.fecharModal());
        }
        if (this.btnConfirm) {
            this.btnConfirm.addEventListener('click', () => this.fecharModal());
        }
        if (this.checkbox) {
            this.checkbox.addEventListener('change', () => {
                if (this.checkbox.checked) {
                    localStorage.setItem(this.storageKey, this.currentVersion);
                }
            });
        }

        console.log('✅ PatchNotesManager inicializado');
    }

    /**
     * Verificar e exibir patch notes se necessário
     */
    verificarEExibir() {
        const ultimaVersaoVista = localStorage.getItem(this.storageKey);
        
        // Se a versão vista for diferente da atual, mostrar patch notes
        if (ultimaVersaoVista !== this.currentVersion) {
            setTimeout(() => {
                this.exibirModal();
            }, 500); // Pequeno delay para garantir que DOM está pronto
        }
    }

    /**
     * Exibir o modal de patch notes
     */
    exibirModal() {
        if (!this.modal) {
            console.warn('⚠️ Modal de patch notes não encontrado');
            return;
        }

        // Carregar conteúdo dos patch notes
        this.carregarConteudo();

        // Mostrar modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        console.log('📝 Patch Notes exibido');
    }

    /**
     * Carregar e renderizar conteúdo dos patch notes
     */
    carregarConteudo() {
        const html = `
            <!-- HEADER PREMIUM -->
            <div style="background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%); padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #d4af37;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; color: #d4af37; font-size: 1.8em;">✨ Versão ${this.currentVersion}</h2>
                        <p style="margin: 8px 0 0 0; color: #888; font-size: 0.95em;">7 de Julho de 2026 • Atualização Completa do Sistema</p>
                    </div>
                    <div style="text-align: right; color: #d4af37; font-size: 2em;">🔮</div>
                </div>
            </div>

            <!-- SEÇÃO: SISTEMAS ATUALIZADOS -->
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(212, 175, 55, 0.05); border-radius: 6px; border-left: 3px solid #d4af37;">
                <h3 style="margin-top: 0; color: #d4af37; display: flex; align-items: center; gap: 8px; font-size: 1.2em;">
                    🎯 Sistemas Atualizados e Otimizados
                </h3>
                <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #e0e0e0; font-size: 0.95em;">
                    <li><strong>🌌 Veias Astrais:</strong> Sistema completo integrado ao salvamento e importação de fichas</li>
                    <li><strong>💾 Importação Aprimorada:</strong> Barras de status (Saúde, Energia, Fadiga) agora aplicam corretamente na importação</li>
                    <li><strong>👤 Personagem:</strong> Nome, Título, Raça e Classe agora são aplicados de forma correta após importação</li>
                    <li><strong>🐾 Companheiros:</strong> Status de vida (Vivo/Morto) agora é preservado entre salvamentos</li>
                    <li><strong>🎨 Interface de Companheiros:</strong> Redesign completo com campos otimizados para Arts e Variantes</li>
                </ul>
            </div>

            <!-- SEÇÃO: SISTEMA DE CLASSES -->
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(96, 165, 250, 0.05); border-radius: 6px; border-left: 3px solid #60a5fa;">
                <h4 style="margin-top: 0; color: #60a5fa; display: flex; align-items: center; gap: 8px;">
                    🆕 Sistema de Classes - Desbloqueio por Power Combat
                </h4>
                <p style="margin: 0 0 12px 0; color: #e0e0e0; font-size: 0.95em;">As classes agora possuem um progresso de desbloqueio visível com metas de Power Combat para liberar novas classes.</p>
                <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #e0e0e0; font-size: 0.95em;">
                    <li>🎯 Barra de progresso exibindo thresholds de desbloqueio</li>
                    <li>⭐ Próxima classe liberada ao alcançar o Power Combat necessário</li>
                    <li>🔄 Preparado para expansão com classes extras no futuro</li>
                </ul>
            </div>

            <!-- SEÇÃO: CORREÇÕES CRÍTICAS -->
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(76, 174, 76, 0.05); border-radius: 6px; border-left: 3px solid #4ade80;">
                <h4 style="margin-top: 0; color: #4ade80; display: flex; align-items: center; gap: 8px;">
                    ✅ Correções Críticas
                </h4>
                <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #e0e0e0; font-size: 0.95em;">
                    <li>🔧 Campo de <strong>Custo</strong> convertido de number para text em ficha de companheiro (suporta expressões customizadas)</li>
                    <li>⏱️ Campo de <strong>Turnos</strong> convertido de number para text (melhor flexibilidade)</li>
                    <li>📊 Salvamento vazio de companheiros não cria mais "fichas pré-criadas" na importação</li>
                    <li>💀 Status de vida dos companheiros agora é restaurado corretamente</li>
                    <li>📥 Importação agora valida corretamente dados vazios vs. dados inválidos</li>
                </ul>
            </div>

            <!-- SEÇÃO: MUNDO XIANXIA/WUXIA - CULTIVO -->
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(251, 146, 60, 0.05); border-radius: 6px; border-left: 3px solid #fb923c;">
                <h4 style="margin-top: 0; color: #fb923c; display: flex; align-items: center; gap: 8px;">
                    🏯 Tema Xianxia/Wuxia - Tema do Cultivo
                </h4>
                <div style="margin-left: 0; line-height: 2; color: #e0e0e0; font-size: 0.95em;">
                    <p style="margin: 0 0 12px 0;"><strong>Atualizações Futuras Planejadas:</strong></p>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>🎨 Redesign dos botões <strong>Cultivo</strong> e <strong>Corpo Imortal</strong></li>
                        <li>🗡️ Racas de Cultivo serão completamente refeitas com temas únicos</li>
                        <li>⚔️ Classes de Cultivo receberão identidade temática própria</li>
                        <li>🌟 Novas mecânicas alinhadas ao universo de cultivo oriental</li>
                    </ul>
                </div>
            </div>

            <!-- SEÇÃO: REMOÇÃO E ADIÇÃO DE MUNDOS -->
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(168, 85, 247, 0.05); border-radius: 6px; border-left: 3px solid #a855f7;">
                <h4 style="margin-top: 0; color: #a855f7; display: flex; align-items: center; gap: 8px;">
                    🌍 Atualização de Mundos e Temas
                </h4>
                <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #e0e0e0; font-size: 0.95em;">
                    <li>❌ <strong>Classes de Re'Geron</strong> serão removidas e substituídas por classes temáticas próprias do mundo</li>
                    <li>✨ Novas classes de Re'Geron com identidade única em desenvolvimento</li>
                    <li>🌀 <strong>The Chaotical Gate</strong> receberá novas classes exclusivas</li>
                    <li>👥 <strong>Raças de Re'Geron</strong> foram atualizadas com novas raças básicas e avançadas</li>
                    <li>🎭 Cada mundo agora terá sua própria identidade temática definida</li>
                </ul>
            </div>

            <!-- SEÇÃO: FICHA DE COMPANHEIROS -->
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(34, 197, 94, 0.05); border-radius: 6px; border-left: 3px solid #22c55e;">
                <h4 style="margin-top: 0; color: #22c55e; display: flex; align-items: center; gap: 8px;">
                    🐾 Ficha de Companheiros - Redesign Completo
                </h4>
                <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #e0e0e0; font-size: 0.95em;">
                    <li>🎨 Interface modernizada com melhor organização visual</li>
                    <li>📋 Aba de <strong>Arts</strong> e <strong>Variantes</strong> reformuladas para melhor usabilidade</li>
                    <li>✨ Campos de entrada agora com validação aprimorada</li>
                    <li>📱 Responsividade melhorada para diferentes resoluções</li>
                    <li>🔐 Salvamento mais robusto para dados de companheiros</li>
                </ul>
            </div>

            <!-- SEÇÃO: MELHORIAS GERAIS -->
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(251, 191, 36, 0.05); border-radius: 6px; border-left: 3px solid #fbbf24;">
                <h4 style="margin-top: 0; color: #fbbf24; display: flex; align-items: center; gap: 8px;">
                    ⚡ Melhorias Gerais e Performance
                </h4>
                <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #e0e0e0; font-size: 0.95em;">
                    <li>🚀 Performance otimizada no salvamento e importação de fichas</li>
                    <li>💫 Melhor feedback visual ao completar operações</li>
                    <li>🔄 Sistema de validação aprimorado em todos os módulos</li>
                    <li>📊 Histórico de Sorte agora integrado completamente ao sistema de export/import</li>
                    <li>🎯 Interface mais consistente e profissional em toda ficha</li>
                </ul>
            </div>

            <!-- FOOTER PREMIUM -->
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(212, 175, 55, 0.3); text-align: center;">
                <p style="margin: 0; color: #888; font-size: 0.9em;">Obrigado por jogar com <strong>Re'Dungeon</strong>! Novidades vêm por aí! 🎮✨</p>
                <p style="margin: 8px 0 0 0; color: #666; font-size: 0.85em;">Desenvolvido com ❤️ para a comunidade RPG</p>
            </div>
        `;

        if (this.content) {
            this.content.innerHTML = html;
        }
    }

    /**
     * Fechar o modal de patch notes
     */
    fecharModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }

        // Se checkbox marcada, salvar versão vista
        if (this.checkbox && this.checkbox.checked) {
            localStorage.setItem(this.storageKey, this.currentVersion);
            console.log('✅ Preferência salva: Patch notes não será mostrado novamente até nova versão');
        }

        console.log('✨ Modal de patch notes fechado');
    }
}

// Inicializar ao carregar documento
document.addEventListener('DOMContentLoaded', () => {
    const patchNotesManager = new PatchNotesManager();
    patchNotesManager.verificarEExibir();
    
    // Exportar para uso global se necessário
    window.patchNotesManager = patchNotesManager;
});

// Exportar classe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatchNotesManager;
}
