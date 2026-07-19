/**
 * CAMADA DE DADOS - MODELS
 * Estruturas de dados para o sistema de Habilidades (Arts)
 * Re:Dungeon Character Sheet
 */

/**
 * Classe Variation - Variação de uma Art
 * Variações herdam efeitos da Art principal e não contam no limite
 */
class Variation {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.type = data.type || ''; // Ofensiva, Defensiva, etc
    this.action = data.action || ''; // Imediata, Duradoura, Sustentada
    this.domain = data.domain || 1; // 1-5
    this.cost = data.cost || 0; // Custo em PM
    this.reload = data.reload || 0; // Recarga em turnos
    this.damage = data.damage || ''; // Ex: 2d6+3
    this.duration = data.duration || ''; // Ex: 1 turno
    this.range = data.range || ''; // Ex: 10 metros
    this.targets = data.targets || ''; // Ex: alvo único
    this.description = data.description || '';
    this.image = data.image || ''; // Base64 ou URL
    this.createdAt = data.createdAt || Date.now();
    this.effects = data.effects || {}; // Efeitos específicos da variação
  }

  static fromJSON(json) {
    return new Variation(json);
  }

  generateId() {
    return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      action: this.action,
      domain: this.domain,
      cost: this.cost,
      reload: this.reload,
      damage: this.damage,
      duration: this.duration,
      range: this.range,
      targets: this.targets,
      description: this.description,
      image: this.image,
      createdAt: this.createdAt,
      effects: this.effects
    };
  }
}

/**
 * Classe Art - Habilidade/Arte principal
 * Derivada de um Núcleo, pode ter múltiplas variações
 */
class Art {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.coreId = data.coreId || ''; // Referência ao Núcleo pai
    this.type = data.type || 'ataque'; // ataque, defesa, suporte, controle
    this.domain = data.domain || 1; // 1-5 (Básico a Supremo)
    this.cooldown = data.cooldown || 0; // Em turnos
    this.duration = data.duration || 'instantâneo';
    this.range = data.range || 'contato';
    this.targets = data.targets || 'alvo único';
    this.cost = data.cost || 0; // Custo de energia/mana
    this.description = data.description || '';
    this.status = data.status || 'active'; // active, blocked, locked
    this.variations = (data.variations || []).map(v => 
      v instanceof Variation ? v : Variation.fromJSON(v)
    );
    this.createdAt = data.createdAt || Date.now();
    this.effects = data.effects || {}; // Efeitos principais
    
    // ✨ NOVOS CAMPOS
    this.image = data.image || null; // Base64 ou URL da imagem
    this.artType = data.artType || 'ofensiva'; // Tipo: ofensiva, defensiva, estrategica, suporte, controle, invocacao, transformacao, passiva
    this.action = data.action || 'Imediata'; // Ação: Imediata, Duradoura, Sustentada
    this.damage = data.damage || 0; // Dano da habilidade
    this.reload = data.reload || 0; // Recarga em turnos
  }

  static fromJSON(json) {
    return new Art(json);
  }

  generateId() {
    return `art_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addVariation(variation) {
    if (!(variation instanceof Variation)) {
      variation = new Variation(variation);
    }
    this.variations.push(variation);
    return variation;
  }

  removeVariation(variationId) {
    this.variations = this.variations.filter(v => v.id !== variationId);
  }

  getVariation(variationId) {
    return this.variations.find(v => v.id === variationId);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      coreId: this.coreId,
      type: this.type,
      domain: this.domain,
      cooldown: this.cooldown,
      duration: this.duration,
      range: this.range,
      targets: this.targets,
      cost: this.cost,
      description: this.description,
      status: this.status,
      variations: this.variations.map(v => v.toJSON()),
      createdAt: this.createdAt,
      effects: this.effects,
      // ✨ NOVOS CAMPOS
      image: this.image,
      artType: this.artType,
      action: this.action,
      damage: this.damage,
      reload: this.reload
    };
  }
}

/**
 * Classe Core - Núcleo de Habilidade
 * Base para criação de Arts
 */
class Core {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.concept = data.concept || '';
    this.visualForm = data.visualForm || '';
    this.description = data.description || '';
    this.image = data.image || null; // Imagem do núcleo
    this.baseBonus = data.baseBonus || {}; // Bônus base do núcleo
    this.createdAt = data.createdAt || Date.now();
    // ✨ NOVO CAMPO: tipo específico do núcleo (ofensiva, defensiva, etc)
    this.coreType = data.coreType || '';
  }

  static fromJSON(json) {
    return new Core(json);
  }

  generateId() {
    return `core_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      concept: this.concept,
      visualForm: this.visualForm,
      description: this.description,
      image: this.image,
      baseBonus: this.baseBonus,
      createdAt: this.createdAt,
      // ✨ NOVO CAMPO
      coreType: this.coreType
    };
  }
}

/**
 * Classe Character - Personagem
 * Contém todos os dados de habilidades
 */
class Character {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || 'Novo Personagem';
    this.attributes = {
      forca: data.attributes?.forca || 50,
      vitalidade: data.attributes?.vitalidade || 50,
      agilidade: data.attributes?.agilidade || 50,
      inteligencia: data.attributes?.inteligencia || 50,
      percepcao: data.attributes?.percepcao || 50,
      sorte: data.attributes?.sorte || 50
    };
    this.cores = (data.cores || []).map(c => 
      c instanceof Core ? c : Core.fromJSON(c)
    );
    this.arts = (data.arts || []).map(a => 
      a instanceof Art ? a : Art.fromJSON(a)
    );
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static fromJSON(json) {
    return new Character(json);
  }

  generateId() {
    return `char_${Date.now()}`;
  }

  // ============ CORES ============
  addCore(core) {
    if (!(core instanceof Core)) {
      core = new Core(core);
    }
    this.cores.push(core);
    this.updatedAt = Date.now();
    return core;
  }

  removeCore(coreId) {
    // Remove o núcleo
    this.cores = this.cores.filter(c => c.id !== coreId);
    
    // Remove todas as Arts associadas a este núcleo
    this.arts = this.arts.filter(a => a.coreId !== coreId);
    
    this.updatedAt = Date.now();
  }

  getCore(coreId) {
    return this.cores.find(c => c.id === coreId);
  }

  // ============ ARTS ============
  addArt(art) {
    if (!(art instanceof Art)) {
      art = new Art(art);
    }
    this.arts.push(art);
    this.updatedAt = Date.now();
    return art;
  }

  removeArt(artId) {
    this.arts = this.arts.filter(a => a.id !== artId);
    this.updatedAt = Date.now();
  }

  getArt(artId) {
    return this.arts.find(a => a.id === artId);
  }

  getArtsByCore(coreId) {
    return this.arts.filter(a => a.coreId === coreId);
  }

  getActiveArts() {
    return this.arts.filter(a => a.status === 'active');
  }

  getBlockedArts() {
    return this.arts.filter(a => a.status === 'blocked');
  }

  // ============ UTILITÁRIOS ============
  updateAttribute(attributeName, value) {
    if (attributeName in this.attributes) {
      this.attributes[attributeName] = Math.max(0, value);
      this.updatedAt = Date.now();
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      attributes: this.attributes,
      cores: this.cores.map(c => c.toJSON()),
      arts: this.arts.map(a => a.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Character, Core, Art, Variation };
}
