/* ============================================================================ */
/* GERENCIAR-APTIDOES-COMPANHEIRO.JS - Popup Simples com Catálogo            */
/* Mostra TODAS as aptidões disponíveis em um popup simples                  */
/* ============================================================================ */

/**
 * Abre um popup simples mostrando todas as aptidões disponíveis
 */
async function abrirPopupAptidoesCompanheiro() {
    console.log('🐾 [PopupAptidoesCompanheiro] Abrindo popup de aptidões...');

    // Aguardar AptidoesManager e AptidoesDB
    let tentativas = 0;
    while ((!window.aptidoesManager || !window.aptidoesDB) && tentativas < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        tentativas++;
    }

    if (!window.aptidoesManager || !window.aptidoesDB) {
        console.error('❌ Managers não disponíveis');
        alert('❌ Erro: Sistema de aptidões não carregado');
        return;
    }

    // Obter catálogo de aptidões
    let aptidoes = window.aptidoesManager?.catalogo || [];
    
    // Se catálogo vazio, tentar obter do DB diretamente
    if (aptidoes.length === 0) {
        console.log('⏳ Catálogo vazio, tentando obter do DB...');
        try {
            aptidoes = await window.aptidoesDB.getCatalogo() || [];
        } catch (e) {
            console.error('❌ Erro ao obter catálogo do DB:', e);
        }
    }

    // Se ainda vazio, tentar método completo
    if (aptidoes.length === 0 && typeof window.aptidoesDB.getCatalogoCompleto === 'function') {
        console.log('⏳ Tentando getCatalogoCompleto...');
        aptidoes = window.aptidoesDB.getCatalogoCompleto() || [];
    }

    console.log('📚 Total de aptidões disponíveis:', aptidoes.length);

    if (aptidoes.length === 0) {
        console.error('❌ Nenhuma aptidão encontrada no catálogo');
        alert('⚠️ Nenhuma aptidão disponível no catálogo.\n\nCarregue o catálogo de aptidões na página.');
        return;
    }

    // Contar aptidões do companheiro - ler DIRETAMENTE do DOM da aba de aptidões
    let ganhas = 0;
    let maximo = 3;
    let atributoExtra = '—';
    let atual = 0;
    
    // Ler os valores DOS CAMPOS REAIS na aba de aptidões do companheiro
    const elemCompMaximo = document.querySelector('#comp-aptidoes-maximo');
    const elemCompAtributo = document.querySelector('#comp-aptidoes-atributo-proxima');
    const elemCompAtual = document.querySelector('#comp-aptidoes-atual');
    const elemCompGanhas = document.querySelector('#comp-aptidoes-ganhas');
    
    if (elemCompMaximo) {
        maximo = parseInt(elemCompMaximo.textContent) || 3;
        console.log('✅ Máximo lido da aba:', maximo);
    }
    if (elemCompAtributo) {
        atributoExtra = elemCompAtributo.textContent || '—';
        console.log('✅ Atributo p/+1 lido da aba:', atributoExtra);
    }
    if (elemCompAtual) {
        atual = parseInt(elemCompAtual.textContent) || 0;
        console.log('✅ Atual lido da aba:', atual);
    }
    if (elemCompGanhas) {
        ganhas = parseInt(elemCompGanhas.textContent) || 0;
        console.log('✅ Ganhas lido da aba:', ganhas);
    }
    
    let ganhar = maximo - atual;

    // Criar popup HTML temporário
    let html = `
        <div id="popup-aptidoes-temp" class="popup-aptidoes-overlay">
            <div class="popup-aptidoes-backdrop"></div>
            <div class="popup-aptidoes-container">
                <!-- Header -->
                <div class="popup-aptidoes-header">
                    <h2>📚 Catálogo de Aptidões</h2>
                    <button class="popup-aptidoes-close">✕</button>
                </div>

                <!-- Estatísticas -->
                <div class="popup-stats-container">
                    <div class="popup-stat-card">
                        <div class="popup-stat-value" id="popup-stat-atual">${atual}</div>
                        <div class="popup-stat-label">ATUAIS</div>
                    </div>
                    <div class="popup-stat-card">
                        <div class="popup-stat-value" id="popup-stat-ganhas">${ganhas}</div>
                        <div class="popup-stat-label">GANHAS</div>
                    </div>
                    <div class="popup-stat-card">
                        <div class="popup-stat-value" id="popup-stat-maximo">${maximo}</div>
                        <div class="popup-stat-label">MÁXIMO</div>
                    </div>
                    <div class="popup-stat-card">
                        <div class="popup-stat-value" id="popup-stat-atributo">${atributoExtra}</div>
                        <div class="popup-stat-label">+1 ATRIBUTO</div>
                    </div>
                </div>

                <!-- Filtro -->
                <div class="popup-aptidoes-filtro">
                    <input type="text" 
                           class="popup-filtro-input" 
                           placeholder="🔍 Filtrar...">
                </div>

                <!-- Grid de Aptidões -->
                <div class="popup-aptidoes-grid">
    `;

    // Adicionar cards
    aptidoes.forEach(apt => {
        html += `
            <div class="popup-aptidao-card" data-apt-id="${apt.id}" data-apt-nome="${apt.nome}">
                <div class="popup-card-image">
                    ${apt.imagem ? `<img src="${apt.imagem}" alt="${apt.nome}">` : '<div class="popup-card-placeholder">🎯</div>'}
                </div>
                <div class="popup-card-name">${apt.nome}</div>
            </div>
        `;
    });

    html += `
                </div>

                <!-- Footer -->
                <div class="popup-aptidoes-footer">
                    <button class="popup-btn-salvar">SALVAR</button>
                    <button class="popup-btn-cancelar">CANCELAR</button>
                </div>
            </div>
        </div>
    `;

    // Inserir no DOM
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    // Setup listeners
    const popup = document.getElementById('popup-aptidoes-temp');
    const btnClose = popup.querySelector('.popup-aptidoes-close');
    const backdrop = popup.querySelector('.popup-aptidoes-backdrop');
    const filtroInput = popup.querySelector('.popup-filtro-input');
    const cards = popup.querySelectorAll('.popup-aptidao-card');
    const btnSalvar = popup.querySelector('.popup-btn-salvar');
    const btnCancelar = popup.querySelector('.popup-btn-cancelar');

    let selecionadas = new Set();

    // Clicar em card para selecionar
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.aptId;
            if (selecionadas.has(id)) {
                selecionadas.delete(id);
                card.classList.remove('selected');
            } else {
                selecionadas.add(id);
                card.classList.add('selected');
            }
        });
    });

    // Fechar ao clicar X
    btnClose.addEventListener('click', () => {
        popup.remove();
        // Limpar companheiro temporário ao fechar
        if (document.getElementById('modalNovoCompanheiro').style.display === 'none') {
            window.companheiro_temp = null;
        }
    });

    // Fechar ao clicar fora
    backdrop.addEventListener('click', () => {
        popup.remove();
        // Limpar companheiro temporário ao fechar
        if (document.getElementById('modalNovoCompanheiro').style.display === 'none') {
            window.companheiro_temp = null;
        }
    });

    // Cancelar
    btnCancelar.addEventListener('click', () => {
        popup.remove();
        // Limpar companheiro temporário ao fechar
        if (document.getElementById('modalNovoCompanheiro').style.display === 'none') {
            window.companheiro_temp = null;
        }
    });

    // Salvar
    btnSalvar.addEventListener('click', async () => {
        console.log('💾 Salvando aptidões selecionadas:', Array.from(selecionadas));
        
        if (selecionadas.size === 0) {
            alert('⚠️ Selecione pelo menos uma aptidão!');
            return;
        }

        try {
            // Obter o companheiro do modal
            let companheiro = null;
            const modalAberto = document.getElementById('modalNovoCompanheiro');
            
            if (modalAberto && modalAberto.style.display !== 'none') {
                // Companheiro está no modal - coletar dados
                const nomeInput = document.querySelector('#comp-char-nome');
                if (nomeInput && nomeInput.value) {
                    // Tentar obter do window primeiro (pode ter sido criado antes)
                    if (window.companheiro_temp && window.companheiro_temp.nome === nomeInput.value) {
                        companheiro = window.companheiro_temp;
                        console.log('✅ Companheiro recuperado da memória');
                    } else {
                        // Criar novo companheiro
                        companheiro = {
                            nome: nomeInput.value,
                            aptidoes: [],
                            vantagens: []
                        };
                        // Salvar na memória para próximas vezes
                        window.companheiro_temp = companheiro;
                        console.log('✅ Novo companheiro criado');
                    }
                }
            } else if (window.companheirosManager) {
                // Tentar do manager
                companheiro = window.companheirosManager.companheiro || window.companheirosManager.atual;
            }

            if (!companheiro) {
                alert('❌ Nenhum companheiro selecionado');
                return;
            }

            if (!companheiro.aptidoes) companheiro.aptidoes = [];
            if (!companheiro.vantagens) companheiro.vantagens = [];

            console.log('🐾 Companheiro:', companheiro.nome || 'Sem nome');
            console.log('📚 Aptidões atuais:', companheiro.aptidoes.length);

            // Obter limite máximo de pontos
            const elemCompMaximo = document.querySelector('#comp-aptidoes-maximo');
            const maximo = elemCompMaximo ? parseInt(elemCompMaximo.textContent) || 3 : 3;
            
            // Calcular total de níveis atual
            const totalNiveisAtual = companheiro.aptidoes.reduce((sum, apt) => sum + apt.nivel, 0);
            console.log(`📊 Total de níveis atual: ${totalNiveisAtual}, Máximo: ${maximo}`);

            // Adicionar aptidões selecionadas
            let adicionadas = 0;
            let naoAdicionadas = 0;
            
            selecionadas.forEach(aptidaoId => {
                const jaTemAptidao = companheiro.aptidoes.some(a => a.id === aptidaoId);
                if (!jaTemAptidao) {
                    // Verificar se tem espaço (cada nova aptidão começa com nível 1)
                    if (totalNiveisAtual + adicionadas + 1 <= maximo) {
                        const aptidao = aptidoes.find(a => a.id === aptidaoId);
                        if (aptidao) {
                            companheiro.aptidoes.push({
                                id: aptidaoId,
                                nome: aptidao.nome,
                                nivel: 1,
                                imagem: aptidao.imagem || ''
                            });
                            console.log(`✅ Aptidão adicionada: ${aptidao.nome}`);
                            adicionadas++;
                        }
                    } else {
                        console.warn(`⚠️ Limite de pontos atingido. Não foi possível adicionar mais aptidões.`);
                        naoAdicionadas++;
                    }
                }
            });

            // Mostrar aviso se não conseguiu adicionar todas
            if (naoAdicionadas > 0) {
                alert(`⚠️ Limite de pontos atingido!\n\nConseguiu adicionar: ${adicionadas}\nNão conseguiu: ${naoAdicionadas}`);
            }

            // Renderizar Aptidões Adquiridas
            const listAptidoes = document.querySelector('#comp-aptidoes-personagem-list');
            if (listAptidoes && companheiro.aptidoes.length > 0) {
                let html = '';
                
                // Header
                html += `
                    <div class="comp-aptidoes-personagem-header">
                        <div class="comp-aptidoes-header-col col-nome">Aptidão</div>
                        <div class="comp-aptidoes-header-col col-nivel">Nível</div>
                        <div class="comp-aptidoes-header-col col-bonus">Bônus</div>
                        <div class="comp-aptidoes-header-col col-acoes">Ações</div>
                    </div>
                `;
                
                // Rows
                companheiro.aptidoes.forEach((apt) => {
                    // Calcular bonus: +1 a cada nivel PAR (2,4,6 = +1, +2, +3)
                    const bonusAmount = Math.floor(apt.nivel / 2);
                    const bonusText = bonusAmount > 0 ? `+${bonusAmount}` : '—';
                    
                    html += `
                        <div class="comp-aptidoes-personagem-row" data-aptidao-id="${apt.id}">
                            <div class="comp-aptidoes-col col-nome">${apt.nome}</div>
                            <div class="comp-aptidoes-col col-nivel">${apt.nivel}</div>
                            <div class="comp-aptidoes-col col-bonus">${bonusText}</div>
                            <div class="comp-aptidoes-col col-acoes">
                                <button class="comp-aptidoes-action-btn" data-action="upgrade" data-id="${apt.id}" title="Aumentar nível">⬆️</button>
                                <button class="comp-aptidoes-action-btn" data-action="reset" data-id="${apt.id}" title="Resetar para nível 1">🔄</button>
                                <button class="comp-aptidoes-action-btn" data-action="remove" data-id="${apt.id}" title="Remover aptidão">❌</button>
                            </div>
                        </div>
                    `;
                });
                listAptidoes.innerHTML = html;
                
                // Adicionar event listeners para os botões
                setupCompanheiroAptidoesActions(listAptidoes, companheiro);
            }

            // ✅ NOTA: Renderização de vantagens agora é feita em companheiros-modal.js
            // quando o modal é aberto. Deixe este código comentado para evitar duplicação.
            
            /*
            // Renderizar Vantagens Desbloqueadas [DEPRECATED - agora em companheiros-modal.js]
            const listVantagens = document.querySelector('#comp-aptidoes-vantagens-list');
            if (listVantagens) {
                let html = '';
                
                // Obter sistema de vantagens
                const vantagensSystem = typeof window.vantagensAptidoesSystem !== 'undefined' ? 
                    window.vantagensAptidoesSystem : null;
                
                if (!vantagensSystem) {
                    console.warn('⚠️ Sistema de vantagens não disponível');
                    listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Sistema de vantagens não disponível</div>';
                } else {
                    // Coletar vantagens dos níveis 1, 3, 5
                    const vantagens = [];
                    const vantagensAptidoes = vantagensSystem.vantagensAptidoes;
                    
                    companheiro.aptidoes.forEach(apt => {
                        const aptidaoId = apt.id;
                        const nivelAtual = apt.nivel;
                        const aptidaoVantagens = vantagensAptidoes[aptidaoId];
                        
                        if (!aptidaoVantagens) return;
                        
                        // Mostrar apenas níveis 1, 3, 5 que estão desbloqueados
                        const niveisAMostrar = [1, 3, 5].filter(n => n <= nivelAtual);
                        
                        niveisAMostrar.forEach(nivel => {
                            const vantagem = aptidaoVantagens[nivel];
                            if (!vantagem) return;
                            
                            vantagens.push({
                                aptidaoId,
                                aptidaoNome: apt.nome,
                                nivel,
                                tipo: vantagem.tipo,
                                valor: vantagem.valor,
                                valorOpcional: vantagem.valorOpcional
                            });
                        });
                    });
                    
                    // ✅ NOVO: Carregar estado de bônus opcionais do companheiro
                    if (window.bonusOpcionalCompanheiro) {
                        window.bonusOpcionalCompanheiro.carregarEstado(companheiro.id);
                        console.log(`📂 Estado de bônus opcionais carregado para companheiro ${companheiro.id}`);
                    }

                    // Renderizar cards de vantagens
                    if (vantagens.length === 0) {
                        html = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
                    } else {
                        vantagens.forEach(vant => {
                            const tipoEmojis = {
                                'bonus': '💰',
                                'bonus-duplo': '⚡',
                                'bonus-percentual': '📊',
                                'bonus-opcional': '🔁',
                                'efeito': '📝'
                            };
                            const emoji = tipoEmojis[vant.tipo] || '•';
                            
                            // ✅ NOVO: Para bonus-opcional, obter o valor atual armazenado
                            let textoEfeito = vant.valor;
                            if (vant.tipo === 'bonus-opcional' && vant.valorOpcional) {
                                const ativoAtualmente = window.bonusOpcionalCompanheiro?.getBonusAtivo?.(companheiro.id, vant.aptidaoId, vant.nivel) || 'valor';
                                textoEfeito = ativoAtualmente === 'valor' ? vant.valor : vant.valorOpcional;
                                console.log(`📊 [DEBUG] Bonus opcional ${vant.aptidaoId} nível ${vant.nivel}: ativo=${ativoAtualmente}, texto=${textoEfeito}`);
                            }
                            
                            html += `
                                <div class="comp-vantagem-card ${vant.tipo}">
                                    <div class="comp-vantagem-header">
                                        <span class="comp-vantagem-nome">${emoji} ${vant.aptidaoNome} - Nível ${vant.nivel}</span>
                                    </div>
                                    <div class="comp-vantagem-valor">${textoEfeito}</div>
                            `;
                            
                            // ✅ NOVO: Se é bônus opcional, renderizar botão de alternância
                            if (vant.tipo === 'bonus-opcional' && vant.valorOpcional) {
                                const ativoAtualmente = window.bonusOpcionalCompanheiro?.getBonusAtivo?.(companheiro.id, vant.aptidaoId, vant.nivel) || 'valor';
                                const textoAtivo = ativoAtualmente === 'valor' ? vant.valor : vant.valorOpcional;
                                
                                html += `
                                    <div class="comp-vantagem-acoes">
                                        <button class="btn-alternar-bonus-opcional-companheiro" 
                                                data-companheiro-id="${companheiro.id}"
                                                data-aptidao-id="${vant.aptidaoId}" 
                                                data-nivel="${vant.nivel}"
                                                title="Alternar entre: ${vant.valor} e ${vant.valorOpcional}">
                                          🔁 ${textoAtivo}
                                        </button>
                                    </div>
                                `;
                            }
                            
                            html += `</div>`;
                        });
                    }
                    
                    listVantagens.innerHTML = html;
                    
                    // ✅ NOVO: Configurar event listeners para botões de alternância
                    setupListenersAlternanciaCompanheiro(listVantagens, companheiro);
                }
            } // FIM BLOCO DEPRECATED
            */

            // Atualizar contador
            const elemCompAtual = document.querySelector('#comp-aptidoes-atual');
            if (elemCompAtual) {
                const totalNiveis = companheiro.aptidoes.reduce((sum, apt) => sum + apt.nivel, 0);
                elemCompAtual.textContent = totalNiveis.toString();
            }

            console.log(`✅ ${adicionadas} aptidão(ões) salva(s) com sucesso!`);
            alert(`✅ ${adicionadas} aptidão(ões) adicionada(s) com sucesso!`);
            popup.remove();
            
            // Aplicar bônus das aptidões
            if (window.companheirosModalController) {
                window.companheirosModalController.aplicarBonusAptidoesCompanheiro(companheiro);
                console.log('✅ Bônus de aptidões aplicados');
            }
            
            // Atualizar modal se estiver aberto
            if (window.companheirosModalController) {
                window.companheirosModalController.atualizarInfoAptidoesCompanheiro();
                console.log('✅ Modal atualizado com novo ATUAL');
            }

            // 🔥 RENDERIZAR VANTAGENS DESBLOQUEADAS IMEDIATAMENTE
            if (window.companheirosModalController && adicionadas > 0) {
                try {
                    window.companheirosModalController.renderizarVantagensDesbloqueadas(companheiro);
                    console.log('🔥 Vantagens desbloqueadas renderizadas após adicionar aptidões!');
                } catch (e) {
                    console.error('❌ Erro ao renderizar vantagens:', e.message);
                }
            }
            // NÃO limpar companheiro_temp aqui, pois o modal pode permanecer aberto
        } catch (erro) {
            console.error('❌ Erro ao salvar:', erro);
            alert('❌ Erro ao salvar aptidões');
        }
    });
    
    /**
     * Configura actions dos botões de aptidões do companheiro
     */
    function setupCompanheiroAptidoesActions(container, companheiro) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const action = btn.getAttribute('data-action');
            const aptidaoId = btn.getAttribute('data-id');
            const aptidao = companheiro.aptidoes.find(a => a.id === aptidaoId);
            
            if (!aptidao) return;
            
            console.log(`🎯 Action: ${action}, Aptidão: ${aptidao.nome}, Nível: ${aptidao.nivel}`);
            
            if (action === 'upgrade') {
                // Aumentar nível
                if (aptidao.nivel < 6) {
                    // Verificar limite de máximo
                    const elemCompMaximo = document.querySelector('#comp-aptidoes-maximo');
                    const maximo = elemCompMaximo ? parseInt(elemCompMaximo.textContent) || 3 : 3;
                    
                    const totalNiveisAtual = companheiro.aptidoes.reduce((sum, apt) => sum + apt.nivel, 0);
                    const totalAposUpgrade = totalNiveisAtual + 1;
                    
                    if (totalAposUpgrade > maximo) {
                        alert(`⚠️ Limite de pontos atingido!\n\nAtual: ${totalNiveisAtual}/${maximo}\nUpgrade daria: ${totalAposUpgrade}/${maximo}`);
                        return;
                    }
                    
                    aptidao.nivel++;
                    console.log(`⬆️ Aptidão ${aptidao.nome} subiu para nível ${aptidao.nivel}`);
                    // Renderizar novamente
                    salvarEReRenderizarVantagens(companheiro);
                } else {
                    alert('⚠️ Aptidão já está no nível máximo (6)');
                }
            } else if (action === 'reset') {
                // Resetar para nível 1
                if (confirm(`Resetar "${aptidao.nome}" para nível 1?`)) {
                    aptidao.nivel = 1;
                    console.log(`🔄 Aptidão ${aptidao.nome} resetada para nível 1`);
                    salvarEReRenderizarVantagens(companheiro);
                }
            } else if (action === 'remove') {
                // Remover aptidão
                if (confirm(`Remover "${aptidao.nome}" do companheiro?`)) {
                    const idx = companheiro.aptidoes.indexOf(aptidao);
                    if (idx > -1) {
                        companheiro.aptidoes.splice(idx, 1);
                        console.log(`❌ Aptidão ${aptidao.nome} removida`);
                        salvarEReRenderizarVantagens(companheiro);
                    }
                }
            }
        });
    }
    
    /**
     * Re-renderiza as vantagens após mudança de nível
     */
    function salvarEReRenderizarVantagens(companheiro) {
        // Atualizar contador ATUAL (soma dos níveis)
        const elemCompAtual = document.querySelector('#comp-aptidoes-atual');
        if (elemCompAtual) {
            const totalNiveis = companheiro.aptidoes.reduce((sum, apt) => sum + apt.nivel, 0);
            elemCompAtual.textContent = totalNiveis.toString();
        }
        
        // Aplicar bônus das aptidões
        if (window.companheirosModalController) {
            window.companheirosModalController.aplicarBonusAptidoesCompanheiro(companheiro);
            console.log('✅ Bônus de aptidões recalculados');
        }
        
        // Atualizar modal se estiver aberto
        if (window.companheirosModalController) {
            window.companheirosModalController.atualizarInfoAptidoesCompanheiro();
            console.log('✅ Modal atualizado com novo ATUAL');
        }
        
        // Re-renderizar lista de aptidões
        const listAptidoes = document.querySelector('#comp-aptidoes-personagem-list');
        if (listAptidoes) {
            let html = '';
            
            // Header
            html += `
                <div class="comp-aptidoes-personagem-header">
                    <div class="comp-aptidoes-header-col col-nome">Aptidão</div>
                    <div class="comp-aptidoes-header-col col-nivel">Nível</div>
                    <div class="comp-aptidoes-header-col col-bonus">Bônus</div>
                    <div class="comp-aptidoes-header-col col-acoes">Ações</div>
                </div>
            `;
            
            // Rows
            companheiro.aptidoes.forEach((apt) => {
                const bonusAmount = Math.floor(apt.nivel / 2);
                const bonusText = bonusAmount > 0 ? `+${bonusAmount}` : '—';
                
                html += `
                    <div class="comp-aptidoes-personagem-row" data-aptidao-id="${apt.id}">
                        <div class="comp-aptidoes-col col-nome">${apt.nome}</div>
                        <div class="comp-aptidoes-col col-nivel">${apt.nivel}</div>
                        <div class="comp-aptidoes-col col-bonus">${bonusText}</div>
                        <div class="comp-aptidoes-col col-acoes">
                            <button class="comp-aptidoes-action-btn" data-action="upgrade" data-id="${apt.id}" title="Aumentar nível">⬆️</button>
                            <button class="comp-aptidoes-action-btn" data-action="reset" data-id="${apt.id}" title="Resetar para nível 1">🔄</button>
                            <button class="comp-aptidoes-action-btn" data-action="remove" data-id="${apt.id}" title="Remover aptidão">❌</button>
                        </div>
                    </div>
                `;
            });
            listAptidoes.innerHTML = html;
        }
        
        // Re-renderizar vantagens
        const listVantagens = document.querySelector('#comp-aptidoes-vantagens-list');
        if (listVantagens) {
            let html = '';
            
            const vantagensSystem = typeof window.vantagensAptidoesSystem !== 'undefined' ? 
                window.vantagensAptidoesSystem : null;
            
            if (!vantagensSystem) {
                listVantagens.innerHTML = '<div class="comp-aptidoes-empty-message">Sistema de vantagens não disponível</div>';
            } else {
                const vantagens = [];
                const vantagensAptidoes = vantagensSystem.vantagensAptidoes;
                
                companheiro.aptidoes.forEach(apt => {
                    const aptidaoId = apt.id;
                    const nivelAtual = apt.nivel;
                    const aptidaoVantagens = vantagensAptidoes[aptidaoId];
                    
                    if (!aptidaoVantagens) return;
                    
                    const niveisAMostrar = [1, 3, 5].filter(n => n <= nivelAtual);
                    
                    niveisAMostrar.forEach(nivel => {
                        const vantagem = aptidaoVantagens[nivel];
                        if (!vantagem) return;
                        
                        vantagens.push({
                            aptidaoId,
                            aptidaoNome: apt.nome,
                            nivel,
                            tipo: vantagem.tipo,
                            valor: vantagem.valor,
                            valorOpcional: vantagem.valorOpcional
                        });
                    });
                });
                
                if (vantagens.length === 0) {
                    html = '<div class="comp-aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
                } else {
                    vantagens.forEach(vant => {
                        const tipoEmojis = {
                            'bonus': '💰',
                            'bonus-duplo': '⚡',
                            'bonus-percentual': '📊',
                            'bonus-opcional': '🔁',
                            'efeito': '📝'
                        };
                        const emoji = tipoEmojis[vant.tipo] || '•';
                        
                        html += `
                            <div class="comp-vantagem-card ${vant.tipo}">
                                <div class="comp-vantagem-header">
                                    <span class="comp-vantagem-nome">${emoji} ${vant.aptidaoNome} - Nível ${vant.nivel}</span>
                                </div>
                                <div class="comp-vantagem-valor">${vant.valor}</div>
                            </div>
                        `;
                    });
                }
                
                listVantagens.innerHTML = html;
            }
        }
    }

    // Filtro em tempo real
    filtroInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        cards.forEach(card => {
            const nome = card.dataset.aptNome.toLowerCase();
            card.style.display = nome.includes(termo) ? 'flex' : 'none';
        });
    });

    // Fechar ao pressionar ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            popup.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);

    // 🔄 Função para sincronizar valores em tempo real
    const sincronizarValores = () => {
        const elemCompAtual = document.querySelector('#comp-aptidoes-atual');
        const elemCompGanhas = document.querySelector('#comp-aptidoes-ganhas');
        const elemCompMaximo = document.querySelector('#comp-aptidoes-maximo');
        const elemCompAtributo = document.querySelector('#comp-aptidoes-atributo-proxima');
        
        const popupAtual = popup.querySelector('#popup-stat-atual');
        const popupGanhas = popup.querySelector('#popup-stat-ganhas');
        const popupMaximo = popup.querySelector('#popup-stat-maximo');
        const popupAtributo = popup.querySelector('#popup-stat-atributo');
        
        if (elemCompAtual && popupAtual) {
            popupAtual.textContent = elemCompAtual.textContent;
        }
        if (elemCompGanhas && popupGanhas) {
            popupGanhas.textContent = elemCompGanhas.textContent;
        }
        if (elemCompMaximo && popupMaximo) {
            popupMaximo.textContent = elemCompMaximo.textContent;
        }
        if (elemCompAtributo && popupAtributo) {
            popupAtributo.textContent = elemCompAtributo.textContent;
        }
    };

    // Sincronizar a cada 500ms
    const intervaloSync = setInterval(sincronizarValores, 500);
    
    // Parar sincronização quando popup for fechado
    const observerRemocao = new MutationObserver(() => {
        if (!document.contains(popup)) {
            clearInterval(intervaloSync);
            observerRemocao.disconnect();
        }
    });
    observerRemocao.observe(document.body, { childList: true });

    console.log('✅ Popup aberto com', aptidoes.length, 'aptidões');
}

