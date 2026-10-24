import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Placeholder } from '@tiptap/extension-placeholder';

const AlignableImage = Image.extend({
  addAttributes() {
    const attributes = this.parent?.() ?? {};

    return {
      ...attributes,
      align: {
        default: 'center',
        parseHTML: element => {
          const align = element.getAttribute('data-align') || element.style.float || element.style.marginLeft || element.style.marginRight;
          return align === 'left' || align === 'right' || align === 'center' ? align : 'center';
        },
        renderHTML: ({ align }) => {
          const value = align || 'center';

          if (value === 'left') {
            return { 'data-align': 'left', style: 'float: left; margin: 0 1rem 0 0;' };
          }

          if (value === 'right') {
            return { 'data-align': 'right', style: 'float: right; margin: 0 0 0 1rem;' };
          }

          return { 'data-align': 'center', style: 'display: block; margin: 0 auto; max-width: 100%;' };
        },
      },
    };
  },
});
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Popover from '@mui/material/Popover';

import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  HorizontalRule,
  Link as LinkIcon,
  Image as ImageIcon,
  TableChart,
  Undo,
  Redo,
  Remove,
  FormatColorText,
  Highlight as HighlightIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Expand,
  Close,
} from '@mui/icons-material';

import { MOBILE } from 'common/styles/breakpoints';
import { normalizeBackgroundDoc, getBackgroundStats } from 'common/utils/backgroundRich';

const ToolbarBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px 12px;
  border-bottom: 1px solid rgba(84, 125, 255, 0.18);
  background: rgba(20, 15, 35, 0.88);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  position: sticky;
  top: 0;
  z-index: 3;
  flex-shrink: 0;
`;

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  min-width: 0;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  padding-bottom: 2px;
`;

const ToolbarGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
`;

const EditorShell = styled.div`
  border: 1px solid rgba(84, 125, 255, 0.18);
  border-radius: 22px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(19, 13, 30, 0.96), rgba(13, 12, 22, 0.98));
  box-shadow: inset 0 0 0 1px rgba(145, 130, 255, 0.12), 0 16px 36px rgba(0, 0, 0, 0.22);
  min-height: 460px;
  display: flex;
  flex-direction: column;

  &:focus-within {
    border-color: rgba(126, 107, 255, 0.7);
    box-shadow: 0 0 0 4px rgba(84, 125, 255, 0.14), inset 0 0 0 1px rgba(145, 130, 255, 0.2);
  }

  ${MOBILE} {
    min-height: 360px;
  }
`;

const EditorArea = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
  overflow: auto;
  padding: 18px 18px 12px;
  background: rgba(12, 12, 24, 0.7);
  display: flex;
  flex-direction: column;

  .ProseMirror {
    flex: 1 1 auto;
    min-height: 100%;
    height: 100%;
    line-height: 1.7;
    color: rgba(255,255,255,0.96);
    outline: none;
    font-size: 1rem;
    font-family: 'Segoe UI', sans-serif;
    box-sizing: border-box;
  }

  .ProseMirror p,
  .ProseMirror ul,
  .ProseMirror ol,
  .ProseMirror blockquote,
  .ProseMirror pre,
  .ProseMirror table {
    margin: 0 0 1rem;
  }

  .ProseMirror a {
    color: #9ec2ff;
    text-decoration: underline;
  }

  .ProseMirror img {
    max-width: 100%;
    border-radius: 12px;
    margin: 0.75rem 0;
  }

  .ProseMirror img[data-align='left'] {
    float: left;
    margin: 0 1rem 0.75rem 0;
    max-width: 45%;
  }

  .ProseMirror img[data-align='center'] {
    display: block;
    margin: 0 auto 0.75rem;
    max-width: 100%;
  }

  .ProseMirror img[data-align='right'] {
    float: right;
    margin: 0 0 0.75rem 1rem;
    max-width: 45%;
  }

  .ProseMirror table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .ProseMirror th,
  .ProseMirror td {
    border: 1px solid rgba(255,255,255,0.14);
    padding: 10px 12px;
    min-width: 70px;
    vertical-align: top;
    background: rgba(255,255,255,0.02);
  }

  .ProseMirror blockquote {
    border-left: 3px solid rgba(216, 180, 106, 0.9);
    background: rgba(216, 180, 106, 0.08);
    padding: 0.9rem 1rem;
    border-radius: 0 12px 12px 0;
    color: rgba(255,255,255,0.8);
  }

  .ProseMirror hr {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.12);
    margin: 1.2rem 0;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding-left: 1.5rem;
  }

  .ProseMirror li {
    margin: 0.2rem 0;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: rgba(255,255,255,0.38);
    pointer-events: none;
    height: 0;
  }

  ${MOBILE} {
    max-height: 44vh;
    padding: 12px 12px 8px;
  }
`;

