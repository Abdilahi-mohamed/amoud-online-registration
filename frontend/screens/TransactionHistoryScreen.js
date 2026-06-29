import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getPayments } from '../api';

export default function TransactionHistoryScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await getPayments();
            const sortedHistory = (response.data || []).slice().sort((a, b) => {
                const aDate = new Date(a.createdAt || a.date);
                const bDate = new Date(b.createdAt || b.date);
                return aDate - bDate;
            });
            setTransactions(sortedHistory);
        } catch (error) {
            console.error('Failed to load history:', error);
            Alert.alert('Error', 'Unable to fetch your payment history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleViewReceipt = (tx) => {
        if (tx.status !== 'paid') {
            Alert.alert('Details', `This payment is ${tx.status.toUpperCase()}. Receipts are only available for fully processed payments.`);
            return;
        }
        navigation.navigate('Receipt', {
            studentId: tx.studentId,
            studentName: tx.studentName,
            paymentNumber: tx.transaction_id || tx.paymentNumber,
            receiptId: `RCT-${tx._id.slice(-6)}`,
            amountPaid: tx.amount,
            paymentMethod: tx.payment_method || 'EVC PLUS',
            phone: tx.phone,
            date: new Date(tx.createdAt || tx.date).toLocaleString()
        });
    };

    const handleRetry = (tx) => {
        navigation.navigate('FeePayment', {
            studentId: tx.studentId,
            studentName: tx.studentName,
            phone: tx.phone || '',
            amount: tx.amount.toString(),
            semester: tx.pendingRegistrationData?.semester || 1,
            faculty: tx.pendingRegistrationData?.faculty || 'ICT Faculty',
            department: tx.pendingRegistrationData?.department || 'Software Engineering',
            year: tx.pendingRegistrationData?.year || 'Sophomore',
            className: tx.pendingRegistrationData?.className || 'Class A',
            type: tx.pendingRegistrationData?.type || 'semester'
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="text-gray-500 mt-3 font-semibold">Loading payment history...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50 p-6" showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center justify-between mb-6 pt-6">
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                    <Text className="text-indigo-600 font-bold text-base">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-black text-gray-800">Payment History</Text>
                <TouchableOpacity onPress={fetchHistory}>
                    <Text className="text-indigo-600 font-bold text-base">Refresh</Text>
                </TouchableOpacity>
            </View>

            {transactions.length === 0 ? (
                <View className="flex-1 justify-center items-center py-24 bg-white rounded-3xl border border-gray-150 p-6">
                    <Text className="text-gray-400 font-bold text-lg mb-2">No transactions recorded</Text>
                    <Text className="text-gray-400 text-sm text-center mb-6">You have not initiated any Sifalo Pay registrations yet.</Text>
                    <TouchableOpacity
                        className="bg-indigo-600 px-6 py-3 rounded-xl"
                        onPress={() => navigation.navigate('SemesterRegistration')}
                    >
                        <Text className="text-white font-bold">Register Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="space-y-4 pb-12">
                    {transactions.map((tx) => {
                        const isPaid = tx.status === 'paid';
                        const isFailed = tx.status === 'failed';
                        const badgeColor = isPaid ? 'bg-green-100 text-green-700' : isFailed ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';

                        return (
                            <TouchableOpacity
                                key={tx._id}
                                onPress={() => handleViewReceipt(tx)}
                                className="bg-white p-5 rounded-2xl border border-gray-150 flex-row justify-between items-center shadow-sm"
                            >
                                <View className="flex-1 pr-3">
                                    <View className="flex-row items-center mb-1.5 flex-wrap gap-2">
                                        <Text className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                                            {tx.status}
                                        </Text>
                                        <Text className="text-xs text-gray-400 font-mono font-bold">
                                            {tx.transaction_id || tx.paymentNumber}
                                        </Text>
                                    </View>
                                    <Text className="font-extrabold text-gray-800 text-base mb-0.5">{tx.studentName}</Text>
                                    <Text className="text-xs text-gray-400 font-medium">
                                        {new Date(tx.createdAt || tx.date).toLocaleDateString()} at {new Date(tx.createdAt || tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>

                                <View className="items-end">
                                    <Text className="text-lg font-black text-gray-800 mb-1.5">${tx.amount}</Text>
                                    {isPaid ? (
                                        <Text className="text-xs text-indigo-600 font-bold">Receipt →</Text>
                                    ) : (
                                        <TouchableOpacity
                                            className="bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100"
                                            onPress={() => handleRetry(tx)}
                                        >
                                            <Text className="text-indigo-600 font-bold text-xs">Retry</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
}
