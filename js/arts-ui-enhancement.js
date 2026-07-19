/**
 * ARTS UI ENHANCEMENT - Templates e funções melhoradas
 * Card horizontal e Popups para Arts
 * Re:Dungeon Character Sheet
 */

// ============ TEMPLATES MELHORADOS ============

/**
 * Template do Card Horizontal de Arts
 */
function getArtCardTemplate(art, core) {
  const typeIcons = {
    'ofensiva': '⚔️',
    'defensiva': '🛡️',
    'estrategica': '🎯',
    'suporte': '💚',
    'controle': '🌀',
    'invocacao': '🔮',
    'transformacao': '🧬',
    'passiva': '🕶️',
    'racial': '👑'
  };

  const actionIcons = {
    'Imediata': '⚡',
    'Duradoura': '⏳',
    'Sustentada': '♾️'
  };

  const typeIcon = typeIcons[art.type] || '❓';
  const actionIcon = actionIcons[art.action] || '⚡';
  const imageUrl = art.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Crect fill=%22%232a1810%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2260%22 y=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23d4a574%22 font-size=%2240%22%3E🎴%3C/text%3E%3C/svg%3E';
  
  // Obter nome do domínio
  const domainInfo = window.RulesEngine?.getDomainInfo?.(art.domain) || { name: 'Desconhecido' };
  const domainName = domainInfo.name || 'Desconhecido';

  return `
    <div class="art-card-horizontal" data-art-id="${art.id}" style="
      background: linear-gradient(135deg, #0a0e14 0%, #13171f 100%);
      border: 2px solid rgba(216, 180, 254, 0.5);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
    ">
      <!-- SEÇÃO 1: HEADER COM IMAGEM E TÍTULO -->
      <div style="
        display: flex;
        gap: 16px;
        padding: 16px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <!-- IMAGEM 120x120 -->
        <div style="
          width: 120px;
          height: 120px;
          min-width: 120px;
          border-radius: 6px;
          background: rgba(0,0,0,0.4);
          border: 2px solid rgba(216, 180, 254, 0.4);
          overflow: hidden;
        ">
          <img src="${imageUrl}" alt="${art.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <!-- INFORMAÇÕES DO HEADER -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <!-- TÍTULO E NÚCLEO -->
          <div>
            <h3 style="margin: 0; color: #d8b4fe; font-size: 1.2em; font-weight: bold;">
              ${art.name}
            </h3>
            ${core ? `<p style="margin: 4px 0 0 0; color: #b0b8c1; font-size: 0.9em;">Núcleo: <strong>${core.name}</strong></p>` : ''}
          </div>
          <!-- TIPO | AÇÃO | DOMÍNIO -->
          <div style="
            display: flex;
            gap: 8px;
            font-size: 0.85em;
            color: #b0b8c1;
            flex-wrap: wrap;
            align-items: center;
          ">
            <span class="art-type-badge" style="
              background: rgba(216, 180, 254, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
            ">
              ${typeIcon} ${art.type}
            </span>
            <span style="
              background: rgba(243, 156, 18, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
            ">
              ${actionIcon} ${art.action}
            </span>
            <span style="
              background: rgba(156, 39, 176, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
              color: #d8b3e6;
            ">
              🔮 Dominio: ${String(art.domain).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: TABELA COM ATRIBUTOS -->
      <div style="
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: rgba(216, 180, 254, 0.15);
        padding: 1px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <!-- RECARGA -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Recarga</div>
          <div style="color: #e0e0e0; font-weight: bold;">${art.reload || '0'}</div>
        </div>
        <!-- AÇÃO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Ação</div>
          <div style="color: #e0e0e0; font-weight: bold;">${art.action || '-'}</div>
        </div>
        <!-- DURAÇÃO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Duração</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${art.duration || '-'}</div>
        </div>
        <!-- ALCANCE -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alcance</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${art.range || '-'}</div>
        </div>
        <!-- ALVOS -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alvos</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${art.targets || '-'}</div>
        </div>
        <!-- CUSTO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #9b59b6; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Custo</div>
          <div style="color: #9b59b6; font-weight: bold;">${art.cost || '0'}</div>
        </div>
        <!-- DANO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #e74c3c; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Dano</div>
          <div style="color: #e74c3c; font-weight: bold;">${art.damage || '-'}</div>
        </div>
      </div>

      <!-- SEÇÃO 3: DESCRIÇÃO -->
      <div style="
        padding: 12px 16px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <h5 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 0.85em; font-weight: bold; text-transform: uppercase;">DESCRIÇÃO:</h5>
        <p style="
          margin: 0;
          color: #b0b8c1;
          font-size: clamp(0.75em, 2vw, 0.95em);
          line-height: 1.6;
          word-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">
          ${art.description || 'Sem descrição'}
        </p>
      </div>

      <!-- SEÇÃO 4: BOTÕES DE AÇÃO -->
      <div style="
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        justify-content: space-around;
      ">
        <button class="arts-btn arts-btn-tiny" data-action="view-art" data-id="${art.id}" style="
          flex: 1;
          padding: 10px 12px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.9em;
        ">🔍 Ver</button>
        <button class="arts-btn arts-btn-tiny" data-action="edit-art" data-id="${art.id}" style="
          flex: 1;
          padding: 10px 12px;
          background: #f39c12;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.9em;
        ">✏️ Editar</button>
        <button class="arts-btn arts-btn-tiny" data-action="delete-art" data-id="${art.id}" style="
          flex: 1;
          padding: 10px 12px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.9em;
        ">🗑️ Remover</button>
      </div>
    </div>
  `;
}

