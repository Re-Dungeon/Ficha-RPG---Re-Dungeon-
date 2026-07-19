/* ================================================= */
/* ATUALIZAR-FICHA-POPUP.JS */
/* Sistema de Popup Visual para Atualização da Ficha */
/* Apenas UI - NÃO altera lógica existente */
/* ================================================= */

/**
 * AtualizarFichaPopup
 * Responsável por:
 * - Renderizar modal de progresso
 * - Sincronizar visualmente a execução
 * - Executar função original normalmente
 * - NÃO alterar nenhuma lógica interna
 */
class AtualizarFichaPopup {
  constructor() {
    this.isOpen = false;
    this.isExecuting = false;
    this.etapas = [
      { id: 1, nome: 'Recalculando Aptidões', status: 'aguardando' },
      { id: 2, nome: 'Sincronizando Atributos', status: 'aguardando' },
      { id: 3, nome: 'Recalculando Secundários', status: 'aguardando' },
      { id: 4, nome: 'Atualizando Status', status: 'aguardando' },
      { id: 5, nome: 'Atualizando Interface', status: 'aguardando' },
      { id: 6, nome: 'Salvando Dados', status: 'aguardando' }
    ];

    this.init();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    console.log('🎮 [AtualizarFichaPopup] Inicializando...');
    this.criarModal();
    this.setupListeners();
    console.log('✅ [AtualizarFichaPopup] Inicializado');
  }

  /**
   * Cria o modal HTML
   */
  criarModal() {
    const modalHTML = `
      <div id="update-ficha-modal" class="update-ficha-modal" style="display: none;">
        <div class="update-ficha-modal__overlay"></div>
        <div class="update-ficha-modal__content">
          <div class="update-ficha-modal__header">
            <h2 class="update-ficha-modal__title">🔄 Atualizando Ficha</h2>
            <p class="update-ficha-modal__subtitle">Sincronizando dados do personagem...</p>
          </div>

          <div class="update-ficha-modal__etapas">
            ${this.etapas.map(etapa => `
              <div class="update-ficha-etapa" data-etapa-id="${etapa.id}">
                <span class="update-ficha-etapa__icon">⏳</span>
                <span class="update-ficha-etapa__nome">${etapa.nome}</span>
                <span class="update-ficha-etapa__status"></span>
              </div>
            `).join('')}
          </div>

          <div class="update-ficha-modal__footer">
            <p class="update-ficha-modal__mensagem" style="display: none;"></p>
            <button id="update-ficha-btn-fechar" class="btn-atualizar-fechar" style="display: none;">
              ✔ Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    // Adicionar ao DOM
    if (!document.getElementById('update-ficha-modal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Adicionar estilos
    this.adicionarEstilos();
  }

  /**
   * Adiciona estilos CSS ao documento
   */
  adicionarEstilos() {
    if (document.getElementById('update-ficha-popup-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'update-ficha-popup-styles';
    styles.textContent = `
      /* Modal Principal */
      .update-ficha-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .update-ficha-modal__overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: -1;
      }

