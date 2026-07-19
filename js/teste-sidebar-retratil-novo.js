/* ============================================ */
/* TESTE-SIDEBAR-RETRATIL.js                    */
/* Diagnóstico da Sidebar Retrátil              */
/* ============================================ */

console.clear();
console.log('%c=== DIAGNÓSTICO DA SIDEBAR RETRÁTIL ===', 'color: #d4af55; font-size: 14px; font-weight: bold;');

// 1. Verificar MenuPrincipal
console.log('%n1. MENU PRINCIPAL', 'color: #d4af55;');
if (window.menuPrincipal) {
    console.log('✅ MenuPrincipal inicializado');
    console.log('   - sidebarCollapsed:', window.menuPrincipal.sidebarCollapsed);
    console.log('   - Métodos disponíveis:');
    console.log('     - toggle():', typeof window.menuPrincipal.toggle);
    console.log('     - expand():', typeof window.menuPrincipal.expand);
    console.log('     - collapse():', typeof window.menuPrincipal.collapse);
    console.log('     - isVisible():', typeof window.menuPrincipal.isVisible);
} else {
    console.error('❌ MenuPrincipal NÃO inicializado');
}

// 2. Verificar SidebarIntegration
console.log('%n2. SIDEBAR INTEGRATION', 'color: #d4af55;');
if (window.sidebarIntegration) {
    console.log('✅ SidebarIntegration inicializado');
} else {
    console.warn('⚠️ SidebarIntegration pode não estar pronto');
}

// 3. Verificar DOM
console.log('%n3. ELEMENTOS DOM', 'color: #d4af55;');
const sidebar = document.getElementById('rpg-vertical-bar-left');
const toggleBtn = document.querySelector('.sidebar-toggle-btn');
const container = document.querySelector('.vertical-bar__container');

if (sidebar) {
    console.log('✅ Sidebar encontrada');
    console.log('   - Largura:', window.getComputedStyle(sidebar).width);
    console.log('   - Classes:', sidebar.className);
    console.log('   - Collapsed?', sidebar.classList.contains('collapsed'));
    console.log('   - Display:', window.getComputedStyle(sidebar).display);
} else {
    console.error('❌ Sidebar NÃO encontrada');
}

if (toggleBtn) {
    console.log('✅ Toggle button encontrado');
    console.log('   - innerHTML:', toggleBtn.innerHTML.substring(0, 50) + '...');
    console.log('   - aria-expanded:', toggleBtn.getAttribute('aria-expanded'));
    // Teste de clique
    console.log('   - Teste: clicando...');
    toggleBtn.click();
    setTimeout(() => {
        console.log('   - Após clique - sidebar.collapsed?', sidebar.classList.contains('collapsed'));
        console.log('   - Após clique - largura:', window.getComputedStyle(sidebar).width);
    }, 300);
} else {
    console.error('❌ Toggle button NÃO encontrado');
}

if (container) {
    console.log('✅ Container encontrado');
    console.log('   - Filhos (botões/seções):', container.children.length);
} else {
    console.error('❌ Container NÃO encontrado');
}

// 4. Verificar botões
console.log('%n4. BOTÕES DA SIDEBAR', 'color: #d4af55;');
const buttons = document.querySelectorAll('.vertical-bar__button');
console.log(`Total de botões encontrados: ${buttons.length}`);

const rotas = ['info', 'aptidao', 'racas', 'classes', 'dicas', 'sorte', 'itens', 'condicoes', 'cultivacao', 'corpo-imortal', 'salvar', 'importar'];
rotas.forEach(rota => {
    const btn = document.getElementById(`route-${rota}`);
    if (btn) {
        console.log(`✅ route-${rota}`);
    } else {
        console.warn(`⚠️ route-${rota} não encontrado`);
    }
});

// 5. Verificar localStorage
console.log('%n5. PERSISTÊNCIA (localStorage)', 'color: #d4af55;');
const savedState = localStorage.getItem('menu-principal-collapsed');
console.log(`Estado salvo no localStorage: ${savedState || 'não há'}`);

// 6. Resumo
console.log('%n=== RESUMO ===', 'color: #d4af55; font-size: 12px; font-weight: bold;');
const allOk = window.menuPrincipal && sidebar && toggleBtn && buttons.length > 0;
if (allOk) {
    console.log('%c✨ Sistema operacional! ✨', 'color: #7ca3ed; font-size: 12px; font-weight: bold;');
    console.log('\nTeste manual: window.menuPrincipal.toggle()');
} else {
    console.log('%c⚠️ Há problemas detectados acima', 'color: #ff6b6b; font-size: 12px; font-weight: bold;');
}
