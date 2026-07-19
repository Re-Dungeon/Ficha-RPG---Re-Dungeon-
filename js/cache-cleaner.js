/**
 * 🧹 CACHE-CLEANER.JS
 * 
 * Sistema centralizado para limpar TODAS as chaves de localStorage
 * Garante que ao resetar cache, TUDO seja deletado, não deixando resquícios
 * 
 * USO: window.cacheCleaner.limparTudo()
 */

class CacheCleaner {
    constructor() {
        console.log('🧹 CacheCleaner inicializado');
        
        // Mapa COMPLETO de todas as chaves que a aplicação usa
        this.todasAsChaves = {
            // ===== GLOBALSSTATE =====
            'redungeon_state': '🌍 GlobalState Principal',
            'redungeon_auto_backup': '💾 Auto-backup V3',
            'redungeon_last_save_time': '⏰ Timestamp último save',
            'redungeon_import_backup': '📥 Backup pré-importação',
            'redungeon_import_timestamp': '⏰ Timestamp importação',
            
            // ===== ARTS/HABILIDADES (StorageManager) =====
            'redungeon_character': '⚔️ Character completo (arts)',
            'redungeon_character_backup': '⚔️ Backup character',
            'redungeon_arts': '⚔️ Habilidades/Arts',
            'redungeon_ficha_arts': '⚔️ Arts da Ficha',
            'redungeon_notifications': '🔔 Notificações arts',
            
            // ===== INVENTÁRIO =====
            'redungeon_ficha_inventario': '🎒 Inventário',
            
            // ===== TREINAMENTO =====
            'redungeon_ficha_treinamento': '📚 Treinamento/XP',
            
            // ===== COMPANHEIROS =====
            'redungeon_companheiros': '🐾 Companheiros',
            
            // ===== CULTIVAÇÃO =====
            'redungeon_ficha_cultivacao': '🌾 Cultivação',
            'redungeon_cultivacao': '🌾 Cultivação Legacy',
            'cultivacao_dados': '🌾 Cultivação Dados',
            
            // ===== CORPO IMORTAL =====
            'redungeon_ficha_corpo_imortal': '💪 Corpo Imortal',
            'corpoImortalData': '💪 Corpo Imortal Dados',
            'corpo-imortal-ultima-sincronizacao': '⏰ Corpo Imortal Sync',
            
            // ===== MERIDIANOS E TRIBULAÇÃO =====
            'redungeon_ficha_meridianos': '🔗 Meridianos',
            'redungeon_ficha_tribulacao': '⚡ Tribulação',
            
            // ===== ATRIBUTOS E STATUS =====
            'redungeon_ficha_atributos': '💪 Atributos',
            'redungeon_ficha_status': '❤️ Status (HP/Energia)',
            
            // ===== APTIDÕES =====
            'redungeon_ficha_aptidoes': '🎯 Aptidões',
            
            // ===== REPUTAÇÃO =====
            'redungeon_ficha_reputacao': '⭐ Reputação',
            
            // ===== IMAGENS =====
            'redungeon_personagem_imagem': '🖼️ Imagem Personagem',
            
            // ===== NAVEGAÇÃO =====
            'redungeon_ficha_rota_vertical': '🗺️ Rota Vertical',
            'rota_vertical': '🗺️ Rota Vertical Legacy',
            
            // ===== TEMA E CONFIGURAÇÕES =====
            'tema': '🌙 Tema (escuro/claro)',
            'volume': '🔊 Volume',
            'idioma': '🌐 Idioma',
            'autoSalvar': '💾 Auto-salvar',
            
            // ===== RACE/CLASSE =====
            'redungeon_classe_selecionada': '🎭 Classe Selecionada',
            'redungeon_raca_selecionada': '👥 Raça Selecionada',
            
            // ===== RACE HABILIDADES =====
            // Padrão: raca-habilidades-${id}
            // Será deletado com pattern
            
            // ===== SORTE =====
            'redungeon_fortuna_atual': '🍀 Fortuna Atual',
            'redungeon_bonus_sorte': '🍀 Bonus Sorte',
            'redungeon_ultima_rolagem_sorte': '🍀 Última Rolagem',
            
            // ===== LOJA TRAPAÇA =====
            'loja-trapaça-compras': '🏪 Loja Trapaça Compras',
            'loja-trapaça-efeitos-ativos': '🏪 Loja Trapaça Efeitos',
            
            // ===== COMPANHEIRO BONUS =====
            // Padrão: companheiro-bonus-${id}
            // Será deletado com pattern
            
            // ===== COMPANHEIRO INVENTÁRIO =====
            // Padrão: companheiroInventario_${id}
            // Será deletado com pattern
            
            // ===== COMPANHEIRO ARTS =====
            // Padrão: companheiro-arts-${id}
            // Será deletado com pattern
        };
    }

