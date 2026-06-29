import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { getAllRegistrations } from '../api';

export default function RegistrationsScreen() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRegistrations = async () => {
        setLoading(true);
        try {
            const res = await getAllRegistrations();
            setRegistrations(res.data);
        } catch (error) {
            Alert.alert('Error', 'Could not load registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRegistrations();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>All Registrations</Text>
            {registrations.map((r) => (
                <View key={r._id} style={styles.item}>
                    <Text>User: {r.user?.username}</Text>
                    <Text>Type: {r.type}</Text>
                    <Text>Semester: {r.semester}</Text>
                    <Text>Department: {r.department}</Text>
                    <Text>Class: {r.class?.name}</Text>
                    <Text>Date: {new Date(r.createdAt).toLocaleString()}</Text>
                </View>
            ))}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    item: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
});