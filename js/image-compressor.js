/**
 * IMAGE COMPRESSOR - Compressão e Descompressão de Imagens
 * Reduz tamanho de imagens em base64 mantendo qualidade visual aceitável
 * Re:Dungeon Character Sheet
 */

class ImageCompressor {
  /**
   * Configurações de compressão por tipo de imagem
   */
  static COMPRESSION_CONFIG = {
    // Núcleos: qualidade média, importante manter visual
    core: {
      quality: 0.75,
      maxWidth: 800,
      maxHeight: 800,
      format: 'image/jpeg'
    },
    // Arts: qualidade boa, tamanho médio
    art: {
      quality: 0.80,
      maxWidth: 1000,
      maxHeight: 1000,
      format: 'image/jpeg'
    },
    // Variações: qualidade boa
    variation: {
      quality: 0.80,
      maxWidth: 1000,
      maxHeight: 1000,
      format: 'image/jpeg'
    },
    // Imagem do personagem: qualidade alta, pode ser maior
    character: {
      quality: 0.85,
      maxWidth: 1200,
      maxHeight: 1200,
      format: 'image/jpeg'
    }
  };

  /**
   * Comprime uma imagem base64
   * @param {string} base64String - Imagem em base64
   * @param {string} type - Tipo ('core', 'art', 'variation', 'character')
   * @returns {Promise<string>} Imagem comprimida em base64
   */
  static async compressImage(base64String, type = 'art') {
    return new Promise((resolve, reject) => {
      try {
        // Se não é base64, retorna como está (é URL externa)
        if (!base64String.startsWith('data:')) {
          console.log('🔗 Imagem externa, pulando compressão');
          resolve(base64String);
          return;
        }

        const config = this.COMPRESSION_CONFIG[type] || this.COMPRESSION_CONFIG.art;
        const img = new Image();

        img.onload = () => {
          try {
            // Criar canvas
            const canvas = document.createElement('canvas');
            
            // Calcular novas dimensões mantendo proporção
            let { width, height } = img;
            const aspectRatio = width / height;

            if (width > config.maxWidth) {
              width = config.maxWidth;
              height = Math.round(width / aspectRatio);
            }

            if (height > config.maxHeight) {
              height = config.maxHeight;
              width = Math.round(height * aspectRatio);
            }

            canvas.width = width;
            canvas.height = height;

            // Desenhar imagem no canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Converter para base64 comprimido
            const compressedBase64 = canvas.toDataURL(config.format, config.quality);

            // Calcular economia
            const originalSize = base64String.length;
            const compressedSize = compressedBase64.length;
            const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);

            console.log(`📦 Imagem comprimida (${type}):`, {
              original: `${(originalSize / 1024).toFixed(2)}KB`,
              compressed: `${(compressedSize / 1024).toFixed(2)}KB`,
              savings: `${savings}%`,
              quality: config.quality,
              dimensions: `${width}x${height}`
            });

            resolve(compressedBase64);
          } catch (e) {
            console.error('❌ Erro ao comprimir imagem:', e);
            // Fallback: retorna imagem original
            resolve(base64String);
          }
        };

        img.onerror = () => {
          console.warn('⚠️ Erro ao carregar imagem para compressão');
          resolve(base64String);
        };

        // Carregar imagem
        img.src = base64String;
      } catch (error) {
        console.error('❌ Erro geral na compressão:', error);
        resolve(base64String);
      }
    });
  }

  /**
   * Comprime múltiplas imagens
   * @param {Array} images - Array de objetos {base64, type}
   * @returns {Promise<Array>} Array de imagens comprimidas
   */
  static async compressMultiple(images) {
    return Promise.all(
      images.map(img => this.compressImage(img.base64, img.type))
    );
  }

  /**
   * Obtém informações sobre uma imagem base64
   * @param {string} base64String - Imagem em base64
   * @returns {Object} Informações da imagem
   */
  static getImageInfo(base64String) {
    if (!base64String.startsWith('data:')) {
      return {
        type: 'external',
        size: 0,
        format: 'unknown'
      };
    }

    try {
      // Extrair tipo
      const matches = base64String.match(/data:image\/([^;]+)/);
      const format = matches ? matches[1] : 'unknown';

      // Calcular tamanho real (aproximado)
      const base64Length = base64String.length - 'data:image/x;base64,'.length;
      const size = Math.round(base64Length * 0.75); // Conversão aproximada de base64 para bytes

      return {
        type: 'base64',
        size: size,
        format: format,
        sizeKB: (size / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('❌ Erro ao obter info da imagem:', error);
      return { type: 'unknown', size: 0, format: 'unknown' };
    }
  }

  /**
   * Valida se uma imagem está dentro do limite de tamanho
   * @param {string} base64String - Imagem em base64
   * @param {number} maxSizeKB - Tamanho máximo em KB
   * @returns {boolean} True se está dentro do limite
   */
  static isWithinSizeLimit(base64String, maxSizeKB = 500) {
    const info = this.getImageInfo(base64String);
    return info.size <= maxSizeKB * 1024;
  }

  /**
   * Converte imagem para WebP (mais eficiente)
   * @param {string} base64String - Imagem em base64
   * @param {number} quality - Qualidade (0-1)
   * @returns {Promise<string>} Imagem em WebP base64
   */
  static async convertToWebP(base64String, quality = 0.8) {
    return new Promise((resolve, reject) => {
      try {
        if (!base64String.startsWith('data:')) {
          resolve(base64String);
          return;
        }

        const img = new Image();

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const webpBase64 = canvas.toDataURL('image/webp', quality);
            
            const originalSize = base64String.length;
            const webpSize = webpBase64.length;
            const savings = Math.round(((originalSize - webpSize) / originalSize) * 100);

            console.log(`🖼️ Convertido para WebP: ${savings}% de economia`);
            resolve(webpBase64);
          } catch (e) {
            console.error('❌ Erro ao converter para WebP:', e);
            resolve(base64String);
          }
        };

        img.onerror = () => {
          console.warn('⚠️ Erro ao carregar imagem para conversão WebP');
          resolve(base64String);
        };

        img.src = base64String;
      } catch (error) {
        console.error('❌ Erro geral na conversão WebP:', error);
        resolve(base64String);
      }
    });
  }

  /**
   * Batch compress com logging detalhado
   * @param {Array<{id, base64, type}>} images - Images com ID
   * @returns {Promise<Map>} Map de id -> imagemComprimida
   */
  static async compressBatch(images) {
    console.log(`\n📦 Iniciando compressão em lote de ${images.length} imagens...`);
    
    const results = new Map();
    let totalOriginal = 0;
    let totalCompressed = 0;

    for (const img of images) {
      const originalSize = img.base64.length;
      totalOriginal += originalSize;

      const compressed = await this.compressImage(img.base64, img.type);
      const compressedSize = compressed.length;
      totalCompressed += compressedSize;

      results.set(img.id, compressed);
    }

    const totalSavings = Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100);
    console.log(`\n✅ Compressão em lote concluída:`, {
      imagens: images.length,
      totalOriginal: `${(totalOriginal / 1024).toFixed(2)}KB`,
      totalCompressed: `${(totalCompressed / 1024).toFixed(2)}KB`,
      economiaTotal: `${totalSavings}%`
    });

    return results;
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImageCompressor };
}
