import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import Typography from '../../components/Typography';
import { useAuth } from '../../contexts/AuthContext';
import { gardenService, harvestService } from '../../lib/dataService';
import theme from '../../lib/theme';

export default function ProfileTab() {
  const { user, signOut, isGuest } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    gardens: 0,
    harvests: 0,
    plants: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const [gardens, harvests] = await Promise.all([
        gardenService.getGardens(),
        harvestService.getHarvests(),
      ]);
      
      const uniquePlants = new Set(harvests.map(h => h.plantName)).size;
      
      setStats({
        gardens: gardens.length,
        harvests: harvests.length,
        plants: uniquePlants,
      });
    } catch (error) {
      console.error('Error loading profile stats:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleSignOut = async () => {
    Alert.alert(
      isGuest ? 'Exit Guest Mode' : 'Sign Out',
      isGuest ? 'Are you sure you want to exit guest mode?' : 'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isGuest ? 'Exit' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/sign-in');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Account Settings',
      subtitle: 'Manage your profile',
      icon: 'person',
      color: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft,
      onPress: () => Alert.alert('Coming Soon', 'Account settings will be available soon.'),
    },
    {
      title: 'Notifications',
      subtitle: 'Manage alerts',
      icon: 'notifications',
      color: theme.colors.secondary,
      backgroundColor: theme.colors.secondarySoft,
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon.'),
    },
    {
      title: 'Garden Data',
      subtitle: 'Export & backup',
      icon: 'download',
      color: theme.colors.accent,
      backgroundColor: theme.colors.accentSoft,
      onPress: () => Alert.alert('Coming Soon', 'Data export will be available soon.'),
    },
    {
      title: 'Privacy & Security',
      subtitle: 'Data protection',
      icon: 'security',
      color: '#9C27B0',
      backgroundColor: '#F3E5F5',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon.'),
    },
    {
      title: 'Help & Support',
      subtitle: 'Get assistance',
      icon: 'help',
      color: '#607D8B',
      backgroundColor: '#ECEFF1',
      onPress: () => Alert.alert('Coming Soon', 'Help & support will be available soon.'),
    },
    {
      title: 'About',
      subtitle: 'App information',
      icon: 'info',
      color: '#795548',
      backgroundColor: '#EFEBE9',
      onPress: () => Alert.alert('Garden Tracker', 'Version 1.0.0\nBuilt with React Native & Expo'),
    },
  ];

  const firstName = isGuest ? 'Guest User' : (user?.email?.split('@')[0]?.split('.')[0] || 'Gardener');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mainContent}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Header in upper left */}
          <View style={styles.headerContainer}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account-circle" size={80} color={theme.colors.primary} />
            </View>
            <Typography variant="h2" style={styles.name}>
              {firstName}
            </Typography>
            <Typography variant="body1" style={styles.email}>
              {isGuest ? 'Using local storage' : (user?.email || 'No email')}
            </Typography>
          </View>

          {/* Profile Stats Card */}
          <Card style={styles.statsCard} elevation="large">
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons name="chart-donut" size={24} color={theme.colors.primary} />
              <Typography variant="h4" style={styles.statsTitle}>
                Your Garden Activity
              </Typography>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.primarySoft }]}>
                  <MaterialCommunityIcons name="sprout" size={20} color={theme.colors.primary} />
                </View>
                <Typography variant="h3" color={theme.colors.primary}>{stats.gardens}</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Gardens
                </Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.secondarySoft }]}>
                  <MaterialCommunityIcons name="basket" size={20} color={theme.colors.secondary} />
                </View>
                <Typography variant="h3" color={theme.colors.secondary}>{stats.harvests}</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Harvests
                </Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.accentSoft }]}>
                  <MaterialCommunityIcons name="leaf" size={20} color={theme.colors.accent} />
                </View>
                <Typography variant="h3" color={theme.colors.accent}>{stats.plants}</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Plants
                </Typography>
              </View>
            </View>
          </Card>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <Card
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                elevation="small"
              >
                <View style={styles.menuItemContent}>
                  <View style={[styles.menuIcon, { backgroundColor: item.backgroundColor }]}>
                    <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Typography variant="h4" style={styles.menuTitle}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color={theme.colors.textSecondary}>
                      {item.subtitle}
                    </Typography>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
                </View>
              </Card>
            ))}
          </View>

          {/* Enhanced Sign Out Button */}
          <Card style={styles.signOutCard} elevation="medium">
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <MaterialIcons name="logout" size={24} color={theme.colors.error} />
              <Typography variant="h4" color={theme.colors.error} style={styles.signOutText}>
                {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
              </Typography>
            </TouchableOpacity>
          </Card>

          {/* Bottom spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  headerContainer: {
    paddingVertical: theme.spacing.xl,
    paddingTop: theme.spacing.xl + theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: '#f8f9fa',
    ...theme.shadows.large,
    alignSelf: 'center',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    textAlign: 'center',
  },
  email: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statsTitle: {
    marginLeft: theme.spacing.md,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },
  menuContainer: {
    marginBottom: theme.spacing.lg,
  },
  menuItem: {
    marginBottom: theme.spacing.sm,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  signOutCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: 0,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  signOutText: {
    marginLeft: theme.spacing.sm,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});
