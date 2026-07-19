/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   CORPO IMORTAL - INTEGRAÇÕES FUTURAS
   
   Este arquivo contém exemplos de como integrar o Sistema Corpo Imortal com outros sistemas.
   
   Integração com:
   1. Sistema de Cultivação
   2. Tribulação
   3. Limite de Técnicas
   4. Risco Global
   
   Data: 1 de março de 2026
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXEMPLO 1: INFLUENCIAR TRIBULAÇÃO
   
   O nível de Corpo Imortal deve influenciar o risco da tribulação.
   Mayor nível = Maior risco de tribulação (personagem fica mais poderoso)
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalTribulacao {
    /**
     * Calcula o modificador de risco de tribulação baseado em Corpo Imortal
     * Escala: 0% (nenhum nível) até 60% (6 pontos em cada função = 24/24)
     * 
     * @returns {number} Modificador em percentual (0-60)
     */
    static calcularRiscoTribulacao() {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return 0;

        // Soma total de pontos
        const totalPontos = dadosUI.dantian + 
                           dadosUI.meridianos + 
                           dadosUI.refino + 
                           dadosUI.marEspiritual;
        
        // Máximo possível = 24 pontos (6 × 4)
        const maximoPontos = 24;
        
        // Calcula percentual: (total / máximo) × 60%
        const risco = (totalPontos / maximoPontos) * 60;
        
        return Math.round(risco * 10) / 10; // Arredonda para 1 casa decimal
    }

    /**
     * Descrição narrativa do nível de risco
     */
    static descreverRiscoTribulacao() {
        const risco = this.calcularRiscoTribulacao();
        
        if (risco === 0) return "Nenhum risco de tribulação";
        if (risco < 10) return "Risco mínimo de tribulação";
        if (risco < 25) return "Risco baixo de tribulação";
        if (risco < 40) return "Risco moderado de tribulação";
        if (risco < 55) return "Risco alto de tribulação";
        return "Risco extremo de tribulação!";
    }
}

// Exemplo de uso:
/*
const risco = CorpoImortalTribulacao.calcularRiscoTribulacao();
console.log(`Risco de Tribulação: ${risco}%`);
console.log(CorpoImortalTribulacao.descreverRiscoTribulacao());

// Integrar com sistema de cultivação:
if (window.cultivacaoDados) {
    const bonus_tribulacao = CorpoImortalTribulacao.calcularRiscoTribulacao();
    window.cultivacaoDados.dados.universal.risco_tribulacao = bonus_tribulacao;
    window.cultivacaoDados.salvar();
}
*/

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXEMPLO 2: INFLUENCIAR EFICIÊNCIA DE CULTIVO
   
   Meridianos deve aumentar diretamente a eficiência de cultivo.
   Cada ponto em Meridianos = +4% eficiência de acúmulo de XP
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalEficienciaCultivo {
    /**
     * Calcula bônus de eficiência de cultivo
     * Vem principalmente de Meridianos
     * 
     * @returns {number} Modificador em percentual (0-24%)
     */
    static calcularBonusEficiencia() {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return 0;

        // Meridianos é o principal contribuidor (4% por ponto)
        let eficiencia = dadosUI.meridianos * 4;
        
        // Dantian contribui um pouco (1% por ponto, pois melhora absorção)
        eficiencia += dadosUI.dantian * 1;
        
        // Mar Espiritual contribui um pouco (1% por ponto, pois melhora estabilidade)
        eficiencia += dadosUI.marEspiritual * 1;
        
        return eficiencia;
    }

    /**
     * Calcula modificador no dado de cultivo
     * Meridianos oferece bônus direto no dado (melhor tipo de bônus)
     * 
     * @returns {number} Bônus fixo (0-6)
     */
    static calcularBonusDado() {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return 0;

        // Cada ponto em Meridianos = +1 ao dado
        return dadosUI.meridianos;
    }
}

// Exemplo de uso:
/*
const bonus = CorpoImortalEficienciaCultivo.calcularBonusEficiencia();
const bonusDado = CorpoImortalEficienciaCultivo.calcularBonusDado();

console.log(`Bônus de Eficiência: +${bonus}%`);
console.log(`Bônus de Dado: +${bonusDado}`);

// Integrar com lançamento de dado:
const dado_base = '1d4';
const bonus_final = bonusDado; // Adicionar ao resultado do dado
*/

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXEMPLO 3: INFLUENCIAR LIMITE DE TÉCNICA
   
   Refino Corporal deve aumentar o limite máximo de técnicas que um personagem pode aprender.
   A cada 2 pontos em Refino = +1 limite de técnica
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalLimiteTecnica {
    /**
     * Calcula aumento no limite de técnicas
     * Baseado principalmente em Refino Corporal
     * 
     * @returns {number} Aumento no limite (0-3)
     */
    static calcularAumentoLimiteTecnica() {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return 0;

        // Refino: 1 ponto de limite a cada 2 pontos (máximo 3)
        return Math.floor(dadosUI.refino / 2);
    }

    /**
     * Calcula limite máximo de técnicas
     * Considera limite base + bônus do Corpo Imortal
     * 
     * @param {number} limite_base - Limite base do personagem (ex: 5)
     * @returns {number} Limite máximo com bônus
     */
    static calcularLimiteMaximoTecnicas(limite_base = 5) {
        const bonus = this.calcularAumentoLimiteTecnica();
        return limite_base + bonus;
    }
}

