const track = document.querySelector('.pv2-scroll-track');
const outer = document.querySelector('.pv2-scroll-outer');

track.innerHTML += track.innerHTML;

const speed = 0.5;
let pos = 0;
let raf;
let isDragging = false;
let startX, startScroll;

function tick() {
    if (!isDragging) {
      pos += speed;
      if (pos >= track.scrollWidth / 2) pos = 0;
      outer.scrollLeft = pos;
    }
    raf = requestAnimationFrame(tick);
  }

  outer.addEventListener('wheel', e => {
  e.preventDefault();
  pos += e.deltaX || e.deltaY;
  if (pos >= track.scrollWidth / 2) pos -= track.scrollWidth / 2;
  if (pos < 0) pos += track.scrollWidth / 2;
  outer.scrollLeft = pos;
  }, { passive: false });

  raf = requestAnimationFrame(tick);

  async function loadMediumPosts() {
  try {
  const res = await fetch(
    "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40nityachintan"
  );
  const data = await res.json();

  const posts = data.items.slice(0, 3);
  const container = document.getElementById("mediumPosts");

  container.innerHTML = posts.map(post => {
    const date = new Date(post.pubDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const text = post.description.replace(/<[^>]+>/g, "").slice(0, 120) + "...";

    return `
      <a href="${post.link}" target="_blank" class="medium-card r">
        <div class="medium-header">
          <div class="medium-logo">
            <svg viewBox="0 0 1043.63 592.71" fill="#000">
              <path d="M588.67 296.36c0 163.67-131.78 296.35-294.33 296.35S0 460.03 0 296.36 131.78 0 294.34 0s294.33 132.69 294.33 296.36M911.56 296.36c0 154.06-65.89 279-147.17 279s-147.17-124.94-147.17-279 65.88-279 147.17-279 147.17 124.9 147.17 279M1043.63 296.36c0 138-23.17 249.94-51.76 249.94s-51.75-111.91-51.75-249.94 23.17-249.94 51.75-249.94 51.76 111.9 51.76 249.94"/>
            </svg>
          </div>
          <span class="medium-platform">Medium</span>
          <span class="medium-handle">@nityachintan · ${date}</span>
        </div>
        <div class="medium-pull">"${post.title}"</div>
        <div class="medium-sub">${text}</div>
        <span class="medium-cta">Read on Medium →</span>
      </a>
    `;
  }).join("");

  // re-trigger scroll reveal
  document.querySelectorAll('.r').forEach(el => {
    el.classList.remove('show');
    obs.observe(el);
  });
  } catch(e) {
    // fallback if Medium API fails
    const container = document.getElementById("mediumPosts");
    container.innerHTML = `
      <a href="https://medium.com/@nityachintan" target="_blank" class="medium-card r">
        <div class="medium-header">
          <div class="medium-logo"><svg viewBox="0 0 1043.63 592.71" fill="#000"><path d="M588.67 296.36c0 163.67-131.78 296.35-294.33 296.35S0 460.03 0 296.36 131.78 0 294.34 0s294.33 132.69 294.33 296.36M911.56 296.36c0 154.06-65.89 279-147.17 279s-147.17-124.94-147.17-279 65.88-279 147.17-279 147.17 124.9 147.17 279M1043.63 296.36c0 138-23.17 249.94-51.76 249.94s-51.75-111.91-51.75-249.94 23.17-249.94 51.75-249.94 51.76 111.9 51.76 249.94"/></svg></div>
          <span class="medium-platform">Medium</span>
          <span class="medium-handle">@nityachintan</span>
        </div>
        <div class="medium-pull">"Notes on what I'm building, learning, and what surprised me."</div>
        <div class="medium-sub">I write when I figure something out worth sharing — ML project walkthroughs, things I got wrong, and notes from along the way.</div>
        <span class="medium-cta">Read on Medium →</span>
      </a>
    `;
  }
}

loadMediumPosts();

/* ── CURSOR ── */


/* ── PROFILE PIC UPLOAD ── */
function handleProfilePic(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('profilePicImg');
    const inner = document.getElementById('profilePicInner');
    img.src = e.target.result;
    img.style.display = 'block';
    inner.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

/* ── NAV TOGGLE ── */
function closeNav(){const n=document.getElementById('nl');n.style.display='none';n.classList.remove('open')}
document.getElementById('nt').addEventListener('click',()=>{
  const n=document.getElementById('nl');
  const open=n.style.display==='flex';
  n.style.display=open?'none':'flex';
  n.classList.toggle('open',!open);
});

/* ══════════════════════════════════════════════════
   HERO — SCRAMBLE TYPEWRITER
   Letters reveal one by one, each scrambles
   through random chars before landing on the real one
══════════════════════════════════════════════════ */
(function(){
  const el=document.getElementById('heroName');
  const text='Nitya Mehta';
  const CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
  const SCRAMBLE_DURATION=320; // ms per char to scramble
  const REVEAL_GAP=90;         // ms between chars starting
  const LINE_BREAK=5;          // insert <br/> after index 4 (after "Nitya")

  // build spans
  const spans=[];
  [...text].forEach((ch,i)=>{
    if(ch===' '&&i!==LINE_BREAK-1){
      // natural space shown as line break after "Nitya"
      const br=document.createElement('br');
      el.appendChild(br);
      return;
    }
    if(ch===' ') return; // skip the space that's now a <br>
    const span=document.createElement('span');
    span.className='char';
    span.textContent=ch;
    span.dataset.final=ch;
    el.appendChild(span);
    spans.push(span);
  });

  // animate
  function revealChar(span,startDelay){
    const finalChar=span.dataset.final;
    let elapsed=0;
    const step=40;
    let t=0;
    setTimeout(()=>{
      span.classList.add('scramble');
      const iv=setInterval(()=>{
        t+=step;
        if(t<SCRAMBLE_DURATION){
          span.textContent=CHARS[Math.floor(Math.random()*CHARS.length)];
        } else {
          span.textContent=finalChar;
          span.classList.remove('scramble');
          span.classList.add('revealed');
          clearInterval(iv);
        }
      },step);
    },startDelay);
  }

  // count only real letter spans (skip br)
  let charIdx=0;
  [...text].forEach((ch,i)=>{
    if(ch===' ')return;
    const span=spans[charIdx];
    const delay=600+charIdx*REVEAL_GAP;
    revealChar(span,delay);
    charIdx++;
  });
})();

/* ══════════════════════════════════════════════════
   PHOTO STACK PARALLAX
══════════════════════════════════════════════════ */
(function(){
  const stack=document.getElementById('photoStack');
  if(!stack)return;
  const cards=[...stack.querySelectorAll('.photo-card')];
  let tx=0,ty=0,cx=0,cy=0;

  document.addEventListener('mousemove',e=>{
    tx=(e.clientX/window.innerWidth-.5)*20;
    ty=(e.clientY/window.innerHeight-.5)*14;
  });

  const baseTransforms={
    pc1:'rotate(-2.5deg)',
    pc2:'rotate(3.5deg)',
    pc3:'rotate(-1.5deg)',
  };

  (function raf(){
    cx+=(tx-cx)*.07;cy+=(ty-cy)*.07;
    cards.forEach(c=>{
      const rx=parseFloat(c.dataset.rx)||1;
      const ry=parseFloat(c.dataset.ry)||1;
      const base=c.classList.contains('pc1')?baseTransforms.pc1:c.classList.contains('pc2')?baseTransforms.pc2:baseTransforms.pc3;
      c.style.transform=`${base} translate(${cx*rx}px,${cy*ry}px)`;
    });
    requestAnimationFrame(raf);
  })();
})();

/* ══════════════════════════════════════════════════
   MAGNETIC
══════════════════════════════════════════════════ */
document.querySelectorAll('.mag').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.3;
    const y=(e.clientY-r.top-r.height/2)*.3;
    el.style.transform=`translate(${x}px,${y}px)`;
  });
  el.addEventListener('mouseleave',()=>{el.style.transform='translate(0,0)'});
});

/* ── SCROLL REVEAL ── */
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');obs.unobserve(e.target)}});
},{threshold:.1});
document.querySelectorAll('.r').forEach(el=>obs.observe(el));