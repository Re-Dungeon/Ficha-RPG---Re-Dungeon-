/* ============================================================= */
/* IMAGEM-OTIMIZACAO.JS                                          */
/* Sistema de otimização e compressão de imagens                 */
/* ============================================================= */

/**
 * ImagemOtimizacao
 * Comprime e otimiza imagens antes de armazenar
 * - Redimensiona imagens grandes
 * - Comprime JPEG/PNG
 * - Suporta formatos modernos (WebP)
 */

const ImagemOtimizacao = (() => {
    
    /**
     * Comprimir imagem usando Canvas
     * @param {string} base64Data - Dados em base64
     * @param {number} maxWidth - Largura máxima (default: 1024)
     * @param {number} maxHeight - Altura máxima (default: 1024)
     * @param {number} quality - Qualidade JPEG 0-1 (default: 0.8)
     * @returns {Promise<string>} Base64 comprimido
     */
    async function comprimirImagem(base64Data, maxWidth = 1024, maxHeight = 1024, quality = 0.8) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.onload = () => {
                    // Calcular novas dimensões
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                        console.log(`🖼️ Redimensionando imagem: ${img.width}x${img.height} → ${width.toFixed(0)}x${height.toFixed(0)}`);
                    }
                    
                    // Criar canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Converter para base64 com qualidade reduzida
                    const novaImagem = canvas.toDataURL('image/jpeg', quality);
                    
                    // Calcular economia
                    const tamanhoOriginal = base64Data.length;
                    const tamanhoNovo = novaImagem.length;
                    const economia = ((1 - tamanhoNovo / tamanhoOriginal) * 100).toFixed(1);
                    
                    console.log(`💾 Compressão concluída: ${(tamanhoOriginal/1024).toFixed(2)}KB → ${(tamanhoNovo/1024).toFixed(2)}KB (${economia}% redução)`);
                    
                    resolve(novaImagem);
                };
                
                img.onerror = () => reject(new Error('Erro ao carregar imagem'));
                img.src = base64Data;
                
            } catch (e) {
                console.error('❌ Erro na compressão:', e);
                reject(e);
            }
        });
    }

    /**
     * Obter informações da imagem (tamanho, dimensões, tipo)
     * @param {string} base64Data
     * @returns {Promise<object>}
     */
    async function obterInfoImagem(base64Data) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.onload = () => {
                    const info = {
                        tamanhoBytes: base64Data.length,
                        tamanhokb: (base64Data.length / 1024).toFixed(2),
                        tamanhomb: (base64Data.length / 1024 / 1024).toFixed(2),
                        largura: img.width,
                        altura: img.height,
                        tipo: base64Data.substring(5, base64Data.indexOf(';')),
                        proporcao: (img.width / img.height).toFixed(2)
                    };
                    resolve(info);
                };
                img.onerror = () => reject(new Error('Erro ao carregar imagem'));
                img.src = base64Data;
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Processar imagem: comprimir + validar
     * @param {File|string} imagemOuBase64
     * @param {object} opcoes - {maxWidth, maxHeight, quality, validarTamanho}
     * @returns {Promise<string>} Base64 otimizado
     */
    async function procesarImagem(imagemOuBase64, opcoes = {}) {
        const {
            maxWidth = 1024,
            maxHeight = 1024,
            quality = 0.8,
            validarTamanho = true,
            tamanhMaximoMB = 2
        } = opcoes;

        try {
            console.log('🖼️ Processando imagem...');
            
            // Se for File, converter para base64
            let base64 = imagemOuBase64;
            if (imagemOuBase64 instanceof File) {
                base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(imagemOuBase64);
                });
            }

            // Validar tamanho original
            if (validarTamanho) {
                const tamanhoMB = base64.length / 1024 / 1024;
                if (tamanhoMB > tamanhMaximoMB) {
                    console.warn(`⚠️ Imagem grande (${tamanhoMB.toFixed(2)}MB), comprimindo com qualidade 0.6...`);
                    return await comprimirImagem(base64, maxWidth, maxHeight, 0.6);
                }
            }

            // Comprimir
            const imagemComprimida = await comprimirImagem(base64, maxWidth, maxHeight, quality);
            
            // Obter info
            const info = await obterInfoImagem(imagemComprimida);
            console.log('✅ Imagem processada:', info);
            
            return imagemComprimida;

        } catch (e) {
            console.error('❌ Erro ao processar imagem:', e);
            throw e;
        }
    }

    /**
     * Validar se é uma imagem válida
     * @param {string} base64Data
     * @returns {boolean}
     */
    function validarImagem(base64Data) {
        if (!base64Data || !base64Data.startsWith('data:image')) {
            return false;
        }
        
        // Tentar decodificar
        try {
            atob(base64Data.split(',')[1]);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Comparar dois base64 e retornar o menor
     * @param {string} imagem1
     * @param {string} imagem2
     * @returns {string} O menor base64
     */
    function compararTamanho(imagem1, imagem2) {
        if (!imagem1) return imagem2;
        if (!imagem2) return imagem1;
        
        const tam1 = imagem1.length;
        const tam2 = imagem2.length;
        
        console.log(`📊 Comparação: ${(tam1/1024).toFixed(2)}KB vs ${(tam2/1024).toFixed(2)}KB`);
        return tam1 <= tam2 ? imagem1 : imagem2;
    }

    return {
        comprimirImagem,
        obterInfoImagem,
        procesarImagem,
        validarImagem,
        compararTamanho
    };
})();

console.log('✅ ImagemOtimizacao carregado');
