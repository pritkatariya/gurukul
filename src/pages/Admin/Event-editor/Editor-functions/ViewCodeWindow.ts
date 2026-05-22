import type { CanvasElement, Connection } from "./EditorTypes";

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escJs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function generateElementHtml(el: CanvasElement): string {
  const s = el.styles;
  const base = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;border-radius:${s.radius}px;opacity:${s.opacity / 100};padding:${el.type === "card" ? s.padding : 0}px;border:${s.borderWidth}px solid ${s.borderColor};transform:rotate(${s.rotation}deg);box-shadow:${s.boxShadow};overflow:hidden;`;
  const dataAttr = el.id ? ` data-element-id="${el.id.slice(0, 8)}"` : "";

  if (el.type === "carousel") {
    const cards = (el.cards || []).map((c, i) => `
      <div class="carousel-card${i === 0 ? " active" : ""}" data-index="${i}">
        ${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.title)}" />` : `<div class="carousel-placeholder"></div>`}
        <div class="carousel-caption"><strong>${esc(c.title)}</strong><p>${esc(c.description)}</p></div>
      </div>`).join("");
    const dots = (el.cards || []).map((_, i) => `<button class="carousel-dot${i === 0 ? " active" : ""}" data-target="${i}"></button>`).join("");
    return `\n  <div id="carousel-${el.id.slice(0, 8)}" class="carousel-element"${dataAttr} style="${base}">\n    <div class="carousel-track">${cards}</div>\n    ${(el.cards || []).length > 1 ? `<button class="carousel-prev">&#8249;</button><button class="carousel-next">&#8250;</button><div class="carousel-dots">${dots}</div>` : ""}\n  </div>`;
  }

  if (el.type === "image") {
    return `\n  <div${dataAttr} style="${base}">\n    <img src="${esc(el.imageUrl)}" alt="" style="width:100%;height:100%;object-fit:${s.objectFit};border-radius:${s.radius}px;" />\n  </div>`;
  }

  const inner = `color:${s.color};background:${s.background};font-size:${s.fontSize}px;font-weight:${s.fontWeight};font-family:${s.fontFamily};text-shadow:${s.textShadow};border-radius:${s.radius}px;width:100%;height:100%;display:flex;align-items:${el.type === "button" ? "center" : "flex-start"};justify-content:${el.type === "button" ? "center" : "flex-start"};`;
  const tag = el.type === "heading" ? "h2" : el.type === "button" ? "button" : "p";
  return `\n  <div${dataAttr} style="${base}">\n    <${tag} style="${inner}">${esc(el.text)}</${tag}>\n  </div>`;
}

function generateHtml(elements: CanvasElement[], aw: number, ah: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Canvas Event</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="artboard" style="width:${aw}px;height:${ah}px;">
${elements.map(generateElementHtml).join("\n")}
  </div>
  <script src="script.js"><\/script>
</body>
</html>`;
}

function generateCss(aw: number, ah: number): string {
  return `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, system-ui, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.artboard { position: relative; width: ${aw}px; height: ${ah}px; background: #fff; box-shadow: 0 4px 24px rgba(15,23,42,0.1); border-radius: 12px; overflow: hidden; }
.carousel-element { position: absolute; overflow: hidden; }
.carousel-track { position: relative; width: 100%; height: 100%; }
.carousel-card { position: absolute; inset: 0; opacity: 0; transition: opacity 0.5s; background: #1e293b; display: flex; align-items: flex-end; }
.carousel-card.active { opacity: 1; z-index: 1; }
.carousel-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.carousel-placeholder { position: absolute; inset: 0; background: linear-gradient(135deg, #334155, #1e293b); }
.carousel-caption { position: relative; z-index: 2; padding: 16px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); width: 100%; }
.carousel-caption strong { display: block; color: #fff; font-size: 16px; }
.carousel-caption p { color: #cbd5e1; font-size: 12px; margin-top: 4px; }
.carousel-prev, .carousel-next { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; }
.carousel-prev { left: 8px; }
.carousel-next { right: 8px; }
.carousel-dots { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 10; }
.carousel-dot { width: 6px; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.4); border: none; cursor: pointer; transition: all 0.3s; padding: 0; }
.carousel-dot.active { width: 20px; background: #fff; }`;
}

