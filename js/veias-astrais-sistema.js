/**
 * SISTEMA DE VEIAS ASTRAIS - REFATORAÇÃO COMPLETA
 * Gerenciamento de árvores, nós, conexões e interações
 * Mapa expansivo (5000x5000), navegável, com múltiplas constelações
 */

class VeiasAstraisSystem {
  constructor() {
    // Elementos DOM
    this.modal = document.getElementById("veias-astrais-modal");
    this.viewport = document.getElementById("astral-viewport");
    this.map = document.getElementById("astral-map");
    this.linksCanvas = document.getElementById("astral-links-canvas");
    this.nodesContainer = document.getElementById("astral-nodes-container");
    this.sidebar = document.querySelector(".veias-astrais-sidebar");

    // Dados do Sistema
    this.trees = {};
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;

    // Recursos - Agora usando Power Combat em vez de Mana Points
    // Usamos propriedades internas com accessors para garantir atualização em tempo real
    this._powerCombat = 0;
    this._maxPowerCombat = 0;

    Object.defineProperty(this, 'powerCombat', {
      configurable: true,
      enumerable: true,
      get: function () {
        return this._powerCombat;
      },
      set: function (v) {
        const num = Number(v) || 0;
        // Se max definido (>0), respeitar limite. Caso contrário permitir valor >=0.
        if (this._maxPowerCombat > 0) {
          this._powerCombat = Math.max(0, Math.min(this._maxPowerCombat, num));
        } else {
          this._powerCombat = Math.max(0, num);
        }
        if (typeof this.updateUI === 'function') this.updateUI();
      },
    });

    Object.defineProperty(this, 'maxPowerCombat', {
      configurable: true,
      enumerable: true,
      get: function () {
        return this._maxPowerCombat;
      },
      set: function (v) {
        const num = Number(v) || 0;
        const antigo = this._maxPowerCombat;
        this._maxPowerCombat = Math.max(0, num);
        // Se novo máximo é menor que o atual, ajustar current para o máximo
        if (this._maxPowerCombat > 0 && this._powerCombat > this._maxPowerCombat) {
          this._powerCombat = this._maxPowerCombat;
        }
        if (typeof this.updateUI === 'function') this.updateUI();
      },
    });
    this.resonance = 45;
    this.maxResonance = 100;

    // Bônus Ativos
    this.activeBonuses = [];

    // Navegação
    this.navigation = null;

    // Destaque visual por constelação (treeId) - null = nenhum
    this.highlightedTreeId = null;

    // Ativação de Linhas (será inicializada depois)
    this.lineActivation = null;

    // Controla se as linhas de 'caminhos possíveis' (tracejadas/roxas) são exibidas
    // Defina `true` se quiser reativar a visualização de caminhos possíveis
    this.showPossiblePaths = false;

    // Estado
    this.initialized = false;

    // Estado restaurado do localStorage
    this.loadedSavedAstralState = false;

    // Configuração de animações
    this.particleManager = new ParticleManager();
    this.performancePreference = null;
  }

