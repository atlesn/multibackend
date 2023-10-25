#include "mb.h"

void mb_push_backend(const char *backend) {
	char *memory = mb_alloc(mb_strlen(backend) + 1);
	mb_strcpy(memory, backend);
}
