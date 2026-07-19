/* ================================================= */
/* POPUP-INFO-JOGADOR.JS - Sistema de Informações  */
/* Gerenciamento Completo do Popup do Jogador      */
/* ================================================= */

/**
 * RichTextEditor
 * Editor modular para o campo Background com:
 * - API de comandos (bold/italic/underline/lists/align)
 * - Sanitização de conteúdo colado
 * - Templates de lore
 * - Contador avançado (caracteres/ palavras)
 * - Integração por callbacks para atualizar estado externo
 */
class RichTextEditor {
    constructor(selector, options = {}) {
        this.selector = selector;
        this.editor = null;
        this.toolbarSelector = options.toolbarSelector || null;
        this.charCountSelector = options.charCountSelector || null;
        this.templates = options.templates || [];
        this.onChange = options.onChange || function(){};
        this.maxChars = options.maxChars || 5000;
        this.init();
    }

    init() {
        this.editor = document.querySelector(this.selector);
        if (!this.editor) return;

        this.editor.setAttribute('contenteditable', 'true');
        this.editor.classList.add('rte-editor');

        this.bindToolbar();
        this.bindInputEvents();
        this._lastSafeHTML = this.editor.innerHTML || '';
        this.updateCharCount();
    }

    bindToolbar() {
        if (!this.toolbarSelector) return;
        const toolbar = document.querySelector(this.toolbarSelector);
        if (!toolbar) return;

        // Mapear botões por ID - mantém compatibilidade com IDs existentes
        const map = {
            'info-background-bold': () => this.exec('bold'),
            'info-background-italic': () => this.exec('italic'),
            'info-background-underline': () => this.exec('underline'),
            'info-background-strikethrough': () => this.exec('strikeThrough'),
            'info-background-align-left': () => this.exec('justifyLeft'),
            'info-background-align-center': () => this.exec('justifyCenter'),
            'info-background-align-right': () => this.exec('justifyRight'),
            'info-background-align-justify': () => this.exec('justifyFull'),
            'info-background-list-ul': () => this.exec('insertUnorderedList'),
            'info-background-list-ol': () => this.exec('insertOrderedList'),
            'info-background-clear': () => this.exec('removeFormat')
        };

        Object.keys(map).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); map[id](); this.editor.focus(); });
        });

        // Color inputs
        const colorText = document.getElementById('info-background-color-text');
        if (colorText) colorText.addEventListener('change', (e) => { this.exec('foreColor', false, e.target.value); });

        const colorBg = document.getElementById('info-background-color-highlight');
        if (colorBg) colorBg.addEventListener('change', (e) => { this.exec('backColor', false, e.target.value); });

        // Templates dropdown (cria se não existir)
        if (!document.getElementById('info-background-templates')) {
            const tplSelect = document.createElement('select');
            tplSelect.id = 'info-background-templates';
            tplSelect.className = 'popup-info-background__templates';
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = 'Inserir template...';
            tplSelect.appendChild(emptyOpt);
            this.templates.forEach((t, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = t.label;
                tplSelect.appendChild(opt);
            });
            toolbar.appendChild(tplSelect);
            // Botão para gerenciar templates
            const manageBtn = document.createElement('button');
            manageBtn.type = 'button';
            manageBtn.id = 'info-background-templates-manage';
            manageBtn.className = 'popup-info-background__templates-manage';
            manageBtn.title = 'Gerenciar templates';
            // SVG gear icon
            manageBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm8.94-2.5a1 1 0 0 0 .06-.25l.02-.25-2.03-1.18a7.98 7.98 0 0 0-.45-1.07l1.23-1.87-.18-.3-2.17-.08a7.9 7.9 0 0 0-.98-.98L16.7 3.6l-.3.18-1.87 1.23c-.34-.17-.7-.31-1.07-.45L12.18 3h-.36l-.25.02a1 1 0 0 0-.25.06L9.8 4.93c-.33.2-.66.42-.98.66l-1.87-1.23-.3-.18L5.42 5.3l1.23 1.87c-.14.37-.28.73-.45 1.07L4 8.52l-.08.18.18.3L5.33 11c-.03.16-.05.33-.05.5 0 .17.02.34.05.5L4.1 13.52l-.18.3.08.18 2.17.08c.17.35.36.69.57 1.02l-1.23 1.87.18.3 2.17.08c.3.24.63.46.98.66l1.93 1.19.25-.02.36-.01.25-.02.25.02 1.93-1.19c.33-.2.66-.42.98-.66l2.17-.08.18-.3-1.23-1.87c.21-.33.4-.67.57-1.02l2.17-.08.18-.3-.08-.18-2.03-1.18z" fill="currentColor"/></svg>';
            toolbar.appendChild(manageBtn);
            manageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof this.onManageTemplates === 'function') this.onManageTemplates();
            });
            tplSelect.addEventListener('change', (e) => {
                const idx = e.target.value;
                if (idx === '') return;
                this.insertTemplate(this.templates[idx].html || this.templates[idx].text);
                e.target.value = '';
            });
        }

        // expor função para atualizar opções externamente
        this._tplSelect = document.getElementById('info-background-templates') || null;
    }

    /**
     * Atualiza lista de templates exibida no select
     */
    updateTemplates(templates) {
        this.templates = templates || [];
        if (!this._tplSelect) return;
        // limpar opções (mantendo a primeira)
        while (this._tplSelect.options.length > 1) this._tplSelect.remove(1);
        this.templates.forEach((t, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = t.label;
            this._tplSelect.appendChild(opt);
        });
    }

    bindInputEvents() {
        if (!this.editor) return;

        this.editor.addEventListener('input', () => {
            // enforce max chars based on innerText
            const text = (this.editor.innerText || '').trim();
            if (this.maxChars && text.length > this.maxChars) {
                // Reverter para último estado seguro
                this.editor.innerHTML = this._lastSafeHTML || this.escapeHtml(text.slice(0, this.maxChars)).replace(/\n/g, '<br>');
                this.placeCaretAtEnd();
            } else {
                // salvar estado seguro
                this._lastSafeHTML = this.editor.innerHTML;
            }

            this.onChange(this.getContent());
            this.updateCharCount();
        });

        this.editor.addEventListener('keydown', (e) => {
            // atalhos comuns
            if (e.ctrlKey && e.key.toLowerCase() === 'b') { e.preventDefault(); this.exec('bold'); }
            if (e.ctrlKey && e.key.toLowerCase() === 'i') { e.preventDefault(); this.exec('italic'); }
            if (e.ctrlKey && e.key.toLowerCase() === 'u') { e.preventDefault(); this.exec('underline'); }
        });

        // paste
        this.editor.addEventListener('paste', (e) => this.handlePaste(e));

        // drop
        this.editor.addEventListener('drop', (e) => this.handleDrop(e));
        this.editor.addEventListener('dragover', (e) => { e.preventDefault(); });
    }

    exec(command, showUI = false, value = null) {
        try {
            document.execCommand(command, showUI, value);
            this.onChange(this.getContent());
            this.updateCharCount();
        } catch (err) {
            console.warn('RTE exec error', err);
        }
    }

    insertTemplate(html) {
        if (!html) return;
        this.exec('insertHTML', false, html);
        this.onChange(this.getContent());
    }

    handlePaste(e) {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        let html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text/plain');
        if (html) {
            html = this.sanitizeHTML(html);
            // limitar tamanho se necessário
            const incomingText = (new DOMParser().parseFromString(html, 'text/html')).body.innerText || '';
            const allowed = this.maxChars ? this.maxChars - ((this.editor.innerText||'').length) : null;
            let toInsert = html;
            if (allowed !== null && allowed <= 0) {
                return; // nada a inserir
            } else if (allowed !== null && incomingText.length > allowed) {
                toInsert = this.escapeHtml(incomingText.slice(0, allowed)).replace(/\n/g, '<br>');
            }
            this.exec('insertHTML', false, toInsert);
        } else if (text) {
            const allowed = this.maxChars ? this.maxChars - ((this.editor.innerText||'').length) : null;
            let plain = text;
            if (allowed !== null && allowed <= 0) return;
            if (allowed !== null && plain.length > allowed) plain = plain.slice(0, allowed);
            const escaped = this.escapeHtml(plain).replace(/\n/g, '<br>');
            this.exec('insertHTML', false, escaped);
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const text = e.dataTransfer.getData('text/html') || e.dataTransfer.getData('text/plain');
        if (text) this.exec('insertHTML', false, this.sanitizeHTML(text));
    }

    sanitizeHTML(html) {
        // Remover scripts e event handlers básicos
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const scripts = doc.querySelectorAll('script'); scripts.forEach(s => s.remove());
        // Remover attributes on* e javascript: links
        doc.querySelectorAll('*').forEach(node => {
            [...node.attributes].forEach(attr => {
                if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
                if (attr.value && /javascript:/i.test(attr.value)) node.removeAttribute(attr.name);
            });
        });
        return doc.body.innerHTML;
    }

    escapeHtml(unsafe) {
        return unsafe.replace(/[&<"'`=\/]/g, function (s) {
            return ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
            })[s];
        });
    }

    getContent() {
        return this.editor ? this.editor.innerHTML : '';
    }

    setContent(html) {
        if (this.editor) {
            this.editor.innerHTML = html || '';
            this.onChange(this.getContent());
            this.updateCharCount();
        }
    }

    updateCharCount() {
        if (!this.charCountSelector) return;
        const counter = document.querySelector(this.charCountSelector);
        if (!counter || !this.editor) return;
        const text = (this.editor.innerText || '').trim();
        const chars = text.length;
        const words = text ? text.split(/\s+/).length : 0;
        if (this.maxChars) {
            counter.textContent = `${chars} / ${this.maxChars}`;
        } else {
            counter.textContent = `${chars}`;
        }
        // também expõe data-attributes para uso visual
        counter.setAttribute('data-words', words);
        counter.setAttribute('data-chars', chars);
    }

    placeCaretAtEnd() {
        if (!this.editor) return;
        this.editor.focus();
        if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
            const range = document.createRange();
            range.selectNodeContents(this.editor);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    destroy() {
        // remover listeners se necessário
    }
}


