import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { initializeSifaloPayment, verifySifaloPayment } from '../api';

const PAYMENT_METHODS = [
    { id: 'EVC PLUS', name: 'EVC Plus', desc: 'Hormuud Mobile Money', color: '#10b981', icon: '📱' },
    { id: 'ZAAD', name: 'ZAAD Service', desc: 'Telesom Mobile Money', color: '#3b82f6', icon: '📞' },
    { id: 'eDahab', name: 'eDahab', desc: 'Somtel Mobile Money', color: '#f59e0b', icon: '⚡' },
    { id: 'SAHAL', name: 'Sahal Service', desc: 'Golis Mobile Money', color: '#8b5cf6', icon: '🌟' },
    { id: 'Visa/Mastercard', name: 'Visa / Mastercard', desc: 'Credit or Debit Card', color: '#ec4899', icon: '💳' }
];

export default function FeePaymentScreen({ route, navigation }) {
    // Route params passed from SemesterRegistration or manual fee payments
    const params = route.params || {};

    const [studentId, setStudentId] = useState(params.studentId || '');
    const [studentName, setStudentName] = useState(params.studentName || '');
    const [phone, setPhone] = useState(params.phone || '');
    const [amount, setAmount] = useState('50'); // default $50 registration fee
    const [selectedMethod, setSelectedMethod] = useState('EVC PLUS');
    
    // Payment Process States
    const [initializing, setInitializing] = useState(false);
    const [polling, setPolling] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);

    // Poll status for browser redirect checkouts
    useEffect(() => {
        let intervalId;
        if (polling && transactionId) {
            // Poll payment status every 4 seconds for external browser checkouts
            intervalId = setInterval(async () => {
                await checkStatus(false);
            }, 4000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [polling, transactionId]);

    const handleInitializePayment = async () => {
        if (!studentId.trim() || !studentName.trim() || !phone.trim() || !amount.trim()) {
            Alert.alert('Validation Error', 'Please complete all required fields (ID, Name, Phone, and Amount).');
            return;
        }

        setInitializing(true);
        try {
            const payload = {
                amount: parseFloat(amount),
                phone: phone.trim(),
                payment_method: selectedMethod,
                studentId: studentId.trim(),
                studentName: studentName.trim(),
                // Pending registration details
                type: params.type || 'semester',
                semester: params.semester || 1,
                faculty: params.faculty || 'ICT Faculty',
                department: params.department || 'Software Engineering',
                year: params.year || 'Sophomore',
                className: params.className || 'Class A'
            };

            const response = await initializeSifaloPayment(payload);
            const { payment_url, transaction_id, isDirectPrompt, paymentStatus } = response.data;

            if (isDirectPrompt) {
                if (paymentStatus === 'paid') {
                    // Paid immediately (code 601)! No alerts, go straight to receipt!
                    navigation.replace('Receipt', {
                        studentId,
                        studentName,
                        paymentNumber: transaction_id || `TXN-${Date.now()}`,
                        receiptId: `RCT-${Date.now().toString().slice(-6)}`,
                        amountPaid: amount,
                        paymentMethod: selectedMethod,
                        phone: phone,
                        date: new Date().toLocaleString()
                    });
                } else {
                    // Pending PIN entry (code 603)
                    Alert.alert(
                        'Direct USSD Initiated', 
                        `Sifalo Pay has requested your phone to enter your PIN to authorize the payment of $${amount} USD. Once you authorize it on your device, your registration is fully processed!`,
                        [
                            { 
                                text: 'Proceed to Receipt', 
                                onPress: () => {
                                    navigation.replace('Receipt', {
                                        studentId,
                                        studentName,
                                        paymentNumber: transaction_id || `TXN-${Date.now()}`,
                                        receiptId: `RCT-${Date.now().toString().slice(-6)}`,
                                        amountPaid: amount,
                                        paymentMethod: selectedMethod,
                                        phone: phone,
                                        date: new Date().toLocaleString()
                                    });
                                } 
                            }
                        ]
                    );
                }
            } else {
                // Standard Visa/Mastercard browser redirect
                setTransactionId(transaction_id);
                setPaymentUrl(payment_url);
                setPaymentStatus('pending');
                setPolling(true);

                if (payment_url) {
                    Linking.openURL(payment_url).catch((err) => {
                        console.error('Failed to open payment gateway link:', err);
                        Alert.alert('Notice', 'Please open this link in your browser to check out: ' + payment_url);
                    });
                }
            }

        } catch (error) {
            // Display the exact Sifalo error message returned from the backend controller
            const errorMessage = error.response?.data?.message || 'Could not launch payment gateway checkout.';
            Alert.alert('Payment Failed', errorMessage);
        } finally {
            setInitializing(false);
        }
    };

    const checkStatus = async (showAlert = true) => {
        if (!transactionId) return;
        try {
            const response = await verifySifaloPayment(transactionId);
            const status = response.data.status;
            setPaymentStatus(status);

            if (status === 'paid') {
                setPolling(false);
                if (showAlert) {
                    Alert.alert('Payment Verified', 'Thank you! Your registration has been fully processed.', [
                        { text: 'View Receipt', onPress: () => navigateToReceipt() }
                    ]);
                } else {
                    navigateToReceipt();
                }
            } else if (status === 'failed') {
                setPolling(false);
                if (showAlert) {
                    Alert.alert('Payment Failed', 'The payment gateway reported a failed transaction. Please try again.');
                }
            } else {
                if (showAlert) {
                    Alert.alert('Status Pending', 'Waiting for verification signature. Please complete checkout in your browser.');
                }
            }
        } catch (err) {
            console.warn('Status verify failed:', err.message);
        }
    };

    const navigateToReceipt = () => {
        navigation.replace('Receipt', {
            studentId,
            studentName,
            paymentNumber: transactionId || `TXN-${Date.now()}`,
            receiptId: `RCT-${Date.now().toString().slice(-6)}`,
            amountPaid: amount,
            paymentMethod: selectedMethod,
            phone: phone,
            date: new Date().toLocaleString()
        });
    };

    const handleRetry = () => {
        setTransactionId(null);
        setPaymentUrl(null);
        setPaymentStatus(null);
        setPolling(false);
    };

    // If polling / checking payment checkout progress for hosted checkouts (Visa/Mastercard)
    if (polling) {
        return (
            <View className="flex-1 bg-white justify-center items-center px-6">
                <View className="p-8 bg-indigo-50 rounded-full mb-6 border border-indigo-100 shadow-inner">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
                
                <Text className="text-2xl font-extrabold text-gray-800 text-center mb-2">Processing Checkout</Text>
                <Text className="text-gray-500 text-center mb-6 px-4">
                    Please complete the payment in the browser window. We are verifying the transaction in real time automatically...
                </Text>

                {paymentUrl && (
                    <TouchableOpacity
                        className="bg-indigo-600 px-6 py-3.5 rounded-xl shadow-md mb-3"
                        onPress={() => Linking.openURL(paymentUrl)}
                    >
                        <Text className="text-white font-bold">Re-open Checkout Link</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    className="bg-emerald-600 px-6 py-3.5 rounded-xl shadow-md mb-3 w-48 items-center"
                    onPress={() => checkStatus(true)}
                >
                    <Text className="text-white font-bold">Verify Payment Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="border border-gray-300 px-6 py-3 rounded-xl w-48 items-center mt-4"
                    onPress={handleRetry}
                >
                    <Text className="text-gray-600 font-semibold">Cancel & Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 relative">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 170 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 py-10">
                    <View className="mb-8">
                        <Text className="text-3xl font-extrabold text-gray-900 text-center">Registration Fee</Text>
                        <Text className="text-gray-500 text-sm text-center mt-2">Integrated payment powered securely by Sifalo Pay</Text>
                    </View>

                    <View className="space-y-6">
                        {params.type === 'semester' && (
                            <View className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                                <Text className="text-xs font-bold uppercase text-indigo-700 tracking-wider mb-2">Academic Registration Details</Text>
                                <Text className="text-gray-800 font-semibold mb-1">Student Name: <Text className="text-gray-600">{studentName}</Text></Text>
                                <Text className="text-gray-800 font-semibold mb-1">ID Code: <Text className="text-gray-600">{studentId}</Text></Text>
                                <Text className="text-gray-800 font-semibold">Program: <Text className="text-gray-600">{params.faculty} | {params.department} ({params.year})</Text></Text>
                            </View>
                        )}

                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Payment Details</Text>

                            <View className="space-y-4">
                                <View>
                                    <Text className="text-gray-600 font-semibold mb-2 text-xs uppercase tracking-wide">Student ID</Text>
                                    <TextInput
                                        className="bg-gray-100 p-4 rounded-2xl text-gray-800 border border-gray-200"
                                        placeholder="Enter Student ID"
                                        value={studentId}
                                        onChangeText={setStudentId}
                                        editable={!params.studentId}
                                    />
                                </View>

                                <View>
                                    <Text className="text-gray-600 font-semibold mb-2 text-xs uppercase tracking-wide">Student Full Name</Text>
                                    <TextInput
                                        className="bg-gray-100 p-4 rounded-2xl text-gray-800 border border-gray-200"
                                        placeholder="Enter Student Name"
                                        value={studentName}
                                        onChangeText={setStudentName}
                                        editable={!params.studentName}
                                    />
                                </View>

                                <View>
                                    <Text className="text-gray-600 font-semibold mb-2 text-xs uppercase tracking-wide">Payment Phone Number</Text>
                                    <TextInput
                                        className="bg-gray-100 p-4 rounded-2xl text-gray-800 border border-gray-200"
                                        placeholder="25263xxxxxxx"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View>
                                    <Text className="text-gray-600 font-semibold mb-2 text-xs uppercase tracking-wide">Fee Amount (USD)</Text>
                                    <TextInput
                                        className="bg-gray-100 p-4 rounded-2xl text-gray-800 font-bold border border-gray-200"
                                        placeholder="Amount in USD"
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>

                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Choose Payment Method</Text>

                            <View className="space-y-3">
                                {PAYMENT_METHODS.map((method) => {
                                    const isSelected = selectedMethod === method.id;
                                    return (
                                        <TouchableOpacity
                                            key={method.id}
                                            onPress={() => setSelectedMethod(method.id)}
                                            className={`flex-row items-center p-4 rounded-2xl border transition-all ${isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/40'
                                                    : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <View className="mr-4 p-2 rounded-xl bg-gray-50 border border-gray-100">
                                                <Text className="text-2xl">{method.icon}</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-bold text-gray-800">{method.name}</Text>
                                                <Text className="text-xs text-gray-400 font-medium">{method.desc}</Text>
                                            </View>
                                            <View className={`w-5 h-5 rounded-full border items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'
                                                }`}>
                                                {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <TouchableOpacity
                            className="bg-indigo-600 p-5 rounded-2xl shadow-lg shadow-indigo-600/35"
                            onPress={handleInitializePayment}
                            disabled={initializing}
                        >
                            {initializing ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text className="text-white text-xl font-bold text-center">Checkout & Pay Now</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <View className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 px-6 py-4 shadow-xl">
                <TouchableOpacity
                    className="w-full bg-indigo-600 px-4 py-3 rounded-full items-center"
                    onPress={() => navigation.navigate('PaymentHistory')}
                >
                    <Text className="text-white text-base font-bold">Payment History</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}