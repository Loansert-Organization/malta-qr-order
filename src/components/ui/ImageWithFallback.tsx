import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  className?: string;
}

const ImageWithFallback: React.FC<Props> = ({ fallbackSrc = '/placeholder.svg', className, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <img src={fallbackSrc} alt={rest.alt} className={className} />;
  }

  return (
    <>
      {!loaded && (
        <Skeleton className={className} />
      )}
      <img
        {...rest}
        className={`${className} ${loaded ? 'block' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </>
  );
};

export default ImageWithFallback; 