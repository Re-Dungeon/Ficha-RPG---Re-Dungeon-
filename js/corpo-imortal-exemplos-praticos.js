/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   CORPO IMORTAL - EXEMPLOS PRÁTICOS DE INTEGRAÇÃO
   
   Este arquivo contém exemplos reais de como integrar o Corpo Imortal com:
   - Sistema de Atributos
   - Sistema de Calculadora de Bônus
   - Sistema de Condições
   - Qualquer outro sistema do ReDungeon
   
   Data: 1 de março de 2026
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXEMPLO 1: INTEGRAÇÃO COM SISTEMA DE ATRIBUTOS
   
   Refino Corporal influencia o limite máximo de atributos
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalAtributosBonificacao {
    /**
     * Calcula o aumento no limite máximo de atributo (padrão: 20)
     * A cada 2 pontos em Refino = +1 limite
     * 
     * @param {number} limite_base - Limite padrão (ex: 20)
     * @returns {number} Novo limite com bônus
     */
    static calcularNovoLimiteAtributo(limite_base = 20) {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return limite_base;

        // Refino oferece +1 limite a cada 2 pontos
        const bonus = Math.floor(dadosUI.refino / 2);
        
        return limite_base + bonus;
    }

    /**
     * Verifica se um atributo pode ser aumentado além do limite normal
     */
    static podeUltrapassarLimiteNormal(valor_atual, limite_base = 20) {
        const novo_limite = this.calcularNovoLimiteAtributo(limite_base);
        return valor_atual < novo_limite;
    }

    /**
     * Exemplo de integração com sistema de atributos
     */
    static exemplo_integracao_atributos() {
        // Supondo que você tem um objeto com os atributos
        const atributos = {
            forca: 15,
            destreza: 18,
            constituicao: 12,
            inteligencia: 19,
            sabedoria: 14,
            carisma: 16
        };

        const limite_original = 20;
        const novo_limite = this.calcularNovoLimiteAtributo(limite_original);

        console.log(`Limite original: ${limite_original}`);
        console.log(`Novo limite com Corpo Imortal: ${novo_limite}`);
        console.log(`Bônus do Refino Corporal: +${novo_limite - limite_original}`);

        // Verificar cada atributo
        for (const [attr, valor] of Object.entries(atributos)) {
            const pode_aumentar = this.podeUltrapassarLimiteNormal(valor, limite_original);
            console.log(`${attr}: ${valor}/${novo_limite} ${pode_aumentar ? '✅' : '❌'}`);
        }
    }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXEMPLO 2: INTEGRAÇÃO COM CALCULADORA DE BÔNUS
   
   Aplicar todos os bônus de Corpo Imortal aos atributos finais
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalCalculoBonusFinal {
    /**
     * Calcula bônus de HP adicionado ao máximo
     */
    static calcularBonusHP(hp_base = 100) {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return hp_base;

        // Refino: +2% HP a cada ponto
        const bonus_percentual = dadosUI.refino * 2;
        const bonus_valor = Math.floor(hp_base * bonus_percentual / 100);

        return {
            base: hp_base,
            bonus_percentual: bonus_percentual,
            bonus_valor: bonus_valor,
            total: hp_base + bonus_valor
        };
    }

    /**
     * Calcula bônus de Ataque
     */
    static calcularBonusAtaque(ataque_base = 10) {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return ataque_base;

        // Refino: +1% Ataque a cada ponto
        const bonus_percentual = dadosUI.refino * 1;
        const bonus_valor = Math.floor(ataque_base * bonus_percentual / 100);

        return {
            base: ataque_base,
            bonus_percentual: bonus_percentual,
            bonus_valor: bonus_valor,
            total: ataque_base + bonus_valor
        };
    }

    /**
     * Calcula bônus de Defesa
     */
    static calcularBonusDefesa(defesa_base = 10) {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return defesa_base;

        // Refino: +1% Defesa a cada ponto
        const bonus_percentual = dadosUI.refino * 1;
        const bonus_valor = Math.floor(defesa_base * bonus_percentual / 100);

        return {
            base: defesa_base,
            bonus_percentual: bonus_percentual,
            bonus_valor: bonus_valor,
            total: defesa_base + bonus_valor
        };
    }

    /**
     * Calcula capacidade de Qí
     */
    static calcularCapacidadeQi(capacidade_base = 100) {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return capacidade_base;

        // Dantian: +3% armazenamento
        let bonus_percentual = dadosUI.dantian * 3;
        // Mar Espiritual: +6% capacidade
        bonus_percentual += dadosUI.marEspiritual * 6;

        const bonus_valor = Math.floor(capacidade_base * bonus_percentual / 100);

        return {
            base: capacidade_base,
            bonus_percentual: bonus_percentual,
            bonus_valor: bonus_valor,
            total: capacidade_base + bonus_valor
        };
    }

    /**
     * Calcula velocidade de absorção de Qí
     */
    static calcularVelocidadeAbsorcao(velocidade_base = 1.0) {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return velocidade_base;

        // Dantian: +5% velocidade por ponto
        const bonus_percentual = dadosUI.dantian * 5;
        const multiplicador = 1 + (bonus_percentual / 100);

        return {
            base: velocidade_base,
            bonus_percentual: bonus_percentual,
            multiplicador: multiplicador,
            total: parseFloat((velocidade_base * multiplicador).toFixed(2))
        };
    }

    /**
     * Exemplo de integração completa
     */
    static exemplo_calculo_completo() {
        console.log('=== CÁLCULO DE BÔNUS COMPLETO ===\n');

        const hp = this.calcularBonusHP(100);
        console.log(`HP: ${hp.base} + ${hp.bonus_valor} (${hp.bonus_percentual}%) = ${hp.total}`);

        const ataque = this.calcularBonusAtaque(15);
        console.log(`ATK: ${ataque.base} + ${ataque.bonus_valor} (${ataque.bonus_percentual}%) = ${ataque.total}`);

        const defesa = this.calcularBonusDefesa(12);
        console.log(`DEF: ${defesa.base} + ${defesa.bonus_valor} (${defesa.bonus_percentual}%) = ${defesa.total}`);

        const qi = this.calcularCapacidadeQi(100);
        console.log(`QI: ${qi.base} + ${qi.bonus_valor} (${qi.bonus_percentual}%) = ${qi.total}`);

        const velocidade = this.calcularVelocidadeAbsorcao(1.0);
        console.log(`Vel. Absorção: ${velocidade.base}x × ${velocidade.multiplicador.toFixed(2)} = ${velocidade.total}x`);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXEMPLO 3: INTEGRAÇÃO COM SISTEMA DE CONDIÇÕES
   
   Aplicar ou remover condições baseado no nível de Corpo Imortal
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalCondicoes {
    /**
     * Verifica quais condições devem estar ativas baseado em Corpo Imortal
     */
    static gerarCondicoesAtivas() {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return [];

        const condicoes = [];

        // Dantian oferece resistência espiritual
        if (dadosUI.dantian >= 1) {
            condicoes.push({
                nome: 'Absorção Controlada',
                tipo: 'buff',
                descricao: 'Sua capacidade de absorção está aperfeiçoada',
                efeito: '+5% resistência a dano espiritual por ponto'
            });
        }

        if (dadosUI.dantian >= 3) {
            condicoes.push({
                nome: 'Receptáculo Profundo',
                tipo: 'buff',
                descricao: 'Seu dantian está bem treinado',
                efeito: '+15% capacidade de armazenamento'
            });
        }

        if (dadosUI.dantian === 6) {
            condicoes.push({
                nome: 'Dantian Perfeito',
                tipo: 'buff_especial',
                descricao: 'Seu dantian atingiu a perfeição',
                efeito: 'Imunidade a debuffs de Qí'
            });
        }

        // Meridianos oferece estabilidade
        if (dadosUI.meridianos >= 1) {
            condicoes.push({
                nome: 'Fluxo Controlado',
                tipo: 'buff',
                descricao: 'Seus meridianos estão mais fluidos',
                efeito: '+1 ao dado de cultivo'
            });
        }

        if (dadosUI.meridianos >= 4) {
            condicoes.push({
                nome: 'Harmonia dos Canais',
                tipo: 'buff',
                descricao: 'Seus meridianos estão em perfeita harmonia',
                efeito: '+15% eficiência de cultivo'
            });
        }

        // Refino oferece robustez
        if (dadosUI.refino >= 1) {
            condicoes.push({
                nome: 'Corpo Fortalecido',
                tipo: 'buff',
                descricao: 'Seu corpo está mais resiliente',
                efeito: '+2% HP máximo por ponto'
            });
        }

        if (dadosUI.refino >= 5) {
            condicoes.push({
                nome: 'Cintura Diamantina',
                tipo: 'buff_especial',
                descricao: 'Seu corpo é praticamente invulnerável',
                efeito: 'Redução de 10% em todo dano recebido'
            });
        }

        // Mar Espiritual oferece expansão
        if (dadosUI.marEspiritual >= 2) {
            condicoes.push({
                nome: 'Mar em Expansão',
                tipo: 'buff',
                descricao: 'Seu mar espiritual está crescendo',
                efeito: '+12% capacidade de Qí'
            });
        }

        if (dadosUI.marEspiritual === 6) {
            condicoes.push({
                nome: 'Mar Tranquilo Infinito',
                tipo: 'buff_especial',
                descricao: 'Seu mar espiritual é infinito e imutável',
                efeito: 'Nunca pode ser perturbado por dano espiritual'
            });
        }

        return condicoes;
    }

    /**
     * Obtém descrição consolidada das condições
     */
    static descreverCondições() {
        const condicoes = this.gerarCondicoesAtivas();
        
        if (condicoes.length === 0) {
            return 'Nenhuma condição de Corpo Imortal ativa';
        }

        let descricao = `\n=== CONDIÇÕES DO CORPO IMORTAL (${condicoes.length}) ===\n`;
        condicoes.forEach(c => {
            descricao += `${c.nome}: ${c.descricao}\n  → ${c.efeito}\n\n`;
        });

        return descricao;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXEMPLO 4: HOOK DE SINCRONIZAÇÃO AUTOMÁTICA
   
   Integração automática quando popup é aberto/fechado
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalSincronizacaoAutomatica {
    /**
     * Registra hooks automáticos de sincronização
     * Execute isto uma vez na inicialização
     */
    static registrarHooksAutomaticos() {
        console.log('🔗 Registrando hooks de sincronização automática...');

        // Hook: Quando popup abre
        const abrirOriginal = window.corpoImortalUI.abrir.bind(window.corpoImortalUI);
        window.corpoImortalUI.abrir = function() {
            abrirOriginal();
            console.log('📊 Sincronizando ao abrir...');
            CorpoImortalSincronizacaoAutomatica.sincronizar();
        };

        // Hook: Quando popup fecha
        const fecharOriginal = window.corpoImortalUI.fechar.bind(window.corpoImortalUI);
        window.corpoImortalUI.fechar = function() {
            fecharOriginal();
            console.log('💾 Sincronizando ao fechar...');
            CorpoImortalSincronizacaoAutomatica.sincronizar();
        };

        // Hook: Quando faz upgrade
        const upgradeOriginal = window.corpoImortalUI.fazerUpgrade.bind(window.corpoImortalUI);
        window.corpoImortalUI.fazerUpgrade = function(funcao) {
            upgradeOriginal(funcao);
            console.log(`✨ Sincronizando após upgrade em ${funcao}...`);
            CorpoImortalSincronizacaoAutomatica.sincronizar();
        };

        console.log('✅ Hooks registrados com sucesso!');
    }

    /**
     * Sincroniza Corpo Imortal com todos os sistemas
     */
    static sincronizar() {
        console.log('\n🔄 === SINCRONIZAÇÃO CORPO IMORTAL ===');

        // 1. Atualizar limites de atributo
        const novo_limite = CorpoImortalAtributosBonificacao.calcularNovoLimiteAtributo();
        console.log(`✅ Novo limite de atributo: ${novo_limite}`);

        // 2. Calcular bônus
        console.log('✅ Bônus calculados:');
        const bonusHP = CorpoImortalCalculoBonusFinal.calcularBonusHP();
        console.log(`   → HP: ${bonusHP.total} (+${bonusHP.bonus_valor})`);

        // 3. Aplicar condições
        const condicoes = CorpoImortalCondicoes.gerarCondicoesAtivas();
        console.log(`✅ Condições ativas: ${condicoes.length}`);
        condicoes.slice(0, 3).forEach(c => {
            console.log(`   → ${c.nome}`);
        });

        // 4. Salvar no localStorage
        localStorage.setItem('corpo-imortal-ultima-sincronizacao', new Date().toISOString());
        console.log('✅ Sincronização completa!\n');
    }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXPORTAR PARA USO GLOBAL
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

window.CorpoImortalExemplos = {
    AtributosBonificacao: CorpoImortalAtributosBonificacao,
    CalculoBonusFinal: CorpoImortalCalculoBonusFinal,
    Condicoes: CorpoImortalCondicoes,
    SincronizacaoAutomatica: CorpoImortalSincronizacaoAutomatica
};

console.log('✅ Módulo de Exemplos Corpo Imortal carregado');
console.log('   Acesse via: window.CorpoImortalExemplos');

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   TESTES RÁPIDOS
   
   Descomente para testar as integrações
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/*
// Teste 1: Atributos
console.log('=== TESTE: ATRIBUTOS ===');
CorpoImortalAtributosBonificacao.exemplo_integracao_atributos();

// Teste 2: Bônus
console.log('\n=== TESTE: BÔNUS ===');
CorpoImortalCalculoBonusFinal.exemplo_calculo_completo();

// Teste 3: Condições
console.log('\n=== TESTE: CONDIÇÕES ===');
console.log(CorpoImortalCondicoes.descreverCondições());

// Teste 4: Sincronização automática
console.log('\n=== TESTE: SINCRONIZAÇÃO ===');
CorpoImortalSincronizacaoAutomatica.registrarHooksAutomaticos();
CorpoImortalSincronizacaoAutomatica.sincronizar();
*/
