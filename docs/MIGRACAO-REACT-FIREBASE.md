# Plano de Migração — ReDungeon → React + Vite + Firebase

Este documento descreve como migrar o site atual (HTML/CSS/JS vanilla, ~88 mil linhas de JS em ~140 arquivos, ~40 mil linhas de CSS, tudo client-side sem conta de usuário) para uma stack **React + Vite + Firebase**. Leia junto com:
- [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) — o que cada sistema faz hoje.
- [player-site-handoff.md](./player-site-handoff.md) — **fonte de verdade** sobre a stack obrigatória, o Firebase compartilhado, o código de autenticação a ser reaproveitado e as convenções de código a seguir. Este plano foi revisado para seguir exatamente o que está descrito lá; onde houver conflito entre as seções abaixo e `player-site-handoff.md`, **o handoff prevalece**.

---

## Status da implementação (atualizado em 2026-07-19)

**As 8 fases do roadmap (seção 10) foram implementadas.** O deploy é feito via GitHub Pages, automatizado por `.github/workflows/deploy.yml` (build + lint + testes a cada push em `main`, publicado em `https://re-dungeon.github.io/Ficha-RPG---Re-Dungeon-/`). `vite.config.js` define `base: '/Ficha-RPG---Re-Dungeon-/'` e `src/routes/index.jsx` usa `basename: import.meta.env.BASE_URL` para o React Router respeitar esse subpath; `public/404.html` + o script correspondente em `index.html` implementam o fallback de SPA que o GitHub Pages não oferece nativamente (deep-link/refresh em rotas como `/personagens/:id`).

**Desvio importante em relação à seção 0**: a migração **não** foi feita em um repositório novo separado — foi implementada neste mesmo repositório (`Ficha-RPG---Re-Dungeon-`), substituindo o site vanilla no lugar. Os arquivos antigos (`js/`, `css/`, `index.html`, `data/*.js`, `html-components/`) já foram removidos. Ver `CLAUDE.md` para as convenções de código deste projeto.

### QOL leva 1 (2026-11-09)

Decisões que mudam como a ficha grava (valem para código novo):
- **Mescla em três vias ao salvar**: `updatePersonagem(id, patch, { base })` (`common/utils/mesclaTresVias.js`). `base` = o personagem de onde a tela montou o patch; o que o jogador não mudou mantém o valor mais novo do Firestore. Sem isso, salvar o `status` inteiro desfazia o PV alterado pelo token no grid. `Ficha.jsx` passa por padrão o personagem atual da tela; abas com Formik passam o personagem de onde o formulário partiu (`AtributosTab`).
- **Ficha ao vivo**: depois da primeira carga, `Ficha.jsx` ouve `subscribePersonagem`. A `AtributosTab` só reinicia o formulário quando não há edição pendente (sem `enableReinitialize` cego).
- "Salvar" dos diálogos de atributo/status grava a ficha; −5/−1/+1/+5 no diálogo de Saúde/Energia/Fadiga gravam na hora; os atalhos do menu de contexto das gemas aparecem também no desktop.
- Central de Ações: `aplicarEGravar` desfaz o estado e avisa se a gravação falhar; usar item grava o efeito antes de descontar o item.
- `SavingContext`: overlay só depois de 400 ms, sem 1 s mínimo.
- Confirmação (`components/ConfirmDialog` + `useConfirmacao`, cópia compartilhada) antes de excluir item/material/receita, Arte/Variante/Núcleo (lista a cascata) e condição.
- **`condicoesAtivas[].duracaoRestante`** passa a ser descontada automaticamente (`avancarDuracaoCondicoes`, `formulas.js`) no "Iniciar novo turno" da ficha e no "Seu turno! Restaurar PP" do grid; chega a 0 → sai da ficha. `null` = sem duração. Botão "−1 acúmulo" com 2+ acúmulos.
- `+N`/`-N` nos campos de recurso do token é relativo ao atual (`valorDigitadoDoRecurso`, `grid.js`).
- `npm run check:shared` confere as cópias compartilhadas com o Re:Master.
- `firestore.rules`: o mestre também apaga `chatMembros` (exclusão de campanha no Re:Master) — **precisa de deploy pelo Re:Master**.

### Fase a fase

| Fase | Status | Onde está |
|---|---|---|
| 0 — Fundação | ✅ | `src/service/firebase.js`, `src/context/AuthContext.jsx`, `src/components/ProtectedRoute/`, `src/routes/index.jsx`, `src/pages/Login/` |
| 1 — Leitura de dados de referência | ✅ | `src/service/storage.js` (`get*PorUniverso`, `getUniverso`/`getOrigens`/`getDivindades`), `src/common/utils/resolveNome.js` |
| 2 — Atributos + Status + Power Combat | ✅ | `src/pages/Personagens/Ficha/tabs/AtributosTab.jsx`, fórmulas em `common/utils/formulas.js` |
| 3 — Raças, Classes, Treinamento, Sorte, Condições, Imagem | ✅ | `.../tabs/ProgressaoTab.jsx` (+`progressao/*`), `.../tabs/SorteTab.jsx`, `.../tabs/CondicoesTab.jsx`, `.../tabs/PerfilTab.jsx` |
| 4 — Aptidões e Arts | ✅ | `.../tabs/AptidoesTab.jsx` (+`aptidoes/*`), `.../tabs/ArtsTab.jsx` (+`arts/*`) |
| 5 — Inventário e economia | ✅ | `.../tabs/InventarioTab.jsx` (+`inventario/*`), `.../tabs/LojasTab.jsx` (+`lojas/*`) |
| 6 — Veias Astrais | ✅ | `.../tabs/VeiasAstraisTab.jsx` (+`veiasAstrais/*`) |
| 7 — Códex e Info do Jogador | ✅ | `.../tabs/CodexTab.jsx`; Info do Jogador absorvida em `.../tabs/PerfilTab.jsx` |
| 8 — Polimento | ✅ (menos deploy) | `firestore.rules` revisado e **já deployado no projeto real**; testes de fluxo em `NovoPersonagem.test.jsx`, `AtributosTab.test.jsx`, `InventarioTab.test.jsx` |

A ficha do personagem (`src/pages/Personagens/Ficha/Ficha.jsx`) acabou com **11 abas**: Atributos, Progressão, Aptidões, Arts, Inventário, Lojas, Veias Astrais, Companheiro, Sorte, Condições, Códex, Perfil.

### Decisões e desvios tomados durante a implementação (não previstos em detalhe neste plano)

O schema da seção 5 abaixo ficou **um pouco mais completo** do que o desenhado aqui — alguns campos eram necessários para a mecânica funcionar mas não estavam listados explicitamente:

- `status.hp/energia/fadiga` ganhou um campo `atual` (além de `base/extra/bonus`) — necessário para as barras de status terem um valor "atual" distinto do máximo (FUNCIONALIDADES.md §3 já descrevia isso).
- `atributosTotais`, `secundariosTotais`, `statusMaximos` (objetos com o total já somado por chave) e `powerCombat` (number) — implementado em 2026-07-29. Até então, os totais de `AtributosTab.jsx` eram **puramente derivados** em memória (`calcularPrimariosTotais`/`calcularSecundarios`/`calcularStatusMaximos`/`calcularPowerCombat` em `common/utils/formulas.js`) a partir de `atributosBase/Extra/Bonus`/`secundariosBase/Extra/Bonus`, nunca persistidos. Passaram a ser gravados no documento a cada "Salvar" da aba Atributos (`AtributosTab.jsx`, `handleSubmit`) só para consumo por **outra aplicação externa** que lê o Firestore compartilhado — este site continua recalculando os totais em memória para exibição, nunca lendo esses campos de volta.
- `aptidoesGanhas` (number, top-level) — é o contador "Ganhas" do painel de Aptidões (FUNCIONALIDADES.md §9), não estava na lista de campos da seção 5.
- `artsLimiteAdicional` (number, top-level) — bônus manual de limite de Arts concedido pelo mestre, somado ao limite calculado original (`calcularLimiteArts` em `common/utils/formulas.js`) e preservado independentemente da fórmula automática. O valor é sempre tratado como 0 quando ausente em personagens antigos.
- `racaHabilidadesAtivas` (array de índices) — toggle de habilidades básicas ativas da raça (FUNCIONALIDADES.md §11); usa o **índice** da habilidade no array `habilidadesBasicas` do doc de `racas`, já que o catálogo não tem um id próprio por habilidade.
- `lojaTrapaça` **não tem** `saldoFortuna` como a seção 5 sugeria — isso duplicaria `sorte.fortunaAtual` (mesma moeda, ver FUNCIONALIDADES.md §6). `lojaTrapaça` guarda só `efeitosAtivos`. Trate a seção 5 abaixo como desatualizada nesse ponto específico.
- `historicoSorte` (subcoleção) registra tanto rolagens de Fortuna quanto compras na Loja da Trapaça — não é usado só para rolagens.
- `cultivo` **virou um mapa keyed por subUniverso** (2026-07-29), a pedido do usuário — antes era um objeto único (`{subUniverso, reinoId, xpAtual}`) e trocar de sistema de cultivo (SubUniverso) zerava a progressão anterior, exigindo um diálogo de confirmação. Agora cada chave do mapa guarda sua própria progressão independente (`{reinoId, xpAtual}`), então um personagem pode cultivar em mais de um sistema/subUniverso ao mesmo tempo (ex.: "Doupo Cangqiong" e "Martial Peak" em paralelo) sem perder nada ao trocar de aba no `CultivoModal`. Sem ferramenta de migração pro formato antigo — o `personagem.cultivo` de personagens de teste criados antes dessa mudança fica órfão (o modal simplesmente não encontra progressão pra nenhum sistema até o jogador ganhar Cultivo de novo).
  - **Trilhas paralelas detectadas (2026-10-18)**: universos **sem** `SubUniversos` também podem ter vários sistemas — basta os Reinos (`subUniverso: ''`) formarem mais de uma trilha, cada uma começando num Reino com `reinoAnterior` vazio (caso real: "Crônica da Luz e Sombras", com Aspirante…/Besta…/Dormant…). Antes o modal costurava tudo numa fila só, sem seletor. Agora `separarTrilhasCultivo` (`common/utils/formulas.js`) separa as trilhas e o `CultivoModal` usa as mesmas abas/"+" dos `SubUniversos`, com a **chave do mapa = id do Reino raiz** (rótulo da aba = nome dele). Só raízes estritas contam — um `reinoAnterior` apontando pra id inexistente (ex.: "Alma Nascente" em The Elder Gods) não vira sistema; o órfão vai pro fim da 1ª trilha. Progresso antigo em `principal` é migrado pra trilha que contém o `reinoId` salvo (`resolverMapaCultivoPorTrilhas`; persistido na próxima escrita). O Reset passou a remover só os `cultivoBonus` dos Reinos da trilha atual (do destino em diante, via `removerBonusCultivoDosReinos`) — antes o reset completo zerava o bônus de todos os sistemas.

Outras simplificações deliberadas (escolhas de escopo, não bugs):

- **Inventário**: ~~array `inventario: [{itemId, quantidade, equipado}]` no doc do personagem, referenciando o catálogo `itens`~~ — decisão revertida a pedido do usuário (2026-07-21). Virou a subcoleção `personagens/{id}/itensInventario` (ver seção 5.1), mesmo padrão de Arts: cada item é uma **cópia própria e completa** do personagem, nunca uma referência viva ao catálogo. O diálogo de adicionar item (`CriarItemDialog.jsx`) ganhou abas **Autoral** (criar item do zero) e **Catálogo** (escolher um item de `itens` por universo, copiando os campos), espelhando `CriarArtDialog.jsx`. Editar um item (`ItemFormDialog.jsx`) só afeta a cópia do personagem — o catálogo `itens` nunca é escrito por este site. Continua sem a separação "Itens" vs. "Armazenamentos" do site vanilla — um item vira "armazenamento" via o campo `bonusEspaco`. Sem ferramenta de migração pro array antigo (mesmo precedente do rebuild de Arts) — o campo `personagens.inventario` fica órfão.
- **Treinamento**: os limiares de crítico/sucesso/quase/falha e a tabela de XP por nível são **autorais** (o FUNCIONALIDADES.md §13 não define números exatos) — documentado com o aviso ⚠️ no topo do bloco correspondente em `common/utils/formulas.js`. Fácil de recalibrar se não bater com as regras da mesa.
- **Loja da Trapaça**: catálogo pequeno e autoral embutido em `src/pages/Personagens/Ficha/lojas/catalogoTrapaca.js` — não existe coleção Firestore para isso (confirmado na seção 4 abaixo), então não tem como vir do painel administrativo.
- **Arts**: ~~modelo "flat"~~ — decisão revertida a pedido do usuário (2026-07-21). Voltou a existir **Núcleo** (`personagens/{id}/nucleos`), pré-requisito de qualquer Art nas 3 origens (`origem: 'autoral'|'classe'|'catalogo'`, cada doc de `arts` ganhou `nucleoId` obrigatório), e **Variante** (`personagens/{id}/variantes`, vinculada a uma Art via `artId`, domínio sempre menor que o da Art base — `dominioVarianteValido` em `common/utils/formulas.js`), replicando a hierarquia de 3 camadas do site vanilla original. Ver schema atualizado na seção 5.
- **Veias Astrais**: interface em lista agrupada por camada, sem o mapa visual com pan/zoom e céu estrelado animado do site vanilla — mecânica de desbloqueio em cadeia (custo cumulativo de nós-pai) e bônus em `atributosBonus` preservados.
- **Background** (Info do Jogador, FUNCIONALIDADES.md §22): textarea simples com contador de caracteres, sem editor rich-text (bold/itálico/listas) nem "templates de lore reutilizáveis".
- **Corpo Especial (2026-07-23)**: nova sub-aba "Corpo Especial" dentro do modal Info (`sidebar/InfoModal.jsx`), ao lado de Perfil/Informações Gerais/Background. Mostra uma grade (`corpoEspecial/CorpoEspecialGrid.jsx`, reaproveitando os styled components `Enciclopedia*` de `aptidoes/styles.js`) com o catálogo `corposEspeciais` do universo do personagem (`getCorposEspeciaisPorUniverso`, mesmo padrão `where('universo', '==', ...)` de `racas`/`classes`), e salva a escolha direto em `corpoEspecial` (id) ao clicar — sem passo de "Salvar" explícito, mesmo padrão instantâneo de `RacaModal.jsx`.
  - **Ajuste (2026-07-24)**: depois de escolhido, a aba passou a mostrar um detalhe expandido do corpo especial atual (nome, imagem, descrição e a lista `bonus` do catálogo separada em Vantagens/Desvantagens pelo prefixo de cada linha — `"Vantagem • ..."`/`"Desvantagem • ..."`, reaproveitando `Detalhe*`/`BonusLista`/`BonusItem` de `progressao/styles.js`) em vez de só o botão "Selecionado" desabilitado na própria grade. Um botão "Trocar Corpo Especial" volta pra grade de escolha. Continua sem habilidades pra ativar/desativar — só a raça tem isso.