const FooterStats = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px 14px;
  background: rgba(18, 16, 31, 0.88);
  border-top: 1px solid rgba(84, 125, 255, 0.14);
  color: rgba(255,255,255,0.78);
  font-size: 0.82rem;
  letter-spacing: 0.02em;
`;

const ExpandedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px 14px;
  background: linear-gradient(180deg, rgba(26, 19, 38, 0.96), rgba(15, 13, 25, 0.94));
  border-bottom: 1px solid rgba(127, 138, 255, 0.2);
  box-shadow: inset 0 -1px 0 rgba(255,255,255,0.04);
`;

const ExpandedHeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ExpandedTitleText = styled.h3`
  margin: 0;
  color: #f3f0ff;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const ExpandedSubtitle = styled.span`
  color: rgba(206, 210, 235, 0.78);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const ExpandedToolbar = styled(ToolbarBar)`
  padding: 14px 16px 12px;
  background: rgba(17, 14, 28, 0.9);
  border-bottom: 1px solid rgba(127, 138, 255, 0.14);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`;

const ExpandedEditorShell = styled(EditorShell)`
  border-radius: 0;
  border-left: 0;
  border-right: 0;
  border-bottom: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex: 1;
  background: linear-gradient(180deg, rgba(12, 11, 22, 0.94), rgba(10, 9, 18, 0.98));
`;

const ExpandedEditorArea = styled(EditorArea)`
  flex: 1;
  min-height: 0;
  max-height: none;
  background: rgba(13, 12, 24, 0.82);
  border-top: 1px solid rgba(127, 138, 255, 0.12);
  border-bottom: 1px solid rgba(127, 138, 255, 0.12);

  .ProseMirror {
    min-height: 100%;
    background: rgba(18, 15, 29, 0.86);
    border: 1px solid rgba(127, 138, 255, 0.12);
    border-radius: 16px;
    padding: 18px 18px 14px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
  }
`;

const ExpandedFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px 16px;
  background: rgba(17, 14, 28, 0.92);
  border-top: 1px solid rgba(127, 138, 255, 0.14);
`;

const ExpandedFooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
`;

const CompactLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const toolbarButtonSx = {
  color: '#e6e4f3',
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '10px',
  minWidth: 34,
  width: 34,
  height: 34,
  padding: 0,
  '&:hover': { background: 'rgba(84,125,255,0.12)', borderColor: 'rgba(84,125,255,0.2)' },
  '&.Mui-disabled': { color: 'rgba(255,255,255,0.28)' },
};

const panelSx = {
  minWidth: 120,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
  '& .MuiSelect-select': { color: '#f3f1ff', paddingY: 0.7 },
  '& .MuiSvgIcon-root': { color: '#cbd5ff' },
};

const TEXT_COLORS = ['#FFFFFF', '#000000', '#808080', '#D9D9D9', '#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63', '#D4AF37', '#7C4DFF', '#00BCD4', '#FF5722', '#795548'];
const HIGHLIGHT_COLORS = ['#F0F0F0', '#E9E9E9', '#D9D9D9', '#E3E7EE', '#EAE5D8', '#EAE7F3', '#F0E7F2', '#E4F0F2', '#F3E9D7', '#D9D9D9'];

const safeUrl = rawUrl => {
  if (!rawUrl) return '';
  const url = rawUrl.trim();
  if (!url) return '';
  const normalized = url.toLowerCase();
  if (/^(javascript:|data:|vbscript:)/i.test(normalized)) {
    return '';
  }
  if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url) || /^\//.test(url) || /^\./.test(url) || /^#/.test(url)) {
    return url;
  }
  return `https://${url}`;
};

