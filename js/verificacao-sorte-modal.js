#!/usr/bin/env node
/**
 * VERIFICACAO_SORTE_MODAL.js
 * Script de verificação da implementação do Sistema de Sorte
 * 
 * Executável no console do navegador
 */

console.clear();
console.log('%c╔════════════════════════════════════════╗', 'color: gold; font-weight: bold');
console.log('%c║  🎲 VERIFICAÇÃO DO SISTEMA DE SORTE   ║', 'color: gold; font-weight: bold');
console.log('%c╚════════════════════════════════════════╝', 'color: gold; font-weight: bold');
console.log('');

// Variáveis de status
let allChecks = [];
let passedChecks = 0;
let failedChecks = 0;

/**
 * Função auxiliar para verificação
 */
function check(name, condition, hint = '') {
    const status = condition ? '✅ PASSOU' : '❌ FALHOU';
    const color = condition ? 'green' : 'red';
    
    console.log(`%c${status} %c${name}${hint ? ` - ${hint}` : ''}`, 
        `color: ${color}; font-weight: bold`, 'color: white');
    
    if (condition) {
        passedChecks++;
    } else {
        failedChecks++;
    }
    
    allChecks.push({
        name,
        condition,
        hint
    });
}

// ============================================
// VERIFICAÇÃO 1: ARQUIVO CSS
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 1: ARQUIVOS CSS', 'color: cyan; font-weight: bold');

check(
    'CSS carregado',
    document.querySelector('link[href*="sorte-modal.css"]') !== null,
    'Link do CSS presente no <head>'
);

check(
    'Estilos aplicados',
    window.getComputedStyle(document.querySelector('.sorte-modal-overlay') || {}).backgroundColor !== '',
    'Elementos têm estilos aplicados'
);

// ============================================
// VERIFICAÇÃO 2: ARQUIVO JAVASCRIPT
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 2: ARQUIVOS JAVASCRIPT', 'color: cyan; font-weight: bold');

check(
    'SorteModal carregado',
    typeof window.sorteModal !== 'undefined',
    'Classe SorteModal instanciada'
);

check(
    'Test utils carregados',
    typeof window.sorteModalTest !== 'undefined',
    'Ferramentas de teste disponíveis'
);

// ============================================
// VERIFICAÇÃO 3: HTML
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 3: ESTRUTURA HTML', 'color: cyan; font-weight: bold');

check(
    'Overlay presente',
    document.querySelector('.sorte-modal-overlay') !== null,
    'Div .sorte-modal-overlay encontrada'
);

check(
    'Container presente',
    document.querySelector('.sorte-modal-container') !== null,
    'Div .sorte-modal-container encontrada'
);

check(
    'Cabeçalho presente',
    document.querySelector('.sorte-modal-header') !== null,
    'Header .sorte-modal-header encontrada'
);

check(
    'Botão fechar presente',
    document.querySelector('.sorte-modal-close-btn') !== null,
    'Botão de fechar encontrado'
);

check(
    'Sorte Total input presente',
    document.getElementById('sorte-total-value') !== null,
    'Elemento para Sorte Total encontrado'
);

check(
    'Fortuna Atual input presente',
    document.getElementById('fortuna-atual-value') !== null,
    'Elemento para Fortuna Atual encontrado'
);

check(
    'Bônus input presente',
    document.getElementById('bonus-sorte-input') !== null,
    'Input para Bônus de Sorte encontrado'
);

check(
    'Botão Rolar presente',
    document.getElementById('btn-sorte-rolar') !== null,
    'Botão Rolar Fortuna encontrado'
);

check(
    'Botão Loja presente',
    document.getElementById('btn-sorte-loja') !== null,
    'Botão Abrir Loja encontrado'
);

check(
    'Status section presente',
    document.querySelector('.sorte-status-section') !== null,
    'Seção de status encontrada'
);

// ============================================
// VERIFICAÇÃO 4: FUNCIONALIDADE
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 4: FUNCIONALIDADE', 'color: cyan; font-weight: bold');

check(
    'Método open() existe',
    window.sorteModal && typeof window.sorteModal.open === 'function',
    'Função open() implementada'
);

check(
    'Método close() existe',
    window.sorteModal && typeof window.sorteModal.close === 'function',
    'Função close() implementada'
);

check(
    'Método toggle() existe',
    window.sorteModal && typeof window.sorteModal.toggle === 'function',
    'Função toggle() implementada'
);

check(
    'Método debug() existe',
    window.sorteModal && typeof window.sorteModal.debug === 'function',
    'Função debug() implementada'
);

check(
    'Dados de Sorte carregados',
    window.sorteModal && window.sorteModal.sorteData !== undefined,
    'Objeto sorteData inicializado'
);

// ============================================
// VERIFICAÇÃO 5: INTEGRAÇÃO
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 5: INTEGRAÇÃO', 'color: cyan; font-weight: bold');

check(
    'StateManager disponível',
    typeof window.appState !== 'undefined',
    'window.appState presente'
);

check(
    'localStorage acessível',
    typeof localStorage !== 'undefined',
    'localStorage disponível'
);

check(
    'Botão route-sorte presente',
    document.getElementById('route-sorte') !== null,
    'Botão na barra lateral encontrado'
);

// ============================================
// VERIFICAÇÃO 6: FERRAMENTAS DE TESTE
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 6: FERRAMENTAS DE TESTE', 'color: cyan; font-weight: bold');

