const MB_WASM_PATH = 'mb.wasm';
export class MB {
    constructor() {
        WebAssembly.instantiateStreaming(fetch(MB_WASM_PATH), {
            env: {
                "mb_alloc": (size) => {
                    throw ("NOT IMPLEMENTED");
                    return 0;
                },
                "mb_strlen": (str) => {
                    return str.length;
                },
                "mb_strcpy": (dst, src) => {
                    return dst;
                }
            }
        }).then((o) => {
            //			o.instance.exports.mb_main();
        });
    }
}
