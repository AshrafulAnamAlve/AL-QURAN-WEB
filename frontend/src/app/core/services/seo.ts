import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface PageMeta {
  /** Page title, without the site suffix. */
  title: string;
  /** 150-160 characters works best in search results. */
  description?: string;
  /** Absolute or root-relative URL of a preview image. */
  image?: string;
  /** Path of the canonical URL, e.g. '/quran/18'. */
  path?: string;
  /** Set true on pages that should stay out of search results. */
  noIndex?: boolean;
}

/**
 * Owns everything inside <head> that changes per route: title, description,
 * Open Graph tags and the canonical link.
 *
 * Note: this app is a client-rendered SPA, so these tags are set after the
 * JavaScript runs. Google executes JavaScript and will see them; some simpler
 * crawlers and link unfurlers will not. Enabling Angular's prerendering is the
 * documented next step if that matters - see README, "Known limitations".
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private static readonly SITE_NAME = 'Al-Quran';
  private static readonly DEFAULT_DESCRIPTION =
    'Read the complete Quran in Arabic with Bangla translation, listen to recitation, ' +
    'check prayer times, view the Islamic calendar and find nearby mosques.';

  apply(page: PageMeta): void {
    const fullTitle = page.title
      ? `${page.title} — ${SeoService.SITE_NAME}`
      : `${SeoService.SITE_NAME} — Read the Quran with Bangla Translation`;

    const description = page.description ?? SeoService.DEFAULT_DESCRIPTION;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });

    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SeoService.SITE_NAME });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    if (page.image) {
      const image = this.absolute(page.image);
      this.meta.updateTag({ property: 'og:image', content: image });
      this.meta.updateTag({ name: 'twitter:image', content: image });
    }

    if (page.path) {
      const url = this.absolute(page.path);
      this.meta.updateTag({ property: 'og:url', content: url });
      this.setCanonical(url);
    }

    if (page.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private absolute(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) {
      return pathOrUrl;
    }

    const base = environment.appUrl.replace(/\/+$/, '');
    return `${base}/${pathOrUrl.replace(/^\/+/, '')}`;
  }
}
