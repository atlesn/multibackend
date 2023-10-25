const MB_WASM_PATH = 'mb.wasm';

class MB {
	constructor() {
		WebAssembly.instantiateStreaming(fetch(MB_WASM_PATH), {
			env: {
				"mb_alloc": (size: number) => {
					throw("NOT IMPLEMENTED");
					return 0;
				},
				"mb_strlen": (str: string) => {
					return str.length;
				},
				"mb_strcpy": (dst: string, src: string) => {
					return dst;
				}
			}
		}).then((o) => {
//			o.instance.exports.mb_main();
		});
	}
}

