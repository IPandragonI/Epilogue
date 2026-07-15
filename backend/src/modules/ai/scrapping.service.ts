import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { assertPublicHttpUrl } from '../../common/security/url-security.util';

const MAX_REDIRECTS = 5;
const MAX_CONTENT_BYTES = 5 * 1024 * 1024;

@Injectable()
export class ScrappingService {
  constructor() {}

  async scrapeUrl(url: string): Promise<{ content: string }> {
    const config: AxiosRequestConfig = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
      maxRedirects: 0,
      maxContentLength: MAX_CONTENT_BYTES,
      maxBodyLength: MAX_CONTENT_BYTES,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || (status >= 300 && status < 400),
    };

    try {
      let currentUrl = (await assertPublicHttpUrl(url)).toString();
      let data: string;
      let contentType: string | undefined;

      for (let redirects = 0; ; redirects++) {
        const response = await axios.get(currentUrl, config);

        if (response.status >= 300 && response.status < 400) {
          const location = response.headers['location'];
          if (!location || redirects >= MAX_REDIRECTS) {
            throw new HttpException(
              'Trop de redirections lors du scraping',
              HttpStatus.BAD_GATEWAY,
            );
          }
          currentUrl = (
            await assertPublicHttpUrl(new URL(location, currentUrl).toString())
          ).toString();
          continue;
        }

        data = response.data;
        contentType = response.headers['content-type']
          ? String(response.headers['content-type'])
          : undefined;
        break;
      }

      if (contentType && !contentType.includes('html') && !contentType.includes('xml')) {
        throw new HttpException(
          'Le contenu de cette URL n’est pas une page HTML',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const $ = cheerio.load(data);

      $('script, style, noscript').remove();

      let bodyText = $('body').text() || '';

      bodyText = bodyText.replaceAll(/```[\s\S]*?```/g, ' ');
      bodyText = bodyText.replaceAll(/`[^`]*`/g, ' ');

      bodyText = bodyText.replaceAll(/<!--[\s\S]*?-->/g, ' ');

      bodyText = bodyText.replaceAll(/\s+/g, ' ').trim();
      return { content: bodyText };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erreur lors du scraping : ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