function generateJs(elements: CanvasElement[], connections: Connection[]): string {
  const carousels = elements.filter((el) => el.type === "carousel");
  const hasConnections = connections.length > 0;
  const hasCustomCode = elements.some((el) => el.customCode);

  let code = "";

  // Carousel init
  if (carousels.length) {
    code += `// Carousel initialization\n`;
    carousels.forEach((el) => {
      const id = `carousel-${el.id.slice(0, 8)}`;
      const count = (el.cards || []).length;
      code += `initCarousel('${id}', ${count});\n`;
    });
    code += `\nfunction initCarousel(id, count) {
  var el = document.getElementById(id);
  if (!el || count <= 1) { var cards = el ? el.querySelectorAll('.carousel-card') : []; if (cards[0]) cards[0].classList.add('active'); return; }
  var cards = el.querySelectorAll('.carousel-card');
  var dots = el.querySelectorAll('.carousel-dot');
  var current = 0, timer;
  function show(i) { cards[current].classList.remove('active'); dots[current].classList.remove('active'); current = (i + count) % count; cards[current].classList.add('active'); dots[current].classList.add('active'); }
  function auto() { timer = setInterval(function() { show(current + 1); }, 3500); }
  var prev = el.querySelector('.carousel-prev'), next = el.querySelector('.carousel-next');
  if (prev) prev.addEventListener('click', function() { show(current - 1); });
  if (next) next.addEventListener('click', function() { show(current + 1); });
  dots.forEach(function(d, i) { d.addEventListener('click', function() { show(i); }); });
  el.addEventListener('mouseenter', function() { clearInterval(timer); });
  el.addEventListener('mouseleave', auto);
  cards[0].classList.add('active'); auto();
}\n\n`;
  }

  // Connection / event logic
  if (hasConnections) {
    code += `// Event connections\n`;
    connections.forEach((conn) => {
      const srcId = conn.sourceElementId.slice(0, 8);
      const tgtId = conn.targetElementId.slice(0, 8);
      const evtName = conn.eventType === "onClick" ? "click" : conn.eventType === "onHover" ? "mouseenter" : conn.eventType === "onMouseEnter" ? "mouseenter" : conn.eventType === "onMouseLeave" ? "mouseleave" : conn.eventType === "onSubmit" ? "submit" : conn.eventType === "onChange" ? "change" : conn.eventType === "onLoad" ? "load" : "click";
      const action = conn.actionType;
      code += `(function() {
  var src = document.querySelector('[data-element-id="${srcId}"]');
  var tgt = document.querySelector('[data-element-id="${tgtId}"]');
  if (!src || !tgt) return;
  src.addEventListener('${evtName}', function() {\n`;
      if (action === "toggle") {
        code += `    tgt.style.display = tgt.style.display === 'none' ? '' : 'none';\n`;
      } else if (action === "showPopup") {
        code += `    tgt.style.display = '';\n`;
      } else if (action === "hidePopup") {
        code += `    tgt.style.display = 'none';\n`;
      } else if (action === "scrollTo") {
        code += `    tgt.scrollIntoView({ behavior: 'smooth' });\n`;
      } else if (action === "updateText") {
        code += `    tgt.textContent = '${escJs(conn.params || "Updated")}';\n`;
      } else if (action === "changeStyle") {
        code += `    try { var s = ${conn.params || "{}"}; Object.assign(tgt.style, s); } catch(e) {}\n`;
      } else if (action === "navigate") {
        code += `    tgt.scrollIntoView({ behavior: 'smooth' });\n`;
      } else if (action === "playAnimation") {
        code += `    tgt.style.transition = 'all 0.5s'; tgt.style.transform = 'scale(1.05)'; setTimeout(function() { tgt.style.transform = ''; }, 500);\n`;
      } else if (action === "runCode") {
        code += `    // Custom code: ${escJs(conn.params || "")}\n`;
      }
      code += `  });
})();\n`;
    });
    code += `\n`;
  }

  // Per-element custom code
  if (hasCustomCode) {
    code += `// Custom element code\n`;
    elements.forEach((el) => {
      if (el.customCode) {
        code += `// --- ${el.type} (${el.text.slice(0, 20)}) ---\n`;
        code += `${el.customCode}\n\n`;
      }
    });
  }

  if (!code) code = "// No dynamic behavior defined";
  return code;
}

