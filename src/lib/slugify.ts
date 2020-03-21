import slug from 'slug';

export const slugify = (text: string) =>
  slug(text, {
    lower: true,
  });
