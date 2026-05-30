#include<mupdf/fitz.h>
#include<stdio.h>
static char* find_flags(unsigned short flags){
    if(flags & FZ_STEXT_BOLD) return "BOLD";
    if (flags & FZ_STEXT_UNDERLINE) return "UNDERLINE" ;
    if (flags & FZ_STEXT_STRIKEOUT) return "STRIKEO";
    if (flags & FZ_STEXT_SYNTHETIC) return "SYNTHETIC";
    if (flags & FZ_STEXT_FILLED) return "FILLED";
    if (flags & FZ_STEXT_STROKED) return "STROKED ";
    if (flags & FZ_STEXT_CLIPPED) return "CLIPPED ";
}

int main(int argc , char **argv){

    if(argc<3){
        fprintf(stderr,"argument count is too samll");
        return 1;
    }
    const char* filePath = argv[1];
    const char * outputPath = argv[2];
    fz_context* ctx  =NULL;
    fz_stext_page *stext_page = NULL;
    fz_document * doc =NULL;
    fz_device* dev = NULL;
    fz_page* page = NULL;
    fz_stext_options opt ;
    opt.flags = 0;
    int pages = 0;
    
    int counter =0;
    ctx=fz_new_context(NULL,NULL,FZ_STORE_UNLIMITED);
    if(!ctx){
        fprintf(stderr,"failed to create context\n");
        return 1;
    }
    fz_register_document_handlers(ctx);
    doc = fz_open_document(ctx,filePath);
    pages = fz_count_pages(ctx,doc);
    FILE* fp = fopen(outputPath,"w");
    while(counter<pages){
        page = fz_load_page(ctx,doc,counter);
        fz_rect bounds = fz_bound_page(ctx,page);
        stext_page = fz_new_stext_page(ctx,bounds);
        dev = fz_new_stext_device(ctx,stext_page,&opt);
        fz_run_page(ctx,page,dev,fz_identity,NULL);
        fz_close_device(ctx,dev);
        for(fz_stext_block* block = stext_page->first_block;block;block=block->next){
            for(fz_stext_line* line = block->u.t.first_line;line;line=line->next){
                for(fz_stext_char* ch = line->first_char;ch;ch = ch->next){
                    char utf8[10];
                    int len = fz_runetochar(utf8, ch->c);
                    utf8[len] = '\0';
                    fprintf(fp, "%s", utf8);
                }
            }
        
        }
        counter++;
    }
    return 0;
}