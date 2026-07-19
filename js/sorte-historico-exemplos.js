/**
 * EXEMPLOS DE USO - HISTÓRICO DE SORTE
 * 
 * Copie e cole esses exemplos em qualquer lugar do seu código
 * para registrar novas ações no histórico de sorte.
 */

// ============================================
// EXEMPLO 1: Registrar uma rolagem manual
// ============================================
// Dispare este evento quando uma rolagem de fortuna ocorrer:

window.dispatchEvent(new CustomEvent('fortunaRolada', {
    detail: {
        dadosBase: 3,           // Resultado do d6 base
        dadosExtras: 2,         // Dados extras baseados em Sorte
        totalDados: 5,          // Total de dados
        somaDados: 18,          // Soma dos resultados
        resultadosDados: [4, 3, 5, 2, 4],  // Array dos resultados individuais
        bonus: 2,               // Bônus de sorte aplicado
        resultadoFinal: 20,     // Soma + Bônus
        fortunaAtual: 20        // Nova fortuna atual
    }
}));

// ============================================
// EXEMPLO 2: Registrar uma compra na loja
// ============================================
// Este evento é disparado automaticamente pelo sistema de loja
// Mas você pode disparar manualmente assim:

window.dispatchEvent(new CustomEvent('lojaCompra', {
    detail: {
        item: {
            id: 'item-123',
            nome: 'Poção de Sorte Maior',
            custo: 10,
            ativacao: 'imediata'
        },
        saldoRestante: 35  // Saldo após a compra
    }
}));

// ============================================
// EXEMPLO 3: Registrar um benefício aplicado
// ============================================
// Dispare quando um benefício for aplicado:

window.dispatchEvent(new CustomEvent('beneficioAplicado', {
    detail: {
        beneficioNome: 'Sorte Dobrada por 1 Hora',
        duracao: '1 hora',
        efeito: 'Todos os dados de sorte são rolados em dobro'
    }
}));

// ============================================
// EXEMPLO 4: Acessar o histórico completo
// ============================================

// Obter o histórico como array
let hist = window.sorteHistorico.obterHistorico();

// Iterar sobre os itens
hist.forEach(item => {
    console.log(`${item.tipo}: ${item.descricao}`);
    console.log(`  Horário: ${item.timestamp}`);
    console.log(`  Dados: ${JSON.stringify(item.dados)}`);
});

// ============================================
// EXEMPLO 5: Exportar histórico como JSON
// ============================================

const json = window.sorteHistorico.exportarHistorico();
console.log('Histórico em JSON:');
console.log(json);

// Você pode enviar isso para um servidor:
// fetch('/api/salvar-historico', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: json
// });

// ============================================
// EXEMPLO 6: Limpar o histórico
// ============================================

window.sorteHistorico.limparHistorico();
// O histórico será vazio e a UI será atualizada

// ============================================
// EXEMPLO 7: Monitorar mudanças do histórico
// ============================================

// Crie um intervalo para monitorar
setInterval(() => {
    const historico2 = window.sorteHistorico.obterHistorico();
    console.log(`Histórico tem ${historico2.length} itens`);
}, 5000);

// ============================================
// EXEMPLO 8: Filtrar histórico por tipo
// ============================================

let hist3 = window.sorteHistorico.obterHistorico();

// Apenas rolagens
const rolagens = hist3.filter(item => item.tipo === 'rolagem');
console.log(`Rolagens: ${rolagens.length}`);

// Apenas compras
const compras = hist3.filter(item => item.tipo === 'compra');
console.log(`Compras: ${compras.length}`);

// Apenas benefícios
const beneficios = hist3.filter(item => item.tipo === 'beneficio');
console.log(`Benefícios: ${beneficios.length}`);

// ============================================
// EXEMPLO 9: Calcular ganhos totais
// ============================================

let hist4 = window.sorteHistorico.obterHistorico();

const ganhoTotal = hist4
    .filter(item => item.tipo === 'rolagem')
    .reduce((total, item) => total + item.dados.resultadoFinal, 0);

console.log(`Ganho total de Fortuna: ${ganhoTotal}`);

// ============================================
// EXEMPLO 10: Criar estatísticas
// ============================================

let hist5 = window.sorteHistorico.obterHistorico();

const stats = {
    totalAcoes: hist5.length,
    rolagens: hist5.filter(item => item.tipo === 'rolagem').length,
    compras: hist5.filter(item => item.tipo === 'compra').length,
    beneficios: hist5.filter(item => item.tipo === 'beneficio').length,
    ganhoTotal: hist5
        .filter(item => item.tipo === 'rolagem')
        .reduce((total, item) => total + item.dados.resultadoFinal, 0),
    gastoTotal: hist5
        .filter(item => item.tipo === 'compra')
        .reduce((total, item) => total + item.dados.custoItem, 0)
};

console.table(stats);
console.log('Estatísticas:', stats);

// ============================================
// DICAS IMPORTANTES
// ============================================

/*
✅ O histórico SEMPRE está acessível em window.sorteHistorico
✅ Os eventos são disparados automaticamente por sorte-modal.js e loja-trapaça.js
✅ O histórico é salvo automaticamente em localStorage
✅ O histórico mostra as últimas 10 ações (configurável)
✅ O timestamp é formatado automaticamente (agora, 5m, 2h, etc)

❌ Não edite diretamente o localStorage (use a API pública)
❌ Não dispare eventos manualmente com frequência (apenas para testes)
❌ Não remova o script sorte-historico.js do HTML
❌ Não modifique o estrutura do objeto de ação sem atualizar gerarConteudoItem()
*/
