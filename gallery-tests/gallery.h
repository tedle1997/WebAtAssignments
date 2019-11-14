#ifndef __GALLERY_H__
#define __GALLERY_H__

struct gallery;

/* Constructor: allocates memory and returns a pointer to a new gallery.
 */
struct gallery *gallery_new();

/* Destructor: frees all the memory allocated to the gallery.
 */
void gallery_delete(struct gallery *g);

/* Adds a PNG by filename to the gallery. If the filename is already in the
 * gallery, returns -1; if the file does not exist, or if it is not a valid PNG
 * format, returns -2; otherwise, returns 1 on success.
 */
int gallery_add(struct gallery *g, char *filename);

/* Removes a photo from the gallery. Returns 1 on successful removal, otherwise
 * 0 if the photo is not in the gallery.
 */
int gallery_rm(struct gallery *g, char *filename);

/* Returns the number of photos in the gallery.
 */
int gallery_count(struct gallery *g);

/* Removes photos from the gallery that do not match a predicate function. The
 * predicate is passed the filename, width and height of each photo. The
 * predicate should return 1 to keep the photo, and 0 to remove the photo. The
 * function returns the number of photos present after filtering.
 */
int gallery_filter(struct gallery *g,
                    int (*f)(char *filename, int width, int height));

/* Returns the filename of the photo that is the best fit for the dimensions
 * width*height. If there are multiple best fits, any may be returned. If there
 * are no photos that fit, returns NULL.
 */
char *gallery_bestfit(struct gallery *g, int max_width, int max_height);

#endif // __GALLERY_H__
