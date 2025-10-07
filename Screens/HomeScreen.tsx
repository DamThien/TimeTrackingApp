import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ScrollView as RNScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

interface Employee {
  id: string;
  name: string;
  workDays: number[];
}

interface MonthlyReport {
  [month: string]: {
    employees: { name: string; workDays: number }[];
    total: number;
  };
}

const HomeScreen: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate] = useState(new Date());
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const horizontalScrollRef = useRef<RNScrollView>(null);
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  useEffect(() => {
    horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [viewMode, currentDate]);

  useEffect(() => {
    const init = async () => {
      const saved = await AsyncStorage.getItem('employees');
      const loadedEmployees: Employee[] = saved ? JSON.parse(saved) : [];
      setEmployees(loadedEmployees);

      const currentDate = new Date();
      const currentMonthLabel = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;

      const lastSavedMonth = await AsyncStorage.getItem('lastSavedMonth');

      if (lastSavedMonth !== currentMonthLabel) {
        const previousMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
        await saveCurrentMonthReport(previousMonth, loadedEmployees);

        const clearedEmployees = loadedEmployees.map(emp => ({
          ...emp,
          workDays: Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(0),
        }));
        await AsyncStorage.setItem('employees', JSON.stringify(clearedEmployees));
        setEmployees(clearedEmployees);

        await AsyncStorage.setItem('lastSavedMonth', currentMonthLabel);
      } 
    };

    init();
  }, []);

  useEffect(() => {
    const save = async () => {
      await AsyncStorage.setItem('employees', JSON.stringify(employees));
    };
    save();
  }, [employees]);

  const saveCurrentMonthReport = async (monthToSave: number, dataToSave: Employee[]) => {
    const savedReports = await AsyncStorage.getItem('monthlyReports');
    const reports: MonthlyReport = savedReports ? JSON.parse(savedReports) : {};

    const simplifiedEmployees = dataToSave.map(emp => ({
      name: emp.name,
      workDays: emp.workDays.reduce((s, d) => s + d, 0),
    }));
    const total = simplifiedEmployees.reduce((sum, emp) => sum + emp.workDays, 0);
    const label = `Tháng ${monthToSave}`;

    reports[label] = {
      employees: simplifiedEmployees,
      total: parseFloat(total.toFixed(2)),
    };

    await AsyncStorage.setItem('monthlyReports', JSON.stringify(reports));
  };

  const addEmployee = async () => {
    if (newEmployee.trim()) {
      const currentDate = new Date();
      const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  
      const newEmp = {
        id: Date.now().toString(),
        name: newEmployee.trim(),
        workDays: Array(daysInMonth).fill(0),
      };
  
      const updatedEmployees = [...employees, newEmp];
      setEmployees(updatedEmployees);
      setNewEmployee('');
  
      // ✅ Lưu vào AsyncStorage
      await AsyncStorage.setItem('employees', JSON.stringify(updatedEmployees));
  
      // ✅ Lưu báo cáo tháng hiện tại
      const currentMonth = currentDate.getMonth() + 1;
      await saveCurrentMonthReport(currentMonth, updatedEmployees);
    }
  };

  const updateWorkDay = (id: string, dayIndex: number, value: string) => {
    const val = parseFloat(value) || 0;
    if (val < 0 || val > 1) return;
  
    setEmployees((prev) => {
      const updated = prev.map((emp) =>
        emp.id === id
          ? { ...emp, workDays: emp.workDays.map((w, i) => (i === dayIndex ? val : w)) }
          : emp
      );
  
      // 🟡 Gọi fire-and-forget async function
      (async () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth() + 1;
        await saveCurrentMonthReport(currentMonth, updated);
      })();
  
      return updated;
    });
  };

  const getDaysToDisplay = () => {
    const today = new Date(currentDate);
    const names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    if (viewMode === 'week') {
      const dow = (today.getDay() + 6) % 7;
      const start = new Date(today);
      start.setDate(today.getDate() - dow);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return { day: d.getDate(), weekday: names[(d.getDay() + 6) % 7], date: d };
      });
    }
  
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 👈 số ngày trong tháng
  
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return { day: d.getDate(), weekday: names[(d.getDay() + 6) % 7], date: d };
    });
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const CurrentMonth: React.FC = () => {
    const today = new Date();
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    const currentMonth = monthNames[today.getMonth()];
    const currentYear = today.getFullYear();

    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 25, fontWeight: "800", color: theme.text }}>
          {`${currentMonth} - ${currentYear}`}
        </Text>
      </View>
    );
  };

  const confirmDeleteEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa nhân viên "${employee?.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
            setEmployees(updatedEmployees);
  
            // ✅ Lưu vào AsyncStorage
            await AsyncStorage.setItem('employees', JSON.stringify(updatedEmployees));
  
            // ✅ Cập nhật báo cáo tháng hiện tại
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            await saveCurrentMonthReport(currentMonth, updatedEmployees);
          },
        },
      ]
    );
  };

  const isToday = (someDate: Date): boolean => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };
  
  const isSunday = (someDate: Date): boolean => {
    return someDate.getDay() === 0;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View><CurrentMonth /></View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={newEmployee}
          onChangeText={setNewEmployee}
          placeholder="Nhập tên nhân viên"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
        />
        <View style={{ backgroundColor: theme.background, borderRadius: 5 }}>
          <Button title="Thêm" onPress={addEmployee} />
        </View>
      </View>

      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'month' && styles.activeButton]}
          onPress={() => setViewMode('month')}
        >
          <Text style={{ color: theme.text }}>Tháng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'week' && styles.activeButton]}
          onPress={() => setViewMode('week')}
        >
          <Text style={{ color: theme.text }}>Tuần</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{marginBottom: 20}} horizontal ref={horizontalScrollRef}>
        <View>
          <View style={[styles.row, { backgroundColor: theme.rowBackground }]}>
            <Text style={[styles.cell, { width: 80, color: theme.text, alignSelf: "center", fontWeight: "800" }]}>Tên</Text>
            <Text style={[styles.cell, { width: 50, color: theme.text, alignSelf: "center", fontWeight: "800"  }]}>Công</Text>
            {getDaysToDisplay().map((d, i) => (
              <View
              key={i}
              style={[
                styles.cell,
                {
                  backgroundColor: isToday(d.date)
                    ? 'lightgreen'
                    : isSunday(d.date)
                    ? 'gold'
                    : 'transparent',
                },
              ]}
            >
              <Text style={{ color: theme.text, textAlign: 'center', fontWeight: "800"  }}>
                {d.day} ({d.weekday})
              </Text>
            </View>
            ))}
          </View>
          <FlatList
            data={employees}
            renderItem={({ item }) => (
              <View style={[styles.row, { backgroundColor: theme.rowBackground }]}>
                <View style={{ width: 80, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.cell, { color: theme.text, flex: 1 }]}>{item.name}</Text>
                  <TouchableOpacity style={{ width:20, backgroundColor: 'red', display: 'flex', alignItems: 'center' }} onPress={() => confirmDeleteEmployee(item.id)}>
                    <Text style={{ color: theme.text, fontWeight: 'bold'}}>X</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cell, { width: 50, color: theme.text }]}>
                  {item.workDays.reduce((s, d) => s + d, 0).toFixed(2)}
                </Text>
                {getDaysToDisplay().map((d, i) => (
                  <TextInput
                    key={i}
                    style={[
                      styles.cellInput,
                      {
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.borderColor,
                        color: theme.text,
                      },
                    ]}
                    keyboardType="numeric"
                    defaultValue={item.workDays[d.day - 1]?.toString() || '0'}
                    onEndEditing={(e) => updateWorkDay(item.id, d.day - 1, e.nativeEvent.text)}
                  />
                ))}
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const lightTheme = {
  background: '#fff',
  text: '#000',
  inputBackground: '#fff',
  rowBackground: '#e0f7fa',
  borderColor: '#ccc',
};
const darkTheme = {
  background: '#121212',
  text: '#fff',
  inputBackground: '#1e1e1e',
  rowBackground: '#1a2a2a',
  borderColor: '#444',
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  viewModeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  viewModeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 3,
  },
  cell: { width: 30, margin: 3, textAlign: 'center' },
  cellInput: {
    width: 30,
    margin: 3,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 3,
    padding: 2,
  },
});

export default HomeScreen;
