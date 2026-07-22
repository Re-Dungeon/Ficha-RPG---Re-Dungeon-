# Funcionalidades do ReDungeon — Ficha de Personagem

Documento de referência funcional do site **ReDungeon**, uma ficha de personagem interativa para RPG de mesa, construída em HTML/CSS/JavaScript vanilla (sem frameworks, sem build system). Este documento descreve **o que cada funcionalidade faz e como o usuário interage com ela**, passo a passo, servindo de base para a reescrita em React + Firebase.

> Convenção: nomes de arquivo entre parênteses referem-se a `js/<arquivo>.js` ou `css/<arquivo>.css` — esses arquivos **não existem mais neste repositório** (removidos após a migração, ver nota abaixo); ficam citados aqui só como referência histórica de onde cada comportamento vivia no site vanilla original.

> ✅ **Nota de migração — status: implementado (2026-07-19)**. Este documento descreve o comportamento do **antigo site vanilla**, mantido como referência funcional completa do que cada sistema fazia — o código vanilla em si (`js/`, `css/`, `index.html`, `data/*.js`) já foi removido deste repositório, substituído pela reescrita em React + Firebase que roda aqui agora. O plano seguido está em [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md) (ver "Status da implementação" no topo daquele documento para o detalhamento fase a fase) e em [player-site-handoff.md](./player-site-handoff.md). Decisões de escopo tomadas para a migração — todas já aplicadas — sinalizadas nas seções correspondentes abaixo: **Reputação** (§5), **Corpo Imortal** (§19), **Companheiros** (§17) e **Cultivação** (§18) não foram implementados nesta fase (backlog futuro); a barra de desbloqueio de Classes por Power Combat (§12) permanece apenas informativa; **Aptidões** (§9) deixaram de conceder bônus numérico a atributos; a **Loja Rokmas** (§16) lê o catálogo de itens do Firestore, filtrado pelo universo do personagem; a aba de **Arts/Habilidades** (§10) tem 3 origens (autoral, herdada de classe, ou catálogo de Arts do Firestore por universo).

---

## Índice

