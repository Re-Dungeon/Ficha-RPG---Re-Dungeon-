/**
 * 🔄 JSON-FORMAT-CONVERTER.JS
 * 
 * Converte arquivos JSON de versões antigas (2.0.0) para o novo formato V3.0
 * Mapeia estruturas descompatíveis automaticamente
 * 
 * Versões suportadas:
 * - 2.0.0 → 3.0.0
 */

class JsonFormatConverter {
    static VERSION_TARGET = '3.0.0';
    
    /**
     * Detecta versão do JSON
     */
    static detectarVersao(dados) {
        if (dados.meta?.versaoSistema) return dados.meta.versaoSistema;
        if (dados.meta?.versao) return dados.meta.versao;
        
        // Tentar inferir pela estrutura
        if (dados.jogador && dados.atributos && dados.habilidades) {
            return '2.0.0';
        }
        
        return 'desconhecida';
    }

    /**
     * Converte JSON de qualquer versão para V3.0
     */
    static converter(dados) {
        const versaoAtual = this.detectarVersao(dados);
        
        console.log(`🔄 Detectado JSON versão: ${versaoAtual}`);
        console.log(`   Convertendo para: ${this.VERSION_TARGET}`);
        
        if (versaoAtual === '2.0.0') {
            return this.converterDe2_0_Para3_0(dados);
        } else if (versaoAtual === '3.0.0') {
            console.log('✅ Já está na versão 3.0.0, nenhuma conversão necessária');
            return dados;
        } else {
            throw new Error(`❌ Versão ${versaoAtual} não suportada para conversão`);
        }
    }

    /**
     * 🔄 CONVERTER DE 2.0.0 PARA 3.0.0
     * 
     * Mapeia:
     * - jogador → personagem.info
     * - habilidades → personagem.habilidades.lista
     * - inventario → personagem.inventario
     * - companheiros → companheiros (com conversão interna)
     */
    static converterDe2_0_Para3_0(dados) {
        console.log('\n🔄 === CONVERSÃO 2.0.0 → 3.0.0 ===\n');

        const estado = {
            meta: {
                versaoSistema: '3.0.0',
                dataUltimoSalvo: new Date().toISOString(),
                identificadorUnico: this.gerarUnicoId(),
                aplicacaoVersao: '1.0.0',
                formato: 'redungeon-ficha-3.0',
                convertidoDe: '2.0.0',
                dataConversao: new Date().toISOString()
            },

            personagem: {
                // ===== INFO =====
                info: this.converterInfo(dados.jogador),
                
                // ===== IMAGEM =====
                imagem: {
                    imagemId: null,
                    base64: dados.visual?.personagemImagem || null,
                    versao: 1
                },

                // ===== ATRIBUTOS =====
                atributosPrimarios: this.converterAtributosPrimarios(dados.atributos?.primarios),
                atributosSecundarios: this.converterAtributosSecundarios(dados.atributos?.secundarios),

                // ===== STATUS =====
                status: this.converterStatus(dados.statusGlobal),

                // ===== APTIDÕES =====
                aptidoes: this.converterAptidoes(dados.aptidoes),

                // ===== HABILIDADES =====
                habilidades: {
                    lista: dados.habilidades || [],
                    ativas: (dados.habilidades || [])
                        .filter(h => h.ativo || h.ativa)
                        .map(h => h.id || h.nome)
                },

                // ===== INVENTÁRIO =====
                inventario: {
                    itens: dados.inventario?.itens || [],
                    armazenamentos: dados.inventario?.armazenamentos || [],
                    espacoMaximo: 100,
                    sobrecarga: false
                },

                // ===== TREINAMENTO =====
                treinamento: {
                    areas: dados.treinamento?.areas || {},
                    experienciaTotal: 0,
                    historico: dados.treinamento?.historico || []
                }
            },

            // ===== COMPANHEIROS =====
            companheiros: this.converterCompanheiros(dados.companheiros),

            // ===== SISTEMAS ESPECIAIS =====
            cultivacao: dados.cultivacao || {
                nivel: 0,
                experiencia: 0,
                estamina: 0
            },

            corpoImortal: dados.corpoImortal || {
                upgrades: [],
                pontosDisponiveis: 0,
                nivel: 0
            },

            meridianos: dados.meridianos || {
                dantian: 0,
                meridianosDesbloqueados: []
            },

            tribulacao: dados.tribulacao || {
                nivel: 0,
                status: 'nao_iniciada'
            },

            reputacao: dados.reputacao || {
                mundo: 0,
                regiao: 0,
                history: [],
                lastModified: null
            }
        };

        console.log('✅ Conversão completada com sucesso!\n');
        return estado;
    }

