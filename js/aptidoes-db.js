/* ============================================ */
/* APTIDÕES-DB.JS - Banco de Dados de Aptidões */
/* ============================================ */

/**
 * AptidoesDB - Gerenciamento de IndexedDB para Aptidões
 * Armazena:
 * - Catálogo de aptidões do sistema
 * - Aptidões adquiridas pelo personagem
 * - Configurações de bonus
 */

class AptidoesDB {
    constructor() {
        this.dbName = 'ReDungeonDB';
        this.version = 5; // Versão incrementada para forçar recreação do catálogo
        this.db = null;
    }

    /**
     * Inicializa o banco de dados com fallback gracioso
     */
    async init() {
        return new Promise((resolve, reject) => {
            console.log(`📦 Abrindo IndexedDB "${this.dbName}" versão ${this.version}...`);

            // Verificar se IndexedDB está disponível
            if (!window.indexedDB) {
                console.warn(`⚠️ IndexedDB não disponível, continuando sem persistência em DB`);
                this.db = null;
                resolve(); // Resolver sem erro
                return;
            }

            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.warn('⚠️ Erro ao abrir IndexedDB, continuando sem persistência:', request.error);
                console.warn('⚠️ Nome do erro:', request.error.name);
                console.warn('⚠️ Mensagem:', request.error.message);
                // NÃO rejeitar - apenas continuar sem BD
                this.db = null;
                resolve(); // Resolver em vez de rejeitar
            };

            request.onblocked = () => {
                console.warn('⚠️ Abertura do IndexedDB bloqueada - fechando outras abas pode ajudar');
            };

            request.onupgradeneeded = (event) => {
                console.log(`📦 Atualizando banco de dados para versão ${this.version}...`);
                const db = event.target.result;

                try {
                    // Criar object stores se não existirem
                    if (!db.objectStoreNames.contains('aptidoesCatalogo')) {
                        db.createObjectStore('aptidoesCatalogo', { keyPath: 'id' });
                        console.log('✅ Object store "aptidoesCatalogo" criado');
                    }

                    if (!db.objectStoreNames.contains('aptidoesPersonagem')) {
                        db.createObjectStore('aptidoesPersonagem', { keyPath: 'id' });
                        console.log('✅ Object store "aptidoesPersonagem" criado');
                    }

                    if (!db.objectStoreNames.contains('aptidoesConfig')) {
                        db.createObjectStore('aptidoesConfig', { keyPath: 'key' });
                        console.log('✅ Object store "aptidoesConfig" criado');
                    }

                    console.log('📦 ✅ Atualização do banco concluída');
                } catch (upgradeError) {
                    console.error('❌ Erro durante upgrade:', upgradeError);
                    reject(upgradeError);
                }
            };

            request.onsuccess = async () => {
                try {
                    this.db = request.result;
                    console.log('✅ AptidoesDB inicializado com sucesso');
                    
                    // Dar tempo para o upgrade completar totalmente
                    await new Promise(r => setTimeout(r, 100));
                    
                    // Verificar se o catálogo está vazio - com retry
                    let tentativas = 0;
                    let catalogoExistente = [];
                    
                    while (tentativas < 3 && catalogoExistente.length === 0) {
                        catalogoExistente = await this.getCatalogo();
                        if (catalogoExistente.length === 0) {
                            console.log(`📦 Tentativa ${tentativas + 1}: Catálogo vazio, inserindo dados...`);
                            const catalogo = this.getCatalogoCompleto();
                            await this.insertCatalogo();
                            tentativas++;
                            await new Promise(r => setTimeout(r, 100));
                        }
                    }
                    
                    if (catalogoExistente.length > 0) {
                        console.log(`📦 ✅ Catálogo pronto com ${catalogoExistente.length} aptidões`);
                    } else {
                        console.warn('⚠️ Catálogo ainda vazio após tentativas');
                    }
                    
                    resolve(this.db); // Sempre resolver, mesmo sem catálogo
                } catch (error) {
                    console.warn('⚠️ Erro ao verificar/inserir catálogo, continuando sem BD:', error);
                    resolve(null); // Resolver com null em vez de rejeitar
                }
            };
        });
    }

    /**
     * Insere o catálogo completo de aptidões
     */
    async insertCatalogo() {
        const catalogo = this.getCatalogoCompleto();
        
        return new Promise((resolve, reject) => {
            // Timeout de segurança
            const insertTimeout = setTimeout(() => {
                reject(new Error('insertCatalogo timeout após 5s'));
            }, 5000);
            
            try {
                const transaction = this.db.transaction(['aptidoesCatalogo'], 'readwrite');
                const store = transaction.objectStore('aptidoesCatalogo');

                // Inserir todas as aptidões em uma única transação
                catalogo.forEach(aptidao => {
                    store.put(aptidao);
                });

                transaction.onerror = () => {
                    clearTimeout(insertTimeout);
                    reject(transaction.error);
                };
                transaction.oncomplete = () => {
                    clearTimeout(insertTimeout);
                    console.log(`✅ Todas as ${catalogo.length} aptidões inseridas com sucesso`);
                    resolve(catalogo.length);
                };
            } catch (error) {
                clearTimeout(insertTimeout);
                reject(error);
            }
        });
    }

    /**
     * Insere uma aptidão no catálogo
     */
    async insertAptidaoCatalogo(aptidao) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['aptidoesCatalogo'], 'readwrite');
            const store = transaction.objectStore('aptidoesCatalogo');
            const request = store.put(aptidao);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Obtém todas as aptidões do catálogo
     */
    async getCatalogo() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['aptidoesCatalogo'], 'readonly');
            const store = transaction.objectStore('aptidoesCatalogo');
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Obtém uma aptidão específica do catálogo
     */
    async getAptidaoCatalogo(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['aptidoesCatalogo'], 'readonly');
            const store = transaction.objectStore('aptidoesCatalogo');
            const request = store.get(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Adiciona uma aptidão ao personagem
     */
    async addAptidaoPersonagem(id, nome, nivel = 0, bonus = 0) {
        const aptidao = {
            id: id,
            nome: nome,
            nivel: nivel,
            bonus: bonus,
            timestamp: Date.now()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['aptidoesPersonagem'], 'readwrite');
            const store = transaction.objectStore('aptidoesPersonagem');
            const request = store.put(aptidao);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(aptidao);
        });
    }

    /**
     * Obtém todas as aptidões do personagem
     */
    async getAptidoesPersonagem() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['aptidoesPersonagem'], 'readonly');
            const store = transaction.objectStore('aptidoesPersonagem');
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Obtém uma aptidão do personagem
     */
    async getAptidaoPersonagem(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['aptidoesPersonagem'], 'readonly');
            const store = transaction.objectStore('aptidoesPersonagem');
            const request = store.get(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Atualiza uma aptidão do personagem
     */
    async updateAptidaoPersonagem(id, updates) {
        if (!this.db) {
            console.error('❌ Database não inicializado em updateAptidaoPersonagem');
            throw new Error('Database não inicializado');
        }

        const aptidao = await this.getAptidaoPersonagem(id);
        if (!aptidao) {
            console.warn(`Aptidão não encontrada: ${id}`);
            return null;
        }

        const updated = { ...aptidao, ...updates };

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['aptidoesPersonagem'], 'readwrite');
                const store = transaction.objectStore('aptidoesPersonagem');
                const request = store.put(updated);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(updated);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Remove uma aptidão do personagem
     */
    async removeAptidaoPersonagem(id) {
        if (!this.db) {
            console.error('❌ Database não inicializado em removeAptidaoPersonagem');
            throw new Error('Database não inicializado');
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['aptidoesPersonagem'], 'readwrite');
                const store = transaction.objectStore('aptidoesPersonagem');
                const request = store.delete(id);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Salva configuração (Ganhas, etc)
     */
    async setConfig(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['aptidoesConfig'], 'readwrite');
            const store = transaction.objectStore('aptidoesConfig');
            const request = store.put({ key, value });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
        });
    }

    /**
     * Obtém configuração
     */
    async getConfig(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['aptidoesConfig'], 'readonly');
            const store = transaction.objectStore('aptidoesConfig');
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result?.value ?? 0);
        });
    }

    /**
     * Limpa tudo (para reset)
     */
    async clearAll() {
        return Promise.all([
            this.clearStore('aptidoesCatalogo'),
            this.clearStore('aptidoesPersonagem'),
            this.clearStore('aptidoesConfig')
        ]);
    }

    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
        });
    }

    /**
     * Catálogo completo de aptidões do sistema
     */
    /**
     * Retorna o catálogo completo de aptidões
     * Dados baseados em APTIDOES_LISTA.txt
     */
    getCatalogoCompleto() {
        const catalogo = [
            {
                id: 'acrobacia',
                nome: 'Acrobacia',
                descricao: 'Movimentos ágeis e equilibrados',
                imagem: 'https://i.imgur.com/TAnNSDg.png',
                vantagens: [
                    { nivel: 1, efeito: 'Nunca sofre penalidades por superfícies estreitas ou instáveis comuns.', narrativa: 'Equilíbrio Natural' },
                    { nivel: 3, efeito: 'Pode atravessar obstáculos, grades, janelas e espaços reduzidos sem precisar reduzir o movimento.', narrativa: 'Corpo Adaptável' },
                    { nivel: 5, efeito: 'Uma vez por cena, realiza uma manobra física considerada impossível para uma pessoa comum, desde que não desafie as leis do mundo.', narrativa: 'Movimento Impossível' }
                ]
            },
            {
                id: 'alquimia',
                nome: 'Alquimia',
                descricao: 'Manipulação de elementos alquímicos',
                imagem: 'https://i.imgur.com/PMB9pIt.png',
                vantagens: [
                    { nivel: 1, efeito: 'Identifica ingredientes alquímicos apenas observando-os.', narrativa: 'Conhecimento de Reagentes' },
                    { nivel: 3, efeito: 'Pode substituir um ingrediente comum por outro semelhante sem comprometer completamente a receita.', narrativa: 'Improvisação' },
                    { nivel: 5, efeito: 'Uma vez por descanso, uma criação alquímica que falharia produz um resultado imperfeito em vez de falhar totalmente.', narrativa: 'Mestre Alquimista' }
                ]
            },
            {
                id: 'ambidestro',
                nome: 'Ambidestro',
                descricao: 'Destreza com ambas as mãos',
                imagem: 'https://i.imgur.com/qJbTuXg.png',
                vantagens: [
                    { nivel: 1, efeito: 'Coordenação Total — Utiliza ambas as mãos com a mesma habilidade, sem qualquer perda de precisão ou controle.', narrativa: 'Coordenação Total' },
                    { nivel: 3, efeito: 'Combate Simétrico — Consegue alternar armas, ferramentas e movimentos entre as duas mãos de forma completamente natural, confundindo adversários.', narrativa: 'Combate Simétrico' },
                    { nivel: 5, efeito: 'Mestre das Duas Mãos — Uma vez por combate, pode executar uma sequência perfeitamente coordenada utilizando ambas as mãos simultaneamente, realizando duas ações compatíveis em perfeita sincronia.', narrativa: 'Mestre das Duas Mãos' }
                ]
            },
            {
                id: 'arcanismo',
                nome: 'Arcanismo',
                descricao: 'Maestria na magia arcana',
                imagem: 'https://i.imgur.com/Ryug5hL.png',
                vantagens: [
                    { nivel: 1, efeito: 'Conhecimento Arcano — Reconhece escolas mágicas, encantamentos e fenômenos arcanos com facilidade.', narrativa: 'Conhecimento Arcano' },
                    { nivel: 3, efeito: 'Manipulação Arcana — Consegue moldar a energia mágica com extrema precisão, reduzindo falhas durante conjurações complexas.', narrativa: 'Manipulação Arcana' },
                    { nivel: 5, efeito: 'Arquimago — Uma vez por cena, pode compreender instantaneamente o funcionamento básico de uma magia ou artefato arcano desconhecido.', narrativa: 'Arquimago' }
                ]
            },
            {
                id: 'atletismo',
                nome: 'Atletismo',
                descricao: 'Força, condicionamento e preparo físico',
                imagem: 'https://i.imgur.com/AQS5yO6.png',
                vantagens: [
                    { nivel: 1, efeito: 'Condicionamento Físico — Escala, nada, corre e realiza esforços físicos intensos com muito mais eficiência.', narrativa: 'Condicionamento Físico' },
                    { nivel: 3, efeito: 'Corpo Treinado — Consegue executar acrobacias, saltos e feitos físicos difíceis com naturalidade.', narrativa: 'Corpo Treinado' },
                    { nivel: 5, efeito: 'Limite Humano — Uma vez por cena, pode superar temporariamente seus próprios limites físicos para realizar um feito extraordinário.', narrativa: 'Limite Humano' }
                ]
            },
            {
                id: 'atuacao',
                nome: 'Atuação',
                descricao: 'Interpretação e representação',
                imagem: 'https://i.imgur.com/5g11BQc.png',
                vantagens: [
                    { nivel: 1, efeito: 'Ator Nato — Consegue interpretar emoções e personalidades de maneira extremamente convincente.', narrativa: 'Ator Nato' },
                    { nivel: 3, efeito: 'Mestre dos Papéis — Imita sotaques, trejeitos, postura e comportamento de outras pessoas após observá-las.', narrativa: 'Mestre dos Papéis' },
                    { nivel: 5, efeito: 'Transformação Completa — Uma vez por cena, assume um personagem de forma tão perfeita que até conhecidos podem ser enganados.', narrativa: 'Transformação Completa' }
                ]
            },
            {
                id: 'beleza',
                nome: 'Beleza',
                descricao: 'Atratividade e presença marcante',
                imagem: 'https://i.imgur.com/smmjNh2.png',
                vantagens: [
                    { nivel: 1, efeito: 'Boa Impressão — Sua aparência chama atenção e costuma causar uma primeira impressão positiva.', narrativa: 'Boa Impressão' },
                    { nivel: 3, efeito: 'Presença Encantadora — Sua postura, elegância e carisma tornam difícil ignorar sua presença.', narrativa: 'Presença Encantadora' },
                    { nivel: 5, efeito: 'Figura Memorável — Uma vez por cena, pode atrair naturalmente a atenção de todos ao redor por alguns instantes, tornando-se o centro das atenções.', narrativa: 'Figura Memorável' }
                ]
            },
            {
                id: 'camuflagem',
                nome: 'Camuflagem',
                descricao: 'A arte de se misturar ao ambiente',
                imagem: 'https://i.imgur.com/mdHhKHO.png',
                vantagens: [
                    { nivel: 1, efeito: 'Mistura Natural — Consegue utilizar o ambiente para ocultar sua presença com grande eficiência.', narrativa: 'Mistura Natural' },
                    { nivel: 3, efeito: 'Disfarce Ambiental — Adapta rapidamente sua postura e movimentação para combinar com qualquer terreno ou cenário.', narrativa: 'Disfarce Ambiental' },
                    { nivel: 5, efeito: 'Invisibilidade Natural — Uma vez por cena, consegue permanecer praticamente imperceptível enquanto permanecer imóvel ou utilizar perfeitamente a cobertura do ambiente.', narrativa: 'Invisibilidade Natural' }
                ]
            },
            {
                id: 'canto',
                nome: 'Canto',
                descricao: 'O poder da voz e da música',
                imagem: 'https://i.imgur.com/eK4HDSv.png',
                vantagens: [
                    { nivel: 1, efeito: 'Voz Harmoniosa — Sua voz é agradável, firme e capaz de prender facilmente a atenção de quem escuta.', narrativa: 'Voz Harmoniosa' },
                    { nivel: 3, efeito: 'Melodia Inspiradora — Seu canto desperta emoções profundas, podendo acalmar, inspirar ou confortar aqueles que o ouvem.', narrativa: 'Melodia Inspiradora' },
                    { nivel: 5, efeito: 'Canção Lendária — Uma vez por cena, pode executar uma apresentação memorável capaz de alterar significativamente o clima emocional de um grupo, desde que possam ouvi-lo.', narrativa: 'Canção Lendária' }
                ]
            },
            {
                id: 'compreensao',
                nome: 'Compreensão',
                descricao: 'Entendimento profundo',
                imagem: 'https://i.imgur.com/pAlsgmZ.png',
                vantagens: [
                    { nivel: 1, efeito: 'Após alguns minutos analisando algo, compreende seu funcionamento básico.', narrativa: 'Observador' },
                    { nivel: 3, efeito: 'Consegue identificar fraquezas, padrões ou inconsistências em técnicas, objetos e comportamentos.', narrativa: 'Entendimento Profundo' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode fazer uma pergunta ao mestre sobre uma situação, habilidade ou fenômeno e receber uma resposta verdadeira dentro do conhecimento que seu personagem seria capaz de alcançar.', narrativa: 'Iluminação' }
                ]
            },
            {
                id: 'controleqi',
                nome: 'Controle do Qi',
                descricao: 'Manipulação de energia vital',
                imagem: 'https://i.imgur.com/bJqRQKW.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue perceber naturalmente a circulação de Qi em si mesmo e em outros seres vivos.', narrativa: 'Fluxo Energético' },
                    { nivel: 3, efeito: 'Pode controlar seu próprio fluxo de Qi com extrema precisão, evitando desperdícios durante técnicas e meditação.', narrativa: 'Circulação Perfeita' },
                    { nivel: 5, efeito: 'Uma vez por combate, pode interromper temporariamente o fluxo de Qi de um alvo, dificultando a utilização de técnicas espirituais por um turno.', narrativa: 'Supressão Energética' }
                ]
            },
            {
                id: 'conhecimento',
                nome: 'Conhecimento',
                descricao: 'Saber acadêmico vasto',
                imagem: 'https://i.imgur.com/isBYQoe.png',
                vantagens: [
                    { nivel: 1, efeito: 'Reconhece facilmente livros, símbolos, artefatos e conhecimentos comuns de diversas áreas.', narrativa: 'Estudioso' },
                    { nivel: 3, efeito: 'Consegue relacionar informações aparentemente desconexas e formular conclusões rapidamente.', narrativa: 'Biblioteca Viva' },
                    { nivel: 5, efeito: 'Nunca esquece algo que tenha estudado ou presenciado conscientemente e pode recordar essas informações sempre que necessário.', narrativa: 'Memória Absoluta' }
                ]
            },
            {
                id: 'cultivo',
                nome: 'Cultivo',
                descricao: 'Aperfeiçoamento pessoal',
                imagem: 'https://i.imgur.com/hvCwFfY.png',
                vantagens: [
                    { nivel: 1, efeito: 'Obtém muito mais proveito de períodos de meditação e treinamento espiritual.', narrativa: 'Meditação Profunda' },
                    { nivel: 3, efeito: 'Seu cultivo torna-se extremamente estável, reduzindo significativamente o risco de desvios energéticos.', narrativa: 'Harmonia Interior' },
                    { nivel: 5, efeito: 'Uma vez por descanso, pode alcançar um estado de profunda compreensão sobre seu próprio cultivo, identificando falhas, gargalos ou o próximo passo para evoluir.', narrativa: 'Iluminação' }
                ]
            },
            {
                id: 'danca',
                nome: 'Dança',
                descricao: 'Movimento rítmico e graça',
                imagem: 'https://i.imgur.com/tjUQLVF.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue mover-se com extrema leveza e naturalidade, mesmo em ambientes difíceis.', narrativa: 'Passos Elegantes' },
                    { nivel: 3, efeito: 'Adapta seus movimentos ao ritmo de qualquer combate, música ou situação sem perder a fluidez.', narrativa: 'Ritmo Perfeito' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode executar uma sequência de movimentos tão perfeita que confunde momentaneamente todos os observadores.', narrativa: 'Dança Celestial' }
                ]
            },
            {
                id: 'diplomacia',
                nome: 'Diplomacia',
                descricao: 'Negociação e persuasão',
                imagem: 'https://i.imgur.com/HUld1Fs.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue manter conversas respeitosas mesmo entre pessoas com opiniões completamente opostas.', narrativa: 'Mediador' },
                    { nivel: 3, efeito: 'Identifica rapidamente os interesses e motivações de ambas as partes durante uma negociação.', narrativa: 'Negociador Experiente' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode interromper temporariamente um conflito para abrir espaço para diálogo, desde que exista disposição mínima para conversar.', narrativa: 'Pacificador' }
                ]
            },
            {
                id: 'douqi',
                nome: 'Dou Qi',
                descricao: 'Combate com poder energético',
                imagem: 'https://i.imgur.com/fnPvHMQ.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue revestir naturalmente ataques e armas com Qi.', narrativa: 'Canalização Espiritual' },
                    { nivel: 3, efeito: 'Pode moldar o fluxo do Qi durante o combate para adaptar suas técnicas conforme a situação.', narrativa: 'Manipulação Refinada' },
                    { nivel: 5, efeito: 'Seu Qi consegue atravessar barreiras espirituais simples e atingir diretamente a energia do alvo.', narrativa: 'Perfuração Espiritual' }
                ]
            },
            {
                id: 'estrategia',
                nome: 'Estratégia',
                descricao: 'Tática e planejamento',
                imagem: 'https://i.imgur.com/kPf9qxU.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue analisar rapidamente um campo de batalha e identificar posições vantajosas.', narrativa: 'Pensamento Estratégico' },
                    { nivel: 3, efeito: 'Antes de uma missão, pode declarar pequenas preparações plausíveis realizadas previamente.', narrativa: 'Plano de Contingência' },
                    { nivel: 5, efeito: 'Uma vez por combate, pode reorganizar completamente o plano de ação do grupo, coordenando aliados de forma quase perfeita.', narrativa: 'Mestre Estrategista' }
                ]
            },
            {
                id: 'ferraria',
                nome: 'Ferraria',
                descricao: 'Forja e fabricação de armas',
                imagem: 'https://i.imgur.com/osVYotW.png',
                vantagens: [
                    { nivel: 1, efeito: 'Reconhece facilmente metais, ligas e materiais de qualidade.', narrativa: 'Conhecimento Metalúrgico' },
                    { nivel: 3, efeito: 'Produz equipamentos com acabamento superior e maior resistência ao desgaste.', narrativa: 'Ferreiro Experiente' },
                    { nivel: 5, efeito: 'Uma vez por descanso, pode criar um equipamento excepcional capaz de desenvolver uma característica única, definida durante sua criação.', narrativa: 'Obra-Prima' }
                ]
            },
            {
                id: 'folego',
                nome: 'Fôlego',
                descricao: 'Resistência à fadiga',
                imagem: 'https://i.imgur.com/2A4Bqsg.png',
                vantagens: [
                    { nivel: 1, efeito: 'Mantém a respiração estável mesmo durante esforços prolongados.', narrativa: 'Respiração Controlada' },
                    { nivel: 3, efeito: 'Consegue prolongar atividades físicas intensas por muito mais tempo que uma pessoa comum.', narrativa: 'Ritmo Constante' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode continuar agindo normalmente mesmo após atingir seu limite físico, até que a situação termine.', narrativa: 'Incansável' }
                ]
            },
            {
                id: 'furtividade',
                nome: 'Furtividade',
                descricao: 'Sigilo e dissimulação',
                imagem: 'https://i.imgur.com/7g5y3kK.png',
                vantagens: [
                    { nivel: 1, efeito: 'Move-se produzindo o mínimo possível de ruído.', narrativa: 'Passos Silenciosos' },
                    { nivel: 3, efeito: 'Sabe aproveitar sombras, obstáculos e distrações para permanecer despercebido.', narrativa: 'Presença Oculta' },
                    { nivel: 5, efeito: 'Uma vez por cena, desaparece momentaneamente da percepção dos inimigos ao utilizar perfeitamente o ambiente ao seu redor, reaparecendo em uma posição vantajosa.', narrativa: 'Fantasma' }
                ]
            },
            {
                id: 'idioma',
                nome: 'Idioma',
                descricao: 'Fluência linguística',
                imagem: 'https://i.imgur.com/ue4snwM.png',
                vantagens: [
                    { nivel: 1, efeito: 'Aprende novos idiomas com muito mais facilidade e compreende expressões básicas de línguas aparentadas.', narrativa: 'Poliglota' },
                    { nivel: 3, efeito: 'Consegue identificar a origem, a época e até aspectos culturais de uma língua ou escrita desconhecida após analisá-la.', narrativa: 'Linguista' },
                    { nivel: 5, efeito: 'Após alguns minutos de interação, consegue estabelecer comunicação básica com qualquer criatura inteligente, mesmo sem compartilhar um idioma.', narrativa: 'Comunicação Universal' }
                ]
            },
            {
                id: 'intimidacao',
                nome: 'Intimidação',
                descricao: 'Imposição de vontade',
                imagem: 'https://i.imgur.com/lTMTeMJ.png',
                vantagens: [
                    { nivel: 1, efeito: 'Sua simples postura é suficiente para desencorajar indivíduos inseguros ou inexperientes.', narrativa: 'Presença Ameaçadora' },
                    { nivel: 3, efeito: 'Consegue identificar rapidamente quem possui medo, insegurança ou hesitação e explorar essas fraquezas durante uma conversa.', narrativa: 'Domínio Psicológico' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode intimidar um alvo apenas com sua presença, obrigando-o a hesitar antes de agir caso sua determinação seja inferior à sua.', narrativa: 'Olhar do Predador' }
                ]
            },
            {
                id: 'intuicao',
                nome: 'Intuição',
                descricao: 'Instinto aguçado',
                imagem: 'https://i.imgur.com/9DIiVwI.png',
                vantagens: [
                    { nivel: 1, efeito: 'Percebe quando algo está errado mesmo sem conseguir explicar o motivo.', narrativa: 'Sexto Sentido' },
                    { nivel: 3, efeito: 'Consegue perceber mentiras, intenções ocultas ou mudanças de comportamento através de pequenos detalhes.', narrativa: 'Leitura Instintiva' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode perguntar ao mestre se determinada decisão representa um grande risco ou uma oportunidade favorável.', narrativa: 'Presságio' }
                ]
            },
            {
                id: 'labia',
                nome: 'Lábia',
                descricao: 'Persuasão e retórica',
                imagem: 'https://i.imgur.com/61lChtN.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue conduzir naturalmente uma conversa para o assunto que desejar.', narrativa: 'Conversador Nato' },
                    { nivel: 3, efeito: 'É capaz de plantar dúvidas, sugestões ou falsas conclusões sem que a outra pessoa perceba imediatamente.', narrativa: 'Manipulador' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode transformar uma conversa extremamente desfavorável em uma negociação justa, desde que o alvo esteja disposto a ouvir.', narrativa: 'Língua de Ouro' }
                ]
            },
            {
                id: 'lideranca',
                nome: 'Liderança',
                descricao: 'Comando de grupo',
                imagem: 'https://i.imgur.com/v6L8GZn.png',
                vantagens: [
                    { nivel: 1, efeito: 'Aliados tendem a confiar em suas decisões durante situações difíceis.', narrativa: 'Inspiração Natural' },
                    { nivel: 3, efeito: 'Consegue distribuir tarefas e organizar grupos grandes com extrema eficiência, evitando confusão e desperdício de tempo.', narrativa: 'Coordenação' },
                    { nivel: 5, efeito: 'Uma vez por cena, coordena perfeitamente todos os aliados próximos, permitindo que executem um plano previamente elaborado sem falhas de comunicação.', narrativa: 'Comandante Supremo' }
                ]
            },
            {
                id: 'maestria',
                nome: 'Maestria',
                descricao: 'Perfeição em uma área',
                imagem: 'https://i.imgur.com/fsjkVJb.png',
                vantagens: [
                    { nivel: 1, efeito: 'Escolha uma profissão, técnica ou conhecimento específico. Você aprende e evolui nessa área muito mais rapidamente.', narrativa: 'Especialista' },
                    { nivel: 3, efeito: 'Erros simples relacionados à sua especialidade tornam-se extremamente raros.', narrativa: 'Domínio Absoluto' },
                    { nivel: 5, efeito: 'Sua habilidade é tão refinada que outros especialistas conseguem reconhecer sua maestria apenas observando seu trabalho.', narrativa: 'Mestre Lendário' }
                ]
            },
            {
                id: 'matrizes',
                nome: 'Matrizes',
                descricao: 'Símbolos mágicos',
                imagem: 'https://i.imgur.com/ws3E0SX.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue compreender e reproduzir matrizes simples.', narrativa: 'Conhecimento Rúnico' },
                    { nivel: 3, efeito: 'Pode criar matrizes condicionais que são ativadas apenas quando uma condição específica for atendida.', narrativa: 'Programação Arcana' },
                    { nivel: 5, efeito: 'É capaz de combinar diversas matrizes em uma única formação complexa, produzindo efeitos inéditos.', narrativa: 'Mestre das Matrizes' }
                ]
            },
            {
                id: 'olhocritico',
                nome: 'Olho Crítico',
                descricao: 'Exploração de fraquezas',
                imagem: 'https://i.imgur.com/0zLdIyX.png',
                vantagens: [
                    { nivel: 1, efeito: 'Identifica pequenos defeitos em objetos, estruturas e equipamentos.', narrativa: 'Observador' },
                    { nivel: 3, efeito: 'Após observar um alvo por algum tempo, consegue descobrir hábitos, padrões de combate ou possíveis fraquezas.', narrativa: 'Leitura de Vulnerabilidades' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode descobrir o ponto fraco mais evidente de uma criatura, objeto ou construção.', narrativa: 'Análise Perfeita' }
                ]
            },
            {
                id: 'percepcao',
                nome: 'Percepção',
                descricao: 'Observação aguçada',
                imagem: 'https://i.imgur.com/lgzwmFo.png',
                vantagens: [
                    { nivel: 1, efeito: 'Percebe sons, odores e movimentos discretos com facilidade.', narrativa: 'Sentidos Aguçados' },
                    { nivel: 3, efeito: 'Consegue reconstruir parcialmente acontecimentos através de pegadas, marcas, vestígios e detalhes do ambiente.', narrativa: 'Investigador' },
                    { nivel: 5, efeito: 'É extremamente difícil ser surpreendido quando estiver atento ao ambiente.', narrativa: 'Olhos que Tudo Veem' }
                ]
            },
            {
                id: 'prestidigitacao',
                nome: 'Prestidigitação',
                descricao: 'Habilidade manual',
                imagem: 'https://i.imgur.com/xWFrmoB.png',
                vantagens: [
                    { nivel: 1, efeito: 'Executa movimentos delicados com extrema precisão.', narrativa: 'Dedos Ágeis' },
                    { nivel: 3, efeito: 'Consegue esconder, trocar ou retirar pequenos objetos sem chamar atenção.', narrativa: 'Manipulação Imperceptível' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode realizar um truque manual praticamente impossível aos olhos de quem estiver observando.', narrativa: 'Mãos Fantasma' }
                ]
            },
            {
                id: 'pressentimento',
                nome: 'Pressentimento',
                descricao: 'Antecipação de perigos',
                imagem: 'https://i.imgur.com/uGsb5mG.png',
                vantagens: [
                    { nivel: 1, efeito: 'Pouco antes de um perigo iminente, sente uma estranha sensação de alerta.', narrativa: 'Mau Presságio' },
                    { nivel: 3, efeito: 'Recebe breves intuições sobre acontecimentos que podem ocorrer nos próximos instantes.', narrativa: 'Vislumbre' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode pedir ao mestre um aviso sobre um perigo imediato antes que ele aconteça.', narrativa: 'Premonição' }
                ]
            },
            {
                id: 'religiao',
                nome: 'Religião',
                descricao: 'Conhecimento espiritual',
                imagem: 'https://i.imgur.com/xwebh3u.png',
                vantagens: [
                    { nivel: 1, efeito: 'Reconhece divindades, símbolos religiosos, rituais e maldições comuns.', narrativa: 'Erudição Sagrada' },
                    { nivel: 3, efeito: 'Compreende os costumes, doutrinas e práticas das principais religiões.', narrativa: 'Devoto Experiente' },
                    { nivel: 5, efeito: 'Durante uma oração ou ritual, pode receber um pequeno presságio ou orientação da divindade que segue, caso existam condições para isso.', narrativa: 'Revelação Divina' }
                ]
            },
            {
                id: 'sanidade',
                nome: 'Sanidade',
                descricao: 'Resistência mental',
                imagem: 'https://i.imgur.com/UVtrRca.png',
                vantagens: [
                    { nivel: 1, efeito: 'Mantém a calma diante de situações perturbadoras.', narrativa: 'Mente Estável' },
                    { nivel: 3, efeito: 'Recupera-se muito mais rapidamente de traumas emocionais e choques psicológicos.', narrativa: 'Psique Resiliente' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode ignorar completamente um efeito de medo, desespero ou terror.', narrativa: 'Mente Inabalável' }
                ]
            },
            {
                id: 'seducao',
                nome: 'Sedução',
                descricao: 'Atração e charme',
                imagem: 'https://i.imgur.com/Nfdtuqp.png',
                vantagens: [
                    { nivel: 1, efeito: 'Sua presença desperta simpatia e curiosidade com facilidade.', narrativa: 'Charme Natural' },
                    { nivel: 3, efeito: 'Consegue criar rapidamente uma conexão emocional durante uma conversa.', narrativa: 'Encanto' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode transformar uma interação hostil em uma oportunidade de diálogo ou aproximação, desde que o alvo seja emocionalmente influenciável.', narrativa: 'Conquista Perfeita' }
                ]
            },
            {
                id: 'selos',
                nome: 'Selos',
                descricao: 'Armazenamento mágico',
                imagem: 'https://i.imgur.com/RsrKi1t.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue armazenar pequenos objetos ou energias em selos.', narrativa: 'Selagem Básica' },
                    { nivel: 3, efeito: 'Pode criar selos mais resistentes e duradouros.', narrativa: 'Selagem Avançada' },
                    { nivel: 5, efeito: 'É capaz de desenvolver selos complexos para armazenar técnicas, criaturas, artefatos ou grandes quantidades de energia.', narrativa: 'Mestre Selador' }
                ]
            },
            {
                id: 'sobrevivencia',
                nome: 'Sobrevivência',
                descricao: 'Adaptação ao ambiente',
                imagem: 'https://i.imgur.com/Bu4HLf5.png',
                vantagens: [
                    { nivel: 1, efeito: 'Encontra facilmente abrigo, água e recursos básicos na natureza.', narrativa: 'Adaptabilidade' },
                    { nivel: 3, efeito: 'Consegue seguir rastros, identificar animais e prever mudanças ambientais.', narrativa: 'Rastreador' },
                    { nivel: 5, efeito: 'Mesmo em ambientes extremamente hostis, encontra maneiras de permanecer vivo utilizando apenas os recursos disponíveis.', narrativa: 'Sobrevivente Lendário' }
                ]
            },
            {
                id: 'tolerancia',
                nome: 'Tolerância',
                descricao: 'Resistência a adversidades',
                imagem: 'https://i.imgur.com/18Ju21y.png',
                vantagens: [
                    { nivel: 1, efeito: 'Suporta melhor temperaturas extremas, fome, sede e desconforto.', narrativa: 'Corpo Adaptável' },
                    { nivel: 3, efeito: 'Seu organismo combate com maior eficiência venenos, doenças e condições adversas.', narrativa: 'Resistência Natural' },
                    { nivel: 5, efeito: 'Uma vez por cena, permanece consciente e capaz de agir mesmo quando seu corpo deveria ceder ao esgotamento.', narrativa: 'Vontade Inquebrável' }
                ]
            },
            {
                id: 'unicskill',
                nome: 'Unic Skill',
                descricao: 'Habilidade única especial',
                imagem: 'https://i.imgur.com/RATyykD.png',
                vantagens: [
                    { nivel: 1, efeito: 'Desenvolve uma habilidade exclusiva ligada ao seu Núcleo.', narrativa: 'Despertar' },
                    { nivel: 3, efeito: 'Descobre novas formas de utilizar sua habilidade única, ampliando sua versatilidade.', narrativa: 'Evolução' },
                    { nivel: 5, efeito: 'Sua habilidade desperta uma característica exclusiva que nenhum outro usuário consegue reproduzir exatamente.', narrativa: 'Singularidade' }
                ]
            },
            {
                id: 'vontade',
                nome: 'Vontade',
                descricao: 'Força de caráter',
                imagem: 'https://i.imgur.com/4Lldsnw.png',
                vantagens: [
                    { nivel: 1, efeito: 'Mantém suas convicções mesmo sob grande pressão.', narrativa: 'Espírito Indomável' },
                    { nivel: 3, efeito: 'É extremamente difícil fazê-lo desistir de um objetivo importante.', narrativa: 'Determinação Absoluta' },
                    { nivel: 5, efeito: 'Uma vez por cena, rompe ou resiste a um efeito de manipulação mental, ilusão ou controle da mente.', narrativa: 'Liberdade da Mente' }
                ]
            },
            {
                id: 'zanjutsu',
                nome: 'Zanjutsu',
                descricao: 'Maestria em lâminas',
                imagem: 'https://i.imgur.com/YvcLwaG.png',
                vantagens: [
                    { nivel: 1, efeito: 'Domina corretamente a postura, empunhadura e fundamentos das espadas.', narrativa: 'Técnica Refinada' },
                    { nivel: 3, efeito: 'Consegue adaptar seu estilo rapidamente ao tipo de arma branca utilizada.', narrativa: 'Espadachim Experiente' },
                    { nivel: 5, efeito: 'Uma vez por combate, realiza um aparo perfeito capaz de neutralizar completamente um ataque corpo a corpo executado contra você, desde que seja possível bloqueá-lo.', narrativa: 'Defesa Perfeita' }
                ]
            },
            {
                id: 'hoho',
                nome: 'Hoho',
                descricao: 'Arte da velocidade',
                imagem: 'https://i.imgur.com/6y28jyw.png',
                vantagens: [
                    { nivel: 1, efeito: 'Domina os fundamentos do Hohō, movimentando-se com extrema leveza e rapidez.', narrativa: 'Passos Instantâneos' },
                    { nivel: 3, efeito: 'Consegue realizar deslocamentos tão rápidos que deixa pós-imagens ou desaparece momentaneamente da percepção de quem observa.', narrativa: 'Movimento Fantasma' },
                    { nivel: 5, efeito: 'Uma vez por combate, pode realizar um Shunpo para qualquer ponto dentro do seu campo de visão, desde que o local seja acessível.', narrativa: 'Shunpo' }
                ]
            },
            {
                id: 'kido',
                nome: 'Kidō',
                descricao: 'Magia espiritual',
                imagem: 'https://i.imgur.com/NpohIcR.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue moldar o Reiryoku com precisão para executar Kidōs com maior estabilidade.', narrativa: 'Canalização Espiritual' },
                    { nivel: 3, efeito: 'É capaz de conjurar Kidōs com menos gestos e palavras, mantendo sua eficiência.', narrativa: 'Domínio do Kidō' },
                    { nivel: 5, efeito: 'Uma vez por combate, pode conjurar um Kidō sem recitar seu encantamento completo, preservando praticamente todo o seu poder.', narrativa: 'Eishōhaki' }
                ]
            },
            {
                id: 'hakuda',
                nome: 'Hakuda',
                descricao: 'Combate desarmado',
                imagem: 'https://i.imgur.com/pfttrFQ.png',
                vantagens: [
                    { nivel: 1, efeito: 'Domina os fundamentos do combate corpo a corpo utilizando apenas o próprio corpo.', narrativa: 'Artes Marciais' },
                    { nivel: 3, efeito: 'Consegue alternar golpes, projeções, imobilizações e contra-ataques com extrema naturalidade.', narrativa: 'Combate Adaptável' },
                    { nivel: 5, efeito: 'Uma vez por combate, pode executar uma técnica perfeita de combate desarmado capaz de interromper completamente a ação de um inimigo.', narrativa: 'Mestre do Hakuda' }
                ]
            },
            {
                id: 'reiatsu',
                nome: 'Reiatsu',
                descricao: 'Pressão espiritual',
                imagem: 'https://i.imgur.com/7WVnHiU.png',
                vantagens: [
                    { nivel: 1, efeito: 'Sua Reiatsu pode ser sentida claramente por outros usuários espirituais.', narrativa: 'Presença Espiritual' },
                    { nivel: 3, efeito: 'Aprende a controlar sua Reiatsu, ocultando-a ou liberando-a conforme desejar.', narrativa: 'Domínio da Pressão' },
                    { nivel: 5, efeito: 'Uma vez por combate, libera sua Reiatsu de forma avassaladora, obrigando todos os inimigos próximos a enfrentarem um teste de Vontade ou ficarem abalados diante da diferença de poder.', narrativa: 'Pressão Absoluta' }
                ]
            },
            {
                id: 'reiraku',
                nome: 'Reiraku',
                descricao: 'Detecção espiritual',
                imagem: 'https://i.imgur.com/GJcmYLr.png',
                vantagens: [
                    { nivel: 1, efeito: 'Percebe naturalmente a presença de seres espirituais próximos.', narrativa: 'Sentido Espiritual' },
                    { nivel: 3, efeito: 'É capaz de seguir rastros espirituais e localizar indivíduos através da assinatura do seu Reiryoku.', narrativa: 'Rastreamento Espiritual' },
                    { nivel: 5, efeito: 'Consegue perceber seres ocultos, invisíveis, disfarçados espiritualmente ou utilizando técnicas de ocultação espiritual.', narrativa: 'Visão da Alma' }
                ]
            },
            {
                id: 'comunicacao_zanpakuto',
                nome: 'Comunicação Zanpakutō',
                descricao: 'Sintonia com arma espiritual',
                imagem: 'https://i.imgur.com/9qzMWbH.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue ouvir e compreender melhor a vontade da sua Zanpakutō durante a meditação.', narrativa: 'Voz Interior' },
                    { nivel: 3, efeito: 'A comunicação com sua Zanpakutō torna-se natural, permitindo compreender seus sentimentos e intenções com facilidade.', narrativa: 'Sincronia Espiritual' },
                    { nivel: 5, efeito: 'Uma vez por descanso, pode pedir orientação diretamente à sua Zanpakutō, recebendo uma resposta sincera dentro do conhecimento que ela possui.', narrativa: 'Harmonia Absoluta' }
                ]
            },
            {
                id: 'conhecimento_soul_society',
                nome: 'Conhecimento Soul Society',
                descricao: 'Erudição das 13 Divisões',
                imagem: 'https://i.imgur.com/ibJsQZU.png',
                vantagens: [
                    { nivel: 1, efeito: 'Conhece a estrutura, história e funcionamento da Soul Society.', narrativa: 'Estudioso da Soul Society' },
                    { nivel: 3, efeito: 'Reconhece técnicas, tradições, famílias nobres, divisões e figuras importantes apenas observando detalhes.', narrativa: 'Especialista' },
                    { nivel: 5, efeito: 'Consegue identificar rapidamente características, hábitos e possíveis habilidades de Hollows, Arrancars, Quincy e Shinigamis conhecidos.', narrativa: 'Enciclopédia Viva' }
                ]
            },
            {
                id: 'resistencia_espiritual',
                nome: 'Resistência Espiritual',
                descricao: 'Defesa contra poder espiritual',
                imagem: 'https://i.imgur.com/tbdPa8t.png',
                vantagens: [
                    { nivel: 1, efeito: 'Mantém a estabilidade espiritual mesmo diante de grandes pressões.', narrativa: 'Espírito Resiliente' },
                    { nivel: 3, efeito: 'Seu espírito suporta técnicas espirituais intensas sem perder facilmente o controle.', narrativa: 'Alma Inabalável' },
                    { nivel: 5, efeito: 'Uma vez por combate, pode suportar completamente uma técnica espiritual que normalmente o incapacitaria, permanecendo consciente.', narrativa: 'Barreira Espiritual' }
                ]
            },
            {
                id: 'konso',
                nome: 'Konsō',
                descricao: 'Envio de almas',
                imagem: 'https://i.imgur.com/jWJBDse.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue realizar corretamente o ritual de envio das almas para a Soul Society.', narrativa: 'Guia Espiritual' },
                    { nivel: 3, efeito: 'Reconhece almas corrompidas e compreende o estado espiritual em que se encontram.', narrativa: 'Purificação' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode purificar uma alma menor ou espírito corrompido sem necessidade de combate, caso sua corrupção ainda seja reversível.', narrativa: 'Purificação Suprema' }
                ]
            },
            {
                id: 'meditacao_jinzen',
                nome: 'Meditação Jinzen',
                descricao: 'Comunhão espiritual profunda',
                imagem: 'https://i.imgur.com/nrO3my9.png',
                vantagens: [
                    { nivel: 1, efeito: 'Entra em estado meditativo com extrema facilidade, alcançando rapidamente a paz interior.', narrativa: 'Meditação Profunda' },
                    { nivel: 3, efeito: 'Consegue acessar conscientemente seu mundo interior para compreender melhor sua Zanpakutō e seu próprio espírito.', narrativa: 'Mundo Interior' },
                    { nivel: 5, efeito: 'Uma vez por descanso, pode entrar em um profundo estado de Jinzen, fortalecendo temporariamente sua conexão espiritual e recebendo uma revelação, ensinamento ou orientação de sua Zanpakutō.', narrativa: 'Êxtase Espiritual' }
                ]
            },
            {
                id: 'investigacao',
                nome: 'Investigação',
                descricao: 'A arte de descobrir a verdade através da análise',
                imagem: 'https://i.imgur.com/dEz4fE6.png',
                vantagens: [
                    { nivel: 1, efeito: 'Consegue encontrar e preservar pistas, evidências e detalhes que a maioria das pessoas ignoraria durante uma investigação.', narrativa: 'Coleta de Evidências' },
                    { nivel: 3, efeito: 'Após analisar uma cena, consegue reconstruir parcialmente a sequência dos acontecimentos com base nos vestígios encontrados.', narrativa: 'Reconstrução dos Fatos' },
                    { nivel: 5, efeito: 'Uma vez por cena, pode formular uma hipótese sobre um mistério, crime ou acontecimento. O mestre deve informar se essa hipótese está correta, parcialmente correta ou incorreta, sem revelar detalhes adicionais.', narrativa: 'Detetive Exímio' }
                ]
            },
        ];
        return catalogo.sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));
    }
}

// Instância global
const aptidoesDB = new AptidoesDB();
window.aptidoesDB = aptidoesDB;

// Inicializar banco de dados automaticamente
aptidoesDB.init().catch(err => {
    console.error('[AptidoesDB] Erro ao inicializar:', err);
});
