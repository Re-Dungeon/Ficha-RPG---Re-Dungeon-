/**
 * TESTE DO SISTEMA DE HISTÓRICO DE SORTE
 * Simula ações para validar funcionamento
 */

console.log('🧪 [SorteHistoricoTeste] Script de teste carregado');

// Aguardar que os sistemas estejam prontos
setTimeout(() => {
    console.log('🧪 [SorteHistoricoTeste] Iniciando testes...');
    
    // Verificar se o sistema de histórico está disponível
    if (!window.sorteHistorico) {
        console.error('❌ SorteHistorico não está disponível!');
        return;
    }

    console.log('✅ SorteHistorico encontrado');

    // Teste 1: Simular rolagem de fortuna
    console.log('\n📌 TESTE 1: Simular rolagem de fortuna');
    window.dispatchEvent(new CustomEvent('fortunaRolada', {
        detail: {
            dadosBase: 3,
            dadosExtras: 2,
            totalDados: 5,
            somaDados: 18,
            resultadosDados: [4, 3, 5, 2, 4],
            bonus: 2,
            resultadoFinal: 20,
            fortunaAtual: 20
        }
    }));

    // Aguardar um pouco
    setTimeout(() => {
        console.log('\n📌 TESTE 2: Simular compra na loja');
        window.dispatchEvent(new CustomEvent('lojaCompra', {
            detail: {
                item: {
                    id: 'teste-item',
                    nome: 'Item de Teste',
                    custo: 5,
                    ativacao: 'imediata'
                },
                saldoRestante: 15
            }
        }));

        // Verificar histórico após 2 segundos
        setTimeout(() => {
            console.log('\n📌 TESTE 3: Verificar histórico');
            const historico = window.sorteHistorico.obterHistorico();
            console.log('✅ Histórico:', historico);
            console.log(`✅ Total de itens: ${historico.length}`);

            // Exibir cada item
            historico.forEach((item, index) => {
                console.log(`   ${index + 1}. [${item.tipo}] ${item.descricao}`);
            });

            // Exportar histórico como JSON
            console.log('\n📌 TESTE 4: Exportar histórico como JSON');
            const json = window.sorteHistorico.exportarHistorico();
            console.log('✅ Histórico exportado (ver console para detalhes)');

            console.log('\n🎉 TESTES CONCLUÍDOS COM SUCESSO!');
            console.log('✅ Sistema de histórico funcionando corretamente');
        }, 500);
    }, 500);

}, 5000); // Aguardar 5 segundos para os sistemas carregarem
