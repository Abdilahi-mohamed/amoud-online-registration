import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const name = await AsyncStorage.getItem('username');
            if (name) setUsername(name);
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('secondAuthPassed');
        navigation.replace('Login');
    };

    return (
        <View className="flex-1 bg-gray-50 px-6 pt-16">
            <View className="items-center mb-10">
                <Text className="text-3xl font-bold text-gray-800 text-center mb-4">Welcome, {username || 'Muse'}!</Text>
                <TouchableOpacity onPress={handleLogout} className="bg-red-100 px-4 py-2 rounded-lg">
                    <Text className="text-red-600 font-bold">Logout</Text>
                </TouchableOpacity>
            </View>

            <View className="mt-10 space-y-6 items-center">
                <TouchableOpacity 
                    className="bg-green-600 w-full max-w-md p-8 rounded-3xl shadow-md items-center"
                    onPress={() => navigation.navigate('FeePayment')}
                >
                    <Text className="text-white text-2xl font-bold">Fee Payment</Text>
                    <Text className="text-green-100 text-center mt-2">Pay your semester fees securely.</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className="bg-green-600 w-full max-w-md p-8 rounded-3xl shadow-md items-center"
                    onPress={() => navigation.navigate('SemesterRegistration')}
                >
                    <Text className="text-white text-2xl font-bold">Semester Registration</Text>
                    <Text className="text-green-100 text-center mt-2">Register for your next semester classes.</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
