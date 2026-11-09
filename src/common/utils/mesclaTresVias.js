// Mescla em três vias de um patch da ficha sobre o documento mais novo.
//
// As abas montam o patch a partir do `personagem` que têm na tela (`base`) —
// muitas vezes o objeto inteiro (`status`, `estadoCombate`). Se outra coisa
// mudou o documento nesse meio-tempo (ex.: o PV alterado pelo token no grid,
// ou outra aba/aparelho), gravar o objeto inteiro desfaria essa mudança.
//
// Regra, folha a folha (objetos simples são percorridos; arrays e valores
// primitivos são atômicos):
// - o patch tem o mesmo valor da base → o usuário não mexeu: fica o `atual`
//   (o valor mais novo do Firestore), se existir;
// - o patch difere da base → o usuário mudou: vale o patch.
// Sem `base`, devolve o patch como veio (comportamento antigo).

const ehObjetoSimples = valor =>
  valor !== null &&
  typeof valor === 'object' &&
  !Array.isArray(valor) &&
  Object.getPrototypeOf(valor) === Object.prototype;

export const valoresIguais = (a, b) => {
  if (Object.is(a, b)) return true;
  // Timestamps do Firestore e afins: compara pelo valor em ms quando der.
  if (a && b && typeof a.toMillis === 'function' && typeof b.toMillis === 'function') {
    return a.toMillis() === b.toMillis();
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, indice) => valoresIguais(item, b[indice]));
  }
  if (ehObjetoSimples(a) && ehObjetoSimples(b)) {
    const chavesA = Object.keys(a);
    const chavesB = Object.keys(b);
    return (
      chavesA.length === chavesB.length &&
      chavesA.every(chave => Object.hasOwn(b, chave) && valoresIguais(a[chave], b[chave]))
    );
  }
  return false;
};

const mesclarValor = (base, patch, atual) => {
  if (ehObjetoSimples(patch) && ehObjetoSimples(atual) && ehObjetoSimples(base)) {
    const resultado = { ...atual };
    Object.keys(patch).forEach(chave => {
      resultado[chave] = mesclarValor(base[chave], patch[chave], atual[chave]);
    });
    return resultado;
  }
  if (valoresIguais(patch, base) && atual !== undefined) return atual;
  return patch;
};

// Devolve o patch a gravar (só as chaves de `patch`, já mescladas).
export const mesclarTresVias = (base, patch, atual) => {
  if (!patch || typeof patch !== 'object') return patch;
  if (!ehObjetoSimples(base)) return patch;
  const doc = ehObjetoSimples(atual) ? atual : {};
  return Object.fromEntries(
    Object.keys(patch).map(chave => [chave, mesclarValor(base[chave], patch[chave], doc[chave])]),
  );
};
