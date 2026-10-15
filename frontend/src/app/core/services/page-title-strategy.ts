import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { PageMeta, SeoService } from './seo';

/**
 * Applies the `title` and `meta` fields declared on each route.
 *
 * Angular calls this on every successful navigation, which means SEO tags are
 * handled centrally - a feature route only has to declare its metadata in
 * app.routes.ts and it is applied automatically.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? '';
    const routeMeta = this.deepestRouteMeta(snapshot);

    this.seo.apply({
      ...routeMeta,
      title: routeMeta?.title ?? title,
      path: snapshot.url,
    });
  }

  /** Walks to the deepest activated route and reads its `data.meta`. */
  private deepestRouteMeta(snapshot: RouterStateSnapshot): Partial<PageMeta> | undefined {
    let route = snapshot.root;
    let meta: Partial<PageMeta> | undefined;

    while (route) {
      const candidate = route.data?.['meta'] as Partial<PageMeta> | undefined;
      if (candidate) {
        meta = candidate;
      }
      route = route.firstChild!;
    }

    return meta;
  }
}
