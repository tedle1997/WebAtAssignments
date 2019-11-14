#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>

#include "gallery.h"

int main() {
    struct gallery *g = gallery_new();

    assert(gallery_add(g, "480x320.png") == 1);
    assert(gallery_count(g) == 1);

    assert(gallery_add(g, "640x480.png") == 1);
    assert(gallery_count(g) == 2);

    assert(gallery_add(g, "480x320.png") == -1); // already exists
    assert(gallery_count(g) == 2);

    assert(gallery_add(g, "test.c") == -2); // invalid PNG format
    assert(gallery_count(g) == 2);

    assert(strcmp(gallery_bestfit(g, 640, 480), "640x480.png") == 0);
    assert(strcmp(gallery_bestfit(g, 640, 481), "640x480.png") == 0);
    assert(strcmp(gallery_bestfit(g, 640, 479), "480x320.png") == 0);
    assert(gallery_bestfit(g, 0, 0) == NULL);

    int myfilter(char *fn, int w, int h) { return w < 640; }
    assert(gallery_filter(g, myfilter) == 1);
    assert(gallery_count(g) == 1);

    assert(gallery_rm(g, "480x320.png") == 1);
    assert(gallery_count(g) == 0);

    gallery_delete(g);

    return 0;
}
