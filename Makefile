TSC = tsc
TSCFLAGS = --module NodeNext
CC = clang
CFLAGS := --target=wasm32 -nostdlib -nostdinc -c

all: mb.wasm \
     mb.mjs

%.wasm: %.c
	${CC} ${CFLAGS} -o $@ $<

%.mjs: %.mts
	${TSC} ${TSCFLAGS} $<

clean:
	rm -f *.wasm *.mjs

.PHONY: all clean

