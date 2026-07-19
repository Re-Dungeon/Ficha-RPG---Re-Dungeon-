/**
  * CAMADA DE REGRAS - VALIDA├ç├òES E C├üLCULOS
 * Sistema de valida├º├úo autom├ítica de habilidades
 * Re:Dungeon Character Sheet
 */

class RulesEngine {
  // ============ DOM├ìNIOS ============
  static DOMAINS = {
    1: { name: 'B├ísico', minCost: 5, maxRange: 5, description: 'N├¡vel iniciante' },
    2: { name: 'Intermedi├írio', minCost: 10, maxRange: 10, description: 'N├¡vel intermedi├írio' },
    3: { name: 'Avan├ºado', minCost: 15, maxRange: 15, description: 'N├¡vel avan├ºado' },
    4: { name: 'Superior', minCost: 20, maxRange: 20, description: 'N├¡vel superior' },
    5: { name: 'Supremo', minCost: 25, maxRange: 30, description: 'N├¡vel m├íximo' }
  };

  static ART_TYPES = {
    ofensiva: { name: 'Ofensiva', description: 'Causa dano direto', color: '#FF6B6B', icon: '⚔️' },
    defensiva: { name: 'Defensiva', description: 'Proteção, escudo, redução de dano', color: '#4ECDC4', icon: '🛡️' },
    estrategica: { name: 'Estratégica', description: 'Controle de campo, debuffs, manipulação tática', color: '#FFD93D', icon: '🧠' },
    suporte: { name: 'Suporte', description: 'Buffs, cura, fortalecimento aliado', color: '#95E1D3', icon: '✨' },
    controle: { name: 'Controle', description: 'Imobilizar, paralisar, puxar, empurrar, selar', color: '#A78BFA', icon: '🎮' },
    invocacao: { name: 'Invocação', description: 'Criar entidades, armas, espíritos', color: '#8B5CF6', icon: '👥' },
    transformacao: { name: 'Transformação', description: 'Mudar forma, estado ou modo de combate', color: '#EC4899', icon: '🔄' },
    passiva: { name: 'Passiva', description: 'Sempre ativa ou ativação automática', color: '#6B7280', icon: '⭐' },
    racial: { name: 'Racial', description: 'Habilidade única da raça do personagem', color: '#D4AF37', icon: '🏰' }
  };

  // ============ VALIDA├ç├âO DE DOM├ìNIO ============
  static validateDomain(domain) {
    if (!Number.isInteger(domain)) return false;
    return domain >= 1 && domain <= 5;
  }

  static getDomainInfo(domain) {
    return this.DOMAINS[domain] || null;
  }

  // ============ C├üLCULO DE LIMITE M├üXIMO DE ARTS ============
  /**
   * NOVA F├ôRMULA OFICIAL (v2):
   * LimiteArts = Math.round((FOR + VIT + AGI + PER + INT) * 0.0293)
   * 
   * Valida├º├úo com todos atributos = 150:
   * (150 * 5 = 750; 750 * 0.0293 = 21.975; Math.round ÔåÆ 22) Ô£ô
   */
  static calculateMaxArts(character) {
    // Inicializar com 0 (fallback seguro)
    let forca = 0;
    let vitalidade = 0;
    let agilidade = 0;
    let percepcao = 0;
    let inteligencia = 0;

    // Prioridade 1: Buscar de window.atributosManager (aba de Atributos em tempo real)
    if (window.atributosManager && window.atributosManager.personagemData?.atributos) {
      forca = Number(window.atributosManager.personagemData.atributos.forca) || 0;
      vitalidade = Number(window.atributosManager.personagemData.atributos.vitalidade) || 0;
      agilidade = Number(window.atributosManager.personagemData.atributos.agilidade) || 0;
      percepcao = Number(window.atributosManager.personagemData.atributos.percepcao) || 0;
      inteligencia = Number(window.atributosManager.personagemData.atributos.inteligencia) || 0;
    } 
    // Prioridade 2: Fallback para character.attributes se dispon├¡vel
    else if (character && character.attributes) {
      forca = Number(character.attributes.forca) || 0;
      vitalidade = Number(character.attributes.vitalidade) || 0;
      agilidade = Number(character.attributes.agilidade) || 0;
      percepcao = Number(character.attributes.percepcao) || 0;
      inteligencia = Number(character.attributes.inteligencia) || 0;
    }

    // Aplicar f├│rmula: (FOR + VIT + AGI + PER + INT) * 0.0293
    const total = forca + vitalidade + agilidade + percepcao + inteligencia;
    const limite = Math.round(total * 0.0293);

    // Garantir que nunca retorna negativo (m├¡nimo 0)
    return Math.max(0, limite);
  }

