/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMPAR-FICHA-ISOLADO.JS (VERSÃO SIMPLIFICADA)
 * ═══════════════════════════════════════════════════════════════════════════
 */

class LimparFichaIsolado {
    constructor() {
        this.isRunning = false;
        console.log('🧹 [LimparFichaIsolado] Criando instância...');
        this.init();
    }

    init() {
        console.log('🧹 [LimparFichaIsolado] Inicializando...');
        
        const btn = document.getElementById('btn-limpar-ficha');
        if (!btn) {
            console.warn('⏳ [LimparFichaIsolado] Botão não encontrado, tentando novamente...');
            setTimeout(() => this.init(), 500);
            return;
        }

        console.log('✅ [LimparFichaIsolado] Botão encontrado');
        
        // Limpar listeners antigos
        btn.onclick = null;
        
        // Adicionar listener novo
        btn.addEventListener('click', (e) => {
            console.log('🖱️ Clique no botão detectado');
            e.preventDefault();
            e.stopPropagation();
            this.executar();
        });
        
        console.log('✅ [LimparFichaIsolado] Pronto para usar!');
    }

    async executar() {
        console.log('⚙️ [executar] Iniciado');
        
        if (this.isRunning) {
            console.warn('⏳ Já rodando');
            return;
        }

        this.isRunning = true;

        // Confirmação
        const ok = confirm('🗑️ APAGAR TODOS OS DADOS DA FICHA?\n\nClique OK para confirmar.');
        
        if (!ok) {
            console.log('❌ Cancelado');
            this.isRunning = false;
            return;
        }

        console.log('🔥 INICIANDO LIMPEZA TOTAL...');

        window.isLimpandoFicha = true;

        try {
            // 1. Limpar localStorage COMPLETAMENTE
            console.log('📦 Etapa 1: Limpando localStorage...');
            const beforeLS = Object.keys(localStorage).length;
            localStorage.clear();
            console.log(`✅ Removidas ${beforeLS} chaves de localStorage`);
            
            // Verificar se realmente ficou vazio
            if (Object.keys(localStorage).length > 0) {
                console.error('❌ ERRO: localStorage ainda tem dados!');
                console.error('Chaves restantes:', Object.keys(localStorage));
                window.isLimpandoFicha = false;
                return;
            }

            // 2. Limpar sessionStorage COMPLETAMENTE
            console.log('🔧 Etapa 2: Limpando sessionStorage...');
            const beforeSS = Object.keys(sessionStorage).length;
            sessionStorage.clear();
            console.log(`✅ Removidas ${beforeSS} chaves de sessionStorage`);
            
            // Verificar se realmente ficou vazio
            if (Object.keys(sessionStorage).length > 0) {
                console.error('❌ ERRO: sessionStorage ainda tem dados!');
                console.error('Chaves restantes:', Object.keys(sessionStorage));
                window.isLimpandoFicha = false;
                return;
            }

            // 3. Limpar IndexedDB também (se houver)
            console.log('🗄️ Etapa 3: Limpando IndexedDB (se houver)...');
            try {
                // Tentar limpar IndexedDB (se suportado)
                if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
                    const dbs = await indexedDB.databases();
                    for (const db of dbs) {
                        indexedDB.deleteDatabase(db.name);
                        console.log(`✅ Banco de dados deletado: ${db.name}`);
                    }
                } else {
                    console.log('⚠️ indexedDB.databases() não suportado');
                }
                
                // Também tentar via ImagemStorageManager se existir
                if (typeof ImagemStorageManager !== 'undefined' && typeof ImagemStorageManager.deletarImagem === 'function') {
                    try {
                        await ImagemStorageManager.deletarImagem('personagem_imagem');
                        console.log('✅ Imagem do personagem deletada do IndexedDB');
                    } catch (e) {
                        console.warn('⚠️ Erro ao deletar imagem:', e.message);
                    }
                }
            } catch (e) {
                console.warn('⚠️ Erro ao limpar IndexedDB:', e.message);
            }

            // 3.5 Resetar estado de atributos em memória
            // Isso garante que o StateManager não mantenha valores antigos
            if (window.appState) {
                try {
                    console.log('🧠 Etapa 3.5: Resetando appState.atributos...');
                    const atributosZerados = {
                        primarios: {
                            forca: { base: 0, extra: 0, bonus: 0, total: 0 },
                            vitalidade: { base: 0, extra: 0, bonus: 0, total: 0 },
                            agilidade: { base: 0, extra: 0, bonus: 0, total: 0 },
                            inteligencia: { base: 0, extra: 0, bonus: 0, total: 0 },
                            percepcao: { base: 0, extra: 0, bonus: 0, total: 0 },
                            sorte: { base: 0, extra: 0, bonus: 0, total: 0 }
                        },
                        secundarios: {
                            prontidao: { base: 0, extra: 0, bonus: 0, total: 0 },
                            ataque: { base: 0, extra: 0, bonus: 0, total: 0 },
                            defesa: { base: 0, extra: 0, bonus: 0, total: 0 },
                            reacao: { base: 0, extra: 0, bonus: 0, total: 0 },
                            precisao: { base: 0, extra: 0, bonus: 0, total: 0 },
                            evasao: { base: 0, extra: 0, bonus: 0, total: 0 }
                        }
                    };
                    window.appState.setState({ atributos: atributosZerados });
                    console.log('✅ appState.atributos resetado');
                } catch (e) {
                    console.warn('⚠️ Erro ao resetar appState.atributos:', e.message);
                }
            }

            // 4. Limpar DOM
            console.log('🎨 Etapa 4: Limpando DOM...');
            this.limparDOM();
            console.log('✅ DOM limpo');

            // 5. Remover flags globais e limpar objetos globais
            console.log('🔓 Etapa 5: Removendo flags globais...');
            delete window.isImportandoFicha;
            delete window.isLimpandoFicha;
            delete window.isAtualizandoFicha;
            // Não deletar window.appState antes da verificação final.
            // A página será recarregada se a limpeza for bem-sucedida.
            
            // Limpar todos os objetos globais de módulos
            console.log('   - Limpando módulos globais...');
            
            // ⚔️ LIMPAR SISTEMA DE HABILIDADES (ArtsSystemManager)
            if (window.artsSystem) {
                console.log('   - Resetando ArtsSystemManager...');
                try {
                    // Resetar o character na memória
                    if (window.artsSystem.character) {
                        window.artsSystem.character.cores = [];
                        window.artsSystem.character.arts = [];
                        window.artsSystem.character.name = 'Personagem';
                        console.log('     ✅ Character resetado');
                    }
                    
                    // Limpar a UI
                    if (window.artsSystem.uiManager) {
                        const container = document.getElementById('rpg-content-habilidades');
                        if (container) {
                            container.innerHTML = '';
                            console.log('     ✅ UI container limpo');
                        }
                    }
                } catch (e) {
                    console.warn('     ⚠️ Erro ao resetar ArtsSystem:', e.message);
                }
            }
            
            // 📦 LIMPAR INVENTÁRIO
            if (window.inventarioManager) {
                console.log('   - Resetando Inventário...');
                try {
                    if (window.inventarioManager.inventario) {
                        window.inventarioManager.inventario.itens = [];
                        window.inventarioManager.inventario.armazenamentos = [];
                    }
                    // Limpar container HTML
                    const containerItens = document.getElementById('inventario-itens');
                    if (containerItens) {
                        containerItens.innerHTML = '';
                    }
                    const containerArmazenamentos = document.getElementById('inventario-armazenamentos');
                    if (containerArmazenamentos) {
                        containerArmazenamentos.innerHTML = '';
                    }
                    console.log('     ✅ Inventário resetado');
                } catch (e) {
                    console.warn('     ⚠️ Erro ao resetar Inventário:', e.message);
                }
            }
            
            // 👥 LIMPAR COMPANHEIROS
            if (window.companheirosManager) {
                console.log('   - Resetando Companheiros...');
                try {
                    if (window.companheirosManager.companheiros) {
                        window.companheirosManager.companheiros = [];
                    }
                } catch (e) {
                    console.warn('     ⚠️ Erro ao resetar Companheiros:', e.message);
                }
            }
            
            // 🎯 LIMPAR APTIDÕES
            if (window.aptidoesManager) {
                console.log('   - Resetando Aptidões...');
                try {
                    if (window.aptidoesManager.aptidoesPersonagem) {
                        window.aptidoesManager.aptidoesPersonagem = [];
                    }
                    if (window.aptidoesManager.configAptidoes) {
                        window.aptidoesManager.configAptidoes.ganhas = 0;
                    }
                } catch (e) {
                    console.warn('     ⚠️ Erro ao resetar Aptidões:', e.message);
                }
            }
            
            // 🧿 LIMPAR CONDIÇÕES
            if (window.sistemaCondicoes) {
                console.log('   - Resetando Condições...');
                try {
                    if (window.sistemaCondicoes.condicoesAtivas) {
                        window.sistemaCondicoes.condicoesAtivas = [];
                    }
                } catch (e) {
                    console.warn('     ⚠️ Erro ao resetar Condições:', e.message);
                }
            }
            
            // 🏋️ LIMPAR TREINAMENTO
            if (window.appState) {
                console.log('   - Resetando Treinamento...');
                try {
                    // Reset completo de todos 6 atributos
                    const treinamentoVazio = {
                        atributos: {
                            forca: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                            vitalidade: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                            agilidade: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                            percepcao: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                            inteligencia: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                            sorte: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 }
                        },
                        historico: []
                    };
                    window.appState.setState({ treinamento: treinamentoVazio });
                    console.log('     ✅ Treinamento resetado (appState)');
                } catch (e) {
                    console.warn('     ⚠️ Erro ao resetar Treinamento:', e.message);
                }
            }
            
