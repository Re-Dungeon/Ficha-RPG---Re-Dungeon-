/* ════════════════════════════════════════════════════════════════════════════════ */
/* GLOBAL-STATE.JS - Estado Central Único da Aplicação                              */
/* ════════════════════════════════════════════════════════════════════════════════ */

/**
 * 🎯 OBJETO CENTRAL GLOBAL
 * 
 * Esta é a ÚNICA FONTE DE VERDADE para toda a aplicação.
 * Todos os dados são armazenados aqui e apenas aqui.
 * Nenhum dado é obtido da interface DOM para salvamento.
 * 
 * Estrutura:
 * - Meta: Informações do arquivo e sistema
 * - Personagem: Dados principais do personagem
 * - Sistemas Especiais: Cultivação, Corpo Imortal, etc
 * - Companheiros: Ficha completa de cada companheiro
 */
class GlobalState {
    constructor() {
        this.version = '3.0.0';
        this.state = this.criarEstadoPadrao();
    }

    /**
     * Cria o estado padrão completo da aplicação
     */
    criarEstadoPadrao() {
        return {
            // ══════════════════════════════════════════════════════════════
            // 📋 META - Metadados do Sistema
            // ══════════════════════════════════════════════════════════════
            meta: {
                versaoSistema: '3.0.0',
                dataUltimoSalvo: null,
                identificadorUnico: this.gerarUnicoId(),
                aplicacaoVersao: '1.0.0',
                formato: 'redungeon-ficha-3.0'
            },

            // ══════════════════════════════════════════════════════════════
            // 👤 PERSONAGEM PRINCIPAL
            // ══════════════════════════════════════════════════════════════
            personagem: {
                // --- Informações Básicas ---
                info: {
                    nome: 'Aventureiro Desconhecido',
                    titulo: 'Sem Título',
                    classe: 'Guerreiro',
                    raca: 'Humano',
                    origem: 'Desconhecida',
                    afiliacao: 'Nenhuma',
                    statusNarrativo: 'Ativo',
                    notasAdicionais: '',
                    background: ''
                },

                // --- Imagem do Personagem ---
                imagem: {
                    imagemId: null,  // Referência para IndexedDB
                    base64: null,    // Apenas em memória durante edição
                    versao: 1
                },

                // --- Atributos Primários ---
                atributosPrimarios: {
                    forca: { base: 10, extra: 0, total: 10, bonus: 0 },
                    agilidade: { base: 10, extra: 0, total: 10, bonus: 0 },
                    resistencia: { base: 10, extra: 0, total: 10, bonus: 0 },
                    inteligencia: { base: 10, extra: 0, total: 10, bonus: 0 },
                    sabedoria: { base: 10, extra: 0, total: 10, bonus: 0 },
                    carisma: { base: 10, extra: 0, total: 10, bonus: 0 }
                },

                // --- Atributos Secundários (Derivados) ---
                atributosSecundarios: {
                    defesa: { base: 0, extra: 0, total: 0, bonus: 0 },
                    acuracia: { base: 0, extra: 0, total: 0, bonus: 0 },
                    dano: { base: 0, extra: 0, total: 0, bonus: 0 },
                    velocidade: { base: 0, extra: 0, total: 0, bonus: 0 },
                    regeneracao: { base: 0, extra: 0, total: 0, bonus: 0 },
                    controle: { base: 0, extra: 0, total: 0, bonus: 0 }
                },

                // --- Status Global (Barras) ---
                status: {
                    saude: {
                        atual: 100,
                        maxima: 100,
                        percentual: 100
                    },
                    energia: {
                        atual: 50,
                        maxima: 50,
                        percentual: 100
                    },
                    fadiga: {
                        atual: 0,
                        maxima: 100,
                        percentual: 0
                    }
                },

                // --- Pontos Disponíveis ---
                pontosDisponiveis: {
                    aptidoes: 0,
                    habilidades: 0,
                    atributos: 0,
                    corpo_imortal: 0
                },

                // --- Aptidões ---
                aptidoes: {
                    lista: [],  // Array de objetos aptidão
                    ganhas: 0,
                    maximo: 6,
                    atributoProxima: 10,
                    bonusOpcionais: {}  // Armazena estado de bônus opcionais
                },

                // --- Habilidades/Artes ---
                habilidades: {
                    lista: [],  // Array de objetos habilidade
                    ativas: [],  // IDs das habilidades ativas
                    categoriasDisponiveis: {}
                },

                // --- Núcleos e Essência ---
                nucleos: {
                    lista: [],  // Array de núcleos
                    ativo: null,  // ID do núcleo ativo
                    essencia: {
                        quantidade: 0,
                        variaveiInternas: {}
                    }
                },

                // --- Inventário ---
                inventario: {
                    itens: [],  // Array completo de itens
                    armazenamentos: [],  // Array de armazenamentos
                    capacidadeTotal: 0,
                    espacoUsado: 0,
                    espacoLivre: 0,
                    pesoPorItem: {},  // Mapeamento de peso
                    raridades: {}  // Distribuição por raridade
                },

                // --- Treinamento ---
                treinamento: {
                    xp: {
                        forcaXp: 0,
                        agilidadeXp: 0,
                        resistenciaXp: 0,
                        inteligenciaXp: 0,
                        sabedoriaXp: 0,
                        carismaXp: 0
                    },
                    niveis: {
                        forca: 1,
                        agilidade: 1,
                        resistencia: 1,
                        inteligencia: 1,
                        sabedoria: 1,
                        carisma: 1
                    },
                    limites: {
                        forcaLimite: 100,
                        agilidadeLimite: 100,
                        resistenciaLimite: 100,
                        inteligenciaLimite: 100,
                        sabedoriaLimite: 100,
                        carismaLimite: 100
                    }
                },

                // --- Condições ---
                condicoes: {
                    buffs: [],  // Array de buffs ativos
                    debuffs: [],  // Array de debuffs ativos
                    duracoes: {}  // Duração de cada condição
                }
            },

            // ══════════════════════════════════════════════════════════════
            // 🧿 SISTEMA DE CULTIVAÇÃO
            // ══════════════════════════════════════════════════════════════
            cultivacao: {
                ativoMundo: 'murim',  // Qual mundo está ativo
                murim: {
                    reino: 1,
                    subnivelAtual: 0,
                    subnivelMaximo: 9,
                    xpAtual: 0,
                    xpProximoNivel: 100,
                    historico: []
                },
                elderGods: {
                    rank: 1,
                    nivel: 1,
                    xp: 0,
                    historicoRompimentos: []
                },
                borealLine: {
                    rank: 1,
                    progressoInterno: {},
                    subreinos: {}
                },
                dantian: {
                    inferior: { atual: 0, maximo: 1000 },
                    medio: { atual: 0, maximo: 1000 },
                    superior: { atual: 0, maximo: 1000 },
                    total: 0,
                    preenchimento: 0
                },
                meridianos: {
                    desbloqueados: [],
                    ativos: []
                },
                marEspiritual: {
                    quantidade: 0,
                    maximo: 10000,
                    barras: {}
                },
                tecnicaCultivo: {
                    nome: '',
                    dado: '',
                    descricao: ''
                }
            },

            // ══════════════════════════════════════════════════════════════
            // 🏛️ SISTEMA DE CORPO IMORTAL
            // ══════════════════════════════════════════════════════════════
            corpoImortal: {
                pontosDisponiveis: 0,
                pontosDistribuidos: 0,
                melhorias: [],  // Array de melhorias aplicadas
                limitePorFuncao: {},
                upgrades: {
                    // Exemplo: forca_1: { aplicado: true, custo: 10 }
                }
            },

            // ══════════════════════════════════════════════════════════════
            // 🌍 SISTEMA DE REPUTAÇÃO
            // ══════════════════════════════════════════════════════════════
            reputacao: {
                mundo: 0,
                regiao: 0,
                facoes: {},
                historico: [],
                lastModified: null
            },

            // ══════════════════════════════════════════════════════════════
            // 🐾 COMPANHEIROS
            // ══════════════════════════════════════════════════════════════
            companheiros: {
                lista: [],  // Array de companheiros - CADA UM TEM FICHA COMPLETA
                totalCompanheiros: 0,
                ativoAtual: null  // ID do companheiro em edição
                // Estrutura de cada companheiro:
                // {
                //   id: unique_id,
                //   nome: string,
                //   classe: string,
                //   raca: string,
                //   origem: string,
                //   atributosPrimarios: { ... },
                //   atributosSecundarios: { ... },
                //   status: { saude: {...}, energia: {...}, fadiga: {...} },
                //   habilidades: { lista: [...], ativas: [...] },
                //   nucleos: { lista: [...], ativo: null, essencia: {...} },
                //   inventario: { itens: [...], armazenamentos: [...], capacidadeTotal, espacoUsado, espacoLivre },
                //   treinamento: { xp: {...}, niveis: {...}, limites: {...} },
                //   imagem: { imagemId: null, base64: null },
                //   condicoes: { buffs: [...], debuffs: [...], duracoes: {} }
                // }
            },

            // ══════════════════════════════════════════════════════════════
            // 📍 INTERFACE / NAVEGAÇÃO
            // ══════════════════════════════════════════════════════════════
            interface: {
                abaHorizontalAtiva: 'atributos',
                abaVerticalAtiva: 'info',
                popupAberto: null,
                estadoAbasAnterior: {}
            }
        };
    }