    /**
     * 🧹 LIMPAR TUDO DO CACHE
     * Deleta TODAS as chaves conhecidas e patterns
     */
    limparTudo() {
        console.log('\n🧹 INICIANDO LIMPEZA COMPLETA DO CACHE...\n');
        
        let contagem = 0;
        const chavesDeletadas = [];

        // 1️⃣ Deletar chaves conhecidas
        for (const [chave, descricao] of Object.entries(this.todasAsChaves)) {
            if (localStorage.getItem(chave)) {
                localStorage.removeItem(chave);
                contagem++;
                chavesDeletadas.push(`✅ ${descricao} → ${chave}`);
                console.log(`✅ Deletado: ${descricao}`);
            }
        }

        // 2️⃣ Deletar padrões dinâmicos
        const patterns = [
            { pattern: /^raca-habilidades-/, desc: '🎯 Habilidades de Raça' },
            { pattern: /^companheiro-bonus-/, desc: '🎁 Bonus Companheiro' },
            { pattern: /^companheiroInventario_/, desc: '🎒 Inventário Companheiro' },
            { pattern: /^companheiro-arts-/, desc: '⚔️ Arts Companheiro' },
            { pattern: /^redungeon_/, desc: '🔑 Chave Redungeon (catch-all)' }
        ];

        for (const { pattern, desc } of patterns) {
            for (let i = 0; i < localStorage.length; i++) {
                const chave = localStorage.key(i);
                if (chave && pattern.test(chave)) {
                    localStorage.removeItem(chave);
                    contagem++;
                    chavesDeletadas.push(`✅ ${desc} → ${chave}`);
                    console.log(`✅ Deletado (pattern): ${desc} → ${chave}`);
                    
                    // Reiniciar loop pois removemos um item
                    i--;
                }
            }
        }

        console.log(`\n✅ LIMPEZA CONCLUÍDA: ${contagem} chaves deletadas\n`);
        console.log('📋 Chaves deletadas:');
        chavesDeletadas.forEach(msg => console.log('   ' + msg));

        // 3️⃣ Disparar evento de limpeza
        window.dispatchEvent(new CustomEvent('cacheCleared', { detail: { count: contagem } }));

        // 4️⃣ Mostrar IndexedDB também será limpo?
        console.log('\n⚠️ IMPORTANTE:');
        console.log('   Se você também deseja limpar IndexedDB (imagens):');
        console.log('   Execute: window.cacheCleaner.limparIndexedDB()');

        return {
            sucesso: true,
            chavesDeletadas: contagem,
            detalhes: chavesDeletadas
        };
    }

    /**
     * 🧹 LIMPAR INDEXEDDB (imagens do personagem e companheiros)
     */
    async limparIndexedDB() {
        console.log('\n🧹 LIMPANDO IndexedDB...\n');
        
        const databases = ['redungeon_imagens', 'imagemStorage', 'imagesDB'];
        
        for (const dbName of databases) {
            try {
                const request = indexedDB.deleteDatabase(dbName);
                
                request.onsuccess = () => {
                    console.log(`✅ IndexedDB deletado: ${dbName}`);
                };
                
                request.onerror = () => {
                    console.warn(`⚠️ Erro ao deletar: ${dbName}`);
                };
            } catch (e) {
                console.warn(`⚠️ Erro ao acessar IndexedDB ${dbName}:`, e);
            }
        }

        console.log('\n✅ Limpeza de IndexedDB iniciada\n');
    }

