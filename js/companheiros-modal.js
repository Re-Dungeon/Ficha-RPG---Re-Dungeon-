/* ============================================================= */
/* COMPANHEIROS-MODAL.JS - Controlador do Modal de Companheiros */
/* Gerencia abertura, fechamento e salvamento do modal           */
/* ============================================================= */

/**
 * CompanheirosModalController
 * Responsável pela lógica do modal
 */

class CompanheirosModalController {
    constructor() {
        this.modalId = 'modalNovoCompanheiro';
        this.modoVisualizacao = false;
        this.racas = []; // Array de raças será preenchido em inicializarRacas()
        this.inicializar();
    }

    /**
     * Inicializar o controlador
     */
    inicializar() {
        console.log('🪟 Inicializando CompanheirosModalController...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurarModal());
        } else {
            this.configurarModal();
        }
    }

    /**
     * Configurar eventos do modal
     */
    configurarModal() {
        console.log('⚙️ Configurando eventos do modal...');

        const modal = document.getElementById(this.modalId);
        
        if (!modal) {
            console.warn(`⚠️ Modal '${this.modalId}' não encontrada`);
            return;
        }

        // Inicializar dados de raças
        this.inicializarRacas();

        // Botões de fechar
        const btnFechar = modal.querySelector('#btn-modal-companheiro-fechar');
        const btnCancelar = modal.querySelector('#btn-modal-companheiro-cancelar');
        const btnSalvar = modal.querySelector('#btn-modal-companheiro-salvar');

        if (btnFechar) btnFechar.addEventListener('click', () => this.fecharModal());
        if (btnCancelar) btnCancelar.addEventListener('click', () => this.fecharModal());
        if (btnSalvar) btnSalvar.addEventListener('click', async () => await this.salvarCompanheiro());

        // Configurar abas
        console.log('⚙️ Chamando configurarAbas()...');
        this.configurarAbas();
        console.log('✅ configurarAbas() chamado com sucesso');

        // Configurar preview de imagem
        this.configurarPreviewImagem();

        // Configurar tabs de imagem
        this.configurarTabsImagem();

        // Backdrop
        const backdrop = modal.querySelector('.modal-overlay__backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.fecharModal());
        }

        // Event listeners para updates em tempo real
        this.configurarEventListenersDinamicos();

        console.log('✅ Modal configurado');
    }

    /**
     * Configurar listeners dinâmicos para atributos, barras e nome
     */
    configurarEventListenersDinamicos() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Inputs de atributos primários
        const atributosList = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'];
        