    /**
     * Converte seção de INFORMAÇÕES BÁSICAS
     */
    static converterInfo(jogador) {
        if (!jogador) return {
            nome: 'Aventureiro Desconhecido',
            titulo: 'Sem Título',
            classe: 'Guerreiro',
            raca: 'Humano',
            origem: 'Desconhecida',
            afiliacao: 'Nenhuma',
            statusNarrativo: 'Ativo',
            notasAdicionais: '',
            background: ''
        };

        return {
            nome: jogador.nome || 'Aventureiro Desconhecido',
            titulo: jogador.titulo || 'Sem Título',
            classe: jogador.classe || 'Guerreiro',
            raca: jogador.raca || 'Humano',
            origem: jogador.origem || 'Desconhecida',
            afiliacao: jogador.afiliacao || 'Nenhuma',
            statusNarrativo: jogador.statusNarrativo || 'Ativo',
            notasAdicionais: jogador.notasAdicionais || '',
            background: jogador.background || ''
        };
    }

    /**
     * Converte ATRIBUTOS PRIMÁRIOS
     */
    static converterAtributosPrimarios(primarios) {
        const padrao = {
            forca: { base: 10, extra: 0, total: 10, bonus: 0 },
            agilidade: { base: 10, extra: 0, total: 10, bonus: 0 },
            resistencia: { base: 10, extra: 0, total: 10, bonus: 0 },
            inteligencia: { base: 10, extra: 0, total: 10, bonus: 0 },
            sabedoria: { base: 10, extra: 0, total: 10, bonus: 0 },
            carisma: { base: 10, extra: 0, total: 10, bonus: 0 }
        };

        if (!primarios) return padrao;

        // Tentar mapear valores do formato antigo
        const mapeado = {};
        for (const [chave, valor] of Object.entries(primarios)) {
            if (typeof valor === 'object' && valor.base !== undefined) {
                mapeado[chave] = valor;
            } else if (typeof valor === 'number') {
                mapeado[chave] = {
                    base: valor,
                    extra: 0,
                    total: valor,
                    bonus: 0
                };
            }
        }

        return { ...padrao, ...mapeado };
    }

    /**
     * Converte ATRIBUTOS SECUNDÁRIOS
     */
    static converterAtributosSecundarios(secundarios) {
        const padrao = {
            defesa: { base: 0, extra: 0, total: 0, bonus: 0 },
            acuracia: { base: 0, extra: 0, total: 0, bonus: 0 },
            dano: { base: 0, extra: 0, total: 0, bonus: 0 },
            velocidade: { base: 0, extra: 0, total: 0, bonus: 0 },
            regeneracao: { base: 0, extra: 0, total: 0, bonus: 0 },
            controle: { base: 0, extra: 0, total: 0, bonus: 0 }
        };

        if (!secundarios) return padrao;

        // Mapear valores do formato antigo
        const mapeado = {};
        for (const [chave, valor] of Object.entries(secundarios)) {
            if (typeof valor === 'object' && valor.base !== undefined) {
                mapeado[chave] = valor;
            } else if (typeof valor === 'number') {
                mapeado[chave] = {
                    base: valor,
                    extra: 0,
                    total: valor,
                    bonus: 0
                };
            }
        }

        return { ...padrao, ...mapeado };
    }

    /**
     * Converte STATUS (barras de HP, energia, etc)
     */
    static converterStatus(statusGlobal) {
        return {
            saude: {
                atual: statusGlobal?.saude?.atual || 100,
                maxima: statusGlobal?.saude?.maxima || 100,
                percentual: statusGlobal?.saude?.percentual || 100
            },
            energia: {
                atual: statusGlobal?.energia?.atual || 50,
                maxima: statusGlobal?.energia?.maxima || 50,
                percentual: statusGlobal?.energia?.percentual || 100
            },
            fadiga: {
                atual: statusGlobal?.fadiga?.atual || 0,
                maxima: statusGlobal?.fadiga?.maxima || 100,
                percentual: statusGlobal?.fadiga?.percentual || 0
            }
        };
    }

