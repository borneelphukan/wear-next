import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState((params.email as string) || '');
  const [userFirstName, setUserFirstName] = useState((params.firstName as string) || 'User');
  const [activeTab, setActiveTab] = useState<'home' | 'wardrobe' | 'settings'>('home');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('userSession');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.firstName) setUserFirstName(parsed.firstName);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSession();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userSession');
    Alert.alert('Logged Out', 'You have been successfully logged out.');
    router.replace('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      let deleteEmail = email;
      if (!deleteEmail) {
        const stored = await AsyncStorage.getItem('userSession');
        if (stored) {
          const parsed = JSON.parse(stored);
          deleteEmail = parsed.email || '';
        }
      }
      
      const cleanEmail = deleteEmail?.trim()?.toLowerCase();
      
      if (!cleanEmail) {
        Alert.alert('Error', 'No active session found.');
        return;
      }
      
      console.log('[DELETE BUTTON] Sending DELETE request to http://localhost:4000/users/' + encodeURIComponent(cleanEmail));
      const response = await axios.delete('http://localhost:4000/users/' + encodeURIComponent(cleanEmail));
      console.log('[DELETE BUTTON] API Response received:', response.data);
  
      await AsyncStorage.removeItem('userSession');
      
      Alert.alert('Success', 'Your account has been deleted.');
      router.replace('/login');
    } catch (error: any) {
      console.error('[DELETE BUTTON] Error caught during deletion:', error);
      if (error.response) {
        console.error('[DELETE BUTTON] Error response data:', error.response.data);
        console.error('[DELETE BUTTON] Error response status:', error.response.status);
      }
      const errorMsg = error.response?.data?.message || 'Failed to delete account. Please try again.';
      Alert.alert('Error', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Welcome, {userFirstName}!</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'home' && (
          <View>
            {/* Content for Home tab */}
          </View>
        )}

        {activeTab === 'wardrobe' && (
          <View>
            {/* Content for Wardrobe tab */}
          </View>
        )}

        {activeTab === 'settings' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Account Settings</Text>
              <Text style={styles.settingsSub}>Email: {email || 'name@example.com'}</Text>
              
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
                <Text style={styles.deleteBtnText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation tabs */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]} 
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'wardrobe' && styles.navItemActive]} 
          onPress={() => setActiveTab('wardrobe')}
        >
          <Text style={[styles.navText, activeTab === 'wardrobe' && styles.navTextActive]}>Wardrobe</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]} 
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#3a86ff',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  logoutBtn: {
    backgroundColor: '#ff4d6d15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff4d6d25',
  },
  logoutText: {
    color: '#ff4d6d',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#222',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  statGoal: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3a86ff',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 15,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridItem: {
    width: (width - 55) / 2,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#33333333',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 8,
  },
  vitalSub: {
    fontSize: 11,
    color: '#888',
  },
  inputLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  button: {
    backgroundColor: '#3a86ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deviceItem: {
    backgroundColor: '#121212',
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deviceMac: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  batteryContainer: {
    backgroundColor: '#1b291e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  batteryText: {
    color: '#38b000',
    fontSize: 11,
    fontWeight: '700',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  profileLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  profileValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 15,
  },
  navItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#3a86ff20',
  },
  navText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 13,
  },
  navTextActive: {
    color: '#3a86ff',
  },
  settingsSub: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
  },
  deleteBtn: {
    backgroundColor: '#ff4d6d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});
