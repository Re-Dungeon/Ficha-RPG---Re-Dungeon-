/**
 * 🏆 GUIA DE USO RÁPIDO - REPUTAÇÃO V2
 * 
 * Como usar, entender e expandir o sistema
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣ ACESSAR O SISTEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// O sistema está disponível globalmente:
window.reputacaoV2  // ← novo sistema dual-axis
window.reputacaoModal  // ← sistema antigo (ainda funciona)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2️⃣ ABRIR O MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Opção A: Clicar no botão (automaticamente)
// documento tem um #reputacao-btn que abre o modal

// Opção B: Por código
window.reputacaoV2.abrir();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3️⃣ ENTENDER OS DADOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Estrutura dual-axis (nova):
// {
//   mundo: {
//     fama: 0-100,       // ⭐ Reconhecimento positivo
//     temor: 0-100       // ☠️ Medo inspirado
//   },
//   regiao: {
//     fama: 0-100,       // ⭐ Reconhecimento local
//     temor: 0-100       // ☠️ Medo local
//   }
// }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4️⃣ LER DADOS ATUAIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 4️⃣ LER DADOS ATUAIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// const statusAtual = window.reputacaoV2.getStatus();

// console.log(statusAtual);
// {
//   mundo: {
//     fama: 50,
//     temor: 30,
//     status: { nome: '✨ Herói', classe: 'heroi', ... }
//   },
//   regiao: {
//     fama: 40,
//     temor: 20,
//     status: { nome: '⚖️ Neutro', classe: 'neutro', ... }
//   }
// }

// Acessar valores individuais:
// const famaGlobal = window.reputacaoV2.dados.mundo.fama;  // 50
// const temorGlobal = window.reputacaoV2.dados.mundo.temor;  // 30

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5️⃣ MODIFICAR DADOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Aumentar fama global
window.reputacaoV2.dados.mundo.fama = 75;
window.reputacaoV2.atualizarVisao();  // 🔄 Atualizar UI

// Aumentar temor local
window.reputacaoV2.dados.regiao.temor = 60;
window.reputacaoV2.atualizarVisao();  // 🔄 Atualizar UI

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6️⃣ SALVAR DADOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.reputacaoV2.salvar();

// Dados são salvos em:
// ✓ window.appState (StateManager)
// ✓ localStorage (persistente)
// ✓ arquivos JSON (sistema de salvar/importar)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7️⃣ FECHAR O MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.reputacaoV2.fechar();

// 8️⃣ CALCULAR STATUS (Herói/Tirano/etc)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// O status é calculado automaticamente baseado em fama vs temor:

// ✨ HERÓI (fama alta, temor baixo)
// let statusHeroi = window.reputacaoV2.calcularStatusAtual(75, 20);
// { nome: '✨ Herói', classe: 'heroi', descricao: 'Ídolo do povo' }

// 👿 TIRANO (temor alto, fama baixa)
// let statusTirano = window.reputacaoV2.calcularStatusAtual(20, 75);
// { nome: '👿 Tirano', classe: 'tirano', descricao: 'Encarnação do poder brutal' }

// 🌑 LENDA AMBÍGUA (ambos altos)
// let statusAmbiguo = window.reputacaoV2.calcularStatusAtual(80, 70);
// { nome: '🌑 Lenda Ambígua', classe: 'ambiguo', descricao: 'Você é simultaneamente amado e temido' }

// 👤 DESCONHECIDO (ambos baixos)
// let statusDesconhecido = window.reputacaoV2.calcularStatusAtual(10, 5);
// { nome: '👤 Desconhecido', classe: 'desconhecido', descricao: 'Ninguém sabe quem você é' }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9️⃣ OBTER NÍVEIS DESCRITIVOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Obter descrição para um valor de fama
// let nivelFama = window.reputacaoV2.obterNivel(75, 'fama');
// { range: [61, 75], titulo: '💫 Lendário', desc: 'Histórias sobre você se espalham' }

// Obter descrição para um valor de temor
// let nivelTemor = window.reputacaoV2.obterNivel(50, 'temor');
// { range: [46, 60], titulo: '😱 Aterrorizante', desc: 'Seu nome causa arrepios' }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔟 EFEITOS PASSIVOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Obter efeitos ativos para um valor
// let efeitosAtivos = window.reputacaoV2.calcularEfeitos(75, 'fama');
// console.log(efeitosAtivos);
// [
//   '💰 +5% desconto em lojas',
//   '🤝 NPCs mais amigáveis',
//   '💳 +10% desconto em lojas',
//   '🎁 Acesso a lojas exclusivas',
//   '⚔️ Aliados podem se oferecer para ajudar',
//   '💎 +15% desconto em lojas',
//   '🏰 Acesso a áreas nobres',
//   '👥 +10% XP de interações sociais',
//   '👑 +20% desconto em lojas',
//   '🎭 NPCs organizam eventos',
//   '🌟 Reconhecimento automático'
// ]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣1️⃣ DEBUG & TESTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Ver estado completo no console
window.reputacaoV2.debug();

// Isto abre um group mostrando:
// - Dados atuais
// - Dados de origem
// - Status mundo
// - Status região

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣2️⃣ EXEMPLOS PRÁTICOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// CENÁRIO 1: Aumentar fama do personagem após vitória
function vitoriaBatalha() {
  window.reputacaoV2.dados.mundo.fama = Math.min(
    window.reputacaoV2.dados.mundo.fama + 10,
    100
  );
  window.reputacaoV2.atualizarVisao();
  window.reputacaoV2.salvar();
}

// CENÁRIO 2: Aumentar temor após ato brutal
function atosBrutais() {
  window.reputacaoV2.dados.mundo.temor = Math.min(
    window.reputacaoV2.dados.mundo.temor + 15,
    100
  );
  window.reputacaoV2.atualizarVisao();
  window.reputacaoV2.salvar();
}

// CENÁRIO 3: Resetar reputação local ao viajar para nova região
function viajarParaNovaRegiao() {
  window.reputacaoV2.dados.regiao.fama = 0;
  window.reputacaoV2.dados.regiao.temor = 0;
  window.reputacaoV2.atualizarVisao();
  window.reputacaoV2.salvar();
}

// CENÁRIO 4: Ganhar evento automático ao atingir status herói
function verificarEventosDeStatus() {
  const status = window.reputacaoV2.getStatus();
  
  if (status.mundo.status.classe === 'heroi' && status.mundo.status.descricao) {
    console.log('🎉 Você virou um Herói! NPCs respeitam você agora.');
  }
  
  if (status.mundo.status.classe === 'tirano') {
    console.log('⚠️ Você é temido! Inimigos podem fugir.');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣3️⃣ COMPATIBILIDADE COM SISTEMA ANTIGO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// O sistema antigo ainda funciona:
window.reputacaoModal.getStatus();  // Funciona normalmente

// Dados antigos (formato simples) são convertidos automaticamente:
// { mundo: 30, regiao: 20 }  →  { mundo: { fama: 30, temor: 0 }, regiao: { fama: 20, temor: 0 } }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣4️⃣ CUSTOMIZAR EFEITOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Para adicionar/remover efeitos, edite window.reputacaoV2.efeitosPassivos:

window.reputacaoV2.efeitosPassivos.fama[100] = [
  '👑 Você é rei/rainha',
  '🏰 Acesso total ao reino'
];

window.reputacaoV2.atualizarEfeitos();  // Regenerar display

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣5️⃣ ESTRUTURA DE CLASSES/ARQUÉTIPOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
HERÓI (classe: 'heroi')
- Fama > 40
- Temor < Fama
- Aura: Dourada
- Efeitos: +Positivos sociais

TIRANO (classe: 'tirano')
- Temor > 40
- Temor > Fama
- Aura: Sombria
- Efeitos: +Intimidação e combate

LENDA AMBÍGUA (classe: 'ambiguo')
- Fama >= 40 && Temor >= 40
- Aura: Mista (roxo/dourado)
- Efeitos: Herói + Tirano combinados

DESCONHECIDO (classe: 'desconhecido')
- Fama < 30 && Temor < 30
- Aura: Neutra
- Efeitos: Nenhum especial

NEUTRO (classe: 'neutro')
- Todos os outros casos
- Aura: Azul
- Efeitos: Leves
*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎓 RESUMO RÁPIDO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
✅ Abrir:        window.reputacaoV2.abrir()
✅ Fechar:       window.reputacaoV2.fechar()
✅ Ler dados:    window.reputacaoV2.getStatus()
✅ Modificar:    window.reputacaoV2.dados.mundo.fama = 75
✅ Atualizar:    window.reputacaoV2.atualizarVisao()
✅ Salvar:       window.reputacaoV2.salvar()
✅ Debug:        window.reputacaoV2.debug()

🏆 Sistema dual-axis: ⭐ Fama vs ☠️ Temor
🎭 5 status possíveis: Herói, Tirano, Lenda Ambígua, Desconhecido, Neutro
🎁 Efeitos passivos dinâmicos baseados em limiar
🔄 100% compatível com sistema antigo
*/
