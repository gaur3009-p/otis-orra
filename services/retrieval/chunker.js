function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(' ');
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

function chunkPages(pages) {
  const chunks = [];
  for (const page of pages) {
    const textChunks = chunkText(page.content);
    textChunks.forEach((chunk, idx) => {
      chunks.push({
        id: `${encodeURIComponent(page.url)}_${idx}`,
        text: chunk,
        metadata: { url: page.url, title: page.title || '', chunkIndex: idx },
      });
    });
  }
  return chunks;
}

module.exports = { chunkPages };
