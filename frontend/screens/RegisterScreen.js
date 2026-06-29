import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../api';

export default function RegisterScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const trimmedUsername = username.trim();
            const response = await registerUser(trimmedUsername, password);
            const data = response.data;

            Alert.alert('Registration Successful', data.message || 'Account created successfully.', [
                { text: 'OK', onPress: () => navigation.replace('Login') }
            ]);
        } catch (error) {
            const message = error.response?.data?.message || 'Unable to reach the backend. Please check your connection.';
            Alert.alert('Registration Failed', message);
        }
    };

    return (
        <View className="flex-1 justify-center px-8 bg-gray-50">
            <View className="bg-white p-6 rounded-2xl shadow-sm">
                <Text className="text-2xl font-bold text-gray-800 mb-6">Create Account</Text>

                <TextInput
                    className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-800"
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <TextInput
                    className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-800"
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TextInput
                    className="bg-gray-100 p-4 rounded-xl mb-6 text-gray-800"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-xl items-center"
                    onPress={handleRegister}
                >
                    <Text className="text-white font-bold text-lg">Sign Up</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-600">Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text className="text-blue-600 font-bold">Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
