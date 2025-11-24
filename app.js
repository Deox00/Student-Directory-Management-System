// app.js — Fixed to preserve string roll numbers and compute CGPA stats correctly
let students = []; // {roll:string, name:string, dept:string, cgpa:number}
const pageSize = 8;
let currentPage = 1;

const el = id => document.getElementById(id);

// --- CSV helpers ---
function csvToArray(text) {
  const lines = text.trim().split(/\r?\n/);
  const out = [];
  for (let line of lines) {
    if (!line.trim()) continue;
    // allow either comma separated or space separated, but keep roll as string (no numeric coercion)
    // prefer comma parsing if commas exist
    if (line.indexOf(',') >= 0) {
      const parts = line.split(',');
      // handle extra commas inside fields by trimming and joining tail if any (simple safe handling)
      const roll = parts[0].trim();
      const name = (parts[1] || '').trim();
      const dept = (parts[2] || '').trim();
      const cgpa = parseFloat((parts[3] || '').trim());
      out.push({ roll, name, dept, cgpa: Number.isNaN(cgpa) ? null : cgpa });
    } else {
      // fallback: whitespace separated
      const sp = line.trim().split(/\s+/);
      const roll = sp[0].trim();
      const name = sp[1] || '';
      const dept = sp[2] || '';
      const cgpa = parseFloat(sp[3] || '');
      out.push({ roll, name, dept, cgpa: Number.isNaN(cgpa) ? null : cgpa });
    }
  }
  return out;
}

function arrayToCSV(arr) {
  return arr.map(s => `${s.roll},${s.name},${s.dept},${(typeof s.cgpa === 'number' && !Number.isNaN(s.cgpa)) ? s.cgpa.toFixed(2) : ''}`).join("\n");
}

// --- UI rendering ---
function renderTable() {
  const wrap = el('tableWrap');
  if (!students.length) {
    wrap.innerHTML = `<div style="padding:20px;color:#9ca3af">No records. Import CSV or add students.</div>`;
    el('pagination').innerHTML = '';
    updateStats();
    return;
  }
  const totalPages = Math.ceil(students.length / pageSize);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const pageItems = students.slice(start, start + pageSize);

  let html = `<table><thead><tr>
    <th><input id="selectAll" type="checkbox"/></th>
    <th>Roll</th><th>Name</th><th>Department</th><th>CGPA</th><th>Actions</th>
  </tr></thead><tbody>`;

  for (let s of pageItems) {
    // ensure roll is a string and not coerced
    const rollText = String(s.roll);
    const nameText = String(s.name || '');
    const deptText = String(s.dept || '');
    const cgpaText = (typeof s.cgpa === 'number' && !Number.isNaN(s.cgpa)) ? s.cgpa.toFixed(2) : '';
    html += `<tr>
      <td><input class="sel" data-roll="${escapeHtmlAttr(rollText)}" type="checkbox"/></td>
      <td class="roll-cell" title="${escapeHtmlAttr(rollText)}">${escapeHtml(rollText)}</td>
      <td class="name-cell">${escapeHtml(nameText)}</td>
      <td>${escapeHtml(deptText)}</td>
      <td class="cgpa">${cgpaText}</td>
      <td><button class="small-btn" data-roll="${escapeHtmlAttr(rollText)}">Delete</button></td>
    </tr>`;
  }
  html += `</tbody></table>`;
  wrap.innerHTML = html;

  // pagination
  let pag = el('pagination');
  let phtml = '';
  if (totalPages > 1) {
    for (let i=1;i<=totalPages;i++) {
      phtml += `<button class="btn-page ${i===currentPage?'active':''}" data-page="${i}">${i}</button> `;
    }
  }
  pag.innerHTML = phtml;

  // attach events
  document.querySelectorAll('.small-btn').forEach(b=>{
    b.onclick = () => { deleteByRoll(decodeURIComponent(b.dataset.roll)); };
  });
  const selectAllEl = el('selectAll');
  if (selectAllEl) {
    selectAllEl.onchange = function(){
      const check = this.checked;
      document.querySelectorAll('.sel').forEach(c => c.checked = check);
    };
  }
  document.querySelectorAll('.btn-page').forEach(b => {
    b.onclick = () => {
      currentPage = parseInt(b.dataset.page);
      renderTable();
    };
  });

  updateStats();
}