  /**
   * NOTIFICAÇÃO - Exibir mensagem no canto superior direito
   */
  showNotification(message, type = "info", duration = 3000) {
    const container = document.getElementById("notification-container");
    if (!container) {
      console.warn("⚠️ Container de notificações não encontrado");
      return;
    }

    // Criar elemento da notificação
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Estilos inline para garantir visibilidade
    notification.style.cssText = `
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 8px;
            backdrop-filter: blur(10px);
        `;

    // Cores baseadas no tipo
    const colors = {
      success: {
        bg: "rgba(102, 221, 102, 0.15)",
        text: "#66dd66",
        border: "#66dd66",
      },
      error: {
        bg: "rgba(255, 68, 68, 0.15)",
        text: "#ff6b6b",
        border: "#ff4444",
      },
      warning: {
        bg: "rgba(255, 221, 68, 0.15)",
        text: "#ffdd44",
        border: "#ffbb00",
      },
      info: {
        bg: "rgba(68, 119, 221, 0.15)",
        text: "#4477dd",
        border: "#4477dd",
      },
    };

    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg;
    notification.style.color = color.text;
    notification.style.borderLeft = `3px solid ${color.border}`;

    // Adicionar ao container
    container.appendChild(notification);

    // Remover após duração
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out forwards";
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  /**
   * INICIALIZAÇÃO
   */
  async init() {
    if (this.initialized) return;

    try {
      this.loadPerformancePreference();
      // OTIMIZADO: Detectar modo performance antes de inicializar
      this.detectPerformanceMode();

      this.generateTrees();
      this.generateNodes();

      // 🔄 Carregar estados salvos se existirem
      this.loadSavedStates();

      this.generateConnections();
      this.renderUI();
      
      // OTIMIZADO: Criar partículas apenas se não estiver em modo performance
      if (!this.performanceMode) {
        this.createCoreParticles();
      }

      // Inicializar navegação
      if (!this.navigation) {
        this.navigation = new VeiasAstraisNavigation(this);
      }

      // ⚔️ Configurar sincronização de Power Combat
      this.setupPowerCombatListener();

      // Ativar bônus dos nós já desbloqueados
      this.nodes.forEach((node) => {
        if (
          (node.state === "unlocked" || node.state === "maxed") &&
          node.bonus
        ) {
          this.activateBonus(node.bonus);
        }
      });

      this.initialized = true;
      console.log("✨ VeiasAstraisSystem inicializado completamente");
    } catch (error) {
      console.error("❌ Erro ao inicializar VeiasAstraisSystem:", error);
    }
  }

  /**
   * SINCRONIZAR POWER COMBAT COM ATRIBUTOS
   * Obtém o valor atual de Power Combat do PowerCombatCalculator
   * Atualiza o máximo sempre que houver mudança
   */
  syncPowerCombatFromAppState() {
    if (!window.powerCombatCalculator) {
      console.warn(
        "⚠️ PowerCombatCalculator não disponível para sincronização",
      );
      return;
    }

    try {
      // Obter o Power Combat calculado (valor exposto pelo calculador)
      const novoValor = window.powerCombatCalculator.valorPC || 0;

      // Se não houve alteração em nada, mantemos quietos
      const maxMudou = this.maxPowerCombat !== novoValor;
      const valorAtualMudou = this.powerCombat !== novoValor;

      // Atualizar comportamento:
      // - Tratar o valor do calculador como o novo "maxPowerCombat" do sistema
      // - Ajustar o current PC para não exceder o máximo
      // - Em caso de primeira sincronização, definir current = max
      if (maxMudou || valorAtualMudou) {
        const antigoMaxPowerCombat = this.maxPowerCombat;

        if (maxMudou) {
          console.log(
            `📈 Máximo Power Combat atualizado: ${this.maxPowerCombat} → ${novoValor}`,
          );
        }

        // Atualizar máximo sempre
        this.maxPowerCombat = novoValor;

        // Se for primeira sincronização (antigo máximo era 0 e current == 0), igualar ao máximo
        if (antigoMaxPowerCombat === 0 && this.powerCombat === 0 && this.maxPowerCombat > 0) {
          this.powerCombat = this.maxPowerCombat;
          console.log(
            `✨ Primeira sincronização: Power Combat definido como ${this.powerCombat}`,
          );
        }

        // Se o máximo aumentou, acrescentar a diferença ao current
        if (novoValor > antigoMaxPowerCombat) {
          const incremento = novoValor - antigoMaxPowerCombat;
          // Conceder os pontos adicionais quando o máximo sobe (com limite no novo máximo)
          this.powerCombat = Math.min(this.powerCombat + incremento, this.maxPowerCombat);
          console.log(`⬆️ Máximo aumentou, adicionados ${incremento} ao PC atual: ${this.powerCombat}`);
        }

        // Se o máximo diminuiu, reduzir o current pela diferença (corrigindo erros de entrada)
        if (novoValor < antigoMaxPowerCombat) {
          const decremento = antigoMaxPowerCombat - novoValor;
          this.powerCombat = Math.max(0, this.powerCombat - decremento);
          console.log(`⬇️ Máximo diminuiu, reduzido ${decremento} do PC atual: ${this.powerCombat}`);
        }

        // Garantir que current não exceda o novo máximo
        if (this.powerCombat > this.maxPowerCombat) {
          console.log(
            `📉 PC atual reduzido de ${this.powerCombat} para ${this.maxPowerCombat} (excedia o máximo)`,
          );
          this.powerCombat = this.maxPowerCombat;
        }
        window.debugLog && window.debugLog(`⚔️ Power Combat: ${this.powerCombat} / ${this.maxPowerCombat}`);
        this.updateUI();
        this.saveState();
      }
    } catch (error) {
      console.error("❌ Erro ao sincronizar Power Combat:", error);
    }
  }

  /**
   * Tratamento imediato quando o calculador externo notifica com um novo valor
   */
  handleExternalPowerCombatChange(novoValor) {
    try {
      novoValor = Number(novoValor) || 0;
      const antigoMax = this.maxPowerCombat;
      this.maxPowerCombat = novoValor;

      if (antigoMax === 0 && this.powerCombat === 0 && this.maxPowerCombat > 0) {
        this.powerCombat = this.maxPowerCombat;
      }

      // Se o máximo aumentou, acrescentar diferença ao current
      if (novoValor > antigoMax) {
        const incremento = novoValor - antigoMax;
        this.powerCombat = Math.min(this.powerCombat + incremento, novoValor);
      }

      // Se o máximo diminuiu, reduzir o current pela diferença
      if (novoValor < antigoMax) {
        const decremento = antigoMax - novoValor;
        this.powerCombat = Math.max(0, this.powerCombat - decremento);
      }

      if (this.powerCombat > this.maxPowerCombat) this.powerCombat = this.maxPowerCombat;

      this.updateUI();
      this.saveState();
    } catch (e) {
      console.error('❌ Erro em handleExternalPowerCombatChange:', e);
    }
  }

  /**
   * INICIAR MONITORAMENTO DE POWER COMBAT
   * Registra callback para atualização imediata quando Power Combat muda
   * + polling como fallback
   */
  setupPowerCombatListener() {
    // Sincronizar imediatamente
    if (!this.loadedSavedAstralState) {
      this.syncPowerCombatFromAppState();
    } else {
      console.log('🔁 Estado das Veias Astrais restaurado do localStorage; mantendo Power Combat salvo');
    }

    // 🔔 Registrar callback para mudanças imediatas
    if (window.powerCombatCalculator) {
      window.powerCombatCalculator.onChange((novoValor) => {
        console.log(
          `🔥 Power Combat mudou para ${novoValor}! Sincronizando imediatamente...`,
        );
        // Atualizar imediatamente com o valor recebido
        if (typeof this.handleExternalPowerCombatChange === 'function') {
          this.handleExternalPowerCombatChange(novoValor);
        } else {
          this.syncPowerCombatFromAppState();
        }
      });
      console.log(
        "✅ Callback de Power Combat registrado para atualização imediata",
      );
    }

    // Monitorar mudanças periodicamente (polling) como fallback
    this.powerCombatInterval = setInterval(() => {
      this.syncPowerCombatFromAppState();
    }, 500); // Aumentei para 500ms já que temos callback imediato

    console.log(
      "👁️ Listener de Power Combat ativado (imediato + polling 500ms)",
    );
  }

  /**
   * PARAR MONITORAMENTO DE POWER COMBAT
   */
  stopPowerCombatListener() {
    if (this.powerCombatInterval) {
      clearInterval(this.powerCombatInterval);
      this.powerCombatInterval = null;
      console.log("⏹️ Listener de Power Combat parado");
    }
  }
  generateTrees() {
    this.trees = {
      arty: {
        id: "arty",
        name: "⚔️ Arty",
        divinity: "Divindade do Caos",
        color: "#ff4444",
        accentColor: "#ff4444",
        icon: "⚔️",
        symbol: "⚡",
        description:
          "A Entidade do Caos e Destruição - Poder bruto, violência e colapso cósmico",
        loreDescription:
          "Arty sussurra através das Veias Astrais do poder destrutivo. Seus seguidores canalizam agressividade pura e energia descontrolada.",
        imageUrl: "https://i.imgur.com/hcKHg7q.png",
        unlockedNodes: 0,
        totalNodes: 8,
      },
      aune: {
        id: "aune",
        name: "✨ Aune",
        divinity: "Divindade do Destino",
        color: "#ffdd44",
        accentColor: "#ffdd44",
        icon: "✨",
        symbol: "★",
        description:
          "A Entidade do Destino e Fortuna - Coincidência cósmica e inevitabilidade",
        loreDescription:
          "Aune tece os fios da inevitabilidade. Quem recebe sua bênção comanda a probabilidade e o destino cósmico.",
        imageUrl: "https://i.imgur.com/RnxW8Lu.png",
        unlockedNodes: 0,
        totalNodes: 8,
      },
      ephelias: {
        id: "ephelias",
        name: "📚 Ephelias",
        divinity: "Divindade da Compreensão",
        color: "#4477dd",
        accentColor: "#4477dd",
        icon: "📚",
        symbol: "◆",
        description:
          "A Entidade da Sabedoria - Inteligência infinita e conhecimento arcano proibido",
        loreDescription:
          "Ephelias revela segredos antigos. Seus aprendizes ganham acesso ao conhecimento infinito e manipulação arcana.",
        imageUrl: "https://i.imgur.com/tbgx546.png",
        unlockedNodes: 0,
        totalNodes: 8,
      },
      nishi: {
        id: "nishi",
        name: "🌀 Nishi",
        divinity: "Divindade do Equilíbrio",
        color: "#9966ff",
        accentColor: "#9966ff",
        icon: "🌀",
        symbol: "◇",
        description:
          "A Entidade do Equilíbrio - Precisão, harmonia e fluxo perfeito",
        loreDescription:
          "Nishi mantém a harmonia entre forças opostas. Seus seguidores alcançam velocidade, precisão e fluxo perfeito do cosmos.",
        imageUrl: "https://i.imgur.com/gsPqh8R.png",
        unlockedNodes: 0,
        totalNodes: 8,
      },
      hestia: {
        id: "hestia",
        name: "🌿 Hestia",
        divinity: "Divindade da Criação",
        color: "#66dd66",
        accentColor: "#66dd66",
        icon: "🌿",
        symbol: "❖",
        description:
          "A Entidade da Criação - Vitalidade, regeneração e sustentação cósmica",
        loreDescription:
          "Hestia nutre toda a existência. Seus eleitos canalizam vida, proteção divina e crescimento sem limites.",
        imageUrl: "https://i.imgur.com/3r6oZV9.png",
        unlockedNodes: 0,
        totalNodes: 8,
      },
    };

    console.log(
      "✨ Constelações Divinas geradas:",
      Object.keys(this.trees).length,
    );
  }

  /**
   * GERAÇÃO DE NÓS - SISTEMA ORGÂNICO HIERÁRQUICO
   * 10 nós por constelação com tamanho variável e posicionamento natural
   * Estrutura: Básico → Intermediário → Avançado → Supremo
   */
  generateNodes() {
    this.nodes = [];
    let nodeId = 0;

    const centerX = 0;
    const centerY = 0;

    // Configuração das constelações
    const treeConfigs = [
      { id: "arty", angle: 0, color: "#ff4444", name: "Arty", rarity: 1 },
      { id: "aune", angle: 72, color: "#ffdd44", name: "Aune", rarity: 2 },
      {
        id: "ephelias",
        angle: 144,
        color: "#4477dd",
        name: "Ephelias",
        rarity: 3,
      },
      { id: "nishi", angle: 216, color: "#9966ff", name: "Nishi", rarity: 4 },
      { id: "hestia", angle: 288, color: "#66dd66", name: "Hestia", rarity: 5 },
    ];

    // Para cada constelação
    treeConfigs.forEach((treeConfig) => {
      const mainAngleRad = (treeConfig.angle * Math.PI) / 180;

      // ESTRUTURA: 10 nós por constelação
      // 1 nó próximo (L1) + 3 nós básicos (L2) + 3 nós intermediários (L3) + 2 nós avançados (L4) + 1 nó supremo (L5)

      // L1: Nó próximo ao cristal central (conexão direta)
      let l1Names = {
        arty: "Primeiro Sangue",
        aune: "Fio do Destino",
        ephelias: "Olhar do Discernimento",
        nishi: "Centro Imóvel",
        hestia: "Sopro da Origem",
      };
      let node = new AstralNode({
        id: nodeId++,
        treeId: treeConfig.id,
        name: l1Names[treeConfig.id],
        rune: "◆",
        x: centerX + Math.cos(mainAngleRad) * 180,
        y: centerY + Math.sin(mainAngleRad) * 180,
        level: 1,
        cost: 10,
        effect: `Conexão com ${treeConfig.name}`,
        description: `Essência primária de ${treeConfig.name}`,
        color: treeConfig.color,
        state: "locked",
        layer: 1,
        size: "small",
        parentId: "core",
        rarity: 1,
        // ✨ Bônus associado ao nó
        bonus: (function() {
          const base = {
            id: `bonus-${treeConfig.id}-l1`,
            name: `Bênção de ${treeConfig.name}`,
            effect: `Ganhe acesso aos poderes de ${treeConfig.name}`,
            stats: {
              forca: treeConfig.id === "arty" ? 2 : 0,
              inteligencia: treeConfig.id === "ephelias" ? 2 : 0,
              agilidade: treeConfig.id === "nishi" ? 2 : 0,
              vitalidade: treeConfig.id === "hestia" ? 2 : 0,
              sorte: treeConfig.id === "aune" ? 2 : 0,
              ataque: treeConfig.id === "arty" ? 1 : 0,
              defesa: treeConfig.id === "hestia" ? 1 : 0,
            },
          };

          // Personalizar texto do bônus para Hestia (Semente Primordial)
          if (treeConfig.id === 'arty') {
            base.effect = 'Toda guerra começa com uma única gota de sangue. +2dn adicional de dado de dano e +5 Força';
          } 
          if (treeConfig.id === 'aune') {
            base.effect = 'Todo destino tem um ponto de partida. role um sequencia de 3d6 e some o resultado a um atributo de sua escolha.';
          }
          if (treeConfig.id === 'ephelias') {
            base.effect = 'Compreender é o primeiro passo para transcender. +5 Percepção e +10 Inteligência';
          }
          if (treeConfig.id === 'nishi') {
            base.effect = 'A estabilidade é a base de toda existência. +5 Vitalidade e +10 Inteligência';
          }
          if (treeConfig.id === 'hestia') {
            base.effect = 'A primeira respiração do universo. +15% Saúde Máxima e +15% Energia Máxima';
          }
          return base;
        })(),
      });
      this.nodes.push(node);
      const layer1NodeId = node.id;

      // L2: 3 nós básicos (pequenos)
      let l2Names = {
        arty: ["Fúria Crescente", "Instinto de Batalha", "Dança da Carnificina"],
        aune: ["Visão do Possível", "Tecer do Tempo", "Precisão do Destino"],
        ephelias: ["Mente Serena", "Leitura da Essência", "Conhecimento Acumulado"],
        nishi: ["Harmonia Corporal", "Espírito Sereno", "Balança Celestial"],
        hestia: ["Matéria Primordial", "Movimento das Estrelas", "Consciência Universal"],
      };

      for (let i = 0; i < 3; i++) {
        const spreadAngle = -40 + i * 40;
        const subAngle = mainAngleRad + (spreadAngle * Math.PI) / 180;
        const distance = 420 + Math.random() * 40;

        // Definir effect específico por constelação e índice
        let l2Effect = "";
        if (treeConfig.id === "arty") {
          l2Effect = [
            "Quanto maior o conflito, mais intensa se torna sua chama. +10 Força ou +10 Agilidade",
            "Sobrevive quem reage primeiro. +1 Reação e +30 Prontidão",
            "Cada golpe desferido é uma obra de destruição. +1 Precisão e +1 Evasão",
          ][i];
        } else if (treeConfig.id === "aune") {
          l2Effect = [
            "Ela enxerga todos os caminhos que podem se tornar realidade. +5 Percepção e +5 Inteligência",
            "Age em compreende o tempo chegue.  +25  Prontidão ou +3 Reação",
            "Seus fios nunca erram o alvo. +1 Precisão e +1 Evasão",
          ][i];
        } else if (treeConfig.id === "ephelias") {
          l2Effect = [
            "Uma mente calma jamais desperdiça seu poder. +30% Energia ou Fadiga Máxima",
            "Toda existência revela sua verdadeira natureza para quem sabe observar. +1 Precisão  e +15% Prontidão",
            "Cada experiência se torna um novo alicerce. Sempre que sobreviver a um combate, ganha +1dn de Ataque e Defesa no próximo combate.",
          ][i];
        } else if (treeConfig.id === "nishi") {
          l2Effect = [
            "Corpo e mente devem caminhar lado a lado. Para cada 5 pontos em Força você ganha +1 Agilidade",
            "Quando tudo está em equilíbrio, nada falta. Quando tres atributos alinhados (Estrelas) estao com mesmo valores eles se intensificam em 25%. ",
            "Toda força deve encontrar uma resistência equivalente. +10% Energia Máxima e +10% Saúde Máxima",
          ][i];
        } else if (treeConfig.id === "hestia") {
          l2Effect = [
            "Da vontade de Hestia surgiu a matéria. +10 Vitalidade ou +10 Força",
            "Nada permanece imóvel diante da criação.  +5 Agilidade  e +10% Prontidão",
            "Toda sabedoria nasceu de seu pensamento. +10 Inteligência ou +10 Percepção",
          ][i];
        }

        node = new AstralNode({
          id: nodeId++,
          treeId: treeConfig.id,
          name: l2Names[treeConfig.id][i],
          rune: "●",
          x: centerX + Math.cos(subAngle) * distance,
          y: centerY + Math.sin(subAngle) * distance,
          level: 2,
          cost: 15,
          effect: `Habilidade básica`,
          description: `Poder básico de ${treeConfig.name}`,
          color: treeConfig.color,
          state: "locked",
          layer: 2,
          size: "small",
          parentId: layer1NodeId,
          rarity: 1,
          // ✨ Bônus associado ao nó L2
          bonus: {
            id: `bonus-${treeConfig.id}-l2-${i}`,
            name: `Poder Básico de ${treeConfig.name}`,
            effect: l2Effect,
            stats: {},
          },
        });
        this.nodes.push(node);
      }

      // L3: 3 nós intermediários (médios)
      let l3Names = {
        arty: ["Chamas do Conflito", "Campo de Ossos", "Caos Incontrolável"],
        aune: ["Capricho da Fortuna", "Proteção do Futuro", "Caminhos Entrelaçados"],
        ephelias: ["Sabedoria Inabalável", "Entendimento Absoluto", "Harmonia da Razão"],
        nishi: ["Olhos da Harmonia", "Fluxo Perfeito", "Caminho do Meio"],
        hestia: ["Destino Tecido", "Chama da Existência", "Harmonia da Criação"],
      };

      const layer2Nodes = this.nodes.filter(
        (n) => n.treeId === treeConfig.id && n.layer === 2,
      );

      // Mapeamento explícito de qual nó L2 é pai de cada nó L3 (por índice)
      // ephelias: Conhecimento Oculto(0)→Percepção Astral(0), Mente Aberta(1)→Sabedoria Antiga(1), Fluxo Arcano(2)→Eco da Memória(2)
      const l3ParentIdxMap = {
        arty: [0, 1, 2],
        aune: [0, 1, 2],
        ephelias: [0, 1, 2],
        nishi: [0, 1, 2],
        hestia: [0, 1, 2],
      };

      for (let i = 0; i < 3; i++) {
        const spreadAngle = -50 + i * 50;
        const subAngle = mainAngleRad + (spreadAngle * Math.PI) / 180;
        const distance = 700 + Math.random() * 60;

        // Definir effect específico por constelação e índice
        let l3Effect = "";
        if (treeConfig.id === "arty") {
          l3Effect = [
            "A guerra exige sacrifícios. +30% Dano causado e -30% de defesa",
            "Os caídos alimentam os vencedores. Recupera 25% da Energia (Final do  Combate) e Recupera 25% da Fadiga (Final do  Combate).",
            "A imprevisibilidade é a arma favorita do caos. +10 Sorte",
          ][i];
        } else if (treeConfig.id === "aune") {
          l3Effect = [
            "O acaso é apenas uma face do destino que ela comanda. +5 Sorte e +16% Chance de Acerto Crítico ",
            "Ela molda o amanhã para proteger seus escolhidos. +5 Defesa  e  +10 Vitalidade",
            "Cada escolha abre caminhos. Ela os entrelaça ao seu favor. +5 Ataque  e +2 Agilidade",
          ][i];
        } else if (treeConfig.id === "ephelias") {
          l3Effect = [
            "A sabedoria permite agir antes que o erro aconteça. +10 Vitalidade e +2 Reação",
            "Ao compreender uma fraqueza, ela deixa de existir como obstáculo. +5 Ataque  e Ignora 10% da Defesa do alvo.",
            "A verdadeira força nasce do equilíbrio entre conhecimento e ação. +1dn adicional Defesa e Ataque",
          ][i];
        } else if (treeConfig.id === "nishi") {
          l3Effect = [
            "Aquele que compreende o equilíbrio jamais desperdiça um movimento. A cada 5 pontos de agilidade o jogador ganha 1 de Prontidão.",
            "Agir no momento certo vale mais que agir primeiro. Sempre que jogador abre mao de uma acao do turno sua prontidao aumenta em 25%.",
            "Nem o excesso, nem a escassez conduzem à verdadeira perfeição. Quando estiver com energia ou fadiga acabando o jogador uma recuperação passiva 1d6 a cada 10% de EnR ou FaD Gasto.",
          ][i];
        } else if (treeConfig.id === "hestia") {
          l3Effect = [
            "Mesmo o acaso caminha por trilhas já vistas por Héstia. +10 Sorte",
            "A fonte que alimenta todas as coisas.  +25% Recuperação de Energia e -25% Consumo de Energia",
            "Criar é equilibrar destruição e preservação. Se ataque e a defesa estiverem com mesmo valor, ambos recebem +1dn adicional.",
          ][i];
        }

        node = new AstralNode({
          id: nodeId++,
          treeId: treeConfig.id,
          name: l3Names[treeConfig.id][i],
          rune: "◇",
          x: centerX + Math.cos(subAngle) * distance,
          y: centerY + Math.sin(subAngle) * distance,
          level: 3,
          cost: 25,
          effect: `Habilidade intermediária`,
          description: `Poder intermediário de ${treeConfig.name}`,
          color: treeConfig.color,
          state: "locked",
          layer: 3,
          size: "medium",
          parentId: layer2Nodes[l3ParentIdxMap[treeConfig.id][i]].id,
          rarity: 2,
          // ✨ Bônus associado ao nó L3
          bonus: {
            id: `bonus-${treeConfig.id}-l3-${i}`,
            name: `Poder Intermediário de ${treeConfig.name}`,
            effect: l3Effect,
            stats: {},
          },
        });
        this.nodes.push(node);
      }

      // L4: 2 nós avançados (grandes)
      let l4Names = {
        arty: ["Avatar da Guerra", "Ruína Inevitável"],
        aune: ["Reverso do Fado", "Olhar da Inevitabilidade"],
        ephelias: ["Revelação da Verdade", "Iluminação Interior"],
        nishi: ["Ciclo Eterno", "Dualidade Perfeita"],
        hestia: ["Olhos da Eternidade", "Vontade Absoluta"],
      };

      const layer3Nodes = this.nodes.filter(
        (n) => n.treeId === treeConfig.id && n.layer === 3,
      );

      // Mapeamento explícito de qual nó L3 é pai de cada nó L4 (por índice)
      // ephelias[1] = Compreensão Suprema → deve herdar de Eco da Memória (índice 2)
      const l4ParentIdxMap = {
        arty: [0, 1],
        aune: [2, 0],
        ephelias: [1, 2],
        nishi: [0, 1],
        hestia: [2, 0],
      };

      for (let i = 0; i < 2; i++) {
        const spreadAngle = -45 + i * 90;
        const subAngle = mainAngleRad + (spreadAngle * Math.PI) / 180;
        const distance = 950 + Math.random() * 80;

        // Definir effect específico por constelação e índice
        let l4Effect = "";
        if (treeConfig.id === "arty") {
          l4Effect = [
            "Quanto mais próximo da morte, mais perigoso se torna. Quando estiver abaixo de 30% da Saúde: +50% Ataque. e +3 Reação.",
            "Seu corpo torna-se uma arma viva. +15 Força ou +15 Vitalidade",
          ][i];
        } else if (treeConfig.id === "aune") {
          l4Effect = [
            "Mesmo o inevitável pode ser dobrado. -25% Tempo de Recarga de Habilidades e +20% Recuperação de Energia",
            "Ao iniciar a batalha, recebe 1 acúmulo de Presságio (máx. 3). Cada acúmulo aumenta +5% do dano causado e +5% de redução do dano recebido. ",
          ][i];
        } else if (treeConfig.id === "ephelias") {
          l4Effect = [
            "A verdade sempre encontra aqueles que a procuram. +15 Percepção ou +10 Sorte",
            "Quanto mais aprende, menos esforço precisa para agir. +20 Energia Máxima e +20 Prontidão. Sempre que utilizar uma habilidade, recupera 5% da Energia Máxima.",
          ][i];
        } else if (treeConfig.id === "nishi") {
          l4Effect = [
            "Tudo que é gasto retorna ao seu estado natural.  Recupera 10% da Saúde e 10% da Energia ao final de cada combate.",
            "Ofensa e defesa são apenas dois lados da mesma verdade. Sempre que sofrer dano, recebe +2dn de  Ataque no próximo turno. Sempre que causar dano, recebe +2dn Defesa até o próximo turno.",
          ][i];
        } else if (treeConfig.id === "hestia") {
          l4Effect = [
            "Nenhum detalhe escapa ao olhar da Criadora. +1 Precisão  e  +3 Reação",
            "Sua vontade sustenta os céus.  +1 Evasão e +25 Prontidão e  Imunidade a penalidades leves de Fadiga",
          ][i];
        }

        node = new AstralNode({
          id: nodeId++,
          treeId: treeConfig.id,
          name: l4Names[treeConfig.id][i],
          rune: "★",
          x: centerX + Math.cos(subAngle) * distance,
          y: centerY + Math.sin(subAngle) * distance,
          level: 4,
          cost: 40,
          effect: `Habilidade avançada`,
          description: `Poder avançado de ${treeConfig.name}`,
          color: treeConfig.color,
          state: "locked",
          layer: 4,
          size: "large",
          parentId: layer3Nodes[l4ParentIdxMap[treeConfig.id][i]].id,
          rarity: 3,
          // ✨ Bônus associado ao nó L4
          bonus: {
            id: `bonus-${treeConfig.id}-l4-${i}`,
            name: `Poder Avançado de ${treeConfig.name}`,
            effect: l4Effect,
            stats: {},
          },
        });
        this.nodes.push(node);
      }

      // L5: 1 nó supremo (muito grande - estrela divina)
      let l5Names = {
        arty: "Trono da Destruição",
        aune: "Trono do Destino",
        ephelias: "Trono da Compreensão",
        nishi: "Trono do Equilíbrio",
        hestia: "Trono da Criadora",
      };

      // Definir effect específico por constelação
      let l5Effect = "";
      if (treeConfig.id === "arty") {
        l5Effect =
          "Uma vez por combate, ao sofrer dano fatal: Sobrevive com 1 de Saúde e Recebe +100% Ataque e +30% Prontidão por 3 turnos.";
      } else if (treeConfig.id === "aune") {
        l5Effect =
          "Uma vez a cada 3 sessão, pode reescrever o fio do destino: Restaura 30% da Saúde e 30% da Energia; ou Remove todos os efeitos negativos e se torna Imune a Controle por 2 turnos. +5 Em todos atributos.";
      } else if (treeConfig.id === "ephelias") {
        l5Effect =
          "Uma vez a cada três combate, alcança um estado de Iluminação por 3 turnos: Recebendo +5 Reação e +3 Precisão, e reduzindo custo de habilidades de energia em 50%. ";
      } else if (treeConfig.id === "nishi") {
        l5Effect =
          "Uma vez por combate, entra no estado de Equilíbrio Absoluto por 3 turnos:  Todo dano recebido é reduzido em 25%. Todo dano causado é aumentado em 25%. Recupera 25% da Saúde e 25% da Energia ao final de cada turno. Torna-se imune a efeitos que alterem seus atributos.";
      } else if (treeConfig.id === "hestia") {
        l5Effect =
          "Aquela que criou a existência não permite que sua chama se apague tão facilmente.  +10 em TODOS os atributos principais | +10% Saúde Máxima | +10% Energia Máxima";
      }

      const layer4Nodes = this.nodes.filter(
        (n) => n.treeId === treeConfig.id && n.layer === 4,
      );

      // Mapeamento explícito de qual nó L4 é pai do nó L5 (por índice)
      // ephelias: Avatar herda de Compreensão Suprema (índice 1) para seguir a cadeia correta
      const l5ParentIdxMap = {
        arty: 0,
        aune: 0,
        ephelias: 0,
        nishi: 0,
        hestia: 0,
      };

      const supremeAngle = mainAngleRad;
      const supremeDistance = 1200;

      node = new AstralNode({
        id: nodeId++,
        treeId: treeConfig.id,
        name: l5Names[treeConfig.id],
        rune: "✦",
        x: centerX + Math.cos(supremeAngle) * supremeDistance,
        y: centerY + Math.sin(supremeAngle) * supremeDistance,
        level: 5,
        cost: 100,
        effect: `Poder Divino Supremo`,
        description: `Poder supremo e divino de ${treeConfig.name}`,
        color: treeConfig.color,
        state: "locked",
        layer: 5,
        size: "large",
        parentId: layer4Nodes[l5ParentIdxMap[treeConfig.id]].id,
        rarity: 5,
        // ✨ Bônus associado ao nó L5
        bonus: {
          id: `bonus-${treeConfig.id}-l5`,
          name: `Avatar Divino de ${treeConfig.name}`,
          effect: l5Effect,
          stats: {},
        },
      });
      this.nodes.push(node);

      // Atualizar contagem
      if (this.trees[treeConfig.id]) {
        this.trees[treeConfig.id].totalNodes = 10;
      }
    });

    console.log(
      `✨ ${this.nodes.length} nós orgânicos gerados em hierarquia 5 camadas`,
    );
  }

  /**
   * GERAÇÃO DE CONEXÕES - VEIAS ENERGÉTICAS ORGÂNICAS
   * Sistema de linhas vivas com fluxo de energia e estilo único por constelação
   */
  generateConnections() {
    this.connections = [];

    // Agrupar nós por camada
    const layerNodes = {};
    for (let layer = 1; layer <= 5; layer++) {
      layerNodes[layer] = this.nodes.filter((n) => n.layer === layer);
    }

    // 1. CONEXÕES PRIMÁRIAS: Core → L1
    layerNodes[1].forEach((node) => {
      this.connections.push({
        from: "core",
        to: node.id,
        state: "unlocked",
        type: "primary",
        intensity: "high",
      });
    });

    // 2. CONEXÕES L1 → L2 (nós básicos)
    layerNodes[2].forEach((node) => {
      const parentNode = layerNodes[1].find((n) => n.treeId === node.treeId);
      if (parentNode) {
        this.connections.push({
          from: parentNode.id,
          to: node.id,
          state: node.state,
          type: "secondary",
          intensity: "medium",
        });
      }
    });

    // 3. CONEXÕES L2 → L3 (intermediários)
    layerNodes[3].forEach((node, idx) => {
      const layer2Same = layerNodes[2].filter((n) => n.treeId === node.treeId);
      if (layer2Same.length > 0) {
        // Conectar em padrão cruzado para parecer mais orgânico
        const parentIdx = idx % layer2Same.length;
        this.connections.push({
          from: layer2Same[parentIdx].id,
          to: node.id,
          state: node.state,
          type: "tertiary",
          intensity: "medium",
        });
      }
    });

    // 4. CONEXÕES L3 → L4 (avançados)
    layerNodes[4].forEach((node, idx) => {
      const layer3Same = layerNodes[3].filter((n) => n.treeId === node.treeId);
      if (layer3Same.length > 0) {
        const closestIdx = idx % layer3Same.length;
        this.connections.push({
          from: layer3Same[closestIdx].id,
          to: node.id,
          state: node.state,
          type: "quaternary",
          intensity: "medium-high",
        });
      }
    });

    // 5. CONEXÕES L4 → L5 (supremo)
    layerNodes[5].forEach((node) => {
      const layer4Same = layerNodes[4].filter((n) => n.treeId === node.treeId);
      if (layer4Same.length > 0) {
        // Conectar ao primeiro nó avançado (deve ser apenas 2)
        this.connections.push({
          from: layer4Same[0].id,
          to: node.id,
          state: node.state,
          type: "supreme",
          intensity: "very-high",
        });
      }
    });

    // 6. CONEXÕES LATERAIS (intra-camada para coesão visual)
    for (let layer = 2; layer <= 4; layer++) {
      const sameLayerNodes = this.nodes.filter((n) => n.layer === layer);

      // Agrupar por constelação
      const constellations = {};
      sameLayerNodes.forEach((node) => {
        if (!constellations[node.treeId]) {
          constellations[node.treeId] = [];
        }
        constellations[node.treeId].push(node);
      });

      // Conectar nós adjacentes da mesma constelação em padrão orgânico
      Object.values(constellations).forEach((nodes) => {
        if (nodes.length >= 2) {
          for (let i = 0; i < nodes.length - 1; i++) {
            const dist = Math.hypot(
              nodes[i].x - nodes[i + 1].x,
              nodes[i].y - nodes[i + 1].y,
            );

            // Conectar se forem próximos (cria teia local)
            if (dist < 700 && Math.random() > 0.3) {
              this.connections.push({
                from: nodes[i].id,
                to: nodes[i + 1].id,
                state: "locked",
                type: "lateral",
                intensity: "low",
                isDashed: true,
              });
            }
          }
        }
      });
    }

    console.log(
      `✨ ${this.connections.length} veias energéticas orgânicas geradas`,
    );
  }

  /**
   * RENDER DA UI
   */
  renderUI() {
    this.renderSidebar();
    this.renderNodes();
    this.renderConnections();
  }

  renderSidebar() {
    const treesList = document.getElementById("trees-categories");
    if (!treesList) return;

    treesList.innerHTML = "";

    Object.values(this.trees).forEach((tree) => {
      const treeItem = document.createElement("div");
      treeItem.className = "tree-item trees-list-item";
      treeItem.setAttribute("data-tree", tree.id);
      // Indicar que é clicável
      treeItem.style.cursor = 'pointer';
      // Marcar ativo se for o destacado atualmente
      if (this.highlightedTreeId === tree.id) {
        treeItem.classList.add('tree-item--active');
      }
      treeItem.style.borderLeftColor = tree.color || "#4a9eff";
      treeItem.innerHTML = `
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                    <div class="constellation-image-wrapper" style="flex-shrink: 0;">
                        ${tree.imageUrl ? `<img src="${tree.imageUrl}" alt="${tree.name}" class="constellation-image">` : `<div class="constellation-image placeholder">${tree.icon}</div>`}
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 1px;">
                        <span style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0;">${tree.name}</span>
                        <span style="font-size: 0.7rem; opacity: 0.7; color: #cbd5e0;">${tree.divinity}</span>
                    </div>
                    <span style="font-weight: 600; font-size: 0.7rem; white-space: nowrap; flex-shrink: 0;">${tree.unlockedNodes}/${tree.totalNodes}</span>
                </div>
            `;
      // Clique: alterna destaque desta constelação
      treeItem.addEventListener('click', () => {
        this.toggleHighlight(tree.id);
      });

      // ⚠️ NAVEGAÇÃO AUTOMÁTICA DESATIVADA
      // Descomentar a linha abaixo para reativar navegação ao clicar em constelação
      // treeItem.addEventListener('click', () => {
      //     this.focusTree(tree.id);
      // });

      treesList.appendChild(treeItem);
    });
  }

  renderNodes() {
    this.nodesContainer.innerHTML = "";

    this.nodes.forEach((node) => {
      const nodeEl = document.createElement("div");
      // Adicionar classe de tamanho
      const sizeClass = `size-${node.size || "medium"}`;
      nodeEl.className = `astral-node node-${node.state} branch-${node.treeId} ${sizeClass}`;
      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;
      nodeEl.style.transform = "translate(-50%, -50%)";
      nodeEl.setAttribute("data-name", node.name);
      nodeEl.setAttribute("data-tree-id", node.treeId);
      nodeEl.id = `node-${node.id}`;

      // Aplicar cor específica da constelação
      const treeColors = {
        arty: "#ff4444",
        aune: "#ffdd44",
        ephelias: "#4477dd",
        nishi: "#9966ff",
        hestia: "#66dd66",
      };

      nodeEl.style.color = treeColors[node.treeId] || "#ffffff";

      // Conteúdo
      let content = "";
      if (node.state === "locked") {
        content = '<span class="node-lock-icon">🔒</span>';
      } else if (node.state === "maxed") {
        content =
          '<span class="node-crown">👑</span><span class="node-rune">' +
          node.rune +
          "</span>";
      } else {
        content = '<span class="node-rune">' + node.rune + "</span>";
      }

      nodeEl.innerHTML = content;

      nodeEl.addEventListener("click", () => this.selectNode(node));
      // Menu de contexto (botão direito) para ações rápidas sobre o nó
      nodeEl.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
        this.showContextMenu(ev.clientX, ev.clientY, node);
      });

      // Se esta constelação estiver destacada, aplicar estilo de destaque
      if (this.highlightedTreeId && this.highlightedTreeId === node.treeId) {
        // efeito leve de brilho
        nodeEl.style.transition = 'box-shadow 0.3s, transform 0.3s, opacity 0.3s';
        nodeEl.style.boxShadow = `0 0 20px 6px ${this.trees[node.treeId]?.color || '#ffffff'}88`;
        nodeEl.style.border = `1px solid ${this.trees[node.treeId]?.color || '#ffffff'}AA`;
        nodeEl.style.transform = 'translate(-50%, -50%) scale(1.08)';
      }

      this.nodesContainer.appendChild(nodeEl);
    });

