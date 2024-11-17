import React from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Hero.module.css';
import Image from 'next/image';

export default function Hero() {
  const router = useRouter();  // Utilize useRouter aqui, dentro do componente funcional

  const handleButtonClick = () => {
    router.push('/form');  // Navega para a página do formulário
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
      <header className={styles.header}>
        <h1>Assessoria Davi Franco</h1>
        <nav className={styles.nav}>
          <a href="#home">Início</a>
          <a href="#casas">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>
        <h1>Descubra as melhores residências</h1>
        <p>Encontre residências que combinam com você com muita facilidade.</p>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <h1 className={styles.statNumber}>330mil<span>+</span></h1>
            <p className={styles.statText}>Produto Premium</p>
          </div>
          <div className={styles.statItem}>
            <h1 className={styles.statNumber}>150mil<span>+</span></h1>
            <p className={styles.statText}>Para Solteiros</p>
          </div>
          <div className={styles.statItem}>
            <h1 className={styles.statNumber}>300mil<span>+</span></h1>
            <p className={styles.statText}>Ideal para Casais</p>
          </div>
        </div>
        <button className={styles.exploreButton} onClick={handleButtonClick}>Explorar Residências</button>
      </div>
      <div className={styles.heroImage}>
        <Image src="/6812cbb759774b33ae991835b9634289.jpg" alt="Residências" width={600} height={400} layout="responsive" priority />
      </div>
    </section>
  );
}
