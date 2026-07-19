/* ============================================ */
/* TESTE-SIDEBAR-CORRIGIDO.JS                   */
/* Validação completa da Sidebar Retrátil       */
/* ============================================ */

console.clear();
console.log('%c=== TESTE SIDEBAR RETRÁTIL CORRIGIDO ===', 'color: #d4af55; font-size: 14px; font-weight: bold;');

// 1. Verificar inicialização
console.log('%n1. INICIALIZAÇÃO', 'color: #d4af55;');
if (window.menuPrincipal) {
    console.log('✅ MenuPrincipal inicializado');
    console.log('   - Estado inicial:', window.menuPrincipal.sidebarCollapsed ? 'RECOLHIDO' : 'EXPANDIDO');
} else {
    console.error('❌ MenuPrincipal não inicializado');
}

if (window.sidebarIntegration) {
    console.log('✅ SidebarIntegration inicializado');
} else {
    console.warn('⚠️ SidebarIntegration pode não estar pronto');
}

// 2. Verificar elementos DOM
console.log('%n2. ELEMENTOS DOM', 'color: #d4af55;');
const sidebar = document.getElementById('rpg-vertical-bar-left');
const sidebarRight = document.getElementById('rpg-vertical-bar-right');
const toggleBtn = document.querySelector('.sidebar-toggle-btn');

if (sidebar) {
    console.log('✅ Sidebar esquerda encontrada');
    console.log('   - Classes:', sidebar.className);
    console.log('   - Display:', window.getComputedStyle(sidebar).display);
} else {
    console.error('❌ Sidebar esquerda não encontrada');
}

if (sidebarRight) {
    console.log('ℹ️ Sidebar direita encontrada');
    const display = window.getComputedStyle(sidebarRight).display;
    if (display === 'none') {
        console.log('✅ Sidebar direita está oculta (correto)');
    } else {
        console.warn('⚠️ Sidebar direita ainda visível');
    }
} else {
    console.log('ℹ️ Sidebar direita não encontrada');
}

if (toggleBtn) {
    console.log('✅ Toggle button encontrado');
    console.log('   - aria-expanded:', toggleBtn.getAttribute('aria-expanded'));
} else {
    console.error('❌ Toggle button não encontrado');
}

// 3. Verificar botões por seção
console.log('%n3. BOTÕES POR SEÇÃO', 'color: #d4af55;');
const sections = {
    'PERSONAGEM': ['info', 'aptidao', 'racas', 'classes'],
    'SISTEMA': ['dicas', 'sorte', 'itens', 'condicoes'],
    'PROGRESSÃO': ['cultivacao', 'corpo-imortal'],
    'DADOS': ['salvar', 'importar']
};

let totalBotoes = 0;
let botoesFaltantes = [];

Object.entries(sections).forEach(([sectionName, routes]) => {
    console.log(`\n${sectionName}:`);
    routes.forEach(route => {
        const btn = document.getElementById(`route-${route}`);
        if (btn) {
            console.log(`  ✅ ${route}`);
            totalBotoes++;
        } else {
            console.error(`  ❌ ${route} (NÃO ENCONTRADO)`);
            botoesFaltantes.push(route);
        }
    });
});

console.log(`\n📊 Total: ${totalBotoes}/12 botões encontrados`);
if (botoesFaltantes.length > 0) {
    console.error(`⚠️ Botões faltando: ${botoesFaltantes.join(', ')}`);
}

// 4. Verificar CSS
console.log('%n4. CSS CARREGADO', 'color: #d4af55;');
const stylesheets = Array.from(document.styleSheets);
const sidebarCss = stylesheets.some(sheet => 
    sheet.href && sheet.href.includes('sidebar-retratil.css')
);
if (sidebarCss) {
    console.log('✅ CSS da Sidebar carregado');
} else {
    console.warn('⚠️ CSS da Sidebar não encontrado');
}

// 5. Verificar localStorage
console.log('%n5. PERSISTÊNCIA (localStorage)', 'color: #d4af55;');
const savedState = localStorage.getItem('menu-principal-collapsed');
if (savedState !== null) {
    console.log(`✅ Estado salvo: ${savedState}`);
} else {
    console.log('ℹ️ Nenhum estado salvo ainda (será criado ao recolher)');
}

// 6. Verificar funções disponíveis
console.log('%n6. FUNÇÕES DISPONÍVEIS', 'color: #d4af55;');
if (window.menuPrincipal) {
    const funcoes = ['toggle', 'expand', 'collapse', 'isVisible', 'handleButtonClick'];
    funcoes.forEach(fn => {
        if (typeof window.menuPrincipal[fn] === 'function') {
            console.log(`✅ menuPrincipal.${fn}()`);
        } else {
            console.error(`❌ menuPrincipal.${fn}() não encontrada`);
        }
    });
}

// 7. Verificar handlers especiais
console.log('%n7. HANDLERS ESPECIAIS', 'color: #d4af55;');
const handlers = [
    { name: 'racasUI', obj: window.racasUI, method: 'abrirModal' },
    { name: 'classesUI', obj: window.classesUI, method: 'abrirModal' },
    { name: 'sorteModal', obj: window.sorteModal, method: 'open' },
    { name: 'sistemaCondicoes', obj: window.sistemaCondicoes, method: 'abrirPopup' },
    { name: 'corpoImortalUI', obj: window.corpoImortalUI, method: 'abrir' },
    { name: 'cultivacao', obj: window.cultivacao?.ui, method: 'abrir' },
    { name: 'aptidoesVisualPopup', obj: window.aptidoesVisualPopup, method: 'open' }
];

handlers.forEach(({ name, obj, method }) => {
    if (obj && typeof obj[method] === 'function') {
        console.log(`✅ ${name}.${method}()`);
    } else {
        console.warn(`⚠️ ${name}.${method}() - não disponível (ainda não inicializado)`);
    }
});

// 8. Teste de clique
console.log('%n8. TESTE MANUAL', 'color: #d4af55;');
console.log('Para testar, execute:');
console.log('  window.menuPrincipal.toggle()    // Alterna expandir/recolher');
console.log('  window.menuPrincipal.expand()    // Expande');
console.log('  window.menuPrincipal.collapse()  // Recolhe');
console.log('  window.menuPrincipal.isVisible() // Verifica estado');

// 9. Resumo final
console.log('%n=== RESUMO FINAL ===', 'color: #d4af55; font-size: 14px; font-weight: bold;');
console.log(`✅ Elementos DOM: ${sidebar ? 'OK' : 'ERRO'}`);
console.log(`✅ Botões: ${totalBotoes}/12`);
console.log(`✅ Classes: ${window.menuPrincipal ? 'OK' : 'ERRO'}`);
console.log(`✅ CSS: ${sidebarCss ? 'OK' : 'AVISO'}`);

if (totalBotoes === 12 && window.menuPrincipal && sidebar && sidebarCss) {
    console.log('%c✨ TUDO PRONTO! Sidebar operacional ✨', 'color: #7ca3ed; font-size: 12px; font-weight: bold; background: #1a1a1a; padding: 5px;');
} else {
    console.log('%c⚠️ Verifique os erros acima', 'color: #ff6b6b; font-size: 12px; font-weight: bold;');
}
