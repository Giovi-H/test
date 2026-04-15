import React, { createContext, useContext, useState } from 'react';

type ProfileContextType = {
  profileImage: any;
  setProfileImage: (image: any) => void;
  userId: string | null;
  setUserId: (id: string) => void;
};

const ProfileContext = createContext<ProfileContextType>({
  profileImage: require('../assets/snorlax.png'),
  setProfileImage: () => {},
  userId: null,
  setUserId: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileImage, setProfileImage] = useState(require('../assets/snorlax.png'));
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <ProfileContext.Provider value={{ profileImage, setProfileImage, userId, setUserId }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