/**
 * PopupInfoJogador
 * Responsável por:
 * - Gerenciar dados de informações do personagem
 * - Validar e salvar dados
 * - Controlar abas do popup
 * - Sincronizar com atributos principais
 */
class PopupInfoJogador {
    constructor() {
        this.isOpen = false;
        this.activeTab = 'atributos-basicos';
        
        // Dados temporários durante edição
        this.tempValues = {
            nomePersonagem: '',
            tituloPersonagem: '',
            classePersonagem: '',
            racaPersonagem: '',
            origem: '',
            afiliacao: '',
            statusNarrativo: '',
            notasAdicionais: '',
            background: ''
        };

        // Dados originais (para comparação ao cancelar)
        this.originalValues = { ...this.tempValues };

        this.init();
    }

    /**
     * Inicializa o popup
     */
    init() {
        console.log('🔧 Inicializando PopupInfoJogador...');
        this.createPopupHTML();
        this.ensurePopupClosed();
        this.setupEventListeners();
        this.loadValuesFromState();
        console.log('✅ PopupInfoJogador pronto!');
    }

    /**
     * Garante que o popup comece fechado ao inicializar.
     * Isso evita flashes de abertura automática quando a página é recarregada.
     */
    ensurePopupClosed() {
        const overlay = document.getElementById('popup-info-jogador-overlay');
        if (!overlay) return;

        if (overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
            console.log('⚠️ PopupInfoJogador resetado para fechado no init');
        }

        overlay.dataset.jsReady = 'false';

        this.isOpen = false;
    }

