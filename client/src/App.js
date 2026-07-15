import { useMemo, useState } from 'react';
import './App.css';

const listings = [
  { id: 1, title: 'Build a polished portfolio', seller: 'Amina N.', location: 'Nairobi', category: 'Design', offered: 'UI / UX design', wanted: 'React development', description: 'I can help shape your case studies, visual hierarchy and responsive layouts. In return, I would love help bringing my portfolio to life in React.' },
  { id: 2, title: 'Learn conversational Swahili', seller: 'Brian K.', location: 'Mombasa', category: 'Language', offered: 'Swahili practice', wanted: 'Photography basics', description: 'Weekly relaxed conversations for anyone who wants to feel more confident speaking Swahili.' },
  { id: 3, title: 'Set up a personal budget', seller: 'Cheryl W.', location: 'Nairobi', category: 'Finance', offered: 'Budget planning', wanted: 'Excel coaching', description: 'Let us build a simple budget you can maintain and review every month.' },
  { id: 4, title: 'Capture better travel photos', seller: 'David O.', location: 'Kisumu', category: 'Photography', offered: 'Photography basics', wanted: 'Spanish practice', description: 'Practical feedback on composition, light and editing using the camera you already have.' },
];

const initialInquiries = [
  { id: 1, direction: 'received', name: 'Maya K.', listing: 'Build a polished portfolio', message: 'Your UX skills are exactly what I need. Could we swap a few sessions?', status: 'pending' },
  { id: 2, direction: 'received', name: 'Noah P.', listing: 'Learn conversational Swahili', message: 'I would be happy to trade beginner photography lessons.', status: 'accepted' },
  { id: 3, direction: 'sent', name: 'Cheryl W.', listing: 'Set up a personal budget', message: 'Hi Cheryl, I can help you get more comfortable with Excel.', status: 'pending' },
];

function App() {
  const [page, setPage] = useState('marketplace');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [inquiryFor, setInquiryFor] = useState(null);
  const [message, setMessage] = useState('');
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [tab, setTab] = useState('received');
  const [notice, setNotice] = useState('');

  const filteredListings = useMemo(() => listings.filter((listing) => {
    const terms = `${listing.title} ${listing.seller} ${listing.offered} ${listing.wanted}`.toLowerCase();
    return (category === 'All' || listing.category === category) && terms.includes(query.toLowerCase());
  }), [category, query]);

  const showMarketplace = () => { setPage('marketplace'); setSelected(null); };
  const sendInquiry = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setInquiries((items) => [...items, { id: Date.now(), direction: 'sent', name: inquiryFor.seller, listing: inquiryFor.title, message: message.trim(), status: 'pending' }]);
    setInquiryFor(null); setMessage(''); setNotice('Inquiry sent successfully.'); setPage('inquiries'); setTab('sent');
  };
  const updateStatus = (id, status) => setInquiries((items) => items.map((item) => item.id === id ? { ...item, status } : item));

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={showMarketplace}>SkillSwap</button>
        <nav aria-label="Main navigation">
          <button className={page !== 'inquiries' ? 'active' : ''} onClick={showMarketplace}>Marketplace</button>
          <button className={page === 'inquiries' ? 'active' : ''} onClick={() => setPage('inquiries')}>Inquiries</button>
        </nav>
      </header>
      <main>
        {page === 'marketplace' && !selected && <section className="marketplace">
          <div className="hero"><p className="eyebrow">Share what you know</p><h1>Find your next skill swap</h1><p>Offer a skill, learn something new, and meet people who want to grow together.</p></div>
          <div className="filters"><label>Search<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “React” or “photography”" /></label><label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}>{['All', 'Design', 'Language', 'Finance', 'Photography'].map((item) => <option key={item}>{item}</option>)}</select></label></div>
          <p className="result-count">{filteredListings.length} skill swaps available</p>
          <div className="listing-grid">{filteredListings.map((listing) => <article className="listing-card" key={listing.id}><div className="avatar">{listing.seller[0]}</div><p className="card-meta">{listing.seller} · {listing.location}</p><h2>{listing.title}</h2><div className="swap"><span>I offer</span><strong>{listing.offered}</strong><span>I want</span><strong>{listing.wanted}</strong></div><button className="text-button" onClick={() => setSelected(listing)}>View listing →</button></article>)}</div>
          {!filteredListings.length && <div className="empty-state"><h2>No listings found</h2><p>Try a different search or choose another category.</p><button onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button></div>}
        </section>}
        {page === 'marketplace' && selected && <section className="detail"><button className="back" onClick={() => setSelected(null)}>← Back to marketplace</button><div className="detail-card"><div><p className="eyebrow">{selected.category} · {selected.location}</p><h1>{selected.title}</h1><p className="detail-description">{selected.description}</p><div className="skill-pair"><div><span>Offering</span><strong>{selected.offered}</strong></div><div><span>Looking for</span><strong>{selected.wanted}</strong></div></div><button className="primary" onClick={() => setInquiryFor(selected)}>Send inquiry</button></div><aside className="seller-card"><div className="avatar large">{selected.seller[0]}</div><h2>{selected.seller}</h2><p>SkillSwap member</p><p>Usually replies within a day</p></aside></div></section>}
        {page === 'inquiries' && <section className="inquiries"><div className="section-heading"><div><p className="eyebrow">Your conversations</p><h1>Inquiries</h1></div><button className="secondary" onClick={showMarketplace}>Browse listings</button></div>{notice && <div className="notice">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}<div className="tabs"><button className={tab === 'received' ? 'selected' : ''} onClick={() => setTab('received')}>Received</button><button className={tab === 'sent' ? 'selected' : ''} onClick={() => setTab('sent')}>Sent</button></div><div className="inquiry-list">{inquiries.filter((item) => item.direction === tab).map((item) => <article className="inquiry-card" key={item.id}><div className="avatar">{item.name[0]}</div><div className="inquiry-content"><p><strong>{item.name}</strong> · {item.listing}</p><p>{item.message}</p></div><div className="inquiry-actions"><span className={`badge ${item.status}`}>{item.status}</span>{item.direction === 'received' && item.status === 'pending' && <div><button className="primary small" onClick={() => updateStatus(item.id, 'accepted')}>Accept</button><button className="decline" onClick={() => updateStatus(item.id, 'declined')}>Decline</button></div>}</div></article>)}</div>{!inquiries.some((item) => item.direction === tab) && <div className="empty-state"><h2>No {tab} inquiries</h2><p>{tab === 'sent' ? 'Find a listing that interests you and start a conversation.' : 'New inquiries will appear here.'}</p></div>}</section>}
      </main>
      {inquiryFor && <div className="modal-backdrop" role="presentation"><form className="modal" onSubmit={sendInquiry}><button type="button" className="close" onClick={() => setInquiryFor(null)} aria-label="Close">×</button><p className="eyebrow">Contact {inquiryFor.seller}</p><h2>Send an inquiry</h2><p>About: <strong>{inquiryFor.title}</strong></p><label>Your message<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Introduce yourself and describe the skill you would like to swap." rows="5" autoFocus /></label><button className="primary" type="submit">Send inquiry</button></form></div>}
    </div>
  );
}

export default App;
