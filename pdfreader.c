#include<stdio.h>
#include<stdlib.h>
#include<zlib.h>

int main(){
    FILE *fp = fopen("sample.pdf","rb");
    if (!fp) {
        printf("File open error\n");
        return 1;
    }
    fseek(fp,0,SEEK_END);
    long size = ftell(fp);
    fseek(fp,0,SEEK_SET);
    
    // unsigned char * compressed = malloc(size);
    // fread(compressed,1,size,fp);
    // fclose(fp);

    // unsigned long out_size = size * 10;
    // unsigned char *decompressed = malloc(out_size);

    // int res = uncompress(decompressed,&out_size,compressed,size);

    // if (res != Z_OK) {
    //     printf("Decompression failed: %d\n", res);
    //     return 1;
    // }
    // fwrite(decompressed, 1, out_size, stdout);

    // free(compressed);
    // free(decompressed);

    return 0;
}