    console.log("✨ Nós orgânicos renderizados com cores por constelação");
  }

  renderConnections() {
    const svgNS = "http://www.w3.org/2000/svg";
    this.linksCanvas.innerHTML = "";

    // Configurar SVG com viewBox para escala responsiva
    this.linksCanvas.setAttribute("preserveAspectRatio", "xMidYMid meet");
    this.linksCanvas.setAttribute("viewBox", "-2500 -2500 5000 5000");

    // Criar grupo para as linhas
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "astral-links-group");

    // Log para debug
    console.log(`Renderizando ${this.connections.length} conexões`);

    this.connections.forEach((conn, idx) => {
      let startNode, endNode;

      if (conn.from === "core") {
        startNode = { x: 0, y: 0 };
        endNode = this.nodes.find((n) => n.id === conn.to);
      } else {
        startNode = this.nodes.find((n) => n.id === conn.from);
        endNode = this.nodes.find((n) => n.id === conn.to);
      }

      if (!startNode || !endNode) {
        console.warn(`Conexão ${idx} inválida:`, conn);
        return;
      }

      // Mostrar somente conexões hierárquicas (pai -> filho) ou do 'core' para L1.
      // Ignorar conexões laterais/teia que possam ligar nós que não são pai/filho.
      const hierarchicalTypes = [
        "primary",
        "secondary",
        "tertiary",
        "quaternary",
        "supreme",
      ];

      if (conn.from !== "core") {
        // Se o tipo não for hierárquico, pular (ex.: 'lateral')
        if (!hierarchicalTypes.includes(conn.type)) return;

        // Garantir que a conexão representa a relação pai->filho
        const childNode = this.nodes.find((n) => n.id === conn.to);
        if (!childNode) return;
        if (childNode.parentId !== conn.from) return;
      }

      // Criar linha com curvatura suave
      const line = document.createElementNS(svgNS, "path");

      // Calcular ponto de controle para curvatura suave (Bézier)
      const midX = (startNode.x + endNode.x) / 2;
      const midY = (startNode.y + endNode.y) / 2;

      // Adicionar offset perpendicular para mais curvatura orgânica
      const dx = endNode.x - startNode.x;
      const dy = endNode.y - startNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Ponto de controle com curva suave
      const offsetX = (-dy / distance) * (distance * 0.15);
      const offsetY = (dx / distance) * (distance * 0.15);

      const pathData = `M ${startNode.x} ${startNode.y} Q ${midX + offsetX} ${midY + offsetY} ${endNode.x} ${endNode.y}`;

      line.setAttribute("d", pathData);
      line.setAttribute("data-from", conn.from);
      line.setAttribute("data-to", conn.to);

      // ✨ NOVA LÓGICA: Determinar padrão baseado no estado ATUAL dos nós
      // Se AMBOS os nós estão desbloqueados/maxed = linha SÓLIDA
      // Se algum está bloqueado = linha TRACEJADA
      const startUnlocked =
        conn.from === "core" ||
        startNode.state === "unlocked" ||
        startNode.state === "maxed";
      const endUnlocked =
        endNode.state === "unlocked" || endNode.state === "maxed";
      const isUnlockedPath = startUnlocked && endUnlocked;

      // Calcular estado atual da conexão com base nos nós (não confiar em conn.state armazenado)
      const dynamicState = isUnlockedPath ? "unlocked" : "locked";

      // Aplicar classes dinâmicas
      const classes = ["astral-link", `link-${dynamicState}`];
      if (conn.type) {
        classes.push(`link-${conn.type}`);
      }

      // Somente conexões explicitamente marcadas como 'isDashed' usarão traço,
      // e somente se `showPossiblePaths` estiver ativado.
      if (conn.isDashed && this.showPossiblePaths) {
        classes.push("link-dashed");
      }

      line.setAttribute("class", classes.join(" "));

      // Mapear cores por constelação
      const constellationColors = {
        arty: "#ff4444", // Vermelho vibrante
        aune: "#ffdd44", // Dourado astral
        ephelias: "#4477dd", // Azul arcano
        nishi: "#9966ff", // Roxo/Índigo
        hestia: "#66dd66", // Verde vital
      };

      // Mapear larguras de stroke por tipo
      const strokeWidths = {
        primary: 6,
        secondary: 4,
        tertiary: 3,
        quaternary: 2.5,
        supreme: 5,
        lateral: 2,
      };

      // Mapear opacidades: desbloqueadas = mais opacas, bloqueadas = transparentes
      const typeOpacities = isUnlockedPath
        ? {
            primary: "1",
            secondary: "0.98",
            tertiary: "0.95",
            quaternary: "0.92",
            supreme: "1",
            lateral: "0.85",
          }
        : {
            primary: "0.5",
            secondary: "0.48",
            tertiary: "0.45",
            quaternary: "0.42",
            supreme: "0.5",
            lateral: "0.3",
          };

      // Definir atributos de stroke inline
      const connConstellation = startNode?.treeId || endNode?.treeId;
      const baseColor = constellationColors[connConstellation] || "#ffffff";

      line.setAttribute("stroke", baseColor);
      line.setAttribute("stroke-width", strokeWidths[conn.type] || 2);
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("stroke-linejoin", "round");
      line.setAttribute("fill", "none");
      line.setAttribute("opacity", typeOpacities[conn.type] || "0.6");

      // PADRÕES VISUAIS
      // Linhas DESBLOQUEADAS: sólidas e brilhantes
      // Linhas BLOQUEADAS: tracejadas e opacas
      // Apenas conexões explicitamente marcadas como dashed usarão traço.
      // Aplicar apenas se a flag `showPossiblePaths` estiver ativada.
      if (conn.isDashed && this.showPossiblePaths) {
        line.setAttribute("stroke-dasharray", "8,4");
      }

      g.appendChild(line);
    });

    this.linksCanvas.appendChild(g);
    console.log(
      `✨ ${this.connections.length} veias energéticas renderizadas com padrões distintos`,
    );
  }

  /**
   * Alterna destaque visual de uma constelação (treeId)
   * - clicar no mesmo card desativa
   * - clicar em outro card ativa o novo e desativa o anterior
   */
  toggleHighlight(treeId) {
    if (this.highlightedTreeId === treeId) {
      this.clearHighlight();
    } else {
      this.highlightTree(treeId);
    }
    // Re-render sidebar para atualizar estado visual dos cards
    this.renderSidebar();
  }

  highlightTree(treeId) {
    // Limpar destaque anterior
    if (this.highlightedTreeId && this.highlightedTreeId !== treeId) {
      this.clearHighlight();
    }

    this.highlightedTreeId = treeId;

    const color = this.trees[treeId]?.color || '#ffffff';

    // Aplicar estilo de destaque aos elementos DOM dos nós pertencentes à constelação
    const nodeEls = Array.from(document.querySelectorAll(`.branch-${treeId}`));
    nodeEls.forEach((el) => {
      el.style.transition = 'box-shadow 0.3s, transform 0.3s, opacity 0.3s';
      el.style.boxShadow = `0 0 22px 8px ${color}CC`;
      el.style.border = `1px solid ${color}CC`;
      el.style.transform = 'translate(-50%, -50%) scale(1.08)';
      el.style.opacity = '1';
      // destacar também visualmente acima
      el.style.zIndex = '60';
    });

    // Diminuir opacidade dos nós das outras constelações para dar foco
    const otherEls = Array.from(document.querySelectorAll('.astral-node')).filter((el) => !el.classList.contains(`branch-${treeId}`));
    otherEls.forEach((el) => {
      el.style.transition = 'opacity 0.25s';
      el.style.opacity = '0.45';
    });
  }

  clearHighlight() {
    const prev = this.highlightedTreeId;
    this.highlightedTreeId = null;

    // Reverter estilos nos nós
    document.querySelectorAll('.astral-node').forEach((el) => {
      el.style.transition = '';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.opacity = '';
      el.style.boxShadow = '';
      el.style.border = '';
      el.style.zIndex = '';
    });
  }

  /**
   * INTERAÇÃO COM NÓS
   */
  selectNode(node) {
    this.selectedNode = node;
    this.renderNodeDetails();

    // Mostrar painel de detalhes
    const panel = document.getElementById("node-detail-panel");
    if (panel) {
      panel.classList.remove("hidden");
    }
  }

  /**
   * VALIDAÇÃO DE DESBLOQUEIO
   * Verifica se há PC suficiente para desbloquear todo o caminho até o nó
   */
  canUnlockNode(node) {
    if (node.state !== "locked") return false;

    const caminho = this.findPathToNode(node);
    const pcNecessario = this.calcularPCNecessarioParaCaminho(caminho);
    return this.powerCombat >= pcNecessario;
  }

  /**
   * OBTER MOTIVO DO BLOQUEIO
   * Retorna mensagem explicando por que o nó não pode ser desbloqueado
   */
  getUnlockBlockReason(node) {
    if (node.state !== "locked") return null;

    const caminho = this.findPathToNode(node);
    const pcNecessario = this.calcularPCNecessarioParaCaminho(caminho);

    if (this.powerCombat < pcNecessario) {
      const bloqueados = caminho.filter((n) => n.state === "locked");
      const nomes = bloqueados.map((n) => n.name).join(" → ");
      return `❌ PC insuficiente (${this.powerCombat}/${pcNecessario}) para desbloquear: ${nomes}`;
    }

    return null; // Sem bloqueios
  }

  renderNodeDetails() {
    if (!this.selectedNode) return;

    const node = this.selectedNode;
    const panel = document.getElementById("node-detail-panel");
    if (!panel) return;

    // Aplicar classe de constelação ao painel para mudar cores
    panel.className = "node-detail-panel";
    panel.classList.add(`node-detail-panel--${node.treeId}`);

    // Atualizar título
    const titleEl = document.getElementById("node-detail-name");
    if (titleEl) titleEl.textContent = node.name;

    // Descrição
    const descEl = document.getElementById("node-detail-description");
    if (descEl) descEl.textContent = node.description;

    // Aprimoramento (bonus effect)
    const enhancementEl = document.getElementById("node-detail-enhancement");
    if (enhancementEl) {
      console.log("nó:", node);
      if (node.bonus && node.bonus.effect) {
        enhancementEl.textContent = node.bonus.effect;
      } else {
        enhancementEl.textContent = "—";
      }
    }

    // Custo
    const costEl = document.getElementById("node-detail-cost");
    if (costEl) costEl.textContent = `${node.cost} PC`;

    // Nível
    const levelEl = document.getElementById("node-detail-level");
    if (levelEl) levelEl.textContent = node.level;

    // Estado
    const stateEl = document.getElementById("node-detail-state");
    if (stateEl) {
      const stateMap = {
        locked: "🔒 Bloqueado",
        unlocked: "🔓 Desbloqueado",
        active: "⭐ Ativo",
        maxed: "👑 Máximo",
      };
      stateEl.textContent = stateMap[node.state] || node.state;
    }

    // ✨ NOVO: Mostrar motivo do bloqueio se aplicável
    const blockReasonSection = document.getElementById(
      "node-block-reason-section",
    );
    const blockReasonEl = document.getElementById("node-block-reason");
    if (blockReasonSection && blockReasonEl) {
      const reason = this.getUnlockBlockReason(node);
      if (reason && node.state === "locked") {
        blockReasonEl.textContent = reason.replace("❌ ", "");
        blockReasonSection.style.display = "block";
      } else {
        blockReasonSection.style.display = "none";
      }
    }

    // Botão de desbloqueio
    const unlockBtn = document.getElementById("unlock-node-btn");
    if (unlockBtn) {
      const canUnlock = node.state === "locked" && this.canUnlockNode(node);

      if (canUnlock) {
        unlockBtn.disabled = false;
        unlockBtn.textContent = `🔓 Desbloquear`;
        unlockBtn.style.opacity = "1";
        unlockBtn.onclick = () => this.unlockNode(node);
      } else {
        unlockBtn.disabled = true;
        unlockBtn.style.opacity = "0.5";

        if (node.state !== "locked") {
          unlockBtn.textContent = "Desbloqueado";
        } else {
          unlockBtn.textContent = "Indisponível";
        }
      }
    }

    // ✨ NOVO: Botão de bloquear (para nós desbloqueados)
    // ✨ NOVO: Botão de bloquear (para nós desbloqueados)
    const lockBtn = document.getElementById("lock-node-btn");
    if (lockBtn) {
      if (node.state === "unlocked" || node.state === "maxed") {
        lockBtn.style.display = "block";
        lockBtn.disabled = false;
        lockBtn.textContent = `🔒 Bloquear`;
        lockBtn.onclick = () => this.lockNode(node);
      } else {
        lockBtn.style.display = "none";
      }
    }
  }

  /**
   * ENCONTRAR CAMINHO LINEAR ATÉ UM NÓ
   * Retorna array com o caminho completo do cristal central até o nó alvo
   * Inclui apenas o nó, seu pai, avó, etc. até raiz
   */
  findPathToNode(node, visited = new Set()) {
    if (visited.has(node.id)) return [];
    visited.add(node.id);

    const path = [node];

    // Se tem parentId e não é 'core', encontrar o pai
    if (node.parentId != null && node.parentId !== "core") {
      const parentNode = this.nodes.find((n) => n.id === node.parentId);
      if (parentNode) {
        path.unshift(...this.findPathToNode(parentNode, visited));
      }
    }

    return path;
  }

  /**
   * CALCULAR PC NECESSÁRIO PARA DESBLOQUEAR UM CAMINHO
   * Soma o custo de todos os nós no caminho até o nó alvo
   */
  calcularPCNecessarioParaCaminho(caminho) {
    return caminho.reduce((total, no) => {
      return total + (no.state === "locked" ? no.cost : 0);
    }, 0);
  }

  unlockNode(node) {
    if (node.state !== "locked") {
      console.warn("⚠️ Nó já foi desbloqueado");
      return;
    }

    // Encontrar caminho completo (pais bloqueados + nó alvo)
    const caminho = this.findPathToNode(node);
    const pcNecessario = this.calcularPCNecessarioParaCaminho(caminho);

    if (this.powerCombat < pcNecessario) {
      const faltam = pcNecessario - this.powerCombat;
      console.warn(`❌ PC insuficiente: faltam ${faltam} PC`);
      this.showNotification(
        `❌ PC insuficiente! Faltam ${faltam} PC`,
        "error",
        3000,
      );
      return;
    }

    // Desbloquear todos os nós bloqueados no caminho (pais + nó alvo)
    const nosDesbloqueados = [];
    let pcGasto = 0;
    caminho.forEach((no) => {
      if (no.state === "locked") {
        this.powerCombat -= no.cost;
        pcGasto += no.cost;
        no.state = "unlocked";
        nosDesbloqueados.push(no.name);

        if (no.bonus) this.activateBonus(no.bonus);

        const tree = this.trees[no.treeId];
        if (tree) {
          tree.unlockedNodes = this.nodes.filter(
            (n) => n.treeId === tree.id && n.state !== "locked",
          ).length;
        }
      }
    });

    // Efeito visual do nó alvo
    const nodeEl = document.getElementById(`node-${node.id}`);
    if (nodeEl) {
      nodeEl.style.animation = "node-unlock-glow 0.6s ease-out";
    }

    // Ativar linhas conectadas ao nó desbloqueado
    if (this.lineActivation) {
      this.lineActivation.activateNodePath(node.id);
    }

    // 💾 Salvar estado dos nós
    this.saveState();

    if (nosDesbloqueados.length > 1) {
      console.log(
        `🔓 Caminho desbloqueado: ${nosDesbloqueados.join(" → ")}. PC gasto: ${pcGasto}`,
      );
      this.showNotification(
        `🔓 ${nosDesbloqueados.join(" → ")} desbloqueados! -${pcGasto} PC`,
        "success",
        4000,
      );
    } else {
      console.log(`🔓 Nó "${node.name}" desbloqueado. PC gasto: ${pcGasto}`);
      this.showNotification(
        `✅ ${node.name} desbloqueado. -${pcGasto} PC`,
        "success",
        3000,
      );
    }

    this.updateUI();
    this.renderNodes();
    this.renderConnections();
    this.renderNodeDetails();
    this.renderSidebar();
  }

  /**
   * ENCONTRAR TODOS OS NÓS DESCENDENTES
   * Retorna um array com todos os nós que dependem do nó fornecido (via parentId)
   */
  findDescendantNodes(node, visited = new Set()) {
    if (visited.has(node.id)) return [];
    visited.add(node.id);

    const descendants = [];

    // Encontrar filhos diretos via parentId (ignora conexões laterais)
    const directChildren = this.nodes.filter(
      (n) => n.parentId === node.id && n.state !== "locked",
    );

    directChildren.forEach((child) => {
      descendants.push(child);
      descendants.push(...this.findDescendantNodes(child, visited));
    });

    return descendants;
  }

  /**
   * BLOQUEAR NÓ - Volta o nó ao estado locked
   * Se houver nós posteriores desbloqueados, bloqueia toda a sequência
   */
  lockNode(node) {
    if (node.state === "locked") {
      console.warn("⚠️ Nó já está bloqueado");
      return;
    }

    // 🔥 NOVO: Encontrar todos os descendentes desbloqueados
    const descendentes = this.findDescendantNodes(node);

    // Array para rastrear todos os nós que serão bloqueados (incluindo o nó principal)
    const nodosABloquear = [node, ...descendentes];

    let pcRecuperado = 0;
    const nomesNosDesbloqueados = [];

    // Bloquear o nó principal e todos seus descendentes
    nodosABloquear.forEach((no) => {
      if (no.state !== "locked") {
        // Recuperar PC
        this.powerCombat = Math.min(
          this.maxPowerCombat,
          this.powerCombat + no.cost,
        );
        pcRecuperado += no.cost;

        // Desativar bônus do nó
        if (no.bonus) {
          this.deactivateBonus(no.bonus.id);
        }

        no.state = "locked";
        nomesNosDesbloqueados.push(no.name);
      }
    });

    // 💾 Salvar estado
    this.saveState();

    // Log e notificação
    if (descendentes.length > 0) {
      console.log(
        `🔒 Nó "${node.name}" bloqueado. ${descendentes.length} nó(s) posterior(es) também bloqueado(s).`,
      );
      console.log(`   Nós bloqueados: ${nomesNosDesbloqueados.join(", ")}`);
      console.log(`   Total de PC recuperado: ${pcRecuperado}`);
      this.showNotification(
        `🔒 ${nomesNosDesbloqueados.length} nó(s) bloqueado(s). +${pcRecuperado} PC`,
        "warning",
        4000,
      );
    } else {
      console.log(
        `🔒 Nó "${node.name}" bloqueado. PC recuperado: ${pcRecuperado}`,
      );
      this.showNotification(
        `✅ ${node.name} bloqueado. +${pcRecuperado} PC`,
        "success",
        3000,
      );
    }

    this.updateUI();
    this.renderNodes();
    this.renderConnections();
    this.renderNodeDetails();

    // Atualizar contagem de árvore
    const tree = this.trees[node.treeId];
    if (tree) {
      tree.unlockedNodes = this.nodes.filter(
        (n) => n.treeId === tree.id && n.state !== "locked",
      ).length;
    }

    this.renderSidebar();
  }

  /**
   * ATIVAR BÔNUS
   */
  activateBonus(bonus) {
    if (!bonus || !bonus.id) return;

    // Evitar duplicatas
    const jaAtivo = this.activeBonuses.find((b) => b.id === bonus.id);
    if (jaAtivo) return;

    this.activeBonuses.push(bonus);
    console.log(`✅ Bônus ativado: ${bonus.name} — ${bonus.effect}`);
  }

  /**
   * DESATIVAR BÔNUS
   */
  deactivateBonus(bonusId) {
    const index = this.activeBonuses.findIndex((b) => b.id === bonusId);
    if (index !== -1) {
      const bonus = this.activeBonuses[index];
      console.log(`❌ Bônus desativado: ${bonus.name}`);
      this.activeBonuses.splice(index, 1);
    }
  }

  /**
   * ATUALIZAR UI
   */
  updateUI() {
    // Power Combat
    const powerCombatCounter = document.getElementById("power-combat-counter");
    const powerCombatFill = document.getElementById("power-combat-fill");
    const powerCombatMax = document.getElementById("power-combat-max");

    if (powerCombatCounter) powerCombatCounter.textContent = this.powerCombat;
    if (powerCombatMax) powerCombatMax.textContent = `/ ${this.maxPowerCombat}`;
    if (powerCombatFill)
      powerCombatFill.style.width = `${Math.min(
        Math.max(
          this.maxPowerCombat > 0
            ? (this.powerCombat / this.maxPowerCombat) * 100
            : 0,
          0,
        ),
        100,
      )}%`;

    // Ressonância
    const resonanceCounter = document.getElementById("resonance-counter");
    const resonanceFill = document.getElementById("resonance-fill");

    if (resonanceCounter) resonanceCounter.textContent = this.resonance;
    if (resonanceFill)
      resonanceFill.style.width = `${(this.resonance / this.maxResonance) * 100}%`;
  }

  /**
   * SETUP EVENT LISTENERS
   */
  setupEventListeners() {
    // Nenhum listener global necessário
    // Todos os listeners são adicionados durante renderUI
  }

  /**
   * CONTEXT MENU: Cria e gerencia menu de contexto para ações sobre nós
   */
  createContextMenu() {
    // Evitar criar múltiplas vezes
    if (this._contextMenu) return;

    const menu = document.createElement('div');
    menu.id = 'astral-node-context-menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = 9999;
    menu.style.minWidth = '160px';
    menu.style.background = 'linear-gradient(180deg, rgba(18,24,36,0.98), rgba(10,14,22,0.98))';
    menu.style.border = '1px solid rgba(255,255,255,0.06)';
    menu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
    menu.style.padding = '6px';
    menu.style.borderRadius = '8px';
    menu.style.display = 'none';
    menu.style.fontSize = '13px';
    menu.style.color = '#dfe7f5';

    document.body.appendChild(menu);
    this._contextMenu = menu;

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) {
        menu.style.display = 'none';
      }
    });
    // Fechar ao redimensionar/scroll
    window.addEventListener('scroll', () => menu.style.display = 'none');
    window.addEventListener('resize', () => menu.style.display = 'none');
  }

  showContextMenu(x, y, node) {
    this.createContextMenu();
    const menu = this._contextMenu;
    menu.innerHTML = '';

    const addItem = (label, onClick, danger = false) => {
      const it = document.createElement('div');
      it.textContent = label;
      it.style.padding = '8px 10px';
      it.style.cursor = 'pointer';
      it.style.borderRadius = '6px';
      it.style.margin = '2px 0';
      if (danger) it.style.color = '#ff8b8b';
      it.addEventListener('click', (ev) => {
        ev.stopPropagation();
        menu.style.display = 'none';
        onClick();
      });
      it.addEventListener('mouseenter', () => it.style.background = 'rgba(255,255,255,0.03)');
      it.addEventListener('mouseleave', () => it.style.background = 'transparent');
      menu.appendChild(it);
    };

    addItem('🔒 Bloquear nó', () => this.lockNode(node));
    addItem('🔓 Desbloquear nó', () => this.unlockNode(node));
    addItem('♻️ Resetar constelação', () => {
      if (confirm(`Resetar todos os nós da constelação ${node.treeId}?`)) {
        this.resetConstellation(node.treeId);
      }
    });
    addItem('♻️ Resetar tudo', () => {
      if (confirm('Resetar todos os nós de todas as constelações?')) {
        this.resetAllNodes();
      }
    }, true);

    // Posicionar garantindo que não saia da tela
    const pad = 8;
    const maxX = window.innerWidth - menu.offsetWidth - pad;
    const maxY = window.innerHeight - menu.offsetHeight - pad;
    menu.style.left = Math.min(x, maxX) + 'px';
    menu.style.top = Math.min(y, maxY) + 'px';
    menu.style.display = 'block';
  }

  /**
   * Bloquear apenas os descendentes (mantendo o nó selecionado intacto)
   */
  lockDescendants(node) {
    const descendants = this.findDescendantNodes(node);
    descendants.forEach((d) => {
      if (d.state !== 'locked') {
        if (d.bonus) this.deactivateBonus(d.bonus.id);
        d.state = 'locked';
      }
    });
    this.saveState();
    this.renderNodes();
    this.renderConnections();
    this.showNotification(`🔒 ${descendants.length} nó(s) bloqueado(s)`,'warning',3000);
  }

  /**
   * Reset (bloquear) todos os nós de uma constelação
   */
  resetConstellation(treeId) {
    const targets = this.nodes.filter((n) => n.treeId === treeId);
    let changed = 0;
    let pcRecuperado = 0;
    targets.forEach((n) => {
      if (n.state !== 'locked') {
        const antes = this.powerCombat;
        this.powerCombat = Math.min(
          this.maxPowerCombat,
          this.powerCombat + n.cost,
        );
        pcRecuperado += this.powerCombat - antes;
        if (n.bonus) this.deactivateBonus(n.bonus.id);
        n.state = 'locked';
        changed++;
      }
    });
    // Atualizar contagem
    if (this.trees[treeId]) {
      this.trees[treeId].unlockedNodes = this.nodes.filter((n) => n.treeId === treeId && n.state !== 'locked').length;
    }
    this.saveState();
    this.renderNodes();
    this.renderConnections();
    this.renderSidebar();
    this.updateUI();
    this.showNotification(`♻️ ${changed} nó(s) resetado(s) em ${treeId}. +${pcRecuperado} PC`,`info`,3000);
  }

  /**
   * Reset (bloquear) todos os nós do sistema
   */
  resetAllNodes() {
    let changed = 0;
    let pcRecuperado = 0;
    this.nodes.forEach((n) => {
      if (n.state !== 'locked') {
        const antes = this.powerCombat;
        this.powerCombat = Math.min(
          this.maxPowerCombat,
          this.powerCombat + n.cost,
        );
        pcRecuperado += this.powerCombat - antes;
        if (n.bonus) this.deactivateBonus(n.bonus.id);
        n.state = 'locked';
        changed++;
      }
    });
    // Atualizar contagens por árvore
    Object.values(this.trees).forEach((t) => {
      t.unlockedNodes = this.nodes.filter((n) => n.treeId === t.id && n.state !== 'locked').length;
    });
    this.saveState();
    this.renderNodes();
    this.renderConnections();
    this.renderSidebar();
    this.updateUI();
    this.showNotification(`♻️ Reset completo: ${changed} nó(s) bloqueado(s)`,'warning',4000);
  }

  /**
   * Apagar nó (remover do sistema) — remove também conexões relacionadas
   */
  deleteNode(node) {
    // Remover o nó do array
    this.nodes = this.nodes.filter((n) => n.id !== node.id);
    // Remover conexões relacionadas
    this.connections = this.connections.filter((c) => c.from !== node.id && c.to !== node.id);
    // Atualizar contagens
    if (this.trees[node.treeId]) {
      this.trees[node.treeId].totalNodes = this.nodes.filter((n) => n.treeId === node.treeId).length;
      this.trees[node.treeId].unlockedNodes = this.nodes.filter((n) => n.treeId === node.treeId && n.state !== 'locked').length;
    }
    // Desativar bônus se ativo
    if (node.bonus) this.deactivateBonus(node.bonus.id);
    // Salvar e re-render
    this.saveState();
    this.renderNodes();
    this.renderConnections();
    this.renderSidebar();
    this.showNotification(`🗑 Nó "${node.name}" apagado`,'info',3000);
  }

  /**
   * UTILITÁRIOS
   */
  generateNodeName(treeId, index) {
    const names = {
      arty: [
        "Instinto Primitivo",
        "Primeira Destruição",
        "Aura Caótica",
        "Cólera Divina",
        "Fúria Cósmica",
        "Ruptura da Realidade",
        "Poder do Caos",
        "Arty Supremo",
      ],
      aune: [
        "Presságio Suave",
        "Linha do Destino",
        "Tecelã Celestial",
        "Sincronicidade",
        "Trilho Inevitável",
        "Fortuna Cósmica",
        "Vontade do Universo",
        "Aune Absoluta",
      ],
      ephelias: [
        "Revelação Primeira",
        "Símbolo Arcano",
        "Grimório Antigo",
        "Conhecimento Proibido",
        "Verdade Oculta",
        "Sabedoria Infinita",
        "Consciência Cósmica",
        "Ephelias Suprema",
      ],
      nishi: [
        "Respiração Cósmica",
        "Fluxo Perfeito",
        "Movimento Celeste",
        "Sincronismo",
        "Ritmo do Universo",
        "Harmonia Plena",
        "Dança das Esferas",
        "Nishi Absoluta",
      ],
      hestia: [
        "Semente da Vida",
        "Bênção Vital",
        "Energia Criadora",
        "Florescimento",
        "Raiz Profunda",
        "Força Regenerativa",
        "Abraço do Universo",
        "Hestia Suprema",
      ],
    };
    return names[treeId]?.[index] || `Nó ${index + 1}`;
  }

  getRune(treeId, index) {
    const runes = {
      arty: ["⚡", "⚙", "⚔", "✕", "▲", "█", "◈", "⚡"],
      aune: ["★", "✦", "✧", "✪", "✫", "✬", "✭", "★"],
      ephelias: ["◆", "⬠", "⬡", "✻", "✴", "◊", "◇", "◆"],
      nishi: ["◇", "○", "◉", "◎", "⊙", "◐", "◑", "◒"],
      hestia: ["❖", "♦", "♣", "♥", "♠", "✿", "❀", "❖"],
    };
    return runes[treeId]?.[index] || "◆";
  }

  generateNodeEffect(treeId, index) {
    const effects = {
      arty: "+5% Dano Bruto | +3% Penetração",
      aune: "+5% Taxa de Sorte | +3% Bônus Crítico",
      ephelias: "+5% Inteligência Arcana | +2% Controle Mágico",
      nishi: "+5% Velocidade | +3% Precisão",
      hestia: "+5% Vida Máxima | +3% Regeneração",
    };
    return effects[treeId] || "Bênção da Divindade";
  }

  generateNodeDescription(treeId, index) {
    const descriptions = {
      arty: "Arty sussurra poder destrutivo através de suas Veias Astrais.",
      aune: "Aune tece os fios de seu destino e fortuna.",
      ephelias: "Ephelias abre sua mente para conhecimento infinito.",
      nishi: "Nishi flui através de você em perfeita harmonia.",
      hestia: "Hestia nutre sua existência com energia vital.",
    };
    return (
      descriptions[treeId] ||
      "Uma bênção divina flui através das Veias Astrais."
    );
  }

  focusTree(treeId) {
    // Calcular o centro da constelação (média de todas as posições dos nós)
    const treeNodes = this.nodes.filter((n) => n.treeId === treeId);
    if (treeNodes.length > 0) {
      // Calcular o centróide da constelação
      let avgX = 0;
      let avgY = 0;

      treeNodes.forEach((node) => {
        avgX += node.x;
        avgY += node.y;
      });

      avgX /= treeNodes.length;
      avgY /= treeNodes.length;

      // Focar nesse ponto com zoom para ver toda a constelação
      this.navigation.focusOn(avgX, avgY, 1.2);
    }
  }

  /**
   * 🚀 OTIMIZAÇÕES DE PERFORMANCE
   * Detectar e aplicar modo de baixo desempenho
   */
  detectPerformanceMode() {
    // Verificar critérios de low-end device
    const hwConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || 8;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion)').matches;
    
    if (this.performancePreference !== null) {
      this.performanceMode = Boolean(this.performancePreference);
    } else {
      // Ativar performance mode se:
      // - CPU < 4 cores, OU
      // - RAM < 4GB, OU
      // - Usuário preferir redução de movimento
      this.performanceMode = hwConcurrency <= 4 || deviceMemory <= 4 || prefersReducedMotion;
    }
    
    if (this.performanceMode) {
      console.log('⚡ Modo Performance Ativado (Low-End Device)');
      console.log(`   CPU: ${hwConcurrency} cores | RAM: ${deviceMemory}GB | Reduzir movimento: ${prefersReducedMotion}`);
      this.enablePerformanceMode();
    }
  }

  enablePerformanceMode() {
    // Adicionar classe CSS ao viewport
    if (this.viewport) {
      this.viewport.classList.add('performance-mode');
    }
    
    // Desativar efeitos visuais pesados
    document.documentElement.style.setProperty('--particle-count', '0');
  }

  disablePerformanceMode() {
    if (this.viewport) {
      this.viewport.classList.remove('performance-mode');
    }
    document.documentElement.style.setProperty('--particle-count', '2');
    this.showNotification('Modo de desempenho normal ativado', 'info');
  }

  setPerformanceMode(enabled) {
    this.performanceMode = Boolean(enabled);
    if (this.performanceMode) {
      this.enablePerformanceMode();
      this.showNotification('Otimização das Veias Astrais ativada', 'success');
    } else {
      this.disablePerformanceMode();
    }
    this.createCoreParticles();
    try {
      window.localStorage.setItem('astral-performance-mode', JSON.stringify(this.performanceMode));
    } catch (error) {
      console.warn('⚠️ Não foi possível salvar a preferência de desempenho:', error);
    }
  }

  loadPerformancePreference() {
    try {
      const stored = window.localStorage.getItem('astral-performance-mode');
      if (stored !== null) {
        this.performancePreference = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar preferência de desempenho:', error);
    }
  }

  /**
   * PARTÍCULAS DO NÚCLEO
   */
  createCoreParticles() {
    const container = document.getElementById("core-particles");
    if (!container) return;

    container.innerHTML = "";

    // OTIMIZADO: Reduzir de 6 para 2 partículas
    const particleCount = this.performanceMode ? 0 : 2;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.animationDelay = `${i * 3}s`;  // Aumentar delay (menos sincronização)
      particle.style.left = "0";
      particle.style.top = "0";

      container.appendChild(particle);
    }
  }

  /**
   * PERSISTÊNCIA - SALVAR ESTADO
   */
  saveState() {
    try {
      if (window.localStorageManager) {
        const payload = {
          nodes: this.nodes,
          powerCombat: this.powerCombat,
          maxPowerCombat: this.maxPowerCombat,
          resonance: this.resonance,
          maxResonance: this.maxResonance,
        };

        if (this.lineActivation && typeof this.lineActivation.getActivatedLinesToSave === 'function') {
          payload.activatedLines = this.lineActivation.getActivatedLinesToSave();
        }

        window.localStorageManager.saveVeiasAstrais(payload);
        window.debugLog && window.debugLog("💾 Estado das Veias Astrais salvo");
      }
    } catch (error) {
      console.warn("⚠️ Erro ao salvar estado:", error);
    }
  }

  /**
   * PERSISTÊNCIA - CARREGAR ESTADO SALVO
   */
  loadSavedStates() {
    try {
      if (!window.localStorageManager) {
        console.warn("⚠️ LocalStorageManager não disponível");
        return;
      }

      const savedData = window.localStorageManager.loadVeiasAstrais();
      if (!savedData) {
        console.log("ℹ️ Nenhum estado salvo para Veias Astrais");
        return;
      }

      // Aplicar estados salvos aos nós
      const nodesData = Array.isArray(savedData)
        ? savedData
        : savedData.nodes || [];

      if (savedData && typeof savedData.powerCombat === 'number') {
        this.powerCombat = savedData.powerCombat;
      }
      if (savedData && typeof savedData.maxPowerCombat === 'number') {
        this.maxPowerCombat = savedData.maxPowerCombat;
      }
      if (savedData && typeof savedData.resonance === 'number') {
        this.resonance = savedData.resonance;
      }
      if (savedData && typeof savedData.maxResonance === 'number') {
        this.maxResonance = savedData.maxResonance;
      }

      if (!Array.isArray(savedData)) {
        this.loadedSavedAstralState = true;
      }

      nodesData.forEach((savedNode) => {
        const node = this.nodes.find((n) => n.id === savedNode.id);
        if (node) {
          node.state = savedNode.state;
          node.level = savedNode.level;
          console.log(`📥 Nó ${node.name} restaurado: ${node.state}`);
        }
      });

      // Atualizar contagem de nós desbloqueados por constelação
      Object.values(this.trees).forEach((tree) => {
        tree.unlockedNodes = this.nodes.filter(
          (n) => n.treeId === tree.id && n.state !== 'locked'
        ).length;
      });

      this.updateUI();

      console.log("✅ Estados restaurados com sucesso");
    } catch (error) {
      console.error("❌ Erro ao carregar estados:", error);
    }
  }

  /**
   * CONTROLE MODAL
   */
  open() {
    if (this.modal) {
      this.modal.classList.remove("hidden");
      if (!this.initialized) {
        this.init();
      }
      this.updateUI();
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.add("hidden");
    }

    // ⏹️ Parar o monitoramento de Power Combat
    this.stopPowerCombatListener();
  }
}

