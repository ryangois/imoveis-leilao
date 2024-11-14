import React from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Hero.module.css';

export default function Hero() {
  const router = useRouter();  // Utilize useRouter aqui, dentro do componente funcional

  const handleButtonClick = () => {
    router.push('/form');  // Navega para a página do formulário
  };

  return (
    <div className={styles.heroContainer}>
      <header className={styles.header}>
        <h1>Assessoria Davi Franco</h1>
        <nav className={styles.nav}>
          <a href="#home">Home</a>
          <a href="#casas">Casas</a>
          <a href="#valores">Valores</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.textContainer}>
        <div className={styles.imageContainer}>
          <img src="gif.gif" alt="Residências" />
          <h2>Descubra as melhores residências</h2>
        </div>
          
          
          <div className={styles.stats}>
            <div>
              <span>330mil+</span>
              <p>Produto Premium</p>
            </div>
            <div>
              <span>150mil+</span>
              <p>Para Solteiros</p>
            </div>
            <div>
              <span>300mil+</span>
              <p>Ideal para Casais</p>
            </div>
          </div>
          <button className={styles.exploreButton} onClick={handleButtonClick}>
            Explorar Residências
          </button>
        </div>
      </main>
    </div>
  );
}
