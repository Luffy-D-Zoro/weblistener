#include <mupdf/fitz.h>
#include <stdio.h>
static void print_char_flags(unsigned short flags) {
    if (flags & FZ_STEXT_BOLD) printf("BOLD "); 
    if (flags & FZ_STEXT_UNDERLINE) printf("UNDERLINE "); 
    if (flags & FZ_STEXT_STRIKEOUT) printf("STRIKEOUT "); 
    if (flags & FZ_STEXT_SYNTHETIC) printf("SYNTHETIC ");
    if (flags & FZ_STEXT_FILLED) printf("FILLED ");
    if (flags & FZ_STEXT_STROKED) printf("STROKED "); 
    if (flags & FZ_STEXT_CLIPPED) printf("CLIPPED "); 
    return  ; 
}
int main(int argc , char** argv)
{
    if(argc<3){
        fprintf(stderr,"too small argument ");
        return 1;
    }
    const filepath = argv[2];
    const outputpath = argv[3];
    fz_context *ctx = NULL;
    fz_document *doc = NULL;
    fz_page *page =NULL;
    fz_stext_page* text_page = NULL;
    fz_device * dev  = NULL;
    int pages = 0;

    ctx = fz_new_context(NULL, NULL, FZ_STORE_UNLIMITED);
    if (!ctx) {
        fprintf(stderr, "failed to create context\n");
        return 1;
    }

    fz_try(ctx) {
        fz_register_document_handlers(ctx);
        doc = fz_open_document(ctx, "sample1.pdf");
        pages = fz_count_pages(ctx, doc);
        
        page = fz_load_page(ctx,doc,1);
        fz_rect bounds = fz_bound_page(ctx,page);
        text_page = fz_new_stext_page(ctx,bounds);
        //fz_run_page(ctx,page,)
        fz_stext_options opts;
        opts.flags=0;
        dev = fz_new_stext_device(ctx,text_page,&opts);
        fz_run_page(ctx,page,dev,fz_identity,NULL);
        fz_close_device(ctx,dev);
        int bi =0;
        for(fz_stext_block *block = text_page->first_block;block;block=block->next,bi++){
            printf("\n=== BLOCK %d ===\n", bi);
            // printf("type=%d bbox=(%.2f %.2f %.2f %.2f)\n",
            //      block->type, block->bbox.x0,
            //      block->bbox.y0, block->bbox.x1, block->bbox.y1);
            if(block->type != FZ_STEXT_BLOCK_TEXT ){
                continue;
            }
            int li=0;
            for(fz_stext_line* line = block->u.t.first_line;line;line=line->next,li++){
                // printf(" [LINE %d] bbox=(%.2f %.2f %.2f %.2f) dir=(%.2f %.2f) wmode=%u flags=%u\n",
                //      li, line->bbox.x0, line->bbox.y0, line->bbox.x1, line->bbox.y1,
                //      line->dir.x, line->dir.y, line->wmode, line->flags); 
                int ci = 0;
                for(fz_stext_char* ch = line->first_char;ch;ch=ch->next,ci++){
                    const char *fname = ch->font ? fz_font_name(ctx, ch->font) : "(null)";

                    printf("%c",(char)ch->c);

                    // printf(" [CHAR %d] U+%04X '%c' size=%.2f " 
                    //     "origin=(%.2f %.2f) "
                    //     "quad=((%.2f %.2f)(%.2f %.2f)(%.2f %.2f)(%.2f %.2f)) "
                    //     "argb=0x%08X font=%s flags=",
                    //      ci, (unsigned int)ch->c, 
                    //      (ch->c >= 32 && ch->c < 127) ? ch->c : '?', 
                    //      ch->size, ch->origin.x, ch->origin.y, ch->quad.ul.x, ch->quad.ul.y, 
                    //      ch->quad.ur.x, ch->quad.ur.y, ch->quad.ll.x, ch->quad.ll.y,
                    //       ch->quad.lr.x, ch->quad.lr.y, ch->argb, fname);
                    // printf("\n");
                }
                printf("\n");
            }
            printf("\n");
        }

        // printf("Pages: %d\n", pages);
        // printf("page width = %f, height = %f\n", bounds.x1 - bounds.x0, bounds.y1 - bounds.y0);
    }
    fz_always(ctx){
        fz_drop_device(ctx, dev); 
        fz_drop_stext_page(ctx, text_page); 
        fz_drop_page(ctx, page); 
        fz_drop_document(ctx, doc);
         fz_drop_context(ctx);
    }
    fz_catch(ctx) {
        fz_report_error(ctx);
        if (doc) fz_drop_document(ctx, doc);
        fz_drop_context(ctx);
        return 1;
    }

    if (doc) fz_drop_document(ctx, doc);
    fz_drop_context(ctx);
    return 0;
}


