const KEY = 'productivity-crm-v1';
const defaultState = {
  catalogo: {
    empresas: [],
    procedimientos: [],
    actividades: []
  },
  operacion: {
    columns: [
      { key: 'empresa', label: 'Empresa', type: 'empresa', locked: true },
      { key: 'procedimiento', label: 'Procedimiento', type: 'procedimiento', locked: true },
      { key: 'actividad', label: 'Actividades', type: 'actividad', locked: true },
      { key: 'estatus', label: 'Estatus', type: 'status' }
    ],
    rows: []
  },
  correo: null
};

const extraColumnDefs = [
  ['fechaInicio', 'Fecha de inicio', 'date'],
  ['fechaRecordatorio', 'Fecha recordatorio', 'date'],
  ['fechaMaxima', 'Fecha máxima', 'date'],
  ['responsable', 'Responsable', 'text'],
  ['revisor', 'Revisor', 'text'],
  ['documentos', 'Documentos', 'url'],
  ['tiempoPresupuestado', 'Tiempo presupuestado', 'time'],
  ['tiempoReal', 'Tiempo real', 'timer'],
  ['comentarios', 'Comentarios', 'text'],
  ['costo', 'Costo', 'number'],
  ['prioridad', 'Prioridad', 'select:Alta|Media|Baja'],
  ['etiquetas', 'Etiquetas', 'text'],
  ['porcentaje', '% Avance', 'number'],
  ['persona', 'Persona', 'text'],
  ['telefono', 'Teléfono', 'text'],
  ['ubicacion', 'Ubicación', 'text']
];

let state = load();

function load() {
  const saved = localStorage.getItem(KEY);
  return saved ? JSON.parse(saved) : structuredClone(defaultState);
}

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function tabBehavior() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

