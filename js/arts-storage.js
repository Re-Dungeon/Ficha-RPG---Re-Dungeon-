/**
 * CAMADA DE PERSISTÊNCIA - STORAGE
 * Sistema robusto de salvamento com versionamento e sincronização entre abas
 * Re:Dungeon Character Sheet
 */

class StorageManager {
  static VERSION = '1.0.0';
  static STORAGE_KEY = 'redungeon_character';
  static BACKUP_KEY = 'redungeon_character_backup';
  static NOTIFICATIONS_KEY = 'redungeon_notifications';

  /**
   * Salva o character no localStorage com versionamento
   */
  static saveCharacter(character) {
    // ⚠️ NOTA: Removido blocker de importação - precisamos PERMITIR saves durante importação
    // para que os dados restaurados sejam persistidos em localStorage
    // Apenas bloqueamos saves do SISTEMA AUTOMÁTICO de sync

    try {
      const charJson = character.toJSON();
      
      // 🔥 EXTRAIR IMAGEM DO PERSONAGEM SE EXISTIR
      if (charJson.imagemUrl && charJson.imagemUrl.startsWith('data:') && typeof ImagemStorageManager !== 'undefined') {
        const imagemId = 'personagem_imagem';
        ImagemStorageManager.salvarImagem(imagemId, charJson.imagemUrl, 'personagem');
        
        // Remover imagem do JSON para economizar localStorage
        delete charJson.imagemUrl;
        charJson._imagemId = imagemId;
      }
      
      const data = {
        version: this.VERSION,
        timestamp: Date.now(),
        data: charJson
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

      // Criar backup automático
      this.createBackup();

      // Notificar
      this.notify('✅ Dados salvos', 'success', 2000);

      // Disparar evento customizado para sincronização
      window.dispatchEvent(
        new CustomEvent('artsDataSaved', {
          detail: { timestamp: Date.now(), character: data }
        })
      );

      return true;
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
      this.notify('❌ Erro ao salvar dados', 'error', 3000);
      return false;
    }
  }

  /**
   * Carrega o character do localStorage com validação
   */
  static async loadCharacter() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (!stored) {
        console.log('Nenhum personagem encontrado, criando padrão...');
        return this.createDefaultCharacter();
      }

      const data = JSON.parse(stored);

      // Validar versão
      if (!data.version || data.version !== this.VERSION) {
        console.warn('Versão incompatível, tentando migração...');
        return this.migrateData(data);
      }

      // Validar integridade dos dados
      if (!data.data) {
        throw new Error('Dados corrompidos: estrutura inválida');
      }

      // 🔥 RESTAURAR IMAGEM DO PERSONAGEM DO INDEXEDDB (se ImagemStorageManager estiver disponível)
      if (data.data._imagemId && typeof ImagemStorageManager !== 'undefined') {
        try {
          const imagemData = await ImagemStorageManager.carregarImagem(data.data._imagemId);
          if (imagemData) {
            data.data.imagemUrl = imagemData;
            console.log('🖼️ Imagem do personagem restaurada');
          }
        } catch (e) {
          // Erro suprimido para manter console limpo
        }
      }

      // Reconstruir instâncias
      const character = Character.fromJSON(data.data);

      // Validar character
      const validation = RulesEngine.validateCharacter(character);
      if (!validation.valid) {
        console.warn('Character com erros de validação:', validation.errors);
        // Não falhar completamente, apenas alertar
      }

      return character;
    } catch (error) {
      console.error('Erro ao carregar personagem:', error);
      this.notify('⚠️ Erro ao carregar dados, usando padrão', 'warning', 3000);

      // Tentar restaurar do backup
      const backup = this.loadBackup();
      if (backup) {
        this.notify('📦 Restaurado backup anterior', 'info', 3000);
        return backup;
      }

      return this.createDefaultCharacter();
    }
  }

  /**
   * Cria um character padrão
   */
  static createDefaultCharacter() {
    const character = new Character({
      name: 'Novo Personagem',
      attributes: {
        intelecto: 50,
        sorte: 50,
        forca: 50,
        agilidade: 50
      }
    });

    // Salvar o character padrão
    this.saveCharacter(character);

    return character;
  }

  /**
   * Cria backup automático
   */
  static createBackup() {
    try {
      const current = localStorage.getItem(this.STORAGE_KEY);
      if (current) {
        localStorage.setItem(this.BACKUP_KEY, current);
      }
    } catch (error) {
      console.warn('Erro ao criar backup:', error);
    }
  }

  /**
   * Carrega backup
   */
  static loadBackup() {
    try {
      const backup = localStorage.getItem(this.BACKUP_KEY);
      if (!backup) return null;

      const data = JSON.parse(backup);
      return Character.fromJSON(data.data);
    } catch (error) {
      console.error('Erro ao carregar backup:', error);
      return null;
    }
  }

  /**
   * Migra dados de versões anteriores
   */
  static migrateData(oldData) {
    console.log('Migrando dados da versão:', oldData.version);

    // Placeholder para migração futura
    // Por enquanto, apenas retorna um character padrão
    return this.createDefaultCharacter();
  }

  /**
   * Reset completo (cuidado!)
   */
  static resetCharacter() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
      this.notify('🔄 Personagem resetado', 'info', 2000);
      return this.createDefaultCharacter();
    } catch (error) {
      console.error('Erro ao resetar personagem:', error);
      this.notify('❌ Erro ao resetar', 'error', 3000);
      return null;
    }
  }

  /**
   * Exporta personagem como JSON
   */
  static exportCharacter(character) {
    try {
      const data = {
        version: this.VERSION,
        exportDate: new Date().toISOString(),
        data: character.toJSON()
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `redungeon_${character.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.notify('📥 Personagem exportado', 'success', 2000);
      return true;
    } catch (error) {
      console.error('Erro ao exportar personagem:', error);
      this.notify('❌ Erro ao exportar', 'error', 3000);
      return false;
    }
  }

  /**
   * Importa personagem de JSON
   */
  static importCharacter(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);

          // Validar versão
          if (data.version !== this.VERSION) {
            console.warn('Versão diferente, tentando compatibilidade...');
          }

          if (!data.data) {
            throw new Error('Formato de arquivo inválido');
          }

          const character = Character.fromJSON(data.data);

          // Salvar
          this.saveCharacter(character);
          this.notify('📤 Personagem importado com sucesso', 'success', 2000);

          resolve(character);
        } catch (error) {
          console.error('Erro ao importar personagem:', error);
          this.notify('❌ Erro ao importar arquivo', 'error', 3000);
          reject(error);
        }
      };

      reader.onerror = () => {
        this.notify('❌ Erro ao ler arquivo', 'error', 3000);
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Sistema de notificações visual
   */
  static notify(message, type = 'info', duration = 3000) {
    // Criar ou reutilizar container de notificações
    let container = document.getElementById('arts-notifications-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'arts-notifications-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    // ✅ IMPORTANTE: Limitar máximo de 3 notificações simultâneas
    const existingNotifications = container.querySelectorAll('div');
    if (existingNotifications.length >= 3) {
      // Remover a notificação mais antiga
      const oldestNotification = existingNotifications[0];
      oldestNotification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => oldestNotification.remove(), 300);
    }

    const notification = document.createElement('div');
    notification.style.cssText = `
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      cursor: pointer;
      max-width: 300px;
      word-wrap: break-word;
    `;

    notification.textContent = message;
    container.appendChild(notification);

    // Auto-remove
    const removeTimeout = setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode === container) {
          notification.remove();
        }
      }, 300);
    }, duration);

    // Clique para remover
    notification.addEventListener('click', () => {
      clearTimeout(removeTimeout);
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode === container) {
          notification.remove();
        }
      }, 300);
    });

    console.log(`📢 Notificação [${type}]: ${message}`);
  }

  static getNotificationColor(type) {
    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196F3'
    };
    return colors[type] || colors.info;
  }

  /**
   * Inicializa listeners para sincronização entre abas
   */
  static initStorageSyncListener(callback) {
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          const character = Character.fromJSON(data.data);

          console.log('Dados sincronizados de outra aba');
          this.notify('🔄 Dados sincronizados', 'info', 1500);

          if (callback && typeof callback === 'function') {
            callback(character);
          }
        } catch (error) {
          console.error('Erro ao sincronizar dados:', error);
        }
      }
    });
  }

  /**
   * Limpar notificações armazenadas (se necessário)
   */
  static clearNotifications() {
    try {
      localStorage.removeItem(this.NOTIFICATIONS_KEY);
    } catch (error) {
      console.warn('Erro ao limpar notificações:', error);
    }
  }

  /**
   * Obter informações de storage
   */
  static getStorageInfo() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      const sizeInKB = new Blob([stored]).size / 1024;

      return {
        version: data.version,
        timestamp: new Date(data.timestamp),
        sizeKB: sizeInKB.toFixed(2),
        characterName: data.data?.name,
        lastUpdate: new Date(data.data?.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao obter info de storage:', error);
      return null;
    }
  }
}

// CSS para animações de notificação
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyles);

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager };
}
