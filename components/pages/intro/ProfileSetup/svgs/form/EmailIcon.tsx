import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function EmailIcon(props: { width?: number; height?: number }) {
  return (
    <Svg width={props.width || 24} height={props.height || 24} viewBox="0 -2.5 20 20">
      <Path
        d="M294 774.474l-10-8.825V777h20v-11.351l-10 8.825zm.001-2.662L284 762.981V762h20v.981l-9.999 8.831z"
        transform="translate(-340 -922) translate(56 160)"
        fill="#8d8c98"
        stroke="none"
        strokeWidth={1}
        fillRule="evenodd"
      />
    </Svg>
  );
}
