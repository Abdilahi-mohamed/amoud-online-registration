import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { getAllPayments } from '../api';

export default function PaymentsScreen() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await getAllPayments();
            setPayments(res.data);
        } catch (error) {
            Alert.alert('Error', 'Could not load payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
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
            <Text style={styles.title}>All Payments</Text>
            {payments.map((p) => (
                <View key={p._id} style={styles.item}>
                    <Text>Student ID: {p.studentId}</Text>
                    <Text>Name: {p.studentName}</Text>
                    <Text>Payment Number: {p.paymentNumber}</Text>
                    <Text>Amount: {p.amount}</Text>
                    <Text>Date: {new Date(p.date).toLocaleString()}</Text>
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