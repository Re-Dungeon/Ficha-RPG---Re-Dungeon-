/* ════════════════════════════════════════════════════════════════════════════════ */
/* COMPANHEIRO-CARACTERISTICAS-IMPORT.JS - Importação de Características Companheiro  */
/* Validação e carregamento de características de companheiro em GlobalState          */
/* ════════════════════════════════════════════════════════════════════════════════ */

/**
 * 🐾 CompanheiroCaracteristicasImport
 * 
 * Responsável por:
 * 1. Validar estrutura de características ao importar
 * 2. Mesclarem dados importados com estrutura padrão
 * 3. Restaurar características no GlobalState
 * 4. Re-renderizar interface após importação
 */
class CompanheiroCaracteristicasImport {
    constructor() {
        this.modalId = 'modalNovoCompanheiro';
        this.erros = [];
        this.avisos = [];
        console.log('🐾 CompanheiroCaracteristicasImport inicializado');
    }

    /**
     * Validar estrutura de características ao importar
     * 
     * @param {Object} dados - Dados de características
     * @param {string} companheiroId - ID do companheiro (para contexto)
     * @returns {boolean} true se válido, false caso contrário
     */
    validarCaracteristicas(dados, companheiroId = 'desconhecido') {
        this.erros = [];
        this.avisos = [];

        console.log(`\n🛡️ Validando características do companheiro ${companheiroId}...`);

        // ─────────────────────────────────────────────────────────────────────────────
        // 1. VALIDAR ESTRUTURA BÁSICA
        // ─────────────────────────────────────────────────────────────────────────────

        if (!dados || typeof dados !== 'object') {
            this.erros.push('Dados de características inválidos (não é um objeto)');
            return false;
        }

        // Campos obrigatórios
        const camposObrigatorios = ['nome', 'tipo', 'nivel', 'atributosPrimarios', 'status'];
        
        for (const campo of camposObrigatorios) {
            if (!(campo in dados)) {
                this.erros.push(`Campo obrigatório ausente: ${campo}`);
            }
        }

        // ─────────────────────────────────────────────────────────────────────────────
        // 2. VALIDAR CAMPOS INDIVIDUAIS
        // ─────────────────────────────────────────────────────────────────────────────

        // Nome
        if (dados.nome) {
            if (typeof dados.nome !== 'string') {
                this.erros.push('Nome deve ser string');
            } else if (dados.nome.trim().length === 0) {
                this.erros.push('Nome não pode estar vazio');
            } else if (dados.nome.length > 50) {
                this.avisos.push('Nome muito longo (máx 50 caracteres)');
            }
        }

        // Tipo
        const tiposValidos = ['Mascote', 'Companheiro', 'Espírito', 'Invocação', 'Pacto'];
        if (dados.tipo && !tiposValidos.includes(dados.tipo)) {
            this.avisos.push(`Tipo desconhecido: ${dados.tipo}. Usando padrão: Mascote`);
        }

        // Nível
        if (dados.nivel) {
            if (typeof dados.nivel !== 'number') {
                this.erros.push('Nível deve ser número');
            } else if (dados.nivel < 1 || dados.nivel > 999) {
                this.avisos.push(`Nível fora do intervalo esperado: ${dados.nivel}`);
            }
        }

        // Raça
        if (!dados.raca) {
            this.avisos.push('Raça não definida, usando padrão: Desconhecida');
        }

        // Pontos Distribuir
        if (dados.pontosDistribuir) {
            if (typeof dados.pontosDistribuir !== 'number') {
                this.erros.push('Pontos Distribuir deve ser número');
            }
        }

        // ─────────────────────────────────────────────────────────────────────────────
        // 3. VALIDAR ATRIBUTOS PRIMÁRIOS
        // ─────────────────────────────────────────────────────────────────────────────

        if (dados.atributosPrimarios) {
            const resultado = this.validarAtributos(dados.atributosPrimarios, 'Primários');
            if (!resultado) return false;
        }

        // ─────────────────────────────────────────────────────────────────────────────
        // 4. VALIDAR ATRIBUTOS SECUNDÁRIOS
        // ─────────────────────────────────────────────────────────────────────────────

        if (dados.atributosSecundarios) {
            const resultado = this.validarAtributos(dados.atributosSecundarios, 'Secundários');
            if (!resultado) return false;
        }

        // ─────────────────────────────────────────────────────────────────────────────
        // 5. VALIDAR STATUS (BARRAS)
        // ─────────────────────────────────────────────────────────────────────────────

        if (dados.status) {
            const resultado = this.validarStatus(dados.status);
            if (!resultado) return false;
        }

        // ─────────────────────────────────────────────────────────────────────────────
        // RESULTADO FINAL
        // ─────────────────────────────────────────────────────────────────────────────

        if (this.erros.length > 0) {
            console.error('❌ Erros encontrados:');
            this.erros.forEach(e => console.error(`  - ${e}`));
            return false;
        }

        if (this.avisos.length > 0) {
            console.warn('⚠️ Avisos:');
            this.avisos.forEach(a => console.warn(`  - ${a}`));
        }

        console.log('✅ Características válidas para importação');
        return true;
    }

