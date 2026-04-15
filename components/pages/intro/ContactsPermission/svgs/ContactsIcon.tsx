import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ContactsIcon(props: { width?: number; height?: number }) {
  return (
    <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23 4a3 3 0 00-3-3H4a3 3 0 00-3 3v16a3 3 0 003 3h16a3 3 0 003-3V4zm-2 0a1 1 0 00-1-1H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V4z"
        fill="#0F0F0F"
      />
      <Path
        d="M16 8a4 4 0 11-8 0 4 4 0 018 0zM9.977 8a2.023 2.023 0 104.046 0 2.023 2.023 0 00-4.046 0z"
        fill="#0F0F0F"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.4 16.68C6.49 13.83 9.47 13 12 13s5.51.829 6.6 3.68c.35.915.083 1.796-.464 2.398-.526.58-1.314.922-2.136.922H8c-.822 0-1.61-.342-2.136-.922-.547-.602-.815-1.483-.465-2.397zM12 15c-2.277 0-4.101.743-4.733 2.395-.049.128-.012.24.078.339.13.143.372.266.655.266h8a.904.904 0 00.655-.266c.09-.1.127-.211.078-.339C16.1 15.743 14.276 15 12 15z"
        fill="#0F0F0F"
      />
    </Svg>
  );
}
