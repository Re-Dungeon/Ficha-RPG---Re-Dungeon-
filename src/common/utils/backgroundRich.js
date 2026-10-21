export const EMPTY_BACKGROUND_DOC = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
};

const asTextContent = value => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(asTextContent).join('');
  if (value && typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;
    if (Array.isArray(value.content)) return value.content.map(asTextContent).join('');
  }
  return '';
};

export const normalizeBackgroundDoc = input => {
  if (!input || (typeof input === 'string' && !input.trim())) {
    return EMPTY_BACKGROUND_DOC;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return EMPTY_BACKGROUND_DOC;

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
          return parsed;
        }
      } catch {
        // fallback para texto simples
      }
    }

    const linhas = trimmed.split(/\r?\n\s*\r?\n/).filter(Boolean);
    if (linhas.length > 1) {
      return {
        type: 'doc',
        content: linhas.map(linha => ({
          type: 'paragraph',
          content: [{ type: 'text', text: linha.trim() }],
        })),
      };
    }

    return {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: trimmed }],
      }],
    };
  }

  if (input && typeof input === 'object' && input.type === 'doc') {
    return input;
  }

  if (input && typeof input === 'object' && Array.isArray(input.content)) {
    return { type: 'doc', content: input.content };
  }

  return EMPTY_BACKGROUND_DOC;
};

export const backgroundDocToPlainText = input => {
  const doc = normalizeBackgroundDoc(input);
  return asTextContent(doc.content || []).replace(/\s+/g, ' ').trim();
};

export const getBackgroundStats = input => {
  const plainText = backgroundDocToPlainText(input);
  const caracteres = plainText.length;
  const palavras = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

  return {
    caracteres,
    palavras,
    texto: plainText,
  };
};

export const parseBackgroundValue = input => {
  const doc = normalizeBackgroundDoc(input);
  const plainText = backgroundDocToPlainText(doc);
  const richText = JSON.stringify(doc);

  return {
    document: doc,
    plainText,
    richText,
  };
};