function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeHtmlAttr(s){ return (s+'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// --- CRUD operations ---
function addStudent(obj) {
  // keep roll as string, normalized
  obj.roll = String(obj.roll).trim();
  if (!obj.roll) { alert('Roll is required'); return false; }
  // avoid duplicates by roll
  if (students.some(s => s.roll === obj.roll)) {
    alert('Duplicate roll number');
    return false;
  }
  // ensure cgpa stored as number or null
  if (obj.cgpa === '' || obj.cgpa === null || obj.cgpa === undefined) obj.cgpa = null;
  else {
    const n = Number(obj.cgpa);
    obj.cgpa = Number.isFinite(n) ? n : null;
  }
  students.unshift(obj); // add to head
  renderTable();
  return true;
}

function deleteByRoll(roll) {
  roll = String(roll);
  const idx = students.findIndex(s=>s.roll===roll);
  if (idx>=0) {
    if (!confirm(`Delete roll ${roll} ?`)) return;
    students.splice(idx,1);
    renderTable();
  } else alert('Not found');
}

function search(term) {
  term = String(term).trim();
  if (!term) return;
  const num = Number(term);
  let res;
  // if the search term looks like a roll format (contains slash or letters), search by roll or name substring
  if (term.includes('/') || isNaN(num)) {
    res = students.filter(s => s.roll.toLowerCase().includes(term.toLowerCase()) || (s.name||'').toLowerCase().includes(term.toLowerCase()));
  } else {
    // numeric-like: search roll equals or name includes
    res = students.filter(s => s.roll === term || (s.name||'').toLowerCase().includes(term.toLowerCase()));
  }
  if (res.length===0) {
    alert('No results');
    return;
  }
  const wrap = el('tableWrap');
  let html = `<div style="padding:8px;color:#9ca3af">Showing ${res.length} result(s). <button id="backAll">Back</button></div><table><thead><tr>
    <th>Roll</th><th>Name</th><th>Department</th><th>CGPA</th></tr></thead><tbody>`;
  for (let s of res) html += `<tr><td title="${escapeHtmlAttr(s.roll)}">${escapeHtml(s.roll)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.dept)}</td><td>${(typeof s.cgpa==='number' && !Number.isNaN(s.cgpa)) ? s.cgpa.toFixed(2) : ''}</td></tr>`;
  html += '</tbody></table>';
  wrap.innerHTML = html;
  el('backAll').onclick = ()=>renderTable();
}

// --- Stats ---
function updateStats() {
  const total = students.length;
  el('statTotal').innerText = total;
  if (total===0) {
    el('statAvg').innerText = '0.00';
    el('statHigh').innerText = '-';
    el('statLow').innerText = '-';
    el('distribution').innerHTML = '';
    return;
  }
  const cgpas = students.map(s => {
    const n = Number(s.cgpa);
    return Number.isFinite(n) ? n : NaN;
  }).filter(n => !Number.isNaN(n));

  const avg = cgpas.length ? (cgpas.reduce((a,b)=>a+b,0) / cgpas.length) : NaN;
  const highest = cgpas.length ? Math.max(...cgpas) : NaN;
  const lowest = cgpas.length ? Math.min(...cgpas) : NaN;

  el('statAvg').innerText = Number.isFinite(avg) ? avg.toFixed(2) : '0.00';
  el('statHigh').innerText = Number.isFinite(highest) ? highest.toFixed(2) : '-';
  el('statLow').innerText = Number.isFinite(lowest) ? lowest.toFixed(2) : '-';

  // distribution buckets 6-7,7-8,8-9,9-10
  const buckets = [0,0,0,0];
  for (let n of cgpas) {
    if (n >= 9) buckets[3]++; else if (n >= 8) buckets[2]++; else if (n >= 7) buckets[1]++; else if (n >=6) buckets[0]++;
  }
  const distEl = el('distribution');
  distEl.innerHTML = '';
  const labels = ['6.0-7.0','7.0-8.0','8.0-9.0','9.0-10.0'];
  const max = Math.max(...buckets,1);
  for (let i=0;i<buckets.length;i++){
    const w = Math.round((buckets[i]/max)*120);
    const bar = `<div style="display:flex;align-items:center;margin:6px 0">
      <div style="width:90px;color:#9ca3af">${labels[i]}</div>
      <div style="flex:1;background:#0b1220;border-radius:6px;padding:4px 6px">
        <div style="width:${w}px" class="bar"></div>
      </div>
      <div style="width:36px;text-align:right;padding-left:8px;color:#9ca3af">${buckets[i]}</div>
    </div>`;
    distEl.innerHTML += bar;
  }
}

// --- events and wire up ---
document.addEventListener('DOMContentLoaded', ()=>{
  // load example
  el('btnImportExample').onclick = ()=> {
    const sample = `1/24/SET/BCS/145,Riya Sharma,CSE,8.70
CSE21-007,Arjun Mehta,ECE,7.90
REG-2024-BTECH-121,Neha Gupta,IT,9.12
1/24/SET/BCS/146,Rohan Singh,ME,6.85
CSE22-032,Sana Ali,CSE,8.22`;
    students = csvToArray(sample);
    currentPage = 1;
    renderTable();
  };

  // file import
  el('fileInput').addEventListener('change', (ev)=>{
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => {
      students = csvToArray(String(e.target.result));
      currentPage = 1; renderTable();
    };
    reader.readAsText(f);
  });

  // export CSV
  el('btnExport').onclick = ()=>{
    if (!students.length) { alert('No data to export'); return; }
    const csv = arrayToCSV(students);
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'students.csv'; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  // Add form
  el('addForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const roll = el('roll').value.trim();
    const name = el('name').value.trim();
    const dept = el('dept').value.trim();
    const cgpaRaw = el('cgpa').value;
    if (!roll || !name || !dept) { alert('Invalid input'); return; }
    const cgpa = cgpaRaw === '' ? null : Number(cgpaRaw);
    if (cgpa !== null && (isNaN(cgpa) || cgpa < 0 || cgpa > 10)) { alert('CGPA must be 0-10'); return; }
    if (students.some(s=>s.roll===roll)) { alert('Duplicate roll'); return; }
    addStudent({roll, name, dept, cgpa});
    el('addForm').reset();
  });

  el('btnClear').onclick = ()=> el('addForm').reset();

  el('btnSearch').onclick = ()=> {
    const t = el('searchInput').value.trim();
    if (!t) { alert('Enter search'); return; }
    search(t);
  };

  el('btnShowAll').onclick = ()=> {
    currentPage = 1; renderTable();
  };

  el('btnDeleteSelected').onclick = ()=>{
    const checked = Array.from(document.querySelectorAll('.sel:checked')).map(n=>n.dataset.roll);
    if (!checked.length) { alert('No selection'); return; }
    if (!confirm(`Delete ${checked.length} selected?`)) return;
    for (let r of checked) { students = students.filter(s=>s.roll !== r); }
    renderTable();
  };

  renderTable();
});
