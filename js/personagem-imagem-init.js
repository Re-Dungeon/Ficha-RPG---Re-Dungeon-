/* ============================================================= */
/* PERSONAGEM-IMAGEM-INIT.JS                                    */
/* Garante que a imagem do personagem seja carregada no F5      */
/* ============================================================= */

/**
 * Essa classe garante que a imagem seja restaurada IMEDIATAMENTE
 * quando a página carrega, sem depender de timings complexos
 */
class PersonagemImagemInit {
    static async restaurarImagemF5() {
        console.log('🖼️ [F5-INIT] Iniciando restauração de imagem...');
        
        const imagemElem = document.getElementById('personagem-imagem');
        if (!imagemElem) {
            console.warn('⚠️ Elemento #personagem-imagem não encontrado');
            return;
        }

        try {
            // Estratégia 1: Tentar localStorage primeiro (rápido)
            let imagemData = null;
            
            if (window.localStorageManager) {
                try {
                    console.log('📂 [F5-INIT] Buscando em localStorage...');
                    imagemData = window.localStorageManager.loadPersonagemImagem();
                    
                    if (imagemData && imagemData.dataUrl) {
                        console.log('✅ [F5-INIT] Imagem encontrada em localStorage (base64)');
                        imagemElem.src = imagemData.dataUrl;
                        return; // Sucesso!
                    }
                } catch (e) {
                    console.warn('⚠️ [F5-INIT] Erro ao buscar localStorage:', e.message);
                }
            }

            // Estratégia 2: Se localStorage tem referência mínima, buscar IndexedDB
            if (window.localStorageManager && typeof ImagemStorageManager !== 'undefined') {
                try {
                    console.log('📂 [F5-INIT] Buscando referência mínima no localStorage...');
                    imagemData = window.localStorageManager.loadPersonagemImagemMinimal();
                    
                    if (imagemData && imagemData._id) {
                        console.log('📂 [F5-INIT] Referência encontrada, carregando do IndexedDB:', imagemData._id);
                        const imagemComprimida = await ImagemStorageManager.carregarImagem(imagemData._id);
                        
                        if (imagemComprimida) {
                            console.log('✅ [F5-INIT] Imagem carregada do IndexedDB');
                            imagemElem.src = imagemComprimida;
                            return; // Sucesso!
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ [F5-INIT] Erro ao buscar IndexedDB:', e.message);
                }
            }

            // Estratégia 3: Se nada funcionou, tentar restaurarDoIndexedDB do handler
            if (window.personagemImageHandler && typeof window.personagemImageHandler.restaurarDoIndexedDB === 'function') {
                console.log('📂 [F5-INIT] Tentando handler.restaurarDoIndexedDB()...');
                await window.personagemImageHandler.restaurarDoIndexedDB();
                return;
            }

            console.log('ℹ️ [F5-INIT] Nenhuma imagem salva encontrada (primeira vez?)');

        } catch (error) {
            console.error('❌ [F5-INIT] Erro crítico ao restaurar imagem:', error);
        }
    }

    /**
     * Iniciar restauração assim que possível
     */
    static init() {
        // Se DOM já está pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    PersonagemImagemInit.restaurarImagemF5();
                }, 100);
            });
        } else {
            // DOM já estava pronto
            setTimeout(() => {
                PersonagemImagemInit.restaurarImagemF5();
            }, 100);
        }
    }
}

// Iniciar automaticamente
PersonagemImagemInit.init();

console.log('✅ PersonagemImagemInit carregado e ativo');
