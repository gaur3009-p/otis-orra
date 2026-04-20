function getPageContext() {
  return {
    url: window.location.href,
    title: document.title,
    scrollY: window.scrollY,
    scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) || 0,
    visibleSection: getVisibleSection(),
  };
}

function getVisibleSection() {
  const headings = document.querySelectorAll('h1, h2, h3, [id]');
  for (const el of headings) {
    const rect = el.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
      return el.textContent?.trim().slice(0, 80) || el.id || '';
    }
  }
  return '';
}

module.exports = { getPageContext };