/**
 * ✅ CONFIGURAR LISTENERS DE ALTERNÂNCIA DE BÔNUS OPCIONAIS
 * Fluxo: Alternar estado → Atualizar visual → Recalcular bônus
 * @param {HTMLElement} container - Container com os botões
 * @param {Object} companheiro - Objeto do companheiro
 */
function setupListenersAlternanciaCompanheiro(container, companheiro) {
    console.log(`⚙️ [setupListenersAlternancia] ${companheiro.nome} (ID: ${companheiro.id})`);

    const botoes = container.querySelectorAll('.btn-alternar-bonus-opcional-companheiro');
    console.log(`   📌 ${botoes.length} botão(ões) encontrado(s)`);

    botoes.forEach((btn) => {
        // Remover listener antigo se houver
        if (btn._clickHandler) {
            btn.removeEventListener('click', btn._clickHandler);
        }

        btn._clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const companeiroId = parseInt(btn.getAttribute('data-companheiro-id'));
            const aptidaoId = btn.getAttribute('data-aptidao-id');
            const nivel = parseInt(btn.getAttribute('data-nivel'));

            console.log(`\n🔁 [Alternância] ${aptidaoId} Nível ${nivel} | Companheiro ${companeiroId}`);

            // 1️⃣ ALTERNAR ESTADO NO LOCALSTORAGE
            const novoEstado = window.bonusOpcionalCompanheiro?.alternarBonus?.(companeiroId, aptidaoId, nivel);
            if (!novoEstado) {
                console.error(`   ❌ Erro ao alternar`);
                return;
            }
            console.log(`   ✅ Novo estado: ${novoEstado}`);

            // 2️⃣ ATUALIZAR ELEMENTOS VISUAIS (texto do botão e efeito)
            const vantagensSystem = window.vantagensAptidoesSystem;
            const vantagem = vantagensSystem?.vantagensAptidoes?.[aptidaoId]?.[nivel];
            
            if (vantagem && vantagem.valorOpcional) {
                const novoTexto = novoEstado === 'valor' ? vantagem.valor : vantagem.valorOpcional;
                
                // Atualizar botão
                btn.textContent = `🔁 ${novoTexto}`;
                console.log(`   ✅ Botão atualizado: 🔁 ${novoTexto}`);

                // Atualizar card de vantagem (elemento .comp-vantagem-valor)
                const card = btn.closest('.comp-vantagem-card');
                if (card) {
                    const efeito = card.querySelector('.comp-vantagem-valor');
                    if (efeito) {
                        efeito.textContent = novoTexto;
                        console.log(`   ✅ Vantagem atualizada: ${novoTexto}`);
                    }
                }
            }

            // 3️⃣ RECALCULAR BÔNUS (chama a função CORRETA do modal)
            const companheiroEmEdicaoId = window.companheirosManager?.companheiroEmEdicao;
            if (companheiroEmEdicaoId && window.companheirosModalController) {
                const companheiroObj = window.companheirosManager?.getCompanheiroById?.(companheiroEmEdicaoId);
                if (companheiroObj) {
                    console.log(`   🔄 Recalculando bônus...`);
                    window.companheirosModalController.aplicarBonusAptidoesCompanheiro(companheiroObj);
                    window.companheirosModalController.atualizarDisplaysAtributos();
                    console.log(`   ✅ Bônus recalculado\n`);
                } else {
                    console.warn(`   ⚠️ Companheiro não encontrado`);
                }
            }
        };

        btn.addEventListener('click', btn._clickHandler);
    });
}

/* ✅ LIMPEZA: Função atualizarCamposDeBonusNaCaracteristicas REMOVIDA
 * MOTIVO: Duplicação - companheiros-modal.js já faz isso via aplicarBonusAptidoesCompanheiro()
 * MANTÉM: Chamada para window.companheirosModalController.recalcularBonusAptidoesCompanheiro()
 */
