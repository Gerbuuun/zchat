import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DXKZzI_g.js","_app/immutable/chunks/DqkJwZYL.js","_app/immutable/chunks/DXlRHvn5.js","_app/immutable/chunks/BdB0C_9E.js","_app/immutable/chunks/BQ3ExOcy.js","_app/immutable/chunks/9xNfiEXT.js","_app/immutable/chunks/C1Q5H8Mv.js","_app/immutable/chunks/AMBKYCc2.js","_app/immutable/chunks/DspAWYAj.js","_app/immutable/chunks/B7TfO0g5.js","_app/immutable/chunks/CNYwChdC.js"];
export const stylesheets = ["_app/immutable/assets/0.5X506Jz2.css"];
export const fonts = [];
