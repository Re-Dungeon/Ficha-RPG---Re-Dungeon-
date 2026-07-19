/**
 * ════════════════════════════════════════════════════════════════════════════════
 * SISTEMA DE SALVAMENTO E IMPORTAÇÃO DE FICHA - RPG
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema profissional e modular para salvar e importar fichas de RPG em JSON.
 * 
 * Características:
 * - Coleta dados de múltiplos módulos da ficha
 * - Exporta como arquivo JSON único
 * - Importa e restaura dados automaticamente
 * - Validação de estrutura JSON
 * - Modular e extensível
 * - Zero dependências externas
 */

class SistemaFicha {
    constructor() {
        this.versao = '1.0.0';
        this.nomeArquivo = 'ficha_personagem.json';
        this.estruturaEsperada = [
            'versao',
            'personagem',
            'atributos',
            'aptidoes',
            'habilidades',
            'inventario',
            'treinamento',
            'companheiro',
            'cultivo',
            'corpoImortal',
            'loja',
            'sorte', // Campo de sorte
            'sorteHistorico', // ✨ NOVO: Histórico de Sorte
            'condicoes', // ✨ NOVO: Condições ativas
            'classe',
            'raca',
            'veiasAstrais', // ✨ NOVO: Estado das Veias Astrais
            'popupInfo' // ✨ NOVO: Dados do popup-info
        ];
        this.init();
    }

    /**
     * Inicializa o sistema de salvamento/importação.
     */
    init() {
        try {
            this.vincularBotoes();
        } catch (erro) {
            console.error('Erro ao inicializar SistemaFicha:', erro);
        }
    }
    /**
     * Vincula os botões aos listeners
     */
    vincularBotoes() {
        const btnSalvar = document.getElementById('route-salvar');
        const btnImportar = document.getElementById('route-importar');
        
        // Criar input file dinamicamente se não existir
        let inputArquivo = document.getElementById('input-importar-ficha');
        if (!inputArquivo) {
            inputArquivo = document.createElement('input');
            inputArquivo.id = 'input-importar-ficha';
            inputArquivo.type = 'file';
            inputArquivo.accept = '.json';
            inputArquivo.style.display = 'none';
            document.body.appendChild(inputArquivo);
        }

        if (btnSalvar) {
            btnSalvar.addEventListener('click', async () => await this.salvarFicha());
        }

        if (btnImportar) {
            btnImportar.addEventListener('click', () => {
                if (inputArquivo) inputArquivo.click();
            });
        }

        if (inputArquivo) {
            inputArquivo.addEventListener('change', (e) => this.importarFicha(e));
        }
    }

    /**
     * ════════════════════════════════════════════════════════════════════════════════
     * COLETA DE DADOS - GETTERS
     * ════════════════════════════════════════════════════════════════════════════════
     */

    /**
     * 👤 COLETA DADOS DO MÓDULO PERSONAGEM (CORRIGIDO)
     * ═════════════════════════════════════════════════════
     * Coleta de elementos de TEXTO (não inputs HTML)
     * - nome, titulo, classe, raca: textContent (não value)
     * - imagem: img src (não value)
     */
    coletarPersonagem() {
        try {
            const nome = document.getElementById('personagem-nome')?.textContent || '';
            const titulo = document.getElementById('personagem-titulo')?.textContent || '';
            const classe = document.getElementById('personagem-classe')?.textContent || '';
            const raca = document.getElementById('personagem-raca')?.textContent || '';
            const imagemElem = document.getElementById('personagem-imagem');
            const imagem = imagemElem?.src || '';

            console.log('👤 Personagem coletado:', { nome, titulo, classe, raca, imagem });

            return {
                nome: nome,
                titulo: titulo,
                classe: classe,
                raca: raca,
                imagem: imagem
            };
        } catch (erro) {
            console.error('❌ Erro ao coletar personagem:', erro);
            return {
                nome: '',
                titulo: '',
                classe: '',
                raca: '',
                imagem: ''
            };
        }
    }

