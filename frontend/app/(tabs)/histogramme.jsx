import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, BackHandler, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Stack, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from './config/config';

export default function DashboardScreen() {
  const [data, setData] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });
  const [yearDetails, setYearDetails] = useState([]);
  const [progression, setProgression] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      navigation.replace('Menu');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch chart data
          const response = await fetch(`${BASE_URL}/api/histogramme/`);
          const rawData = await response.json();

          const yearData = {};

          rawData.forEach((entry) => {
            const year = entry.annee;
            if (!yearData[year]) {
              yearData[year] = 0;
            }
            yearData[year] += parseFloat(entry.total_mnt_ver);
          });

          const labels = Object.keys(yearData).sort();
          const dataPoints = Object.values(yearData);

          const chartData = {
            labels,
            datasets: [
              {
                data: dataPoints,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          };

          setData(chartData);

          const details = labels.map((label, index) => ({
            year: label,
            total: dataPoints[index].toFixed(2),
          }));

          setYearDetails(details);

          // Calculate progression
          if (dataPoints.length >= 2) {
            const lastYear = dataPoints[dataPoints.length - 1];
            const previousYear = dataPoints[dataPoints.length - 2];
            const progressionValue = ((lastYear - previousYear) / previousYear) * 100;
            setProgression(progressionValue.toFixed(2));
          } else {
            setProgression(0);
          }

          // Fetch user transactions
          const transactionResponse = await fetch(`${BASE_URL}/api/central_recette/`);
          const transactionData = await transactionResponse.json();
          setTransactionsCount(transactionData.length);

        } catch (error) {
          setData({
            labels: ['Erreur'],
            datasets: [{ data: [0] }]
          });
          setYearDetails([{ year: 'Erreur', total: 0 }]);
          setProgression(0);
          setTransactionsCount(0);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        headerTransparent: true,
        headerTitle: '',
      }} />
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.statBox}>
            <Ionicons name="swap-vertical" size={24} color="#1379CD" />
            <Text style={styles.statNumber}>{transactionsCount}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="trending-up" size={24} color={progression >= 0 ? '#4CAF50' : '#F44336'} />
            <Text style={[styles.statNumber, { color: progression >= 0 ? '#4CAF50' : '#F44336' }]}>
              {progression}%
            </Text>
            <Text style={styles.statLabel}>Progression</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Évolution annuelle</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1379CD" />
              <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
          ) : (
            data.datasets[0].data.length > 0 && (
              <LineChart
                data={data}
                width={Dimensions.get('window').width - 70}
                height={220}
                chartConfig={{
                  backgroundColor: '#1379CD',
                  backgroundGradientFrom: '#1379CD',
                  backgroundGradientTo: '#16375A',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                  },
                }}
                bezier
                style={styles.chart}
              />
            )
          )}
        </View>
        <View style={styles.dashboardContainer}>
          <Text style={styles.sectionTitle}>Détails annuels</Text>
          {yearDetails.map((detail, index) => (
            <View key={index} style={styles.detailSection}>
              <Text style={styles.detailYear}>{detail.year}</Text>
              <Text style={styles.detailTotal}>{detail.total}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    justifyConten: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dashboardContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailYear: {
    fontSize: 16,
    color: '#333',
  },
  detailTotal: {
    fontSize: 16,
    color: '#1379CD',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

