all: test

gallery.o: gallery.c
	$(CC) -c -o $@ $< $(CFLAGS)

test: gallery.o test.c
	$(CC) -o $@ $^ $(CFLAGS)

tidy:
	rm -f *.o

clean: tidy
	rm -f test