- **`regras` é filtrada por `universo`** — confirmado pelo responsável do projeto, corrigindo a suposição cautelosa da seção 4.1 abaixo ("regras não são mencionadas como filtradas").
- **Companheiro (2026-07-22)**: revertida a decisão da seção 2.1/2.3 de não implementar — mas em modelo **bem mais simples** do que `FUNCIONALIDADES.md` §17 (sem inventário/aptidões/arts isolados por companheiro). Um companheiro é **outro documento inteiro de `personagens`**, com o campo novo `companheiroDe` (id do personagem "base", ver seção 5) apontando pra ficha que o criou. Nova aba `.../tabs/CompanheiroTab.jsx` (+`companheiro/*`), ao lado de Veias Astrais: botão "Criar Companheiro" abre `CriarCompanheiroModal.jsx` com duas opções — ficha em branco no mesmo universo, ou duplicar a ficha atual inteira (`companheiro/duplicarPersonagem.js`, que também copia as subcoleções de aptidões/núcleos/arts/variantes/inventário, remapeando `nucleoId`/`artId` pros novos ids gerados na cópia; `historicoSorte` não é duplicado, é log transiente). A aba lista, em grade, todos os personagens com `companheiroDe == id do personagem atual` (`getCompanheiros`) **e**, se a própria ficha aberta for companheira de outra (`personagem.companheiroDe` preenchido), também mostra um card pra essa ficha "base", badge "Ficha Principal". Cada card navega pra `/personagens/{id}` como qualquer personagem — não existe conceito de ficha "somente companheiro", qualquer personagem pode ter os seus próprios companheiros.
- **Nível geral (2026-07-23)**: sistema novo, não previsto neste plano nem em `FUNCIONALIDADES.md` — nasceu de um pedido direto do usuário. Novo item "Nível" no menu lateral da ficha (`FichaSidebar.jsx`, grupo "Personagem", depois de "Reputação") abre `sidebar/NivelModal.jsx`, com duas sub-abas: **Progresso** (nível atual, barra de XP, campo "XP ganho" que soma ao progresso e sobe de nível automaticamente — podendo cruzar vários níveis de uma vez, mesmo padrão de `aplicarXpTreino`/Treinamento) e **Atributos** (totais dos primários/secundários calculados a partir de `atributosBase/Extra/Bonus` e `secundariosBase/Extra/Bonus`, com botão "+1" nos atributos quando há pontos disponíveis pra gastar). Custo de XP por nível é linear e **diferente** da curva de Treinamento: `500 * nível alvo` (nv1=500, nv2=1000, nv50=25.000), sem saturação. A cada nível o jogador ganha 4 pontos pra distribuir entre os 5 atributos principais (todos exceto Sorte); a cada 5 níveis, alternando, o múltiplo ímpar (5, 15, 25...) dá 1 ponto de Sorte **aplicado automaticamente** (sem escolha, direto em `atributosBonus.sorte`) e o múltiplo par (10, 20, 30...) dá 1 ponto **escolhido pelo jogador** entre os 6 atributos secundários. Fórmulas em `common/utils/formulas.js` (`calcularXpNecessarioNivel`, `calcularBonusNivel`, `aplicarXpNivel`), com teste. Schema na seção 5 abaixo (`nivel`).
  - **Ajuste (2026-07-23)**: ponto de secundário investido em **Prontidão vale 5** em vez de 1 (os outros 5 secundários continuam valendo 1) — `calcularGanhoSecundarioPorNivel` em `common/utils/formulas.js`, com teste. Botão **"Resetar Nível"** na aba Progresso (com confirmação) zera `nivel.atual`/`xpAtual`/pools e desfaz exatamente os pontos que o sistema de Nível concedeu — para isso, `nivel.historico` (seção 5) rastreia, separadamente de `atributosBonus`/`secundariosBonus`, quanto cada atributo recebeu *só* via Nível; o reset subtrai esse histórico de volta dos bônus e não mexe em bônus adicionados manualmente na aba Atributos.
