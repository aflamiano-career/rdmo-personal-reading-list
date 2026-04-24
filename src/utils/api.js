const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const FIELDS = 'key,title,author_name,isbn,cover_i,number_of_pages_median,first_publish_year,subject';

export async function searchBooks(query) {
  const url = `${OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&limit=20&fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.docs.map(mapDoc);
}

export async function searchByISBN(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');
  const url = `${OPEN_LIBRARY_BASE}/search.json?isbn=${clean}&fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('ISBN lookup failed');
  const data = await res.json();
  return data.docs.map(mapDoc);
}

function mapDoc(doc) {
  const isbn = Array.isArray(doc.isbn) ? doc.isbn[0] : null;
  const coverUrl = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    : isbn
    ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
    : null;

  return {
    olKey: doc.key,
    title: doc.title || 'Unknown Title',
    author: Array.isArray(doc.author_name) ? doc.author_name[0] : 'Unknown Author',
    isbn,
    coverUrl,
    pages: doc.number_of_pages_median || null,
    publishedYear: doc.first_publish_year || null,
    genre: inferGenre(doc.subject),
    description: '',
  };
}

function inferGenre(subjects) {
  if (!Array.isArray(subjects)) return 'Other';
  const s = subjects.map((x) => x.toLowerCase()).join(' ');
  if (s.includes('fiction') && (s.includes('science') || s.includes('scifi') || s.includes('sci-fi'))) return 'Science Fiction';
  if (s.includes('fantasy') || s.includes('magic') || s.includes('dragon')) return 'Fantasy';
  if (s.includes('mystery') || s.includes('thriller') || s.includes('detective') || s.includes('crime')) return 'Mystery/Thriller';
  if (s.includes('romance') || s.includes('love story')) return 'Romance';
  if (s.includes('biography') || s.includes('memoir') || s.includes('autobiography')) return 'Non-Fiction';
  if (s.includes('history') || s.includes('historical')) return 'Non-Fiction';
  if (s.includes('self-help') || s.includes('self help') || s.includes('personal development')) return 'Non-Fiction';
  if (s.includes('fiction')) return 'Fiction';
  return 'Non-Fiction';
}
