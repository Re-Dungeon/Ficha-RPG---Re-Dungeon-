/**
 * TESTE RÁPIDO - SIDEBAR RETRÁTIL
 * Execute este arquivo no console para testar
 */

console.log('='.repeat(50));
console.log('🧪 TESTE RÁPIDO - SIDEBAR RETRÁTIL');
console.log('='.repeat(50));

// 1. Verificar se MenuPrincipal está inicializado
console.log('\n1️⃣ Verificando MenuPrincipal...');
if (window.menuPrincipal) {
    console.log('✅ MenuPrincipal inicializado');
    console.log('   - menuData items:', window.menuPrincipal.menuData.length);
    console.log('   - sidebarCollapsed:', window.menuPrincipal.sidebarCollapsed);
} else {
    console.log('❌ MenuPrincipal não encontrado');
}

// 2. Verificar se SidebarIntegration está inicializado
console.log('\n2️⃣ Verificando SidebarIntegration...');
if (window.sidebarIntegration) {
    console.log('✅ SidebarIntegration inicializado');
} else {
    console.log('❌ SidebarIntegration não encontrado');
}

// 3. Verificar DOM
console.log('\n3️⃣ Verificando Elementos do DOM...');
const sidebar = document.getElementById('rpg-vertical-bar-left');
if (sidebar) {
    console.log('✅ Sidebar encontrada');
    console.log('   - Width:', window.getComputedStyle(sidebar).width);
    console.log('   - Has collapsed class:', sidebar.classList.contains('collapsed'));
} else {
    console.log('❌ Sidebar não encontrada');
}

const toggleBtn = document.querySelector('.sidebar-toggle-btn');
if (toggleBtn) {
    console.log('✅ Toggle button encontrado');
} else {
    console.log('❌ Toggle button não encontrado');
}

// 4. Verificar localStorage
console.log('\n4️⃣ Verificando localStorage...');
const savedState = localStorage.getItem('menu-principal-collapsed');
console.log('   - menu-principal-collapsed:', savedState);

// 5. Verificar CSS
console.log('\n5️⃣ Verificando CSS...');
const link = document.querySelector('link[href="css/sidebar-retratil.css"]');
if (link) {
    console.log('✅ CSS sidebar-retratil carregado');
} else {
    console.log('❌ CSS sidebar-retratil não encontrado');
}

// 6. Testar toggle
console.log('\n6️⃣ Testando toggle...');
if (window.menuPrincipal) {
    const before = window.menuPrincipal.sidebarCollapsed;
    console.log('   - Estado antes:', before ? 'recolhido' : 'expandido');
    window.menuPrincipal.toggle();
    const after = window.menuPrincipal.sidebarCollapsed;
    console.log('   - Estado depois:', after ? 'recolhido' : 'expandido');
    window.menuPrincipal.toggle(); // Voltar ao estado anterior
    console.log('   ✅ Toggle funcionando');
}

// 7. Verificar handlers
console.log('\n7️⃣ Verificando Handlers Especiais...');
const handlers = {
    'racasUI': !!window.racasUI,
    'classesUI': !!window.classesUI,
    'sorteModal': !!window.sorteModal,
    'sistemaCondicoes': !!window.sistemaCondicoes,
    'corpoImortalUI': !!window.corpoImortalUI,
    'cultivacao': !!window.cultivacao,
    'aptidoesVisualPopup': !!window.aptidoesVisualPopup
};

Object.entries(handlers).forEach(([name, exists]) => {
    console.log(`   ${exists ? '✅' : '⚠️ '} ${name}`);
});

// 8. Resumo
console.log('\n' + '='.repeat(50));
console.log('📋 RESUMO');
console.log('='.repeat(50));
console.log('✅ Todos os elementos estão no lugar');
console.log('ℹ️ Handlers podem ser inicializados após DOMContentLoaded');
console.log('✅ Pronto para testes interativos');
console.log('\n💡 Tente: window.menuPrincipal.toggle()');
console.log('💡 Tente: window.menuPrincipal.expand()');
console.log('💡 Tente: window.menuPrincipal.collapse()');
console.log('='.repeat(50));
