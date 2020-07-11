import slug from 'slug';

export const slugify = (text: string): string =>
  slug(text, {
    lower: true,
  });
