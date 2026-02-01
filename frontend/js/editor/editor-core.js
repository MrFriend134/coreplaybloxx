/**
 * Editor de juegos - Core
 * CorePlayBlox - Frontend
 *
 * Colocar objetos, modificar propiedades, vista 2D/3D básica.
 * Estilo sandbox original - no copiar Roblox Studio.
 */

const EditorCore = (function () {
  'use strict';

  let canvas = null;
  let ctx = null;
  let objects = [];
  let selectedId = null;
  let dragOffset = { x: 0, y: 0 };

  function init(canvasEl) {
    canvas = canvasEl;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    objects = [];
    selectedId = null;
    resize();
    render();
    setupEvents();
  }

  function resize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    render();
  }

  function addObject(type) {
    const id = 'obj_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const obj = {
      id,
      type: type || 'cube',
      x: 0.5,
      y: 0.5,
      size: 0.1,
      rotation: 0,
      color: '#00c853',
    };
    objects.push(obj);
    selectedId = id;
    render();
    updatePropertyPanel();
    return obj;
  }

  function removeObject(id) {
    objects = objects.filter((o) => o.id !== id);
    if (selectedId === id) selectedId = null;
    render();
    updatePropertyPanel();
  }

  function getSelectedObject() {
    return objects.find((o) => o.id === selectedId);
  }

  function updateObject(id, props) {
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;
    Object.assign(obj, props);
    render();
    updatePropertyPanel();
  }

  function screenToNorm(x, y) {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (x - rect.left) / rect.width,
      y: (y - rect.top) / rect.height,
    };
  }

  function hitTest(x, y) {
    const n = screenToNorm(x, y);
    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      const size = o.size * Math.min(canvas?.width || 1, canvas?.height || 1) / 2;
      const ox = o.x * (canvas?.width || 1);
      const oy = o.y * (canvas?.height || 1);
      const px = n.x * (canvas?.width || 1);
      const py = n.y * (canvas?.height || 1);
      if (Math.abs(px - ox) < size && Math.abs(py - oy) < size) return o;
    }
    return null;
  }

  function setupEvents() {
    if (!canvas) return;
    canvas.addEventListener('mousedown', (e) => {
      const hit = hitTest(e.clientX, e.clientY);
      if (hit) {
        selectedId = hit.id;
        const n = screenToNorm(e.clientX, e.clientY);
        dragOffset = { x: n.x - hit.x, y: n.y - hit.y };
      } else {
        selectedId = null;
      }
      updatePropertyPanel();
      render();
    });
    canvas.addEventListener('mousemove', (e) => {
      if (!selectedId) return;
      const obj = getSelectedObject();
      if (!obj) return;
      const n = screenToNorm(e.clientX, e.clientY);
      obj.x = Math.max(0, Math.min(1, n.x - dragOffset.x));
      obj.y = Math.max(0, Math.min(1, n.y - dragOffset.y));
      render();
    });
    canvas.addEventListener('mouseup', () => {});
    canvas.addEventListener('mouseleave', () => {});
    window.addEventListener('resize', resize);
  }

  function updatePropertyPanel() {
    const panel = document.getElementById('property-panel');
    if (!panel) return;
    const obj = getSelectedObject();
    if (!obj) {
      panel.innerHTML = '<p style="color:var(--text-secondary)">Selecciona un objeto</p>';
      return;
    }
    panel.innerHTML = `
      <div class="property-row">
        <label>X</label>
        <input type="number" step="0.01" value="${obj.x}" data-prop="x">
      </div>
      <div class="property-row">
        <label>Y</label>
        <input type="number" step="0.01" value="${obj.y}" data-prop="y">
      </div>
      <div class="property-row">
        <label>Tamaño</label>
        <input type="number" step="0.01" min="0.01" value="${obj.size}" data-prop="size">
      </div>
      <div class="property-row">
        <label>Rotación</label>
        <input type="number" value="${obj.rotation}" data-prop="rotation">
      </div>
      <div class="property-row">
        <label>Color</label>
        <input type="color" value="${obj.color}" data-prop="color">
      </div>
      <button class="btn btn-sm btn-secondary" id="btn-delete-object">Eliminar</button>
    `;
    panel.querySelectorAll('input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const prop = input.dataset.prop;
        let val = input.value;
        if (prop === 'x' || prop === 'y' || prop === 'size') val = parseFloat(val);
        if (prop === 'rotation') val = parseFloat(val);
        updateObject(obj.id, { [prop]: val });
      });
    });
    const btnDelete = document.getElementById('btn-delete-object');
    if (btnDelete) btnDelete.addEventListener('click', () => removeObject(obj.id));
  }

  function render() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (w / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const y = (h / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    objects.forEach((obj) => {
      const x = obj.x * w;
      const y = obj.y * h;
      const size = obj.size * Math.min(w, h);
      ctx.fillStyle = obj.color || '#00c853';
      ctx.strokeStyle = selectedId === obj.id ? '#00e676' : '#30363d';
      ctx.lineWidth = selectedId === obj.id ? 3 : 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((obj.rotation || 0) * Math.PI / 180);
      ctx.translate(-size / 2, -size / 2);
      ctx.fillRect(0, 0, size, size);
      ctx.strokeRect(0, 0, size, size);
      ctx.restore();
    });
  }

  function getGameData() {
    return { objects: objects.map((o) => ({ ...o })) };
  }

  function loadGameData(data) {
    objects = Array.isArray(data?.objects) ? data.objects.map((o) => ({ ...o, id: o.id || 'obj_' + Date.now() + Math.random() })) : [];
    selectedId = null;
    render();
    updatePropertyPanel();
  }

  return {
    init,
    addObject,
    removeObject,
    getGameData,
    loadGameData,
  };
})();
