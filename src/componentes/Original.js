import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const VALORES_REFERENCIA = [10, 15, 25, 50, 75, 100, 150, 200];
const MAX_ATTEMPTS = 5;

export default function JuegoProductoPrecio() {
  const [producto, setProducto] = useState(null);
  const [valorReferencia, setValorReferencia] = useState(50);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userWin, setUserWin] = useState(0);
  const [userLose, setUserLose] = useState(0);
  const [uid, setUid] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [correctGuesses, setCorrectGuesses] = useState(0);

  // Escuchar el login del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return unsubscribe;
  }, []);

  // Obtener datos del usuario
  useEffect(() => {
    if (!uid) return;
    const traerDatos = async () => {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserWin(data.ganados || 0);
        setUserLose(data.perdidos || 0);
      } else {
        await setDoc(docRef, { ganados: 0, perdidos: 0 });
        setUserWin(0);
        setUserLose(0);
      }
      setLoading(false);
    };
    traerDatos();
  }, [uid]);

  const guardarResultado = async (acierto) => {
    if (!uid) return;
    const fecha = new Date().toISOString();
    const resultado = {
      uid,
      producto: producto.title,
      aciertos: acierto ? 1 : 0,
      errores: acierto ? 0 : 1,
      fecha,
    };
    try {
      await setDoc(doc(db, 'resultados', `${uid}_${fecha}`), resultado);
      const docRef = doc(db, 'usuarios', uid);
      await updateDoc(docRef, {
        ganados: acierto ? userWin + 1 : userWin,
        perdidos: !acierto ? userLose + 1 : userLose,
      });
    } catch (e) {
      console.error('Error al guardar resultado:', e);
    }
  };

  // Obtener producto aleatorio y valor de referencia aleatorio
  const getRandomProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.escuelajs.co/api/v1/products');
      const data = await response.json();
      const random = data[Math.floor(Math.random() * data.length)];
      setProducto(random);
      // Selecciona un valor de referencia aleatorio
      const nuevoValor = VALORES_REFERENCIA[Math.floor(Math.random() * VALORES_REFERENCIA.length)];
      setValorReferencia(nuevoValor);
    } catch (err) {
      console.error('Error al obtener producto:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    getRandomProduct();
  }, []);

  const handleGuess = async (opcion) => {
    if (gameOver || gameWon) return;
    const esMayor = producto.price > valorReferencia;
    const acierto = (opcion === 'mayor' && esMayor) || (opcion === 'menor' && !esMayor);
    if (acierto) {
      const newCorrectGuesses = correctGuesses + 1;
      setCorrectGuesses(newCorrectGuesses);
      setMensaje({ texto: `¡Correcto! Aciertos: ${newCorrectGuesses}/5`, color: 'green' });
      if (newCorrectGuesses >= 5) {
        setGameWon(true);
        setUserWin(userWin + 1);
        await guardarResultado(true);
      } else {
        setTimeout(() => {
          setMensaje('');
          getRandomProduct();
        }, 3200); // 1.2s + 2s extra
      }
    } else {
      setMensaje({ texto: '¡Incorrecto! Pasando al siguiente producto...', color: 'red' });
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      setCorrectGuesses(0); // Reinicia aciertos si falla
      if (newWrongGuesses >= MAX_ATTEMPTS) {
        setTimeout(async () => {
          setMensaje('');
          setGameOver(true);
          setUserLose(userLose + 1);
          await guardarResultado(false);
        }, 3200); // 1.2s + 2s extra
      } else {
        setTimeout(() => {
          setMensaje('');
          getRandomProduct();
        }, 3200); // 1.2s + 2s extra
      }
    }
  };

  const restartGame = () => {
    setWrongGuesses(0);
    setCorrectGuesses(0);
    setGameOver(false);
    setGameWon(false);
    getRandomProduct();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>¿El precio es mayor o menor a ${valorReferencia}?</Text>
      <Text style={styles.stats}>Ganados: {userWin} | Perdidos: {userLose}</Text>
      {mensaje !== '' && (
        <Text style={{ color: mensaje.color, fontSize: 18, marginBottom: 10 }}>{mensaje.texto}</Text>
      )}
      {loading || !producto ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text>{producto.id}</Text>
          <Image source={{ uri: producto.images && producto.images.length > 0 ? producto.images[0] : undefined }} style={styles.image} />
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>{producto.title}</Text>
          <View style={styles.keyboard}>
            <TouchableOpacity
              onPress={() => handleGuess('mayor')}
              disabled={gameOver || gameWon}
              style={[styles.key, (gameOver || gameWon) && styles.keyDisabled]}
            >
              <Text>Mayor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleGuess('menor')}
              disabled={gameOver || gameWon}
              style={[styles.key, (gameOver || gameWon) && styles.keyDisabled]}
            >
              <Text>Menor</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.attempts}>
            Fallos: {wrongGuesses} / {MAX_ATTEMPTS}
          </Text>
          <Text style={styles.stats}>Aciertos: {correctGuesses} / 5</Text>
          {gameOver && (
            <Text style={styles.lost}>
              💀 ¡Perdiste! El precio era: ${producto.price}
            </Text>
          )}
          {gameWon && (
            <Text style={styles.won}>
              🎉 ¡Ganaste! El precio era: ${producto.price}
            </Text>
          )}
          {(gameOver || gameWon) && (
            <TouchableOpacity style={styles.button} onPress={restartGame}>
              <Text style={styles.buttonText}>Jugar otra vez</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 10 },
  image: { width: 150, height: 150, marginVertical: 10 },
  stats: { marginBottom: 10, fontSize: 16 },
  wordContainer: { flexDirection: 'row', marginBottom: 20, flexWrap: 'wrap' },
  letter: { fontSize: 28, marginHorizontal: 4 },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  key: {
    backgroundColor: '#eee',
    padding: 10,
    margin: 4,
    borderRadius: 4,
    width: 80,
    alignItems: 'center',
  },
  keyDisabled: {
    backgroundColor: '#ccc',
  },
  attempts: { fontSize: 16, marginBottom: 10 },
  lost: { color: 'red', fontSize: 18 },
  won: { color: 'green', fontSize: 18 },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0066cc',
    borderRadius: 5,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});