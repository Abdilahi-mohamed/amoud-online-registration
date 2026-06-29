import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { searchStudentById } from '../api';

export default function SearchScreen() {
    const [studentId, setStudentId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!studentId) {
            Alert.alert('Error', 'Please enter student ID');
            return;
        }

        setLoading(true);
        try {
            const res = await searchStudentById(studentId);
            setResult(res.data);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Student not found');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Search Student</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Student ID"
                value={studentId}
                onChangeText={setStudentId}
            />
            <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Searching...' : 'Search'}</Text>
            </TouchableOpacity>

            {result && (
                <View style={styles.result}>
                    <Text style={styles.sectionTitle}>Student Info</Text>
                    <Text>Username: {result.user.username}</Text>
                    <Text>Email: {result.user.email}</Text>

                    <Text style={styles.sectionTitle}>Registrations</Text>
                    {result.registrations.map((r) => (
                        <View key={r._id} style={styles.item}>
                            <Text>Type: {r.type}</Text>
                            <Text>Semester: {r.semester}</Text>
                            <Text>Department: {r.department}</Text>
                            <Text>Class: {r.class?.name}</Text>
                        </View>
                    ))}

                    <Text style={styles.sectionTitle}>Payments</Text>
                    {result.payments.map((p) => (
                        <View key={p._id} style={styles.item}>
                            <Text>Amount: {p.amount}</Text>
                            <Text>Payment Number: {p.paymentNumber}</Text>
                            <Text>Date: {new Date(p.date).toLocaleString()}</Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
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
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    result: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    item: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 3,
        marginBottom: 5,
    },
});