    /**
     * 📊 COLETA DADOS DO MÓDULO ATRIBUTOS (CORRIGIDO v2)
     * ═══════════════════════════════════════════════════
     * ⚠️ IMPORTANTE: Primários e Secundários vêm do AppState!
     * O AtributosConfigModal é apenas uma UI para editar.
     * 
     * - Atributos primários: do AppState.atributos.primarios
     * - Atributos secundários: do AppState.atributos.secundarios
     * - Status: do StatusConfigModal.state.tempValues
     * - Reputação: do ReputacaoModal.tempValues
     */
    coletarAtributos() {
        try {
            const state = window.appState?.getState() || {};
            
            // ═══ ATRIBUTOS PRIMÁRIOS (do AppState!) ═══
            const primarios = state.atributos?.primarios || {
                forca: { base: 0, extra: 0, bonus: 0, total: 0 },
                vitalidade: { base: 0, extra: 0, bonus: 0, total: 0 },
                agilidade: { base: 0, extra: 0, bonus: 0, total: 0 },
                inteligencia: { base: 0, extra: 0, bonus: 0, total: 0 },
                percepcao: { base: 0, extra: 0, bonus: 0, total: 0 },
                sorte: { base: 0, extra: 0, bonus: 0, total: 0 }
            };

            console.log('✅ Primários coletados DO APPSTATE:', primarios);

            // ═══ ATRIBUTOS SECUNDÁRIOS (do AppState) ═══
            const secundarios = state.atributos?.secundarios || {
                prontidao: { base: 0, extra: 0, bonus: 0, total: 0 },
                ataque: { base: 0, extra: 0, bonus: 0, total: 0 },
                defesa: { base: 0, extra: 0, bonus: 0, total: 0 },
                reacao: { base: 0, extra: 0, bonus: 0, total: 0 },
                precisao: { base: 0, extra: 0, bonus: 0, total: 0 },
                evasao: { base: 0, extra: 0, bonus: 0, total: 0 }
            };

            console.log('✅ Secundários coletados:', secundarios);

            // ═══ STATUS (do StatusConfigModal) ═══
            const statusValues = window.statusConfigModal?.state?.tempValues || {};
            const barras = {
                hp: statusValues.hp || { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
                energia: statusValues.energy || { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
                fadiga: statusValues.fatigue || { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 }
            };

            console.log('✅ Status coletados:', barras);

            // ═══ REPUTAÇÃO V2 (novo formato com fama e temor) ═══
            let reputacao = { 
                mundo: { fama: 0, temor: 0, valor: 0 },
                regiao: { fama: 0, temor: 0, valor: 0 }
            };

            // Tentar obter dados de reputação V2 primeiro (novo formato)
            if (window.reputacaoV2 && typeof window.reputacaoV2.dados === 'object') {
                console.log('✅ Coletando ReputacaoV2 (novo formato)');
                reputacao = window.reputacaoV2.dados;
            } else if (window.reputacaoModal?.tempValues) {
                // Fallback para ReputacaoModal (compatibilidade)
                console.log('⚠️ Coletando ReputacaoModal (compatibilidade)');
                const modal = window.reputacaoModal.tempValues;
                reputacao = {
                    mundo: modal.mundo || 0,
                    regiao: modal.regiao || 0
                };
            } else if (window.stateManager && typeof window.stateManager.getReputation === 'function') {
                // Fallback para StateManager
                console.log('⚠️ Coletando StateManager (compatibilidade)');
                const rep = window.stateManager.getReputation();
                if (rep && rep.mundo) {
                    reputacao = {
                        mundo: rep.mundo,
                        regiao: rep.regiao
                    };
                }
            }

            console.log('✅ Reputação coletada (V2):', reputacao);

            // ═══ DADOS DO PERSONAGEM ═══
            const personagem = {
                nome: document.getElementById('personagem-nome')?.textContent || '',
                titulo: document.getElementById('personagem-titulo')?.textContent || '',
                classe: document.getElementById('personagem-classe')?.textContent || '',
                raca: document.getElementById('personagem-raca')?.textContent || '',
                imagem: document.getElementById('personagem-imagem')?.src || ''
            };

            console.log('✅ Personagem coletado:', personagem);

            // 🎯 Estrutura completa a ser salva
            const resultado = {
                primarios,
                secundarios,
                personagem,
                barras,
                reputacao
            };

            console.log('✅ COLETA COMPLETA:', resultado);
            return resultado;

        } catch (erro) {
            console.error('❌ Erro ao coletar atributos:', erro);
            return {};
        }
    }

    /**
     * Coleta dados do módulo Aptidões
     */
    /**
     * 🎯 COLETA DADOS DE APTIDÕES (NOVO SISTEMA)
     * ════════════════════════════════════════════════════════════════════════════════
     * Coleta do AptidoesManager - Sistema baseado em botões
     * Dados estruturados:
     * - aptidoesPersonagem: [ { id, nome, nivel }, ... ]
     * - ganhas: número de aptidões ganha
     * - vantagens: [ { aptidaoId, aptidaoNome, nivel, tipo, valor, ... }, ... ]
     * - bonusOpcionaisEstado: { chave: "valor"|"valorOpcional", ... }
     */
    coletarAptidoes() {
        try {
            const dados = {
                ganhas: 0,
                aptidoesPersonagem: [],
                vantagens: [],
                bonusOpcionaisEstado: {}
            };

            // ✅ PRIORIDADE 1: Tentar coletar do localStorage (mais confiável)
            if (window.localStorageManager) {
                try {
                    const storageData = window.localStorageManager.loadAptidoes();
                    if (storageData && storageData.personagemList) {
                        console.log('✅ Aptidões coletadas do localStorage:', storageData);
                        
                        dados.ganhas = storageData.ganhas || 0;
                        dados.aptidoesPersonagem = storageData.personagemList || [];
                        
                        // Coleta vantagens desbloqueadas
                        if (window.vantagensAptidoesSystem && typeof window.vantagensAptidoesSystem.obterVantagensDesbloqueadas === 'function') {
                            dados.vantagens = window.vantagensAptidoesSystem.obterVantagensDesbloqueadas() || [];
                            console.log('✅ Vantagens coletadas:', dados.vantagens.length);
                        }
                        
                        // ✨ NOVO: Coletar estado de bônus opcionais
                        if (window.vantagensAptidoesSystem && typeof window.vantagensAptidoesSystem.exportarEstadoBonusOpcionais === 'function') {
                            dados.bonusOpcionaisEstado = window.vantagensAptidoesSystem.exportarEstadoBonusOpcionais();
                            console.log('✅ Estado de bônus opcionais coletado:', dados.bonusOpcionaisEstado);
                        }
                        
                        return dados;
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao coletar do localStorage:', e);
                }
            }

            // ✅ FALLBACK: Tentar coletar do AptidoesManager
            if (window.aptidoesManager) {
                console.log('📦 Coletando do AptidoesManager...');
                
                dados.ganhas = window.aptidoesManager.configAptidoes?.ganhas || 0;
                dados.aptidoesPersonagem = window.aptidoesManager.aptidoesPersonagem || [];
                
                // Coletar vantagens
                if (typeof window.aptidoesManager.getVantagens === 'function') {
                    const vantagensRaw = window.aptidoesManager.getVantagens();
                    dados.vantagens = vantagensRaw.map(v => ({
                        aptidaoId: v.aptidaoId,
                        aptidaoNome: v.nome,
                        nivel: v.nivel,
                        tipo: v.tipo || 'bonus',
                        valor: v.efeito || v.narrativa,
                        narrativa: v.narrativa || ''
                    }));
                    console.log('✅ Vantagens coletadas do manager:', dados.vantagens.length);
                }
                
                // ✨ NOVO: Coletar estado de bônus opcionais
                if (window.vantagensAptidoesSystem && typeof window.vantagensAptidoesSystem.exportarEstadoBonusOpcionais === 'function') {
                    dados.bonusOpcionaisEstado = window.vantagensAptidoesSystem.exportarEstadoBonusOpcionais();
                    console.log('✅ Estado de bônus opcionais coletado:', dados.bonusOpcionaisEstado);
                }
                
                console.log('✅ Aptidões coletadas do manager:', dados);
                return dados;
            }

            console.warn('⚠️ Nenhuma fonte de dados de aptidões disponível');
            return dados;

        } catch (erro) {
            console.error('❌ Erro ao coletar aptidões:', erro);
            return {
                ganhas: 0,
                aptidoesPersonagem: [],
                vantagens: [],
                bonusOpcionaisEstado: {}
            };
        }
    }

    /**
     * Coleta dados do módulo Habilidades
     */
    /**
     * ⚔️ COLETA DADOS DE HABILIDADES/ARTS (SISTEMA COMPLETO)
     * ════════════════════════════════════════════════════════════════════════════════
     * Coleta do ArtsSystemManager - Sistema de Arts completo
     * Dados estruturados:
     * - limiteArts: número máximo de arts que pode ter
     * - artsAtivas: [ { id, name, coreId, status, ... }, ... ]
     * - artsBloqueadas: [ { id, name, status: 'blocked', ... }, ... ]
     * - nucleos: [ { id, name, concept, image, ... }, ... ]
     * - variacoes: Armazenadas dentro de cada art
     */
    coletarHabilidades() {
        try {
            const dados = {
                limiteArts: 0,
                artsAtivas: [],
                artsBloqueadas: [],
                nucleos: [],
                variações: []
            };

            let character = null;
            
            console.log('🔍 [coletarHabilidades] Iniciando coleta...');
            console.log('   window.artsSystem disponível:', !!window.artsSystem);
            
            // ✅ PRIORIDADE 1: Tentar coletar do ArtsSystemManager (em memória)
            if (window.artsSystem && window.artsSystem.character) {
                character = window.artsSystem.character;
                console.log('✅ [coletarHabilidades] Usando window.artsSystem.character');
                console.log('   Personagem:', character.name, '| Núcleos:', character.cores?.length || 0, '| Arts:', character.arts?.length || 0);
            } else {
                // PRIORIDADE 2: Carregar do localStorage do Arts System (redungeon_character)
                try {
                    const stored = localStorage.getItem('redungeon_character');
                    console.log('📦 Tentando carregar de localStorage (redungeon_character)...');
                    
                    if (stored) {
                        const parsedData = JSON.parse(stored);
                        console.log('✅ localStorage.redungeon_character encontrado. Estrutura:', Object.keys(parsedData));
                        
                        // Se veio com versionamento: { version, timestamp, data: {...} }
                        let charJson = parsedData.data || parsedData;
                        console.log('📋 Chaves de charJson:', Object.keys(charJson));
                        
                        // Extrair núcleos
                        if (Array.isArray(charJson.cores) && charJson.cores.length > 0) {
                            dados.nucleos = charJson.cores.map(core => ({
                                id: core.id,
                                name: core.name,
                                concept: core.concept,
                                visualForm: core.visualForm,
                                description: core.description,
                                image: core.image,
                                baseBonus: core.baseBonus || {},
                                coreType: core.coreType || '',
                                createdAt: core.createdAt
                            }));
                            console.log(`✅ Núcleos coletados do localStorage: ${dados.nucleos.length}`);
                        } else {
                            console.log('⚠️ Nenhum núcleo encontrado em charJson.cores');
                        }
                        
                        // Extrair arts (ativas + bloqueadas)
                        if (Array.isArray(charJson.arts) && charJson.arts.length > 0) {
                            const artsAtivas = [];
                            const artsBloqueadas = [];
                            
                            charJson.arts.forEach(art => {
                                const artData = {
                                    id: art.id,
                                    name: art.name,
                                    coreId: art.coreId,
                                    type: art.type,
                                    domain: art.domain,
                                    cooldown: art.cooldown,
                                    duration: art.duration,
                                    range: art.range,
                                    targets: art.targets,
                                    cost: art.cost,
                                    description: art.description,
                                    status: art.status,
                                    image: art.image,
                                    artType: art.artType,
                                    action: art.action,
                                    damage: art.damage,
                                    reload: art.reload,
                                    effects: art.effects || {},
                                    createdAt: art.createdAt,
                                    variations: Array.isArray(art.variations) ? art.variations.map(v => ({
                                        id: v.id,
                                        name: v.name,
                                        type: v.type,
                                        action: v.action,
                                        domain: v.domain,
                                        cost: v.cost,
                                        reload: v.reload,
                                        damage: v.damage,
                                        duration: v.duration,
                                        range: v.range,
                                        targets: v.targets,
                                        description: v.description,
                                        image: v.image,
                                        effects: v.effects || {},
                                        createdAt: v.createdAt
                                    })) : []
                                };
                                
                                if (art.status === 'active') {
                                    artsAtivas.push(artData);
                                } else if (art.status === 'blocked') {
                                    artsBloqueadas.push(artData);
                                }
                            });
                            
                            dados.artsAtivas = artsAtivas;
                            dados.artsBloqueadas = artsBloqueadas;
                            
                            console.log(`✅ Arts coletadas do localStorage - Ativas: ${artsAtivas.length}, Bloqueadas: ${artsBloqueadas.length}`);
                        } else {
                            console.log('⚠️ Nenhuma art encontrada em charJson.arts');
                        }
                        
                        // Calcular limite de arts
                        if (charJson.attributes) {
                            const attrs = charJson.attributes;
                            if (attrs.forca !== undefined && attrs.vitalidade !== undefined) {
                                dados.limiteArts = Math.round(
                                    (attrs.forca + attrs.vitalidade + attrs.agilidade + attrs.inteligencia + attrs.percepcao) * 0.0293
                                );
                                console.log(`📊 Limite calculado: ${dados.limiteArts}`);
                            }
                        }
                        
                        console.log('✅ Coleta de localStorage concluída:', dados);
                        return dados;
                    } else {
                        console.warn('⚠️ localStorage.redungeon_character é NULL');
                    }
                } catch (e) {
                    console.error('❌ Erro ao carregar de localStorage:', e);
                    console.error('   Stack:', e.stack);
                }
            }
            
            // Se temos character em memória, processar
            if (character) {
                try {
                    console.log('⚔️ Coletando dados de habilidades...', character);
                    
                    // 1. LIMITE DE ARTS
                    if (typeof RulesEngine !== 'undefined' && typeof RulesEngine.calculateMaxArts === 'function') {
                        dados.limiteArts = RulesEngine.calculateMaxArts(character);
                        console.log(`📊 Limite de arts: ${dados.limiteArts}`);
                    }

                    // 2. NÚCLEOS
                    if (Array.isArray(character.cores) && character.cores.length > 0) {
                        dados.nucleos = character.cores.map(core => ({
                            id: core.id,
                            name: core.name,
                            concept: core.concept,
                            visualForm: core.visualForm,
                            description: core.description,
                            image: core.image,
                            baseBonus: core.baseBonus || {},
                            coreType: core.coreType || '',
                            createdAt: core.createdAt
                        }));
                        console.log(`✅ Núcleos coletados: ${dados.nucleos.length}`);
                    }

                    // 3. ARTS ATIVAS E BLOQUEADAS
                    if (Array.isArray(character.arts) && character.arts.length > 0) {
                        const artsAtivas = [];
                        const artsBloqueadas = [];

                        character.arts.forEach(art => {
                            const artData = {
                                id: art.id,
                                name: art.name,
                                coreId: art.coreId,
                                type: art.type,
                                domain: art.domain,
                                cooldown: art.cooldown,
                                duration: art.duration,
                                range: art.range,
                                targets: art.targets,
                                cost: art.cost,
                                description: art.description,
                                status: art.status,
                                image: art.image,
                                artType: art.artType,
                                action: art.action,
                                damage: art.damage,
                                reload: art.reload,
                                effects: art.effects || {},
                                createdAt: art.createdAt,
                                // Variações
                                variations: (art.variations || []).map(v => ({
                                    id: v.id,
                                    name: v.name,
                                    type: v.type,
                                    action: v.action,
                                    domain: v.domain,
                                    cost: v.cost,
                                    reload: v.reload,
                                    damage: v.damage,
                                    duration: v.duration,
                                    range: v.range,
                                    targets: v.targets,
                                    description: v.description,
                                    image: v.image,
                                    effects: v.effects || {},
                                    createdAt: v.createdAt
                                }))
                            };

                            if (art.status === 'active') {
                                artsAtivas.push(artData);
                            } else if (art.status === 'blocked') {
                                artsBloqueadas.push(artData);
                            }
                        });

                        dados.artsAtivas = artsAtivas;
                        dados.artsBloqueadas = artsBloqueadas;
                        
                        console.log(`✅ Arts ativas: ${artsAtivas.length}`);
                        console.log(`✅ Arts bloqueadas: ${artsBloqueadas.length}`);
                    }

                    console.log('✅ [coletarHabilidades] Coleta concluída:', dados);
                    return dados;

                } catch (e) {
                    console.error('❌ Erro ao coletar habilidades:', e);
                    console.error('   Stack:', e.stack);
                    return dados;
                }
            }

            console.warn('⚠️ Character object não disponível em nenhuma fonte');
            return dados;

        } catch (erro) {
            console.error('❌ Erro ao coletar habilidades:', erro);
            return {
                limiteArts: 0,
                artsAtivas: [],
                artsBloqueadas: [],
                nucleos: [],
                variações: []
            };
        }
    }

    /**
     * Coleta dados do módulo Inventário
     */
    /**
     * 📦 COLETA DADOS COMPLETOS DO INVENTÁRIO
     * ════════════════════════════════════════════════════════════════════════════════
     * Coleta:
     * - Itens (com todas as propriedades: nome, quantidade, espaço, qualidade, tipo, nivel, roll, extra, imagem, etc)
     * - Armazenamentos (nome, bonusEspaco, descricao, imagem)
     * - Resumo de espaço (total, usado, livre, status)
     * 
     * Nota: Não recalcula espaço (é derivado de atributos + armazenamentos)
     */
    coletarInventario() {
        console.log('📦 [coletarInventario] Iniciando coleta...');
        
        const dados = {
            itens: [],
            armazenamentos: [],
            espacoInfo: {
                total: 0,
                usado: 0,
                livre: 0,
                sobrecarga: false
            }
        };

        // ✅ PRIORIDADE 1: Tentar coletar do InventarioManager (em memória)
        if (window.inventarioManager) {
            console.log('✅ [coletarInventario] Usando window.inventarioManager');
            try {
                // Coletar itens
                const itens = window.inventarioManager.obterItens();
                if (Array.isArray(itens) && itens.length > 0) {
                    dados.itens = itens.map(item => ({
                        id: item.id,
                        nome: item.nome,
                        quantidade: item.quantidade,
                        espaco: item.espaco,
                        qualidade: item.qualidade || 'comum',
                        tipo: item.tipo || '',
                        nivel: item.nivel || 1,
                        roll: item.roll || '',
                        extra: item.extra || '',
                        imagemURL: item.imagemURL || '',
                        habilidade: item.habilidade || '',
                        historia: item.historia || '',
                        equipado: item.equipado || false,
                        criadoEm: item.criadoEm
                    }));
                    console.log(`✅ Itens coletados: ${dados.itens.length}`);
                } else {
                    console.log('ℹ️  Nenhum item no inventário');
                }

                // Coletar armazenamentos
                const armazenamentos = window.inventarioManager.obterArmazenamentos();
                if (Array.isArray(armazenamentos) && armazenamentos.length > 0) {
                    dados.armazenamentos = armazenamentos.map(arm => ({
                        id: arm.id,
                        nome: arm.nome,
                        bonusEspaco: arm.bonusEspaco || 0,
                        descricao: arm.descricao || '',
                        imagemURL: arm.imagemURL || '',
                        criadoEm: arm.criadoEm
                    }));
                    console.log(`✅ Armazenamentos coletados: ${dados.armazenamentos.length}`);
                } else {
                    console.log('ℹ️  Nenhum armazenamento no inventário');
                }

                // Coletar resumo de espaço
                const resumo = window.inventarioManager.obterResumoEspaco();
                dados.espacoInfo = {
                    total: resumo.total || 0,
                    usado: resumo.usado || 0,
                    livre: resumo.livre || 0,
                    sobrecarga: resumo.sobrecarga || false
                };
                console.log(`📊 Espaço coletado - Total: ${resumo.total}, Usado: ${resumo.usado}, Livre: ${resumo.livre}`);

                console.log('✅ [coletarInventario] Coleta concluída:', dados);
                return dados;

            } catch (e) {
                console.error('❌ Erro ao coletar do InventarioManager:', e);
                console.error('   Stack:', e.stack);
            }
        }

        // ✅ PRIORIDADE 2: Carregar do localStorage (fallback)
        console.log('📦 Tentando carregar de localStorage (fallback)...');
        try {
            const inventarioSalvo = localStorage.getItem('inventario');
            if (inventarioSalvo) {
                const parsed = JSON.parse(inventarioSalvo);
                console.log('✅ Inventário carregado do localStorage');
                return parsed;
            }
        } catch (e) {
            console.warn('⚠️  Erro ao carregar de localStorage:', e.message);
        }

        console.warn('⚠️  Nenhum inventário encontrado em InventarioManager ou localStorage');
        return dados;
    }

    /**
     * Coleta dados do módulo Treinamento
     */
    /**
     * 🏋️ COLETA DADOS COMPLETOS DO SISTEMA DE TREINAMENTO
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * Coleta de:
     * - 6 atributos treináveis (Força, Vitalidade, Agilidade, Percepção, Inteligência, Sorte)
     * - Para cada atributo: nivel, xpAtual, xpNecessaria, obstaculoAtual
     * - Histórico de treinamentos
     * 
     * Fonte: window.appState (StateManager)
     * Estrutura: {
     *   atributos: {
     *     forca: { nivel, xpAtual, xpNecessaria, obstaculoAtual },
     *     vitalidade: { ... },
     *     ...
     *   },
     *   historico: []
     * }
     * ═══════════════════════════════════════════════════════════════════════════════
     */
    coletarTreinamento() {
        console.log('📚 [coletarTreinamento] Iniciando coleta...');

        // Validar acesso ao StateManager
        if (!window.appState) {
            console.error('❌ StateManager não disponível');
            return {};
        }

        // Obter estado completo
        const state = window.appState.getState();
        
        // Validar se há dados de treinamento
        if (!state.treinamento) {
            console.warn('⚠️ Sem dados de treinamento no state');
            return {
                atributos: {
                    forca: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    vitalidade: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    agilidade: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    percepcao: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    inteligencia: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    sorte: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 }
                },
                historico: []
            };
        }

        // Coletar dados - preservar estrutura completa
        const treinamento = {
            atributos: {
                forca: { ...state.treinamento.atributos.forca },
                vitalidade: { ...state.treinamento.atributos.vitalidade },
                agilidade: { ...state.treinamento.atributos.agilidade },
                percepcao: { ...state.treinamento.atributos.percepcao },
                inteligencia: { ...state.treinamento.atributos.inteligencia },
                sorte: { ...state.treinamento.atributos.sorte }
            },
            historico: state.treinamento.historico || []
        };

        // Logging detalhado
        console.log('✅ Atributos coletados: 6');
        Object.entries(treinamento.atributos).forEach(([atributo, dados]) => {
            console.log(`   📊 ${atributo}: Nv. ${dados.nivel} | XP ${dados.xpAtual}/${dados.xpNecessaria} | Obs. ${dados.obstaculoAtual}`);
        });
        console.log(`✅ Histórico: ${treinamento.historico.length} registros`);

        return treinamento;
    }

    /**
     * Coleta dados do módulo Companheiro (Pet)
     * ✅ CORRIGIDO: Coleta do localStorage (redungeon_companheiros) 
     */
    async coletarCompanheiro() {
        try {
            // 1️⃣ PRIMEIRO: Tentar do localStorage diretamente (onde está armazenado)
            const companheiroJson = localStorage.getItem('redungeon_companheiros');
            if (companheiroJson) {
                try {
                    const companheiros = JSON.parse(companheiroJson);
                    if (Array.isArray(companheiros) && companheiros.length > 0) {
                        let companheiro = companheiros[0];
                        console.log('✅ Companheiro coletado do localStorage:', companheiro.nome);
                        
                        // 🔥 SE TEM imagemDbId MAS NÃO TEM imagem (base64), recuperar do IndexedDB
                        if (companheiro.imagemDbId && !companheiro.imagem && window.companheirosImagemDB) {
                            try {
                                console.log('🔍 Recuperando imagem do IndexedDB:', companheiro.imagemDbId);
                                const imagemData = await window.companheirosImagemDB.recuperarImagem(companheiro.id);
                                if (imagemData && imagemData.dados) {
                                    companheiro.imagem = imagemData.dados; // Adicionar base64 à exportação
                                    console.log('✅ Imagem do IndexedDB adicionada ao export');
                                }
                            } catch (e) {
                                console.warn('⚠️ Não foi possível recuperar imagem do IndexedDB:', e);
                                // Continuar sem a imagem
                            }
                        }
                        
                        // Retornar ESTRUTURA COMPLETA
                        return {
                            // Dados Básicos
                            nome: companheiro.nome || '',
                            tipo: companheiro.tipo || 'MASCOTE',
                            nivel: companheiro.nivel || 1,
                            experiencia: companheiro.experiencia || 0,
                            raca: companheiro.raca || '',
                            descricao: companheiro.descricao || '',
                            notas: companheiro.notas || '',
                            imagem: companheiro.imagem || null,
                            imagemDbId: companheiro.imagemDbId || null,
                            
                            // Barras de Status
                            saude: companheiro.saude || { valor: 100, extra: 0, bonus: 0, maxima: 100 },
                            energia: companheiro.energia || { valor: 100, extra: 0, bonus: 0, maxima: 100 },
                            fadiga: companheiro.fadiga || { valor: 0, extra: 0, bonus: 0, maxima: 100 },
                            
                            // Atributos Primários
                            atributos: companheiro.atributos || {
                                forca: { base: 0, extra: 0 },
                                vitalidade: { base: 0, extra: 0 },
                                agilidade: { base: 0, extra: 0 },
                                inteligencia: { base: 0, extra: 0 },
                                percepcao: { base: 0, extra: 0 },
                                sorte: { base: 0, extra: 0 }
                            },
                            
                            // Atributos Secundários
                            secundarios: companheiro.secundarios || {
                                prontidao: { base: 0, extra: 0 },
                                ataque: { base: 0, extra: 0 },
                                defesa: { base: 0, extra: 0 },
                                reacao: { base: 0, extra: 0 },
                                precisao: { base: 0, extra: 0 },
                                evasao: { base: 0, extra: 0 }
                            },
                            
                            // Aptidões e Habilidades
                            aptidoes: companheiro.aptidoes || [],
                            vantagens: companheiro.vantagens || [],
                            habilidades: companheiro.habilidades || [],
                            aptitudesStats: companheiro.aptitudesStats || {
                                atual: 0,
                                ganhas: 0,
                                maximo: 3,
                                atributoPróxima: 'FOR'
                            },
                            
                            // ✨ NOVO: Status de vida
                            morto: companheiro.morto || false
                        };
                    }
                } catch (parseError) {
                    console.warn('⚠️ Erro ao fazer parse do localStorage de companheiros:', parseError);
                }
            }
            
            // 2️⃣ SEGUNDO: Tentar do companheirosManager
            if (window.companheirosManager && window.companheirosManager.companheiros && window.companheirosManager.companheiros.length > 0) {
                console.log('📦 Coletando do companheirosManager...');
                const companheiro = window.companheirosManager.companheiros[0];
                
                return {
                    nome: companheiro.nome || '',
                    tipo: companheiro.tipo || 'MASCOTE',
                    nivel: companheiro.nivel || 1,
                    experiencia: companheiro.experiencia || 0,
                    raca: companheiro.raca || '',
                    descricao: companheiro.descricao || '',
                    notas: companheiro.notas || '',
                    imagem: companheiro.imagem || null,
                    imagemDbId: companheiro.imagemDbId || null,
                    saude: companheiro.saude || { valor: 100, extra: 0, bonus: 0, maxima: 100 },
                    energia: companheiro.energia || { valor: 100, extra: 0, bonus: 0, maxima: 100 },
                    fadiga: companheiro.fadiga || { valor: 0, extra: 0, bonus: 0, maxima: 100 },
                    atributos: companheiro.atributos || {
                        forca: { base: 0, extra: 0 },
                        vitalidade: { base: 0, extra: 0 },
                        agilidade: { base: 0, extra: 0 },
                        inteligencia: { base: 0, extra: 0 },
                        percepcao: { base: 0, extra: 0 },
                        sorte: { base: 0, extra: 0 }
                    },
                    secundarios: companheiro.secundarios || {
                        prontidao: { base: 0, extra: 0 },
                        ataque: { base: 0, extra: 0 },
                        defesa: { base: 0, extra: 0 },
                        reacao: { base: 0, extra: 0 },
                        precisao: { base: 0, extra: 0 },
                        evasao: { base: 0, extra: 0 }
                    },
                    aptidoes: companheiro.aptidoes || [],
                    vantagens: companheiro.vantagens || [],
                    habilidades: companheiro.habilidades || [],
                    aptitudesStats: companheiro.aptitudesStats || {
                        atual: 0,
                        ganhas: 0,
                        maximo: 3,
                        atributoPróxima: 'FOR'
                    },
                    
                    // ✨ NOVO: Status de vida
                    morto: companheiro.morto || false
                };
            }
            
            // 3️⃣ TERCEIRO: Fallback para campos HTML (nova estrutura)
            console.warn('⚠️ Coletando dos campos HTML...');
            
            // Helper para ler entrada de atributo
            const lerAtributo = (atributo) => ({
                base: parseInt(document.getElementById(`comp-char-${atributo}-base`)?.value) || 0,
                extra: parseInt(document.getElementById(`comp-char-${atributo}-extra`)?.value) || 0
            });
            
            // Helper para ler barra
            const lerBarra = (barra) => ({
                valor: parseInt(document.getElementById(`comp-char-${barra}-valor`)?.value) || 0,
                extra: parseInt(document.getElementById(`comp-char-${barra}-extra`)?.value) || 0,
                bonus: parseInt(document.getElementById(`comp-char-${barra}-bonus`)?.value) || 0,
                maxima: parseInt(document.getElementById(`comp-char-${barra}-maxima`)?.value) || 100
            });
            
            // ✅ Helper para extrair imagem (URL ou base64 do preview)
            const lerImagem = () => {
                const modal = document.getElementById('modalNovoCompanheiro');
                if (!modal) {
                    // Fallback rápido
                    const urlInput = document.getElementById('comp-char-imagem-url')?.value;
                    return urlInput ? urlInput : null;
                }
                
                const urlTab = modal.querySelector('#comp-char-imagem-url-tab');
                const uploadTab = modal.querySelector('#comp-char-imagem-upload-tab');
                const uploadInput = modal.querySelector('#comp-char-imagem-upload');
                const preview = modal.querySelector('#comp-char-imagem-preview');
                
                // 1️⃣ Se upload tab está ativo, extrair do preview (base64)
                if (uploadTab && uploadTab.checked) {
                    // Tentar pegar do upload input (arquivo)
                    if (uploadInput && uploadInput.files && uploadInput.files.length > 0) {
                        // Tem arquivo selecionado, mas ainda não foi processado
                        // Neste caso, o preview já tem a imagem renderizada
                    }
                    
                    // Extrair do preview (que foi renderizado ao selecionar arquivo)
                    if (preview) {
                        const img = preview.querySelector('img');
                        if (img && img.src) {
                            console.log('📷 Imagem capturada do UPLOAD (preview)');
                            return img.src; // base64
                        }
                    }
                }
                
                // 2️⃣ Se URL tab está ativo, usar o input
                const urlInput = modal.querySelector('#comp-char-imagem-url')?.value;
                if (urlInput && urlInput.trim()) {
                    console.log('📷 Imagem capturada da URL');
                    return urlInput;
                }
                
                // 3️⃣ Último fallback: check preview para qualquer imagem
                if (preview) {
                    const img = preview.querySelector('img');
                    if (img && img.src) {
                        console.log('📷 Imagem capturada do PREVIEW (fallback)');
                        return img.src;
                    }
                }
                
                console.log('⚠️ Nenhuma imagem encontrada para exportar');
                return null;
            };
            
            return {
                nome: document.getElementById('comp-char-nome')?.value || '',
                tipo: document.getElementById('comp-char-tipo')?.value || 'MASCOTE',
                nivel: parseInt(document.getElementById('comp-char-nivel-input')?.value) || 1,
                experiencia: 0,
                raca: document.getElementById('comp-char-raca-btn')?.getAttribute('data-raca') || '',
                descricao: document.getElementById('comp-char-descricao')?.value || '',
                notas: document.getElementById('comp-char-notas')?.value || '',
                imagem: lerImagem(),
                imagemDbId: null,
                saude: lerBarra('saude'),
                energia: lerBarra('energia'),
                fadiga: lerBarra('fadiga'),
                atributos: {
                    forca: lerAtributo('forca'),
                    vitalidade: lerAtributo('vitalidade'),
                    agilidade: lerAtributo('agilidade'),
                    inteligencia: lerAtributo('inteligencia'),
                    percepcao: lerAtributo('percepcao'),
                    sorte: lerAtributo('sorte')
                },
                secundarios: {
                    prontidao: lerAtributo('prontidao'),
                    ataque: lerAtributo('ataque'),
                    defesa: lerAtributo('defesa'),
                    reacao: lerAtributo('reacao'),
                    precisao: lerAtributo('precisao'),
                    evasao: lerAtributo('evasao')
                },
                aptidoes: [],
                vantagens: [],
                habilidades: [],
                aptitudesStats: {
                    atual: 0,
                    ganhas: 0,
                    maximo: 3,
                    atributoPróxima: 'FOR'
                }
            };
        } catch (erro) {
            console.error('❌ Erro ao coletar dados do companheiro:', erro);
            return {
                nome: '',
                tipo: 'MASCOTE',
                nivel: 1,
                experiencia: 0,
                raca: '',
                descricao: '',
                notas: '',
                imagem: null,
                imagemDbId: null,
                saude: { valor: 100, extra: 0, bonus: 0, maxima: 100 },
                energia: { valor: 100, extra: 0, bonus: 0, maxima: 100 },
                fadiga: { valor: 0, extra: 0, bonus: 0, maxima: 100 },
                atributos: {
                    forca: { base: 0, extra: 0 },
                    vitalidade: { base: 0, extra: 0 },
                    agilidade: { base: 0, extra: 0 },
                    inteligencia: { base: 0, extra: 0 },
                    percepcao: { base: 0, extra: 0 },
                    sorte: { base: 0, extra: 0 }
                },
                secundarios: {
                    prontidao: { base: 0, extra: 0 },
                    ataque: { base: 0, extra: 0 },
                    defesa: { base: 0, extra: 0 },
                    reacao: { base: 0, extra: 0 },
                    precisao: { base: 0, extra: 0 },
                    evasao: { base: 0, extra: 0 }
                },
                aptidoes: [],
                vantagens: [],
                habilidades: [],
                aptitudesStats: {
                    atual: 0,
                    ganhas: 0,
                    maximo: 3,
                    atributoPróxima: 'FOR'
                }
            };
        }
    }

    /**
     * ════════════════════════════════════════════════════════════════════════════════
     * Coleta TODOS os companheiros (Array)
     * ════════════════════════════════════════════════════════════════════════════════
     */
    async coletarCompanheiros() {
        const companheirosArray = [];
        
        try {
            // Tentar do localStorage
            const companheiroJson = localStorage.getItem('redungeon_companheiros');
            if (companheiroJson) {
                try {
                    const companheiros = JSON.parse(companheiroJson);
                    if (Array.isArray(companheiros)) {
                        for (const comp of companheiros) {
                            // 🔥 SE TEM imagemDbId MAS NÃO TEM imagem (base64), recuperar do IndexedDB
                            if (comp.imagemDbId && !comp.imagem && window.companheirosImagemDB) {
                                try {
                                    const imagemData = await window.companheirosImagemDB.recuperarImagem(comp.id);
                                    if (imagemData && imagemData.dados) {
                                        comp.imagem = imagemData.dados;
                                    }
                                } catch (e) {
                                    console.warn('⚠️ Não foi possível recuperar imagem do IndexedDB para', comp.nome);
                                }
                            }
                            
                            // ✨ NOVO: Coletar inventário do companheiro
                            const chaveInventario = `companheiroInventario_${comp.id}`;
                            const inventarioJson = localStorage.getItem(chaveInventario);
                            if (inventarioJson) {
                                try {
                                    comp.inventario = JSON.parse(inventarioJson);
                                    console.log(`📦 Inventário do ${comp.nome} coletado (${comp.inventario.itens.length} itens)`);
                                } catch (e) {
                                    console.warn(`⚠️ Erro ao coletar inventário do ${comp.nome}:`, e);
                                    comp.inventario = { itens: [], armazenamentos: [] };
                                }
                            } else {
                                comp.inventario = { itens: [], armazenamentos: [] };
                            }
                            
                            companheirosArray.push(comp);
                        }
                        return companheirosArray;
                    }
                } catch (parseError) {
                    console.warn('⚠️ Erro ao fazer parse do localStorage de companheiros:', parseError);
                }
            }
            
            // Tentar do companheirosManager
            if (window.companheirosManager && Array.isArray(window.companheirosManager.companheiros)) {
                const companheirosManager = window.companheirosManager.companheiros;
                
                // Adicionar inventário a cada companheiro
                for (const comp of companheirosManager) {
                    const chaveInventario = `companheiroInventario_${comp.id}`;
                    const inventarioJson = localStorage.getItem(chaveInventario);
                    if (inventarioJson) {
                        try {
                            comp.inventario = JSON.parse(inventarioJson);
                        } catch (e) {
                            comp.inventario = { itens: [], armazenamentos: [] };
                        }
                    } else {
                        comp.inventario = { itens: [], armazenamentos: [] };
                    }
                }
                
                return companheirosManager;
            }
        } catch (erro) {
            console.error('❌ Erro ao coletar companheiros:', erro);
        }
        
        return [];
    }

    /**
     * Coleta dados do módulo Cultivo
     */
    /**
     * 🌌 COLETA DADOS COMPLETOS DO SISTEMA DE CULTIVAÇÃO
     * ═══════════════════════════════════════════════════════════════════════════════
     * Coleta de:
     * - Dados universais: Alma, Dantian, Meridianos, Técnica, Mar Espiritual
     * - Dados por mundo: Elder Gods, Boreal Line, Legends of Murim
     * 
     * Fonte: CultivacaoDadosManager.dados (localStorage)
     */
    coletarCultivo() {
        try {
            if (!window.cultivacao || !window.cultivacao.dados) {
                console.warn('⚠️ CultivacaoDadosManager não disponível (window.cultivacao.dados)');
                return {};
            }

            const dados = window.cultivacao.dados.dados;

            return {
                // 🌟 DADOS UNIVERSAIS (aplicam a todos os mundos)
                universal: {
                    alma: {
                        atual: dados.universal?.alma?.atual || 0,
                        maximo: dados.universal?.alma?.maximo || 100
                    },
                    dantian: {
                        atual: dados.universal?.dantian?.atual || 0,
                        maximo: dados.universal?.dantian?.maximo || 50
                    },
                    meridianos: {
                        limpos: dados.universal?.meridianos?.limpos || 0,
                        maximo: dados.universal?.meridianos?.maximo || 314,
                        principais_limpos: dados.universal?.meridianos?.principais_limpos || 0,
                        principais_maximo: dados.universal?.meridianos?.principais_maximo || 12
                    },
                    tecnica: {
                        nome: dados.universal?.tecnica?.nome || 'Técnica do Vácuo',
                        tipo_energia: dados.universal?.tecnica?.tipo_energia || 'Essência Primordial',
                        descricao: dados.universal?.tecnica?.descricao || '',
                        concentracao: dados.universal?.tecnica?.concentracao || '',
                        dado: dados.universal?.tecnica?.dado || '1d4'
                    },
                    mar_espiritual: {
                        estado: dados.universal?.mar_espiritual?.estado || 'Sereno',
                        tamanho: dados.universal?.mar_espiritual?.tamanho || 0,
                        elemento: dados.universal?.mar_espiritual?.elemento || 'agua',
                        densidade: dados.universal?.mar_espiritual?.densidade !== undefined ? dados.universal.mar_espiritual.densidade : 0,
                        descricao: dados.universal?.mar_espiritual?.descricao || ''
                    }
                },
                // 🏔️ ELDER GODS
                elder_gods: {
                    rank: dados.elder_gods?.rank || 1,
                    nome_rank: dados.elder_gods?.nome_rank || 'Corpo Temperado',
                    nivel: dados.elder_gods?.nivel || 1,
                    xp_atual: dados.elder_gods?.xp_atual || 0,
                    xp_necessario: dados.elder_gods?.xp_necessario || 100,
                    xp_total: dados.elder_gods?.xp_total || 0,
                    risco_tribulacao: dados.elder_gods?.risco_tribulacao || false
                },
                // ❄️ BOREAL LINE
                boreal_line: {
                    rank: dados.boreal_line?.rank || 1,
                    nome_rank: dados.boreal_line?.nome_rank || 'Cristalização',
                    nivel: dados.boreal_line?.nivel || 1,
                    sub_rank: dados.boreal_line?.sub_rank || 0,
                    nome_sub_rank: dados.boreal_line?.nome_sub_rank || '',
                    fragmentos: dados.boreal_line?.fragmentos || 0,
                    qi_acumulado: dados.boreal_line?.qi_acumulado || 0,
                    mana: dados.boreal_line?.mana || 0,
                    estagio_mana: dados.boreal_line?.estagio_mana || 'Inicial'
                },
                // 🏯 LEGENDS OF MURIM
                murim: {
                    rank: dados.murim?.rank || 1,
                    nome_rank: dados.murim?.nome_rank || 'Fundação Turva',
                    nivel: dados.murim?.nivel || 1,
                    qi_acumulado: dados.murim?.qi_acumulado || 0,
                    fragmentos: dados.murim?.fragmentos || 0,
                    progresso_formacao: dados.murim?.progresso_formacao || 0,
                    petalas: dados.murim?.petalas || 0,
                    estagio_petala: dados.murim?.estagio_petala || 'Inicial',
                    nucleo_espiritual: {
                        cor: dados.murim?.nucleo_espiritual?.cor || 'Cinzento',
                        potencial: dados.murim?.nucleo_espiritual?.potencial || 50
                    },
                    canais_dao: dados.murim?.canais_dao || 0,
                    talento: dados.murim?.talento || 'Normal'
                }
            };
        } catch (erro) {
            console.error('❌ Erro ao coletar dados de cultivo:', erro);
            return {};
        }
    }

    /**
     * Coleta dados do módulo Corpo Imortal
     * ✨ ATUALIZADO: Coletar dados dos 4 tipos (Dantian, Meridianos, Refino, Mar Espiritual)
     * - Níveis: 0-6 para cada tipo
     * - Melhorias Desbloqueadas: array de melhorias por tipo
     * - Pontos Disponíveis: calculado da soma dos atributos
     */
    coletarCorpoImortal() {
        try {
            let corpoImortalData = {
                ativo: false,
                pontosDisponiveis: 0,
                dantian: 0,
                meridianos: 0,
                refino: 0,
                marEspiritual: 0,
                melhoriasDesbloqueadas: {
                    dantian: [],
                    meridianos: [],
                    refino: [],
                    marEspiritual: []
                }
            };
            
            // ✅ PRIORIDADE 1: Tentar obter do objeto global corpoImortalDados
            if (window.corpoImortalDados && window.corpoImortalDados.dados) {
                const dados = window.corpoImortalDados.dados;
                corpoImortalData = {
                    ativo: dados.ativo !== undefined ? dados.ativo : true,
                    pontosDisponiveis: dados.pontosDisponiveis || 0,
                    dantian: dados.dantian || 0,
                    meridianos: dados.meridianos || 0,
                    refino: dados.refino || 0,
                    marEspiritual: dados.marEspiritual || 0,
                    melhoriasDesbloqueadas: dados.melhoriasDesbloqueadas || {
                        dantian: [],
                        meridianos: [],
                        refino: [],
                        marEspiritual: []
                    }
                };
                console.log('✅ Corpo Imortal coletado do objeto global:', corpoImortalData);
                return corpoImortalData;
            }
            
            // ✅ PRIORIDADE 2: Tentar carregar do localStorage
            const stored = localStorage.getItem('corpoImortalData');
            if (stored) {
                try {
                    corpoImortalData = JSON.parse(stored);
                    console.log('✅ Corpo Imortal coletado do localStorage:', corpoImortalData);
                    return corpoImortalData;
                } catch (parseError) {
                    console.warn('⚠️ Erro ao parsear localStorage corpoImortalData:', parseError);
                }
            }
            
            console.log('⚠️ Corpo Imortal não encontrado, usando valores padrão');
            return corpoImortalData;
            
        } catch (erro) {
            console.error('❌ Erro ao coletar dados de Corpo Imortal:', erro);
            return {
                ativo: false,
                pontosDisponiveis: 0,
                dantian: 0,
                meridianos: 0,
                refino: 0,
                marEspiritual: 0,
                melhoriasDesbloqueadas: {
                    dantian: [],
                    meridianos: [],
                    refino: [],
                    marEspiritual: []
                }
            };
        }
    }

    /**
     * Coleta dados do módulo Loja
     * ✨ ATUALIZADO: Coletar Rokmas Atuais do localStorage
     */
    coletarLoja() {
        try {
            // ✅ PRIORIDADE 1: Obter do MenuItensSystem (mais confiável)
            let rokmasAtuais = 0;
            
            if (window.menuItensSystem && typeof window.menuItensSystem.obterSaldo === 'function') {
                rokmasAtuais = window.menuItensSystem.obterSaldo();
                console.log(`💰 [Coleta] Rokmas coletados do MenuItensSystem: ${rokmasAtuais}`);
            } else {
                // PRIORIDADE 2: Tentar localStorage
                const rokmastorageMenu = localStorage.getItem('menu-itens-rokmas');
                rokmasAtuais = rokmastorageMenu ? parseInt(rokmastorageMenu) : 0;
                console.log(`💰 [Coleta] Rokmas coletados do localStorage: ${rokmasAtuais}`);
            }
            
            return {
                rokmastorageString: String(rokmasAtuais),
                rokmasAtuais: rokmasAtuais,
                moedas: parseInt(document.getElementById('loja-moedas')?.value) || 0,
                compras: document.getElementById('loja-compras')?.value || '',
                vendas: document.getElementById('loja-vendas')?.value || '',
                reputacao: parseInt(document.getElementById('loja-reputacao')?.value) || 0
            };
        } catch (erro) {
            console.error('❌ Erro ao coletar dados da Loja:', erro);
            return {
                rokmastorageString: '0',
                rokmasAtuais: 0,
                moedas: 0,
                compras: '',
                vendas: '',
                reputacao: 0
            };
        }
    }

    /**
     * Coleta dados do módulo Sorte
     * ✨ ATUALIZADO: Coletar Fortuna Atual do localStorage
     */
    coletarSorte() {
        try {
            const fortunaAtualStorage = localStorage.getItem('redungeon_fortuna_atual');
            const fortunaAtual = fortunaAtualStorage ? parseInt(fortunaAtualStorage) : 0;
            
            return {
                fortunaAtualStorage: fortunaAtualStorage || '0',
                fortunaAtual: fortunaAtual,
                pontos: parseInt(document.getElementById('sorte-pontos')?.value) || 0,
                maximo: parseInt(document.getElementById('sorte-maximo')?.value) || 10,
                ultimoUso: document.getElementById('sorte-ultimo-uso')?.value || '',
                historico: document.getElementById('sorte-historico')?.value || ''
            };
        } catch (erro) {
            console.error('❌ Erro ao coletar dados de Sorte:', erro);
            return {
                fortunaAtualStorage: '0',
                fortunaAtual: 0,
                pontos: 0,
                maximo: 10,
                ultimoUso: '',
                historico: ''
            };
        }
    }

    /**
     * 🎲 COLETA HISTÓRICO DE SORTE
     * ════════════════════════════════════════════════
     * Coleta o histórico completo de ações de sorte
     */
    coletarHistoricoSorte() {
        try {
            // Se o sistema de histórico não está disponível, retornar vazio
            if (!window.sorteHistorico) {
                console.warn('⚠️ Sistema de Histórico de Sorte não disponível');
                return [];
            }

            // Obter histórico do sistema
            const historico = window.sorteHistorico.obterHistorico();
            
            if (!historico || !Array.isArray(historico)) {
                console.warn('⚠️ Histórico de Sorte vazio ou inválido');
                return [];
            }

            // Converter para formato serializável (timestamps como strings)
            const historicoSerializavel = historico.map(item => ({
                id: item.id,
                tipo: item.tipo,
                timestamp: item.timestamp ? item.timestamp.toISOString() : new Date().toISOString(),
                descricao: item.descricao,
                iconEmoji: item.iconEmoji,
                dados: item.dados || {}
            }));

            console.log(`✅ Histórico de Sorte coletado: ${historicoSerializavel.length} itens`);
            return historicoSerializavel;
        } catch (erro) {
            console.error('❌ Erro ao coletar Histórico de Sorte:', erro);
            return [];
        }
    }

    /**
     * 📋 COLETA DADOS DE CONDIÇÕES ATIVAS (NOVO!)
     * ═══════════════════════════════════════════════════
     * Coleta todas as condições ativas do sistema
     */
    coletarCondicoes() {
        try {
            // Tentar obter do objeto global window.sistemaCondicoes
            if (window.sistemaCondicoes && window.sistemaCondicoes.condicoesAtivas) {
                console.log('⚠️ Condições coletadas do objeto global:', window.sistemaCondicoes.condicoesAtivas.length);
                return {
                    condicoesAtivas: window.sistemaCondicoes.condicoesAtivas,
                    total: window.sistemaCondicoes.condicoesAtivas.length
                };
            }

            // Fallback: tentar do localStorage
            const condDados = localStorage.getItem('rd-cond-dados');
            if (condDados) {
                const parsed = JSON.parse(condDados);
                console.log('📂 Condições coletadas do localStorage:', parsed.length);
                return {
                    condicoesAtivas: parsed,
                    total: parsed.length
                };
            }

            console.log('ℹ️ Nenhuma condição ativa');
            return {
                condicoesAtivas: [],
                total: 0
            };
        } catch (erro) {
            console.error('❌ Erro ao coletar dados de Condições:', erro);
            return {
                condicoesAtivas: [],
                total: 0
            };
        }
    }

    /**
     * 📋 COLETA DADOS DO POPUP-INFO-JOGADOR (NOVO!)
     * ═══════════════════════════════════════════════════
     * Coleta as informações completas do jogador:
     * - Nome e Título
     * - Origem, Afiliação, Status Narrativo
     * - Notas Adicionais
     * - Background (com formatação HTML)
     */
    coletarPopupInfo() {
        try {
            let dados = {
                nomePersonagem: '',
                tituloPersonagem: '',
                origem: '',
                afiliacao: '',
                statusNarrativo: '',
                notasAdicionais: '',
                background: ''
            };

            // ✨ PRIORIDADE 1: Se o popup info foi inicializado, usar seus dados temporários
            if (window.popupInfoJogador && window.popupInfoJogador.tempValues) {
                dados = {
                    nomePersonagem: window.popupInfoJogador.tempValues.nomePersonagem || '',
                    tituloPersonagem: window.popupInfoJogador.tempValues.tituloPersonagem || '',
                    origem: window.popupInfoJogador.tempValues.origem || '',
                    afiliacao: window.popupInfoJogador.tempValues.afiliacao || '',
                    statusNarrativo: window.popupInfoJogador.tempValues.statusNarrativo || '',
                    notasAdicionais: window.popupInfoJogador.tempValues.notasAdicionais || '',
                    background: window.popupInfoJogador.tempValues.background || ''
                };
                console.log('✅ Popup-info coletado de tempValues');
                return dados;
            }

            // ✨ PRIORIDADE 2: Tentar carregar do localStorage
            if (window.localStorageManager && typeof window.localStorageManager.loadJogadorInfo === 'function') {
                const storedData = window.localStorageManager.loadJogadorInfo();
                if (storedData) {
                    dados = {
                        nomePersonagem: storedData.nomePersonagem || '',
                        tituloPersonagem: storedData.tituloPersonagem || '',
                        origem: storedData.origem || '',
                        afiliacao: storedData.afiliacao || '',
                        statusNarrativo: storedData.statusNarrativo || '',
                        notasAdicionais: storedData.notasAdicionais || '',
                        background: storedData.background || ''
                    };
                    console.log('✅ Popup-info coletado do localStorage');
                    return dados;
                }
            }

            // ✨ PRIORIDADE 3: Fallback para direto no localStorage
            const storedRaw = localStorage.getItem('jogador_info');
            if (storedRaw) {
                const storedData = JSON.parse(storedRaw);
                dados = {
                    nomePersonagem: storedData.nomePersonagem || '',
                    tituloPersonagem: storedData.tituloPersonagem || '',
                    origem: storedData.origem || '',
                    afiliacao: storedData.afiliacao || '',
                    statusNarrativo: storedData.statusNarrativo || '',
                    notasAdicionais: storedData.notasAdicionais || '',
                    background: storedData.background || ''
                };
                console.log('✅ Popup-info coletado do localStorage (fallback)');
                return dados;
            }

            // ✨ PRIORIDADE 4: Tentar inputs diretos se popup estiver aberto
            const nomeInput = document.querySelector('#info-nome-personagem');
            const tituloInput = document.querySelector('#info-titulo-personagem');
            const origemInput = document.querySelector('#info-geral-origem');
            const afiliracaoInput = document.querySelector('#info-geral-afiliacao');
            const statusInput = document.querySelector('#info-geral-status');
            const notasInput = document.querySelector('#info-geral-notas');
            const backgroundEditor = document.querySelector('#info-background-editor');

            if (nomeInput || tituloInput || origemInput) {
                dados = {
                    nomePersonagem: nomeInput?.value || '',
                    tituloPersonagem: tituloInput?.value || '',
                    origem: origemInput?.value || '',
                    afiliacao: afiliracaoInput?.value || '',
                    statusNarrativo: statusInput?.value || '',
                    notasAdicionais: notasInput?.value || '',
                    background: backgroundEditor?.innerHTML || ''
                };
                console.log('✅ Popup-info coletado dos inputs diretos');
                return dados;
            }

            // Se nada funcionou, retornar vazio
            console.log('⚠️ Nenhum dados do popup-info encontrado');
            return dados;

        } catch (erro) {
            console.error('❌ Erro ao coletar dados do popup-info:', erro);
            return {
                nomePersonagem: '',
                tituloPersonagem: '',
                origem: '',
                afiliacao: '',
                statusNarrativo: '',
                notasAdicionais: '',
                background: ''
            };
        }
    }

    /**
     * Coleta dados do módulo Classe
     */
    coletarClasse() {
        return {
            nome: document.getElementById('classe-nome')?.value || '',
            descricao: document.getElementById('classe-descricao')?.value || '',
            bonus: document.getElementById('classe-bonus')?.value || '',
            habilidades: document.getElementById('classe-habilidades')?.value || '',
            // ✨ NOVO: Salvar IDs das classes selecionadas para restaurar o multi-select
            classesSelecionadasIds: JSON.parse(localStorage.getItem('redungeon_classes_selecionadas') || '[]')
        };
    }

    /**
     * Coleta dados do módulo Raça
     */
    coletarRaca() {
        try {
            // Coletar dados básicos
            const dadosBasicos = {
                nome: document.getElementById('raca-nome')?.value || '',
                descricao: document.getElementById('raca-descricao')?.value || '',
                bonus: document.getElementById('raca-bonus')?.value || '',
                habilidades: document.getElementById('raca-habilidades')?.value || '',
                // ✨ NOVO: Salvar ID da raça selecionada para restaurar o select
                racaSelecionadaId: localStorage.getItem('redungeon_raca_selecionada') || null
            };

            // 🎯 NOVO: Coletar habilidades raciais ativas e travadas (2 estratégias)
            let dadosHabilidades = {
                ativas: [],
                travadas: [],
                racaId: null
            };

            // Estratégia 1: Coletar do selector se disponível
            if (window.habilidadesBasicasSelector && typeof window.habilidadesBasicasSelector.obterDadosAtuais === 'function') {
                try {
                    const dados = window.habilidadesBasicasSelector.obterDadosAtuais();
                    dadosHabilidades = {
                        ativas: dados.ativas || [],
                        travadas: dados.travadas || [],
                        racaId: dados.racaId || dadosBasicos.racaSelecionadaId || null
                    };
                    console.log('✅ Habilidades coletadas do selector:', dadosHabilidades);
                } catch (e) {
                    console.warn('⚠️ Erro ao coletar do selector, tentando localStorage:', e);
                }
            }

            // Estratégia 2: Se selector não tem dados, tentar localStorage
            if (!dadosHabilidades.racaId && dadosBasicos.racaSelecionadaId) {
                try {
                    const chave = `raca-habilidades-${dadosBasicos.racaSelecionadaId}`;
                    const dadosSalvos = localStorage.getItem(chave);
                    if (dadosSalvos) {
                        const parsed = JSON.parse(dadosSalvos);
                        dadosHabilidades = {
                            ativas: parsed.ativas || [],
                            travadas: parsed.travadas || [],
                            racaId: dadosBasicos.racaSelecionadaId
                        };
                        console.log('✅ Habilidades coletadas do localStorage:', dadosHabilidades);
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao coletar de localStorage:', e);
                }
            }

            dadosBasicos.habilidadesRaciais = dadosHabilidades;

            return dadosBasicos;
        } catch (erro) {
            console.error('❌ Erro ao coletar raça:', erro);
            return {
                nome: '',
                descricao: '',
                bonus: '',
                habilidades: '',
                racaSelecionadaId: null,
                habilidadesRaciais: {
                    ativas: [],
                    travadas: [],
                    racaId: null
                }
            };
        }
    }

    /**
     * Coleta TODOS os dados da ficha
     */
    async coletarTodosDados() {
        return {
            versao: this.versao,
            dataSalvamento: new Date().toISOString(),
            personagem: this.coletarPersonagem(),
            atributos: this.coletarAtributos(),
            aptidoes: this.coletarAptidoes(),
            habilidades: this.coletarHabilidades(),
            inventario: this.coletarInventario(),
            treinamento: this.coletarTreinamento(),
            companheiro: this.coletarCompanheiro(),
            companheiros: await this.coletarCompanheiros(), // ✨ NOVO: Array de TODOS os companheiros
            cultivo: this.coletarCultivo(),
            corpoImortal: this.coletarCorpoImortal(),
            loja: this.coletarLoja(),
            sorte: this.coletarSorte(),
            sorteHistorico: this.coletarHistoricoSorte(), // ✨ NOVO: Histórico de Sorte
            condicoes: this.coletarCondicoes(), // ✨ NOVO
            classe: this.coletarClasse(),
            raca: this.coletarRaca(),
            veiasAstrais: this.coletarVeiasAstrais(),
            // ✨ NOVO: Adicionar dados do popup-info
            popupInfo: this.coletarPopupInfo()
        };
    }

    /**
     * Coleta o estado atual das Veias Astrais para exportar no JSON.
     */
    coletarVeiasAstrais() {
        try {
            if (!window.veiasAstraisSystem) {
                console.warn('⚠️ Veias Astrais não disponível para coleta');
                return null;
            }

            const system = window.veiasAstraisSystem;
            const lineActivation = window.veiasAstraisLineActivation;

            // Se o sistema existir mas ainda não foi inicializado, tentar inicializar
            if (system && !system.initialized && typeof system.init === 'function') {
                try {
                    console.log('ℹ️ VeiasAstraisSystem não inicializado — inicializando antes da coleta...');
                    system.init();
                } catch (e) {
                    console.warn('⚠️ Falha ao inicializar VeiasAstraisSystem automaticamente:', e);
                }
            }

            // Nó básico (formato legado)
            const nodes = Array.isArray(system.nodes)
                ? system.nodes.map((node) => ({
                      id: node.id,
                      treeId: node.treeId,
                      state: node.state,
                      level: node.level,
                  }))
                : [];

            const activatedLines =
                lineActivation && typeof lineActivation.getActivatedLinesToSave === 'function'
                    ? lineActivation.getActivatedLinesToSave()
                    : [];

            // Constelações (objeto e array)
            const treesArray = Object.values(system.trees).map((tree) => ({
                id: tree.id,
                name: tree.name,
                unlockedNodes: tree.unlockedNodes,
                totalNodes: tree.totalNodes,
                color: tree.color,
            }));

            const constelacoes = {};
            Object.values(system.trees).forEach((tree) => {
                constelacoes[tree.id] = {
                    id: tree.id,
                    name: tree.name,
                    unlockedNodes: tree.unlockedNodes || 0,
                    totalNodes: tree.totalNodes || 0,
                    color: tree.color,
                };
            });

            // Nós detalhados (para reconstruir o mapa)
            const nos = (Array.isArray(system.nodes) ? system.nodes : []).map((node) => {
                // Caminho (lista de IDs dos pais até o core)
                const caminho = [];
                let parentId = node.parentId;
                while (parentId && parentId !== 'core') {
                    const parentNode = system.nodes.find((n) => n.id === parentId);
                    if (!parentNode) break;
                    caminho.unshift(parentNode.id);
                    parentId = parentNode.parentId;
                }

                return {
                    id: node.id,
                    nome: node.name || null,
                    constelacao: node.treeId,
                    caminho: caminho, // array de ids dos pais (vazio se for ligado ao core)
                    nivel: node.level,
                    desbloqueado: node.state && node.state !== 'locked',
                    custo: node.cost || 0,
                    estado: node.state || 'locked',
                    bonus: node.bonus ? { id: node.bonus.id || null, nome: node.bonus.name || null } : null,
                    criadoEm: node.createdAt || null,
                };
            });

            // Progresso por constelação
            const progresso = {};
            Object.keys(system.trees).forEach((tid) => {
                progresso[tid] = system.nodes.filter((n) => n.treeId === tid && n.state && n.state !== 'locked').length;
            });

            // Power Combat e Ressonância (mantendo os campos legados e também objetos explícitos)
            const pcValor = Number.isFinite(system.powerCombat) ? system.powerCombat : 0;
            const pcMax = Number.isFinite(system.maxPowerCombat) ? system.maxPowerCombat : 0;

            const resValor = Number.isFinite(system.resonance) ? system.resonance : 45;
            const resMax = Number.isFinite(system.maxResonance) ? system.maxResonance : 100;

            // Montar retorno sem remover estrutura existente (compatibilidade)
            const resultado = {
                // Campos legados (não alterar)
                powerCombat: pcValor,
                maxPowerCombat: pcMax,
                resonance: resValor,
                maxResonance: resMax,
                nodes,
                trees: treesArray,
                activatedLines,

                // Campos adicionais solicitados (compatíveis e opcionais)
                constelacoes: constelacoes,
                nos: nos,
                progresso: progresso,
                powerCombatStatus: { atual: pcValor, maximo: pcMax },
                resonanceStatus: { atual: resValor, maximo: resMax },
            };

            // Log para ajudar debugging quando o usuário disser "não funcionou"
            try {
                console.log('📤 coletarVeiasAstrais -> payload:', resultado);
            } catch (e) {
                // falhar silenciosamente no log
            }

            return resultado;
        } catch (erro) {
            console.warn('⚠️ Erro ao coletar estado das Veias Astrais:', erro);
            return null;
        }
    }

    /**
     * ════════════════════════════════════════════════════════════════════════════════
     * SALVAMENTO
     * ════════════════════════════════════════════════════════════════════════════════
     */

    /**
     * Salva a ficha como arquivo JSON
     */
    async salvarFicha() {
        try {
            console.log('💾 Iniciando salvamento da ficha...');
            
            // Coletar dados
            const dados = await this.coletarTodosDados();
            
            // 🎯 Gerar nome do arquivo usando o nome do personagem
            const nomePersonagem = dados.atributos?.personagem?.nome || 'ficha_personagem';
            const nomeFormatado = nomePersonagem
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '_') // Substitui espaços por underscore
                .replace(/[^a-z0-9_]/g, ''); // Remove caracteres especiais
            
            const nomeArquivoFinal = nomeFormatado ? `${nomeFormatado}.json` : 'ficha_personagem.json';
            
            console.log(`📝 Nome do arquivo: ${nomeArquivoFinal}`);
            
            // Converter para JSON
            const json = JSON.stringify(dados, null, 2);
            
            // Criar blob
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Criar link e fazer download
            const link = document.createElement('a');
            link.href = url;
            link.download = nomeArquivoFinal;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('✅ Ficha salva com sucesso!');
            this.mostrarMensagem(`✅ Ficha "${nomePersonagem}" salva com sucesso!`, 'sucesso');
            
        } catch (erro) {
            console.error('❌ Erro ao salvar ficha:', erro);
            this.mostrarMensagem('❌ Erro ao salvar ficha!', 'erro');
        }
    }

    /**
     * ════════════════════════════════════════════════════════════════════════════════
     * IMPORTAÇÃO - SETTERS
     * ════════════════════════════════════════════════════════════════════════════════
     */

    /**
     * Importa uma ficha do arquivo JSON
     */
    async importarFicha(evento) {
        const arquivo = evento.target.files?.[0];
        
        if (!arquivo) {
            console.warn('⚠️ Nenhum arquivo selecionado');
            return;
        }

        const leitor = new FileReader();
        
        leitor.onload = async (e) => {
            try {
                const conteudo = e.target.result;
                const dados = JSON.parse(conteudo);
                
                console.log('📥 Importando ficha...');
                
                // Validar estrutura
                if (!this.validarEstrutura(dados)) {
                    throw new Error('Estrutura de arquivo inválida');
                }
                
                // 🔒 BLOQUEIO: Ativar flag para evitar que listeners disparem salvamento vazio
                // durante a restauração dos campos
                window.isImportandoFicha = true;
                sessionStorage.setItem('IMPORTACAO_FICHA_ATIVA', 'true');
                console.log('🔒 [Importação] Flag ativada - listeners bloqueados');
                
                // Restaurar dados
                this.restaurarPersonagem(dados.personagem);
                this.restaurarAtributos(dados.atributos);
                this.restaurarAptidoes(dados.aptidoes);
                this.restaurarHabilidades(dados.habilidades);
                this.restaurarInventario(dados.inventario);
                this.restaurarTreinamento(dados.treinamento);
                // ✨ CORRIGIDO: Validar se companheiro não está vazio antes de restaurar
                const temCompanheiroValido = dados.companheiro && 
                                            dados.companheiro.nome && 
                                            dados.companheiro.nome.trim() !== '';
                if (temCompanheiroValido) {
                    await this.restaurarCompanheiro(dados.companheiro);
                } else {
                    console.log('ℹ️ Nenhum companheiro válido para restaurar (ficha salva sem companheiro)');
                    // Limpar companheiros existentes se o arquivo foi salvo sem nenhum
                    if (window.companheirosManager) {
                        window.companheirosManager.companheiros = [];
                        await window.companheirosManager.salvarNoStorage();
                        console.log('🗑️ Companheiros anteriores removidos');
                    } else {
                        localStorage.removeItem('redungeon_companheiros');
                        console.log('🗑️ Dados de companheiros removidos do localStorage');
                    }
                }
                // ✨ NOVO: Restaurar array de TODOS os companheiros
                if (dados.companheiros && Array.isArray(dados.companheiros) && dados.companheiros.length > 0) {
                    console.log(`📦 Restaurando ${dados.companheiros.length} companheiros...`);
                    await this.restaurarCompanheiros(dados.companheiros);
                }
                this.restaurarVeiasAstrais(dados.veiasAstrais);
                this.restaurarCultivo(dados.cultivo);
                this.restaurarCorpoImortal(dados.corpoImortal);
                this.restaurarLoja(dados.loja);
                this.restaurarSorte(dados.sorte);
                this.restaurarHistoricoSorte(dados.sorteHistorico); // ✨ Restaurar histórico de sorte
                this.restaurarCondicoes(dados.condicoes); // ✨ NOVO
                this.restaurarClasse(dados.classe);
                this.restaurarRaca(dados.raca);
                // ✨ NOVO: Restaurar dados do popup-info
                this.restaurarPopupInfo(dados.popupInfo);
                
                console.log('✅ Ficha importada com sucesso!');
                
                // 💾 SALVAR IMEDIATAMENTE NO LOCALSTORAGE
                // Antes de tudo, desbloquear salvamentos
                window.isImportandoFicha = false;
                sessionStorage.removeItem('IMPORTACAO_FICHA_ATIVA');
                console.log('🔓 [Importação] Flags removidas - salvamentos desbloqueados');
                
                // Forçar salvamento de todos os dados
                console.log('💾 Salvando dados importados no localStorage...');
                
                // 1. Salvar AppState
                if (window.appState && window.localStorageManager) {
                    try {
                        const state = window.appState.getState();
                        window.localStorageManager.save('appState', state);
                        console.log('✅ AppState salvo no localStorage');
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar AppState:', e);
                    }
                }
                
                // 2. Salvar dados críticos individuais
                if (window.localStorageManager) {
                    try {
                        window.localStorageManager.save('redungeon_ficha_atributos', dados.atributos);
                        window.localStorageManager.save('redungeon_ficha_status', dados.atributos?.barras);
                        window.localStorageManager.save('redungeon_ficha_inventario', dados.inventario);
                        window.localStorageManager.save('redungeon_companheiros', dados.companheiro);
                        window.localStorageManager.save('redungeon_ficha_cultivacao', dados.cultivo);
                        console.log('✅ Todos os dados salvos no localStorage');
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar dados:', e);
                    }
                }
                
                // 3. Salvar Rokmas da Loja (garantir sincronização)
                if (dados.loja && dados.loja.rokmasAtuais !== undefined) {
                    try {
                        localStorage.setItem('menu-itens-rokmas', String(dados.loja.rokmasAtuais));
                        console.log(`💰 Rokmas da Loja salvos: ${dados.loja.rokmasAtuais}`);
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar Rokmas:', e);
                    }
                }
                
                this.mostrarMensagem('✅ Ficha importada com sucesso! Interface atualizada.', 'sucesso');
                // 🎨 Atualizar card de status IMEDIATAMENTE após importação
                console.log('🎨 Renderizando card de status com valores importados...');
                if (window.statusBarsManager && typeof window.statusBarsManager.render === 'function') {
                    window.statusBarsManager.render();
                    console.log('✅ Card de status renderizado após importação');
                } else {
                    console.warn('⚠️ StatusBarsManager não disponível para renderizar card');
                }
                
                // 🎨 O fluxo de importação terminou. A interface foi atualizada diretamente.
                
            } catch (erro) {
                console.error('❌ Erro ao importar ficha:', erro);
                this.mostrarMensagem(`❌ Erro ao importar: ${erro.message}`, 'erro');
                // 🔒 Remover flag em caso de erro
                window.isImportandoFicha = false;
                sessionStorage.removeItem('IMPORTACAO_FICHA_ATIVA');
            }
        };
        
        leitor.readAsText(arquivo);
        
        // Limpar input
        evento.target.value = '';
    }

    /**
     * Valida se o arquivo JSON possui a estrutura esperada
     */
    validarEstrutura(dados) {
        if (!dados || typeof dados !== 'object') {
            console.error('❌ Dados inválidos');
            return false;
        }

        // Verificar campos obrigatórios
        if (!dados.versao || !dados.personagem) {
            console.error('❌ Campos obrigatórios ausentes');
            return false;
        }

        return true;
    }

    /**
     * Restaura dados do Personagem
     */
    restaurarPersonagem(dados) {
        if (!dados) return;
        const campos = {
            'personagem-nome': dados.nome,
            'personagem-nivel': dados.nivel,
            'personagem-exp': dados.experiencia,
            'personagem-raca': dados.raca,
            'personagem-classe': dados.classe,
            'personagem-descricao': dados.descricao
        };
        if (dados.titulo !== undefined) {
            campos['info-titulo-personagem'] = dados.titulo;
        }
        this.preencherCampos(campos);

        // Atualizar também o manager de atributos global para evitar que
        // um render posterior apague os valores importados.
        if (window.atributosManager && typeof window.atributosManager.atualizarPersonagem === 'function') {
            window.atributosManager.atualizarPersonagem({
                nome: dados.nome,
                titulo: dados.titulo,
                classe: dados.classe,
                raca: dados.raca
            });
            console.log('✅ AtributosManager atualizado com os dados do personagem importado');
        }

        // Garantir que o título também esteja visível imediatamente
        const tituloEl = document.getElementById('personagem-titulo');
        if (tituloEl && dados.titulo !== undefined) {
            tituloEl.textContent = dados.titulo;
        }
    }

    /**
     * Restaura dados dos Atributos
     */
    /**
     * 📊 RESTAURA DADOS DO MÓDULO ATRIBUTOS (CORRIGIDO v2)
     * ═══════════════════════════════════════════════════
     * ⚠️ IMPORTANTE: Restaura primários/secundários NO APPSTATE!
     * 
     * - Atributos primários: restaura em AppState.atributos.primarios
     * - Atributos secundários: restaura em AppState.atributos.secundarios
     * - Status: restaura em StatusConfigModal.state.tempValues
     * - Reputação: restaura em ReputacaoModal.tempValues
     * - Personagem: restaura nos elementos DOM
     */
    restaurarAtributos(dados) {
        try {
            if (!dados) {
                console.warn('⚠️ Dados de atributos vazios');
                return;
            }

            console.log('🔄 Iniciando restauração de atributos...', dados);

            // ═══ RESTAURAR NO APPSTATE ═══
            const state = window.appState?.getState() || {};
            state.atributos = state.atributos || {};

            // ═══ RESTAURAR PRIMÁRIOS (no AppState) ═══
            if (dados.primarios) {
                state.atributos.primarios = dados.primarios;
                console.log('✅ Primários restaurados no AppState');
            }

            // ═══ RESTAURAR SECUNDÁRIOS (no AppState) ═══
            if (dados.secundarios) {
                state.atributos.secundarios = dados.secundarios;
                console.log('✅ Secundários restaurados no AppState');
            }

            // Atualizar AppState
            if (window.appState) {
                window.appState.setState(state);
                console.log('✅ AppState atualizado');
            }

            // ═══ RESTAURAR STATUS (no StatusConfigModal) ═══
            if (dados.barras && window.statusConfigModal) {
                // Restaurar HP (Saúde)
                if (dados.barras.hp) {
                    window.statusConfigModal.state.tempValues.hp = dados.barras.hp;
                    window.statusConfigModal.state.originalValues.hp = JSON.parse(JSON.stringify(dados.barras.hp));
                    console.log('✅ HP restaurado:', dados.barras.hp);
                }
                
                // Restaurar ENERGIA (com campo extra)
                if (dados.barras.energia) {
                    window.statusConfigModal.state.tempValues.energy = dados.barras.energia;
                    window.statusConfigModal.state.originalValues.energy = JSON.parse(JSON.stringify(dados.barras.energia));
                    console.log('✅ Energia restaurada (incluindo extra):', dados.barras.energia);
                }
                
                // Restaurar FADIGA (com campo extra)
                if (dados.barras.fadiga) {
                    window.statusConfigModal.state.tempValues.fatigue = dados.barras.fadiga;
                    window.statusConfigModal.state.originalValues.fatigue = JSON.parse(JSON.stringify(dados.barras.fadiga));
                    console.log('✅ Fadiga restaurada (incluindo extra):', dados.barras.fadiga);
                }

                // Atualizar o StatusBarsManager com os valores importados
                if (window.statusBarsManager) {
                    const mapStatus = (source, key) => {
                        if (!source) return;
                        const maxValue = source.maximum != null ? source.maximum : (source.max != null ? source.max : 0);
                        window.statusBarsManager.state[key] = {
                            current: Math.min(source.current || 0, maxValue),
                            max: maxValue,
                            base: source.base || 0,
                            extra: source.extra || 0,
                            bonus: source.bonus || 0
                        };
                    };

                    mapStatus(dados.barras.hp, 'hp');
                    mapStatus(dados.barras.energia, 'energy');
                    mapStatus(dados.barras.fadiga, 'fatigue');
                    console.log('✅ StatusBarsManager.state sincronizado com os valores importados');

                    if (typeof window.statusBarsManager.render === 'function') {
                        window.statusBarsManager.render();
                        console.log('✅ StatusBarsManager renderizado após importação dos status');
                    }
                }
                
                // 💾 ⭐ FIX CRÍTICO: SALVAR extra/bonus EM localStorage PARA PERSISTÊNCIA
                // Este é o bridge entre importação e carregamento após reload
                console.log('💾 Salvando extra/bonus em localStorage para persistência...');
                try {
                    const statusFieldsData = {
                        hp: {
                            extra: dados.barras.hp?.extra || 0,
                            bonus: dados.barras.hp?.bonus || 0,
                            base: dados.barras.hp?.base || 0
                        },
                        energia: {
                            extra: dados.barras.energia?.extra || 0,
                            bonus: dados.barras.energia?.bonus || 0,
                            base: dados.barras.energia?.base || 0
                        },
                        fadiga: {
                            extra: dados.barras.fadiga?.extra || 0,
                            bonus: dados.barras.fadiga?.bonus || 0,
                            base: dados.barras.fadiga?.base || 0
                        }
                    };
                    localStorage.setItem('redungeon_status_fields_extra_bonus', JSON.stringify(statusFieldsData));
                    console.log('✅ Status fields salvos em localStorage:', statusFieldsData);
                } catch (e) {
                    console.warn('⚠️ Erro ao salvar status fields em localStorage:', e.message);
                }
                
                // ✨ SINCRONIZAR com StatusBarsManager se disponível
                // Isso garante que os valores visuais das barras também sejam atualizados
                // Não recalcular máximos imediatamente após importação,
                // pois devemos preservar os valores importados exatos.
                if (window.statusBarsManager) {
                    console.log('✅ StatusBarsManager mantido com valores importados (sem recálculo de máximos)');
                }
                
                console.log('✅ Status restaurados completamente (com campos extra e persistência)');
            }

            // ═══ RESTAURAR REPUTAÇÃO V2 (no StateManager E no ReputacaoV2) ═══
            if (dados.reputacao) {
                console.log('📖 Restaurando reputação V2:', dados.reputacao);
                
                // Restaurar no StateManager (novo sistema)
                if (window.stateManager && typeof window.stateManager.setReputation === 'function') {
                    window.stateManager.setReputation(dados.reputacao);
                    console.log('✅ Reputação restaurada no StateManager:', dados.reputacao);
                }
                
                // Restaurar no ReputacaoV2 (novo sistema)
                if (window.reputacaoV2) {
                    if (typeof dados.reputacao === 'object' && dados.reputacao.mundo) {
                        // Novo formato V2
                        if (typeof dados.reputacao.mundo === 'object') {
                            window.reputacaoV2.dados = {
                                mundo: dados.reputacao.mundo,
                                regiao: dados.reputacao.regiao
                            };
                            window.reputacaoV2.dadosOrigem = JSON.parse(JSON.stringify(window.reputacaoV2.dados));
                            console.log('✅ Reputação V2 restaurada (novo formato):', window.reputacaoV2.dados);
                        } else {
                            // Formato antigo - converter
                            window.reputacaoV2.dados = {
                                mundo: { fama: dados.reputacao.mundo || 0, temor: 0, valor: dados.reputacao.mundo || 0 },
                                regiao: { fama: dados.reputacao.regiao || 0, temor: 0, valor: dados.reputacao.regiao || 0 }
                            };
                            window.reputacaoV2.dadosOrigem = JSON.parse(JSON.stringify(window.reputacaoV2.dados));
                            console.log('✅ Reputação V2 restaurada (convertido do antigo formato):', window.reputacaoV2.dados);
                        }
                    }
                }
                
                // Fallback para ReputacaoModal (compatibilidade)
                if (window.reputacaoModal) {
                    window.reputacaoModal.tempValues = dados.reputacao;
                    window.reputacaoModal.originalValues = dados.reputacao;
                    console.log('✅ Reputação restaurada no modal (compatibilidade):', dados.reputacao);
                    
                    // Atualizar displays
                    if (typeof window.reputacaoModal.updateInputs === 'function') {
                        window.reputacaoModal.updateInputs();
                    }
                    if (typeof window.reputacaoModal.updatePreview === 'function') {
                        window.reputacaoModal.updatePreview();
                    }
                }
            }

            // ═══ RESTAURAR DADOS VISUAIS DO PERSONAGEM ═══
            if (dados.personagem) {
                const { nome, titulo, classe, raca, imagem } = dados.personagem;

                if (nome) {
                    const elemNome = document.getElementById('personagem-nome');
                    if (elemNome) elemNome.textContent = nome;
                }

                if (titulo) {
                    const elemTitulo = document.getElementById('personagem-titulo');
                    if (elemTitulo) elemTitulo.textContent = titulo;
                }

                if (classe) {
                    const elemClasse = document.getElementById('personagem-classe');
                    if (elemClasse) elemClasse.textContent = classe;
                }

                if (raca) {
                    const elemRaca = document.getElementById('personagem-raca');
                    if (elemRaca) elemRaca.textContent = raca;
                }

                if (imagem) {
                    const elemImagem = document.getElementById('personagem-imagem');
                    if (elemImagem) {
                        elemImagem.src = imagem;
                        console.log('📸 Imagem colocada no DOM:', imagem.substring(0, 100) + '...');
                        
                        elemImagem.onerror = () => {
                            console.warn('⚠️ Erro ao carregar imagem. Usando padrão.');
                            elemImagem.src = 'https://i.imgur.com/aVfMgAq.png';
                        };
                        
                        // 💾 SALVAR IMAGEM EM INDEXEDDB PARA PERSISTÊNCIA
                        console.log('💾 Salvando imagem em IndexedDB para persistência...');
                        
                        // Tentar via ImagemStorageManager (async)
                        if (typeof ImagemStorageManager !== 'undefined' && imagem) {
                            ImagemStorageManager.salvarImagem('personagem_imagem', imagem, 'personagem')
                                .then(() => {
                                    console.log('✅ Imagem salva com sucesso em IndexedDB');
                                    sessionStorage.setItem('IMAGEM_PERSONAGEM_RESTAURADA', 'true');
                                })
                                .catch(e => {
                                    console.warn('⚠️ Erro ao salvar imagem em IndexedDB:', e.message);
                                    // Fallback para localStorage
                                    if (typeof window.localStorageManager !== 'undefined') {
                                        try {
                                            window.localStorageManager.savePersonagemImagem({
                                                sourceUrl: imagem,
                                                dataUrl: imagem,
                                                timestamp: Date.now()
                                            });
                                            console.log('✅ Imagem salva como fallback em localStorage');
                                        } catch (err) {
                                            console.warn('⚠️ Erro ao salvar em localStorage:', err.message);
                                        }
                                    }
                                });
                        } else if (typeof window.localStorageManager !== 'undefined') {
                            // Fallback direto para localStorage
                            try {
                                window.localStorageManager.savePersonagemImagem({
                                    sourceUrl: imagem,
                                    dataUrl: imagem,
                                    timestamp: Date.now()
                                });
                                console.log('✅ Imagem salva em localStorage');
                                sessionStorage.setItem('IMAGEM_PERSONAGEM_RESTAURADA', 'true');
                            } catch (e) {
                                console.warn('⚠️ Erro ao salvar imagem em localStorage:', e.message);
                            }
                        }
                    }
                }

                console.log('✅ Dados do personagem restaurados');
            }

            // 🔄 Recalcular atributos secundários
            if (window.atributosConfigModal && typeof window.atributosConfigModal.calcularAtributosSecundarios === 'function') {
                window.atributosConfigModal.calcularAtributosSecundarios();
                console.log('✅ Secundários recalculados');
            }

            // 🔄 Atualizar displays visuais dos modais
            if (window.atributosConfigModal && typeof window.atributosConfigModal.syncAllAttributesDisplay === 'function') {
                window.atributosConfigModal.syncAllAttributesDisplay();
                console.log('✅ Display de atributos sincronizado');
            }

            if (window.statusConfigModal && typeof window.statusConfigModal.updateDisplay === 'function') {
                window.statusConfigModal.updateDisplay();
                console.log('✅ Display de status sincronizado');
                
                // ✅ Salvar status atualizado em localStorage
                try {
                    if (window.localStorageManager && window.statusConfigModal.state?.tempValues) {
                        window.localStorageManager.save('redungeon_ficha_status', window.statusConfigModal.state.tempValues);
                        console.log('💾 Status (com bonus/extra) salvo em localStorage');
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao salvar status em localStorage:', e.message);
                }
            }

            if (window.reputacaoModal && typeof window.reputacaoModal.updateDisplay === 'function') {
                window.reputacaoModal.updateDisplay();
                console.log('✅ Display de reputação sincronizado');
            }

            // 💾 SALVAR DADOS NO LOCALSTORAGE IMEDIATAMENTE APÓS RESTAURAÇÃO
            if (window.localStorageManager) {
                try {
                    window.localStorageManager.save('atributos', dados);
                    console.log('💾 Atributos salvos em localStorage');
                } catch (e) {
                    console.warn('⚠️ Erro ao salvar atributos em localStorage:', e);
                }
            }

            console.log('✅ RESTAURAÇÃO COMPLETA!');
            this.mostrarMensagem('✅ Atributos restaurados com sucesso!', 'sucesso');

        } catch (erro) {
            console.error('❌ Erro ao restaurar atributos:', erro);
            this.mostrarMensagem('❌ Erro ao restaurar atributos!', 'erro');
        }
    }

    /**
     * Restaura o estado das Veias Astrais importado do JSON.
     */
    async restaurarVeiasAstrais(dados) {
        if (!dados) {
            console.log('ℹ️ Nenhum estado de Veias Astrais no arquivo. Mantendo estado atual.');
            return;
        }

        console.log('✨ Restaurando estado das Veias Astrais...', dados);

        let tentativas = 0;
        while (!window.veiasAstraisSystem && tentativas < 30) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            tentativas++;
        }

        if (!window.veiasAstraisSystem) {
            console.error('❌ Veias Astrais não disponível para restauração');
            return;
        }

        const system = window.veiasAstraisSystem;

        // Garantir que o sistema esteja totalmente inicializado antes de aplicar estado
        tentativas = 0;
        while (!system.initialized && tentativas < 40) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            tentativas++;
        }

        if (!system.initialized) {
            console.warn('⚠️ VeiasAstraisSystem não finalizou inicialização; tentando aplicar estado mesmo assim');
        }

        if (Number.isFinite(dados.powerCombat)) {
            system.powerCombat = dados.powerCombat;
            console.log(`✅ Power Combat restaurado: ${dados.powerCombat}`);
        }
        if (Number.isFinite(dados.maxPowerCombat)) {
            system.maxPowerCombat = dados.maxPowerCombat;
            console.log(`✅ Max Power Combat restaurado: ${dados.maxPowerCombat}`);
        }
        if (Number.isFinite(dados.resonance)) {
            system.resonance = dados.resonance;
            console.log(`✅ Ressonância restaurada: ${dados.resonance}`);
        }
        if (Number.isFinite(dados.maxResonance)) {
            system.maxResonance = dados.maxResonance;
            console.log(`✅ Max Ressonância restaurado: ${dados.maxResonance}`);
        }

        if (Array.isArray(dados.nodes) && dados.nodes.length > 0) {
            dados.nodes.forEach((savedNode) => {
                const node = system.nodes.find((n) => String(n.id) === String(savedNode.id));
                if (node) {
                    node.state = savedNode.state || node.state;
                    node.level = savedNode.level != null ? savedNode.level : node.level;
                }
            });
            console.log(`✅ ${dados.nodes.length} nós astral restaurados (comparação de ids flexível)`);
        }

        // Reativar bônus baseados nos nós desbloqueados
        system.activeBonuses = [];
        system.nodes.forEach((node) => {
            if ((node.state === 'unlocked' || node.state === 'maxed') && node.bonus) {
                system.activateBonus(node.bonus);
            }
        });

        // Atualizar contagem de nós por constelação
        Object.values(system.trees).forEach((tree) => {
            tree.unlockedNodes = system.nodes.filter(
                (n) => n.treeId === tree.id && n.state !== 'locked',
            ).length;
        });

        // Tentar renderizar/atualizar via API do sistema
        try {
            if (typeof system.renderUI === 'function') system.renderUI();
            if (typeof system.updateUI === 'function') system.updateUI();
        } catch (e) {
            console.warn('⚠️ Falha ao chamar render/update do sistema (continuando):', e);
        }

        // Fallback direto no DOM caso os elementos não tenham sido atualizados pela API
        try {
            const pcCounter = document.getElementById('power-combat-counter');
            const pcMax = document.getElementById('power-combat-max');
            const pcFill = document.getElementById('power-combat-fill');
            if (pcCounter) pcCounter.textContent = String(system.powerCombat ?? '0');
            if (pcMax) pcMax.textContent = `/ ${String(system.maxPowerCombat ?? '0')}`;
            if (pcFill) {
                const max = Number(system.maxPowerCombat) || 0;
                const pc = Number(system.powerCombat) || 0;
                pcFill.style.width = max > 0 ? `${(pc / max) * 100}%` : '0%';
            }
        } catch (e) {
            console.warn('⚠️ Falha no fallback DOM para Power Combat:', e);
        }
        if (system.selectedNode && typeof system.renderNodeDetails === 'function') {
            system.renderNodeDetails();
        }

        // Restaurar conexões especiais ativadas, se houver
        if (
            window.veiasAstraisLineActivation &&
            typeof window.veiasAstraisLineActivation.restoreActivatedLines === 'function' &&
            Array.isArray(dados.activatedLines)
        ) {
            window.veiasAstraisLineActivation.restoreActivatedLines(dados.activatedLines);
        }

        if (typeof system.saveState === 'function') {
            system.saveState();
        }

        console.log('✅ Estado das Veias Astrais restaurado com sucesso');
    }

    /**
     * Restaura dados das Aptidões
     */
    /**
     * 🎯 RESTAURA DADOS DE APTIDÕES (NOVO SISTEMA)
     * ════════════════════════════════════════════════════════════════════════════════
     * Restaura aptidões no AptidoesManager
     * Processa:
     * - ganhas: restaura o campo
     * - aptidoesPersonagem: adiciona cada aptidão e seu nível
     * - vantagens: restaura bônus opcionais selecionados
     * - bonusOpcionaisEstado: restaura o estado exato dos bônus opcionais
     */
    async restaurarAptidoes(dados) {
        if (!dados) return;

        console.log('🎯 [restaurarAptidoes] Iniciando restauração...', dados);

        try {
            // ✅ Esperar o AptidoesManager estar disponível
            let tentativas = 0;
            while (!window.aptidoesManager && tentativas < 30) {
                await new Promise(r => setTimeout(r, 100));
                tentativas++;
            }

            if (!window.aptidoesManager) {
                console.error('❌ AptidoesManager não carregou após espera');
                return;
            }

            const manager = window.aptidoesManager;

            // ══════════════════════════════════════════════════════════════════
            // 1️⃣ RESTAURAR GANHAS
            // ══════════════════════════════════════════════════════════════════
            if (typeof dados.ganhas === 'number' && dados.ganhas > 0) {
                console.log(`📝 Restaurando Ganhas: ${dados.ganhas}`);
                manager.configAptidoes.ganhas = dados.ganhas;
                
                // Persistir no localStorage
                if (window.localStorageManager) {
                    try {
                        const storageData = window.localStorageManager.loadAptidoes() || {};
                        storageData.ganhas = dados.ganhas;
                        window.localStorageManager.saveAptidoes(storageData);
                        console.log('✅ Ganhas salvas em localStorage');
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar ganhas:', e);
                    }
                }
            }

            // ══════════════════════════════════════════════════════════════════
            // 2️⃣ RESTAURAR APTIDÕES PERSONAGEM
            // ══════════════════════════════════════════════════════════════════
            if (Array.isArray(dados.aptidoesPersonagem) && dados.aptidoesPersonagem.length > 0) {
                console.log(`📚 Restaurando ${dados.aptidoesPersonagem.length} aptidões...`);
                
                // Limpar aptidões atuais
                manager.aptidoesPersonagem = [];
                
                // Adicionar cada aptidão com seu nível
                for (const apt of dados.aptidoesPersonagem) {
                    if (!apt.id) continue;

                    console.log(`   ➕ Adicionando: ${apt.nome} (${apt.id}) - Nível ${apt.nivel}`);
                    
                    // Adicionar ao manager
                    manager.aptidoesPersonagem.push({
                        id: apt.id,
                        nome: apt.nome || apt.id,
                        nivel: apt.nivel || 0
                    });

                    // Persistir no localStorage
                    if (window.localStorageManager) {
                        try {
                            const storageData = window.localStorageManager.loadAptidoes() || {};
                            if (!storageData.personagemList) storageData.personagemList = [];
                            
                            // Verificar se já existe
                            const existe = storageData.personagemList.find(a => a.id === apt.id);
                            if (!existe) {
                                storageData.personagemList.push({
                                    id: apt.id,
                                    nome: apt.nome || apt.id,
                                    nivel: apt.nivel || 0
                                });
                            } else {
                                // Atualizar nível
                                existe.nivel = apt.nivel || 0;
                            }
                            
                            window.localStorageManager.saveAptidoes(storageData);
                        } catch (e) {
                            console.warn(`⚠️ Erro ao salvar aptidão ${apt.id}:`, e);
                        }
                    }
                }
                
                console.log('✅ Aptidões restauradas');
            }

            // ══════════════════════════════════════════════════════════════════
            // 3️⃣ RESTAURAR ESTADO DE BÔNUS OPCIONAIS (✨ NOVO)
            // ══════════════════════════════════════════════════════════════════
            if (dados.bonusOpcionaisEstado && typeof dados.bonusOpcionaisEstado === 'object') {
                if (window.vantagensAptidoesSystem && typeof window.vantagensAptidoesSystem.importarEstadoBonusOpcionais === 'function') {
                    console.log('🔁 Restaurando estado de bônus opcionais...', dados.bonusOpcionaisEstado);
                    window.vantagensAptidoesSystem.importarEstadoBonusOpcionais(dados.bonusOpcionaisEstado);
                    console.log('✅ Estado de bônus opcionais restaurado');
                }
            }

            // ══════════════════════════════════════════════════════════════════
            // 4️⃣ RE-RENDERIZAR
            // ══════════════════════════════════════════════════════════════════
            console.log('🎨 Re-renderizando aba de aptidões...');
            manager.render();
            
            console.log('✅ [restaurarAptidoes] Restauração concluída com sucesso!');

        } catch (erro) {
            console.error('❌ [restaurarAptidoes] ERRO:', erro);
            console.error('   Stack:', erro.stack);
        }
    }

    /**
     * Restaura dados das Habilidades
     */
    /**
     * ⚔️ RESTAURA DADOS DE HABILIDADES/ARTS (SISTEMA COMPLETO)
     * ════════════════════════════════════════════════════════════════════════════════
     * Restaura habilidades no ArtsSystemManager
     * Processa:
     * - Núcleos: cria cores no character
     * - Arts Ativas: restaura as artes ativas
     * - Arts Bloqueadas: restaura as artes bloqueadas
     * - Variações: restaura dentro de cada arte
     * - Limite de Arts: usa RulesEngine para recalcular automaticamente
     */
    async restaurarHabilidades(dados) {
        if (!dados) {
            console.warn('⚠️ [restaurarHabilidades] Nenhum dado fornecido');
            return;
        }

        console.log('⚔️ [restaurarHabilidades] Iniciando restauração...', dados);
        console.log('📊 Dados recebidos:', {
            nucleosCount: dados.nucleos?.length || 0,
            artsAtivasCount: dados.artsAtivas?.length || 0,
            artsBloqueadasCount: dados.artsBloqueadas?.length || 0,
            limiteArts: dados.limiteArts
        });

        try {
            // ✅ Esperar o ArtsSystemManager estar disponível
            let tentativas = 0;
            while (!window.artsSystem && tentativas < 30) {
                await new Promise(r => setTimeout(r, 100));
                tentativas++;
            }

            if (!window.artsSystem || !window.artsSystem.character) {
                console.error('❌ ArtsSystemManager não carregou após espera (30 tentativas de 100ms)');
                console.error('   window.artsSystem:', window.artsSystem);
                console.log('   ℹ️ Aguardando inicialização completa do sistema...');
                return;
            }

            const manager = window.artsSystem;
            console.log('✅ ArtsSystemManager carregado - character:', manager.character?.name);
            const character = manager.character;

            // ══════════════════════════════════════════════════════════════════
            // 1️⃣ RESTAURAR NÚCLEOS
            // ══════════════════════════════════════════════════════════════════
            if (Array.isArray(dados.nucleos) && dados.nucleos.length > 0) {
                console.log(`📚 Restaurando ${dados.nucleos.length} núcleos...`);
                
                // Limpar núcleos atuais
                character.cores = [];
                
                for (const coreData of dados.nucleos) {
                    const core = new Core({
                        id: coreData.id,
                        name: coreData.name,
                        concept: coreData.concept,
                        visualForm: coreData.visualForm,
                        description: coreData.description,
                        image: coreData.image,
                        baseBonus: coreData.baseBonus || {},
                        coreType: coreData.coreType || '',
                        createdAt: coreData.createdAt
                    });
                    
                    character.cores.push(core);
                    console.log(`   ✅ Núcleo restaurado: ${core.name}`);
                }
                
                console.log('✅ Núcleos restaurados com sucesso');
            } else {
                console.log('⚠️ Nenhum núcleo para restaurar');
            }

            // ══════════════════════════════════════════════════════════════════
            // 2️⃣ RESTAURAR ARTS (ATIVAS + BLOQUEADAS)
            // ══════════════════════════════════════════════════════════════════
            if ((Array.isArray(dados.artsAtivas) && dados.artsAtivas.length > 0) ||
                (Array.isArray(dados.artsBloqueadas) && dados.artsBloqueadas.length > 0)) {
                
                console.log(`⚔️ Restaurando arts...`);
                
                // Limpar arts atuais
                character.arts = [];
                
                // Função auxiliar para restaurar uma art
                const restaurarArt = (artData, status) => {
                    // Restaurar variações
                    const variations = (artData.variations || []).map(v => 
                        new Variation({
                            id: v.id || `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            name: v.name,
                            type: v.type,
                            action: v.action,
                            domain: v.domain,
                            cost: v.cost || 0,
                            reload: v.reload || 0,
                            damage: v.damage || {},
                            duration: v.duration || 0,
                            range: v.range || 0,
                            targets: v.targets || [],
                            description: v.description || '',
                            image: v.image || null,
                            effects: v.effects || {},
                            createdAt: v.createdAt || new Date().toISOString()
                        })
                    );

                    const art = new Art({
                        id: artData.id || `art_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: artData.name,
                        coreId: artData.coreId,
                        type: artData.type,
                        domain: artData.domain,
                        cooldown: artData.cooldown || 0,
                        duration: artData.duration || 0,
                        range: artData.range || 0,
                        targets: artData.targets || [],
                        cost: artData.cost || 0,
                        description: artData.description || '',
                        status: status || 'active',
                        image: artData.image || null,
                        artType: artData.artType || '',
                        action: artData.action || '',
                        damage: artData.damage || {},
                        reload: artData.reload || 0,
                        effects: artData.effects || {},
                        variations: variations,
                        createdAt: artData.createdAt || new Date().toISOString()
                    });

                    character.arts.push(art);
                    console.log(`   ✅ Art restaurada: ${art.name} (${status}) com ${variations.length} variações`);
                };

                // Restaurar arts ativas
                if (Array.isArray(dados.artsAtivas)) {
                    console.log(`📊 Processando ${dados.artsAtivas.length} arts ativas...`);
                    for (const artData of dados.artsAtivas) {
                        restaurarArt(artData, 'active');
                    }
                    console.log(`✅ ${dados.artsAtivas.length} arts ativas restauradas`);
                }

                // Restaurar arts bloqueadas
                if (Array.isArray(dados.artsBloqueadas)) {
                    console.log(`📊 Processando ${dados.artsBloqueadas.length} arts bloqueadas...`);
                    for (const artData of dados.artsBloqueadas) {
                        restaurarArt(artData, 'blocked');
                    }
                    console.log(`✅ ${dados.artsBloqueadas.length} arts bloqueadas restauradas`);
                }
            } else {
                console.log('⚠️ Nenhuma art para restaurar');
            }

            // ══════════════════════════════════════════════════════════════════
            // 3️⃣ SALVAR DADOS
            // ══════════════════════════════════════════════════════════════════
            console.log('💾 Salvando dados de habilidades...');
            if (typeof StorageManager !== 'undefined' && typeof StorageManager.saveCharacter === 'function') {
                StorageManager.saveCharacter(character);
                console.log('✅ Dados salvos no StorageManager');
            } else {
                console.warn('⚠️ StorageManager não disponível para salvar');
            }
            
            // ══════════════════════════════════════════════════════════════════
            // 4️⃣ RE-RENDERIZAR INTERFACE
            // ══════════════════════════════════════════════════════════════════
            console.log('🎨 Re-renderizando aba de habilidades...');
            if (manager.uiManager && typeof manager.uiManager.render === 'function') {
                await manager.uiManager.render(character);
                console.log('✅ Interface re-renderizada com sucesso');
            } else {
                console.warn('⚠️ UIManager.render não disponível');
            }
            
            console.log('✅ [restaurarHabilidades] Restauração COMPLETA!');

        } catch (erro) {
            console.error('❌ [restaurarHabilidades] ERRO:', erro);
            console.error('   Stack:', erro.stack);
        }
    }

    /**
     * Restaura dados do Inventário
     */
    /**
     * 📦 RESTAURA DADOS COMPLETOS DO INVENTÁRIO
     * ════════════════════════════════════════════════════════════════════════════════
     * Restaura:
     * - Itens com todas as propriedades (incluindo imagens em base64)
     * - Armazenamentos com bonus de espaço e imagens
     * 
     * Fluxo:
     * 1. Aguarda InventarioManager estar disponível
     * 2. Limpa itens e armazenamentos atuais
     * 3. Recria cada item com seus dados
     * 4. Recria cada armazenamento com seus dados
     * 5. Salva em localStorage
     * 6. Re-renderiza UI
     */
    async restaurarInventario(dados) {
        if (!dados) {
            console.warn('⚠️ [restaurarInventario] Nenhum dado fornecido');
            return;
        }

        console.log('📦 [restaurarInventario] Iniciando restauração...', dados);

        try {
            // ✅ Esperar o InventarioManager estar disponível
            let tentativas = 0;
            while (!window.inventarioManager && tentativas < 30) {
                await new Promise(r => setTimeout(r, 100));
                tentativas++;
            }

            if (!window.inventarioManager) {
                console.error('❌ InventarioManager não carregou após espera (30 tentativas de 100ms)');
                console.log('   ℹ️ Aguardando inicialização completa do sistema...');
                return;
            }

            const manager = window.inventarioManager;
            console.log('✅ InventarioManager carregado');

            // ══════════════════════════════════════════════════════════════════
            // 1️⃣ LIMPAR ITENS ATUAIS
            // ══════════════════════════════════════════════════════════════════
            if (manager.inventario.itens && manager.inventario.itens.length > 0) {
                console.log(`🧹 Removendo ${manager.inventario.itens.length} itens antigos...`);
                manager.inventario.itens = [];
            }

            // ══════════════════════════════════════════════════════════════════
            // 2️⃣ RESTAURAR ITENS
            // ══════════════════════════════════════════════════════════════════
            if (Array.isArray(dados.itens) && dados.itens.length > 0) {
                console.log(`📦 Restaurando ${dados.itens.length} itens...`);
                
                for (const itemData of dados.itens) {
                    try {
                        const novoItem = {
                            id: itemData.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            nome: itemData.nome || 'Item',
                            quantidade: itemData.quantidade || 1,
                            espaco: itemData.espaco || 1.0,
                            qualidade: itemData.qualidade || 'comum',
                            tipo: itemData.tipo || '',
                            nivel: itemData.nivel || 1,
                            roll: itemData.roll || '',
                            extra: itemData.extra || '',
                            imagemURL: itemData.imagemURL || '',
                            habilidade: itemData.habilidade || '',
                            historia: itemData.historia || '',
                            equipado: itemData.equipado || false,
                            criadoEm: itemData.criadoEm || Date.now()
                        };
                        
                        manager.inventario.itens.push(novoItem);
                        console.log(`   ✅ Item restaurado: ${novoItem.nome} (x${novoItem.quantidade})`);
                    } catch (e) {
                        console.warn(`   ⚠️ Erro ao restaurar item:`, e.message);
                    }
                }
                
                console.log(`✅ Total de ${manager.inventario.itens.length} itens restaurados`);
            } else {
                console.log('ℹ️  Nenhum item para restaurar');
            }

            // ══════════════════════════════════════════════════════════════════
            // 3️⃣ LIMPAR ARMAZENAMENTOS ATUAIS
            // ══════════════════════════════════════════════════════════════════
            if (manager.inventario.armazenamentos && manager.inventario.armazenamentos.length > 0) {
                console.log(`🧹 Removendo ${manager.inventario.armazenamentos.length} armazenamentos antigos...`);
                manager.inventario.armazenamentos = [];
            }

            // ══════════════════════════════════════════════════════════════════
            // 4️⃣ RESTAURAR ARMAZENAMENTOS
            // ══════════════════════════════════════════════════════════════════
            if (Array.isArray(dados.armazenamentos) && dados.armazenamentos.length > 0) {
                console.log(`🗃️  Restaurando ${dados.armazenamentos.length} armazenamentos...`);
                
                for (const armData of dados.armazenamentos) {
                    try {
                        const novoArmazenamento = {
                            id: armData.id || `arm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            nome: armData.nome || 'Armazenamento',
                            bonusEspaco: armData.bonusEspaco || 0,
                            descricao: armData.descricao || '',
                            imagemURL: armData.imagemURL || '',
                            criadoEm: armData.criadoEm || Date.now()
                        };
                        
                        manager.inventario.armazenamentos.push(novoArmazenamento);
                        console.log(`   ✅ Armazenamento restaurado: ${novoArmazenamento.nome} (+${novoArmazenamento.bonusEspaco})`);
                    } catch (e) {
                        console.warn(`   ⚠️ Erro ao restaurar armazenamento:`, e.message);
                    }
                }
                
                console.log(`✅ Total de ${manager.inventario.armazenamentos.length} armazenamentos restaurados`);
            } else {
                console.log('ℹ️  Nenhum armazenamento para restaurar');
            }

            // ══════════════════════════════════════════════════════════════════
            // 5️⃣ SALVAR NO LOCALSTORAGE
            // ══════════════════════════════════════════════════════════════════
            console.log('💾 Salvando inventário no localStorage...');
            manager.saveInventario();
            console.log('✅ Inventário salvo em localStorage');

            // ══════════════════════════════════════════════════════════════════
            // 6️⃣ RE-RENDERIZAR INTERFACE
            // ══════════════════════════════════════════════════════════════════
            console.log('🎨 Re-renderizando aba de inventário...');
            if (manager.ui && typeof manager.ui.renderizarEspaco === 'function') {
                manager.ui.renderizarEspaco();
                console.log('✅ Espaço re-renderizado');
            }
            if (manager.ui && typeof manager.ui.renderizarItens === 'function') {
                manager.ui.renderizarItens();
                console.log('✅ Itens re-renderizados');
            }
            if (manager.ui && typeof manager.ui.renderizarArmazenamentos === 'function') {
                manager.ui.renderizarArmazenamentos();
                console.log('✅ Armazenamentos re-renderizados');
            }

            console.log('✅ [restaurarInventario] Restauração COMPLETA!');

        } catch (error) {
            console.error('❌ [restaurarInventario] ERRO:', error);
            console.error('   Stack:', error.stack);
        }
    }

    /**
     * Restaura dados do Treinamento
     */
    /**
     * ⚔️ RESTAURA DADOS COMPLETOS DO SISTEMA DE TREINAMENTO
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * Restauração de:
     * - 6 atributos com seus 4 campos cada
     * - Sincronização de xpNecessaria (baseado em tabela)
     * - Sincronização de obstaculoAtual (baseado em fórmula)
     * - Histórico de treinamentos
     * 
     * Processo:
     * 1. Validar estrutura de dados
     * 2. Aguardar StateManager disponível
     * 3. Recalcular valores dependentes (xpNecessaria, obstaculoAtual)
     * 4. Restaurar em window.appState
     * 5. Salvar em localStorage para persistência
     * 6. Re-renderizar grid de atributos
     * ═══════════════════════════════════════════════════════════════════════════════
     */
    async restaurarTreinamento(dados) {
        console.log('⚔️ [restaurarTreinamento] Iniciando restauração...');

        // Validar dados
        if (!dados || !dados.atributos) {
            console.warn('⚠️ Dados de treinamento inválidos');
            return;
        }

        // Aguardar StateManager disponível
        let tentativas = 0;
        while (!window.appState && tentativas < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }

        if (!window.appState) {
            console.error('❌ StateManager não disponível após aguardar');
            return;
        }

        try {
            // Obter estado atual
            const state = window.appState.getState();

            // FUNÇÃO AUXILIAR: Obter XP necessário por faixa de nível
            const obterXPNecessario = (nivel) => {
                const TABELA = {
                    '0-9': 10,
                    '10-19': 20,
                    '20-29': 25,
                    '30-39': 30,
                    '40-49': 35,
                    '50-59': 40,
                    '60-69': 45,
                    '70-79': 50,
                    '80-89': 55,
                    '90-99': 60,
                    '100-119': 70,
                    '120-139': 80,
                    '140-150': 90,
                    'superior': 100
                };

                if (nivel <= 9) return TABELA['0-9'];
                if (nivel <= 19) return TABELA['10-19'];
                if (nivel <= 29) return TABELA['20-29'];
                if (nivel <= 39) return TABELA['30-39'];
                if (nivel <= 49) return TABELA['40-49'];
                if (nivel <= 59) return TABELA['50-59'];
                if (nivel <= 69) return TABELA['60-69'];
                if (nivel <= 79) return TABELA['70-79'];
                if (nivel <= 89) return TABELA['80-89'];
                if (nivel <= 99) return TABELA['90-99'];
                if (nivel <= 119) return TABELA['100-119'];
                if (nivel <= 139) return TABELA['120-139'];
                if (nivel <= 150) return TABELA['140-150'];
                return TABELA['superior'];
            };

            // FUNÇÃO AUXILIAR: Obter obstáculo baseado no nível
            const obterObstaculo = (nivel) => {
                return 5 + (Math.floor(nivel / 25) * 2);
            };

            // Preparar dados sincronizados
            const treinamentoRestaurado = {
                atributos: {},
                historico: dados.historico || []
            };

            // Restaurar cada atributo com sincronização
            const ATRIBUTOS_TREINAVEIS = ['forca', 'vitalidade', 'agilidade', 'percepcao', 'inteligencia', 'sorte'];
            
            console.log('📚 Restaurando 6 atributos...');

            ATRIBUTOS_TREINAVEIS.forEach(atributo => {
                const dadosAtributo = dados.atributos[atributo];
                
                if (!dadosAtributo) {
                    // Se faltar atributo, usar valor padrão
                    treinamentoRestaurado.atributos[atributo] = {
                        nivel: 0,
                        xpAtual: 0,
                        xpNecessaria: 10,
                        obstaculoAtual: 5
                    };
                    console.warn(`⚠️ ${atributo}: Usando valores padrão (não encontrado no JSON)`);
                    return;
                }

                // Sincronizar nível com atributos.primarios se houver discrepância
                let nivelFinal = dadosAtributo.nivel || 0;
                const atributoData = state.atributos?.primarios?.[atributo];
                if (atributoData && atributoData.base !== undefined) {
                    if (nivelFinal !== atributoData.base) {
                        console.log(`   🔄 ${atributo}: Sincronizando nível ${nivelFinal} → ${atributoData.base}`);
                        nivelFinal = atributoData.base;
                    }
                }

                // Recalcular xpNecessaria e obstaculoAtual baseado no nível
                const xpNecessariaCorreto = obterXPNecessario(nivelFinal);
                const obstaculoCorreto = obterObstaculo(nivelFinal);

                // Preservar xpAtual (validar se não excede limite)
                let xpAtualFinal = dadosAtributo.xpAtual || 0;
                if (xpAtualFinal > xpNecessariaCorreto) {
                    console.warn(`   ⚠️ ${atributo}: XP atual (${xpAtualFinal}) excedia limite (${xpNecessariaCorreto}), reduzindo`);
                    xpAtualFinal = xpNecessariaCorreto - 1;
                }

                // Restaurar com valores sincronizados
                treinamentoRestaurado.atributos[atributo] = {
                    nivel: nivelFinal,
                    xpAtual: xpAtualFinal,
                    xpNecessaria: xpNecessariaCorreto,
                    obstaculoAtual: obstaculoCorreto
                };

                console.log(`   ✅ ${atributo}: Nv. ${nivelFinal} | XP ${xpAtualFinal}/${xpNecessariaCorreto} | Obs. ${obstaculoCorreto}`);
            });

            // Restaurar em appState
            window.appState.setState({ treinamento: treinamentoRestaurado });
            console.log('✅ Treinamento restaurado em appState');

            // Salvar em localStorage para persistência
            localStorage.setItem('treinamento', JSON.stringify(treinamentoRestaurado));
            console.log('✅ Treinamento salvo em localStorage');

            // Re-renderizar grid de atributos
            if (window.treinamentoManager && window.treinamentoManager.renderizarAtributos) {
                window.treinamentoManager.renderizarAtributos();
                console.log('✅ Grid de atributos re-renderizado');
            } else {
                console.warn('⚠️ TreinamentoManager não disponível para renderização');
            }

            console.log('✅ [restaurarTreinamento] Restauração completa!');

        } catch (error) {
            console.error('❌ Erro ao restaurar treinamento:', error);
        }
    }

    /**
     * Restaura dados do Companheiro
     */
    async restaurarCompanheiro(dados) {
        if (!dados) {
            console.warn('⚠️ Nenhum dado de companheiro para restaurar');
            return;
        }
        
        console.log('📥 Restaurando companheiro:', dados.nome);
        console.log('📷 Imagem no arquivo importado:', dados.imagem ? dados.imagem.substring(0, 50) + '...' : 'NENHUMA');
        
        // 💾 SALVAR NO LOCALSTORAGE COM A ESTRUTURA CORRETA (redungeon_companheiros)
        try {
            if (window.companheirosManager) {
                // Criar objeto companheiro COMPLETO com ID
                const companheiro = {
                    id: `imported_${Date.now()}`,
                    
                    // Dados Básicos
                    nome: dados.nome || '',
                    tipo: dados.tipo || 'MASCOTE',
                    nivel: dados.nivel || 1,
                    experiencia: dados.experiencia || 0,
                    raca: dados.raca || '',
                    descricao: dados.descricao || '',
                    notas: dados.notas || '',
                    imagem: dados.imagem || null,
                    imagemDbId: dados.imagemDbId || null,
                    
                    // Barras de Status
                    saude: this._normalizarBarra(dados.saude, 100),
                    energia: this._normalizarBarra(dados.energia, 100),
                    fadiga: this._normalizarBarra(dados.fadiga, 100),
                    
                    // Atributos Primários
                    atributos: dados.atributos || {
                        forca: { base: 0, extra: 0 },
                        vitalidade: { base: 0, extra: 0 },
                        agilidade: { base: 0, extra: 0 },
                        inteligencia: { base: 0, extra: 0 },
                        percepcao: { base: 0, extra: 0 },
                        sorte: { base: 0, extra: 0 }
                    },
                    
                    // Atributos Secundários
                    secundarios: dados.secundarios || {
                        prontidao: { base: 0, extra: 0 },
                        ataque: { base: 0, extra: 0 },
                        defesa: { base: 0, extra: 0 },
                        reacao: { base: 0, extra: 0 },
                        precisao: { base: 0, extra: 0 },
                        evasao: { base: 0, extra: 0 }
                    },
                    
                    // Aptidões e Habilidades
                    aptidoes: dados.aptidoes || [],
                    vantagens: dados.vantagens || [],
                    habilidades: dados.habilidades || [],
                    aptitudesStats: dados.aptitudesStats || {
                        atual: 0,
                        ganhas: 0,
                        maximo: 3,
                        atributoPróxima: 'FOR'
                    },
                    
                    // ✨ NOVO: Status de vida
                    morto: dados.morto || false
                };
                
                // Adicionar ao manager e salvar
                window.companheirosManager.companheiros = [companheiro];
                await window.companheirosManager.salvarNoStorage();
                console.log('✅ Companheiro importado e salvo em redungeon_companheiros');
                console.log('📷 Imagem salva no localStorage:', companheiro.imagem ? companheiro.imagem.substring(0, 50) + '...' : 'NENHUMA');
                
                // 💾 SALVAR IMAGEM EM INDEXEDDB SE HOUVER
                if (companheiro.imagem && typeof companheiro.imagem === 'string' && companheiro.imagem.startsWith('data:')) {
                    try {
                        console.log('💾 Salvando imagem do companheiro em IndexedDB...');
                        if (window.companheirosImagemDB) {
                            const imagemDbId = await window.companheirosImagemDB.salvarImagem(
                                companheiro.id,
                                companheiro.imagem,
                                'companheiro'
                            );
                            companheiro.imagemDbId = imagemDbId;
                            // Atualizar localStorage com imagemDbId
                            window.companheirosManager.companheiros = [companheiro];
                            await window.companheirosManager.salvarNoStorage();
                            console.log('✅ Imagem salva em IndexedDB com ID:', imagemDbId);
                        }
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar imagem em IndexedDB:', e.message);
                        // Continuar mesmo sem IndexedDB
                    }
                }
                
                // 🔄 RECARREGAR A UI DO COMPANHEIRO SE ESTIVER ABERTA
                if (window.companheirosUI) {
                    await window.companheirosUI.renderizar();
                    console.log('🔄 UI de companheiro recarregada');
                }
            } else {
                // Fallback: salvar direto em localStorage
                const companheiroFallback = {
                    id: `imported_${Date.now()}`,
                    nome: dados.nome || '',
                    tipo: dados.tipo || 'MASCOTE',
                    nivel: dados.nivel || 1,
                    experiencia: dados.experiencia || 0,
                    raca: dados.raca || '',
                    descricao: dados.descricao || '',
                    notas: dados.notas || '',
                    imagem: dados.imagem || null,
                    imagemDbId: dados.imagemDbId || null,
                    saude: this._normalizarBarra(dados.saude, 100),
                    energia: this._normalizarBarra(dados.energia, 100),
                    fadiga: this._normalizarBarra(dados.fadiga, 100),
                    atributos: dados.atributos || {},
                    secundarios: dados.secundarios || {},
                    aptidoes: dados.aptidoes || [],
                    vantagens: dados.vantagens || [],
                    habilidades: dados.habilidades || [],
                    aptitudesStats: dados.aptitudesStats || {},
                    morto: dados.morto || false
                };
                localStorage.setItem('redungeon_companheiros', JSON.stringify([companheiroFallback]));
                console.log('✅ Companheiro salvo em localStorage');
            }
        } catch (e) {
            console.error('❌ Erro ao salvar companheiro em localStorage:', e);
        }
    }

    /**
     * ════════════════════════════════════════════════════════════════════════════════
     * Restaura TODOS os companheiros (Array)
     * ════════════════════════════════════════════════════════════════════════════════
     */
    async restaurarCompanheiros(companheirosArray) {
        if (!Array.isArray(companheirosArray) || companheirosArray.length === 0) {
            console.warn('⚠️ Nenhum companheiro para restaurar');
            return;
        }
        
        try {
            console.log(`📦 Restaurando ${companheirosArray.length} companheiros do arquivo...`);
            
            const companheirosProcessados = [];
            
            // Processar cada companheiro
            for (let i = 0; i < companheirosArray.length; i++) {
                const dados = companheirosArray[i];
                
                const companheiro = {
                    id: dados.id || `imported_${Date.now()}_${i}`,
                    nome: dados.nome || '',
                    tipo: dados.tipo || 'MASCOTE',
                    nivel: dados.nivel || 1,
                    experiencia: dados.experiencia || 0,
                    raca: dados.raca || '',
                    descricao: dados.descricao || '',
                    notas: dados.notas || '',
                    imagem: dados.imagem || null,
                    imagemDbId: dados.imagemDbId || null,
                    saude: this._normalizarBarra(dados.saude, 100),
                    energia: this._normalizarBarra(dados.energia, 100),
                    fadiga: this._normalizarBarra(dados.fadiga, 100),
                    atributos: dados.atributos || {
                        forca: { base: 0, extra: 0 },
                        vitalidade: { base: 0, extra: 0 },
                        agilidade: { base: 0, extra: 0 },
                        inteligencia: { base: 0, extra: 0 },
                        percepcao: { base: 0, extra: 0 },
                        sorte: { base: 0, extra: 0 }
                    },
                    secundarios: dados.secundarios || {
                        prontidao: { base: 0, extra: 0 },
                        ataque: { base: 0, extra: 0 },
                        defesa: { base: 0, extra: 0 },
                        reacao: { base: 0, extra: 0 },
                        precisao: { base: 0, extra: 0 },
                        evasao: { base: 0, extra: 0 }
                    },
                    aptidoes: dados.aptidoes || [],
                    vantagens: dados.vantagens || [],
                    habilidades: dados.habilidades || [],
                    aptitudesStats: dados.aptitudesStats || {
                        atual: 0,
                        ganhas: 0,
                        maximo: 3,
                        atributoPróxima: 'FOR'
                    },
                    // ✨ NOVO: Campos de Arts/Habilidades e Inventário
                    cores: dados.cores || [],
                    arts: dados.arts || [],
                    variantes: dados.variantes || [],
                    limiteArts: dados.limiteArts || 18,
                    inventario: dados.inventario || { itens: [], armazenamentos: [] },
                    
                    // ✨ NOVO: Status de vida
                    morto: dados.morto || false
                };
                
                // Salvar imagem em IndexedDB se houver
                if (companheiro.imagem && typeof companheiro.imagem === 'string' && companheiro.imagem.startsWith('data:')) {
                    try {
                        if (window.companheirosImagemDB) {
                            const imagemDbId = await window.companheirosImagemDB.salvarImagem(
                                companheiro.id,
                                companheiro.imagem,
                                'companheiro'
                            );
                            companheiro.imagemDbId = imagemDbId;
                            companheiro.imagem = null; // Remover base64 após salvar em IndexedDB
                            console.log(`✅ Imagem do ${companheiro.nome} salva em IndexedDB`);
                        }
                    } catch (e) {
                        console.warn(`⚠️ Erro ao salvar imagem em IndexedDB para ${companheiro.nome}:`, e.message);
                    }
                }
                
                companheirosProcessados.push(companheiro);
                console.log(`✅ Companheiro "${companheiro.nome}" (${i + 1}/${companheirosArray.length}) processado`);
            }
            
            // ✨ NOVO: Filtrar companheiros templates/vazios
            console.log('🔍 Filtrando companheiros templates/vazios...');
            const companheirosFiltrados = companheirosProcessados.filter(comp => {
                // Criterios para REMOVER um companheiro:
                // 1. Nome vazio ou "Novo Companheiro" (template default)
                // 2. AND todos os atributos base estão em 0 (não levantou nenhuma stat)
                // 3. AND nível é 1 e experiencia é 0 (nunca foi usado)
                
                const nomeVazio = !comp.nome || comp.nome.trim() === '' || comp.nome === 'Novo Companheiro';
                const atributosZero = comp.atributos && 
                    Object.values(comp.atributos).every(attr => attr.base === 0 && attr.extra === 0);
                const statsDefault = comp.nivel === 1 && comp.experiencia === 0;
                const tempoEmpty = !comp.raca || comp.raca.trim() === '';
                
                const ehTemplate = nomeVazio && atributosZero && statsDefault && tempoEmpty;
                
                if (ehTemplate) {
                    console.log(`⚠️ Removendo companheiro template/vazio (id: ${comp.id})`);
                    return false; // Remove da lista
                }
                
                return true; // Mantém o companheiro
            });
            
            if (companheirosFiltrados.length < companheirosProcessados.length) {
                console.log(`📊 Filtrados ${companheirosProcessados.length - companheirosFiltrados.length} companheiros templates`);
            }
            
            // ✨ NOVO: Restaurar inventários e artes
            console.log('🏪 Restaurando inventários dos companheiros...');
            for (const companheiro of companheirosFiltrados) {
                // Restaurar inventário
                if (companheiro.inventario) {
                    try {
                        const chaveInventario = `companheiroInventario_${companheiro.id}`;
                        localStorage.setItem(chaveInventario, JSON.stringify(companheiro.inventario));
                        console.log(`✅ Inventário do ${companheiro.nome} restaurado (${companheiro.inventario.itens.length} itens)`);
                    } catch (e) {
                        console.warn(`⚠️ Erro ao restaurar inventário do ${companheiro.nome}:`, e.message);
                    }
                }
                
                // Nota: cores, arts e variantes já estão dentro do objeto companheiro
                // e serão salvos junto com ele no salvarNoStorage()
            }
            
            // Salvar TODOS no manager
            if (window.companheirosManager) {
                window.companheirosManager.companheiros = companheirosFiltrados;
                await window.companheirosManager.salvarNoStorage();
                console.log(`✅ ${companheirosFiltrados.length} companheiros salvos no manager`);
            } else {
                // Fallback: salvar diretamente em localStorage
                localStorage.setItem('redungeon_companheiros', JSON.stringify(companheirosFiltrados));
                console.log(`✅ ${companheirosFiltrados.length} companheiros salvos em localStorage`);
            }
            
            // Recarregar UI se estiver aberta
            if (window.companheirosUI) {
                await window.companheirosUI.renderizar();
                console.log('🔄 UI de companheiros recarregada');
            }
            
            // ✨ NOVO: Renderizar abas de habilidades e inventário após restauração
            if (window.companheiroArtsRenderer) {
                try {
                    window.companheiroArtsRenderer.render();
                    console.log('✅ Arts/Habilidades renderizadas');
                } catch (e) {
                    console.warn('⚠️ Erro ao renderizar Arts:', e.message);
                }
            }
            
            if (window.companheiroInventarioUI) {
                try {
                    if (typeof window.companheiroInventarioUI.render === 'function') {
                        window.companheiroInventarioUI.render();
                    } else if (typeof window.companheiroInventarioUI.renderizar === 'function') {
                        window.companheiroInventarioUI.renderizar();
                    }
                    console.log('✅ Inventário renderizado');
                } catch (e) {
                    console.warn('⚠️ Erro ao renderizar Inventário:', e.message);
                }
            }
            
        } catch (erro) {
            console.error('❌ Erro ao restaurar companheiros:', erro);
        }
    }

    
    /**
     * Helper: Normalizar estrutura de barra (compatibilidade com diferentes formatos)
     */
    _normalizarBarra(barra, maxPadrao = 100) {
        // Se é um objeto com estrutura correta
        if (barra && typeof barra === 'object' && 'valor' in barra) {
            return {
                valor: barra.valor || 0,
                extra: barra.extra || 0,
                bonus: barra.bonus || 0,
                maxima: barra.maxima || maxPadrao
            };
        }
        
        // Se é um número simples (formato antigo)
        if (typeof barra === 'number') {
            return {
                valor: barra,
                extra: 0,
                bonus: 0,
                maxima: maxPadrao
            };
        }
        
        // Fallback
        return {
            valor: 0,
            extra: 0,
            bonus: 0,
            maxima: maxPadrao
        };
    }

    /**
     * 🧬 RESTAURA DADOS DO CULTIVO DO CORPO IMORTAL (LEGADO)
     * ═══════════════════════════════════════════════════════════════════════════════
     * ID: RESTAURAR_CULTIVO_CORPO_IMORTAL
     * 
     * ⚠️ IMPORTANTE: Esta função é específica do sistema corpo imortal (dados simples)
     * NÃO conflita com: restaurarCultivo() que é para o sistema moderno de cultivação
     */
    restaurarCultivoLegacy(dados) {
        if (!dados) return;
        const campos = {
            'cultivo-nivel': dados.nivel,
            'cultivo-estagio': dados.estágio,
            'cultivo-progresso': dados.progresso,
            'cultivo-energia': dados.energia,
            'cultivo-mana-max': dados.manaMaxima
        };
        this.preencherCampos(campos);
        
        // 💾 SALVAR NO LOCALSTORAGE
        if (window.localStorageManager) {
            try {
                window.localStorageManager.save('cultivo', dados);
                console.log('💾 Cultivo (Corpo Imortal) salvo em localStorage');
            } catch (e) {
                console.warn('⚠️ Erro ao salvar cultivo em localStorage:', e);
            }
        }
    }

    /**
     * 🌌 RESTAURA DADOS DO SISTEMA DE CULTIVAÇÃO
     * ═══════════════════════════════════════════════════════════════════════════════
     * Restaura:
     * - Dados universais: Alma, Dantian, Meridianos, Técnica, Mar Espiritual
     * - Dados por mundo: Elder Gods, Boreal Line, Legends of Murim
     * 
     * Sincroniza com: CultivacaoDadosManager
     */
    restaurarCultivo(dados) {
        if (!dados) {
            console.warn('⚠️ Dados de Cultivo não fornecidos para restauração');
            return;
        }

        try {
            if (!window.cultivacao || !window.cultivacao.dados) {
                console.warn('⚠️ CultivacaoDadosManager não disponível (window.cultivacao.dados)');
                return;
            }

            console.log('🌌 Restaurando dados de Cultivação...');

            // ═══ RESTAURAR DADOS UNIVERSAIS ═══
            if (dados.universal) {
                // Alma
                if (dados.universal.alma) {
                    window.cultivacao.dados.atualizar_alma(
                        dados.universal.alma.atual || 0,
                        dados.universal.alma.maximo || 100
                    );
                    console.log('✅ Alma restaurada:', dados.universal.alma);
                }

                // Dantian
                if (dados.universal.dantian) {
                    window.cultivacao.dados.atualizar_dantian(
                        dados.universal.dantian.atual || 0,
                        dados.universal.dantian.maximo || 50
                    );
                    console.log('✅ Dantian restaurado:', dados.universal.dantian);
                }

                // Meridianos
                if (dados.universal.meridianos) {
                    window.cultivacao.dados.atualizar_meridianos(dados.universal.meridianos.limpos || 0);
                    console.log('✅ Meridianos restaurados:', dados.universal.meridianos);
                }

                // Técnica
                if (dados.universal.tecnica) {
                    window.cultivacao.dados.atualizar_tecnica(
                        dados.universal.tecnica.nome || 'Técnica do Vácuo',
                        dados.universal.tecnica.tipo_energia || 'Essência Primordial',
                        dados.universal.tecnica.descricao || '',
                        dados.universal.tecnica.concentracao || '',
                        dados.universal.tecnica.dado || '1d4'
                    );
                    console.log('✅ Técnica restaurada:', dados.universal.tecnica);
                }

                // Mar Espiritual
                if (dados.universal.mar_espiritual) {
                    window.cultivacao.dados.atualizar_mar_espiritual({
                        estado: dados.universal.mar_espiritual.estado || 'Sereno',
                        tamanho: dados.universal.mar_espiritual.tamanho || 0,
                        elemento: dados.universal.mar_espiritual.elemento || 'agua',
                        densidade: dados.universal.mar_espiritual.densidade !== undefined ? dados.universal.mar_espiritual.densidade : 0,
                        descricao: dados.universal.mar_espiritual.descricao || ''
                    });
                    console.log('✅ Mar Espiritual restaurado:', dados.universal.mar_espiritual);
                }
            }

            // ═══ RESTAURAR DADOS MUNDOS ═══
            
            // ELDER GODS
            if (dados.elder_gods) {
                const eg = window.cultivacao.dados.dados.elder_gods;
                eg.rank = dados.elder_gods.rank || 1;
                eg.nome_rank = dados.elder_gods.nome_rank || 'Corpo Temperado';
                eg.nivel = dados.elder_gods.nivel || 1;
                eg.xp_atual = dados.elder_gods.xp_atual || 0;
                eg.xp_necessario = dados.elder_gods.xp_necessario || 100;
                eg.xp_total = dados.elder_gods.xp_total || 0;
                eg.risco_tribulacao = dados.elder_gods.risco_tribulacao || false;
                window.cultivacao.dados.salvar();
                console.log('✅ Elder Gods restaurado:', dados.elder_gods);
            }

            // BOREAL LINE
            if (dados.boreal_line) {
                const bl = window.cultivacao.dados.dados.boreal_line;
                bl.rank = dados.boreal_line.rank || 1;
                bl.nome_rank = dados.boreal_line.nome_rank || 'Cristalização';
                bl.nivel = dados.boreal_line.nivel || 1;
                bl.sub_rank = dados.boreal_line.sub_rank || 0;
                bl.nome_sub_rank = dados.boreal_line.nome_sub_rank || '';
                bl.fragmentos = dados.boreal_line.fragmentos || 0;
                bl.qi_acumulado = dados.boreal_line.qi_acumulado || 0;
                bl.mana = dados.boreal_line.mana || 0;
                bl.estagio_mana = dados.boreal_line.estagio_mana || 'Inicial';
                window.cultivacao.dados.salvar();
                console.log('✅ Boreal Line restaurado:', dados.boreal_line);
            }

            // LEGENDS OF MURIM
            if (dados.murim) {
                const m = window.cultivacao.dados.dados.murim;
                m.rank = dados.murim.rank || 1;
                m.nome_rank = dados.murim.nome_rank || 'Fundação Turva';
                m.nivel = dados.murim.nivel || 1;
                m.qi_acumulado = dados.murim.qi_acumulado || 0;
                m.fragmentos = dados.murim.fragmentos || 0;
                m.progresso_formacao = dados.murim.progresso_formacao || 0;
                m.petalas = dados.murim.petalas || 0;
                m.estagio_petala = dados.murim.estagio_petala || 'Inicial';
                m.nucleo_espiritual = {
                    cor: dados.murim.nucleo_espiritual?.cor || 'Cinzento',
                    potencial: dados.murim.nucleo_espiritual?.potencial || 50
                };
                m.canais_dao = dados.murim.canais_dao || 0;
                m.talento = dados.murim.talento || 'Normal';
                window.cultivacao.dados.salvar();
                console.log('✅ Legends of Murim restaurado:', dados.murim);
            }

            console.log('✅ Dados de Cultivação restaurados completamente');

            // ═══ RECARREGAR MUNDOS SE ESTIVEREM ABERTOS ═══
            // Tentar sincronizar UI dos mundos se os respectivos módulos estão carregados
            try {
                if (window.elderGodsUI && typeof window.elderGodsUI.renderizar === 'function') {
                    window.elderGodsUI.renderizar();
                    console.log('✅ Elder Gods UI recarregada');
                }
            } catch (e) {
                console.warn('⚠️ Erro ao recarregar Elder Gods UI:', e.message);
            }

            try {
                if (window.borealLineUI && typeof window.borealLineUI.renderizar === 'function') {
                    window.borealLineUI.renderizar();
                    console.log('✅ Boreal Line UI recarregada');
                }
            } catch (e) {
                console.warn('⚠️ Erro ao recarregar Boreal Line UI:', e.message);
            }

            try {
                if (window.murimUI && typeof window.murimUI.renderizar === 'function') {
                    window.murimUI.renderizar();
                    console.log('✅ Murim UI recarregada');
                }
            } catch (e) {
                console.warn('⚠️ Erro ao recarregar Murim UI:', e.message);
            }

        } catch (erro) {
            console.error('❌ Erro ao restaurar dados de cultivação:', erro);
        }
    }

    /**
     * Restaura dados do Corpo Imortal
     * ✨ ATUALIZADO: Restaurar dados dos 4 tipos (Dantian, Meridianos, Refino, Mar Espiritual)
     * - Níveis: 0-6 para cada tipo
     * - Melhorias Desbloqueadas: array de melhorias por tipo
     * - Pontos Disponíveis: calculado da soma dos atributos
     */
    restaurarCorpoImortal(dados) {
        if (!dados) {
            console.warn('⚠️ Dados de Corpo Imortal não fornecidos para restauração');
            return;
        }
        try {
            const dataToSave = {
                ativo: dados.ativo !== undefined ? dados.ativo : true,
                pontosDisponiveis: dados.pontosDisponiveis || 0,
                dantian: dados.dantian || 0,
                meridianos: dados.meridianos || 0,
                refino: dados.refino || 0,
                marEspiritual: dados.marEspiritual || 0,
                melhoriasDesbloqueadas: dados.melhoriasDesbloqueadas || {
                    dantian: [],
                    meridianos: [],
                    refino: [],
                    marEspiritual: []
                }
            };

            // ✅ PRIORIDADE 1: Atualizar objeto global se existir
            if (window.corpoImortalDados) {
                window.corpoImortalDados.dados = dataToSave;
                
                // Salvar no localStorage também via objeto global
                try {
                    window.corpoImortalDados.salvar();
                    console.log('✅ Corpo Imortal restaurado via objeto global:', dataToSave);
                } catch (err) {
                    // Se salvar() falhar, tenta direto no localStorage
                    localStorage.setItem('corpoImortalData', JSON.stringify(dataToSave));
                    console.log('✅ Corpo Imortal restaurado (fallback localStorage):', dataToSave);
                }
                return;
            }
            
            // ✅ PRIORIDADE 2: Salvar diretamente no localStorage
            localStorage.setItem('corpoImortalData', JSON.stringify(dataToSave));
            console.log('✅ Corpo Imortal restaurado via localStorage:', dataToSave);
            
            // ✅ Atualizar AppState se disponível
            if (window.appState) {
                window.appState.setState({
                    corpoImortal: dataToSave
                });
                console.log('✅ AppState atualizado com dados do Corpo Imortal');
            }
            
        } catch (erro) {
            console.error('❌ Erro ao restaurar Corpo Imortal:', erro);
        }
    }

    /**
     * Restaura dados da Loja
     * ✨ ATUALIZADO: Restaurar Rokmas Atuais no localStorage
     */
    restaurarLoja(dados) {
        if (!dados) {
            console.warn('⚠️ Dados da Loja não fornecidos para restauração');
            return;
        }
        try {
            // ✅ Restaurar Rokmas no localStorage (chave do MenuItensSystem)
            const rokmasValue = String(dados.rokmasAtuais || dados.rokmastorageString || '0');
            localStorage.setItem('menu-itens-rokmas', rokmasValue);
            console.log(`💰 [Importação] Rokmas Atuais restaurados em localStorage: ${rokmasValue}`);
            
            // ✅ Restaurar outros campos da loja se existirem
            const campos = {
                'loja-moedas': dados.moedas || 0,
                'loja-reputacao': dados.reputacao || 0
            };
            this.preencherCampos(campos);
            
            // ✅ Atualizar MenuItensSystem se disponível
            if (window.menuItensSystem && typeof window.menuItensSystem.carregar === 'function') {
                try {
                    window.menuItensSystem.carregar();
                    console.log('✅ MenuItensSystem recarregado com novos Rokmas');
                } catch (e) {
                    console.warn('⚠️ Erro ao recarregar MenuItensSystem:', e.message);
                }
            }
            
            // ✅ Atualizar UI do saldo (para mostrar novos Rokmas)
            if (window.menuItensUI && typeof window.menuItensUI.atualizarSaldoUI === 'function') {
                try {
                    window.menuItensUI.atualizarSaldoUI();
                    console.log('✅ UI de saldo atualizado com novos Rokmas');
                } catch (e) {
                    console.warn('⚠️ Erro ao atualizar UI de saldo:', e.message);
                }
            }
            
            // ✅ Fallback: Atualizar manualmente os elementos DOM
            const saldoModal = document.getElementById('modal-menu-itens-saldo');
            const saldoLoja = document.getElementById('loja-saldo-valor');
            if (saldoModal) saldoModal.textContent = rokmasValue;
            if (saldoLoja) saldoLoja.textContent = rokmasValue;
            console.log(`💰 Saldo atualizado nos elementos DOM: ${rokmasValue}`);
            
            // ✅ Atualizar AppState se disponível
            if (window.appState) {
                window.appState.setState({
                    loja: dados
                });
                console.log('✅ AppState atualizado com dados da Loja');
            }
            
            console.log('✅ Dados da Loja restaurados completamente:', dados);
        } catch (erro) {
            console.error('❌ Erro ao restaurar Loja:', erro);
        }
    }

    /**
     * Restaura dados de Sorte
     * ✨ ATUALIZADO: Restaurar Fortuna Atual no localStorage
     */
    restaurarSorte(dados) {
        if (!dados) return;
        try {
            // Restaurar Fortuna Atual no localStorage
            if (dados.fortunaAtualStorage !== undefined) {
                localStorage.setItem('redungeon_fortuna_atual', dados.fortunaAtualStorage);
                console.log(`💰 [Importação] Fortuna Atual restaurada: ${dados.fortunaAtualStorage}`);
            } else if (dados.fortunaAtual !== undefined) {
                localStorage.setItem('redungeon_fortuna_atual', String(dados.fortunaAtual));
                console.log(`💰 [Importação] Fortuna Atual restaurada: ${dados.fortunaAtual}`);
            }
            
            // Restaurar outros campos de sorte se existirem
            const campos = {
                'sorte-pontos': dados.pontos || 0,
                'sorte-maximo': dados.maximo || 10
            };
            this.preencherCampos(campos);
        } catch (erro) {
            console.error('❌ Erro ao restaurar Sorte:', erro);
        }
    }

    /**
     * 🎲 RESTAURA HISTÓRICO DE SORTE
     * ════════════════════════════════════════════════
     * Restaura o histórico completo de ações de sorte
     */
    restaurarHistoricoSorte(dados) {
        if (!dados || !Array.isArray(dados)) {
            console.warn('⚠️ Histórico de Sorte vazio ou inválido');
            return;
        }

        try {
            // Se o sistema de histórico não está disponível, não restaurar
            if (!window.sorteHistorico) {
                console.warn('⚠️ Sistema de Histórico de Sorte não disponível para restauração');
                return;
            }

            // Limpar histórico existente
            window.sorteHistorico.limparHistorico();

            // Restaurar cada item
            dados.forEach(item => {
                // Converter timestamp string de volta para Date
                const timestampDate = new Date(item.timestamp);
                
                // Recriar objeto de ação
                const acao = {
                    id: item.id,
                    tipo: item.tipo,
                    timestamp: timestampDate,
                    descricao: item.descricao,
                    iconEmoji: item.iconEmoji,
                    dados: item.dados || {}
                };

                // Adicionar diretamente ao histórico
                window.sorteHistorico.historico.unshift(acao);
            });

            // Manter limite de 10 itens
            if (window.sorteHistorico.historico.length > window.sorteHistorico.maxItens) {
                window.sorteHistorico.historico = window.sorteHistorico.historico.slice(0, window.sorteHistorico.maxItens);
            }

            // Salvar no localStorage
            window.sorteHistorico.salvarHistorico();

            // Renderizar
            window.sorteHistorico.renderHistorico();

            console.log(`✅ [Importação] Histórico de Sorte restaurado: ${dados.length} itens`);
        } catch (erro) {
            console.error('❌ Erro ao restaurar Histórico de Sorte:', erro);
        }
    }

    /**
     * 🏥 RESTAURA CONDIÇÕES ATIVAS (NOVO!)
     * ═══════════════════════════════════════════════════
     * Restaura todas as condições ativas do sistema
     */
    restaurarCondicoes(dados) {
        if (!dados) return;
        try {
            if (!window.sistemaCondicoes) {
                console.warn('⚠️ Sistema de Condições não disponível');
                return;
            }

            // Limpar condições existentes
            window.sistemaCondicoes.condicoesAtivas = [];

            // Restaurar cada condição
            if (dados.condicoesAtivas && Array.isArray(dados.condicoesAtivas)) {
                dados.condicoesAtivas.forEach(cond => {
                    window.sistemaCondicoes.condicoesAtivas.push(cond);
                });
                console.log(`🏥 [Importação] ${dados.total || 0} condições restauradas`);
            }

            // Salvar no localStorage
            window.sistemaCondicoes.salvarDados();
            
            // Renderizar se possível
            if (typeof window.sistemaCondicoes.renderizarPopupPrincipal === 'function') {
                window.sistemaCondicoes.renderizarPopupPrincipal();
            }

            console.log('✅ Condições restauradas com sucesso');
        } catch (erro) {
            console.error('❌ Erro ao restaurar Condições:', erro);
        }
    }

    /**
     * Restaura dados da Classe
     */
    restaurarClasse(dados) {
        if (!dados) return;
        const campos = {
            'classe-nome': dados.nome,
            'classe-descricao': dados.descricao
        };
        this.preencherCampos(campos);

        // ✨ NOVO: Restaurar as classes selecionadas (multiclasse)
        if (dados.classesSelecionadasIds && Array.isArray(dados.classesSelecionadasIds) && dados.classesSelecionadasIds.length > 0) {
            try {
                // Salvar no localStorage para que o ClassesUI carregue ao inicializar
                localStorage.setItem('redungeon_classes_selecionadas', JSON.stringify(dados.classesSelecionadasIds));
                console.log(`✅ ${dados.classesSelecionadasIds.length} classe(s) restaurada(s):`, dados.classesSelecionadasIds);

                // Se o ClassesUI está disponível, aplicar seleção de forma determinística
                // (não usar o método de toggle `escolherClasse`, que pode remover se já estiver selecionada)
                if (window.classesUI) {
                    try {
                        // Filtrar IDs válidos (existem nas DB)
                        const validIds = (dados.classesSelecionadasIds || []).filter(id => {
                            try { return !!(typeof obterClassePorId === 'function' ? obterClassePorId(id) : null); } catch { return false; }
                        });

                        // Forçar estado interno
                        window.classesUI.classesSelecionadas = [...validIds];
                        window.classesUI.bloqueioAtivo = validIds.length > 0;

                        // Garantir consistência de tipos
                        window.classesUI.classesSelecionadas = window.classesUI.classesSelecionadas.map(id => String(id));

                        // Persistir via API do próprio sistema
                        if (typeof window.classesUI.salvarClassesSelecionadas === 'function') {
                            window.classesUI.salvarClassesSelecionadas(validIds);
                        } else {
                            localStorage.setItem('redungeon_classes_selecionadas', JSON.stringify(validIds));
                        }

                        // Atualizar UI do modal/menus
                        if (typeof window.classesUI.aplicarBloqueioVisual === 'function') window.classesUI.aplicarBloqueioVisual();
                        if (typeof window.classesUI.atualizarBotoesSelecionados === 'function') window.classesUI.atualizarBotoesSelecionados();
                        if (typeof window.classesUI.atualizarCampoFicha === 'function') window.classesUI.atualizarCampoFicha();

                        // Forçar re-render do painel de detalhes para atualizar o botão do header
                        try {
                            const active = window.classesUI.classeAtiva || (window.classesUI.classesSelecionadas[0] || null);
                            if (active && typeof window.classesUI.selecionarClasse === 'function') {
                                window.classesUI.selecionarClasse(String(active));
                            }
                        } catch (errRender) {
                            console.warn('⚠️ Erro ao re-renderizar painel de classes:', errRender);
                        }

                        // Sincronizar popup-info-jogador se existir
                        if (window.popupInfoJogador && typeof window.popupInfoJogador.loadValuesFromState === 'function') {
                            window.popupInfoJogador.loadValuesFromState();
                        }

                        console.log('✅ ClassesUI atualizado com classes restauradas (aplicação direta)');
                    } catch (errInner) {
                        console.warn('⚠️ Erro ao aplicar seleção diretamente no ClassesUI:', errInner);
                    }
                }
            } catch (erro) {
                console.warn('⚠️ Erro ao restaurar classes:', erro);
            }
        }
    }

    /**
     * Restaura dados da Raça
     */
    restaurarRaca(dados) {
        if (!dados) return;
        const campos = {
            'raca-nome': dados.nome,
            'raca-descricao': dados.descricao
        };
        this.preencherCampos(campos);

        // ✨ NOVO: Restaurar a raça selecionada
        if (dados.racaSelecionadaId) {
            try {
                // Salvar no localStorage para que o RacasUI carregue ao inicializar
                localStorage.setItem('redungeon_raca_selecionada', dados.racaSelecionadaId);
                console.log(`✅ Raça restaurada: ${dados.racaSelecionadaId}`);

                // Se o RacasUI está disponível, aplicar seleção diretamente
                if (window.racasUI) {
                    try {
                        // Verificar validade
                        const valid = typeof obterRacaPorId === 'function' ? !!obterRacaPorId(dados.racaSelecionadaId) : true;
                        if (valid) {
                            window.racasUI.racaSelecionadaId = dados.racaSelecionadaId;
                            window.racasUI.bloqueioAtivo = true;

                            if (typeof window.racasUI.salvarRacaSelecionada === 'function') {
                                window.racasUI.salvarRacaSelecionada(dados.racaSelecionadaId);
                            } else {
                                localStorage.setItem('redungeon_raca_selecionada', dados.racaSelecionadaId);
                            }

                            if (typeof window.racasUI.aplicarBloqueioVisual === 'function') window.racasUI.aplicarBloqueioVisual();
                            if (typeof window.racasUI.atualizarBotaoSelecionada === 'function') window.racasUI.atualizarBotaoSelecionada(dados.racaSelecionadaId);
                            if (typeof window.racasUI.atualizarCampoFicha === 'function') window.racasUI.atualizarCampoFicha(obterRacaPorId(dados.racaSelecionadaId)?.nome || 'Raça');

                            // Sincronizar popup-info-jogador se existir
                            if (window.popupInfoJogador && typeof window.popupInfoJogador.loadValuesFromState === 'function') {
                                window.popupInfoJogador.loadValuesFromState();
                            }

                            console.log('✅ RacasUI atualizado com raça restaurada (aplicação direta)');
                        }
                    } catch (errInner) {
                        console.warn('⚠️ Erro ao aplicar seleção diretamente no RacasUI:', errInner);
                    }
                }
            } catch (erro) {
                console.warn('⚠️ Erro ao restaurar raça:', erro);
            }
        }

        // 🎯 NOVO: Restaurar habilidades raciais ativas e travadas
        if (dados.habilidadesRaciais && dados.habilidadesRaciais.racaId) {
            try {
                const chave = `raca-habilidades-${dados.habilidadesRaciais.racaId}`;
                const estadoHabilidades = {
                    racaId: dados.habilidadesRaciais.racaId,
                    ativas: dados.habilidadesRaciais.ativas || [],
                    travadas: dados.habilidadesRaciais.travadas || [],
                    timestamp: Date.now()
                };
                
                // Salvar no localStorage para o HabilidadesBasicasSelector carregar
                localStorage.setItem(chave, JSON.stringify(estadoHabilidades));
                console.log(`💾 Habilidades raciais salvas em localStorage:`, estadoHabilidades);

                // Se o HabilidadesBasicasSelector está disponível, usar novo método
                if (window.habilidadesBasicasSelector) {
                    // Estratégia 1: Se já está inicializado, usar restaurarDeJSON()
                    if (window.habilidadesBasicasSelector.inicializado) {
                        const sucesso = window.habilidadesBasicasSelector.restaurarDeJSON(dados.habilidadesRaciais);
                        if (sucesso) {
                            window.habilidadesBasicasSelector.reRenderizarControles();
                            console.log('✅ Habilidades restauradas e re-renderizadas imediatamente');
                        }
                    } else {
                        // Estratégia 2: Aguardar inicialização (com limite de tentativas)
                        let tentativas = 0;
                        const maxTentativas = 20; // 2 segundos com 100ms de intervalo
                        const intervalo = setInterval(() => {
                            tentativas++;
                            
                            if (window.habilidadesBasicasSelector?.inicializado) {
                                clearInterval(intervalo);
                                const sucesso = window.habilidadesBasicasSelector.restaurarDeJSON(dados.habilidadesRaciais);
                                if (sucesso) {
                                    window.habilidadesBasicasSelector.reRenderizarControles();
                                    console.log('✅ Habilidades restauradas após inicialização do selector');
                                }
                            } else if (tentativas >= maxTentativas) {
                                clearInterval(intervalo);
                                console.warn('⚠️ Timeout esperando inicialização do HabilidadesBasicasSelector');
                                console.log('   Os dados foram salvos em localStorage e serão carregados quando o modal for aberto');
                            }
                        }, 100);
                    }
                } else {
                    console.warn('⚠️ HabilidadesBasicasSelector não disponível');
                    console.log('   Os dados foram salvos em localStorage e serão carregados quando o modal for aberto');
                }
            } catch (erro) {
                console.error('❌ Erro ao restaurar habilidades raciais:', erro);
            }
        }
    }

    /**
     * 📋 RESTAURA DADOS DO POPUP-INFO-JOGADOR (NOVO!)
     * ═══════════════════════════════════════════════════
     * Restaura as informações completas do jogador salvos em JSON
     * Salva direto no localStorage usando localStorageManager
     */
    restaurarPopupInfo(dados) {
        if (!dados) {
            console.warn('⚠️ Dados do popup-info vazios');
            return;
        }

        try {
            console.log('📋 Restaurando dados do popup-info...', dados);

            // ✨ ESTRATÉGIA: Salvar direto usando localStorageManager
            // Isso garante que quando o popup abrir, loadValuesFromState() carregará automaticamente
            const popupInfoData = {
                nomePersonagem: dados.nomePersonagem || 'Aventureiro Desconhecido',
                tituloPersonagem: dados.tituloPersonagem || 'Sem Título',
                classePersonagem: dados.classePersonagem || 'Não possui',
                racaPersonagem: dados.racaPersonagem || 'Não possui',
                origem: dados.origem || 'Desconhecida',
                afiliacao: dados.afiliacao || 'Nenhuma',
                statusNarrativo: dados.statusNarrativo || 'Ativo',
                notasAdicionais: dados.notasAdicionais || '',
                background: dados.background || ''
            };

            // Salvar usando localStorageManager (chave: 'jogador_info')
            if (window.localStorageManager && typeof window.localStorageManager.saveJogadorInfo === 'function') {
                window.localStorageManager.saveJogadorInfo(popupInfoData);
                console.log('✅ Dados salvos via localStorageManager');
            } else {
                // Fallback: salvar direto no localStorage
                localStorage.setItem('jogador_info', JSON.stringify(popupInfoData));
                console.log('✅ Dados salvos direto no localStorage (fallback)');
            }

            // Se o popup-info foi inicializado, sincronizar tempValues
            if (window.popupInfoJogador) {
                window.popupInfoJogador.tempValues = { ...popupInfoData };
                window.popupInfoJogador.originalValues = { ...popupInfoData };
                
                // Se está aberto, atualizar inputs imediatamente
                if (window.popupInfoJogador.isOpen && typeof window.popupInfoJogador.updateFormInputs === 'function') {
                    window.popupInfoJogador.updateFormInputs();
                    console.log('✅ PopupInfo atualizado em tempo real');
                }

                if (typeof window.popupInfoJogador.loadValuesFromState === 'function') {
                    window.popupInfoJogador.loadValuesFromState();
                    console.log('✅ PopupInfo sincronizado com o estado carregado após importação');
                }
            }

        } catch (erro) {
            console.error('❌ Erro ao restaurar popup-info:', erro);
        }
    }

    /**
     * 🔄 RESTAURA DADOS DAS VEIAS ASTRAIS
     * Salva o payload diretamente no LocalStorageManager e, se o sistema já estiver
     * inicializado, força o carregamento imediato do estado astral.
     */
    restaurarVeiasAstrais(dados) {
        if (!dados) {
            console.warn('⚠️ Dados das Veias Astrais vazios ou ausentes');
            return;
        }

        try {
            console.log('🔄 Restaurando Veias Astrais...', dados);

            if (window.localStorageManager && typeof window.localStorageManager.saveVeiasAstrais === 'function') {
                window.localStorageManager.saveVeiasAstrais(dados);
                console.log('✅ Veias Astrais salvas em localStorage');
            } else {
                const chave = 'redungeon_ficha_veias_astrais';
                localStorage.setItem(chave, JSON.stringify(dados));
                console.log('✅ Veias Astrais salvas diretamente no localStorage (fallback)');
            }

            if (window.veiasAstraisSystem && typeof window.veiasAstraisSystem.loadSavedStates === 'function') {
                window.veiasAstraisSystem.loadSavedStates();
                console.log('✅ Veias Astrais recarregadas no sistema existente');
            }
        } catch (erro) {
            console.error('❌ Erro ao restaurar Veias Astrais:', erro);
        }
    }

    /**
     * ════════════════════════════════════════════════════════════════════════════════
     * UTILITÁRIOS
     * ════════════════════════════════════════════════════════════════════════════════
     */

    /**
     * Preenche múltiplos campos HTML de uma vez
     */
    preencherCampos(campos) {
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (elemento.type === 'checkbox') {
                    elemento.checked = campos[id];
                } else {
                    // 🔒 ISOLAMENTO: Não disparar eventos durante importação
                    // Usar dispatchEvent apenas durante operações normais
                    const wasImporting = window.isImportandoFicha || sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA');
                    elemento.value = campos[id];
                    
                    // ⚠️ Se não estamos importando, disparar evento change (para outras situações)
                    if (!wasImporting) {
                        elemento.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }
        });
    }

    /**
     * Mostra mensagem de feedback ao usuário
     */
    mostrarMensagem(mensagem, tipo = 'info') {
        // Criar elemento de mensagem
        const msgDiv = document.createElement('div');
        msgDiv.className = `mensagem-sistema mensagem-${tipo}`;
        msgDiv.textContent = mensagem;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            ${tipo === 'sucesso' ? 'background: #10b981; color: white;' : ''}
            ${tipo === 'erro' ? 'background: #ef4444; color: white;' : ''}
            ${tipo === 'info' ? 'background: #3b82f6; color: white;' : ''}
        `;
        
        document.body.appendChild(msgDiv);
        
        // Remover após 3 segundos
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => msgDiv.remove(), 300);
        }, 3000);
    }
}

/**
 * Inicializar sistema quando DOM estiver pronto
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sistemaFicha = new SistemaFicha();
    });
} else {
    window.sistemaFicha = new SistemaFicha();
}
