/**
 * APTIDOES-VISUAL-POPUP.JS
 * Popup isolado para visualizar a Enciclopédia de Aptidões
 * Apenas Leitura - Catálogo com filtro dinâmico
 */

class AptidoesVisualPopup {
    constructor() {
        // IDs dos elementos do DOM
        this.overlayPrincipalId = 'popup-aptidao-visual';
        this.filtroPrincipalId = 'aptidao-visual-filtro';
        this.listaPrincipalId = 'aptidao-visual-lista';
        this.botaoFecharPrincipalId = 'aptidao-visual-btn-fechar';

        this.overlayDetalheId = 'popup-aptidao-detalhe';
        this.botaoFecharDetalheId = 'aptidao-detalhe-btn-fechar';
        this.detalheCorpoId = 'aptidao-detalhe-corpo';

        // Dados da enciclopédia
        this.aptidoesCatalogo = [];
        this.aptidoesEditando = [];

        // Estado do filtro
        this.filtroAtual = '';

        // Inicializar
        this.init();
    }

    /**
     * Inicializar - Montar listeners e elements
     */
    init() {
        this.attachElements();
        this.setupEventListeners();
    }

    /**
     * Recuperar referências aos elementos
     */
    attachElements() {
        this.overlayPrincipal = document.getElementById(this.overlayPrincipalId);
        this.filtroPrincipal = document.getElementById(this.filtroPrincipalId);
        this.listaPrincipal = document.getElementById(this.listaPrincipalId);
        this.botaoFecharPrincipal = document.getElementById(this.botaoFecharPrincipalId);
        this.botaoVoltarPrincipal = document.getElementById('aptidao-visual-btn-voltar');

        this.overlayDetalhe = document.getElementById(this.overlayDetalheId);
        this.botaoFecharDetalhe = document.getElementById(this.botaoFecharDetalheId);
        this.botaoVoltarDetalhe = document.getElementById('aptidao-detalhe-btn-voltar');
        this.detalheCorpo = document.getElementById(this.detalheCorpoId);

        if (!this.overlayPrincipal || !this.filtroPrincipal) {
            console.warn('[AptidoesVisualPopup] Elementos do DOM não encontrados');
            return;
        }

        // Assegurar que os overlays estão ocultos inicialmente
        this.overlayPrincipal.setAttribute('aria-hidden', 'true');
        this.overlayDetalhe.setAttribute('aria-hidden', 'true');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        if (!this.botaoFecharPrincipal || !this.filtroPrincipal) return;

        // Fechar popup principal
        this.botaoFecharPrincipal.addEventListener('click', () => this.close());

        // Voltar ao menu principal
        if (this.botaoVoltarPrincipal) {
            this.botaoVoltarPrincipal.addEventListener('click', () => this.voltarMenu());
        }

        // Fechar ao clicar no backdrop
        const backdropPrincipal = this.overlayPrincipal?.querySelector('.aptidao-visual-overlay__backdrop');
        if (backdropPrincipal) {
            backdropPrincipal.addEventListener('click', () => this.close());
        }

        // Filtro
        this.filtroPrincipal.addEventListener('input', (e) => this.handleFiltroChange(e));

        // Fechar detalhe
        if (this.botaoFecharDetalhe) {
            this.botaoFecharDetalhe.addEventListener('click', () => this.fecharDetalhe());
        }

        // Voltar no detalhe
        if (this.botaoVoltarDetalhe) {
            this.botaoVoltarDetalhe.addEventListener('click', () => this.voltarMenu());
        }

        const backdropDetalhe = this.overlayDetalhe?.querySelector('.aptidao-detalhe-overlay__backdrop');
        if (backdropDetalhe) {
            backdropDetalhe.addEventListener('click', () => this.fecharDetalhe());
        }
    }

    /**
     * Abrir o popup principal
     */
    async open() {
        if (!this.overlayPrincipal) return;

        // Mostrar overlay
        this.overlayPrincipal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Carregar dados se ainda não estão carregados
        if (this.aptidoesCatalogo.length === 0) {
            await this.loadAptidoes();
        }

        // Renderizar com filtro vazio
        this.renderAptidoes();

        // Focar no filtro
        if (this.filtroPrincipal) {
            setTimeout(() => this.filtroPrincipal.focus(), 100);
        }
    }