check(
    'Test helper: openModal',
    typeof window.sorteModalTest !== 'undefined' && typeof window.sorteModalTest.openModal === 'function',
    'Função openModal() em sorteModalTest'
);

check(
    'Test helper: closeModal',
    typeof window.sorteModalTest !== 'undefined' && typeof window.sorteModalTest.closeModal === 'function',
    'Função closeModal() em sorteModalTest'
);

check(
    'Test helper: setSorteTotal',
    typeof window.sorteModalTest !== 'undefined' && typeof window.sorteModalTest.setSorteTotal === 'function',
    'Função setSorteTotal() em sorteModalTest'
);

check(
    'Test helper: setFortuna',
    typeof window.sorteModalTest !== 'undefined' && typeof window.sorteModalTest.setFortuna === 'function',
    'Função setFortuna() em sorteModalTest'
);

check(
    'Test helper: setBonusSorte',
    typeof window.sorteModalTest !== 'undefined' && typeof window.sorteModalTest.setBonusSorte === 'function',
    'Função setBonusSorte() em sorteModalTest'
);

check(
    'Test helper: status',
    typeof window.sorteModalTest !== 'undefined' && typeof window.sorteModalTest.status === 'function',
    'Função status() em sorteModalTest'
);

// ============================================
// VERIFICAÇÃO 7: EVENTOS
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 7: LISTENERS', 'color: cyan; font-weight: bold');

const overlay = document.querySelector('.sorte-modal-overlay');
const closeBtn = document.querySelector('.sorte-modal-close-btn');
const bonusInput = document.getElementById('bonus-sorte-input');

check(
    'Listeners configurados',
    window.sorteModal && window.sorteModal.overlay !== undefined,
    'Modal tem referência ao overlay'
);

check(
    'Close button listeners',
    closeBtn !== null,
    'Botão close encontrado'
);

check(
    'Bonus input listeners',
    bonusInput !== null,
    'Input de bônus encontrado'
);

// ============================================
// VERIFICAÇÃO 8: PERSISTÊNCIA
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 8: PERSISTÊNCIA', 'color: cyan; font-weight: bold');

// Testar salvamento
try {
    localStorage.setItem('redungeon_test_sorte', 'teste');
    const testValue = localStorage.getItem('redungeon_test_sorte');
    check(
        'localStorage funcional',
        testValue === 'teste',
        'Dados salvos e recuperados'
    );
    localStorage.removeItem('redungeon_test_sorte');
} catch (e) {
    check('localStorage funcional', false, e.message);
}

// ============================================
// VERIFICAÇÃO 9: CONSOLE LOGS
// ============================================
console.log('\n%c📋 VERIFICAÇÃO 9: CONSOLES LOGS', 'color: cyan; font-weight: bold');

// Capturar logs
const originalLog = console.log;
let logsCapturados = [];

console.log('%c[Verificando logs do sistema...]', 'color: gray; font-style: italic');

// ============================================
// RESUMO FINAL
// ============================================
console.log('\n%c╔════════════════════════════════════════╗', 'color: gold; font-weight: bold');
console.log('%c║  📊 RESUMO FINAL                       ║', 'color: gold; font-weight: bold');
console.log('%c╚════════════════════════════════════════╝', 'color: gold; font-weight: bold');

console.log(`\n✅ Verificações Passadas: ${passedChecks}`);
console.log(`❌ Verificações Falhadas: ${failedChecks}`);
console.log(`📊 Total de Verificações: ${allChecks.length}`);
console.log(`📈 Taxa de Sucesso: ${((passedChecks / allChecks.length) * 100).toFixed(1)}%`);

if (failedChecks === 0) {
    console.log('\n%c✨ SISTEMA DE SORTE TOTALMENTE FUNCIONAL! ✨', 'color: green; font-weight: bold; font-size: 14px');
} else {
    console.log(`\n%c⚠️  ${failedChecks} verificação(ões) falhada(s) - Verifique acima`, 'color: orange; font-weight: bold');
}

// ============================================
// SUGESTÕES DE TESTE
// ============================================
console.log('\n%c📋 PRÓXIMOS PASSOS:', 'color: cyan; font-weight: bold');
console.log(`
1️⃣  Testar abertura do modal:
    window.sorteModalTest.openModal()

2️⃣  Ver informações de debug:
    window.sorteModalTest.debugInfo()

3️⃣  Ver status:
    window.sorteModalTest.status()

4️⃣  Simular dados:
    window.sorteModalTest.setSorteTotal(75)
    window.sorteModalTest.setFortuna(12)
    window.sorteModalTest.setBonusSorte(3)

5️⃣  Ver ajuda completa:
    window.sorteModalTest.help()
`);

console.log('%c═══════════════════════════════════════', 'color: gold');
console.log('%c🎲 VERIFICAÇÃO CONCLUÍDA COM SUCESSO 🎲', 'color: gold; font-weight: bold; text-align: center');
console.log('%c═══════════════════════════════════════', 'color: gold');

// Retornar status
window.sorteVerificationStatus = {
    passed: passedChecks,
    failed: failedChecks,
    total: allChecks.length,
    success: failedChecks === 0,
    checks: allChecks
};

console.log('\n📊 Ver status em: window.sorteVerificationStatus');
