/* ═══════════════════════════════════════════════════════════════════════════════
   📚 CÓDEX MÁGICO - SISTEMA DE DICAS
   Gerenciador completo do popup de dicas
═══════════════════════════════════════════════════════════════════════════════ */

const codexMagico = (() => {
    // Estado privado
    let isOpen = false;
    let activeSection = null;

    // Dados do Códex - Tópicos e conteúdo
    const topicos = [
        {
            id: 'rd-codex-section-1',
            titulo: '🔹 Dicas Principais',
            icone: '💡',
            conteudo: `Aba de Atributos

Observe que, na aba de atributos, existem os botões "Update" e "Limpar".
Eles foram criados para agilizar sua experiência.

Em vez de abrir atributo por atributo para salvar alterações, você pode aplicar todos os bônus de aptidões e ganhos de treinamento de uma só vez.

Isso economiza tempo e mantém sua ficha organizada.

A Importância da Sorte

A sorte é um fator crucial no sistema.

Sempre entre na aba de Sorte, role seu dado e ative sua Fortuna.
Lembre-se: o bônus base de Sorte é um bônus global.

Isso significa que praticamente tudo o que você faz é influenciado por ela.

Nunca subestime a Sorte.`
        },
        {
            id: 'rd-codex-section-2',
            titulo: '🔹 Criação de Ficha',
            icone: '📝',
            conteudo: `Seja bem-vindo, meu caro companheiro.
Eu me chamo Aurelian Vox… e estou aqui para guiá-lo.

Antes de tudo, abra o menu e vá até a aba Info.
Ali você definirá as bases do seu personagem:

• Nome
• Título
• Origem
• Afiliação
• História (caso deseje impressionar seu mestre)

Depois disso, vá até a aba Raças.

No sistema base de ReDungeon, as raças liberadas são comuns e raras.
Raças de raridade superior podem exigir requisitos narrativos ou aprovação do mestre.

Após escolher sua raça, volte ao menu e selecione sua Classe.

A classe representa sua especialização inicial e concede aumento de atributos.

Mas não se preocupe…
Durante a campanha, é possível treinar atributos e evoluir.

Atenção apenas às aptidões necessárias para que o treinamento seja eficiente.

Em seguida, vá até a aba Aptidões.

A cada nível, você recebe 1 ponto.
Use com sabedoria.

As aptidões possuem efeitos em níveis ímpares, criando decisões estratégicas interessantes.

Após finalizar sua base, role os dados de raça e classe, distribua suas aptidões e então visite a Loja para adquirir seus equipamentos.

Suas habilidades podem ser obtidas criando um Núcleo, conversando com seu mestre ou através da sua classe.`
        },
        {
            id: 'rd-codex-section-3',
            titulo: '🔹 Inventário',
            icone: '🎒',
            conteudo: `O inventário possui dois campos principais:

• Espaço para itens
• Espaço para armazenamentos

Armazenamentos incluem:

• Mochilas
• Anéis especiais
• Animais de carga
• Qualquer item que aumente sua capacidade

Sempre equipe corretamente seus equipamentos.
Caso contrário, poderá ficar sobrecarregado.`
        },
        {
            id: 'rd-codex-section-4',
            titulo: '🔹 Treinamento',
            icone: '📚',
            conteudo: `O sistema de treinamento é intuitivo.

Você pode treinar atributos individualmente.

Quanto maior o nível do atributo, maior será a experiência necessária para evoluí-lo.

Ao completar a experiência necessária, você ganha 1 ponto.

E não se esqueça:

Após treinar, vá até a aba de Atributos e clique em Update para aplicar o valor.`
        },
        {
            id: 'rd-codex-section-5',
            titulo: '🔹 Habilidades',
            icone: '⚔️',
            conteudo: `Antes de falar sobre Núcleo, Arts e Variantes, entenda algo essencial:

O limite de Arts é precioso.

Escolha cuidadosamente quais habilidades criar.

O Núcleo é a base da sua habilidade.

Ele define bônus como precisão, reação e outros atributos secundários.

Exemplo:

Um artista marcial pode ter como núcleo de Boxe.
Isso influencia vitalidade momentânea, evasão e reação.

A Art é a técnica em si.
Um Jab, por exemplo.

A Variante é uma evolução da Art.
Um Jab mais forte ou uma sequência de golpes.

Mas lembre-se:

Para criar variantes mais poderosas, você precisa desenvolver bem sua arte base.`
        },
        {
            id: 'rd-codex-section-7',
            titulo: '📘 Ajuda — Meridianos e Dantian',
            icone: '🧿',
            conteudo: `🧿 Meridianos
Os Meridianos representam os canais internos responsáveis pelo fluxo de Qi no corpo do cultivador.

🔹 Determinar Meridianos Desbloqueados
Role 4d6 e descarte o menor resultado.
A soma final indica quantos meridianos estão abertos.
Quanto mais meridianos desbloqueados:
• Maior o fluxo de Qi
• Melhor a eficiência no cultivo
• Maior estabilidade energética

🔹 Meridiano Principal
Após definir o total de meridianos, role 1d6 para determinar qual deles se tornará o Meridiano Principal, responsável por influenciar diretamente a especialização energética do cultivador.

🔵 Dantian
O Dantian é o núcleo espiritual responsável por armazenar Qi. Ele define o limite máximo de energia que o cultivador pode suportar e utilizar.

🔹 Cálculo do Dantian Base
O valor inicial do Dantian é determinado por:
2d25 + (Metade da vitalidade)
Esse valor representa:
• Capacidade máxima de Qi
• Resistência interna à sobrecarga
• Potencial para uso de técnicas avançadas
Quanto maior o Dantian, maior o suporte energético do corpo.

⚡ Avanços e Expansões
O cultivo permite que tanto os Meridianos quanto o Dantian evoluam ao longo da jornada.

🔹 Crítico Natural
Se o jogador obtiver um crítico natural:
Pode abrir meridianos adicionais rolando 1d6.

🔹 Expansão por Nível
A cada nível de cultivo:
O Dantian aumenta em 1d12.

🔹 Expansão por Reino
Ao conquistar um novo Reino:
O Dantian aumenta em 2d16.
A Alma do cultivador aumenta em 1d12 + ¼ do Dantian atual.`
        }
    ];

    /**
     * Inicializa o sistema do Códex Mágico
     */
    function init() {
        // Criar HTML do popup
        criarPopup();

        // Configurar event listeners
        configurarEventos();

        console.log('✨ Códex Mágico inicializado com sucesso!');
    }

    /**
     * Cria o HTML do popup no DOM
     */
    function criarPopup() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'rd-codex-overlay';
        overlay.className = '';

        // Container principal
        const popup = document.createElement('div');
        popup.id = 'rd-codex-popup';
        popup.className = '';

        // Header
        const header = document.createElement('header');
        header.id = 'rd-codex-header';
        header.innerHTML = `
            <button id="rd-codex-back" type="button" title="Voltar">↩</button>
            <h2 id="rd-codex-title">Códex Mágico</h2>
            <button id="rd-codex-close" type="button" title="Fechar">✕</button>
        `;

        // Container de conteúdo
        const content = document.createElement('div');
        content.id = 'rd-codex-content';

        // Adicionar tópicos
        topicos.forEach((topico, index) => {
            const section = document.createElement('div');
            section.className = 'rd-codex-section';
            section.id = topico.id;
            section.dataset.index = index;

            section.innerHTML = `
                <button class="rd-codex-section-btn" type="button">
                    <span style="flex: 1;">
                        <span class="rd-codex-section-icon">${topico.icone}</span>
                        <span>${topico.titulo}</span>
                    </span>
                    <span class="rd-codex-section-arrow">▼</span>
                </button>
                <div class="rd-codex-section-content">
                    <p class="rd-codex-text">${topico.conteudo}</p>
                </div>
            `;

            content.appendChild(section);
        });

        popup.appendChild(header);
        popup.appendChild(content);

        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    /**
     * Configura todos os event listeners
     */
    function configurarEventos() {
        const overlay = document.getElementById('rd-codex-overlay');
        const closeBtn = document.getElementById('rd-codex-close');
        const backBtn = document.getElementById('rd-codex-back');
        const sections = document.querySelectorAll('.rd-codex-section');

        // Botão fechar
        closeBtn.addEventListener('click', close);

        // Botão voltar
        backBtn.addEventListener('click', voltarMenu);

        // Clicar fora (no overlay)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close();
            }
        });

        // Botões das seções (acordeão)
        sections.forEach((section) => {
            const btn = section.querySelector('.rd-codex-section-btn');
            btn.addEventListener('click', () => {
                toggle(section);
            });
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        });
    }

    /**
     * Abre o popup
     */
    function open() {
        const popup = document.getElementById('rd-codex-popup');
        const overlay = document.getElementById('rd-codex-overlay');

        if (popup && overlay) {
            popup.classList.add('rd-codex-active');
            overlay.classList.add('rd-codex-active');
            isOpen = true;

            // Expandir primeira seção
            const firstSection = document.getElementById('rd-codex-section-1');
            if (firstSection && !firstSection.classList.contains('rd-codex-expanded')) {
                expandirSecao(firstSection);
            }
        }
    }

    /**
     * Fecha o popup
     */
    function close() {
        const popup = document.getElementById('rd-codex-popup');
        const overlay = document.getElementById('rd-codex-overlay');

        if (popup && overlay) {
            popup.classList.remove('rd-codex-active');
            overlay.classList.remove('rd-codex-active');
            isOpen = false;
        }
    }

    /**
     * Volta para o menu principal
     * Mantém todos os dados salvos
     */
    function voltarMenu() {
        console.log('🔙 Voltando do Códex Mágico para o menu principal...');
        close();
        
        // Aguardar a animação de fechamento
        setTimeout(() => {
            const btnMenu = document.getElementById('btn-menu-principal');
            if (btnMenu) {
                btnMenu.click();
                btnMenu.focus();
                console.log('✅ Voltado com sucesso para o menu principal');
            } else {
                console.warn('⚠️ Botão do menu principal não encontrado');
            }
        }, 300);
    }

    /**
     * Toggle do popup
     */
    function toggle() {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    /**
     * Toggle de uma seção específica (acordeão)
     */
    function toggle(section) {
        if (section.classList.contains('rd-codex-expanded')) {
            colapsarSecao(section);
        } else {
            // Fechar outras seções abertas
            const outrasSecoes = document.querySelectorAll('.rd-codex-section.rd-codex-expanded');
            outrasSecoes.forEach(s => {
                if (s !== section) {
                    colapsarSecao(s);
                }
            });

            // Expandir seção clicada
            expandirSecao(section);
        }
    }

    /**
     * Expande uma seção
     */
    function expandirSecao(section) {
        section.classList.add('rd-codex-expanded');
        activeSection = section;
    }

    /**
     * Colapsa uma seção
     */
    function colapsarSecao(section) {
        section.classList.remove('rd-codex-expanded');
        if (activeSection === section) {
            activeSection = null;
        }
    }

    /**
     * API Pública
     */
    return {
        init,
        open,
        close,
        toggle,
        isOpen: () => isOpen
    };
})();

// Inicializar quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        codexMagico.init();
        // Exportar globalmente
        window.codexMagico = codexMagico;
    });
} else {
    codexMagico.init();
    // Exportar globalmente
    window.codexMagico = codexMagico;
}
