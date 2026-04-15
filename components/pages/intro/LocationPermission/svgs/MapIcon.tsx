import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function MapIcon(props: { width?: number; height?: number }) {
  return (
    <Svg width={props.width || 64} height={props.height || 64} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.7 15c-1.666.635-2.7 1.52-2.7 2.5 0 1.933 4.03 3.5 9 3.5s9-1.567 9-3.5c0-.98-1.034-1.865-2.7-2.5M12 9h.01M18 9c0 4.064-4.5 6-6 9-1.5-3-6-4.936-6-9a6 6 0 1112 0zm-5 0a1 1 0 11-2 0 1 1 0 012 0z"
        stroke="#000"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
