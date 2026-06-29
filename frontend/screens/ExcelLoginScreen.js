import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secondaryLogin } from '../api';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExcelLoginScreen({ navigation }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const validateSession = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                navigation.replace('Login');
            }
        };

        validateSession();
    }, []);

    const handleSecondaryLogin = async () => {
        if (!id || !password) {
            Alert.alert('Error', 'Please fill in both ID and Password');
            return;
        }

        setIsLoading(true);
        try {
            const trimmedId = id.trim();
            const trimmedPassword = password.trim();
            const response = await secondaryLogin(trimmedId, trimmedPassword);
            if (response.data.success) {
                await AsyncStorage.setItem('secondAuthPassed', 'true');
                navigation.replace('Dashboard');
            }
        } catch (error) {
            Alert.alert(
                'Access Denied', 
                error.response?.data?.message || 'Invalid ID or Password. Please check your credentials.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 bg-gray-50 justify-center">
                    {/* Decorative Header Background */}
                    <LinearGradient 
                        colors={['#2563eb', '#1d4ed8']}
                        className="absolute top-0 w-full h-1/3 rounded-b-[50px] overflow-hidden"
                    >
                         <View className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-50" />
                         <View className="absolute top-20 -left-10 w-32 h-32 bg-blue-700 rounded-full opacity-50" />
                    </LinearGradient>

                    <View className="px-8 mt-20">
                        <View className="bg-white p-8 rounded-[30px] shadow-2xl">
                            <Text className="text-3xl font-extrabold text-gray-900 mb-2">Secondary Login</Text>
                            <Text className="text-gray-500 mb-8">This is the admin-uploaded login. Use it only after you have signed in with your main account.</Text>
                            
                            <View className="mb-6">
                                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Student ID</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-900 font-medium"
                                    placeholder="Enter your Student ID"
                                    placeholderTextColor="#9ca3af"
                                    value={id}
                                    onChangeText={setId}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View className="mb-10">
                                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Password</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-900 font-medium"
                                    placeholder="Enter Password"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity 
                                className={`p-4 rounded-2xl items-center shadow-lg ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                                onPress={handleSecondaryLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold text-lg">
                                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                className="mt-6 items-center"
                                onPress={() => navigation.replace('Login')}
                            >
                                <Text className="text-gray-500 font-medium underline">Back to Main Login</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View className="mt-12 items-center">
                            <Text className="text-gray-400 text-xs">Secure Verification System v2.0</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