    /**
     * Cria o HTML do popup inserindo no DOM
     */
    createPopupHTML() {
        const popupHTML = `
            <!-- Popup de Informações do Jogador -->
            <div id="popup-info-jogador-overlay" class="popup-info-jogador-overlay" data-js-ready="false" aria-hidden="true" role="dialog" aria-labelledby="popup-info-jogador-title">
                <div class="popup-info-jogador">
                    <!-- Header -->
                    <div class="popup-info-jogador__header">
                        <h2 id="popup-info-jogador-title" class="popup-info-jogador__title">Informações do Jogador</h2>
                        <div class="popup-info-jogador__header-buttons">
                            <button id="popup-info-jogador-voltar" class="popup-info-jogador__voltar-btn" aria-label="Voltar" title="Voltar">
                                <span aria-hidden="true">↩</span>
                            </button>
                            <button id="popup-info-jogador-close" class="popup-info-jogador__close-btn" aria-label="Fechar popup" title="Fechar">
                                <span aria-hidden="true">✘</span>
                            </button>
                        </div>
                    </div>

                    <!-- Abas de Navegação -->
                    <div class="popup-info-jogador__tabs">
                        <button class="popup-info-jogador__tab popup-info-jogador__tab--active" data-tab="atributos-basicos">
                            Atributos Básicos
                        </button>
                        <button class="popup-info-jogador__tab" data-tab="info-gerais">
                            Informações Gerais
                        </button>
                        <button class="popup-info-jogador__tab" data-tab="background">
                            Background
                        </button>
                    </div>

                    <!-- Conteúdo das Abas -->
                    <div class="popup-info-jogador__content">
                        <!-- Aba 1: Atributos Básicos -->
                        <div class="popup-info-jogador__tab-content popup-info-jogador__tab-content--active" data-tab="atributos-basicos">
                            <div class="popup-info-form">
                                <!-- Nome do Personagem -->
                                <div class="popup-info-form__group">
                                    <label for="info-nome-personagem" class="popup-info-form__label">Nome do Personagem</label>
                                    <input 
                                        type="text" 
                                        id="info-nome-personagem" 
                                        class="popup-info-form__input" 
                                        placeholder="Digite o nome"
                                        maxlength="50">
                                    <span class="popup-info-form__hint">Editável</span>
                                </div>

                                <!-- Título -->
                                <div class="popup-info-form__group">
                                    <label for="info-titulo-personagem" class="popup-info-form__label">Título</label>
                                    <input 
                                        type="text" 
                                        id="info-titulo-personagem" 
                                        class="popup-info-form__input" 
                                        placeholder="Ex: Guerreiro Destemido"
                                        maxlength="50">
                                    <span class="popup-info-form__hint">Editável</span>
                                </div>

                                <!-- Classe (Somente Leitura) -->
                                <div class="popup-info-form__group">
                                    <label for="info-classe-personagem" class="popup-info-form__label">Classe</label>
                                    <input 
                                        type="text" 
                                        id="info-classe-personagem" 
                                        class="popup-info-form__input popup-info-form__input--readonly" 
                                        placeholder="Classe"
                                        readonly>
                                    <span class="popup-info-form__hint">Somente Leitura</span>
                                </div>

                                <!-- Raça (Somente Leitura) -->
                                <div class="popup-info-form__group">
                                    <label for="info-raca-personagem" class="popup-info-form__label">Raça</label>
                                    <input 
                                        type="text" 
                                        id="info-raca-personagem" 
                                        class="popup-info-form__input popup-info-form__input--readonly" 
                                        placeholder="Raça"
                                        readonly>
                                    <span class="popup-info-form__hint">Somente Leitura</span>
                                </div>
                            </div>
                        </div>

                        <!-- Aba 2: Informações Gerais -->
                        <div class="popup-info-jogador__tab-content" data-tab="info-gerais">
                            <div class="popup-info-form">
                                <!-- Origem -->
                                <div class="popup-info-form__group">
                                    <label for="info-geral-origem" class="popup-info-form__label">Origem</label>
                                    <input 
                                        type="text" 
                                        id="info-geral-origem" 
                                        class="popup-info-form__input" 
                                        placeholder="Origem do personagem">
                                    <span class="popup-info-form__hint">Editável</span>
                                </div>

                                <!-- Afiliação -->
                                <div class="popup-info-form__group">
                                    <label for="info-geral-afiliacao" class="popup-info-form__label">Afiliação</label>
                                    <input 
                                        type="text" 
                                        id="info-geral-afiliacao" 
                                        class="popup-info-form__input" 
                                        placeholder="Afiliação">
                                    <span class="popup-info-form__hint">Editável</span>
                                </div>

                                <!-- Status Narrativo -->
                                <div class="popup-info-form__group">
                                    <label for="info-geral-status" class="popup-info-form__label">Status Narrativo</label>
                                    <input 
                                        type="text" 
                                        id="info-geral-status" 
                                        class="popup-info-form__input" 
                                        placeholder="Status narrativo">
                                    <span class="popup-info-form__hint">Editável</span>
                                </div>

                                <!-- Campo Adicional -->
                                <div class="popup-info-form__group">
                                    <label for="info-geral-notas" class="popup-info-form__label">Notas Adicionais</label>
                                    <textarea 
                                        id="info-geral-notas" 
                                        class="popup-info-form__textarea" 
                                        placeholder="Notas adicionais"
                                        rows="4"></textarea>
                                    <span class="popup-info-form__hint">Editável</span>
                                </div>
                            </div>
                        </div>

                        <!-- Aba 3: Background -->
                        <div class="popup-info-jogador__tab-content" data-tab="background">
                            <div class="popup-info-background">
                                <!-- Toolbar de Formatação -->
                                <div class="popup-info-background__toolbar">
                                    <!-- Formatação Básica -->
                                    <button class="popup-info-background__toolbar-btn" id="info-background-bold" title="Negrito (Ctrl+B)">
                                        <strong>B</strong>
                                    </button>
                                    <button class="popup-info-background__toolbar-btn" id="info-background-italic" title="Itálico (Ctrl+I)">
                                        <em>I</em>
                                    </button>
                                    <button class="popup-info-background__toolbar-btn" id="info-background-underline" title="Sublinhado (Ctrl+U)">
                                        <u>U</u>
                                    </button>
                                    <button class="popup-info-background__toolbar-btn" id="info-background-strikethrough" title="Riscado">
                                        <strike>S</strike>
                                    </button>
                                    <div class="popup-info-background__toolbar-separator"></div>
                                    
                                    <!-- Alinhamento -->
                                    <button class="popup-info-background__toolbar-btn" id="info-background-align-left" title="Alinhar à Esquerda">
                                        ⬅
                                    </button>
                                    <button class="popup-info-background__toolbar-btn" id="info-background-align-center" title="Centralizar">
                                        ⬍
                                    </button>
                                    <button class="popup-info-background__toolbar-btn" id="info-background-align-right" title="Alinhar à Direita">
                                        ➡
                                    </button>
                                    <button class="popup-info-background__toolbar-btn" id="info-background-align-justify" title="Justificar">
                                        ═
                                    </button>
                                    <div class="popup-info-background__toolbar-separator"></div>
                                    
                                    <!-- Listas -->
                                    <button class="popup-info-background__toolbar-btn" id="info-background-list-ul" title="Lista com Bolinhas">
                                        •
                                    </button>
                                    <button class="popup-info-background__toolbar-btn" id="info-background-list-ol" title="Lista Numerada">
                                        1.
                                    </button>
                                    <div class="popup-info-background__toolbar-separator"></div>
                                    
                                    <!-- Cores -->
                                    <div class="popup-info-background__color-group">
                                        <label class="popup-info-background__color-label" title="Cor do Texto">
                                            <span class="popup-info-background__color-icon">A</span>
                                            <input type="color" id="info-background-color-text" class="popup-info-background__color-input" value="#d8b4fe">
                                        </label>
                                    </div>
                                    <div class="popup-info-background__color-group">
                                        <label class="popup-info-background__color-label" title="Cor de Fundo">
                                            <span class="popup-info-background__color-icon">■</span>
                                            <input type="color" id="info-background-color-highlight" class="popup-info-background__color-input" value="#2d2a27">
                                        </label>
                                    </div>
                                    <div class="popup-info-background__toolbar-separator"></div>
                                    <!-- Limpar -->
                                    <button class="popup-info-background__toolbar-btn" id="info-background-clear" title="Limpar Formatação">
                                        C
                                    </button>
                                </div>

                                <!-- Editor de Background -->
                                <div class="popup-info-background__editor-wrapper">
                                    <div 
                                        id="info-background-editor" 
                                        class="popup-info-background__editor" 
                                        contenteditable="true"
                                        data-placeholder="Digite o background do personagem aqui... (História, lore, passado e anotações narrativas)"
                                        role="textbox"
                                        aria-label="Editor de background do personagem">
                                    </div>
                                </div>

                                <!-- Contador de Caracteres -->
                                <div class="popup-info-background__footer">
                                    <span class="popup-info-background__char-count">
                                        <span id="info-background-char-count">0</span> caracteres
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Rodapé com Botões -->
                    <div class="popup-info-jogador__footer">
                        <button id="info-btn-cancelar" class="popup-info-jogador__btn popup-info-jogador__btn--cancel">
                            Cancelar
                        </button>
                        <button id="info-btn-salvar" class="popup-info-jogador__btn popup-info-jogador__btn--save">
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('popup-info-jogador-overlay')) {
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            // Adicionar estilos específicos do popup/ editor (se ainda não existirem)
                if (!document.getElementById('popup-info-jogador-styles')) {
                const style = document.createElement('style');
                style.id = 'popup-info-jogador-styles';
                style.textContent = `
                    .popup-info-jogador-overlay { position:fixed; inset:0; display:none; align-items:center; justify-content:center; background: rgba(0,0,0,0.6); z-index:9999; opacity:0; pointer-events:none; transition:opacity .18s ease; }
                    .popup-info-jogador-overlay.active[data-js-ready="true"] { display:flex; opacity:1; pointer-events:auto; }
                    .popup-info-jogador { width:900px; max-width:calc(100% - 40px); background: linear-gradient(180deg,#0f1113,#151515); border-radius:14px; box-shadow:0 10px 40px rgba(0,0,0,.7); border:2px solid rgba(90,150,255,0.06); padding:18px; color:#e6c07b; font-family: "Montserrat", Arial, sans-serif; }
                    .popup-info-jogador__header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px }
                    .popup-info-jogador__title { font-size:20px; letter-spacing:1px; color:#ffdd76 }
                    .popup-info-jogador__tabs { display:flex; gap:12px; margin:12px 0 }
                    .popup-info-jogador__tab { background:transparent; border:1px solid rgba(255,255,255,0.03); padding:8px 12px; color:#bfbfbf; border-radius:6px; cursor:pointer }
                    .popup-info-jogador__tab--active { border-color:#ffd86b; box-shadow:0 0 0 3px rgba(255,216,107,0.06); color:#ffd86b }
                    .popup-info-jogador__content { margin-top:6px }
                    .popup-info-background { background:rgba(10,10,12,0.3); padding:12px; border-radius:8px }
                    .popup-info-background__toolbar { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:10px }
                    .popup-info-background__toolbar-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03); color:#f5e7c8; padding:6px 8px; border-radius:6px; cursor:pointer }
                    .popup-info-background__editor { min-height:180px; max-height:420px; overflow:auto; background:linear-gradient(180deg,#0b0b0b,#0f0f0f); padding:18px 22px; border-radius:8px; border:1px solid rgba(255,255,255,0.03); color:#f5e7c8; font-size:14px; line-height:1.55; caret-color:#7fb1ff; white-space:pre-wrap; box-sizing:border-box; word-wrap:break-word; overflow-wrap:anywhere }
                    .popup-info-background__editor ul, .popup-info-background__editor ol { padding-left: 2.2rem; margin: 0 0 0.8rem 0; list-style-position: inside; }
                    .popup-info-background__editor li { margin: 0.25rem 0; }
                    .popup-info-background__editor ul, .popup-info-background__editor ol { max-width:100%; }
                    .popup-info-background__editor li { word-break: break-word; }
                    .popup-info-background__editor:empty:before { content: attr(data-placeholder); color: rgba(255,255,255,0.12); }
                    .rte-editor h3{ margin:0 0 6px 0; color:#ffd86b }
                    .popup-info-background__footer { display:flex; justify-content:flex-end; margin-top:8px; color:#c1b48a }
                    #info-background-char-count { font-weight:600 }
                    .popup-info-jogador__footer{ display:flex; gap:12px; justify-content:flex-end; margin-top:12px }
                    .popup-info-jogador__btn{ padding:10px 18px; border-radius:8px; cursor:pointer; border:0 }
                    .popup-info-jogador__btn--save{ background:linear-gradient(90deg,#4fafff,#c8b78f); color:#06203a }
                    .popup-info-jogador__btn--cancel{ background:rgba(255,255,255,0.03); color:#b99f73 }
                    .rte-editor:focus{ outline: 3px solid rgba(127,177,255,0.12); box-shadow: 0 4px 20px rgba(15,30,60,0.25); }
                    ::selection{ background: rgba(127,177,255,0.18); }
                `;
                document.head.appendChild(style);
            }
        }
    }

    /**
     * Configura todos os event listeners
     */
    setupEventListeners() {
        console.log('🔌 Configurando event listeners...');

        // Botão de abrir (botão Info na sidebar)
        const btnAbrir = document.querySelector('#route-info');
        if (btnAbrir) {
            btnAbrir.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🖱️ Clique no botão Info detectado');
                this.open();
            });
        } else {
            console.warn('⚠️ Botão #route-info não encontrado');
        }

        // Botões de fechar
        document.querySelector('#popup-info-jogador-close')?.addEventListener('click', () => this.close());
        document.querySelector('#popup-info-jogador-voltar')?.addEventListener('click', () => this.voltarMenu());
        document.querySelector('#info-btn-cancelar')?.addEventListener('click', () => this.close());

        // Botão de salvar
        document.querySelector('#info-btn-salvar')?.addEventListener('click', () => this.save());

        // Fechar ao clicar no overlay
        document.querySelector('#popup-info-jogador-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'popup-info-jogador-overlay') {
                this.close();
            }
        });

        // Abas
        document.querySelectorAll('.popup-info-jogador__tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Inputs de nome e título
        document.querySelector('#info-nome-personagem')?.addEventListener('input', (e) => {
            this.tempValues.nomePersonagem = e.target.value;
        });

        document.querySelector('#info-titulo-personagem')?.addEventListener('input', (e) => {
            this.tempValues.tituloPersonagem = e.target.value;
        });

        // Inicializar editor rico para Background (substitui listeners simples)
        try {
            // Carregar templates persistidos se houver
            let templates = [
                { label: 'Ficha - Resumo', html: '<p><strong>Resumo:</strong> &lt;insira resumo do personagem&gt;</p>' },
                { label: 'Ficha - Infância', html: '<h3>Infância</h3><p>&lt;detalhes da infância&gt;</p>' },
                { label: 'Ficha - Eventos Marcantes', html: '<h3>Eventos Marcantes</h3><ul><li>&lt;evento 1&gt;</li><li>&lt;evento 2&gt;</li></ul>' }
            ];
            if (window.localStorageManager && typeof window.localStorageManager.loadBackgroundTemplates === 'function') {
                try {
                    const persisted = window.localStorageManager.loadBackgroundTemplates([]);
                    if (Array.isArray(persisted) && persisted.length > 0) {
                        templates = persisted;
                    }
                } catch (e) {
                    console.warn('Erro ao carregar templates persistidos:', e);
                }
            }

            this.backgroundRichEditor = new RichTextEditor('#info-background-editor', {
                toolbarSelector: '.popup-info-background__toolbar',
                charCountSelector: '#info-background-char-count',
                templates: templates,
                maxChars: 8000,
                onChange: (html) => {
                    this.tempValues.background = html;
                },
                onManageTemplates: () => this.openTemplatesManager()
            });
            // guardar lista atual
            this._backgroundTemplates = templates;
        } catch (err) {
            console.warn('⚠️ Erro ao inicializar RichTextEditor:', err);
        }

        // Inputs da aba Informações Gerais (agora editáveis)
        document.querySelector('#info-geral-origem')?.addEventListener('input', (e) => {
            this.tempValues.origem = e.target.value;
        });

        document.querySelector('#info-geral-afiliacao')?.addEventListener('input', (e) => {
            this.tempValues.afiliacao = e.target.value;
        });

        document.querySelector('#info-geral-status')?.addEventListener('input', (e) => {
            this.tempValues.statusNarrativo = e.target.value;
        });

        document.querySelector('#info-geral-notas')?.addEventListener('input', (e) => {
            this.tempValues.notasAdicionais = e.target.value;
        });

        console.log('✓ Event listeners configurados');
    }

    /**
     * Troca entre abas
     */
    switchTab(tabName) {
        console.log(`📑 Trocando para aba: ${tabName}`);
        
        // Remover classe ativa de todas as abas
        document.querySelectorAll('.popup-info-jogador__tab').forEach(tab => {
            tab.classList.remove('popup-info-jogador__tab--active');
        });

        document.querySelectorAll('.popup-info-jogador__tab-content').forEach(content => {
            content.classList.remove('popup-info-jogador__tab-content--active');
        });

        // Adicionar classe ativa à aba selecionada
        document.querySelector(`[data-tab="${tabName}"].popup-info-jogador__tab`)?.classList.add('popup-info-jogador__tab--active');
        document.querySelector(`[data-tab="${tabName}"].popup-info-jogador__tab-content`)?.classList.add('popup-info-jogador__tab-content--active');

        this.activeTab = tabName;
    }

    /**
     * Carrega valores do state manager
     */
    loadValuesFromState() {
        console.log('📂 Carregando valores do state...');

        // ✅ PRIMEIRO: Tentar carregar do localStorage
        let jogadorInfo = null;
        if (window.localStorageManager) {
            try {
                jogadorInfo = window.localStorageManager.loadJogadorInfo();
                if (jogadorInfo) {
                    console.log('✅ Dados carregados do localStorage');
                }
            } catch (error) {
                console.warn('⚠️ Erro ao carregar do localStorage:', error);
            }
        }

        // ✅ FALLBACK: Se não tiver no localStorage, carrega do atributosManager
        if (!jogadorInfo && typeof atributosManager !== 'undefined') {
            console.log('📂 Carregando valores do AtributosManager (fallback)...');
            const personagemData = atributosManager.personagemData;
            jogadorInfo = {
                nomePersonagem: personagemData.nome || 'Aventureiro Desconhecido',
                tituloPersonagem: personagemData.titulo || 'Sem Título',
                classePersonagem: personagemData.classe || 'Não possui',
                racaPersonagem: this.getRacaDisplayName(personagemData.raca) || 'Não possui',
                origem: personagemData.origem || 'Desconhecida',
                afiliacao: personagemData.afiliacao || 'Nenhuma',
                statusNarrativo: personagemData.statusNarrativo || 'Ativo',
                notasAdicionais: personagemData.notasAdicionais || '',
                background: personagemData.background || ''
            };
        }

        // ✅ Se ainda não tiver nada, usar valores padrão
        if (!jogadorInfo) {
            jogadorInfo = {
                nomePersonagem: 'Aventureiro Desconhecido',
                tituloPersonagem: 'Sem Título',
                classePersonagem: 'Não possui',
                racaPersonagem: 'Não possui',
                origem: 'Desconhecida',
                afiliacao: 'Nenhuma',
                statusNarrativo: 'Ativo',
                notasAdicionais: '',
                background: ''
            };
        }

        // ✅ IMPORTANTE: Buscar classe e raça de campos separados
        // Classe: #personagem-classe
        // Raça: #personagem-raca
        
        const classeElement = document.querySelector('#personagem-classe');
        if (classeElement && classeElement.textContent) {
            const classeExtraida = classeElement.textContent.trim();
            if (classeExtraida && classeExtraida !== 'Classe') {
                jogadorInfo.classePersonagem = classeExtraida;
                console.log(`✅ Classe atualizada de #personagem-classe: ${classeExtraida}`);
            } else {
                console.log(`ℹ️ Nenhuma classe selecionada, exibindo: "Não possui"`);
            }
        } else {
            console.log(`ℹ️ Campo #personagem-classe não encontrado ou vazio`);
        }

        const racaElement = document.querySelector('#personagem-raca');
        if (racaElement && racaElement.textContent) {
            const racaExtraida = racaElement.textContent.trim();
            if (racaExtraida && racaExtraida !== 'Raça') {
                jogadorInfo.racaPersonagem = racaExtraida;
                console.log(`✅ Raça atualizada de #personagem-raca: ${racaExtraida}`);
            } else {
                console.log(`ℹ️ Nenhuma raça selecionada, exibindo: "Não possui"`);
            }
        } else {
            console.log(`ℹ️ Campo #personagem-raca não encontrado ou vazio`);
        }

        // Atualizar tempValues com dados carregados
        this.tempValues = jogadorInfo;
        this.originalValues = { ...this.tempValues };
        
        // ✅ Sincronizar também com AtributosManager para consistência
        if (typeof atributosManager !== 'undefined') {
            atributosManager.personagemData.nome = jogadorInfo.nomePersonagem;
            atributosManager.personagemData.titulo = jogadorInfo.tituloPersonagem;
            atributosManager.personagemData.classe = jogadorInfo.classePersonagem;
            atributosManager.personagemData.background = jogadorInfo.background;
            atributosManager.personagemData.origem = jogadorInfo.origem;
            atributosManager.personagemData.afiliacao = jogadorInfo.afiliacao;
            atributosManager.personagemData.statusNarrativo = jogadorInfo.statusNarrativo;
            atributosManager.personagemData.notasAdicionais = jogadorInfo.notasAdicionais;
            
            // ✅ Sincronizar raça (converter de nome para código)
            const racaCodigo = atributosManager.racaNomeParaCodigo(jogadorInfo.racaPersonagem);
            if (racaCodigo) {
                atributosManager.personagemData.raca = racaCodigo;
            }
        }

        // ✅ Sincronizar também com StateManager para consistência
        if (window.appState) {
            window.appState.setJogadorInfo(jogadorInfo);
            console.log('✅ Sincronizado com StateManager');
        }
        
        // ✅ Renderizar a exibição principal com dados carregados
        if (typeof atributosManager !== 'undefined' && typeof atributosManager.renderizarPersonagem === 'function') {
            try {
                atributosManager.renderizarPersonagem();
                console.log('✅ Exibição principal atualizada com dados carregados');
            } catch (error) {
                console.warn('⚠️ Erro ao renderizar personagem:', error);
            }
        }
        
        this.updateFormInputs();
        console.log('✓ Valores carregados com sucesso');
    }

    /**
     * Obtém o nome de exibição da raça
     */
    getRacaDisplayName(racaCodigo) {
        const racas = {
            'humano': 'Humano',
            'elfo': 'Elfo',
            'anao': 'Anão'
        };
        return racas[racaCodigo] || racaCodigo;
    }

    /**
     * Atualiza os inputs do formulário
     */
    updateFormInputs() {
        // Aba 1: Atributos Básicos
        const nomeInput = document.querySelector('#info-nome-personagem');
        if (nomeInput) nomeInput.value = this.tempValues.nomePersonagem;

        const tituloInput = document.querySelector('#info-titulo-personagem');
        if (tituloInput) tituloInput.value = this.tempValues.tituloPersonagem;

        const classeInput = document.querySelector('#info-classe-personagem');
        if (classeInput) classeInput.value = this.tempValues.classePersonagem;

        const racaInput = document.querySelector('#info-raca-personagem');
        if (racaInput) racaInput.value = this.tempValues.racaPersonagem;

        // Aba 2: Informações Gerais
        const origemInput = document.querySelector('#info-geral-origem');
        if (origemInput) origemInput.value = this.tempValues.origem;

        const afiliacao = document.querySelector('#info-geral-afiliacao');
        if (afiliacao) afiliacao.value = this.tempValues.afiliacao;

        const status = document.querySelector('#info-geral-status');
        if (status) status.value = this.tempValues.statusNarrativo;

        const notas = document.querySelector('#info-geral-notas');
        if (notas) notas.value = this.tempValues.notasAdicionais;

        // Aba 3: Background
        const backgroundEditor = document.querySelector('#info-background-editor');
        if (this.backgroundRichEditor) {
            this.backgroundRichEditor.setContent(this.tempValues.background);
        } else if (backgroundEditor) {
            backgroundEditor.innerHTML = this.tempValues.background;
        }
        this.updateBackgroundCharCount();
    }

    /**
     * Atualiza o contador de caracteres do background
     */
    updateBackgroundCharCount() {
        const counter = document.querySelector('#info-background-char-count');
        if (!counter) return;

        if (this.backgroundRichEditor) {
            this.backgroundRichEditor.updateCharCount();
            return;
        }

        const editor = document.querySelector('#info-background-editor');
        if (editor) {
            const text = editor.innerText || '';
            counter.textContent = text.length;
        }
    }

    /**
     * Abre o gerenciador de templates (cria modal se necessário)
     */
    openTemplatesManager() {
        if (!document.getElementById('popup-templates-manager-overlay')) {
            this.createTemplatesManagerModal();
        }
        const overlay = document.getElementById('popup-templates-manager-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    createTemplatesManagerModal() {
        const existing = document.getElementById('popup-templates-manager-overlay');
        if (existing) return;

        const modalHTML = `
            <div id="popup-templates-manager-overlay" class="popup-templates-manager-overlay" aria-hidden="true">
                <div class="popup-templates-manager">
                    <div class="popup-templates-manager__header">
                        <h3>Gerenciar Templates de Background</h3>
                        <div class="popup-templates-manager__header-actions">
                            <select id="popup-templates-pack-select">
                                <option value="default">Pack Padrão (10)</option>
                                <option value="npcs">Pack NPCs</option>
                                <option value="campanha">Pack Campanha</option>
                                <option value="missoes">Pack Missões</option>
                                <option value="conflitos">Pack Conflitos</option>
                                <option value="cidade">Pack Cidade</option>
                                <option value="culturas">Pack Culturas</option>
                            </select>
                            <button id="popup-templates-addpack">Adicionar Pack</button>
                            <button id="popup-templates-export">Exportar</button>
                            <button id="popup-templates-import">Importar</button>
                            <button id="popup-templates-manager-close">✘</button>
                        </div>
                    </div>
                    <div class="popup-templates-manager__body">
                        <div id="templates-list" class="templates-list"></div>

                        <div class="templates-editor">
                            <label>Label</label>
                            <input id="template-label-input" type="text" />
                            <label>Conteúdo (WYSIWYG)</label>
                            <div id="template-html-editor" class="template-html-editor" contenteditable="true" data-placeholder="Conteúdo do template..."></div>
                            <div class="templates-editor__actions">
                                <button id="template-add-btn">Adicionar</button>
                                <button id="template-update-btn" style="display:none">Atualizar</button>
                                <button id="template-cancel-btn">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Styles mínimos do modal (apenas se não existir)
        if (!document.getElementById('popup-templates-manager-styles')) {
            const s = document.createElement('style');
            s.id = 'popup-templates-manager-styles';
            s.textContent = `
                .popup-templates-manager-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.65); z-index:10000; }
                .popup-templates-manager { width:760px; max-width:calc(100% - 40px); background:#0f0f10; color:#e6d6a8; border-radius:10px; padding:12px; box-shadow:0 10px 40px rgba(0,0,0,0.6); }
                .popup-templates-manager__header { display:flex; justify-content:space-between; align-items:center; }
                .popup-templates-manager__body { display:flex; gap:12px; margin-top:8px }
                .templates-list { flex:1; max-height:360px; overflow:auto; border-right:1px solid rgba(255,255,255,0.03); padding-right:8px }
                .templates-list .tpl-item { padding:8px; border-radius:6px; cursor:pointer; display:flex; justify-content:space-between; align-items:center }
                .templates-list .tpl-item:hover { background:rgba(255,255,255,0.02) }
                .templates-editor { flex:1; display:flex; flex-direction:column; gap:6px }
                .templates-editor input, .templates-editor textarea { width:100%; background:#0b0b0b; color:#e6d6a8; border:1px solid rgba(255,255,255,0.03); padding:8px; border-radius:6px }
                .templates-editor__actions { display:flex; gap:8px; justify-content:flex-end }
            `;
            document.head.appendChild(s);
        }

        // Popular lista de templates
        this.refreshTemplatesList();

        // Listeners
        document.getElementById('popup-templates-manager-close')?.addEventListener('click', () => {
            document.getElementById('popup-templates-manager-overlay')?.classList.remove('active');
        });

        document.getElementById('template-add-btn')?.addEventListener('click', () => {
            // pegar conteúdo do editor WYSIWYG
            const label = document.getElementById('template-label-input').value.trim();
            const html = (this._templateEditor && typeof this._templateEditor.getContent === 'function') ? this._templateEditor.getContent() : document.getElementById('template-html-editor').innerHTML;
            if (!label) { alert('Informe um label para o template'); return; }
            this._backgroundTemplates = this._backgroundTemplates || [];
            this._backgroundTemplates.push({ label, html });
            this.saveTemplatesToStorage();
            this.refreshTemplatesList();
            document.getElementById('template-label-input').value = '';
            if (this._templateEditor && typeof this._templateEditor.setContent === 'function') this._templateEditor.setContent('');
            else document.getElementById('template-html-editor').innerHTML = '';
        });

        document.getElementById('template-cancel-btn')?.addEventListener('click', () => {
            document.getElementById('template-label-input').value = '';
            if (this._templateEditor && typeof this._templateEditor.setContent === 'function') this._templateEditor.setContent('');
            else document.getElementById('template-html-editor').innerHTML = '';
            document.getElementById('template-update-btn').style.display = 'none';
            document.getElementById('template-add-btn').style.display = '';
        });

        document.getElementById('template-update-btn')?.addEventListener('click', () => {
            const idx = document.getElementById('template-update-btn').dataset.idx;
            if (typeof idx === 'undefined') return;
            const label = document.getElementById('template-label-input').value.trim();
            const html = (this._templateEditor && typeof this._templateEditor.getContent === 'function') ? this._templateEditor.getContent() : document.getElementById('template-html-editor').innerHTML;
            if (!label) { alert('Informe um label'); return; }
            this._backgroundTemplates[idx] = { label, html };
            this.saveTemplatesToStorage();
            this.refreshTemplatesList();
            document.getElementById('template-update-btn').style.display = 'none';
            document.getElementById('template-add-btn').style.display = '';
        });

        // Export / Import
        document.getElementById('popup-templates-export')?.addEventListener('click', () => this.exportTemplates());
        document.getElementById('popup-templates-import')?.addEventListener('click', () => {
            // criar input file temporário
            const f = document.createElement('input');
            f.type = 'file';
            f.accept = 'application/json';
            f.addEventListener('change', (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const data = JSON.parse(evt.target.result);
                        if (!Array.isArray(data)) throw new Error('Formato inválido');
                        this._backgroundTemplates = data;
                        this.saveTemplatesToStorage();
                        this.refreshTemplatesList();
                        alert('Templates importados com sucesso');
                    } catch (e) { alert('Erro ao importar templates: ' + e.message); }
                };
                reader.readAsText(file);
            });
            f.click();
        });

        // Adicionar pack selecionado
        document.getElementById('popup-templates-addpack')?.addEventListener('click', () => {
            const select = document.getElementById('popup-templates-pack-select');
            const key = select ? select.value : 'default';
            const map = {
                default: 'Pack Padrão (10 templates)',
                npcs: 'Pack NPCs',
                campanha: 'Pack Campanha',
                missoes: 'Pack Missões',
                conflitos: 'Pack Conflitos',
                cidade: 'Pack Cidade',
                culturas: 'Pack Culturas'
            };
            const label = map[key] || 'Pack selecionado';
            if (!confirm(`Adicionar ${label}? Isso adicionará os templates à sua lista atual.`)) return;
            this.addTemplatePack(key);
            alert(`${label} adicionado com sucesso.`);
            this.refreshTemplatesList();
        });

        // Inicializar pequeno editor WYSIWYG para edição de template
        try {
            this._templateEditor = new RichTextEditor('#template-html-editor', { maxChars: 8000 });
        } catch (e) { console.warn('Erro iniciando editor do template', e); }
    }

    refreshTemplatesList() {
        this._backgroundTemplates = this._backgroundTemplates || [];
        const listEl = document.getElementById('templates-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        this._backgroundTemplates.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = 'tpl-item';
            item.innerHTML = `<span>${t.label}</span><span><button data-idx='${i}' class='tpl-insert'>Inserir</button> <button data-idx='${i}' class='tpl-edit'>Editar</button> <button data-idx='${i}' class='tpl-del'>Remover</button></span>`;
            listEl.appendChild(item);
        });

        // listeners para insert/edit/delete
        listEl.querySelectorAll('.tpl-insert').forEach(btn => btn.addEventListener('click', (e) => {
            const idx = e.target.dataset.idx;
            const tpl = this._backgroundTemplates[idx];
            if (tpl && this.backgroundRichEditor) {
                this.backgroundRichEditor.insertTemplate(tpl.html || tpl.text);
            }
        }));

        listEl.querySelectorAll('.tpl-edit').forEach(btn => btn.addEventListener('click', (e) => {
            const idx = e.target.dataset.idx;
            const tpl = this._backgroundTemplates[idx];
            if (!tpl) return;
            document.getElementById('template-label-input').value = tpl.label || '';
            document.getElementById('template-html-input').value = tpl.html || tpl.text || '';
            document.getElementById('template-update-btn').style.display = '';
            document.getElementById('template-update-btn').dataset.idx = idx;
            document.getElementById('template-add-btn').style.display = 'none';
        }));

        listEl.querySelectorAll('.tpl-del').forEach(btn => btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            if (!confirm('Remover template?')) return;
            this._backgroundTemplates.splice(idx,1);
            this.saveTemplatesToStorage();
            this.refreshTemplatesList();
        }));

        // também atualizar editor dropdown
        if (this.backgroundRichEditor) this.backgroundRichEditor.updateTemplates(this._backgroundTemplates);
    }

    saveTemplatesToStorage() {
        if (window.localStorageManager && typeof window.localStorageManager.saveBackgroundTemplates === 'function') {
            try {
                window.localStorageManager.saveBackgroundTemplates(this._backgroundTemplates || []);
            } catch (e) { console.warn('Erro salvando templates no localStorageManager', e); }
        } else {
            // fallback direto no localStorage
            try { localStorage.setItem('redungeon_ficha_background_templates', JSON.stringify(this._backgroundTemplates || [])); } catch (e) {}
        }
        if (this.backgroundRichEditor) this.backgroundRichEditor.updateTemplates(this._backgroundTemplates || []);
    }

    /**
     * Adiciona um pack padrão com 10 templates em português
     */
    addDefaultTemplatePack() {
        const pack = [
            { label: 'Resumo', html: '<p><strong>Resumo:</strong> &lt;insira resumo do personagem&gt;</p>' },
            { label: 'Infância', html: '<h3>Infância</h3><p>&lt;detalhes da infância&gt;</p>' },
            { label: 'Família', html: '<h3>Família</h3><p>&lt;descreva família e relações&gt;</p>' },
            { label: 'Eventos Marcantes', html: '<h3>Eventos Marcantes</h3><ul><li>&lt;evento 1&gt;</li><li>&lt;evento 2&gt;</li></ul>' },
            { label: 'Conexões', html: '<h3>Conexões</h3><p>&lt;lista de NPCs importantes&gt;</p>' },
            { label: 'Segredos', html: '<h3>Segredos</h3><p>&lt;segredos e segredos ocultos&gt;</p>' },
            { label: 'Motivações', html: '<h3>Motivações</h3><p>&lt;motivações do personagem&gt;</p>' },
            { label: 'Habilidades Notáveis', html: '<h3>Habilidades Notáveis</h3><ul><li>&lt;habilidade 1&gt;</li></ul>' },
            { label: 'Relacionamentos', html: '<h3>Relacionamentos</h3><p>&lt;descrição das relações&gt;</p>' },
            { label: 'Diário / Notas', html: '<h3>Diário</h3><p>&lt;anotações, memórias e diário&gt;</p>' }
        ];

        this._backgroundTemplates = this._backgroundTemplates || [];
        // mesclar evitando duplicatas por label
        const existingLabels = new Set(this._backgroundTemplates.map(t => t.label));
        pack.forEach(t => { if (!existingLabels.has(t.label)) this._backgroundTemplates.push(t); });
        this.saveTemplatesToStorage();
    }

    /**
     * Retorna definição de packs disponíveis
     */
    getTemplatePacks() {
        return {
            default: [
                { label: 'Resumo', html: '<p><strong>Resumo:</strong> &lt;insira resumo do personagem&gt;</p>' },
                { label: 'Infância', html: '<h3>Infância</h3><p>&lt;detalhes da infância&gt;</p>' },
                { label: 'Família', html: '<h3>Família</h3><p>&lt;descreva família e relações&gt;</p>' },
                { label: 'Eventos Marcantes', html: '<h3>Eventos Marcantes</h3><ul><li>&lt;evento 1&gt;</li><li>&lt;evento 2&gt;</li></ul>' },
                { label: 'Conexões', html: '<h3>Conexões</h3><p>&lt;lista de NPCs importantes&gt;</p>' },
                { label: 'Segredos', html: '<h3>Segredos</h3><p>&lt;segredos e segredos ocultos&gt;</p>' },
                { label: 'Motivações', html: '<h3>Motivações</h3><p>&lt;motivações do personagem&gt;</p>' },
                { label: 'Habilidades Notáveis', html: '<h3>Habilidades Notáveis</h3><ul><li>&lt;habilidade 1&gt;</li></ul>' },
                { label: 'Relacionamentos', html: '<h3>Relacionamentos</h3><p>&lt;descrição das relações&gt;</p>' },
                { label: 'Diário / Notas', html: '<h3>Diário</h3><p>&lt;anotações, memórias e diário&gt;</p>' }
            ],
            npcs: [
                { label: 'NPC - Descrição', html: '<h3>Nome do NPC</h3><p>&lt;descrição física e personalidade&gt;</p>' },
                { label: 'NPC - Motivação', html: '<h3>Motivação</h3><p>&lt;objetivos e desejos&gt;</p>' },
                { label: 'NPC - Conexões', html: '<h3>Conexões</h3><p>&lt;ligações com o jogador ou facções&gt;</p>' }
            ],
            campanha: [
                { label: 'Campanha - Premissa', html: '<h3>Premissa</h3><p>&lt;breve descrição da campanha&gt;</p>' },
                { label: 'Campanha - Ganchos', html: '<h3>Ganchos</h3><ul><li>&lt;gancho 1&gt;</li></ul>' }
            ],
            missoes: [
                { label: 'Missão - Resumo', html: '<h3>Missão</h3><p>&lt;resumo da missão&gt;</p>' },
                { label: 'Missão - Objetivos', html: '<h3>Objetivos</h3><ul><li>&lt;objetivo 1&gt;</li></ul>' }
            ],
            conflitos: [
                { label: 'Conflito - Defesa', html: '<h3>Conflito</h3><p>&lt;partes envolvidas e motivo&gt;</p>' }
            ],
            cidade: [
                { label: 'Cidade - Visão Geral', html: '<h3>Cidade</h3><p>&lt;descrição geral&gt;</p>' },
                { label: 'Cidade - Locais', html: '<h3>Locais</h3><ul><li>&lt;local 1&gt;</li></ul>' }
            ],
            culturas: [
                { label: 'Cultura - Costumes', html: '<h3>Cultura</h3><p>&lt;costumes e tradições&gt;</p>' },
                { label: 'Cultura - Língua', html: '<h3>Língua</h3><p>&lt;observações linguísticas&gt;</p>' }
            ]
        };
    }

    /**
     * Adiciona um pack por chave
     */
    addTemplatePack(key) {
        const packs = this.getTemplatePacks();
        const pack = packs[key] || packs['default'];
        this._backgroundTemplates = this._backgroundTemplates || [];
        const existingLabels = new Set(this._backgroundTemplates.map(t => t.label));
        pack.forEach(t => { if (!existingLabels.has(t.label)) this._backgroundTemplates.push(t); });
        this.saveTemplatesToStorage();
    }

    exportTemplates() {
        try {
            const data = JSON.stringify(this._backgroundTemplates || [], null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'background-templates.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.warn('Erro exportando templates', e);
            alert('Erro ao exportar templates');
        }
    }

    /**
     * Valida campos editáveis
     */
    validate() {
        console.log('✓ Validando dados...');

        const nome = this.tempValues.nomePersonagem.trim();
        const titulo = this.tempValues.tituloPersonagem.trim();

        if (!nome) {
            console.warn('⚠️ Nome do personagem está vazio');
            alert('Por favor, digite um nome para o personagem');
            return false;
        }

        if (nome.length > 50) {
            console.warn('⚠️ Nome excede limite de 50 caracteres');
            alert('Nome não pode exceder 50 caracteres');
            return false;
        }

        if (titulo.length > 50) {
            console.warn('⚠️ Título excede limite de 50 caracteres');
            alert('Título não pode exceder 50 caracteres');
            return false;
        }

        return true;
    }

    /**
     * Salva os dados
     */
    save() {
        console.log('💾 Salvando dados...');

        if (!this.validate()) {
            return;
        }

        // Verificar se houve mudanças (em qualquer campo)
        const mudancas = Object.keys(this.tempValues).some(key => 
            this.tempValues[key] !== this.originalValues[key]
        );

        if (!mudancas) {
            console.log('ℹ️ Nenhuma alteração detectada');
            this.close();
            return;
        }

        if (typeof atributosManager === 'undefined') {
            console.warn('⚠️ AtributosManager não encontrado');
            alert('Erro: Sistema de atributos não disponível');
            return;
        }

        // Atualizar dados no AtributosManager
        atributosManager.personagemData.nome = this.tempValues.nomePersonagem;
        atributosManager.personagemData.titulo = this.tempValues.tituloPersonagem;
        atributosManager.personagemData.background = this.tempValues.background;
        atributosManager.personagemData.origem = this.tempValues.origem;
        atributosManager.personagemData.afiliacao = this.tempValues.afiliacao;
        atributosManager.personagemData.statusNarrativo = this.tempValues.statusNarrativo;
        atributosManager.personagemData.notasAdicionais = this.tempValues.notasAdicionais;

        // ✅ PERSISTIR EM LOCALSTORAGE
        if (window.appState && window.localStorageManager) {
            const state = window.appState.getState();
            // Atualizar estado com os novos dados
            const jogadorInfoAtualizado = {
                nomePersonagem: this.tempValues.nomePersonagem,
                tituloPersonagem: this.tempValues.tituloPersonagem,
                classePersonagem: this.tempValues.classePersonagem,
                racaPersonagem: this.tempValues.racaPersonagem,
                origem: this.tempValues.origem,
                afiliacao: this.tempValues.afiliacao,
                statusNarrativo: this.tempValues.statusNarrativo,
                notasAdicionais: this.tempValues.notasAdicionais,
                background: this.tempValues.background
            };
            
            // Salvar no state
            state.jogadorInfo = jogadorInfoAtualizado;
            window.appState.setState(state);
            
            // Salvar em localStorage
            window.localStorageManager.saveJogadorInfo(jogadorInfoAtualizado);
            console.log('💾 Informações do jogador salvos em localStorage');
        }

        // Atualizar exibição na aba de atributos
        this.updateAttributesDisplay();

        // Atualizar valores originais para próxima edição
        this.originalValues = { ...this.tempValues };

        console.log('✓ Dados salvos com sucesso');
        alert('✅ Dados salvos com sucesso!');
        this.close();
    }

    /**
     * Atualiza a exibição na aba de atributos principal
     */
    updateAttributesDisplay() {
        console.log('🎨 Atualizando exibição de atributos...');

        // Atualizar nome
        const nomeElement = document.querySelector('#personagem-nome');
        if (nomeElement) {
            nomeElement.textContent = this.tempValues.nomePersonagem;
        }

        // Atualizar título
        const tituloElement = document.querySelector('#personagem-titulo');
        if (tituloElement) {
            tituloElement.textContent = this.tempValues.tituloPersonagem;
        }

        // Atualizar classe
        const classeElement = document.querySelector('#personagem-classe');
        if (classeElement) {
            const classe = this.tempValues.classePersonagem || 'Classe';
            classeElement.textContent = classe;
        }

        // Atualizar raça
        const racaElement = document.querySelector('#personagem-raca');
        if (racaElement) {
            const raca = this.tempValues.racaPersonagem || 'Raça';
            racaElement.textContent = raca;
        }

        // ✅ Sincronizar com AtributosManager para que renderize corretamente
        if (typeof atributosManager !== 'undefined') {
            atributosManager.personagemData.nome = this.tempValues.nomePersonagem;
            atributosManager.personagemData.titulo = this.tempValues.tituloPersonagem;
            atributosManager.personagemData.classe = this.tempValues.classePersonagem;
            
            // Converter nome da raça para código
            const racaCodigos = {
                'Humano': 'humano',
                'Elfo': 'elfo',
                'Anão': 'anao'
            };
            const racaCodigo = racaCodigos[this.tempValues.racaPersonagem];
            if (racaCodigo) {
                atributosManager.personagemData.raca = racaCodigo;
            }
            
            // Re-renderizar para refletir mudanças
            atributosManager.renderizarPersonagem();
            console.log('✅ AtributosManager sincronizado e re-renderizado');
        }

        console.log('✓ Exibição atualizada');
    }

    /**
     * Abre o popup
     */
    open() {
        if (this.isOpen) return;
        
        console.log('📂 Abrindo popup de informações...');
        this.loadValuesFromState();
        
        const overlay = document.querySelector('#popup-info-jogador-overlay');
        if (overlay) {
            overlay.dataset.jsReady = 'true';
            overlay.style.display = 'flex';
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
            this.isOpen = true;
            console.log('✓ Popup visível');
        }
    }

    /**
     * Fecha o popup
     */
    close() {
        if (!this.isOpen) return;
        
        console.log('📁 Fechando popup de informações...');
        const overlay = document.querySelector('#popup-info-jogador-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
            overlay.dataset.jsReady = 'false';
            overlay.style.display = 'none';
            this.isOpen = false;
        }

        // Restaurar valores originais se não foi salvo
        this.tempValues = { ...this.originalValues };
    }

    /**
     * Volta para o menu principal
     * Mantém todos os dados salvos
     */
    voltarMenu() {
        console.log('🔙 Voltando do popup de info para o menu principal...');
        this.close();
        
        // Aguardar a animação de fechamento
        setTimeout(() => {
            const btnMenu = document.getElementById('btn-menu-principal');
            if (btnMenu) {
                btnMenu.click();
                btnMenu.focus();
                console.log('✅ Voltado com sucesso para o menu principal');
            } else {
                console.warn('⚠️ Botão do menu principal não encontrado');
            }
        }, 300);
    }

    /**
     * Retorna o status atual do popup
     */
    getStatus() {
        return {
            isOpen: this.isOpen,
            activeTab: this.activeTab,
            tempValues: { ...this.tempValues },
            hasChanges: this.tempValues !== this.originalValues
        };
    }

    /**
     * Debug do popup
     */
    debug() {
        console.group('Estado do Popup de Informações');
        console.table(this.getStatus());
        console.groupEnd();
    }
}

/* ================================================= */
/* INICIALIZAÇÃO                                     */
/* ================================================= */

let popupInfoJogador = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOMContentLoaded disparado - PopupInfoJogador');
    
    // Aguardar um pequeno delay para garantir que atributosManager está pronto
    setTimeout(() => {
        popupInfoJogador = new PopupInfoJogador();
        window.popupInfoJogador = popupInfoJogador;
        console.log('🎯 popupInfoJogador disponível globalmente');
    }, 100);
});