// Exemplo de uso:
/*
const limite_base = 5;
const limite_com_bonus = CorpoImortalLimiteTecnica.calcularLimiteMaximoTecnicas(limite_base);

console.log(`Limite de Técnicas: ${limite_com_bonus} (Base: ${limite_base} + Bônus: ${limite_com_bonus - limite_base})`);

// Verificar se personagem pode aprender nova técnica:
if (tecnicas_atuais.length < limite_com_bonus) {
    console.log('✅ Pode aprender nova técnica');
} else {
    console.log('❌ Limite de técnicas atingido');
}
*/

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   EXEMPLO 4: INFLUENCIAR RISCO GLOBAL
   
   Todo o Corpo Imortal influencia o risco global do personagem.
   Maior poder espiritual = Maior exposição a perigos
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalRiscoGlobal {
    /**
     * Calcula risco global baseado em Corpo Imortal
     * Considera todas as 4 funções com pesos diferentes
     * 
     * @returns {number} Risco global em percentual (0-100)
     */
    static calcularRiscoGlobal() {
        const dadosUI = window.corpoImortalUI?.dados?.dados;
        if (!dadosUI) return 0;

        // Pesos para cada função
        const pesos = {
            dantian: 1.0,      // Absorção de Qí é detectável
            meridianos: 1.2,   // Fluxo de energia é bem visível
            refino: 0.8,       // Corpo fortalecido é menos detectável
            marEspiritual: 1.5 // Mar Espiritual é muito notável
        };

        // Calcular risco ponderado
        const risco = (
            (dadosUI.dantian * pesos.dantian) +
            (dadosUI.meridianos * pesos.meridianos) +
            (dadosUI.refino * pesos.refino) +
            (dadosUI.marEspiritual * pesos.marEspiritual)
        ) / 4; // Média ponderada

        // Escala: máximo é 24 pontos, risco máximo é 90%
        return Math.round((risco / 24) * 90 * 10) / 10;
    }

    /**
     * Classificação narrativa do risco
     */
    static classificarRiscoGlobal() {
        const risco = this.calcularRiscoGlobal();
        
        if (risco === 0) return { tipo: "Seguro", emoji: "✅", cor: "green" };
        if (risco < 15) return { tipo: "Baixo Risco", emoji: "🟢", cor: "lime" };
        if (risco < 35) return { tipo: "Risco Moderado", emoji: "🟡", cor: "yellow" };
        if (risco < 60) return { tipo: "Risco Alto", emoji: "🟠", cor: "orange" };
        if (risco < 85) return { tipo: "Risco Crítico", emoji: "🔴", cor: "red" };
        return { tipo: "Risco Extremo", emoji: "⚠️", cor: "darkred" };
    }

    /**
     * Descrição detalhada do risco
     */
    static descreverRiscoGlobal() {
        const risco = this.calcularRiscoGlobal();
        const classificacao = this.classificarRiscoGlobal();
        
        return `${classificacao.emoji} ${classificacao.tipo}: ${risco.toFixed(1)}%`;
    }
}

// Exemplo de uso:
/*
const risco = CorpoImortalRiscoGlobal.calcularRiscoGlobal();
const classificacao = CorpoImortalRiscoGlobal.classificarRiscoGlobal();

console.log(CorpoImortalRiscoGlobal.descreverRiscoGlobal());
console.log(`Classificação: ${classificacao.tipo}`);

// Avisar jogador se risco está muito alto:
if (risco > 70) {
    console.warn('⚠️ Seu poder espiritual está atraindo atenção perigosa!');
}
*/

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   INTEGRAÇÃO COMPLETA - FUNÇÃO CONSOLIDADA
   
   Execute esta função para sincronizar Corpo Imortal com todos os sistemas
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

