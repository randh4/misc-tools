document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('tool-container');
  
  // Keyboard Shortcuts: Ctrl+K / Cmd+K to focus search input
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      } else {
        window.location.href = '/?focus=search';
      }
    }

    // Ctrl+Enter / Cmd+Enter to execute active tool action
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const activeBtn = document.querySelector('#tool-container button[data-action], #tool-container button[type="submit"]');
      if (activeBtn) {
        e.preventDefault();
        activeBtn.click();
      }
    }
  });

  if (!container) return;

  const currentTool = container.dataset.tool;
  const notify = (msg, isError = false) => {
    const el = document.getElementById('status-message');
    if (!el) return;
    el.textContent = msg;
    el.className = `mt-4 p-3 rounded text-xs font-semibold ${isError ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
  };

  // Event Delegation for Tool Execution Buttons
  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const handlerKey = `${currentTool}:${action}`;
    const handler = window.ToolboxHandlers?.[handlerKey];

    if (typeof handler !== 'function') {
      notify(`Handler [${handlerKey}] belum terdaftar.`, true);
      return;
    }

    const origText = btn.textContent;
    try {
      btn.disabled = true;
      btn.textContent = 'Processing...';
      await handler(btn);
      notify('Proses berhasil dieksekusi.');
    } catch (err) {
      notify(err.message || 'Terjadi kesalahan sistem.', true);
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  });

  // Copy Result helper
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('[data-copy-target]');
    if (!copyBtn) return;

    const targetId = copyBtn.dataset.copyTarget;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    const text = targetEl.value || targetEl.textContent;
    if (!text) {
      notify('Tidak ada teks untuk disalin.', true);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      notify('Teks berhasil disalin ke clipboard!');
    }).catch(() => {
      notify('Gagal menyalin ke clipboard.', true);
    });
  });
});
