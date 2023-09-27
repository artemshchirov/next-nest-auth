'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import React from 'react';

const SignoutButton = () => {
  const { data: session } = useSession();
  console.log('Session data', session);
  if (session?.user) {
    return (
      <div className='flex gap-4 ml-auto'>
        <p className='text-sm tracking-tight text-sky-400'>{session.user.name}</p>
        <button
          className='text-white'
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
    );
  }
  return (
    <button
      className='text-white'
      onClick={() => signIn()}
    >
      Sign in
    </button>
  );
};

export default SignoutButton;

// NOTE: you have used multiple providers for authN and you would like to customize the Sign In page, then in the signOut() and signIn() functions you would need to also provide the ID of the providers. But here we will use the Sign In page provided automatically by Next Auth. So, we do not need to pass anything to these functions.
