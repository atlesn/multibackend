#ifndef MB_H
#define MB_H

#include "config.h"

#if defined(MB_INT_IS_32)
typedef unsigned int mb_u32;
typedef int mb_i32;
#else
#error "mb.h: unsupported MB_INT_IS_*"
#endif

void *mb_alloc(mb_u32 s);
mb_u32 mb_strlen(const char *s);
mb_u32 mb_strcpy(char *dst, const char *src);


#endif /* MB_H */
