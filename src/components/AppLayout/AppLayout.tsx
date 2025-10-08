import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './AppLayout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
