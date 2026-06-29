import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            const trimmedUsername = username.trim();
            const response = await loginUser(trimmedUsername, password);
            const data = response.data;
            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('username', data.username);
                await AsyncStorage.removeItem('secondAuthPassed');
                navigation.replace('ExcelLogin');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Unable to reach the backend. Please check your connection.';
            Alert.alert('Login Failed', message);
        }
    };

    return (
        <View className="flex-1 justify-center px-8 bg-gray-50">
            <Text className="text-4xl font-bold text-center text-blue-800 mb-8">UniReg</Text>
            
            <View className="bg-white p-6 rounded-2xl shadow-sm">
                <Text className="text-2xl font-bold text-gray-800 mb-6">Sign In</Text>

                <TextInput
                    className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-800"
                    placeholder="Username or Student ID"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <TextInput
                    className="bg-gray-100 p-4 rounded-xl mb-6 text-gray-800"
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity 
                    className="bg-blue-600 p-4 rounded-xl items-center"
                    onPress={handleLogin}
                >
                    <Text className="text-white font-bold text-lg">Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-4 border border-blue-600 p-4 rounded-xl items-center"
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text className="text-blue-600 font-bold text-lg">Create a New Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
