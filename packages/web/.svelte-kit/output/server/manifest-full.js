export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.CN10apbX.js",app:"_app/immutable/entry/app.p8aEspSx.js",imports:["_app/immutable/entry/start.CN10apbX.js","_app/immutable/chunks/C1Q5H8Mv.js","_app/immutable/chunks/DXlRHvn5.js","_app/immutable/entry/app.p8aEspSx.js","_app/immutable/chunks/DXlRHvn5.js","_app/immutable/chunks/DqkJwZYL.js","_app/immutable/chunks/BdB0C_9E.js","_app/immutable/chunks/B7TfO0g5.js","_app/immutable/chunks/B8F-VQ4P.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/[chatId]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"chatId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