function buildWindowHtml(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>Generated Code</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:ui-monospace,Consolas,monospace;background:#0f172a;color:#e2e8f0;min-height:100vh;padding:28px}
h1{font-family:system-ui,sans-serif;font-size:20px;font-weight:800;color:#f8fafc;margin-bottom:24px}
.tabs{display:flex;gap:3px;margin-bottom:0}
.tab{padding:8px 18px;border-radius:8px 8px 0 0;border:none;cursor:pointer;font-family:system-ui,sans-serif;font-size:12px;font-weight:700;background:#1e293b;color:#94a3b8;transition:all .15s}
.tab.active{background:#1e3a5f;color:#60a5fa}
.panel{background:#1e293b;border-radius:0 10px 10px 10px;overflow:hidden}
.panel-header{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#162032;border-bottom:1px solid #334155}
.panel-header span{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-family:system-ui,sans-serif}
.copy-btn{padding:4px 12px;border-radius:6px;border:none;background:#2563eb;color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:system-ui,sans-serif;transition:background .15s}
.copy-btn:hover{background:#1d4ed8}
pre{padding:16px;overflow:auto;max-height:70vh;font-size:12px;line-height:1.6;color:#cbd5e1;tab-size:2}
.hidden{display:none}
</style></head><body>
<h1>Generated Code</h1>
<div class="tabs">
  <button class="tab active" onclick="sw('html')">index.html</button>
  <button class="tab" onclick="sw('css')">style.css</button>
  <button class="tab" onclick="sw('js')">script.js</button>
</div>
<div class="panel">
  <div class="panel-header"><span id="lbl">index.html</span><button class="copy-btn" onclick="cp()">Copy</button></div>
  <div id="p-html"><pre id="c-html"></pre></div>
  <div id="p-css" class="hidden"><pre id="c-css"></pre></div>
  <div id="p-js" class="hidden"><pre id="c-js"></pre></div>
</div>
<script>
var codes={html:\`${escJs(html)}\`,css:\`${escJs(css)}\`,js:\`${escJs(js)}\`};
var labels={html:'index.html',css:'style.css',js:'script.js'};
var active='html';
Object.keys(codes).forEach(function(k){document.getElementById('c-'+k).textContent=codes[k]});
function sw(t){document.getElementById('p-'+active).classList.add('hidden');document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active')});active=t;document.getElementById('p-'+t).classList.remove('hidden');document.getElementById('lbl').textContent=labels[t];document.querySelectorAll('.tab')[['html','css','js'].indexOf(t)].classList.add('active')}
function cp(){navigator.clipboard.writeText(codes[active]).then(function(){var b=document.querySelector('.copy-btn');b.textContent='Copied!';setTimeout(function(){b.textContent='Copy'},1500)})}
<\/script></body></html>`;
}

export function openViewCodeWindow(
  elements: CanvasElement[],
  artboardWidth: number,
  artboardHeight: number,
  connections: Connection[] = []
): void {
  const html = generateHtml(elements, artboardWidth, artboardHeight);
  const css = generateCss(artboardWidth, artboardHeight);
  const js = generateJs(elements, connections);
  const page = buildWindowHtml(html, css, js);
  const blob = new Blob([page], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) win.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
}