const insertTable = (editor, rows, cols, withHeaderRow) => {
  if (!editor || !rows || !cols) return;
  editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
};

const BackgroundEditor = ({ value, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkValue, setLinkValue] = useState('');
  const [colorAnchorEl, setColorAnchorEl] = useState(null);
  const [highlightAnchorEl, setHighlightAnchorEl] = useState(null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageAlign, setImageAlign] = useState('center');
  const [recentColors, setRecentColors] = useState(['#FFFFFF', '#D4AF37', '#2196F3', '#F44336', '#4CAF50']);
  const lastEditorJsonRef = useRef('');
  const lastExternalValueRef = useRef('');
  const pendingUpdateRef = useRef(null);
  const rafRef = useRef(null);

  const editorExtensions = useMemo(
    () => [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle,
      Color,
      Highlight,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Underline,
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      AlignableImage.configure({ inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Escreva a história do personagem...' }),
    ],
    [],
  );

  const handlePaste = useCallback((view, event) => {
    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (!text) return false;
    const paragraph = text.replace(/\r\n/g, '\n');
    if (paragraph.includes('\n')) {
      event.preventDefault();
      const textNode = paragraph.split('\n').map(line => (line ? line : '')).join('\n');
      view.dispatch(view.state.tr.insertText(textNode));
      return true;
    }
    return false;
  }, []);

  const emitBackgroundChange = useCallback(nextJson => {
    if (!nextJson) return;

    const nextSerialized = JSON.stringify(nextJson);
    if (lastEditorJsonRef.current === nextSerialized) {
      return;
    }

    pendingUpdateRef.current = nextJson;

    if (rafRef.current) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      const latestJson = pendingUpdateRef.current ?? nextJson;
      lastEditorJsonRef.current = JSON.stringify(latestJson);
      pendingUpdateRef.current = null;
      rafRef.current = null;
      onChange(latestJson);
    });
  }, [onChange]);

  const editor = useEditor({
    extensions: editorExtensions,
    content: normalizeBackgroundDoc(value),
    editorProps: {
      attributes: {
        'data-placeholder': 'Escreva a história do personagem...',
      },
      handlePaste,
    },
    onUpdate: ({ editor: currentEditor }) => {
      emitBackgroundChange(currentEditor.getJSON());
    },
    shouldRerenderOnTransaction: false,
    immediatelyRender: false,
  });

  const stats = useMemo(() => getBackgroundStats(editor?.getJSON() ?? value), [editor, value]);

  useEffect(() => {
    if (!editor) return;

    const nextValue = normalizeBackgroundDoc(value);
    const nextSerialized = JSON.stringify(nextValue);
    const currentSerialized = JSON.stringify(editor.getJSON());

    if (nextSerialized === currentSerialized) {
      lastExternalValueRef.current = nextSerialized;
      return;
    }

    if (lastExternalValueRef.current === nextSerialized) {
      return;
    }

    lastExternalValueRef.current = nextSerialized;
    editor.commands.setContent(nextValue, { emitUpdate: false });
  }, [editor, value]);

  const addRecentColor = color => {
    if (!color) return;
    setRecentColors(prev => [color, ...prev.filter(item => item !== color)].slice(0, 8));
  };

  const applyTextColor = color => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
    addRecentColor(color);
    setColorAnchorEl(null);
  };

  const removeTextColor = () => {
    if (!editor) return;
    editor.chain().focus().setColor('#FFFFFF').run();
    setColorAnchorEl(null);
  };

  const applyHighlight = color => {
    if (!editor) return;
    editor.chain().focus().toggleHighlight({ color }).run();
    addRecentColor(color);
    setHighlightAnchorEl(null);
  };

  const removeHighlight = () => {
    if (!editor) return;
    editor.chain().focus().unsetHighlight().run();
    setHighlightAnchorEl(null);
  };

  const openLinkDialog = () => {
    if (!editor) return;
    const selectedText = editor.state.selection.empty ? '' : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
    const existingHref = editor.getAttributes('link').href ?? '';
    setLinkText(selectedText || '');
    setLinkUrl(existingHref || '');
    setLinkValue(existingHref || '');
    setLinkDialogOpen(true);
  };

  const applyLink = () => {
    openLinkDialog();
  };

  const saveLink = () => {
    if (!editor) return;
    const normalizedUrl = safeUrl(linkValue || linkUrl);
    const displayText = linkText.trim();

    if (!normalizedUrl) {
      editor.chain().focus().unsetLink().run();
      setLinkDialogOpen(false);
      return;
    }

    if (editor.state.selection.empty) {
      const text = displayText || normalizedUrl;
      editor.chain().focus().insertContent({
        type: 'text',
        text,
        marks: [{ type: 'link', attrs: { href: normalizedUrl, target: '_blank', rel: 'noopener noreferrer' } }],
      }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl, target: '_blank', rel: 'noopener noreferrer' }).run();
    }

    setLinkDialogOpen(false);
    setLinkText('');
    setLinkUrl('');
    setLinkValue('');
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkDialogOpen(false);
    setLinkText('');
    setLinkUrl('');
    setLinkValue('');
  };

  const applyImage = () => {
    setImageDialogOpen(true);
  };

  const confirmTableInsert = () => {
    insertTable(editor, tableRows, tableCols, tableHasHeader);
    setTableDialogOpen(false);
  };

  const applyImageInsert = () => {
    if (!editor) return;
    const normalizedUrl = safeUrl(imageUrl);
    if (!normalizedUrl) return;

    editor.chain().focus().setImage({
      src: normalizedUrl,
      alt: imageAlt || 'Imagem do background',
      title: imageAlt || 'Imagem do background',
      align: imageAlign,
    }).run();

    setImageDialogOpen(false);
    setImageUrl('');
    setImageAlt('');
    setImageAlign('center');
  };

  const currentTextColor = editor?.getAttributes('textStyle').color || '#FFFFFF';
  const currentHighlightColor = editor?.getAttributes('highlight').color || '#F0F0F0';

  const handleTableContextAction = action => {
    if (!editor) return;
    if (action === 'addRow') editor.chain().focus().addRowAfter().run();
    if (action === 'removeRow') editor.chain().focus().deleteRow().run();
    if (action === 'addColumn') editor.chain().focus().addColumnAfter().run();
    if (action === 'removeColumn') editor.chain().focus().deleteColumn().run();
    if (action === 'deleteTable') editor.chain().focus().deleteTable().run();
  };

  const renderToolbar = mode => {
    const toolbarContent = (
      <ToolbarRow>
        <ToolbarGroup>
          <Tooltip title="Desfazer"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}><Undo fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Refazer"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}><Redo fontSize="small" /></IconButton></span></Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip title="Negrito"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleBold().run()} color={editor?.isActive('bold') ? 'primary' : 'default'}><FormatBold fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Itálico"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleItalic().run()} color={editor?.isActive('italic') ? 'primary' : 'default'}><FormatItalic fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Sublinhado"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleUnderline().run()} color={editor?.isActive('underline') ? 'primary' : 'default'}><FormatUnderlined fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Tachado"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleStrike().run()} color={editor?.isActive('strike') ? 'primary' : 'default'}><StrikethroughS fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Subscrito"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleSubscript().run()} color={editor?.isActive('subscript') ? 'primary' : 'default'}><SubscriptIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Sobrescrito"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleSuperscript().run()} color={editor?.isActive('superscript') ? 'primary' : 'default'}><SuperscriptIcon fontSize="small" /></IconButton></span></Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip title="Cor do texto"><span><IconButton size="small" sx={{ ...toolbarButtonSx, background: currentTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.04)' : currentTextColor, borderColor: currentTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : currentTextColor }} onClick={event => setColorAnchorEl(event.currentTarget)}><FormatColorText fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Destaque"><span><IconButton size="small" sx={{
            ...toolbarButtonSx,
            background: currentHighlightColor ? 'rgba(130, 142, 170, 0.18)' : 'rgba(255,255,255,0.04)',
            borderColor: currentHighlightColor ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
            color: '#f3f4f8',
          }} onClick={event => setHighlightAnchorEl(event.currentTarget)}><HighlightIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Remover formatação"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}><Remove fontSize="small" /></IconButton></span></Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip title="Alinhar à esquerda"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().setTextAlign('left').run()} color={editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}><FormatAlignLeft fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Centralizar"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().setTextAlign('center').run()} color={editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}><FormatAlignCenter fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Alinhar à direita"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().setTextAlign('right').run()} color={editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}><FormatAlignRight fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Justificar"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().setTextAlign('justify').run()} color={editor?.isActive({ textAlign: 'justify' }) ? 'primary' : 'default'}><FormatAlignJustify fontSize="small" /></IconButton></span></Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip title="Lista numerada"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleOrderedList().run()} color={editor?.isActive('orderedList') ? 'primary' : 'default'}><FormatListNumbered fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Lista com marcadores"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleBulletList().run()} color={editor?.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulleted fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Citação"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().toggleBlockquote().run()} color={editor?.isActive('blockquote') ? 'primary' : 'default'}><FormatQuote fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Linha divisória"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => editor?.chain().focus().setHorizontalRule().run()}><HorizontalRule fontSize="small" /></IconButton></span></Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip title="Inserir link"><span><IconButton size="small" sx={toolbarButtonSx} onClick={applyLink}><LinkIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Inserir tabela"><span><IconButton size="small" sx={toolbarButtonSx} onClick={() => setTableDialogOpen(true)}><TableChart fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Inserir imagem"><span><IconButton size="small" aria-label="Inserir imagem" sx={toolbarButtonSx} onClick={applyImage}><ImageIcon fontSize="small" /></IconButton></span></Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip title={mode === 'full' ? 'Expandir editor' : 'Voltar ao editor'}><span><IconButton aria-label={mode === 'full' ? 'Expandir editor' : 'Voltar ao editor'} size="small" sx={toolbarButtonSx} onClick={() => setExpanded(value => !value)}>{mode === 'full' ? <Expand fontSize="small" /> : <Close fontSize="small" />}</IconButton></span></Tooltip>
        </ToolbarGroup>
      </ToolbarRow>
    );

    return <ToolbarBar>{toolbarContent}</ToolbarBar>;
  };

  return (
    <>
      <EditorShell>
        {renderToolbar('full')}

        <EditorArea>
          <EditorContent editor={editor} />
        </EditorArea>

        <FooterStats>
          <CompactLabel>{stats.caracteres.toLocaleString('pt-BR')} caracteres • {stats.palavras.toLocaleString('pt-BR')} palavras</CompactLabel>
        </FooterStats>
      </EditorShell>

      <Popover open={Boolean(colorAnchorEl)} anchorEl={colorAnchorEl} onClose={() => setColorAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }} slotProps={{ paper: { sx: { background: 'rgba(19, 15, 34, 0.98)', border: '1px solid rgba(100,120,255,0.25)', borderRadius: 3, p: 1.5, color: '#fff' } } }}>
        <Box sx={{ display: 'grid', gap: 1.5, maxWidth: 270 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {TEXT_COLORS.map(color => (
              <Button key={color} variant="outlined" onClick={() => applyTextColor(color)} sx={{ minWidth: 0, width: 32, height: 32, p: 0, borderColor: 'rgba(255,255,255,0.12)', background: color, borderRadius: 1 }} aria-label={`Cor ${color}`} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recentColors.map(color => (
              <Button key={color} variant="outlined" onClick={() => applyTextColor(color)} sx={{ minWidth: 0, width: 28, height: 28, p: 0, borderColor: 'rgba(255,255,255,0.12)', background: color, borderRadius: 1 }} aria-label={`Cor recente ${color}`} />
            ))}
          </Box>
          <TextField label="Hexadecimal" value={currentTextColor} onChange={event => applyTextColor(event.target.value)} size="small" fullWidth sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
          <Button variant="text" onClick={removeTextColor} sx={{ color: '#dbe3ff' }}>Restaurar cor padrão</Button>
        </Box>
      </Popover>

      <Popover open={Boolean(highlightAnchorEl)} anchorEl={highlightAnchorEl} onClose={() => setHighlightAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }} slotProps={{ paper: { sx: { background: 'rgba(19, 15, 34, 0.98)', border: '1px solid rgba(100,120,255,0.25)', borderRadius: 3, p: 1.5, color: '#fff' } } }}>
        <Box sx={{ display: 'grid', gap: 1.5, maxWidth: 270 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {HIGHLIGHT_COLORS.map(color => (
              <Button key={color} variant="outlined" onClick={() => applyHighlight(color)} sx={{ minWidth: 0, width: 32, height: 32, p: 0, borderColor: 'rgba(255,255,255,0.12)', background: color, borderRadius: 1 }} aria-label={`Destaque ${color}`} />
            ))}
          </Box>
          <TextField label="Cor do destaque" value={currentHighlightColor} onChange={event => applyHighlight(event.target.value)} size="small" fullWidth sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
          <Button variant="text" onClick={removeHighlight} sx={{ color: '#dbe3ff' }}>Remover destaque</Button>
        </Box>
      </Popover>

      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ background: 'rgba(18, 16, 30, 0.98)', color: '#fff' }}>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField label="Texto exibido" value={linkText} onChange={event => setLinkText(event.target.value)} fullWidth size="small" sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
            <TextField label="Endereço URL" value={linkValue || linkUrl} onChange={event => { setLinkValue(event.target.value); setLinkUrl(event.target.value); }} fullWidth size="small" placeholder="https://exemplo.com" sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(18, 16, 30, 0.98)', px: 2, pb: 2 }}>
          <Button onClick={() => setLinkDialogOpen(false)} sx={{ color: '#d9d1f7' }}>Cancelar</Button>
          <Button onClick={removeLink} sx={{ color: '#ffb4b4' }}>Remover link</Button>
          <Button variant="contained" onClick={saveLink} sx={{ background: 'linear-gradient(135deg, #7b6ef6, #a778ff)', color: '#fff' }}>Inserir link</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={tableDialogOpen} onClose={() => setTableDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ background: 'rgba(18, 16, 30, 0.98)', color: '#fff' }}>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Colunas" type="number" value={tableCols} onChange={event => setTableCols(Math.max(1, Number(event.target.value) || 1))} size="small" inputProps={{ min: 1, max: 12 }} sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
              <TextField label="Linhas" type="number" value={tableRows} onChange={event => setTableRows(Math.max(1, Number(event.target.value) || 1))} size="small" inputProps={{ min: 1, max: 12 }} sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, p: 1, borderRadius: 2, border: '1px solid rgba(100,120,255,0.2)', background: 'rgba(255,255,255,0.02)' }}>
              {Array.from({ length: 12 }).map((_, index) => (
                <Box key={`preview-${index}`} sx={{ aspectRatio: '1 / 1', borderRadius: 1, border: '1px solid rgba(255,255,255,0.12)', background: (index < tableCols || index % 4 < tableCols) ? 'rgba(123,110,246,0.2)' : 'rgba(255,255,255,0.02)' }} />
              ))}
            </Box>
            <Button onClick={() => setTableHasHeader(value => !value)} sx={{ justifyContent: 'flex-start', color: '#dbe3ff' }}>
              {tableHasHeader ? 'Com cabeçalho' : 'Sem cabeçalho'}
            </Button>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" onClick={() => handleTableContextAction('addRow')} sx={{ color: '#dbe3ff' }}>+ linha</Button>
              <Button size="small" onClick={() => handleTableContextAction('addColumn')} sx={{ color: '#dbe3ff' }}>+ coluna</Button>
              <Button size="small" onClick={() => handleTableContextAction('deleteTable')} sx={{ color: '#ffb4b4' }}>Excluir tabela</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(18, 16, 30, 0.98)', px: 2, pb: 2 }}>
          <Button onClick={() => setTableDialogOpen(false)} sx={{ color: '#d9d1f7' }}>Cancelar</Button>
          <Button variant="contained" onClick={confirmTableInsert} sx={{ background: 'linear-gradient(135deg, #7b6ef6, #a778ff)', color: '#fff' }}>Inserir tabela</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ background: 'rgba(18, 16, 30, 0.98)', color: '#fff' }}>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField label="URL da imagem" value={imageUrl} onChange={event => setImageUrl(event.target.value)} fullWidth size="small" placeholder="https://..." sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
            <TextField label="Texto alternativo" value={imageAlt} onChange={event => setImageAlt(event.target.value)} fullWidth size="small" sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
            <FormControl size="small" fullWidth>
              <InputLabel id="image-align-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>Alinhamento</InputLabel>
              <Select labelId="image-align-label" id="image-align" value={imageAlign} label="Alinhamento" onChange={event => setImageAlign(event.target.value)} sx={{ ...panelSx, minWidth: 150 }}>
                <MenuItem value="left">Esquerda</MenuItem>
                <MenuItem value="center">Centro</MenuItem>
                <MenuItem value="right">Direita</MenuItem>
              </Select>
            </FormControl>
            {imageUrl && (
              <Box sx={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, p: 1, minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <img src={safeUrl(imageUrl)} alt={imageAlt || 'Prévia'} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 12 }} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(18, 16, 30, 0.98)', px: 2, pb: 2 }}>
          <Button onClick={() => setImageDialogOpen(false)} sx={{ color: '#d9d1f7' }}>Cancelar</Button>
          <Button variant="contained" onClick={applyImageInsert} sx={{ background: 'linear-gradient(135deg, #7b6ef6, #a778ff)', color: '#fff' }}>Inserir imagem</Button>
        </DialogActions>
      </Dialog>

      {expanded && (
        <Dialog
          open={expanded}
          onClose={() => setExpanded(false)}
          fullWidth
          maxWidth="xl"
          sx={{
            '& .MuiDialog-paper': {
              height: '92vh',
              maxHeight: '92vh',
              background: 'linear-gradient(180deg, rgba(12, 11, 20, 0.99), rgba(9, 8, 16, 0.99))',
              border: '1px solid rgba(127, 138, 255, 0.2)',
              borderRadius: '22px',
              boxShadow: '0 24px 60px rgba(7, 5, 18, 0.7)',
              overflow: 'hidden',
            },
          }}
        >
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(12,11,20,0.98)' }}>
            <ExpandedHeader>
              <ExpandedHeaderTitle>
                <ExpandedTitleText>Editor Expandido</ExpandedTitleText>
                <ExpandedSubtitle>Background do personagem</ExpandedSubtitle>
              </ExpandedHeaderTitle>
              <IconButton
                aria-label="Fechar editor expandido"
                onClick={() => setExpanded(false)}
                size="small"
                sx={{
                  color: '#e7e2ff',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  '&:hover': { background: 'rgba(113,130,255,0.15)', borderColor: 'rgba(113,130,255,0.32)' },
                }}
              >
                <Close />
              </IconButton>
            </ExpandedHeader>

            <ExpandedToolbar>
              {renderToolbar('compact')}
            </ExpandedToolbar>

            <ExpandedEditorShell>
              <ExpandedEditorArea>
                <EditorContent editor={editor} />
              </ExpandedEditorArea>
            </ExpandedEditorShell>

            <ExpandedFooter>
              <CompactLabel>{stats.caracteres.toLocaleString('pt-BR')} caracteres • {stats.palavras.toLocaleString('pt-BR')} palavras</CompactLabel>

              <ExpandedFooterActions>
                <Button
                  variant="outlined"
                  onClick={() => setExpanded(false)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.18)',
                    color: '#eef2ff',
                    background: 'rgba(255,255,255,0.02)',
                    '&:hover': { borderColor: 'rgba(143,163,255,0.5)', background: 'rgba(143,163,255,0.08)' },
                  }}
                >
                  Voltar ao modal
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setExpanded(false)}
                  sx={{
                    background: 'linear-gradient(135deg, #8a7dff, #5b7cfa)',
                    color: '#fff',
                    boxShadow: '0 10px 24px rgba(91, 124, 250, 0.35)',
                    '&:hover': { background: 'linear-gradient(135deg, #978cff, #6a8afc)' },
                  }}
                >
                  Salvar
                </Button>
              </ExpandedFooterActions>
            </ExpandedFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

BackgroundEditor.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func.isRequired,
};

BackgroundEditor.defaultProps = {
  value: '',
};

export default BackgroundEditor;
