import { Helmet } from 'react-helmet-async';

type Props = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  schema?: Record<string, unknown>;
};

const siteUrl = 'https://simpleautomate.co.uk';

export const Seo = ({ title, description, path = '/', image, schema }: Props) => {
  const url = `${siteUrl}${path}`;
  const ogImage =
    image ?? 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80';

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href={url} />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