    /**
     * 📊 RELATORIO DETALHADO DO CACHE
     * Mostra o que está armazenado no localStorage
     */
    relatorioCacheAtual() {
        console.log('\n📊 RELATÓRIO DO CACHE ATUAL\n');
        
        const relatorio = {
            totalChaves: localStorage.length,
            tamanhoEstimado: 0,
            chaves: []
        };

        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            const valor = localStorage.getItem(chave);
            const tamanho = (valor?.length || 0) * 2; // bytes (aproximado)
            
            relatorio.tamanhoEstimado += tamanho;
            relatorio.chaves.push({
                chave,
                tamanho: `${(tamanho / 1024).toFixed(2)} KB`,
                preview: valor?.substring(0, 50) + (valor?.length > 50 ? '...' : '')
            });
        }

        // Ordenar por tamanho (maior primeiro)
        relatorio.chaves.sort((a, b) => parseFloat(b.tamanho) - parseFloat(a.tamanho));

        console.log(`Total de chaves: ${relatorio.totalChaves}`);
        console.log(`Tamanho total estimado: ${(relatorio.tamanhoEstimado / 1024).toFixed(2)} KB`);
        console.log('\nDetalhes:');
        relatorio.chaves.forEach(({ chave, tamanho, preview }) => {
            console.log(`  ${chave} (${tamanho})`);
            console.log(`    Preview: ${preview}`);
        });

        return relatorio;
    }

    /**
     * 🔄 SINCRONIZAR: Limpar + Recriar estado padrão
     * Útil para "hard reset" completo
     */
    hardReset() {
        console.log('\n⚠️ EXECUTANDO HARD RESET COMPLETO...\n');
        
        // 1. Limpar localStorage
        this.limparTudo();

        // 2. Se GlobalState existe, resetar para padrão
        if (window.globalState) {
            window.globalState.resetState();
            console.log('✅ GlobalState resetado para padrão');
        }

        // 3. Recarregar página
        console.log('\n✨ Página será recarregada em 2 segundos...\n');
        setTimeout(() => {
            location.reload();
        }, 2000);
    }

    /**
     * 📋 LISTAR TODAS AS CHAVES CONHECIDAS
     */
    listarChavesConhecidas() {
        console.log('\n📋 CHAVES CONHECIDAS DO SISTEMA\n');
        
        for (const [chave, descricao] of Object.entries(this.todasAsChaves)) {
            const existe = localStorage.getItem(chave) ? '✅' : '❌';
            console.log(`${existe} ${descricao.padEnd(40)} → ${chave}`);
        }

        console.log('\n📌 Padrões dinâmicos:');
        console.log('   raca-habilidades-${id}');
        console.log('   companheiro-bonus-${id}');
        console.log('   companheiroInventario_${id}');
        console.log('   companheiro-arts-${id}');
    }
}

// ✅ Criar instância global
window.cacheCleaner = new CacheCleaner();
console.log('✅ CacheCleaner disponível em window.cacheCleaner');

// 📋 Funções de atalho para console
window.limparCache = () => window.cacheCleaner.limparTudo();
window.relatorioCache = () => window.cacheCleaner.relatorioCacheAtual();
window.hardResetApp = () => window.cacheCleaner.hardReset();
window.listarChaves = () => window.cacheCleaner.listarChavesConhecidas();

console.log('\n🎯 ATALHOS DISPONÍVEIS:');
console.log('   window.limparCache() → Deleta TODAS as chaves');
console.log('   window.relatorioCache() → Mostra o que está armazenado');
console.log('   window.hardResetApp() → Reset completo + reload');
console.log('   window.listarChaves() → Lista todas as chaves conhecidas');
