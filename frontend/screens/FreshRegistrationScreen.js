import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClasses, freshRegister } from '../api';

export default function FreshRegistrationScreen({ navigation }) {
    const [semester, setSemester] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchClasses = async (selectedSemester) => {
        setSemester(selectedSemester);
        setLoading(true);
        try {
            const response = await getClasses(selectedSemester);
            setClasses(response.data);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Could not fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (classId) => {
        try {
            await freshRegister(classId, semester);
            Alert.alert('Success', 'You have been registered successfully!', [
                { text: 'OK', onPress: () => navigation.replace('Dashboard') }
            ]);
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
            // Refresh classes
            fetchClasses(semester);
        }
    };

    if (!semester) {
        return (
            <View className="flex-1 bg-gray-50 px-6 py-12 justify-center pb-32">
                <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">Select Semester</Text>
                <TouchableOpacity 
                    className="bg-blue-600 p-6 rounded-2xl mb-4"
                    onPress={() => fetchClasses(1)}
                >
                    <Text className="text-white text-xl font-bold text-center">Semester 1</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className="bg-purple-600 p-6 rounded-2xl"
                    onPress={() => fetchClasses(2)}
                >
                    <Text className="text-white text-xl font-bold text-center">Semester 2</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-6 pt-12 pb-6 bg-white shadow-sm flex-row items-center">
                <TouchableOpacity onPress={() => setSemester(null)} className="mr-4">
                    <Text className="text-blue-600 text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800">Classes (Sem {semester})</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                    {classes.map((cls) => {
                        let bgColor = 'bg-gray-200';
                        let textColor = 'text-gray-500';
                        let btnText = 'Not Open';
                        let active = false;

                        if (cls.status === 'full') {
                            bgColor = 'bg-red-100';
                            textColor = 'text-red-700';
                            btnText = 'Full';
                        } else if (cls.status === 'open') {
                            bgColor = 'bg-green-100 border-2 border-green-500';
                            textColor = 'text-green-800';
                            btnText = 'Register Now';
                            active = true;
                        }

                        return (
                            <View key={cls.id} className={`p-5 rounded-2xl mb-4 ${bgColor} flex-row justify-between items-center`}>
                                <View>
                                    <Text className={`text-xl font-bold ${textColor}`}>{cls.name}</Text>
                                    <Text className={`mt-1 ${textColor}`}>Enrolled: {cls.enrolledCount} / {cls.capacity}</Text>
                                </View>
                                {active && (
                                    <TouchableOpacity 
                                        className="bg-green-600 px-4 py-2 rounded-xl"
                                        onPress={() => {
                                            Alert.alert('Confirm', `Register for ${cls.name}?`, [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Yes', onPress: () => handleRegister(cls.id) }
                                            ]);
                                        }}
                                    >
                                        <Text className="text-white font-bold">Select</Text>
                                    </TouchableOpacity>
                                )}
                                {!active && (
                                    <View className="px-4 py-2 rounded-xl bg-black/5">
                                        <Text className={`${textColor} font-bold`}>{btnText}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}