    /**
     * Validar estrutura de atributos
     * 
     * @param {Object} atributos - Objeto de atributos
     * @param {string} tipo - 'Primários' ou 'Secundários'
     * @returns {boolean} true se válido
     */
    validarAtributos(atributos, tipo) {
        if (!atributos || typeof atributos !== 'object') {
            this.erros.push(`Atributos ${tipo} inválidos (não é objeto)`);
            return false;
        }

        const atributosEsperados = tipo === 'Primários' 
            ? ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'sabedoria', 'carisma']
            : ['prontidao', 'ataque', 'defesa', 'reacao', 'precisao', 'evasao'];

        for (const attr of Object.keys(atributos)) {
            const dados = atributos[attr];

            // Validar estrutura de cada atributo
            if (!dados || typeof dados !== 'object') {
                this.erros.push(`Atributo ${attr} deve ser objeto`);
                continue;
            }

            // Validar campos numéricos
            const camposNumericos = ['base', 'extra', 'total', 'bonus'];
            for (const campo of camposNumericos) {
                if (campo in dados && typeof dados[campo] !== 'number') {
                    this.erros.push(`${attr}.${campo} deve ser número`);
                }
            }

            // Validar que base + extra >= 0
            const base = dados.base || 0;
            const extra = dados.extra || 0;
            if (base < 0 || extra < 0) {
                this.avisos.push(`${attr} tem valores negativos`);
            }
        }