            // Limpar também a UI do treinamento (grid)
            if (window.treinamentoManager && window.treinamentoManager.renderizarAtributos) {
                try {
                    const container = document.getElementById('treinamento-grid');
                    if (container) {
                        container.innerHTML = '';
                    }
                    console.log('     ✅ Grid de treinamento limpo');
                } catch (e) {
                    console.warn('     ⚠️ Erro ao limpar grid de treinamento:', e.message);
                }
            }
            
            // 🌌 LIMPAR CULTIVAÇÃO
            if (window.cultivacao && window.cultivacao.dados) {
                console.log('   - Resetando Cultivação...');
                try {
                    window.cultivacao.dados.reset?.();
                } catch (e) {
                    console.warn('     ⚠️ Erro ao resetar Cultivação:', e.message);
                }
            }
            
            if (window.statusConfigModal && window.statusConfigModal.state) {
                window.statusConfigModal.state.tempValues = {
                    hp: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
                    energy: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
                    fatigue: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
                };
            }
            if (window.statusBarsManager && window.statusBarsManager.state) {
                window.statusBarsManager.state.hp = { current: 0, max: 0, extra: 0, bonus: 0 };
                window.statusBarsManager.state.energy = { current: 0, max: 0, extra: 0, bonus: 0 };
                window.statusBarsManager.state.fatigue = { current: 0, max: 0, extra: 0, bonus: 0 };
            }
            if (window.reputacaoModal && window.reputacaoModal.tempValues) {
                window.reputacaoModal.tempValues = { mundo: 0, regiao: 0 };
            }
            console.log('✅ Flags e módulos removidos');

