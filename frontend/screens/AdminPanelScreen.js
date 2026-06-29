import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { semesterRegister, getAllRegistrations } from '../api';

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
const CLASSES = ['Class A', 'Class B', 'Class C', 'Class D', 'Class E', 'Class F'];

export default function AdminPanelScreen({ navigation }) {
    const [allRegs, setAllRegs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'drilldown'

    // Drill down states exactly matching frontend semester registration
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    
    // Manual registration states
    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [registering, setRegistering] = useState(false);
    const [showStudents, setShowStudents] = useState(false);

    // Search state for All Students tab
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const regsRes = await getAllRegistrations();
            setAllRegs(regsRes.data);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Could not load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Helper: get faculty from registration record, fallback to populated user
    const getFaculty = (reg) => {
        return reg.faculty || reg.user?.faculty || '-';
    };

    const getDepartment = (reg) => {
        return reg.department || reg.user?.department || '-';
    };

    const getYear = (reg) => {
        return reg.year || reg.user?.year || '-';
    };

    const getStudentName = (reg) => {
        return reg.studentName || reg.user?.fullName || reg.user?.username || '-';
    };

    const getStudentId = (reg) => {
        return reg.studentId || reg.user?.studentId || '-';
    };

    // Filter all semester registrations for the All Students view
    const getAllSemesterStudents = () => {
        let students = allRegs.filter(r => r.type === 'semester');
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            students = students.filter(s =>
                (getStudentId(s) || '').toLowerCase().includes(q) ||
                (getStudentName(s) || '').toLowerCase().includes(q) ||
                (getFaculty(s) || '').toLowerCase().includes(q) ||
                (getDepartment(s) || '').toLowerCase().includes(q)
            );
        }
        return students;
    };

    const getStudentsForCurrentClass = () => {
        if (!selectedDepartment || !selectedYear || !selectedSemester || !selectedClass) return [];
        return allRegs.filter(r => 
            r.type === 'semester' &&
            r.department === selectedDepartment &&
            r.year === selectedYear &&
            r.semester === selectedSemester &&
            r.className === selectedClass
        );
    };

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
            await semesterRegister(selectedDepartment, selectedYear, selectedSemester, selectedClass, studentId, studentName, FACULTIES[selectedFaculty].name);
            Alert.alert('Success', 'Student registered successfully.', [{ text: 'OK' }]);
            setStudentId('');
            setStudentName('');
            await loadData();
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setRegistering(false);
        }
    };

    // ─── All Students Table ────────────────────────────────────────────
    const renderAllStudentsTable = () => {
        const students = getAllSemesterStudents();

        return (
            <View className="mb-6">
                <View className="bg-blue-800 p-4 rounded-xl mb-6 flex-row justify-between items-center shadow-sm">
                    <Text className="text-white text-lg font-bold">Total Registered Students</Text>
                    <Text className="text-blue-900 bg-white px-3 py-1 rounded-full font-bold">{students.length}</Text>
                </View>

                {/* Search Bar */}
                <TextInput
                    className="bg-white border border-gray-200 p-4 rounded-xl mb-4"
                    placeholder="Search by ID, Name, Faculty, or Department..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                {students.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center">
                        <Text className="text-gray-500 text-lg italic">No students found.</Text>
                    </View>
                ) : (
                    <View className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View>
                                {/* Table Header */}
                                <View className="flex-row bg-gray-800 p-3">
                                    <Text className="w-8 font-bold text-white text-center">#</Text>
                                    <Text className="w-28 font-bold text-white text-center">Student ID</Text>
                                    <Text className="w-44 font-bold text-white">Full Name</Text>
                                    <Text className="w-32 font-bold text-white">Faculty</Text>
                                    <Text className="w-40 font-bold text-white">Department</Text>
                                    <Text className="w-24 font-bold text-white text-center">Year</Text>
                                    <Text className="w-20 font-bold text-white text-center">Sem</Text>
                                    <Text className="w-28 font-bold text-white text-center">Reg. Date</Text>
                                </View>

                                {/* Table Rows */}
                                <ScrollView style={{ maxHeight: 500 }}>
                                    {students.map((s, index) => (
                                        <View
                                            key={`${s._id || s.studentId}-${index}`}
                                            className={`flex-row p-3 border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                        >
                                            <Text className="w-8 text-gray-500 text-center">{index + 1}</Text>
                                            <Text className="w-28 text-gray-700 text-center font-medium">{getStudentId(s)}</Text>
                                            <Text className="w-44 text-gray-800 font-medium">{getStudentName(s)}</Text>
                                            <Text className="w-32 text-gray-600">{getFaculty(s)}</Text>
                                            <Text className="w-40 text-gray-600">{getDepartment(s)}</Text>
                                            <Text className="w-24 text-gray-600 text-center">{getYear(s)}</Text>
                                            <Text className="w-20 text-gray-600 text-center">{s.semester || '-'}</Text>
                                            <Text className="w-28 text-gray-600 text-center">
                                                {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </ScrollView>
                    </View>
                )}
            </View>
        );
    };

    // ─── Drill-Down Wizard ─────────────────────────────────────────────
    const renderDrillDownWizard = () => {
        let totalUniversityStudents = 0;
        allRegs.forEach(r => { if(r.type === 'semester') totalUniversityStudents++; });

        if (!selectedFaculty) {
            return (
                <View className="mb-6">
                    <View className="bg-blue-800 p-4 rounded-xl mb-6 flex-row justify-between items-center shadow-sm">
                        <Text className="text-white text-lg font-bold">University Total Enrollment</Text>
                        <Text className="text-blue-900 bg-white px-3 py-1 rounded-full font-bold">{totalUniversityStudents}</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 mb-4">View All Registrations (Select Faculty)</Text>
                    {Object.keys(FACULTIES).map((facultyKey) => (
                        <TouchableOpacity
                            key={facultyKey}
                            className="p-6 rounded-2xl mb-4 bg-white shadow-sm border border-gray-200"
                            onPress={() => setSelectedFaculty(facultyKey)}
                        >
                            <Text className="text-xl font-semibold text-gray-800">{FACULTIES[facultyKey].name}</Text>
                            <Text className="text-gray-600 mt-1">{FACULTIES[facultyKey].departments.length} departments available</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        if (!selectedDepartment) {
            return (
                <View className="mb-6">
                    <View className="mb-6 flex-row items-center border-b border-gray-200 pb-4">
                        <TouchableOpacity onPress={() => setSelectedFaculty(null)} className="mr-4 bg-gray-200 p-2 rounded">
                            <Text className="text-indigo-600 font-bold">← Back</Text>
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-gray-800">{FACULTIES[selectedFaculty].name}</Text>
                    </View>
                    <Text className="text-xl font-bold text-gray-700 mb-4">Select Department</Text>
                    {FACULTIES[selectedFaculty].departments.map((dept, index) => (
                        <TouchableOpacity
                            key={index}
                            className="p-6 rounded-2xl mb-4 bg-white shadow-sm border border-gray-200"
                            onPress={() => setSelectedDepartment(dept)}
                        >
                            <Text className="text-xl font-semibold text-gray-800">{dept}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        if (!selectedYear) {
            return (
                <View className="mb-6">
                    <View className="mb-6 border-b border-gray-200 pb-4">
                        <Text className="text-2xl font-bold text-gray-800">{FACULTIES[selectedFaculty].name}</Text>
                        <Text className="text-gray-600">Department: {selectedDepartment}</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Year Level</Text>
                    {YEAR_LEVELS.map((yearLevel) => (
                        <TouchableOpacity
                            key={yearLevel}
                            className="bg-blue-600 p-6 rounded-2xl mb-4 shadow-sm"
                            onPress={() => setSelectedYear(yearLevel)}
                        >
                            <Text className="text-white text-xl font-bold text-center">{yearLevel}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity className="mt-4 bg-gray-200 p-4 rounded-xl" onPress={() => setSelectedDepartment(null)}>
                        <Text className="text-gray-700 text-center font-bold">← Back to Departments</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!selectedSemester) {
            return (
                <View className="mb-6">
                    <View className="mb-6 border-b border-gray-200 pb-4">
                        <Text className="text-2xl font-bold text-gray-800">{FACULTIES[selectedFaculty].name}</Text>
                        <Text className="text-gray-600">Department: {selectedDepartment}</Text>
                        <Text className="text-gray-600">Year: {selectedYear}</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Semester</Text>
                    {SEMESTERS.map((sem) => (
                        <TouchableOpacity
                            key={sem}
                            className="bg-indigo-600 p-6 rounded-2xl mb-4 shadow-sm"
                            onPress={() => setSelectedSemester(sem)}
                        >
                            <Text className="text-white text-xl font-bold text-center">Semester {sem}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity className="mt-4 bg-gray-200 p-4 rounded-xl" onPress={() => setSelectedYear(null)}>
                        <Text className="text-gray-700 text-center font-bold">← Back to Year Levels</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!selectedClass) {
            return (
                <View className="mb-6">
                    <View className="mb-6 border-b border-gray-200 pb-4">
                        <Text className="text-2xl font-bold text-gray-800">{FACULTIES[selectedFaculty].name}</Text>
                        <Text className="text-gray-600">Department: {selectedDepartment}</Text>
                        <Text className="text-gray-600">Year: {selectedYear} | Semester: {selectedSemester}</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Class</Text>
                    {CLASSES.map((cls) => (
                        <TouchableOpacity
                            key={cls}
                            className="bg-purple-600 p-6 rounded-2xl mb-4 shadow-sm"
                            onPress={() => setSelectedClass(cls)}
                        >
                            <Text className="text-white text-xl font-bold text-center">{cls}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity className="mt-4 bg-gray-200 p-4 rounded-xl" onPress={() => setSelectedSemester(null)}>
                        <Text className="text-gray-700 text-center font-bold">← Back to Semesters</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Final view: selected Class registration form AND statistics
        const classStudents = getStudentsForCurrentClass();

        return (
            <View className="mb-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-800">Register Student</Text>
                    <Text className="text-gray-600 mt-2">Faculty: <Text className="font-semibold">{FACULTIES[selectedFaculty].name}</Text></Text>
                    <Text className="text-gray-600">Department: <Text className="font-semibold">{selectedDepartment}</Text></Text>
                    <Text className="text-gray-600">Year: <Text className="font-semibold">{selectedYear}</Text></Text>
                    <Text className="text-gray-600">Semester: <Text className="font-semibold">{selectedSemester}</Text> | Class: <Text className="font-semibold">{selectedClass}</Text></Text>
                </View>

                <TextInput
                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4"
                    placeholder="Student ID"
                    value={studentId}
                    onChangeText={setStudentId}
                    keyboardType="default"
                />
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6"
                    placeholder="Student Name (3 words required)"
                    value={studentName}
                    onChangeText={setStudentName}
                    keyboardType="default"
                />

                <TouchableOpacity
                    className={`p-5 rounded-xl mb-6 shadow-sm ${registering ? 'bg-gray-400' : 'bg-green-600'}`}
                    onPress={handleSemesterRegistration}
                    disabled={registering}
                >
                    <Text className="text-white text-xl font-bold text-center">{registering ? 'Registering...' : 'Submit Student'}</Text>
                </TouchableOpacity>

                <View className="mb-6 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <TouchableOpacity 
                        className="p-4 bg-blue-50 flex-row justify-between items-center" 
                        onPress={() => setShowStudents(!showStudents)}
                    >
                        <Text className="text-lg font-semibold text-blue-800">View Registered Students ({classStudents.length})</Text>
                        <Text className="text-blue-800 font-bold">{showStudents ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    
                    {showStudents && (
                        <View className="p-4 bg-white border-t border-gray-200">
                            {classStudents.length === 0 ? (
                                <Text className="text-gray-500 italic">No students registered yet.</Text>
                            ) : (
                                <View className="border border-gray-200 rounded-lg overflow-hidden">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                        <View>
                                            <View className="flex-row bg-gray-100 p-3 border-b border-gray-200">
                                                <Text className="w-24 font-bold text-gray-800 text-center">ID</Text>
                                                <Text className="w-40 font-bold text-gray-800">Student Name</Text>
                                                <Text className="w-32 font-bold text-gray-800">Faculty</Text>
                                                <Text className="w-36 font-bold text-gray-800">Department</Text>
                                                <Text className="w-24 font-bold text-gray-800 text-center">Year</Text>
                                                <Text className="w-20 font-bold text-gray-800 text-center">Sem</Text>
                                                <Text className="w-28 font-bold text-gray-800 text-center">Date</Text>
                                            </View>
                                            <ScrollView className="max-h-56">
                                                {classStudents.map((s, index) => (
                                                    <View key={`${s.studentId}-${index}`} className="flex-row p-3 border-b border-gray-100 bg-white">
                                                        <Text className="w-24 text-gray-600 text-center">{getStudentId(s)}</Text>
                                                        <Text className="w-40 text-gray-700">{getStudentName(s)}</Text>
                                                        <Text className="w-32 text-gray-600">{getFaculty(s)}</Text>
                                                        <Text className="w-36 text-gray-600">{getDepartment(s)}</Text>
                                                        <Text className="w-24 text-gray-600 text-center">{getYear(s)}</Text>
                                                        <Text className="w-20 text-gray-600 text-center">{s.semester || '-'}</Text>
                                                        <Text className="w-28 text-gray-600 text-center">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View className="border-t border-gray-200 pt-4">
                    <TouchableOpacity className="mt-2 bg-gray-200 p-3 rounded-xl" onPress={() => setSelectedClass(null)}>
                        <Text className="text-gray-700 text-center font-bold">← Change Class</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="mt-2 bg-gray-200 p-3 rounded-xl" onPress={() => setSelectedSemester(null)}>
                        <Text className="text-gray-700 text-center font-bold">← Change Semester</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="mt-2 bg-gray-200 p-3 rounded-xl" onPress={() => setSelectedYear(null)}>
                        <Text className="text-gray-700 text-center font-bold">← Change Year</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="mt-2 bg-gray-200 p-3 rounded-xl" onPress={() => setSelectedDepartment(null)}>
                        <Text className="text-gray-700 text-center font-bold">← Change Department</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-6 pt-12 pb-6 bg-white shadow-sm flex-row items-center justify-between z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2">
                    <Text className="text-blue-600 text-lg font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800">Admin Monitor</Text>
                <View className="w-10"></View>
            </View>

            {/* Tab Switcher */}
            <View className="flex-row bg-white border-b border-gray-200 px-4">
                <TouchableOpacity
                    className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'all' ? 'border-indigo-600' : 'border-transparent'}`}
                    onPress={() => setActiveTab('all')}
                >
                    <Text className={`font-bold text-base ${activeTab === 'all' ? 'text-indigo-600' : 'text-gray-500'}`}>All Students</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'drilldown' ? 'border-indigo-600' : 'border-transparent'}`}
                    onPress={() => setActiveTab('drilldown')}
                >
                    <Text className={`font-bold text-base ${activeTab === 'drilldown' ? 'text-indigo-600' : 'text-gray-500'}`}>Register & Browse</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-gray-500 mt-4">Loading Admin Data...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    {activeTab === 'all' ? renderAllStudentsTable() : renderDrillDownWizard()}
                </ScrollView>
            )}
        </View>
    );
}