class CorpoImortalIntegracaoCompleta {
    /**
     * Sincroniza Corpo Imortal com todos os sistemas do jogo
     * Chame esta função sempre que dados de Corpo Imortal mudarem
     */
    static sincronizarComTodosSistemas() {
        console.log('🔄 Sincronizando Corpo Imortal com todos os sistemas...');

        // 1. Tribulação
        const riscoTribulacao = CorpoImortalTribulacao.calcularRiscoTribulacao();
        console.log(`   📊 Risco Tribulação: ${riscoTribulacao}%`);

        // 2. Eficiência de Cultivo
        const eficiencia = CorpoImortalEficienciaCultivo.calcularBonusEficiencia();
        const bonusDado = CorpoImortalEficienciaCultivo.calcularBonusDado();
        console.log(`   ⚡ Bônus Eficiência: +${eficiencia}%`);
        console.log(`   🎲 Bônus Dado: +${bonusDado}`);

        // 3. Limite de Técnica
        const limiteTecnica = CorpoImortalLimiteTecnica.calcularAumentoLimiteTecnica();
        console.log(`   📜 Aumento Limite Técnica: +${limiteTecnica}`);

        // 4. Risco Global
        const riscoGlobal = CorpoImortalRiscoGlobal.calcularRiscoGlobal();
        console.log(`   ⚠️ Risco Global: ${riscoGlobal.toFixed(1)}%`);

        // 5. Sincronizar com localStorage
        const dadosSincronizacao = {
            risco_tribulacao: riscoTribulacao,
            bonus_eficiencia: eficiencia,
            bonus_dado: bonusDado,
            aumento_limite_tecnica: limiteTecnica,
            risco_global: riscoGlobal,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('corpoImortalSincronizacao', JSON.stringify(dadosSincronizacao));
        console.log('✅ Sincronização completa!');

        return dadosSincronizacao;
    }

    /**
     * Obtém dados sincronizados
     */
    static obterDadosSincronizados() {
        const salvo = localStorage.getItem('corpoImortalSincronizacao');
        if (salvo) {
            return JSON.parse(salvo);
        }
        return this.sincronizarComTodosSistemas();
    }
}

// Exemplo de uso completo:
/*
// Quando jogador abrir o popup:
window.corpoImortalUI.abrir = function() {
    // ... código original ...
    CorpoImortalIntegracaoCompleta.sincronizarComTodosSistemas();
};

// Quando jogador fazer upgrade:
window.corpoImortalUI.fazerUpgrade = function(funcao) {
    // ... código original ...
    CorpoImortalIntegracaoCompleta.sincronizarComTodosSistemas();
};

// Para obter dados sincronizados:
const dados = CorpoImortalIntegracaoCompleta.obterDadosSincronizados();
console.log(dados);
*/

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   TESTES DE INTEGRAÇÃO
   
   Descomente para testar integração
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/*
// Teste 1: Tribulação
console.log('=== TESTE: TRIBULAÇÃO ===');
console.log(`Risco: ${CorpoImortalTribulacao.calcularRiscoTribulacao()}%`);
console.log(`Descrição: ${CorpoImortalTribulacao.descreverRiscoTribulacao()}`);

// Teste 2: Eficiência
console.log('=== TESTE: EFICIÊNCIA DE CULTIVO ===');
console.log(`Bônus Eficiência: +${CorpoImortalEficienciaCultivo.calcularBonusEficiencia()}%`);
console.log(`Bônus Dado: +${CorpoImortalEficienciaCultivo.calcularBonusDado()}`);

// Teste 3: Limite Técnica
console.log('=== TESTE: LIMITE DE TÉCNICA ===');
console.log(`Aumento: +${CorpoImortalLimiteTecnica.calcularAumentoLimiteTecnica()}`);
console.log(`Limite Total (base 5): ${CorpoImortalLimiteTecnica.calcularLimiteMaximoTecnicas(5)}`);

// Teste 4: Risco Global
console.log('=== TESTE: RISCO GLOBAL ===');
console.log(`Risco: ${CorpoImortalRiscoGlobal.calcularRiscoGlobal()}%`);
console.log(`Descrição: ${CorpoImortalRiscoGlobal.descreverRiscoGlobal()}`);

// Teste 5: Sincronização Completa
console.log('=== TESTE: SINCRONIZAÇÃO COMPLETA ===');
CorpoImortalIntegracaoCompleta.sincronizarComTodosSistemas();
*/

// Exportar para uso global
window.CorpoImortalIntegracoes = {
    Tribulacao: CorpoImortalTribulacao,
    EficienciaCultivo: CorpoImortalEficienciaCultivo,
    LimiteTecnica: CorpoImortalLimiteTecnica,
    RiscoGlobal: CorpoImortalRiscoGlobal,
    IntegracaoCompleta: CorpoImortalIntegracaoCompleta
};

console.log('✅ Módulo de Integrações Corpo Imortal carregado');
console.log('   Acesse via: window.CorpoImortalIntegracoes');
