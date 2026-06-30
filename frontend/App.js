import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import ExcelLoginScreen from './screens/ExcelLoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import SemesterRegistrationScreen from './screens/SemesterRegistrationScreen';
import FeePaymentScreen from './screens/FeePaymentScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';

import './global.css';

const Stack = createNativeStackNavigator();

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [secondAuthPassed, setSecondAuthPassed] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const secondAuth = await AsyncStorage.getItem('secondAuthPassed');
                setUserToken(token);
                setSecondAuthPassed(secondAuth === 'true');
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        checkToken();
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName={userToken ? (secondAuthPassed ? 'Dashboard' : 'ExcelLogin') : 'Login'}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ExcelLogin" component={ExcelLoginScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="SemesterRegistration" component={SemesterRegistrationScreen} />
                <Stack.Screen name="FeePayment" component={FeePaymentScreen} />
                <Stack.Screen name="Receipt" component={ReceiptScreen} />
                <Stack.Screen name="Feedback" component={FeedbackScreen} />
                <Stack.Screen name="PaymentHistory" component={TransactionHistoryScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}