  static getArtsUsage(character) {
    const activeArts = character.getActiveArts();
    return activeArts.length;
  }

  static canCreateNewArt(character) {
    const maxArts = this.calculateMaxArts(character);
    const currentArts = this.getArtsUsage(character);
    return currentArts < maxArts;
  }

  // ============ VALIDA├ç├âO DE ARTS ============
  static validateArt(art, character) {
    const errors = [];

    // Validar nome
    if (!art.name || art.name.trim().length === 0) {
      errors.push('Nome da arte n├úo pode estar vazio');
    }

    // Validar n├║cleo
    if (!art.coreId) {
      errors.push('Art deve ter um N├║cleo associado');
    } else {
      const core = character.getCore(art.coreId);
      if (!core) {
        errors.push('N├║cleo associado n├úo existe');
      }
    }

    // Validar dom├¡nio
    if (!this.validateDomain(art.domain)) {
      errors.push('Dom├¡nio inv├ílido (deve ser 1-5)');
    }

    // Validar custo (apenas se for n├║mero)
    if (typeof art.cost === 'number' && art.cost < 0) {
      errors.push('Custo n├úo pode ser negativo');
    }

    // Ô£à REMOVIDO: Valida├º├úo de custo m├¡nimo por dom├¡nio (usu├írio pode criar com custo livre)
    // const domainInfo = this.getDomainInfo(art.domain);
    // if (art.cost < domainInfo.minCost) {
    //   errors.push(`Custo m├¡nimo para dom├¡nio ${art.domain} ├® ${domainInfo.minCost}`);
    // }

    // Validar tipo
    if (!this.ART_TYPES[art.type]) {
      errors.push('Tipo de arte inv├ílido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ============ VALIDA├ç├âO DE VARIA├ç├òES ============
  static validateVariation(variation, artBase) {
    const errors = [];

    // Validar nome
    if (!variation.name || variation.name.trim().length === 0) {
      errors.push('Nome da varia├º├úo n├úo pode estar vazio');
    }

    // Validar dom├¡nio
    if (!this.validateDomain(variation.domain)) {
      errors.push('Dom├¡nio inv├ílido (deve ser 1-5)');
    }

    // Validar que dom├¡nio da varia├º├úo < dom├¡nio da art base
    if (variation.domain >= artBase.domain) {
      errors.push(
        `Dom├¡nio da varia├º├úo (${variation.domain}) deve ser menor que a art base (${artBase.domain})`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ============ AUTO-BLOQUEIO DE ARTS ============
  /**
   * Analisa o character e bloqueia/desbloqueia arts automaticamente
   * baseado no limite m├íximo
   */
  static autoBlockArts(character) {
    const maxArts = this.calculateMaxArts(character);
    const activeArts = character.getActiveArts();

    // Se temos mais arts ativas do que o limite, bloqueia as mais recentes
    if (activeArts.length > maxArts) {
      const artsToBlock = activeArts
        .sort((a, b) => b.createdAt - a.createdAt) // Ordenar por cria├º├úo decrescente
        .slice(maxArts); // Pega as excedentes

      artsToBlock.forEach(art => {
        art.status = 'blocked';
      });

      return {
        blocked: artsToBlock.length,
        message: `${artsToBlock.length} arte(s) bloqueada(s) devido ao limite de ${maxArts} arts`
      };
    }

    // Tentar desbloquear arts bloqueadas
    const blockedArts = character.getBlockedArts();
    let unblocked = 0;

    for (const art of blockedArts) {
      if (activeArts.length < maxArts) {
        art.status = 'active';
        activeArts.push(art);
        unblocked++;
      }
    }

    if (unblocked > 0) {
      return {
        unblocked,
        message: `${unblocked} arte(s) desbloqueada(s)`
      };
    }

    return { message: 'Nenhuma altera├º├úo necess├íria' };
  }

  // ============ C├üLCULOS DE EFEITO SECUND├üRIO ============
  /**
   * Calcula chance de efeito secund├írio baseado no dom├¡nio
   * Dom├¡nio 1: 10%, 2: 20%, 3: 30%, 4: 40%, 5: 50%
   */
  static calculateSecondaryEffectChance(domain) {
    return domain * 10;
  }

  // ============ C├üLCULO DE CUSTO BASEADO EM ATRIBUTO ============
  /**
   * Alguns treinos t├®cnicos requerem atributo m├¡nimo de 40
   */
  static canLearnSkillTraining(character, requiredAttribute) {
    return character.attributes[requiredAttribute] >= 40;
  }

  // ============ SINCRONIZA├ç├âO DE VARIA├ç├òES ============
  /**
   * Quando uma art ├® removida, suas varia├º├Áes tamb├®m devem ser removidas
   */
  static removeArtWithVariations(character, artId) {
    const art = character.getArt(artId);
    if (art) {
      // As varia├º├Áes s├úo removidas automaticamente pela estrutura
      character.removeArt(artId);
      return true;
    }
    return false;
  }

  // ============ GERA├ç├âO DE RESUMO DE STATS ============
  static generateArtsReport(character) {
    const maxArts = this.calculateMaxArts(character);
    const activeArts = character.getActiveArts();
    const blockedArts = character.getBlockedArts();
    const totalVariations = character.arts.reduce((sum, art) => sum + art.variations.length, 0);

    return {
      maxArts,
      activeArts: activeArts.length,
      blockedArts: blockedArts.length,
      totalArts: character.arts.length,
      totalVariations,
      artsByType: this.groupArtsByType(character),
      artsByDomain: this.groupArtsByDomain(character),
      canCreateNewArt: this.canCreateNewArt(character)
    };
  }

  static groupArtsByType(character) {
    const grouped = {};
    Object.keys(this.ART_TYPES).forEach(type => {
      grouped[type] = character.arts.filter(a => a.type === type).length;
    });
    return grouped;
  }

  static groupArtsByDomain(character) {
    const grouped = {};
    for (let d = 1; d <= 5; d++) {
      grouped[d] = character.arts.filter(a => a.domain === d).length;
    }
    return grouped;
  }

  // ============ VALIDA├ç├âO GERAL ============
  static validateCharacter(character) {
    const errors = [];

    // Validar se tem pelo menos um n├║cleo
    if (character.cores.length === 0) {
      errors.push('Personagem deve ter pelo menos um N├║cleo');
    }

    // Validar cada art
    character.arts.forEach((art, index) => {
      const validation = this.validateArt(art, character);
      if (!validation.valid) {
        errors.push(`Art ${index + 1} (${art.name}): ${validation.errors.join(', ')}`);
      }

      // Validar varia├º├Áes
      art.variations.forEach((variation, varIndex) => {
        const varValidation = this.validateVariation(variation, art);
        if (!varValidation.valid) {
          errors.push(
            `Varia├º├úo ${varIndex + 1} da Art ${art.name}: ${varValidation.errors.join(', ')}`
          );
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ­ƒîì Exportar para window (global)
window.RulesEngine = RulesEngine;

// Exportar para Node.js (se aplic├ível)
