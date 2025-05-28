import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    setMensaje('');
    if (!correo || !contrasena) {
      setMensaje('Por favor ingresa tu correo y contraseña');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, correo, contrasena);
      // Aquí puedes navegar a la pantalla principal si lo deseas
    } catch (error) {
      setMensaje('Correo o contraseña incorrectos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Ingresar" onPress={handleLogin} />
      {mensaje !== '' && (
        <Text style={styles.error}>{mensaje}</Text>
      )}
      <View style={{ marginTop: 10 }}>
        <Button
          title="¿No tienes cuenta? Regístrate"
          onPress={() => navigation.navigate('Registro')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  error: {
    color: '#cc0000',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
});