/**
 * CLASSE DE NÓ
 */
class AstralNode {
  constructor(config) {
    this.id = config.id;
    this.treeId = config.treeId;
    this.name = config.name;
    this.rune = config.rune;
    this.x = config.x;
    this.y = config.y;
    this.level = config.level;
    this.cost = config.cost;
    this.effect = config.effect;
    this.description = config.description;
    this.color = config.color;
    this.state = config.state || "locked";
    this.layer = config.layer || 1; // Camada hierárquica (1, 2, 3)
    this.parentId = config.parentId != null ? config.parentId : null; // ID do nó pai na hierarquia
    this.bonus = config.bonus || null; // Bônus/aprimoramento do nó
    this.size = config.size || "medium";
    this.rarity = config.rarity || 1;
  }
}

/**
 * GERENCIADOR DE PARTÍCULAS
 */
class ParticleManager {
  constructor() {
    this.particles = [];
  }

  createOrbitalParticles(container, count = 6) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        angle: (i / count) * Math.PI * 2,
        distance: 50,
        speed: 0.02 + Math.random() * 0.01,
      });
    }
    return particles;
  }
}

/**
 * INSTÂNCIA GLOBAL
 */
let veiasAstraisSystem = null;

function initVeiasAstrais() {
  if (!veiasAstraisSystem) {
    veiasAstraisSystem = new VeiasAstraisSystem();
  }
  return veiasAstraisSystem;
}

// Inicializar sistema se não existir
if (!veiasAstraisSystem) {
  veiasAstraisSystem = new VeiasAstraisSystem();
}

// Exportar para uso global
window.VeiasAstraisSystem = VeiasAstraisSystem;
window.AstralNode = AstralNode;
window.initVeiasAstrais = initVeiasAstrais;
window.veiasAstraisSystem = veiasAstraisSystem;