1. [Visão geral e estrutura da interface](#1-visão-geral-e-estrutura-da-interface)
2. [Atributos primários e secundários](#2-atributos-primários-e-secundários)
3. [Barras de status: Saúde, Energia, Fadiga](#3-barras-de-status-saúde-energia-fadiga)
4. [Power Combat](#4-power-combat)
5. [Reputação (Fama/Temor)](#5-reputação-famatemor)
6. [Sorte e Fortuna](#6-sorte-e-fortuna)
7. [Condições (status effects)](#7-condições-status-effects)
8. [Imagem do personagem](#8-imagem-do-personagem)
9. [Aptidões e Vantagens](#9-aptidões-e-vantagens)
10. [Arts / Habilidades (Núcleos, Arts, Variantes)](#10-arts--habilidades-núcleos-arts-variantes)
11. [Raças](#11-raças)
12. [Classes](#12-classes)
13. [Treinamento](#13-treinamento)
14. [Inventário](#14-inventário)
15. [Loja da Trapaça (Fortuna)](#15-loja-da-trapaça-fortuna)
16. [Menu de Itens / Loja Rokmas](#16-menu-de-itens--loja-rokmas)
17. [Companheiros](#17-companheiros)
18. [Cultivação](#18-cultivação)
19. [Corpo Imortal](#19-corpo-imortal)
20. [Veias Astrais](#20-veias-astrais)
21. [Códex Mágico](#21-códex-mágico)
22. [Popup de Informações do Jogador](#22-popup-de-informações-do-jogador)
23. [Salvar, Importar e Limpar Ficha](#23-salvar-importar-e-limpar-ficha)

---

## 1. Visão geral e estrutura da interface

A ficha é uma **single page application** dentro de `index.html` (3200+ linhas), com todo o conteúdo pré-renderizado no HTML (seções ocultas por CSS) e manipulado via JavaScript puro. Não há roteamento de URL — tudo acontece por troca de classes CSS (`.hidden`, `.ativo`, `.content-section--active`).

### Navegação principal

- **Barra horizontal** (topo, `#rpg-horizontal-bar`): 6 abas que trocam o conteúdo da área central — **Atributos, Aptidões, Habilidades, Inventário, Treinamento, Companheiros**. Suporta navegação por teclado (setas ←/→, Home/End).
- **Barra vertical esquerda** (sidebar retrátil, `#rpg-vertical-bar-left`): botões que abrem **modais/popups** (não trocam a área central) — **Info, Aptidão (loja de sorte), Loja (itens/Rokmas), Cultivação, Corpo Imortal, Salvar, Sobre**. A sidebar pode ser recolhida/expandida (estado persistido) e reorganiza seus botões em 4 grupos: 👤 Personagem, ⚙️ Sistema, 📈 Progressão, 💾 Dados.
- **Aba central "Atributos"** é a tela inicial e contém o núcleo da ficha: círculos de atributos primários/secundários, retrato do personagem com nome/título/classe/raça, botões de controle (Reputação, Veias Astrais, Limpar Ficha) e as 3 barras de status.

### Padrão comum de modal

Praticamente todo sistema (Raças, Classes, Cultivação, Corpo Imortal, Códex, Sorte, Veias Astrais etc.) usa o mesmo padrão de popup: um `overlay` de tela cheia que ganha a classe `.ativo`/remove `.hidden`, fecha ao clicar fora, pressionar ESC ou no botão ✘, e geralmente tem um botão "↩ Voltar" que retorna ao menu principal (sidebar).

---

## 2. Atributos primários e secundários

**Aba:** Atributos (tela inicial). **Arquivos:** `atributos.js`, `atributos-config-modal.js`, `atributos-auto-sync.js`, `atributos-total-contador.js`.

### Os 12 atributos

| Primários    | Sigla | Secundários (derivados) | Sigla |
| ------------ | ----- | ----------------------- | ----- |
| Força        | FOR   | Prontidão               | PRONT |
| Vitalidade   | VIT   | Ataque                  | ATK   |
| Agilidade    | AGI   | Defesa                  | DEF   |
| Inteligência | INT   | Reação                  | REA   |
| Percepção    | PER   | Precisão                | PREC  |
| Sorte        | SOR   | Evasão                  | EVA   |

Os primários são exibidos como botões dispostos em círculo ao redor do retrato do personagem; os secundários em outro círculo. Um botão central em cada grupo mostra a **soma total dos primários** (badge "Pontos") e o **Power Combat** (ver seção 4).

### Passo a passo — editar um atributo

1. Clique em qualquer botão de atributo (ex.: "18 FOR").
2. Abre-se um modal único de configuração com 4 campos: **Base** (editável), **Extra** (editável), **Bônus** (editável), **Total** (somente leitura, 🔒).
3. Ao digitar, o campo Total recalcula em tempo real: `Total = Base + Extra + Bônus`.
4. Clique em **Salvar** (ou Enter) grava o valor e fecha o modal; o número no botão do atributo é atualizado imediatamente.

### Fórmulas dos atributos secundários (derivadas dos totais dos primários)

Cada secundário é recalculado automaticamente sempre que um primário muda:

- **Prontidão** = `ceil( ((AGI×0.6 + PER×0.3 + SOR×0.1) / 250) × 315 ) + (base+extra+bônus)`
- **Ataque** = `ceil( ((FOR×0.7 + INT×0.3) / 250) × 21 ) + ajustes`
- **Defesa** = `ceil( ((VIT×0.6 + AGI×0.3 + SOR×0.1) / 250) × 16 ) + ajustes`
- **Reação** = `ceil( ((AGI×0.5 + PER×0.3 + SOR×0.2) / 250) × 6 ) + 6 + ajustes`
- **Precisão** = `ceil( ((AGI×0.3 + PER×0.6 + SOR×0.1) / 250) × 12 ) + ajustes`
- **Evasão** = `ceil( ((AGI×0.5 + PER×0.4 + SOR×0.1) / 250) × 12 ) + ajustes`

### Contador de pontos totais

O badge central do grupo de primários soma os 6 valores `.total` e anima visualmente quando muda.

---

## 3. Barras de status: Saúde, Energia, Fadiga

**Arquivos:** `status-bars-manager.js`, `status-config-modal.js`.

Três barras horizontais abaixo do círculo de atributos (Saúde ocupa a largura toda; Energia e Fadiga dividem 50%/50%). Cada uma mostra `atual / máximo`, uma barra de preenchimento colorida por faixa (≤33% baixo, ≤66% médio, >66% alto — a Fadiga é invertida: alto = ruim/vermelho) e uma porcentagem.

### Passo a passo — configurar status

1. Clique no botão de engrenagem (canto superior direito da seção de barras).
2. Abre o modal `StatusConfigModal`, compartilhado pelos 3 status: uma **prévia** com os 3 valores lado a lado (clicáveis para trocar qual está em edição) e uma seção de edição com **Atual**, **Extra**, **Máximo** (🔒 calculado), **Bônus**.
3. Trocar de status na prévia salva automaticamente os valores do status anterior antes de exibir o próximo (não perde edições).
4. **Salvar Alterações** grava os 3 status de uma vez e anima as barras.

### Fórmulas dos máximos (usam os totais dos primários)

- **Saúde máxima** = `ceil( (FOR×0.3 + VIT×0.6 + SOR×0.1) × 2 ) + (base+extra+bônus)`
- **Energia máxima** = `ceil( (INT×0.6 + PER×0.3 + SOR×0.1) × 1.333 ) + (base+extra+bônus)`
- **Fadiga máxima** = `ceil( FOR×0.3 + VIT×0.5 + SOR×0.2 ) + (base+extra+bônus)`

O ajuste do valor **atual** (gasto/cura) é feito editando diretamente o campo "Atual" no modal — não há botões dedicados de dano/cura na tela principal.

---

## 4. Power Combat

**Arquivo:** `power-combat-calculator.js`.

Um único número, exibido no botão central do grupo de atributos secundários, que resume o poder de combate do personagem:

```
Power Combat = floor( (Ataque + Defesa) × 1.5 + (Força + Vitalidade + Agilidade) × 0.8 )
```

Recalculado automaticamente sempre que os atributos totais mudam. É o valor mais transversal do sistema de progressão — usado também pela barra de desbloqueio de Classes (seção 12), pelo limite de Arts ativas (seção 10) e como "moeda" gasta na árvore de Veias Astrais (seção 20).

---

## 5. Reputação (Fama/Temor)

> ⚠️ **Fora do escopo da migração nesta fase.** Documentado aqui como referência do comportamento atual; não faz parte do roadmap de [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md#2-escopo-desta-migração) por enquanto.

**Arquivo:** `reputacao-v2.js` (sistema ativo; existe um V1 legado desativado).

Sistema **dual-axis**: em vez de um único número de reputação, há dois eixos independentes — **⭐ Fama** (0-100) e **☠️ Temor** (0-100) — medidos separadamente para **🌍 Mundo** (reputação global) e **📍 Região** (reputação local).

### Passo a passo

1. Clique no botão de Reputação (ícone ao lado do retrato do personagem) abre o modal.
2. Seção "Sua Identidade" mostra os 2 escopos (Mundo/Região), cada um com barra de Fama e barra de Temor e um **título/status calculado** (ex.: "Herói Supremo", "Tirano", "Lenda Fragmentada", "Desconhecido").
3. Seção "Ajustes": 4 campos numéricos (Fama Mundo, Temor Mundo, Fama Região, Temor Região) — editar atualiza a prévia em tempo real.
4. Seção "Efeitos Passivos": lista automaticamente os efeitos narrativos desbloqueados pelos limiares atuais (limiares em 6, 11, 21, 31, 46, 61, 76, 91 pontos, cumulativos, calculados com o maior valor entre Mundo/Região).
5. **Salvar** grava os 4 valores.

### Cálculo de status/título

- Se `|Fama - Temor| ≤ 10`: estado **híbrido** (9 variações, ex. "Arauto do Caos", "Salvador Temido", "Equilíbrio Instável").
- Caso contrário: estado **primário** — Herói Supremo (Fama≥50), Herói (Fama≥30), Tirano Supremo (Temor≥50), Tirano (Temor≥30), Desconhecido (<15 ambos), ou Neutro.

---

## 6. Sorte e Fortuna

**Arquivos:** `sorte-modal.js`, `sorte-historico.js`.

### Passo a passo

1. Abre o modal "Sistema de Fortuna" mostrando: Sorte Total (do atributo Sorte), Bônus Base (somente leitura), Fortuna Atual (moeda acumulada), status de disponibilidade do dia, botão **🎲 Rolar Fortuna** e botão **🏪 Abrir Loja** (abre a Loja da Trapaça, seção 15).
2. Clique em "Rolar Fortuna" — disponível **uma vez por dia** (controlado por data salva; libera à meia-noite).
3. O sistema rola dados e soma um bônus, animando o resultado em números dourados subindo na tela, e credita o valor à Fortuna Atual.
4. A ação fica registrada no **Histórico de Ações** (últimas 10, com timestamp relativo).

### Fórmula de rolagem

1. `Dados = 1d6 (aleatório) + floor(Sorte Total / 20)` dados extras.
2. Rola todos os dados d6 e soma (`Soma dos Dados`).
3. `Bônus Base = floor(Sorte Total / 25)`.
4. `Resultado Final = Soma dos Dados + Bônus Base` → é somado à Fortuna Atual (nunca abaixo de 0).

A Fortuna é a moeda usada exclusivamente na **Loja da Trapaça** (seção 15) — é um sistema de economia totalmente separado da moeda "Rokmas" do Menu de Itens (seção 16).

---

## 7. Condições (status effects)

**Arquivo:** `rd-cond-sistema.js`.

Uma "enciclopédia viva" de ~65 condições (buffs, debuffs, maldições, bênçãos, estados, temporais) que podem estar ativas no personagem — funciona como registro narrativo, sem aplicar efeitos automáticos nos cálculos de atributos.

### Categorias

🟢 Buff · 🔴 Debuff · 🟣 Maldição · 🟡 Bênção · ⚫ Estado · ⏳ Temporal.

### Passo a passo

1. Popup principal mostra as condições **ativas** do personagem, agrupadas por categoria, cada card com nome, descrição curta, duração restante (em turnos) e contador de acúmulo (stack) se aplicável.
2. **➕ Adicionar Condição** abre o "Códex" de condições — lista pesquisável e filtrável por categoria de todo o catálogo. Clicar em "➕" num item adiciona (ou incrementa o stack, se a condição permitir acúmulo).
3. **👁 Ver detalhes** em qualquer condição ativa mostra imagem, descrição completa, Origem/Duração/Raridade/Aplicação, Modificadores (narrativos), Efeitos Passivos/Ativos e Interações com outras condições.
4. **❌ Remover** pede confirmação e remove a condição.

> 🔄 **Nota de migração**: o catálogo de condições já existe como coleção `condicoes` no Firestore compartilhado, filtrada pelo universo do personagem — não será recriado do zero (ver [MIGRACAO-REACT-FIREBASE.md §4](./MIGRACAO-REACT-FIREBASE.md#4-dados-de-referência-já-existentes-no-firestore--não-duplicar)).

---

## 8. Imagem do personagem

**Arquivos:** `personagem-image-controller.js`, `personagem-image-otimizacao.js`, `imagem-personagem-sync.js`.

### Passo a passo

1. Clique na imagem do personagem (retrato central) abre o modal de imagem.
2. Duas abas: **Upload** (arquivo local, com suporte a arrastar-e-soltar; aceita PNG/JPEG/WEBP/GIF/BMP/SVG até 50MB) e **URL** (link externo, ex. Imgur).
3. Uma prévia é exibida antes de salvar.
4. **Salvar Imagem**:
   - Se veio de **URL**: salva apenas o link (mais leve).
   - Se veio de **upload**: a imagem é comprimida (máx. 1024×1024, JPEG qualidade 0.8) e convertida para base64, armazenada localmente; a ficha guarda só uma referência pequena.
5. A imagem é aplicada imediatamente ao retrato e mantida ao recarregar a página.

> 🔄 **Nota de migração**: a nova versão não usará Firebase Storage nem upload local — apenas URL externa (ex. Imgur), simplificando este fluxo em relação ao comportamento atual (ver [MIGRACAO-REACT-FIREBASE.md §6](./MIGRACAO-REACT-FIREBASE.md#6-imagens--apenas-url-sem-firebase-storage)).

---

## 9. Aptidões e Vantagens

**Aba:** Aptidões. **Arquivos:** `aptidoes-manager.js`, `aptidoes-calculator.js`, `gerenciar-aptidoes.js`, `vantagens-aptidoes-system.js`, `aptidoes-bonus-sync.js`.

### Conceito

"Aptidões" são perícias/talentos temáticos (ex.: Acrobacia, Arcanismo, Furtividade, Alquimia, Atletismo). Cada aptidão tem **nível**. Subir de nível desbloqueia **Vantagens**: efeitos narrativos concedidos nos níveis 1, 3 e 5. Hoje as Vantagens também somam bônus numéricos aos atributos (ver "Sincronização com Atributos" abaixo) — isso muda na migração (ver nota ao final desta seção).

### Painel da aba (topo)

Mostra 4 indicadores: **Atual** (quantas aptidões o personagem já tem), **Ganhas** (quantos "slots" de aptidão foram concedidos, geralmente pelo mestre), **Máximo** (quantas aptidões o personagem pode ter no total) e **Atributo p/+1** (quantos pontos de atributo faltam para ganhar +1 no máximo).

### Fórmula do máximo de aptidões

```
Soma = Força + Vitalidade + Agilidade + Inteligência + Percepção   (sem Sorte)
Máximo = round(Soma / 20 + 3) + Ganhas
```

### Passo a passo — os 3 botões de ação

1. **➕ Ganhar Aptidão**: abre um popup numérico (1-9) que **incrementa o contador "Ganhas"** (aumenta quantas aptidões podem ser adquiridas) — não adiciona uma aptidão específica.
2. **Gerenciar Aptidões**: abre o catálogo completo em grid com busca por texto. O jogador seleciona (toggle) uma ou mais aptidões ainda não adquiridas, respeitando o limite Atual vs Máximo, e confirma em "Salvar" — cada uma entra na lista do personagem já no **nível 1**.
3. **➖ Remover Aptidão**: popup numérico que decrementa "Ganhas".

### Tabela de aptidões do personagem

Cada aptidão adquirida aparece numa linha com botões: **⬆️ Upgrade** (sobe de nível, até o nivel maximo daquela aptidão), **🔄 Reset** (volta a nível 0), **❌ Remover** (exclui).

### Vantagens desbloqueadas

Uma caixa separada lista as vantagens já obtidas, com texto narrativo.

### Sincronização com Atributos (comportamento atual)

Sempre que uma aptidão é adicionada/upada/resetada/removida, o sistema recalcula automaticamente os bônus concedidos por todas as vantagens ativas (parseando texto como "+5 Força") e aplica esse total como o campo **Bônus** de cada atributo primário/secundário afetado (visível e somado automaticamente na aba Atributos).

> ⚠️ **Decisão de migração**: essa sincronização de bônus **não será portada**. Na reescrita, Aptidões e suas Vantagens passam a ser **puramente narrativas/descritivas** — não alimentam mais nenhum campo de bônus de atributo. O campo "Bônus" do atributo continua existindo, mas passa a ser só um ajuste manual (ex.: efeito concedido pelo mestre), sem relação automática com aptidões (ver [MIGRACAO-REACT-FIREBASE.md §2.1](./MIGRACAO-REACT-FIREBASE.md#21-decisões-já-tomadas-não-reabrir)).

> 🔄 **Nota de migração**: o catálogo de aptidões já existe como coleção `aptidoes` no Firestore compartilhado com o projeto administrativo, filtrada pelo universo do personagem — não será recriado do zero. Como não há mais bônus numérico (nota acima), o schema de cada aptidão fica mais simples: nome/descrição + texto narrativo de Vantagem por nível, sem campos de fórmula/valor (ver [MIGRACAO-REACT-FIREBASE.md §4](./MIGRACAO-REACT-FIREBASE.md#4-dados-de-referência-já-existentes-no-firestore--não-duplicar)).

### Aptidões de Companheiro

> ⚠️ **Fora do escopo da migração nesta fase** — Companheiros como um todo não serão implementados agora (ver §17 e [MIGRACAO-REACT-FIREBASE.md §2](./MIGRACAO-REACT-FIREBASE.md#2-escopo-desta-migração)).

Companheiros têm seu próprio fluxo simplificado (popup dedicado), com a mesma lógica de catálogo/nível/vantagens, mas gerenciado separadamente por companheiro.

---

## 10. Arts / Habilidades (Núcleos, Arts, Variantes)

**Aba:** Habilidades. **Arquivos:** `arts-main.js`, `arts-models.js`, `arts-rules.js`, `arts-ui.js`, `arts-unlock-system.js`.

### Conceito — hierarquia de 3 camadas

Sistema onde o **próprio jogador cria** as habilidades/magias/técnicas do personagem (não é um catálogo pré-definido):

- **Núcleo (Core)**: conceito-base de onde habilidades derivam (nome, tipo de conceito, forma visual, descrição, bônus base). É pré-requisito — sem núcleo, não é possível criar uma Art.
- **Art**: a habilidade em si, vinculada a um Núcleo. Campos: tipo (ofensiva, defensiva, estratégica, suporte, controle, invocação, transformação, passiva, racial), domínio (1 a 5, de "Básico" a "Supremo"), recarga, duração, alcance, alvos, custo, dano, tipo de ação (Imediata/Duradoura/Sustentada), status (ativa/bloqueada).
- **Variante**: sub-versão de uma Art, com domínio obrigatoriamente **menor** que a Art base; não conta no limite de Arts ativas.

### Passo a passo

1. A aba mostra 4 seções: Estatísticas, Atributos (somente leitura, espelhando a aba Atributos), Núcleos, Arts e Variantes — cada uma com busca, filtro por tipo e botão "+ Criar".
2. Criar um **Núcleo** primeiro (nome, conceito, descrição, imagem).
3. Criar uma **Art** vinculada a um núcleo, preenchendo tipo, domínio, custo, dano etc.
4. Opcionalmente criar **Variantes** de uma Art existente.
5. Cada card tem ações Ver / Editar / Remover.

### Sistema de desbloqueio (limite de Arts ativas)

```
Total = Força + Vitalidade + Agilidade + Percepção + Inteligência
Limite de Arts = round(Total × 0.0293)
```

Sempre que a soma de atributos muda, o sistema verifica se há mais Arts ativas do que o limite permite: se sim, **bloqueia automaticamente as mais recentes**; se há espaço sobrando, **desbloqueia as mais antigas primeiro**. Há também um botão manual **"🔓 Desbloquear"** que libera Arts bloqueadas até preencher os slots disponíveis.

> 🔄 **Nota de migração — 3 origens para uma Art**: na reescrita, cada Art do personagem pode vir de uma de três origens: (1) **criação autoral**, exatamente como hoje (Núcleo/Art/Variante livres); (2) **herdada de uma habilidade da classe** do personagem, como já acontece hoje ao selecionar uma habilidade no modal de Classes; ou (3) **escolhida de um catálogo** — a coleção `artes` do Firestore compartilhado, filtrada pelo universo do personagem. As três contam da mesma forma para o limite de Arts ativas acima. Ver [MIGRACAO-REACT-FIREBASE.md §2.1 e §5](./MIGRACAO-REACT-FIREBASE.md#21-decisões-já-tomadas-não-reabrir).

### Companheiro Arts

> ⚠️ **Fora do escopo da migração nesta fase** — Companheiros como um todo não serão implementados agora (ver §17 e [MIGRACAO-REACT-FIREBASE.md §2](./MIGRACAO-REACT-FIREBASE.md#2-escopo-desta-migração)).

Companheiros têm um sistema de Arts espelhado (mesmos conceitos de Núcleo/Art/Variante, mesma fórmula de limite), mas gerenciado de forma independente por companheiro.

---

## 11. Raças

**Arquivo:** `racas-data.js` (banco de dados), `racas-ui.js` (modal).

### Passo a passo

1. Abre o modal de Raças (lista lateral agrupada em "pastas" expansíveis por categoria/universo temático: Re'Geron, The Chaotical Gate, Cultivo, One Piece, Bleach, A Crônica dos Varkhan) e filtros de busca por nome + raridade (Comum/Raro/Épico/Lendário/Mítico/Celestial).
2. Clicar numa raça mostra seus detalhes: imagem, descrição, atributos em fórmula de dado (ex. "4d6+10"), limite máximo de atributo, e abas de **Habilidades Básicas** (3 traços narrativos) e **Habilidades Avançadas** (mecânicas tipo magia, com alcance/custo/recarga/dano).
3. Botão **"Escolher"** trava a seleção — só **uma raça por personagem**. Todas as outras ficam visualmente bloqueadas até o jogador desfazer a escolha (ícone de cadeado).
4. A raça escolhida atualiza o campo "Raça" no retrato central.

### Habilidades básicas — limite de uso simultâneo

Cada raça tem 3 habilidades básicas, mas apenas algumas podem estar **ativas ao mesmo tempo**, conforme a raridade da raça:

```
Comum: 1 · Raro: 1 · Épico: 1 · Lendário: 2 · Mítico: 3 · Celestial: ilimitado
```

O jogador ativa/desativa e pode "travar" (🔒) uma habilidade escolhida.

> 🔄 **Nota de migração**: o catálogo de raças já existe como coleção `racas` no Firestore compartilhado, filtrada pelo universo do personagem — não será recriado do zero (ver [MIGRACAO-REACT-FIREBASE.md §4](./MIGRACAO-REACT-FIREBASE.md#4-dados-de-referência-já-existentes-no-firestore--não-duplicar)).

---

## 12. Classes

**Arquivo:** `classes-data.js` (banco de dados), `classes-ui.js` (modal).

### Passo a passo

1. Modal similar ao de Raças (pastas por raridade/categoria, filtros).
2. Diferente de Raças, o jogador pode escolher **até 3 classes simultaneamente** (multiclasse) — clicar em "Escolher" faz toggle; ao atingir 3, as demais mostram "🔒 Limite atingido".
3. O campo "Classe" do retrato mostra todas as classes escolhidas unidas (ex.: "Guerreiro ➠ Cavaleiro").
4. Cada classe tem Habilidades Básicas e Avançadas (mesmo formato de "Art" — alcance/custo/recarga/dano); clicar em selecionar uma habilidade a **injeta automaticamente** como uma Art no sistema de Habilidades (seção 10).

### Barra de progressão por Power Combat

No rodapé do modal, uma barra mostra 3 marcos (100 / 200 / 300 PC) rotulados como metas de desbloqueio de classes, preenchida conforme o Power Combat atual (seção 4) sobe. **Importante**: essa barra é informativa/narrativa — a única trava real de código é o limite de 3 classes simultâneas; os marcos de PC servem de referência para o mestre arbitrar liberações.

> ✅ **Decisão de migração confirmada**: esse comportamento é intencional e será mantido como está — a barra continua **apenas informativa** na reescrita, sem virar trava automática de seleção de classe (ver [MIGRACAO-REACT-FIREBASE.md §2.1](./MIGRACAO-REACT-FIREBASE.md#21-decisões-já-tomadas-não-reabrir)).

> 🔄 **Nota de migração**: o catálogo de classes já existe como coleção `classes` no Firestore compartilhado, filtrada pelo universo do personagem — não será recriado do zero.

---

## 13. Treinamento

**Aba:** Treinamento. **Arquivo:** `treinamento-sistema.js`.

Mini-jogo de rolagem de dados para subir de nível os 6 atributos primários gastando "horas" de treinamento narrativas.

### Passo a passo

1. Grid com um card por atributo, mostrando nível atual e barra de XP.
2. Clique em "Treinar" abre um modal: horas de treinamento (1-12), campo opcional de "Bônus do Mestre" (0-20), botão "Iniciar Treinamento".
3. O sistema executa a rolagem e mostra um resultado detalhado.

### Mecânica

1. Rola `1d6` base.
2. Soma o maior bônus de aptidão relacionada ao atributo (ex.: Força → Atletismo/Ferraria/Fôlego), calculado como `floor(nível da aptidão / 2)`.
3. Soma bônus de Sorte (`floor(Sorte Total / 25)`) e o bônus manual do mestre.
4. Compara contra um **obstáculo** que cresce com o nível (`5 + floor(nível/25)×2`).
5. Conforme o resultado (crítico, sucesso, quase, falha), rola um dado de XP diferente (1d4 a 1d10) — **uma vez por hora investida**. Sucesso acima do obstáculo dá +20% de XP.
6. XP acumulado sobe o nível do atributo automaticamente (pode subir vários níveis de uma vez se houver XP suficiente), seguindo uma tabela de XP necessário por faixa de nível (10 XP nos níveis iniciais, subindo até 100 XP nos níveis avançados).

---

## 14. Inventário

**Aba:** Inventário. **Arquivos:** `inventario-manager.js`, `inventario-ui.js`.

### Conceito

Sistema de itens com controle de **espaço/carga**, dividido em duas listas: **Itens** e **Armazenamentos** (containers que aumentam a capacidade total).

### Passo a passo — Item

1. **➕ Adicionar Item** abre um formulário: imagem (URL ou upload), nome, qualidade (Comum/Raro/Épico/Lendário/Mítico/Celestial), tipo, nível, roll (ex. "1d8+2"), extra, quantidade, espaço por unidade, e duas abas internas de texto livre (Habilidade / História do Item).
2. Ao digitar quantidade/espaço, o "Espaço Total" do item é recalculado e validado contra o espaço livre disponível em tempo real (bloqueia salvar se não couber).
3. **Salvar** grava o item na lista.
4. **Ver** abre um popup de detalhes somente leitura (imagem grande, stats em grid, habilidade/história).
5. **Equipar/Desequipar**: itens equipados **não ocupam espaço** no cálculo de carga.
6. **Deletar** pede confirmação.

### Passo a passo — Armazenamento

Mesmo fluxo, mas com campos: nome, **bônus de espaço** (quanto soma à capacidade total) e descrição.

### Cálculo de espaço

```
Espaço Base = (Força + Vitalidade) / 2 / 10
Bônus de Armazenamentos = soma do "bônus de espaço" de todos os armazenamentos
Espaço Total = Base + Bônus de Armazenamentos
Espaço Usado = soma (espaço × quantidade) apenas dos itens NÃO equipados
Espaço Livre = max(0, Total − Usado)
```

Um painel no topo mostra Total/Usado/Livre/Status, com uma barra visual de ocupação.

### Filtros

Busca por nome e filtro por qualidade, tanto na lista de itens quanto na de armazenamentos.

---

## 15. Loja da Trapaça (Fortuna)

**Arquivos:** `loja-trapaça.js`, `loja-trapaça-ui.js`.

Loja de **efeitos narrativos/mecânicos de sorte** (não itens físicos), acessada pelo botão "🏪 Abrir Loja" dentro do modal de Sorte (seção 6). Moeda: **Fortuna (Ȼ)**.

### Categorias de efeitos (cada uma com limite de uso)

- **Benefícios Menores** — ilimitados, ativação imediata (ex.: "Encontro Favorável").
- **Vantagens Táticas** — limite de 2 simultâneas, ativação manual/armazenável (ex.: rerolar um dado, +3 numa rolagem).
- **Efeitos Avançados** — limite de 1 (ex.: reduzir dano em combate).
- **Bênçãos Únicas** — limite de 1 (ex.: sobreviver com 1 HP, crítico garantido).

### Passo a passo

1. Cada item mostra nome, custo em Fortuna e descrição do efeito.
2. **💳 Comprar**: verifica se há Fortuna suficiente; se sim, debita o saldo e aplica o efeito — imediatamente (se for do tipo "imediata") ou guardando-o para ativação manual posterior (se for "manual").
3. Compras ficam registradas no histórico de Sorte.

---

## 16. Menu de Itens / Loja Rokmas

**Arquivos:** `menu-itens-system.js`, `menu-itens-ui.js`, `menu-itens-inventario-integration.js`.

Loja **separada** da Loja da Trapaça, com itens físicos reais de RPG (poções, elixires, armaduras, armas, recursos). Moeda: **Rokmas** (saldo inicial padrão: 150).

### Passo a passo

1. Botão "Loja" na sidebar vertical abre o catálogo.
2. **Comprar**: escolhe a quantidade (limitada pelo saldo disponível e pelo espaço livre no Inventário principal); debita Rokmas e **adiciona automaticamente o item ao Inventário** (seção 14), convertendo o formato (raridade→qualidade, categoria→tipo, dado→roll, descrição→habilidade).
3. Itens que representam containers (mochilas, bolsas, baús — detectados por palavras-chave ou padrão de texto "+N espaço") viram automaticamente um **Armazenamento** no inventário, em vez de um item comum.
4. **Vender**: remove o item do inventário e credita Rokmas de volta (valor de venda definido no catálogo).

> 🔄 **Nota de migração**: o catálogo próprio desta loja (`data/menu-itens-data.js`) não é portado. Na reescrita, a Loja Rokmas passa a ler diretamente a coleção `itens` do Firestore compartilhado, **filtrada pelo universo do personagem** — os mesmos itens que já existem para o catálogo de Inventário/Raças/Classes daquele universo, sem uma lista separada de "itens compráveis" (ver [MIGRACAO-REACT-FIREBASE.md §2.1 e §4](./MIGRACAO-REACT-FIREBASE.md#4-dados-de-referência-já-existentes-no-firestore--não-duplicar)).

---

## 17. Companheiros

> ⚠️ **Fora do escopo da migração nesta fase.** Documentado aqui como referência do comportamento atual; não faz parte do roadmap de [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md#2-escopo-desta-migração) por enquanto.

**Aba:** Companheiros. **Arquivos:** `companheiros-manager.js`, `companheiros-modal.js`, `companheiros-ui.js`, `clone-comp-sistema.js`.

### Conceito

Fichas completas e independentes de pets, invocações, espíritos, pactos etc., cada uma com seus próprios atributos, status, aptidões, arts e inventário.

### Passo a passo — Criar/Editar

1. **➕ Adicionar Companheiro** abre um modal com abas: dados básicos (nome, tipo — Mascote/Companheiro/Espírito/Invocação/Pacto/Transformação —, nível, descrição, notas), **raça** (seletor com ~17 raças pré-definidas agrupadas por universo temático, cada uma já com atributos e habilidades raciais), atributos primários/secundários (base+extra, total calculado ao vivo), barras de saúde/energia/fadiga, e imagem (upload ou URL).
2. **Salvar** grava o companheiro na lista.
3. **Ver** abre o mesmo modal em modo somente-leitura.
4. Clique no badge de status alterna **vivo/morto**.
5. **Deletar** pede confirmação.

### Card do companheiro (grid)

Mostra imagem, badge de tipo, badge vivo/morto (clicável), nome, nível, e as 3 barras de status em miniatura, com botões Ver/Editar/Deletar.

### Inventário isolado por companheiro

Cada companheiro tem seu **próprio inventário** (mesma UI e fórmula de espaço do Inventário principal, seção 14), completamente separado dos demais companheiros e do personagem principal.

### Aptidões e Arts do companheiro

Sistema espelhado (mesmo catálogo e mesmas regras) das seções 9 e 10, mas com dados independentes por companheiro.

### Clonagem de companheiro

Botão **"🔄 Clonar"** abre um seletor com busca/filtro; ao confirmar, pede um novo nome e cria uma cópia completa do companheiro selecionado — incluindo inventário isolado e imagem — como um novo registro independente.

---

## 18. Cultivação

> ⚠️ **Fora do escopo da migração nesta fase.** Documentado aqui como referência do comportamento atual; não faz parte do roadmap de [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md#2-escopo-desta-migração) por enquanto.

**Arquivo:** `cultivacao-sistema.js`.

Popup de simulação de progressão estilo "xianxia" (cultivo oriental), com uma camada **universal** compartilhada e **3 mundos/linhas de cultivo alternativas** (o jogador usa a que fizer sentido para a campanha).

### Camada Universal

- **Alma** (atual/máximo) e **Dantian** (reservatório de Qi, atual/máximo) — editados manualmente via popup.
- **Meridianos** (limpos/máximo de 314, mais contagem de meridianos principais limpos de 12).
- **Técnica de Cultivo**: campo narrativo livre (nome, tipo de energia, descrição, dado).
- **Mar Espiritual**: estado, tamanho (14 níveis, de "Poça Espiritual" a "Mar Infinito"), elemento (dezenas de opções categorizadas) e densidade de Qi (16 níveis).

### Os 3 mundos (abas)

1. **The Elder Gods** ⭐ — progressão por Rank/Nível/XP (15 ranks, de "Corpo Temperado" a "Deidade"); ao completar 9 níveis, avança de rank; a partir do rank 8, ativa risco de "Tribulação".
2. **Boreal Line** ❄️ — progressão por Fragmentos convertidos em Núcleos de Mana (custo dobra a cada rank); ranks avançados (4 e 5) têm sub-ranks aninhados; até "Deus Maior".
3. **Legends of Murim** 🌿 — progressão por Pétalas do "Lótus do Céu Imortal"; estágios (Inicial→Refinada→Superior→Perfeita) dentro de 8 ranks, de "Fundação Turva" a "Soberano Supremo".

Em cada mundo, botões "Adicionar XP/Fragmentos/Pétalas" abrem popups de input manual, e "Avançar Rank" também é acionado manualmente pelo jogador (mesmo ao atingir o requisito, ele decide quando romper).

---

## 19. Corpo Imortal

> ⚠️ **Fora do escopo da migração nesta fase.** Documentado aqui como referência do comportamento atual; não faz parte do roadmap de [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md#2-escopo-desta-migração) por enquanto.

**Arquivo:** `corpo-imortal-sistema.js`.

Sistema de investimento de pontos em 4 "funções" espirituais, cada uma de nível 0 a 6:
🔵 **Dantian** (absorção/armazenamento de Qi) · 🟢 **Meridianos** (eficiência de cultivo) · 🔴 **Refino Corporal** (vida/ataque/defesa) · 🟣 **Mar Espiritual** (capacidade/estabilidade).

### Geração de pontos

```
Pontos Disponíveis = floor( (FOR+VIT+AGI+INT+PER+SOR) / 50 )
```

Cresce automaticamente conforme os atributos do personagem sobem — não há XP separado.

### Passo a passo

1. O popup mostra os 4 medidores com nível atual e pontos disponíveis para gastar.
2. Clicar em "Upgrade" numa função gasta 1 ponto e sobe o nível (até 6), aplicando bônus fixos por nível (ex.: Refino Corporal nível N dá `+2N` de HP máximo).
3. Cada nível desbloqueado concede 1-3 **melhorias narrativas** específicas (habilidades ativas/passivas), listadas automaticamente.

---

## 20. Veias Astrais

**Arquivo:** `veias-astrais-sistema.js`.

Uma árvore de talentos visual, estilo "constelação" (mapa navegável com zoom/pan, como em jogos de árvore de talentos tipo Path of Exile).

### Estrutura

5 constelações, cada uma ligada a uma "Divindade" temática: ⚔️ Arty (Caos), ✨ Aune (Destino), 📚 Ephelias (Compreensão), 🌀 Nishi (Equilíbrio), 🌿 Hestia (Criação). Cada constelação tem **10 nós** organizados em 5 camadas radiais ao redor de um núcleo central, cada nó com um custo e um bônus de atributo.

### Passo a passo

1. Abrir o mapa mostra as 5 constelações; o jogador pode **arrastar** (pan) e usar a roda do mouse ou pinça (touch) para **zoom**.
2. Clicar num nó bloqueado (🔒) mostra quanto **Power Combat** (seção 4, reaproveitado aqui como "moeda" de progressão) é necessário para desbloqueá-lo — incluindo o custo de todos os nós-pai ainda bloqueados no caminho até ele.
3. Se houver PC suficiente, o nó (e toda a cadeia de pais necessária) é desbloqueado de uma vez, ativando os bônus e acendendo as linhas de conexão com a cor da constelação.
4. Estados visuais dos nós: 🔒 Bloqueado, 🔓 Desbloqueado, ⭐ Ativo, 👑 Maximizado.
5. Clicar na imagem do "cristal" central abre um resumo somente-leitura de todos os bônus atualmente ativos, agrupados por constelação.

O fundo do mapa é um céu estrelado procedural animado (canvas), com modo de performance reduzida detectado automaticamente em hardware mais fraco.

> 🔄 **Nota de migração**: a estrutura da árvore já existe como coleção `veiasAstrais`, filtrada pelo universo do personagem, e as divindades como coleção `divindades` (compartilhada entre universos) no Firestore compartilhado — só o progresso do personagem (nós desbloqueados, PC gasto) fica no documento do personagem (ver [MIGRACAO-REACT-FIREBASE.md §4](./MIGRACAO-REACT-FIREBASE.md#4-dados-de-referência-já-existentes-no-firestore--não-duplicar)).

---

## 21. Códex Mágico

**Arquivo:** `codex-magico.js`.

Popup de ajuda/tutorial estático em formato acordeão (sem estado de jogo), com 6 seções fixas: Dicas Principais, Guia de Criação de Ficha (passo a passo narrado), Inventário, Treinamento, Habilidades (explica Núcleo/Art/Variante) e uma seção de regras textuais de Meridianos/Dantian (fórmulas de dado para abertura manual). Clicar numa seção expande e recolhe as demais.

---

## 22. Popup de Informações do Jogador

**Arquivo:** `popup-info-jogador.js`.

Acessível pelo botão "Info" da sidebar. Três abas:

1. **Atributos Básicos**: Nome do Personagem e Título (editáveis); Classe e Raça (somente leitura, preenchidas automaticamente pelos módulos de Classes/Raças).
2. **Informações Gerais**: Origem, Afiliação, Status Narrativo, Notas Adicionais.
3. **Background**: editor de texto rico (negrito/itálico/sublinhado/listas/alinhamento) com suporte a **salvar templates de lore** reutilizáveis e limite de 5000 caracteres.

Esse popup é o ponto de sincronização entre os módulos de Raça e Classe: sempre que uma raça ou classe é escolhida, o nome exibido é atualizado aqui automaticamente.

---

## 23. Salvar, Importar e Limpar Ficha

**Arquivo:** `sistema-salvar-importar.js`, `limpar-ficha-isolado.js`.

### Salvamento automático (sempre ativo)

Toda a ficha é salva continuamente no navegador (sem intervenção do usuário) conforme cada campo é editado — não há um botão "Salvar" que precise ser clicado para não perder dados durante o uso normal.

> ✅ **Nota de migração — implementado**: esse autosave contínuo não foi portado. Na reescrita, salvar é uma ação explícita do usuário (botão "Salvar" por aba/seção, gravando no Firestore) — enquanto o formulário não é salvo, os valores em edição ficam espelhados em `localStorage` como rascunho (`useDraftLocalStorage`), com um banner "Restaurar/Descartar" ao reabrir a aba, para não se perder em caso de fechar a aba por acidente (ver [MIGRACAO-REACT-FIREBASE.md §7.3](./MIGRACAO-REACT-FIREBASE.md#73-salvar-submit-explícito--rascunho-em-localstorage)).

### Botão "Salvar" (sidebar) — exportar backup em arquivo

1. Coleta todos os dados da ficha (atributos, status, aptidões, habilidades, inventário, treinamento, companheiros, cultivação, corpo imortal, loja, sorte, condições, classe, raça, veias astrais, informações do jogador).
2. Gera um arquivo `.json` com o nome do personagem e inicia o download no navegador.

### Botão "Importar" — restaurar de um arquivo

1. O jogador seleciona um arquivo `.json` exportado anteriormente.
2. O sistema valida a estrutura do arquivo e restaura todos os módulos listados acima, atualizando a tela sem precisar recarregar a página.

> ⚠️ **Decisão de migração**: essa funcionalidade **não será portada**. O site novo não terá ferramenta de importação de fichas antigas — cada personagem é criado do zero diretamente na ficha do site novo (ver [MIGRACAO-REACT-FIREBASE.md §2.1](./MIGRACAO-REACT-FIREBASE.md#21-decisões-já-tomadas-não-reabrir)).

### Botão "Limpar Ficha" (junto ao retrato do personagem)

1. Pede confirmação (ação destrutiva).
2. Apaga **todos** os dados salvos do navegador (armazenamento local, incluindo imagens) e reseta a interface inteira para o estado inicial (zerado).
3. Recarrega a página automaticamente ao final.

---

## Observações finais sobre o comportamento do site vanilla (histórico) — o que a migração mudou

- O site vanilla era **100% client-side**: todos os dados viviam no navegador do próprio jogador (armazenamento local do navegador); não havia conta de usuário, login ou sincronização entre dispositivos. O único "backup" possível era o export/import manual de arquivo `.json`. **Na migração**: Firebase Auth + Firestore substituíram isso — personagens agora são contas reais, sincronizadas, sem export/import de `.json`.
- A barra de progressão de Classes por Power Combat (seção 12) era **informativa**, não uma trava automática — dependia do critério do mestre. **Mantido assim na migração.**
- O sistema de Condições (seção 7) era puramente descritivo: os efeitos não alteravam automaticamente os números de atributos/combate. **Mantido assim.**
- Duas economias de moeda coexistiam sem conversão entre si: **Fortuna** (Loja da Trapaça, ligada à Sorte) e **Rokmas** (Menu de Itens, ligada ao Inventário). **Mantido assim** — mas note que na migração `sorte.fortunaAtual` é a única fonte de verdade para a Fortuna (ver nota em MIGRACAO-REACT-FIREBASE.md sobre a inconsistência de schema resolvida).
- **Reputação** (seção 5), **Corpo Imortal** (seção 19), **Companheiros** (seção 17) e **Cultivação** (seção 18) **não foram implementados** — ficam de fora do escopo desta migração, backlog futuro.
- **Aptidões** (seção 9) deixaram de conceder bônus numérico a atributos na migração — são puramente narrativas agora.
- A **Loja Rokmas** (seção 16) trocou seu catálogo próprio pela leitura direta da coleção `itens` do Firestore, filtrada pelo universo do personagem; e a aba de **Arts/Habilidades** (seção 10) aceita Arts de 3 origens (autoral, habilidade de classe, ou catálogo de Arts do Firestore por universo). **Implementado.**
- O salvamento automático contínuo do site vanilla **não foi portado** — a migração usa salvar explícito (botão por aba), com os campos em edição espelhados em `localStorage` como rascunho enquanto não salvos (MIGRACAO-REACT-FIREBASE.md §7.3), para não perder trabalho ao fechar/recarregar a aba por acidente. **Implementado** (`src/hooks/useDraftLocalStorage.js` + `src/components/DraftBanner/`, nas abas Atributos e Perfil — as únicas com esse padrão de salvar explícito).
- O botão **"Importar"** (seção 23) **não foi portado** — não há conversão de fichas antigas para o site novo; personagens são criados do zero.

### Arquitetura da migração (resumo)

O site vanilla foi substituído **neste mesmo repositório**, que compartilha o **mesmo projeto Firebase** (Auth + Firestore) de um projeto administrativo já existente ("Re-Dungeon — Banco de Dados"). Esse projeto administrativo mantém, em coleções Firestore próprias, boa parte dos catálogos que antes eram hardcoded aqui (Raças, Classes, Aptidões, Condições, Veias Astrais/Divindades, Itens, Artes, Origens, Regras) — a migração consome esses catálogos por leitura em vez de recriá-los ou populá-los (isso é feito por um processo separado), e adiciona uma coleção nova, `personagens` (mais as subcoleções `aptidoesAdquiridas`, `arts` e `historicoSorte`), para os dados de cada ficha de jogador. Detalhes completos e status fase a fase em [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md) e [player-site-handoff.md](./player-site-handoff.md); convenções de código em `CLAUDE.md`.
