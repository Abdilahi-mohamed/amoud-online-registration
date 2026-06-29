import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function ReceiptScreen({ route, navigation }) {
    const { 
        studentId, 
        studentName, 
        paymentNumber, 
        receiptId, 
        amountPaid, 
        paymentMethod, 
        phone, 
        date 
    } = route.params || {};

    if (!studentId || !studentName || !paymentNumber) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 px-6">
                <Text className="text-lg font-semibold text-gray-500">Receipt data is missing.</Text>
                <TouchableOpacity
                    className="mt-4 bg-indigo-600 px-6 py-2.5 rounded-xl"
                    onPress={() => navigation.replace('Dashboard')}
                >
                    <Text className="text-white font-bold">Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleDone = () => {
        Alert.alert('Completed', 'Your tuition registration receipt has been saved.', [
            { text: 'OK', onPress: () => navigation.replace('Dashboard') }
        ]);
    };

    return (
        <ScrollView className="flex-1 bg-gray-50 p-6" showsVerticalScrollIndicator={false}>
            <View className="py-8">
                <TouchableOpacity
                    className="bg-slate-200 px-4 py-3 rounded-2xl mb-5 w-36"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-gray-800 text-center font-bold">Close Page</Text>
                </TouchableOpacity>
                <Text className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Registration Invoice</Text>
                
                {/* Visual Receipt Card */}
                <View className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm mb-6 relative overflow-hidden">
                    <View className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Text style={{ fontSize: 100 }}>✓</Text>
                    </View>

                    {/* Banner */}
                    <View className="items-center border-b border-gray-100 pb-5 mb-5">
                        <View className="bg-green-100 p-3 rounded-full mb-3 border border-green-200">
                            <Text className="text-green-600 font-bold text-2xl">✓</Text>
                        </View>
                        <Text className="text-2xl font-black text-gray-800 tracking-tight">Payment Successful</Text>
                        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Verified Registry Invoice</Text>
                    </View>

                    {/* Metadata */}
                    <View className="space-y-3.5">
                        <View className="flex-row justify-between border-b border-gray-50 pb-2.5">
                            <Text className="text-gray-400 font-medium">Receipt ID</Text>
                            <Text className="font-bold text-gray-800 font-mono text-xs">{receiptId || `RCT-${Date.now().toString().slice(-6)}`}</Text>
                        </View>

                        <View className="flex-row justify-between border-b border-gray-50 pb-2.5">
                            <Text className="text-gray-400 font-medium">Date & Time</Text>
                            <Text className="font-semibold text-gray-800 text-xs">{date || new Date().toLocaleString()}</Text>
                        </View>

                        <View className="flex-row justify-between border-b border-gray-50 pb-2.5">
                            <Text className="text-gray-400 font-medium">Student ID</Text>
                            <Text className="font-bold text-gray-800 font-mono text-xs">{studentId}</Text>
                        </View>

                        <View className="flex-row justify-between border-b border-gray-50 pb-2.5">
                            <Text className="text-gray-400 font-medium">Student Name</Text>
                            <Text className="font-semibold text-gray-800 text-xs">{studentName}</Text>
                        </View>

                        <View className="flex-row justify-between border-b border-gray-50 pb-2.5">
                            <Text className="text-gray-400 font-medium">Payment Route</Text>
                            <Text className="font-semibold text-indigo-600 text-xs">{paymentMethod || 'EVC PLUS'}</Text>
                        </View>

                        {phone && (
                            <View className="flex-row justify-between border-b border-gray-50 pb-2.5">
                                <Text className="text-gray-400 font-medium">Payer Phone</Text>
                                <Text className="font-semibold text-gray-800 text-xs">{phone}</Text>
                            </View>
                        )}

                        <View className="flex-row justify-between border-b border-gray-50 pb-2.5">
                            <Text className="text-gray-400 font-medium">Transaction ID</Text>
                            <Text className="font-bold text-emerald-600 font-mono text-xs">{paymentNumber}</Text>
                        </View>

                        <View className="flex-row justify-between pt-2">
                            <Text className="text-gray-800 font-extrabold text-lg">Total Paid</Text>
                            <Text className="font-black text-gray-800 text-lg">${amountPaid || '50.00'} USD</Text>
                        </View>
                    </View>
                </View>

                {/* Footer disclaimer */}
                <View className="bg-indigo-50 border border-indigo-100 p-4.5 rounded-2xl mb-8">
                    <Text className="text-indigo-800 font-bold mb-1 text-xs">🔒 Digital Signature Authenticated:</Text>
                    <Text className="text-indigo-700 text-xs leading-normal">
                        This digital invoice serves as official confirmation of semester course registration and tuition settlement. Save this document for future records.
                    </Text>
                </View>

                <View className="space-y-3">
                    <TouchableOpacity
                        className="bg-slate-200 p-5 rounded-2xl shadow-sm active:bg-slate-300"
                        onPress={() => navigation.goBack()}
                    >
                        <Text className="text-gray-800 text-center font-bold text-lg">Close Page</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-indigo-600 p-5 rounded-2xl shadow-lg shadow-indigo-600/35 active:bg-indigo-700"
                        onPress={handleDone}
                    >
                        <Text className="text-white text-center font-bold text-lg">Finish & Return</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}