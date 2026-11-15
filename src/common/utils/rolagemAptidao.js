import { FACES_PERMITIDAS, randomUint32, rolarFace } from 'common/utils/dados';
import { preparar } from 'common/utils/gridRolagem';

// Rolagem de Aptidão (aba Aptidões da ficha) — SÓ no site dos jogadores.
// 1d6 + bônus da aptidão; com Sorte, +1d6; mais o bônus/obstáculo que o mestre
// der na hora ("1d4+5-7", "-1d6", "2"). Funções puras: `interpretarModificador`
// valida o campo do mestre, `previaRolagemAptidao` monta o texto mostrado antes
// de rolar e `montarRolagemAptidao` gera a expressão + o rótulo do chat.
//
// A mensagem de rolagem do chat (e a regra do Firestore) não aceita dado
// subtraído: um "-1d6" do mestre é rolado aqui, no envio, e entra como número
// negativo — o valor sorteado aparece no rótulo ("mestre -1d6[4]").

export const MOD_MAX_VALOR = 99;
export const MOD_MAX_DADOS = 10;
export const ROTULO_MAX = 100;

const TERMO = /([+-]?)(?:(\d*)d(\d+)|(\d+))/iy;

// Texto do mestre → { termos: [{sinal, quantidade, faces} | {sinal, valor}],
// texto: "+1d4+5-7" } ou { erro }. Vazio = sem modificador.
export const interpretarModificador = entrada => {
  const expressao = String(entrada ?? '').replace(/\s+/g, '').toLowerCase();
  if (!expressao) return { termos: [], texto: '' };

  const termos = [];
  TERMO.lastIndex = 0;
  while (TERMO.lastIndex < expressao.length) {
    const inicio = TERMO.lastIndex;
    const match = TERMO.exec(expressao);
    if (!match) return { erro: `Não entendi "${expressao.slice(inicio)}". Ex.: 1d4+5-7` };
    const [, sinalTexto, quantidadeTexto, faces, numero] = match;
    if (inicio > 0 && !sinalTexto) return { erro: `Falta + ou - antes de "${match[0]}".` };
    const sinal = sinalTexto === '-' ? -1 : 1;
    if (faces) {
      const quantidade = quantidadeTexto ? Number(quantidadeTexto) : 1;
      if (!FACES_PERMITIDAS.includes(Number(faces))) {
        return { erro: `Dados permitidos: ${FACES_PERMITIDAS.map(f => `d${f}`).join(', ')}.` };
      }
      if (quantidade < 1) return { erro: 'A quantidade de cada dado deve ser ao menos 1.' };
      termos.push({ sinal, quantidade, faces: Number(faces) });
    } else {
      const valor = Number(numero);
      if (valor > MOD_MAX_VALOR) return { erro: `Cada número vai até ${MOD_MAX_VALOR}.` };
      termos.push({ sinal, valor });
    }
  }

  const totalDados = termos.reduce((soma, termo) => soma + (termo.quantidade ?? 0), 0);
  if (totalDados > MOD_MAX_DADOS) return { erro: `No máximo ${MOD_MAX_DADOS} dados no bônus/obstáculo.` };

  return { termos, texto: termos.map(textoDoTermo).join('') };
};

const textoDoTermo = termo => {
  const sinal = termo.sinal < 0 ? '-' : '+';
  return termo.faces ? `${sinal}${termo.quantidade}d${termo.faces}` : `${sinal}${termo.valor}`;
};

const baseDaRolagem = ({ bonus, sorte }) =>
  `1d6${sorte ? '+1d6' : ''}${bonus > 0 ? `+${bonus}` : ''}`;

const montarRotulo = (nome, extras) => {
  const sufixo = extras.length ? ` (${extras.join(', ')})` : '';
  const prefixo = 'Aptidão: ';
  const espaco = ROTULO_MAX - prefixo.length - sufixo.length;
  let nomeLimpo = String(nome ?? '').trim() || 'Aptidão';
  if (nomeLimpo.length > espaco) nomeLimpo = `${nomeLimpo.slice(0, Math.max(espaco - 1, 1))}…`;
  return `${prefixo}${nomeLimpo}${sufixo}`.slice(0, ROTULO_MAX);
};

// → { expressao, rotulo } pronta para o `rolar` do useRolarDaFicha, ou { erro }.
// Dados negativos do mestre são rolados aqui (`randomFn` injetável em teste).
export const montarRolagemAptidao = (
  { nome, bonus = 0, sorte = false, modificador = '' },
  randomFn = randomUint32,
) => {
  const mod = interpretarModificador(modificador);
  if (mod.erro) return { erro: mod.erro };

  let expressao = baseDaRolagem({ bonus, sorte });
  const textoMestre = mod.termos
    .map(termo => {
      if (termo.faces && termo.sinal < 0) {
        const resultados = Array.from({ length: termo.quantidade }, () =>
          rolarFace(termo.faces, randomFn),
        );
        const soma = resultados.reduce((total, valor) => total + valor, 0);
        expressao += `-${soma}`;
        return `-${termo.quantidade}d${termo.faces}[${resultados.join(',')}]`;
      }
      expressao += textoDoTermo(termo);
      return textoDoTermo(termo);
    })
    .join('');

  const preparada = preparar(expressao);
  if (preparada.erro) return { erro: preparada.erro };

  const extras = [];
  if (sorte) extras.push('🍀 Sorte');
  if (textoMestre) extras.push(`mestre ${textoMestre}`);
  return { expressao, rotulo: montarRotulo(nome, extras) };
};

// Texto mostrado antes de rolar: "1d6+1d6+3+1d4-1d6-2" (ou { erro }).
// Valida como no envio (limites de grupos/termos do chat), sem sortear nada.
export const previaRolagemAptidao = ({ bonus = 0, sorte = false, modificador = '' }) => {
  const mod = interpretarModificador(modificador);
  if (mod.erro) return { erro: mod.erro };
  const teste = montarRolagemAptidao({ bonus, sorte, modificador }, () => 0);
  if (teste.erro) return { erro: teste.erro };
  return { expressao: `${baseDaRolagem({ bonus, sorte })}${mod.texto}` };
};
