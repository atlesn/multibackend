const MB_WASM_PATH = 'mb.wasm';

interface MBChunks {
	[key: number]: number;
}
type MBSizeMatrix = MBChunks;
type MBFreeList = number[];

class Heap {
	pos = 0;
	allocated_chunks: MBChunks = {};
	freed_chunks: MBChunks = {};
	free_list: MBFreeList = [];
	default_sizes = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
	min_size = 8;
	max_size = 4096;
	total_allocations = 0;
	total_frees = 0;
	total_allocated_bytes = 0;
	total_freed_bytes = 0;

	constructor(pos: number) {
		this.pos = pos;
	}

	allocate(size: number) {
		if (size <= this.min_size) {
			size = this.min_size;
		}
		else if (size >= this.max_size) {
			if (size % this.max_size !== 0)
				size = size + (this.max_size - size % this.max_size);
		}
		else {
			if (size % 8 !== 0)
				size = size + (8 - size % 8);

			for (let i = 0; i < this.default_sizes.length; i++) {
				if (size <= this.default_sizes[i]) {
					size = this.default_sizes[i];
					break;
				}
			}
		}

		this.total_allocations++;
		this.total_allocated_bytes += size;

		let best_i = -1;
		let best_pos = -1;
		let best_size = -1;

		for (let i = 0; i < this.free_list.length; i++) {
			const pos = this.free_list[i];
			const freed_size = this.freed_chunks[pos];

			if (freed_size < size)
				continue;

			if (freed_size == size) {
				this.free_list.splice(i, 1);
				delete this.freed_chunks[pos];
				this.allocated_chunks[pos] = size;
				return pos;
			}

			if (best_size === -1 || freed_size < best_size) {
				best_i = i;
				best_pos = pos;
				best_size = freed_size;
			}
		}

		if (best_pos !== -1) {
			const pos = best_pos + best_size - size;
			this.freed_chunks[best_pos] -= size;
			this.allocated_chunks[pos] = size;
			return pos;
		}

		const pos = this.pos;
		this.pos += size;

		this.allocated_chunks[pos] = size;

		return pos;
	}

	free(pos: number) {
		this.total_frees++;
		this.total_freed_bytes += this.allocated_chunks[pos];

		if (!this.allocated_chunks[pos])
			throw new Error("Invalid free po " + pos);

		this.freed_chunks[pos] = this.allocated_chunks[pos];
		delete this.allocated_chunks[pos];
		this.free_list.push(pos);
		this.free_list.sort((a, b) => a - b);

		for (let i = 0; i < this.free_list.length - 1; i++) {
			const cur = this.free_list[i];
			const next = this.free_list[i + 1];

			if (this.freed_chunks[cur] + cur === next) {
				this.freed_chunks[cur] += this.freed_chunks[next];
				delete this.freed_chunks[next];
				this.free_list.splice(i + 1, 1);
			}
		}
	}

	make_size_matrix(chunks): MBSizeMatrix {
		const max_key = ">" + this.max_size;
		const chunk_counts = {};

		Object.keys(chunks).forEach((pos) => {
			const size = chunks[pos];

			let found = false;
			for (let j = 0; j < this.default_sizes.length; j++) {
				if (size > this.default_sizes[j])
					continue;
				if (chunk_counts[this.default_sizes[j]] === undefined)
					chunk_counts[this.default_sizes[j]] = 0;

				chunk_counts[this.default_sizes[j]]++;
				found = true;
				break;
			}
			if (found)
				return;
			if (chunk_counts[max_key] === undefined)
				chunk_counts[max_key] = 0;
			chunk_counts[max_key]++;
		});

		return chunk_counts;
	}

	report_size_matrix(chunk_counts) {
		const keys = Object.keys(chunk_counts);
		keys.sort((a, b) => parseInt(a) - parseInt(b));

		keys.forEach((size) => {
			const count = chunk_counts[size] === undefined
				? 0
				: chunk_counts[size];
			console.log("    " + size + ": " + count);
		});
	}

