import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { submitFeedback } from '../api';

export default function FeedbackScreen({ navigation }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        if (!subject || !message) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await submitFeedback(subject, message);
            Alert.alert('Success', 'Feedback submitted successfully');
            setSubject('');
            setMessage('');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <View className="flex-1 justify-center px-8 bg-gray-50">
            <View className="bg-white p-6 rounded-2xl shadow-sm">
                <Text className="text-2xl font-bold text-gray-800 mb-6">Submit Feedback</Text>

                <TextInput
                    className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-800"
                    placeholder="Subject"
                    value={subject}
                    onChangeText={setSubject}
                />

                <TextInput
                    className="bg-gray-100 p-4 rounded-xl mb-6 text-gray-800"
                    placeholder="Message"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity 
                    className="bg-blue-600 p-4 rounded-xl items-center"
                    onPress={handleSubmit}
                >
                    <Text className="text-white font-bold text-lg">Submit Feedback</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}