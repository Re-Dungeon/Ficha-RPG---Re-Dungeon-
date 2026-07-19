/**
 * UTILITÁRIO DE IMAGENS - SISTEMA DE RAÇAS
 * Gerencia e converte imagens para diferentes formatos
 */

const IMAGENS_RACAS_SVG = {
  humano: `data:image/svg+xml,%3Csvg width='400' height='500' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='500' fill='%231a1f2e'/%3E%3Cellipse cx='200' cy='300' rx='70' ry='90' fill='%23C9A876'/%3E%3Ccircle cx='200' cy='120' r='48' fill='%23DCC9B6'/%3E%3Ccircle cx='182' cy='110' r='6' fill='%23333333'/%3E%3Ccircle cx='218' cy='110' r='6' fill='%23333333'/%3E%3Ctext x='200' y='470' font-size='20' fill='%23a78bfa' text-anchor='middle' font-weight='bold'%3EHumano%3C/text%3E%3C/svg%3E`,
  
  animanos: `data:image/svg+xml,%3Csvg width='400' height='500' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='500' fill='%231a1f2e'/%3E%3Cellipse cx='200' cy='300' rx='75' ry='90' fill='%238B6F47'/%3E%3Ccircle cx='200' cy='120' r='50' fill='%23D2B48C'/%3E%3Cpolygon points='160,80 140,40 150,90' fill='%238B6F47'/%3E%3Cpolygon points='240,80 260,40 250,90' fill='%238B6F47'/%3E%3Ccircle cx='182' cy='110' r='6' fill='%238B7355'/%3E%3Ccircle cx='218' cy='110' r='6' fill='%238B7355'/%3E%3Cpath d='M 200 320 Q 190 360 185 400' stroke='%238B6F47' stroke-width='8' fill='none'/%3E%3Ctext x='200' y='470' font-size='20' fill='%23daa520' text-anchor='middle' font-weight='bold'%3EAnimanos%3C/text%3E%3C/svg%3E`,
  
  mestico: `data:image/svg+xml,%3Csvg width='400' height='500' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='500' fill='%231a1f2e'/%3E%3Cellipse cx='200' cy='300' rx='72' ry='90' fill='%23B89968'/%3E%3Ccircle cx='200' cy='120' r='48' fill='%23D4A574'/%3E%3Ccircle cx='182' cy='110' r='6' fill='%23654321'/%3E%3Ccircle cx='218' cy='110' r='6' fill='%23654321'/%3E%3Crect x='150' y='250' width='100' height='80' fill='%23A68060' opacity='0.6'/%3E%3Ccircle cx='170' cy='270' r='15' fill='%237c6ba8' opacity='0.4'/%3E%3Ccircle cx='230' cy='310' r='15' fill='%2310b981' opacity='0.4'/%3E%3Ctext x='200' y='470' font-size='20' fill='%23cd7f32' text-anchor='middle' font-weight='bold'%3EMesti%C3%A7o%3C/text%3E%3C/svg%3E`
};

/**
 * Atualiza todos os caminhos de imagem no banco de dados
 * com as imagens SVG base64 (apenas se não tiverem URL externa)
 */
function atualizarImagensSVG() {
  RACAS_DATABASE.forEach(raca => {
    // Não sobrescreve imagens que já têm URL do imgur ou https
    if (IMAGENS_RACAS_SVG[raca.id] && !raca.imagem.includes('imgur') && !raca.imagem.includes('http')) {
      raca.imagem = IMAGENS_RACAS_SVG[raca.id];
    }
  });
  console.log('✅ Imagens atualizadas no banco de dados');
}

/**
 * Adicionar imagem customizada para uma raça
 * @param {string} racaId - ID da raça
 * @param {string} imagemSrc - Caminho ou data URL da imagem
 */
function definirImagemRaca(racaId, imagemSrc) {
  const raca = obterRacaPorId(racaId);
  if (raca) {
    raca.imagem = imagemSrc;
    if (racasUI && racasUI.racaAtiva === racaId) {
      racasUI.renderDetalhes(raca);
    }
    console.log(`✅ Imagem atualizada para ${raca.nome}`);
  } else {
    console.error(`❌ Raça ${racaId} não encontrada`);
  }
}

/**
 * Converter arquivo local para data URL
 * @param {File} arquivo - Arquivo de imagem
 * @param {string} racaId - ID da raça
 */
function carregarImagemDoArquivo(arquivo, racaId) {
  const leitor = new FileReader();
  leitor.onload = (evento) => {
    const dataUrl = evento.target.result;
    definirImagemRaca(racaId, dataUrl);
  };
  leitor.readAsDataURL(arquivo);
}

/**
 * Chamar automaticamente ao carregar
 */
if (typeof RACAS_DATABASE !== 'undefined') {
  atualizarImagensSVG();
}