// ============ TIPOS E AÇÕES ============

const ART_TYPES = {
  'ofensiva': { icon: '⚔️', name: 'Ofensiva' },
  'defensiva': { icon: '🛡️', name: 'Defensiva' },
  'estrategica': { icon: '🎯', name: 'Estratégica' },
  'suporte': { icon: '💚', name: 'Suporte' },
  'controle': { icon: '🌀', name: 'Controle' },
  'invocacao': { icon: '🔮', name: 'Invocação' },
  'transformacao': { icon: '🧬', name: 'Transformação' },
  'passiva': { icon: '🕶️', name: 'Passiva' },
  'racial': { icon: '👑', name: 'Racial' }
};

const ART_ACTIONS = {
  'Imediata': 'Executa imediatamente',
  'Duradoura': 'Efeito dura vários turnos',
  'Sustentada': 'Mantém efeito enquanto sustenta'
};

// ============ HELPERS ============

/**
 * Converte arquivo para Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Valida dados da Art
 */
function validateArtData(data) {
  const errors = [];
  
  if (!data.name || !data.name.trim()) errors.push('Nome é obrigatório');
  if (!data.artType) errors.push('Tipo de Arte é obrigatório');
  if (!data.action) errors.push('Ação é obrigatória');
  // Validar custo apenas se for número
  if (typeof data.cost === 'number' && data.cost < 0) errors.push('Custo não pode ser negativo');
  // Validar dano apenas se for número
  if (typeof data.damage === 'number' && data.damage < 0) errors.push('Dano não pode ser negativo');
  
  return { valid: errors.length === 0, errors };
}

/**
 * Template do Card Horizontal de Variantes (igual ao de Arts)
 */