        return this.erros.length === 0;
    }

    /**
     * Validar estrutura de status (barras)
     * 
     * @param {Object} status - Dados de status
     * @returns {boolean} true se válido
     */
    validarStatus(status) {
        if (!status || typeof status !== 'object') {
            this.erros.push('Status inválido (não é objeto)');
            return false;
        }

        const barrasEsperadas = ['saude', 'energia', 'fadiga'];

        for (const barra of barrasEsperadas) {
            if (!(barra in status)) {
                this.avisos.push(`Barra ${barra} ausente`);
                continue;
            }

            const dados = status[barra];

            // Validar estrutura
            if (!dados || typeof dados !== 'object') {
                this.erros.push(`Status ${barra} deve ser objeto`);
                continue;
            }

            // Validar campos numéricos
            const camposNumericos = ['atual', 'maxima', 'extra', 'bonus'];
            for (const campo of camposNumericos) {
                if (campo in dados && typeof dados[campo] !== 'number') {
                    this.erros.push(`status.${barra}.${campo} deve ser número`);
                }
            }

            // Validar que atual <= maxima
            const atual = dados.atual || 0;
            const maxima = dados.maxima || 100;
            if (atual > maxima) {
                this.avisos.push(`${barra}: atual (${atual}) > máxima (${maxima})`);
            }

            // Validar que máxima > 0
            if (maxima <= 0) {
                this.erros.push(`${barra}: máxima deve ser > 0`);
            }
        }

        return this.erros.length === 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔄 MESCLAR COM ESTRUTURA PADRÃO
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Mesclar características importadas com estrutura padrão
     * Preenche campos faltantes com valores padrão
     * 
     * @param {Object} dadosImportados - Dados importados
     * @returns {Object} Características mescladas
     */
    mesclarComPadrao(dadosImportados) {
        console.log('\n🔄 Mesclando características com padrão...');

        if (!dadosImportados || typeof dadosImportados !== 'object') {
            console.warn('⚠️ Dados inválidos, retornando padrão');
            return window.globalState.criarCaracteristicasCompanheiroBase();
        }

        // Estrutura padrão
        const padrao = window.globalState.criarCaracteristicasCompanheiroBase();

        // Mesclar recursivamente
        const mesclado = this.mesclarRecursivo(padrao, dadosImportados);

        console.log('✅ Características mescladas');
        return mesclado;
    }

    /**
     * Mesclar objetos recursivamente
     * 
     * @param {Object} padrao - Objeto padrão
     * @param {Object} importado - Objeto importado
     * @returns {Object} Mesclagem
     */
    mesclarRecursivo(padrao, importado) {
        const resultado = { ...padrao };

        for (const chave in importado) {
            if (Object.prototype.hasOwnProperty.call(importado, chave)) {
                if (
                    typeof importado[chave] === 'object' &&
                    importado[chave] !== null &&
                    !Array.isArray(importado[chave]) &&
                    typeof padrao[chave] === 'object' &&
                    padrao[chave] !== null &&
                    !Array.isArray(padrao[chave])
                ) {
                    // Recursivamente mesclar objetos
                    resultado[chave] = this.mesclarRecursivo(padrao[chave], importado[chave]);
                } else {
                    // Usar valor importado
                    resultado[chave] = importado[chave];
                }
            }
        }

        return resultado;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 📥 RESTAURAR NO GLOBALSTATE
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Restaurar características importadas no GlobalState
     * 
     * @param {Array} companheirosImportados - Array de companheiros importados
     * @returns {boolean} true se sucesso
     */
    restaurarNoGlobalState(companheirosImportados) {
        if (!Array.isArray(companheirosImportados)) {
            console.error('❌ Companheiros devem ser um array');
            return false;
        }

        console.log(`\n📥 Restaurando ${companheirosImportados.length} companheiro(s) no GlobalState...`);

        try {
            const companheirosProcessados = [];

            for (const comp of companheirosImportados) {
                console.log(`\n  📦 Processando: ${comp.nome} (${comp.id})`);

                // Validar ID
                if (!comp.id) {
                    console.warn('  ⚠️ ID não definido, gerando novo...');
                    comp.id = window.globalState.gerarIdCompanheiro();
                }

                // Validar e mesclar características
                if (comp.caracteristicas) {
                    if (!this.validarCaracteristicas(comp.caracteristicas, comp.id)) {
                        console.warn(`  ⚠️ Características inválidas, aplicando padrão`);
                    }
                    comp.caracteristicas = this.mesclarComPadrao(comp.caracteristicas);
                } else {
                    console.warn(`  ⚠️ Características ausentes, criando padrão`);
                    comp.caracteristicas = window.globalState.criarCaracteristicasCompanheiroBase();
                }

                // Garantir estrutura completa do companheiro
                if (!comp.aptidoesCompanheiro) {
                    comp.aptidoesCompanheiro = {
                        lista: [],
                        ganhas: 0,
                        maximo: 3,
                        atributoPróxima: '—'
                    };
                }

                if (!comp.habilidadesCompanheiro) {
                    comp.habilidadesCompanheiro = {
                        lista: [],
                        ativas: []
                    };
                }

                if (!comp.inventarioCompanheiro) {
                    comp.inventarioCompanheiro = {
                        itens: [],
                        armazenamentos: [],
                        capacidadeTotal: 0,
                        espacoUsado: 0,
                        espacoLivre: 0
                    };
                }

                companheirosProcessados.push(comp);
                console.log(`  ✅ Processado com sucesso`);
            }

            // Atualizar GlobalState
            window.globalState.updatePart('companheiros.lista', companheirosProcessados);
            window.globalState.updatePart('companheiros.totalCompanheiros', companheirosProcessados.length);

            console.log(`\n✅ ${companheirosProcessados.length} companheiro(s) restaurados no GlobalState`);
            return true;
        } catch (erro) {
            console.error('❌ Erro ao restaurar no GlobalState:', erro);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🎨 RE-RENDERIZAR INTERFACE
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Re-renderizar interface após importação
     * 
     * @returns {boolean} true se sucesso
     */
    rerenderizarInterface() {
        console.log('\n🎨 Re-renderizando interface após importação...');

        try {
            // Re-renderizar card de companheiros
            if (window.companheirosUI && typeof window.companheirosUI.renderizar === 'function') {
                window.companheirosUI.renderizar();
                console.log('  ✅ Cards de companheiros re-renderizados');
            }

            // Fechar modal se estiver aberta
            const modal = document.getElementById(this.modalId);
            if (modal && modal.style.display !== 'none') {
                modal.style.display = 'none';
                console.log('  ✅ Modal fechada');
            }

            console.log('✅ Interface re-renderizada com sucesso');
            return true;
        } catch (erro) {
            console.error('❌ Erro ao re-renderizar interface:', erro);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 📊 RELATÓRIO DE IMPORTAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Gerar relatório de validação
     * 
     * @returns {Object} Relatório
     */
    gerarRelatorio() {
        return {
            erros: [...this.erros],
            avisos: [...this.avisos],
            totalErros: this.erros.length,
            totalAvisos: this.avisos.length,
            valido: this.erros.length === 0,
            resumo: this.gerarResumo()
        };
    }

    /**
     * Gerar resumo do relatório
     * 
     * @returns {string} Texto de resumo
     */
    gerarResumo() {
        if (this.erros.length === 0 && this.avisos.length === 0) {
            return '✅ Tudo OK - Pronto para importar';
        }

        let texto = '';
        
        if (this.erros.length > 0) {
            texto += `❌ ${this.erros.length} erro(s)\n`;
        }
        
        if (this.avisos.length > 0) {
            texto += `⚠️ ${this.avisos.length} aviso(s)`;
        }

        return texto;
    }

    /**
     * Exibir relatório no console
     */
    exibirRelatorio() {
        const relatorio = this.gerarRelatorio();

        console.log('\n' + '═'.repeat(80));
        console.log('📊 RELATÓRIO DE VALIDAÇÃO DE CARACTERÍSTICAS DE COMPANHEIRO');
        console.log('═'.repeat(80));

        if (relatorio.erros.length > 0) {
            console.error(`\n❌ ERROS (${relatorio.erros.length}):`);
            relatorio.erros.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
        }

        if (relatorio.avisos.length > 0) {
            console.warn(`\n⚠️ AVISOS (${relatorio.avisos.length}):`);
            relatorio.avisos.forEach((a, i) => console.warn(`  ${i + 1}. ${a}`));
        }

        console.log(`\n${relatorio.resumo}`);
        console.log('═'.repeat(80) + '\n');

        return relatorio;
    }
}

/**
 * INSTÂNCIA GLOBAL ÚNICA
 * Criada após GlobalState e CompanheiroCaracteristicasSync
 */
if (typeof window !== 'undefined') {
    window.companheiroCaracteristicasImport = new CompanheiroCaracteristicasImport();
    console.log('✅ CompanheiroCaracteristicasImport inicializado');
}