	report() {
		console.log("Heap report:");
		console.log("  Total allocations: " + this.total_allocations);
		console.log("  Total allocated bytes: " + this.total_allocated_bytes);
		console.log("  Total allocated chunks: " + Object.keys(this.allocated_chunks).length);
		console.log("  Total frees: " + this.total_frees);
		console.log("  Total freed bytes: " + this.total_freed_bytes);
		console.log("  Total free chunks: " + this.free_list.length);
		console.log("  Total bytes: " + (this.pos - 8));
		console.log("  Total free fragmented bytes: " + (this.pos - 8 - this.total_allocated_bytes + this.total_freed_bytes));

		const free_chunk_counts = this.make_size_matrix(this.freed_chunks);
		const allocated_chunk_counts = this.make_size_matrix(this.allocated_chunks);

		console.log("  Free chunk size matrix:");
		this.report_size_matrix(free_chunk_counts);

		console.log("  Allocated chunk size matrix:");
		this.report_size_matrix(allocated_chunk_counts);
	}

	test() {
		const pos_initial = this.pos;
		const a = this.allocate(4);
		console.assert(a === pos_initial);
		console.assert(this.pos === pos_initial + 8);

		this.free(a);
		console.assert(this.freed_chunks[a] === 8);
		console.assert(this.free_list[0] === a);

		const b = this.allocate(4);
		console.assert(b === pos_initial);
		console.assert(this.pos === pos_initial + 8);

		const c = this.allocate(4);
		console.assert(c === pos_initial + 8);
		console.assert(this.pos === pos_initial + 16);

		this.free(b);
		console.assert(this.freed_chunks[b] === 8);
		console.assert(this.free_list[0] === b);

		this.free(c);
		console.assert(this.freed_chunks[b] === 16);
		console.assert(this.free_list[0] === b);
		console.assert(this.free_list.length === 1);

		const d = this.allocate(4);
		console.assert(d === pos_initial + 8);
		console.assert(this.pos === pos_initial + 16);

		const e = this.allocate(4);
		console.assert(e === pos_initial);
		console.assert(this.pos === pos_initial + 16);

		const f = this.allocate(4);
		console.assert(f === pos_initial + 16);
		console.assert(this.pos === pos_initial + 24);

		this.free(d);
		console.assert(this.freed_chunks[d] === 8);
		console.assert(this.free_list[0] === d);

		this.free(e);
		console.assert(this.freed_chunks[e] === 16);
		console.assert(this.free_list[0] === e);

		this.free(f);
		console.assert(this.freed_chunks[e] === 24);
		console.assert(this.free_list[0] === e);
		console.assert(this.free_list.length === 1);

		const allocs = [];
		this.default_sizes.forEach((size) => {
			allocs.push(this.allocate(size));
		});

		console.log("Test heap report 1:");
		this.report();

		allocs.forEach((pos) => {
			this.free(pos);
		});

		console.assert(this.free_list.length === 1);
		console.assert(this.freed_chunks[pos_initial] === this.pos - pos_initial);

		console.log("Test heap report 2:");
		this.report();
	}
}

export class MB {
	constructor() {
		let heap: Heap | undefined = undefined;

		WebAssembly.instantiateStreaming(fetch(MB_WASM_PATH), {
			env: {
				"memory": new WebAssembly.Memory({initial: 2}),
				"mb_alloc": (size: number) => {
					return heap.allocate(size);
				},
				"mb_free": (pos: number) => {
					heap.free(pos);
				},
				"mb_strlen": (str: string) => {
					return str.length;
				},
				"mb_strcpy": (dst: string, src: string) => {
					return dst;
				}
			}
		}).then((w) => {
			heap = new Heap((w.instance.exports.__heap_base as WebAssembly.Global).value);
			heap.test();
			const f = w.instance.exports.mb_push_backend as CallableFunction;
			f("backend");
		});
	}
}

