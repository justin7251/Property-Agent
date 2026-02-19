import Head from 'next/head';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const router = useRouter();
  const isAppShellFreeRoute = ['/', '/login', '/dashboard'].includes(router.pathname);

  return (
    <>
      <Head>
        <title>Real Estate</title>
      </Head>
      {isAppShellFreeRoute ? (
        <main>{children}</main>
      ) : (
        <Box maxWidth='1280px' m='auto'>
          <header>
            <Navbar />
          </header>
          <main>{children}</main>
          <footer>
            <Footer />
          </footer>
        </Box>
      )}
    </>
  );
}
