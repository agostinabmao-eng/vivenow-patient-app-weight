import { useState } from 'react';
import Icon from './Icon';

const PHOTOS = import.meta.glob('../assets/photos/*.jpg', { eager: true, import: 'default' });

/** A real-photography slot. The brand calls for natural photos of active
 * older adults (60s–70s) — walking, stretching, weighing themselves — so
 * every image in the app goes through here. Drop the file in src/assets/photos/
 * (see README.md there for the list of slots) and it appears; until
 * then a soft sand placeholder keeps the layout intact instead of a broken
 * image. */
export default function Photo({ name, alt = '', height = 180, radius = 'var(--radius-xl)', position = 'center', children, style }) {
  const src = PHOTOS[`../assets/photos/${name}.jpg`];
  const [failed, setFailed] = useState(!src);
  return (
    <div
      style={{
        position: 'relative',
        height,
        borderRadius: radius,
        overflow: 'hidden',
        background: 'var(--sand-100)',
        ...style,
      }}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, display: 'block' }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand-100)' }}
        >
          <div style={{ textAlign: 'center', padding: '0 24px' }}>
            <Icon name="user" size={36} color="var(--sand-300)" style={{ margin: '0 auto' }} />
            {alt && <div style={{ font: '500 0.875rem/1.3 var(--font-sans)', color: 'var(--peach-700)', opacity: 0.7, marginTop: 8 }}>{alt}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
