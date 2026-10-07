import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SavingProvider } from 'context/SavingContext';
import LojaTrapacaSection from './LojaTrapacaSection';
import { getBeneficiosPorUniverso, getEfeitosGuardados, getUniverso, setEfeitoGuardado } from 'service/storage';

vi.mock('service/storage', () => ({
  getBeneficiosPorUniverso: vi.fn(),
  getEfeitosGuardados: vi.fn(),
  getUniverso: vi.fn(),
  addHistoricoSorte: vi.fn(),
  setEfeitoGuardado: vi.fn(),
  removeEfeitoGuardado: vi.fn(),
}));

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  sorte: { fortunaAtual: 42 },
  lojaTrapaça: { efeitosAtivos: [] },
};

describe('LojaTrapacaSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUniverso.mockResolvedValue([{ id: 'universo-1', Nome: 'Re-Dungeon' }]);
    getEfeitosGuardados.mockResolvedValue([]);
  });

  it('mantém benefício inativo visível e bloqueado quando o status é false', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'benedicao-inativa',
        nome: 'Abençoado pelos Céus',
        categoria: 'Bênçãos Únicas',
        tag: 'Divino',
        tipoBonus: 'Bônus',
        descricao: 'Benefício reservado para cenário especial.',
        bonus: '+1 em testes',
        custo: 7,
        tokens: ['Divino'],
        ativo: false,
        acumulavel: false,
        limiteAcumulo: 0,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);

    const onSave = vi.fn().mockResolvedValue();

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    expect(await screen.findByText(/abençoado pelos céus/i)).toBeInTheDocument();
    expect(screen.getAllByText(/inativo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/desativado/i).length).toBeGreaterThan(0);

    const botao = screen.getByRole('button', { name: /desativado/i });
    expect(botao).toBeDisabled();

    fireEvent.click(botao);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('mantém benefício inativo visível quando filtrado pela categoria correspondente', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'benedicao-inativa',
        nome: 'Abençoado pelos Céus',
        categoria: 'Bênçãos Únicas',
        tag: 'Divino',
        tipoBonus: 'Bônus',
        descricao: 'Benefício reservado para cenário especial.',
        bonus: '+1 em testes',
        custo: 7,
        tokens: ['Divino'],
        ativo: false,
        acumulavel: false,
        limiteAcumulo: 0,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={vi.fn().mockResolvedValue()} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /bênçãos únicas/i }));
    expect(screen.getByText(/abençoado pelos céus/i)).toBeInTheDocument();
    expect(screen.getAllByText(/desativado/i).length).toBeGreaterThan(0);
  });

  it('remove o overlay quando o benefício reativa no próximo carregamento', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'benedicao-reativada',
        nome: 'Abençoado pelos Céus',
        categoria: 'Bênçãos Únicas',
        tag: 'Divino',
        tipoBonus: 'Bônus',
        descricao: 'Benefício reativado no admin.',
        bonus: '+1 em testes',
        custo: 7,
        tokens: ['Divino'],
        ativo: false,
        acumulavel: false,
        limiteAcumulo: 0,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);

    const { rerender } = render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={vi.fn().mockResolvedValue()} />
      </SavingProvider>,
    );

    expect((await screen.findAllByText(/desativado/i)).length).toBeGreaterThan(0);

    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'benedicao-reativada',
        nome: 'Abençoado pelos Céus',
        categoria: 'Bênçãos Únicas',
        tag: 'Divino',
        tipoBonus: 'Bônus',
        descricao: 'Benefício reativado no admin.',
        bonus: '+1 em testes',
        custo: 7,
        tokens: ['Divino'],
        ativo: true,
        acumulavel: false,
        limiteAcumulo: 0,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-2'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);

    rerender(
      <SavingProvider>
        <LojaTrapacaSection personagem={{ ...personagem, universo: 'universo-2' }} onSave={vi.fn().mockResolvedValue()} />
      </SavingProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText(/desativado/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /comprar/i })).toBeEnabled();
    });
  });

  it('não cria efeito guardado para benefício imediato sem regras de uso', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'encontro-favoravel',
        nome: 'Encontro Favorável',
        categoria: 'Benefícios Menores',
        tag: 'Narrativo',
        tipoBonus: 'Vantagem',
        descricao: 'Rola 1d4 para reduzir obstáculo.',
        bonus: 'Reduz obstáculo em interação social.',
        custo: 3,
        tokens: ['Narrativo', 'Imediato'],
        ativo: true,
        acumulavel: false,
        limiteAcumulo: 0,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'imediata',
      },
    ]);

    const onSave = vi.fn().mockResolvedValue();

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /comprar/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          sorte: expect.objectContaining({ fortunaAtual: 39 }),
        }),
      );
    });

    expect(setEfeitoGuardado).not.toHaveBeenCalled();
  });

  it('ignora resposta antiga de getEfeitosGuardados quando uma carga mais recente chega depois', async () => {
    const respostas = [];
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'encontro-favoravel',
        nome: 'Encontro Favorável',
        categoria: 'Benefícios Menores',
        tag: 'Narrativo',
        tipoBonus: 'Vantagem',
        descricao: 'Rola 1d4 para reduzir obstáculo.',
        bonus: 'Reduz obstáculo em interação social.',
        custo: 3,
        tokens: ['Narrativo', 'Imediato'],
        ativo: true,
        acumulavel: false,
        limiteAcumulo: 0,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'imediata',
      },
    ]);

    getEfeitosGuardados.mockImplementation(personagemId => new Promise(resolve => {
      respostas.push({ personagemId, resolve });
    }));

    const onSave = vi.fn().mockResolvedValue();
    const { rerender } = render(
      <SavingProvider>
        <LojaTrapacaSection aba="guardados" personagem={{ ...personagem, id: 'p1' }} onSave={onSave} />
      </SavingProvider>,
    );

    rerender(
      <SavingProvider>
        <LojaTrapacaSection aba="guardados" personagem={{ ...personagem, id: 'p2' }} onSave={onSave} />
      </SavingProvider>,
    );

    const respostaAntiga = respostas.find(item => item.personagemId === 'p1');
    const respostaNova = respostas.find(item => item.personagemId === 'p2');

    expect(respostaAntiga).toBeDefined();
    expect(respostaNova).toBeDefined();

    respostaNova.resolve([]);
    await waitFor(() => {
      expect(screen.getByText(/0 efeitos guardados/i)).toBeInTheDocument();
    });

    respostaAntiga.resolve([
      {
        beneficioId: 'encontro-favoravel',
        nome: 'Encontro Favorável',
        categoria: 'Benefícios Menores',
        quantidade: 1,
      },
    ]);

    await waitFor(() => {
      expect(screen.getByText(/0 efeitos guardados/i)).toBeInTheDocument();
    });
  });

  it('guarda benefício acumulável mesmo sem limite por período', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-acumulavel',
        nome: 'Benefício Acumulável',
        categoria: 'Vantagens Táticas',
        tag: 'Mecânico',
        tipoBonus: 'Vantagem',
        descricao: 'Benefício com acúmulo explícito.',
        bonus: '+1 vantagem',
        custo: 4,
        tokens: ['Mecânico'],
        ativo: true,
        acumulavel: true,
        limiteAcumulo: 3,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);

    const onSave = vi.fn().mockResolvedValue();
    const StatefulHarness = () => {
      const [localPersonagem, setLocalPersonagem] = React.useState({
        ...personagem,
        sorte: { fortunaAtual: 42 },
      });

      return (
        <SavingProvider>
          <LojaTrapacaSection
            personagem={localPersonagem}
            onSave={patch => {
              onSave(patch);
              setLocalPersonagem(prev => ({
                ...prev,
                ...patch,
                sorte: { ...prev.sorte, ...(patch.sorte ?? {}) },
                lojaTrapaça: { ...prev.lojaTrapaça, ...(patch.lojaTrapaça ?? {}) },
              }));
              return Promise.resolve();
            }}
          />
        </SavingProvider>
      );
    };

    render(<StatefulHarness />);

    fireEvent.click(await screen.findByRole('button', { name: /comprar/i }));
    await waitFor(() => expect(setEfeitoGuardado).toHaveBeenCalledWith(
      'p1',
      'beneficio-acumulavel',
      expect.objectContaining({
        beneficioId: 'beneficio-acumulavel',
        nome: 'Benefício Acumulável',
        quantidade: 1,
      }),
    ));

    await new Promise(resolve => setTimeout(resolve, 1100));
    await new Promise(resolve => setTimeout(resolve, 1100));
    fireEvent.click(screen.getByRole('button', { name: /comprar/i }));

    await waitFor(() => {
      expect(setEfeitoGuardado).toHaveBeenLastCalledWith(
        'p1',
        'beneficio-acumulavel',
        expect.objectContaining({ quantidade: 2 }),
      );
    });
  });

  it('guarda benefício com limite por período mesmo quando não é acumulável', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-por-sessao',
        nome: 'Benefício por Sessão',
        categoria: 'Vantagens Táticas',
        tag: 'Mecânico',
        tipoBonus: 'Vantagem',
        descricao: 'Controle de uso por sessão.',
        bonus: '+1 em uma rolagem',
        custo: 6,
        tokens: ['Mecânico'],
        ativo: true,
        acumulavel: false,
        limiteAcumulo: 0,
        limitePeriodo: 1,
        periodo: 'Sessão',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);

    const onSave = vi.fn().mockResolvedValue();

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /comprar/i }));

    await waitFor(() => {
      expect(setEfeitoGuardado).toHaveBeenCalledWith(
        'p1',
        'beneficio-por-sessao',
        expect.objectContaining({
          beneficioId: 'beneficio-por-sessao',
          quantidade: 1,
          usosPeriodo: 0,
        }),
      );
    });
  });

  it('respeita limite de acúmulo em benefício guardável com limite por período', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-limite',
        nome: 'Benefício com Limite',
        categoria: 'Benefícios Menores',
        tag: 'Mecânico',
        tipoBonus: 'Vantagem',
        descricao: 'Controle de acúmulo e uso por sessão.',
        bonus: '+1 em uma rolagem',
        custo: 4,
        tokens: ['Mecânico'],
        ativo: true,
        acumulavel: true,
        limiteAcumulo: 3,
        limitePeriodo: 1,
        periodo: 'Sessão',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);

    const onSave = vi.fn().mockResolvedValue();
    const StatefulHarness = () => {
      const [localPersonagem, setLocalPersonagem] = React.useState({
        ...personagem,
        sorte: { fortunaAtual: 42 },
      });

      return (
        <SavingProvider>
          <LojaTrapacaSection
            personagem={localPersonagem}
            onSave={patch => {
              onSave(patch);
              setLocalPersonagem(prev => ({
                ...prev,
                ...patch,
                sorte: { ...prev.sorte, ...(patch.sorte ?? {}) },
                lojaTrapaça: { ...prev.lojaTrapaça, ...(patch.lojaTrapaça ?? {}) },
              }));
              return Promise.resolve();
            }}
          />
        </SavingProvider>
      );
    };

    render(<StatefulHarness />);

    for (let index = 0; index < 3; index += 1) {
      const botaoComprar = await screen.findByRole('button', { name: /comprar/i });
      fireEvent.click(botaoComprar);
      await waitFor(() => expect(setEfeitoGuardado).toHaveBeenCalledTimes(index + 1));
      if (index < 2) {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }
    }

    expect(setEfeitoGuardado).toHaveBeenCalledTimes(3);
  });

  it('respeita limite de acúmulo e uso por sessão do benefício acumulável', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'encontro-favoravel',
        nome: 'Encontro Favorável',
        categoria: 'Benefícios Menores',
        tag: 'Narrativo',
        tipoBonus: 'Vantagem',
        descricao: 'Rola 1d4 para reduzir obstáculo.',
        bonus: 'Reduz obstáculo em interação social.',
        custo: 3,
        tokens: ['Narrativo', 'Imediato'],
        ativo: true,
        acumulavel: true,
        limiteAcumulo: 3,
        limitePeriodo: 1,
        periodo: 'Sessão',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'imediata',
      },
    ]);

    const onSave = vi.fn().mockResolvedValue();

    const StatefulHarness = () => {
      const [localPersonagem, setLocalPersonagem] = React.useState({
        ...personagem,
        sorte: { fortunaAtual: 42 },
        lojaTrapaça: {
          efeitosAtivos: [{
            beneficioId: 'encontro-favoravel',
            nome: 'Encontro Favorável',
            categoria: 'Benefícios Menores',
            quantidade: 2,
            usosPeriodo: 0,
            referenciaPeriodo: null,
            adquiridoEm: new Date().toISOString(),
          }],
        },
      });

      return (
        <SavingProvider>
          <LojaTrapacaSection
            personagem={localPersonagem}
            onSave={patch => {
              onSave(patch);
              setLocalPersonagem(prev => ({
                ...prev,
                ...patch,
                sorte: { ...prev.sorte, ...(patch.sorte ?? {}) },
                lojaTrapaça: { ...prev.lojaTrapaça, ...(patch.lojaTrapaça ?? {}) },
              }));
              return Promise.resolve();
            }}
          />
        </SavingProvider>
      );
    };

    render(<StatefulHarness />);

    const comprarButton = await screen.findByRole('button', { name: /^comprar$/i });
    fireEvent.click(comprarButton);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    await new Promise(resolve => setTimeout(resolve, 1100));
    const botaoSegundaCompra = screen.queryByRole('button', { name: /^comprar$/i });
    if (botaoSegundaCompra) {
      fireEvent.click(botaoSegundaCompra);
      await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    }

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('ignora benefício legado que não exige armazenamento/controlar no painel de guardados', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-nao-acumulavel',
        nome: 'Ajuste de Destino',
        categoria: 'Vantagens Táticas',
        tag: 'Mecânico',
        tipoBonus: 'Vantagem',
        descricao: 'Concede um ajuste em uma rolagem.',
        bonus: '+/-2 em resultado de dado',
        custo: 8,
        tokens: ['Mecânico', 'Armazenável'],
        ativo: true,
        acumulavel: false,
        limiteAcumulo: null,
        limitePeriodo: null,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);
    getEfeitosGuardados.mockResolvedValue([
      { beneficioId: 'beneficio-nao-acumulavel', nome: 'Ajuste de Destino', categoria: 'Vantagens Táticas', quantidade: 1, usosPeriodo: 0, referenciaPeriodo: 'sessao:2026-01-01' },
    ]);

    const onSave = vi.fn().mockResolvedValue();

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={onSave} aba="guardados" />
      </SavingProvider>,
    );

    await waitFor(() => expect(screen.getByText(/0 efeitos guardados/i)).toBeInTheDocument());
    expect(screen.getByText(/Nenhum efeito guardado\./i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('remove o efeito guardado quando a quantidade chega a zero', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-unico',
        nome: 'Benefício Único',
        categoria: 'Vantagens Táticas',
        tag: 'Mecânico',
        tipoBonus: 'Vantagem',
        descricao: 'Controle de uso por sessão.',
        bonus: '+1 em uma rolagem',
        custo: 4,
        tokens: ['Mecânico'],
        ativo: true,
        acumulavel: true,
        limiteAcumulo: 1,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);
    getEfeitosGuardados.mockResolvedValue([
      { beneficioId: 'beneficio-unico', nome: 'Benefício Único', categoria: 'Vantagens Táticas', quantidade: 1, usosPeriodo: 0, referenciaPeriodo: 'sessao:2026-01-01' },
    ]);

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={vi.fn()} aba="guardados" />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /^usar$/i }));
    await waitFor(() => expect(screen.getByText(/Nenhum efeito guardado\./i)).toBeInTheDocument());
  });

  it('carrega efeitos guardados ao reiniciar a página', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-persistido',
        nome: 'Pressentimento Persistido',
        categoria: 'Vantagens Táticas',
        tag: 'Mecânico',
        tipoBonus: 'Vantagem',
        descricao: 'Efeito persistido válido.',
        bonus: '+1 em uma rolagem',
        custo: 5,
        tokens: ['Mecânico'],
        ativo: true,
        acumulavel: true,
        limiteAcumulo: 2,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);
    getEfeitosGuardados.mockResolvedValue([
      { beneficioId: 'beneficio-persistido', nome: 'Pressentimento Persistido', categoria: 'Vantagens Táticas', quantidade: 2, usosPeriodo: 0, referenciaPeriodo: 'sessao:2026-01-01' },
    ]);

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={vi.fn()} aba="guardados" />
      </SavingProvider>,
    );

    expect(await screen.findByText('Pressentimento Persistido')).toBeInTheDocument();
    expect(screen.getByText('x2')).toBeInTheDocument();
  });

  it('mantém uso ilimitado quando o benefício não define limite por período', async () => {
    getEfeitosGuardados.mockResolvedValue([
      { beneficioId: 'beneficio-ilimitado', nome: 'Fofoca do Dia', categoria: 'Benefícios Menores', quantidade: 1, usosPeriodo: 0, referenciaPeriodo: 'sessao:2026-01-01' },
    ]);
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-ilimitado',
        nome: 'Fofoca do Dia',
        categoria: 'Benefícios Menores',
        tag: 'Narrativo',
        tipoBonus: 'Informação',
        descricao: 'Descobre pista.',
        bonus: '+1 Pista/Informação',
        custo: 5,
        tokens: ['Narrativo', 'Imediato'],
        ativo: true,
        acumulavel: true,
        limiteAcumulo: 0,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['universo-1'],
        imagem: '',
        tipoAtivacao: 'manual',
      },
    ]);

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={vi.fn()} aba="guardados" />
      </SavingProvider>,
    );

    expect(await screen.findByText('Uso ilimitado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^usar$/i })).not.toBeDisabled();
  });

  it('carrega benefícios do banco e abre o modal de detalhes ao clicar no card', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-real',
        nome: 'Benefício Real',
        categoria: 'Benefícios Menores',
        tag: 'Narrativo',
        tipoBonus: 'Vantagem',
        descricao: 'Benefício vindo do Firestore para a loja.',
        bonus: 'Reduz obstáculo em interação social.',
        custo: 7,
        tokens: 'Narrativo',
        ativo: true,
        acumulavel: false,
        limiteAcumulo: null,
        limitePeriodo: 1,
        periodo: 'Diário',
        universos: ['universo-1'],
        imagem: 'https://example.com/beneficio.jpg',
      },
    ]);

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={vi.fn()} />
      </SavingProvider>,
    );

    expect(await screen.findByText('Benefício Real')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /abrir detalhes de benefício real/i }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Benefício Real').length).toBeGreaterThan(0);
  });

  it('renderiza bonus em formato de objeto { texto, tipo } sem quebrar a UI', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-objeto',
        nome: 'Benefício com Objeto',
        categoria: 'Vantagens Táticas',
        tag: 'Narrativo',
        tipoBonus: { tipo: 'vantagem', texto: 'Vantagem em combate' },
        descricao: 'Descrição em texto simples.',
        bonus: { texto: 'Reduz obstáculo em interação social.', tipo: 'vantagem' },
        custo: 5,
        tokens: [{ texto: 'Narrativo', tipo: 'categoria' }],
        ativo: true,
        acumulavel: true,
        limiteAcumulo: 2,
        limitePeriodo: null,
        periodo: 'Semanal',
        universos: ['universo-1'],
        imagem: '',
      },
    ]);

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={personagem} onSave={vi.fn()} />
      </SavingProvider>,
    );

    expect(await screen.findByText('Benefício com Objeto')).toBeInTheDocument();
    expect(await screen.findByText('Reduz obstáculo em interação social.')).toBeInTheDocument();
  });

  it('mostra nomes de universos e limita a visualização a 3 itens com contador para o restante', async () => {
    getBeneficiosPorUniverso.mockResolvedValue([
      {
        id: 'beneficio-mais-universos',
        nome: 'Encontro Favorável',
        categoria: 'Benefícios Menores',
        tag: 'Narrativo',
        tipoBonus: 'Vantagem',
        descricao: 'Rola 1d4 para reduzir obstáculo.',
        bonus: ['Reduz obstáculo em interação social.', 'Ganha vantagem em testes de presença.'],
        custo: 3,
        tokens: ['Narrativo', 'Imediato'],
        ativo: true,
        acumulavel: false,
        limiteAcumulo: 0,
        limitePeriodo: 0,
        periodo: 'Nenhum',
        universos: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12', 'u13', 'u14', 'u15'],
        imagem: 'https://example.com/beneficio.jpg',
      },
    ]);
    getUniverso.mockResolvedValue([
      { id: 'u1', Nome: 'Re\'Geron' },
      { id: 'u2', Nome: 'Bleach' },
      { id: 'u3', Nome: 'Cultivo' },
      { id: 'u4', Nome: 'The Last Human' },
      { id: 'u5', Nome: 'Universo do Claudio' },
      { id: 'u6', Nome: 'Overgeared' },
      { id: 'u7', Nome: 'Re:Conect' },
      { id: 'u8', Nome: 'The Chaotical Gate' },
      { id: 'u9', Nome: 'Universo 9' },
      { id: 'u10', Nome: 'Universo 10' },
      { id: 'u11', Nome: 'Universo 11' },
      { id: 'u12', Nome: 'Universo 12' },
      { id: 'u13', Nome: 'Universo 13' },
      { id: 'u14', Nome: 'Universo 14' },
      { id: 'u15', Nome: 'Universo 15' },
    ]);

    render(
      <SavingProvider>
        <LojaTrapacaSection personagem={{ ...personagem, universo: 'u1' }} onSave={vi.fn()} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /abrir detalhes de encontro favorável/i }));

    expect(await screen.findByText('Re\'Geron')).toBeInTheDocument();
    expect(screen.getByText('Bleach')).toBeInTheDocument();
    expect(screen.getByText('Cultivo')).toBeInTheDocument();
    expect(screen.getByText('+12')).toBeInTheDocument();

    fireEvent.mouseOver(screen.getByText('+12'));

    expect(await screen.findByText('Universo 15')).toBeInTheDocument();
  });
});
