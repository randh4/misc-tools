document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.cat-filter-btn');
  const toolCards = document.querySelectorAll('.tool-card');
  const countBadge = document.getElementById('visible-count');
  const searchInput = document.getElementById('search-input');

  let currentCategory = 'all';

  function applyFilter() {
    const query = (searchInput?.value || '').toLowerCase().trim();
    let visible = 0;

    toolCards.forEach(card => {
      const cardCat = card.dataset.category || '';
      const name = (card.querySelector('h2')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

      const matchCategory =
        currentCategory === 'all' ||
        cardCat.toLowerCase() === currentCategory.toLowerCase() ||
        (currentCategory === 'crypto-encoding' && ['crypto', 'encoding'].includes(cardCat.toLowerCase())) ||
        (currentCategory === 'formatters-converters' && ['formatter', 'converter'].includes(cardCat.toLowerCase())) ||
        (currentCategory === 'devops-system' && ['devops', 'system', 'utilities'].includes(cardCat.toLowerCase()));

      const matchSearch = !query || name.includes(query) || desc.includes(query);

      if (matchCategory && matchSearch) {
        card.style.display = 'block';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countBadge) {
      countBadge.textContent = `${visible} utilitas`;
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category || 'all';

      filterBtns.forEach(b => {
        if (b === btn) {
          b.classList.remove('bg-white', 'text-slate-600', 'border-slate-300', 'hover:bg-slate-50');
          b.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
          b.setAttribute('aria-selected', 'true');
        } else {
          b.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
          b.classList.add('bg-white', 'text-slate-600', 'border-slate-300', 'hover:bg-slate-50');
          b.setAttribute('aria-selected', 'false');
        }
      });

      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }
});
