/**
 * Sandbox Lua - CorePlayBlox
 *
 * FASE FUTURA: Integrar fengari (Lua en JavaScript) para scripts en juegos.
 * Por ahora: stub que documenta la arquitectura prevista.
 *
 * SEGURIDAD:
 * - Sin acceso a filesystem, require, os.execute
 * - API limitada: game objects, eventos (collision, click)
 * - Timeout de ejecución (ej. 100ms por frame)
 * - Sin eval de código arbitrario
 *
 * API prevista para scripts:
 *   game.getObject(id)
 *   game.onCollision(callback)
 *   game.onClick(callback)
 *   object.position = {x, y, z}
 *   object.velocity = {x, y, z}
 *   print(msg) -> consola del editor
 */

const LuaSandbox = {
  /**
   * Ejecuta código Lua en sandbox (stub)
   * @param {string} code - Código Lua
   * @param {Object} context - Objetos/eventos disponibles
   * @returns {{ success: boolean, error?: string, result?: any }}
   */
  run(code, context = {}) {
    if (!code || typeof code !== 'string') {
      return { success: false, error: 'Código vacío' };
    }
    // TODO: Integrar fengari u otro intérprete Lua en JS
    // Por ahora retornamos ok sin ejecutar
    return { success: true, result: null };
  },

  /**
   * Valida sintaxis sin ejecutar
   */
  validate(code) {
    if (!code || typeof code !== 'string') return { valid: false, error: 'Código vacío' };
    // TODO: Parser Lua para validación
    return { valid: true };
  },
};
