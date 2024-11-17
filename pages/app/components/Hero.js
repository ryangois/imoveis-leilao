import React from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Hero.module.css';
import Image from 'next/image';

export default function Hero() {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/form');
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>Assessoria Davi Franco</h1>
        <nav className={styles.nav}>
          <a href="#home">Início</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <section id="home" className={styles.hero}>
        <div className={styles.heroText}>
          <h1>Descubra as melhores residências</h1>
          <p>Encontre residências que combinam com você com muita facilidade.</p>
          <button className={styles.exploreButton} onClick={handleButtonClick}>Explorar Residências</button>
        </div>
        <div className={styles.heroImage}>
          <Image src="/6812cbb759774b33ae991835b9634289.jpg" alt="Residências" width={600} height={400} layout="responsive" priority />
        </div>
      </section>

      <section id="sobre" className={styles.sobre}>
        <h2>Sobre</h2>
        <p>Encontre informações detalhadas sobre as residências e como escolher a melhor opção para você.</p>
        <button>Saiba Mais</button>
      </section>

      <section id="contato" className={styles.contato}>
        <h2>Contato</h2>
        <p>Entre em contato conosco para mais informações ou agende uma visita.</p>
        <button>Fale Conosco</button>
      </section>
    </div>
  );
}