            // 6. VERIFICAÇÃO FINAL antes de reload
            console.log('🔍 Etapa 6: Verificação final...');
            const lsFinal = Object.keys(localStorage).length;
            const ssFinal = Object.keys(sessionStorage).length;
            console.log(`   localStorage: ${lsFinal} chaves (esperado 0)`);
            console.log(`   sessionStorage: ${ssFinal} chaves (esperado 0)`);

            if (lsFinal > 0 || ssFinal > 0) {
                console.log('⚠️ Dados reapareceram no storage; tentando limpar novamente...');
                localStorage.clear();
                sessionStorage.clear();
                const lsRetry = Object.keys(localStorage).length;
                const ssRetry = Object.keys(sessionStorage).length;
                console.log(`   Retry localStorage: ${lsRetry}, sessionStorage: ${ssRetry}`);
                if (lsRetry > 0 || ssRetry > 0) {
                    console.error('❌ ERRO: Storage ainda não ficou vazio após retry');
                    console.error('Chaves restantes localStorage:', Object.keys(localStorage));
                    console.error('Chaves restantes sessionStorage:', Object.keys(sessionStorage));
                    this.isRunning = false;
                    window.isLimpandoFicha = false;
                    return;
                }
                lsFinal = lsRetry;
                ssFinal = ssRetry;
            }