function getVarianteCardTemplate(variation, art) {
  const typeIcons = {
    'ofensiva': '⚔️',
    'Ofensiva': '⚔️',
    'defensiva': '🛡️',
    'Defensiva': '🛡️',
    'estrategica': '🎯',
    'Estratégica': '🎯',
    'suporte': '💚',
    'Suporte': '💚',
    'controle': '🌀',
    'Controle': '🌀',
    'invocacao': '🔮',
    'Invocação': '🔮',
    'transformacao': '🧬',
    'Transformação': '🧬',
    'passiva': '🕶️',
    'Passiva': '🕶️',
    'racial': '👑',
    'Racial': '👑'
  };

  const actionIcons = {
    'Imediata': '⚡',
    'Duradoura': '⏳',
    'Sustentada': '♾️'
  };

  const typeIcon = typeIcons[variation.type] || '❓';
  const actionIcon = actionIcons[variation.action] || '⚡';
  const imageUrl = variation.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Crect fill=%22%232a1810%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2260%22 y=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23d4a574%22 font-size=%2240%22%3E🎴%3C/text%3E%3C/svg%3E';

  return `
    <div class="variation-card-horizontal" data-var-id="${variation.id}" data-art-id="${art.id}" style="
      background: linear-gradient(135deg, #0a0e14 0%, #13171f 100%);
      border: 2px solid rgba(216, 180, 254, 0.5);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
    ">
      <!-- SEÇÃO 1: HEADER COM IMAGEM E TÍTULO -->
      <div style="
        display: flex;
        gap: 20px;
        padding: 20px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <!-- IMAGEM 120x120 -->
        <div style="
          width: 120px;
          height: 120px;
          min-width: 120px;
          border-radius: 6px;
          background: rgba(0,0,0,0.4);
          border: 2px solid rgba(216, 180, 254, 0.4);
          overflow: hidden;
        ">
          <img src="${imageUrl}" alt="${variation.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <!-- INFORMAÇÕES DO HEADER -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <!-- TÍTULO E ART PAI -->
          <div>
            <h3 style="margin: 0; color: #d8b4fe; font-size: 1.2em; font-weight: bold;">
              ${variation.name}
            </h3>
            ${art ? `<p style="margin: 4px 0 0 0; color: #b0b8c1; font-size: 0.9em;">Variante de: <strong>${art.name}</strong></p>` : ''}
          </div>
          <!-- TIPO | AÇÃO | DOMÍNIO -->
          <div style="
            display: flex;
            gap: 8px;
            font-size: 0.85em;
            color: #b0b8c1;
            flex-wrap: wrap;
            align-items: center;
          ">
            <span class="variation-type-badge" style="
              background: rgba(216, 180, 254, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
            ">
              ${typeIcon} ${variation.type || '-'}
            </span>
            <span style="
              background: rgba(243, 156, 18, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
            ">
              ${actionIcon} ${variation.action || '-'}
            </span>
            <span style="
              background: rgba(156, 39, 176, 0.15);
              padding: 6px 10px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: bold;
              color: #d8b3e6;
            ">
              🔮 Dominio: ${String(variation.domain).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: TABELA COM ATRIBUTOS -->
      <div style="
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: rgba(216, 180, 254, 0.15);
        padding: 1px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <!-- RECARGA -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Recarga</div>
          <div style="color: #e0e0e0; font-weight: bold;">${variation.reload || '0'}</div>
        </div>
        <!-- AÇÃO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Ação</div>
          <div style="color: #e0e0e0; font-weight: bold;">${variation.action || '-'}</div>
        </div>
        <!-- DURAÇÃO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Duração</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${variation.duration || '-'}</div>
        </div>
        <!-- ALCANCE -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alcance</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${variation.range || '-'}</div>
        </div>
        <!-- ALVOS -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #d8b4fe; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Alvos</div>
          <div style="color: #e0e0e0; font-weight: bold; font-size: 0.9em;">${variation.targets || '-'}</div>
        </div>
        <!-- CUSTO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #9b59b6; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Custo</div>
          <div style="color: #9b59b6; font-weight: bold;">${variation.cost || '0'}</div>
        </div>
        <!-- DANO -->
        <div style="
          background: #0a0e14;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="color: #e74c3c; font-size: 0.7em; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Dano</div>
          <div style="color: #e74c3c; font-weight: bold;">${variation.damage || '-'}</div>
        </div>
      </div>

      <!-- SEÇÃO 3: DESCRIÇÃO -->
      <div style="
        padding: 16px 20px;
        border-bottom: 1px solid rgba(216, 180, 254, 0.3);
      ">
        <h5 style="margin: 0 0 8px 0; color: #d8b4fe; font-size: 0.85em; font-weight: bold; text-transform: uppercase;">DESCRIÇÃO:</h5>
        <p style="
          margin: 0;
          color: #b0b8c1;
          font-size: clamp(0.75em, 2vw, 0.95em);
          line-height: 1.6;
          word-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">
          ${variation.description || 'Sem descrição'}
        </p>
      </div>

      <!-- SEÇÃO 4: BOTÕES DE AÇÃO -->
      <div style="
        display: flex;
        gap: 8px;
        padding: 16px 20px;
        justify-content: space-around;
      ">
        <button class="arts-btn arts-btn-tiny" data-action="view-variation" data-art-id="${art.id}" data-var-id="${variation.id}" style="
          flex: 1;
          padding: 12px 14px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.95em;
        ">🔍 Ver</button>
        <button class="arts-btn arts-btn-tiny" data-action="edit-variation" data-art-id="${art.id}" data-var-id="${variation.id}" style="
          flex: 1;
          padding: 12px 14px;
          background: #f39c12;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.95em;
        ">✏️ Editar</button>
        <button class="arts-btn arts-btn-tiny" data-action="delete-variation" data-art-id="${art.id}" data-var-id="${variation.id}" style="
          flex: 1;
          padding: 12px 14px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 0.95em;
        ">🗑️ Remover</button>
      </div>
    </div>
  `;
}

// Exportar para uso global
window.ArtUIEnhancement = {
  getArtCardTemplate,
  getVarianteCardTemplate,
  ART_TYPES,
  ART_ACTIONS,
  fileToBase64,
  validateArtData
};