        atributosList.forEach(attr => {
            const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
            const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);

            if (inputBase) {
                inputBase.addEventListener('input', () => {
                    this.atualizarDisplaysAtributos();
                    this.atualizarMaximoStatus();
                    // ✅ Sincronizar companheiroData para cálculos de espaço em tempo real
                    this.sincronizarCompanheiroDataDoModal();
                    // ✅ Atualizar painel de espaço em tempo real
                    if (window.companheiroInventarioUI) {
                        window.companheiroInventarioUI.renderPainelEspaco();
                    }
                    // ✅ Disparar evento para inventário recalcular espaço
                    this.dispatcharEventoAtributosAlterados();
                });
                inputBase.addEventListener('change', () => {
                    this.atualizarDisplaysAtributos();
                    this.atualizarMaximoStatus();
                    // ✅ Sincronizar companheiroData para cálculos de espaço
                    this.sincronizarCompanheiroDataDoModal();
                    // ✅ Atualizar painel de espaço
                    if (window.companheiroInventarioUI) {
                        window.companheiroInventarioUI.renderPainelEspaco();
                    }
                    // ✅ NOVO: Disparar evento para inventário recalcular espaço
                    this.dispatcharEventoAtributosAlterados();
                });
            }

            if (inputExtra) {
                inputExtra.addEventListener('input', () => {
                    this.atualizarDisplaysAtributos();
                    this.atualizarMaximoStatus();
                    // ✅ Sincronizar companheiroData para cálculos de espaço em tempo real
                    this.sincronizarCompanheiroDataDoModal();
                    // ✅ Atualizar painel de espaço em tempo real
                    if (window.companheiroInventarioUI) {
                        window.companheiroInventarioUI.renderPainelEspaco();
                    }
                    // ✅ NOVO: Disparar evento para inventário recalcular espaço
                    this.dispatcharEventoAtributosAlterados();
                });
                inputExtra.addEventListener('change', () => {
                    this.atualizarDisplaysAtributos();
                    this.atualizarMaximoStatus();
                    // ✅ Sincronizar companheiroData para cálculos de espaço
                    this.sincronizarCompanheiroDataDoModal();
                    // ✅ Atualizar painel de espaço
                    if (window.companheiroInventarioUI) {
                        window.companheiroInventarioUI.renderPainelEspaco();
                    }
                    // ✅ NOVO: Disparar evento para inventário recalcular espaço
                    this.dispatcharEventoAtributosAlterados();
                });
            }
        });

        // Inputs de atributos secundários (base e extra)
        const secundariosList = ['prontidao', 'ataque', 'defesa', 'reacao', 'precisao', 'evasao'];
        
        secundariosList.forEach(attr => {
            const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
            const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);

            if (inputBase) {
                inputBase.addEventListener('input', () => this.atualizarAtributosSecundarios());
                inputBase.addEventListener('change', () => this.atualizarAtributosSecundarios());
            }

            if (inputExtra) {
                inputExtra.addEventListener('input', () => this.atualizarAtributosSecundarios());
                inputExtra.addEventListener('change', () => this.atualizarAtributosSecundarios());
            }
        });

        // Inputs de barras
        ['saude', 'energia', 'fadiga'].forEach(tipo => {
            const inputValor = modal.querySelector(`#comp-char-${tipo}-valor`);
            const inputMaxima = modal.querySelector(`#comp-char-${tipo}-maxima`);
            const inputExtra = modal.querySelector(`#comp-char-${tipo}-extra`);
            const inputBonus = modal.querySelector(`#comp-char-${tipo}-bonus`);

            if (inputValor) {
                inputValor.addEventListener('input', () => this.atualizarBarrasAnimadas());
                inputValor.addEventListener('change', () => this.atualizarBarrasAnimadas());
            }

            if (inputMaxima) {
                inputMaxima.addEventListener('input', () => this.atualizarBarrasAnimadas());
                inputMaxima.addEventListener('change', () => this.atualizarBarrasAnimadas());
            }

            // Extra e Bonus dos status afetam o máximo calculado
            if (inputExtra) {
                inputExtra.addEventListener('input', () => this.atualizarMaximoStatus());
                inputExtra.addEventListener('change', () => this.atualizarMaximoStatus());
            }

            if (inputBonus) {
                inputBonus.addEventListener('input', () => this.atualizarMaximoStatus());
                inputBonus.addEventListener('change', () => this.atualizarMaximoStatus());
            }
        });

        // Input de nível
        const inputNivel = modal.querySelector('#comp-char-nivel-input');
        if (inputNivel) {
            inputNivel.addEventListener('input', () => {
                this.atualizarNivelHeader();
                this.atualizarPontosDistribuir();
            });
        }

        // Input de nome
        const inputNome = modal.querySelector('#comp-char-nome');
        if (inputNome) {
            inputNome.addEventListener('input', () => this.atualizarNomeHeader());
        }

        // Botões de tipo
        const botoesTopo = modal.querySelectorAll('.comp-tipo-btn');
        botoesTopo.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tipo = btn.getAttribute('data-tipo');
                this.selecionarTipo(tipo);
            });
        });

        // Botões de subtrair barras
        const botoesSubtrair = modal.querySelectorAll('.comp-barra-btn-subtrair');
        botoesSubtrair.forEach(btn => {
            btn.addEventListener('click', (e) => this.subtrairBarra(e));
        });

        // Input de notas
        const inputNotas = modal.querySelector('#comp-char-notas');
        if (inputNotas) {
            inputNotas.addEventListener('input', () => {
                // Notas são salvas automaticamente no formulário
            });
            inputNotas.addEventListener('change', () => {
                // Notas são salvas automaticamente no formulário
            });
        }

        // Botão de raça
        const btnRaca = modal.querySelector('#comp-char-raca-btn');
        if (btnRaca) {
            btnRaca.addEventListener('click', (e) => this.abrirSeletorRaca(e));
        }

        // Botão de ícone de raça (mostrar detalhes)
        const btnRacaIcon = modal.querySelector('#comp-char-raca-icon-btn');
        if (btnRacaIcon) {
            btnRacaIcon.addEventListener('click', (e) => {
                e.preventDefault();
                const racaSelecionada = btnRaca?.getAttribute('data-raca');
                if (racaSelecionada && this.racas.length > 0) {
                    const raca = this.racas.find(r => r.id === racaSelecionada);
                    if (raca) {
                        this.mostrarDetalhesRaca(raca);
                    }
                }
            });
        }
    }

    /**
     * Subtrair valor de barra de status
     */
    subtrairBarra(event) {
        const btn = event.target;
        const tipoBarraSubt = btn.getAttribute('data-barra');
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Novos IDs do layout atualizado
        const inputEntrada = modal.querySelector(`#comp-char-${tipoBarraSubt}-entrada`);
        const inputValor = modal.querySelector(`#comp-char-${tipoBarraSubt}-valor`);

        if (inputEntrada && inputValor) {
            const valor = parseInt(inputEntrada.value) || 0;
            const atual = parseInt(inputValor.value) || 0;
            
            const novoValor = Math.max(0, atual - valor);
            inputValor.value = novoValor;

            // Limpar input de entrada
            inputEntrada.value = 0;

            // Atualizar barra
            this.atualizarBarrasAnimadas();
        }
    }

    /**
     * Selecionar tipo de companheiro
     */
    selecionarTipo(tipo) {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Mapear tipos aos nomes e cores
        const tiposMapping = {
            'MASCOTE': { nome: '🐾 Mascote', classe: 'mascote' },
            'COMPANHEIRO': { nome: '👥 Companheiro', classe: 'companheiro' },
            'ESPIRITO': { nome: '👻 Espírito', classe: 'espirito' },
            'INVOCACAO': { nome: '✨ Invocação', classe: 'invocacao' },
            'PACTO': { nome: '🔮 Pacto', classe: 'pacto' },
            'TRANSFORMACAO': { nome: '🔄 Transformação', classe: 'transformacao' }
        };

        // Atualizar valor do campo hidden
        const inputTipo = modal.querySelector('#comp-char-tipo');
        if (inputTipo) {
            inputTipo.value = tipo;
        }

        // Remover class 'active' de todos os botões
        const botoesTodo = modal.querySelectorAll('.comp-tipo-btn');
        botoesTodo.forEach(btn => {
            btn.classList.remove('active');
        });

        // Adicionar class 'active' ao botão clicado
        const btnSelecionado = modal.querySelector(`.comp-tipo-btn[data-tipo="${tipo}"]`);
        if (btnSelecionado) {
            btnSelecionado.classList.add('active');
        }

        // Atualizar cor do header (se necessário)
        const header = modal.querySelector('.comp-char-header');
        if (header && tiposMapping[tipo]) {
            const mapeamento = tiposMapping[tipo];
            // Remover todas as classes de tipo
            Object.values(tiposMapping).forEach(t => {
                header.classList.remove(`header--${t.classe}`);
            });
            // Adicionar a classe do novo tipo
            header.classList.add(`header--${mapeamento.classe}`);
        }

        console.log(`✅ Tipo selecionado: ${tipo}`);
    }

    /**
     * Inicializar dados de raças
     */
    inicializarRacas() {
        this.racas = [
            {
                id: 'mamiferos',
                nome: 'Mamíferos',
                tipo: "Re'Geron",
                raridade: '🔵 COMUM',
                imagem: 'https://i.imgur.com/lFfL0KW.png',
                descricao: 'Os Sangue-Quente. Adaptação acelerada, energia constante e alta capacidade de aprendizado.',
                atributos: {
                    FOR: '4d6+8',
                    VIT: '4d6+10',
                    AGI: '4d6+10',
                    INT: '5d6+12',
                    PER: '4d6+8',
                    SOR: '5d20'
                },
                limite: 100,
                habilidades: [
                    { nome: 'Sangue Quente', desc: 'Bônus +2 em ações físicas repetidas, recuperação dobrada com descanso curto' },
                    { nome: 'Aprendizado Rápido', desc: 'Ganha +2 em perícias recém-adquiridas, adapta estratégias em combate' },
                    { nome: 'Emoção Intensa', desc: 'Bônus de inspiração e coragem, excelente sinergia com liderança' }
                ]
            },
            {
                id: 'batrakos',
                nome: 'Batrakos',
                tipo: "Re'Geron",
                raridade: '🟢 RARO',
                imagem: 'https://i.imgur.com/653YYqB.png',
                descricao: 'Os Anfíbios do Abismo. Humanoides esguios, adaptados tanto em terra quanto na água profunda.',
                atributos: {
                    FOR: '5d6+10',
                    VIT: '6d6+14',
                    AGI: '5d6+10',
                    INT: '3d6+6',
                    PER: '4d6+10',
                    SOR: '5d20'
                },
                limite: 100,
                habilidades: [
                    { nome: 'Corpo de Dupla Pressão', desc: 'Respira em água e terra, sem penalidades em terrenos alagados' },
                    { nome: 'Salto Predatório', desc: '+2 em Mobilidade/Acrobacia, bônus em ataque após salto' },
                    { nome: 'Mente Abissal', desc: 'Ataques desarmados causam efeito leve de veneno, +3 contra toxinas' }
                ]
            },
            {
                id: 'khrull',
                nome: 'Khrull',
                tipo: "Re'Geron",
                raridade: '🟢 RARO',
                imagem: 'https://i.imgur.com/uHvvENg.png',
                descricao: 'Os Insetoides. Seres de colmeia, eficientes e organizados, com exoesqueleto quitinoso.',
                atributos: {
                    FOR: '4d6+10',
                    VIT: '5d6+12',
                    AGI: '6d6+12',
                    INT: '3d6+6',
                    PER: '6d6+14',
                    SOR: '5d20'
                },
                limite: 100,
                habilidades: [
                    { nome: 'Exoesqueleto Quitinoso', desc: 'Armadura natural (3d6+9), +2 em Defesa contra dano físico' },
                    { nome: 'Mente de Colmeia', desc: '+3 em Agilidade/Tática com aliado Khrull próximo' },
                    { nome: 'Fisiologia Insetoide', desc: '+3 contra venenos, pode sobreviver com alimentação mínima' }
                ]
            },
            {
                id: 'repteis',
                nome: 'Répteis',
                tipo: "Re'Geron",
                raridade: '🟢 RARO',
                imagem: 'https://i.imgur.com/7PROMpt.png',
                descricao: 'Os Antigos. Pacientes, pragmáticos e frios no cálculo, conectados ao ambiente.',
                atributos: {
                    FOR: '5d6+10',
                    VIT: '6d6+14',
                    AGI: '4d6+10',
                    INT: '2d6+6',
                    PER: '6d6+14',
                    SOR: '5d20'
                },
                limite: 100,
                habilidades: [
                    { nome: 'Sangue Frio Adaptativo', desc: '+2 contra venenos, regenera em calor natural' },
                    { nome: 'Escamas Naturais', desc: '+30% DefEsa contra dano físico' },
                    { nome: 'Instinto Predador', desc: '+2 em Percepção, vantagem contra feridos' }
                ]
            },
            {
                id: 'umbros',
                nome: 'Umbros',
                tipo: "Re'Geron",
                raridade: '🟣 ÉPICA',
                imagem: 'https://i.imgur.com/B6lTMcX.png',
                descricao: 'Os Ruídos da Realidade. Sobras conceituais, resíduos ontológicos que quebram a lógica.',
                atributos: {
                    FOR: '3d8+12',
                    VIT: '5d8+12',
                    AGI: '4d6+18',
                    INT: '3d8+12',
                    PER: '5d8+12',
                    SOR: '4d20+20'
                },
                limite: 150,
                habilidades: [
                    { nome: 'Existência Incompleta', desc: '+3 em furtividade, +2 Evasão contra ataques diretos' },
                    { nome: 'Campo de Ruído Cognitivo', desc: 'Inimigos sofrem –1 Reação, hesitação em falhas' },
                    { nome: 'Limiar da Emergência', desc: 'Acumula Marcas de Coerência, pode manifestar Morvak' }
                ]
            },
            {
                id: 'fantasmas',
                nome: 'Fantasmas',
                tipo: "Re'Geron",
                raridade: '🟣 ÉPICA',
                imagem: 'https://i.imgur.com/aK9UcVI.png',
                descricao: 'Os Ecos que Recusam o Fim. Consciências presas por trauma, promessa ou ódio.',
                atributos: {
                    FOR: '1d4+2',
                    VIT: '3d6+6',
                    AGI: '5d6+12',
                    INT: '6d6+14',
                    PER: '6d8+15',
                    SOR: '4d20+20'
                },
                limite: 150,
                habilidades: [
                    { nome: 'Forma Etérea', desc: 'Ignora terreno, imune a veneno e sangramento' },
                    { nome: 'Âncora Emocional', desc: 'Força perto da âncora, resistência contra controle mental' },
                    { nome: 'Existência Incompleta', desc: 'Não sofre fadiga, pode resistir à destruição completa' }
                ]
            },
            {
                id: 'espirito',
                nome: 'Espírito',
                tipo: "Re'Geron",
                raridade: '🟠 LENDÁRIO',
                imagem: 'https://i.imgur.com/6zAbgHP.png',
                descricao: 'Os Formados da Harmonia. Emoções positivas intensas moldadas em forma elemental.',
                atributos: {
                    FOR: '3d4+6',
                    VIT: '4d6+10',
                    AGI: '5d8+12',
                    INT: '5d6+12',
                    PER: '5d8+10',
                    SOR: '4d20+20'
                },
                limite: 150,
                habilidades: [
                    { nome: 'Estado da Harmonia', desc: '+2 em suporte e proteção, anula efeito negativo leve' },
                    { nome: 'Estado da Fluidez', desc: 'Altera forma para se adaptar, ignora obstáculo ou condição' },
                    { nome: 'Estado da Inspiração', desc: 'Inspira aliados, pode elevar falha aliada à sucesso' }
                ]
            },
            {
                id: 'drakhen',
                nome: 'Drakhen',
                tipo: "Re'Geron",
                raridade: '🟠 LENDÁRIO',
                imagem: 'https://i.imgur.com/tfFHpEZ.png',
                descricao: 'Os Ancestrais. Raça que evolui em dois estágios através de eras e poder.',
                atributos: {
                    FOR: '6d8+15',
                    VIT: '6d8+15',
                    AGI: '3d6+8',
                    INT: '5d6+12',
                    PER: '5d6+10',
                    SOR: '4d20+20'
                },
                limite: 200,
                habilidades: [
                    { nome: 'Presença Dracônica', desc: 'Inimigos sofrem –3 Precisão, +3 em intimidação' },
                    { nome: 'Memória Ancestral', desc: '+3 em conhecimento histórico, +2 contra criaturas antigas' },
                    { nome: 'Ascensão Potencial', desc: '+1 Precisão/Evasão ao 50% PV, Arts custam –30%' }
                ]
            },
            {
                id: 'morvak',
                nome: 'Morvak',
                tipo: "Re'Geron",
                raridade: '🔴 MÍTICA',
                imagem: 'https://i.imgur.com/TEDrmlw.png',
                descricao: 'Os Nascidos do Medo. Entidades do terror primordial e do desconhecido.',
                atributos: {
                    FOR: '4d6+18',
                    VIT: '4d10+25',
                    AGI: '4d8+20',
                    INT: '4d6+18',
                    PER: '5d8+25',
                    SOR: '4d20+20'
                },
                limite: 200,
                habilidades: [
                    { nome: 'Núcleo do Presságio', desc: '+3 em intimidação e percepção' },
                    { nome: 'Núcleo da Distorção', desc: 'Bônus em esquiva, pode negar ação direta' },
                    { nome: 'Núcleo da Erosão', desc: 'Inimigos sofrem desgaste em falhas próximas' }
                ]
            },
            {
                id: 'dracolitos',
                nome: 'Dracólitos',
                tipo: "Re'Geron",
                raridade: '🔴 MÍTICA',
                imagem: 'https://i.imgur.com/543EZm2.png',
                descricao: 'Os Encarnados Elementais. Espíritos em perfeita ressonância elemental.',
                atributos: {
                    FOR: '4d10+30',
                    VIT: '4d10+30',
                    AGI: '4d10+30',
                    INT: '4d10+30',
                    PER: '4d10+30',
                    SOR: '3d20+40'
                },
                limite: 200,
                habilidades: [
                    { nome: 'Harmonia Primordial', desc: 'Bônus passivos constantes, suprime instabilidades' },
                    { nome: 'Estado da Transmissão', desc: 'Concede poderes a discípulos ou prepara sucessor' },
                    { nome: 'Ruptura Elemental', desc: 'Destruição causa desordem no elemento correspondente' }
                ]
            },
            {
                id: 'celestine',
                nome: 'Celestine',
                tipo: "Re'Geron",
                raridade: '🔴 MÍTICA',
                imagem: 'https://i.imgur.com/F99CkI4.png',
                descricao: 'Os Consagrados. Almas elevadas pelos deuses antigos, portadores de Propósito.',
                atributos: {
                    FOR: '3d20+35',
                    VIT: '3d20+35',
                    AGI: '3d20+35',
                    INT: '3d20+35',
                    PER: '3d20+35',
                    SOR: '3d20+40'
                },
                limite: 250,
                habilidades: [
                    { nome: 'Manifestação do Dogma', desc: '+3 em ações alinhadas ao Propósito' },
                    { nome: 'Manifestação da Autoridade', desc: 'Aura conceitual concede bônus a aliados' },
                    { nome: 'Manifestação da Ascensão', desc: 'Eleva Propósito a nível quase divino' }
                ]
            },
            {
                id: 'opharos',
                nome: 'Opharos',
                tipo: "Re'Geron",
                raridade: '🔴 MÍTICA',
                imagem: 'https://i.imgur.com/4egj34P.png',
                descricao: 'Os Observadores Pré-Doutrinários. Existem para observar a realidade sagrada.',
                atributos: {
                    FOR: '3d6+8',
                    VIT: '4d6+10',
                    AGI: '5d8+12',
                    INT: '6d6+15',
                    PER: '6d6+15',
                    SOR: '4d20+20'
                },
                limite: 200,
                habilidades: [
                    { nome: 'Olhar Revelador', desc: '+2 em Percepção, ignora ilusões' },
                    { nome: 'Asas Sensoriais', desc: '+2 Reação contra surpresa, detecta hostilidade' },
                    { nome: 'Consciência Gradual', desc: '+1 Precisão/Evasão ao subir Domínio de Art' }
                ]
            },
            {
                id: 'demonoid',
                nome: 'Demonoid',
                tipo: "Re'Geron",
                raridade: '🟠 LENDÁRIO',
                imagem: 'https://i.imgur.com/CqWi4r9.png',
                descricao: 'Os Demonoids são uma raça nativa de Sultran, nascidos da convergência entre energia caótica, desejo, dor e sobrevivência extrema. Diferente de outras raças infernais, os Demonoids evoluem ao abandonar a monstruosidade. Quanto mais humanoide se torna, sua forma mais estável, inteligente e poderosa a criatura se torna.\n\nA forma inicial de um Demonoid é bestial, instintiva e grotesca. No entanto, à medida que absorve energia, experiências ou outros seres infernais, sua estrutura se reorganiza, aproximando-se de um corpo humanoide. Esse processo não é apenas físico — é mental e espiritual. Tornar-se "mais humano" significa adquirir consciência, estratégia e controle absoluto do próprio poder.\n\nNo Inferno, a aparência não engana: quanto mais humano um Demonoid parece, mais perigoso ele é.',
                atributos: {
                    FOR: '5d8+14',
                    VIT: '5d8+12',
                    AGI: '4d8+12',
                    INT: '4d6+8',
                    PER: '4d6+10',
                    SOR: '4d20+20'
                },
                limite: 130,
                habilidades: [
                    { 
                        nome: 'Vetor da Assimilação', 
                        desc: 'Sempre que derrotar inimigos relevantes, o Demonoid pode absorver fragmentos de poder, recebendo bônus temporários ou evoluções graduais a critério do sistema.' 
                    },
                    { 
                        nome: 'Vetor da Forma', 
                        desc: 'O Demonoid pode alterar parcialmente sua forma para combate, defesa ou mobilidade. Quanto mais humanoide for sua forma base, maior o controle e menor o custo dessas alterações.' 
                    },
                    { 
                        nome: 'Vetor da Consciência', 
                        desc: 'O Demonoid recebe bônus em ações táticas, intimidação e uso consciente de poder. Uma vez por cena, pode antecipar uma ação inimiga, reduzindo seu impacto ou anulando vantagens.' 
                    }
                ]
            },
            {
                id: 'felaryn',
                nome: 'Felaryn (Felinos)',
                tipo: "Re'Geron",
                raridade: '🔵 COMUM',
                imagem: 'https://i.imgur.com/3fxrfD0.png',
                descricao: 'Os Felinos são predadores naturais que existem em inúmeras formas e tamanhos pelo mundo. De pequenos caçadores silenciosos das florestas até gigantes majestosos das planícies ou montanhas, todos compartilham o mesmo conjunto de instintos refinados que os tornam alguns dos caçadores mais eficientes da natureza.\n\nSeus corpos são construídos para velocidade, precisão e silêncio. Patas macias permitem movimentação quase inaudível, músculos flexíveis garantem saltos poderosos, e seus olhos adaptados à baixa luz permitem enxergar com clareza durante a noite ou em ambientes sombrios.\n\nEmbora sejam criaturas animais, muitos Felinos demonstram inteligência instintiva impressionante, aprendendo rapidamente padrões de caça, rotas de território e comportamento de presas. Alguns indivíduos mais antigos ou tocados pela magia do mundo podem desenvolver habilidades extraordinárias, tornando-se verdadeiras lendas entre as feras.',
                atributos: {
                    FOR: '4d6+10',
                    VIT: '4d6+10',
                    AGI: '5d8+14',
                    INT: '2d6+4',
                    PER: '5d8+14',
                    SOR: '5d20'
                },
                limite: 100,
                habilidades: [
                    { 
                        nome: 'Sentidos Aguçados', 
                        desc: 'Os Felinos possuem visão adaptada à penumbra, audição extremamente sensível e um olfato eficiente para detectar presas. Efeito: +2 em testes de Percepção, podem detectar movimentos ou presenças ocultas com maior facilidade, enxergam normalmente em ambientes de pouca luz.' 
                    },
                    { 
                        nome: 'Corpo Flexível', 
                        desc: 'A estrutura corporal dos Felinos é extremamente flexível e adaptada para saltos, escaladas e movimentos rápidos. Efeito: bônus em movimento, escalada e salto, recebem redução de dano em quedas moderadas.' 
                    },
                    { 
                        nome: 'Instinto Territorial', 
                        desc: 'Felinos possuem forte instinto de território e sobrevivência, reagindo rapidamente a invasores ou ameaças. Efeito: bônus em rastreamento e caça dentro de seu território, vantagem narrativa ao identificar rotas, esconderijos ou presas.' 
                    }
                ]
            },
            {
                id: 'necrofago',
                nome: 'Necrófago (Morto Vivo)',
                tipo: "Re'Geron",
                raridade: '🟢 RARO',
                imagem: 'https://i.imgur.com/KuHj0g6.png',
                descricao: 'Necrófagos são seres que atravessaram a fronteira da morte e retornaram ao mundo material. Diferente de cadáveres animados sem mente, eles preservam consciência, memória ou ao menos fragmentos de quem foram em vida. Sua existência é sustentada por energia necromântica, maldições antigas ou uma vontade de existir tão intensa que se recusa a desaparecer.\n\nFisicamente, os Necrófagos variam bastante. Alguns mantêm aparência quase intacta, apenas com pele pálida e olhos opacos, enquanto outros exibem sinais claros de decomposição, ossos aparentes ou marcas de rituais que os trouxeram de volta. O tempo afeta seus corpos de forma diferente das raças vivas: eles não envelhecem da mesma forma, mas também nunca estão completamente livres da deterioração.\n\nEntre os mortos-vivos conscientes, os Necrófagos são considerados o primeiro estágio de uma existência além da morte. Com o passar dos anos, energia suficiente ou rituais específicos podem transformá-los em entidades mais poderosas como Wights, Vampiros, Dullahans ou até mesmo Liches.',
                atributos: {
                    FOR: '4d6+10',
                    VIT: '5d6+14',
                    AGI: '3d6+8',
                    INT: '4d6+10',
                    PER: '4d6+10',
                    SOR: '5d20'
                },
                limite: 120,
                habilidades: [
                    { 
                        nome: 'Persistência da Morte', 
                        desc: 'O corpo de um Necrófago não reage à dor ou fadiga da mesma forma que os vivos. Mesmo gravemente danificado, ele continua se movendo impulsionado pela energia necromântica que sustenta sua existência. Bônus: Ignora penalidades leves de dor, exaustão ou sangramento. Uma vez por cena, ao receber dano que normalmente o derrubaria, o Necrófago pode permanecer ativo por mais uma ação antes de cair.' 
                    },
                    { 
                        nome: 'Essência Necromântica', 
                        desc: 'A energia que sustenta o Necrófago reage naturalmente à magia da morte, espíritos e forças do além. Bônus: Recebe +2 em rolagens relacionadas a necromancia, espíritos ou magia sombria. Além disso, possui resistência natural contra efeitos de medo sobrenatural.' 
                    },
                    { 
                        nome: 'Eco da Existência', 
                        desc: 'Fragmentos da vida passada ainda ecoam dentro da mente do Necrófago. Esses vestígios podem surgir como lembranças repentinas, reflexos de habilidade ou impulsos instintivos. Bônus: Uma vez por cena, o jogador pode re-rolar um teste de perícia ou ação técnica, representando uma memória esquecida que retorna no momento necessário.' 
                    }
                ]
            },
            {
                id: 'mythar',
                nome: 'Mythar (Bestas Fantásticas)',
                tipo: "Re'Geron",
                raridade: '🟣 ÉPICA',
                imagem: 'https://i.imgur.com/qZUJGy2.png',
                descricao: 'Os Mythar são criaturas nascidas da própria essência da magia que permeia o mundo. Diferente de animais comuns, sua existência está profundamente ligada às forças sobrenaturais da natureza e às correntes arcanas que moldam a realidade.\n\nEssas criaturas podem assumir inúmeras formas: algumas possuem asas gigantescas, outras combinam partes de diferentes animais, enquanto certas linhagens manifestam habilidades mágicas naturais desde o nascimento.\n\nGrifos dominam os céus, quimeras caminham como monstros híbridos de pura força, mantícoras espalham terror pelas planícies, e basiliscos carregam poderes capazes de petrificar seus inimigos. Apesar das diferenças físicas, todos pertencem à mesma categoria fundamental de seres mágicos vivos.\n\nA presença de um Mythar costuma alterar o ambiente ao seu redor. Florestas podem se tornar mais densas, ventos mais fortes, ou a própria terra reagir à energia que essas criaturas carregam.',
                atributos: {
                    FOR: '5d8+12',
                    VIT: '5d8+12',
                    AGI: '4d8+10',
                    INT: '3d6+8',
                    PER: '5d8+12',
                    SOR: '5d20'
                },
                limite: 150,
                habilidades: [
                    { 
                        nome: 'Essência Mágica', 
                        desc: 'Mythar são naturalmente conectados às energias mágicas do mundo. Efeito: resistência natural contra efeitos mágicos fracos (+1), bônus em testes envolvendo magia ou fenômenos arcanos (+3).' 
                    },
                    { 
                        nome: 'Presença Primordial', 
                        desc: 'A presença de uma Besta Fantástica impõe respeito ou medo nas criaturas ao redor. Efeito: criaturas comuns podem demonstrar hesitação ou cautela, bônus narrativo em intimidação contra criaturas menores (+3).' 
                    },
                    { 
                        nome: 'Corpo Sobrenatural', 
                        desc: 'O corpo de um Mythar é mais resistente que o de animais normais. Efeito: leve resistência contra dano físico e elemental (+20% Defesa), maior tolerância a ambientes hostis.' 
                    }
                ]
            },
            {
                id: 'lithor',
                nome: 'Lithor (Golem)',
                tipo: "Re'Geron",
                raridade: '🟢 RARO',
                imagem: 'https://i.imgur.com/67FAioa.png',
                descricao: 'Os Lithor são entidades vivas formadas a partir da própria matéria do mundo. Diferente de construtos artificiais, eles nascem quando energia primordial se acumula por eras dentro de montanhas, cavernas profundas ou veios minerais extremamente antigos.\n\nSeus corpos são compostos por rocha viva, cristais naturais ou ligas minerais raras. Alguns possuem aparência humanoide, enquanto outros lembram estátuas vivas esculpidas pelo tempo. Seus movimentos são pesados, porém firmes, e cada passo parece ecoar a força das profundezas da terra.\n\nA mente de um Lithor costuma ser paciente e lenta, refletindo a própria natureza da pedra. Eles não são impulsivos e raramente agem sem ponderar. Para muitos povos, Lithor são vistos como guardiões naturais de cavernas, montanhas e territórios ancestrais.\n\nCom o passar de séculos, alguns Lithor evoluem para formas ainda mais poderosas, incorporando metais raros, cristais mágicos ou magma vivo em sua estrutura.',
                atributos: {
                    FOR: '5d8+14',
                    VIT: '6d8+16',
                    AGI: '2d4+4',
                    INT: '3d6+8',
                    PER: '4d6+10',
                    SOR: '5d20'
                },
                limite: 120,
                habilidades: [
                    { 
                        nome: 'Corpo Mineral', 
                        desc: 'O corpo do Lithor é formado por rocha viva extremamente resistente. Efeito: redução passiva de dano físico leve (-20%), resistência natural contra empurrões e impactos.' 
                    },
                    { 
                        nome: 'Peso da Montanha', 
                        desc: 'A estrutura do Lithor é extremamente pesada e estável. Efeito: dificilmente pode ser derrubado ou deslocado (Obstáculo -15), bônus em testes de resistência física (+5).' 
                    },
                    { 
                        nome: 'Sentido Geológico', 
                        desc: 'Lithor conseguem sentir vibrações através do solo. Efeito: podem detectar movimentos no chão próximos, bônus em percepção subterrânea ou cavernas.' 
                    }
                ]
            }
        ];
    }

    /**
     * Abrir seletor de raça
     */
    abrirSeletorRaca(event) {
        event.preventDefault();
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Usar array de raças da classe
        const racas = this.racas;
        
        // Tipos disponíveis
        const tipos = ["Re'Geron", "The Chaotical Gate", "Wuxia/Xianxia", "One Piece", "Bleach", "A Crônica dos Varkhan"];
        let tipoSelecionado = "Re'Geron"; // Padrão

        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'comp-raca-overlay';
        
        // Função para renderizar cards
        const renderizarCards = (tipoFiltro) => {
            const gridContainer = overlay.querySelector('.comp-raca-grid');
            if (!gridContainer) return;
            
            const racasFiltradas = racas.filter(r => (r.tipo || "Re'Geron") === tipoFiltro);
            
            gridContainer.innerHTML = '';
            
            if (racasFiltradas.length === 0) {
                gridContainer.innerHTML = '<p class="comp-raca-sem-resultados">Nenhuma raça disponível para este tipo</p>';
                return;
            }
            
            racasFiltradas.forEach(raca => {
                const card = document.createElement('div');
                card.className = 'comp-raca-card';
                card.setAttribute('data-raca-id', raca.id);
                card.setAttribute('data-raca-nome', raca.nome);
                card.innerHTML = `
                    <div class="comp-raca-card-imagem">
                        <img src="${raca.imagem}" alt="${raca.nome}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22250%22%3E%3Crect fill=%22%23333%22 width=%22200%22 height=%22250%22/%3E%3C/svg%3E'">
                        <span class="comp-raca-raridade">${raca.raridade}</span>
                    </div>
                    <div class="comp-raca-card-botoes">
                        <button class="comp-raca-btn-selecionar" data-raca-id="${raca.id}">✓ Selecionar</button>
                        <button class="comp-raca-btn-detalhes" data-raca-id="${raca.id}">ℹ Detalhes</button>
                    </div>
                    <div class="comp-raca-card-nome">${raca.nome}</div>
                `;
                
                // Eventos para os botões
                card.querySelector('.comp-raca-btn-selecionar').addEventListener('click', (e) => {
                    const racaId = e.currentTarget.getAttribute('data-raca-id');
                    const racaSelecionada = racas.find(r => r.id === racaId);
                    if (racaSelecionada) {
                        this.selecionarRaca(racaId, racaSelecionada.nome);
                        overlay.remove();
                    }
                });
                
                card.querySelector('.comp-raca-btn-detalhes').addEventListener('click', (e) => {
                    const racaId = e.currentTarget.getAttribute('data-raca-id');
                    const racaSelecionada = racas.find(r => r.id === racaId);
                    if (racaSelecionada) {
                        this.mostrarDetalhesRaca(racaSelecionada);
                    }
                });
                
                gridContainer.appendChild(card);
            });
        };
        
        // HTML inicial com filtro de tipos
        let html = `
            <div class="comp-raca-modal">
                <div class="comp-raca-header">
                    <h2>Selecione uma Raça</h2>
                    <button class="comp-raca-fechar">✕</button>
                </div>
                
                <!-- Filtro de Tipos -->
                <div class="comp-raca-filtro-tipos">
                    <label class="comp-raca-filtro-label">Filtrar por Tipo:</label>
                    <div class="comp-raca-filtro-botoes">
        `;
        
        tipos.forEach(tipo => {
            const isActive = tipo === tipoSelecionado ? 'active' : '';
            html += `<button class="comp-raca-filtro-btn ${isActive}" data-tipo="${tipo}">${tipo}</button>`;
        });
        
        html += `
                    </div>
                </div>
                
                <div class="comp-raca-grid">
                </div>
            </div>
        `;

        overlay.innerHTML = html;
        document.body.appendChild(overlay);
        
        // Renderizar cards iniciais
        renderizarCards(tipoSelecionado);

        // Event listener para fechar
        overlay.querySelector('.comp-raca-fechar').addEventListener('click', () => overlay.remove());
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        
        // Event listeners para filtros de tipo
        overlay.querySelectorAll('.comp-raca-filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.currentTarget.getAttribute('data-tipo');
                tipoSelecionado = tipo;
                
                // Atualizar botões ativos
                overlay.querySelectorAll('.comp-raca-filtro-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                
                // Renderizar cards do novo tipo
                renderizarCards(tipo);
            });
        });
    }

    /**
     * Mostrar detalhes da raça
     */
    mostrarDetalhesRaca(raca) {
        const overlay = document.createElement('div');
        overlay.className = 'comp-raca-overlay comp-raca-overlay-detalhes';
        
        let habilidadesHtml = '';
        raca.habilidades.forEach((hab, idx) => {
            habilidadesHtml += `
                <div class="comp-raca-detalhe-habilidade">
                    <h4>[${idx + 1}] ${hab.nome}</h4>
                    <p>${hab.desc}</p>
                </div>
            `;
        });

        let atributosHtml = '';
        Object.entries(raca.atributos).forEach(([attr, valor]) => {
            atributosHtml += `<div class="comp-raca-detalhe-attr"><strong>${attr}</strong>: ${valor}</div>`;
        });

        const html = `
            <div class="comp-raca-modal comp-raca-modal-detalhes">
                <div class="comp-raca-detalhe-header">
                    <h2>${raca.nome}</h2>
                    <span class="comp-raca-detalhe-raridade">${raca.raridade}</span>
                    <button class="comp-raca-fechar">✕</button>
                </div>
                
                <div class="comp-raca-detalhe-corpo">
                    <div class="comp-raca-detalhe-imagem">
                        <img src="${raca.imagem}" alt="${raca.nome}">
                    </div>
                    
                    <div class="comp-raca-detalhe-conteudo">
                        <h3>📖 Descrição</h3>
                        <p>${raca.descricao}</p>
                        
                        <h3>💪 Atributos</h3>
                        <div class="comp-raca-detalhe-atributos">
                            ${atributosHtml}
                        </div>
                        
                        <h3>🎯 Limite de Atributo: ${raca.limite}</h3>
                        
                        <h3>⚡ Habilidades Raciais</h3>
                        <div class="comp-raca-detalhe-habilidades">
                            ${habilidadesHtml}
                        </div>
                    </div>
                </div>
                
                <div class="comp-raca-detalhe-rodape">
                    <button class="comp-raca-btn-voltar">← Voltar</button>
                </div>
            </div>
        `;

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        overlay.querySelector('.comp-raca-fechar').addEventListener('click', () => overlay.remove());
        overlay.querySelector('.comp-raca-btn-voltar').addEventListener('click', () => overlay.remove());
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    /**
     * Selecionar raça
     */
    selecionarRaca(racaId, racaNome) {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Mapear IDs para display
        const displayNames = {
            'mamiferos': '👤 Mamíferos',
            'batrakos': '🐸 Batrakos',
            'khrull': '🦗 Khrull',
            'repteis': '🦎 Répteis',
            'umbros': '👻 Umbros',
            'fantasmas': '👤 Fantasmas',
            'espirito': '✨ Espírito',
            'drakhen': '🐉 Drakhen',
            'morvak': '🌑 Morvak',
            'dracolitos': '⚡ Dracólitos',
            'celestine': '☀️ Celestine',
            'opharos': '👁️ Opharos',
            'demonoid': '😈 Demonoid',
            'felaryn': '🐱 Felaryn',
            'necrofago': '💀 Necrófago',
            'mythar': '🦅 Mythar',
            'lithor': '🪨 Lithor'
        };

        // Atualizar botão de raça
        const btnRaca = modal.querySelector('#comp-char-raca-btn');
        const displayRaca = modal.querySelector('#comp-char-raca-display');
        
        if (btnRaca && displayNames[racaId]) {
            btnRaca.setAttribute('data-raca', racaId);
            displayRaca.textContent = displayNames[racaId];
        }

        console.log(`✅ Raça selecionada: ${racaNome}`);
    }

    /**
     * Configurar sistema de abas
     */
    configurarAbas() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // ✅ USAR EVENT DELEGATION em vez de listeners individuais
        // Isso evita problemas de closure e funciona melhor com modals que abrem/fecham múltiplas vezes
        
        modal.addEventListener('click', (e) => {
            const btnClicado = e.target.closest('.modal-aba-btn');
            
            if (!btnClicado) return; // Não era um botão de aba
            
            e.preventDefault();
            e.stopPropagation();
            
            const abaAtiva = btnClicado.getAttribute('data-aba');
            console.log(`📌 [configurarAbas] Clique em aba via event delegation: ${abaAtiva}`);
            
            // Obter referencias frescas dos elementos
            const abaBotoes = modal.querySelectorAll('.modal-aba-btn');
            const abaConteudos = modal.querySelectorAll('.modal-aba-conteudo');

            // Remover classe ativa de todos
            abaBotoes.forEach(b => b.classList.remove('modal-aba-btn--ativo'));
            abaConteudos.forEach(c => c.style.display = 'none');

            // Ativar selecionada
            btnClicado.classList.add('modal-aba-btn--ativo');
            const conteudo = modal.querySelector(`.modal-aba-conteudo[data-aba="${abaAtiva}"]`);
            if (conteudo) {
                conteudo.style.display = 'block';
                console.log(`✅ Aba "${abaAtiva}" exibida`);
            } else {
                console.warn(`❌ Conteúdo da aba "${abaAtiva}" não encontrado`);
            }
            
            // Se é a aba de aptidões, re-renderizar vantagens
            if (abaAtiva === 'aptidoes') {
                const companheiroId = window.companheirosManager?.companheiroEmEdicao;
                console.log('📖 [configurarAbas] Voltou à aba de aptidões, companheiroEmEdicao:', companheiroId);
                
                if (companheiroId) {
                    // ✅ FIX: Tentar múltiplas formas de recuperar o companheiro
                    let companheiro = null;
                    
                    // Tentar getCompanheiroById primeiro
                    if (typeof window.companheirosManager?.getCompanheiroById === 'function') {
                        companheiro = window.companheirosManager.getCompanheiroById(companheiroId);
                    }
                    
                    // Fallback: tentar obterPorId
                    if (!companheiro && typeof window.companheirosManager?.obterPorId === 'function') {
                        companheiro = window.companheirosManager.obterPorId(companheiroId);
                    }
                    
                    // Fallback: usar window.companheiro_temp se tiver
                    if (!companheiro && window.companheiro_temp) {
                        companheiro = window.companheiro_temp;
                    }
                    
                    if (companheiro) {
                        console.log('✅ [configurarAbas] Companheiro encontrado, re-renderizando vantagens...');
                        this.renderizarVantagensDesbloqueadas(companheiro);
                    } else {
                        console.warn('⚠️ [configurarAbas] Nenhuma forma de recuperar companheiro funcionou');
                    }
                } else {
                    console.warn('⚠️ [configurarAbas] companheiroEmEdicao não definido');
                }
            }
        });
        
        console.log('✅ Event delegation configurado para abas');
    }

    /**
     * Resetar abas para primeira aba ativa (chamado ao abrir modal)
     */
    resetarAbas() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const abaBotoes = modal.querySelectorAll('.modal-aba-btn');
        const abaConteudos = modal.querySelectorAll('.modal-aba-conteudo');

        console.log(`🔄 [resetarAbas] Total de botões: ${abaBotoes.length}, conteúdos: ${abaConteudos.length}`);

        // Remove classe ativa de todos os botões
        abaBotoes.forEach((b, idx) => {
            b.classList.remove('modal-aba-btn--ativo');
        });

        // Esconde todos os conteúdos
        abaConteudos.forEach((c, idx) => {
            c.style.display = 'none';
        });

        // Ativa a primeira aba e seu conteúdo
        if (abaBotoes.length > 0) {
            abaBotoes[0].classList.add('modal-aba-btn--ativo');
            const primeiraAba = abaBotoes[0].getAttribute('data-aba');
            console.log(`✅ [resetarAbas] Botão resetado para: ${primeiraAba}`);
        }

        if (abaConteudos.length > 0) {
            abaConteudos[0].style.display = 'block';
            const primeiraAbaConteudo = abaConteudos[0].getAttribute('data-aba');
            console.log(`✅ [resetarAbas] Conteúdo resetado para: ${primeiraAbaConteudo}`);
        }
    }

    /**
     * Configurar preview de imagem - NOVOS IDS
     */
    configurarPreviewImagem() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const inputUrl = modal.querySelector('#comp-char-imagem-url');
        const inputUpload = modal.querySelector('#comp-char-imagem-upload');
        const preview = modal.querySelector('#comp-char-imagem-preview');

        if (!preview) return;

        const atualizarPreview = (src) => {
            preview.innerHTML = `<img src="${src}" alt="Companheiro" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\'comp-imagem-placeholder\'>🐾</div>'">`;
        };

        if (inputUrl) {
            inputUrl.addEventListener('change', (e) => {
                if (e.target.value) {
                    atualizarPreview(e.target.value);
                }
            });

            inputUrl.addEventListener('blur', (e) => {
                if (e.target.value) {
                    atualizarPreview(e.target.value);
                }
            });
        }

        if (inputUpload) {
            inputUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        atualizarPreview(event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    /**
     * Configurar tabs de imagem - NOVOS IDS
     */
    configurarTabsImagem() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const urlTab = modal.querySelector('#comp-char-imagem-url-tab');
        const uploadTab = modal.querySelector('#comp-char-imagem-upload-tab');
        const urlInput = modal.querySelector('#comp-char-imagem-url');
        const uploadInput = modal.querySelector('#comp-char-imagem-upload');

        if (urlTab && uploadTab && urlInput && uploadInput) {
            urlTab.addEventListener('change', () => {
                urlInput.style.display = 'block';
                uploadInput.style.display = 'none';
            });

            uploadTab.addEventListener('change', () => {
                urlInput.style.display = 'none';
                uploadInput.style.display = 'block';
            });
        }
    }

    /**
     * Abrir modal para novo companheiro
     */
    abrirModal() {
        this.modoVisualizacao = false;
        window.companheirosManager.companheiroEmEdicao = null;
        window.companheiro_temp = null;
        
        // ✨ NOVO: Inicializar companheiroData com estrutura padrão para novo companheiro
        window.companheiroData = {
            id: null,
            nome: 'Novo Companheiro',
            atributos: {
                forca: { total: 0 },
                vitalidade: { total: 0 },
                agilidade: { total: 0 },
                inteligencia: { total: 0 },
                percepcao: { total: 0 },
                sorte: { total: 0 }
            },
            inventario: { itens: [], armazenamentos: [] }
        };
        
        const modal = document.getElementById(this.modalId);
        if (modal) {
            console.log('🧹 LIMPEZA NUCLEAR COMPLETA NO ABRIR...');
            
            // =============== 1. LIMPAR CAMPOS DE ENTRADA ===============
            // 1.1 Zerar TODOS os inputs
            modal.querySelectorAll('input').forEach(inp => {
                if (inp.type === 'checkbox' || inp.type === 'radio') {
                    inp.checked = false;
                } else if (inp.type === 'number') {
                    // Para inputs number, zerar o value
                    inp.value = '0';
                    // E remover qualquer atributo data que possa ter valor default
                    inp.removeAttribute('data-value');
                } else {
                    inp.value = '';
                }
            });
            
            // 1.2 Zerar TODOS os textareas
            modal.querySelectorAll('textarea').forEach(ta => {
                ta.value = '';
            });
            
            // 1.3 Zerar TODOS os selects
            modal.querySelectorAll('select').forEach(sel => {
                sel.value = '';
            });
            
            // 1.4 Limpar atributos que possam ter valores residuais
            modal.querySelectorAll('[data-value]').forEach(el => {
                el.removeAttribute('data-value');
            });
            
            // 1.5 EXTRA: Zerar explicitamente inputs number com value padrão
            modal.querySelectorAll('input[type="number"]').forEach(inp => {
                inp.value = '0';
            });
            
            // 1.6 EXTRA: Desativar todos os radio buttons que possam estar checked
            modal.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
            
            // =============== 2. LIMPAR DISPLAY DE VALORES ===============
            // 2.1 Zerar displays de atributos e totais
            const elementsToZero = [
                // Total e Sorte
                '#comp-char-total-base',
                '#comp-char-sorte-total',
                '#comp-nivel-display',
                '#comp-nome-display',
                '#comp-char-pontos-display',
                // Atributos primários
                '#comp-char-forca-total',
                '#comp-char-forca-bonus',
                '#comp-char-vitalidade-total',
                '#comp-char-vitalidade-bonus',
                '#comp-char-agilidade-total',
                '#comp-char-agilidade-bonus',
                '#comp-char-inteligencia-total',
                '#comp-char-inteligencia-bonus',
                '#comp-char-sabedoria-total',
                '#comp-char-sabedoria-bonus',
                '#comp-char-carisma-total',
                '#comp-char-carisma-bonus',
                // Aptidões
                '#comp-aptidoes-atual',
                '#comp-aptidoes-ganhas',
                '#comp-aptidoes-maximo',
                '#comp-aptidoes-atributo-proxima'
            ];
            
            elementsToZero.forEach(selector => {
                const el = modal.querySelector(selector);
                if (el) el.textContent = '0';
            });
            
            // 2.2 Limpar imagem preview
            const imagePreview = modal.querySelector('#comp-char-imagem-preview');
            if (imagePreview) {
                imagePreview.innerHTML = '<div class="comp-imagem-placeholder">🐾</div>';
            }
            
            // 2.3 Resetar tipo selecionado
            const tipoButtons = modal.querySelectorAll('.comp-tipo-btn');
            tipoButtons.forEach(btn => btn.classList.remove('ativo'));
            
            // =============== 3. LIMPAR CONTAINERS DE LISTAS ===============
            const containers = [
                '#inventario-itens-list',
                '#inventario-armazenamentos-list',
                '#companheiro-armazenamentos-lista',
                '#comp-aptidoes-personagem-list',
                '#comp-aptidoes-vantagens-list',
                '#companheiro-arts-stats-panel',
                '#comp-skills',
                '#comp-habilidades-list',
                '#comp-arts-list'
            ];
            containers.forEach(sel => {
                const el = modal.querySelector(sel);
                if (el) el.innerHTML = '';
            });
            
            // =============== 4. LIMPAR ESTADOS DE ABAS ===============
            // Resetar para primeira aba (Características)
            const abaBotoes = modal.querySelectorAll('.modal-aba-btn');
            abaBotoes.forEach(btn => btn.classList.remove('modal-aba-btn--ativo'));
            if (abaBotoes.length > 0) {
                abaBotoes[0].classList.add('modal-aba-btn--ativo');
            }
            
            // Mostrar apenas aba de características
            const abaConteudos = modal.querySelectorAll('.modal-aba-conteudo');
            abaConteudos.forEach(aba => {
                if (aba.getAttribute('data-aba') === 'caracteristicas') {
                    aba.style.display = 'block';
                } else {
                    aba.style.display = 'none';
                }
            });
            
            // =============== 5. LIMPAR BARRAS DE STATUS ===============
            ['saude', 'energia', 'fadiga'].forEach(barra => {
                const barrEl = modal.querySelector(`#comp-char-${barra}-barra`);
                if (barrEl) {
                    const fill = barrEl.querySelector('.comp-barra-fill');
                    if (fill) fill.style.width = '0%';
                }
            });
            
            // =============== 6. ZERAR COMPLETAMENTE TODOS OS VALORES ===============
            // Zerar saúde, energia, fadiga (NÃO usar padrão de 100)
            ['saude', 'energia', 'fadiga'].forEach(barra => {
                const inputMaxima = modal.querySelector(`#comp-char-${barra}-maxima`);
                if (inputMaxima) inputMaxima.value = '0';
                const inputAtual = modal.querySelector(`#comp-char-${barra}-atual`);
                if (inputAtual) inputAtual.value = '0';
            });
            
            // Nível = 0 (completamente zerado)
            const inputNivel = modal.querySelector('#comp-char-nivel-input');
            if (inputNivel) inputNivel.value = '0';
            
            // Zerar experiência
            const inputExp = modal.querySelector('#comp-char-experiencia');
            if (inputExp) inputExp.value = '0';
            
            // Tipo padrão = (nenhum selecionado)
            const inputTipo = modal.querySelector('#comp-char-tipo');
            if (inputTipo) inputTipo.value = '';
            
            // =============== 7. LIMPAR CAMPOS DO INVENTÁRIO ===============
            // Zerar campos que podem ter value="1" por padrão
            const inventarioFields = [
                '#companheiro-item-nivel',
                '#companheiro-item-quantidade',
                '#companheiro-armazenamento-bonus-espaco'
            ];
            inventarioFields.forEach(sel => {
                const el = modal.querySelector(sel);
                if (el) el.value = '0';
            });
            
            console.log('✅ LIMPEZA NUCLEAR COMPLETA CONCLUÍDA AO ABRIR!');
        }
        
        this.atualizarMaximoStatus();
        this.atualizarInfoAptidoesCompanheiro();
        this.atualizarAtributosAbaHabilidades();
        
        // ✨ NOVO: Atualizar displays de atributos (Total e Bonus) iniciais
        this.atualizarDisplaysAtributos();
        
        // ✨ NOVO: Sincronizar companheiroData com os valores do modal ANTES de renderizar arts
        this.sincronizarCompanheiroDataDoModal();
        
        // 🧹 LIMPEZA ADICIONAL: Renderizar listas vazias
        this.limparListasAbaAptidoes();
        
        // 🧹 LIMPEZA ADICIONAL: Limpar inventário
        if (window.companheiroInventarioModal) {
            window.companheiroInventarioModal.limparInventario();
            console.log('   ✅ Inventário limpo');
        }
        
        // 🧹 LIMPEZA ADICIONAL: Limpar itens e armazenamentos
        if (window.companheiroInventarioUI) {
            window.companheiroInventarioUI.limparItens();
            window.companheiroInventarioUI.limparArmazenamentos();
            window.companheiroInventarioUI.renderPainelEspaco();
            console.log('   ✅ Itens, armazenamentos e painel de espaço limpos/atualizados');
        }
        
        if (window.companheiroArtsSystem) {
            const modal = document.getElementById(this.modalId);
            const companheiroPadrao = { arts: [], habilidades: [] };
            window.companheiroArtsSystem.atualizarStatsPanel(companheiroPadrao, modal);
        }
        
        // ✨ NOVO: Renderizar vantagens desbloqueadas (mesmo que vazio, mostra a seção)
        const companheiroPadrao = { 
            id: null, 
            nome: 'Novo Companheiro',
            aptidoes: [],
            arts: [],
            habilidades: []
        };
        this.renderizarVantagensDesbloqueadas(companheiroPadrao);
        
        // 🔧 RESETAR ABAS PARA A PRIMEIRA ANTES DE MOSTRAR
        this.resetarAbas();
        
        this.mostrarModal();
        
        const titulo = document.getElementById('modalNovoCompanheiro')?.querySelector('.modal-title');
        if (titulo) titulo.textContent = '🐾 Novo Companheiro';

        const btnSalvar = document.getElementById('btn-modal-companheiro-salvar');
        if (btnSalvar) {
            btnSalvar.style.display = 'inline-block';
            btnSalvar.textContent = 'Salvar Companheiro';
        }
    }

    /**
     * Abrir modal em modo visualização
     */
    async abrirModalVisualizacao(companheiro) {
        this.modoVisualizacao = true;
        
        // 🔥 FIX: Garantir que companheiroEmEdicao está setado para visualização também
        if (companheiro?.id && !window.companheirosManager?.companheiroEmEdicao) {
            window.companheirosManager.companheiroEmEdicao = companheiro.id;
            console.log('🔧 [abrirModalVisualizacao] companheiroEmEdicao setado para:', companheiro.id);
        }
        
        await this.preencherFormulario(companheiro);
        
        // 🔥 RENDERIZAR VANTAGENS DESBLOQUEADAS (também necessário em visualização)
        this.renderizarVantagensDesbloqueadas(companheiro);
        
        this.desabilitarInputs();
        
        // 🔧 RESETAR ABAS PARA A PRIMEIRA ANTES DE MOSTRAR
        this.resetarAbas();
        
        this.mostrarModal();

        const titulo = document.getElementById('modalNovoCompanheiro')?.querySelector('.modal-title');
        if (titulo) titulo.textContent = `👁️ Visualizando: ${companheiro.nome}`;

        const btnSalvar = document.getElementById('btn-modal-companheiro-salvar');
        if (btnSalvar) {
            btnSalvar.style.display = 'none';
        }
    }

    /**
     * Abrir modal em modo edição
     */
    async abrirModalEdicao(companheiro) {
        console.log('🟠 INICIANDO abrirModalEdicao COM:', companheiro);
        
        // ✅ VALIDAÇÃO: Verificar se companheiro existe
        if (!companheiro) {
            console.error('❌ Companheiro é null/undefined - não é possível abrir modal');
            return;
        }
        
        console.log('🟠 companheiro.id =', companheiro.id);
        console.log('🟠 typeof companheiro.id =', typeof companheiro.id);
        
        // ✅ DEFENSIVE: Se companheiro.id é null/undefined, não podemos editar!
        // Mas vamos usar como fallback
        if (companheiro && companheiro.id) {
            this.modoVisualizacao = false;
            
            // ✅ CRÍTICO: SetarcompanheiroEmEdicao ANTES de preencher
            console.log('🟠 ANTES de setar, companheiroEmEdicao =', window.companheirosManager.companheiroEmEdicao);
            window.companheirosManager.companheiroEmEdicao = companheiro.id;
            console.log('🟠 DEPOIS de setar, companheiroEmEdicao =', window.companheirosManager.companheiroEmEdicao);
        } else {
            console.warn('⚠️ companheiro.id é null/undefined, não foi possível setar companheiroEmEdicao');
            // Fallback: usar o ID passado como parâmetro se houver
            if (window.companheirosManager.companheiroEmEdicao) {
                console.log('ℹ️ Usando companheiroEmEdicao existente:', window.companheirosManager.companheiroEmEdicao);
            }
        }
        
        await this.preencherFormulario(companheiro);
        console.log('🟠 DEPOIS de preencherFormulario, companheiroEmEdicao =', window.companheirosManager.companheiroEmEdicao);

        // 🔥 RENDERIZAR VANTAGENS DESBLOQUEADAS (bug fix - não estava sendo renderizado ao editar)
        this.renderizarVantagensDesbloqueadas(companheiro);
        console.log('✅ Vantagens desbloqueadas renderizadas ao editar');

        // 🔥 CARREGAR ESTADO DE BONUS-OPCIONAL DO COMPANHEIRO
        try {
            if (window.bonusOpcionalCompanheiro && typeof window.bonusOpcionalCompanheiro.carregarEstado === 'function') {
                window.bonusOpcionalCompanheiro.carregarEstado(companheiro.id);
                console.log(`✅ Estado de bonus-opcional carregado para companheiro ${companheiro.id}`);
            }
        } catch (e) {
            console.warn('⚠️ Erro ao carregar estado de bonus-opcional:', e.message);
        }
        
        this.habilitarInputs();
        console.log('🟠 DEPOIS de habilitarInputs, companheiroEmEdicao =', window.companheirosManager.companheiroEmEdicao);
        
        // 🔧 RESETAR ABAS PARA A PRIMEIRA ANTES DE MOSTRAR
        this.resetarAbas();
        
        this.mostrarModal();
        console.log('🟠 DEPOIS de mostrarModal, companheiroEmEdicao =', window.companheirosManager.companheiroEmEdicao);

        const titulo = document.getElementById('modalNovoCompanheiro')?.querySelector('.modal-title');
        if (titulo) titulo.textContent = `✏️ Editando: ${companheiro.nome}`;

        const btnSalvar = document.getElementById('btn-modal-companheiro-salvar');
        if (btnSalvar) {
            btnSalvar.style.display = 'inline-block';
            btnSalvar.textContent = 'Salvar Alterações';
        }
        
        console.log('🟠 abrirModalEdicao FINALIZADO, companheiroEmEdicao =', window.companheirosManager.companheiroEmEdicao);
    }

    /**
     * Mostrar modal
     */
    mostrarModal() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // 🔄 Recachear elementos quando modal abre
            // Isso é SEGURO pois apenas atualiza referências, não toca em listeners
            if (window.companheiroInventarioUI && typeof window.companheiroInventarioUI.recachearElementos === 'function') {
                console.log('🔄 Recacheando elementos do inventário ao abrir modal...');
                window.companheiroInventarioUI.recachearElementos();
            }
        }
    }

    /**
     * Fechar modal
     */
    fecharModal() {
        console.log('🔴 fecharModal CHAMADO! LIMPANDO TUDO AGORA!');
        
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // 🧹 LIMPEZA NUCLEAR - FORÇA TOTAL
            console.log('🧹 INICIANDO LIMPEZA NUCLEAR...');
            
            // 1. Zerar TODOS os inputs
            modal.querySelectorAll('input').forEach(inp => {
                if (inp.type === 'checkbox' || inp.type === 'radio') inp.checked = false;
                else inp.value = '';
            });
            
            // 2. Zerar TODOS os textareas
            modal.querySelectorAll('textarea').forEach(ta => ta.value = '');
            
            // 3. Zerar TODOS os selects
            modal.querySelectorAll('select').forEach(sel => sel.value = '');
            
            // 4. Zerar TODOS os spans/divs com conteúdo
            modal.querySelectorAll('span, div').forEach(el => {
                if (el.id && (el.id.includes('total') || el.id.includes('bonus') || el.id.includes('display') || el.id.includes('valor'))) {
                    el.textContent = '';
                }
            });
            
            // 5. Limpar containers específicos
            const containers = [
                '#inventario-itens-list',
                '#comp-aptidoes-vantagens-list',
                '#companheiro-arts-stats-panel',
                '#comp-skills'
            ];
            containers.forEach(sel => {
                const el = modal.querySelector(sel);
                if (el) el.innerHTML = '';
            });
            
            // 6. Resetar objetos globais
            window.companheiro_temp = null;
            window.companheiroData = null;
            window.companheirosManager.companheiroEmEdicao = null;
            
            console.log('✅ LIMPEZA NUCLEAR CONCLUÍDA!');
        }
    }

    /**
     * Limpar formulário - ATUALIZADO PARA NOVOS IDS
     */
    limparFormulario() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Inputs de texto - NOVOS IDS
        const inputs = modal.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
        inputs.forEach(input => {
            if (input.id.includes('nivel')) {
                input.value = '1';
            } else if (input.id.includes('maxima')) {
                input.value = '100';
            } else if (input.id.includes('base') || input.id.includes('extra')) {
                // 🔧 FORÇAR ZERO PARA INPUTS DE ATRIBUTOS BASE/EXTRA
                input.value = '0';
            } else if (!input.id.includes('imagem') && input.type !== 'file') {
                input.value = '';
            }
        });

        // Reset imagem
        const preview = modal.querySelector('#comp-char-imagem-preview');
        if (preview) {
            preview.innerHTML = '<div class="comp-imagem-placeholder">🐾</div>';
        }

        // Reset displays
        const displays = modal.querySelectorAll('[id$="-total"], [id$="-bonus"]');
        displays.forEach(display => {
            display.textContent = '0';
        });

        // 🔧 LIMPAR EXPLICITAMENTE O TOTAL BASE E SORTE TOTAL
        const totalBase = modal.querySelector('#comp-char-total-base');
        const sorteTotalDisplay = modal.querySelector('#comp-char-sorte-total');
        if (totalBase) totalBase.textContent = '0';
        if (sorteTotalDisplay) sorteTotalDisplay.textContent = '0';

        // 🔧 LIMPAR APTIDÕES/VANTAGENS DESBLOQUEADAS
        const listVantagens = modal.querySelector('#comp-aptidoes-vantagens-list');
        if (listVantagens) {
            listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
        }

        // 🔧 LIMPAR INFORMAÇÕES DE APTIDÕES (ATUAL, MÁXIMO, ETC)
        const campoAtual = modal.querySelector('#comp-aptidoes-atual');
        const campoMaximo = modal.querySelector('#comp-aptidoes-maximo');
        const campoGanhas = modal.querySelector('#comp-aptidoes-ganhas');
        const campoAtributoProxima = modal.querySelector('#comp-aptidoes-atributo-proxima');
        if (campoAtual) campoAtual.textContent = '0';
        if (campoMaximo) campoMaximo.textContent = '0';
        if (campoGanhas) campoGanhas.textContent = '0';
        if (campoAtributoProxima) campoAtributoProxima.textContent = '—';

        // Reset abas
        const abaBotoes = modal.querySelectorAll('.modal-aba-btn');
        const abaConteudos = modal.querySelectorAll('.modal-aba-conteudo');
        
        abaBotoes.forEach(b => b.classList.remove('modal-aba-btn--ativo'));
        abaConteudos.forEach(c => c.style.display = 'none');
        
        if (abaBotoes.length > 0) abaBotoes[0].classList.add('modal-aba-btn--ativo');
        if (abaConteudos.length > 0) abaConteudos[0].style.display = 'block';

        // Reset header displays
        const spanNome = modal.querySelector('#comp-nome-display');
        const spanNivel = modal.querySelector('#comp-nivel-display');
        if (spanNome) spanNome.textContent = 'Companheiro';
        if (spanNivel) spanNivel.textContent = '0';

        // Reset header classes e botões de tipo
        const header = modal.querySelector('.comp-char-header');
        if (header) {
            header.classList.remove('header--mascote', 'header--companheiro', 'header--espirito', 'header--invocacao', 'header--pacto');
        }

        const botoesTodo = modal.querySelectorAll('.comp-tipo-btn');
        botoesTodo.forEach(btn => btn.classList.remove('active'));
    }

    /**
     * 🧹 LIMPEZA GERAL COMPLETA DO MODAL
     * Reseta TODOS os dados, inputs, displays e containers
     */
    limparFormularioCompleto() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        console.log('🧹 INICIANDO LIMPEZA GERAL COMPLETA DO MODAL...');

        // ===== 1. LIMPAR TODOS OS INPUTS =====
        const todosInputs = modal.querySelectorAll('input, textarea, select');
        todosInputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.id.includes('nivel')) {
                input.value = '1';
            } else if (input.id.includes('maxima')) {
                input.value = '100';
            } else if (input.id.includes('base') || input.id.includes('extra')) {
                input.value = '0';
            } else if (input.type !== 'file') {
                input.value = '';
            }
        });

        // ===== 2. LIMPAR TODOS OS DISPLAYS/SPANS =====
        const todosDisplays = modal.querySelectorAll('span[id]');
        todosDisplays.forEach(display => {
            if (display.textContent.trim() !== '') {
                if (display.id.includes('proxima') || display.id.includes('descricao')) {
                    display.textContent = '—';
                } else if (display.id.includes('nome')) {
                    display.textContent = 'Companheiro';
                } else {
                    display.textContent = '0';
                }
            }
        });

        // ===== 3. LIMPAR IMAGEM =====
        const preview = modal.querySelector('#comp-char-imagem-preview');
        if (preview) {
            preview.innerHTML = '<div class="comp-imagem-placeholder">🐾</div>';
        }

        // ===== 4. LIMPAR LISTA DE VANTAGENS DESBLOQUEADAS =====
        const listVantagens = modal.querySelector('#comp-aptidoes-vantagens-list');
        if (listVantagens) {
            listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
        }

        // ===== 5. RESETAR ABAS =====
        const abaBotoes = modal.querySelectorAll('.modal-aba-btn');
        const abaConteudos = modal.querySelectorAll('.modal-aba-conteudo');
        abaBotoes.forEach(b => b.classList.remove('modal-aba-btn--ativo'));
        abaConteudos.forEach(c => c.style.display = 'none');
        if (abaBotoes.length > 0) abaBotoes[0].classList.add('modal-aba-btn--ativo');
        if (abaConteudos.length > 0) abaConteudos[0].style.display = 'block';

        // ===== 6. REMOVER CLASSES DE STYLING =====
        const header = modal.querySelector('.comp-char-header');
        if (header) {
            header.classList.remove('header--mascote', 'header--companheiro', 'header--espirito', 'header--invocacao', 'header--pacto');
        }

        // ===== 7. DESATIVAR TODOS OS BOTÕES DE TIPO =====
        const botoesTodo = modal.querySelectorAll('.comp-tipo-btn');
        botoesTodo.forEach(btn => btn.classList.remove('active'));

        // ===== 8. LIMPAR ARRAYS/OBJETOS GLOBAIS =====
        window.companheiro_temp = null;
        window.companheiroData = null;
        window.companheirosManager.companheiroEmEdicao = null;

        // ===== 9. LIMPAR BARRAS ANIMADAS =====
        const todasBarras = modal.querySelectorAll('.comp-barra-fill');
        todasBarras.forEach(barra => {
            barra.style.width = '0%';
        });

        // ===== 10. LIMPAR PANEL DE STATS DE ARTS =====
        const statsPanel = modal.querySelector('#companheiro-arts-stats-panel');
        if (statsPanel) {
            statsPanel.innerHTML = '';
        }

        // ===== 11. LIMPAR ABA DE INVENTÁRIO =====
        const inventarioList = modal.querySelector('#inventario-itens-list');
        if (inventarioList) {
            inventarioList.innerHTML = '';
        }

        // ===== 12. LIMPAR ABA DE APTIDÕES (VANTAGENS) =====
        const aptidoesVantagens = modal.querySelector('#comp-aptidoes-vantagens-list');
        if (aptidoesVantagens) {
            aptidoesVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
        }

        console.log('✅ LIMPEZA GERAL COMPLETA FINALIZADA!');
    }

    /**
     * Preencher formulário com dados do companheiro
     */
    async preencherFormulario(companheiro) {
        try {
            const modal = document.getElementById(this.modalId);
            if (!modal) {
                console.error('❌ Modal não encontrado:', this.modalId);
                return;
            }

            // ✅ CRÍTICO: Setar window.companheiroData para sincronização com inventário
            window.companheiroData = companheiro;
            console.log('✅ window.companheiroData definido:', companheiro.nome);

            // Helper para atualizar campo de forma segura
            const updateField = (selector, value) => {
                const elem = modal.querySelector(selector);
                if (elem) {
                    elem.value = value || '';
                } else {
                    console.warn(`⚠️ Campo não encontrado: ${selector}`);
                }
            };

            // Dados básicos - NOVOS IDS
            updateField('#comp-char-nome', companheiro.nome);
            updateField('#comp-char-tipo', companheiro.tipo || 'PET');
            updateField('#comp-char-nivel-input', companheiro.nivel || 1);
            updateField('#comp-char-descricao', companheiro.descricao);

            // Atualizar headers
            this.atualizarNomeHeader();
            this.atualizarNivelHeader();

            // Aplicar tipo (atualiza header e seleciona botão)
            if (companheiro.tipo) {
                this.selecionarTipo(companheiro.tipo);
            }

            // Imagem - Suportar IndexedDB
            if (companheiro.imagemDbId && window.companheirosImagemDB) {
                try {
                    console.log('🔍 Tentando recuperar imagem do IndexedDB:', companheiro.imagemDbId);
                    const imagemData = await window.companheirosImagemDB.recuperarImagem(companheiro.id);
                    if (imagemData && imagemData.dados) {
                        const preview = modal.querySelector('#comp-char-imagem-preview');
                        const inputUrl = modal.querySelector('#comp-char-imagem-url');
                        const inputUpload = modal.querySelector('#comp-char-imagem-upload');
                        
                        if (preview) {
                            preview.innerHTML = `<img src="${imagemData.dados}" alt="${companheiro.nome}" onerror="this.parentElement.innerHTML='<div class=\\'comp-imagem-placeholder\\'>🐾</div>'">`;
                        }
                        
                        // Limpar campos e marcar como upload
                        if (inputUrl) inputUrl.value = '';
                        if (inputUpload) inputUpload.value = '';
                        
                        // Setar tab para upload (já que vem do IndexedDB)
                        const uploadTab = modal.querySelector('#comp-char-imagem-upload-tab');
                        if (uploadTab) uploadTab.checked = true;
                        
                        console.log(`✅ Imagem carregada do IndexedDB para ${companheiro.nome}`);
                        // ✅ NÃO FAZER RETURN AQUI - CONTINUAR COM RESTO DOS DADOS
                    } else {
                        console.warn('⚠️ imagemDbId existe mas dados não foram recuperados');
                        // Continuar para fallback de base64
                    }
                } catch (error) {
                    console.warn('⚠️ Erro ao carregar imagem do IndexedDB (continuando com fallback):', error);
                    // Continuar para fallback de base64
                }
            }
            
            // Fallback: Se ImagemDbId falhou ou se tem imagem em base64/URL
            if (companheiro.imagem && typeof companheiro.imagem === 'string' && companheiro.imagem.trim()) {
                const inputUrl = modal.querySelector('#comp-char-imagem-url');
                const inputUpload = modal.querySelector('#comp-char-imagem-upload');
                const preview = modal.querySelector('#comp-char-imagem-preview');
                
                console.log('📷 Preenchendo imagem do companheiro:', companheiro.imagem.substring(0, 50) + '...');
                
                // Detectar se é base64 (upload) ou URL
                const isBase64 = companheiro.imagem.startsWith('data:');
                
                if (isBase64) {
                    // É uma imagem de UPLOAD (base64)
                    console.log('📷 Formato: BASE64 (UPLOAD)');
                    
                    // Setar tab para UPLOAD
                    const uploadTab = modal.querySelector('#comp-char-imagem-upload-tab');
                    if (uploadTab) {
                        uploadTab.checked = true;
                    }
                    
                    // Limpar URL
                    if (inputUrl) inputUrl.value = '';
                    
                    // Limpar upload input (não pode ter arquivo File a partir de string)
                    if (inputUpload) inputUpload.value = '';
                    
                    // Renderizar no preview
                    if (preview) {
                        preview.innerHTML = `<img src="${companheiro.imagem}" alt="${companheiro.nome}" onerror="this.parentElement.innerHTML='<div class=\\'comp-imagem-placeholder\\'>🐾</div>'">`;
                    }
                } else {
                    // É uma URL
                    console.log('📷 Formato: URL');
                    
                    // Setar tab para URL
                    const urlTab = modal.querySelector('#comp-char-imagem-url-tab');
                    if (urlTab) {
                        urlTab.checked = true;
                    }
                    
                    // Preencher URL input
                    if (inputUrl) inputUrl.value = companheiro.imagem;
                    
                    // Limpar upload
                    if (inputUpload) inputUpload.value = '';
                    
                    // Renderizar no preview
                    if (preview) {
                        preview.innerHTML = `<img src="${companheiro.imagem}" alt="${companheiro.nome}" onerror="this.parentElement.innerHTML='<div class=\\'comp-imagem-placeholder\\'>🐾</div>'">`;
                    }
                }
                
                console.log('✅ Imagem renderizada no preview');
            } else {
                // Se não houver imagem, limpar todos os campos
                const inputUrl = modal.querySelector('#comp-char-imagem-url');
                const inputUpload = modal.querySelector('#comp-char-imagem-upload');
                const urlTab = modal.querySelector('#comp-char-imagem-url-tab');
                const preview = modal.querySelector('#comp-char-imagem-preview');
                
                if (inputUrl) inputUrl.value = '';
                if (inputUpload) inputUpload.value = '';
                if (urlTab) urlTab.checked = true;
                
                // Limpar preview
                if (preview) {
                    preview.innerHTML = '<div class="comp-imagem-placeholder">🐾</div>';
                }
                
                console.log('⚠️ Nenhuma imagem encontrada para companheiro:', companheiro.nome);
            }

            // Atributos - NOVOS IDS COM BASE E EXTRA
            try {
                // ✅ Atributos primários PADRÃO (garantir que sempre existam)
                const atributosDefault = {
                    forca: { base: 0, extra: 0 },
                    vitalidade: { base: 0, extra: 0 },
                    agilidade: { base: 0, extra: 0 },
                    inteligencia: { base: 0, extra: 0 },
                    percepcao: { base: 0, extra: 0 },
                    sorte: { base: 0, extra: 0 }
                };
                
                // Mesclar com dados do companheiro (fallback para default se vazio)
                const atributos = { ...atributosDefault, ...(companheiro.atributos || {}) };
                
                Object.keys(atributos).forEach(attr => {
                    const dados = atributos[attr];
                    if (dados && typeof dados === 'object') {
                        const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
                        const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);
                        
                        if (inputBase) inputBase.value = dados.base || 0;
                        if (inputExtra) inputExtra.value = dados.extra || 0;
                    }
                });
            } catch (e) {
                console.warn('⚠️ Erro ao preencher atributos primários:', e);
            }

            // Atributos secundários - Se existirem
            try {
                // ✅ Atributos secundários PADRÃO (garantir que sempre existam)
                const secundariosDefault = {
                    prontidao: { base: 0, extra: 0 },
                    ataque: { base: 0, extra: 0 },
                    defesa: { base: 0, extra: 0 },
                    reacao: { base: 0, extra: 0 },
                    precisao: { base: 0, extra: 0 },
                    evasao: { base: 0, extra: 0 }
                };
                
                // Mesclar com dados do companheiro (fallback para default se vazio)
                const secundarios = { ...secundariosDefault, ...(companheiro.secundarios || {}) };
                
                Object.keys(secundarios).forEach(attr => {
                    const dados = secundarios[attr];
                    if (dados && typeof dados === 'object') {
                        const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
                        const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);
                        
                        if (inputBase) inputBase.value = dados.base || 0;
                        if (inputExtra) inputExtra.value = dados.extra || 0;
                    }
                });
            } catch (e) {
                console.warn('⚠️ Erro ao preencher atributos secundários:', e);
            }

            // Barras de status - NOVOS IDS (valor, extra, bonus, maxima)
            try {
                ['saude', 'energia', 'fadiga'].forEach(barra => {
                    const inputValor = modal.querySelector(`#comp-char-${barra}-valor`);
                    const inputExtra = modal.querySelector(`#comp-char-${barra}-extra`);
                    const inputBonus = modal.querySelector(`#comp-char-${barra}-bonus`);
                    const inputMaxima = modal.querySelector(`#comp-char-${barra}-maxima`);

                    if (companheiro[barra]) {
                        if (inputValor) inputValor.value = companheiro[barra].valor || 0;
                        if (inputExtra) inputExtra.value = companheiro[barra].extra || 0;
                        if (inputBonus) inputBonus.value = companheiro[barra].bonus || 0;
                        if (inputMaxima) inputMaxima.value = companheiro[barra].maxima || 100;
                    }
                });
            } catch (e) {
                console.warn('⚠️ Erro ao preencher barras de status:', e);
            }

            // Notas
            const inputNotas = modal.querySelector('#comp-char-notas');
            if (inputNotas) {
                inputNotas.value = companheiro.notas || '';
            }

            // Raça
            if (companheiro.raca) {
                this.selecionarRaca(companheiro.raca);
            }

            // Atualizar displays
            try {
                this.atualizarDisplaysAtributos();
                this.atualizarAtributosSecundarios();
                this.atualizarMaximoStatus();
                this.atualizarBarrasAnimadas();
                this.atualizarPontosDistribuir();
                
                // 🔄 SINCRONIZAR ATRIBUTOS NA ABA DE HABILIDADES AO CARREGAR
                this.atualizarAtributosAbaHabilidades();
                
                // 🎯 ATUALIZAR PAINEL DE STATS DE ARTS COM DADOS DO COMPANHEIRO
                if (window.companheiroArtsSystem) {
                    window.companheiroArtsSystem.atualizarStatsPanel(companheiro, modal);
                }
            } catch (e) {
                console.warn('⚠️ Erro ao atualizar displays:', e);
            }
            
            // ✅ NOVO: REINICIALIZAR INVENTÁRIO COM O NOVO COMPANHEIRO
            if (window.companheiroInventarioManager && window.localStorageManager) {
                console.log('🔄 [preencherFormulario] Reinicializando inventário com novo companheiro...');
                window.companheiroInventarioManager.init(companheiro, window.localStorageManager);
                if (window.companheiroInventarioUI) {
                    console.log('🎨 [preencherFormulario] Inicializando UI do inventário com novo manager...');
                    // ⭐ IMPORTANTE: Chamar init(), não apenas render()
                    // render() não funciona se manager for null
                    window.companheiroInventarioUI.init(window.companheiroInventarioManager);
                }
            } else {
                console.warn('⚠️ [preencherFormulario] Inventário ou localStorage não disponível');
            }

            // ✅ NOVO: RECARREGAR HABILIDADES/ARTS DO NOVO COMPANHEIRO
            if (window.companheiroArtsSystem) {
                console.log('🎯 [preencherFormulario] Carregando dados persistidos de arts...');
                window.companheiroArtsSystem.carregarDadosPersistidos();
            }

            // ✅ NOVO: Disparar evento de sincronização com inventário quando formulário é preenchido
            window.dispatchEvent(new CustomEvent('companheiroAtributosAtualizados', {
                detail: {
                    companheiroData: window.companheiroData,
                    timestamp: Date.now()
                }
            }));
            console.log('📢 Evento companheiroAtributosAtualizados disparado ao carregar companheiro');
            
            // Restaurar stats de aptidões (ATUAL, GANHAS, MÁXIMO, ATRIBUTO)
            if (companheiro.aptitudesStats) {
                const elemAtual = modal.querySelector('#comp-aptidoes-atual');
                const elemGanhas = modal.querySelector('#comp-aptidoes-ganhas');
                const elemMaximo = modal.querySelector('#comp-aptidoes-maximo');
                const elemAtributo = modal.querySelector('#comp-aptidoes-atributo-proxima');
                
                if (elemAtual) elemAtual.textContent = companheiro.aptitudesStats.atual || 0;
                if (elemGanhas) elemGanhas.textContent = companheiro.aptitudesStats.ganhas || 0;
                if (elemMaximo) elemMaximo.textContent = companheiro.aptitudesStats.maximo || 3;
                if (elemAtributo) elemAtributo.textContent = companheiro.aptitudesStats.atributoPróxima || '—';
                
                console.log('✅ Stats de aptidões restaurados:', companheiro.aptitudesStats);
            }
            
            // Restaurar companheiro_temp com aptidões
            window.companheiro_temp = {
                nome: companheiro.nome,
                aptidoes: companheiro.aptidoes || [],
                vantagens: companheiro.vantagens || []
            };
            console.log('✅ companheiro_temp restaurado com', window.companheiro_temp.aptidoes.length, 'aptidões');
            
            // Renderizar aptidões adquiridas na aba
            this.renderizarAptidoesAdquiridas(companheiro);
            
            // Renderizar vantagens desbloqueadas na aba
            this.renderizarVantagensDesbloqueadas(companheiro);
            
            // Aplicar bônus das aptidões nos atributos
            this.aplicarBonusAptidoesCompanheiro(companheiro);
            
            this.atualizarInfoAptidoesCompanheiro(); // 🐾 Atualizar aptidões
            
            console.log('✅ preencherFormulario completo para:', companheiro.nome);
        } catch (e) {
            console.error('❌ Erro geral em preencherFormulario:', e);
            console.error('Stack:', e.stack);
        }
    }

    /**
     * Desabilitar todos os inputs
     */
    desabilitarInputs() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // ⚠️ IMPORTANTE: Não desabilitar botões de aba, fechar ou navegação!
        const inputs = modal.querySelectorAll('input, textarea, select, button[type="button"]');
        inputs.forEach(input => {
            // Exceções: não desabilitar esses botões
            if (input.classList.contains('modal-close-btn') ||
                input.classList.contains('modal-aba-btn') ||  // 🔧 Botões de aba
                input.classList.contains('modal-overlay__backdrop') ||
                input.id === 'btn-modal-companheiro-fechar' ||
                input.id === 'btn-modal-companheiro-cancelar') {
                return;
            }
            input.disabled = true;
        });
    }

    /**
     * Habilitar todos os inputs
     */
    habilitarInputs() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const inputs = modal.querySelectorAll('input, textarea, select, button[type="button"]');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }

    /**
     * ✨ NOVO: Sincronizar companheiroData com os valores atuais do modal
     * Chamado ao abrir novo companheiro e quando atributos mudam
     */
    sincronizarCompanheiroDataDoModal() {
        const modal = document.getElementById(this.modalId);
        if (!modal || !window.companheiroData) return;

        const atributos = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'];
        
        atributos.forEach(attr => {
            const spanTotal = modal.querySelector(`#comp-char-${attr}-total`);
            if (spanTotal) {
                const total = parseInt(spanTotal.textContent) || 0;
                if (window.companheiroData.atributos[attr]) {
                    window.companheiroData.atributos[attr].total = total;
                }
            }
        });
        
        console.log('✅ companheiroData sincronizado com valores do modal:', window.companheiroData.atributos);
    }

    /**
     * Salvar companheiro - ATUALIZADO PARA NOVOS IDS
     */
    /**
     * 🐾 Coletar todos os dados do companheiro do formulário
     * Retorna um objeto com todos os dados necessários
     */
    coletarDadosCompanheiro() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return null;

        const nome = modal.querySelector('#comp-char-nome').value.trim();
        const tipo = modal.querySelector('#comp-char-tipo').value;
        const nivel = parseInt(modal.querySelector('#comp-char-nivel-input').value) || 1;
        const descricao = modal.querySelector('#comp-char-descricao').value.trim();
        const notas = modal.querySelector('#comp-char-notas').value.trim();
        const raca = modal.querySelector('#comp-char-raca-btn').getAttribute('data-raca') || 'humano';
        const imagemUrl = modal.querySelector('#comp-char-imagem-url').value.trim();
        
        // ✅ FIX #2: Usar ?? (nullish coalescing) em vez de ||
        // ?? retorna lado direito APENAS se esquerda for null/undefined
        // || pode causar bugs com valores falsy
        const companheiroId = window.companheirosManager?.companheiroEmEdicao ?? null;
        
        console.log('🟠 coletarDadosCompanheiro: companheiroEmEdicao =', window.companheirosManager?.companheiroEmEdicao);
        console.log('🟠 coletarDadosCompanheiro: companheiroId retornado =', companheiroId);

        return {
            id: companheiroId,
            nome,
            tipo,
            nivel,
            descricao,
            notas,
            raca,
            imagem: imagemUrl,
            atributos: this.coletarAtributos(modal),
            secundarios: this.coletarAtributosSecundarios(modal),
            saude: this.coletarBarra(modal, 'saude'),
            energia: this.coletarBarra(modal, 'energia'),
            fadiga: this.coletarBarra(modal, 'fadiga'),
            habilidades: [],
            aptidoes: []
        };
    }

    async salvarCompanheiro() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        console.log('💾 ===== INICIANDO salvarCompanheiro =====');
        console.log('📋 companheiroEmEdicao ANTES de coletar:', window.companheirosManager.companheiroEmEdicao);
        console.log('📋 companheiroEmEdicao type:', typeof window.companheirosManager.companheiroEmEdicao);

        // Coletar dados - NOVOS IDS
        const nome = modal.querySelector('#comp-char-nome').value.trim();
        const tipo = modal.querySelector('#comp-char-tipo').value;
        const nivel = parseInt(modal.querySelector('#comp-char-nivel-input').value) || 1;
        const descricao = modal.querySelector('#comp-char-descricao').value.trim();

        // Validar nome
        if (!nome) {
            alert('⚠️ O nome do companheiro é obrigatório!');
            return;
        }

        // Validar tipo
        if (!tipo) {
            alert('⚠️ Selecione um tipo de companheiro!');
            return;
        }

        // Imagem - NOVOS IDS - Detectar qual aba está ativa
        const urlTab = modal.querySelector('#comp-char-imagem-url-tab');
        const uploadTab = modal.querySelector('#comp-char-imagem-upload-tab');
        const imagemUrl = modal.querySelector('#comp-char-imagem-url').value.trim();
        const imagemUpload = modal.querySelector('#comp-char-imagem-upload').files[0];
        const preview = modal.querySelector('#comp-char-imagem-preview');
        let imagem = null;

        // Usar a aba selecionada para decidir
        if (uploadTab && uploadTab.checked && imagemUpload) {
            // Upload foi selecionado e há arquivo
            imagem = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(imagemUpload);
            });
            
            // 🔥 COMPRIMIR IMAGEM ANTES DE SALVAR
            try {
                if (typeof ImagemOtimizacao !== 'undefined') {
                    imagem = await ImagemOtimizacao.procesarImagem(imagem, {
                        maxWidth: 1024,
                        maxHeight: 1024,
                        quality: 0.8,
                        tamanhMaximoMB: 2
                    });
                }
            } catch (e) {
                console.warn('⚠️ Erro ao comprimir imagem:', e);
                // Continuar com imagem original
            }
            
            console.log('📷 Salvando nova imagem de UPLOAD (comprimida)');
        } else if (uploadTab && uploadTab.checked && !imagemUpload && preview) {
            // Upload tab ativo mas sem arquivo novo - extrair do preview (base64 anterior)
            const img = preview.querySelector('img');
            if (img && img.src) {
                imagem = img.src;
                console.log('📷 Salvando imagem UPLOAD do preview (base64 existente)');
            }
        } else if (urlTab && urlTab.checked && imagemUrl) {
            // URL foi selecionado e há valor
            imagem = imagemUrl;
            console.log('📷 Salvando nova imagem de URL');
        } else if (!uploadTab?.checked && !urlTab?.checked && preview) {
            // Nenhuma aba explícita - tentar extrair qualquer imagem do preview
            const img = preview.querySelector('img');
            if (img && img.src) {
                imagem = img.src;
                console.log('📷 Salvando imagem do preview (fallback)');
            }
        }

        // Notas
        const notas = modal.querySelector('#comp-char-notas').value.trim();

        // Raça
        const raca = modal.querySelector('#comp-char-raca-btn').getAttribute('data-raca') || 'humano';

        // Coletar stats de aptidões
        const elemCompAtual = modal.querySelector('#comp-aptidoes-atual');
        const elemCompGanhas = modal.querySelector('#comp-aptidoes-ganhas');
        const elemCompMaximo = modal.querySelector('#comp-aptidoes-maximo');
        const elemCompAtributo = modal.querySelector('#comp-aptidoes-atributo-proxima');
        
        const aptitudesStats = {
            atual: elemCompAtual ? parseInt(elemCompAtual.textContent) || 0 : 0,
            ganhas: elemCompGanhas ? parseInt(elemCompGanhas.textContent) || 0 : 0,
            maximo: elemCompMaximo ? parseInt(elemCompMaximo.textContent) || 3 : 3,
            atributoPróxima: elemCompAtributo ? elemCompAtributo.textContent || '—' : '—'
        };

        // ✅ FIX #3: Usar companheiroEmEdicao com fallback seguro
        // Usar ?? em vez de || para evitar undefined
        const companheiroId = window.companheirosManager?.companheiroEmEdicao ?? null;
        console.log('🔑 ID sendo passado para salvamento:', companheiroId);

        // Executar salvamento com async
        await this.executarSalvamento({
            id: companheiroId,
            nome, tipo, nivel, descricao, imagem, notas, raca,
            atributos: this.coletarAtributos(modal),
            secundarios: this.coletarAtributosSecundarios(modal),
            saude: this.coletarBarra(modal, 'saude'),
            energia: this.coletarBarra(modal, 'energia'),
            fadiga: this.coletarBarra(modal, 'fadiga'),
            habilidades: [],
            aptidoes: window.companheiro_temp ? (window.companheiro_temp.aptidoes || []) : [],
            aptitudesStats: aptitudesStats
        });
    }

    /**
     * Executar salvamento com suporte a IndexedDB
     */
    async executarSalvamento(dados) {
        try {
            // ✅ FIX #5: Logs detalhados para debug
            console.log('🚀 INICIANDO SALVAMENTO');
            console.log('📦 Dados completos:', {
                id: dados.id,
                idType: typeof dados.id,
                nome: dados.nome,
                tipo: dados.tipo,
                temImagem: !!dados.imagem,
                saude: dados.saude,
                energia: dados.energia,
                fadiga: dados.fadiga
            });
            
            // Verificar companheiroEmEdicao no manager
            console.log('🔍 companheiroEmEdicao no manager:', window.companheirosManager.companheiroEmEdicao);
            console.log('🔍 companheiroEmEdicao type:', typeof window.companheirosManager.companheiroEmEdicao);
            
            const resultado = await window.companheirosManager.salvarNovoCompanheiro(dados);

            if (resultado) {
                console.log('✅ Companheiro salvo com sucesso:', resultado.id);
                console.log('📊 Dados salvos - Saúde:', resultado.saude, 'Energia:', resultado.energia, 'Fadiga:', resultado.fadiga);
                
                // 💾 SALVAR IMAGEM EM INDEXEDDB SE HOUVER
                if (resultado.imagem && typeof resultado.imagem === 'string' && resultado.imagem.startsWith('data:')) {
                    try {
                        console.log('💾 Salvando imagem do companheiro em IndexedDB...');
                        if (window.companheirosImagemDB) {
                            const imagemDbId = await window.companheirosImagemDB.salvarImagem(
                                resultado.id,
                                resultado.imagem,
                                'companheiro'
                            );
                            // Atualizar resultado com imagemDbId
                            resultado.imagemDbId = imagemDbId;
                            // Encontrar e atualizar o companheiro na lista (não substituir toda!)
                            const indexCompanheiro = window.companheirosManager.companheiros.findIndex(c => c.id === resultado.id);
                            if (indexCompanheiro !== -1) {
                                window.companheirosManager.companheiros[indexCompanheiro] = resultado;
                            }
                            await window.companheirosManager.salvarNoStorage();
                            console.log('✅ Imagem salva em IndexedDB com ID:', imagemDbId);
                        }
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar imagem em IndexedDB:', e.message);
                        // Continuar mesmo sem IndexedDB
                    }
                }
                
                this.fecharModal();
                await window.companheirosUI.renderizar();
            } else {
                alert('❌ Erro ao salvar companheiro');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar companheiro:', error);
            alert('❌ Erro ao salvar companheiro: ' + error.message);
        }
    }

    /**
     * Coletar atributos do formulário - NOVO COM CAMPOS BASE E EXTRA
     */
    coletarAtributos(modal) {
        const atributos = {};
        const atributosList = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'];

        atributosList.forEach(attr => {
            const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
            const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);
            const spanTotal = modal.querySelector(`#comp-char-${attr}-total`);
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);
            
            const base = inputBase ? parseInt(inputBase.value) || 0 : 0;
            const extra = inputExtra ? parseInt(inputExtra.value) || 0 : 0;
            const total = spanTotal ? parseInt(spanTotal.textContent) || 0 : base + extra;
            const bonus = spanBonus ? parseInt(spanBonus.textContent) || 0 : 0;

            atributos[attr] = { base, extra, total, bonus };
        });

        return atributos;
    }

    /**
     * Coletar barra de status - NOVO COM IDS COMP-CHAR
     */
    coletarBarra(modal, tipo) {
        const valor = parseInt(modal.querySelector(`#comp-char-${tipo}-valor`).value) || 0;
        const extra = parseInt(modal.querySelector(`#comp-char-${tipo}-extra`).value) || 0;
        const bonus = parseInt(modal.querySelector(`#comp-char-${tipo}-bonus`).value) || 0;
        const maxima = parseInt(modal.querySelector(`#comp-char-${tipo}-maxima`).value) || 100;

        const barra = { valor, extra, bonus, maxima };
        console.log(`📊 Coletada barra ${tipo}:`, barra);
        return barra;
    }

    /**
     * Coletar atributos secundários do formulário
     */
    coletarAtributosSecundarios(modal) {
        const secundarios = {};
        const secundariosList = ['prontidao', 'ataque', 'defesa', 'reacao', 'precisao', 'evasao'];

        secundariosList.forEach(attr => {
            const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
            const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);
            const spanTotal = modal.querySelector(`#comp-char-${attr}-total`);
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);
            
            const base = inputBase ? parseInt(inputBase.value) || 0 : 0;
            const extra = inputExtra ? parseInt(inputExtra.value) || 0 : 0;
            const total = spanTotal ? parseInt(spanTotal.textContent) || 0 : 0;
            const bonus = spanBonus ? parseInt(spanBonus.textContent) || 0 : 0;

            secundarios[attr] = { base, extra, total, bonus };
        });

        return secundarios;
    }

    /**
     * Atualizar displays de atributos em tempo real
     */
    atualizarDisplaysAtributos() {
        console.log(`\n🔄 [atualizarDisplaysAtributos] ATUALIZANDO TOTAIS...`);
        
        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.error(`❌ Modal não encontrada`);
            return;
        }

        const atributosList = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'];

        atributosList.forEach(attr => {
            const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
            const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);
            
            // Para sorte, precisamos usar um seletor mais específico pois há dois elementos com esse id
            let spanTotal;
            if (attr === 'sorte') {
                // Pega o primeiro span com id comp-char-sorte-total que NÃO tem a classe comp-char-total-value
                spanTotal = Array.from(modal.querySelectorAll('#comp-char-sorte-total')).find(el => !el.classList.contains('comp-char-total-value'));
            } else {
                spanTotal = modal.querySelector(`#comp-char-${attr}-total`);
            }
            
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);

            if (inputBase && spanTotal) {
                const base = parseInt(inputBase.value) || 0;
                const extra = parseInt(inputExtra?.value) || 0;
                const bonus = spanBonus ? parseInt(spanBonus.textContent) || 0 : 0;
                const total = base + extra + bonus;

                spanTotal.textContent = total;
                console.log(`   ${attr}: ${base} (base) + ${extra} (extra) + ${bonus} (bonus) = ${total}`);
            }
        });

        // Atualizar Total Base
        const totalBase = atributosList.reduce((sum, attr) => {
            const input = modal.querySelector(`#comp-char-${attr}-base`);
            return sum + (input ? parseInt(input.value) || 0 : 0);
        }, 0);

        const spanTotalBase = modal.querySelector('#comp-char-total-base');
        if (spanTotalBase) spanTotalBase.textContent = totalBase;

        // Atualizar Sorte (Bônus) na seção de totais superior
        const sorteBase = modal.querySelector('#comp-char-sorte-base');
        const sorteExtra = modal.querySelector('#comp-char-sorte-extra');
        
        if (sorteBase && sorteExtra) {
            // Obter o total de sorte (base + extra + bonus)
            const sorteTotalValor = this.obterTotalAtributo(modal, 'sorte');
            
            // Calcular bônus de sorte: Total / 25 (arredondado para baixo)
            const bonus = Math.floor(sorteTotalValor / 25);
            
            // Atualizar APENAS o field de Sorte na seção de totais superior (com classe comp-char-total-value)
            const spanSorteTotalSuperior = modal.querySelector('#comp-char-sorte-total.comp-char-total-value');
            if (spanSorteTotalSuperior) {
                spanSorteTotalSuperior.textContent = bonus;
            }
        }

        // ✅ Atualizar atributos secundários baseado nos primários (COM OS BÔNUS RECÉM-APLICADOS)
        this.atualizarAtributosSecundarios();
        
        // ✅ NOVO: Recalcular bônus percentuais em tempo real
        this.recalcularBonusPercentuaisTempo();
        
        // 🔄 SINCRONIZAR ATRIBUTOS NA ABA DE HABILIDADES
        this.atualizarAtributosAbaHabilidades();
        
        // 🎯 ATUALIZAR PAINEL DE STATS DE ARTS (limit, ativas, bloqueadas, variações)
        const companheiroEmEdicao = window.companheirosManager?.companheiroEmEdicao;
        if (companheiroEmEdicao && window.companheiroArtsSystem) {
            const companheiro = window.companheirosManager?.getCompanheiroById?.(companheiroEmEdicao);
            if (companheiro) {
                window.companheiroArtsSystem.atualizarStatsPanel(companheiro, modal);
            }
        }
    }

    /**
     * Calcular e atualizar atributos secundários baseado nos primários
     * Implementa as mesmas fórmulas que o AtributosConfigModal
     */
    atualizarAtributosSecundarios() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Obter totais dos primários
        const FOR = this.obterTotalAtributo(modal, 'forca');
        const VIT = this.obterTotalAtributo(modal, 'vitalidade');
        const AGI = this.obterTotalAtributo(modal, 'agilidade');
        const INT = this.obterTotalAtributo(modal, 'inteligencia');
        const PER = this.obterTotalAtributo(modal, 'percepcao');
        const SOR = this.obterTotalAtributo(modal, 'sorte');

        console.log('📊 Atualizando secundários com primários:', { FOR, VIT, AGI, INT, PER, SOR });

        // Objeto com configuração de secundários
        const secundarios = {
            prontidao: {
                calcular: () => Math.ceil(((AGI * 0.6) + (PER * 0.3) + (SOR * 0.1)) / 250 * 315)
            },
            ataque: {
                calcular: () => Math.ceil(((FOR * 0.7) + (INT * 0.3)) / 250 * 21)
            },
            defesa: {
                calcular: () => Math.ceil(((VIT * 0.6) + (AGI * 0.3) + (SOR * 0.1)) / 250 * 16)
            },
            reacao: {
                calcular: () => Math.ceil(((AGI * 0.5) + (PER * 0.3) + (SOR * 0.2)) / 250 * (12 - 6)) + 6
            },
            precisao: {
                calcular: () => Math.ceil(((AGI * 0.3) + (PER * 0.6) + (SOR * 0.1)) / 250 * 12)
            },
            evasao: {
                calcular: () => Math.ceil(((AGI * 0.5) + (PER * 0.4) + (SOR * 0.1)) / 250 * 12)
            }
        };

        // Calcular e atualizar cada secundário
        Object.keys(secundarios).forEach(attr => {
            const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
            const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);
            const spanTotal = modal.querySelector(`#comp-char-${attr}-total`);
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);

            if (spanTotal) {
                // Calcular valor derivado
                const calculado = secundarios[attr].calcular();
                
                // Obter ajustes (base + extra + bonus)
                const base = inputBase ? parseInt(inputBase.value) || 0 : 0;
                const extra = inputExtra ? parseInt(inputExtra.value) || 0 : 0;
                const bonus = spanBonus ? parseInt(spanBonus.textContent) || 0 : 0;
                const total = calculado + base + extra + bonus;

                console.log(`  📌 ${attr}: calc=${calculado} + base=${base} + extra=${extra} + bonus=${bonus} = ${total}`);

                // Atualizar displays
                spanTotal.textContent = total;
            } else {
                console.warn(`  ❌ ${attr} total span NÃO ENCONTRADO`);
            }
        });
        
        // ✅ NOVO: Recalcular bônus percentuais quando secundários mudam
        this.recalcularBonusPercentuaisTempo();

        // ✅ NOVO: Disparar evento para inventário do companheiro recalcular espaço
        window.dispatchEvent(new CustomEvent('companheiroAtributosAtualizados', {
            detail: {
                companheiroData: window.companheiroData,
                timestamp: Date.now()
            }
        }));

        console.log('📢 Evento companheiroAtributosAtualizados disparado');
    }

    /**
     * 🔄 Recalcular bônus percentuais quando atributos mudam (tempo real)
     */
    recalcularBonusPercentuaisTempo() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const companheiroEmEdicaoId = window.companheirosManager?.companheiroEmEdicao;
        if (!companheiroEmEdicaoId) return;

        // Obter o objeto completo do companheiro
        const companheiroEmEdicao = window.companheirosManager?.getCompanheiroById?.(companheiroEmEdicaoId);
        if (!companheiroEmEdicao || !companheiroEmEdicao.aptidoes) return;

        const vantagensSystem = window.vantagensAptidoesSystem;
        if (!vantagensSystem) return;

        console.log('🔄 [recalcularBonusPercentuaisTempo] Recalculando bônus percentuais...');

        const bonusAtuais = {};

        // Encontrar todos os bônus-percentuais e recalcular
        companheiroEmEdicao.aptidoes.forEach(apt => {
            const aptidaoVantagens = vantagensSystem.vantagensAptidoes?.[apt.id];
            if (!aptidaoVantagens) return;

            for (let nivel = 1; nivel <= apt.nivel; nivel++) {
                const vantagem = aptidaoVantagens[nivel];
                if (!vantagem || vantagem.tipo !== 'bonus-percentual') continue;

                const mapeado = this.mapearBonusPercentual(vantagem.valor);
                if (!mapeado) continue;

                // Obter valor base ATUAL do atributo
                let valorBase = 0;
                const spanTotal = modal?.querySelector(`#comp-char-${mapeado.atributo}-total`);
                if (spanTotal) {
                    valorBase = parseInt(spanTotal.textContent) || 0;
                } else {
                    const inputBase = modal?.querySelector(`#comp-char-${mapeado.atributo}-base`);
                    const inputExtra = modal?.querySelector(`#comp-char-${mapeado.atributo}-extra`);
                    const base = inputBase ? parseInt(inputBase.value) || 0 : 0;
                    const extra = inputExtra ? parseInt(inputExtra.value) || 0 : 0;
                    valorBase = base + extra;
                }

                // Calcular novo bônus
                const bonusAbsoluto = Math.round(valorBase * (mapeado.percentual / 100));
                bonusAtuais[mapeado.atributo] = bonusAbsoluto;

                console.log(`  📊 ${mapeado.atributo}: ${mapeado.percentual}% de ${valorBase} = ${bonusAbsoluto}`);
            }
        });

        // Atualizar os spans de bonus dos atributos com os novos valores percentuais
        Object.entries(bonusAtuais).forEach(([atributo, valor]) => {
            const spanBonus = modal.querySelector(`#comp-char-${atributo}-bonus`);
            if (spanBonus) {
                const valorAnterior = parseInt(spanBonus.textContent) || 0;
                spanBonus.textContent = valor;
                if (valorAnterior !== valor) {
                    console.log(`  ✅ Atualizado ${atributo}-bonus: ${valorAnterior} → ${valor}`);
                }
            }
        });

        // Recalcular displays após atualizar bônus percentuais
        console.log('  🔄 Recalculando displays...');
        this.atualizarDisplaysAtributos();
    }

    /**
     * ✅ NOVO: Disparar evento de sincronização com inventário
     * Chamado sempre que um atributo primário é alterado
     * TAMBÉM ATUALIZA window.companheiroData COM OS NOVOS VALORES
     */
    dispatcharEventoAtributosAlterados() {
        // ✅ CRÍTICO: Atualizar companheiroData com os valores atuais do formulário
        const modal = document.getElementById(this.modalId);
        if (modal && window.companheiroData) {
            // Atualizar valores de Força e Vitalidade em companheiroData
            const inputForcaBase = modal.querySelector('#comp-char-forca-base');
            const inputForcaExtra = modal.querySelector('#comp-char-forca-extra');
            const spanForcaTotal = modal.querySelector('#comp-char-forca-total');
            
            const inputVitalidadeBase = modal.querySelector('#comp-char-vitalidade-base');
            const inputVitalidadeExtra = modal.querySelector('#comp-char-vitalidade-extra');
            const spanVitalidadeTotal = modal.querySelector('#comp-char-vitalidade-total');

            if (inputForcaBase && inputForcaExtra && spanForcaTotal) {
                const base = parseInt(inputForcaBase.value) || 0;
                const extra = parseInt(inputForcaExtra.value) || 0;
                const total = parseInt(spanForcaTotal.textContent) || 0;
                window.companheiroData.atributos.forca = { base, extra, total, bonus: 0 };
                console.log(`🔄 Atualizado companheiroData.forca: ${JSON.stringify(window.companheiroData.atributos.forca)}`);
            }

            if (inputVitalidadeBase && inputVitalidadeExtra && spanVitalidadeTotal) {
                const base = parseInt(inputVitalidadeBase.value) || 0;
                const extra = parseInt(inputVitalidadeExtra.value) || 0;
                const total = parseInt(spanVitalidadeTotal.textContent) || 0;
                window.companheiroData.atributos.vitalidade = { base, extra, total, bonus: 0 };
                console.log(`🔄 Atualizado companheiroData.vitalidade: ${JSON.stringify(window.companheiroData.atributos.vitalidade)}`);
            }
        }

        // Disparar evento
        window.dispatchEvent(new CustomEvent('companheiroAtributosAtualizados', {
            detail: {
                companheiroData: window.companheiroData,
                timestamp: Date.now()
            }
        }));
        console.log('📢 Evento companheiroAtributosAtualizados disparado (atributo alterado)');
    }

    /**
     * Obter valor total de um atributo primário
     */
    obterTotalAtributo(modal, atributo) {
        const inputBase = modal.querySelector(`#comp-char-${atributo}-base`);
        const spanBonus = modal.querySelector(`#comp-char-${atributo}-bonus`);
        const inputExtra = modal.querySelector(`#comp-char-${atributo}-extra`);
        
        const base = inputBase ? parseInt(inputBase.value) || 0 : 0;
        const bonus = spanBonus ? parseInt(spanBonus.textContent) || 0 : 0;
        const extra = inputExtra ? parseInt(inputExtra.value) || 0 : 0;
        
        // Total = Base + Bonus (de aptidões) + Extra (manual)
        return base + bonus + extra;
    }

    /**
     * Atualizar barras animadas
     */
    atualizarBarrasAnimadas() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        ['saude', 'energia', 'fadiga'].forEach(tipo => {
            const barrDiv = modal.querySelector(`#comp-char-${tipo}-barra`);
            const fill = barrDiv?.querySelector('.comp-barra-fill');
            const valor = parseInt(modal.querySelector(`#comp-char-${tipo}-valor`).value) || 0;
            const maxima = parseInt(modal.querySelector(`#comp-char-${tipo}-maxima`).value) || 100;

            if (fill) {
                const percentual = (valor / maxima) * 100;
                fill.style.width = `${Math.max(0, Math.min(100, percentual))}%`;
            }
        });
    }

    /**
     * Calcular e atualizar máximo dos status (Saúde, Energia, Fadiga)
     * Usa os mesmos cálculos da aba de atributo do popup
     */
    atualizarMaximoStatus() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Obter totais dos atributos primários
        const FOR = this.obterTotalAtributo(modal, 'forca');
        const VIT = this.obterTotalAtributo(modal, 'vitalidade');
        const INT = this.obterTotalAtributo(modal, 'inteligencia');
        const PER = this.obterTotalAtributo(modal, 'percepcao');
        const SOR = this.obterTotalAtributo(modal, 'sorte');

        console.log('💪 Atualizando máximos com primários:', { FOR, VIT, INT, PER, SOR });

        // Cálculos dos máximos baseado nos atributos
        const configs = {
            saude: {
                calcular: () => Math.ceil(((FOR * 0.3) + (VIT * 0.6) + (SOR * 0.1)) * 2)
            },
            energia: {
                calcular: () => Math.ceil(((INT * 0.6) + (PER * 0.3) + (SOR * 0.1)) * (200 / 150))
            },
            fadiga: {
                calcular: () => Math.ceil((FOR * 0.3) + (VIT * 0.5) + (SOR * 0.2))
            }
        };

        // Atualizar cada status
        ['saude', 'energia', 'fadiga'].forEach(tipo => {
            const inputValor = modal.querySelector(`#comp-char-${tipo}-valor`);
            const inputExtra = modal.querySelector(`#comp-char-${tipo}-extra`);
            const inputBonus = modal.querySelector(`#comp-char-${tipo}-bonus`);
            const inputMaxima = modal.querySelector(`#comp-char-${tipo}-maxima`);
            const barrDiv = modal.querySelector(`#comp-char-${tipo}-barra`);

            if (inputMaxima) {
                // Calcular máximo: calculado + extra + bonus (SEM base/valor)
                const calculado = configs[tipo].calcular();
                const extra = inputExtra ? parseInt(inputExtra.value) || 0 : 0;
                const bonus = inputBonus ? parseInt(inputBonus.value) || 0 : 0;
                const maxima = calculado + extra + bonus;

                console.log(`  📌 ${tipo}: calc=${calculado} + extra=${extra} + bonus=${bonus} = ${maxima}`);

                // Atualizar campo de máximo
                inputMaxima.value = maxima;

                // Atualizar barra animada
                const valor = parseInt(inputValor?.value) || 0;
                if (barrDiv) {
                    const fill = barrDiv.querySelector('.comp-barra-fill');
                    const percentual = maxima > 0 ? (valor / maxima) * 100 : 0;
                    if (fill) fill.style.width = `${Math.max(0, Math.min(100, percentual))}%`;
                }
            } else {
                console.warn(`  ❌ ${tipo} maxima input NÃO ENCONTRADO`);
            }
        });

        // 🐾 Atualizar aptidões junto com os status
        this.atualizarInfoAptidoesCompanheiro();
    }

    /**
     * Atualizar pontos para distribuir
     */
    atualizarPontosDistribuir() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const nivel = parseInt(modal.querySelector('#comp-char-nivel-input').value) || 1;
        const pontos = (nivel - 1) * 3; // 3 pontos por nível (ajustar conforme regra)

        const spanPontos = modal.querySelector('#comp-char-pontos-display');
        if (spanPontos) spanPontos.textContent = pontos;
    }

    /**
     * Atualizar exibição do nível no header
     */
    atualizarNivelHeader() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const nivel = parseInt(modal.querySelector('#comp-char-nivel-input').value) || 1;
        const spanNivel = modal.querySelector('#comp-nivel-display');
        if (spanNivel) spanNivel.textContent = nivel;
    }

    /**
     * Atualizar nome no header
     */
    atualizarNomeHeader() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const nome = modal.querySelector('#comp-char-nome').value || 'Companheiro';
        const spanNome = modal.querySelector('#comp-nome-display');
        if (spanNome) spanNome.textContent = nome;
    }

    /**
     * 🐾 NOVO: Atualizar displays de aptidões
     * Sincroniza com o sistema de aptidões
     */
    atualizarAptidoesDisplay() {
        console.log('🐾 [CompanheirosModalController] Atualizando displays de aptidões...');
        
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Recalcular e atualizar informações de aptidões
        this.atualizarInfoAptidoesCompanheiro();
        
        console.log('✅ [CompanheirosModalController] Display de aptidões atualizado');
    }

    /**
     * 🐾 NOVO: Calcular e atualizar informações de aptidões do companheiro
     * Usa a mesma fórmula da aba de aptidões do personagem principal
     */
    atualizarInfoAptidoesCompanheiro() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Obter totais dos atributos primários
        const FOR = this.obterTotalAtributo(modal, 'forca');
        const VIT = this.obterTotalAtributo(modal, 'vitalidade');
        const AGI = this.obterTotalAtributo(modal, 'agilidade');
        const INT = this.obterTotalAtributo(modal, 'inteligencia');
        const PER = this.obterTotalAtributo(modal, 'percepcao');

        // Soma de atributos primários (sem Sorte)
        const somaAtributos = FOR + VIT + AGI + INT + PER;

        // Calcular máximo base: ROUND(soma / 20 + 3)
        const maximoBase = Math.round(somaAtributos / 20 + 3);

        // Obter "Ganhas" do campo
        const campoGanhas = modal.querySelector('#comp-aptidoes-ganhas');
        const ganhas = parseInt(campoGanhas?.textContent || '0');

        // Máximo final: maximoBase + ganhas
        const maximoFinal = maximoBase + ganhas;

        // Calcular atributo para próximo incremento (+1)
        // Simula incremento progressivo até encontrar novo máximo
        let atributoProxima = 0;
        for (let i = 1; i <= 100; i++) {
            const novoMax = Math.round((somaAtributos + i) / 20 + 3);
            if (novoMax > maximoBase) {
                atributoProxima = i;
                break;
            }
        }
        if (atributoProxima === 0) {
            // Se não encontrou, significa que precisa de mais pontos
            atributoProxima = 100; // ou indicar que já está no máximo
        }

        // Obter total de aptidões atuais (contando níveis)
        // Calcular a partir de window.companheiro_temp (aptidões do popup) ou companheiro original
        let atualTotal = 0;
        
        if (window.companheiro_temp && window.companheiro_temp.aptidoes && Array.isArray(window.companheiro_temp.aptidoes)) {
            // Usar aptidões do popup
            atualTotal = window.companheiro_temp.aptidoes.reduce((sum, apt) => sum + (apt.nivel || 1), 0);
            console.log('📊 ATUAL calculado de companheiro_temp:', atualTotal);
        } else if (typeof window.companheirosManager !== 'undefined' && 
                   window.companheirosManager.companheiroEmEdicao &&
                   window.companheirosManager.companheiros) {
            // Buscar companheiro atual do manager
            const compEmEdicao = window.companheirosManager.companheiros.find(c => c.id === window.companheirosManager.companheiroEmEdicao);
            if (compEmEdicao && compEmEdicao.aptidoes && Array.isArray(compEmEdicao.aptidoes)) {
                atualTotal = compEmEdicao.aptidoes.reduce((sum, apt) => sum + (apt.nivel || 1), 0);
                console.log('📊 ATUAL calculado do manager:', atualTotal);
            }
        }

        console.log('🐾 [AptidoesCompanheiro] ═══════════════════════════════════');
        console.log('🐾   Soma Atributos:', somaAtributos, `(FOR:${FOR} VIT:${VIT} AGI:${AGI} INT:${INT} PER:${PER})`);
        console.log('🐾   Máximo Base (soma/20 + 3):', maximoBase);
        console.log('🐾   Ganhas (níveis bônus):', ganhas);
        console.log('🐾   MÁXIMO FINAL:', maximoFinal);
        console.log('🐾   Atributo p/ +1 Máx:', atributoProxima === 100 ? 'Já aumenta!' : `${atributoProxima} pts`);
        console.log('🐾   Atual:', atualTotal);
        console.log('🐾 [AptidoesCompanheiro] ═══════════════════════════════════');

        // Atualizar campos no HTML
        const campoAtual = modal.querySelector('#comp-aptidoes-atual');
        const campoMaximo = modal.querySelector('#comp-aptidoes-maximo');
        const campoAtributoProxima = modal.querySelector('#comp-aptidoes-atributo-proxima');

        if (campoAtual) campoAtual.textContent = atualTotal;
        if (campoMaximo) campoMaximo.textContent = maximoFinal;
        if (campoAtributoProxima) {
            if (atributoProxima === 100) {
                campoAtributoProxima.textContent = '—';
            } else {
                campoAtributoProxima.textContent = atributoProxima;
            }
        }

        // 🔥 FORÇAR RENDERIZAÇÃO DE VANTAGENS DESBLOQUEADAS IMEDIATAMENTE
        console.log('🔥 [atualizarInfoAptidoesCompanheiro] Forçando renderização de vantagens...');
        try {
            // Obter companheiro atual
            const companheiroId = window.companheirosManager?.companheiroEmEdicao;
            if (companheiroId) {
                const comp = window.companheirosManager.getCompanheiroById?.(companheiroId);
                if (comp && comp.aptidoes && comp.aptidoes.length > 0) {
                    this.renderizarVantagensDesbloqueadas(comp);
                    console.log('🔥 Vantagens renderizadas FORÇADAMENTE com:', comp.aptidoes.length, 'aptidões');
                } else {
                    console.log('⚠️ Companheiro sem aptidões para renderizar vantagens');
                    // 🧹 Limpar lista de vantagens se não houver aptidões
                    const listVantagens = modal.querySelector('#comp-aptidoes-vantagens-list');
                    if (listVantagens) {
                        listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
                    }
                }
            } else {
                console.log('⚠️ Nenhum companheiro em edição, limpando vantagens...');
                // 🧹 Limpar lista de vantagens quando não há companheiro
                const listVantagens = modal.querySelector('#comp-aptidoes-vantagens-list');
                if (listVantagens) {
                    listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
                }
            }
        } catch (e) {
            console.error('❌ Erro ao forçar renderização de vantagens:', e.message);
        }

        return {
            somaAtributos,
            maximoBase,
            maximoFinal,
            ganhas,
            atributoProxima,
            atual: atualTotal
        };
    }

    /**
     * 🔄 MÉTODO PÚBLICO: Recalcular bônus do companheiro atual (para bonus-opcional)
     * Chamado quando alternância de bonus é feita no render-vantagens-aptidoes
     */
    recalcularBonusCompanheiroAtual() {
        const companheiroEmEdicaoId = window.companheirosManager?.companheiroEmEdicao;
        if (!companheiroEmEdicaoId) {
            console.warn('⚠️ [recalcularBonusCompanheiroAtual] Nenhum companheiro em edição');
            return;
        }
        
        // Obter o objeto completo do companheiro a partir do ID
        const companheiro = window.companheirosManager?.getCompanheiroById?.(companheiroEmEdicaoId);
        if (!companheiro) {
            console.warn('⚠️ [recalcularBonusCompanheiroAtual] Companheiro não encontrado com ID:', companheiroEmEdicaoId);
            return;
        }
        
        console.log('🔄 [recalcularBonusCompanheiroAtual] Recalculando bônus do companheiro:', companheiro.nome);
        this.aplicarBonusAptidoesCompanheiro(companheiro);
        this.atualizarDisplaysAtributos();
    }

    /**
     * Aplicar bônus das aptidões de companheiro nos atributos
     */
    aplicarBonusAptidoesCompanheiro(companheiro) {
        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.error(`❌ Modal com ID "${this.modalId}" não encontrada`);
            return;
        }

        console.log(`\n📊 [aplicarBonusAptidoesCompanheiro] INICIANDO...`);
        console.log(`   Companheiro: ${companheiro.nome} (ID: ${companheiro.id})`);

        // Obter sistema de vantagens
        const vantagensSystem = typeof window.vantagensAptidoesSystem !== 'undefined' ? 
            window.vantagensAptidoesSystem : null;
        
        if (!vantagensSystem) {
            console.warn('⚠️ Sistema de vantagens não disponível');
            return;
        }

        // ✅ GUARDAR OS BONUS ANTIGOS ANTES DE RECALCULAR
        const bonusAntigos = companheiro.bonusAptidoesAtuais ? { ...companheiro.bonusAptidoesAtuais } : {};

        // Inicializar objeto de bônus
        const bonusAptidoes = {
            // Primários
            forca: 0, vitalidade: 0, agilidade: 0, inteligencia: 0, percepcao: 0, sorte: 0,
            // Secundários
            prontidao: 0, ataque: 0, defesa: 0,
            precisao: 0, reacao: 0, evasao: 0,
            // Status
            saude: 0, energia: 0, fadiga: 0
        };

        console.log('🎯 RECALCULANDO BÔNUS DE APTIDÕES');
        console.log(`   Total de aptidões: ${companheiro.aptidoes ? companheiro.aptidoes.length : 0}`);

        // Se não há aptidões, limpar todos os bonus
        if (!companheiro.aptidoes || companheiro.aptidoes.length === 0) {
            console.log('   ⚠️ Sem aptidões, limpando bônus');
            this.limparBonusAptidoes();
            companheiro.bonusAptidoesAtuais = bonusAptidoes;
            return;
        }

        // Percorrer cada aptidão ATIVA e recalcular seus bonus
        companheiro.aptidoes.forEach(apt => {
            const aptidaoId = apt.id;
            const nivelAtual = apt.nivel;
            console.log(`\n   📍 Aptidão: ${apt.nome}`);
            console.log(`      ID: ${aptidaoId}, Nível: ${nivelAtual}`);
            
            const aptidaoVantagens = vantagensSystem.vantagensAptidoes[aptidaoId];

            if (!aptidaoVantagens) {
                console.warn(`      ⚠️ Não encontrada no sistema de vantagens`);
                return;
            }

            // Aplicar vantagens de TODOS os níveis até o nível atual (1, 2, 3, 4, 5...)
            for (let nivel = 1; nivel <= nivelAtual; nivel++) {
                const vantagem = aptidaoVantagens[nivel];
                if (!vantagem) {
                    console.log(`      ⊘ Nível ${nivel}: sem vantagem`);
                    continue;
                }

                console.log(`      📌 Nível ${nivel}: [${vantagem.tipo}] ${vantagem.valor}`);

                // Aplicar bônus baseado no tipo
                this.aplicarBonusVantagem(vantagem, aptidaoId, nivel, bonusAptidoes, vantagensSystem, companheiro);
            }
        });

        console.log('\n✅ Cálculo de bônus concluído');
        console.log('📊 Bônus finais:', bonusAptidoes);

        // Agora aplicar os bônus nos campos do modal
        this.aplicarBonusNosAtributos(bonusAptidoes, modal, companheiro);

        // ✅ DEPOIS de aplicar, guardar os bonus atuais no companheiro para próxima chamada
        companheiro.bonusAptidoesAtuais = { ...bonusAptidoes };
    }

    /**
     * Limpar bônus de aptidões (resetar para 0)
     */
    limparBonusAptidoes() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        console.log('🧹 Limpando bônus de aptidões...');

        // Atributos primários, secundários derivados e secundários - limpar SPAN de BONUS
        ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte', 
         'prontidao', 'ataque', 'defesa', 
         'precisao', 'reacao', 'evasao'].forEach(attr => {
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);
            if (spanBonus) {
                spanBonus.textContent = 0;
            }
        });

        // Status - RESETAR para zero antes de recalcular
        ['saude', 'energia', 'fadiga'].forEach(barra => {
            const inputExtra = modal.querySelector(`#comp-char-${barra}-extra`);
            if (inputExtra) {
                inputExtra.value = 0;
            }
        });

        console.log('🔄 Atualizando displays após limpeza...');

        // ✅ Atualizar displays (que chama automaticamente secundários)
        this.atualizarDisplaysAtributos();
        
        // ✅ Atualizar máximos dos status
        this.atualizarMaximoStatus();

        console.log('✅ Bônus limpos');
    }

    /**
     * Aplica bônus de uma vantagem específica
     */
    aplicarBonusVantagem(vantagem, aptidaoId, nivel, bonusAptidoes, vantagensSystem, companheiro) {
        if (!vantagem || !vantagem.tipo) {
            console.warn(`⚠️ Vantagem vazia ou sem tipo`);
            return;
        }

        const tipo = vantagem.tipo;
        const valor = vantagem.valor;

        console.log(`      📌 [aplicarBonusVantagem] Tipo: "${tipo}", Valor: "${valor}"`);
        if (tipo === 'bonus-opcional') {
            console.log(`         ⚠️ BONUS-OPCIONAL DETECTADO! valorOpcional: "${vantagem.valorOpcional}"`);
        }

        switch (tipo) {
            case 'bonus': {
                // Bônus simples: +5 Vitalidade
                const mapeado = this.mapearAtributoSimples(valor);
                if (mapeado) {
                    bonusAptidoes[mapeado.atributo] = (bonusAptidoes[mapeado.atributo] || 0) + mapeado.valor;
                    console.log(`      ✅ Aplicado: +${mapeado.valor} ${mapeado.atributo}`);
                } else {
                    console.warn(`      ❌ Não conseguiu mapear: "${valor}"`);
                }
                break;
            }

            case 'bonus-duplo': {
                // Bônus duplo: +1 Reação e +1 Evasão
                const mapeados = this.mapearBonusDuplo(valor);
                if (mapeados && mapeados.length > 0) {
                    mapeados.forEach(m => {
                        bonusAptidoes[m.atributo] = (bonusAptidoes[m.atributo] || 0) + m.valor;
                        console.log(`      ✅ Aplicado: +${m.valor} ${m.atributo}`);
                    });
                } else {
                    console.warn(`      ❌ Não conseguiu mapear duplo: "${valor}"`);
                }
                break;
            }

            case 'bonus-percentual': {
                // Bônus percentual: +20% Prontidão
                const mapeado = this.mapearBonusPercentual(valor);
                console.log(`      📊 Tentando mapear bonus-percentual: "${valor}" -> `, mapeado);
                
                if (mapeado && mapeado.atributo) {
                    // 🔧 CORRIGIDO: Calcular percentual sobre o valor ATUAL do atributo
                    const modal = document.getElementById(this.modalId);
                    let valorBase = 0;
                    
                    // Para QUALQUER atributo (primário ou secundário), ler do SPAN TOTAL
                    const spanTotal = modal?.querySelector(`#comp-char-${mapeado.atributo}-total`);
                    if (spanTotal) {
                        valorBase = parseInt(spanTotal.textContent) || 0;
                        console.log(`      📊 ✅ Lido ${mapeado.atributo}-total: ${valorBase}`);
                    } else {
                        // Fallback para base + extra
                        const inputBase = modal?.querySelector(`#comp-char-${mapeado.atributo}-base`);
                        const inputExtra = modal?.querySelector(`#comp-char-${mapeado.atributo}-extra`);
                        const base = inputBase ? parseInt(inputBase.value) || 0 : 0;
                        const extra = inputExtra ? parseInt(inputExtra.value) || 0 : 0;
                        valorBase = base + extra;
                        console.log(`      📊 Fallback ${mapeado.atributo}: ${base} base + ${extra} extra = ${valorBase}`);
                    }
                    
                    // Calcular bônus como percentual do valor base
                    const bonusAbsoluto = Math.round(valorBase * (mapeado.percentual / 100));
                    bonusAptidoes[mapeado.atributo] = (bonusAptidoes[mapeado.atributo] || 0) + bonusAbsoluto;
                    console.log(`      🔢 ${mapeado.atributo}: ${mapeado.percentual}% de ${valorBase} = +${bonusAbsoluto}`);
                } else {
                    console.warn(`      ❌ Não conseguiu mapear percentual: "${valor}"`);
                }
                break;
            }

            case 'bonus-opcional': {
                // ✅ Bônus opcional - alternar entre duas opções (COMPANHEIRO)
                if (!companheiro || !companheiro.id) {
                    console.warn(`⚠️ Companheiro inválido para bonus-opcional`);
                    break;
                }

                console.log(`      🔁 [BONUS-OPCIONAL] Companheiro ID: ${companheiro.id}, Aptidão: ${aptidaoId}, Nível: ${nivel}`);
                
                // 🔥 PRIMEIRO: Tentar ler do bonusOpcionalEstado da aptidão (para novo/edição)
                const aptidaoObj = companheiro.aptidoes?.find(a => a.id === aptidaoId);
                let ativo = aptidaoObj?.bonusOpcionalEstado?.[`nivel_${nivel}`] || null;
                
                // FALLBACK: Se não tiver no objeto, tentar localStorage (para companheiros salvos)
                if (!ativo) {
                    ativo = window.bonusOpcionalCompanheiro?.getBonusAtivo?.(companheiro.id, aptidaoId, nivel) || 'valor';
                }
                
                console.log(`      🔁 Estado ativo: "${ativo}" (fonte: ${aptidaoObj?.bonusOpcionalEstado ? 'objeto' : 'localStorage'})`);
                
                const bonusTexto = ativo === 'valor' ? valor : vantagem.valorOpcional;
                console.log(`      🔁 Texto a aplicar: "${bonusTexto}"`);
                
                const mapeado = this.mapearAtributoSimples(bonusTexto);
                if (mapeado) {
                    bonusAptidoes[mapeado.atributo] = (bonusAptidoes[mapeado.atributo] || 0) + mapeado.valor;
                    console.log(`      ✅ Aplicado (opcional): +${mapeado.valor} ${mapeado.atributo} (${bonusTexto})`);
                } else {
                    console.warn(`      ❌ Não conseguiu mapear opcional: "${bonusTexto}"`);
                }
                break;
            }

            case 'efeito':
                // Efeitos narrativos não geram bônus numéricos
                console.log(`      📝 Efeito narrativo: ${valor}`);
                break;

            default:
                console.warn(`⚠️ Tipo desconhecido: ${tipo}`);
        }
    }

    /**
     * Mapear bônus simples: "+5 Vitalidade" -> {atributo: "vitalidade", valor: 5}
     */
    mapearAtributoSimples(valor) {
        if (!valor) return null;

        // Tentar extrair número e atributo - usar padrão mais flexível
        const match = valor.match(/([+-]?\d+)\s+(.+)$/i);
        if (!match) {
            console.warn(`❌ Regex não capturou: "${valor}"`);
            return null;
        }

        const numeroStr = match[1];
        const atributoStr = match[2].toLowerCase().trim();
        const numero = parseInt(numeroStr);

        // Mapear nomes de atributos
        const mapeamento = {
            // Primários
            'forca': 'forca', 'força': 'forca',
            'vitalidade': 'vitalidade',
            'agilidade': 'agilidade',
            'inteligencia': 'inteligencia', 'inteligência': 'inteligencia',
            'percepcao': 'percepcao', 'percepção': 'percepcao',
            'sorte': 'sorte',
            // Secundários
            'precisao': 'precisao', 'precisão': 'precisao',
            'reacao': 'reacao', 'reação': 'reacao',
            'evasao': 'evasao', 'evasão': 'evasao',
            'prontidao': 'prontidao', 'prontidão': 'prontidao',
            'ataque': 'ataque',
            'defesa': 'defesa',
            // Status
            'saude': 'saude', 'saúde': 'saude',
            'energia': 'energia',
            'fadiga': 'fadiga'
        };

        const atributo = mapeamento[atributoStr];
        if (!atributo) {
            console.warn(`⚠️ Atributo não mapeado: "${atributoStr}"`);
            return null;
        }

        console.log(`   ✅ Mapeado: "${valor}" -> ${atributo} = ${numero}`);
        return { atributo, valor: numero };
    }

    /**
     * Mapear bônus duplo: "+1 Reação e +1 Evasão"
     */
    mapearBonusDuplo(valor) {
        if (!valor) return null;

        // Procurar por padrão "e" ou ","
        const partes = valor.split(/\s+e\s+|\s*,\s*/i);
        if (partes.length < 2) return null;

        return partes
            .map(parte => this.mapearAtributoSimples(parte.trim()))
            .filter(m => m !== null);
    }

    /**
     * Mapear bônus percentual: "+20% Prontidão"
     */
    mapearBonusPercentual(valor) {
        if (!valor) return null;

        // [\wáéíóúàâãõç]+ para capturar palavras com acentos
        const match = valor.match(/([+-]?\d+)%\s+([\wáéíóúàâãõç]+)/i);
        if (!match) return null;

        const percentual = parseInt(match[1]);
        const atributoStr = match[2].toLowerCase();

        const mapeamento = {
            // Secundários (manter nomes originais, não converter para primários)
            'prontidao': 'prontidao', 'prontidão': 'prontidao',
            'ataque': 'ataque',
            'defesa': 'defesa',
            'reacao': 'reacao', 'reação': 'reacao',
            'precisao': 'precisao', 'precisão': 'precisao',
            'evasao': 'evasao', 'evasão': 'evasao',
            // Primários (em caso de percentual)
            'percepcao': 'percepcao', 'percepção': 'percepcao',
            'agilidade': 'agilidade',
            'forca': 'forca', 'força': 'forca',
            'vitalidade': 'vitalidade',
            'inteligencia': 'inteligencia', 'inteligência': 'inteligencia',
            'sorte': 'sorte'
        };

        const atributo = mapeamento[atributoStr] || atributoStr;
        return { atributo, percentual };
    }

    /**
     * Aplicar bônus nos campos do modal
     */
    aplicarBonusNosAtributos(bonusAptidoes, modal, companheiro) {
        console.log('\n🎨 [aplicarBonusNosAtributos] APLICANDO BÔNUS NOS CAMPOS...');
        console.log('   Bônus a aplicar:', bonusAptidoes);
        console.log('   Companheiro:', companheiro.nome);

        // ✅ PASSO 1: ZERAR TODOS OS BONUS DOS ATRIBUTOS (spans)
        console.log('\n   [PASSO 1] Zerando todos os bônus...');
        ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte',
         'precisao', 'reacao', 'evasao',
         'prontidao', 'ataque', 'defesa'].forEach(attr => {
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);
            if (spanBonus) {
                spanBonus.textContent = 0;
                console.log(`      ✓ ${attr} zerado`);
            }
        });

        // ✅ PASSO 2: APLICAR NOVOS BONUS CALCULADOS NOS SPANS
        console.log('\n   [PASSO 2] Aplicando novos bônus...');
        ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'].forEach(attr => {
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);
            if (spanBonus) {
                const bonusValue = bonusAptidoes[attr] || 0;
                spanBonus.textContent = bonusValue;
                if (bonusValue !== 0) {
                    console.log(`      ✅ ${attr}: +${bonusValue}`);
                }
            }
        });

        ['precisao', 'reacao', 'evasao'].forEach(attr => {
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);
            if (spanBonus) {
                const bonusValue = bonusAptidoes[attr] || 0;
                spanBonus.textContent = bonusValue;
                if (bonusValue !== 0) {
                    console.log(`      ✅ ${attr}: +${bonusValue}`);
                }
            }
        });

        ['prontidao', 'ataque', 'defesa'].forEach(attr => {
            const spanBonus = modal.querySelector(`#comp-char-${attr}-bonus`);
            if (spanBonus) {
                const bonusValue = bonusAptidoes[attr] || 0;
                spanBonus.textContent = bonusValue;
                if (bonusValue !== 0) {
                    console.log(`      ✅ ${attr}: +${bonusValue}`);
                }
            }
        });

        console.log('\n   [PASSO 3] Aplicando bônus dos status...');
        ['saude', 'energia', 'fadiga'].forEach(barra => {
            const inputBonus = modal.querySelector(`#comp-char-${barra}-bonus`);
            if (inputBonus) {
                const bonusValue = bonusAptidoes[barra] || 0;
                inputBonus.value = bonusValue;
                console.log(`  ✅ ${barra} (bonus input): +${bonusValue}`);
            }
        });

        console.log('🔄 Atualizando displays e cálculos...');

        // ✅ Ordem correta de atualização:
        // 1. Atualizar displays de primários (que chama automaticamente secundários)
        this.atualizarDisplaysAtributos();
        
        // 2. Atualizar máximos dos status com os novos valores
        this.atualizarMaximoStatus();

        console.log('✅ Bônus aplicados com sucesso!');
    }

    /**
     * Renderizar aptidões adquiridas na aba
     */
    renderizarAptidoesAdquiridas(companheiro) {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const listAptidoes = modal.querySelector('#comp-aptidoes-personagem-list');
        if (!listAptidoes) {
            console.warn('⚠️ Container #comp-aptidoes-personagem-list não encontrado');
            return;
        }

        if (!companheiro.aptidoes || companheiro.aptidoes.length === 0) {
            listAptidoes.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma aptidão adquirida ainda</div>';
            return;
        }

        let html = '';
        
        // Header
        html += `
            <div class="comp-aptidoes-personagem-header">
                <div class="comp-aptidoes-header-col col-nome">Aptidão</div>
                <div class="comp-aptidoes-header-col col-nivel">Nível</div>
                <div class="comp-aptidoes-header-col col-bonus">Bônus</div>
                <div class="comp-aptidoes-header-col col-acoes">Ações</div>
            </div>
        `;
        
        // Rows
        companheiro.aptidoes.forEach((apt) => {
            const bonusAmount = Math.floor(apt.nivel / 2);
            const bonusText = bonusAmount > 0 ? `+${bonusAmount}` : '—';
            
            html += `
                <div class="comp-aptidoes-personagem-row" data-aptidao-id="${apt.id}">
                    <div class="comp-aptidoes-col col-nome">${apt.nome}</div>
                    <div class="comp-aptidoes-col col-nivel">${apt.nivel}</div>
                    <div class="comp-aptidoes-col col-bonus">${bonusText}</div>
                    <div class="comp-aptidoes-col col-acoes">
                        <button class="comp-aptidoes-action-btn" data-action="upgrade" data-id="${apt.id}" title="Aumentar nível">⬆️</button>
                        <button class="comp-aptidoes-action-btn" data-action="reset" data-id="${apt.id}" title="Resetar para nível 1">🔄</button>
                        <button class="comp-aptidoes-action-btn" data-action="remove" data-id="${apt.id}" title="Remover aptidão">❌</button>
                    </div>
                </div>
            `;
        });
        
        listAptidoes.innerHTML = html;
        
        // IMPORTANTE: Adicionar listeners aos botões
        this.setupAptidoesActionListeners(listAptidoes, companheiro);
        
        console.log('✅ Aptidões renderizadas:', companheiro.aptidoes.length);
    }

    /**
     * Configurar listeners para botões de ação das aptidões
     */
    setupAptidoesActionListeners(container, companheiro) {
        // Remover listener anterior se existir
        if (container._clickHandler) {
            container.removeEventListener('click', container._clickHandler);
        }

        // Criar novo handler com event delegation
        container._clickHandler = (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            e.preventDefault();
            e.stopPropagation();

            const action = btn.getAttribute('data-action');
            const aptidaoId = btn.getAttribute('data-id');
            const aptidao = companheiro.aptidoes.find(a => a.id === aptidaoId);

            if (!aptidao) {
                console.warn('⚠️ Aptidão não encontrada:', aptidaoId);
                return;
            }

            console.log(`🎯 Action: ${action}, Aptidão: ${aptidao.nome}, Nível: ${aptidao.nivel}`);

            if (action === 'upgrade') {
                // Verificar limite de máximo
                const elemCompMaximo = document.querySelector('#comp-aptidoes-maximo');
                const maximo = elemCompMaximo ? parseInt(elemCompMaximo.textContent) || 3 : 3;
                const totalNiveisAtual = companheiro.aptidoes.reduce((sum, apt) => sum + apt.nivel, 0);
                const totalAposUpgrade = totalNiveisAtual + 1;

                if (aptidao.nivel < 6) {
                    if (totalAposUpgrade > maximo) {
                        alert(`⚠️ Limite de pontos atingido!\n\nAtual: ${totalNiveisAtual}/${maximo}\nUpgrade daria: ${totalAposUpgrade}/${maximo}`);
                        return;
                    }

                    aptidao.nivel++;
                    console.log(`⬆️ Aptidão ${aptidao.nome} subiu para nível ${aptidao.nivel}`);
                    this.renderizarAptidoesAdquiridas(companheiro);
                    this.atualizarInfoAptidoesCompanheiro();
                    this.aplicarBonusAptidoesCompanheiro(companheiro); // 🎁 Recalcular bônus
                    // 🔥 FORÇAR RENDERIZAÇÃO DAS VANTAGENS APÓS ATUALIZAR APTIDÕES
                    console.log(`🔥 [DEBUG] Chamando renderizarVantagensDesbloqueadas após upgrade`);
                    this.renderizarVantagensDesbloqueadas(companheiro);
                } else {
                    alert('⚠️ Aptidão já está no nível máximo (6)');
                }
            } else if (action === 'reset') {
                if (confirm(`Resetar "${aptidao.nome}" para nível 1?`)) {
                    aptidao.nivel = 1;
                    console.log(`🔄 Aptidão ${aptidao.nome} resetada para nível 1`);
                    this.renderizarAptidoesAdquiridas(companheiro);
                    this.atualizarInfoAptidoesCompanheiro();
                    this.aplicarBonusAptidoesCompanheiro(companheiro); // 🎁 Recalcular bônus
                    // 🔥 FORÇAR RENDERIZAÇÃO DAS VANTAGENS APÓS RESETAR
                    console.log(`🔥 [DEBUG] Chamando renderizarVantagensDesbloqueadas após reset`);
                    this.renderizarVantagensDesbloqueadas(companheiro);
                }
            } else if (action === 'remove') {
                if (confirm(`Remover "${aptidao.nome}" do companheiro?`)) {
                    const idx = companheiro.aptidoes.indexOf(aptidao);
                    if (idx > -1) {
                        companheiro.aptidoes.splice(idx, 1);
                        console.log(`❌ Aptidão ${aptidao.nome} removida`);
                        this.renderizarAptidoesAdquiridas(companheiro);
                        this.atualizarInfoAptidoesCompanheiro();
                        this.aplicarBonusAptidoesCompanheiro(companheiro); // 🎁 Recalcular bônus
                        // 🔥 FORÇAR RENDERIZAÇÃO DAS VANTAGENS APÓS REMOVER
                        console.log(`🔥 [DEBUG] Chamando renderizarVantagensDesbloqueadas após remove`);
                        this.renderizarVantagensDesbloqueadas(companheiro);
                    }
                }
            }
        };

        // Adicionar listener
        container.addEventListener('click', container._clickHandler);
    }

    /**
     * Renderizar vantagens desbloqueadas na aba
     */
    renderizarVantagensDesbloqueadas(companheiro) {
        console.log('🔄 [renderizarVantagensDesbloqueadas] Iniciando com companheiro:', companheiro?.nome);
        
        // 🔥 FIX: Se companheiro.id é undefined, usar companheiroEmEdicao como fallback
        if (!companheiro.id && window.companheirosManager?.companheiroEmEdicao) {
            console.log('🔧 [renderizarVantagensDesbloqueadas] companheiro.id é undefined, usando companheiroEmEdicao:', window.companheirosManager.companheiroEmEdicao);
            companheiro.id = window.companheirosManager.companheiroEmEdicao;
        }
        
        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.warn('⚠️ Modal não encontrado:', this.modalId);
            return;
        }

        const listVantagens = modal.querySelector('#comp-aptidoes-vantagens-list');
        if (!listVantagens) {
            console.warn('⚠️ Container #comp-aptidoes-vantagens-list não encontrado');
            return;
        }

        if (!companheiro.aptidoes || companheiro.aptidoes.length === 0) {
            console.log('ℹ️ Nenhuma aptidão no companheiro');
            listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
            return;
        }

        console.log('📦 Aptidões do companheiro:', companheiro.aptidoes.map(a => `${a.nome}(${a.nivel})`));

        let html = '';
        
        const vantagensSystem = typeof window.vantagensAptidoesSystem !== 'undefined' ? 
            window.vantagensAptidoesSystem : null;
        
        if (!vantagensSystem) {
            console.error('❌ Sistema de vantagens não disponível');
            listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Sistema de vantagens não disponível</div>';
            return;
        }

        // Coletar vantagens dos níveis 1, 3, 5
        const vantagens = [];
        const vantagensAptidoes = vantagensSystem.vantagensAptidoes;
        
        companheiro.aptidoes.forEach(apt => {
            const aptidaoId = apt.id;
            const nivelAtual = apt.nivel;
            const aptidaoVantagens = vantagensAptidoes[aptidaoId];
            
            if (!aptidaoVantagens) {
                console.warn(`⚠️ Aptidão "${aptidaoId}" não encontrada em vantagensAptidoes`);
                return;
            }
            
            // Mostrar apenas níveis 1, 3, 5 que estão desbloqueados
            const niveisAMostrar = [1, 3, 5].filter(n => n <= nivelAtual);
            
            niveisAMostrar.forEach(nivel => {
                const vantagem = aptidaoVantagens[nivel];
                if (!vantagem) return;
                
                vantagens.push({
                    aptidaoId,
                    aptidaoNome: apt.nome,
                    nivel,
                    tipo: vantagem.tipo,
                    valor: vantagem.valor,
                    valorOpcional: vantagem.valorOpcional
                });
            });
        });
        
        // Renderizar cards de vantagens
        if (vantagens.length === 0) {
            html = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
        } else {
            vantagens.forEach(vant => {
                const tipoEmojis = {
                    'bonus': '💰',
                    'bonus-duplo': '⚡',
                    'bonus-percentual': '📊',
                    'bonus-opcional': '🔁',
                    'efeito': '📝'
                };
                const emoji = tipoEmojis[vant.tipo] || '•';
                
                // Determinar texto a mostrar (considerando estado de bonus-opcional)
                let textoEfeito = vant.valor;
                if (vant.tipo === 'bonus-opcional' && vant.valorOpcional) {
                    // 🔥 PRIMEIRO: Tentar ler do objeto aptidão (bonusOpcionalEstado)
                    const aptidaoNoCompanheiro = companheiro.aptidoes?.find(a => a.id === vant.aptidaoId);
                    let ativoAtualmente = aptidaoNoCompanheiro?.bonusOpcionalEstado?.[`nivel_${vant.nivel}`] || null;
                    
                    // FALLBACK: Se não tiver no objeto, ler do localStorage
                    if (!ativoAtualmente) {
                        ativoAtualmente = window.bonusOpcionalCompanheiro?.getBonusAtivo?.(companheiro.id, vant.aptidaoId, vant.nivel) || 'valor';
                    }
                    
                    textoEfeito = ativoAtualmente === 'valor' ? vant.valor : vant.valorOpcional;
                    console.log(`📖 [renderizarVantagensDesbloqueadas] ${vant.aptidaoId} nível ${vant.nivel}: estado = "${ativoAtualmente}" (fonte: ${aptidaoNoCompanheiro?.bonusOpcionalEstado ? 'objeto' : 'localStorage'}), textoEfeito = "${textoEfeito}"`);
                }
                
                // HTML base do card
                let cardHtml = `
                    <div class="comp-vantagem-card ${vant.tipo}">
                        <div class="comp-vantagem-header">
                            <span class="comp-vantagem-nome">${emoji} ${vant.aptidaoNome} - Nível ${vant.nivel}</span>
                        </div>
                        <div class="comp-vantagem-valor">${textoEfeito}</div>`;
                
                // Se é bonus-opcional, adicionar botão
                if (vant.tipo === 'bonus-opcional' && vant.valorOpcional) {
                    // 🔥 PRIMEIRO: Tentar ler do objeto aptidão (bonusOpcionalEstado)
                    const aptidaoNoCompanheiro = companheiro.aptidoes?.find(a => a.id === vant.aptidaoId);
                    let ativoAtualmente = aptidaoNoCompanheiro?.bonusOpcionalEstado?.[`nivel_${vant.nivel}`] || null;
                    
                    // FALLBACK: Se não tiver no objeto, ler do localStorage
                    if (!ativoAtualmente) {
                        ativoAtualmente = window.bonusOpcionalCompanheiro?.getBonusAtivo?.(companheiro.id, vant.aptidaoId, vant.nivel) || 'valor';
                    }
                    
                    const textoAtivo = ativoAtualmente === 'valor' ? vant.valor : vant.valorOpcional;
                    const titulo = `Alternar entre: ${vant.valor} e ${vant.valorOpcional}`;
                    
                    console.log(`🔘 [renderizarVantagensDesbloqueadas] Botão para ${vant.aptidaoId} nível ${vant.nivel}: ativoAtualmente="${ativoAtualmente}" (fonte: ${aptidaoNoCompanheiro?.bonusOpcionalEstado ? 'objeto' : 'localStorage'}), textoAtivo="${textoAtivo}"`);
                    
                    cardHtml += `
                        <div class="comp-vantagem-acoes">
                            <button class="btn-alternar-bonus-opcional-companheiro" 
                                    data-companheiro-id="${companheiro.id}"
                                    data-aptidao-id="${vant.aptidaoId}" 
                                    data-nivel="${vant.nivel}"
                                    title="${titulo}">
                              🔁 ${textoAtivo}
                            </button>
                        </div>`;
                }
                
                cardHtml += `</div>`;
                html += cardHtml;
            });
        }
        
        listVantagens.innerHTML = html;
        console.log('✅ Vantagens renderizadas:', vantagens.length);
        console.log('📋 Vantagens:', vantagens);
        
        // Configurar listeners para botões de alternância de bonus-opcional
        this.setupBonusOpcionaisListeners(listVantagens, companheiro);
    }

    /**
     * Configurar listeners para botões de bonus-opcional nas vantagens
     */
    setupBonusOpcionaisListeners(container, companheiro) {
        if (!container || !companheiro) {
            console.log(`⚠️ [setupBonusOpcionaisListeners] container ou companheiro inválido`);
            console.log(`   container:`, !!container);
            console.log(`   companheiro:`, companheiro);
            return;
        }
        
        const botoes = container.querySelectorAll('.btn-alternar-bonus-opcional-companheiro');
        console.log(`⚙️ [setupBonusOpcionaisListeners] Encontrados ${botoes.length} botões`);
        console.log(`   Companheiro ID: ${companheiro.id}, Nome: ${companheiro.nome}`);
        
        if (botoes.length === 0) {
            console.log(`⚠️ Nenhum botão de bonus-opcional encontrado`);
            return;
        }

        botoes.forEach((btn) => {
            // Remover listener antigo se existir
            if (btn._clickHandler) {
                btn.removeEventListener('click', btn._clickHandler);
            }

            let companeiroId = parseInt(btn.getAttribute('data-companheiro-id'));
            const aptidaoId = btn.getAttribute('data-aptidao-id');
            const nivel = parseInt(btn.getAttribute('data-nivel'));
            
            // 🔥 FIX: Se data-companheiro-id é NaN, usar companheiroEmEdicao como fallback
            if (isNaN(companeiroId) && window.companheirosManager?.companheiroEmEdicao) {
                console.log('🔧 [setupBonusOpcionaisListeners] data-companheiro-id é NaN, usando companheiroEmEdicao:', window.companheirosManager.companheiroEmEdicao);
                companeiroId = window.companheirosManager.companheiroEmEdicao;
            }
            
            btn._clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log(`\n╔════════════════════════════════════════╗`);
                console.log(`║ 🔁 CLIQUE EM BONUS-OPCIONAL            ║`);
                console.log(`╚════════════════════════════════════════╝`);
                console.log(`Aptidão: ${aptidaoId}, Nível: ${nivel}, Companheiro ID: ${companeiroId}`);
                
                const vantagensSystem = window.vantagensAptidoesSystem;
                if (!vantagensSystem) {
                    console.error('❌ Sistema de vantagens não disponível');
                    return;
                }

                // Obter informações da vantagem ANTES de alternar
                const vantagensAptidoes = vantagensSystem.vantagensAptidoes || {};
                const vantagem = vantagensAptidoes[aptidaoId]?.[nivel];
                
                console.log(`1️⃣ Vantagem encontrada:`, vantagem);
                
                if (!vantagem || vantagem.tipo !== 'bonus-opcional' || !vantagem.valorOpcional) {
                    console.error(`❌ Vantagem não é bonus-opcional: ${aptidaoId} nível ${nivel}`);
                    console.log(`   Tipo:`, vantagem?.tipo);
                    console.log(`   valorOpcional:`, vantagem?.valorOpcional);
                    return;
                }

                const modal = document.getElementById(this.modalId);
                if (!modal) {
                    console.error(`❌ Modal não encontrada`);
                    return;
                }

                // 🔥 PASSO 0: OBTER O ESTADO ANTERIOR E REMOVER O BÔNUS ANTIGO
                console.log(`\n🔥 PASSO 0: Removendo bônus anterior...`);
                const estadoAnterior = window.bonusOpcionalCompanheiro?.getBonusAtivo?.(companeiroId, aptidaoId, nivel);
                console.log(`   Estado anterior: "${estadoAnterior}"`);

                if (estadoAnterior) {
                    const bonusAnterior = estadoAnterior === 'valor' ? vantagem.valor : vantagem.valorOpcional;
                    console.log(`   Bônus anterior a remover: "${bonusAnterior}"`);
                    
                    const mapeadoAnterior = this.mapearAtributoSimples(bonusAnterior);
                    if (mapeadoAnterior) {
                        const spanBonusAnterior = modal.querySelector(`#comp-char-${mapeadoAnterior.atributo}-bonus`);
                        if (spanBonusAnterior) {
                            const valorAnterior = parseInt(spanBonusAnterior.textContent) || 0;
                            spanBonusAnterior.textContent = 0;
                            console.log(`      ✅ Removido: -${mapeadoAnterior.valor} ${mapeadoAnterior.atributo}`);
                            
                            // Atualizar total do atributo anterior
                            const spanTotalAnterior = modal.querySelector(`#comp-char-${mapeadoAnterior.atributo}-total`);
                            if (spanTotalAnterior) {
                                const inputBase = modal.querySelector(`#comp-char-${mapeadoAnterior.atributo}-base`);
                                const inputExtra = modal.querySelector(`#comp-char-${mapeadoAnterior.atributo}-extra`);
                                if (inputBase) {
                                    const base = parseInt(inputBase.value) || 0;
                                    const extra = parseInt(inputExtra?.value) || 0;
                                    const novoTotal = base + extra; // Sem o bônus que foi removido
                                    spanTotalAnterior.textContent = novoTotal;
                                    console.log(`      ✅ Total ${mapeadoAnterior.atributo} atualizado: ${novoTotal}`);
                                }
                            }
                        }
                    }
                }

                console.log(`\n2️⃣ Alternando bônus...`);
                // Alternar o estado via bonusOpcionalCompanheiro
                const novoEstado = window.bonusOpcionalCompanheiro?.alternarBonus?.(companeiroId, aptidaoId, nivel);
                console.log(`   Novo estado retornado:`, novoEstado);
                
                if (!novoEstado) {
                    console.error('❌ Erro ao alternar - sem retorno');
                    return;
                }
                console.log(`✅ Alternância bem-sucedida: ${novoEstado}`);

                // 🔥 SALVAR ESTADO NA APTIDÃO EM bonusOpcionalEstado
                console.log(`\n🔥 SALVANDO ESTADO NA APTIDÃO...`);
                try {
                    const aptidaoNoCompanheiro = window.companheiro_temp?.aptidoes?.find(a => a.id === aptidaoId);
                    if (aptidaoNoCompanheiro) {
                        if (!aptidaoNoCompanheiro.bonusOpcionalEstado) {
                            aptidaoNoCompanheiro.bonusOpcionalEstado = {};
                        }
                        aptidaoNoCompanheiro.bonusOpcionalEstado[`nivel_${nivel}`] = novoEstado;
                        console.log(`✅ Estado salvo na aptidão:`, aptidaoNoCompanheiro.bonusOpcionalEstado);
                    } else {
                        console.warn(`⚠️ Aptidão não encontrada em companheiro_temp: ${aptidaoId}`);
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao salvar estado na aptidão:', e.message);
                }
                
                // Atualizar texto do botão
                const novoTexto = novoEstado === 'valor' ? vantagem.valor : vantagem.valorOpcional;
                btn.textContent = `🔁 ${novoTexto}`;
                console.log(`3️⃣ Texto do botão atualizado para: "${novoTexto}"`);
                
                // Atualizar card de vantagem (elemento .comp-vantagem-valor)
                const card = btn.closest('.comp-vantagem-card');
                if (card) {
                    const efeito = card.querySelector('.comp-vantagem-valor');
                    if (efeito) {
                        efeito.textContent = novoTexto;
                        console.log(`4️⃣ Card de vantagem atualizado`);
                    }
                }
                
                // 🔥 FORÇAR APLICAÇÃO DO NOVO BONUS
                console.log(`\n5️⃣ 🔥 FORÇANDO APLICAÇÃO DO NOVO BONUS...`);

                // ✅ LER O NOVO ESTADO
                console.log(`   PASSO 1: Lendo novo estado...`);
                const estadoAgora = window.bonusOpcionalCompanheiro?.getBonusAtivo?.(companeiroId, aptidaoId, nivel);
                console.log(`      Estado atual: "${estadoAgora}"`);

                // ✅ DETERMINAR QUAL BÔNUS APLICAR
                const bonusParaAplicar = estadoAgora === 'valor' ? vantagem.valor : vantagem.valorOpcional;
                console.log(`   PASSO 2: Bônus a aplicar: "${bonusParaAplicar}"`);

                // ✅ MAPEAR O BÔNUS
                const mapeado = this.mapearAtributoSimples(bonusParaAplicar);
                if (!mapeado) {
                    console.error(`❌ Não conseguiu mapear: "${bonusParaAplicar}"`);
                    return;
                }
                console.log(`   PASSO 3: Mapeado:`, mapeado);

                // ✅ APLICAR DIRETAMENTE NO SPAN
                console.log(`   PASSO 4: Aplicando bônus no DOM...`);
                const spanBonusDestino = modal.querySelector(`#comp-char-${mapeado.atributo}-bonus`);
                if (spanBonusDestino) {
                    spanBonusDestino.textContent = mapeado.valor;
                    console.log(`      ✅ ${mapeado.atributo}: 0 → ${mapeado.valor}`);
                } else {
                    console.error(`❌ Span de bônus não encontrado: #comp-char-${mapeado.atributo}-bonus`);
                }

                // ✅ PASSO 5: ATUALIZAR TOTAIS (BASE + EXTRA + BONUS)
                console.log(`   PASSO 5: Atualizando totais...`);
                const inputBase = modal.querySelector(`#comp-char-${mapeado.atributo}-base`);
                const inputExtra = modal.querySelector(`#comp-char-${mapeado.atributo}-extra`);
                const spanTotal = modal.querySelector(`#comp-char-${mapeado.atributo}-total`);
                
                if (inputBase && spanTotal) {
                    const base = parseInt(inputBase.value) || 0;
                    const extra = parseInt(inputExtra?.value) || 0;
                    const bonus = mapeado.valor;
                    const total = base + extra + bonus;
                    
                    spanTotal.textContent = total;
                    console.log(`      ✅ Total ${mapeado.atributo}: ${base} + ${extra} + ${bonus} = ${total}`);
                }

                console.log(`\n✅ BONUS ALTERNADO COM SUCESSO!\n`);
            };

            btn.addEventListener('click', btn._clickHandler);
        });
    }
    /**
     * 🔄 SINCRONIZAR ATRIBUTOS DA ABA DE HABILIDADES COM ABA DE CARACTERÍSTICAS
     * Atualiza os valores dos atributos na aba de habilidades em tempo real
     * Chamado sempre que atributos são alterados na aba de características
     */
    /**
     * Limpar listas da aba de aptidões
     * ✅ Renderiza listas vazias quando abre modal novo
     */
    limparListasAbaAptidoes() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        console.log('🧹 [limparListasAbaAptidoes] Limpando listas da aba de aptidões...');

        // Limpar lista de aptidões adquiridas
        const listAptidoes = modal.querySelector('#comp-aptidoes-personagem-list');
        if (listAptidoes) {
            listAptidoes.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma aptidão adquirida ainda</div>';
            console.log('   ✅ Lista de aptidões limpa');
        }

        // Limpar lista de vantagens desbloqueadas
        const listVantagens = modal.querySelector('#comp-aptidoes-vantagens-list');
        if (listVantagens) {
            listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
            console.log('   ✅ Lista de vantagens limpa');
        }

        console.log('✅ Listas da aba de aptidões limpas com sucesso');
    }

    atualizarAtributosAbaHabilidades() {
        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.warn('⚠️ Modal não encontrada ao tentar atualizar atributos da aba de habilidades');
            return;
        }

        console.log('🔄 [atualizarAtributosAbaHabilidades] Sincronizando atributos...');

        // Lista de atributos a sincronizar
        const atributosSync = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao'];

        atributosSync.forEach(attr => {
            // Obter valor TOTAL da aba de características
            const valorTotal = this.obterTotalAtributo(modal, attr);
            
            // Atualizar span correspondente na aba de habilidades com ID único
            const spanHabilidades = modal.querySelector(`#companheiro-arts-habilidades-${attr}`);
            if (spanHabilidades) {
                spanHabilidades.textContent = valorTotal;
                console.log(`   ✅ ${attr}: ${valorTotal}`);
            } else {
                console.warn(`   ⚠️ Elemento #companheiro-arts-habilidades-${attr} não encontrado`);
            }
        });

        console.log('✅ Atributos da aba de habilidades atualizados');
    }
}

// Instância global
window.companheirosModalController = new CompanheirosModalController();

console.log('✅ CompanheirosModalController carregado');