- **Reputação (2026-07-22)**: revertida a decisão da seção 2.1/2.3 de não implementar — mas o modelo é **por Origem**, não o antigo Fama/Temor global de Mundo/Região do site vanilla (`FUNCIONALIDADES.md` §5, com limiares fixos 6/11/21/31/46/61/76/91). Cada documento do catálogo `origens` já vinha, no Firestore compartilhado, com um campo `reputacao: { fama: [{quantidade, efeito}], terror: [{quantidade, efeito}] }` — os limiares e a descrição de cada efeito são definidos pelo painel administrativo por origem, não por uma tabela fixa no código. Novo item "Reputação" no menu lateral da ficha (`FichaSidebar.jsx`, grupo "Personagem", depois de "Classe") abre `sidebar/ReputacaoModal.jsx`: grade de cards com as origens do universo do personagem (`getOrigensPorUniverso`) e, ao clicar numa origem, o mesmo Dialog troca de conteúdo (padrão já usado em `LojaModal.jsx`) para um formulário com dois números editáveis — Fama e Terror — e a lista de efeitos daquela origem, marcando quais já foram desbloqueados (`calcularEfeitosReputacao` em `common/utils/formulas.js`, com teste). O personagem só guarda os números atuais por origem, em `reputacoes: { [origemId]: { fama, terror } }` (seção 5) — os efeitos em si nunca são copiados para o documento do personagem, sempre relidos do catálogo.
- **Chat de campanha (2026-10-18)**: sistema novo, inspirado no Firecast e feito junto com o Re:Master (mesma sala nos dois sites). Novas páginas `/campanhas` ("Minhas Campanhas", derivada de `personagens.campanhas` dos próprios personagens jogáveis — o doc de `rmCampanhas` não tem lista de jogadores) e `/campanhas/:id/chat`, com links "Fichas"/"Campanhas" no cabeçalho do `Layout`. **Primeira escrita deste site em coleções `rm*`**, restrita a duas subcoleções:
  - `rmCampanhas/{id}/chatMensagens/{msgId}` → `{uid, personagemId|null, autorNome, autorAvatar|null, isMestre, persona: 'jogador'|'mestre'|'npc'|'criatura', tipo: 'texto'|'imagem', texto, url|null, createdAt}`. `persona` `npc`/`criatura` = o mestre (só no Re:Master) interpretando um NPC/Criatura da mesa: a mensagem leva o nome/avatar dele e é exibida com a etiqueta "NPC"/"Criatura" (`rotuloPersona`); a regra só aceita essas personas com `isMestre == true` vindo do mestre da campanha. Nome/avatar do personagem denormalizados no envio. Imagem/GIF só por **URL direta** (`isUrlImagemValida` em `common/utils/chat.js`), sem Firebase Storage. Sem edição; apagar = autor ou mestre.
  - `rmCampanhas/{id}/chatMembros/{uid}` → `{uid, personagemId, updatedAt}`: ponteiro gravado pelo jogador ao abrir o chat (e ao trocar o "Falando como"), sem migração. A regra de leitura revalida a cada request que esse personagem é do usuário e ainda tem a campanha em `campanhas` — desmarcar a campanha na ficha corta o acesso sem apagar nada.
  - **Primeiro listener em tempo real** do projeto: `subscribeChatMensagens` (`onSnapshot`, últimas 100) em `service/storage.js`, devolvendo o `unsubscribe`.
  - **Rolagem de dados (2026-10-18)**: `tipo: 'rolagem'` com `rolagem: {grupos: [{quantidade, faces, resultados}], termos, modificador, total}`. Dois fluxos: botão de d20 no campo de envio (`components/Chat/RolagemDialog.jsx` — escolhe o dado → quantidade/bônus/obstáculo, com "Adicionar outro dado" para misturar) e comando `/r` (`/roll`; `/rs`/`/gr` = secreta), ex. `/r 2d6+1d4+3-1`. Só d4/d6/d8/d10/d12/d20/d100, até 10 grupos/100 dados/20 modificadores. Funções puras em `common/utils/dados.js` (com teste): aleatoriedade via `crypto.getRandomValues` com rejeição de sobras (sem viés). O dado é rolado **no cliente** — a regra só valida a estrutura (Firestore Rules não têm laços para somar/conferir cada dado), decisão consciente: mesa entre amigos, sem Cloud Functions.
  - **Rolagens secretas**: ficam em `rmCampanhas/{id}/chatSecretas/{uid}/rolagens/{id}` (uma pasta por usuário, `secreta: true`), legíveis só pelo dono e pelo mestre — numa coleção única a consulta de lista seria recusada inteira pelas regras. O jogador escuta a própria pasta; o mestre escuta `chatMembros` e uma pasta por membro (`subscribeChatSecretasDoMestre`). As secretas são intercaladas às públicas por horário (`mesclarMensagens`); os outros jogadores não ficam sabendo que houve rolagem.
  - **Macros Lua (2026-10-18)**, inspiradas no Firecast: ícone `</>` no chat (e comando `/m nome`) abre `components/Chat/MacrosDialog.jsx`. Todos veem nome + "Usar"; o mestre da campanha também adiciona/edita (CodeMirror 6, `LuaEditor.jsx`, lazy)/apaga/reordena e tem "Testar" (roda de verdade, prévia só para ele). Ficam em `rmCampanhas/{id}/macros/{id}` → `{nome, descricao, codigo (≤50 KB), somenteMestre, ordem}`; jogador só lê `somenteMestre == false` (a consulta precisa do `where`). Execução: `common/lua/luaRuntime.js` (Lua 5.3 via **fengari**, só `base`/`math`/`string`/`table` — sem `os`/`io`/`require`/`load`/`debug`, `math.random` via crypto, limite de 10M instruções) dentro de um **Web Worker** (`macroWorker.js` + `executarMacro.js`, watchdog de 5 s de CPU) → a macro não alcança o Firebase. API: `enviar`, `inputQuery`, `choose`, `rolar` (publica), `rolarLocal`. Saídas só são publicadas ao fim (`tipo: 'macro'` com `macroNome`, texto ≤4000; rolagens no formato normal); erro/cancelamento não publica nada. O código das macros públicas é baixado pelo jogador (visível no DevTools) — decisão consciente; segredos vão em `somenteMestre`. O exemplo `dano_impacto` do usuário é fixture de teste (`common/lua/__fixtures__/`). `vite.config.js`: plugin que troca os módulos Node do fengari por vazio no build do worker + `optimizeDeps` (`include` e `define` de `process.env.FENGARICONF`) para o dev.
  - Toda a ligação com o chat (ponteiro de membro + escuta + enviar/rolar/macros/apagar) fica no hook `hooks/useChatCampanha.js` (macros: `hooks/useMacrosCampanha.js`), usado pela página `/campanhas/:id/chat` e pelo modal **Chat** da ficha (`Ficha/sidebar/ChatModal.jsx`, categoria nova **"Social"** do menu lateral). O modal fala sempre como o personagem da ficha, tem seletor de campanha quando ele está em mais de uma, e só escuta as mensagens enquanto está aberto.
  - **Grid da campanha (2026-10-18)**, mapa tático inspirado no Firecast: rota `/campanhas/:id/grid` (mesma página da mesa, `CampanhaChat visao="grid"`, com seletor Chat|Grid e o chat num painel lateral recolhível; botão "Abrir grid" na lista de campanhas e no modal Chat da ficha; o link "Campanhas" do cabeçalho reabre a última visão usada — `selecao.visaoCampanha`). **Em cenas** (mesmo dia, substituiu o grid único sem migração): cada cena `rmCampanhas/{id}/gridCenas/{cenaId}` → `{nome, imagemUrl, celula, deslocamentoX, deslocamentoY, mostrarGrade, corGrade, opacidadeGrade}` (a grade é desenhada pelo app por cima da imagem e alinhável a ela) tem os próprios tokens em `gridCenas/{cenaId}/tokens/{id}`, e `rmCampanhas/{id}/grid/atual` = `{cenaAtivaId}` aponta a **cena ativa**, a única que os jogadores leem (as regras recusam as outras — o mestre prepara cenas em segredo); aqui a tela segue o ponteiro e troca sozinha quando o mestre mostra outra cena (nome da cena na barra). Limites só de interface: 50 cenas por campanha, 200 tokens por cena. Tokens → `{nome, imagemUrl, tipo ('jogador'|'npc'|'criatura'|'avulso'), refId, col, lin, tamanho (1–10 células), donos (uids), oculto}` — posições em **células**, nome/imagem copiados na criação. Só o mestre configura e cria/edita/apaga tokens (no Re:Master); aqui o jogador **lê** (mesmo acesso do chat — ponteiro `chatMembros`, agora em `hooks/useMembroDoChat.js`) e **move** os tokens em que está em `donos` (`moverGridToken`; a regra só deixa mudar `col`/`lin` e o rastro do movimento, `rastro`/`movidoEm` — ver abaixo). Tokens `oculto` só o mestre lê — a consulta do jogador filtra `oculto == false`. Tempo real com `subscribeGridCenaAtiva`/`subscribeGridCena`/`subscribeGridTokens` (`hooks/useGridCampanha.js`); mover grava uma vez ao soltar (o cache local do Firestore aplica na hora). `components/Grid/GridMapa.jsx` (DOM + Pointer Events, sem biblioteca): zoom pela roda/pinça/botões e pan locais de cada um, arraste com encaixe na célula, setas do teclado movem o token focado. Modelo puro em `common/utils/grid.js`.
  - **Rastro de movimento, distância e régua (Grid Fase 1, 2026-11-02)**: mover um token grava, na mesma escrita de `col`/`lin`, `rastro` (polilinha de células `[{col, lin}]`, até 50 vértices — `RASTRO_VERTICES_MAX`) e `movidoEm` (`serverTimestamp()`), via `moverGridToken(campanhaId, cenaId, tokenId, col, lin, rastro)`. O caminho é o das células que o token atravessa no arraste (passos adjacentes interpolados, laço cortado ao voltar a uma célula — `avancarCaminho`), simplificado sem mudar a soma (`simplificarCaminho`/`montarRastro`); setas geram um passo. Distância **Chebyshev** (diagonal = 1 quadrado), rótulo `"4 q · 6 m"` (`formatarDistancia`); a cena ganhou `metrosPorQuadrado` opcional (0,1–100, padrão 1,5 — editável só no Re:Master; cenas antigas sem o campo usam o padrão). Todos os clientes mostram o rastro (fantasma na origem só durante o arraste, linha tracejada na cor do tipo, rótulo no fim) quando chega um snapshot com `movidoEm` **novo** — sem comparar relógios; a carga inicial não mostra (`detectarMovimentos`). Some em 10 s (esmaece nos últimos 2 s) ou no próximo movimento. Movimentos seguidos que começam onde o rastro visível termina (setas, arrastos encadeados) continuam o mesmo rastro, e o rótulo do arraste já mostra o **total encadeado**. Quem moveu vê o rastro na hora; a escrita pendente chega com `movidoEm` null (`subscribeGridTokens` usa o padrão `serverTimestamps: 'none'` — não trocar por `'estimate'`, o rastro piscaria 2x) e a confirmação do servidor com o mesmo rastro não pisca de novo. Token **oculto** (só o mestre move) tem rastro só local, nada gravado. `rastro` lido do Firestore é sanitizado (`normalizarRastro`) porque as regras só limitam o tamanho da lista. Regras: o jogador pode alterar `['col', 'lin', 'updatedAt', 'rastro', 'movidoEm']` (`gridRastroValido`: lista ≤ 50, `movidoEm` timestamp; `gridMovidoEmValido`: `movidoEm` alterado ⇒ `== request.time`), e o `gridTokenValido` do mestre aceita `rastro`/`movidoEm` (sem isso o mestre não conseguiria editar um token que já tem rastro). Se a regra publicada ainda for a antiga, `permission-denied` faz o hook regravar só `col`/`lin` e não tentar mais o rastro na sessão (rastro só local, sem erro). **Régua local**: botão "Régua" (ícone de régua, `aria-pressed`) nos controles do mapa ou Shift+arrastar no desktop; mede de centro a centro, sem pan, e fica até o próximo toque ou Esc. Nada da régua é gravado.
  - **Grid Fase 2 (2026-11-02) — sinal, puxar vista, PV/Energia/Fadiga, condições, distância até token, auras e seguir token**:
    - **Campos novos no token** (só o mestre grava, no Re:Master; o update do jogador continua limitado a `col`/`lin`/`rastro`/`movidoEm`): `pv`/`energia`/`fadiga` → `{atual, max}` inteiros (0 ≤ atual ≤ max, 1 ≤ max ≤ 99999; ausente/null = sem barra), usados só por npc/criatura/avulso (o token novo começa cheio, `recursosIniciais` da ficha do NPC/criatura); `mostrarRecursos` (`'oculto'` padrão | `'barra'` | `'numeros'`) — o que os jogadores veem desses recursos; `condicoes` (ids do catálogo `condicoes`, ≤ 20); `aura` → `{raio (1–999 células), cor (#RRGGBB, paleta de 6 — CORES_AURA)}` ou null. Regras: `gridRecursoValido`/`gridAuraValida`/`gridCombateValido`, chamadas por `gridTokenValido`.
    - **Barras e condições**: três barras finas sob o token (`components/Grid/TokenEstado.jsx`) — PV verde→vermelho, Energia azul, **Fadiga enche com o cansaço** (fração = (máx − atual)/máx: descansado = vazia). Token **jogador** lê a ficha ao vivo (`subscribePersonagem` + `hooks/useFichasDoGrid.js`, um `onSnapshot` por ficha distinta; `status.hp|energia|fadiga.atual` / `statusMaximos.*`, com fallback para `saude` e `status.*.maximo` — `recursosDaFicha`) e as `condicoesAtivas` dela (com stack); a leitura de `personagens` já é `isAuth()`. Npc/criatura/avulso usam os campos do token. Até 3 ícones de condição (`linkImagem` ou inicial) + "+N" no canto; o catálogo vem de `getCondicoesPorUniverso(campanha.universoId)`, carregado só na visão grid. Visibilidade: barra do jogador para todos, números só para os donos e o mestre; npc conforme `mostrarRecursos`; o mestre vê tudo (`recursosDoToken`, view model único `detalhesDosTokens` → prop `detalhes` do GridMapa).
    - ⚠️ **Sigilo só na interface**: os recursos e condições de NPC ficam no próprio doc do token, que o jogador já lê — `mostrarRecursos: 'oculto'` esconde só na tela (quem abrir o DevTools vê os números). Aceito por ora; sigilo real exigiria mover esses campos para um doc só do mestre.
    - **Sinal (ping)**: segurar 3 s sem mover (mais de 4 px cancela — o mesmo limiar do arraste) no mapa ou num token, no celular e no desktop, ou Alt+clique no desktop, mostra um anel por ~3 s no ponto, na cor da pessoa (mestre dourado; jogador cor estável do uid — `corDoPing`) com o nome de quem fala. O menu de contexto/callout do navegador é bloqueado no mapa. Um doc por pessoa `rmCampanhas/{id}/gridCenas/{cenaId}/pings/{uid}` → `{x, y (px do mundo, int 0–250000), puxar, nome?, criadoEm (serverTimestamp)}`, **sobrescrito** a cada sinal (sem acúmulo nem TTL), no máximo 1 por segundo (`setGridPing`/`subscribeGridPings`, `hooks/useGridPings.js`). Como no rastro, só aparece quando chega um `criadoEm` novo (a carga inicial não mostra; `detectarPings`); o meu aparece local e os docs do meu uid são ignorados (meu sinal numa outra aba não aparece). Regras: lê quem vê a cena; cria/atualiza só o próprio uid, `puxar: true` só o mestre (`gridPingValido`); apaga o próprio ou o mestre.
    - **Puxar vista** (mestre): botão "Puxar vista" (megafone) — o próximo sinal centraliza o mapa de todos (zoom mantido, transição suave) e o botão desliga; Shift+Alt+clique faz o mesmo direto. O mapa oculto no celular (aba Chat) aplica ao voltar, se o sinal ainda estiver na tela.
    - **Distância até um token**: hover (desktop) ou toque (celular, cartão por 3 s) num token mostra o cartão (`TokenDetalhe.jsx`: nome, números se visíveis, condições) com "N q · M m de <token>", medido **borda a borda** (`distanciaEntreTokens`) a partir do token de referência — jogador: o último dele movido/tocado, senão o primeiro; mestre: o selecionado (`escolherReferencia`).
    - **Auras** (mestre, 1 por token): quadrado de células (Chebyshev) com o raio em volta do token, recortado ao mapa, desenhado abaixo dos rastros e tokens.
    - **Seguir token**: botão "Seguir token" (mira) recentraliza a vista (zoom mantido, suave) quando o token de referência se move; arrastar o mapa desliga; começa desligado e não é salvo. Seguir e puxar mexem na vista durante o render, com guarda (padrão do foco do celular), sem efeito.
    - **Editar PV/Energia/Fadiga pelo token (2026-11)**: no cartão do token de jogador **do próprio usuário** (hover; no celular o toque fixa o cartão até tocar fora/Esc), cada recurso vira "PV [−] 12 / 20 [+]" com o atual digitável (Enter/blur grava). Persistência: `atualizarRecursoAtualPersonagem` (`service/storage.js`) — transação com `update` de `status.hp.atual` (+ `status.saude.atual` se a ficha tiver o legado), `status.energia.atual` ou `status.fadiga.atual` + `updatedAt`, limitado a 0..max; base/extra/bônus intactos; regra de `personagens` (dono) inalterada. Fadiga mantém a semântica de estoque gasto ("−" gasta, barra enche). Sem mensagem no chat. Só o dono edita; o Re:Master não liga a edição.
    - **Celular**: pressão longa funciona por toque (sem callout no iOS: `-webkit-touch-callout: none`); o cartão do token abre por toque; a coluna de controles ganhou "Seguir token" (e "Puxar vista" para o mestre).
    - Pendências: antes do deploy das regras novas, sinais e campos novos do token são recusados (o sinal aparece só localmente e o aviso sai uma vez); pressão longa em aparelhos reais (callout iOS, `pointercancel` do Android, Alt no Firefox Windows) precisa de teste manual.
  - **Grid Fase 3A (2026-11) — combate**:
    - **Modelo**: um doc por cena `rmCampanhas/{id}/gridCenas/{cenaId}/combate/atual` → `{ordem: [{tokenId, iniciativa, d20, reacao}] (1–200), indice, rodada (1–9999), inicioTurno: {col, lin}|null, turnoEm (serverTimestamp a cada troca de turno), createdAt, updatedAt}`; existir = combate em andamento, "Encerrar" apaga. Sem nomes/donos no doc (o token da vez é `ordem[indice].tokenId`). Funções puras em `common/utils/gridCombate.js` (cópia nos dois sites, com teste): `normalizarCombate`, `rolarIniciativa`, `trocarTurno`, `inserirNoCombate`/`removerDoCombate`/`moverNoCombate`, `faixaDoCombate` e o alcance (`quadradosDeMovimento`/`distanciasDeMovimento`/`faixasDoAlcance`). Escuta: `subscribeGridCombate` + `hooks/useGridCombate.js` (dentro do `useGridCampanha`).
    - **Iniciativa** (Re:Master): o mestre rola 1d20 + Reação para todos ao iniciar (empate: maior Reação, depois sorteio); Reação da ficha (`reacaoDaFicha`: `secundariosTotais.reacao` ou a fórmula de `calcularSecundarios`, com teste cruzado), avulso = informada pelo mestre. Rodada +1 quando a ordem volta ao início.
    - **Mensagens** `tipo: 'combate'` no chat (`montarMensagemCombate`, `components/Chat/CombateMensagem.jsx` — cartão estreito centralizado com ⚔): `inicio` (com a lista de iniciativa, sem os ocultos), `rodada` (já com o turno), `turno`, `fim`; oculto = "Turno de um oponente oculto". Reordenar/adicionar/remover não gera mensagem. Regras: `chatCombateValido`; jogador só posta turno/rodada na mesma transação do passe de turno dele (`chatCombateDoJogador`, `getAfter(combate).turnoEm == request.time`).
    - **Jogador**: faixa de iniciativa no topo do mapa (`components/Grid/FaixaIniciativa.jsx` — retratos na ordem, o da vez destacado, tocar centraliza; ocultos não aparecem e, na vez deles, "Vez do mestre"), anel pulsante no token da vez (sem animação com `prefers-reduced-motion`), "Encerrar meu turno" (regra `gridPassaMeuTurno`: só índice +1, ou 0 com rodada +1, e só se o token da vez é dele e visível) e "Seu turno! Restaurar PP" (`updatePersonagem` da ficha com `estadoDoNovoTurno`, extraído para `Ficha/prontidao/config.js` junto de `criarRegistroHistorico`/`prontidaoMaximaDaFicha`; não é automático). PP no cartão do token só para o dono e o mestre (`detalhesDosTokens` → `pp`).
    - **Travar movimento** (cena `travamento`, fora do `GRID_CONFIG_PADRAO` para o "Salvar grid" não sobrescrever): 'livre' | 'turno' (em combate, o jogador só move o token da vez; fora de combate, livre; tokens fora do combate ficam parados) | 'congelado' (só o mestre). Vale no app (`podeMoverToken`) e na regra (`gridMovimentoLiberado`). O jogador vê um aviso no canto do mapa; `ehMeu` mantém o token dele como referência/"Seguir token" mesmo travado.
    - **Alcance de movimento** (só em combate, ao arrastar ou tocar o próprio token; mestre: o selecionado): células até Mover em verde e até Correr em amarelo (`components/Grid/AlcanceMovimento.jsx`), contadas desde `inicioTurno` do token da vez (BFS 8 vizinhos, ignora paredes nesta fase); o rótulo do arraste mostra a distância desde o início do turno em verde/amarelo/vermelho. Só indicação, não bloqueia. Token `deslocamento` (metros, padrão 9, 0–999, só o mestre grava) e cena `multiplicadorCorrida` (2 | 1,5, padrão 2).
    - **Limitações**: antes do deploy das regras novas, iniciar combate, passar turno, mensagens de combate, `travamento`/`multiplicadorCorrida`/`deslocamento` são recusados (a UI mostra erro); recarregar a página durante o próprio turno mostra o "Restaurar PP" de novo; nomes de ocultos ficam só fora da interface do jogador (a ordem guarda só ids/números); a sintaxe das regras (`ordem[indice]`, `getAfter` na transação) precisa ser validada no emulador/compilação antes do deploy.
  - **Grid Fase 3B (2026-11) — mapa**:
    - **Modelo** (sob `gridCenas/{cenaId}`): `camadas/paredes` = `{trechos}` e `camadas/nevoa` = `{ativa, trechos}` (`trechos` = células bloqueadas / REVELADAS em texto `lin:ini-fim,ini-fim;lin:...`, reescrito inteiro a cada edição, ≤200000 chars); `marcadores` (`col, lin, icone, cor, titulo ≤60, texto ≤500, secreto`); `desenhos` (um doc por traço: `uid, cor, pontos` plano de inteiros em px do mundo, ≤200 pontos, `createdAt`). Utilitários puros com teste (cópia nos dois sites): `gridCamadas.js`, `gridMarcadores.js`, `gridDesenho.js`; hooks `useGridCamadas`/`useGridMarcadores`/`useGridDesenhos` dentro do `useGridCampanha`.
    - **Quem faz o quê**: mestre pinta paredes/névoa e cria marcadores (Re:Master); jogador só lê, e desenha (os seus). Marcador tem `tamanho` 1..10 (como o token; ausente = 1; `col`/`lin` = canto superior esquerdo, N×N células; regra valida `get('tamanho', 1)` int 1..10). Marcador secreto: a consulta do jogador filtra `secreto == false` e a regra exige (sigilo real). Névoa e paredes: sigilo só de interface.
    - **No `GridMapa`** (props novas opcionais: `camadas`, `marcadores`, `desenhos`, `ferramenta`, `opcoesFerramenta`, `onEditarCamada`, `onCelulaMarcador`, `onMarcadorClique`, `onDesenhar`, `acoesDesenho`): ordem das camadas imagem → grade → paredes → auras → alcance → rastros → névoa → marcadores → anotações (desenhos, prévia, caminho do arraste, régua) → fantasma → tokens. Névoa: quem não é mestre não recebe os tokens alheios cobertos (`filtrarTokensPelaNevoa`; token grande aparece se alguma célula está na luz). Paredes: o jogador não solta/anda token por cima ("Há uma parede no caminho."; passo diagonal só passa se um dos lados está livre), o alcance de movimento as contorna, o rótulo do arraste avisa "Parede no caminho"; o mestre ignora tudo. Botão "Desenhar" (um dedo/mouse traça, Esc sai, exclusivo com a régua; paleta com "Apagar meus desenhos" e, para o mestre, "Apagar todos"). **Pinça agora também desloca** (dois dedos) e o botão do meio do mouse arrasta o mapa em qualquer modo.
    - **Pendências**: antes do deploy das regras novas os listeners novos dão `permission-denied` (silencioso para o jogador) e as escritas falham; a sintaxe das regras novas (`%`, `size()` em string) não foi executada; pinça+pan precisa de teste no celular real.
  - **Grid Fase 3C (2026-11) — ações**:
    - **Templates de área** (subcoleção `gridCenas/{cenaId}/templates/{id}`: `uid, nome?, forma` raio|linha|cone|quadrado, `origem {col,lin}, alvo? {col,lin}` (não em raio), `metros` (>0, ≤1000; a verdade — os quadrados vêm da escala da cena), `cor` #RRGGBB, `createdAt, updatedAt`). Utilitário puro com teste (cópia nos dois sites): `common/utils/gridAreas.js` (células por forma — Raio = quadrado Chebyshev, Linha = 1 q de largura, Cone 90° — na diagonal vira quadrante —, Quadrado a partir da origem; `tokensAtingidos`, `descreverAtingidos`, `rotuloDaArea`, limites); hook `useGridAreas` dentro do `useGridCampanha` (`areas`, `acoesAreas`: criar/atualizar/remover/removerTodas). Limites só de UI: 50 por cena, 10 por pessoa.
    - **Quem faz o quê**: qualquer um da mesa cria (botão "Área" nos controles, ícone ChangeHistory, exclusivo com Régua/Desenhar e só com a ferramenta Mover) e todos veem, inclusive sobre a névoa; só o autor ou o mestre move/gira (alças do chip: origem translada, alvo gira/estica; regra: só `origem`/`alvo`) ou apaga; "Remover todos" é do mestre (confirmação). Persiste até alguém remover. Sem pré-preencher pela Art. "Atinge: A, B, +N" usa a mesma lista de tokens renderizada no mapa (já sem os cobertos pela névoa para quem não é mestre; o mestre vê ocultos com "(oculto)"). Paredes são ignoradas pelas áreas (v1).
    - **Rolar a partir do token**: "Rolar…" (`components/Grid/TokenAcoes.jsx`; também a tecla R no token focado) no token que a pessoa pode mover e tem autor (`autorDoToken` em `common/utils/gridRolagem.js`: jogador = a ficha do token — ou a do "Falando como" se o token não tem ficha —, mestre = a persona do NPC/criatura) abre o `RolarDoTokenDialog` na página: Ataque/Defesa (combos salvos, fórmula = `perfilDano`, senão `converterPotencialEmDados`), Artes com `dados` ("2d6+3 de fogo" → a 1ª expressão) — **só no site dos jogadores** (`useOpcoesDeRolagem`; no Re:Master o mestre só tem rolagem livre em NPC) — e rolagem livre com rótulo opcional. `useRolarDoToken` interpreta (`preparar`), rola e posta pública no chat; expressão inválida volta como erro sob o campo. Não gasta PP; sem rolagem secreta.
    - **Chat**: mensagens de rolagem ganham o campo opcional `rotulo` (≤100; regra de `chatMensagens`; `normalizarRotulo` em `chat.js`), mostrado em `RolagemMensagem` ("Wesley — Ataque: Golpe Duplo · 3d8+12 = 27"). Rolagem secreta (`chatSecretas`) não leva rótulo.
    - **No `GridMapa`** (props novas opcionais: `areas`, `acoesAreas`, `podeEditarArea`, `corAreaPadrao`, `podeRolarToken`, `onRolarToken`): `AreasGrid` fica logo acima da névoa e abaixo dos marcadores/tokens; o gesto de posicionar vem antes do ramo do token (sem pressão longa; Esc/✕ cancela).
    - **Arquivos novos (compartilhados com o Re:Master, exceto `useOpcoesDeRolagem`)**: `common/utils/gridAreas.js`, `gridRolagem.js`, `components/Grid/{AreasGrid,AreaRotulos,AreaPopover,TokenAcoes,RolarDoTokenDialog}.jsx` + `stylesAcoes.js`, `hooks/{useGridAreas,useRolarDoToken}.js`.
    - **Pendências**: antes do deploy das regras novas o listener de `templates` dá `permission-denied` (ignorado) e criar/mover/apagar áreas e mensagens com `rotulo` são recusados; a sintaxe das regras novas não foi executada; o fluxo das alças no celular real precisa de teste manual.
  - **Backlog — Grid Fase 3** (3A — iniciativa/turnos, travar movimento, alcance de movimento —, 3B — paredes, névoa, desenho livre, marcadores — e 3C — templates de área, rolar a partir do token — feitas, acima). Sem fase: grid hexagonal. Descartado por ora: régua compartilhada.
  - ⚠️ **Deploy de `firestore.rules`**: o projeto Firebase é compartilhado e o deploy é "último vence". O bloco do grid é idêntico neste repo e no Re:Master; o deploy de regras é feito **só a partir do Re:Master** e com confirmação explícita do responsável. **`Banco-de-Dados---Re-Dungeon/firestore.rules` publica no mesmo projeto e NÃO tem as regras do grid** — nunca faça deploy de regras por lá (apagaria o grid inteiro).
  - **Música da mesa (2026-10-18)**: ícone 🎵 na linha de ações do chat abre `components/Chat/AudioDialog.jsx` — todos veem o que toca e ajustam o próprio volume/mudo (localStorage, por aparelho); o mestre cola um link do YouTube (watch/youtu.be/shorts/embed/live/music, `t=` vira o início — `extrairVideoYoutube`), pausa/retoma, para e liga o "Repetir" (padrão ligado). Estado em `rmCampanhas/{id}/audio/atual` → `{videoId, estado ('tocando'|'pausado'|'parado'), posicaoBase, repetir, referenciaEm (horário do servidor)}`; cada cliente calcula a posição atual (`posicaoAtual` em `common/utils/audioMesa.js`), então todos ouvem no mesmo ponto (±1–2 s de relógio). Só o mestre grava (regra), inclusive daqui. O áudio vem da IFrame API do YouTube (`common/utils/youtubeApi.js`, carregada só quando há música) num player **escondido** (`components/Chat/PlayerAudioMesa.jsx`, decisão consciente — zona cinzenta dos termos do YouTube), montado pela página fora do `ChatSala` para seguir tocando com o painel de chat fechado; corrige a deriva a cada 4 s. Autoplay bloqueado pelo navegador → aviso "Clique para ouvir a música da mesa"; se o clique não bastar, o player aparece num canto para um toque direto no ▶. Sem mensagem no chat ao trocar de música.
  - **Histórico do campo e divisão da mesa (2026-11-09)**:
    - **Histórico (↑/↓):** com o campo vazio, ↑/↓ percorrem o que você enviou pelo campo. É o texto bruto, inclusive `/r`, `/rs`/`/gr` e `/m`. Tem no máximo 50 entradas, sem repetir a mesma em sequência. Comando inválido, envio que falhou e ações dos diálogos não entram. Se o texto mostrado for editado, as setas voltam a mover o cursor. Fica em `sessionStorage` (`reDungeonChatHistorico_<campanhaId>`, prop `chaveHistorico` do `ChatSala`), em `common/utils/chatHistorico.js`, que é cópia idêntica no Re:Master.
    - **Divisão arrastável (só neste site):** fica entre o mapa e o chat nas visões grid e lateral (`pages/Campanhas/DivisorMesa.jsx`, `useDivisorMesa.js`, `limitesDivisor.js`). Muda a largura do chat (mínimo 280px; o mapa fica com pelo menos 360px; o chat ocupa no máximo 70%). Entre 600 e 900px, com o chat abaixo do mapa, muda a altura. No celular não existe. Duplo clique ou Enter volta ao padrão, e as setas ajustam de 16 em 16 px. O tamanho fica em `localStorage` (`reDungeonChatPainelLargura`/`reDungeonChatPainelAltura`). As duas preferências valem só para o navegador, nunca são dado de personagem.
  - Componentes apresentacionais em `components/Chat/` e `components/Grid/` (incluindo `TokenEstado`, `TokenDetalhe` e `SinaisPing`), os hooks `useGridCampanha`/`useGridPings`/`useFichasDoGrid` e funções puras em `common/utils/chat.js`/`grid.js` são **cópias** dos do Re:Master — mantenha os dois em sincronia (e os limites alinhados com o bloco do chat no fim de `firestore.rules`).

### Suporte a celular — ✅ implementado em 2026-10-18

Abaixo de 600px o site tem um layout próprio para celular. Acima disso, o desktop ficou idêntico, conferido pixel a pixel com Playwright contra a versão anterior. Convenções em `CLAUDE.md` (Estilização → "Celular"). Resumo:
- **Cabeçalho:** Fichas e Campanhas só com ícone. E-mail e Sair num menu da conta.
- **Ficha:**
  - A sidebar vira gaveta (Drawer, botão ☰ ao lado das abas). As abas ficam compactas, com ícone em cima e rótulo curto.
  - Atributos empilhado, com o herói no topo.
  - Aptidões, Perfil, Lojas, Treinamento e Códex em uma coluna.
  - Seletor de Classe/Raça com a lista em cima.
  - Diálogos grandes em tela cheia, via `theme.js`.
- **Mesa (`/campanhas/:id/grid`):**
  - Alternador Mapa | Chat em tela cheia, começando no mapa. Um badge conta as mensagens novas (`common/utils/mesa.js`).
  - O mapa abre focado no primeiro token que o jogador pode mover, com célula de pelo menos 44px (`vistaFocadaNoToken` em `common/utils/grid.js`). "Centralizar" mostra o mapa inteiro. A régua (botão "Régua") funciona por toque: com ela ligada, arrastar o fundo mede em vez de mover o mapa; a pinça continua dando zoom.
  - Segurar 3 s no mapa ou num token manda um sinal (ping) para a mesa; tocar num token abre o cartão dele (recursos, condições, distância) por 3 s; "Seguir token" acompanha o token de referência.
- **Chat:**
  - O botão de apagar fica sempre visível, sem depender de hover.
  - Placeholder curto no campo de mensagem.
  - O "toque para ouvir" da música vira um botão ♪ de 44px no canto superior direito.
  - Mudanças espelhadas no Re:Master.

### Testes

`common/utils/formulas.js` e `hooks/useDraftLocalStorage.js` têm cobertura de teste completa (fórmulas puras + o hook de rascunho, com `vi.useFakeTimers()` para o debounce). Além disso, 3 testes de fluxo com Testing Library (mockando Firebase, sem tocar rede real): criar personagem (`NovoPersonagem.test.jsx`), editar atributos (`AtributosTab.test.jsx`), adicionar item ao inventário (`InventarioTab.test.jsx`).

### Rascunho em `localStorage` (seção 7.3) — ✅ implementado em 2026-07-19

A seção 7.3 abaixo descreve **salvar explícito + rascunho em `localStorage`**: enquanto o formulário não é salvo, os valores em edição ficam espelhados em `localStorage` (debounce de 400ms) para não se perder ao fechar/recarregar a aba sem querer. Implementado como:

- `src/hooks/useDraftLocalStorage.js` — hook genérico (`lerRascunho`/`salvarRascunho`/`limparRascunho`), chave por `personagemId` + aba (ex.: `rascunho_personagem_<id>_atributos`).
- `src/components/DraftBanner/DraftBanner.jsx` — banner "Você tem alterações não salvas — Restaurar/Descartar", em vez de restaurar ou descartar silenciosamente.
- Integrado nas duas abas que usam Formik com "Salvar" explícito — **`AtributosTab.jsx`** e **`PerfilTab.jsx`** (as únicas onde esse padrão se aplica; as demais abas gravam no Firestore a cada ação do usuário, sem estado "não salvo" intermediário). Cada uma extrai um subcomponente `*FormBody` que recebe o `formik` bag como prop só para poder chamar `useEffect` com segurança — hooks não podem ser chamados dentro da função `children` passada ao `<Formik>`, já que ela não é reconhecida como componente próprio pelo React nem pelo `eslint-plugin-react-hooks`.
- O rascunho só é gravado depois que o formulário realmente diverge do que foi carregado (`formik.dirty`), pra não criar um "rascunho" idêntico ao estado inicial assim que a aba abre.
- Ao salvar com sucesso, o rascunho correspondente é limpo.
- Testado de ponta a ponta com Playwright contra o Firebase real: editar sem salvar → recarregar → banner aparece → Restaurar recupera o valor → Salvar → rascunho some do `localStorage` → recarregar de novo → banner não aparece mais.

---

## 0. Contexto: dois repositórios, um único projeto Firebase

A migração **não** é "reescrever este repositório em React". O destino real é um **novo repositório separado** — o "site dos jogadores" — que:

- Compartilha o **mesmo projeto Firebase** (Auth + Firestore) de um projeto administrativo que **já existe e já está em produção**: "Re-Dungeon — Banco de Dados" (React 19 + Vite + MUI + Firebase). Esse projeto administrativo já gerencia, em coleções Firestore próprias, boa parte dos **catálogos de conteúdo** que hoje estão hardcoded neste repositório vanilla (raças, classes, itens, aptidões, condições, artes, veias astrais, divindades, origens, regras, entre outras — ver seção 4).
- **Não recria** essas telas de administração de catálogo — o site dos jogadores é **somente leitura** para tudo que não for o personagem do próprio usuário.
- **Não é responsável por popular esses catálogos.** As informações de referência (ex.: dados de Raças e Classes hoje hardcoded em `js/racas-data.js`/`js/classes-data.js` neste repositório) serão inseridas no Firestore **separadamente**, por outro processo/pessoa, usando o próprio projeto administrativo. O site dos jogadores só implementa a **leitura** dessas coleções — nunca a criação/seed delas.
- Adiciona **apenas uma coleção nova** ao Firestore compartilhado: `personagens`, com uma regra de segurança restringindo cada documento ao seu dono (`uid`).
- Reaproveita, **copiando os arquivos praticamente como estão**, a autenticação, o tema visual e os utilitários já validados no projeto administrativo (`firebase.js`, `AuthContext.jsx` simplificado, `ProtectedRoute.jsx`, `global.css`, `yupSchemas.js`, `useStableListKeys.js`) — ver `player-site-handoff.md` §4, §6 e §10 para o código exato.

Ou seja: este documento descreve como **portar as funcionalidades de jogo** descritas em `FUNCIONALIDADES.md` (atributos, status, aptidões, arts, inventário, veias astrais etc.) para dentro dessa arquitetura já definida — não como desenhar a arquitetura do zero.

---

## 1. Diagnóstico do site atual (o que não replicar)

A análise do código vanilla revelou dívida técnica típica de um projeto que cresceu sem framework de componentes/estado. Pontos a **não replicar** na reescrita:

1. **Duas arquiteturas de estado concorrentes**: `window.appState` (realmente usado) e `window.globalState` (mais bem desenhado, mas quase não usado) coexistem sem integração completa. No novo projeto, usar um único padrão de estado, consistente com o restante da família de projetos (ver seção 7).
2. **Zero reatividade real** — sincronização entre módulos feita por **polling** (`setInterval` de 300ms a 2000ms, em dezenas de arquivos) ou por **monkey-patching** de métodos de outros managers. Em React isso vira reatividade nativa via props/state/context — nenhum polling deve sobreviver à migração.
3. **Fragmentação de persistência**: dezenas de chaves de `localStorage` independentes, 3 databases IndexedDB diferentes, e pares de chaves **duplicadas com o mesmo dado**. O Firestore deve consolidar tudo em um **documento por personagem** mais subcoleções (seção 5).
4. **Padrão de modal reimplementado manualmente dezenas de vezes**. Vira componentes MUI (`Dialog`) reutilizáveis, seguindo o padrão já usado no projeto administrativo (`EntityViewDialog` etc.).
5. **Sistemas paralelos duplicados para "personagem" e "companheiro"**: Aptidões, Arts e Inventário têm implementações **inteiras e independentes** para o personagem principal e para cada companheiro. Como Companheiros não entra nesta fase (seção 2), esse problema específico fica adiado — mas o princípio (um único módulo genérico, não duas cópias) vale para qualquer extensão futura.
6. **Bancos de dados de conteúdo "legados" ao lado dos ativos** (`data/racas.js`/`data/classes.js`/`data/loja.js` parecem não estar mais conectados à UI). Isso deixa de importar de qualquer forma: os catálogos passam a vir do Firestore do projeto administrativo (seção 4), não de arquivos JS locais.
7. **Fórmulas de jogo duplicadas em mais de um arquivo** (ex. HP/Energia/Fadiga máximos calculados em dois lugares). Na reescrita, cada fórmula deve existir **uma única vez**, como função pura testável (Vitest, já usado no projeto irmão).
8. **Nenhuma conta de usuário hoje** — tudo local ao navegador, com export/import manual de `.json` como único "backup". A migração introduz **Auth + Firestore** como funcionalidade nova, não apenas troca de tecnologia.

---

## 2. Escopo desta migração

### 2.1 Decisões já tomadas (não reabrir)
- **Reputação (Fama/Terror) — implementada em 2026-07-22, mas em modelo diferente do site vanilla.** A versão descrita em `FUNCIONALIDADES.md` §5 (Fama/Temor globais, por Mundo/Região, com limiares fixos 6/11/21/31/46/61/76/91) **não foi portada** — ver seção "Decisões e desvios" abaixo para o modelo realmente implementado, por Origem.
- **Corpo Imortal não será implementado nesta fase.** Documentado em `FUNCIONALIDADES.md` §19, fora do roadmap.
- **Companheiros não serão implementados nesta fase.** Documentado em `FUNCIONALIDADES.md` §17 (e as seções que o referenciam — Aptidões de Companheiro em §9, Companheiro Arts em §10, Inventário isolado em §17), fora do roadmap.
- **Cultivação não será implementada nesta fase.** Documentado em `FUNCIONALIDADES.md` §18, fora do roadmap.
- **A barra de desbloqueio de Classes por Power Combat continua puramente informativa.** Não vira trava automática de seleção de classe — replica o comportamento atual (marcos visuais em 100/200/300 PC), sem bloquear a escolha. A única trava real permanece sendo o limite de 3 classes simultâneas.
- **Aptidões não concedem mais bônus numérico a atributos.** No site vanilla, vantagens de aptidão (níveis 1/3/5) somavam bônus aos atributos primários/secundários (`js/vantagens-aptidoes-system.js`, `js/aptidoes-bonus-sync.js`, `js/bonus-calculator.js`). Essa mecânica **não é portada**: Aptidões e suas Vantagens passam a ser **puramente narrativas/descritivas** — não alimentam mais nenhum campo `bonus` de atributo. Isso simplifica bastante o modelo de dados e elimina toda a cadeia de sincronização/recalculo que hoje existe entre Aptidões e Atributos.
- **Loja Rokmas / Menu de Itens usa a coleção `itens` já existente, filtrada por universo.** Não há mais um catálogo próprio de loja — a loja lê a coleção `itens` do Firestore, filtrando pelos itens cujo `universo` (ou campo equivalente de escopo) corresponde ao `universo` do personagem. Resolve a "decisão pendente" que havia na versão anterior deste documento.
- **Aba de Arts/Habilidades passa a ter 3 origens possíveis para cada Art do personagem**, em vez de só a criação autoral: (1) **criar uma Art única** para aquele personagem (fluxo autoral que já existe hoje — Núcleo/Art/Variante), (2) **escolher uma das habilidades da classe** do personagem (já existe hoje, ver `FUNCIONALIDADES.md` §12 — a classe injeta habilidades como Arts), ou (3) **escolher uma Art da coleção `artes`** do Firestore, também filtrada pelo `universo` do personagem. Resolve a "decisão pendente" sobre a coleção `artes` que havia na versão anterior deste documento.
- **Salvar é explícito, não autosave contínuo — mas com rascunho local.** Ver seção 7.3.
- **Dados de referência (raças, classes, itens, aptidões, condições, artes, veias astrais, divindades, origens, regras...) são inseridos no Firestore por um processo separado**, fora deste repositório e fora do escopo deste plano — este documento cobre apenas a **leitura** desses dados pelo site dos jogadores (seção 4) e a modelagem da coleção nova `personagens` (seção 5).
- **Não haverá importação de fichas antigas (`.json` exportado pelo site vanilla).** O site dos jogadores não terá uma ferramenta de conversão do backup legado — cada jogador cria os personagens do zero no site novo, preenchendo os dados diretamente pela ficha (Formik). O botão "Importar" do site atual (`FUNCIONALIDADES.md` §23) não é portado.

### 2.2 Dentro do escopo (portar nesta fase)
Atributos, Status (HP/Energia/Fadiga), Power Combat, Sorte/Fortuna (+ histórico), Condições, Imagem do personagem (via URL), Aptidões (sem bônus numérico — seção 2.1), Arts/Habilidades (autoral + habilidade de classe + catálogo `artes` por universo), Raças, Classes, Treinamento, Inventário, Loja da Trapaça, Loja Rokmas/Menu de Itens (via `itens` por universo), Veias Astrais, Códex Mágico, Popup de Informações do Jogador, Salvar (explícito + rascunho local).

### 2.3 Fora do escopo (backlog futuro, não portar agora)
| Sistema | Por quê fica de fora agora |
|---|---|
| Corpo Imortal | Decisão de produto — não implementar nesta fase |
| Companheiros (ficha, inventário isolado, aptidões/arts de companheiro, clonagem) | Decisão de produto — não implementar nesta fase |
| Cultivação (universal + Elder Gods/Boreal Line/Murim) | Decisão de produto — não implementar nesta fase |
| Importação de ficha antiga (`.json` do site vanilla) | Decisão de produto — sem ferramenta de conversão; personagens começam do zero no site novo |

A modelagem do documento `personagens` (seção 5) deixa esses campos comentados/reservados para que, quando algum deles voltar ao roadmap, a estrutura de dados não precise ser redesenhada do zero.

---

## 3. Stack obrigatória (herdada do projeto irmão)

Definida em `player-site-handoff.md` §5 — **não é uma escolha em aberto**, é a stack já usada e validada no projeto "Re-Dungeon — Banco de Dados", e deve ser replicada aqui por consistência:

| Camada | Escolha | Observação |
|---|---|---|
| Build | **Vite** | |
| UI | **React 19** (componentes funcionais + Hooks) | sem TypeScript — o projeto irmão usa **PropTypes** |
| Componentes visuais | **Material-UI (`@mui/material`)** | reaproveitar tema/paleta do projeto administrativo |
| Estilização | **Styled Components** | + `src/common/styles/global.css` (variáveis `--color-primary`, `--bg-card`, `--text-muted` etc.) copiado do projeto atual, para manter o mesmo visual dark/glassmorphism |
| Roteamento | **React Router DOM v7** | |
| Formulários/validação | **Formik + Yup** | reaproveitar `src/common/utils/yupSchemas.js` (`nomeSchema`, `campoCurtoSchema`, `descricaoSchema`, `urlImagemSchema`) |
| Dados remotos | **Firebase Firestore** (mesmo projeto do site administrativo) | **sem Firebase Storage** — ver seção 6 |
| Autenticação | **Firebase Auth** (mesmo projeto) — e-mail/senha, cadastro e Google | código pronto em `player-site-handoff.md` §4 |
| Tipagem de props | **PropTypes** | não introduzir TypeScript |
| Lint/format | **ESLint** (`eslint-plugin-jsx-a11y`, `eslint-config-prettier`) + **Prettier** | `no-console` e `react-hooks/exhaustive-deps` como erro |
| Testes | **Vitest** + **Testing Library** | primeira suíte de testes do "universo" ReDungeon deve nascer aqui, cobrindo as fórmulas puras (seção 7.2) |

Versões de referência (mesmas do projeto atual, para evitar incompatibilidade se algum código for copiado entre repositórios):
```json
"@mui/material": "^9.1.2",
"firebase": "^12.15.0",
"formik": "^2.4.9",
"react": "^19.2.7",
"react-router-dom": "^7.18.0",
"styled-components": "^6.4.3",
"yup": "^1.7.1"
```

**O que isso substitui, em relação ao que era cogitado antes desta revisão**: nada de Zustand/Redux, nada de React Hook Form + Zod, nada de TypeScript, nada de CSS Modules com design system próprio, nada de Firebase Storage. O objetivo é o novo site parecer "o mesmo produto" que o painel administrativo, não uma stack paralela.

---

## 4. Dados de referência já existentes no Firestore — não duplicar, não popular

O projeto administrativo já mantém, no mesmo Firestore, as coleções abaixo (formato `{ id, ...campos, createdAt, updatedAt }`, leitura liberada a qualquer usuário autenticado via `allow read: if isAuth();`):

`classes`, `materiais`, `racas`, `itens`, `receitas`, `condicoes`, `artes`, `origens`, `regras`, `cardflux`, `veiasAstrais`, `divindades`, `aptidoes`, `Universo`.

O site dos jogadores **só precisa das funções `get*` (leitura)** dessas coleções — nunca `add*`/`update*`/`remove*`, e nunca um script de seed a partir deste repositório vanilla (seção 2.1 — o preenchimento desses dados é responsabilidade de outro processo). A tabela abaixo mapeia cada sistema de `FUNCIONALIDADES.md` para a coleção correspondente:

| Sistema (FUNCIONALIDADES.md) | Coleção existente | Situação |
|---|---|---|
| §11 Raças | `racas`, filtrada por `universo` | ✅ mapeamento direto — trocar `js/racas-data.js` por `getRacasPorUniverso(universoId)` |
| §12 Classes | `classes`, filtrada por `universo` | ✅ mapeamento direto — trocar `js/classes-data.js` por `getClassesPorUniverso(universoId)` |
| §9 Aptidões (catálogo) | `aptidoes`, filtrada por `universo` | ✅ mapeamento direto — trocar `js/aptidoes-db.js` por `getAptidoesPorUniverso(universoId)`. Schema **simplificado**: como aptidões não concedem mais bônus numérico a atributos (seção 2.1), cada documento de `aptidoes` só precisa de nome/descrição + o texto narrativo de Vantagem por nível — sem campos de fórmula/valor de bônus |
| §7 Condições | `condicoes`, filtrada por `universo` | ✅ mapeamento direto — trocar `js/rd-cond-sistema.js` (catálogo) por `getCondicoesPorUniverso(universoId)` |
| §20 Veias Astrais (árvore) | `veiasAstrais`, filtrada por `universo` + `divindades` | ✅ boa aderência — a árvore de 5 constelações × 10 nós é dado de referência puro (`getVeiasAstraisPorUniverso(universoId)`); `divindades` cobre as 5 divindades temáticas (Arty/Aune/Ephelias/Nishi/Hestia). O que fica **por personagem** é só: quais nós foram desbloqueados e quanto PC foi gasto |
| §14 Inventário (itens) | `itens`, filtrada por `universo` | ✅ mapeamento direto para o catálogo de itens — o inventário do personagem passa a ser uma lista de referências `{itemId, quantidade}`, não mais objetos duplicando nome/descrição/imagem |
| Inventário (materiais/receitas) | `materiais`/`receitas`, filtradas por `universo` | ✅ **resolvido (2026-07-21)**: mesmo padrão de cópia própria de §14 — subcoleções `materiaisInventario`/`receitasInventario` em `personagens/{id}`, cada doc com `origem: 'autoral' \| 'catalogo'` + `materialId`/`receitaId` opcional. Não fazem parte do cálculo de espaço (`calcularEspacoInventario`), pois nenhuma das duas coleções tem campo de peso |
| §16 Menu de Itens / Loja Rokmas | `itens`, filtrada por `universo` | ✅ **resolvido**: a loja não tem mais catálogo próprio — lê `itens` filtrando por `where('universo', '==', personagem.universo)` |
| §10 Arts/Habilidades (Núcleos/Arts/Variantes) | `artes`, filtrada por `universo`, **+ habilidades da classe do personagem** | ✅ **resolvido**: cada Art do personagem agora tem 3 origens possíveis — (1) autoral (Núcleo/Art/Variante criados livremente, como hoje), (2) escolhida entre as habilidades da classe do personagem (já lida de `classes`), (3) escolhida da coleção `artes` filtrada por `where('universo', '==', personagem.universo)`. Ver modelagem em §5 |
| §22 Popup Info do Jogador (campo Origem) | `origens` | ✅ mapeamento direto — `origem` no documento `personagens` referencia um id de `origens` |
| Reputação (Fama/Terror) — **modelo novo, não é o do §5 antigo** | `origens`, campo `reputacao: { fama: [{quantidade, efeito}], terror: [{quantidade, efeito}] }` | ✅ **implementado em 2026-07-22**: cada origem no catálogo carrega sua própria lista de limiares/efeitos de Fama e de Terror; o personagem só guarda os números atuais (campo `reputacoes`, seção 5) |
| §21 Códex Mágico | `regras` (candidato) | ⚠️ **oportunidade, não obrigatório**: hoje é texto estático em `js/codex-magico.js`. Migrar esse conteúdo para a coleção `regras` deixaria o texto editável pelo painel administrativo sem novo deploy do site dos jogadores — avaliar com o time se vale a pena para esta fase ou se fica como texto estático mesmo |
| §17 Companheiros, §18 Cultivação | — | Fora do escopo desta fase (seção 2.3) — não relevante agora |
| §15 Loja da Trapaça, §6 Sorte/Fortuna, §13 Treinamento | nenhuma coleção equivalente | Mecânicas de jogo específicas do personagem (saldo, histórico, XP) — permanecem embutidas no documento/subcoleções de `personagens`, sem catálogo de referência |
| `cardflux` | — | Coleção existente **sem funcionalidade correspondente** em `FUNCIONALIDADES.md` — provavelmente um sistema futuro (jogo de cartas?) fora do escopo atual. Não assumir mapeamento nem duplicar; apenas não usar por enquanto |

### 4.1 O campo `universo` é a chave de escopo transversal — **confirmado**
`racas`, `classes`, `condicoes`, `aptidoes`, `veiasAstrais`, `itens` e `artes` são **todas** filtradas pelo `universo` do personagem antes de aparecer como opção — esse é o mesmo conceito de "universo temático" que hoje agrupa Raças/Classes em pastas no site vanilla (Re'Geron, The Chaotical Gate, Cultivo, One Piece, Bleach, A Crônica dos Varkhan). `divindades` e `regras` não são mencionadas como filtradas — tratar como compartilhadas entre universos, salvo indicação em contrário do painel administrativo.

**`origens` também tem campo `universo`** (confirmado inspecionando documentos reais em 2026-07-22) — `getOrigensPorUniverso(universoId)` foi adicionada para a Reputação (acima) filtrar por ele. `getOrigens()` (sem filtro, usada pelo seletor de Origem em `PerfilTab.jsx`) **não foi alterada** para não mudar o comportamento de uma tela fora do escopo desta mudança — mas é candidata a virar `getOrigensPorUniverso` numa limpeza futura, já que hoje lista origens de todos os universos misturadas.

### 4.2 Convenção id × nome de exibição — **confirmada**
Em todo campo que referencia outra coleção (`universo`, `raca`, `classes`, `origem`, ids dentro de `inventario`/`aptidoesAdquiridas`/`arts`/etc.), o documento `personagens` **sempre salva o `id`** do documento referenciado — nunca o nome como string solta. No front-end, o componente responsável por exibir esse campo resolve o `id` para o **campo `Nome`** do documento correspondente (buscado via `get*`/`getPorUniverso`, com cache local simples por tela — ex.: um `Map<id, nome>` montado a partir da lista já carregada para popular o `<Select>`). Isso vale para `universo` também: salva-se o `id` do documento em `Universo`, e a UI exibe o `Nome` desse documento (ex. no seletor de universo do personagem, e em qualquer lugar que mostre "Universo: Re'Geron").

---

## 5. Modelagem da coleção `personagens`

Único documento novo a ser criado no Firestore compartilhado. Segue o schema-base sugerido em `player-site-handoff.md` §3.2, **estendido** para cobrir o restante da ficha descrita em `FUNCIONALIDADES.md` dentro do escopo desta fase (seção 2.2). Mantém a convenção `{ id, uid, ...campos, createdAt, updatedAt }` do resto do projeto.

```js
{
  id: string,                 // gerado pelo Firestore
  uid: string,                 // dono — obrigatório, imutável após criação

  // ── campos do schema-base do handoff ──────────────────────────────
  nome: string,                 // nomeSchema
  raca: string,                 // id em `racas` (opcional)
  corpoEspecial: string,          // id em `corposEspeciais` (opcional) — implementado 2026-07-23, ver "Decisões e desvios"
  classes: string[],             // ids em `classes` — até 3 (multiclasse, FUNCIONALIDADES.md §12)
  origem: string,                // id em `origens` (opcional)
  universo: string,              // id em `Universo` — sempre o id salvo; o front resolve para o campo `Nome`
                                  // do documento `Universo` na exibição (seção 4.2). Define o escopo de
                                  // `racas`/`classes`/`condicoes`/`aptidoes`/`veiasAstrais`/`itens`/`artes` (seção 4.1)
  atributosBase: { forca, vitalidade, agilidade, inteligencia, percepcao, sorte },   // number
  atributosBonus: { forca, vitalidade, agilidade, inteligencia, percepcao, sorte },  // number — editável manualmente
                                  // (ex.: bônus de raça/evento); NÃO é mais alimentado por Aptidões (seção 2.1)
  atributosExtra: { forca, vitalidade, agilidade, inteligencia, percepcao, sorte },  // number
  // inventário: ver subcoleção `itensInventario` na seção 5.1 (deixou de ser array embutido)
  linkImagem: string,            // urlImagemSchema — ver seção 6, sem upload/Storage
  descricao: string,             // descricaoSchema — história/aparência

  // ── extensões para cobrir o restante da ficha (FUNCIONALIDADES.md, dentro do escopo — §2.2) ─
  jogadorInfo: {
    titulo, afiliacao, statusNarrativo, notasAdicionais, background /* html */
  },
  secundariosBase, secundariosExtra, secundariosBonus: {   // mesmo padrão dos primários
    prontidao, ataque, defesa, reacao, precisao, evasao
  },
  status: {
    hp:      { base, extra, bonus },
    energia: { base, extra, bonus },
    fadiga:  { base, extra, bonus }
  },
  sorte: { fortunaAtual: number, ultimaRolagemData: string /* YYYY-MM-DD */ },
  treinamento: { [atributo]: { xpAtual: number, nivel: number } },
  condicoesAtivas: [ { condicaoId /* ref `condicoes` */, stack, duracaoRestante, aplicadoEm } ],
  veiasAstrais: { powerCombatGasto: number, nosDesbloqueados: [nodeId /* ref `veiasAstrais` */] },
  lojaTrapaça: { saldoFortuna, efeitosAtivos: [...], historicoCompras: [...] },
  lojaRokmas:  { saldoRokmas, historicoCompras: [...] },   // itens comprados vêm de `itens` filtrada por `universo`
  reputacoes: { [origemId]: { fama: number, terror: number } },   // implementado 2026-07-22 — ver seção 2.1/4
  companheiroDe: string | null,   // implementado 2026-07-22 — id de outro doc `personagens`, se este for um Companheiro (ver seção 2.1/4)
  nivel: {   // implementado 2026-07-23 — nível geral do personagem, ver "Decisões e desvios" acima
    atual: number,                          // começa em 0
    xpAtual: number,                        // progresso rumo ao próximo nível (não é XP total de carreira)
    pontosPrincipaisDisponiveis: number,    // pool a distribuir entre os 5 principais (exceto Sorte)
    pontosSecundariosDisponiveis: number,   // pool a distribuir entre os 6 secundários
    historico: {   // só o que veio do sistema de Nível — "Resetar Nível" usa isso pra descontar
                    // exatamente esses valores de atributosBonus/secundariosBonus, sem tocar em
                    // bônus adicionados manualmente na aba Atributos
      principais: { [chave]: number /* forca, vitalidade, agilidade, inteligencia, percepcao */ },
      secundarios: { [chave]: number /* prontidao, ataque, defesa, reacao, precisao, evasao */ },
      sorte: number,
    },
  },
  cultivo: {   // implementado 2026-07-23, generalizado p/ qualquer universo em 2026-07-28, virou mapa
               // multi-sistema em 2026-07-29 — Sistema de Cultivo. Menu lateral mostra "Cultivo" sempre;
               // getReinosCultivo(personagem.universo, subUniverso) filtra a trilha pelo universo do
               // personagem (§ storage.js). Universos com múltiplos sistemas paralelos (ex.: Cultivo →
               // "Doupo Cangqiong", "Martial Peak" etc., campo `SubUniversos` do doc do universo em
               // `Universo`) exigem escolher um sistema antes de ver a trilha; universos sem esse campo
               // vão direto pra trilha (Reinos com `subUniverso: ''`) — a menos que esses Reinos formem
               // mais de uma trilha (várias raízes com reinoAnterior ''): aí cada trilha vira um sistema
               // com chave = id do Reino raiz. Mapa keyed por subUniverso / id da raiz (ou 'principal'
               // pro universo de trilha única) — cada chave guarda a progressão independente
               // daquele sistema, permitindo cultivar em mais de um sistema/subUniverso ao mesmo tempo
               // sem perder progresso ao trocar de aba no modal (antes era um objeto único, e trocar de
               // subUniverso zerava a progressão anterior). Guarda o mínimo por sistema; estrelas/Pico
               // são DERIVADOS do catálogo `reinosCultivo` via calcularProgressoCultivo
               // (common/utils/formulas.js).
    [subUniverso: string]: {
      reinoId: string,     // id do doc de `reinosCultivo` do Reino atual naquele sistema ("" → 1º Reino da trilha)
      xpAtual: number,     // Cultivo acumulado no Reino atual daquele sistema (0..quantidadeSubReinos*experienciaPorSubReino;
                            // satura no Pico — a Ruptura/Tribulação é manual e zera este valor no novo Reino)
    },
  },

  // reservado para quando estes sistemas voltarem ao roadmap (não usar ainda — seção 2.3)
  // corpoImortal: { dantian, meridianos, refino, marEspiritual, melhoriasDesbloqueadas: [...] },
  // cultivacao: { universal: {...}, elderGods: {...}, borealLine: {...}, murim: {...} },

  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

### 5.1 Subcoleções
Listas que crescem sem limite previsível ao longo de uma campanha ficam em subcoleção, para não esbarrar no limite de 1MB por documento e para permitir query/paginação:

```
personagens/{personagemId}/aptidoesAdquiridas/{aptidaoId}
  nivel: number     // referencia `aptidoes`; sem campo de bônus — Vantagens são só texto narrativo (seção 2.1)

personagens/{personagemId}/nucleos/{nucleoId}
  nome, tipo: string           // tipo é um dos valores de TIPO_ART_OPTIONS (Ofensiva, Defensiva, ...)
  bonus: string                 // opcional, texto curto — exibido como "Essência:" no card
  descricao: string              // texto longo — exibido na seção "✨ Essência" do card
  imagem: string                  // URL opcional (sem Firebase Storage — ver seção 6)
  classeId: string                 // opcional — presente só quando o Núcleo foi criado automaticamente ao
                                     //   escolher uma classe (ClasseModal.jsx); evita recriar o Núcleo da mesma classe

personagens/{personagemId}/arts/{artId}
  origem: 'autoral' | 'classe' | 'catalogo',
  nucleoId: string    // obrigatório em QUALQUER origem — referencia um doc de `nucleos` acima
  imagem: string        // URL opcional
  ativa: boolean
  cantico: string          // opcional — texto do verso/encantamento recitado
  circuloMagico: string     // opcional — ex.: "12º", "Nenhum"
  condicoesAplicadas: string[]  // opcional — ids de `condicoes` (mesmo catálogo somente-leitura da aba
                                  //   Condições, filtrado por universo via getCondicoesPorUniverso)
  // se origem === 'autoral': campos completos (tipo, dominio, tipoAcao, recarga, duracao,
  //   alcance, alvos, custo, dados, descricao), como hoje em `redungeon_character`
  // se origem === 'classe': { classeId, habilidadeId, nome, descricao } — referencia a habilidade já definida em `classes`
  //   (campos alcance/alvos/custo/recarga/dados/duracao/tipoAcao remapeados dos nomes próprios da
  //   habilidade — alvo/acao — quando existirem; `dados` já usa o mesmo nome dos dois lados; as
  //   habilidades de classe não têm cantico/circuloMagico/condicoesAplicadas)
  // se origem === 'catalogo': { arteId, nome } — referencia um documento em `artes` (filtrado por `universo`),
  //   + qualquer campo (dominio/custo/dados/recarga/duracao/alcance/alvos/descricao/imagem/cantico/
  //   circuloMagico) que o item do catálogo já tiver, copiado na hora de escolher — `acao` vira `tipoAcao`,
  //   `classificacao` vira `tipo` (o catálogo usa `tipo` pra outra coisa — recurso gasto tipo "Fadiga", não
  //   a classificação Ofensiva/Defensiva/etc.), e `condicoesAplicadas` (array de objetos completos de
  //   condição no catálogo) vira array só dos ids, resolvidos contra `condicoes` na hora de exibir

personagens/{personagemId}/variantes/{varianteId}
  artId: string        // obrigatório — a Art base (personagens/{personagemId}/arts/{artId})
  nome, tipo, tipoAcao: string
  dominio: number        // sempre MENOR que o domínio da Art base (dominioVarianteValido em common/utils/formulas.js)
  custo, recarga, dados, duracao, alcance, alvos, descricao, imagem: string
  // não conta no limite de Arts ativas — vive numa coleção própria

personagens/{personagemId}/itensInventario/{itemInventarioId}
  origem: 'autoral' | 'catalogo',
  itemId: string | null   // só proveniência/rastreio quando origem === 'catalogo' — nunca relido pra exibir
  nome, qualidade, tipo, dados, extra: string     // `dados` é a "Roll" (ex.: "2d4+3")
  nivelAtual: number, nivelMaximo: number | null
  pesoUnitario: number, bonusEspaco: number        // bonusEspaco = mochila/armazenamento (opcional)
  linkImagem: string                                 // URL opcional
  descricao: string                                    // opcional — flavor text geral do item
  habilidadesEspeciais: [ { nome, descricao } ]          // opcional
  quantidade: number, equipado: boolean
  // cópia própria do personagem, nunca uma referência viva ao catálogo `itens` — o jogador
  // edita livremente (todos os campos acima) sem que isso altere o doc do catálogo. Ao
  // escolher do catálogo, os campos são copiados 1:1 (mesmos nomes do doc de `itens`).

personagens/{personagemId}/historicoSorte/{eventoId}
  tipo, descricao, valor, timestamp

// Companheiros NÃO são uma subcoleção — são outro doc top-level de `personagens`,
// com `companheiroDe` apontando pro id do personagem "base" (ver seção 5 e 2.1/4).
```

Listas pequenas e naturalmente limitadas (condições ativas, histórico de sorte truncado, classes selecionadas — máx. 3) ficam como array embutido no documento principal, como no schema acima.

### 5.2 `service/storage.js`
Seguir **exatamente** o padrão genérico já usado no projeto administrativo (`getFirestoreItems`/`addFirestoreItem`/`updateFirestoreItem`/`removeFirestoreItem` por trás de wrappers finos), mas:
- `getPersonagens()` deve filtrar por `where('uid', '==', currentUser.uid)` **na query**, não buscar tudo e filtrar no cliente (personagens de outros usuários não devem nem trafegar até o navegador).
- `getUniverso()`, `getOrigens()` e `getDivindades()` são **somente leitura**, sem filtro por universo (seção 4.1) — reaproveitar o padrão genérico já existente sem adicionar `add*`/`update*`/`remove*` para essas coleções.
- `getRacasPorUniverso(universoId)`, `getClassesPorUniverso(universoId)`, `getCondicoesPorUniverso(universoId)`, `getAptidoesPorUniverso(universoId)`, `getVeiasAstraisPorUniverso(universoId)`, `getItensPorUniverso(universoId)` e `getArtesPorUniverso(universoId)` são variações filtradas (`where('universo', '==', universoId)`), todas **somente leitura**, usadas nas respectivas telas de seleção assim que o `universo` do personagem estiver definido.

---

## 6. Imagens — apenas URL, sem Firebase Storage

O stack do handoff **não inclui Firebase Storage** (nem nas dependências, nem nas variáveis de ambiente além do `storageBucket` padrão do config). O padrão a seguir é o mesmo já usado no resto do projeto: campo de texto validado por `urlImagemSchema` (Yup), igual ao `linkImagem` do schema de `personagens`.

Isso é, na prática, uma simplificação em relação ao comportamento atual do site vanilla, que hoje suporta **upload local** (convertido para base64, comprimido, salvo em IndexedDB) **além de** URL externa. Para esta fase da migração:
- Suportar **somente URL externa** (ex.: Imgur) para a imagem do personagem — consistente com `urlImagemSchema` e com o que o painel administrativo já faz para `itens`/`racas`/`classes`.
- **Não portar** a lógica de upload/compressão/IndexedDB (`image-compressor.js`, `imagem-otimizacao.js`, `image-db-manager.js`, `imagem-storage-manager.js`) — é código que deixa de ter função nesta arquitetura.
- Se upload direto de arquivo vier a ser um requisito real no futuro, isso significa **adicionar Firebase Storage** como uma decisão de produto nova — não assumir isso como parte desta migração.

---

## 7. Estado no frontend e cálculos derivados

### 7.1 Sem gerenciador de estado global novo
O projeto irmão não usa Redux/Zustand/Context complexo — o padrão observado é: página busca dados via `service/storage.js`, mantém em `useState`/Formik, formulário edita com Formik+Yup, salva com `updatePersonagem`/`addPersonagem`. Para manter consistência, **não introduzir Zustand/Redux** aqui. Usar:
- `useState`/`useEffect` (ou um `React.Context` simples, escopado à página de edição de personagem) para os dados carregados do Firestore.
- **Formik** como dono do estado do formulário de edição da ficha (provavelmente um Formik por aba/seção grande — Atributos+Status, Inventário, Arts etc. — para não ter um único formulário gigante).
- Cálculos derivados (ver 7.2) chamados a partir dos `values` do Formik em `useMemo`, não em `setInterval`.

### 7.2 Fórmulas puras — o coração da lógica de jogo
Independente da escolha de state management, as fórmulas descritas em `FUNCIONALIDADES.md` devem ser extraídas para funções puras, testadas com Vitest, e chamadas sob demanda (nunca por polling):

```js
calcularSecundarios(primariosTotais)                         // §2
calcularStatusMaximos(primariosTotais, statusBase)            // §3
calcularPowerCombat(primariosTotais, secundariosTotais)        // §4
calcularRolagemFortuna(sorteTotal)                              // §6
calcularLimiteAptidoes(primariosTotais, ganhas)                  // §9
calcularLimiteArts(primariosTotais)                                // §10
calcularEspacoInventario(primariosTotais, itensNaoEquipados)        // §14
calcularResultadoTreino(nivel, horas, bonusAptidao, bonusSorte, bonusMestre)  // §13
```
Note que **não existe mais** `calcularBonusDeAptidoes` — aptidões deixaram de conceder bônus numérico a atributos (seção 2.1); o campo `atributosBonus`/`secundariosBonus` do documento `personagens` passa a ser só um ajuste manual (ex.: bônus de raça, efeito temporário concedido pelo mestre), não algo derivado automaticamente do catálogo de aptidões.

Essas funções não dependem de React nem de Firebase — só de números e do catálogo já carregado — o que as torna o ponto de partida ideal para a primeira suíte de testes automatizados do "universo" ReDungeon.

### 7.3 Salvar: submit explícito + rascunho em localStorage
Decisão confirmada: **não replicar** o autosave contínuo do site vanilla (que grava a cada 2s em background). O padrão a seguir é:
- **Persistência real (Firestore) é sempre por ação explícita do usuário** — botão "Salvar" por aba/seção, disparando `updatePersonagem` (Formik `onSubmit`), igual às demais telas administrativas do projeto irmão.
- **Enquanto o formulário não foi salvo**, os valores em edição ficam espelhados em `localStorage` (chave por `personagemId` + aba, ex. `rascunho_personagem_<id>_atributos`) a cada mudança de campo (debounce curto, ex. 300-500ms, só para não gravar a cada tecla). Isso evita perda de trabalho em caso de fechar a aba/recarregar a página sem salvar.
- Ao abrir a tela de edição, se existir um rascunho em `localStorage` mais recente que o documento carregado do Firestore, avisar o usuário (ex.: banner "Você tem alterações não salvas — restaurar?") em vez de descartar silenciosamente.
- Ao salvar com sucesso no Firestore, **limpar o rascunho correspondente** do `localStorage` (a fonte de verdade volta a ser só o Firestore).
- Isso é bem mais simples que o mecanismo de auto-save do site legado (sem `setInterval`, sem múltiplas cópias de estado) e ainda protege contra perda de dados por acidente — o melhor dos dois comportamentos sem herdar a complexidade do sistema atual.

---

## 8. Autenticação e regras de segurança

**Não redesenhar isso** — `player-site-handoff.md` §4 já traz o código completo e pronto para copiar:
- §4.1 `src/service/firebase.js` — igual, byte a byte, ao do projeto administrativo (mesmo `firebaseConfig` via `.env`, mesmo projeto Firebase).
- §4.2 `src/context/AuthContext.jsx` — versão **simplificada** (sem `usePermissions`/`isAdmin`/`allowedUniversos`, que só fazem sentido no painel administrativo).
- §4.3 `src/components/ProtectedRoute/ProtectedRoute.jsx` — adaptado para **redirecionar para `/login`** (em vez de mostrar "Acesso Restrito"), já que aqui não existe conteúdo público.

Regra do Firestore para a nova coleção (adicionar ao `firestore.rules` **do projeto administrativo**, que é quem controla o Firestore compartilhado — o novo repositório não tem esse arquivo):
```
match /personagens/{personagemId} {
  allow read:   if isAuth() && resource.data.uid == request.auth.uid;
  allow create: if isAuth() && request.resource.data.uid == request.auth.uid;
  allow update: if isAuth() && resource.data.uid == request.auth.uid
                && request.resource.data.uid == request.auth.uid;
  allow delete: if isAuth() && resource.data.uid == request.auth.uid;
}
```
Subcoleções (`aptidoesAdquiridas`, `arts`, `historicoSorte`) herdam a mesma checagem, mas como regra do Firestore não herda automaticamente para subcoleções, cada uma precisa do próprio bloco `match /personagens/{personagemId}/{subcolecao}/{docId}` com a mesma condição (validar o `uid` lendo o documento pai via `get()`).

Não é necessário nenhum bloco de regra novo para `racas`/`classes`/`itens`/etc. — já têm `allow read: if isAuth();`, e a escrita já é bloqueada para quem não tem `userPermissions` (todo jogador comum).

⚠️ Como no handoff: nunca confiar apenas na UI para essa restrição — a regra do Firestore é a camada que realmente impede um jogador de ler/editar o personagem de outro.

---

## 9. Estrutura de pastas e componentes

Seguir a mesma organização do projeto administrativo (`player-site-handoff.md` §7), adaptada às páginas deste site:

```
src/
├── assets/
├── common/
│   ├── constants/        # routes.js, navItems.js
│   ├── styles/           # global.css (copiado do projeto atual)
│   └── utils/             # yupSchemas.js (copiado), formulas.js (NOVO — seção 7.2)
├── components/            # Header, Layout, ProtectedRoute, Modal/Dialog genérico, RarityBadge...
├── context/
│   └── AuthContext.jsx    # simplificado, sem isAdmin/universos
├── hooks/
│   ├── useStableListKeys.js
│   └── useDraftLocalStorage.js   # NOVO — rascunho local descrito na seção 7.3
├── pages/
│   ├── Login/
│   └── Personagens/
│       ├── Personagens.jsx       # "Meus Personagens", grid filtrado por uid
│       ├── NovoPersonagem.jsx    # criar/editar — Formik por aba
│       ├── FichaPersonagem/       # sub-rotas ou abas: Atributos, Status, Aptidoes, Arts,
│       │                          # Inventario, Treinamento, LojaTrapaça, LojaRokmas,
│       │                          # Sorte, Condicoes, VeiasAstrais, Codex, InfoJogador
│       ├── styles.js
│       └── utils.js               # schema Yup da ficha
├── routes/
│   └── index.jsx
└── service/
    ├── firebase.js         # copiado do projeto atual
    └── storage.js           # getPersonagens/add/update/remove + get* de leitura das coleções de referência
```

Cada "feature" do jogo dentro do escopo (Atributos, Aptidões, Arts, Inventário, Treinamento, as duas Lojas, Sorte, Condições, Veias Astrais, Códex, Info do Jogador) vira uma seção/aba dentro de `FichaPersonagem/`, não uma página de rota isolada — mantendo a mesma sensação de "SPA de abas" do site atual, mas dentro do modelo de páginas do React Router. **Companheiros e Cultivação não têm pasta nesta fase** (seção 2.3).

### 9.1 Componentes reutilizáveis a criar desde já
Mesmo sem Companheiros nesta fase, vale desenhar o componente de Inventário e o de Aptidões/Arts já parametrizados por um "caminho de dados" (`personagens/{id}/...`) em vez de referenciar `personagens/{id}` diretamente no código — isso não custa nada agora e evita reescrever esses componentes quando Companheiros voltar ao roadmap.

---

## 10. Roadmap de migração em fases

### Fase 0 — Fundação (checklist de `player-site-handoff.md` §10)
- `npm create vite@latest` + instalar dependências da seção 3 (não criar projeto Firebase novo — é o mesmo do painel administrativo).
- Copiar `.env` com as mesmas credenciais Firebase do projeto atual.
- Copiar `src/common/styles/global.css`, `src/common/utils/yupSchemas.js`, `src/hooks/useStableListKeys.js`.
- Implementar `firebase.js`, `AuthContext.jsx` e `ProtectedRoute.jsx` exatamente como em `player-site-handoff.md` §4.
- Construir `/login` e o layout base (Header, navegação).
- Adicionar o bloco de regra `personagens` (seção 8) ao `firestore.rules` **do projeto administrativo** e fazer `firebase deploy --only firestore:rules` **a partir daquele repositório** (este repositório novo não controla o Firestore).

### Fase 1 — Camada de leitura de dados de referência
- Implementar em `service/storage.js` as funções somente-leitura `getUniverso`, `getOrigens`, `getDivindades` (sem filtro) e `getRacasPorUniverso`, `getClassesPorUniverso`, `getCondicoesPorUniverso`, `getAptidoesPorUniverso`, `getVeiasAstraisPorUniverso`, `getItensPorUniverso`, `getArtesPorUniverso` (filtradas por `universo`, seção 4.1).
- Implementar a convenção id×nome de exibição (seção 4.2) num helper único (ex. `resolveNome(colecaoCarregada, id)`), reaproveitado por todos os `<Select>`/labels que referenciam outra coleção.
- **Não** escrever nenhum script/ferramenta para popular essas coleções a partir dos arquivos deste repositório vanilla — isso é feito por outro processo (seção 2.1/4).

### Fase 2 — Núcleo da ficha (Atributos + Status + Power Combat)
- Implementar `common/utils/formulas.js` com as fórmulas da seção 7.2, com testes Vitest cobrindo os casos descritos em `FUNCIONALIDADES.md` §2-§4.
- Tela/aba de Atributos (grid de primários/secundários, formulário Formik) e Status, lendo/escrevendo em `personagens`.
- Este é o sistema mais crítico — todo o resto depende dos totais de atributos.

### Fase 3 — Progressão de personagem
- Raças, Classes (multiclasse até 3, barra de PC **informativa apenas** — seção 2.1), Treinamento.
- Sorte/Fortuna (+ histórico), Condições, Imagem do personagem (URL).

### Fase 4 — Aptidões e Arts
- Aptidões (sem bônus numérico — seção 2.1), lendo o catálogo de `aptidoes`.
- Arts com as 3 origens (seção 2.1/5): autoral, habilidade de classe, catálogo `artes` por universo.

### Fase 5 — Inventário e economia
- Inventário genérico (referenciando `itens` + quantidade).
- Loja da Trapaça (Fortuna, sem catálogo de referência) e Loja Rokmas (lendo `itens` por universo).

### Fase 6 — Veias Astrais
- Consumindo `veiasAstrais` + `divindades`; maior esforço de UI desta fase — pan/zoom sobre árvore de nós.

### Fase 7 — Conteúdo de apoio e portabilidade
- Códex Mágico (avaliar migrar para `regras`, seção 4).
- Popup Info do Jogador (campo `origem` referenciando `origens`; editor rich text para `background` — considerar `TipTap`/`Lexical`).

### Fase 8 — Polimento e lançamento
- Revisão das regras de segurança do Firestore (seção 8).
- Testes Vitest das fórmulas (seção 7.2) + testes de fluxo (criar personagem, editar atributos, criar item).
- Deploy (GitHub Pages, via GitHub Actions — ver `.github/workflows/deploy.yml`).

### Backlog futuro (fora desta migração)
Reputação, Corpo Imortal, Companheiros, Cultivação — ver seção 2.3. Quando alguma dessas voltar ao roadmap, reabrir a modelagem comentada na seção 5 e criar uma fase própria, seguindo o mesmo padrão de leitura de catálogo (se aplicável) + campos/subcoleção em `personagens`.

---

## 11. Riscos, decisões pendentes e pontos de atenção

### Decisões já resolvidas (não reabrir)
- ✅ Corpo Imortal, Companheiros e Cultivação ficam fora desta fase (seção 2). Reputação **saiu dessa lista em 2026-07-22** — foi implementada, mas em modelo por Origem (não o antigo Mundo/Região), ver seção 2.1.
- ✅ Barra de desbloqueio de Classes por Power Combat permanece apenas informativa, sem virar trava automática (seção 2.1).
- ✅ Aptidões não concedem mais bônus numérico a atributos — Vantagens são só texto narrativo (seção 2.1).
- ✅ Loja Rokmas lê `itens` filtrada por `universo` do personagem — sem catálogo próprio (seção 2.1/4).
- ✅ Arts do personagem têm 3 origens: autoral, habilidade de classe, ou catálogo `artes` filtrado por `universo` (seção 2.1/5).
- ✅ Salvar é explícito (Formik `onSubmit` → Firestore), com rascunho espelhado em `localStorage` enquanto não salvo (seção 7.3).
- ✅ Sem Firebase Storage — imagens só por URL (seção 6).
- ✅ Sem Zustand/Redux/TypeScript — stack segue exatamente `player-site-handoff.md` (seção 3).
- ✅ Este repositório **não** é responsável por popular os catálogos de referência no Firestore — isso é feito separadamente (seção 2.1/4).
- ✅ Campo de escopo por universo se chama `universo` e guarda o **id** do documento em `Universo` (não um slug/string solta) — usado por `racas`, `classes`, `condicoes`, `aptidoes`, `veiasAstrais`, `itens` e `artes` (seção 4.1).
- ✅ Convenção de exibição: qualquer campo que referencia outra coleção salva o **id**; o front-end resolve para o campo **`Nome`** do documento referenciado ao exibir (seção 4.2) — nunca salvar o nome como string solta em `personagens`.
- ✅ Schema de `aptidoes` simplificado: sem campos de fórmula/valor de bônus — cada aptidão só precisa de nome/descrição + texto narrativo de Vantagem por nível (seção 4).
- ✅ **Sem importação de fichas antigas** — não há ferramenta de conversão do `.json` exportado pelo site vanilla; personagens são criados do zero no site novo (seção 2.1/2.3). Isso elimina toda a necessidade de ler `localStorage`/IndexedDB do site legado neste projeto.

### Decisões pendentes (confirmar antes de codar a fase correspondente)
- ⚠️ Nenhuma decisão de modelagem em aberto no momento — revisar esta lista a cada nova informação do time do painel administrativo.

### Pendências de confirmação com a mesa (já codado, valores a validar)
- ⚠️ **Limiares de Treinamento** (`common/utils/formulas.js`, bloco "Treinamento" — `DADO_XP_POR_TIER`, `calcularXpNecessario`, limiares de crítico/sucesso/quase/falha): a documentação de regras não define os números exatos, então os valores em uso são uma escolha autoral, sinalizada com `⚠️` no próprio código. Quando o responsável do jogo confirmar (ou corrigir) esses números, atualize `formulas.js` + `formulas.test.js` e remova o aviso do código e desta linha.

### Notas remanescentes sobre o código legado
Como não há importação de fichas antigas, os riscos específicos de leitura de `localStorage`/IndexedDB do site vanilla (chaves duplicadas, dois donos do banco `ReDungeonDB`, imagens em base64 etc.) deixam de ser relevantes para este projeto. Ainda vale como referência ao consultar o código antigo por contexto:
- **`html-components/popup-ativar-astral.html`** e `js/svg-atributos.js` são código órfão no site legado — não usar como referência de comportamento esperado.
- **Sem testes automatizados no site legado** — a extração das fórmulas (seção 7.2) é o momento de criar a primeira suíte de testes do "universo" ReDungeon.
