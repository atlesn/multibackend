#ifndef MB_H
#define MB_H

static char _mb_int_size_must_be_4 [sizeof(int) == 4 ? 1 : -1];

typedef unsigned int mb_u32;
typedef int mb_i32;

void *mb_alloc(mb_u32 s);
void mb_free(void *p);
mb_u32 mb_strlen(const char *s);
mb_u32 mb_strcpy(char *dst, const char *src);

#endif /* MB_H */
