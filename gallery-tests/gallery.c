//
// Created by tedle on 11/14/2019.
//
#include "gallery.h"
#include <stdlib.h>
#include <string.h>
#include <png.h>

struct LinkedList{
    char * name;
    int height;
    int width;
    struct LinkedList * next;
};

struct gallery{
    struct LinkedList * list_image;
    int count;
};

/* Constructor: allocates memory and returns a pointer to a new gallery.
 */
struct gallery *gallery_new(){
    struct gallery new_gallery = (struct gallery) malloc(sizeof(struct gallery));
    return &new_gallery;
}

/* Destructor: frees all the memory allocated to the gallery.
 */
void gallery_delete(struct gallery *g){
    //TODO traverse list_image and free all
    g->count = 0;
    struct LinkedList * head = g->list_image;
    while(head){
        g->list_image = g->list_image->next
    }
}


/* Adds a PNG by filename to the gallery. If the filename is already in the
 * gallery, returns -1; if the file does not exist, or if it is not a valid PNG
 * format, returns -2; otherwise, returns 1 on success.
 */
int gallery_add(struct gallery *g, char *filename){
    FILE fp = fopen(filename, "rb");
    if(fp == NULL){
        return -2;
    }

    if (g->count == 0) {
        //TODO 1: Make new image

        g->count = 1;
        return 1;
    }
    struct LinkedList * ptr1 = Gallery.list_image;
    while(ptr1->next){
        if(strcmp(ptr1, filename)==0){
            return -1;
        }
        ptr1 = ptr1->next;
    }
    if(strcmp(ptr1, filename)==0){
        return -1;
    } else {
        //TODO 2: insert image into the list_image
        return 1
    }
}

/* Removes a photo from the gallery. Returns 1 on successful removal, otherwise
 * 0 if the photo is not in the gallery.
 */
int gallery_rm(struct gallery *g, char *filename){
    struct LinkedList * head = g->list_image;
    if(strcmp(head->name, filename) == 0){
        g->list_image = g->list_image->next;
        free(head);
        g->count -= 1;
        return 1
    }
    struct LinkedList * p1 = head;
    while(head){
        head = head->next;
        if(head){
            if(strcmp(head->name, filename) == 0){
                p1->next = head->next;
                free(head);
                g->count -= 1;
                return 1;
            }
        }
        p1 = head;
    }
    return 0;
}

/* Returns the number of photos in the gallery.
 */
int gallery_count(struct gallery *g){
    return g->count;
}

/* Removes photos from the gallery that do not match a predicate function. The
 * predicate is passed the filename, width and height of each photo. The
 * predicate should return 1 to keep the photo, and 0 to remove the photo. The
 * function returns the number of photos present after filtering.
 */
int gallery_filter(struct gallery *g, int (*f)(char *filename, int width, int height)){
    int counter = 0;
    struct LinkedList * head = g->list_image;
    struct LinkedList * ptr1 = head;
    while(head){
        if(!f(head->name, head->width, head->height)){
            //TODO Remove the photo from the LinkedList;

            counter += 1;
        }
    }
    return counter;
}

/* Returns the filename of the photo that is the best fit for the dimensions
 * width*height. If there are multiple best fits, any may be returned. If there
 * are no photos that fit, returns NULL.
 */
char *gallery_bestfit(struct gallery *g, int max_width, int max_height){

}
