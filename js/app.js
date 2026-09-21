// filepath: js/app.js
import { Storage } from './storage.js';
import { Workspace } from './workspace.js';

// ponytail: basic entity encoding covers string interpolation; upgrade to DOMPurify when rich HTML supported.
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

export function initApp({ tools = {}, workflows = {}, mountSelector = '#main-content', sidebarSelector = '.workbench-sidebar' }) {
  const mountEl = document.querySelector(mountSelector);
  const sidebarEl = document.querySelector(sidebarSelector);

  const workflowRunner = {
    active: null,
    start(workflowId) {
      const wf = workflows[workflowId];
      if (!wf) return;
      this.active = workflowId;
      if (wf.steps?.length) {
        workspace.load(wf.steps[0].toolId, wf.steps[0].params);
      }
    },
    stop() {
      this.active = null;
    }
  };

  const workspace = new Workspace(mountEl, tools, {
    onNavigateTool: (toolId, params) => {
      workspace.load(toolId, params);
      renderSidebar();
    }
  });

  function renderSidebar() {
    if (!sidebarEl) return;
    const favs = Storage.getFavorites();

    const toolListHtml = Object.values(tools).map(t => `
      <li class="nav-item ${workspace.currentTool?.id === t.id ? 'active' : ''}">
        <button class="nav-link" data-tool="${escapeHtml(t.id)}">${escapeHtml(t.name)}</button>
        <button class="btn-fav ${favs.includes(t.id) ? 'favorited' : ''}" data-fav="${escapeHtml(t.id)}">★</button>
      </li>
    `).join('');

    const wfListHtml = Object.values(workflows).map(w => `
      <li class="nav-item ${workflowRunner.active === w.id ? 'active-wf' : ''}">
        <button class="nav-link" data-workflow="${escapeHtml(w.id)}">Workflow: ${escapeHtml(w.name)}</button>
      </li>
    `).join('');

    sidebarEl.innerHTML = `
      <div class="sidebar-section">
        <h4>Tools</h4>
        <ul class="nav-list">${toolListHtml}</ul>
      </div>
      <div class="sidebar-section">
        <h4>Workflows</h4>
        <ul class="nav-list">${wfListHtml}</ul>
      </div>
    `;
  }

  function renderHomeGrid() {
    if (!mountEl) return;
    const toolCards = Object.values(tools).map(t => `
      <div class="tool-card" data-grid-tool="${escapeHtml(t.id)}">
        <h3>${escapeHtml(t.name)}</h3>
        <p>${escapeHtml(t.description || '')}</p>
      </div>
    `).join('');

    mountEl.innerHTML = `<div class="tools-grid">${toolCards}</div>`;
  }

  function bindGlobalEvents() {
    if (sidebarEl) {
      sidebarEl.onclick = (e) => {
        const favBtn = e.target.closest('[data-fav]');
        if (favBtn) {
          Storage.toggleFavorite(favBtn.dataset.fav);
          renderSidebar();
          return;
        }
        const toolEl = e.target.closest('[data-tool]');
        if (toolEl) {
          workflowRunner.stop();
          workspace.load(toolEl.dataset.tool);
          renderSidebar();
          return;
        }
        const wfEl = e.target.closest('[data-workflow]');
        if (wfEl) {
          workflowRunner.start(wfEl.dataset.workflow);
          renderSidebar();
        }
      };
    }

    if (mountEl) {
      mountEl.onclick = (e) => {
        const gridEl = e.target.closest('[data-grid-tool]');
        if (gridEl) {
          workspace.load(gridEl.dataset.gridTool);
          renderSidebar();
        }
      };
    }
  }

  bindGlobalEvents();
  renderSidebar();
  renderHomeGrid();

  return { workspace, workflowRunner, renderSidebar, renderHomeGrid };
}