TSC = tsc
TSCFLAGS = --module system
CC = clang
CFLAGS := --target=wasm32 -nostdlib -nostdinc -c

all: mb.wasm \
     mb.mjs

%.wasm: %.c
	${CC} ${CFLAGS} -o $@ $<

%.mjs: %.mts
	${TSC} ${TSCFLAGS} --outFile $@ $<

clean:
	rm -f *.wasm

.PHONY: all clean

