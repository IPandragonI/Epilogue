import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

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
    };

    try {
      const { data } = await axios.get(url, config);
      const $ = cheerio.load(data);

      $('script, style, noscript').remove();

      let bodyText = $('body').text() || '';

      bodyText = bodyText.replaceAll(/```[\s\S]*?```/g, ' ');
      bodyText = bodyText.replaceAll(/`[^`]*`/g, ' ');

      bodyText = bodyText.replaceAll(/<!--[\s\S]*?-->/g, ' ');

      bodyText = bodyText.replaceAll(/\s+/g, ' ').trim();
      console.log('bodyTest', bodyText);
      return { content: bodyText };
    } catch (error) {
      throw new HttpException(
        `Erreur lors du scraping : ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
