TSC = tsc
TSCFLAGS += --module NodeNext
CC = clang
# CFLAGS with WASM specific flags
CFLAGS += --target=wasm32 -nostdlib -nostdinc -Wl,--no-entry -Wl,--export-all \
	-Wl,--allow-undefined -Wl,--export-dynamic \
	-Wl,--strip-all -Wl,--gc-sections -Wl,--initial-memory=131072

all: mb.wasm \
     mb.mjs

%.wasm: %.c
	${CC} ${CFLAGS} -o $@ $<

%.mjs: %.mts
	${TSC} ${TSCFLAGS} $<

clean:
	rm -f *.wasm *.mjs

.PHONY: all clean