    /**
     * Cria a estrutura base de características para um novo companheiro
     * 
     * @returns {Object} Estrutura de características do companheiro
     */
    criarCaracteristicasCompanheiroBase() {
        return {
            // --- Informações Básicas ---
            nome: 'Novo Companheiro',
            tipo: 'Mascote',  // Mascote, Companheiro, Espírito, Invocação, Pacto
            nivel: 1,
            raca: 'Desconhecida',
            pontosDistribuir: 0,
            
            // --- Descrição ---
            descricao: '',
            notas: '',
            
            // --- Imagem ---
            imagem: {
                imagemId: null,
                versao: 1
            },
            
            // --- Atributos Primários ---
            atributosPrimarios: {
                forca: { base: 10, extra: 0, total: 10, bonus: 0 },
                vitalidade: { base: 10, extra: 0, total: 10, bonus: 0 },
                agilidade: { base: 10, extra: 0, total: 10, bonus: 0 },
                inteligencia: { base: 10, extra: 0, total: 10, bonus: 0 },
                sabedoria: { base: 10, extra: 0, total: 10, bonus: 0 },
                carisma: { base: 10, extra: 0, total: 10, bonus: 0 }
            },
            
            // --- Atributos Secundários ---
            atributosSecundarios: {
                prontidao: { base: 0, extra: 0, total: 0, bonus: 0 },
                ataque: { base: 0, extra: 0, total: 0, bonus: 0 },
                defesa: { base: 0, extra: 0, total: 0, bonus: 0 },
                reacao: { base: 0, extra: 0, total: 0, bonus: 0 },
                precisao: { base: 0, extra: 0, total: 0, bonus: 0 },
                evasao: { base: 0, extra: 0, total: 0, bonus: 0 }
            },
            
            // --- Status (Barras) ---
            status: {
                saude: {
                    atual: 100,
                    maxima: 100,
                    extra: 0,
                    bonus: 0
                },
                energia: {
                    atual: 50,
                    maxima: 50,
                    extra: 0,
                    bonus: 0
                },
                fadiga: {
                    atual: 0,
                    maxima: 100,
                    extra: 0,
                    bonus: 0
                }
            }
        };
    }

