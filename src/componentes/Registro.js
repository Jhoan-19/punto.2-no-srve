import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // 'error' o 'exito'
  const [cargando, setCargando] = useState(false);
  const navigation = useNavigation();

  const handleRegistro = async () => {
    setMensaje('');
    setTipoMensaje('');
    if (!nombre || !correo || !contrasena) {
      setMensaje('Por favor completa todos los campos obligatorios');
      setTipoMensaje('error');
      return;
    }
    setCargando(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const user = userCredential.user;
      if (user && user.uid) {
        await setDoc(doc(db, 'usuarios', user.uid), {
          uid: user.uid,
          nombre,
          correo,
          fecha,
          telefono,
          ganados: 0,
          perdidos: 0,
        });
        setMensaje('¡Usuario registrado correctamente!');
        setTipoMensaje('exito');
        setTimeout(() => {
          setMensaje('');
          navigation.navigate('Login');
        }, 1800);
      } else {
        setMensaje('No se pudo obtener el UID del usuario');
        setTipoMensaje('error');
      }
    } catch (error) {
      setMensaje(error.message || 'Error al registrarse');
      setTipoMensaje('error');
    }
    setCargando(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro</Text>
      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Correo" value={correo} onChangeText={setCorreo} style={styles.input} />
      <TextInput placeholder="Contraseña" value={contrasena} onChangeText={setContrasena} secureTextEntry style={styles.input} />
      <TextInput placeholder="Fecha de nacimiento" value={fecha} onChangeText={setFecha} style={styles.input} />
      <TextInput placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" style={styles.input} />
      <TouchableOpacity
        style={[
          styles.boton,
          tipoMensaje === 'error' && styles.botonError,
          tipoMensaje === 'exito' && styles.botonExito,
          cargando && styles.botonCargando,
        ]}
        onPress={handleRegistro}
        disabled={cargando}
      >
        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Registrarse</Text>}
      </TouchableOpacity>
      {mensaje !== '' && (
        <Text style={[styles.mensaje, tipoMensaje === 'error' ? styles.error : styles.exito]}>
          {mensaje}
        </Text>
      )}
      <View style={{ marginTop: 10 }}>
        <Button title="¿Ya tienes cuenta? Inicia sesión" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  titulo: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12, borderRadius: 6 },
  boton: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botonError: { backgroundColor: '#cc0000' },
  botonExito: { backgroundColor: '#2ecc40' },
  botonCargando: { opacity: 0.7 },
  mensaje: { textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
  error: { color: '#cc0000' },
  exito: { color: '#2ecc40' },
});