import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../api';

export default function LoginScreen({ navigation }) {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) return Alert.alert('Error', 'Please enter username and password');

        setLoading(true);
        try {
            const res = await loginUser(username, password);
            const { token, role, _id } = res.data;

            if (!token) {
                Alert.alert('Login Failed', res.data?.message || 'No token returned from server');
                return;
            }

            if (role !== 'admin') {
                Alert.alert('Error', 'Admin access required');
                return;
            }

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify({ username, role, _id }));

            navigation.replace('Dashboard');
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!username || !password || !confirmPassword) {
            return Alert.alert('Error', 'Please fill all fields');
        }
        if (password !== confirmPassword) {
            return Alert.alert('Error', 'Passwords do not match');
        }

        setLoading(true);
        try {
            const res = await registerUser(username, password, 'admin');
            Alert.alert('Success', res.data?.message || 'Admin account created. Logging in...');
            await handleLogin();
        } catch (error) {
            Alert.alert('Sign Up Failed', error.response?.data?.message || error.message || 'Something went wrong');
            setLoading(false);
        }
    };

    const submit = mode === 'login' ? handleLogin : handleSignUp;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{mode === 'login' ? 'Admin Login' : 'Admin Sign Up'}</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {mode === 'signup' && (
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            )}

            <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign Up')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                <Text style={styles.switchText}>
                    {mode === 'login' ? 'Create an admin account' : 'Already registered? Login'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});