function renderSimpleTable(el, headers, rows, editable = true) {
  const head = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}<th>Acciones</th></tr>`;
  const body = rows
    .map((r, i) => `<tr>${headers.map(h => `<td class="editable" ${editable ? 'contenteditable=true' : ''} data-idx="${i}" data-field="${h}">${r[h] || ''}</td>`).join('')}<td><button data-del="${i}">Eliminar</button></td></tr>`)
    .join('');
  el.innerHTML = `<thead>${head}</thead><tbody>${body}</tbody>`;
}

function bindCatalogo() {
  const empresasForm = document.getElementById('empresa-form');
  empresasForm.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(empresasForm).entries());
    if (!data.nombre.trim()) return alert('Empresa / Razón social es obligatorio.');
    state.catalogo.empresas.push({
      'Empresa': data.nombre,
      'Estatus': data.estatus,
      'Contacto': data.contacto,
      'Correo contacto': data.correoContacto,
      'Responsable': data.responsable,
      'Correo responsable': data.correoResponsable,
      'Correos adicionales': data.correosAdicionales
    });
    empresasForm.reset();
    redraw();
  };

  document.getElementById('procedimiento-form').onsubmit = e => {
    e.preventDefault();
    const p = e.target.procedimiento.value.trim();
    if (!p) return;
    state.catalogo.procedimientos.push({ 'Procedimiento': p });
    e.target.reset();
    redraw();
  };

  document.getElementById('actividad-form').onsubmit = e => {
    e.preventDefault();
    const a = e.target.actividad.value.trim();
    const p = e.target.procedimiento.value;
    if (!a) return;
    state.catalogo.actividades.push({ 'Actividad': a, 'Procedimiento': p });
    e.target.reset();
    redraw();
  };

  document.getElementById('download-layout').onclick = () => {
    const blob = new Blob([JSON.stringify(defaultState, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'layout-productivity.json';
    a.click();
  };

  document.getElementById('import-file').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      state = imported;
      redraw();
    } catch {
      alert('Archivo inválido. Usa el layout descargable.');
    }
  };
}

function setupOperacionForm() {
  const form = document.getElementById('operacion-form');
  form.innerHTML = '';

  state.operacion.columns.forEach(col => {
    const label = document.createElement('label');
    label.textContent = col.label;
    const input = buildInput(col, true);
    input.name = col.key;
    label.appendChild(input);
    form.appendChild(label);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Agregar registro';
  form.appendChild(submit);

  form.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    state.operacion.rows.push(data);
    form.reset();
    redraw();
  };
}

function buildInput(col, forForm = false, value = '') {
  if (col.type === 'empresa') {
    const sel = document.createElement('select');
    state.catalogo.empresas.forEach(e => {
      const op = document.createElement('option');
      op.value = e['Empresa'];
      op.textContent = e['Empresa'];
      sel.appendChild(op);
    });
    sel.value = value;
    return sel;
  }
  if (col.type === 'procedimiento') {
    const sel = document.createElement('select');
    state.catalogo.procedimientos.forEach(p => {
      const op = document.createElement('option');
      op.value = p['Procedimiento'];
      op.textContent = p['Procedimiento'];
      sel.appendChild(op);
    });
    sel.value = value;
    return sel;
  }
  if (col.type === 'actividad') {
    const sel = document.createElement('select');
    state.catalogo.actividades.forEach(a => {
      const op = document.createElement('option');
      op.value = a['Actividad'];
      op.textContent = a['Actividad'];
      sel.appendChild(op);
    });
    sel.value = value;
    return sel;
  }
  if (col.type === 'status') {
    const sel = document.createElement('select');
    ['Finalizado', 'Solicitado', 'En proceso', 'Pendiente', 'Atorado', 'Rechazado', 'En revisión'].forEach(s => {
      const op = document.createElement('option');
      op.value = s;
      op.textContent = s;
      sel.appendChild(op);
    });
    return sel;
  }
  if (col.type === 'date') {
    const inp = document.createElement('input');
    inp.type = 'date';
    inp.value = value;
    return inp;
  }
  if (col.type === 'time') {
    const inp = document.createElement('input');
    inp.type = 'time';
    inp.value = value;
    return inp;
  }
  if (col.type === 'url') {
    const inp = document.createElement('input');
    inp.type = 'url';
    inp.placeholder = 'https://...';
    inp.value = value;
    return inp;
  }
  if (col.type === 'number') {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.step = '0.01';
    inp.value = value;
    return inp;
  }
  if (col.type.startsWith('select:')) {
    const sel = document.createElement('select');
    col.type.replace('select:', '').split('|').forEach(v => {
      const op = document.createElement('option');
      op.value = v;
      op.textContent = v;
      sel.appendChild(op);
    });
    return sel;
  }
  if (col.type === 'timer') {
    if (forForm) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<small class="muted">Se inicia desde tabla con ▶/⏸</small>';
      return wrap;
    }
  }
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = value;
  return inp;
}

function renderOperacionTable() {
  const tbl = document.getElementById('operacion-table');
  const head = state.operacion.columns
    .map((c, idx) => `<th>${c.locked ? c.label : `<span contenteditable="true" data-col="${idx}" class="col-title">${c.label}</span>`}</th>`)
    .join('');

  const body = state.operacion.rows.map((row, ridx) => {
    const tds = state.operacion.columns.map(c => {
      if (c.type === 'timer') {
        return `<td><span data-time="${ridx}">${row[c.key] || '00:00'}</span> <span class="timer"><button data-play="${ridx}" data-colkey="${c.key}">▶</button><button data-pause="${ridx}">⏸</button></span></td>`;
      }
      return `<td contenteditable="true" data-r="${ridx}" data-k="${c.key}">${row[c.key] || ''}</td>`;
    }).join('');
    return `<tr>${tds}<td><button data-rm="${ridx}">Eliminar</button></td></tr>`;
  }).join('');

  tbl.innerHTML = `<thead><tr>${head}<th>Acciones</th></tr></thead><tbody>${body}</tbody>`;

  tbl.querySelectorAll('[data-col]').forEach(el => {
    el.onblur = () => {
      const idx = Number(el.dataset.col);
      state.operacion.columns[idx].label = el.textContent.trim() || state.operacion.columns[idx].label;
      persist();
    };
  });

  tbl.querySelectorAll('[data-r][data-k]').forEach(el => {
    el.onblur = () => {
      state.operacion.rows[Number(el.dataset.r)][el.dataset.k] = el.textContent.trim();
      persist();
      redrawDashboard();
    };
  });

  tbl.querySelectorAll('[data-rm]').forEach(btn => {
    btn.onclick = () => {
      state.operacion.rows.splice(Number(btn.dataset.rm), 1);
      redraw();
    };
  });

  const timers = {};
  tbl.querySelectorAll('[data-play]').forEach(btn => {
    btn.onclick = () => {
      const rowIndex = Number(btn.dataset.play);
      const key = btn.dataset.colkey;
      clearInterval(timers[rowIndex]);
      timers[rowIndex] = setInterval(() => {
        const prev = state.operacion.rows[rowIndex][key] || '00:00';
        let [mm, ss] = prev.split(':').map(Number);
        ss += 1;
        if (ss >= 60) { mm += 1; ss = 0; }
        state.operacion.rows[rowIndex][key] = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
        redraw();
      }, 1000);
    };
  });
  tbl.querySelectorAll('[data-pause]').forEach(btn => {
    btn.onclick = () => clearInterval(timers[Number(btn.dataset.pause)]);
  });
}

function redrawDashboard() {
  const byEmpresa = {};
  const byProc = {};
  state.operacion.rows.forEach(r => {
    const e = r.empresa || 'Sin empresa';
    const p = r.procedimiento || 'Sin procedimiento';
    byEmpresa[e] = (byEmpresa[e] || 0) + 1;
    byProc[p] = (byProc[p] || 0) + 1;
  });

  document.getElementById('dashboard-empresa').innerHTML = tableFromObject(byEmpresa, 'Empresa', 'Registros');
  document.getElementById('dashboard-procedimiento').innerHTML = tableFromObject(byProc, 'Procedimiento', 'Registros');

  const cards = [
    ['Empresas', state.catalogo.empresas.length],
    ['Procedimientos', state.catalogo.procedimientos.length],
    ['Actividades', state.catalogo.actividades.length],
    ['Registros operación', state.operacion.rows.length]
  ];
  document.getElementById('kpi-cards').innerHTML = cards
    .map(([k, v]) => `<article class="kpi"><strong>${k}</strong><div>${v}</div></article>`)
    .join('');
}

function tableFromObject(obj, c1, c2) {
  const rows = Object.entries(obj).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  return `<thead><tr><th>${c1}</th><th>${c2}</th></tr></thead><tbody>${rows}</tbody>`;
}

function bindCorreo() {
  const form = document.getElementById('correo-form');
  form.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.tls = form.tls.checked;
    state.correo = data;
    persist();
    document.getElementById('correo-status').textContent = JSON.stringify(state.correo, null, 2);
  };

  if (state.correo) {
    document.getElementById('correo-status').textContent = JSON.stringify(state.correo, null, 2);
  }
}

function bindEditsInCatalogTables() {
  [
    ['empresas-table', state.catalogo.empresas],
    ['procedimientos-table', state.catalogo.procedimientos],
    ['actividades-table', state.catalogo.actividades]
  ].forEach(([id, data]) => {
    const table = document.getElementById(id);
    table.querySelectorAll('[contenteditable=true]').forEach(cell => {
      cell.onblur = () => {
        const i = Number(cell.dataset.idx);
        data[i][cell.dataset.field] = cell.textContent.trim();
        persist();
        redraw();
      };
    });
    table.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = () => {
        data.splice(Number(btn.dataset.del), 1);
        redraw();
      };
    });
  });
}

function redraw() {
  renderSimpleTable(document.getElementById('empresas-table'), ['Empresa', 'Estatus', 'Contacto', 'Correo contacto', 'Responsable', 'Correo responsable', 'Correos adicionales'], state.catalogo.empresas);
  renderSimpleTable(document.getElementById('procedimientos-table'), ['Procedimiento'], state.catalogo.procedimientos);
  renderSimpleTable(document.getElementById('actividades-table'), ['Actividad', 'Procedimiento'], state.catalogo.actividades);

  const procSelect = document.getElementById('actividad-procedimiento');
  procSelect.innerHTML = state.catalogo.procedimientos.map(p => `<option>${p['Procedimiento']}</option>`).join('');

  const available = document.getElementById('available-columns');
  const existing = new Set(state.operacion.columns.map(c => c.key));
  available.innerHTML = extraColumnDefs
    .filter(([key]) => !existing.has(key))
    .map(([key, label]) => `<option value="${key}">${label}</option>`)
    .join('');

  setupOperacionForm();
  renderOperacionTable();
  redrawDashboard();
  bindEditsInCatalogTables();
  bindAddColumns();
  persist();
}

function bindAddColumns() {
  document.getElementById('add-column').onclick = e => {
    e.preventDefault();
    const key = document.getElementById('available-columns').value;
    if (!key) return;
    const found = extraColumnDefs.find(c => c[0] === key);
    state.operacion.columns.push({ key: found[0], label: found[1], type: found[2] });
    redraw();
  };
}

function init() {
  tabBehavior();
  bindCatalogo();
  bindCorreo();
  redraw();
}

init();
