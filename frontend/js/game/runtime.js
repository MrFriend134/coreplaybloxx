/**
 * Runtime de juegos
 * CorePlayBlox - Frontend
 *
 * Renderiza y ejecuta juegos publicados.
 * Por ahora: canvas 2D básico. Fase futura: Three.js + Lua.
 */

const GameRuntime = (function () {
  'use strict';

  let canvas = null;
  let ctx = null;
  let gameData = {};
  let gameId = null;
  let animationId = null;

  function init(canvasEl, data, id) {
    canvas = canvasEl;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    gameData = data || {};
    gameId = id || '';

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Conectar al room del juego vía WebSocket
    if (gameId && typeof SocketClient !== 'undefined') {
      SocketClient.emit('join-game', { gameId });
    }

    startLoop();
  }

  function startLoop() {
    function loop() {
      if (!ctx) return;
      render();
      animationId = requestAnimationFrame(loop);
    }
    if (animationId) cancelAnimationFrame(animationId);
    loop();
  }

  function render() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    const objects = gameData.objects || [];
    objects.forEach((obj) => {
      const x = (obj.x || 0) * w;
      const y = (obj.y || 0) * h;
      const size = (obj.size || 0.1) * Math.min(w, h);
      ctx.fillStyle = obj.color || '#00c853';
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((obj.rotation || 0) * Math.PI / 180);
      ctx.translate(-size / 2, -size / 2);
      if (obj.type === 'sphere') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === 'cylinder') {
        ctx.fillRect(0, 0, size, size);
      } else {
        ctx.fillRect(0, 0, size, size);
      }
      ctx.restore();
    });

    ctx.fillStyle = 'rgba(0,200,83,0.3)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CorePlayBlox - Juego en ejecución', 10, h - 10);
  }

  function destroy() {
    if (gameId && typeof SocketClient !== 'undefined') {
      SocketClient.emit('leave-game');
    }
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    canvas = null;
    ctx = null;
  }

  return {
    init,
    destroy,
  };
})();
