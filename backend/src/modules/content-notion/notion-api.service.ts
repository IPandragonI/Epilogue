import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import * as cheerio from 'cheerio';
import type { AnyNode, Element, Text } from 'domhandler';

type RichTextItem = {
  type: 'text';
  text: { content: string; link?: { url: string } | null };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
};

type NotionBlock = Record<string, unknown>;

@Injectable()
export class NotionApiService {
  private getClient(token: string): Client {
    return new Client({ auth: token });
  }

  /**
   * Accepts a raw UUID, a 32-char hex string, or a full Notion URL and always
   * returns a properly dashed UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
   */
  private normalizePageId(input: string): string {
    // Already a valid UUID with dashes
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.trim())) {
      return input.trim();
    }
    // Extract a 32-char hex run (Notion IDs embedded in URLs or pasted without dashes)
    const match = input.match(/([0-9a-f]{32})/i);
    if (match) {
      const h = match[1];
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
    // Return as-is and let the Notion API produce a meaningful error
    return input.trim();
  }

  async createPage(
    token: string,
    parentPageId: string,
    title: string,
    htmlBody: string,
  ): Promise<string> {
    const notion = this.getClient(token);
    const blocks = this.htmlToNotionBlocks(htmlBody);

    const response = await notion.pages.create({
      parent: { type: 'page_id', page_id: this.normalizePageId(parentPageId) },
      properties: {
        title: {
          title: [{ type: 'text', text: { content: title.slice(0, 2000) } }],
        },
      },
      children: blocks.slice(0, 100) as any,
    });

    const pageId = response.id;

    for (let i = 100; i < blocks.length; i += 100) {
      await notion.blocks.children.append({
        block_id: pageId,
        children: blocks.slice(i, i + 100) as any,
      });
    }

    return pageId;
  }

  async updatePage(
    token: string,
    pageId: string,
    title: string,
    htmlBody: string,
  ): Promise<void> {
    const notion = this.getClient(token);
    const normalizedPageId = this.normalizePageId(pageId);

    await notion.pages.update({
      page_id: normalizedPageId,
      properties: {
        title: {
          title: [{ type: 'text', text: { content: title.slice(0, 2000) } }],
        },
      },
    });

    let hasMore = true;
    let cursor: string | undefined;
    while (hasMore) {
      const result = await notion.blocks.children.list({
        block_id: normalizedPageId,
        start_cursor: cursor,
      });
      await Promise.all(
        result.results.map((block) =>
          notion.blocks.delete({ block_id: block.id }),
        ),
      );
      hasMore = result.has_more;
      cursor = result.next_cursor ?? undefined;
    }

    const blocks = this.htmlToNotionBlocks(htmlBody);
    for (let i = 0; i < blocks.length; i += 100) {
      await notion.blocks.children.append({
        block_id: normalizedPageId,
        children: blocks.slice(i, i + 100) as any,
      });
    }
  }

  private toRichTextChunks(
    text: string,
    ann: Record<string, boolean> = {},
  ): RichTextItem[] {
    const chunks: RichTextItem[] = [];
    for (let i = 0; i < text.length; i += 2000) {
      chunks.push({
        type: 'text',
        text: { content: text.slice(i, i + 2000) },
        annotations: { ...ann },
      });
    }
    return chunks;
  }

  private parseInlineNodes(
    $: cheerio.CheerioAPI,
    el: AnyNode,
  ): RichTextItem[] {
    const rich: RichTextItem[] = [];

    const walk = (node: AnyNode, ann: Record<string, boolean>) => {
      if (node.type === 'text') {
        const content = (node as Text).data ?? '';
        if (content) {
          rich.push(...this.toRichTextChunks(content, ann));
        }
      } else if (node.type === 'tag') {
        const elem = node as Element;
        const tag = elem.tagName?.toLowerCase();
        const next = { ...ann };

        if (tag === 'strong' || tag === 'b') next.bold = true;
        if (tag === 'em' || tag === 'i') next.italic = true;
        if (tag === 's' || tag === 'del' || tag === 'strike') next.strikethrough = true;
        if (tag === 'u') next.underline = true;
        if (tag === 'code') next.code = true;

        if (tag === 'a') {
          const href = $(elem).attr('href') ?? '';
          const text = $(elem).text() ?? '';
          if (text) {
            rich.push({
              type: 'text',
              text: { content: text.slice(0, 2000), link: href ? { url: href } : null },
              annotations: { ...next },
            });
          }
          return;
        }

        if (tag === 'br') {
          rich.push({
            type: 'text',
            text: { content: '\n' },
            annotations: { ...ann },
          });
          return;
        }

        for (const child of elem.children ?? []) {
          walk(child, next);
        }
      }
    };

    for (const child of (el as Element).children ?? []) {
      walk(child, {});
    }

    return rich.length ? rich : [{ type: 'text', text: { content: '' } }];
  }

  private htmlToNotionBlocks(html: string): NotionBlock[] {
    if (!html?.trim()) return [];

    const $ = cheerio.load(html);
    const blocks: NotionBlock[] = [];
    console.log(`[Notion] Parsing HTML, body children count: ${$('body').children().length}`);

    $('body')
      .children()
      .each((_, el) => {
        const elem = el as Element;
        const tag = elem.tagName?.toLowerCase();
        const $el = $(elem);

        switch (tag) {
          case 'h1':
            blocks.push({
              type: 'heading_1',
              heading_1: { rich_text: this.parseInlineNodes($, el) },
            });
            break;

          case 'h2':
            blocks.push({
              type: 'heading_2',
              heading_2: { rich_text: this.parseInlineNodes($, el) },
            });
            break;

          case 'h3':
            blocks.push({
              type: 'heading_3',
              heading_3: { rich_text: this.parseInlineNodes($, el) },
            });
            break;

          case 'blockquote':
            blocks.push({
              type: 'quote',
              quote: { rich_text: this.parseInlineNodes($, el) },
            });
            break;

          case 'pre': {
            const code = $el.find('code').text() || $el.text();
            blocks.push({
              type: 'code',
              code: {
                rich_text: this.toRichTextChunks(code),
                language: 'plain text',
              },
            });
            break;
          }

          case 'ul':
            $el.children('li').each((_, li) => {
              blocks.push({
                type: 'bulleted_list_item',
                bulleted_list_item: {
                  rich_text: this.parseInlineNodes($, li),
                },
              });
            });
            break;

          case 'ol':
            $el.children('li').each((_, li) => {
              blocks.push({
                type: 'numbered_list_item',
                numbered_list_item: {
                  rich_text: this.parseInlineNodes($, li),
                },
              });
            });
            break;

          case 'hr':
            blocks.push({ type: 'divider', divider: {} });
            break;

          case 'p': {
            const richText = this.parseInlineNodes($, el);
            if (richText.some((t) => t.text.content.trim())) {
              blocks.push({
                type: 'paragraph',
                paragraph: { rich_text: richText },
              });
            }
            break;
          }

          default: {
            const text = $el.text().trim();
            if (text) {
              blocks.push({
                type: 'paragraph',
                paragraph: { rich_text: this.toRichTextChunks(text) },
              });
            }
          }
        }
      });

    console.log(`[Notion] Generated ${blocks.length} blocks from HTML`);

    // Fallback: if parsing produced nothing, send the body as plain text
    if (blocks.length === 0) {
      const plainText = $('body').text().trim();
      if (plainText) {
        return this.toRichTextChunks(plainText).map((chunk) => ({
          type: 'paragraph',
          paragraph: { rich_text: [chunk] },
        }));
      }
    }

    return blocks;
  }
}
