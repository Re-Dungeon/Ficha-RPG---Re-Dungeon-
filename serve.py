#!/usr/bin/env python3
"""
Servidor local para ReDungeon Ficha
Executa a aplicação em localhost:8000
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000
DIRECTORY = str(Path(__file__).parent)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Adicionar headers CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    print(f"🚀 Iniciando servidor em http://localhost:{PORT}")
    print(f"📁 Diretório: {DIRECTORY}")
    print(f"🌐 Abra seu navegador em: http://localhost:{PORT}/index.html")
    print(f"⏹️  Para parar, pressione Ctrl+C\n")
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            # Abrir navegador automaticamente
            webbrowser.open(f'http://localhost:{PORT}/index.html')
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✅ Servidor parado.")
    except OSError as e:
        print(f"❌ Erro: Porta {PORT} já está em uso!")
        print(f"   Use: python serve.py --port 8001")
