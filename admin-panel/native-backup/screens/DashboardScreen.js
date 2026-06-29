import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAdminDashboard, getAllPayments, getAllRegistrations } from '../api';

export default function DashboardScreen({ navigation }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [payments, setPayments] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dashboardRes, paymentsRes, regsRes] = await Promise.all([
                getAdminDashboard(),
                getAllPayments(),
                getAllRegistrations()
            ]);
            setDashboardData(dashboardRes.data);
            setPayments(paymentsRes.data);
            setRegistrations(regsRes.data);
        } catch (error) {
            Alert.alert('Error', 'Could not load data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        navigation.replace('Login');
    };

    useEffect(() => {
        loadData();
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
            <View style={styles.header}>
                <Text style={styles.title}>Admin Dashboard</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {dashboardData && (
                <View style={styles.stats}>
                    <Text style={styles.stat}>Total Users: {dashboardData.stats.totalUsers}</Text>
                    <Text style={styles.stat}>Total Registrations: {dashboardData.stats.totalRegistrations}</Text>
                    <Text style={styles.stat}>Total Payments: {dashboardData.stats.totalPayments}</Text>
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Payments')}>
                <Text style={styles.buttonText}>View All Payments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Registrations')}>
                <Text style={styles.buttonText}>View All Registrations</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Search')}>
                <Text style={styles.buttonText}>Search Student</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745' }]} onPress={() => navigation.navigate('BulkRegister')}>
                <Text style={styles.buttonText}>Bulk Upload Students</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Recent Payments</Text>
            {payments.slice(0, 5).map((p) => (
                <View key={p._id} style={styles.item}>
                    <Text>Student: {p.studentId} - {p.studentName}</Text>
                    <Text>Amount: {p.amount}</Text>
                    <Text>Date: {new Date(p.date).toLocaleDateString()}</Text>
                </View>
            ))}

            <Text style={styles.sectionTitle}>Recent Registrations</Text>
            {registrations.slice(0, 5).map((r) => (
                <View key={r._id} style={styles.item}>
                    <Text>User: {r.user?.username}</Text>
                    <Text>Semester: {r.semester}</Text>
                    <Text>Department: {r.department}</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
    },
    stats: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
    },
    stat: {
        fontSize: 16,
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    item: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
});