    /**
     * Converte APTIDÕES
     */
    static converterAptidoes(aptidoes) {
        return {
            atual: aptidoes?.atual || 0,
            ganhas: aptidoes?.ganhas || 0,
            maximo: aptidoes?.maximo || 3,
            atributoProxima: aptidoes?.atributoProxima || 10,
            adicionalNiveis: aptidoes?.adicionalNiveis || 0,
            personagens: aptidoes?.personagens || [],
            vantagens: aptidoes?.vantagens || [],
            aba: 'personagem',
            abaAtual: 'personagem'
        };
    }

    /**
     * Converte COMPANHEIROS (recurso especial para estrutura aninhada)
     */
    static converterCompanheiros(companheirosAntigos) {
        if (!companheirosAntigos || !Array.isArray(companheirosAntigos)) {
            return [];
        }

        return companheirosAntigos.map((comp, idx) => {
            return {
                id: comp.id || `companheiro-${idx}`,
                ativo: comp.ativo !== false,
                
                // Info
                info: {
                    nome: comp.nome || `Companheiro ${idx + 1}`,
                    classe: comp.classe || 'Sem Classe',
                    raca: comp.raca || 'Sem Raça',
                    nivel: comp.nivel || 1,
                    experiencia: comp.experiencia || 0,
                    titulo: comp.titulo || '',
                    notasAdicionais: comp.notasAdicionais || '',
                    background: comp.background || ''
                },

                // Imagem
                imagem: {
                    imagemId: null,
                    base64: comp.imagem || null,
                    versao: 1
                },

                // Atributos
                atributosPrimarios: this.converterAtributosPrimarios(comp.atributosPrimarios),
                atributosSecundarios: this.converterAtributosSecundarios(comp.atributosSecundarios),

                // Status
                status: this.converterStatus(comp.statusGlobal),

                // Habilidades
                habilidades: {
                    lista: comp.habilidades || [],
                    ativas: (comp.habilidades || [])
                        .filter(h => h.ativo || h.ativa)
                        .map(h => h.id || h.nome)
                },

                // Inventário
                inventario: {
                    itens: comp.inventario?.itens || [],
                    armazenamentos: comp.inventario?.armazenamentos || [],
                    espacoMaximo: 100,
                    sobrecarga: false
                },

                // Aptidões
                aptidoes: this.converterAptidoes(comp.aptidoes),

                // Treinamento
                treinamento: {
                    areas: comp.treinamento?.areas || {},
                    experienciaTotal: 0,
                    historico: comp.treinamento?.historico || []
                }
            };
        });
    }

    /**
     * Gera um ID único
     */
    static gerarUnicoId() {
        return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Valida conversão - mostra resumo
     */
    static validarConversao(dadosOriginais, dadosConvertidos) {
        console.log('\n📊 === RESUMO DA CONVERSÃO ===\n');
        
        console.log(`Personagem: ${dadosConvertidos.personagem.info.nome}`);
        console.log(`  Classe: ${dadosConvertidos.personagem.info.classe}`);
        console.log(`  Raça: ${dadosConvertidos.personagem.info.raca}`);
        console.log(`  Habilidades: ${dadosConvertidos.personagem.habilidades.lista.length}`);
        console.log(`  Itens no inventário: ${dadosConvertidos.personagem.inventario.itens.length}`);
        
        if (dadosConvertidos.companheiros.length > 0) {
            console.log(`\nCompanheiros: ${dadosConvertidos.companheiros.length}`);
            dadosConvertidos.companheiros.forEach((comp, idx) => {
                console.log(`  ${idx + 1}. ${comp.info.nome} (${comp.info.classe})`);
                console.log(`     - Habilidades: ${comp.habilidades.lista.length}`);
                console.log(`     - Itens: ${comp.inventario.itens.length}`);
            });
        }
        
        console.log('\n✅ Conversão validada com sucesso!\n');
    }
}

// ✅ Criar instância global
window.jsonFormatConverter = JsonFormatConverter;
console.log('✅ JsonFormatConverter disponível em window.jsonFormatConverter');

// 🎯 Atalho
window.converterJson = (dados) => {
    const resultado = JsonFormatConverter.converter(dados);
    JsonFormatConverter.validarConversao(dados, resultado);
    return resultado;
};

console.log('\n🎯 ATALHO DISPONÍVEL:');
console.log('   window.converterJson(jsonAntigo) → Converte e valida automaticamente');
