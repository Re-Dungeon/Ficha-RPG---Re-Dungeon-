/* ============================================================================
   ASTRAL-CORE-MODAL.JS
   Gerenciador da modal de visualizacao do Nucleo Astral
   ============================================================================ */

class AstralCoreModalManager {
  constructor() {
    this.modal = document.getElementById("astral-core-modal");
    this.overlay = document.getElementById("astral-core-modal-overlay");
    this.closeBtn = document.getElementById("btn-fechar-astral-core-modal");
    this.body = document.getElementById("astral-core-modal-body");
    this.title = document.getElementById("astral-core-modal-title");
    this.coreImage = document.querySelector(".core-crystal-image");

    this.init();
  }

  init() {
    if (!this.modal) {
      console.warn("Modal de nucleo astral nao encontrada");
      return;
    }

    if (this.coreImage) {
      this.coreImage.addEventListener("click", () => this.open());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }
    if (this.overlay) {
      this.overlay.addEventListener("click", () => this.close());
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("active")) {
        this.close();
      }
    });

    console.log("AstralCoreModalManager inicializado");
  }

  open() {
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";

    const sistema = window.veiasAstraisSystem;
    if (sistema && !sistema.initialized) {
      // Sistema existe mas ainda não foi inicializado — inicializar antes de renderizar
      sistema.init().then(() => this.renderBonusSummary());
    } else {
      this.renderBonusSummary();
    }
  }

  close() {
    this.modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggle() {
    if (this.modal.classList.contains("active")) {
      this.close();
    } else {
      this.open();
    }
  }

  renderBonusSummary() {
    if (!window.veiasAstraisSystem) {
      this.setContent(
        "<p style='color:#aaa;text-align:center;padding:20px;'>Sistema nao inicializado.</p>",
      );
      return;
    }

    const nodes = window.veiasAstraisSystem.nodes || [];
    const nodesWithBonus = nodes.filter(
      (n) =>
        n.bonus &&
        n.bonus.effect &&
        (n.state === "unlocked" || n.state === "maxed"),
    );

    if (nodesWithBonus.length === 0) {
      this.setContent(
        "<p style='color:#aaa;text-align:center;padding:20px;'>Nenhum aprimoramento ativo ainda.</p>",
      );
      return;
    }

    const bonusesByTree = {};
    nodesWithBonus.forEach((node) => {
      if (!bonusesByTree[node.treeId]) bonusesByTree[node.treeId] = [];
      bonusesByTree[node.treeId].push({
        nodeName: node.name,
        level: node.level,
        layer: node.layer,
        effect: node.bonus.effect,
        state: node.state,
      });
    });

    const treeNames = {
      arty: "Arty",
      aune: "Aune",
      ephelias: "Ephelias",
      nishi: "Nishi",
      hestia: "Hestia",
    };
    const treeColors = {
      arty: "#ff4444",
      aune: "#ffdd44",
      ephelias: "#4477dd",
      nishi: "#9966ff",
      hestia: "#66dd66",
    };

    const totalAtivos = nodesWithBonus.length;

    let html = `
      <div class="bonus-summary-container">
        <div style="text-align:center;margin-bottom:24px;">
          <h3 style="margin:0 0 6px 0;color:#e0c3fc;font-size:16px;letter-spacing:1px;">Aprimoramentos Astrais</h3>
          <p style="margin:0;font-size:12px;color:#888;">${totalAtivos} aprimoramentos ativos</p>
        </div>
    `;

    ["arty", "aune", "ephelias", "nishi", "hestia"].forEach((treeId) => {
      const bonuses = bonusesByTree[treeId];
      if (!bonuses) return;

      const treeName = treeNames[treeId] || treeId;
      const treeColor = treeColors[treeId] || "#ccc";
      const ativos = bonuses.length;

      bonuses.sort((a, b) => a.layer - b.layer);

      html += `
        <div class="bonus-tree-section" style="border-left:4px solid ${treeColor};padding:12px 15px;margin-bottom:16px;border-radius:0 6px 6px 0;background:rgba(255,255,255,0.02);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h4 style="margin:0;color:${treeColor};font-size:13px;font-weight:600;">${treeName}</h4>
            <span style="font-size:11px;color:#888;background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:10px;">${bonuses.length}</span>
          </div>
          <div class="bonus-list">
      `;

      bonuses.forEach((bonus) => {
        const stateIcon = bonus.state === "maxed" ? "&#9819;" : "&#128275;";
        const opacity = "1";

        html += `
          <div class="bonus-item" style="margin-bottom:8px;padding:8px 10px;background:rgba(255,255,255,0.06);border-radius:4px;border-left:2px solid ${treeColor};opacity:${opacity};">
            <div style="font-size:11px;color:${treeColor};font-weight:600;margin-bottom:3px;">
              ${stateIcon} ${bonus.nodeName} <span style="color:#666;font-weight:400;font-size:10px;">(Nivel ${bonus.level})</span>
            </div>
            <div style="font-size:12px;color:#ccc;line-height:1.4;">${bonus.effect}</div>
          </div>
        `;
      });

      html += `</div></div>`;
    });

    html += `
        <div style="margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;font-size:12px;color:#888;">
          Total: <strong style="color:#e0c3fc;">${totalAtivos}</strong> aprimoramentos ativos
        </div>
      </div>
    `;

    this.setContent(html);
  }

  setTitle(title) {
    if (this.title) this.title.textContent = title;
  }

  setContent(content) {
    if (!this.body) return;
    if (typeof content === "string") {
      this.body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.body.innerHTML = "";
      this.body.appendChild(content);
    }
  }

  clearContent() {
    if (this.body) this.body.innerHTML = "";
  }

  getContentElement() {
    return this.body;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const manager = new AstralCoreModalManager();
    window.astralCoreModal = manager;
    setTimeout(() => {
      const coreContainer = document.getElementById("astral-core");
      if (coreContainer) {
        coreContainer.style.cursor = "pointer";
        coreContainer.addEventListener("click", () => manager.open());
      }
    }, 100);
  });
} else {
  const manager = new AstralCoreModalManager();
  window.astralCoreModal = manager;
  setTimeout(() => {
    const coreContainer = document.getElementById("astral-core");
    if (coreContainer) {
      coreContainer.style.cursor = "pointer";
      coreContainer.addEventListener("click", () => manager.open());
    }
  }, 100);
}