      .update-ficha-modal__content {
        background: linear-gradient(135deg, #1a1410 0%, #2d2218 100%);
        border: 2px solid #d4af37;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.1);
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Header */
      .update-ficha-modal__header {
        text-align: center;
        margin-bottom: 2rem;
        border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        padding-bottom: 1rem;
      }

      .update-ficha-modal__title {
        color: #ffd700;
        font-size: 1.8rem;
        margin: 0 0 0.5rem 0;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
      }

      .update-ficha-modal__subtitle {
        color: #d4af37;
        font-size: 0.9rem;
        margin: 0;
        opacity: 0.8;
      }

      /* Etapas */
      .update-ficha-modal__etapas {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        margin: 1.5rem 0;
      }

      .update-ficha-etapa {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(212, 175, 55, 0.05);
        border-left: 3px solid rgba(212, 175, 55, 0.2);
        border-radius: 6px;
        transition: all 0.3s ease;
      }

      .update-ficha-etapa.executando {
        background: rgba(212, 175, 55, 0.15);
        border-left-color: #ffd700;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.1);
      }

      .update-ficha-etapa.concluida {
        background: rgba(100, 200, 100, 0.15);
        border-left-color: #64c864;
      }

      .update-ficha-etapa__icon {
        font-size: 1.2rem;
        min-width: 1.5rem;
        animation: pulse 1s infinite;
      }

      .update-ficha-etapa.concluida .update-ficha-etapa__icon {
        animation: none;
        color: #64c864;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .update-ficha-etapa__nome {
        flex: 1;
        color: #d4af37;
        font-weight: 500;
      }

      .update-ficha-etapa.concluida .update-ficha-etapa__nome {
        color: #64c864;
      }

      .update-ficha-etapa__status {
        font-size: 0.85rem;
        color: #888;
      }

      .update-ficha-etapa.concluida .update-ficha-etapa__status {
        color: #64c864;
      }

      /* Footer */
      .update-ficha-modal__footer {
        margin-top: 2rem;
        text-align: center;
        border-top: 1px solid rgba(212, 175, 55, 0.2);
        padding-top: 1rem;
      }

      .update-ficha-modal__mensagem {
        color: #64c864;
        font-size: 1rem;
        font-weight: bold;
        margin: 0 0 1rem 0;
        text-shadow: 0 0 10px rgba(100, 200, 100, 0.3);
      }

      /* Botão */
      .btn-atualizar-fechar {
        background: linear-gradient(135deg, #64c864 0%, #4a9d4a 100%);
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 1rem;
        transition: all 0.2s ease;
        box-shadow: 0 0 10px rgba(100, 200, 100, 0.3);
      }

      .btn-atualizar-fechar:hover {
        background: linear-gradient(135deg, #76d876 0%, #5aad5a 100%);
        box-shadow: 0 0 15px rgba(100, 200, 100, 0.5);
      }

      .btn-atualizar-fechar:active {
        transform: scale(0.98);
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Setup dos listeners
   */
  setupListeners() {
    // Listener do botão "Atualizar Ficha"
    const btnAtualizar = document.getElementById('btn-atualizar-ficha');
    if (btnAtualizar) {
      // Remove listener anterior se existir
      btnAtualizar.removeEventListener('click', btnAtualizar._originalHandler);

      // Cria novo handler que abre o popup
      const handler = () => this.executarComPopup();
      btnAtualizar._originalHandler = handler;
      btnAtualizar.addEventListener('click', handler);
      console.log('✅ [AtualizarFichaPopup] Listener adicionado ao botão');
    }

    // Listener do botão "Fechar"
    const btnFechar = document.getElementById('update-ficha-btn-fechar');
    if (btnFechar) {
      btnFechar.addEventListener('click', () => this.fecharModal());
    }
  }

  /**
   * Executa a atualização com popup
   */
  async executarComPopup() {
    if (this.isExecuting) {
      console.log('⏳ Atualização já em progresso');
      return;
    }

    this.isExecuting = true;
    this.abrirModal();
    this.resetarEtapas();

    try {
      // Iniciar simulação visual
      const promiseSimulacao = this.iniciarSimulacaoProgresso();

      // Executar a função original (sem await - deixar rodar assincronamente)
      if (window.atualizarFichaCompleta && typeof window.atualizarFichaCompleta.executar === 'function') {
        const sucesso = window.atualizarFichaCompleta.executar();
        console.log('✅ Função original executada, resultado:', sucesso);
      } else {
        console.error('❌ atualizarFichaCompleta não disponível');
        this.finalizarComErro();
        return;
      }

      // Aguardar a simulação visual terminar
      await promiseSimulacao;

      // Pequeno delay antes de finalizar para permitir processamento
      await this.aguardar(300);

      // Finalizar com sucesso
      this.finalizarSucesso();

    } catch (error) {
      console.error('❌ Erro ao executar atualização:', error);
      this.finalizarComErro();
    }
  }

  /**
   * Inicia simulação visual do progresso
   * Retorna uma Promise que resolve quando terminada
   */
  iniciarSimulacaoProgresso() {
    return new Promise((resolve) => {
      let etapaAtual = 0;
      const tempoTotal = 400 * this.etapas.length; // 400ms por etapa

      const simular = () => {
        if (etapaAtual < this.etapas.length) {
          // Marcar etapa anterior como concluída
          if (etapaAtual > 0) {
            this.marcarEtapaConcluida(etapaAtual - 1);
          }

          // Marcar etapa atual como executando
          this.marcarEtapaExecutando(etapaAtual);

          etapaAtual++;
          setTimeout(simular, 400);
        } else {
          // Marcar última etapa como concluída
          this.marcarEtapaConcluida(this.etapas.length - 1);
          // Resolver a promise quando terminar
          resolve();
        }
      };

      simular();
    });
  }

  /**
   * Marca uma etapa como executando
   */
  marcarEtapaExecutando(index) {
    const etapa = document.querySelector(`[data-etapa-id="${index + 1}"]`);
    if (etapa) {
      etapa.classList.remove('aguardando', 'concluida');
      etapa.classList.add('executando');
      etapa.querySelector('.update-ficha-etapa__icon').textContent = '⏳';
      etapa.querySelector('.update-ficha-etapa__status').textContent = 'Processando...';
    }
  }

  /**
   * Marca uma etapa como concluída
   */
  marcarEtapaConcluida(index) {
    const etapa = document.querySelector(`[data-etapa-id="${index + 1}"]`);
    if (etapa) {
      etapa.classList.remove('aguardando', 'executando');
      etapa.classList.add('concluida');
      etapa.querySelector('.update-ficha-etapa__icon').textContent = '✔';
      etapa.querySelector('.update-ficha-etapa__status').textContent = 'Concluído';
    }
  }

  /**
   * Abre o modal
   */
  abrirModal() {
    const modal = document.getElementById('update-ficha-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.isOpen = true;
      console.log('🪟 [AtualizarFichaPopup] Modal aberto');
    }
  }

  /**
   * Fecha o modal
   */
  fecharModal() {
    const modal = document.getElementById('update-ficha-modal');
    if (modal) {
      modal.style.display = 'none';
      this.isOpen = false;
      this.isExecuting = false;
      console.log('🪟 [AtualizarFichaPopup] Modal fechado');
    }
  }

  /**
   * Reseta todas as etapas
   */
  resetarEtapas() {
    document.querySelectorAll('.update-ficha-etapa').forEach(etapa => {
      etapa.classList.remove('executando', 'concluida');
      etapa.classList.add('aguardando');
      etapa.querySelector('.update-ficha-etapa__icon').textContent = '⏳';
      etapa.querySelector('.update-ficha-etapa__status').textContent = '';
    });
  }

  /**
   * Finaliza com sucesso
   */
  finalizarSucesso() {
    this.isExecuting = false;
    
    // Marcar todas as etapas como concluídas
    for (let i = 0; i < this.etapas.length; i++) {
      this.marcarEtapaConcluida(i);
    }
    
    const mensagem = document.querySelector('.update-ficha-modal__mensagem');
    const btnFechar = document.getElementById('update-ficha-btn-fechar');

    if (mensagem) {
      mensagem.textContent = '✔ Ficha atualizada com sucesso!';
      mensagem.style.display = 'block';
      mensagem.style.color = '#64c864';
    }

    if (btnFechar) {
      btnFechar.style.display = 'block';
    }

    console.log('✅ [AtualizarFichaPopup] Atualização concluída com sucesso');

    // Auto-fechar após 500ms
    setTimeout(() => {
      this.fecharModal();
    }, 500);
  }

  /**
   * Finaliza com aviso
   */
  finalizarComAviso() {
    this.isExecuting = false;

    const mensagem = document.querySelector('.update-ficha-modal__mensagem');
    const btnFechar = document.getElementById('update-ficha-btn-fechar');

    if (mensagem) {
      mensagem.textContent = '⚠️ Atualização concluída com avisos. Verifique o console.';
      mensagem.style.color = '#ffd700';
      mensagem.style.display = 'block';
    }

    if (btnFechar) {
      btnFechar.style.display = 'block';
    }

    console.log('⚠️ [AtualizarFichaPopup] Atualização concluída com avisos');
  }

  /**
   * Finaliza com erro
   */
  finalizarComErro() {
    this.isExecuting = false;

    const mensagem = document.querySelector('.update-ficha-modal__mensagem');
    const btnFechar = document.getElementById('update-ficha-btn-fechar');

    if (mensagem) {
      mensagem.textContent = '❌ Erro ao atualizar ficha. Veja o console.';
      mensagem.style.color = '#ff6666';
      mensagem.style.display = 'block';
    }

    if (btnFechar) {
      btnFechar.style.display = 'block';
    }

    console.error('❌ [AtualizarFichaPopup] Erro na atualização');
  }

  /**
   * Aguarda um tempo (helper)
   */
  aguardar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📍 [AtualizarFichaPopup] DOMContentLoaded acionado');
    window.atualizarFichaPopup = new AtualizarFichaPopup();
  });
} else {
  console.log('📍 [AtualizarFichaPopup] Inicializando imediatamente (DOM já carregado)');
  window.atualizarFichaPopup = new AtualizarFichaPopup();
}
