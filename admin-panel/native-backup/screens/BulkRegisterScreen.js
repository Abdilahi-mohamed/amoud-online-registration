import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { bulkRegisterWithExcel } from '../api';

export default function BulkRegisterScreen() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);

    const handleSelectFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.ms-excel'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;
            const file = result.assets[0];
            setSelectedFile(file);
            setResults(null);
        } catch (error) {
            Alert.alert("Error", "Could not pick file");
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const response = await bulkRegisterWithExcel(selectedFile);
            const data = response.data;
            setResults(data);
            Alert.alert('Success', `Registered ${data.successCount} users. Skipped: ${data.skippedCount}, Failed: ${data.failedCount}`);
        } catch (error) {
            Alert.alert('Upload Failed', error.response?.data?.message || 'Something went wrong during upload.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Bulk Register Users</Text>
            <Text style={styles.subtitle}>Upload an Excel file to register multiple students at once. Required columns: username, password, fullName, studentId, faculty, department, year.</Text>

            <TouchableOpacity style={styles.uploadZone} onPress={handleSelectFile}>
                <Text style={styles.uploadIcon}>📂</Text>
                {selectedFile ? (
                    <View style={styles.fileDetails}>
                        <Text style={styles.fileName}>{selectedFile.name}</Text>
                        <Text style={styles.fileSize}>
                            {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.uploadText}>Tap to select Excel/CSV file</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, (!selectedFile || uploading) && styles.buttonDisabled]} 
                onPress={handleUpload}
                disabled={!selectedFile || uploading}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Upload & Register</Text>
                )}
            </TouchableOpacity>

            {results && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Results</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statBox, { backgroundColor: '#d4edda' }]}>
                            <Text style={styles.statNumber}>{results.successCount}</Text>
                            <Text style={styles.statLabel}>Success</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: '#fff3cd' }]}>
                            <Text style={styles.statNumber}>{results.skippedCount}</Text>
                            <Text style={styles.statLabel}>Skipped</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: '#f8d7da' }]}>
                            <Text style={styles.statNumber}>{results.failedCount}</Text>
                            <Text style={styles.statLabel}>Failed</Text>
                        </View>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    uploadZone: {
        borderWidth: 2,
        borderColor: '#007bff',
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e6f2ff',
        marginBottom: 20,
    },
    uploadIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    uploadText: {
        fontSize: 16,
        color: '#007bff',
    },
    fileDetails: {
        alignItems: 'center',
    },
    fileName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    fileSize: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    button: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#a5d8b1',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultsContainer: {
        marginTop: 30,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        marginHorizontal: 5,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 5,
        fontWeight: '600',
    }
});