    /**
     * Cria a estrutura base completa de um companheiro (todas as abas)
     * 
     * @param {Object} dadosCaracteristicas - Dados de características para mesclar
     * @returns {Object} Estrutura completa do companheiro
     */
    criarCompanheiroBase(dadosCaracteristicas = {}) {
        const caracteristicas = { ...this.criarCaracteristicasCompanheiroBase(), ...dadosCaracteristicas };
        
        return {
            id: this.gerarIdCompanheiro(),
            
            // ✅ ABA 1: CARACTERÍSTICAS
            caracteristicas: caracteristicas,
            
            // ⏳ ABA 2: APTIDÕES (vazio por enquanto)
            aptidoesCompanheiro: {
                lista: [],
                ganhas: 0,
                maximo: 3,
                atributoPróxima: '—'
            },
            
            // ⏳ ABA 3: HABILIDADES (vazio por enquanto)
            habilidadesCompanheiro: {
                lista: [],
                ativas: []
            },
            
            // ⏳ ABA 4: INVENTÁRIO (vazio por enquanto)
            inventarioCompanheiro: {
                itens: [],
                armazenamentos: [],
                capacidadeTotal: 0,
                espacoUsado: 0,
                espacoLivre: 0
            }
        };
    }

    /**
     * Gera um ID único para um companheiro
     * 
     * @returns {string} ID único
     */
    gerarIdCompanheiro() {
        return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Gera um ID único para o arquivo
     */
    gerarUnicoId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obtém o estado completo
     */
    getState() {
        return this.state;
    }

    /**
     * Obtém uma parte específica do estado
     */
    getPart(caminho) {
        const partes = caminho.split('.');
        let valor = this.state;
        for (const parte of partes) {
            if (valor && typeof valor === 'object' && parte in valor) {
                valor = valor[parte];
            } else {
                return null;
            }
        }
        return valor;
    }

    /**
     * Atualiza uma parte do estado
     */
    updatePart(caminho, valor) {
        const partes = caminho.split('.');
        const chave = partes.pop();
        let obj = this.state;

        for (const parte of partes) {
            if (!(parte in obj)) {
                obj[parte] = {};
            }
            obj = obj[parte];
        }

        obj[chave] = valor;
        return true;
    }

    /**
     * Atualiza múltiplas partes
     */
    updateMultiple(atualizacoes) {
        for (const [caminho, valor] of Object.entries(atualizacoes)) {
            this.updatePart(caminho, valor);
        }
        return true;
    }

    /**
     * Carrega um novo estado completo (importação)
     */
    loadState(novoEstado) {
        // Validar versão mínima
        if (!novoEstado.meta || !novoEstado.meta.versaoSistema) {
            throw new Error('Arquivo inválido: versão do sistema não encontrada');
        }

        // Mesclar com estado padrão para preencher campos faltantes
        this.state = this.merge(this.criarEstadoPadrao(), novoEstado);
        
        // Atualizar timestamp de carregamento
        this.state.meta.dataUltimoSalvo = new Date().toISOString();

        return true;
    }

    /**
     * Mescla dois objetos recursivamente
     */
    merge(padrao, customizado) {
        const resultado = { ...padrao };

        for (const chave in customizado) {
            if (customizado.hasOwnProperty(chave)) {
                if (
                    typeof customizado[chave] === 'object' &&
                    customizado[chave] !== null &&
                    !Array.isArray(customizado[chave]) &&
                    typeof padrao[chave] === 'object' &&
                    padrao[chave] !== null &&
                    !Array.isArray(padrao[chave])
                ) {
                    // Recursivamente mesclar objetos
                    resultado[chave] = this.merge(padrao[chave], customizado[chave]);
                } else {
                    // Usar valor customizado
                    resultado[chave] = customizado[chave];
                }
            }
        }

        return resultado;
    }

    /**
     * Atualiza o timestamp de salvo
     */
    atualizarTimestamp() {
        this.state.meta.dataUltimoSalvo = new Date().toISOString();
    }

    /**
     * Obtém informações de meta
     */
    getMetaInfo() {
        const meta = this.state.meta;
        const personagem = this.state.personagem.info;
        return {
            ...meta,
            nomePersonagem: personagem.nome,
            classe: personagem.classe,
            raca: personagem.raca
        };
    }
}

/**
 * INSTÂNCIA GLOBAL ÚNICA
 * Criada antes de qualquer outro script
 */
if (typeof window !== 'undefined') {
    window.globalState = new GlobalState();
    window.__APP_DEBUG__ = false;
    window.debugLog = function(...args) {
        if (window.__APP_DEBUG__) {
            console.log(...args);
        }
    };
    window.setAppDebug = function(enabled) {
        window.__APP_DEBUG__ = Boolean(enabled);
        console.info(`🔧 App debug mode ${window.__APP_DEBUG__ ? 'ON' : 'OFF'}`);
    };
    console.log('✅ GlobalState inicializado (v3.0.0)');
}