    /**
     * Fechar o popup principal
     */
    close() {
        if (!this.overlayPrincipal) return;

        this.overlayPrincipal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';

        // Limpar filtro
        this.filtroAtual = '';
        if (this.filtroPrincipal) {
            this.filtroPrincipal.value = '';
        }

        // Fechar detalhe também se estiver aberto
        this.fecharDetalhe();
    }

    /**
     * Voltar para o menu principal (Atributos)
     * Mantém todos os dados salvos
     */
    voltarMenu() {
        console.log('🔙 Voltando do modal de aptidões para o menu principal...');
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
     * Carregar aptidões do banco de dados
     */
    async loadAptidoes() {
        try {
            // Tentar acessar o AptidoesDB
            if (typeof window.aptidoesDB === 'undefined') {
                throw new Error('AptidoesDB não está disponível');
            }

            // Tentar acessar o banco de dados
            if (!window.aptidoesDB.db) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Obter catálogo
            this.aptidoesCatalogo = await window.aptidoesDB.getCatalogoCompleto() || [];

            if (this.aptidoesCatalogo.length === 0) {
                console.warn('[AptidoesVisualPopup] Nenhuma aptidão encontrada no catálogo');
            }
        } catch (erro) {
            console.error('[AptidoesVisualPopup] Erro ao carregar aptidões:', erro);
            this.aptidoesCatalogo = [];
        }
    }

    /**
     * Renderizar cards de aptidões filtradas
     */
    renderAptidoes() {
        if (!this.listaPrincipal) return;

        // Limpar lista
        this.listaPrincipal.innerHTML = '';

        // Filtrar aptidões
        const aptidoesFiltradas = this.aptidoesCatalogo.filter(apt => {
            const nome = (apt.nome || '').toLowerCase();
            const descricao = (apt.descricao || '').toLowerCase();
            const filtro = this.filtroAtual.toLowerCase();

            return nome.includes(filtro) || descricao.includes(filtro);
        });

        // Se nenhuma encontrada
        if (aptidoesFiltradas.length === 0) {
            const msg = document.createElement('p');
            msg.className = 'aptidao-visual__mensagem-vazia';
            msg.textContent = 'Nenhuma aptidão encontrada';
            this.listaPrincipal.appendChild(msg);
            return;
        }

        // Renderizar cada aptidão
        aptidoesFiltradas.forEach(aptidao => {
            const card = this.criarCardAptidao(aptidao);
            this.listaPrincipal.appendChild(card);
        });
    }

    /**
     * Criar elemento de card para uma aptidão
     */
    criarCardAptidao(aptidao) {
        const card = document.createElement('div');
        card.className = 'card-aptidao-visual';

        // Imagem
        const img = document.createElement('img');
        img.className = 'card-aptidao-visual__imagem';
        img.src = aptidao.imagem || 'assets/icons/aptidao-default.png';
        img.alt = aptidao.nome || 'Aptidão';
        img.onerror = function() {
            this.src = 'assets/icons/aptidao-default.png';
        };

        // Nome
        const nome = document.createElement('h4');
        nome.className = 'card-aptidao-visual__nome';
        nome.textContent = aptidao.nome || 'Sem nome';

        // Botão visualizar
        const botao = document.createElement('button');
        botao.className = 'card-aptidao-visual__botao-visualizar';
        botao.textContent = 'Visualizar';
        botao.addEventListener('click', () => this.abrirDetalhe(aptidao));

        card.appendChild(img);
        card.appendChild(nome);
        card.appendChild(botao);

        return card;
    }

    /**
     * Abrir detalhe de uma aptidão
     */
    abrirDetalhe(aptidao) {
        if (!this.overlayDetalhe || !this.detalheCorpo) return;

        // Montar conteúdo
        const conteudo = this.criarConteudoDetalhe(aptidao);

        // Limpar e renderizar
        this.detalheCorpo.innerHTML = '';
        this.detalheCorpo.appendChild(conteudo);

        // Mostrar overlay
        this.overlayDetalhe.setAttribute('aria-hidden', 'false');
    }

    /**
     * Criar conteúdo do detalhe
     */
    criarConteudoDetalhe(aptidao) {
        const container = document.createElement('div');
        container.className = 'aptidao-detalhe__conteudo';

        // === CABEÇALHO COM IMAGEM ===
        const headerConteudo = document.createElement('div');
        headerConteudo.className = 'aptidao-detalhe__header-conteudo';

        // Imagem grande
        const imgGrande = document.createElement('img');
        imgGrande.className = 'aptidao-detalhe__imagem-grande';
        imgGrande.src = aptidao.imagem || 'assets/icons/aptidao-default.png';
        imgGrande.alt = aptidao.nome || 'Aptidão';
        imgGrande.onerror = function() {
            this.src = 'assets/icons/aptidao-default.png';
        };

        // Info header
        const infoHeader = document.createElement('div');
        infoHeader.className = 'aptidao-detalhe__info-header';

        const nomeGrande = document.createElement('h2');
        nomeGrande.className = 'aptidao-detalhe__nome-grande';
        nomeGrande.textContent = aptidao.nome || 'Sem nome';

        const descricao = document.createElement('p');
        descricao.className = 'aptidao-detalhe__descricao';
        descricao.textContent = aptidao.descricao || 'Sem descrição';

        infoHeader.appendChild(nomeGrande);
        infoHeader.appendChild(descricao);

        headerConteudo.appendChild(imgGrande);
        headerConteudo.appendChild(infoHeader);

        container.appendChild(headerConteudo);

        // === NÍVEIS ===
        // Tentar usar 'vantagens' (campo correto) ou 'niveis' (fallback)
        const niveisData = aptidao.vantagens || aptidao.niveis || [];

        if (niveisData && Array.isArray(niveisData) && niveisData.length > 0) {
            const niveisContainer = document.createElement('div');
            niveisContainer.className = 'aptidao-detalhe__niveis';

            // Ordenar níveis por número
            const niveisOrdenados = [...niveisData].sort((a, b) => (a.nivel || 0) - (b.nivel || 0));

            niveisOrdenados.forEach((nivelData) => {
                const nivelDiv = document.createElement('div');
                nivelDiv.className = 'aptidao-detalhe__nivel';

                const numeroNivel = document.createElement('div');
                numeroNivel.className = 'aptidao-detalhe__nivel-numero';
                numeroNivel.textContent = `Nível ${nivelData.nivel || 'desconhecido'}`;

                const efeito = document.createElement('div');
                efeito.className = 'aptidao-detalhe__nivel-efeito';
                efeito.textContent = nivelData.efeito || 'Efeito desconhecido';

                nivelDiv.appendChild(numeroNivel);
                nivelDiv.appendChild(efeito);

                if (nivelData.narrativa) {
                    const narrativa = document.createElement('p');
                    narrativa.className = 'aptidao-detalhe__nivel-narrativa';
                    narrativa.textContent = `"${nivelData.narrativa}"`;
                    nivelDiv.appendChild(narrativa);
                }

                niveisContainer.appendChild(nivelDiv);
            });

            container.appendChild(niveisContainer);
        } else {
            // Se não houver níveis, mostrar mensagem
            const semNiveisDiv = document.createElement('div');
            semNiveisDiv.style.padding = '1.5rem';
            semNiveisDiv.style.textAlign = 'center';
            semNiveisDiv.style.color = 'rgba(232, 213, 183, 0.6)';
            semNiveisDiv.textContent = 'Nenhuma informação de nível disponível';
            container.appendChild(semNiveisDiv);
        }

        return container;
    }

    /**
     * Fechar detalhe
     */
    fecharDetalhe() {
        if (!this.overlayDetalhe) return;
        this.overlayDetalhe.setAttribute('aria-hidden', 'true');
    }

    /**
     * Handle mudança de filtro
     */
    handleFiltroChange(e) {
        this.filtroAtual = e.target.value;
        this.renderAptidoes();
    }
}

// Instanciar globalmente quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aptidoesVisualPopup = new AptidoesVisualPopup();
    });
} else {
    window.aptidoesVisualPopup = new AptidoesVisualPopup();
}
