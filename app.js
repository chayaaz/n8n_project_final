(() => {
  const messagesEl = document.getElementById('messages');
  const composer = document.getElementById('composer');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');
  const N8N_CHAT_URL = window.N8N_CHAT_URL;

  const SESSION_KEY = 'n8n-chat-session-id';
  let sessionId = window.CHAT_SESSION_ID || localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  function addUser(t){const b=document.createElement('div');b.className='bubble user';b.textContent=t;messagesEl.appendChild(b);messagesEl.scrollTop=messagesEl.scrollHeight}
  function addBot(t){const b=document.createElement('div');b.className='bubble bot';b.textContent=t;messagesEl.appendChild(b);messagesEl.scrollTop=messagesEl.scrollHeight}
  function addTyping(){const b=document.createElement('div');b.className='bubble bot';b.textContent='•••';messagesEl.appendChild(b);messagesEl.scrollTop=messagesEl.scrollHeight;return b}

  composer.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addUser(text);
    input.value = '';
    input.focus();
    sendBtn.disabled = true;
    const typing = addTyping();
    try {
      const res = await fetch(N8N_CHAT_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({action:'sendMessage',chatInput:text,sessionId:sessionId})
      });
      const raw = await res.text();
      let reply = raw;
      try {
        const p = JSON.parse(raw);
        if (typeof p === 'string') reply = p;
        else if (p.output) reply = p.output;
        else if (p.response) reply = p.response;
        else if (p.data) reply = typeof p.data === 'string' ? p.data : JSON.stringify(p.data);
        else if (p.text) reply = p.text;
        else if (p.message) reply = p.message;
        else reply = JSON.stringify(p);
      } catch(_) {}
      typing.remove();
      addBot(reply || '—');
    } catch(err) {
      typing.remove();
      addBot('error- try again');
      console.error(err);
    } finally {
      sendBtn.disabled = false;
    }
  });

  addBot('שלום, איך אפשר לעזור?');
})();
