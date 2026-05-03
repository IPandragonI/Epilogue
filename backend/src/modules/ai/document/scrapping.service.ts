import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../ai.provider';
import * as aiProviderInterface from '../interfaces/ai-provider.interface';
import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScrappingService {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: aiProviderInterface.AIProvider,
  ) {}

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

      bodyText = bodyText.replace(/```[\s\S]*?```/g, ' ');
      bodyText = bodyText.replace(/`[^`]*`/g, ' ');

      bodyText = bodyText.replace(/<!--[\s\S]*?-->/g, ' ');

      bodyText = bodyText.replace(/\s+/g, ' ').trim();
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
