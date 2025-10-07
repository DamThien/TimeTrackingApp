import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface MonthlyReport {
  [month: string]: {
    employees: { name: string; workDays: number }[];
    total: number;
  };
}

const ReportScreen: React.FC = () => {
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport>({});
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;

  useFocusEffect(
    useCallback(() => {
      const fetchReports = async () => {
        try {
          const saved = await AsyncStorage.getItem('monthlyReports');
          if (saved) {
            setMonthlyReports(JSON.parse(saved));
          }
        } catch (e) {
          console.error('Lỗi khi đọc dữ liệu báo cáo:', e);
        }
      };

      fetchReports();
    }, [])
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Báo cáo theo tháng</Text>
      {Object.entries(monthlyReports).map(([month, data]) => (
        <View key={month} style={[styles.card, { backgroundColor: theme.rowBackground }]}>
          <Text style={[styles.title, { color: theme.text }]}>{month}</Text>
          {data.employees.map((emp, index) => (
            <Text key={index} style={[styles.employee, { color: theme.text }]}>
              {emp.name}: {emp.workDays} công
            </Text>
          ))}
          <Text style={[styles.total, { color: '#2563eb' }]}>Tổng công tháng: {data.total}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const lightTheme = {
  background: '#fff',
  text: '#000',
  rowBackground: '#e0f7fa',
};

const darkTheme = {
  background: '#121212',
  text: '#fff',
  rowBackground: '#1a2a2a',
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  employee: { fontSize: 16, marginLeft: 8 },
  total: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
});

export default ReportScreen;
