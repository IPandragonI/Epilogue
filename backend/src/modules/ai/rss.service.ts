import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Parser from 'rss-parser';
import { assertPublicHttpUrl } from '../../common/security/url-security.util';

export interface RssFeedItem {
  title: string;
  link: string;
  summary: string;
  pubDate?: string;
}

export interface RssFeedResult {
  feedTitle: string;
  items: RssFeedItem[];
}

@Injectable()
export class RssService {
  private readonly parser = new Parser({ timeout: 10000 });

  async parseFeed(url: string): Promise<RssFeedResult> {
    const safeUrl = await assertPublicHttpUrl(url);

    try {
      const feed = await this.parser.parseURL(safeUrl.toString());

      const items: RssFeedItem[] = (feed.items ?? [])
        .filter((item) => item.title && item.link && this.isAbsoluteUrl(item.link))
        .slice(0, 15)
        .map((item) => ({
          title: item.title as string,
          link: item.link as string,
          summary: this.cleanSummary(
            item.contentSnippet || item.summary || item.content || '',
          ),
          pubDate: item.pubDate ?? item.isoDate,
        }));

      return {
        feedTitle: feed.title ?? 'Flux RSS',
        items,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Impossible de récupérer le flux RSS : ${error.message}`,
      );
    }
  }

  private cleanSummary(text: string): string {
    return text.replace(/\s+/g, ' ').trim().slice(0, 400);
  }

  private isAbsoluteUrl(link: string): boolean {
    try {
      const parsed = new URL(link);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