            if (lsFinal === 0 && ssFinal === 0) {
                console.log('✅ LIMPEZA CONFIRMADA - Storage vazio!');
                console.log('🔄 Recarregando página em 300ms...');
                
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            } else {
                console.error('❌ ERRO: Storage não ficou completamente vazio!');
                console.error(`localStorage: ${lsFinal}, sessionStorage: ${ssFinal}`);
                this.isRunning = false;
            }

        } catch (error) {
            console.error('❌ ERRO CRÍTICO:', error.message);
            console.error('Stack:', error.stack);
            this.isRunning = false;
        }
    }

    limparDOM() {
        // Atributos
        try {
            document.querySelectorAll('[data-atributo]').forEach(el => {
                const attr = el.getAttribute('data-atributo') || 'XXX';
                const sigla = attr.substring(0, 3).toUpperCase();
                el.innerHTML = `0<br><span>${sigla}</span>`;
            });
            console.log('   ✅ Atributos resetados');
        } catch (e) {
            console.warn('   ⚠️ Erro ao resetar atributos:', e.message);
        }

        // Inputs
        try {
            document.querySelectorAll('input, textarea').forEach(el => {
                el.value = '';
            });
            console.log('   ✅ Inputs limpos');
        } catch (e) {
            console.warn('   ⚠️ Erro ao limpar inputs:', e.message);
        }

        // Textos do personagem
        try {
            const textos = {
                'personagem-nome': 'Nome do Personagem',
                'personagem-titulo': 'Título',
                'personagem-classe': 'Classe',
                'personagem-raca': 'Raça'
            };
            
            for (let id in textos) {
                const el = document.getElementById(id);
                if (el) el.textContent = textos[id];
            }
            console.log('   ✅ Textos resetados');
        } catch (e) {
            console.warn('   ⚠️ Erro ao resetar textos:', e.message);
        }

        // Limpar containers
        try {
            const containers = [
                'arts-nucleos-list',
                'rpg-content-habilidades',
                'inventario-itens',
                'aptidoes-container',
                'companheiros-list',
                'condiciones-ativas'
            ];

            containers.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });
            console.log('   ✅ Containers limpos');
        } catch (e) {
            console.warn('   ⚠️ Erro ao limpar containers:', e.message);
        }

        // Limpar barras de status (HP, Energia, Fadiga)
        try {
            const barras = ['hp', 'energy', 'fatigue'];
            barras.forEach(tipo => {
                // Resetar os valores visuais
                const textEl = document.getElementById(`${tipo}-text`);
                const fillEl = document.getElementById(`${tipo}-fill`);
                
                if (textEl) textEl.textContent = '0 / 0';
                if (fillEl) {
                    fillEl.style.width = '0%';
                    fillEl.classList.add('is-empty');
                }
            });
            console.log('   ✅ Barras de status resetadas');
        } catch (e) {
            console.warn('   ⚠️ Erro ao resetar barras de status:', e.message);
        }

        // Limpar imagem do personagem
        try {
            const imgEl = document.getElementById('personagem-imagem');
            if (imgEl) {
                imgEl.src = '';
                imgEl.style.backgroundImage = 'none';
            }
            console.log('   ✅ Imagem do personagem removida');
        } catch (e) {
            console.warn('   ⚠️ Erro ao limpar imagem:', e.message);
        }
    }

    diagnostico() {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  🔍 DIAGNÓSTICO - LIMPAR FICHA ISOLADO                     ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        const btn = document.getElementById('btn-limpar-ficha');
        console.log('🔹 Botão "Limpar Ficha":');
        console.log('   - Existe:', btn ? '✅ SIM' : '❌ NÃO');
        if (btn) {
            console.log('   - Visível:', btn.offsetParent !== null ? '✅ SIM' : '❌ NÃO');
            console.log('   - Desabilitado:', btn.disabled ? '⚠️ SIM' : '✅ NÃO');
        }

        console.log('\n🔹 Instância:');
        console.log('   - Existe:', window.limparFichaIsolado ? '✅ SIM' : '❌ NÃO');
        if (window.limparFichaIsolado) {
            console.log('   - isRunning:', window.limparFichaIsolado.isRunning);
        }

        console.log('\n🔹 localStorage:');
        console.log('   - Chaves:', Object.keys(localStorage).length);

        console.log('\n🔹 sessionStorage:');
        console.log('   - Chaves:', Object.keys(sessionStorage).length);

        console.log('\n╚════════════════════════════════════════════════════════════╝\n');
    }

    testeClique() {
        console.log('🧪 [Teste] Simulando clique no botão...');
        const btn = document.getElementById('btn-limpar-ficha');
        if (btn) {
            console.log('   ✅ Botão encontrado, disparando clique');
            btn.click();
        } else {
            console.error('   ❌ Botão não encontrado!');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

console.log('📍 [LimparFichaIsolado] Script carregado. Estado do DOM:', document.readyState);

let instanciaLimparFicha = null;

function inicializarLimparFicha() {
    if (!instanciaLimparFicha) {
        console.log('🚀 [LimparFichaIsolado] Criando instância...');
        instanciaLimparFicha = new LimparFichaIsolado();
        window.limparFichaIsolado = instanciaLimparFicha;
    }
}

// Tentar inicializar imediatamente
if (document.body) {
    inicializarLimparFicha();
}

// Também tentar no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📍 [LimparFichaIsolado] DOMContentLoaded acionado');
    inicializarLimparFicha();
});

// Fallback: tentar a cada 100ms até encontrar o botão
const checkInterval = setInterval(() => {
    if (document.getElementById('btn-limpar-ficha')) {
        console.log('✅ [LimparFichaIsolado] Botão detectado no fallback');
        inicializarLimparFicha();
        clearInterval(checkInterval);
    }
}, 100);

// Parar de verificar depois de 5 segundos
setTimeout(() => {
    clearInterval(checkInterval);
    if (instanciaLimparFicha) {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  🧹 LIMPAR FICHA ISOLADO - PRONTO!                         ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('\n📟 COMANDOS DE DEBUG (cole no console do navegador):');
        console.log('   • window.limparFichaIsolado.diagnostico()');
        console.log('   • window.limparFichaIsolado.testeClique()');
        console.log('   • window.limparFichaIsolado.executar()');
        console.log('\n');
    }
}, 5000);
