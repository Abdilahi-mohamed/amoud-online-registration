import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { semesterRegister, getRegisteredStudents } from '../api';

const FACULTIES = {
    ICT: {
        name: 'ICT Faculty',
        departments: ['Cyber Security', 'ICT (Pure ICT)', 'Software Engineering', 'Data Analysis', 'Business IT']
    },
    Business: {
        name: 'Business Faculty',
        departments: ['Accounting', 'Project Planning']
    },
    Education: {
        name: 'Education Faculty',
        departments: ['Primary Education', 'Secondary Education', 'Special Education', 'Educational Psychology', 'Curriculum Development']
    },
    Agriculture: {
        name: 'Agriculture Faculty',
        departments: ['Crop Science', 'Animal Science', 'Agricultural Engineering', 'Soil Science', 'Horticulture']
    },
    Medicine: {
        name: 'Medicine Faculty',
        departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynecology', 'Internal Medicine']
    },
    Engineering: {
        name: 'Engineering Faculty',
        departments: ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Computer Engineering']
    }
};

const YEAR_LEVELS = ['Sophomore', 'Junior', 'Senior'];
const SEMESTERS = [1, 2];
const CLASSES = ['Class A', 'Class B', 'Class C', 'Class D', 'Class E'];

export default function SemesterRegistrationScreen({ navigation }) {
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');

    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [showStudents, setShowStudents] = useState(false);

    const fetchStudentList = async (department, year, semester, className) => {
        if (!department || !year || !semester || !className) return;
        setLoadingStudents(true);
        try {
            const response = await getRegisteredStudents(department, year, semester, className);
            setRegisteredStudents(response.data);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Unable to load student list');
        } finally {
            setLoadingStudents(false);
        }
    };

    useEffect(() => {
        if (selectedDepartment && selectedYear && selectedSemester && selectedClass) {
            fetchStudentList(selectedDepartment, selectedYear, selectedSemester, selectedClass);
        }
    }, [selectedDepartment, selectedYear, selectedSemester, selectedClass]);

    const handleSemesterRegistration = async () => {
        if (!selectedFaculty || !selectedDepartment || !selectedYear || !selectedSemester || !selectedClass) {
            Alert.alert('Error', 'Please select faculty, department, year, semester, and class first.');
            return;
        }
        if (!studentId || !studentName) {
            Alert.alert('Error', 'Please enter Student ID and Student Name.');
            return;
        }

        if (studentName.trim().split(/\s+/).length !== 3) {
            Alert.alert('Validation Error', 'Please enter a full name consisting of exactly three words.');
            return;
        }

        setRegistering(true);
        try {
            await semesterRegister(
                selectedDepartment,
                selectedYear,
                selectedSemester,
                selectedClass,
                studentId.trim(),
                studentName.trim(),
                FACULTIES[selectedFaculty].name
            );
            Alert.alert('Success', 'Student has been registered successfully!', [
                { text: 'OK' }
            ]);
            // Clear the form fields
            setStudentId('');
            setStudentName('');
            // Refresh the registered students list
            fetchStudentList(selectedDepartment, selectedYear, selectedSemester, selectedClass);
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong.');
        } finally {
            setRegistering(false);
        }
    };

    if (!selectedFaculty) {
        return (
            <View className="flex-1 bg-gray-50">
                <View className="px-6 pt-12 pb-6 bg-white shadow-sm flex-row items-center">
                    <Text className="text-2xl font-bold text-gray-800">Select Faculty</Text>
                </View>
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                    {Object.keys(FACULTIES).map((facultyKey) => (
                        <TouchableOpacity
                            key={facultyKey}
                            className="p-6 rounded-2xl mb-4 bg-white shadow-sm border border-gray-100"
                            onPress={() => setSelectedFaculty(facultyKey)}
                        >
                            <Text className="text-xl font-semibold text-gray-800">{FACULTIES[facultyKey].name}</Text>
                            <Text className="text-gray-600 mt-1">{FACULTIES[facultyKey].departments.length} departments available</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }

    if (!selectedDepartment) {
        return (
            <View className="flex-1 bg-gray-50">
                <View className="px-6 pt-12 pb-6 bg-white shadow-sm flex-row items-center">
                    <TouchableOpacity onPress={() => setSelectedFaculty(null)} className="mr-4">
                        <Text className="text-indigo-600 text-lg">← Back</Text>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-800">{FACULTIES[selectedFaculty].name}</Text>
                </View>
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                    {FACULTIES[selectedFaculty].departments.map((dept, index) => (
                        <TouchableOpacity
                            key={index}
                            className="p-6 rounded-2xl mb-4 bg-white shadow-sm border border-gray-100"
                            onPress={() => setSelectedDepartment(dept)}
                        >
                            <Text className="text-xl font-semibold text-gray-800">{dept}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }

    if (!selectedYear) {
        return (
            <View className="flex-1 bg-gray-50 px-6 py-12 justify-center pb-32">
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-800">{FACULTIES[selectedFaculty].name}</Text>
                    <Text className="text-gray-600">Department: {selectedDepartment}</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">Select Year Level</Text>
                {YEAR_LEVELS.map((yearLevel) => (
                    <TouchableOpacity
                        key={yearLevel}
                        className="bg-blue-600 p-6 rounded-2xl mb-4"
                        onPress={() => setSelectedYear(yearLevel)}
                    >
                        <Text className="text-white text-xl font-bold text-center">{yearLevel}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity className="mt-6 bg-gray-200 p-4 rounded-xl" onPress={() => setSelectedDepartment(null)}>
                    <Text className="text-gray-700 text-center">← Back to Departments</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!selectedSemester) {
        return (
            <View className="flex-1 bg-gray-50 px-6 py-12 justify-center pb-32">
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-800">{FACULTIES[selectedFaculty].name}</Text>
                    <Text className="text-gray-600">Department: {selectedDepartment}</Text>
                    <Text className="text-gray-600">Year: {selectedYear}</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">Select Semester</Text>
                {SEMESTERS.map((sem) => (
                    <TouchableOpacity
                        key={sem}
                        className="bg-indigo-600 p-6 rounded-2xl mb-4"
                        onPress={() => setSelectedSemester(sem)}
                    >
                        <Text className="text-white text-xl font-bold text-center">Semester {sem}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity className="mt-6 bg-gray-200 p-4 rounded-xl" onPress={() => setSelectedYear(null)}>
                    <Text className="text-gray-700 text-center">← Back to Year Levels</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!selectedClass) {
        return (
            <View className="flex-1 bg-gray-50 px-6 py-12 justify-center pb-32">
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-800">{FACULTIES[selectedFaculty].name}</Text>
                    <Text className="text-gray-600">Department: {selectedDepartment}</Text>
                    <Text className="text-gray-600">Year: {selectedYear} | Semester: {selectedSemester}</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">Select Class</Text>
                <ScrollView>
                    {CLASSES.map((cls) => (
                        <TouchableOpacity
                            key={cls}
                            className="bg-purple-600 p-6 rounded-2xl mb-4"
                            onPress={() => setSelectedClass(cls)}
                        >
                            <Text className="text-white text-xl font-bold text-center">{cls}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity className="mt-6 bg-gray-200 p-4 rounded-xl" onPress={() => setSelectedSemester(null)}>
                    <Text className="text-gray-700 text-center">← Back to Semesters</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 px-6 py-12">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-800">Register Student</Text>
                    <Text className="text-gray-600">Faculty: {FACULTIES[selectedFaculty].name}</Text>
                    <Text className="text-gray-600">Department: {selectedDepartment}</Text>
                    <Text className="text-gray-600">Year: {selectedYear}</Text>
                    <Text className="text-gray-600">Semester: {selectedSemester} | Class: {selectedClass}</Text>
                </View>

                <TextInput
                    className="bg-white border border-gray-300 p-4 rounded-xl mb-4"
                    placeholder="Student ID"
                    value={studentId}
                    onChangeText={setStudentId}
                    keyboardType="default"
                />
                <TextInput
                    className="bg-white border border-gray-300 p-4 rounded-xl mb-4"
                    placeholder="Student Name (3 words required)"
                    value={studentName}
                    onChangeText={setStudentName}
                    keyboardType="default"
                />


                <TouchableOpacity
                    className={`p-5 rounded-2xl mb-6 shadow-md shadow-indigo-600/20 ${registering ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
                    onPress={handleSemesterRegistration}
                    disabled={registering}
                >
                    {registering ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <Text className="text-white text-xl font-bold text-center">Submit</Text>
                    )}
                </TouchableOpacity>

                <View className="mb-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <TouchableOpacity 
                        className="p-4 bg-blue-50 flex-row justify-between items-center" 
                        onPress={() => setShowStudents(!showStudents)}
                    >
                        <Text className="text-lg font-semibold text-blue-800">View Registered Students ({registeredStudents.length})</Text>
                        <Text className="text-blue-800 font-bold">{showStudents ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    
                    {showStudents && (
                        <View className="p-4 bg-white top-border border-gray-100">
                            {loadingStudents ? (
                                <ActivityIndicator size="small" color="#2563eb" />
                            ) : registeredStudents.length === 0 ? (
                                <Text className="text-gray-500">No students registered yet.</Text>
                            ) : (
                                <View className="border border-gray-200 rounded-lg overflow-hidden">
                                    <View className="flex-row bg-gray-100 p-3 border-b border-gray-200">
                                        <Text className="flex-1 font-bold text-gray-800">Student Name</Text>
                                        <Text className="w-24 font-bold text-gray-800 text-center">ID</Text>
                                    </View>
                                    <ScrollView className="max-h-56">
                                        {registeredStudents.map((s, index) => (
                                            <View key={`${s.studentId}-${index}`} className="flex-row p-3 border-b border-gray-100 bg-white">
                                                <Text className="flex-1 text-gray-700">{s.studentName}</Text>
                                                <Text className="w-24 text-gray-600 text-center">{s.studentId}</Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <TouchableOpacity className="mt-2 bg-gray-200 p-3 rounded-xl" onPress={() => setSelectedClass(null)}>
                    <Text className="text-gray-700 text-center">← Change Class</Text>
                </TouchableOpacity>
                <TouchableOpacity className="mt-2 bg-gray-200 p-3 rounded-xl" onPress={() => setSelectedSemester(null)}>
                    <Text className="text-gray-700 text-center">← Change Semester</Text>
                </TouchableOpacity>
                <TouchableOpacity className="mt-2 bg-gray-200 p-3 rounded-xl" onPress={() => setSelectedYear(null)}>
                    <Text className="text-gray-700 text-center">← Change Year</Text>
                </TouchableOpacity>
                <TouchableOpacity className="mt-2 bg-gray-200 p-3 rounded-xl mb-12" onPress={() => setSelectedDepartment(null)}>
                    <Text className="text-gray-700 text-center">← Change Department</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
