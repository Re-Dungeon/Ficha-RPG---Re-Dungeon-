/**
 * INTERFACE DO SISTEMA DE ITENS
 * 
 * Responsabilidades:
 * - Renderizar modais e popups
 * - Gerenciar interações do usuário
 * - Atualizar visualizações em tempo real
 * - Sincronizar com MenuItensSystem
 */

class MenuItensUI {
    constructor(system) {
        this.system = system;
        this.modaisAbertos = {};

        console.log('🎨 [MenuItensUI] Inicializando interface...');

        this.criarEstruturasHTML();
        this.criarCSS();
        this.setupEventos();

        console.log('✅ [MenuItensUI] Interface pronta');
    }

    // ═══════════════════════════════════════════════════════════
    // 🏗️ CRIAÇÃO DA ESTRUTURA HTML
    // ═══════════════════════════════════════════════════════════

    /**
     * Criar estruturas HTML dos modais
     */
    criarEstruturasHTML() {
        // Modal Principal do Sistema de Itens
        const modalPrincipal = document.createElement('div');
        modalPrincipal.id = 'modal-menu-itens-principal';
        modalPrincipal.className = 'modal-menu-itens hidden';
        modalPrincipal.innerHTML = `
            <div class="modal-menu-itens-overlay"></div>
            <div class="modal-menu-itens-container">
                <header class="modal-menu-itens-header">
                    <h2>👜 SISTEMA DE ITENS</h2>
                    <button class="modal-menu-itens-close" aria-label="Fechar">&times;</button>
                </header>

                <div class="modal-menu-itens-content">
                    <!-- Seção de Rokmas -->
                    <section class="modal-menu-itens-section">
                        <div class="modal-menu-itens-saldo">
                            <span class="saldo-label">💰 Rokmas Atuais:</span>
                            <span class="saldo-valor" id="modal-menu-itens-saldo">150</span>
                        </div>
                    </section>

                    <!-- Botões de Ação -->
                    <section class="modal-menu-itens-actions">
                        <button class="btn-menu-itens" id="btn-menu-itens-definir-rokmas">
                            💵 Definir Rokmas
                        </button>
                        <button class="btn-menu-itens" id="btn-menu-itens-abrir-loja">
                            🛒 Abrir Loja
                        </button>
                    </section>
                </div>
            </div>
        `;
        document.body.appendChild(modalPrincipal);

        // Modal da Loja
        const modalLoja = document.createElement('div');
        modalLoja.id = 'modal-menu-itens-loja';
        modalLoja.className = 'modal-menu-itens-loja hidden';
        modalLoja.innerHTML = `
            <div class="modal-menu-itens-overlay"></div>
            <div class="modal-menu-itens-loja-container">
                <header class="modal-menu-itens-loja-header">
                    <h2>🛒 LOJA DO COMERCIANTE</h2>
                    <div class="loja-saldo-info">
                        <span>💰 Rokmas:</span>
                        <span id="loja-saldo-valor">150</span>
                    </div>
                    <div class="modal-menu-itens-loja-buttons">
                        <button class="modal-menu-itens-voltar" aria-label="Voltar">↩</button>
                        <button class="modal-menu-itens-close" aria-label="Fechar">&times;</button>
                    </div>
                </header>

                <div class="modal-menu-itens-loja-content">
                    <!-- Filtros -->
                    <div class="loja-filtros">
                        <input 
                            type="text" 
                            id="loja-filtro-busca" 
                            class="loja-filtro-input" 
                            placeholder="🔍 Buscar item..."
                        >
                        <select id="loja-filtro-categoria" class="loja-filtro-select">
                            <option value="">📦 Todas as categorias</option>
                            <option value="Poções">🧪 Poções</option>
                            <!-- <option value="Recursos">💎 Recursos</option> -->
                            <option value="Armaduras">🛡️ Armaduras</option>
                            <option value="Armas">⚔️ Armas</option>
                            <!-- <option value="Artefatos">🏆 Artefatos</option> -->
                            <option value="Grimórios">📜 Grimórios</option>
                            <option value="Acessórios">👑 Acessórios</option>
                            <option value="Elixires">🧫 Elixires</option>
                            <!-- <option value="Itens Mágicos">✨ Itens Mágicos</option> -->
                            <!-- <option value="Pergaminhos">📖 Pergaminhos</option> -->
                            <option value="Consumíveis">🍖 Consumíveis</option>
                            <!-- <option value="Ferramentas">🔧 Ferramentas</option> -->
                            <!-- <option value="Materiais">⛏️ Materiais</option> -->
                            <!-- <option value="Montarias">🐎 Montarias</option> -->
                            <!-- <option value="Relíquias">🪦 Relíquias</option> -->
                            <!-- <option value="Itens de Guilda">⚜️ Itens de Guilda</option> -->
                            <!-- <option value="Itens Especiais">🎭 Itens Especiais</option> -->
                            <!-- <option value="Itens Raros">🌟 Itens Raros</option> -->
                            <!-- <option value="Utilidades">🎒 Utilidades</option> -->
                            <!-- <option value="Equipamentos">👕 Equipamentos</option> -->
                            <!-- <option value="Encantamentos">🌙 Encantamentos</option> -->
                            <!-- <option value="Tesouros">💰 Tesouros</option> -->
                        </select>
                        <select id="loja-filtro-raridade" class="loja-filtro-select">
                            <option value="">⭐ Todas as raridades</option>
                            <option value="comum">⚪ Comum</option>
                            <option value="incomum">🟢 Incomum</option>
                            <option value="raro">🔵 Raro</option>
                            <option value="epico">🟣 Épico</option>
                            <option value="lendario">🟡 Lendário</option>
                            <option value="mitico">🔴 Mítico</option>
                            <option value="celestial">✨ Celestial</option>
                        </select>
                    </div>

                    <!-- Grid de Itens -->
                    <div class="loja-grid" id="loja-grid-itens">
                        <!-- Renderizado dinamicamente -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalLoja);

        // Toast de Notificações
        const toast = document.createElement('div');
        toast.id = 'menu-itens-toast';
        toast.className = 'menu-itens-toast hidden';
        document.body.appendChild(toast);
    }

    /**
     * Criar estilos CSS
     */
    criarCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* ════════════════════════════════════════════════════════ */
            /* MODAIS - SISTEMA DE ITENS */
            /* ════════════════════════════════════════════════════════ */

            .modal-menu-itens {
                position: fixed;
                inset: 0;
                z-index: 5000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }

            .modal-menu-itens.hidden {
                display: none;
            }

            .modal-menu-itens-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
            }

            .modal-menu-itens-container {
                position: relative;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #ffd700;
                border-radius: 12px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
                animation: slideUp 0.3s ease-out;
            }

            .modal-menu-itens-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 2px solid #ffd700;
                background: rgba(255, 215, 0, 0.1);
            }

            .modal-menu-itens-header h2 {
                margin: 0;
                color: #ffd700;
                font-size: 24px;
                font-weight: bold;
            }

            .modal-menu-itens-close {
                background: none;
                border: none;
                color: #ffd700;
                font-size: 28px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .modal-menu-itens-close:hover {
                background: rgba(255, 215, 0, 0.2);
                transform: scale(1.1);
            }

            .modal-menu-itens-loja-buttons {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .modal-menu-itens-voltar {
                background: none;
                border: none;
                color: #ffd700;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .modal-menu-itens-voltar:hover {
                background: rgba(255, 215, 0, 0.2);
                transform: scale(1.1);
            }

            .modal-menu-itens-content {
                padding: 20px;
            }

            .modal-menu-itens-section {
                margin-bottom: 20px;
            }

            .modal-menu-itens-saldo {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: rgba(255, 215, 0, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 8px;
                font-size: 18px;
                color: #fff;
            }

            .saldo-label {
                font-weight: bold;
                color: #ffd700;
            }

            .saldo-valor {
                font-size: 24px;
                font-weight: bold;
                color: #ffd700;
                min-width: 60px;
                text-align: right;
            }

            .modal-menu-itens-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .btn-menu-itens {
                padding: 12px 16px;
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                border: 2px solid #ffd700;
                border-radius: 8px;
                color: #1a1a2e;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
            }

            .btn-menu-itens:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(255, 215, 0, 0.5);
                background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
            }

            .btn-menu-itens:active {
                transform: translateY(0);
            }

            /* ════════════════════════════════════════════════════════ */
            /* LOJA - MODAL PRINCIPAL */
            /* ════════════════════════════════════════════════════════ */

            .modal-menu-itens-loja {
                position: fixed;
                inset: 0;
                z-index: 5010;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }

            .modal-menu-itens-loja.hidden {
                display: none;
            }

            .modal-menu-itens-loja-container {
                position: relative;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #ffd700;
                border-radius: 12px;
                width: 95%;
                height: 90%;
                max-width: 1400px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);
                animation: slideUp 0.3s ease-out;
            }

            .modal-menu-itens-loja-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 2px solid #ffd700;
                background: rgba(255, 215, 0, 0.1);
                gap: 16px;
            }

            .modal-menu-itens-loja-header h2 {
                margin: 0;
                color: #ffd700;
                font-size: 24px;
                font-weight: bold;
                flex: 1;
            }

            .loja-saldo-info {
                display: flex;
                gap: 10px;
                align-items: center;
                color: #fff;
                font-size: 16px;
                font-weight: bold;
            }

            #loja-saldo-valor {
                color: #ffd700;
                font-size: 20px;
                min-width: 80px;
                text-align: right;
            }

            .modal-menu-itens-loja-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 20px;
                overflow: hidden;
            }

            .loja-filtros {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                align-items: center;
            }

            .loja-filtro-input,
            .loja-filtro-select {
                padding: 10px 12px;
                background: rgba(30, 30, 50, 0.9);
                border: 2px solid rgba(255, 215, 0, 0.4);
                border-radius: 6px;
                color: #fff;
                font-size: 13px;
                font-family: inherit;
                min-width: 150px;
            }

            .loja-filtro-input {
                flex: 1;
                min-width: 200px;
            }

            .loja-filtro-select {
                flex: 0 1 auto;
                cursor: pointer;
            }

            .loja-filtro-input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            .loja-filtro-select option {
                background: #1a1a2e;
                color: #fff;
            }

            .loja-filtro-input:focus,
            .loja-filtro-select:focus {
                outline: none;
                border-color: #ffd700;
                box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
                background: rgba(30, 30, 50, 1);
            }

            .loja-grid {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                overflow-y: auto;
                padding: 8px;
                align-content: start;
            }

            /* ════════════════════════════════════════════════════════ */
            /* CARD DE ITEM - DESIGN PROFISSIONAL */
            /* ════════════════════════════════════════════════════════ */

            .loja-item-card {
                background: linear-gradient(135deg, #1a1a3e 0%, #16213e 100%);
                border: 2px solid rgba(255, 215, 0, 0.25);
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                overflow: visible;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                height: auto;
                max-height: none;
                padding: 0;
            }

            .loja-item-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 32px rgba(255, 215, 0, 0.25);
                border-color: rgba(255, 215, 0, 0.6);
            }

            /* ════════════════════════════════════════════════════════ */
            /* [1] IMAGEM - TOPO DO CARD */
            /* ════════════════════════════════════════════════════════ */

            .loja-item-imagem {
                font-size: 64px;
                text-align: center;
                padding: 0;
                aspect-ratio: 1 / 1;
                width: calc(100% - 4px);
                margin: 2px 2px 0 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, transparent 100%);
                border-radius: 10px 10px 0 0;
                border-bottom: 1px solid rgba(255, 215, 0, 0.1);
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
            }

            .loja-item-imagem-real {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                border-radius: 0;
                max-width: 100%;
                display: block;
            }

            .loja-item-imagem-emoji {
                font-size: 64px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .loja-item-imagem::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 20px;
                background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));
            }

            /* ════════════════════════════════════════════════════════ */
            /* [2] CABEÇALHO - NOME E BADGES */
            /* ════════════════════════════════════════════════════════ */

            .loja-item-cabecalho {
                padding: 12px;
                min-height: 60px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .loja-item-nome {
                color: #ffd700;
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 6px;
                text-align: left;
                word-break: break-word;
                line-height: 1.3;
                min-height: 20px;
            }

            .loja-item-badges {
                display: flex;
                gap: 8px;
                font-size: 11px;
                margin-bottom: 8px;
            }

            .loja-item-badge {
                padding: 4px 8px;
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 4px;
                color: rgba(255, 255, 255, 0.8);
                text-align: center;
            }

            .loja-item-badge-raridade {
                background: rgba(255, 215, 0, 0.15);
                border-color: rgba(255, 215, 0, 0.5);
                color: #ffd700;
                font-weight: bold;
                flex: 1;
                text-align: center;
            }

            /* ════════════════════════════════════════════════════════ */
            /* [3] PAINEL TÉCNICO - REORGANIZADO */
            /* ════════════════════════════════════════════════════════ */

            .loja-item-painel-tecnico {
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 215, 0, 0.1);
                border-radius: 6px;
                margin: 6px 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                font-size: 11px;
            }

            .loja-item-painel-topo {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 215, 0, 0.1);
            }

            .loja-item-painel-meio {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .loja-item-campo {
                text-align: center;
            }

            .loja-item-campo-titulo {
                color: rgba(255, 255, 255, 0.6);
                font-size: 9px;
                margin-bottom: 3px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .loja-item-campo-valor {
                color: #ffd700;
                font-weight: bold;
                font-size: 12px;
            }

            /* ════════════════════════════════════════════════════════ */
            /* [4] DESCRIÇÃO */
            /* ════════════════════════════════════════════════════════ */

            .loja-item-descricao-wrapper {
                padding: 0 12px;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }

            .loja-item-descricao-titulo {
                color: rgba(255, 255, 255, 0.7);
                font-size: 9px;
                font-weight: bold;
                margin-bottom: 3px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .loja-item-descricao {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.75);
                margin-bottom: 8px;
                padding: 8px;
                background: rgba(255, 215, 0, 0.05);
                border-left: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 4px;
                min-height: 45px;
                max-height: 70px;
                overflow-y: auto;
                line-height: 1.4;
                flex-grow: 1;
            }

            /* ════════════════════════════════════════════════════════ */
            /* INDICADOR DE POSSE */
            /* ════════════════════════════════════════════════════════ */

            .loja-item-quantidade-badge {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(255, 215, 0, 0.15);
                border: 2px solid rgba(255, 215, 0, 0.5);
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffd700;
                font-weight: bold;
                font-size: 13px;
                z-index: 10;
            }

            .loja-item-quantidade {
                display: none;
            }

            /* ════════════════════════════════════════════════════════ */
            /* [5] AÇÕES - BOTÕES */
            /* ════════════════════════════════════════════════════════ */

            .loja-item-botoes {
                display: flex;
                gap: 8px;
                padding: 8px 12px 12px;
                margin-top: auto;
            }

            .loja-item-btn {
                flex: 1;
                padding: 9px 8px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                text-align: center;
            }

            .loja-item-btn-comprar {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #1a1a2e;
                border: 2px solid #ffd700;
            }

            .loja-item-btn-comprar:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
            }

            .loja-item-btn-comprar:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }

            .loja-item-btn-vender {
                background: linear-gradient(135deg, #51cf66 0%, #69db7c 100%);
                color: #fff;
                border: 2px solid #51cf66;
                font-size: 11px;
            }

            .loja-item-btn-vender:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(81, 207, 102, 0.4);
            }

            /* ════════════════════════════════════════════════════════ */
            /* RARIDADES - CORES POR TIPO */
            /* ════════════════════════════════════════════════════════ */

            .loja-item-card.raridade-comum {
                border-color: rgba(200, 200, 200, 0.3);
            }

            .loja-item-card.raridade-comum .loja-item-nome {
                color: #c8c8c8;
            }

            .loja-item-card.raridade-incomum {
                border-color: rgba(76, 200, 100, 0.4);
            }

            .loja-item-card.raridade-incomum .loja-item-nome {
                color: #4cc864;
            }

            .loja-item-card.raridade-raro {
                border-color: rgba(100, 150, 255, 0.4);
            }

            .loja-item-card.raridade-raro .loja-item-nome {
                color: #6496ff;
            }

            .loja-item-card.raridade-epico {
                border-color: rgba(180, 100, 255, 0.4);
            }

            .loja-item-card.raridade-epico .loja-item-nome {
                color: #b464ff;
            }

            .loja-item-card.raridade-lendario {
                border-color: rgba(255, 200, 50, 0.5);
                box-shadow: 0 0 20px rgba(255, 200, 50, 0.1);
            }

            .loja-item-card.raridade-lendario .loja-item-nome {
                color: #ffc832;
            }

            .loja-item-card.raridade-mitico {
                border-color: rgba(255, 100, 100, 0.4);
            }

            .loja-item-card.raridade-mitico .loja-item-nome {
                color: #ff6464;
            }

            .loja-item-card.raridade-celestial {
                border-color: rgba(200, 100, 255, 0.5);
                box-shadow: 0 0 20px rgba(200, 100, 255, 0.1);
            }

            .loja-item-card.raridade-celestial .loja-item-nome {
                color: #c864ff;
            }

            .loja-item-botoes {
                display: flex;
                gap: 8px;
            }

            .loja-item-btn {
                flex: 1;
                padding: 8px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }

            .loja-item-btn-comprar {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #1a1a2e;
                border: 1px solid #ffd700;
            }

            .loja-item-btn-comprar:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
            }

            .loja-item-btn-comprar:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .loja-item-btn-vender {
                background: linear-gradient(135deg, #51cf66 0%, #69db7c 100%);
                color: #fff;
                border: 1px solid #51cf66;
            }

            .loja-item-btn-vender:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(81, 207, 102, 0.4);
            }

            /* ════════════════════════════════════════════════════════ */
            /* TOAST - NOTIFICAÇÕES */
            /* ════════════════════════════════════════════════════════ */

            .menu-itens-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 16px 20px;
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #1a1a2e;
                border-radius: 8px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                animation: slideInRight 0.3s ease-out;
                z-index: 6000;
                max-width: 300px;
            }

            .menu-itens-toast.hidden {
                display: none;
            }

            /* ════════════════════════════════════════════════════════ */
            /* ANIMAÇÕES */
            /* ════════════════════════════════════════════════════════ */

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            /* ════════════════════════════════════════════════════════ */
            /* SCROLLBAR CUSTOMIZADO */
            /* ════════════════════════════════════════════════════════ */

            .loja-grid::-webkit-scrollbar,
            .loja-item-descricao::-webkit-scrollbar {
                width: 8px;
            }

            .loja-grid::-webkit-scrollbar-track,
            .loja-item-descricao::-webkit-scrollbar-track {
                background: rgba(255, 215, 0, 0.1);
                border-radius: 4px;
            }

            .loja-grid::-webkit-scrollbar-thumb,
            .loja-item-descricao::-webkit-scrollbar-thumb {
                background: rgba(255, 215, 0, 0.3);
                border-radius: 4px;
            }

            .loja-grid::-webkit-scrollbar-thumb:hover,
            .loja-item-descricao::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 215, 0, 0.5);
            }

            /* ════════════════════════════════════════════════════════ */
            /* RESPONSIVO */
            /* ════════════════════════════════════════════════════════ */

            @media (max-width: 768px) {
                .modal-menu-itens-container {
                    max-width: 90%;
                }

                .modal-menu-itens-loja-container {
                    width: 98%;
                    height: 95%;
                }

                .loja-grid {
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                }

                .loja-filtros {
                    flex-direction: column;
                }

                .loja-filtro-input {
                    min-width: unset;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ═══════════════════════════════════════════════════════════
    // 🎮 SETUP DE EVENTOS
    // ═══════════════════════════════════════════════════════════

    /**
     * Setup de todos os event listeners
     */
    setupEventos() {
        // Botão route-itens (barra vertical esquerda)
        document.addEventListener('click', (e) => {
            // Abrir/fechar modal principal
            if (e.target.id === 'route-itens' || e.target.closest('#route-itens')) {
                this.abrirModalPrincipal();
                e.preventDefault();
            }

            // Fechar modais
            if (e.target.classList.contains('modal-menu-itens-close')) {
                this.fecharTodosModais();
            }
            if (e.target.classList.contains('modal-menu-itens-overlay')) {
                this.fecharTodosModais();
            }

            // Botão Voltar da Loja
            if (e.target.classList.contains('modal-menu-itens-voltar')) {
                this.fecharLoja();
                e.preventDefault();
            }

            // Botão Definir Rokmas
            if (e.target.id === 'btn-menu-itens-definir-rokmas') {
                this.abrirDialogoDefinirRokmas();
            }

            // Botão Abrir Loja
            if (e.target.id === 'btn-menu-itens-abrir-loja') {
                this.abrirLoja();
            }

            // Comprar item
            if (e.target.classList.contains('loja-item-btn-comprar')) {
                console.log('🛍️ Clique detectado no botão Comprar');
                const itemId = e.target.dataset.itemId;
                console.log(`   Item ID: ${itemId}`);
                this.comprarItem(itemId);
            }

            // Vender item
            if (e.target.classList.contains('loja-item-btn-vender')) {
                const itemId = e.target.dataset.itemId;
                this.venderItem(itemId);
            }
        });

        // Filtros da loja
        document.addEventListener('input', (e) => {
            if (e.target.id === 'loja-filtro-busca') {
                this.aplicarFiltros();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'loja-filtro-raridade' || e.target.id === 'loja-filtro-categoria') {
                this.aplicarFiltros();
            }
        });

        // Eventos do sistema
        window.addEventListener('menuItensRokmasAlterado', () => {
            this.atualizarSaldoUI();
        });

        window.addEventListener('menuItensCompraRealizada', () => {
            this.atualizarLoja();
            this.atualizarSaldoUI();
        });

        window.addEventListener('menuItensVendaRealizada', () => {
            this.atualizarLoja();
            this.atualizarSaldoUI();
        });

        window.addEventListener('menuItensCompraCancelada', (e) => {
            if (e.detail.motivo === 'Saldo insuficiente') {
                this.mostrarNotificacao(`❌ Saldo insuficiente! Faltam ${e.detail.faltam} Rokmas`, 'erro');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 🪟 MODAIS - CONTROLE
    // ═══════════════════════════════════════════════════════════

    /**
     * Abrir modal principal
     */
    abrirModalPrincipal() {
        const modal = document.getElementById('modal-menu-itens-principal');
        if (modal) {
            modal.classList.remove('hidden');
            this.atualizarSaldoUI();
        }
    }

    /**
     * Abrir loja
     */
    abrirLoja() {
        const modal = document.getElementById('modal-menu-itens-loja');
        if (modal) {
            modal.classList.remove('hidden');
            this.renderizarLoja();
        }
    }

    /**
     * Fechar todos os modais
     */
    fecharTodosModais() {
        document.getElementById('modal-menu-itens-principal')?.classList.add('hidden');
        document.getElementById('modal-menu-itens-loja')?.classList.add('hidden');
    }

    /**
     * Fechar apenas a loja e voltar ao modal principal
     */
    fecharLoja() {
        const modalLoja = document.getElementById('modal-menu-itens-loja');
        const modalPrincipal = document.getElementById('modal-menu-itens-principal');
        if (modalLoja) {
            modalLoja.classList.add('hidden');
        }
        if (modalPrincipal) {
            modalPrincipal.classList.add('hidden');
        }
        
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

    // ═══════════════════════════════════════════════════════════
    // 💰 DEFINIR ROKMAS
    // ═══════════════════════════════════════════════════════════

    /**
     * Abrir diálogo para definir Rokmas
     */
    abrirDialogoDefinirRokmas() {
        const novoValor = prompt(
            `💰 Definir novo saldo de Rokmas\n\nValor atual: ${this.system.obterSaldo()}\n\nDigite o novo valor:`,
            String(this.system.obterSaldo())
        );

        if (novoValor === null) return; // Cancelado

        if (this.system.definirSaldo(novoValor)) {
            this.mostrarNotificacao('✅ Saldo atualizado com sucesso!', 'sucesso');
        } else {
            this.mostrarNotificacao('❌ Valor inválido!', 'erro');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 🏪 LOJA - RENDERIZAÇÃO
    // ═══════════════════════════════════════════════════════════

    /**
     * Ordenar itens alfabeticamente e por raridade
     */
    ordenarItens(itens) {
        // Definir ordem de raridade (do menos raro para o mais raro)
        const ordemRaridade = {
            'comum': 0,
            'incomum': 1,
            'raro': 2,
            'epico': 3,
            'lendario': 4,
            'mitico': 5,
            'celestial': 6
        };

        return itens.sort((a, b) => {
            // Primeiro, ordenar por raridade
            const rarityA = ordemRaridade[a.raridade] ?? 999;
            const rarityB = ordemRaridade[b.raridade] ?? 999;
            
            if (rarityA !== rarityB) {
                return rarityA - rarityB;
            }
            
            // Se a raridade for igual, ordenar alfabeticamente pelo nome
            return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
        });
    }

    /**
     * Renderizar loja completa
     */
    renderizarLoja() {
        const grid = document.getElementById('loja-grid-itens');
        if (!grid) return;

        const itens = obterTodosItens();
        // Ordenar itens por raridade e alfabeticamente
        const itensOrdenados = this.ordenarItens(itens);
        grid.innerHTML = itensOrdenados.map(item => this.criarCardItem(item)).join('');
    }

    /**
     * Criar HTML de um card de item
     */
    criarCardItem(item) {
        const quantidade = this.system.obterQuantidade(item.id);
        const temNoInventario = quantidade > 0;
        const temSaldo = this.system.obterSaldo() >= item.custo;

        // Mapear ícone de raridade
        const iconosRaridade = {
            'comum': '⚪',
            'incomum': '🟢',
            'raro': '🔵',
            'epico': '🟣',
            'lendario': '🟡',
            'mitico': '🔴',
            'celestial': '✨'
        };
        const iconeRaridade = iconosRaridade[item.raridade] || '⚪';

        return `
            <div class="loja-item-card raridade-${item.raridade}">
                <!-- [1] IMAGEM -->
                <div class="loja-item-imagem">
                    ${item.imagemURL ? `<img src="${item.imagemURL}" alt="${item.nome}" class="loja-item-imagem-real">` : `<div class="loja-item-imagem-emoji">${item.imagem}</div>`}
                </div>

                <!-- INDICADOR DE POSSE (Canto Superior) -->
                ${temNoInventario ? `
                    <div class="loja-item-quantidade-badge">x${quantidade}</div>
                ` : ''}

                <!-- [2] CABEÇALHO - NOME E BADGES -->
                <div class="loja-item-cabecalho">
                    <div class="loja-item-nome">${item.nome}</div>
                    <div class="loja-item-badges">
                        <div class="loja-item-badge">${item.categoria}</div>
                        <div class="loja-item-badge loja-item-badge-raridade">${iconeRaridade} ${item.raridade}</div>
                    </div>
                </div>

                <!-- [3] PAINEL TÉCNICO - REORGANIZADO -->
                <div class="loja-item-painel-tecnico">
                    <!-- TOPO CENTRALIZADO: Dado + Extra -->
                    <div class="loja-item-painel-topo">
                        <div class="loja-item-campo">
                            <div class="loja-item-campo-titulo">🎲 Dado</div>
                            <div class="loja-item-campo-valor">${item.dado || '—'}</div>
                        </div>
                        <div class="loja-item-campo">
                            <div class="loja-item-campo-titulo">⭐ Extra</div>
                            <div class="loja-item-campo-valor">${item.extra || '—'}</div>
                        </div>
                    </div>

                    <!-- MEIO: Custo, Venda, Espaço, Unidade -->
                    <div class="loja-item-painel-meio">
                        <div class="loja-item-campo">
                            <div class="loja-item-campo-titulo">💰 Custo</div>
                            <div class="loja-item-campo-valor">${item.custo}</div>
                        </div>
                        <div class="loja-item-campo">
                            <div class="loja-item-campo-titulo">💰 Venda</div>
                            <div class="loja-item-campo-valor">${item.valorVenda}</div>
                        </div>
                        <div class="loja-item-campo">
                            <div class="loja-item-campo-titulo">📏 Espaço</div>
                            <div class="loja-item-campo-valor">${item.espaco}</div>
                        </div>
                        <div class="loja-item-campo">
                            <div class="loja-item-campo-titulo">📦 Unidade</div>
                            <div class="loja-item-campo-valor">${item.unidade}</div>
                        </div>
                    </div>
                </div>

                <!-- [4] DESCRIÇÃO -->
                <div class="loja-item-descricao-wrapper">
                    <div class="loja-item-descricao-titulo">✨ Efeito</div>
                    <div class="loja-item-descricao">${item.descricao}</div>
                </div>

                <!-- [5] AÇÕES - BOTÕES -->
                <div class="loja-item-botoes">
                    <button 
                        class="loja-item-btn loja-item-btn-comprar"
                        data-item-id="${item.id}"
                        ${!temSaldo ? 'disabled' : ''}
                        title="${temSaldo ? 'Comprar 1 unidade' : 'Saldo insuficiente'}"
                    >
                        🛍️ Comprar
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Aplicar filtros da loja
     */
    aplicarFiltros() {
        const busca = document.getElementById('loja-filtro-busca')?.value.toLowerCase() || '';
        const raridade = document.getElementById('loja-filtro-raridade')?.value || '';
        const categoria = document.getElementById('loja-filtro-categoria')?.value || '';

        let itens = obterTodosItens().filter(item => {
            const matchBusca = item.nome.toLowerCase().includes(busca) ||
                             item.descricao.toLowerCase().includes(busca);
            const matchRaridade = !raridade || item.raridade === raridade;
            const matchCategoria = !categoria || item.categoria === categoria;
            return matchBusca && matchRaridade && matchCategoria;
        });

        // Ordenar itens filtrados por raridade e alfabeticamente
        itens = this.ordenarItens(itens);

        const grid = document.getElementById('loja-grid-itens');
        if (grid) {
            grid.innerHTML = itens.map(item => this.criarCardItem(item)).join('');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 🛍️ COMPRA E VENDA
    // ═══════════════════════════════════════════════════════════

    /**
     * Comprar item
     */
    comprarItem(itemId) {
        console.log(`🛍️ Método comprarItem() chamado com itemId: ${itemId}`);
        const item = buscarItemPorId(itemId);
        console.log(`   Item encontrado: ${item ? '✅' : '❌'}`);
        if (!item) {
            console.error(`❌ Item ${itemId} não encontrado`);
            return;
        }

        console.log(`   Abrindo popup de quantidade...`);
        // Abrir popup para escolher quantidade
        this.abrirPopupQuantidadeCompra(item);
    }

    /**
     * Abre popup para escolher quantidade de compra
     */
    abrirPopupQuantidadeCompra(item) {
        console.log('🛍️ Abrindo popup de quantidade para:', item.nome);
        
        // Calcular máximo de itens que pode comprar
        const saldo = this.system.obterSaldo();
        const maxPorSaldo = Math.floor(saldo / item.custo);
        const maxPorEspaco = this.system.obterMaxItensParaEspacoDisponivel(item.espaco || 1);
        const maxItens = Math.min(maxPorSaldo, maxPorEspaco);

        console.log(`  - Saldo: ${saldo} (max por saldo: ${maxPorSaldo})`);
        console.log(`  - Espaço: (max por espaço: ${maxPorEspaco})`);
        console.log(`  - Total máximo: ${maxItens}`);

        if (maxItens <= 0) {
            console.warn('❌ Saldo ou espaço insuficiente');
            this.mostrarNotificacao('❌ Saldo ou espaço insuficiente', 'erro');
            return;
        }

        // Criar modal de quantidade
        const modal = document.createElement('div');
        modal.id = 'popup-quantidade-compra';
        modal.className = 'popup-modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="popup-modal-content" style="background: #2a2318; border: 2px solid #d8b4fe; border-radius: 8px; padding: 20px; width: 90%; max-width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                <div class="popup-header" style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: #d8b4fe; margin: 0;">🛍️ Comprar ${item.nome}</h3>
                </div>
                <div class="popup-body">
                    <div style="margin: 20px 0; text-align: center;">
                        <label for="input-quantidade" style="display: block; margin-bottom: 10px; color: #ddd;">
                            Quantos itens você deseja comprar?
                        </label>
                        <input 
                            type="number" 
                            id="input-quantidade" 
                            min="1" 
                            max="${maxItens}" 
                            value="1"
                            style="width: 80px; padding: 8px; text-align: center; font-size: 16px; background: #1a1510; color: #d8b4fe; border: 1px solid #d8b4fe; border-radius: 4px;"
                        >
                        <div style="margin-top: 15px; font-size: 14px; color: #aaa;">
                            <p>💰 Custo por item: ${item.custo} Rokmas</p>
                            <p id="custo-total" style="color: #7a8;">Custo total: ${item.custo} Rokmas</p>
                            <p style="margin-top: 10px; color: #7a8;">Máximo: ${maxItens} unidades</p>
                        </div>
                    </div>
                </div>
                <div class="popup-footer" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button id="btn-comprar-confirmar" style="padding: 8px 20px; background: #2a2; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ✅ Comprar
                    </button>
                    <button id="btn-comprar-cancelar" style="padding: 8px 20px; background: #a22; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ❌ Cancelar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Atualizar custo ao mudar quantidade
        const inputQty = modal.querySelector('#input-quantidade');
        const custoTotal = modal.querySelector('#custo-total');
        
        inputQty.addEventListener('input', () => {
            const qty = parseInt(inputQty.value) || 1;
            const total = qty * item.custo;
            custoTotal.textContent = `Custo total: ${total} Rokmas`;
        });

        // Botão Confirmar
        modal.querySelector('#btn-comprar-confirmar').addEventListener('click', () => {
            const quantidade = parseInt(inputQty.value) || 1;
            
            console.log(`✅ Confirmando compra de ${quantidade}x ${item.nome}`);
            
            if (quantidade > 0 && quantidade <= maxItens) {
                if (this.system.comprar(item.id, quantidade)) {
                    this.mostrarNotificacao(`✅ ${quantidade}x ${item.nome} comprado(s)!`, 'sucesso');
                    this.atualizarLoja();
                } else {
                    this.mostrarNotificacao(`❌ Não foi possível comprar ${item.nome}`, 'erro');
                }
            }
            modal.remove();
        });

        // Botão Cancelar
        modal.querySelector('#btn-comprar-cancelar').addEventListener('click', () => {
            console.log('❌ Compra cancelada');
            modal.remove();
        });

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        console.log('✨ Popup aberto com sucesso');
    }

    /**
     * Vender item
     */
    venderItem(itemId) {
        const item = buscarItemPorId(itemId);
        if (!item) return;

        if (this.system.vender(itemId)) {
            this.mostrarNotificacao(`💸 ${item.nome} vendido por ${item.valorVenda} Rokmas`, 'sucesso');
            this.atualizarLoja();
        } else {
            this.mostrarNotificacao(`❌ Não foi possível vender ${item.nome}`, 'erro');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 🎨 ATUALIZAR INTERFACE
    // ═══════════════════════════════════════════════════════════

    /**
     * Atualizar saldo em todos os locais
     */
    atualizarSaldoUI() {
        const saldo = this.system.obterSaldo();

        // Modal principal
        const saldoPrincipal = document.getElementById('modal-menu-itens-saldo');
        if (saldoPrincipal) {
            saldoPrincipal.textContent = saldo;
        }

        // Modal da loja
        const saldoLoja = document.getElementById('loja-saldo-valor');
        if (saldoLoja) {
            saldoLoja.textContent = saldo;
        }
    }

    /**
     * Atualizar renderização da loja
     */
    atualizarLoja() {
        console.log('🔄 Atualizando loja...');
        const grid = document.getElementById('loja-grid-itens');
        const modal = document.getElementById('modal-menu-itens-loja');
        
        console.log(`   Grid encontrado: ${grid ? '✅' : '❌'}`);
        console.log(`   Modal encontrado: ${modal ? '✅' : '❌'}`);
        console.log(`   Modal visível: ${modal && !modal.classList.contains('hidden') ? '✅' : '❌'}`);
        
        if (grid && modal && !modal.classList.contains('hidden')) {
            console.log('   ✨ Aplicando filtros para manter seleção...');
            this.aplicarFiltros();
            console.log('   ✅ Loja atualizada');
        } else {
            console.log('   ⚠️  Loja não visível, aguardando abertura');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔔 NOTIFICAÇÕES
    // ═══════════════════════════════════════════════════════════

    /**
     * Mostrar notificação toast
     */
    mostrarNotificacao(mensagem, tipo = 'info') {
        const toast = document.getElementById('menu-itens-toast');
        if (!toast) return;

        toast.textContent = mensagem;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, MENU_ITENS_CONFIG.interface.toastDuracao);
    }
}

// Criar instância global após o sistema estar pronto
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // Aguardar o sistema estar pronto
        const tentarCriarUI = setInterval(() => {
            if (window.menuItensSystem) {
                clearInterval(tentarCriarUI);
                window.menuItensUI = new MenuItensUI(window.menuItensSystem);
                console.log('✅ Interface de Itens disponível em: window.menuItensUI');

                // Inicializar integração com inventário se disponível
                const tentarIntegracao = setInterval(() => {
                    if (window.inventarioManager && window.menuItensInventarioIntegration) {
                        clearInterval(tentarIntegracao);
                        window.menuItensInventarioIntegration.init(
                            window.inventarioManager,
                            window.menuItensSystem
                        );
                        console.log('✅ Integração Loja <-> Inventário ativada');
                    }
                }, 100);

                // Timeout de segurança para integração (máx 3 segundos)
                setTimeout(() => clearInterval(tentarIntegracao), 3000);
            }
        }, 100);

        // Timeout de segurança (máx 5 segundos)
        setTimeout(() => clearInterval(tentarCriarUI), 5000);
    });
}
