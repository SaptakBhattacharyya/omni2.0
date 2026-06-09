import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
  const siteTitle = 'OmniRetail - High-Fidelity Hybrid Retail Platform';
  const siteDescription = 'OmniRetail empowers retailers with real-time stock visibility, AI price negotiations, and seamless hybrid retail integration.';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://omniretail.vercel.app';
  const siteLogo = '/favicon.jpg';
  
  const displayTitle = title ? `${title} | OmniRetail` : siteTitle;
  const displayDescription = description || siteDescription;
  const displayImage = image || siteLogo;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{displayTitle}</title>
      <meta name="description" content={displayDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:image" content={displayImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={displayTitle} />
      <meta property="twitter:description" content={displayDescription} />
      <meta property="twitter:image" content={displayImage} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={url || siteUrl} />
    </Helmet>
  );
};

export default SEO;
